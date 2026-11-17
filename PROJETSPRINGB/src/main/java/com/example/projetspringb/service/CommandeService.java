package com.example.projetspringb.service;

import com.example.projetspringb.dto.CommandeDtos;
import com.example.projetspringb.model.*;
import com.example.projetspringb.repository.CommandeRepository;
import com.example.projetspringb.repository.UtilisateurRepository;
import com.example.projetspringb.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommandeService {
    
    @Autowired
    private CommandeRepository commandeRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Transactional
    public CommandeDtos.CommandeResponse creerCommande(CommandeDtos.CommandeRequest commandeRequest) {
        try {
            System.out.println("🔄 Création d'une nouvelle commande...");
            
            // Vérifier et récupérer l'utilisateur
            Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(commandeRequest.getUtilisateur().getEmail());
            if (utilisateurOpt.isEmpty()) {
                return new CommandeDtos.CommandeResponse(false, "Utilisateur non trouvé");
            }
            
            Utilisateur utilisateur = utilisateurOpt.get();
            
            // Créer la commande
            Commande commande = new Commande();
            commande.setUtilisateur(utilisateur);
            commande.setTotal(commandeRequest.getTotal());
            commande.setOptionLivraison(commandeRequest.getOptionLivraison());
            commande.setFraisLivraison(commandeRequest.getOptionLivraison().equals("express") ? 9.99 : 0.0);
            commande.setStatut("EN_ATTENTE_PAIEMENT"); // ✅ Statut initial
            
            // Ajouter les lignes de commande (SANS diminuer le stock pour l'instant)
            for (CommandeDtos.ProduitCommandeDto produitDto : commandeRequest.getProduits()) {
                Optional<Product> produitOpt = productRepository.findById(produitDto.getProduitId());
                if (produitOpt.isPresent()) {
                    Product produit = produitOpt.get();
                    
                    // Vérifier le stock disponible
                    if (produit.getStock() < produitDto.getQuantite()) {
                        return new CommandeDtos.CommandeResponse(false, 
                            "Stock insuffisant pour le produit: " + produit.getNom() + 
                            ". Stock disponible: " + produit.getStock());
                    }
                    
                    // Créer la ligne de commande
                    LigneCommande ligne = new LigneCommande();
                    ligne.setProduitId(produit.getIdProduit());
                    ligne.setNomProduit(produit.getNom());
                    ligne.setPrixUnitaire(produit.getPrix().doubleValue());
                    ligne.setQuantite(produitDto.getQuantite());
                    ligne.setCommande(commande);
                    
                    commande.ajouterLigneCommande(ligne);
                }
            }
            
            // Sauvegarder la commande (sans diminuer le stock)
            Commande commandeSauvegardee = commandeRepository.save(commande);
            
            // Convertir en DTO pour la réponse
            CommandeDtos.CommandeDto commandeDto = convertirEnDto(commandeSauvegardee);
            
            System.out.println("✅ Commande créée avec succès: " + commandeSauvegardee.getNumeroCommande());
            return new CommandeDtos.CommandeResponse(true, "Commande créée avec succès", commandeDto);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur création commande: " + e.getMessage());
            e.printStackTrace();
            return new CommandeDtos.CommandeResponse(false, "Erreur lors de la création de la commande: " + e.getMessage());
        }
    }
    
    // ✅ NOUVELLE MÉTHODE : Diminuer le stock après paiement réussi
    @Transactional
    public boolean confirmerPaiementEtDiminuerStock(String numeroCommande) {
        try {
            System.out.println("💰 Confirmation paiement et diminution stock pour commande: " + numeroCommande);
            
            Optional<Commande> commandeOpt = commandeRepository.findByNumeroCommande(numeroCommande);
            if (commandeOpt.isEmpty()) {
                System.err.println("❌ Commande non trouvée: " + numeroCommande);
                return false;
            }
            
            Commande commande = commandeOpt.get();
            
            // Vérifier si le paiement n'a pas déjà été traité
            if ("CONFIRMEE".equals(commande.getStatut())) {
                System.out.println("⚠️ Commande déjà confirmée: " + numeroCommande);
                return true;
            }
            
            // Diminuer le stock pour chaque produit
            for (LigneCommande ligne : commande.getLignesCommande()) {
                Optional<Product> produitOpt = productRepository.findById(ligne.getProduitId());
                if (produitOpt.isPresent()) {
                    Product produit = produitOpt.get();
                    
                    // Vérifier à nouveau le stock (au cas où il aurait changé)
                    if (produit.getStock() < ligne.getQuantite()) {
                        throw new RuntimeException("Stock insuffisant pour confirmer la commande. Produit: " + produit.getNom());
                    }
                    
                    // Diminuer le stock
                    produit.setStock(produit.getStock() - ligne.getQuantite());
                    productRepository.save(produit);
                    
                    System.out.println("📦 Stock diminué - Produit: " + produit.getNom() + 
                                      ", Quantité: " + ligne.getQuantite() + 
                                      ", Nouveau stock: " + produit.getStock());
                }
            }
            
            // Mettre à jour le statut de la commande
            commande.setStatut("CONFIRMEE");
            commande.setDateConfirmation(LocalDateTime.now());
            commandeRepository.save(commande);
            
            System.out.println("✅ Paiement confirmé et stock diminué pour commande: " + numeroCommande);
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Erreur confirmation paiement: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    private CommandeDtos.CommandeDto convertirEnDto(Commande commande) {
        CommandeDtos.CommandeDto dto = new CommandeDtos.CommandeDto();
        dto.setId(commande.getId());
        dto.setNumeroCommande(commande.getNumeroCommande());
        dto.setDateCommande(commande.getDateCommande());
        dto.setTotal(commande.getTotal());
        dto.setStatut(commande.getStatut());
        dto.setOptionLivraison(commande.getOptionLivraison());
        dto.setFraisLivraison(commande.getFraisLivraison());
        
        // Convertir l'utilisateur
        CommandeDtos.UtilisateurDto utilisateurDto = new CommandeDtos.UtilisateurDto();
        utilisateurDto.setEmail(commande.getUtilisateur().getEmail());
        utilisateurDto.setNom(commande.getUtilisateur().getNom());
        utilisateurDto.setPrenom(commande.getUtilisateur().getPrenom());
        utilisateurDto.setTelephone(commande.getUtilisateur().getTelephone());
        utilisateurDto.setAdresse(commande.getUtilisateur().getAdresse());
        utilisateurDto.setVille(commande.getUtilisateur().getVille());
        utilisateurDto.setCodePostal(commande.getUtilisateur().getCodePostal());
        dto.setUtilisateur(utilisateurDto);
        
        // Convertir les produits depuis les lignes de commande
        List<CommandeDtos.ProduitCommandeDto> produitsDto = commande.getLignesCommande().stream()
                .map(ligne -> {
                    CommandeDtos.ProduitCommandeDto produitDto = new CommandeDtos.ProduitCommandeDto();
                    produitDto.setProduitId(ligne.getProduitId());
                    produitDto.setNomProduit(ligne.getNomProduit());
                    produitDto.setPrix(ligne.getPrixUnitaire());
                    produitDto.setQuantite(ligne.getQuantite());
                    return produitDto;
                })
                .collect(Collectors.toList());
        dto.setProduits(produitsDto);
        
        return dto;
    }
    
    public List<CommandeDtos.CommandeDto> getCommandesByUtilisateurEmail(String email) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findByEmail(email);
        if (utilisateurOpt.isPresent()) {
            List<Commande> commandes = commandeRepository.findByUtilisateur(utilisateurOpt.get());
            return commandes.stream()
                    .map(this::convertirEnDto)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
    
    public CommandeDtos.CommandeDto getCommandeById(Long id) {
        Optional<Commande> commandeOpt = commandeRepository.findById(id);
        return commandeOpt.map(this::convertirEnDto).orElse(null);
    }
    
    public Optional<Commande> trouverCommandeParNumero(String numeroCommande) {
        return commandeRepository.findByNumeroCommande(numeroCommande);
    }
}