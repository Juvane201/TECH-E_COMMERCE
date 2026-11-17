package com.example.projetspringb.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detail_commande")
public class DetailCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "detail_commande_seq")
    @SequenceGenerator(name = "detail_commande_seq", sequenceName = "detail_commande_id_seq", allocationSize = 1)
    private Long idDetail;

    @ManyToOne
    @JoinColumn(name = "id_commande",
            nullable = false)
    private Commande commande;

    @ManyToOne
    @JoinColumn(name = "id_produit", nullable = false)
    private Product produit;

    @Column(nullable = false)
    private Integer quantite;

    @Column(nullable = false)
    private BigDecimal prixUnitaire;

    public DetailCommande() {}

    public DetailCommande(Commande commande, Product produit, Integer quantite, BigDecimal prixUnitaire) {
        this.commande = commande;
        this.produit = produit;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
    }

    // Getters et Setters
    public Long getIdDetail() {
        return idDetail;
    }

    public void setIdDetail(Long idDetail) {
        this.idDetail = idDetail;
    }

    public Commande getCommande() {
        return commande;
    }

    public void setCommande(Commande commande) {
        this.commande = commande;
    }

    public Product getProduit() {
        return produit;
    }

    public void setProduit(Product produit) {
        this.produit = produit;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public BigDecimal getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(BigDecimal prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }
}
