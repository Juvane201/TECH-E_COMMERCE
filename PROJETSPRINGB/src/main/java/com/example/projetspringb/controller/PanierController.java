package com.example.projetspringb.controller;


import com.example.projetspringb.model.Order;
import com.example.projetspringb.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/panier")
@CrossOrigin(origins = "http://localhost:4200")
public class PanierController {
private final OrderService orderService;

    public PanierController(OrderService orderService) {
        this.orderService = orderService;
    }
 @GetMapping
    public List<Order> getAllPaniers() {
        return orderService.findAll();
 }
 @PostMapping
    public Order addPanier(@RequestBody Order panier) {
        return orderService.save(panier);

 }
 @PutMapping
    public Order updatePanier(@RequestBody Order panier) {
        return orderService.save(panier);
 }
}
