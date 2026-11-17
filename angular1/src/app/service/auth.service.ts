import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

export interface Utilisateur {
  id?: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  ville: string;
  codePostal: string;
  estVerifie?: boolean;
  codeVerification?: string;
}

export interface LigneCommande {
  produitId: number;
  nomProduit: string;
  prixUnitaire: number;
  quantite: number;
  sousTotal: number;
}

export interface Commande {
  id?: number;
  utilisateur: Utilisateur;
  produits: any[];
  total: number;
  dateCommande?: Date;
  statut: string;
  numeroCommande?: string;
  optionLivraison?: string;
  fraisLivraison?: number;
  lignesCommande?: LigneCommande[]; // AJOUTÉ
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  estVerifie?: boolean;
}

export interface CommandeResponse {
  success: boolean;
  message: string;
  commande?: Commande;
}

export interface PaiementResponse {
  success: boolean;
  sessionId?: string;
  message: string;
}

export interface EmailExisteResponse {
  exists: boolean;
}

export interface AuthResponse {
  message: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private utilisateurSubject = new BehaviorSubject<Utilisateur | null>(null);
  private commandeSubject = new BehaviorSubject<Commande | null>(null);
  
  constructor(private http: HttpClient) {
    this.chargerUtilisateurLocalStorage();
  }

  // ✅ Vérifier si l'email existe (pour vérification en temps réel)
  async emailExiste(email: string): Promise<boolean> {
    if (!email || email.length < 3) {
      return false;
    }

    try {
      const response = await this.http.get<EmailExisteResponse>(
        `${this.apiUrl}/utilisateurs/email-existe/${encodeURIComponent(email)}`
      ).pipe(
        timeout(5000),
        catchError(error => {
          console.warn('Erreur vérification email, utilisation fallback:', error);
          return of({ exists: false });
        })
      ).toPromise();

      return response?.exists || false;
    } catch (error) {
      console.error('Erreur vérification email:', error);
      
      // Fallback: vérification locale en cas d'erreur serveur
      try {
        const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
        return utilisateurs.some((u: any) => u.email === email);
      } catch {
        return false;
      }
    }
  }

  // ✅ Enregistrer un utilisateur et envoyer le code de vérification
  async enregistrerUtilisateur(utilisateur: Utilisateur): Promise<AuthResponse> {
    try {
      const response = await this.http.post<VerificationResponse>(
        `${this.apiUrl}/verification/enregistrer`, 
        utilisateur
      ).pipe(
        timeout(10000),
        catchError(error => {
          console.error('Erreur enregistrement:', error);
          throw error;
        })
      ).toPromise();

      if (response?.success) {
        // Sauvegarder l'utilisateur localement
        this.utilisateurSubject.next(utilisateur);
        this.sauvegarderUtilisateurLocalStorage(utilisateur);
        
        return { 
          message: response.message 
        };
      } else {
        return { 
          message: response?.message || 'Erreur inconnue lors de l\'enregistrement' 
        };
      }
    } catch (error: any) {
      console.error('Erreur enregistrement:', error);
      return { 
        message: error.error?.message || error.message || 'Erreur de connexion au serveur'
      };
    }
  }

