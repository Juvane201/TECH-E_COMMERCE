package com.example.projetspringb.service;
import com.example.projetspringb.dto.OrderVenteRequest;
import com.example.projetspringb.model.*;
import com.example.projetspringb.repository.OrderVenteRepository;
import com.example.projetspringb.repository.ProduitVenteRepository; // Changement d'import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class OrderVenteService {
    
    @Autowired
    private OrderVenteRepository orderRepository;
    
    @Autowired
    private ProduitVenteRepository produitVenteRepository; // Changement ici
    
    public List<OrderVente> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<OrderVente> getOrderById(Long id) {
        return Optional.empty();
    }
    
    public OrderVente createOrder(OrderVenteRequest orderVenteRequest) {
        OrderVente ordervente = new OrderVente();
        ordervente.setShippingAddress(orderVenteRequest.getShippingAddress());
        
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;
        
        for (OrderVenteRequest.OrderItemRequest itemRequest : orderVenteRequest.getItems()) {
            Optional<ProduitVente> optionalProduit = produitVenteRepository.findById(itemRequest.getProductId()); // Changement ici
            if (optionalProduit.isPresent()) {
                ProduitVente produit = optionalProduit.get(); // Changement ici
                OrderVenteItem orderItem = new OrderVenteItem(); // Changement ici
                orderItems.addAll((Collection<? extends OrderItem>) orderItem);
                totalAmount += orderItem.getSubTotal();
                
                // Mettre à jour le stock
                produit.setStock(produit.getStock() - itemRequest.getQuantity());
                produitVenteRepository.save(produit);
            }
        }
        ordervente.setItems(orderItems);
        ordervente.setTotalAmount(totalAmount);
        
        return orderRepository.save(ordervente);
    }
}