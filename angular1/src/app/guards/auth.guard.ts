import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = localStorage.getItem('userRole');
    const isLoggedIn = !!localStorage.getItem('authToken');

    // Vérifier si l'utilisateur est connecté et a le rôle ADMIN
    if (isLoggedIn && userRole === 'ADMIN') {
      return true;
    }

    // Rediriger vers la page de login si non autorisé
    this.router.navigate(['/login']);
    return false;
  }
}