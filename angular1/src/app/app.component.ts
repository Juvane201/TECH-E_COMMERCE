import { CommonModule } from '@angular/common';
import { Component, Injectable, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { url } from 'node:inspector';
import { ProductService } from './service/product.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
// import { AuthServiceService } from './auth-service.service';
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [CommonModule, RouterOutlet, FormsModule],
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit{
  categories: any[] = [];
  panier: any[] = [];

  constructor(private http: HttpClient, router: Router) {}
  
  //  logout() {
  //   localStorage.removeItem('authToken');
  //   this.router.navigate(['/login']);
  // }

  ngOnInit() {
// Charger les catégories
this.http.get<any[]>('http://localhost:8080/api/categories')
    .subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    });

    
  }

  rechercher(event: Event) {
    // Logique de recherche
  }


  validerPanier() {
    // Logique de validation
  }
 
}
