package com.example.projetspringb.dto;

import java.util.List;

public class CommandeRequest {
    private UtilisateurDto utilisateur;
    private List<LigneCommandeDto> produits;
    private String optionLivraison;
    
    // Getters et Setters
    public UtilisateurDto getUtilisateur() { return utilisateur; }
    public void setUtilisateur(UtilisateurDto utilisateur) { this.utilisateur = utilisateur; }
    
    public List<LigneCommandeDto> getProduits() { return produits; }
    public void setProduits(List<LigneCommandeDto> produits) { this.produits = produits; }
    
    public String getOptionLivraison() { return optionLivraison; }
    public void setOptionLivraison(String optionLivraison) { this.optionLivraison = optionLivraison; }
    
    // Sous-classes DTO
    public static class UtilisateurDto {
        private String email;
        private String nom;
        private String prenom;
        private String telephone;
        private String adresse;
        private String ville;
        private String codePostal;
        
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
    
    public static class LigneCommandeDto {
        private Long produitId;
        private String nomProduit;
        private Double prix;
        private Integer quantite;
        
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
}