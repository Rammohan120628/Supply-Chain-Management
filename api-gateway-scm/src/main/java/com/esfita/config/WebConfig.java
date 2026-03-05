//package com.esfita.config;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//import com.esfita.filter.AuthenticationFilter;
//
//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//
//	@Autowired
//	private AuthenticationFilter authFilter;
//
//	@Override
//	public void addInterceptors(InterceptorRegistry registry) {
//		// Do nothing - using filter not interceptor
//	}
//	
//	   @Override
//	    public void addCorsMappings(CorsRegistry registry) {
//	        registry.addMapping("/**")  // all endpoints
//	                .allowedOrigins("*") // or restrict to your domain
//	                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//	                .allowedHeaders("*")
//	                .allowCredentials(false)
//	                .maxAge(3600);
//	    }
//}
