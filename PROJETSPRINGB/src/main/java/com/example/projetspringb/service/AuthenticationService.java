package com.example.projetspringb.service;

import com.example.projetspringb.Config.JwtService;
import com.example.projetspringb.dto.LoginRequest;
import com.example.projetspringb.model.AuthenticationResponse;
import com.example.projetspringb.model.RegisterRequest;
import com.example.projetspringb.model.Utilisateur;
import com.example.projetspringb.repository.UtilisateurRepository;

import com.example.projetspringb.model.Role; // TON ENUM !
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    public AuthenticationService(UtilisateurRepository utilisateurRepository, 
                               PasswordEncoder passwordEncoder, 
                               JwtService jwtService,
                               AuthenticationManager authenticationManager) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }
    
    public AuthenticationResponse register(RegisterRequest request) {
        var utilisateur = new Utilisateur(
        );
        
        utilisateurRepository.save(utilisateur);
        
        var jwtToken = jwtService.generateToken(utilisateur);
        return new AuthenticationResponse(
            jwtToken,
            utilisateur.getEmail(),
            utilisateur.getRole().name(),
            utilisateur.getNom(),
            utilisateur.getPrenom()
        );
    }
    
    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        var utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow();
        
        var jwtToken = jwtService.generateToken(utilisateur);
        return new AuthenticationResponse(
            jwtToken,
            utilisateur.getEmail(),
            utilisateur.getRole().name(),
            utilisateur.getNom(),
            utilisateur.getPrenom()
        );
    }
}