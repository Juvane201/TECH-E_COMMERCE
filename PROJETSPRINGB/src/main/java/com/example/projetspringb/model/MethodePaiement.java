// MethodePaiement.java
package com.example.projetspringb.model;

public enum MethodePaiement {
    STRIPE("Carte bancaire (Stripe)"), // ✅ EN MAJUSCULES
    PAYPAL("PayPal"),
    VIREMENT("Virement bancaire"),
    CHEQUE("Chèque");
    
    private final String libelle;
    
    MethodePaiement(String libelle) {
        this.libelle = libelle;
    }
    
    public String getLibelle() {
        return libelle;
    }
    
    // ✅ AJOUTER : Méthode pour convertir depuis une string
    public static MethodePaiement fromString(String value) {
        if (value == null) {
            return null;
        }
        try {
            return MethodePaiement.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Fallback vers STRIPE si la valeur n'est pas reconnue
            return STRIPE;
        }
    }
}