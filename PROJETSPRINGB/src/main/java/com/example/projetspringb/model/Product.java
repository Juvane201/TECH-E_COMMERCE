package com.example.projetspringb.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produit") 
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id") 
    private Long idProduit;

    @Column(name = "name", nullable = false)
    private String nom;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal prix;

    @Column(name = "stock_quantity")
    private Integer stock = 0;

    @Column(name = "image")
    private String image;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal prixOriginal;

    @Column(name = "promotion")
    private Integer promotion = 0;

    @Column(name = "is_new")
    private Boolean estNouveau = false;

    @Column(name = "date_ajout")
    private LocalDateTime dateAjout;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category categorie;

    public Product() {
        this.createdAt = LocalDateTime.now();
        this.dateAjout = LocalDateTime.now();
    }

    public Product(String nom, String description, BigDecimal prix, Integer stock) {
        this();
        this.nom = nom;
        this.description = description;
        this.prix = prix;
        this.stock = stock;
    }

    @JsonProperty("idProduit")
    public Long getIdProduit() { 
        return idProduit; 
    }

    public void setIdProduit(Long idProduit) { 
        this.idProduit = idProduit; 
    }

    @JsonProperty("nom")
    public String getNom() { 
        return nom; 
    }

    public void setNom(String nom) { 
        this.nom = nom; 
    }

    @JsonProperty("description")
    public String getDescription() { 
        return description; 
    }

    public void setDescription(String description) { 
        this.description = description; 
    }

    @JsonProperty("prix")
    
    public BigDecimal getPrix() { 
        return prix; 
    }

    public void setPrix(BigDecimal prix) { 
        this.prix = prix; 
    }

    public BigDecimal getPrice() {
        return prix;
    }

    @JsonProperty("stock")
    public Integer getStock() { 
        return stock; 
    }

    public void setStock(Integer stock) { 
        this.stock = stock; 
    }

    @JsonProperty("image")
    public String getImage() { 
        return image; 
    }

    public void setImage(String image) { 
        this.image = image; 
    }

    @JsonProperty("categorie")
    public Category getCategorie() { 
        return categorie; 
    }

    public void setCategorie(Category categorie) { 
        this.categorie = categorie; 
    }

    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() { 
        return createdAt; 
    }

    public void setCreatedAt(LocalDateTime createdAt) { 
        this.createdAt = createdAt; 
    }

    @JsonProperty("prixOriginal")
    public BigDecimal getPrixOriginal() {
        return prixOriginal;
    }

    public void setPrixOriginal(BigDecimal prixOriginal) {
        this.prixOriginal = prixOriginal;
    }

    @JsonProperty("promotion")
    public Integer getPromotion() {
        return promotion;
    }

    public void setPromotion(Integer promotion) {
        this.promotion = promotion;
    }

    @JsonProperty("estNouveau")
    public Boolean getEstNouveau() {
        return estNouveau;
    }

    public void setEstNouveau(Boolean estNouveau) {
        this.estNouveau = estNouveau;
    }

    @JsonProperty("dateAjout")
    public LocalDateTime getDateAjout() {
        return dateAjout;
    }

    public void setDateAjout(LocalDateTime dateAjout) {
        this.dateAjout = dateAjout;
    }

    // Méthodes utilitaires
    @JsonProperty("enPromotion")
    public boolean isEnPromotion() {
        return promotion != null && promotion > 0;
    }

    @JsonProperty("enStock")
    public boolean isEnStock() {
        return stock != null && stock > 0;
    }

    @JsonProperty("prixFinal")
    public BigDecimal getPrixFinal() {
        if (isEnPromotion() && prixOriginal != null) {
            return prix;
        }
        return prix;
    }

    @JsonProperty("economie")
    public BigDecimal getEconomie() {
        if (isEnPromotion() && prixOriginal != null) {
            return prixOriginal.subtract(prix);
        }
        return BigDecimal.ZERO;
    }

    @Override
    public String toString() {
        return "Product{" +
                "idProduit=" + idProduit +
                ", nom='" + nom + '\'' +
                ", prix=" + prix +
                ", stock=" + stock +
                ", promotion=" + promotion +
                ", categorie=" + (categorie != null ? categorie.getNom() : "null") +
                '}';
    }
}