import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HomeHeaderComponent } from './home-header/home-header.component';
import { PanierService, Produit, Categorie } from '../service/panier.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HomeHeaderComponent, FormsModule],
  template: `
    <app-home-header 
      (categorieSelected)="onCategorieSelected($event)" 
      [cartItemCount]="getNombreProduitsPanier()"
      (viewCart)="voirPanier()">
    </app-home-header>
    
    <main class="main-content">
      <!-- ============ CAROUSEL ============ -->
      <section class="hero-carousel">
        <div class="carousel-container">
          <div class="carousel-slides" [style.transform]="'translateX(-' + currentSlide * 100 + '%)'">
            <div *ngFor="let slide of slides; let i = index" 
                 class="carousel-slide" 
                 [class.active]="i === currentSlide">
              <img [src]="slide.image" [alt]="slide.title" class="slide-image" (error)="onCarouselImageError($event, slide)">
              <div class="slide-overlay"></div>
              <div class="slide-content">
                <span class="slide-badge">Nouveauté</span>
                <h2 class="slide-title">{{ slide.title }}</h2>
                <p class="slide-description">{{ slide.description }}</p>
                <button class="slide-btn" (click)="ouvrirSectionProduits(slide.categorie)">
                  Découvrir
                </button>
              </div>
            </div>
          </div>
          <button class="carousel-control prev" (click)="previousSlide()">‹</button>
          <button class="carousel-control next" (click)="nextSlide()">›</button>
          <div class="carousel-indicators">
            <button *ngFor="let slide of slides; let i = index" class="indicator" [class.active]="i === currentSlide" (click)="goToSlide(i)"></button>
          </div>
        </div>
      </section>

      <!-- ============ FILTRES (Cachés au début) ============ -->
      <section class="filters-section" *ngIf="showProductsSection">
        <div class="container">
          <div class="filters-grid">
            <div class="search-box">
              <input type="text" placeholder="Rechercher un produit..." [(ngModel)]="searchTermNom" (input)="rechercher()" class="search-input">
            </div>
            <div class="filter-group">
              <label>Prix max :</label>
              <input type="range" min="0" max="1000000" step="1000" [(ngModel)]="searchTermPrix" (input)="rechercher()" class="price-slider">
              <span class="price-value">{{ searchTermPrix | number:'1.0-0' }} Ar</span>
            </div>
            <div class="filter-buttons">
              <button class="filter-btn" [class.active]="filtreActif === 'tous'" (click)="appliquerFiltre('tous')">Tous</button>
              <button class="filter-btn" [class.active]="filtreActif === 'nouveautes'" (click)="appliquerFiltre('nouveautes')">🆕 Nouveautés</button>
              <button class="filter-btn" [class.active]="filtreActif === 'promotions'" (click)="appliquerFiltre('promotions')">🔥 Promotions</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ SECTION CATÉGORIES (Design Image) ============ -->
      <section class="categories-section" *ngIf="!showProductsSection">
        <div class="container">
          <div class="categories-header">
            <div>
              <span class="eyebrow">Parcourir</span>
              <h2 class="categories-title">Explorer par <span class="gradient-text">catégorie</span></h2>
              <p class="categories-subtitle">Cliquez sur une catégorie ou affichez tous nos produits.</p>
            </div>
          </div>
          <div class="categories-grid">
            <button *ngFor="let cat of categories; let i = index" class="category-card" (click)="ouvrirSectionProduits(cat)">
              <div class="category-image-wrap">
                <img [src]="getCategoryImage(cat.nom)" [alt]="cat.nom" class="category-image">
                <div class="category-overlay"></div>
                <div class="category-badge">{{ getNombreProduitsParCategorie(cat.nom) }} produits</div>
              </div>
              <div class="category-info">
                <h3 class="category-name">{{ cat.nom }}</h3>
                <span class="category-link">Voir les produits <i class="fas fa-arrow-right"></i></span>
              </div>
            </button>
          </div>
          
          <!-- BOUTON CENTRAL POUR AFFICHER TOUS LES PRODUITS -->
          <div class="show-all-btn-container">
            <button class="btn-show-all" (click)="ouvrirSectionProduits(null)">
              <i class="fas fa-box-open"></i>
              Voir tous les produits
            </button>
          </div>
        </div>
      </section>

      <!-- ============ TOUS LES PRODUITS (Affiché seulement après le clic) ============ -->
      <section class="products-section" *ngIf="showProductsSection">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">
              <span *ngIf="!selectedCategorie && filtreActif === 'tous'">🎯 Tous nos produits</span>
              <span *ngIf="!selectedCategorie && filtreActif === 'nouveautes'">🆕 Nouveautés</span>
              <span *ngIf="!selectedCategorie && filtreActif === 'promotions'">🔥 En promotion</span>
              <span *ngIf="selectedCategorie">📁 {{ selectedCategorie.nom }}</span>
              <span class="product-count">({{ produits.length }})</span>
            </h2>
            <button class="reset-btn" (click)="fermerSectionProduits()">
              <i class="fas fa-arrow-left"></i> Retour aux catégories
            </button>
          </div>

          <div class="products-grid">
            <div class="product-card" *ngFor="let produit of produits">
              <div class="product-badges">
                <span *ngIf="produit.estNouveau" class="badge new">🆕 Nouveau</span>
                <span *ngIf="produit.promotion" class="badge promotion">🔥 -{{ produit.promotion }}%</span>
              </div>

              <div class="product-image">
                <img [src]="getSafeImageUrl(produit)" [alt]="produit.nom" (error)="onImageError($event, produit)" class="product-img">
              </div>
              
              <div class="product-content">
                <div class="product-category"><span class="category-tag">{{ produit.categorie?.nom }}</span></div>
                <h3 class="product-title">{{ produit.nom }}</h3>
                
                <div class="product-footer">
                  <div class="product-price">
                    <div *ngIf="produit.promotion" class="price-with-promo">
                      <span class="original-price">{{ produit.prixOriginal | number:'1.0-0' }} Ar</span>
                      <span class="price">{{ produit.prix | number:'1.0-0' }} Ar</span>
                    </div>
                    <div *ngIf="!produit.promotion" class="price-normal">
                      <span class="price">{{ produit.prix | number:'1.0-0' }} Ar</span>
                    </div>
                  </div>
                  
                  <!-- Bouton Ajouter comme sur votre capture -->
                  <button class="add-cart-btn" (click)="ajouterAuPanier(produit)" [disabled]="produit.stock === 0">
                    <svg class="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="produits.length === 0" class="empty-state">
            <h3>Aucun produit trouvé</h3>
            <button class="reset-search-btn" (click)="resetFiltres()">Réinitialiser</button>
          </div>
        </div>
      </section>

      <!-- ============ PANIER FLOTTANT ============ -->
      <div *ngIf="getNombreProduitsPanier() > 0" class="floating-cart" (click)="voirPanier()">
        <div class="cart-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="cart-badge">{{ getNombreProduitsPanier() }}</span>
        </div>
        <div class="cart-details">
          <span class="cart-count">Voir mon panier</span>
          <span class="cart-total">{{ getTotalPanier() | number:'1.0-0' }} Ar</span>
        </div>
      </div>
    </main>

    <!-- ============ FOOTER MODERNE ============ -->
    <footer class="main-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="footer-logo-icon">🛍️</div>
              <span class="footer-brand-text">Tech<em>Store</em></span>
            </div>
            <p class="footer-tagline">Votre destination de confiance pour la technologie. Qualité, prix imbattables et service exceptionnel.</p>
            <div class="social-links">
              <a href="#" class="social-link">Fb</a>
              <a href="#" class="social-link">Ig</a>
              <a href="#" class="social-link">Tw</a>
            </div>
          </div>
          <div class="footer-column">
            <h4 class="footer-heading">Boutique</h4>
            <ul class="footer-links">
              <li><a (click)="ouvrirSectionProduits(null)" class="footer-link">Tous les produits</a></li>
              <li><a (click)="ouvrirSectionProduits(null); appliquerFiltre('nouveautes')" class="footer-link">Nouveautés</a></li>
              <li><a (click)="ouvrirSectionProduits(null); appliquerFiltre('promotions')" class="footer-link">Promotions</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4 class="footer-heading">Aide</h4>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">Centre d'aide</a></li>
              <li><a href="#" class="footer-link">Suivi de commande</a></li>
              <li><a href="#" class="footer-link">Livraison</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 <strong>TechStore</strong>. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

    <!-- Toasts -->
    <div *ngIf="successMessage" class="toast success"><span>✅ {{ successMessage }}</span></div>
    <div *ngIf="errorMessage" class="toast error"><span>❌ {{ errorMessage }}</span></div>
  `,
  styles: [`
    :host {
      --primary: #10b981;
      --primary-dark: #059669;
      --gradient: linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%);
      --dark: #064e3b;
      --text-gray: #6b7280;
      --border: #d1fae5;
      --bg: #f0fdf4;
    }

    .main-content { min-height: 100vh; background: var(--bg); padding-bottom: 5rem; }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }

    /* CAROUSEL */
    .hero-carousel { position: relative; height: 500px; overflow: hidden; background: var(--gradient); border-radius: 0 0 32px 32px; }
    .carousel-slides { display: flex; height: 100%; transition: transform 0.9s ease; }
    .carousel-slide { min-width: 100%; height: 100%; position: relative; }
    .slide-image { width: 100%; height: 100%; object-fit: cover; }
    .slide-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(6, 78, 59, 0.9) 0%, rgba(6, 78, 59, 0.4) 100%); }
    .slide-content { position: absolute; top: 50%; left: 6%; transform: translateY(-50%); color: white; max-width: 500px; z-index: 2; }
    .slide-title { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; }
    .slide-btn { background: white; color: var(--primary-dark); border: none; padding: 1rem 2rem; border-radius: 14px; font-weight: 700; cursor: pointer; }
    .carousel-control { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; color: white; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; }
    .carousel-control.prev { left: 2rem; } .carousel-control.next { right: 2rem; }
    .carousel-indicators { position: absolute; bottom: 2rem; left: 6%; display: flex; gap: 0.5rem; }
    .indicator { width: 30px; height: 6px; border-radius: 99px; border: none; background: rgba(255,255,255,0.4); cursor: pointer; }
    .indicator.active { background: white; width: 50px; }

    /* FILTRES */
    .filters-section { background: white; padding: 1.5rem 0; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
    .filters-grid { display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; align-items: center; }
    .search-input { width: 100%; padding: 0.8rem 1rem; border: 2px solid var(--border); border-radius: 10px; outline: none; }
    .filter-buttons { display: flex; gap: 0.5rem; }
    .filter-btn { background: #f1f5f9; border: 2px solid transparent; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .filter-btn.active { background: var(--gradient); color: white; }

    /* CATÉGORIES */
    .categories-section { padding: 4rem 0; }
    .categories-title { font-size: 2.5rem; font-weight: 800; color: var(--dark); margin-top: 0.5rem; }
    .gradient-text { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; margin-bottom: 3rem; }
    .category-card { border-radius: 20px; overflow: hidden; cursor: pointer; border: none; padding: 0; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left; transition: all 0.3s ease; }
    .category-card:hover { transform: translateY(-5px); }
    .category-image-wrap { height: 200px; position: relative; }
    .category-image { width: 100%; height: 100%; object-fit: cover; }
    .category-info { padding: 1.25rem; }
    .category-name { font-size: 1.2rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem; }
    .category-link { color: var(--primary); font-weight: 700; font-size: 0.85rem; }

    /* BOUTON VOIR TOUS AU MILIEU */
    .show-all-btn-container { text-align: center; }
    .btn-show-all { 
      background: var(--gradient); 
      color: white; 
      border: none; 
      padding: 1.2rem 3rem; 
      border-radius: 50px; 
      font-size: 1.1rem; 
      font-weight: 800; 
      cursor: pointer; 
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .btn-show-all:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4); }

    /* PRODUITS */
    .products-section { padding: 2rem 0 4rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .section-title { font-size: 1.8rem; font-weight: 800; color: var(--dark); }
    .reset-btn { background: white; border: 2px solid var(--border); padding: 0.6rem 1.2rem; border-radius: 10px; cursor: pointer; font-weight: 600; color: var(--text-gray); }
    .reset-btn:hover { border-color: var(--primary); color: var(--primary-dark); }
    
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .product-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid var(--border); transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
    .product-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(16, 185, 129, 0.1); }
    .product-image { height: 220px; }
    .product-img { width: 100%; height: 100%; object-fit: cover; }
    .product-content { padding: 1.25rem; }
    .category-tag { background: rgba(16, 185, 129, 0.1); color: var(--primary-dark); padding: 0.3rem 0.8rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
    .product-title { font-size: 1.1rem; font-weight: 700; margin: 0.5rem 0; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
    .price { color: var(--primary-dark); font-size: 1.3rem; font-weight: 800; }
    
    /* BOUTON AJOUTER (EXACTEMENT COMME VOTRE CAPTURE) */
    .add-cart-btn { 
      background: #10b981; 
      color: white; 
      border: none; 
      padding: 0.6rem 1rem; 
      border-radius: 8px; 
      font-weight: 700; 
      font-size: 0.9rem; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: 0.5rem;
      transition: background 0.3s ease;
    }
    .add-cart-btn:hover:not(:disabled) { background: #059669; }
    .add-cart-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
    .cart-icon { width: 18px; height: 18px; }

    /* PANIER FLOTTANT */
    .floating-cart { position: fixed; bottom: 2rem; right: 2rem; background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; align-items: center; padding: 0.8rem 1.5rem; gap: 1rem; cursor: pointer; z-index: 1000; transition: transform 0.3s ease; border: 1px solid var(--border); }
    .floating-cart:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(16, 185, 129, 0.2); }
    .cart-icon-wrapper { position: relative; width: 45px; height: 45px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
    .cart-icon-wrapper svg { width: 22px; height: 22px; }
    .cart-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; border: 2px solid white; }
    .cart-details { display: flex; flex-direction: column; }
    .cart-count { font-size: 0.8rem; color: var(--text-gray); font-weight: 600; }
    .cart-total { font-size: 1.1rem; font-weight: 800; color: var(--dark); }

    /* FOOTER */
    .main-footer { background: var(--dark); color: white; padding: 4rem 0 2rem; margin-top: auto; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2rem; margin-bottom: 2rem; }
    .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
    .footer-logo-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .footer-brand-text { font-size: 1.5rem; font-weight: 800; }
    .footer-brand-text em { font-style: normal; color: var(--primary-light); }
    .footer-tagline { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; }
    .social-links { display: flex; gap: 10px; }
    .social-link { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; font-weight: 700; transition: background 0.3s ease; }
    .social-link:hover { background: var(--primary); }
    .footer-heading { font-size: 1rem; font-weight: 700; color: var(--primary-light); margin-bottom: 1rem; text-transform: uppercase; }
    .footer-links { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.8rem; }
    .footer-link { color: #94a3b8; text-decoration: none; cursor: pointer; transition: color 0.3s ease; font-size: 0.95rem; }
    .footer-link:hover { color: white; }
    .footer-bottom { text-align: center; color: #64748b; font-size: 0.85rem; }

    .toast { position: fixed; top: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 600; z-index: 10000; color: white; }
    .toast.success { background: #10b981; }
    .toast.error { background: #ef4444; }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideInterval: any;
  slides: any[] = [];
  selectedCategorie: Categorie | null = null;
  categories: Categorie[] = [];
  produits: Produit[] = [];
  allProduits: Produit[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  searchTermNom: string = '';
  searchTermPrix: number = 1000000;
  filtreActif: string = 'tous';
  
  // Variable magique : au début elle est fausse, donc on voit les catégories
  showProductsSection: boolean = false; 

  constructor(
    private http: HttpClient,
    private panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProduits();
    this.loadCategories();
    this.startCarousel();
    this.slides = this.getSlidesCarousel();
  }

  ngOnDestroy() {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  loadCategories(): void {
    this.http.get<Categorie[]>('http://localhost:8080/api/categories').subscribe({
      next: (data) => { this.categories = data || []; },
      error: () => {
        this.categories = [{ id: 1, nom: 'Gaming' }, { id: 2, nom: 'Bureau' }, { id: 3, nom: 'Réseau' }];
      }
    });
  }

  loadProduits(): void {
    this.panierService.getProduitsAvecPromotions().then((produits) => {
      this.allProduits = produits;
      this.produits = [...this.allProduits];
    });
  }

  getCategoryImage(nomCategorie: string): string {
    const prod = this.allProduits.find(p => p.categorie?.nom === nomCategorie);
    if (prod) return this.getSafeImageUrl(prod);
    return 'https://via.placeholder.com/400x200/d1fae5/059669?text=' + nomCategorie;
  }

  getNombreProduitsParCategorie(nomCategorie: string): number {
    return this.allProduits.filter(p => p.categorie?.nom === nomCategorie).length;
  }

  // ===== LOGIQUE D'AFFICHAGE =====
  
  // Quand on clique sur le bouton "Voir tous" ou une catégorie
  ouvrirSectionProduits(categorie: Categorie | null) {
    this.showProductsSection = true;
    
    if (categorie) {
      this.selectedCategorie = categorie;
      this.produits = this.allProduits.filter(p => p.categorie?.nom === categorie.nom);
    } else {
      this.selectedCategorie = null;
      this.produits = [...this.allProduits];
    }

    // On scroll vers le bas pour voir la liste
    setTimeout(() => {
      document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Quand on clique sur "Retour aux catégories"
  fermerSectionProduits() {
    this.showProductsSection = false;
    this.selectedCategorie = null;
    // On scroll vers le haut (les catégories)
    setTimeout(() => {
      document.querySelector('.categories-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // ===== AUTRES FONCTIONS =====
  getSafeImageUrl(produit: Produit): string {
    if (!produit.image) return 'https://via.placeholder.com/300x200/d1fae5/059669?text=TechStore';
    return produit.image;
  }

  onImageError(event: Event, produit: Produit) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300x200/d1fae5/059669?text=Indisponible';
  }

  onCarouselImageError(event: Event, slide: any) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  startCarousel() { this.slideInterval = setInterval(() => this.nextSlide(), 5000); }
  nextSlide() { this.currentSlide = (this.currentSlide + 1) % this.slides.length; }
  previousSlide() { this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length; }
  goToSlide(index: number) { this.currentSlide = index; }

  appliquerFiltre(filtre: string) {
    this.filtreActif = filtre;
    if (filtre === 'nouveautes') this.produits = this.allProduits.filter(p => p.estNouveau);
    else if (filtre === 'promotions') this.produits = this.allProduits.filter(p => p.promotion);
    else this.produits = [...this.allProduits];
  }

  resetFiltres() {
    this.filtreActif = 'tous';
    this.selectedCategorie = null;
    this.produits = [...this.allProduits];
  }

  onCategorieSelected(categorie: Categorie | null) {
    this.ouvrirSectionProduits(categorie);
  }

  getSlidesCarousel(): any[] {
    return [
      { title: 'Gaming & Performance', description: 'Cartes graphiques, processeurs...', image: '/assets/images/carousel/gaming.jpg', categorie: { id: 1, nom: 'Gaming' } },
      { title: 'Bureau Moderne', description: 'Écrans, chaises ergonomiques...', image: '/assets/images/carousel/bureau.jpg', categorie: { id: 2, nom: 'Bureau' } }
    ];
  }

  rechercher() {
    let filtres = [...this.allProduits];
    if (this.searchTermNom.trim()) filtres = filtres.filter(p => p.nom.toLowerCase().includes(this.searchTermNom.trim().toLowerCase()));
    if (this.searchTermPrix !== null && this.searchTermPrix >= 0) filtres = filtres.filter(p => p.prix <= this.searchTermPrix);
    this.produits = filtres;
    this.selectedCategorie = null;
    this.filtreActif = 'tous';
  }

  ajouterAuPanier(produit: Produit) {
    if (produit.stock === 0) {
      this.errorMessage = '❌ Produit en rupture de stock.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.panierService.ajouterAuPanier({ ...produit, quantite: 1 });
    this.successMessage = `✅ "${produit.nom}" ajouté !`;
    setTimeout(() => this.successMessage = '', 3000);
  }

  getTotalPanier(): number { return this.panierService.getPanier().reduce((t, p) => t + (p.prix * (p.quantite || 1)), 0); }
  getNombreProduitsPanier(): number { return this.panierService.getNombreProduits(); }
  voirPanier(): void { this.router.navigate(['panier']); }
}