package com.example.projetspringb.Config;

import com.example.projetspringb.model.Category;
import com.example.projetspringb.model.Product;
import com.example.projetspringb.model.ProduitVente;
import com.example.projetspringb.model.Role;
import com.example.projetspringb.model.Utilisateur;
import com.example.projetspringb.repository.CategorieRepository;
import com.example.projetspringb.repository.ProductRepository;
import com.example.projetspringb.repository.ProduitVenteRepository;
import com.example.projetspringb.repository.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initDatabase(
            UtilisateurRepository userRepo,
            CategorieRepository categorieRepo,
            ProductRepository productRepo,
            ProduitVenteRepository produitVenteRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            log.info("Initialisation des donnees de demarrage");

            initUtilisateurs(userRepo, passwordEncoder);
            initCategories(categorieRepo);
            initProduits(productRepo, categorieRepo);
            initProduitsVente(produitVenteRepo);

            log.info("Initialisation des donnees terminee");
        };
    }

    private void initUtilisateurs(UtilisateurRepository userRepo, PasswordEncoder passwordEncoder) {
        if (userRepo.count() > 0) {
            log.info("Utilisateurs deja presents : {}", userRepo.count());
            return;
        }

        Utilisateur admin = new Utilisateur();
        admin.setEmail("rj@gmail.com");
        admin.setPassword(passwordEncoder.encode("111111"));
        admin.setNom("Nantenaina");
        admin.setPrenom("RJ");
        admin.setAdresse("Lot II M 12 Bis");
        admin.setVille("Antananarivo");
        admin.setCodePostal("101");
        admin.setTelephone("+261340000001");
        admin.setRole(Role.ADMIN);
        admin.setEstVerifie(true);
        admin.setDateCreation(LocalDateTime.now());
        userRepo.save(admin);

        Utilisateur user = new Utilisateur();
        user.setEmail("utilisateur@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setNom("Rakoto");
        user.setPrenom("Jean");
        user.setAdresse("Lot A 45");
        user.setVille("Toamasina");
        user.setCodePostal("501");
        user.setTelephone("+261340000002");
        user.setRole(Role.USER);
        user.setEstVerifie(true);
        user.setDateCreation(LocalDateTime.now());
        userRepo.save(user);

        log.info("2 utilisateurs crees");
    }

    private void initCategories(CategorieRepository categorieRepo) {
        if (categorieRepo.count() > 0) {
            log.info("Categories deja presentes : {}", categorieRepo.count());
            return;
        }

        List<Category> categories = List.of(
                buildCategorie("Electronique", "Smartphones, ordinateurs, tablettes"),
                buildCategorie("Vetements", "Mode homme et femme"),
                buildCategorie("Maison", "Meubles et decoration"),
                buildCategorie("Sport", "Equipements sportifs")
        );
        categorieRepo.saveAll(categories);
        log.info("{} categories creees", categories.size());
    }

    private void initProduits(ProductRepository productRepo, CategorieRepository categorieRepo) {
        if (productRepo.count() > 0) {
            log.info("Produits deja presents : {}", productRepo.count());
            return;
        }

        Category electronique = categorieRepo.findAll().stream()
                .filter(c -> "Electronique".equals(c.getNom()))
                .findFirst()
                .orElse(null);

        Category vetements = categorieRepo.findAll().stream()
                .filter(c -> "Vetements".equals(c.getNom()))
                .findFirst()
                .orElse(null);

        Product p1 = new Product();
        p1.setNom("iPhone 15 Pro");
        p1.setDescription("Smartphone Apple derniere generation 256 Go");
        p1.setPrix(new BigDecimal("1499.99"));
        p1.setPrixOriginal(new BigDecimal("1699.99"));
        p1.setPromotion(10);
        p1.setStock(15);
        p1.setCategorie(electronique);
        p1.setImage("https://picsum.photos/seed/iphone/400/400");
        p1.setEstNouveau(true);
        p1.setDateAjout(LocalDateTime.now());
        p1.setCreatedAt(LocalDateTime.now());
        productRepo.save(p1);

        Product p2 = new Product();
        p2.setNom("MacBook Air M3");
        p2.setDescription("Ordinateur portable Apple 13 pouces");
        p2.setPrix(new BigDecimal("1299.00"));
        p2.setStock(8);
        p2.setCategorie(electronique);
        p2.setImage("https://picsum.photos/seed/macbook/400/400");
        p2.setEstNouveau(true);
        p2.setDateAjout(LocalDateTime.now());
        p2.setCreatedAt(LocalDateTime.now());
        productRepo.save(p2);

        Product p3 = new Product();
        p3.setNom("T-shirt Coton Bio");
        p3.setDescription("T-shirt 100% coton biologique");
        p3.setPrix(new BigDecimal("29.99"));
        p3.setStock(100);
        p3.setCategorie(vetements);
        p3.setImage("https://picsum.photos/seed/tshirt/400/400");
        p3.setEstNouveau(false);
        p3.setDateAjout(LocalDateTime.now());
        p3.setCreatedAt(LocalDateTime.now());
        productRepo.save(p3);

        log.info("3 produits crees");
    }

    private void initProduitsVente(ProduitVenteRepository produitVenteRepo) {
        if (produitVenteRepo.count() > 0) {
            log.info("Produits vente deja presents : {}", produitVenteRepo.count());
            return;
        }

        ProduitVente pv1 = new ProduitVente();
        pv1.setName("Samsung Galaxy S24");
        pv1.setDescription("Smartphone Android 256 Go");
        pv1.setPrice(999.99);
        pv1.setStock(20);
        pv1.setCategory("Electronique");
        pv1.setCodeProduit("SAM-S24-001");
        pv1.setImageUrl("https://picsum.photos/seed/samsung/400/400");
        pv1.setEstEnPromotion(false);
        pv1.setCreatedAt(LocalDateTime.now());
        produitVenteRepo.save(pv1);

        ProduitVente pv2 = new ProduitVente();
        pv2.setName("Casque Sony WH-1000XM5");
        pv2.setDescription("Casque Bluetooth a reduction de bruit");
        pv2.setPrice(349.99);
        pv2.setPrixAvantPromotion(399.99);
        pv2.setStock(50);
        pv2.setCategory("Electronique");
        pv2.setCodeProduit("SONY-XM5-001");
        pv2.setImageUrl("https://picsum.photos/seed/casque/400/400");
        pv2.setEstEnPromotion(true);
        pv2.setCreatedAt(LocalDateTime.now());
        produitVenteRepo.save(pv2);

        log.info("2 produits vente crees");
    }

    private Category buildCategorie(String nom, String description) {
        Category c = new Category();
        c.setNom(nom);
        c.setDescription(description);
        return c;
    }
}