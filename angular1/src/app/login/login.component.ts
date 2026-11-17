import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showWelcomeSpinner = false;
  welcomeMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Vérifier les paramètres d'erreur dans l'URL
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.showError(params['error']);
      }
      
      // Vérifier si l'utilisateur est déjà connecté
      this.checkExistingAuth();
    });
  }

  private checkExistingAuth(): void {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'ADMIN') {
      // Rediriger automatiquement vers le dashboard admin
      this.router.navigate(['/admin/dashboard']);
    } else if (token) {
      // Rediriger vers la page d'accueil pour les utilisateurs normaux
      this.router.navigate(['/home']);
    }
  }

  login() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const payload = {
    email: this.loginForm.value.email,
    motDePasse: this.loginForm.value.motDePasse
  }

    console.log('🔐 Tentative de connexion:', payload);

    this.http.post('http://localhost:8080/api/auth/login', payload).subscribe({
      next: (response: any) => {
        console.log('✅ Login réussi', response);
        this.handleSuccessfulLogin(response);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur login', error);
        this.isLoading = false;
        
        let errorMsg = 'Email ou mot de passe incorrect';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status === 0) {
          errorMsg = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else if (error.status === 500) {
          errorMsg = 'Erreur interne du serveur. Veuillez réessayer.';
        }
        
        this.showError(errorMsg);
      }
    });
  }

  private handleSuccessfulLogin(response: any) {
  console.log('🔍 Réponse complète du backend:', response);
  console.log('🔍 Rôle reçu:', response.role);
  console.log('🔍 Token reçu:', response.token);
  console.log('🔍 Email reçu:', response.email);
  
  this.isLoading = false;
  
  // Sauvegarder les informations d'authentification
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  if (response.role) {
    localStorage.setItem('userRole', response.role);
  } else {
    console.warn('⚠️ Aucun rôle reçu dans la réponse');
  }
  if (response.email) {
    localStorage.setItem('userEmail', response.email);
  }
  
  // Sauvegarder l'objet utilisateur complet
  const userData = {
    id: response.userId,
    email: response.email,
    role: response.role,
    nom: response.nom,
    prenom: response.prenom,
    message: response.message
  };
  localStorage.setItem('currentUser', JSON.stringify(userData));

  console.log('🔍 Données sauvegardées dans localStorage:');
  console.log('- userRole:', localStorage.getItem('userRole'));
  console.log('- userEmail:', localStorage.getItem('userEmail'));
  console.log('- currentUser:', localStorage.getItem('currentUser'));

  // Afficher le spinner de bienvenue
  this.showWelcomeSpinner = true;
  this.welcomeMessage = this.getWelcomeMessage(response);

  // Redirection après délai
  setTimeout(() => {
    this.showWelcomeSpinner = false;
    this.redirectUser(response.role);
  }, 2500);
}
  private getWelcomeMessage(response: any): string {
    if (response.role === 'ADMIN') {
      return `Bienvenue Administrateur ${response.prenom || ''}`.trim();
    }
    return `Bienvenue ${response.prenom || 'Utilisateur'}`;
  }

  private redirectUser(role: string): void {
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  private showError(message: string) {
    this.errorMessage = message;
    
    // Auto-dismiss après 5 secondes
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get email() { return this.loginForm.get('email'); }
  get motDePasse() { return this.loginForm.get('motDePasse'); }

  // Méthode pour réinitialiser les erreurs
  clearError() {
    this.errorMessage = '';
  }

  // Méthode pour remplir automatiquement les identifiants admin (pour le développement)
  fillAdminCredentials() {
    this.loginForm.patchValue({
      email: 'rj@gmail.com',
      motDePasse: '111111'
    });
    this.clearError();
  }

  // Méthode pour remplir automatiquement les identifiants utilisateur (pour le développement)
  fillUserCredentials() {
    this.loginForm.patchValue({
      email: 'utilisateur@example.com',
      motDePasse: 'password123'
    });
    this.clearError();
  }
}