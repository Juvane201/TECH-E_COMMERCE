package com.example.projetspringb.service;

import com.example.projetspringb.model.User;
import com.example.projetspringb.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthVenteService {

    @Autowired
    private UserRepository userRepository;

    public User login(String email, String password) {
        // Rechercher l'utilisateur par email
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        
        User user = userOpt.get();
        
        // Vérifier le mot de passe
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Mot de passe incorrect");
        }
        
        return user;
    }

    public User register(String username, String password, String email, String nom, String prenom) {
        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        
        // Vérifier si le username existe déjà
        if (userRepository.findByUsername(username) != null) {
            throw new RuntimeException("Ce nom d'utilisateur est déjà utilisé");
        }
        
        // Créer un nouvel utilisateur
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        user.setNom(nom);
        user.setPrenom(prenom);
        user.setRole("USER");
        
        return userRepository.save(user);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public boolean checkUsernameExists(String username) {
        return userRepository.findByUsername(username) != null;
    }

    // Méthode pour créer un admin par défaut
    public void createDefaultAdmin() {
        // Vérifier si l'admin existe déjà
        if (userRepository.findByEmail("rjnantenaina").isEmpty()) {
            User admin = new User();
            admin.setUsername("rjnantenaina");
            admin.setPassword("111111");
            admin.setEmail("rjnantenaina");
            admin.setNom("Admin");
            admin.setPrenom("System");
            admin.setRole("ADMIN");
            
            userRepository.save(admin);
            System.out.println("Admin par défaut créé: rjnantenaina / 111111");
        }
    }
}