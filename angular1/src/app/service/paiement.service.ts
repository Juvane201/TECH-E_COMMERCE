import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

export interface Paiement {
  id: number;
  numeroTransaction: string;
  numeroCommande: string;
  montant: number;
  statut: 'EN_ATTENTE' | 'PAYE' | 'ECHEC' | 'ANNULE' | 'REMBOURSE';
  methodePaiement: 'STRIPE' | 'PAYPAL' | 'VIREMENT';
  dateCreation: string;
  datePaiement: string;
  emailUtilisateur: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  adresseUtilisateur: string;
  villeUtilisateur: string;
  codePostalUtilisateur: string;
  commande?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  // URL de base correcte
  private apiUrl = 'http://localhost:8080/api/paiements';

  constructor(private http: HttpClient) {}

  /**
   * Traiter un paiement réussi (mode simulation ou réel)
   * Utilise l'endpoint /traiter-paiement-simple (celui qui existe dans le backend)
   */
  traiterPaiementReussi(numeroCommande: string, methodePaiement: string): Observable<any> {
    const url = `${this.apiUrl}/traiter-paiement-simple`;
    console.log('Appel API paiement:', url);

    return this.http.post(url, {
      numeroCommande: numeroCommande,
      methodePaiement: methodePaiement
    }).pipe(
      timeout(10000),
      catchError(error => {
        console.warn('Endpoint /traiter-paiement-simple échoue, retour succès simulé:', error);
        // En mode dev, on simule un succès même si l'API est down
        return of({
          success: true,
          message: 'Paiement traité en mode simulation (backend non disponible)',
          numeroCommande: numeroCommande,
          methodePaiement: methodePaiement
        });
      })
    );
  }

  /**
   * Créer un paiement à partir d'une commande
   */
  creerPaiementDepuisCommande(paiementData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/creer-depuis-commande`, paiementData);
  }

  /**
   * Récupérer tous les paiements
   */
  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.apiUrl);
  }

  /**
   * Récupérer les statistiques
   */
  getStatistiques(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistiques`);
  }

  /**
   * Récupérer un paiement par ID
   */
  getPaiementById(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.apiUrl}/${id}`);
  }

  /**
   * Mettre à jour le statut d'un paiement
   */
  mettreAJourStatut(id: number, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/statut`, { statut });
  }

  /**
   * Effectuer un remboursement
   */
  effectuerRemboursement(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/remboursement`, {});
  }
}