import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: any = {
    produits: 0,
    clients: 0,
    ventes: 0,
    revenus: 0,
    produitsChange: 0,
    clientsChange: 0,
    ventesChange: 0,
    revenusChange: 0
  };

  activities: any[] = [];

  // Objectifs mensuels (progress bars)
  objectifs = [
    { label: 'Produits', actuel: 1248, cible: 1500, unite: '' },
    { label: 'Clients', actuel: 856, cible: 1000, unite: '' },
    { label: 'Commandes', actuel: 324, cible: 500, unite: '' },
    { label: 'Revenus', actuel: 24580, cible: 30000, unite: 'Ar' }
  ];

  // Répartition catégories (donut CSS)
  categories = [
    { nom: 'Laptops', pourcentage: 35, couleur: '#10b981' },
    { nom: 'Smartphones', pourcentage: 28, couleur: '#0d9488' },
    { nom: 'Tablettes', pourcentage: 15, couleur: '#34d399' },
    { nom: 'Accessoires', pourcentage: 12, couleur: '#059669' },
    { nom: 'Autres', pourcentage: 10, couleur: '#a7f3d0' }
  ];

  // Bar chart CSS (ventes de la semaine)
  ventesHebdo = [
    { jour: 'Lun', valeur: 45 },
    { jour: 'Mar', valeur: 62 },
    { jour: 'Mer', valeur: 38 },
    { jour: 'Jeu', valeur: 78 },
    { jour: 'Ven', valeur: 55 },
    { jour: 'Sam', valeur: 90 },
    { jour: 'Dim', valeur: 42 }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.http.get<any>('http://localhost:8080/api/admin/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.syncObjectifs();
      },
      error: () => {
        this.stats = {
          produits: 1248,
          clients: 856,
          ventes: 324,
          revenus: 24580,
          produitsChange: 12,
          clientsChange: 5,
          ventesChange: -3,
          revenusChange: 8
        };
        this.syncObjectifs();
      }
    });

    this.http.get<any[]>('http://localhost:8080/api/admin/activities').subscribe({
      next: (data) => {
        this.activities = data;
      },
      error: () => {
        this.activities = this.generateSampleActivities();
      }
    });
  }

  private syncObjectifs() {
    this.objectifs[0].actuel = this.stats.produits || 0;
    this.objectifs[1].actuel = this.stats.clients || 0;
    this.objectifs[2].actuel = this.stats.ventes || 0;
    this.objectifs[3].actuel = this.stats.revenus || 0;
  }

  // ============ MÉTHODES UTILITAIRES ============
  formatNumber(value: number): string {
    if (!value) return '0';
    return value.toLocaleString('fr-FR');
  }

  formatActivityTime(date: Date): string {
    if (!date) return 'Date inconnue';
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return activityDate.toLocaleDateString('fr-FR');
  }

  isNewActivity(date: Date): boolean {
    if (!date) return false;
    const activityDate = new Date(date);
    const now = new Date();
    const diffHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'sale': 'fas fa-shopping-cart',
      'payment': 'fas fa-credit-card',
      'client': 'fas fa-user-plus',
      'product': 'fas fa-box'
    };
    return icons[type] || 'fas fa-bell';
  }

  getActivityBadgeClass(type: string): string {
    return `activity-badge ${type}`;
  }

  getActivityTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'sale': 'Vente',
      'payment': 'Paiement',
      'client': 'Client',
      'product': 'Produit'
    };
    return labels[type] || 'Autre';
  }

  onDateFilterChange(event: any) {
    console.log('Filtre date:', event.target.value);
  }

  // ============ MÉTHODES POUR LES VISUALISATIONS CSS ============
  getPourcentage(actuel: number, cible: number): number {
    if (!cible) return 0;
    return Math.min(100, Math.round((actuel / cible) * 100));
  }

  getMaxVente(): number {
    return Math.max(...this.ventesHebdo.map(v => v.valeur));
  }

  getOffset(index: number): number {
    // Calcule l'offset pour placer chaque segment du donut correctement
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.categories[i].pourcentage * 2.39;
    }
    return offset;
  }

  // ============ EXPORT ============
  exportActivities() {
    const csvContent = this.convertToCSV(this.activities);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activites.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';
    const headers = ['Description', 'Type', 'Date'];
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = [
        `"${row.description}"`,
        row.type,
        new Date(row.date).toLocaleDateString('fr-FR')
      ];
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }

  // ============ DONNÉES DÉMO ============
  private generateSampleActivities() {
    return [
      { description: 'Nouvelle vente - MacBook Pro', date: new Date(), type: 'sale' },
      { description: 'Paiement reçu - Client Dupont', date: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'payment' },
      { description: 'Nouveau client inscrit', date: new Date(Date.now() - 5 * 60 * 60 * 1000), type: 'client' },
      { description: 'Produit mis à jour - iPhone 15', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: 'product' },
      { description: 'Vente groupée effectuée', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: 'sale' }
    ];
  }

  // Accesseur pour Math dans le template
  get Math() {
    return Math;
  }
}