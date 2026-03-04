package com.esfita.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Enable CORS for all endpoints
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // all endpoints
                .allowedOrigins("*") // or restrict to your domain
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
