package com.example.projetspringb.repository;

import com.example.projetspringb.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Trouver par username
    User findByUsername(String username);
    
    // Trouver par email
    Optional<User> findByEmail(String email);
    
    // Compter par rôle
    long countByRole(String role);
    
    // Vérifier si email existe
    boolean existsByEmail(String email);
    
    // Vérifier si username existe
    boolean existsByUsername(String username);
    
    // Trouver par email ou username
    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.username = :identifier")
    Optional<User> findByEmailOrUsername(@Param("identifier") String identifier);
}