// panier.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PanierService, Produit } from '../service/panier.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-5 animate__animated animate__fadeIn">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary mb-0">🛒 Votre Panier</h2>
        <button class="btn btn-outline-primary" [routerLink]="['/home']">
          ← Retour aux produits
        </button>
      </div>

      <div *ngIf="panier.length === 0" class="alert alert-info text-center animate__animated animate__zoomIn">
        <div class="py-4">
          <h4 class="text-muted">📭 Votre panier est vide</h4>
          <p class="mb-3">Découvrez nos produits et ajoutez-les à votre panier !</p>
          <button class="btn btn-primary btn-lg" [routerLink]="['/home']">
            🛍️ Découvrir les produits
          </button>
        </div>
      </div>

      <div *ngIf="panier.length > 0" class="card shadow-lg p-4 animate__animated animate__slideInUp">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="bg-primary text-white">
              <tr>
                <th>Produit</th>
                <th>Image</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of panier; let i = index" class="align-middle">
                <td>
                  <strong>{{ item.nom }}</strong>
                  <br>
                  <small class="text-muted">{{ item.description }}</small>
                  <br>
                  <small class="badge bg-secondary">{{ item.categorie.nom }}</small>
                </td>
                <td>
                  <img [src]="getSafeImageUrl(item)" 
                       class="rounded shadow-sm" 
                       style="width: 80px; height: 80px; object-fit: cover;"
                       [alt]="item.nom"
                       (error)="onImageError($event, item)">
                </td>
                <td class="fw-bold">{{ item.prix }} MGA</td>
                <td>
                  <div class="input-group" style="width: 140px;">
                    <button class="btn btn-outline-secondary" 
                            (click)="decreaseQuantity(item)" 
                            [disabled]="getQuantite(item) === 1"
                            title="Réduire la quantité">
                      −
                    </button>
                    <input type="number" 
                           [(ngModel)]="item.quantite" 
                           (ngModelChange)="updateQuantite(item)" 
                           min="1" 
                           [max]="item.stock"
                           class="form-control text-center">
                    <button class="btn btn-outline-secondary" 
                            (click)="increaseQuantity(item)"
                            [disabled]="getQuantite(item) >= item.stock"
                            title="Augmenter la quantité">
                      +
                    </button>
                  </div>
                  <!-- ✅ CORRECTION : Utiliser une méthode pour vérifier la quantité -->
                  <small *ngIf="getQuantite(item) >= item.stock" class="text-warning d-block mt-1">
                    Stock maximum atteint
                  </small>
                  <small class="text-muted d-block mt-1">
                    Stock: {{ item.stock }} disponible(s)
                  </small>
                </td>
                <td class="fw-bold text-success">
                  {{ (item.prix * getQuantite(item)).toFixed(2) }} MGA
                </td>
                <td>
                  <button class="btn btn-danger btn-sm" 
                          (click)="retirerDuPanier(item.id!)"
                          title="Supprimer du panier">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row mt-4">
          <div class="col-md-6">
            <div class="d-grid gap-2 d-md-flex justify-content-md-start">
              <button class="btn btn-outline-danger" (click)="viderPanier()">
                🗑️ Vider le panier
              </button>
              <button class="btn btn-outline-secondary" [routerLink]="['/home']">
                🏪 Continuer mes achats
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="text-end">
              <div class="mb-3">
                <h4 class="mb-0">
                  <span class="text-muted">Total :</span>
                  <span class="text-success ms-2">{{ calculerTotal().toFixed(2) }} MGA</span>
                </h4>
                <small class="text-muted" *ngIf="calculerTotal() >= 50">
                  ✅ Livraison gratuite
                </small>
                <small class="text-muted" *ngIf="calculerTotal() < 50">
                  🚚 Livraison offerte à partir de 50 MGA
                </small>
              </div>
              <button class="btn btn-success btn-lg animate__animated animate__pulse" 
                      (click)="validerPanier()">
                ✅ Commander maintenant
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div *ngIf="errorMessage" class="alert alert-danger mt-4">
        <div class="d-flex align-items-center">
          <span class="me-2">⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Message de succès -->
      <div *ngIf="successMessage" class="alert alert-success mt-4">
        <div class="d-flex align-items-center">
          <span class="me-2">✅</span>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
    .card { 
      border-radius: 15px; 
      border: none;
    }
    .table-hover tbody tr:hover { 
      background-color: #f8f9fa; 
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }
    .btn-outline-secondary { 
      border-color: #dee2e6;
    }
    .btn-outline-secondary:hover:not(:disabled) { 
      background-color: #e9ecef;
    }
    .input-group .form-control {
      border-radius: 0;
    }
    .input-group .btn {
      border-radius: 0;
    }
  `]
})
export class PanierComponent implements OnInit {
  panier: Produit[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🛒 PanierComponent initialisé');
    this.chargerPanier();

    
  }

  // ✅ CORRECTION : Méthode pour obtenir la quantité en toute sécurité
  getQuantite(produit: Produit): number {
    return produit.quantite || 1;
  }

  // ✅ Charger le panier depuis le service
  chargerPanier(): void {
    this.panier = this.panierService.getPanier();
    console.log('📦 Panier chargé:', this.panier.length, 'produits');
  }

  // ✅ Obtenir une URL d'image sécurisée
  getSafeImageUrl(produit: Produit): string {
    if (!produit.image) {
      return 'https://via.placeholder.com/200x200/cccccc/969696?text=Image+non+disponible';
    }
    
    let url = produit.image;
    if (url.includes('//images/')) {
      url = url.replace('//images/', '/images/');
    }
    if (url.startsWith('http:/') && !url.startsWith('http://')) {
      url = url.replace('http:/', 'http://');
    }
    
    return url;
  }

  // ✅ Gestion des erreurs d'image
  onImageError(event: Event, produit: Produit) {
    console.error('❌ Erreur de chargement image pour:', produit.nom);
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://via.placeholder.com/200x200/ffcccc/ff6666?text=Erreur+chargement';
  }

  // ✅ Mettre à jour la quantité
  updateQuantite(produit: Produit) {
    const quantite = this.getQuantite(produit);
    
    if (quantite < 1) {
      produit.quantite = 1;
    }
    if (quantite > produit.stock) {
      produit.quantite = produit.stock;
      this.errorMessage = `⚠️ La quantité ne peut pas dépasser le stock disponible (${produit.stock})`;
      setTimeout(() => this.errorMessage = '', 3000);
    }
    
    // Mettre à jour le panier dans le service
    this.panierService.ajouterAuPanier(produit);
  }

  // ✅ Augmenter la quantité
  increaseQuantity(produit: Produit) {
    const quantiteActuelle = this.getQuantite(produit);
    
    if (quantiteActuelle < produit.stock) {
      produit.quantite = quantiteActuelle + 1;
      this.updateQuantite(produit);
    } else {
      this.errorMessage = `⚠️ Stock maximum atteint pour ${produit.nom}`;
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  // ✅ Réduire la quantité
  decreaseQuantity(produit: Produit) {
    const quantiteActuelle = this.getQuantite(produit);
    
    if (quantiteActuelle > 1) {
      produit.quantite = quantiteActuelle - 1;
      this.updateQuantite(produit);
    }
  }

  // ✅ Calculer le total
  calculerTotal(): number {
    return this.panier.reduce((total: number, item: Produit) => {
      return total + (item.prix * this.getQuantite(item));
    }, 0);
  }

  validerPanier() {
  if (this.panier.length === 0) {
    this.errorMessage = 'Votre panier est vide.';
    return;
  }

  console.log('Commande validée:', { 
    total: this.calculerTotal(), 
    produits: this.panier.length 
  });

  // SAUVEGARDE LE PANIER
  this.panierService.setPanier(this.panier);

  // REDIRIGE VERS COMMANDE
  this.router.navigate(['/commande']);
}

  // ✅ Retirer un produit du panier
  retirerDuPanier(produitId: number) {
    if (confirm('Êtes-vous sûr de vouloir retirer ce produit du panier ?')) {
      this.panierService.retirerDuPanier(produitId);
      this.chargerPanier(); // Recharger le panier
      this.successMessage = '✅ Produit retiré du panier';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  // ✅ Vider le panier
  viderPanier() {
    if (this.panier.length === 0) {
      this.errorMessage = '❌ Le panier est déjà vide';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir vider complètement votre panier ?')) {
      this.panierService.viderPanier();
      this.chargerPanier();
      this.successMessage = '✅ Panier vidé avec succès';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  
}