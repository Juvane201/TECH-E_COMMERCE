// src/main/java/com/example/projetspringb/dto/CommandeDtos.java
package com.example.projetspringb.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommandeDtos {
    
    // Classe pour la réponse de commande
    public static class CommandeResponse {
        private boolean success;
        private String message;
        private CommandeDto commande;

        // Constructeurs
        public CommandeResponse() {}

        public CommandeResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public CommandeResponse(boolean success, String message, CommandeDto commande) {
            this.success = success;
            this.message = message;
            this.commande = commande;
        }

        // Getters et Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public CommandeDto getCommande() { return commande; }
        public void setCommande(CommandeDto commande) { this.commande = commande; }
    }

    // Classe pour les données de commande
    public static class CommandeDto {
        private Long id;
        private String numeroCommande;
        private LocalDateTime dateCommande;
        private Double total;
        private String statut;
        private String optionLivraison;
        private Double fraisLivraison;
        private UtilisateurDto utilisateur;
        private List<ProduitCommandeDto> produits;

        // Constructeurs
        public CommandeDto() {}

        // Getters et Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getNumeroCommande() { return numeroCommande; }
        public void setNumeroCommande(String numeroCommande) { this.numeroCommande = numeroCommande; }

        public LocalDateTime getDateCommande() { return dateCommande; }
        public void setDateCommande(LocalDateTime dateCommande) { this.dateCommande = dateCommande; }

        public Double getTotal() { return total; }
        public void setTotal(Double total) { this.total = total; }

        public String getStatut() { return statut; }
        public void setStatut(String statut) { this.statut = statut; }

        public String getOptionLivraison() { return optionLivraison; }
        public void setOptionLivraison(String optionLivraison) { this.optionLivraison = optionLivraison; }

        public Double getFraisLivraison() { return fraisLivraison; }
        public void setFraisLivraison(Double fraisLivraison) { this.fraisLivraison = fraisLivraison; }

        public UtilisateurDto getUtilisateur() { return utilisateur; }
        public void setUtilisateur(UtilisateurDto utilisateur) { this.utilisateur = utilisateur; }

        public List<ProduitCommandeDto> getProduits() { return produits; }
        public void setProduits(List<ProduitCommandeDto> produits) { this.produits = produits; }
    }

    // Classe pour les données utilisateur
    public static class UtilisateurDto {
        private String email;
        private String nom;
        private String prenom;
        private String telephone;
        private String adresse;
        private String ville;
        private String codePostal;

        // Constructeurs
        public UtilisateurDto() {}

        // Getters et Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }

        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }

        public String getAdresse() { return adresse; }
        public void setAdresse(String adresse) { this.adresse = adresse; }

        public String getVille() { return ville; }
        public void setVille(String ville) { this.ville = ville; }

        public String getCodePostal() { return codePostal; }
        public void setCodePostal(String codePostal) { this.codePostal = codePostal; }
    }

    // Classe pour les produits de commande
    public static class ProduitCommandeDto {
        private Long produitId;
        private String nomProduit;
        private Double prix;
        private Integer quantite;

        // Constructeurs
        public ProduitCommandeDto() {}

        // Getters et Setters
        public Long getProduitId() { return produitId; }
        public void setProduitId(Long produitId) { this.produitId = produitId; }

        public String getNomProduit() { return nomProduit; }
        public void setNomProduit(String nomProduit) { this.nomProduit = nomProduit; }

        public Double getPrix() { return prix; }
        public void setPrix(Double prix) { this.prix = prix; }

        public Integer getQuantite() { return quantite; }
        public void setQuantite(Integer quantite) { this.quantite = quantite; }
    }

    // Classe pour la requête de commande
    public static class CommandeRequest {
        private UtilisateurDto utilisateur;
        private List<ProduitCommandeDto> produits;
        private String optionLivraison;
        private Double total;

        // Constructeurs
        public CommandeRequest() {}

        // Getters et Setters
        public UtilisateurDto getUtilisateur() { return utilisateur; }
        public void setUtilisateur(UtilisateurDto utilisateur) { this.utilisateur = utilisateur; }

        public List<ProduitCommandeDto> getProduits() { return produits; }
        public void setProduits(List<ProduitCommandeDto> produits) { this.produits = produits; }

        public String getOptionLivraison() { return optionLivraison; }
        public void setOptionLivraison(String optionLivraison) { this.optionLivraison = optionLivraison; }

        public Double getTotal() { return total; }
        public void setTotal(Double total) { this.total = total; }
    }
}