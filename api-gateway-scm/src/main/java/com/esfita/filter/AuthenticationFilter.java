package com.esfita.filter;

import java.io.IOException;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.esfita.entity.MstUserHib;
import com.esfita.repository.MstUserRepository;
import com.esfita.util.JwtUtil;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.Tracer.SpanInScope;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(2) // CorsFilter should be @Order(1)
public class AuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private RouteValidator validator;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private MstUserRepository userRepo;
    @Autowired
    private Tracer tracer;

    private static final long SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 10 minutes //now im set 30 mins
    private static final long SESSION_RENEW_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Allow OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        Span span = tracer.nextSpan().name("api-gateway-scm").start();
        try (SpanInScope ws = tracer.withSpan(span)) {

            logger.info("Request URL: {}, Method: {}, Content-Type: {}",
                    request.getRequestURI(),
                    request.getMethod(),
                    request.getContentType());

            // Only secure routes
            if (validator.isSecured.test(request)) {
                String token = extractToken(request);
                if (token == null || token.isBlank()) {
                    sendJsonError(response, "Missing Bearer token in Authorization header");
                    return;
                }

                String email;
                try (SpanInScope tok = tracer.withSpan(span)) {
                    email = jwtUtil.extractUsername(token);
                } catch (Exception e) {
                    span.error(e);
                    sendJsonError(response, "Invalid token structure: " + e.getMessage());
                    return;
                }

                MstUserHib user = userRepo.findByEmailId(email);
                if (user == null || user.getSessionToken() == null || !user.getSessionToken().equals(token)) {
                    sendJsonError(response, "Session expired or invalid. Please login again.");
                    return;
                }

                if (user.getSessionExpiry() == null || user.getSessionExpiry().before(new Date())) {
                    sendJsonError(response, "Session expired due to inactivity.");
                    return;
                }

                // Auto-renew session if near expiry
                long timeLeft = user.getSessionExpiry().getTime() - System.currentTimeMillis();

                long minutesLeft = timeLeft / (60 * 1000);
                logger.info("Session time left for user {} : {} minutes", email, minutesLeft);

                    user.setSessionExpiry(new Date(System.currentTimeMillis() + SESSION_TIMEOUT_MS));
                    userRepo.save(user);
                    logger.info("Session auto-renewed for user: {}", email);
               
                // Validate token signature and expiry
                try (SpanInScope val = tracer.withSpan(span)) {
                    jwtUtil.validateToken(token);
                } catch (Exception e) {
                    span.error(e);
                    sendJsonError(response, "Invalid token: " + e.getMessage());
                    return;
                }

                logger.info("Authentication successful for user: {}", email);
            }

            chain.doFilter(request, response);

        } catch (Exception e) {
            span.error(e);
            logger.error("Error in authentication filter", e);
            sendJsonError(response, "Internal server error: " + e.getMessage());
        } finally {
            span.end();
        }
    }

    /**
     * Extract JWT token only from Authorization header.
     * DO NOT try to read form-data or multipart body here (it will break @RequestPart in controllers).
     */
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            logger.info("✅ Token extracted from Authorization header");
            return authHeader.substring(7); // Remove "Bearer " prefix
        }

        logger.error("❌ No valid token found in Authorization header");
        return null;
    }

    private void sendJsonError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\": false, \"message\": \"" + message + "\", \"data\": null}");
    }
}
