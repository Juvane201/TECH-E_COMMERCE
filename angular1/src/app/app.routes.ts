import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { InscriptionComponent } from './inscription/InscriptionComponent';
import { AdminComponent } from './admin/admin/admin.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ProduitComponent } from './admin/produit/produit.component';
import { PanierComponent } from './panier/panier.component';
import { CommandeComponent } from './commande/commande.component';
import { DashboardComponent } from './dashboard/dashboard.component'; 
import { PaiementComponent } from './paiement/paiement.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'home', component: HomeComponent },
  { path: 'panier', component: PanierComponent },
  { path: 'commande', component: CommandeComponent },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard], // Protection de la route parent
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [AdminGuard] // Protection supplémentaire
      },
      { 
        path: 'clients', 
        component: ClientListComponent,
        canActivate: [AdminGuard]
      },
      { 
        path: 'produits', 
        component: ProduitComponent,
        canActivate: [AdminGuard]
      },
      { 
        path: 'paiements', 
        component: PaiementComponent,
        canActivate: [AdminGuard]
      },
      
      // ✅ Redirection vers le dashboard par défaut
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ✅ Route par défaut
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // ✅ Route wildcard pour les pages non trouvées
  { path: '**', redirectTo: '/home' }
];