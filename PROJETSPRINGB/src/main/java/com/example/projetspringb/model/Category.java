package com.example.projetspringb.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "categorie")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categorie")  // OK si ta table a id_categorie
    @JsonProperty("idCategorie")
    private Long idCategorie;

    // CORRIGÉ : Colonne "nom" en base
    @Column(name = "nom", nullable = false)
    @JsonProperty("nom")
    private String nom;

    @Column(name = "description")
    @JsonProperty("description")
    private String description;

    // Évite la boucle infinie (Category → Product → Category)
    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Product> produits;

    // Constructeurs
    public Category() {}

    public Category(String nom, String description) {
        this.nom = nom;
        this.description = description;
    }

    // Getters & Setters
    public Long getIdCategorie() { return idCategorie; }
    public void setIdCategorie(Long idCategorie) { this.idCategorie = idCategorie; }

    public String getNom() { return nom; }
    public void setNom(String nom) { 
        if (nom == null || nom.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom de la catégorie est requis");
        }
        this.nom = nom.trim(); 
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { 
        this.description = description != null ? description.trim() : null; 
    }

    public List<Product> getProduits() { return produits; }
    public void setProduits(List<Product> produits) { this.produits = produits; }

    @Override
    public String toString() {
        return "Category{id=" + idCategorie + ", nom='" + nom + "', description='" + description + "'}";
    }
}