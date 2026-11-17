package com.example.projetspringb.repository;


import com.example.projetspringb.model.ProduitVente; // Changement d'import
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitVenteRepository extends JpaRepository<ProduitVente, Long> { // Changement ici
    List<ProduitVente> findByCategory(String category);
    List<ProduitVente> findByNameContainingIgnoreCase(String name);
    List<ProduitVente> findByEstEnPromotionTrue(); // Nouvelle méthode
}