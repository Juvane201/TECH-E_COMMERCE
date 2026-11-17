// AuthService.java - VERSION SANS MOT DE PASSE
package com.example.projetspringb.service;

import com.example.projetspringb.model.Utilisateur;
import com.example.projetspringb.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // ✅ CORRECTION : Méthode simplifiée sans mot de passe
    public Utilisateur enregistrerUtilisateur(Utilisateur utilisateur) {
        try {
            // Vérifier si l'utilisateur existe déjà
            if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
                throw new RuntimeException("Un utilisateur avec cet email existe déjà");
            }
            
            // Sauvegarder l'utilisateur (sans mot de passe)
            return utilisateurRepository.save(utilisateur);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'enregistrement: " + e.getMessage());
        }
    }

    // Vérifier si un email existe
    public boolean emailExiste(String email) {
        return utilisateurRepository.findByEmail(email).isPresent();
    }

    // Trouver un utilisateur par email
    public Optional<Utilisateur> trouverParEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    // Méthode pour créer ou récupérer un utilisateur (pour les commandes)
    public Utilisateur creerOuRecupererUtilisateur(Utilisateur utilisateur) {
        Optional<Utilisateur> existant = utilisateurRepository.findByEmail(utilisateur.getEmail());
        
        if (existant.isPresent()) {
            return existant.get();
        } else {
            return utilisateurRepository.save(utilisateur);
        }
    }
}