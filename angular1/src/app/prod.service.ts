import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Produit {
  id?: number;
  nom: string;
  prix: number;
  stock: number;
  description: string;
  categorie: Categorie;
}

export interface Categorie {
  id?: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProdService {
  private apiUrl = 'http://localhost:8082/api/produit';
  private categorieApiUrl = 'http://localhost:8082/api/categorie';

  constructor(private http: HttpClient) {}

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  getProduitsByCategorie(categorieId: number): Observable<Produit[]> {
    if (!categorieId) {
      throw new Error('categorieId est requis pour getProduitsByCategorie');
    }
    return this.http.get<Produit[]>(`${this.apiUrl}/categorie/${categorieId}`);
  }

  getDerniersProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/recents`);
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.categorieApiUrl);
  }
}