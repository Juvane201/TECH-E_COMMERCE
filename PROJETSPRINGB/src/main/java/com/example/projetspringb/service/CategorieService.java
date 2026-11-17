package com.example.projetspringb.service;

import com.example.projetspringb.model.Category;
import com.example.projetspringb.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategorieService {
    @Autowired
    private CategorieRepository categorieRepository;

    public Optional<Category> findByNom(String nom) {
        System.out.println("Searching for category with nom: " + nom);
        return categorieRepository.findByNom(nom);
    }

    public Category createCategorie(Category categorie) {
        System.out.println("Saving category: " + categorie.getNom());
        return categorieRepository.save(categorie);
    }
    
    public Optional<Category> findById(Long id) {
    return categorieRepository.findById(id);
    }

    public List<Category> findAll() {
        return categorieRepository.findAll();
    }
}