// Utilisateur.java
package com.example.projetspringb.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs") // Assurez-vous que c'est le bon nom de table
@Data
public class Utilisateur {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String prenom;
    
    private String telephone;
    
    @Column(nullable = false)
    private String adresse;
    
    @Column(nullable = false)
    private String ville;
    
    @Column(name = "code_postal", nullable = false)
    private String codePostal;

      @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // ✅ CORRECTION : Supprimer ou corriger les champs problématiques
    // @Column(name = "mot_de_passe") // Si la colonne n'existe pas, supprimez cette ligne
    // private String motDePasse;
    
    @Column(name = "est_verifie")
    private Boolean estVerifie = false;
    
    @Column(name = "code_verification")
    private String codeVerification;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
    
    @Column(name = "date_expiration_code")
    private LocalDateTime dateExpirationCode;
    
    @Column(name = "tentatives_verification")
    private Integer tentativesVerification = 0;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;
    
    // Constructeurs
    public Utilisateur() {
        this.dateCreation = LocalDateTime.now();
    }
    
    public Utilisateur(String email, String nom, String prenom, String adresse, String ville, String codePostal) {
        this();
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.adresse = adresse;
        this.ville = ville;
        this.codePostal = codePostal;
    }
    
    // Getters et Setters (générés par @Data de Lombok)
    
    // Méthode utilitaire pour vérifier si le code est valide
    public boolean isCodeValide() {
        return codeVerification != null && 
               dateExpirationCode != null && 
               dateExpirationCode.isAfter(LocalDateTime.now());
    }
    
    // Méthode pour incrémenter les tentatives
    public void incrementerTentatives() {
        this.tentativesVerification = (this.tentativesVerification == null ? 0 : this.tentativesVerification) + 1;
    }
    
    // Méthode pour réinitialiser les tentatives
    public void reinitialiserTentatives() {
        this.tentativesVerification = 0;
    }
}