package com.example.projetspringb.controller;

import com.example.projetspringb.model.Category;
import com.example.projetspringb.service.CategorieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:4200")
public class CategorieController {
    
    private final CategorieService categorieService;

    @Autowired
    public CategorieController(CategorieService categorieService) {
        this.categorieService = categorieService;
    }

    // ✅ ASSUREZ-VOUS QUE CET ENDPOINT EXISTE
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            System.out.println("📋 Fetching all categories...");
            List<Category> categories = categorieService.findAll();
            System.out.println("✅ Found " + categories.size() + " categories");
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            System.err.println("❌ Error fetching categories: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ ENDPOINT POUR CRÉER UNE CATÉGORIE (si nécessaire)
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        try {
            System.out.println("🆕 Creating new category: " + category.getNom());
            Category savedCategory = categorieService.createCategorie(category);
            return ResponseEntity.ok(savedCategory);
        } catch (Exception e) {
            System.err.println("❌ Error creating category: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}