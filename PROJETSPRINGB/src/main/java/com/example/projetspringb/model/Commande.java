package com.example.projetspringb.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes")
public class Commande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_commande", unique = true, nullable = false)
    private String numeroCommande;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<LigneCommande> lignesCommande = new ArrayList<>();
    
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Paiement> paiements = new ArrayList<>();
    
    @Column(nullable = false)
    private Double total;
    
    private Double fraisLivraison = 0.0;
    
    private String optionLivraison;
    
    @Column(nullable = false)
    private String statut = "EN_ATTENTE"; // EN_ATTENTE, CONFIRMEE, EXPEDIEE, LIVREE, ANNULEE
    
    @Column(name = "date_commande", nullable = false)
    private LocalDateTime dateCommande;
    
    private LocalDateTime dateConfirmation;
    
    private LocalDateTime dateExpédition;
    
    private LocalDateTime dateLivraison;
    
    @Column(length = 500)
    private String adresseLivraison;

    // Constructeurs
    public Commande() {
        this.dateCommande = LocalDateTime.now();
        this.numeroCommande = genererNumeroCommande();
    }
    
    public Commande(Utilisateur utilisateur, Double total) {
        this();
        this.utilisateur = utilisateur;
        this.total = total;
    }
    
    public Commande(Utilisateur utilisateur, Double total, String optionLivraison, Double fraisLivraison) {
        this(utilisateur, total);
        this.optionLivraison = optionLivraison;
        this.fraisLivraison = fraisLivraison;
    }
    
    // Méthode pour générer un numéro de commande unique
    private String genererNumeroCommande() {
        return "CMD-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }
    
    // Méthodes métier
    public void confirmer() {
        this.statut = "CONFIRMEE";
        this.dateConfirmation = LocalDateTime.now();
    }
    
    public void expedier() {
        this.statut = "EXPEDIEE";
        this.dateExpédition = LocalDateTime.now();
    }
    
    public void livrer() {
        this.statut = "LIVREE";
        this.dateLivraison = LocalDateTime.now();
    }
    
    public void annuler() {
        this.statut = "ANNULEE";
    }
    
    public Double getTotalAvecLivraison() {
        return this.total + (this.fraisLivraison != null ? this.fraisLivraison : 0.0);
    }
    
    public Integer getNombreTotalArticles() {
        return lignesCommande.stream()
                .mapToInt(LigneCommande::getQuantite)
                .sum();
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNumeroCommande() { return numeroCommande; }
    public void setNumeroCommande(String numeroCommande) { this.numeroCommande = numeroCommande; }
    
    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
    
    @JsonIgnore
    public List<LigneCommande> getLignesCommande() { return lignesCommande; }
    public void setLignesCommande(List<LigneCommande> lignesCommande) { this.lignesCommande = lignesCommande; }
    
    @JsonIgnore
    public List<Paiement> getPaiements() { return paiements; }
    public void setPaiements(List<Paiement> paiements) { this.paiements = paiements; }
    
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    
    public Double getFraisLivraison() { return fraisLivraison; }
    public void setFraisLivraison(Double fraisLivraison) { this.fraisLivraison = fraisLivraison; }
    
    public String getOptionLivraison() { return optionLivraison; }
    public void setOptionLivraison(String optionLivraison) { this.optionLivraison = optionLivraison; }
    
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    
    public LocalDateTime getDateCommande() { return dateCommande; }
    public void setDateCommande(LocalDateTime dateCommande) { this.dateCommande = dateCommande; }
    
    public LocalDateTime getDateConfirmation() { return dateConfirmation; }
    public void setDateConfirmation(LocalDateTime dateConfirmation) { this.dateConfirmation = dateConfirmation; }
    
    public LocalDateTime getDateExpédition() { return dateExpédition; }
    public void setDateExpédition(LocalDateTime dateExpédition) { this.dateExpédition = dateExpédition; }
    
    public LocalDateTime getDateLivraison() { return dateLivraison; }
    public void setDateLivraison(LocalDateTime dateLivraison) { this.dateLivraison = dateLivraison; }
    
    public String getAdresseLivraison() { return adresseLivraison; }
    public void setAdresseLivraison(String adresseLivraison) { this.adresseLivraison = adresseLivraison; }
    
    // ✅ Méthode pour obtenir les lignes de commande sans référence circulaire
    @JsonProperty("lignesCommande")
    public List<LigneCommande> getLignesCommandeForJson() {
        return lignesCommande;
    }
    
    // Méthode utilitaire pour ajouter une ligne de commande
    public void ajouterLigneCommande(LigneCommande ligne) {
        ligne.setCommande(this);
        this.lignesCommande.add(ligne);
    }
    
    // Méthode utilitaire pour ajouter un paiement
    public void ajouterPaiement(Paiement paiement) {
        paiement.setCommande(this);
        this.paiements.add(paiement);
    }
    
    @Override
    public String toString() {
        return "Commande{" +
                "id=" + id +
                ", numeroCommande='" + numeroCommande + '\'' +
                ", total=" + total +
                ", statut='" + statut + '\'' +
                ", dateCommande=" + dateCommande +
                '}';
    }
}