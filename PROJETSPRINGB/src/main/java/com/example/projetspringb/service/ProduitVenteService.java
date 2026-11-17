package com.example.projetspringb.service;

import com.example.projetspringb.model.ProduitVente; // Changement d'import
import com.example.projetspringb.repository.ProduitVenteRepository; // Changement d'import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProduitVenteService { // Changement de nom
    
    @Autowired
    private ProduitVenteRepository produitVenteRepository; // Changement ici
    
    public List<ProduitVente> getAllProducts() {
        return produitVenteRepository.findAll();
    }
    
    public Optional<ProduitVente> getProductById(Long id) {
        return produitVenteRepository.findById(id);
    }
    
    public ProduitVente saveProduct(ProduitVente produitVente) { // Changement ici
        return produitVenteRepository.save(produitVente);
    }
    
    public void deleteProduct(Long id) {
        produitVenteRepository.deleteById(id);
    }
    
    public List<ProduitVente> getProductsByCategory(String category) {
        return produitVenteRepository.findByCategory(category);
    }
    
    public List<ProduitVente> searchProducts(String name) {
        return produitVenteRepository.findByNameContainingIgnoreCase(name);
    }
    
    // Nouvelles méthodes spécifiques à ProduitVente
    public List<ProduitVente> getProduitsEnPromotion() {
        return produitVenteRepository.findByEstEnPromotionTrue();
    }
    
    public ProduitVente mettreEnPromotion(Long id, Double nouveauPrix) {
        Optional<ProduitVente> optionalProduit = produitVenteRepository.findById(id);
        if (optionalProduit.isPresent()) {
            ProduitVente produit = optionalProduit.get();
            produit.setPrixAvantPromotion(produit.getPrice());
            produit.setPrice(nouveauPrix);
            produit.setEstEnPromotion(true);
            return produitVenteRepository.save(produit);
        }
        return null;
    }
}