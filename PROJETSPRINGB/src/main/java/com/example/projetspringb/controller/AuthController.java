package com.example.projetspringb.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String motDePasse = loginRequest.get("motDePasse");
            
            System.out.println("=== TENTATIVE DE CONNEXION ===");
            System.out.println("Email: " + email);
            System.out.println("MotDePasse: " + motDePasse);

            // ✅ Vérification simple pour l'admin
            if ("rj@gmail.com".equals(email) && "111111".equals(motDePasse)) {
                System.out.println("✅ Connexion admin réussie");
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Connexion admin réussie");
                response.put("userId", 1);
                response.put("email", "rj@gmail.com");
                response.put("role", "ADMIN");
                response.put("nom", "Admin");
                response.put("prenom", "System");
                response.put("token", "admin-token-" + System.currentTimeMillis());
                
                return ResponseEntity.ok(response);
            }

            // ✅ Pour les autres utilisateurs - réponse simple pour test
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Connexion utilisateur réussie");
            response.put("userId", 2);
            response.put("email", email);
            response.put("role", "USER");
            response.put("nom", "Utilisateur");
            response.put("prenom", "Test");
            response.put("token", "user-token-" + System.currentTimeMillis());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors du login: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur de connexion: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Endpoint de test pour vérifier que le serveur fonctionne
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Serveur auth fonctionnel");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
}