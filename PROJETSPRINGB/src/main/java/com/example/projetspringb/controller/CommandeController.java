// src/main/java/com/example/projetspringb/controller/CommandeController.java
package com.example.projetspringb.controller;

import com.example.projetspringb.dto.CommandeDtos;
import com.example.projetspringb.service.CommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = "http://localhost:4200")
public class CommandeController {

    @Autowired
    private CommandeService commandeService;

    @PostMapping
    public ResponseEntity<CommandeDtos.CommandeResponse> creerCommande(@RequestBody CommandeDtos.CommandeRequest commandeRequest) {
        try {
            System.out.println("📦 Reception commande: " + commandeRequest);
            
            CommandeDtos.CommandeResponse response = commandeService.creerCommande(commandeRequest);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                new CommandeDtos.CommandeResponse(false, "Erreur serveur: " + e.getMessage())
            );
        }
    }

    @GetMapping("/utilisateur/{email}")
    public ResponseEntity<List<CommandeDtos.CommandeDto>> getCommandesUtilisateur(@PathVariable String email) {
        try {
            List<CommandeDtos.CommandeDto> commandes = commandeService.getCommandesByUtilisateurEmail(email);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommandeDtos.CommandeDto> getCommandeById(@PathVariable Long id) {
        try {
            CommandeDtos.CommandeDto commande = commandeService.getCommandeById(id);
            if (commande != null) {
                return ResponseEntity.ok(commande);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
}