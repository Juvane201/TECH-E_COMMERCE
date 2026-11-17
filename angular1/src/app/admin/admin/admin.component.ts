import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  searchQuery: string = '';
  sidebarCollapsed: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  getTitrePage(): string {
    const url = this.router.url;
    if (url.includes('/clients')) return 'Gestion des Clients';
    if (url.includes('/paiements')) return 'Gestion des Achats';
    if (url.includes('/produits')) return 'Gestion des Produits';
    if (url.includes('/historique')) return 'Historique';
    return 'Tableau de Bord';
  }

  searchProducts() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/admin/produits'], { queryParams: { search: this.searchQuery } });
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}