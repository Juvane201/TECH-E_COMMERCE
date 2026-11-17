import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Categorie {
  id?: number;
  nom: string;
}

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo à gauche -->
        <div class="nav-brand" (click)="goToHome()">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <span class="brand-text">Tech<em>Store</em></span>
        </div>

        <!-- Menu navigation -->
        <div class="nav-menu">
          <a class="nav-link" [routerLink]="['/']" routerLinkActive="active">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Accueil
          </a>

          <!-- Dropdown Catégories -->
          <div class="dropdown">
            <button class="nav-link dropdown-toggle" (click)="toggleCategories()" [class.open]="showCategories">
              <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              Catégories
              <svg class="chevron" [class.rotated]="showCategories" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div class="dropdown-menu" [class.show]="showCategories">
              <button class="dropdown-item" (click)="selectAllProducts()">
                <span class="category-icon">✨</span>
                <span>Tous les produits</span>
              </button>
              <div class="dropdown-divider"></div>
              <button *ngFor="let categorie of categories"
                      class="dropdown-item"
                      (click)="selectCategorie(categorie)">
                <span class="category-icon">🏷️</span>
                <span>{{ categorie.nom }}</span>
                <svg class="item-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <a class="nav-link" [routerLink]="['/contact']" routerLinkActive="active">
            <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Contact
          </a>
        </div>

        <!-- Actions à droite -->
        <div class="nav-actions">
          <!-- Panier -->
          <button class="cart-btn" [routerLink]="['/Panier']" (click)="goToCart()">
            <svg class="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span class="cart-badge" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
          </button>

          <!-- Bouton Connexion -->
          <button class="login-btn" (click)="goToLogin()">
            <svg class="login-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Connexion</span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* Palette : émeraude #0ea5a4 / teal #14b8a6 / corail #f43f5e / encre #0f172a */
    .navbar {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      padding: 0.85rem 2rem;
      box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06), 0 8px 32px rgba(15, 23, 42, 0.06);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(15, 23, 42, 0.04);
      animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1280px;
      margin: 0 auto;
      gap: 2rem;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      font-size: 1.5rem;
      cursor: pointer;
      letter-spacing: -0.03em;
      color: #0f172a;
      transition: transform 0.3s ease;
    }

    .nav-brand:hover { transform: scale(1.03); }

    .brand-text em {
      font-style: normal;
      background: linear-gradient(135deg, #0ea5a4 0%, #14b8a6 50%, #22d3ee 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #0ea5a4 0%, #14b8a6 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(20, 184, 166, 0.35);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .nav-brand:hover .logo-icon {
      transform: rotate(-8deg) scale(1.08);
    }

    .logo-icon svg { width: 22px; height: 22px; color: white; }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex: 1;
      justify-content: flex-start;
      margin-left: 1.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: #475569;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.6rem 1rem;
      border-radius: 10px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #0ea5a4, #22d3ee);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    .nav-link:hover { color: #0ea5a4; background: rgba(20, 184, 166, 0.08); }
    .nav-link:hover::after { width: 60%; }

    .nav-link.active {
      color: #0ea5a4;
      background: rgba(20, 184, 166, 0.1);
    }
    .nav-link.active::after { width: 60%; }

    .nav-icon { width: 18px; height: 18px; }

    /* Dropdown */
    .dropdown { position: relative; }

    .chevron {
      width: 14px; height: 14px;
      transition: transform 0.3s ease;
    }
    .chevron.rotated { transform: rotate(180deg); }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      background: white;
      min-width: 260px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05);
      padding: 0.5rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px) scale(0.97);
      transform-origin: top left;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      text-align: left;
      border-radius: 10px;
      transition: all 0.2s ease;
      cursor: pointer;
      color: #334155;
      font-weight: 500;
      font-size: 0.95rem;
      font-family: inherit;
    }

    .dropdown-item:hover {
      background: linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(34, 211, 238, 0.08));
      color: #0ea5a4;
      transform: translateX(4px);
    }

    .item-arrow {
      width: 14px; height: 14px;
      margin-left: auto;
      opacity: 0;
      transition: all 0.2s ease;
    }
    .dropdown-item:hover .item-arrow { opacity: 1; transform: translateX(2px); }

    .dropdown-divider {
      height: 1px;
      background: rgba(15, 23, 42, 0.06);
      margin: 0.4rem 0.5rem;
    }

    .category-icon { font-size: 1.1rem; }

    /* Actions droite */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .cart-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: rgba(20, 184, 166, 0.1);
      color: #0ea5a4;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }

    .cart-btn:hover {
      background: linear-gradient(135deg, #0ea5a4, #14b8a6);
      color: white;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4);
    }

    .cart-icon { width: 20px; height: 20px; }

    .cart-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: linear-gradient(135deg, #f43f5e, #fb7185);
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.5); }
      50% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
    }

    /* Bouton Connexion moderne */
    .login-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #0ea5a4 0%, #14b8a6 100%);
      color: white;
      border: none;
      padding: 0.7rem 1.4rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 14px rgba(20, 184, 166, 0.35);
      position: relative;
      overflow: hidden;
    }

    .login-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #f43f5e, #fb7185);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .login-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(244, 63, 94, 0.35);
    }

    .login-btn:hover::before { opacity: 1; }

    .login-btn span, .login-btn .login-icon { position: relative; z-index: 1; }

    .login-icon { width: 18px; height: 18px; }

    @media (max-width: 900px) {
      .nav-menu { margin-left: 0.5rem; gap: 0.1rem; }
      .nav-link { padding: 0.5rem 0.7rem; font-size: 0.85rem; }
      .login-btn span { display: none; }
      .login-btn { padding: 0.7rem; }
    }

    @media (max-width: 640px) {
      .navbar { padding: 0.7rem 1rem; }
      .nav-menu { display: none; }
    }
  `]
})
export class HomeHeaderComponent implements OnInit {
  private categorieApiUrl = 'http://localhost:8080/api/categories';

  categories: Categorie[] = [];
  selectedCategorie: Categorie | null = null;
  showCategories: boolean = false;

  @Input() cartItemCount: number = 0;
  @Output() categorieSelected = new EventEmitter<Categorie | null>();
  @Output() viewCart = new EventEmitter<void>();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { this.loadCategories(); }

  goToCart(): void { this.router.navigate(['panier']); }
  goToHome(): void { this.router.navigate(['/']); }
  goToLogin(): void { this.router.navigate(['/login']); }

  loadCategories() {
    this.http.get<Categorie[]>(this.categorieApiUrl).subscribe({
      next: (data) => { this.categories = data; },
      error: (err) => { console.error('Erreur catégories :', err); }
    });
  }

  toggleCategories() { this.showCategories = !this.showCategories; }

  selectAllProducts() {
    this.selectedCategorie = null;
    this.categorieSelected.emit(null);
    this.showCategories = false;
  }

  selectCategorie(categorie: Categorie) {
    this.selectedCategorie = categorie;
    this.categorieSelected.emit(categorie);
    this.showCategories = false;
  }
}