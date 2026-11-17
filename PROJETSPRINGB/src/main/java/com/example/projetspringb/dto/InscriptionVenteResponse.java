package com.example.projetspringb.dto;

public class InscriptionVenteResponse {
    private String message;
    private Long userId;
    private String email;

    // Constructeurs
    public InscriptionVenteResponse(String string, boolean b, Long long1, String string2, String string3, String string4, String string5) {}

    public InscriptionVenteResponse(String message, Long userId, String email) {
        this.message = message;
        this.userId = userId;
        this.email = email;
    }

    // Getters et Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}