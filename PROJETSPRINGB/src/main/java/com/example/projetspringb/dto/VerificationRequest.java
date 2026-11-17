package com.example.projetspringb.dto;

public class VerificationRequest {
    private String email;
    private String code;
    
    // Constructeurs
    public VerificationRequest() {}
    
    public VerificationRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }
    
    // Getters et Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}