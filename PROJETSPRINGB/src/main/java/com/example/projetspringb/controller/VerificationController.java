package com.example.projetspringb.controller;

import com.example.projetspringb.dto.VerificationRequest;
import com.example.projetspringb.dto.VerificationResponse;
import com.example.projetspringb.model.Utilisateur;
import com.example.projetspringb.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "http://localhost:4200")
public class VerificationController {
    
    @Autowired
    private VerificationService verificationService;
    
    /**
     * Enregistre un utilisateur et envoie le code de vérification
     */
    @PostMapping("/enregistrer")
    public ResponseEntity<VerificationResponse> enregistrerUtilisateur(@RequestBody Utilisateur utilisateur) {
        try {
            boolean succes = verificationService.enregistrerEtEnvoyerCode(utilisateur);
            
            if (succes) {
                return ResponseEntity.ok(new VerificationResponse(
                    true, 
                    "Code de vérification envoyé à votre email"
                ));
            } else {
                return ResponseEntity.badRequest().body(new VerificationResponse(
                    false, 
                    "Erreur lors de l'envoi du code de vérification"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new VerificationResponse(
                false, 
                "Erreur serveur: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Vérifie le code de vérification
     */
    @PostMapping("/verifier")
    public ResponseEntity<VerificationResponse> verifierCode(@RequestBody VerificationRequest request) {
        try {
            boolean estValide = verificationService.verifierCode(request.getEmail(), request.getCode());
            
            if (estValide) {
                return ResponseEntity.ok(new VerificationResponse(
                    true, 
                    "Email vérifié avec succès",
                    true
                ));
            } else {
                return ResponseEntity.badRequest().body(new VerificationResponse(
                    false, 
                    "Code de vérification incorrect ou expiré",
                    false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new VerificationResponse(
                false, 
                "Erreur serveur: " + e.getMessage(),
                false
            ));
        }
    }
    
    /**
     * Renvoie un nouveau code de vérification
     */
    @PostMapping("/renvoyer-code")
    public ResponseEntity<VerificationResponse> renvoyerCode(@RequestBody VerificationRequest request) {
        try {
            boolean succes = verificationService.renvoyerCode(request.getEmail());
            
            if (succes) {
                return ResponseEntity.ok(new VerificationResponse(
                    true, 
                    "Nouveau code envoyé à votre email"
                ));
            } else {
                return ResponseEntity.badRequest().body(new VerificationResponse(
                    false, 
                    "Erreur lors de l'envoi du nouveau code"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new VerificationResponse(
                false, 
                "Erreur serveur: " + e.getMessage()
            ));
        }
    }
}