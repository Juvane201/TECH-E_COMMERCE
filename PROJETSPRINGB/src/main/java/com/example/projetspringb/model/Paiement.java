package com.example.projetspringb.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
public class Paiement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_transaction", unique = true, nullable = false)
    private String numeroTransaction;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    @JsonIgnore
    private Commande commande;
    
    @Column(nullable = false)
    private Double montant;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MethodePaiement methodePaiement;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutPaiement statut;
    
    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;
    
    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;
    
    // ✅ CHAMPS STRIPE AJOUTÉS
    @Column(name = "session_id_stripe")
    private String sessionIdStripe;
    
    @Column(name = "payment_intent_id")
    private String paymentIntentId;
    
    @Column(name = "client_secret")
    private String clientSecret;
    
    // Informations utilisateur sauvegardées
    @Column(name = "email_utilisateur", nullable = false)
    private String emailUtilisateur;
    
    @Column(name = "nom_utilisateur", nullable = false)
    private String nomUtilisateur;
    
    @Column(name = "prenom_utilisateur", nullable = false)
    private String prenomUtilisateur;
    
    @Column(name = "telephone_utilisateur")
    private String telephoneUtilisateur;
    
    @Column(name = "adresse_utilisateur", nullable = false)
    private String adresseUtilisateur;
    
    @Column(name = "ville_utilisateur", nullable = false)
    private String villeUtilisateur;
    
    @Column(name = "code_postal_utilisateur", nullable = false)
    private String codePostalUtilisateur;
    
    // Constructeurs
    public Paiement() {
        this.dateCreation = LocalDateTime.now();
        this.numeroTransaction = genererNumeroTransaction();
        this.statut = StatutPaiement.EN_ATTENTE;
    }
    
    public Paiement(Commande commande, Double montant, String emailUtilisateur) {
        this();
        this.commande = commande;
        this.montant = montant;
        this.emailUtilisateur = emailUtilisateur;
    }
    
    // Méthode pour générer un numéro de transaction unique
    private String genererNumeroTransaction() {
        return "TXN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNumeroTransaction() { return numeroTransaction; }
    public void setNumeroTransaction(String numeroTransaction) { this.numeroTransaction = numeroTransaction; }
    
    @JsonIgnore
    public Commande getCommande() { return commande; }
    public void setCommande(Commande commande) { this.commande = commande; }
    
    @JsonProperty("commandeId")
    public Long getCommandeId() {
        return commande != null ? commande.getId() : null;
    }
    
    @JsonProperty("numeroCommande")
    public String getNumeroCommande() {
        return commande != null ? commande.getNumeroCommande() : null;
    }
    
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
    
    // ✅ GETTERS ET SETTERS POUR LES CHAMPS STRIPE
    public String getSessionIdStripe() { return sessionIdStripe; }
    public void setSessionIdStripe(String sessionIdStripe) { this.sessionIdStripe = sessionIdStripe; }
    
    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    
    public String getEmailUtilisateur() { return emailUtilisateur; }
    public void setEmailUtilisateur(String emailUtilisateur) { this.emailUtilisateur = emailUtilisateur; }
    
    public String getNomUtilisateur() { return nomUtilisateur; }
    public void setNomUtilisateur(String nomUtilisateur) { this.nomUtilisateur = nomUtilisateur; }
    
    public String getPrenomUtilisateur() { return prenomUtilisateur; }
    public void setPrenomUtilisateur(String prenomUtilisateur) { this.prenomUtilisateur = prenomUtilisateur; }
    
    public String getTelephoneUtilisateur() { return telephoneUtilisateur; }
    public void setTelephoneUtilisateur(String telephoneUtilisateur) { this.telephoneUtilisateur = telephoneUtilisateur; }
    
    public String getAdresseUtilisateur() { return adresseUtilisateur; }
    public void setAdresseUtilisateur(String adresseUtilisateur) { this.adresseUtilisateur = adresseUtilisateur; }
    
    public String getVilleUtilisateur() { return villeUtilisateur; }
    public void setVilleUtilisateur(String villeUtilisateur) { this.villeUtilisateur = villeUtilisateur; }
    
    public String getCodePostalUtilisateur() { return codePostalUtilisateur; }
    public void setCodePostalUtilisateur(String codePostalUtilisateur) { this.codePostalUtilisateur = codePostalUtilisateur; }
}