import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaiementService, Paiement } from '../service/paiement.service';

interface Commande {
  id: number;
  numeroCommande: string;
  utilisateur: Utilisateur;
  produits: ProduitCommande[];
  total: number;
  optionLivraison: string;
  statut: string;
  dateCommande: string;
}

interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  prenom: string;
}

interface ProduitCommande {
  id: number;
  nom: string;
  prix: number;
  quantite: number;
}

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <!-- Header avec titre et actions -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Gestion des Paiements</h1>
          <p class="page-subtitle">Supervisez et gérez toutes les transactions financières</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="rafraichirDonnees()">
            <i class="fas fa-sync-alt"></i>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Alertes -->
      <div class="alert-container">
        <div class="alert-message error" *ngIf="erreur">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ erreur }}</span>
          <button type="button" class="alert-close" (click)="erreur = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="alert-message success" *ngIf="messageSucces">
          <i class="fas fa-check-circle"></i>
          <span>{{ messageSucces }}</span>
          <button type="button" class="alert-close" (click)="messageSucces = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Cartes de statistiques -->
      <div class="stats-grid">
        <div class="stat-card" data-aos="fade-up">
          <div class="stat-content">
            <div class="stat-main">
              <div class="stat-icon-container revenue">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="stat-info">
                <span class="stat-title">Chiffre d'Affaires</span>
                <h3 class="stat-value">{{ getTotalPaiements() | number:'1.2-2' }} €</h3>
              </div>
            </div>
            <div class="stat-footer">
              <div class="stat-trend positive">
                <i class="fas fa-arrow-up"></i>
                <span>12% ce mois</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
          <div class="stat-content">
            <div class="stat-main">
              <div class="stat-icon-container success">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <span class="stat-title">Paiements Réussis</span>
                <h3 class="stat-value">{{ getNombrePaiements('PAYE') }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
          <div class="stat-content">
            <div class="stat-main">
              <div class="stat-icon-container pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <span class="stat-title">En Attente</span>
                <h3 class="stat-value">{{ getNombrePaiements('EN_ATTENTE') }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
          <div class="stat-content">
            <div class="stat-main">
              <div class="stat-icon-container failed">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="stat-info">
                <span class="stat-title">Échecs</span>
                <h3 class="stat-value">{{ getNombrePaiements('ECHEC') }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barre de filtres -->
      <div class="filters-section">
        <div class="filter-group">
          <label class="filter-label">Statut</label>
          <select [(ngModel)]="filtreStatut" (change)="filtrerPaiements()" class="filter-select">
            <option value="TOUS">Tous les statuts</option>
            <option value="PAYE">Payé</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ECHEC">Échec</option>
            <option value="ANNULE">Annulé</option>
            <option value="REMBOURSE">Remboursé</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Date</label>
          <input type="date" [(ngModel)]="filtreDate" (change)="filtrerPaiements()" class="filter-input">
        </div>

        <div class="filter-group search-group">
          <label class="filter-label">Recherche</label>
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Email, nom, transaction..." 
              [(ngModel)]="filtreRecherche"
              (input)="filtrerPaiements()"
              class="search-input"
            >
          </div>
        </div>
      </div>

      <!-- Section tableau -->
      <div class="table-section">
        <div class="section-header">
          <h2>Historique des Transactions</h2>
          <span class="table-count">{{ paiementsFiltres.length }} paiement(s)</span>
        </div>

        <!-- Loading -->
        <div *ngIf="chargement" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Chargement des paiements...</span>
        </div>

        <!-- Table -->
        <div *ngIf="!chargement" class="table-container">
          <div class="table-wrapper">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Méthode</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let paiement of paiementsFiltres" class="table-row">
                  <td>
                    <div class="transaction-info">
                      <strong>#{{ paiement.numeroTransaction }}</strong>
                      <small>CMD: {{ paiement.numeroCommande || 'N/A' }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="client-info">
                      <div class="client-name">{{ paiement.prenomUtilisateur }} {{ paiement.nomUtilisateur }}</div>
                      <div class="client-email">{{ paiement.emailUtilisateur }}</div>
                    </div>
                  </td>
                  <td class="amount-cell">
                    <strong>{{ paiement.montant | number:'1.2-2' }} €</strong>
                  </td>
                  <td>
                    <span class="status-badge" [class]="getStatutClass(paiement.statut)">
                      {{ getStatutText(paiement.statut) }}
                    </span>
                  </td>
                  <td>
                    <span class="method-badge">
                      {{ getMethodeText(paiement.methodePaiement) }}
                    </span>
                  </td>
                  <td class="date-cell">
                    {{ formatDate(paiement.dateCreation) }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action view" (click)="voirDetails(paiement)" title="Détails">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn-action refund" 
                        (click)="effectuerRemboursement(paiement)"
                        [disabled]="paiement.statut !== 'PAYE'"
                        title="Rembourser"
                      >
                        <i class="fas fa-money-bill-wave"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- État vide -->
            <div *ngIf="paiementsFiltres.length === 0" class="empty-state">
              <div class="empty-content">
                <i class="fas fa-credit-card"></i>
                <h3>Aucun paiement trouvé</h3>
                <p>Aucune transaction ne correspond à vos critères de recherche.</p>
                <button class="btn-primary" (click)="rafraichirDonnees()">
                  <i class="fas fa-sync-alt"></i>
                  Actualiser les données
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de détails -->
      <div *ngIf="paiementSelectionne" class="modal-overlay" (click)="fermerModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Détails de la Transaction</h2>
            <button class="modal-close" (click)="fermerModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="modal-grid">
              <div class="modal-section">
                <h4><i class="fas fa-receipt"></i> Transaction</h4>
                <div class="detail-row">
                  <span>Référence:</span>
                  <strong>#{{ paiementSelectionne.numeroTransaction }}</strong>
                </div>
                <div class="detail-row">
                  <span>Montant:</span>
                  <strong class="amount-large">{{ paiementSelectionne.montant | number:'1.2-2' }} €</strong>
                </div>
                <div class="detail-row">
                  <span>Statut:</span>
                  <span class="status-badge" [class]="getStatutClass(paiementSelectionne.statut)">
                    {{ getStatutText(paiementSelectionne.statut) }}
                  </span>
                </div>
              </div>

              <div class="modal-section">
                <h4><i class="fas fa-user"></i> Client</h4>
                <div class="detail-row">
                  <span>Nom:</span>
                  <span>{{ paiementSelectionne.prenomUtilisateur }} {{ paiementSelectionne.nomUtilisateur }}</span>
                </div>
                <div class="detail-row">
                  <span>Email:</span>
                  <span>{{ paiementSelectionne.emailUtilisateur }}</span>
                </div>
                <div class="detail-row">
                  <span>Contact:</span>
                  <span>{{ paiementSelectionne.telephoneUtilisateur || 'Non renseigné' }}</span>
                </div>
              </div>

              <div class="modal-section full-width">
                <h4><i class="fas fa-map-marker-alt"></i> Adresse</h4>
                <div class="address-block">
                  {{ paiementSelectionne.adresseUtilisateur }}<br>
                  {{ paiementSelectionne.codePostalUtilisateur }} {{ paiementSelectionne.villeUtilisateur }}
                </div>
              </div>

              <div class="modal-section" *ngIf="paiementSelectionne.commande">
                <h4><i class="fas fa-box"></i> Commande</h4>
                <div class="detail-row">
                  <span>Référence:</span>
                  <span>{{ paiementSelectionne.commande.numeroCommande }}</span>
                </div>
                <div class="detail-row">
                  <span>Statut:</span>
                  <span>{{ paiementSelectionne.commande.statut }}</span>
                </div>
                <div class="detail-row">
                  <span>Livraison:</span>
                  <span>{{ getLivraisonText(paiementSelectionne.commande.optionLivraison) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="fermerModal()">Fermer</button>
            <button 
              *ngIf="paiementSelectionne.statut === 'PAYE'"
              class="btn-warning" 
              (click)="effectuerRemboursement(paiementSelectionne)"
            >
              <i class="fas fa-money-bill-wave"></i>
              Rembourser
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent implements OnInit {
  paiements: Paiement[] = [];
  paiementsFiltres: Paiement[] = [];
  paiementSelectionne: Paiement | null = null;
  statistiques: any = null;
  
  chargement = true;
  erreur = '';
  messageSucces = '';

  filtreStatut = 'TOUS';
  filtreDate = '';
  filtreRecherche = '';

  constructor(private paiementService: PaiementService) {}

  async ngOnInit() {
    await this.chargerDonnees();
  }

  async chargerDonnees() {
    await Promise.all([
      this.chargerPaiements(),
      this.chargerStatistiques()
    ]);
  }

  async chargerPaiements() {
    this.chargement = true;
    this.erreur = '';
    
    try {
      this.paiements = await this.paiementService.getPaiements().toPromise() || [];
      this.paiementsFiltres = [...this.paiements];
    } catch (error) {
      this.erreur = 'Erreur lors du chargement des paiements';
      this.paiements = [];
      this.paiementsFiltres = [];
    } finally {
      this.chargement = false;
    }
  }

  async chargerStatistiques() {
    try {
      this.statistiques = await this.paiementService.getStatistiques().toPromise();
    } catch (error) {
      console.error('Erreur statistiques:', error);
    }
  }

  filtrerPaiements() {
    if (this.filtreStatut === 'TOUS' && !this.filtreDate && !this.filtreRecherche) {
      this.paiementsFiltres = [...this.paiements];
      return;
    }

    this.paiementsFiltres = this.paiements.filter(paiement => {
      const correspondStatut = this.filtreStatut === 'TOUS' || paiement.statut === this.filtreStatut;
      
      let correspondDate = true;
      if (this.filtreDate) {
        const datePaiement = new Date(paiement.dateCreation).toISOString().split('T')[0];
        correspondDate = datePaiement === this.filtreDate;
      }
      
      let correspondRecherche = true;
      if (this.filtreRecherche) {
        const searchTerm = this.filtreRecherche.toLowerCase();
        correspondRecherche = 
          paiement.emailUtilisateur.toLowerCase().includes(searchTerm) ||
          paiement.nomUtilisateur.toLowerCase().includes(searchTerm) ||
          paiement.prenomUtilisateur.toLowerCase().includes(searchTerm) ||
          paiement.numeroTransaction.toLowerCase().includes(searchTerm);
      }

      return correspondStatut && correspondDate && correspondRecherche;
    });
  }

  async rafraichirDonnees() {
    this.messageSucces = 'Actualisation en cours...';
    await this.chargerDonnees();
    this.messageSucces = 'Données actualisées!';
    setTimeout(() => this.messageSucces = '', 3000);
  }

  getTotalPaiements(): number {
    return this.paiements
      .filter(p => p.statut === 'PAYE')
      .reduce((sum, p) => sum + p.montant, 0);
  }

  getNombrePaiements(statut: string): number {
    return this.paiements.filter(p => p.statut === statut).length;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'PAYE': 'success',
      'EN_ATTENTE': 'warning',
      'ECHEC': 'error',
      'ANNULE': 'secondary',
      'REMBOURSE': 'info'
    };
    return classes[statut] || '';
  }

  getStatutText(statut: string): string {
    const textes: { [key: string]: string } = {
      'PAYE': 'Payé',
      'EN_ATTENTE': 'En attente',
      'ECHEC': 'Échec',
      'ANNULE': 'Annulé',
      'REMBOURSE': 'Remboursé'
    };
    return textes[statut] || statut;
  }

  getMethodeText(methode: string): string {
    const methodes: { [key: string]: string } = {
      'STRIPE': 'Carte',
      'PAYPAL': 'PayPal',
      'VIREMENT': 'Virement'
    };
    return methodes[methode] || methode;
  }

  getLivraisonText(option: string): string {
    return option === 'express' ? 'Express' : 'Standard';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  voirDetails(paiement: Paiement) {
    this.paiementSelectionne = paiement;
  }

  fermerModal() {
    this.paiementSelectionne = null;
  }

  async effectuerRemboursement(paiement: Paiement) {
    if (confirm(`Rembourser ${paiement.montant}€ à ${paiement.emailUtilisateur} ?`)) {
      try {
        this.messageSucces = `Remboursement initié pour ${paiement.emailUtilisateur}`;
        await this.chargerDonnees();
        this.fermerModal();
        setTimeout(() => this.messageSucces = '', 5000);
      } catch (error: any) {
        this.erreur = 'Erreur remboursement: ' + (error.error?.message || error.message);
        setTimeout(() => this.erreur = '', 5000);
      }
    }
  }
}