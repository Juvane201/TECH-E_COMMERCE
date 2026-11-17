package com.example.projetspringb.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders") // ⚠️ "order" est un mot réservé SQL, utilisez "orders"
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String status;

    // ⚠️ CORRECTION : Order a des OrderItem, pas d'autres Order
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems; // ⚠️ Changez Order → OrderItem

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<OrderItem> getOrderItems() { return orderItems; } // ⚠️ Changez le type
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; } // ⚠️ Changez le type
}