  // ✅ Vérifier le code de vérification
  async verifierCode(email: string, code: string): Promise<boolean> {
    if (!email || !code) {
      return false;
    }

    try {
      const response = await this.http.post<VerificationResponse>(
        `${this.apiUrl}/verification/verifier`,
        { email, code }
      ).pipe(
        timeout(10000),
        catchError(error => {
          console.error('Erreur vérification:', error);
          throw error;
        })
      ).toPromise();

      if (response?.success && response.estVerifie) {
        // Mettre à jour l'utilisateur comme vérifié
        const currentUser = this.utilisateurSubject.value;
        if (currentUser && currentUser.email === email) {
          currentUser.estVerifie = true;
          this.utilisateurSubject.next(currentUser);
          this.sauvegarderUtilisateurLocalStorage(currentUser);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erreur vérification:', error);
      
      // Fallback local pour le développement
      if (error.status === 0 || error.status === 504) {
        console.warn('Serveur indisponible, utilisation mode démo');
        return this.verifierCodeDemo(email, code);
      }
      
      return false;
    }
  }

  // ✅ Mode démo pour la vérification
  private async verifierCodeDemo(email: string, code: string): Promise<boolean> {
    try {
      // Vérifier contre le code fixe de démo
      if (code === '123456') {
        const utilisateurs = JSON.parse(localStorage.getItem('utilisateurs') || '[]');
        const utilisateurIndex = utilisateurs.findIndex((u: any) => u.email === email);
        
        if (utilisateurIndex !== -1) {
          utilisateurs[utilisateurIndex].estVerifie = true;
          localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
          
          const currentUser = this.utilisateurSubject.value;
          if (currentUser && currentUser.email === email) {
            currentUser.estVerifie = true;
            this.utilisateurSubject.next(currentUser);
            this.sauvegarderUtilisateurLocalStorage(currentUser);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // ✅ Convertir commande pour backend
  private convertirCommandePourBackend(commande: Commande): any {
  console.log('🔄 Conversion commande Angular -> Backend');
  console.log('📋 Produits dans la commande:', commande.produits);
  
  const data = {
    utilisateur: {
      email: commande.utilisateur.email,
      nom: commande.utilisateur.nom,
      prenom: commande.utilisateur.prenom,
      telephone: commande.utilisateur.telephone || '',
      adresse: commande.utilisateur.adresse,
      ville: commande.utilisateur.ville,
      codePostal: commande.utilisateur.codePostal
    },
    produits: commande.produits.map((p, index) => {
      console.log(`📦 Produit ${index + 1}:`, p);
      return {
        produitId: p.id || p.idProduit || 1,
        nomProduit: p.nom,
        prix: p.prix,
        quantite: p.quantite || 1
      };
    }),
    optionLivraison: commande.optionLivraison || 'standard',
    total: commande.total
  };
  
  console.log('✅ Données converties:', data);
  return data;
}

  // ✅ Confirmer commande
 // Dans auth.service.ts - MODIFIER confirmerCommande
async confirmerCommande(commande: Commande): Promise<{ success: boolean; commande?: Commande; message: string }> {
  try {
    console.log('🔄 Étape 1: Création/Récupération utilisateur...');
    
    // D'abord créer ou récupérer l'utilisateur
    const utilisateurResult = await this.creerOuRecupererUtilisateurBackend(commande.utilisateur);
    
    if (!utilisateurResult.success) {
      throw new Error('Échec création utilisateur: ' + utilisateurResult.message);
    }

    console.log('🔄 Étape 2: Conversion commande pour backend...');
    const commandeData = this.convertirCommandePourBackend(commande);
    
    console.log('🔄 Étape 3: Appel API commandes...');
    const response = await this.http.post<CommandeResponse>(
      `${this.apiUrl}/commandes`, 
      commandeData
    ).toPromise();
    
    console.log('✅ Réponse backend commande:', response);
    
    if (response && response.success) {
      return {
        success: true,
        commande: response.commande,
        message: response.message
      };
    } else {
      throw new Error(response?.message || 'Erreur inconnue du serveur');
    }
  } catch (error: any) {
    console.error('💥 Erreur complète commande:', error);
    
    return {
      success: false,
      message: error.error?.message || error.message || 'Erreur de connexion au serveur'
    };
  }
}

// AJOUTER cette méthode
private async creerOuRecupererUtilisateurBackend(utilisateur: Utilisateur): Promise<{success: boolean; message: string}> {
  try {
    console.log('📝 Envoi utilisateur au backend:', utilisateur);
    
    const response = await this.http.post<any>(
      `${this.apiUrl}/utilisateurs/creer-ou-recuperer`,
      {
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        telephone: utilisateur.telephone,
        adresse: utilisateur.adresse,
        ville: utilisateur.ville,
        codePostal: utilisateur.codePostal
      }
    ).pipe(
      timeout(10000),
      catchError(error => {
        console.error('❌ Erreur création utilisateur backend:', error);
        throw new Error('Impossible de créer l\'utilisateur: ' + (error.error?.message || error.message));
      })
    ).toPromise();

    console.log('✅ Utilisateur backend créé/récupéré:', response);
    return { success: true, message: 'Utilisateur prêt' };
    
  } catch (error: any) {
    console.error('💥 Erreur fatale utilisateur:', error);
    return { 
      success: false, 
      message: error.message || 'Erreur création utilisateur' 
    };
  }
}

  // ✅ Passer commande
  async passerCommande(commande: Commande): Promise<{ success: boolean; message: string; commande?: Commande }> {
    try {
      // Préparer la requête pour le backend
      const commandeRequest = {
        utilisateur: {
          email: commande.utilisateur.email,
          nom: commande.utilisateur.nom,
          prenom: commande.utilisateur.prenom,
          telephone: commande.utilisateur.telephone || '',
          adresse: commande.utilisateur.adresse,
          ville: commande.utilisateur.ville,
          codePostal: commande.utilisateur.codePostal
        },
        produits: commande.produits.map(p => ({
          produitId: p.id || 1,
          nomProduit: p.nom,
          prix: p.prix,
          quantite: p.quantite || 1
        })),
        optionLivraison: commande.optionLivraison || 'standard'
      };

      console.log('📦 Envoi commande:', commandeRequest);

      const response = await this.http.post<CommandeResponse>(
        `${this.apiUrl}/commandes`,
        commandeRequest
      ).pipe(
        timeout(15000),
        catchError(error => {
          console.error('❌ Erreur détaillée commande:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Message:', error.message);
          console.error('❌ Error body:', error.error);
          throw error;
        })
      ).toPromise();

      if (response?.success && response.commande) {
        const commandeComplete = { ...commande, ...response.commande };
        this.commandeSubject.next(commandeComplete);
        
        return {
          success: true,
          message: response.message,
          commande: commandeComplete
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Erreur lors de la création de la commande'
        };
      }
    } catch (error: any) {
      console.error('❌ Erreur complète commande:', error);
      
      // Mode démo en cas d'erreur
      return this.passerCommandeDemo(commande);
    }
  }

  // ✅ Mode démo pour les commandes
  private async passerCommandeDemo(commande: Commande): Promise<{ success: boolean; message: string; commande?: Commande }> {
    try {
      // Générer une commande de démo
      const commandeDemo: Commande = {
        ...commande,
        id: Date.now(),
        numeroCommande: 'CMD-' + Date.now(),
        dateCommande: new Date(),
        statut: 'confirmée'
      };
      
      this.commandeSubject.next(commandeDemo);
      
      return {
        success: true,
        message: 'Commande créée en mode démo',
        commande: commandeDemo
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur création commande démo'
      };
    }
  }

  // ✅ Paiement avec Stripe
  async creerSessionPaiement(commande: Commande): Promise<{ success: boolean; sessionId?: string; message: string }> {
    try {
      const response = await this.http.post<PaiementResponse>(
        `${this.apiUrl}/paiement/creer-session`,
        {
          commandeId: commande.id,
          montant: commande.total,
          produits: commande.produits,
          email: commande.utilisateur.email,
          description: `Commande TechStore - ${commande.produits.length} produit(s)`
        }
      ).pipe(
        timeout(15000),
        catchError(error => {
          console.error('Erreur création session paiement:', error);
          throw error;
        })
      ).toPromise();

      if (response?.success && response.sessionId) {
        return {
          success: true,
          sessionId: response.sessionId,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Erreur lors de la création de la session de paiement'
        };
      }
    } catch (error: any) {
      console.error('Erreur paiement:', error);
      
      // Fallback local pour le développement
      if (error.status === 0 || error.status === 504) {
        console.warn('Serveur Stripe indisponible, simulation paiement');
        return this.creerSessionPaiementDemo(commande);
      }
      
      return {
        success: false,
        message: error.error?.message || error.message || 'Erreur de connexion au service de paiement'
      };
    }
  }

  private async creerSessionPaiementDemo(commande: Commande): Promise<{ success: boolean; sessionId?: string; message: string }> {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      sessionId: 'cs_demo_' + Date.now(),
      message: 'Session de paiement de démo créée'
    };
  }

  // ✅ Obtenir l'utilisateur courant
  getUtilisateurCourant(): Observable<Utilisateur | null> {
    return this.utilisateurSubject.asObservable();
  }

  // ✅ Obtenir la commande courante
  getCommandeCourante(): Observable<Commande | null> {
    return this.commandeSubject.asObservable();
  }

  // ✅ Charger l'utilisateur depuis le localStorage
  private chargerUtilisateurLocalStorage() {
    try {
      const utilisateurData = localStorage.getItem('techstore_utilisateur');
      if (utilisateurData) {
        const utilisateur = JSON.parse(utilisateurData);
        this.utilisateurSubject.next(utilisateur);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur localStorage:', error);
    }
  }

  // ✅ Sauvegarder l'utilisateur dans le localStorage
  private sauvegarderUtilisateurLocalStorage(utilisateur: Utilisateur) {
    try {
      localStorage.setItem('techstore_utilisateur', JSON.stringify(utilisateur));
    } catch (error) {
      console.error('Erreur sauvegarde utilisateur localStorage:', error);
    }
  }

  // ✅ Déconnexion
  deconnecter() {
    this.utilisateurSubject.next(null);
    this.commandeSubject.next(null);
    localStorage.removeItem('techstore_utilisateur');
  }

  // ✅ Vérifier si un utilisateur est connecté
  estConnecte(): boolean {
    return this.utilisateurSubject.value !== null;
  }

  // ✅ Vérifier si un utilisateur est vérifié
  estVerifie(): boolean {
    return this.utilisateurSubject.value?.estVerifie || false;
  }

  // ✅ Vérifier la santé du serveur
  async verifierSanteServeur(): Promise<boolean> {
    try {
      const response = await this.http.get(
        `${this.apiUrl}/health`,
        { observe: 'response', responseType: 'text' }
      ).pipe(
        timeout(5000),
        map(res => res.status === 200),
        catchError(() => of(false))
      ).toPromise();
      
      return response || false;
    } catch {
      return false;
    }
  }

  // ✅ Récupérer l'historique des commandes (bonus)
  async getCommandesUtilisateur(email: string): Promise<Commande[]> {
    try {
      const response = await this.http.get<Commande[]>(
        `${this.apiUrl}/commandes/utilisateur/${encodeURIComponent(email)}`
      ).pipe(
        timeout(10000),
        catchError(error => {
          console.error('Erreur récupération commandes:', error);
          return of([]);
        })
      ).toPromise();

      return response || [];
    } catch (error) {
      console.error('Erreur récupération commandes:', error);
      return [];
    }
  }

  // ✅ Mettre à jour le profil utilisateur
  async mettreAJourProfil(utilisateur: Utilisateur): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.http.put<{success: boolean; message: string}>(
        `${this.apiUrl}/utilisateurs/profil`,
        utilisateur
      ).pipe(
        timeout(10000),
        catchError(error => {
          console.error('Erreur mise à jour profil:', error);
          throw error;
        })
      ).toPromise();

      if (response?.success) {
        this.utilisateurSubject.next(utilisateur);
        this.sauvegarderUtilisateurLocalStorage(utilisateur);
      }

      return {
        success: response?.success || false,
        message: response?.message || 'Erreur lors de la mise à jour du profil'
      };
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      return {
        success: false,
        message: error.error?.message || error.message || 'Erreur de connexion au serveur'
      };
    }
  }
}