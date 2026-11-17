import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ProdService, Produit, Categorie } from '../prod.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-produit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Ajouter un Produit</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label for="nom" class="form-label">Nom du produit</label>
          <input type="text" class="form-control" id="nom" [(ngModel)]="produit.nom" name="nom" required>
        </div>
        <div class="mb-3">
          <label for="prix" class="form-label">Prix</label>
          <input type="number" class="form-control" id="prix" [(ngModel)]="produit.prix" name="prix" required>
        </div>
        <div class="mb-3">
          <label for="stock" class="form-label">stock</label>
          <input type="number" class="form-control" id="stock" [(ngModel)]="produit.stock" name="stock" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea class="form-control" id="description" [(ngModel)]="produit.description" name="description" required></textarea>
        </div>

        <!-- Sélection ou création de catégorie -->
        <div class="mb-3">
          <label class="form-label">Catégorie</label>
          <div class="form-check">
            <input type="radio" class="form-check-input" id="categorieExistante" [(ngModel)]="useExistingCategorie" name="categorieType" [value]="true" (change)="resetCategorie()">
            <label class="form-check-label" for="categorieExistante">Sélectionner une catégorie existante</label>
          </div>
          <div class="form-check">
            <input type="radio" class="form-check-input" id="nouvelleCategorie" [(ngModel)]="useExistingCategorie" name="categorieType" [value]="false" (change)="resetCategorie()">
            <label class="form-check-label" for="nouvelleCategorie">Créer une nouvelle catégorie</label>
          </div>
        </div>

        <!-- Sélectionner une catégorie existante -->
        <div class="mb-3" *ngIf="useExistingCategorie">
          <label for="categorieId" class="form-label">Sélectionner une catégorie</label>
          <select class="form-control" id="categorieId" [(ngModel)]="produit.categorie.id" name="categorieId" required>
            <option value="" disabled>Sélectionner une catégorie</option>
            <option *ngFor="let categorie of categories" [value]="categorie.id">{{ categorie.nom }}</option>
          </select>
        </div>

        <!-- Créer une nouvelle catégorie -->
        <div class="mb-3" *ngIf="!useExistingCategorie">
          <label for="nouvelleCategorieNom" class="form-label">Nom de la nouvelle catégorie</label>
          <input type="text" class="form-control" id="nouvelleCategorieNom" [(ngModel)]="produit.categorie.nom" name="nouvelleCategorieNom" required>
        </div>

        <button type="submit" class="btn btn-primary">Ajouter le produit</button>
      </form>

      <!-- Message d'erreur -->
      <div *ngIf="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }
    .form-check {
      margin-bottom: 0.5rem;
    }
  `]
})
export class OrdinateurComponent implements OnInit {
  produit: Produit = {
    nom: '',
    prix: 0,
    stock: 0,
    description: '',
    categorie: { nom: '' }
  };
  categories: Categorie[] = [];
  useExistingCategorie: boolean = true;
  errorMessage: string = '';

  constructor(
    private produitService: ProdService,
    private router: Router
  ) {}

  ngOnInit() {
    this.produitService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des catégories : ' + err.message;
        console.error('Erreur lors du chargement des catégories :', err);
      }
    });
  }

  resetCategorie() {
    this.produit.categorie = { nom: '' };
  }

  onSubmit() {
    if (this.useExistingCategorie && !this.produit.categorie.id) {
      this.errorMessage = 'Veuillez sélectionner une catégorie existante.';
      return;
    }
    if (!this.useExistingCategorie && !this.produit.categorie.nom) {
      this.errorMessage = 'Veuillez entrer un nom pour la nouvelle catégorie.';
      return;
    }

    this.produitService.createProduit(this.produit).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'ajout du produit : ' + err.message;
        console.error('Erreur lors de l\'ajout du produit :', err);
      }
    });
  }
}