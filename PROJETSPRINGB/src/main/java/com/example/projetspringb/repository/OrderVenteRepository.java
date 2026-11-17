package com.example.projetspringb.repository;


import com.example.projetspringb.model.OrderVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderVenteRepository extends JpaRepository<OrderVente, Long> {
}