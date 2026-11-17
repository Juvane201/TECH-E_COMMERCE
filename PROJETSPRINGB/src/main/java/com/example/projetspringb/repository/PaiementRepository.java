package com.example.projetspringb.repository;

import com.example.projetspringb.model.Paiement;
import com.example.projetspringb.model.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    
    // Méthodes de base
    List<Paiement> findByStatut(StatutPaiement statut);
    List<Paiement> findByEmailUtilisateur(String email);
    Optional<Paiement> findByNumeroTransaction(String numeroTransaction);
    
    // Comptage par statut
    long countByStatut(StatutPaiement statut);
    
    // Chiffre d'affaires total
    @Query("SELECT COALESCE(SUM(p.montant), 0) FROM Paiement p WHERE p.statut = 'PAYE'")
    Double getChiffreAffairesTotal();
    
    // ✅ NOUVELLE MÉTHODE : Trouver les paiements par période et statut
    @Query("SELECT p FROM Paiement p WHERE p.datePaiement BETWEEN :debut AND :fin AND p.statut = :statut")
    List<Paiement> findByDatePaiementBetweenAndStatut(
        @Param("debut") LocalDateTime debut, 
        @Param("fin") LocalDateTime fin, 
        @Param("statut") StatutPaiement statut
    );
    
    // Trouver les paiements par commande
    @Query("SELECT p FROM Paiement p WHERE p.commande.numeroCommande = :numeroCommande")
    List<Paiement> findByNumeroCommande(@Param("numeroCommande") String numeroCommande);
    
    // Statistiques avancées
    @Query("SELECT COUNT(p) FROM Paiement p WHERE p.dateCreation BETWEEN :debut AND :fin")
    long countPaiementsParPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);
    
    @Query("SELECT COALESCE(SUM(p.montant), 0) FROM Paiement p WHERE p.statut = 'PAYE' AND p.datePaiement BETWEEN :debut AND :fin")
    Double getChiffreAffairesParPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);
    
    // Top clients
    @Query("SELECT p.emailUtilisateur, SUM(p.montant) as total FROM Paiement p WHERE p.statut = 'PAYE' GROUP BY p.emailUtilisateur ORDER BY total DESC")
    List<Object[]> findTopClients();
}