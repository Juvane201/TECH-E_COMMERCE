package com.example.projetspringb.repository;

import com.example.projetspringb.model.Commande;
import com.example.projetspringb.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    // Méthodes existantes
    long countByDateCommandeBetween(LocalDateTime start, LocalDateTime end);
    List<Commande> findTop5ByOrderByDateCommandeDesc();
    List<Commande> findByDateCommandeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(c.total) FROM Commande c")
    Double getTotalRevenue();

    @Query("SELECT SUM(c.total) FROM Commande c WHERE c.dateCommande BETWEEN :start AND :end")
    Double getRevenueBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // AJOUTER CES DEUX MÉTHODES
    Optional<Commande> findByNumeroCommande(String numeroCommande);
    List<Commande> findByUtilisateur(Utilisateur utilisateur);
}