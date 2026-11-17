package com.example.projetspringb.service;

import com.example.projetspringb.model.*;
import com.example.projetspringb.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private ProductService productService;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    @Transactional
    public Order createOrder(Long userId) {
        // Votre code existant...
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<OrderItem> orderItems = new ArrayList<>();
        for (Cart cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId()).orElseThrow();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            productService.updateStock(cartItem.getProductId(), cartItem.getQuantity());
        }
        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);
        cartRepository.deleteByUserId(userId);
        return order;
    }
}