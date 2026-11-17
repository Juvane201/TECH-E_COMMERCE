import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    return this.checkAdminAccess();
  }

  private checkAdminAccess(): boolean {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');

    // Vérifications multiples pour la sécurité
    if (!token) {
      this.redirectToLogin();
      return false;
    }

    if (userRole !== 'ADMIN') {
      this.logoutAndRedirect();
      return false;
    }

    // Vérification supplémentaire pour l'admin spécifique
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.email === 'rj@gmail.com' || user.role === 'ADMIN') {
          return true;
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    this.logoutAndRedirect();
    return false;
  }

  private logoutAndRedirect(): void {
    // Déconnexion automatique
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    // Redirection vers login avec message
    this.router.navigate(['/login'], { 
      queryParams: { 
        error: 'Accès refusé. Droits administrateur requis. Vous avez été déconnecté.' 
      } 
    });
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}