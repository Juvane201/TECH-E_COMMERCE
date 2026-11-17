package com.example.projetspringb.service;


import com.example.projetspringb.model.Utilisateur;

import com.example.projetspringb.repository.UtilisateurRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class VerificationService {
    
    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRATION_MINUTES = 10;
    private static final int MAX_VERIFICATION_ATTEMPTS = 3;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Génère un code de vérification à 6 chiffres
     */
    public String genererCodeVerification() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        
        return code.toString();
    }
    
    /**
     * Enregistre ou met à jour un utilisateur et envoie le code de vérification
     */
    public boolean enregistrerEtEnvoyerCode(Utilisateur utilisateur) {
        try {
            // Vérifier si l'utilisateur existe déjà
            Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(utilisateur.getEmail());
            
            Utilisateur userToSave;
            if (existingUser.isPresent()) {
                // Mettre à jour l'utilisateur existant
                userToSave = existingUser.get();
                userToSave.setNom(utilisateur.getNom());
                userToSave.setPrenom(utilisateur.getPrenom());
                userToSave.setTelephone(utilisateur.getTelephone());
                userToSave.setAdresse(utilisateur.getAdresse());
                userToSave.setVille(utilisateur.getVille());
                userToSave.setCodePostal(utilisateur.getCodePostal());
            } else {
                // Nouvel utilisateur
                userToSave = utilisateur;
            }
            
            // Générer et configurer le code de vérification
            String code = genererCodeVerification();
            userToSave.setCodeVerification(code);
            userToSave.setDateExpirationCode(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES));
            userToSave.setTentativesVerification(0);
            userToSave.setEstVerifie(false);
            
            // Sauvegarder l'utilisateur
            utilisateurRepository.save(userToSave);
            
            // Envoyer le code par email
            return emailService.envoyerCodeVerification(userToSave.getEmail(), code);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'enregistrement: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Vérifie le code de vérification
     */
    public boolean verifierCode(String email, String code) {
        try {
            Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);
            
            if (utilisateurOpt.isEmpty()) {
                return false;
            }
            
            Utilisateur utilisateur = utilisateurOpt.get();
            
            // Vérifier le nombre de tentatives
            if (utilisateur.getTentativesVerification() >= MAX_VERIFICATION_ATTEMPTS) {
                System.err.println("❌ Trop de tentatives de vérification pour: " + email);
                return false;
            }
            
            // Vérifier l'expiration du code
            if (utilisateur.getDateExpirationCode().isBefore(LocalDateTime.now())) {
                System.err.println("❌ Code expiré pour: " + email);
                utilisateur.setTentativesVerification(utilisateur.getTentativesVerification() + 1);
                utilisateurRepository.save(utilisateur);
                return false;
            }
            
            // Vérifier le code
            if (code.equals(utilisateur.getCodeVerification())) {
                // Code correct - marquer comme vérifié
                utilisateur.setEstVerifie(true);
                utilisateur.setCodeVerification(null);
                utilisateur.setDateExpirationCode(null);
                utilisateur.setTentativesVerification(0);
                utilisateurRepository.save(utilisateur);
                return true;
            } else {
                // Code incorrect - incrémenter les tentatives
                utilisateur.setTentativesVerification(utilisateur.getTentativesVerification() + 1);
                utilisateurRepository.save(utilisateur);
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la vérification: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Vérifie si un utilisateur est vérifié
     */
    public boolean estUtilisateurVerifie(String email) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);
        return false;
    
    }
    
    /**
     * Renvoie un nouveau code de vérification
     */
    public boolean renvoyerCode(String email) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);
        
        if (utilisateurOpt.isEmpty()) {
            return false;
        }
        
        Utilisateur utilisateur = utilisateurOpt.get();
        String nouveauCode = genererCodeVerification();
        
        utilisateur.setCodeVerification(nouveauCode);
        utilisateur.setDateExpirationCode(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES));
        utilisateur.setTentativesVerification(0);
        
        utilisateurRepository.save(utilisateur);
        
        return emailService.envoyerCodeVerification(email, nouveauCode);
    }
}