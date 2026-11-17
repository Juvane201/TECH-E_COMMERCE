package com.example.projetspringb.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String dossierUpload = "uploads/images/";
        File dossier = new File(dossierUpload);
        
        String cheminAbsolu = dossier.getAbsolutePath();

        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + cheminAbsolu + File.separator);
    }
}