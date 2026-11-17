package com.example.projetspringb.dto;

public class VerificationResponse {
    private boolean success;
    private String message;
    private boolean estVerifie;
    
    // Constructeurs
    public VerificationResponse() {}
    
    public VerificationResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public VerificationResponse(boolean success, String message, boolean estVerifie) {
        this.success = success;
        this.message = message;
        this.estVerifie = estVerifie;
    }
    
    // Getters et Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public boolean isEstVerifie() { return estVerifie; }
    public void setEstVerifie(boolean estVerifie) { this.estVerifie = estVerifie; }
}