package com.example.projetspringb.repository;

import com.example.projetspringb.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategorieRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNom(String nom);
}