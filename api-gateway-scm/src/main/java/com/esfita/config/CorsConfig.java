package com.esfita.config;
 
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
 
/**
* CORS Configuration for API Gateway MVC (Servlet-based)
* 
* ⚠️ IMPORTANT: This should ONLY exist in API Gateway, NOT in microservices!
* 
* Purpose:
* - Handles CORS preflight (OPTIONS) requests
* - Adds CORS headers to all responses
* - Allows Authorization header for Bearer token authentication
* 
* @author API Gateway Team
*/
@Configuration
public class CorsConfig {
    
    @Bean
    @org.springframework.core.annotation.Order(-1)  // Ensure this runs first
     CorsFilter corsFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // STEP 1: Allow Origins
        // Option A: Allow all origins (for development/testing)
        corsConfig.addAllowedOrigin("*");
        
        // Option B: Allow specific origins (recommended for production)
        // corsConfig.addAllowedOrigin("http://127.0.0.1:5500");
        // corsConfig.addAllowedOrigin("http://localhost:3000");
        // corsConfig.addAllowedOrigin("https://yourdomain.com");
        
        // STEP 2: Allow HTTP Methods
        corsConfig.addAllowedMethod("GET");
        corsConfig.addAllowedMethod("POST");
        corsConfig.addAllowedMethod("PUT");
        corsConfig.addAllowedMethod("DELETE");
        corsConfig.addAllowedMethod("OPTIONS");  // Required for preflight
        corsConfig.addAllowedMethod("PATCH");
        // OR simply: corsConfig.addAllowedMethod("*");
        
        // STEP 3: Allow Headers (CRITICAL!)
        // These headers are required for Authorization token
        corsConfig.addAllowedHeader("Content-Type");
        corsConfig.addAllowedHeader("Authorization");  // ✅ CRITICAL for Bearer token
        corsConfig.addAllowedHeader("X-Requested-With");
        corsConfig.addAllowedHeader("Accept");
        // OR simply: corsConfig.addAllowedHeader("*");
        
        // STEP 4: Expose Headers (if frontend needs to read response headers)
        corsConfig.addExposedHeader("Authorization");
        corsConfig.addExposedHeader("Content-Type");
        
        // STEP 5: Allow Credentials
        // Set to false when using allowedOrigin("*")
        // Set to true when using specific origins
        corsConfig.setAllowCredentials(false);
        
        // STEP 6: Cache Preflight Response (in seconds)
        // Browser will cache the preflight response for this duration
        corsConfig.setMaxAge(3600L);  // 1 hour
        
        // STEP 7: Apply Configuration to All Routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsFilter(source);
    }
}