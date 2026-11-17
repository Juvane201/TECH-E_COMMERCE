package com.example.projetspringb.controller;

import com.example.projetspringb.model.Category;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class HealthController {
    
      @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Serveur Spring Boot fonctionne");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test-commande")
    public ResponseEntity<Map<String, String>> testCommande() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Endpoint commande accessible");
        return ResponseEntity.ok(response);
    }
}
