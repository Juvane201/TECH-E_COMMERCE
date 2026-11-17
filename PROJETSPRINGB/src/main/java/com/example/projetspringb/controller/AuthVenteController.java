package com.example.projetspringb.controller;

import com.example.projetspringb.dto.LoginVenteRequest;
import com.example.projetspringb.dto.LoginVenteResponse;
import com.example.projetspringb.dto.InscriptionVenteRequest;
import com.example.projetspringb.dto.InscriptionVenteResponse;
import com.example.projetspringb.model.User;
import com.example.projetspringb.service.AuthVenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auths")
@CrossOrigin(origins = {"http://localhost:49270", "http://localhost:8081", "http://localhost:4200"})
public class AuthVenteController {

    @Autowired
    private AuthVenteService authVenteService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginVenteRequest loginventeRequest) {
        try {
            User user = authVenteService.login(loginventeRequest.getEmail(), loginventeRequest.getPassword());
            
            // Créer une réponse de succès
            LoginVenteResponse response = new LoginVenteResponse(
            );
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.out.println("Erreur login: " + e.getMessage());
            LoginVenteResponse errorResponse = new LoginVenteResponse(
            );
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.out.println("Erreur serveur: " + e.getMessage());
            LoginVenteResponse errorResponse = new LoginVenteResponse(
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody InscriptionVenteRequest inscriptionRequest) {
        try {
            User user = authVenteService.register(
                inscriptionRequest.getUsername(),
                inscriptionRequest.getPassword(),
                inscriptionRequest.getEmail(),
                inscriptionRequest.getNom(),
                inscriptionRequest.getPrenom()
            );
            
            InscriptionVenteResponse response = new InscriptionVenteResponse(
                "Utilisateur inscrit avec succès",
                true,
                user.getId(),
                user.getEmail(),
                user.getNom(),
                user.getPrenom(),
                user.getRole()
            );
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.out.println("Erreur inscription: " + e.getMessage());
            InscriptionVenteResponse errorResponse = new InscriptionVenteResponse(
                e.getMessage(),
                false,
                null, null, null, null, null
            );
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.out.println("Erreur serveur inscription: " + e.getMessage());
            InscriptionVenteResponse errorResponse = new InscriptionVenteResponse(
                "Erreur serveur interne",
                false,
                null, null, null, null, null
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Endpoint pour vérifier si un email existe
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = authVenteService.checkEmailExists(email);
            return ResponseEntity.ok().body(
                new SimpleResponse("Vérification email", true, exists)
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                new SimpleResponse("Erreur serveur", false, null)
            );
        }
    }

    // Endpoint pour vérifier si un username existe
    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameExists(@PathVariable String username) {
        try {
            boolean exists = authVenteService.checkUsernameExists(username);
            return ResponseEntity.ok().body(
                new SimpleResponse("Vérification username", true, exists)
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                new SimpleResponse("Erreur serveur", false, null)
            );
        }
    }

    // Classe interne pour les réponses simples
    public static class SimpleResponse {
        private String message;
        private boolean success;
        private Object data;

        public SimpleResponse(String message, boolean success, Object data) {
            this.message = message;
            this.success = success;
            this.data = data;
        }

        // Getters et Setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
}