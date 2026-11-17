package com.example.projetspringb.service;

import com.example.projetspringb.dto.PaiementRequest;
import com.example.projetspringb.model.*;
import com.example.projetspringb.repository.CommandeRepository;
import com.example.projetspringb.repository.PaiementRepository;
import com.example.projetspringb.repository.ProductRepository;
import com.example.projetspringb.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PaiementService {
    
    @Autowired
    private PaiementRepository paiementRepository;
    
    @Autowired
    private CommandeService commandeService;
    
    @Autowired
    private UtilisateurService utilisateurService;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CommandeRepository commandeRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    /**
     * ✅ MÉTHODE PRINCIPALE : Traiter un paiement réussi avec diminution du stock
     */
    // Dans PaiementService.java - AJOUTER des logs
@Transactional
public Map<String, Object> traiterPaiementReussi(String numeroCommande, String methodePaiementString) {
    System.out.println("🎯 === DEBUT TRAITEMENT PAIEMENT ===");
    System.out.println("📦 Numéro commande: " + numeroCommande);
    System.out.println("💳 Méthode paiement: " + methodePaiementString);
    
    try {
        // 1. Diminuer le stock
        System.out.println("🔄 Étape 1: Diminution stock...");
        boolean stockDiminue = diminuerStockCommande(numeroCommande);
        
        if (!stockDiminue) {
            System.err.println("❌ Échec diminution stock");
            return Map.of("success", false, "message", "Erreur diminution stock");
        }
        
        // 2. Récupérer commande
        System.out.println("🔄 Étape 2: Récupération commande...");
        Optional<Commande> commandeOpt = commandeService.trouverCommandeParNumero(numeroCommande);
        if (commandeOpt.isEmpty()) {
            System.err.println("❌ Commande non trouvée: " + numeroCommande);
            return Map.of("success", false, "message", "Commande non trouvée");
        }
        
        // 3. Créer paiement
        System.out.println("🔄 Étape 3: Création paiement...");
        Paiement paiement = creerPaiementDepuisCommande(commandeOpt.get(), methodePaiementString);
        
        System.out.println("✅ === TRAITEMENT PAIEMENT TERMINE AVEC SUCCES ===");
        return Map.of(
            "success", true,
            "message", "Paiement traité avec succès",
            "paiement", paiement,
            "commande", commandeOpt.get()
        );
        
    } catch (Exception e) {
        System.err.println("❌ === ERREUR TRAITEMENT PAIEMENT ===");
        e.printStackTrace();
        return Map.of("success", false, "message", "Erreur: " + e.getMessage());
    }
}

    /**
     * ✅ MÉTHODE : Diminuer le stock pour une commande
     */
    @Transactional
    public boolean diminuerStockCommande(String numeroCommande) {
        try {
            System.out.println("📦 Diminution stock pour commande: " + numeroCommande);
            
            Optional<Commande> commandeOpt = commandeService.trouverCommandeParNumero(numeroCommande);
            if (commandeOpt.isEmpty()) {
                System.err.println("❌ Commande non trouvée: " + numeroCommande);
                return false;
            }
            
            Commande commande = commandeOpt.get();
            
            // Vérifier si le stock n'a pas déjà été diminué
            if ("CONFIRMEE".equals(commande.getStatut())) {
                System.out.println("⚠️ Stock déjà diminué pour commande: " + numeroCommande);
                return true;
            }
            
            // Diminuer le stock pour chaque produit
            for (LigneCommande ligne : commande.getLignesCommande()) {
                Optional<Product> produitOpt = productRepository.findById(ligne.getProduitId());
                if (produitOpt.isPresent()) {
                    Product produit = produitOpt.get();
                    
                    // Vérifier le stock disponible
                    if (produit.getStock() < ligne.getQuantite()) {
                        throw new RuntimeException("Stock insuffisant pour confirmer la commande. Produit: " + produit.getNom() + 
                                                 ". Stock disponible: " + produit.getStock() + 
                                                 ", Quantité demandée: " + ligne.getQuantite());
                    }
                    
                    // Diminuer le stock
                    int ancienStock = produit.getStock();
                    produit.setStock(produit.getStock() - ligne.getQuantite());
                    productRepository.save(produit);
                    
                    System.out.println("📦 Stock diminué - Produit: " + produit.getNom() + 
                                      ", Ancien stock: " + ancienStock +
                                      ", Quantité: " + ligne.getQuantite() + 
                                      ", Nouveau stock: " + produit.getStock());
                } else {
                    System.err.println("❌ Produit non trouvé pour ID: " + ligne.getProduitId());
                }
            }
            
            // Mettre à jour le statut de la commande
            commande.setStatut("CONFIRMEE");
            commande.setDateConfirmation(LocalDateTime.now());
            commandeRepository.save(commande);
            
            System.out.println("✅ Stock diminué avec succès pour commande: " + numeroCommande);
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Erreur diminution stock: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la diminution du stock: " + e.getMessage(), e);
        }
    }

    /**
     * Crée un paiement à partir d'une commande
     */
    public Paiement creerPaiementDepuisCommande(Commande commande, String methodePaiementString) {
        try {
            System.out.println("💰 Création paiement pour commande: " + commande.getNumeroCommande());
            System.out.println("💳 Méthode de paiement reçue: " + methodePaiementString);
            
            // Convertir la méthode de paiement
            MethodePaiement methodePaiement = convertirMethodePaiement(methodePaiementString);
            System.out.println("✅ Méthode de paiement convertie: " + methodePaiement);
            
            // Générer un numéro de transaction unique
            String numeroTransaction = "TXN-" + System.currentTimeMillis() + "-" + 
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Créer le paiement
            Paiement paiement = new Paiement();
            paiement.setNumeroTransaction(numeroTransaction);
            paiement.setCommande(commande);
            paiement.setMontant(commande.getTotal());
            paiement.setMethodePaiement(methodePaiement);
            paiement.setStatut(StatutPaiement.PAYE);
            paiement.setDateCreation(LocalDateTime.now());
            paiement.setDatePaiement(LocalDateTime.now());
            
            // Sauvegarder les informations utilisateur
            Utilisateur utilisateur = commande.getUtilisateur();
            paiement.setEmailUtilisateur(utilisateur.getEmail());
            paiement.setNomUtilisateur(utilisateur.getNom());
            paiement.setPrenomUtilisateur(utilisateur.getPrenom());
            paiement.setTelephoneUtilisateur(utilisateur.getTelephone());
            paiement.setAdresseUtilisateur(utilisateur.getAdresse());
            paiement.setVilleUtilisateur(utilisateur.getVille());
            paiement.setCodePostalUtilisateur(utilisateur.getCodePostal());
            
            // Sauvegarder le paiement
            Paiement paiementSauvegarde = paiementRepository.save(paiement);
            System.out.println("✅ Paiement créé: " + paiementSauvegarde.getNumeroTransaction());
            
            return paiementSauvegarde;
            
        } catch (Exception e) {
            System.err.println("❌ Erreur création paiement: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la création du paiement: " + e.getMessage(), e);
        }
    }

    /**
     * Convertit une chaîne en enum MethodePaiement
     */
    private MethodePaiement convertirMethodePaiement(String methodeString) {
        if (methodeString == null || methodeString.trim().isEmpty()) {
            return MethodePaiement.STRIPE; // Valeur par défaut
        }
        
        String normalized = methodeString.toUpperCase().trim();
        
        try {
            return MethodePaiement.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ Méthode de paiement non reconnue: " + methodeString + ", utilisation de STRIPE par défaut");
            return MethodePaiement.STRIPE; // Fallback vers Stripe
        }
    }

    /**
     * Récupérer tous les paiements
     */
    public List<Paiement> findAll() {
        return paiementRepository.findAll();
    }

    /**
     * Récupérer un paiement par son ID
     */
    public Optional<Paiement> findById(Long id) {
        return paiementRepository.findById(id);
    }

    /**
     * Récupérer les paiements par statut
     */
    public List<Paiement> findByStatut(StatutPaiement statut) {
        return paiementRepository.findByStatut(statut);
    }

    /**
     * Récupérer les paiements par utilisateur
     */
    public List<Paiement> findByUtilisateurEmail(String email) {
        return paiementRepository.findByEmailUtilisateur(email);
    }

    /**
     * Récupérer les statistiques de paiement (VERSION CORRIGÉE)
     */
    public Map<String, Object> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            Double chiffreAffaires = paiementRepository.getChiffreAffairesTotal();
            stats.put("chiffreAffairesTotal", chiffreAffaires != null ? chiffreAffaires : 0.0);
            stats.put("paiementsPayes", paiementRepository.countByStatut(StatutPaiement.PAYE));
            stats.put("paiementsEnAttente", paiementRepository.countByStatut(StatutPaiement.EN_ATTENTE));
            stats.put("paiementsEchec", paiementRepository.countByStatut(StatutPaiement.ECHEC));
            stats.put("paiementsAnnules", paiementRepository.countByStatut(StatutPaiement.ANNULE));
            stats.put("paiementsRembourses", paiementRepository.countByStatut(StatutPaiement.REMBOURSE));
            stats.put("totalPaiements", paiementRepository.count());
            
            // ✅ CORRECTION : Calcul manuel du chiffre d'affaires mensuel
            LocalDateTime debutMois = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime finMois = LocalDateTime.now().withDayOfMonth(LocalDateTime.now().toLocalDate().lengthOfMonth())
                    .withHour(23).withMinute(59).withSecond(59);
            
            Double chiffreAffairesMois = calculerChiffreAffairesMensuel(debutMois, finMois);
            stats.put("chiffreAffairesMensuel", chiffreAffairesMois);
            
            System.out.println("📊 Statistiques générées: " + stats);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur génération statistiques: " + e.getMessage());
            // Valeurs par défaut en cas d'erreur
            stats.put("chiffreAffairesTotal", 0.0);
            stats.put("paiementsPayes", 0);
            stats.put("paiementsEnAttente", 0);
            stats.put("paiementsEchec", 0);
            stats.put("paiementsAnnules", 0);
            stats.put("paiementsRembourses", 0);
            stats.put("totalPaiements", 0);
            stats.put("chiffreAffairesMensuel", 0.0);
        }
        
        return stats;
    }

    /**
     * ✅ NOUVELLE MÉTHODE : Calculer le chiffre d'affaires mensuel manuellement
     */
    private Double calculerChiffreAffairesMensuel(LocalDateTime debut, LocalDateTime fin) {
        try {
            List<Paiement> paiementsMensuels = paiementRepository.findByDatePaiementBetweenAndStatut(debut, fin, StatutPaiement.PAYE);
            return paiementsMensuels.stream()
                    .mapToDouble(Paiement::getMontant)
                    .sum();
        } catch (Exception e) {
            System.err.println("❌ Erreur calcul CA mensuel: " + e.getMessage());
            return 0.0;
        }
    }

    /**
     * Mettre à jour le statut d'un paiement
     */
    @Transactional
    public boolean mettreAJourStatutPaiement(Long paiementId, StatutPaiement nouveauStatut) {
        try {
            Optional<Paiement> paiementOpt = paiementRepository.findById(paiementId);
            if (paiementOpt.isPresent()) {
                Paiement paiement = paiementOpt.get();
                paiement.setStatut(nouveauStatut);
                
                if (nouveauStatut == StatutPaiement.PAYE) {
                    paiement.setDatePaiement(LocalDateTime.now());
                }
                
                paiementRepository.save(paiement);
                System.out.println("✅ Statut paiement mis à jour: " + paiementId + " -> " + nouveauStatut);
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("❌ Erreur mise à jour statut paiement: " + e.getMessage());
            return false;
        }
    }

    /**
     * Effectuer un remboursement
     */
    @Transactional
    public Map<String, Object> effectuerRemboursement(Long paiementId) {
        Map<String, Object> resultat = new HashMap<>();
        
        try {
            Optional<Paiement> paiementOpt = paiementRepository.findById(paiementId);
            if (paiementOpt.isEmpty()) {
                resultat.put("success", false);
                resultat.put("message", "Paiement non trouvé");
                return resultat;
            }
            
            Paiement paiement = paiementOpt.get();
            
            // Vérifier que le paiement peut être remboursé
            if (paiement.getStatut() != StatutPaiement.PAYE) {
                resultat.put("success", false);
                resultat.put("message", "Seuls les paiements payés peuvent être remboursés");
                return resultat;
            }
            
            // Mettre à jour le statut
            paiement.setStatut(StatutPaiement.REMBOURSE);
            paiementRepository.save(paiement);
            
            // Réaugmenter le stock (optionnel - selon votre logique métier)
            // reaugmenterStockCommande(paiement.getCommande().getNumeroCommande());
            
            resultat.put("success", true);
            resultat.put("message", "Remboursement effectué avec succès");
            resultat.put("paiement", paiement);
            
            System.out.println("✅ Remboursement effectué pour paiement: " + paiementId);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur remboursement: " + e.getMessage());
            resultat.put("success", false);
            resultat.put("message", "Erreur lors du remboursement: " + e.getMessage());
        }
        
        return resultat;
    }

    /**
     * Méthode utilitaire pour réaugmenter le stock (en cas d'annulation/remboursement)
     */
    @Transactional
    public boolean reaugmenterStockCommande(String numeroCommande) {
        try {
            System.out.println("📦 Réaugmentation stock pour commande: " + numeroCommande);
            
            Optional<Commande> commandeOpt = commandeService.trouverCommandeParNumero(numeroCommande);
            if (commandeOpt.isEmpty()) {
                return false;
            }
            
            Commande commande = commandeOpt.get();
            
            // Réaugmenter le stock pour chaque produit
            for (LigneCommande ligne : commande.getLignesCommande()) {
                Optional<Product> produitOpt = productRepository.findById(ligne.getProduitId());
                if (produitOpt.isPresent()) {
                    Product produit = produitOpt.get();
                    int ancienStock = produit.getStock();
                    produit.setStock(produit.getStock() + ligne.getQuantite());
                    productRepository.save(produit);
                    
                    System.out.println("📦 Stock réaugmenté - Produit: " + produit.getNom() + 
                                      ", Ancien stock: " + ancienStock +
                                      ", Quantité: " + ligne.getQuantite() + 
                                      ", Nouveau stock: " + produit.getStock());
                }
            }
            
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Erreur réaugmentation stock: " + e.getMessage());
            return false;
        }
    }

    /**
     * Vérifier le statut d'une commande
     */
    public String getStatutCommande(String numeroCommande) {
        Optional<Commande> commandeOpt = commandeService.trouverCommandeParNumero(numeroCommande);
        return commandeOpt.map(Commande::getStatut).orElse("NON_TROUVEE");
    }

    /**
     * Obtenir le chiffre d'affaires par période (VERSION CORRIGÉE)
     */
    public Double getChiffreAffairesParPeriode(LocalDateTime debut, LocalDateTime fin) {
        try {
            List<Paiement> paiementsPeriode = paiementRepository.findByDatePaiementBetweenAndStatut(debut, fin, StatutPaiement.PAYE);
            return paiementsPeriode.stream()
                    .mapToDouble(Paiement::getMontant)
                    .sum();
        } catch (Exception e) {
            System.err.println("❌ Erreur calcul CA période: " + e.getMessage());
            return 0.0;
        }
    }
}