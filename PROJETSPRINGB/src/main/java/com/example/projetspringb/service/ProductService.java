package com.example.projetspringb.service;

import com.example.projetspringb.model.Product;
import com.example.projetspringb.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;

    // ✅ MÉTHODE POUR OBTENIR TOUS LES PRODUITS
    public List<Product> getAllProducts() {
        System.out.println("ProductService: Fetching all products");
        List<Product> products = productRepository.findAll();
        System.out.println("✅ ProductService: Found " + products.size() + " products");
        return products;
    }

    public Product addProduct(Product product) {
        System.out.println(" Saving product: " + product.getNom());
        return productRepository.save(product);
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getRecentProducts() {
        return productRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNomContainingIgnoreCase(keyword);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public void updateStock(Long productId, int quantity) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateStock'");
    }
}