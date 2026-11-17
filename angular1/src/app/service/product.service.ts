import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Client } from '../models/client';
@Injectable({
  providedIn: 'root'
})
export class ProductService {

   private baseUrl= 'http://localhost:8080/client';


  onaddCart$: Subject<any> =new Subject();
  constructor(private http: HttpClient) { 
    
  } 

  AddClient( client: Client):Observable<any>{
    return this.http.post<Client>(this.baseUrl,client);
  }

  getClient():Observable<Client[]>{
    return this.http.get<Client[]>(this.baseUrl);
  }
}
