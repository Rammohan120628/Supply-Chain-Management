package com.esfita.config;

import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class TracingFilter extends OncePerRequestFilter {

    private final Tracer tracer;

    public TracingFilter(Tracer tracer) {
        this.tracer = tracer;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        Span span = tracer.nextSpan().name("wrong-requests").start();
        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            filterChain.doFilter(request, response);

            // Capture status codes
            int status = response.getStatus();
            if (status >= 400) {
                span.tag("http.status_code", String.valueOf(status));
                span.error(new RuntimeException("HTTP error: " + status));
            }
        } catch (Exception e) { 
            throw e;
        } finally {
            span.end();
        }
    }
}
