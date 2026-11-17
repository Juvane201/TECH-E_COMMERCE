import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Categorie {
  idCategorie?: number;
  nom?: string;
  description?: string;
}

interface Produit {
  idProduit?: number;
  nom?: string;
  description?: string;
  prix?: number;
  stock?: number;
  image?: string;
  imageUrl?: string;
  categorie?: Categorie;
}

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit {
  produitForm: FormGroup;
  showForm = false;
  isEditing = false;
  isLoading = false;
  submitted = false;

  categories: Categorie[] = [];
  produits: Produit[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  categorieChoice: 'existing' | 'new' = 'existing';

  errorMessage: string | null = null;
  successMessage: string | null = null;

  produitEnCoursEdition: Produit | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() success = new EventEmitter<void>();

  private apiUrl = 'http://localhost:8080/api/products';
  private categoriesUrl = 'http://localhost:8080/api/categories';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.produitForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('🚀 Initialisation du composant Produit');
    this.loadCategories();
    this.loadProduits();
    this.setupCategoryValidation();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      prix: ['', [Validators.required, Validators.min(0.01), Validators.max(1000000)]],
      stock: ['', [Validators.required, Validators.min(0), Validators.max(10000)]],
      image: [''],
      categorieExistante: ['', []],
      nouvelleCategorie: ['', []],
      descriptionCategorie: ['', [Validators.maxLength(200)]],
      categoryChoice: ['existing']
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.produitForm.controls;
  }

  getFieldError(fieldName: string): string {
    const control = this.f[fieldName];
    if (!control?.errors || !control.touched) return '';
    const errors = control.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `La valeur minimum est ${errors['min'].min}`;
    if (errors['max']) return `La valeur maximum est ${errors['max'].max}`;
    return 'Erreur de validation';
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.f[fieldName];
    return control?.touched && control.valid;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.f[fieldName];
    return control?.touched && control.invalid;
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.f).forEach(key => this.f[key].markAsTouched());
  }

  onFieldKeyPress(event: any, nextField?: string): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey && nextField) {
      keyboardEvent.preventDefault();
      const nextElement = document.querySelector(`[formControlName="${nextField}"]`) as HTMLElement;
      if (nextElement) nextElement.focus();
    }
  }

  ajouterProduit(): void {
    console.log('➕ Ouverture du formulaire d\'ajout');
    this.showForm = true;
    this.isEditing = false;
    this.submitted = false;
    this.resetForm();
    this.scrollToForm();
  }

  annulerAjout(): void {
    console.log('❌ Annulation de l\'ajout/modification');
    this.showForm = false;
    this.isEditing = false;
    this.produitEnCoursEdition = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  private scrollToForm(): void {
    setTimeout(() => {
      document.getElementById('produit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  onCategoryChoiceChange(choice: 'existing' | 'new'): void {
    this.categorieChoice = choice;
    this.produitForm.patchValue({ categoryChoice: choice });
    this.setupCategoryValidation();
    if (choice === 'existing') {
      this.f['nouvelleCategorie'].reset();
      this.f['descriptionCategorie'].reset();
    } else {
      this.f['categorieExistante'].reset();
    }
  }

  private setupCategoryValidation(): void {
    const catExist = this.f['categorieExistante'];
    const catNew = this.f['nouvelleCategorie'];
    catExist?.clearValidators();
    catNew?.clearValidators();
    if (this.categorieChoice === 'existing') {
      catExist?.setValidators([Validators.required]);
    } else {
      catNew?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
    }
    catExist?.updateValueAndValidity();
    catNew?.updateValueAndValidity();
  }

  loadCategories(): void {
    console.log('📡 Chargement des catégories...');
    const headers = this.getAuthHeaders();
    this.http.get<Categorie[]>(this.categoriesUrl, { headers }).subscribe({
      next: (cats) => {
        console.log('✅ Catégories chargées:', cats);
        this.categories = cats;
      },
      error: (err) => {
        console.error('❌ Erreur chargement catégories:', err);
        this.errorMessage = 'Impossible de charger les catégories.';
      }
    });
  }

  loadProduits(): void {
    console.log('📡 Chargement des produits...');
    const headers = this.getAuthHeaders();
    this.http.get<Produit[]>(this.apiUrl, { headers }).subscribe({
      next: (prods) => {
        console.log('✅ Produits chargés:', prods);
        this.produits = prods.map(p => ({
          ...p,
          imageUrl: p.image ? `http://localhost:8080${p.image}` : 'assets/placeholder.jpg'
        }));
      },
      error: (err) => {
        console.error('❌ Erreur chargement produits:', err);
        this.produits = [];
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    console.log('🖼️ Fichier sélectionné:', file.name, file.size, 'octets');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Formats supportés : JPG, PNG, GIF, WebP';
      this.resetFileInput();
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image trop lourde (5 Mo maximum)';
      this.resetFileInput();
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.onerror = () => {
      this.errorMessage = 'Erreur lors de la lecture de l\'image';
      this.resetFileInput();
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    console.log('🗑️ Suppression de l\'image');
    this.selectedFile = null;
    this.imagePreview = null;
    this.resetFileInput();
  }

  editerProduit(produit: Produit): void {
    console.log('✏️ Édition du produit:', produit);
    this.showForm = true;
    this.isEditing = true;
    this.produitEnCoursEdition = produit;

    this.produitForm.patchValue({
      nom: produit.nom || '',
      description: produit.description || '',
      prix: produit.prix || '',
      stock: produit.stock || '',
      categoryChoice: 'existing',
      categorieExistante: produit.categorie?.idCategorie?.toString() || ''
    });

    this.categorieChoice = 'existing';
    this.imagePreview = produit.imageUrl || null;
    this.setupCategoryValidation();
    this.scrollToForm();
  }

  onSubmit(): void {
    console.log('📤 Soumission du formulaire');
    this.submitted = true;
    this.errorMessage = null;
    this.markAllFieldsAsTouched();
    this.setupCategoryValidation();

    if (this.produitForm.invalid) {
      console.warn('⚠️ Formulaire invalide');
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      this.scrollToFirstInvalidField();
      return;
    }

    let categorie: Categorie | undefined;
    if (this.categorieChoice === 'new') {
      const nom = this.f['nouvelleCategorie'].value?.trim();
      if (!nom) return;
      categorie = { nom, description: this.f['descriptionCategorie'].value?.trim() || undefined };
      console.log('🆕 Nouvelle catégorie à créer:', categorie);
    } else {
      const id = this.f['categorieExistante'].value;
      categorie = this.categories.find(c => c.idCategorie == id);
      if (!categorie) {
        this.errorMessage = 'Catégorie invalide.';
        return;
      }
      console.log('📁 Catégorie existante sélectionnée:', categorie);
    }

    const prix = parseFloat(this.f['prix'].value);
    const stock = parseInt(this.f['stock'].value, 10);
    if (isNaN(prix) || prix <= 0 || isNaN(stock) || stock < 0) {
      this.errorMessage = 'Prix et stock doivent être des nombres positifs.';
      return;
    }

    const produitData: any = {
      nom: this.f['nom'].value.trim(),
      description: this.f['description'].value?.trim() || undefined,
      prix,
      stock,
      categorie
    };

    if (this.isEditing && this.produitEnCoursEdition?.idProduit) {
      produitData.idProduit = this.produitEnCoursEdition.idProduit;
    }

    console.log('📦 Données du produit prêtes à l\'envoi:', produitData);
    this.submitFormData(produitData);
  }

  private submitFormData(produitData: any): void {
    const formData = new FormData();
    
    // ⚠️ IMPORTANT : On ajoute l'objet JSON en tant que Blob avec le type application/json
    formData.append('produit', new Blob([JSON.stringify(produitData)], { type: 'application/json' }));
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
      console.log('🖼️ Image ajoutée au FormData:', this.selectedFile.name);
    }

    const headers = this.getAuthHeaders();
    this.isLoading = true;

    const url = this.isEditing
      ? `${this.apiUrl}/${this.produitEnCoursEdition!.idProduit}`
      : this.apiUrl;

    console.log(`🚀 Envoi ${this.isEditing ? 'PUT' : 'POST'} vers ${url}`);

    // On n'ajoute PAS le header Content-Type manuellement, le navigateur le fera avec le boundary pour FormData
    const request = this.isEditing
      ? this.http.put(url, formData, { headers })
      : this.http.post(url, formData, { headers });

    request.subscribe({
      next: (response) => {
        console.log('✅ Succès de la requête:', response);
        this.isLoading = false;
        this.successMessage = this.isEditing ? 'Produit modifié avec succès !' : 'Produit ajouté avec succès !';
        this.annulerAjout();
        this.loadProduits();
        this.success.emit();
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ ERREUR SERVEUR:', err);
        
        // LOGS DÉTAILLÉS POUR COMPRENDRE L'ERREUR
        console.group('🔍 Détails de l\'erreur HTTP');
        console.log('Status:', err.status);
        console.log('Statut texte:', err.statusText);
        console.log('URL:', err.url);
        console.log('Message:', err.message);
        console.log('Corps de l\'erreur (Backend):', err.error);
        console.groupEnd();

        this.isLoading = false;
        
        // Affichage d'un message clair pour l'utilisateur
        if (err.status === 0) {
          this.errorMessage = '❌ Erreur de connexion : Le serveur backend (Spring Boot) est-il lancé sur le port 8080 ?';
        } else if (err.status === 400) {
          this.errorMessage = '❌ Données invalides envoyées au serveur (400). Vérifiez la console.';
        } else if (err.status === 415) {
          this.errorMessage = '❌ Format de données non supporté par le serveur (415). Vérifiez la configuration CORS/FormData.';
        } else if (err.status === 500) {
          this.errorMessage = '❌ Erreur interne du serveur (500). Vérifiez les logs de Spring Boot.';
        } else {
          this.errorMessage = `❌ Erreur ${err.status}: ${err.error?.message || err.error?.error || 'Erreur inconnue'}`;
        }
      }
    });
  }

  private scrollToFirstInvalidField(): void {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.field-error');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  supprimerProduit(produit: Produit): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${produit.nom}" ?`)) return;
    console.log('🗑️ Suppression du produit:', produit.idProduit);
    this.isLoading = true;
    this.http.delete(`${this.apiUrl}/${produit.idProduit}`, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        console.log('✅ Produit supprimé');
        this.successMessage = 'Produit supprimé avec succès !';
        this.loadProduits();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        this.errorMessage = 'Échec de la suppression : ' + (err.error?.error || 'Erreur serveur');
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.produitForm.reset({ categoryChoice: 'existing', stock: 0, prix: 0 });
    this.categorieChoice = 'existing';
    this.selectedFile = null;
    this.imagePreview = null;
    this.submitted = false;
    this.errorMessage = null;
    this.setupCategoryValidation();
    this.resetFileInput();
  }

  private resetFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'badge-out-of-stock';
    if (stock <= 10) return 'badge-low-stock';
    return 'badge-in-stock';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Rupture';
    if (stock <= 10) return 'Faible';
    return 'Disponible';
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    // On ne définit pas Content-Type ici pour laisser le navigateur gérer le boundary du FormData
    return new HttpHeaders({ 
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  trackByProduitId(index: number, produit: Produit): number {
    return produit.idProduit || index;
  }

  trackByCategorieId(index: number, categorie: Categorie): number {
    return categorie.idCategorie || index;
  }
}