// src/app/service/pdf.service.ts
import { Injectable } from '@angular/core';
import { Utilisateur, Commande } from './auth.service';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  async genererFacture(commande: Commande, utilisateur: Utilisateur): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        console.log('📄 Début génération PDF...');
        
        // Créer un nouveau document PDF
        const doc = new jsPDF();
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);

        // Couleurs
        const colors = {
          primary: [102, 126, 234],
          secondary: [118, 75, 162],
          success: [16, 185, 129],
          dark: [31, 41, 55],
          light: [107, 114, 128],
          border: [229, 231, 235]
        };

        // Fonction utilitaire pour ajouter du texte
        const addText = (text: string, x: number, y: number, options: any = {}) => {
          doc.setFont(options.font || 'helvetica', options.style || 'normal');
          doc.setFontSize(options.size || 10);
          
          // Fix: Use array destructuring instead of spread operator
          const colorArray = options.color || colors.dark;
          doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
          
          doc.text(text, x, y, { align: options.align || 'left' });
        };

        // Fonction pour dessiner une ligne
        const drawLine = (y: number) => {
          // Fix: Use array destructuring instead of spread operator
          doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageWidth - margin, y);
        };

        // === EN-TÊTE ===
        // Rectangle de fond gradient
        // Fix: Use array destructuring instead of spread operator
        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.rect(0, 0, pageWidth, 60, 'F');
        
        // Titre
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('TECHSTORE', pageWidth / 2, 25, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Votre partenaire high-tech', pageWidth / 2, 35, { align: 'center' });

        yPosition = 75;

        // === TITRE FACTURE ===
        addText('FACTURE', margin, yPosition, { size: 20, style: 'bold' });
        addText(`N° ${commande.numeroCommande || 'N/A'}`, margin, yPosition + 8, { size: 12, color: colors.light });

        yPosition += 25;

        // === INFORMATIONS SOCIÉTÉ ===
        addText('TECHSTORE SARL', margin, yPosition, { style: 'bold' });
        addText('123 Avenue du Commerce', margin, yPosition + 6);
        addText('75001 Paris, France', margin, yPosition + 12);
        addText('contact@techstore.fr', margin, yPosition + 18);
        addText('SIRET: 123 456 789 00012', margin, yPosition + 24);

        // === INFORMATIONS CLIENT ===
        addText('FACTURÉ À:', pageWidth / 2, yPosition, { style: 'bold' });
        addText(`${utilisateur.prenom} ${utilisateur.nom}`, pageWidth / 2, yPosition + 6);
        addText(utilisateur.adresse, pageWidth / 2, yPosition + 12);
        addText(`${utilisateur.codePostal} ${utilisateur.ville}`, pageWidth / 2, yPosition + 18);
        addText(utilisateur.email, pageWidth / 2, yPosition + 24);
        if (utilisateur.telephone) {
          addText(utilisateur.telephone, pageWidth / 2, yPosition + 30);
        }

        yPosition += 45;
        drawLine(yPosition);
        yPosition += 10;

        // === DÉTAILS DE LA COMMANDE ===
        addText('DÉTAILS DE LA COMMANDE', margin, yPosition, { size: 16, style: 'bold' });
        yPosition += 12;

        // En-têtes du tableau
        drawLine(yPosition);
        yPosition += 8;
        
        addText('Produit', margin, yPosition, { style: 'bold' });
        addText('Qté', margin + 120, yPosition, { style: 'bold' });
        addText('Prix Unitaire', margin + 150, yPosition, { style: 'bold' });
        addText('Total', pageWidth - margin - 20, yPosition, { style: 'bold', align: 'right' });

        yPosition += 8;
        drawLine(yPosition);
        yPosition += 10;

        // === LIGNES DE PRODUITS ===
        const lignesCommande = commande.lignesCommande || commande.produits || [];
        
        if (lignesCommande.length === 0) {
          console.warn('⚠️ Aucune ligne de commande trouvée');
          // Créer une ligne à partir des produits
          (commande.produits || []).forEach((produit: any, index: number) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            
            const nomProduit = produit.nom || 'Produit';
            const quantite = produit.quantite || 1;
            const prix = produit.prix || produit.price || 0;
            const total = prix * quantite;
            
            // Tronquer le nom si trop long
            let nomAffichage = nomProduit;
            if (nomAffichage.length > 30) {
              nomAffichage = nomAffichage.substring(0, 30) + '...';
            }
            
            addText(nomAffichage, margin, yPosition);
            addText(quantite.toString(), margin + 120, yPosition);
            addText(`${prix.toFixed(2)} €`, margin + 150, yPosition);
            addText(`${total.toFixed(2)} €`, pageWidth - margin - 20, yPosition, { align: 'right' });
            
            yPosition += 8;
          });
        } else {
          // Utiliser les lignes de commande existantes
          lignesCommande.forEach((ligne: any, index: number) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            
            const nomProduit = ligne.nomProduit || 'Produit';
            const quantite = ligne.quantite || 1;
            const prixUnitaire = ligne.prixUnitaire || ligne.prix || 0;
            const total = prixUnitaire * quantite;
            
            // Tronquer le nom si trop long
            let nomAffichage = nomProduit;
            if (nomAffichage.length > 30) {
              nomAffichage = nomAffichage.substring(0, 30) + '...';
            }
            
            addText(nomAffichage, margin, yPosition);
            addText(quantite.toString(), margin + 120, yPosition);
            addText(`${prixUnitaire.toFixed(2)} €`, margin + 150, yPosition);
            addText(`${total.toFixed(2)} €`, pageWidth - margin - 20, yPosition, { align: 'right' });
            
            yPosition += 8;
          });
        }

        yPosition += 5;
        drawLine(yPosition);
        yPosition += 10;

        // === TOTAUX ===
        const sousTotal = this.getSousTotal(commande);
        const fraisLivraison = commande.optionLivraison === 'express' ? 9.99 : 0;
        const total = commande.total || (sousTotal + fraisLivraison);

        addText('Sous-total:', pageWidth - margin - 60, yPosition);
        addText(`${sousTotal.toFixed(2)} €`, pageWidth - margin - 20, yPosition, { align: 'right' });
        yPosition += 8;

        addText('Livraison:', pageWidth - margin - 60, yPosition);
        addText(`${fraisLivraison.toFixed(2)} €`, pageWidth - margin - 20, yPosition, { align: 'right' });
        yPosition += 8;

        drawLine(yPosition);
        yPosition += 8;

        addText('TOTAL:', pageWidth - margin - 60, yPosition, { style: 'bold' });
        addText(`${total.toFixed(2)} €`, pageWidth - margin - 20, yPosition, { 
          style: 'bold', 
          color: colors.success,
          align: 'right' 
        });

        yPosition += 20;

        // === INFORMATIONS DE LIVRAISON ===
        addText('INFORMATIONS DE LIVRAISON', margin, yPosition, { style: 'bold' });
        yPosition += 8;
        
        const modeLivraison = commande.optionLivraison === 'express' ? 'Express (24-48h)' : 'Standard (3-5 jours)';
        addText(`Mode: ${modeLivraison}`, margin, yPosition);
        yPosition += 6;
        
        const dateCommande = commande.dateCommande ? new Date(commande.dateCommande) : new Date();
        const dateLivraison = new Date(dateCommande);
        dateLivraison.setDate(dateLivraison.getDate() + (commande.optionLivraison === 'express' ? 2 : 5));
        
        addText(`Date de commande: ${dateCommande.toLocaleDateString('fr-FR')}`, margin, yPosition);
        yPosition += 6;
        addText(`Livraison estimée: ${dateLivraison.toLocaleDateString('fr-FR')}`, margin, yPosition);

        yPosition += 15;
        drawLine(yPosition);
        yPosition += 10;

        // === PIED DE PAGE ===
        addText('Merci pour votre confiance !', pageWidth / 2, yPosition, { 
          align: 'center',
          color: colors.primary 
        });
        yPosition += 6;
        addText('TECHSTORE - SARL au capital de 50 000 €', pageWidth / 2, yPosition, { 
          align: 'center',
          size: 8,
          color: colors.light 
        });
        yPosition += 5;
        addText('www.techstore.fr - contact@techstore.fr', pageWidth / 2, yPosition, { 
          align: 'center',
          size: 8,
          color: colors.light 
        });

        // Générer le Blob
        const pdfBlob = doc.output('blob');
        console.log('✅ PDF généré avec succès');
        resolve(pdfBlob);

      } catch (error) {
        console.error('❌ Erreur génération PDF:', error);
        reject(error);
      }
    });
  }

  private getSousTotal(commande: Commande): number {
    // Essayer d'abord avec lignesCommande
    if (commande.lignesCommande && commande.lignesCommande.length > 0) {
      return commande.lignesCommande.reduce((total: number, ligne: any) => {
        return total + ((ligne.prixUnitaire || 0) * (ligne.quantite || 1));
      }, 0);
    }
    
    // Fallback sur produits
    if (commande.produits && commande.produits.length > 0) {
      return commande.produits.reduce((total: number, produit: any) => {
        return total + ((produit.prix || produit.price || 0) * (produit.quantite || 1));
      }, 0);
    }
    
    return commande.total || 0;
  }

  telechargerPDF(blob: Blob, nomFichier: string) {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomFichier.endsWith('.pdf') ? nomFichier : nomFichier + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('✅ PDF téléchargé:', nomFichier);
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF:', error);
    }
  }
}