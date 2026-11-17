package com.example.projetspringb.model;

public enum StatutPaiement {
    EN_ATTENTE("En attente"),
    PAYE("Payé"),
    ECHEC("Échec"),
    ANNULE("Annulé"),
    REMBOURSE("Remboursé");
    
    private final String libelle;
    
    StatutPaiement(String libelle) {
        this.libelle = libelle;
    }
    
    public String getLibelle() {
        return libelle;
    }
}