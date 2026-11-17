// src/main/java/com/example/projetspringb/service/UtilisateurService.java
package com.example.projetspringb.service;

import com.example.projetspringb.dto.UtilisateurDto;
import com.example.projetspringb.model.Utilisateur;
import com.example.projetspringb.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public UtilisateurDto creerOuRecupererUtilisateur(UtilisateurDto utilisateurDto) {
        // Vérifier si l'utilisateur existe déjà
        Optional<Utilisateur> utilisateurExistant = utilisateurRepository.findByEmail(utilisateurDto.getEmail());
        
        if (utilisateurExistant.isPresent()) {
            // Retourner l'utilisateur existant
            Utilisateur existant = utilisateurExistant.get();
            return convertToDto(existant);
        } else {
            // Créer un nouvel utilisateur
            Utilisateur nouvelUtilisateur = new Utilisateur();
            nouvelUtilisateur.setEmail(utilisateurDto.getEmail());
            nouvelUtilisateur.setNom(utilisateurDto.getNom());
            nouvelUtilisateur.setPrenom(utilisateurDto.getPrenom());
            nouvelUtilisateur.setTelephone(utilisateurDto.getTelephone());
            nouvelUtilisateur.setAdresse(utilisateurDto.getAdresse());
            nouvelUtilisateur.setVille(utilisateurDto.getVille());
            nouvelUtilisateur.setCodePostal(utilisateurDto.getCodePostal());
            nouvelUtilisateur.setEstVerifie(true); // Pour les commandes directes
            
            Utilisateur saved = utilisateurRepository.save(nouvelUtilisateur);
            return convertToDto(saved);
        }
    }

    public boolean emailExiste(String email) {
        return utilisateurRepository.findByEmail(email).isPresent();
    }

    private UtilisateurDto convertToDto(Utilisateur utilisateur) {
        UtilisateurDto dto = new UtilisateurDto();
        dto.setId(utilisateur.getId());
        dto.setEmail(utilisateur.getEmail());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setTelephone(utilisateur.getTelephone());
        dto.setAdresse(utilisateur.getAdresse());
        dto.setVille(utilisateur.getVille());
        dto.setCodePostal(utilisateur.getCodePostal());
        
        // ✅ CORRECTION : Utiliser getEstVerifie() au lieu de isEstVerifie()
        dto.setEstVerifie(utilisateur.getEstVerifie() != null ? utilisateur.getEstVerifie() : false);
        
        return dto;
    }

    // Méthode pour trouver un utilisateur par email
    public Utilisateur trouverParEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));
    }
}