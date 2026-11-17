package com.example.projetspringb.dto;


import java.util.List;

public class OrderRequest {
    private List<OrderItemRequest> items;
    private String shippingAddress;
    
    // Constructeurs
    public void OrderVenteRequest() {}
    
    // Getters et Setters
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
    
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        
        // Getters et Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}