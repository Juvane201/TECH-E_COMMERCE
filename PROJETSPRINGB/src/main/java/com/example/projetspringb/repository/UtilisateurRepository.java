package com.example.projetspringb.repository;

import com.example.projetspringb.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    
    // ✅ CORRECTION : Utiliser dateCreation au lieu de createdAt
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Compter les utilisateurs par rôle
    long countByRole(String role);
    
    // Compter les utilisateurs créés entre deux dates (CORRIGÉ)
    long countByDateCreationBetween(LocalDateTime start, LocalDateTime end);
    
    // Compter les utilisateurs par rôle et période (CORRIGÉ)
    long countByDateCreationBetweenAndRole(LocalDateTime start, LocalDateTime end, String role);
    
    // Trouver les utilisateurs par statut de vérification
    List<Utilisateur> findByEstVerifie(Boolean estVerifie);
    
    // Trouver les utilisateurs créés récemment
    List<Utilisateur> findTop10ByOrderByDateCreationDesc();
    
    // Statistiques avancées
    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.dateCreation BETWEEN :start AND :end")
    long countUtilisateursInscritsParPeriode(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT u.role, COUNT(u) FROM Utilisateur u GROUP BY u.role")
    List<Object[]> countUtilisateursParRole();
}