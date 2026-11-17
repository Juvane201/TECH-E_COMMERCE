import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client } from '../models/client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientServiceService {
  private Url ='http://localhost:8080/api/utilisateur';

  constructor(private http: HttpClient) { }

  getClient(): Observable<Client[]> {
    return this.http.get<Client[]>('${this.Url}');
  }

    registre(client: Client): Observable<Client> {
     return this.http.post<Client>(this.Url, client);
  }
}
