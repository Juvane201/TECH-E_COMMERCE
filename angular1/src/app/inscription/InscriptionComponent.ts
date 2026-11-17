import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  inscriptionForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.inscriptionForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  inscription() {
    if (this.inscriptionForm.invalid) {
      alert('Veuillez remplir correctement tous les champs.');
      return;
    }

    const payload = this.inscriptionForm.value;
    console.log('Payload envoyé:', payload);
    this.http.post('http://localhost:8080/api/auth/inscription', payload).subscribe({
      next: (response: any) => {
        console.log('Inscription réussie', response);
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur inscription', error);
        console.log('Erreur détaillée:', error.error);
        alert(error.error || 'Erreur lors de l\'inscription');
      }
    });
  }
}