package com.example.projetspringb.repository;

import com.example.projetspringb.model.DetailCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetailCommandeRepository extends JpaRepository<DetailCommande, Long> {
    
    // ✅ CORRECTION : Utiliser @Query ou le nom correct
    @Query("SELECT d FROM DetailCommande d WHERE d.commande.id = :commandeId")
    List<DetailCommande> findByCommandeId(@Param("commandeId") Long commandeId);
    
    // OU bien utiliser le nom correct pour la méthode dérivée :
    List<DetailCommande> findByCommande_Id(Long commandeId);
}