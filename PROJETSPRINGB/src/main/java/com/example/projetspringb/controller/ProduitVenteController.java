package com.example.projetspringb.controller;


import com.example.projetspringb.model.ProduitVente; // Changement d'import
import com.example.projetspringb.service.ProduitVenteService; // Changement d'import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produits") 
public class ProduitVenteController { 
    
    @Autowired
    private ProduitVenteService produitVenteService; 
    
    @GetMapping
    public List<ProduitVente> getAllProducts() {
        return produitVenteService.getAllProducts();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProduitVente> getProductById(@PathVariable Long id) {
        Optional<ProduitVente> produit = produitVenteService.getProductById(id);
        return produit.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ProduitVente createProduct(@RequestBody ProduitVente produitVente) { // Changement ici
        return produitVenteService.saveProduct(produitVente);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProduitVente> updateProduct(@PathVariable Long id, @RequestBody ProduitVente produitVente) {
        Optional<ProduitVente> existingProduit = produitVenteService.getProductById(id);
        if (existingProduit.isPresent()) {
            produitVente.setId(id);
            return ResponseEntity.ok(produitVenteService.saveProduct(produitVente));
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        produitVenteService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/categorie/{category}")
    public List<ProduitVente> getProductsByCategory(@PathVariable String category) {
        return produitVenteService.getProductsByCategory(category);
    }
    
    @GetMapping("/recherche")
    public List<ProduitVente> searchProducts(@RequestParam String name) {
        return produitVenteService.searchProducts(name);
    }
    
    // Nouveaux endpoints spécifiques à ProduitVente
    @GetMapping("/promotions")
    public List<ProduitVente> getProduitsEnPromotion() {
        return produitVenteService.getProduitsEnPromotion();
    }
    
    @PostMapping("/{id}/promotion")
    public ResponseEntity<ProduitVente> mettreEnPromotion(@PathVariable Long id, @RequestParam Double nouveauPrix) {
        ProduitVente produit = produitVenteService.mettreEnPromotion(id, nouveauPrix);
        return produit != null ? ResponseEntity.ok(produit) : ResponseEntity.notFound().build();
    }
}