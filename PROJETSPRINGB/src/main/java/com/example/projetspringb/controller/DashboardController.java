package com.example.projetspringb.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.projetspringb.service.DashboardService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            // En cas d'erreur, retourner des données par défaut
            Map<String, Object> defaultStats = new HashMap<>();
            defaultStats.put("produits", 0);
            defaultStats.put("clients", 0);
            defaultStats.put("ventes", 0);
            defaultStats.put("revenus", 0.0);
            defaultStats.put("produitsChange", 0);
            defaultStats.put("clientsChange", 0);
            defaultStats.put("ventesChange", 0);
            defaultStats.put("revenusChange", 0);
            return ResponseEntity.ok(defaultStats);
        }
    }

    @GetMapping("/activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        try {
            List<Map<String, Object>> activities = dashboardService.getRecentActivities();
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            // En cas d'erreur, retourner des activités par défaut
            List<Map<String, Object>> defaultActivities = new ArrayList<>();
            
            Map<String, Object> activity1 = new HashMap<>();
            activity1.put("description", "Système initialisé");
            activity1.put("date", LocalDateTime.now().minusHours(2));
            
            Map<String, Object> activity2 = new HashMap<>();
            activity2.put("description", "Dashboard activé");
            activity2.put("date", LocalDateTime.now().minusHours(1));
            
            defaultActivities.add(activity1);
            defaultActivities.add(activity2);
            
            return ResponseEntity.ok(defaultActivities);
        }
    }
}