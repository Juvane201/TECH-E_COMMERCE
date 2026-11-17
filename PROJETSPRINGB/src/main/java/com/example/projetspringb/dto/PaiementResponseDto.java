// PaiementResponseDto.java
package com.example.projetspringb.dto;

import com.example.projetspringb.model.MethodePaiement;
import com.example.projetspringb.model.StatutPaiement;
import java.time.LocalDateTime;

public class PaiementResponseDto {
    private Long id;
    private String numeroTransaction;
    private String numeroCommande;
    private Double montant;
    private MethodePaiement methodePaiement;
    private StatutPaiement statut;
    private LocalDateTime dateCreation;
    private LocalDateTime datePaiement;
    private String emailUtilisateur;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    
    // Constructeurs
    public PaiementResponseDto() {}
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNumeroTransaction() { return numeroTransaction; }
    public void setNumeroTransaction(String numeroTransaction) { this.numeroTransaction = numeroTransaction; }
    
    public String getNumeroCommande() { return numeroCommande; }
    public void setNumeroCommande(String numeroCommande) { this.numeroCommande = numeroCommande; }
    
    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }
    
    public MethodePaiement getMethodePaiement() { return methodePaiement; }
    public void setMethodePaiement(MethodePaiement methodePaiement) { this.methodePaiement = methodePaiement; }
    
    public StatutPaiement getStatut() { return statut; }
    public void setStatut(StatutPaiement statut) { this.statut = statut; }
    
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    
    public LocalDateTime getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDateTime datePaiement) { this.datePaiement = datePaiement; }
    
    public String getEmailUtilisateur() { return emailUtilisateur; }
    public void setEmailUtilisateur(String emailUtilisateur) { this.emailUtilisateur = emailUtilisateur; }
    
    public String getNomUtilisateur() { return nomUtilisateur; }
    public void setNomUtilisateur(String nomUtilisateur) { this.nomUtilisateur = nomUtilisateur; }
    
    public String getPrenomUtilisateur() { return prenomUtilisateur; }
    public void setPrenomUtilisateur(String prenomUtilisateur) { this.prenomUtilisateur = prenomUtilisateur; }
}