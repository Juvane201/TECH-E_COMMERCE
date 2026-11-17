import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Client } from '../models/client';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadClients(); 
  }

  loadClients() {
    this.http.get<Client[]>('http://localhost:8080/api/utilisateurs').subscribe({
      next: (data) => {
        console.log('API Response:', data); // Log for debugging
        this.clients = data;
      },
      error: (error) => {
        console.error('Erreur chargement clients', error);
        this.clients = [
          { id: 1, username: 'JeanDupont', email: 'jean@example.com', role: 'USER' },
          { id: 2, username: 'MarieMartin', email: 'marie@example.com', role: 'USER' }
        ];
      }
    });
  }
}