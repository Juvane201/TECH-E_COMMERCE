package com.example.projetspringb.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "lignes_commande")
public class LigneCommande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    @JsonBackReference // Évite la sérialisation circulaire
    private Commande commande;
    
    @Column(name = "produit_id", nullable = false)
    private Long produitId;
    
    @Column(name = "nom_produit", nullable = false)
    private String nomProduit;
    
    @Column(name = "prix_unitaire", nullable = false)
    private Double prixUnitaire;
    
    @Column(nullable = false)
    private Integer quantite;
    
    @Column(name = "sous_total", nullable = false)
    private Double sousTotal;
    
    // Constructeurs
    public LigneCommande() {}
    
    public LigneCommande(Long produitId, String nomProduit, Double prixUnitaire, Integer quantite) {
        this.produitId = produitId;
        this.nomProduit = nomProduit;
        this.prixUnitaire = prixUnitaire;
        this.quantite = quantite;
        this.sousTotal = prixUnitaire * quantite;
    }
    
    // Pré-calcul du sous-total avant persistance
    @PrePersist
    @PreUpdate
    private void calculateSousTotal() {
        if (this.prixUnitaire != null && this.quantite != null) {
            this.sousTotal = this.prixUnitaire * this.quantite;
        }
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Commande getCommande() { return commande; }
    public void setCommande(Commande commande) { this.commande = commande; }
    
    public Long getProduitId() { return produitId; }
    public void setProduitId(Long produitId) { this.produitId = produitId; }
    
    public String getNomProduit() { return nomProduit; }
    public void setNomProduit(String nomProduit) { this.nomProduit = nomProduit; }
    
    public Double getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(Double prixUnitaire) { 
        this.prixUnitaire = prixUnitaire;
        calculateSousTotal();
    }
    
    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { 
        this.quantite = quantite;
        calculateSousTotal();
    }
    
    public Double getSousTotal() { return sousTotal; }
    public void setSousTotal(Double sousTotal) { this.sousTotal = sousTotal; }
}