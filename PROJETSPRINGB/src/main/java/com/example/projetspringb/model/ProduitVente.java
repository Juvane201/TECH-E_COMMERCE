    package com.example.projetspringb.model;

    import jakarta.persistence.*;
    import jakarta.validation.constraints.Size;
    import java.time.LocalDateTime;

    @Entity
    @Table(name = "produit_vente")
    public class ProduitVente {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, length = 500)
        @Size(max = 500, message = "Le nom ne peut pas dépasser 500 caractères")
        private String name;

        @Column(columnDefinition = "TEXT")
        private String description;

        @Column(nullable = false)
        private Double price;

        @Column(name = "image_url", length = 1000)
        @Size(max = 1000, message = "L'URL de l'image ne peut pas dépasser 1000 caractères")
        private String imageUrl;

        @Column(nullable = false)
        private Integer stock;

        @Column(length = 100)
        @Size(max = 100, message = "La catégorie ne peut pas dépasser 100 caractères")
        private String category;

        @Column(name = "created_at")
        private LocalDateTime createdAt;

        @Column(name = "code_produit", length = 100)
        @Size(max = 100, message = "Le code produit ne peut pas dépasser 100 caractères")
        private String codeProduit;

        @Column(name = "est_en_promotion")
        private Boolean estEnPromotion = false;

        @Column(name = "prix_avant_promotion")
        private Double prixAvantPromotion;

        // ==================== CONSTRUCTEURS ====================

        public ProduitVente() {
            this.createdAt = LocalDateTime.now();
        }

        public ProduitVente(String name, String description, Double price, String imageUrl,
                            Integer stock, String category) {
            this();
            this.name = name;
            this.description = description;
            this.price = price;
            this.imageUrl = imageUrl;
            this.stock = stock;
            this.category = category;
        }

        // ==================== GETTERS & SETTERS ====================

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public Integer getStock() {
            return stock;
        }

        public void setStock(Integer stock) {
            this.stock = stock;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public String getCodeProduit() {
            return codeProduit;
        }

        public void setCodeProduit(String codeProduit) {
            this.codeProduit = codeProduit;
        }

        public Boolean getEstEnPromotion() {
            return estEnPromotion;
        }

        public void setEstEnPromotion(Boolean estEnPromotion) {
            this.estEnPromotion = estEnPromotion;
        }

        public Double getPrixAvantPromotion() {
            return prixAvantPromotion;
        }

        public void setPrixAvantPromotion(Double prixAvantPromotion) {
            this.prixAvantPromotion = prixAvantPromotion;
        }
    }