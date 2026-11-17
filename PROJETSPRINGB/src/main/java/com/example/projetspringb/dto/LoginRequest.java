package com.example.projetspringb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String motDePasse; // Garder motDePasse pour la compatibilité
    
    // Ajouter un getter pour password pour la compatibilité avec Angular
    public String getPassword() {
        return motDePasse;
    }
    
    // Setter pour password
    public void setPassword(String password) {
        this.motDePasse = password;
    }
}