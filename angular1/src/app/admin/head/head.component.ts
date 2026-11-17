import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css']
})
export class HeadComponent {
  searchQuery: string = '';

  constructor(private router: Router) {}

  searchProducts() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/admin/produits'], { queryParams: { search: this.searchQuery } });
    }
  }

  getTitrePage(): string {
    const url = this.router.url;
    if (url.includes('/clients')) return 'Gestion des Clients';
    if (url.includes('/achats')) return 'Gestion des Achats';
    if (url.includes('/produits')) return 'Gestion des Produits';
    return 'Tableau de Bord';
  }
}