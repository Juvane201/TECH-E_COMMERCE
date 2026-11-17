// src/main/java/com/example/projetspringb/controller/UtilisateurController.java
package com.example.projetspringb.controller;

import com.example.projetspringb.dto.UtilisateurDto;
import com.example.projetspringb.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "http://localhost:4200")
public class UtilisateurController {

    @Autowired
    private UtilisateurService utilisateurService;

    // Endpoint pour créer ou récupérer un utilisateur
    @PostMapping("/creer-ou-recuperer")
    public ResponseEntity<?> creerOuRecupererUtilisateur(@RequestBody UtilisateurDto utilisateurDto) {
        try {
            System.out.println("📝 Reception utilisateur: " + utilisateurDto.getEmail());
            
            UtilisateurDto utilisateur = utilisateurService.creerOuRecupererUtilisateur(utilisateurDto);
            return ResponseEntity.ok(utilisateur);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                "Erreur création utilisateur: " + e.getMessage()
            );
        }
    }

    // Vérifier si l'email existe
    @GetMapping("/email-existe/{email}")
    public ResponseEntity<Boolean> emailExiste(@PathVariable String email) {
        try {
            boolean existe = utilisateurService.emailExiste(email);
            return ResponseEntity.ok(existe);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }
}