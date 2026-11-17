package com.example.projetspringb.repository;

import com.example.projetspringb.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findTop10ByOrderByCreatedAtDesc();
    List<Product> findByNomContainingIgnoreCase(String keyword);
    long countByCreatedAtBetween(LocalDateTime atStartOfDay, LocalDateTime atTime);

}