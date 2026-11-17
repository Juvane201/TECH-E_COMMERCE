package com.example.projetspringb.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "order_Vente_item")
public class OrderVenteItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "produit_vente_id", nullable = false) // Changement du nom de colonne
    private ProduitVente produitVente; // Changement de Product à ProduitVente
    
    @Column(nullable = false)
    private Integer quantity;
    
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    // Constructeurs
    public OrderVenteItem() {}
    
    public OrderVenteItem(ProduitVente produitVente, Integer quantity) { // Changement ici
        this.produitVente = produitVente;
        this.quantity = quantity;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public ProduitVente getProduitVente() { return produitVente; } // Changement ici
    public void setProduitVente(ProduitVente produitVente) { this.produitVente = produitVente; } // Changement ici
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    
    // Méthode utilitaire
    public Double getSubTotal() {
        return produitVente.getPrice() * quantity; // Changement ici
    }
}