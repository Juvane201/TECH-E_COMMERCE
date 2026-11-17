package com.example.projetspringb.dto;

import com.example.projetspringb.model.Role;

public class LoginResponse {
    private String message;
    private Long userId;
    private String email;
    private String role;

    // Constructeur par défaut (utile pour JSON, frameworks, etc.)
    public LoginResponse() {}

    // Constructeur principal
    public LoginResponse(String message, Long userId, String email, Role role) {
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.role = role != null ? role.name() : null; // Convertit l'enum en String
    }

    // Getters & Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}