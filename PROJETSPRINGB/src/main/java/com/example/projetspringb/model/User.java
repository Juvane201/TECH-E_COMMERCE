package com.example.projetspringb.model;

import jakarta.persistence.*;

@Entity
@Table(name = "utilisateur")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String role = "USER";
    
    // Champs supplémentaires pour correspondre à vos besoins
    private String nom;
    private String prenom;

    // Constructeurs
    public User() {}

    public User(String username, String password, String email, String nom, String prenom) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.role = "USER";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
}