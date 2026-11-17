import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HeadComponent } from "../admin/head/head.component";

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
  image?: string | undefined;
  categorie?: Categorie;
  dateAjout?: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-crud-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeadComponent],
  template: `
  <div style="display: flex;">
    <div><app-head></app-head></div>
    <div class="container">
      <h1 class="title">Gestion des Produits</h1>
      
      <!-- Notifications -->
      <div class="notifications">
        <div *ngFor="let notification of notifications" 
             class="notification"
             [class.success]="notification.type === 'success'"
             [class.error]="notification.type === 'error'"
             [attr.data-id]="notification.id">
          <div class="notification-content">
            <i class="fas fa-{{ notification.type === 'success' ? 'check-circle' : 'exclamation-circle' }}"></i>
            <span>{{ notification.message }}</span>
          </div>
          <button (click)="dismissNotification(notification.id)" class="close-btn">×</button>
        </div>
      </div>

      <!-- Add Product Button -->
      <div class="button-container">
        <button (click)="openModal('add')" class="add-button">
          <i class="fas fa-plus"></i> Ajouter un Produit
        </button>
      </div>

      <!-- Products Table -->
      <div class="table-container">
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
        <table *ngIf="!isLoading">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Catégorie</th>
              <th>Date d'ajout</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let produit of produits; let i = index" 
                [class.even]="i % 2 === 0">
              <td>{{ produit.nom || 'N/A' }}</td>
              <td class="truncate">{{ produit.description || 'Aucune description' }}</td>
              <td>{{ produit.prix | currency:'Ar' }}</td>
              <td>
                <span [class]="produit.stock && produit.stock > 0 ? 'stock-in' : 'stock-out'">
                  {{ produit.stock || 0 }}
                </span>
              </td>
              <td>{{ produit.categorie?.nom || 'Aucune catégorie' }}</td>
              <td>{{ formatDate(produit.dateAjout) }}</td>
              <td>
                <img 
                  *ngIf="produit.image && imageLoaded[produit.idProduit || 0]" 
                  [src]="sanitizeImage(produit.image)" 
                  [alt]="produit.nom || 'Produit sans nom'"
                  class="product-image"
                  (error)="onImageError($event, produit.idProduit || 0)">
                <div class="image-placeholder" [style.display]="!produit.image || !imageLoaded[produit.idProduit || 0] ? 'flex' : 'none'">
                  <i class="fas fa-image"></i>
                </div>
              </td>
              <td>
                <button (click)="openModal('edit', produit)" class="edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <button (click)="deleteProduit(produit)" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!isLoading && produits.length === 0" class="no-data">Aucun produit trouvé</div>
      </div>

      <!-- Add/Edit Product Modal -->
      <div *ngIf="showModal" class="modal-overlay" #modalOverlay>
        <div class="modal-content" #modalContent>
          <h3 class="modal-title">{{ modalMode === 'add' ? 'Ajouter un Produit' : 'Modifier le Produit' }}</h3>
          <form [formGroup]="produitForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" formControlName="nom" class="input-field" [class.error]="submitted && f['nom'].errors">
              <div *ngIf="submitted && f['nom'].errors" class="error-message">
                <span *ngIf="f['nom'].errors['required']">Le nom est requis.</span>
                <span *ngIf="f['nom'].errors['minlength']">Le nom doit contenir au moins 2 caractères.</span>
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" rows="4" class="input-field"></textarea>
              <div *ngIf="submitted && f['description'].errors" class="error-message">
                <span *ngIf="f['description'].errors['maxlength']">La description ne peut pas dépasser 500 caractères.</span>
              </div>
            </div>
            <div class="form-group two-cols">
              <div>
                <label>Prix *</label>
                <input type="number" step="0.01" formControlName="prix" class="input-field" [class.error]="submitted && f['prix'].errors">
                <div *ngIf="submitted && f['prix'].errors" class="error-message">
                  <span *ngIf="f['prix'].errors['required']">Le prix est requis.</span>
                  <span *ngIf="f['prix'].errors['min']">Le prix doit être supérieur à 0.01.</span>
                </div>
              </div>
              <div>
                <label>Stock *</label>
                <input type="number" formControlName="stock" class="input-field" [class.error]="submitted && f['stock'].errors">
                <div *ngIf="submitted && f['stock'].errors" class="error-message">
                  <span *ngIf="f['stock'].errors['required']">Le stock est requis.</span>
                  <span *ngIf="f['stock'].errors['min']">Le stock doit être supérieur ou égal à 0.</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Catégorie *</label>
              <div class="radio-group">
                <label><input type="radio" [(ngModel)]="categorieChoice" value="existing" name="categorieChoice" (change)="onCategoryChoiceChange('existing')" [ngModelOptions]="{standalone: true}"> Catégorie existante</label>
                <label><input type="radio" [(ngModel)]="categorieChoice" value="new" name="categorieChoice" (change)="onCategoryChoiceChange('new')" [ngModelOptions]="{standalone: true}"> Nouvelle catégorie</label>
              </div>
              <select *ngIf="categorieChoice === 'existing'" formControlName="categorieExistante" class="input-field" [class.error]="submitted && f['categorieExistante'].errors">
                <option value="">Sélectionner une catégorie</option>
                <option *ngFor="let cat of categories" [value]="cat.idCategorie">{{ cat.nom }}</option>
              </select>
              <div *ngIf="submitted && f['categorieExistante'].errors" class="error-message">
                <span *ngIf="f['categorieExistante'].errors['required']">Une catégorie existante est requise.</span>
              </div>
              <div *ngIf="categorieChoice === 'new'" class="new-category">
                <input type="text" formControlName="nouvelleCategorie" placeholder="Nom de la nouvelle catégorie" class="input-field" [class.error]="submitted && f['nouvelleCategorie'].errors">
                <div *ngIf="submitted && f['nouvelleCategorie'].errors" class="error-message">
                  <span *ngIf="f['nouvelleCategorie'].errors['required']">Le nom de la catégorie est requis.</span>
                  <span *ngIf="f['nouvelleCategorie'].errors['minlength']">Le nom de la catégorie doit contenir au moins 2 caractères.</span>
                </div>
                <textarea formControlName="descriptionCategorie" placeholder="Description de la catégorie (optionnel)" rows="3" class="input-field"></textarea>
              </div>
            </div>
            <div class="form-group">
              <label>Image</label>
              <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" class="input-file">
              <div *ngIf="imagePreview" class="image-preview">
                <img [src]="sanitizeImage(imagePreview)" alt="Aperçu" class="preview-image">
              </div>
            </div>
            <div class="button-group">
              <button type="button" (click)="closeModal()" class="cancel-btn">Annuler</button>
              <button type="submit" [disabled]="isLoading" class="submit-btn">
                <span *ngIf="isLoading" class="spinner"></span>
                {{ isLoading ? 'Chargement...' : (modalMode === 'add' ? 'Ajouter' : 'Modifier') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showDeleteModal" class="modal-overlay" #deleteModalOverlay>
        <div class="modal-content delete-modal" #deleteModalContent>
          <div class="modal-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3 class="modal-title">Confirmer la suppression</h3>
          <p>Êtes-vous sûr de vouloir supprimer le produit "{{ produitToDelete?.nom || 'N/A' }}" ? Cette action est irréversible.</p>
          <div class="button-group">
            <button (click)="cancelDelete()" class="cancel-btn">Annuler</button>
            <button (click)="confirmDelete()" class="submit-btn delete">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 120px;
      margin: 70px;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #f0f4f8, #e0e7ff);
    }
    .title {
      font-size: 2.5rem;
      font-weight: bold;
      text-align: center;
      color: #2d3748;
      margin-bottom: 20px;
    }
    .notifications {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    .notification {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      opacity: 0;
      transform: translateX(100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .notification.success {
      background: #f0fff4;
      color: #2f855a;
      border-left: 4px solid #48bb78;
    }
    .notification.error {
      background: #fff5f5;
      color: #742a2a;
      border-left: 4px solid #f56565;
    }
    .notification-content i {
      margin-right: 10px;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: inherit;
    }
    .button-container {
      text-align: center;
      margin-bottom: 20px;
    }
    .add-button {
      padding: 10px 20px;
      font-size: 1rem;
      font-weight: bold;
      color: white;
      background: linear-gradient(90deg, #4c51bf, #63b3ed);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.3s;
    }
    .add-button:hover {
      transform: scale(1.05);
    }
    .table-container {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
    }
    th {
      background: #edf2f7;
      font-weight: bold;
      color: #4a5568;
      text-transform: uppercase;
      font-size: 0.9rem;
    }
    td {
      color: #2d3748;
    }
    .even {
      background: #f7fafc;
    }
    .product-image, .image-placeholder {
      width: 130px;
      height: 90px;
      object-fit: cover;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-placeholder {
      background: #e2e8f0;
      display: none;
    }
    .stock-in {
      background: #d4edda;
      color: #155724;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .stock-out {
      background: #f8d7da;
      color: #721c24;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .truncate {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .edit-btn, .delete-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      margin-right: 10px;
      transition: transform 0.3s;
    }
    .edit-btn:hover {
      color: #4c51bf;
      transform: scale(1.2);
    }
    .delete-btn:hover {
      color: #e53e3e;
      transform: scale(1.2);
    }
    .loading, .no-data {
      padding: 20px;
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #cbd5e0;
      border-top: 4px solid #4c51bf;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    .no-data {
      color: #718096;
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
    }
    .modal-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transform: scale(0.9);
    }
    .delete-modal {
      background: rgba(255, 245, 245, 0.95);
    }
    .modal-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2d3748;
      text-align: center;
      margin-bottom: 15px;
    }
    .modal-icon {
      text-align: center;
      margin-bottom: 15px;
    }
    .modal-icon i {
      font-size: 2.5rem;
      color: #e53e3e;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .two-cols {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
    }
    @media (min-width: 640px) {
      .two-cols {
        grid-template-columns: 1fr 1fr;
      }
    }
    label {
      display: block;
      font-size: 0.9rem;
      color: #4a5568;
      margin-bottom: 5px;
    }
    .input-field, .input-file {
      width: 100%;
      padding: 10px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      color: #2d3748;
      background: white;
    }
    .input-field:focus {
      outline: none;
      border-color: #63b3ed;
      box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.3);
    }
    .input-file {
      padding: 8px;
    }
    .error {
      border-color: #fc8181;
    }
    .error-message {
      color: #fc8181;
      font-size: 0.8rem;
      margin-top: 5px;
    }
    .radio-group {
      margin-bottom: 10px;
    }
    .radio-group label {
      margin-right: 15px;
    }
    .new-category {
      margin-top: 10px;
    }
    .image-preview {
      margin-top: 10px;
    }
    .preview-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    .cancel-btn, .submit-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .cancel-btn {
      background: #e2e8f0;
      color: #2d3748;
    }
    .cancel-btn:hover {
      background: #cbd5e0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .submit-btn {
      background: linear-gradient(90deg, #4c51bf, #63b3ed);
      color: white;
    }
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 81, 191, 0.3);
    }
    .submit-btn.delete {
      background: linear-gradient(90deg, #e53e3e, #fc8181);
    }
    .submit-btn.delete:hover {
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid #e2e8f0;
      border-top: 3px solid #4c51bf;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProduitListComponent implements OnInit {
  produits: Produit[] = [];
  categories: Categorie[] = [];
  produitForm: FormGroup;
  isLoading = false;
  submitted = false;
  imageLoaded: { [key: number]: boolean } = {};

  // Modal
  showModal = false;
  showDeleteModal = false;
  modalMode: 'add' | 'edit' = 'add';
  currentProduit: Produit | null = null;
  produitToDelete: Produit | null = null;

  // Notifications
  notifications: Notification[] = [];
  private notificationId = 0;

  // Image
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  categorieChoice: 'existing' | 'new' = 'existing';

  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('modalOverlay', { static: false }) modalOverlay?: ElementRef<HTMLDivElement>;
  @ViewChild('modalContent', { static: false }) modalContent?: ElementRef<HTMLDivElement>;
  @ViewChild('deleteModalOverlay', { static: false }) deleteModalOverlay?: ElementRef<HTMLDivElement>;
  @ViewChild('deleteModalContent', { static: false }) deleteModalContent?: ElementRef<HTMLDivElement>;

  private apiUrl = 'http://localhost:8080/api/produit';
  private categoriesUrl = 'http://localhost:8080/api/produit/categories';
  private readonly fallbackImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.produitForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.maxLength(500)],
      prix: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      categorieExistante: [''],
      nouvelleCategorie: [''],
      descriptionCategorie: ['']
    });
  }

  ngOnInit(): void {
    this.loadProduits();
    this.loadCategories();
    this.setupCategoryValidation();
  }

  get f() { return this.produitForm.controls; }

  loadProduits(): void {
    this.isLoading = true;
    this.http.get<Produit[]>(this.apiUrl).subscribe({
      next: (produits) => {
        console.log('Produits reçus du backend :', produits);
        this.produits = produits.map(p => ({
          ...p,
          image: p.image ? `http://localhost:8080/api/images/${p.image}` : undefined // Ajustez l'URL selon votre API
        }));
        this.produits.forEach(p => {
          this.imageLoaded[p.idProduit || 0] = !!p.image;
          console.log(`Produit ${p.idProduit}: imageLoaded = ${this.imageLoaded[p.idProduit || 0]}, image = ${p.image}`);
        });
        this.isLoading = false;
        this.animateTableRows();
      },
      error: (error: HttpErrorResponse) => {
        this.addNotification('error', this.getErrorMessage(error));
        this.isLoading = false;
      }
    });
  }
  loadCategories(): void {
    this.http.get<Categorie[]>(this.categoriesUrl).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error: HttpErrorResponse) => {
        this.addNotification('error', this.getErrorMessage(error));
      }
    });
  }

  openModal(mode: 'add' | 'edit', produit?: Produit): void {
    this.modalMode = mode;
    this.currentProduit = produit || null;
    this.showModal = true;
    this.submitted = false;
    this.selectedFile = null;
    this.imagePreview = produit?.image || null;
    this.categorieChoice = 'existing';

    if (mode === 'edit' && produit) {
      this.produitForm.patchValue({
        nom: produit.nom,
        description: produit.description,
        prix: produit.prix,
        stock: produit.stock,
        categorieExistante: produit.categorie?.idCategorie
      });
    } else {
      this.produitForm.reset();
      this.imagePreview = null;
    }

    this.setupCategoryValidation();
    setTimeout(() => {
      if (this.modalOverlay && this.modalContent) {
        this.animateModalOpen(this.modalOverlay.nativeElement, this.modalContent.nativeElement);
      } else {
        console.warn('Les éléments du modal ne sont pas disponibles pour l\'animation.');
      }
      this.cdr.detectChanges();
    }, 0);
  }

  closeModal(): void {
    if (this.modalOverlay && this.modalContent) {
      this.animateModalClose().then(() => {
        this.showModal = false;
        this.currentProduit = null;
        this.produitForm.reset();
        this.selectedFile = null;
        this.imagePreview = null;
        this.cdr.detectChanges();
      });
    } else {
      this.showModal = false;
      this.currentProduit = null;
      this.produitForm.reset();
      this.selectedFile = null;
      this.imagePreview = null;
      console.warn('Les éléments du modal ne sont pas disponibles pour la fermeture de l\'animation.');
      this.cdr.detectChanges();
    }
  }

  onCategoryChoiceChange(choice: 'existing' | 'new'): void {
    this.categorieChoice = choice;
    this.setupCategoryValidation();
  }

  private setupCategoryValidation(): void {
    const categorieExistanteControl = this.produitForm.get('categorieExistante');
    const nouvelleCategorieControl = this.produitForm.get('nouvelleCategorie');

    categorieExistanteControl?.clearValidators();
    nouvelleCategorieControl?.clearValidators();

    if (this.categorieChoice === 'existing') {
      categorieExistanteControl?.setValidators([Validators.required]);
      nouvelleCategorieControl?.setValue('');
      this.produitForm.get('descriptionCategorie')?.setValue('');
    } else {
      nouvelleCategorieControl?.setValidators([Validators.required, Validators.minLength(2)]);
      categorieExistanteControl?.setValue('');
    }

    categorieExistanteControl?.updateValueAndValidity();
    nouvelleCategorieControl?.updateValueAndValidity();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.addNotification('error', 'Type de fichier non supporté. Utilisez JPG, PNG ou GIF.');
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.addNotification('error', 'Fichier trop volumineux (2 Mo max).');
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (this.isValidBase64(result.split(',')[1])) {
          this.imagePreview = result;
        } else {
          this.addNotification('error', 'Données de l\'image invalides.');
          this.imagePreview = null;
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        }
        this.cdr.detectChanges();
      };
      reader.onerror = () => {
        this.addNotification('error', 'Erreur lors de la lecture du fichier image.');
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.produitForm.invalid) {
      this.addNotification('error', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    let categorie: Categorie | undefined;

    if (this.categorieChoice === 'new') {
      categorie = {
        nom: this.sanitizeInput(this.produitForm.value.nouvelleCategorie?.trim()),
        description: this.sanitizeInput(this.produitForm.value.descriptionCategorie?.trim()) || ''
      };
    } else {
      const selectedCategoryId = this.produitForm.value.categorieExistante;
      categorie = this.categories.find(c => c.idCategorie === +selectedCategoryId);
    }

    const produit: Produit = {
      nom: this.sanitizeInput(this.produitForm.value.nom?.trim()),
      description: this.sanitizeInput(this.produitForm.value.description?.trim()),
      prix: parseFloat(this.produitForm.value.prix),
      stock: parseInt(this.produitForm.value.stock, 10),
      categorie,
      image: this.imagePreview ? this.imagePreview.split(',')[1] : undefined
    };

    if (this.modalMode === 'edit' && this.currentProduit) {
      produit.idProduit = this.currentProduit.idProduit;
    }

    const formData = new FormData();
    formData.append('produit', new Blob([JSON.stringify(produit)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.isLoading = true;
    const request = this.modalMode === 'add' 
      ? this.http.post<Produit>(this.apiUrl, formData) 
      : this.http.put<Produit>(`${this.apiUrl}/${produit.idProduit}`, formData);

    request.subscribe({
      next: (response) => {
        this.isLoading = false;
        const updatedProduit: Produit = {
          ...produit,
          image: response.image ? `data:image/jpeg;base64,${response.image}` : undefined
        };
        if (this.modalMode === 'add') {
          this.produits.push(updatedProduit);
        } else if (this.currentProduit) {
          const index = this.produits.findIndex(p => p.idProduit === this.currentProduit?.idProduit);
          if (index !== -1) this.produits[index] = updatedProduit;
        }
        this.addNotification('success', `Produit ${this.modalMode === 'add' ? 'ajouté' : 'modifié'} avec succès !`);
        this.closeModal();
        this.loadProduits();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.addNotification('error', this.getErrorMessage(error));
      }
    });
  }

  deleteProduit(produit: Produit): void {
    this.produitToDelete = produit;
    this.showDeleteModal = true;
    setTimeout(() => {
      if (this.deleteModalOverlay && this.deleteModalContent) {
        this.animateModalOpen(this.deleteModalOverlay.nativeElement, this.deleteModalContent.nativeElement);
      } else {
        console.warn('Les éléments du modal de suppression ne sont pas disponibles pour l\'animation.');
      }
      this.cdr.detectChanges();
    }, 0);
  }

  confirmDelete(): void {
    if (this.produitToDelete && this.produitToDelete.idProduit) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/${this.produitToDelete.idProduit}`).subscribe({
        next: () => {
          this.addNotification('success', 'Produit supprimé avec succès !');
          this.animateModalClose().then(() => {
            this.showDeleteModal = false;
            this.produits = this.produits.filter(p => p.idProduit !== this.produitToDelete?.idProduit);
            this.produitToDelete = null;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (error: HttpErrorResponse) => {
          this.addNotification('error', this.getErrorMessage(error));
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancelDelete(): void {
    this.animateModalClose().then(() => {
      this.showDeleteModal = false;
      this.produitToDelete = null;
      this.cdr.detectChanges();
    });
  }

  onImageError(event: Event, idProduit: number): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.dataset['errorHandled']) {
      target.dataset['errorHandled'] = 'true';
      this.imageLoaded[idProduit] = false;
      target.style.display = 'none';
      const sibling = target.nextElementSibling as HTMLElement;
      if (sibling && sibling.classList.contains('image-placeholder')) {
        sibling.style.display = 'flex';
      }
      console.warn(`Erreur de chargement de l'image pour le produit ID ${idProduit}`);
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  }

  addNotification(type: 'success' | 'error', message: string): void {
    const notification: Notification = { id: this.notificationId++, type, message };
    this.notifications.push(notification);
    this.animateNotification(notification.id);
    setTimeout(() => this.dismissNotification(notification.id), 5000);
  }

  dismissNotification(id: number): void {
    const notification = document.querySelector(`.notification[data-id="${id}"]`) as HTMLElement;
    if (notification) {
      this.animateNotificationExit(notification).then(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      });
    }
  }

  private animateNotification(id: number): void {
    const notification = document.querySelector(`.notification[data-id="${id}"]`) as HTMLElement;
    if (notification) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      requestAnimationFrame(() => {
        notification.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      });
    }
  }

  private animateNotificationExit(notification: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      notification.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => resolve(), 500);
    });
  }

  private animateModalOpen(overlay: HTMLElement, content: HTMLElement): void {
    overlay.style.opacity = '0';
    overlay.style.visibility = 'visible';
    content.style.transform = 'scale(0.8)';
    content.style.opacity = '0';

    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.3s ease';
      content.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease';
      overlay.style.opacity = '1';
      content.style.transform = 'scale(1)';
      content.style.opacity = '1';
    });
  }

  private animateModalClose(): Promise<void> {
    return new Promise(resolve => {
      const modalOverlay = this.modalOverlay?.nativeElement;
      const modalContent = this.modalContent?.nativeElement;
      const deleteModalOverlay = this.deleteModalOverlay?.nativeElement;
      const deleteModalContent = this.deleteModalContent?.nativeElement;

      if (modalOverlay && modalContent && deleteModalOverlay && deleteModalContent) {
        modalOverlay.style.transition = 'opacity 0.3s ease';
        modalContent.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease';
        deleteModalOverlay.style.transition = 'opacity 0.3s ease';
        deleteModalContent.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease';

        modalOverlay.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        modalContent.style.opacity = '0';
        deleteModalOverlay.style.opacity = '0';
        deleteModalContent.style.transform = 'scale(0.8)';
        deleteModalContent.style.opacity = '0';

        setTimeout(() => {
          modalOverlay.style.visibility = 'hidden';
          deleteModalOverlay.style.visibility = 'hidden';
          resolve();
        }, 400);
      } else {
        console.warn('Les éléments du modal ne sont pas disponibles pour l\'animation de fermeture.');
        resolve();
      }
    });
  }

  private animateTableRows(): void {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
      const htmlRow = row as HTMLElement;
      htmlRow.style.opacity = '0';
      htmlRow.style.transform = 'translateY(20px)';
      requestAnimationFrame(() => {
        htmlRow.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        htmlRow.style.opacity = '1';
        htmlRow.style.transform = 'translateY(0)';
        htmlRow.style.transitionDelay = `${index * 0.1}s`;
      });
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Requête invalide. Vérifiez les données saisies.';
      case 404:
        return 'Ressource non trouvée.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  }

  private sanitizeInput(input?: string): string | undefined {
    if (!input) return undefined;
    return input.replace(/[<>"'%;()&+]/g, '').trim();
  }

  private isValidBase64(str?: string): boolean {
    if (!str) return false;
    try {
      return btoa(atob(str)) === str;
    } catch (e) {
      console.warn(`Chaîne base64 invalide : ${str.substring(0, 20)}...`);
      return false;
    }
  }

  sanitizeImage(image: string | null | undefined): SafeUrl {
    if (image) {
      console.log('Sanitizing image URL:', image); // Journalisation pour débogage
      return this.sanitizer.bypassSecurityTrustUrl(image);
    }
    console.log('Using fallback image');
    return this.sanitizer.bypassSecurityTrustUrl(this.fallbackImage);
  }
}