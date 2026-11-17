import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface Categorie {
  id?: number;
  nom: string;
}

export interface Produit {
  id?: number;
  nom: string;
  description: string;
  prix: number;
  prixOriginal?: number;
  promotion?: number;
  image: string;
  stock: number;
  categorie: Categorie;
  quantite?: number;
  dateAjout?: Date;
  estNouveau?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private apiUrl = 'http://localhost:8080/api/products';
  private panier: Produit[] = [];
  private panierSubject = new BehaviorSubject<Produit[]>([]);
  
  constructor(private http: HttpClient) {
    this.chargerPanierLocalStorage();
  }

  // ✅ CORRECTION : Normalisation robuste des URLs d'images
  private normaliserUrlsImages(produits: Produit[]): Produit[] {
    return produits.map(produit => {
      let imageUrl = produit.image || '';
      
      console.log('🖼️ Image originale:', imageUrl);
      
      // Si l'image est vide, utiliser une image par défaut sécurisée
      if (!imageUrl || imageUrl.trim() === '') {
        imageUrl = this.getImageParDefaut(produit.nom);
        console.log('🔄 Utilisation image par défaut:', imageUrl);
      } else {
        imageUrl = imageUrl.trim();
        
        // Corriger les URLs problématiques
        if (imageUrl.includes('//images/')) {
          imageUrl = imageUrl.replace('//images/', '/images/');
        }
        
        // Si c'est une URL relative, la convertir en absolue
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('assets/')) {
          if (imageUrl.startsWith('/')) {
            imageUrl = `http://localhost:8080${imageUrl}`;
          } else {
            imageUrl = `http://localhost:8080/images/${imageUrl}`;
          }
          console.log('🔗 URL relative convertie:', imageUrl);
        }
        
        // Pour les URLs externes, utiliser des placeholders autorisés
        if (imageUrl.includes('unsplash.com') || imageUrl.includes('images.unsplash.com')) {
          imageUrl = this.getImageParDefaut(produit.nom);
          console.log('🛡️ URL externe remplacée par placeholder');
        }
      }
      
      return {
        ...produit,
        image: imageUrl
      };
    });
  }

  // ✅ CORRECTION : Images par défaut utilisant via.placeholder.com (autorisé)
  private getImageParDefaut(nomProduit: string = 'Produit'): string {
    const couleurs = ['667eea', '764ba2', 'ff6b6b', '2ed573', 'ffa502', '3742fa'];
    const couleur = couleurs[Math.floor(Math.random() * couleurs.length)];
    
    // Utiliser via.placeholder.com qui est généralement autorisé par les CSP
    return `https://via.placeholder.com/300x200/${couleur}/ffffff?text=${encodeURIComponent(nomProduit)}`;
  }

  private appliquerPromotions(produits: Produit[]): Produit[] {
    return produits.map(produit => {
      const aPromotion = Math.random() < 0.3;
      
      if (aPromotion) {
        const pourcentagePromo = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
        return {
          ...produit,
          prixOriginal: produit.prix,
          prix: Math.round(produit.prix * (1 - pourcentagePromo / 100) * 100) / 100,
          promotion: pourcentagePromo
        };
      }
      
      return produit;
    });
  }

  private marquerProduitsRecents(produits: Produit[]): Produit[] {
    const deuxJoursEnMillisecondes = 2 * 24 * 60 * 60 * 1000;
    const maintenant = new Date();
    
    return produits.map(produit => {
      const dateAjout = new Date(maintenant.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const estNouveau = (maintenant.getTime() - dateAjout.getTime()) < deuxJoursEnMillisecondes;
      
      return {
        ...produit,
        dateAjout,
        estNouveau
      };
    });
  }

  // ✅ CORRECTION : Slides du carousel avec placeholders autorisés
  getSlidesCarousel() {
    return [
      {
        image: 'https://via.placeholder.com/1200x500/667eea/ffffff?text=Accessoires+Informatique',
        title: 'Équipez-vous avec les meilleurs accessoires',
        description: 'Découvrez notre sélection premium de claviers, souris et casques gaming',
        categorie: { nom: 'Périphériques' }
      },
      {
        image: 'https://via.placeholder.com/1200x500/764ba2/ffffff?text=Gaming+Performance',
        title: 'Gaming & Performance',
        description: 'Des accessoires conçus pour les gamers exigeants',
        categorie: { nom: 'Gaming' }
      },
      {
        image: 'https://via.placeholder.com/1200x500/ff6b6b/ffffff?text=Bureau+Moderne',
        title: 'Bureau Moderne',
        description: 'Créez un espace de travail ergonomique et productif',
        categorie: { nom: 'Bureau' }
      },
      {
        image: 'https://via.placeholder.com/1200x500/2ed573/ffffff?text=Connectivité+Avancée',
        title: 'Connectivité Avancée',
        description: 'Câbles, hubs et accessoires de connexion haute performance',
        categorie: { nom: 'Connectique' }
      }
    ];
  }

  async mettreAJourStock(produitsCommandes: Produit[]): Promise<void> {
    const promises = produitsCommandes.map(produit => {
      const nouveauStock = produit.stock - (produit.quantite || 1);
      const produitMisAJour = {
        ...produit,
        stock: nouveauStock
      };
      
      return this.http.put(`${this.apiUrl}/${produit.id}`, produitMisAJour).toPromise();
    });

    try {
      await Promise.all(promises);
      console.log('✅ Tous les stocks ont été mis à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des stocks:', error);
      throw error;
    }
  }

  getProduitsAvecPromotions(): Promise<Produit[]> {
    return new Promise((resolve, reject) => {
      this.http.get<Produit[]>(this.apiUrl).subscribe({
        next: (produits) => {
          console.log('📦 Produits bruts reçus:', produits);
          
          let produitsTraites = this.normaliserUrlsImages(produits);
          produitsTraites = this.marquerProduitsRecents(produitsTraites);
          produitsTraites = this.appliquerPromotions(produitsTraites);
          
          console.log('🎨 Produits après traitement:', produitsTraites);
          resolve(produitsTraites);
        },
        error: (err) => {
          console.error('❌ Erreur lors du chargement des produits:', err);
          const produitsDemo = this.creerProduitsDemonstration();
          resolve(produitsDemo);
        }
      });
    });
  }

  private creerProduitsDemonstration(): Produit[] {
    const categories: Categorie[] = [
      { id: 1, nom: 'Périphériques' },
      { id: 2, nom: 'Gaming' },
      { id: 3, nom: 'Bureau' },
      { id: 4, nom: 'Connectique' }
    ];

    const produitsDemo: Produit[] = [
      {
        id: 1,
        nom: 'Clavier Mécanique RGB',
        description: 'Clavier gaming mécanique avec rétroéclairage RGB',
        prix: 89.99,
        image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Clavier+Mécanique',
        stock: 15,
        categorie: categories[0]
      },
      {
        id: 2,
        nom: 'Souris Gaming',
        description: 'Souris haute précision 16000 DPI',
        prix: 59.99,
        image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Souris+Gaming',
        stock: 20,
        categorie: categories[1]
      },
      {
        id: 3,
        nom: 'Casque Audio Pro',
        description: 'Casque audio professionnel avec réduction de bruit',
        prix: 129.99,
        image: 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Casque+Audio',
        stock: 8,
        categorie: categories[0]
      },
      {
        id: 4,
        nom: 'Hub USB-C',
        description: 'Hub USB-C 7-en-1 avec ports HDMI et Ethernet',
        prix: 45.99,
        image: 'https://via.placeholder.com/300x200/2ed573/ffffff?text=Hub+USB-C',
        stock: 25,
        categorie: categories[3]
      },
      {
        id: 5,
        nom: 'Écran 27" 4K',
        description: 'Écran LED 27 pouces résolution 4K UHD',
        prix: 299.99,
        image: 'https://via.placeholder.com/300x200/ffa502/ffffff?text=Écran+4K',
        stock: 5,
        categorie: categories[2]
      },
      {
        id: 6,
        nom: 'Webcam HD',
        description: 'Webcam 1080p avec micro intégré',
        prix: 79.99,
        image: 'https://via.placeholder.com/300x200/3742fa/ffffff?text=Webcam+HD',
        stock: 30,
        categorie: categories[0]
      }
    ];

    return this.appliquerPromotions(this.marquerProduitsRecents(produitsDemo));
  }

  ajouterAuPanier(produit: Produit) {
    const existingProduct = this.panier.find(p => p.id === produit.id);
    
    if (existingProduct) {
      if ((existingProduct.quantite || 1) < produit.stock) {
        existingProduct.quantite = (existingProduct.quantite || 1) + 1;
      }
    } else {
      this.panier.push({ ...produit, quantite: 1 });
    }
    
    this.sauvegarderPanierLocalStorage();
    this.panierSubject.next(this.panier);
  }

  retirerDuPanier(produitId: number) {
    this.panier = this.panier.filter(p => p.id !== produitId);
    this.sauvegarderPanierLocalStorage();
    this.panierSubject.next(this.panier);
  }

  setPanier(panier: Produit[]) {
  this.panier = panier;
  localStorage.setItem('panier', JSON.stringify(panier));
}

  viderPanier() {
    this.panier = [];
    this.sauvegarderPanierLocalStorage();
    this.panierSubject.next(this.panier);
  }

  getPanier(): Produit[] {
    return [...this.panier];
  }

  getNombreProduits(): number {
    return this.panier.reduce((total, produit) => total + (produit.quantite || 1), 0);
  }

  private sauvegarderPanierLocalStorage() {
    localStorage.setItem('panier', JSON.stringify(this.panier));
  }

  private chargerPanierLocalStorage() {
    const panierData = localStorage.getItem('panier');
    if (panierData) {
      this.panier = JSON.parse(panierData);
      this.panierSubject.next(this.panier);
    }
  }

  getPanierObservable() {
    return this.panierSubject.asObservable();
  }
}