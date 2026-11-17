package com.example.projetspringb.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmailService {
    
    @Value("${app.email.api-key:}")
    private String emailApiKey;
    
    @Value("${app.email.api-url:}")
    private String emailApiUrl;
    
    private final RestTemplate restTemplate;
    
    public EmailService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Envoie un code de vérification par email
     */
    public boolean envoyerCodeVerification(String email, String code) {
        try {
            // En production, utiliser un service d'email comme SendGrid, Mailgun, etc.
            // Pour le développement, on simule l'envoi
            
            System.out.println("📧 Email de vérification envoyé à: " + email);
            System.out.println("🔐 Code de vérification: " + code);
            
            // Simulation d'envoi réussi
            // En production, décommenter et configurer :
            /*
            EmailRequest emailRequest = new EmailRequest(
                email,
                "Votre code de vérification TechStore",
                createVerificationEmailContent(code)
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + emailApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<EmailRequest> request = new HttpEntity<>(emailRequest, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(emailApiUrl, request, String.class);
            
            return response.getStatusCode().is2xxSuccessful();
            */
            
            return true; // Simulation réussie
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Envoie une confirmation de commande
     */
    public boolean envoyerConfirmationCommande(String email, String numeroCommande, Double total) {
        try {
            System.out.println("📧 Confirmation de commande envoyée à: " + email);
            System.out.println("📦 Numéro de commande: " + numeroCommande);
            System.out.println("💰 Total: " + total + "€");
            
            // Simulation d'envoi réussi
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de la confirmation: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Crée le contenu HTML de l'email de vérification
     */
    private String createVerificationEmailContent(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                    .code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Vérification de votre email</h2>
                    <p>Utilisez le code suivant pour vérifier votre adresse email :</p>
                    <div class="code">%s</div>
                    <p>Ce code expirera dans 10 minutes.</p>
                    <div class="footer">
                        <p>TechStore - Votre boutique de confiance</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(code);
    }
}