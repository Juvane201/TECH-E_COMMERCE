package com.example.projetspringb.service;

import com.example.projetspringb.model.DetailCommande;
import com.example.projetspringb.repository.DetailCommandeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetailCommandeService {

    private final DetailCommandeRepository detailCommandeRepository;

    public DetailCommandeService(DetailCommandeRepository detailCommandeRepository) {
        this.detailCommandeRepository = detailCommandeRepository;
    }

    public List<DetailCommande> findAll() {
        return detailCommandeRepository.findAll();
    }

    public Optional<DetailCommande> findById(Long id) {
        return detailCommandeRepository.findById(id);
    }

    // CORRIGÉ ICI
    public List<DetailCommande> findByCommandeId(Long idCommande) {
        return detailCommandeRepository.findByCommandeId(idCommande);
    }

    public DetailCommande save(DetailCommande detailCommande) {
        return detailCommandeRepository.save(detailCommande);
    }

    public void deleteById(Long id) {
        detailCommandeRepository.deleteById(id);
    }
}