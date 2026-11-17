import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PanierService, Produit } from '../service/panier.service';
import { AuthService, Utilisateur, Commande } from '../service/auth.service';
import { PaiementService } from '../service/paiement.service';
import { PdfService } from '../service/pdf.service';

// Importer Stripe
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="commande-container">
      <!-- Header -->
      <header class="commande-header">
        <div class="container">
          <button class="back-btn" (click)="retourPanier()">
            ← Retour au panier
          </button>
          <h1 class="commande-title">✅ Finaliser la commande</h1>
          <div class="etapes-indicator">
            <div class="etape" [class.active]="etape >= 1" [class.completed]="etape > 1">
              <span class="etape-num">1</span>
              <span class="etape-label">Informations</span>
            </div>
            <div class="etape-separator" [class.active]="etape >= 2"></div>
            <div class="etape" [class.active]="etape >= 2">
              <span class="etape-num">2</span>
              <span class="etape-label">Paiement</span>
            </div>
          </div>
        </div>
      </header>

      <div class="container">
        <!-- Étape 1 : Formulaire utilisateur -->
        <section *ngIf="etape === 1" class="form-section">
          <div class="form-header">
            <h2>📝 Informations personnelles</h2>
            <p>Remplissez vos informations pour procéder au paiement</p>
          </div>

          <!-- Récap panier rapide -->
          <div class="panier-recap" *ngIf="panier.length > 0">
            <h4>📦 Votre panier ({{ getNombreTotalProduits() }} articles)</h4>
            <div class="panier-items">
              <div *ngFor="let item of panier.slice(0, 3)" class="panier-item">
                <img [src]="getSafeImageUrl(item)" [alt]="item.nom" class="item-image">
                <span class="item-name">{{ item.nom }}</span>
                <span class="item-quantity">x{{ item.quantite || 1 }}</span>
                <span class="item-price">{{ (item.prix * (item.quantite || 1)).toFixed(2) }} €</span>
              </div>
              <div *ngIf="panier.length > 3" class="more-items">
                + {{ panier.length - 3 }} autre(s) produit(s)
              </div>
            </div>
            <div class="panier-total">
              <strong>Total panier : {{ getTotalPanier().toFixed(2) }} €</strong>
            </div>
          </div>

          <form [formGroup]="utilisateurForm" (ngSubmit)="soumettreFormulaire()" class="user-form">
            <div class="form-grid">
              <!-- Email -->
              <div class="form-group">
                <label for="email">📧 Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email"
                  placeholder="votre@email.com"
                  [class]="getInputClass('email')"
                  autocomplete="email">
                
                <div *ngIf="utilisateurForm.get('email')?.invalid && utilisateurForm.get('email')?.touched" class="error-message">
                  <span *ngIf="utilisateurForm.get('email')?.errors?.['required']">L'email est obligatoire</span>
                  <span *ngIf="utilisateurForm.get('email')?.errors?.['email']">Format d'email invalide</span>
                </div>
              </div>

              <!-- Nom -->
              <div class="form-group">
                <label for="nom">👤 Nom *</label>
                <input 
                  type="text" 
                  id="nom" 
                  formControlName="nom"
                  placeholder="Votre nom"
                  [class]="getInputClass('nom')"
                  autocomplete="family-name">
                <div *ngIf="utilisateurForm.get('nom')?.invalid && utilisateurForm.get('nom')?.touched" class="error-message">
                  ❌ Le nom est obligatoire
                </div>
              </div>

              <!-- Prénom -->
              <div class="form-group">
                <label for="prenom">👤 Prénom *</label>
                <input 
                  type="text" 
                  id="prenom" 
                  formControlName="prenom"
                  placeholder="Votre prénom"
                  [class]="getInputClass('prenom')"
                  autocomplete="given-name">
                <div *ngIf="utilisateurForm.get('prenom')?.invalid && utilisateurForm.get('prenom')?.touched" class="error-message">
                  ❌ Le prénom est obligatoire
                </div>
              </div>

              <!-- Téléphone -->
              <div class="form-group">
                <label for="telephone">📞 Téléphone</label>
                <input 
                  type="tel" 
                  id="telephone" 
                  formControlName="telephone"
                  placeholder="+33 1 23 45 67 89"
                  autocomplete="tel">
              </div>

              <!-- Adresse -->
              <div class="form-group full-width">
                <label for="adresse">🏠 Adresse *</label>
                <input 
                  type="text" 
                  id="adresse" 
                  formControlName="adresse"
                  placeholder="123 Avenue du Commerce"
                  [class]="getInputClass('adresse')"
                  autocomplete="street-address">
                <div *ngIf="utilisateurForm.get('adresse')?.invalid && utilisateurForm.get('adresse')?.touched" class="error-message">
                  ❌ L'adresse est obligatoire
                </div>
              </div>

              <!-- Ville -->
              <div class="form-group">
                <label for="ville">🏙️ Ville *</label>
                <input 
                  type="text" 
                  id="ville" 
                  formControlName="ville"
                  placeholder="Paris"
                  [class]="getInputClass('ville')"
                  autocomplete="address-level2">
                <div *ngIf="utilisateurForm.get('ville')?.invalid && utilisateurForm.get('ville')?.touched" class="error-message">
                  ❌ La ville est obligatoire
                </div>
              </div>

              <!-- Code Postal -->
              <div class="form-group">
                <label for="codePostal">📮 Code Postal *</label>
                <input 
                  type="text" 
                  id="codePostal" 
                  formControlName="codePostal"
                  placeholder="75001"
                  maxlength="5"
                  [class]="getInputClass('codePostal')"
                  autocomplete="postal-code">
                <div *ngIf="utilisateurForm.get('codePostal')?.invalid && utilisateurForm.get('codePostal')?.touched" class="error-message">
                  <span *ngIf="utilisateurForm.get('codePostal')?.errors?.['required']">❌ Le code postal est obligatoire</span>
                  <span *ngIf="utilisateurForm.get('codePostal')?.errors?.['pattern']">❌ Le code postal doit contenir 5 chiffres</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="retourPanier()">
                ← Retour au panier
              </button>
              <button 
                type="submit" 
                class="btn-primary"
                [disabled]="!utilisateurForm.valid || envoiEnCours">
                <span *ngIf="!envoiEnCours">
                  💳 Procéder au paiement
                </span>
                <span *ngIf="envoiEnCours" class="loading">
                  <div class="spinner"></div>
                  Chargement...
                </span>
              </button>
            </div>
          </form>
        </section>

        <!-- Étape 2 : Paiement -->
        <section *ngIf="etape === 2" class="paiement-section">
          <div class="confirmation-header">
            <div class="success-icon">✅</div>
            <h2>💳 Paiement</h2>
            <p>Vos informations ont été enregistrées. Procédez au paiement :</p>
          </div>

          <div class="recap-grid">
            <!-- Informations utilisateur -->
            <div class="recap-card">
              <h3>👤 Informations personnelles</h3>
              <div class="recap-info">
                <p><strong>Nom :</strong> {{ utilisateur?.prenom }} {{ utilisateur?.nom }}</p>
                <p><strong>Email :</strong> {{ utilisateur?.email }}</p>
                <p><strong>Téléphone :</strong> {{ utilisateur?.telephone || 'Non renseigné' }}</p>
                <p><strong>Adresse :</strong> {{ utilisateur?.adresse }}, {{ utilisateur?.codePostal }} {{ utilisateur?.ville }}</p>
              </div>
              <button class="btn-small" (click)="modifierInformations()">Modifier</button>
            </div>

            <!-- Récapitulatif commande -->
            <div class="recap-card">
              <h3>📦 Votre commande</h3>
              <div class="commande-items">
                <div *ngFor="let item of panier" class="commande-item">
                  <div class="item-details">
                    <img [src]="getSafeImageUrl(item)" [alt]="item.nom" class="item-image-small">
                    <div class="item-info">
                      <span class="item-name">{{ item.nom }}</span>
                      <span class="item-quantity">Quantité: {{ item.quantite || 1 }}</span>
                    </div>
                  </div>
                  <span class="item-price">{{ ((item.prix || 0) * (item.quantite || 1)).toFixed(2) }} €</span>
                </div>
              </div>
              <div class="commande-total">
                <div class="total-line">
                  <span>Sous-total :</span>
                  <span>{{ getTotalPanier().toFixed(2) }} €</span>
                </div>
                <div class="total-line" *ngIf="optionLivraison === 'express'">
                  <span>Livraison express :</span>
                  <span>+ 9.99 €</span>
                </div>
                <div class="total-line final">
                  <strong>Total :</strong>
                  <strong>{{ getTotalAvecLivraison().toFixed(2) }} €</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Options de livraison -->
          <div class="livraison-section">
            <h3>🚚 Options de livraison</h3>
            <div class="livraison-options">
              <label class="livraison-option" [class.selected]="optionLivraison === 'standard'">
                <input 
                  type="radio" 
                  name="livraison" 
                  value="standard" 
                  [(ngModel)]="optionLivraison"
                  (change)="onLivraisonChange()">
                <div class="option-content">
                  <span class="option-title">Livraison standard</span>
                  <span class="option-delai">3-5 jours ouvrables</span>
                  <span class="option-prix">Gratuite</span>
                </div>
              </label>
              
              <label class="livraison-option" [class.selected]="optionLivraison === 'express'">
                <input 
                  type="radio" 
                  name="livraison" 
                  value="express" 
                  [(ngModel)]="optionLivraison"
                  (change)="onLivraisonChange()">
                <div class="option-content">
                  <span class="option-title">Livraison express</span>
                  <span class="option-delai">24-48h</span>
                  <span class="option-prix">+ 9.99 €</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Méthodes de paiement -->
          <div class="paiement-method-section">
            <h3>💳 Méthode de paiement</h3>
            <div class="paiement-options">
              <label class="paiement-option" [class.selected]="methodePaiement === 'stripe'">
                <input 
                  type="radio" 
                  name="paiement" 
                  value="stripe" 
                  [(ngModel)]="methodePaiement"
                  checked>
                <div class="option-content">
                  <span class="option-title">💳 Carte bancaire (Stripe)</span>
                  <div class="cartes-acceptees">
                    <span class="carte-icon" title="Visa">💳</span>
                    <span class="carte-icon" title="Mastercard">🔵</span>
                    <span class="carte-icon" title="American Express">🟡</span>
                  </div>
                </div>
              </label>
            </div>

            <!-- Informations de sécurité -->
            <div class="security-info">
              <div class="security-badge">
                <span class="lock-icon">🔒</span>
                <span>Paiement 100% sécurisé</span>
              </div>
            </div>
          </div>

          <!-- Bouton de paiement -->
          <div class="final-confirmation">
            <div class="total-final">
              <span class="total-label">Montant à payer :</span>
              <span class="total-amount">{{ getTotalAvecLivraison().toFixed(2) }} MGA</span>
            </div>
            
            <button 
              class="btn-success btn-large btn-payment"
              (click)="procederAuPaiement()"
              [disabled]="paiementEnCours">
              <span *ngIf="!paiementEnCours">
                <span class="payment-icon">💳</span>
                Payer {{ getTotalAvecLivraison().toFixed(2) }} MGA
              </span>
              <span *ngIf="paiementEnCours" class="loading">
                <div class="spinner"></div>
                Redirection vers le paiement...
              </span>
            </button>
            
          </div>
        </section>

        <!-- Étape 3 : Confirmation finale -->
        <section *ngIf="etape === 3" class="success-section">
          <div class="success-content">
            <div class="success-animation">🎊</div>
            <h2>Commande confirmée !</h2>
            <p class="success-message">
              Votre commande <strong class="order-number">{{ commande?.numeroCommande }}</strong> a été passée avec succès.
            </p>

             <div class="facture-info" *ngIf="commande">
                <p class="facture-message">✅ Votre facture a été téléchargée automatiquement</p>
                <button class="btn-download" (click)="telechargerFacture()">
                   📄 Télécharger à nouveau la facture
                </button>
                </div>
            
            <div class="commande-details">
              <div class="detail-item">
                <span class="detail-label">📧 Email de confirmation :</span>
                <span class="detail-value">{{ utilisateur?.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">📦 Nombre d'articles :</span>
                <span class="detail-value">{{ getNombreTotalProduits() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">💰 Montant total :</span>
                <span class="detail-value">{{ commande?.total?.toFixed(2) }} MGA</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">🚚 Livraison :</span>
                <span class="detail-value">{{ getLivraisonText() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">📅 Date estimée :</span>
                <span class="detail-value">{{ getDateLivraisonEstimee() }}</span>
              </div>
            </div>

            <div class="success-actions">
              <button class="btn-primary" (click)="retourAccueil()">
                🏠 Retour à l'accueil
              </button>
              <button class="btn-secondary" (click)="voirCommandes()">
                📋 Voir mes commandes
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Messages toast -->
      <div *ngIf="message" class="toast" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
        <span class="toast-icon">{{ messageType === 'success' ? '✅' : '❌' }}</span>
        <span>{{ message }}</span>
        <button class="toast-close" (click)="message = ''">×</button>
      </div>
    </div>
  `,
 styles: [`
  /* ============================================================
     COMMANDE COMPONENT — THÈME ÉMERAUDE / TEAL
     ============================================================ */

  :host {
    --primary: #10b981;
    --primary-dark: #059669;
    --primary-light: #34d399;
    --accent: #0d9488;
    --gradient: linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%);
    --gradient-hover: linear-gradient(135deg, #34d399 0%, #10b981 50%, #0d9488 100%);
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --dark: #064e3b;
    --text-dark: #1f2937;
    --text-gray: #6b7280;
    --border: #d1fae5;
    --light: #f0fdf4;
    --radius: 16px;
    --shadow-sm: 0 2px 8px rgba(16, 185, 129, 0.08);
    --shadow-md: 0 8px 24px rgba(16, 185, 129, 0.15);
    --shadow-lg: 0 20px 50px rgba(16, 185, 129, 0.25);
    --transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: block;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .commande-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f0fdfa 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* ============ HEADER ============ */
  .commande-header {
    background: white;
    box-shadow: var(--shadow-sm);
    padding: 2rem 0 1.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }

  .commande-header::before {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 240px;
    height: 240px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
    border-radius: 50%;
    animation: floatBlob 12s ease-in-out infinite;
  }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, -20px) scale(1.15); }
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--primary-dark);
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    padding: 0.5rem 0;
    transition: var(--transition);
    position: relative;
  }

  .back-btn:hover {
    color: var(--primary);
    transform: translateX(-4px);
  }

  .commande-title {
    font-size: 2.2rem;
    font-weight: 800;
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 1rem 0;
    text-align: center;
    letter-spacing: -0.02em;
    animation: fadeInUp 0.6s ease;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ============ ÉTAPES INDICATOR ============ */
  .etapes-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2rem 0 1rem;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .etape {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border-radius: 14px;
    background: #f8fafc;
    border: 2px solid var(--border);
    min-width: 110px;
    transition: var(--transition);
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-gray);
  }

  .etape-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e5e7eb;
    color: var(--text-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    transition: var(--transition);
  }

  .etape.active {
    background: rgba(16, 185, 129, 0.08);
    color: var(--primary-dark);
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  .etape.active .etape-num {
    background: var(--gradient);
    color: white;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
  }

  .etape.completed {
    background: var(--gradient);
    color: white;
    border-color: transparent;
    box-shadow: var(--shadow-md);
  }

  .etape.completed .etape-num {
    background: white;
    color: var(--primary-dark);
  }

  .etape-separator {
    width: 40px;
    height: 2px;
    background: var(--border);
    border-radius: 2px;
    transition: var(--transition);
  }

  .etape-separator.active {
    background: var(--gradient);
  }

  /* ============ FORM / PAIEMENT / SUCCESS SECTIONS ============ */
  .form-section,
  .paiement-section,
  .success-section {
    background: white;
    border-radius: var(--radius);
    padding: 2.5rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border);
    animation: cardSlideIn 0.5s ease both;
  }

  @keyframes cardSlideIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .form-header {
    margin-bottom: 1.5rem;
  }

  .form-header h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--dark);
    margin: 0 0 0.5rem 0;
    position: relative;
    padding-left: 14px;
  }

  .form-header h2::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 70%;
    background: var(--gradient);
    border-radius: 4px;
  }

  .form-header p {
    color: var(--text-gray);
    font-size: 0.95rem;
    margin: 0;
  }

  /* ============ RÉCAP PANIER ============ */
  .panier-recap {
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
  }

  .panier-recap h4 {
    margin: 0 0 1rem 0;
    color: var(--primary-dark);
    font-size: 1rem;
    font-weight: 700;
  }

  .panier-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .panier-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px dashed rgba(16, 185, 129, 0.2);
  }

  .panier-item:last-child {
    border-bottom: none;
  }

  .item-image {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .item-name {
    flex: 1;
    font-weight: 600;
    color: var(--text-dark);
    font-size: 0.9rem;
  }

  .item-quantity {
    font-size: 0.85rem;
    color: var(--text-gray);
    font-weight: 600;
  }

  .item-price {
    font-weight: 800;
    color: var(--primary-dark);
    font-size: 0.95rem;
  }

  .more-items {
    font-size: 0.85rem;
    color: var(--text-gray);
    font-style: italic;
    padding: 0.5rem 0;
  }

  .panier-total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid rgba(16, 185, 129, 0.2);
    text-align: right;
    color: var(--primary-dark);
    font-size: 1rem;
  }

  /* ============ FORMULAIRE ============ */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 0.5rem;
    font-size: 0.88rem;
  }

  .form-group input {
    padding: 0.85rem 1rem;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 0.95rem;
    width: 100%;
    transition: var(--transition);
    background: white;
    color: var(--text-dark);
    font-family: inherit;
  }

  .form-group input::placeholder {
    color: #9ca3af;
  }

  .form-group input:hover {
    border-color: var(--primary-light);
  }

  .form-group input:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    transform: translateY(-1px);
  }

  .form-group input.valid {
    border-color: var(--success);
  }

  .form-group input.invalid {
    border-color: var(--danger);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .error-message {
    color: var(--danger);
    font-size: 0.82rem;
    margin-top: 0.4rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* ============ ACTIONS ============ */
  .form-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid var(--border);
  }

  .btn-primary,
  .btn-secondary,
  .btn-success {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-primary {
    background: var(--gradient);
    color: white;
    box-shadow: var(--shadow-md);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--shadow-lg);
    background: var(--gradient-hover);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-secondary {
    background: white;
    color: var(--text-gray);
    border: 2px solid var(--border);
  }

  .btn-secondary:hover {
    border-color: var(--text-gray);
    color: var(--text-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  .btn-success {
    background: var(--gradient);
    color: white;
    box-shadow: var(--shadow-md);
  }

  .btn-success:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--shadow-lg);
    background: var(--gradient-hover);
  }

  .btn-large {
    padding: 1.25rem 3rem;
    font-size: 1.05rem;
  }

  .btn-payment {
    width: 100%;
    justify-content: center;
  }

  .btn-small {
    background: rgba(16, 185, 129, 0.1);
    color: var(--primary-dark);
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: var(--transition);
    margin-top: 1rem;
  }

  .btn-small:hover {
    background: var(--gradient);
    color: white;
    transform: translateY(-2px);
  }

  /* ============ LOADING ============ */
  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ============ CONFIRMATION / RÉCAP ÉTAPE 2 ============ */
  .confirmation-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .success-icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    animation: bounceIn 0.6s ease;
  }

  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); }
  }

  .confirmation-header h2 {
    font-size: 1.75rem;
    color: var(--dark);
    margin: 0 0 0.5rem 0;
    font-weight: 800;
  }

  .confirmation-header p {
    color: var(--text-gray);
    margin: 0;
    font-size: 1rem;
  }

  .recap-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .recap-card {
    background: rgba(16, 185, 129, 0.04);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    transition: var(--transition);
  }

  .recap-card:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--primary-light);
  }

  .recap-card h3 {
    font-size: 1.1rem;
    color: var(--dark);
    margin: 0 0 1rem 0;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .recap-info p {
    margin: 0.5rem 0;
    color: var(--text-dark);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .recap-info strong {
    color: var(--primary-dark);
    font-weight: 700;
  }

  .commande-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .commande-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: white;
    border-radius: 10px;
    border: 1px solid var(--border);
    transition: var(--transition);
  }

  .commande-item:hover {
    border-color: var(--primary-light);
    box-shadow: var(--shadow-sm);
  }

  .item-details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .item-image-small {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .item-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .item-info .item-name {
    font-weight: 700;
    color: var(--text-dark);
    font-size: 0.88rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-info .item-quantity {
    font-size: 0.78rem;
    color: var(--text-gray);
    font-weight: 500;
  }

  .commande-item .item-price {
    font-weight: 800;
    color: var(--primary-dark);
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .commande-total {
    border-top: 2px solid var(--border);
    padding-top: 1rem;
    margin-top: 1rem;
  }

  .total-line {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    font-size: 0.9rem;
    color: var(--text-dark);
  }

  .total-line.final {
    font-size: 1.1rem;
    color: var(--primary-dark);
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border);
  }

  /* ============ LIVRAISON ============ */
  .livraison-section,
  .paiement-method-section {
    margin-bottom: 2rem;
  }

  .livraison-section h3,
  .paiement-method-section h3 {
    font-size: 1.15rem;
    color: var(--dark);
    margin: 0 0 1rem 0;
    font-weight: 800;
    position: relative;
    padding-left: 14px;
  }

  .livraison-section h3::before,
  .paiement-method-section h3::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 70%;
    background: var(--gradient);
    border-radius: 4px;
  }

  .livraison-options,
  .paiement-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .paiement-options {
    grid-template-columns: 1fr;
  }

  .livraison-option,
  .paiement-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: white;
    border: 2px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    transition: var(--transition);
  }

  .livraison-option:hover,
  .paiement-option:hover {
    border-color: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  .livraison-option.selected,
  .paiement-option.selected {
    border-color: var(--primary);
    background: rgba(16, 185, 129, 0.06);
    box-shadow: var(--shadow-sm);
  }

  .livraison-option input[type="radio"],
  .paiement-option input[type="radio"] {
    accent-color: var(--primary);
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .option-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .option-title {
    font-weight: 700;
    color: var(--text-dark);
    font-size: 0.95rem;
  }

  .option-delai {
    font-size: 0.82rem;
    color: var(--text-gray);
  }

  .option-prix {
    font-weight: 800;
    color: var(--primary-dark);
    font-size: 0.88rem;
  }

  .cartes-acceptees {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .carte-icon {
    font-size: 1.5rem;
  }

  /* ============ SÉCURITÉ ============ */
  .security-info {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
  }

  .security-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: 999px;
    color: var(--primary-dark);
    font-weight: 600;
    font-size: 0.85rem;
  }

  .lock-icon {
    font-size: 1rem;
  }

  /* ============ CONFIRMATION FINALE ============ */
  .final-confirmation {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .total-final {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%);
    border-radius: 12px;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .total-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-dark);
  }

  .total-amount {
    font-size: 1.75rem;
    font-weight: 800;
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .payment-icon {
    font-size: 1.15rem;
  }

  /* ============ SUCCESS SECTION ============ */
  .success-content {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
    animation: fadeInUp 0.6s ease;
  }

  .success-animation {
    font-size: 5rem;
    margin-bottom: 1rem;
    animation: bounceIn 0.8s ease;
  }

  .success-section h2 {
    font-size: 2rem;
    font-weight: 800;
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 1rem 0;
  }

  .success-message {
    color: var(--text-gray);
    font-size: 1.05rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .order-number {
    color: var(--primary-dark);
    font-weight: 800;
    background: rgba(16, 185, 129, 0.1);
    padding: 2px 10px;
    border-radius: 6px;
  }

  .facture-info {
    background: rgba(16, 185, 129, 0.06);
    border: 2px solid rgba(16, 185, 129, 0.25);
    border-radius: 14px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: center;
  }

  .facture-message {
    color: var(--primary-dark);
    font-weight: 700;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .btn-download {
    background: var(--gradient);
    color: white;
    border: none;
    padding: 0.85rem 1.75rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.92rem;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: var(--shadow-md);
  }

  .btn-download:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: var(--shadow-lg);
    background: var(--gradient-hover);
  }

  .commande-details {
    background: rgba(16, 185, 129, 0.04);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: left;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px dashed rgba(16, 185, 129, 0.2);
    font-size: 0.92rem;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: var(--text-gray);
    font-weight: 600;
  }

  .detail-value {
    color: var(--dark);
    font-weight: 800;
  }

  .success-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  /* ============ TOAST ============ */
  .toast {
    position: fixed;
    top: 24px;
    right: 24px;
    min-width: 320px;
    max-width: 420px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.92rem;
    z-index: 10000;
    box-shadow: var(--shadow-lg);
    animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    backdrop-filter: blur(10px);
  }

  @keyframes slideInRight {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .toast.success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: var(--dark);
    border: 1px solid var(--primary-light);
  }

  .toast.error {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .toast-icon {
    font-size: 1.1rem;
  }

  .toast-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.4rem;
    font-weight: 700;
    cursor: pointer;
    margin-left: auto;
    opacity: 0.7;
    transition: var(--transition);
    padding: 0;
    line-height: 1;
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }

  .toast-close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
    transform: scale(1.1);
  }

  /* ============ SCROLLBAR ============ */
  .commande-items::-webkit-scrollbar {
    width: 6px;
  }

  .commande-items::-webkit-scrollbar-track {
    background: transparent;
  }

  .commande-items::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.3);
    border-radius: 10px;
  }

  .commande-items::-webkit-scrollbar-thumb:hover {
    background: rgba(16, 185, 129, 0.5);
  }

  /* ============ RESPONSIVE ============ */
  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .recap-grid {
      grid-template-columns: 1fr;
    }

    .livraison-options {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-section,
    .paiement-section,
    .success-section {
      padding: 1.75rem 1.25rem;
    }

    .commande-title {
      font-size: 1.6rem;
    }

    .etape {
      min-width: 90px;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
    }

    .etape-separator {
      width: 20px;
    }

    .toast {
      left: 16px;
      right: 16px;
      min-width: auto;
    }

    .total-final {
      flex-direction: column;
      gap: 0.75rem;
      text-align: center;
    }

    .detail-item {
      flex-direction: column;
      gap: 4px;
    }
  }
`]
})
export class CommandeComponent implements OnInit, OnDestroy {
  etape = 1;
  panier: Produit[] = [];
  utilisateur: Utilisateur | null = null;
  commande: Commande | null = null;

  utilisateurForm!: FormGroup;
  
  // Paiement
  methodePaiement = 'stripe';
  paiementEnCours = false;
  stripe: any;

  // États
  envoiEnCours = false;
  optionLivraison = 'standard';

  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private panierService: PanierService,
    private authService: AuthService,
    private router: Router,
      private pdfService: PdfService,

    private paiementService: PaiementService,

    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.initialiserFormulaire();
    this.chargerPanier();
    await this.initialiserStripe();
  }

  ngOnDestroy() {
    // Nettoyage si nécessaire
  }

  private initialiserFormulaire() {
    this.utilisateurForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: [''],
      adresse: ['', [Validators.required, Validators.minLength(5)]],
      ville: ['', [Validators.required, Validators.minLength(2)]],
      codePostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    // Restaurer les données sauvegardées
    this.restaurerDonneesUtilisateur();
  }

  private restaurerDonneesUtilisateur() {
    const utilisateurSauvegarde = localStorage.getItem('techstore_utilisateur_form');
    if (utilisateurSauvegarde) {
      try {
        const formData = JSON.parse(utilisateurSauvegarde);
        this.utilisateurForm.patchValue(formData);
      } catch (error) {
        console.error('Erreur restauration formulaire:', error);
      }
    }

    // Sauvegarder à chaque changement
    this.utilisateurForm.valueChanges.subscribe(value => {
      localStorage.setItem('techstore_utilisateur_form', JSON.stringify(value));
    });
  }

  private async initialiserStripe() {
    try {
      // Utiliser votre clé publique Stripe
      this.stripe = await loadStripe('pk_test_votre_cle_publique_ici');
      console.log('✅ Stripe initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation Stripe:', error);
    }
  }

  // ÉTAPE 1 : Soumettre le formulaire et aller au paiement
  async soumettreFormulaire() {
    if (!this.utilisateurForm.valid) {
      this.utilisateurForm.markAllAsTouched();
      this.afficherMessage('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }

    this.envoiEnCours = true;
    const formValue = this.utilisateurForm.value;

    // Créer l'utilisateur
    this.utilisateur = {
      email: formValue.email,
      nom: formValue.nom,
      prenom: formValue.prenom,
      telephone: formValue.telephone,
      adresse: formValue.adresse,
      ville: formValue.ville,
      codePostal: formValue.codePostal
    };

    try {
      // Aller directement à l'étape paiement
      this.etape = 2;
      this.afficherMessage('Informations enregistrées. Procédez au paiement.', 'success');
      
      // Nettoyer le formulaire sauvegardé
      localStorage.removeItem('techstore_utilisateur_form');
    } catch (error: any) {
      this.afficherMessage('Erreur: ' + error.message, 'error');
    } finally {
      this.envoiEnCours = false;
    }
  }

  // ÉTAPE 2 : Paiement
    async procederAuPaiement() {
    if (!this.utilisateur) {
      this.afficherMessage('Erreur: Utilisateur non trouvé', 'error');
      return;
    }

    this.paiementEnCours = true;

    try {
      // Créer la commande
      const commande: Commande = {
        utilisateur: this.utilisateur,
        produits: this.panier,
        total: this.getTotalAvecLivraison(),
        optionLivraison: this.optionLivraison,
        statut: 'en_attente_paiement'
      };

      if (this.methodePaiement === 'stripe' && this.stripe) {
        // Paiement Stripe
        const result = await this.authService.creerSessionPaiement(commande);
        
        if (result.success && result.sessionId) {
          // Rediriger vers Stripe Checkout
          const stripeResult = await this.stripe.redirectToCheckout({
            sessionId: result.sessionId
          });

          if (stripeResult.error) {
            throw new Error(stripeResult.error.message);
          }
        } else {
          throw new Error(result.message);
        }
      } else {
        // Paiement simulé pour le développement
        await this.simulerPaiementReussi(commande);
      }
    } catch (error: any) {
      console.error('Erreur paiement:', error);
      this.afficherMessage('Erreur lors du paiement: ' + error.message, 'error');
    } finally {
      this.paiementEnCours = false;
    }
  }

  //SIMULATION DE PAYMENT
// Dans commande.component.ts - MODIFIER simulerPaiementReussi
// Dans commande.component.ts - MODIFIER simulerPaiementReussi
private async simulerPaiementReussi(commande: Commande) {
  console.log('💰 Début processus commande...');
  
  this.afficherMessage('Traitement en cours...', 'success');
  
  try {
    // 1. Confirmer la commande (ça fonctionne ✅)
    const resultCommande = await this.authService.confirmerCommande(commande);
    
    if (resultCommande.success && resultCommande.commande) {
      this.commande = resultCommande.commande;
      
      console.log('✅ Commande créée:', this.commande.numeroCommande);
      
      // 2. Essayer le traitement paiement (optionnel - ignorer les erreurs)
      console.log('🔄 Tentative traitement paiement...');
      try {
        const resultPaiement = await this.paiementService.traiterPaiementReussi(
          this.commande.numeroCommande!,
          this.methodePaiement
        ).toPromise();
        
        if (resultPaiement?.success) {
          console.log('✅ Paiement traité avec succès');
        } else {
          console.warn('⚠️ Paiement non traité, continuation...');
        }
      } catch (paiementError) {
        console.warn('⚠️ Erreur traitement paiement ignorée, continuation...');
        // On continue même si le paiement échoue
      }

      // 3. Générer la facture
      console.log('🔄 Génération facture...');
      await this.genererEtTelechargerFacture();
      
      // 4. Finaliser
      this.etape = 3;
      this.panierService.viderPanier();
      this.panier = [];
      
      this.afficherMessage('✅ Commande confirmée! Facture téléchargée.', 'success');
      
      console.log('🎉 Processus commande terminé avec succès!');
    } else {
      throw new Error(resultCommande.message);
    }
  } catch (error: any) {
    console.error('💥 Erreur processus commande:', error);
    this.afficherMessage('Erreur: ' + error.message, 'error');
  }
}
//TELECHARGEMENT PDF
private async genererEtTelechargerFacture() {
  if (!this.commande || !this.utilisateur) {
    console.error('Données manquantes pour générer la facture');
    return;
  }

  try {
    this.afficherMessage('Génération de votre facture...', 'success');
    
    // Générer le PDF
    const pdfBlob = await this.pdfService.genererFacture(this.commande, this.utilisateur);
    
    // Télécharger automatiquement
    const nomFichier = `facture-${this.commande.numeroCommande}.pdf`;
    this.pdfService.telechargerPDF(pdfBlob, nomFichier);
    
    console.log('✅ Facture générée et téléchargée:', nomFichier);
    
  } catch (error) {
    console.error('❌ Erreur génération facture:', error);
    this.afficherMessage('Erreur lors de la génération de la facture', 'error');
  }
}
  //TELECHAREMENT MANUEL DE FACTURE
  async telechargerFacture() {
  if (!this.commande || !this.utilisateur) {
    this.afficherMessage('Impossible de générer la facture', 'error');
    return;
  }

  try {
    this.afficherMessage('Regénération de votre facture...', 'success');
    
    const pdfBlob = await this.pdfService.genererFacture(this.commande, this.utilisateur);
    const nomFichier = `facture-${this.commande.numeroCommande}.pdf`;
    this.pdfService.telechargerPDF(pdfBlob, nomFichier);
    
  } catch (error) {
    console.error('Erreur téléchargement facture:', error);
    this.afficherMessage('Erreur lors du téléchargement', 'error');
  }
}

  chargerPanier() {
    this.panier = this.panierService.getPanier();
    if (this.panier.length === 0) {
      this.afficherMessage('Votre panier est vide', 'error');
      setTimeout(() => this.retourPanier(), 2000);
    }
  }

  getSafeImageUrl(produit: Produit): string {
    if (!produit.image) {
      return 'https://via.placeholder.com/100x100/cccccc/969696?text=Image+non+disponible';
    }
    return produit.image;
  }

  getTotalPanier(): number {
    return this.panier.reduce((total: number, item: Produit) => {
      return total + (item.prix * (item.quantite || 1));
    }, 0);
  }

  getTotalAvecLivraison(): number {
    const totalPanier = this.getTotalPanier();
    return this.optionLivraison === 'express' ? totalPanier + 9.99 : totalPanier;
  }

  getNombreTotalProduits(): number {
    return this.panier.reduce((total: number, item: Produit) => {
      return total + (item.quantite || 1);
    }, 0);
  }

  getLivraisonText(): string {
    return this.optionLivraison === 'express' ? 'Express (24-48h)' : 'Standard (3-5 jours)';
  }

  getDateLivraisonEstimee(): string {
    const aujourdhui = new Date();
    const joursAjouter = this.optionLivraison === 'express' ? 2 : 5;
    const dateLivraison = new Date(aujourdhui.setDate(aujourdhui.getDate() + joursAjouter));
    
    return dateLivraison.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Classes CSS dynamiques
  getInputClass(champ: string): string {
    const control = this.utilisateurForm.get(champ);
    if (!control) return 'form-control';
    
    if (control.valid && control.touched) return 'form-control valid';
    if (control.invalid && control.touched) return 'form-control invalid';
    return 'form-control';
  }

  // Événements
  onLivraisonChange() {
    // Recalcul automatique via les getters
  }

  modifierInformations() {
    this.etape = 1;
    this.afficherMessage('Vous pouvez modifier vos informations', 'info');
  }

  // Navigation
  retourPanier() { 
    this.router.navigate(['/Panier']); 
  }
  
  retourAccueil() { 
    this.router.navigate(['/']); 
  }
  
  voirCommandes() { 
    this.router.navigate(['/commandes']); 
  }

  // Messages
  private afficherMessage(text: string, type: 'success' | 'error' | 'info' = 'success') {
    this.message = text;
    this.messageType = type as any;
    
    setTimeout(() => {
      if (this.message === text) {
        this.message = '';
      }
    }, 5000);
  }
}