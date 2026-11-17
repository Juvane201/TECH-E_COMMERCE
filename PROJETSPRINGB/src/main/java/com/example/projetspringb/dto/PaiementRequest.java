// PaiementRequest.java
package com.example.projetspringb.dto;

import lombok.Data;
import java.util.List;

@Data
public class PaiementRequest {
    
    // Informations utilisateur
    private UtilisateurDto utilisateur;
    
    // Informations commande
    private List<ProduitDto> produits;
    private String optionLivraison;
    private Double total;
    
    // Informations paiement
    private String methodePaiement;
    private String successUrl;
    private String cancelUrl;
    
    @Data
    public static class UtilisateurDto {
        private String email;
        private String nom;
        private String prenom;
        private String telephone;
        private String adresse;
        private String ville;
        private String codePostal;
    }
    
    @Data
    public static class ProduitDto {
        private Long produitId;
        private String nom;
        private Double prix;
        private Integer quantite;
    }
}