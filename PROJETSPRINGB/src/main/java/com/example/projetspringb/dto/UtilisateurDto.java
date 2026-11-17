// src/main/java/com/example/projetspringb/dto/UtilisateurDto.java
package com.example.projetspringb.dto;

public class UtilisateurDto {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private String adresse;
    private String ville;
    private String codePostal;
    private boolean estVerifie;

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    public boolean isEstVerifie() { return estVerifie; }
    public void setEstVerifie(boolean estVerifie) { this.estVerifie = estVerifie; }
}