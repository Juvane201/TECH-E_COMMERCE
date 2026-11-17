package com.example.projetspringb.controller;

import com.example.projetspringb.model.Category;
import com.example.projetspringb.model.Product;
import com.example.projetspringb.service.CategorieService;
import com.example.projetspringb.service.ProductService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategorieService categorieService;

    @Autowired
    private ObjectMapper objectMapper;

    // ========================
    // GET ALL PRODUCTS
    // ========================
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            System.out.println("Fetching all products...");
            List<Product> products = productService.getAllProducts();
            System.out.println("Found " + products.size() + " products");
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("Error fetching products: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ========================
    // GET PRODUCT BY ID
    // ========================
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            System.out.println("Fetching product with ID: " + id);
            Optional<Product> product = productService.findById(id);
            if (product.isPresent()) {
                System.out.println("Product found: " + product.get().getNom());
                return ResponseEntity.ok(product.get());
            } else {
                System.out.println("Product not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching product: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    // ========================
    // ADD PRODUCT (POST)
    // ========================
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(
            @RequestPart("produit") String produitJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        System.out.println("=== ADD PRODUCT REQUEST ===");
        System.out.println("Received JSON: " + produitJson);
        System.out.println("Image provided: " + (image != null && !image.isEmpty()));

        Product product = new Product();

        try {
            JsonNode node = objectMapper.readTree(produitJson);

            // === NOM ===
            String nom = getText(node, "nom");
            if (nom == null || nom.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Le nom du produit est requis."));
            }
            product.setNom(nom.trim());

            // === DESCRIPTION ===
            product.setDescription(getText(node, "description"));

            // === PRIX ===
            JsonNode prixNode = node.get("prix");
            if (prixNode == null || prixNode.isNull()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Le prix est requis."));
            }
            String prixStr = prixNode.isTextual() ? prixNode.asText() : prixNode.toString();
            try {
                BigDecimal prix = new BigDecimal(prixStr);
                if (prix.compareTo(BigDecimal.ZERO) <= 0) {
                    return ResponseEntity.badRequest().body(new ErrorResponse("Le prix doit être supérieur à 0."));
                }
                product.setPrix(prix);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Prix invalide: " + prixStr));
            }

            // === STOCK + EN STOCK ===
            int stock = node.get("stock") != null ? node.get("stock").asInt(0) : 0;
            if (stock < 0) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Le stock ne peut pas être négatif."));
            }
            product.setStock(stock); // Appelle setStock() → met à jour enStock automatiquement

            // === CATÉGORIE ===
            JsonNode catNode = node.get("categorie");
            if (catNode == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("La catégorie est requise."));
            }

            Category category = resolveCategory(catNode);
            product.setCategorie(category);

            // === IMAGE ===
            if (image != null && !image.isEmpty()) {
                String fileName = uploadImage(image);
                product.setImage("/images/" + fileName);
                System.out.println("Image uploaded: " + fileName);
            } else {
                product.setImage(null);
            }

            // === DATES ===
            product.setCreatedAt(LocalDateTime.now());
            product.setDateAjout(LocalDateTime.now());

            // === SAUVEGARDE ===
            Product saved = productService.addProduct(product);
            System.out.println("Product saved with ID: " + saved.getIdProduit());

            return ResponseEntity.ok(saved);

        } catch (JsonProcessingException e) {
            System.err.println("JSON parsing error: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("JSON invalide: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

    // ========================
    // UPDATE PRODUCT (PUT)
    // ========================
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestPart("produit") String produitJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Optional<Product> existing = productService.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product product = existing.get();

        try {
            JsonNode node = objectMapper.readTree(produitJson);

            // Mise à jour conditionnelle
            if (node.has("nom") && !node.get("nom").isNull()) {
                product.setNom(getText(node, "nom"));
            }
            if (node.has("description")) {
                product.setDescription(getText(node, "description"));
            }
            if (node.has("prix") && !node.get("prix").isNull()) {
                String prixStr = node.get("prix").isTextual() ? node.get("prix").asText() : node.get("prix").toString();
                product.setPrix(new BigDecimal(prixStr));
            }
            if (node.has("stock")) {
                int stock = node.get("stock").asInt(0);
                if (stock < 0) {
                    return ResponseEntity.badRequest().body(new ErrorResponse("Le stock ne peut pas être négatif."));
                }
                product.setStock(stock); // Met à jour enStock
            }

            if (node.has("categorie")) {
                product.setCategorie(resolveCategory(node.get("categorie")));
            }

            if (image != null && !image.isEmpty()) {
                String fileName = uploadImage(image);
                product.setImage("/images/" + fileName);
            }

            Product updated = productService.addProduct(product);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Erreur mise à jour: " + e.getMessage()));
        }
    }

    // ========================
    // DELETE PRODUCT
    // ========================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            if (productService.findById(id).isPresent()) {
                productService.deleteProduct(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Erreur suppression: " + e.getMessage()));
        }
    }

    // ========================
    // MÉTHODES UTILITAIRES
    // ========================

    private String getText(JsonNode node, String field) {
        JsonNode fieldNode = node.get(field);
        return fieldNode != null && !fieldNode.isNull() ? fieldNode.asText().trim() : null;
    }

    private Category resolveCategory(JsonNode catNode) throws Exception {
        Category category = new Category();
        JsonNode idCatNode = catNode.get("idCategorie");
        String catNom = getText(catNode, "nom");

        if (idCatNode != null && !idCatNode.isNull() && idCatNode.asLong() > 0) {
            Optional<Category> existing = categorieService.findById(idCatNode.asLong());
            if (existing.isEmpty()) {
                throw new Exception("Catégorie non trouvée (ID: " + idCatNode.asLong() + ")");
            }
            return existing.get();
        } else if (catNom != null && !catNom.trim().isEmpty()) {
            String finalCatNom = catNom.trim();
            Optional<Category> existingByName = categorieService.findByNom(finalCatNom);
            if (existingByName.isPresent()) {
                return existingByName.get();
            } else {
                category.setNom(finalCatNom);
                category.setDescription(getText(catNode, "description"));
                return categorieService.createCategorie(category);
            }
        } else {
            throw new Exception("Catégorie invalide.");
        }
    }

    private String uploadImage(MultipartFile image) throws IOException {
        String uploadDir = "uploads/images/";
        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        Files.copy(image.getInputStream(), Paths.get(uploadDir + fileName));
        return fileName;
    }
}

// ========================
// CLASSE ERROR RESPONSE
// ========================
class ErrorResponse {
    private String error;
    public ErrorResponse(String error) { this.error = error; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}