package com.esfita.filter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.function.Predicate;
@Component
public class RouteValidator {
	private static final List<String> openEndpoints = List.of("/auth/login", "/api/auth/register", "/swagger",
			"/v3/api-docs", "/actuator");
	public Predicate<HttpServletRequest> isSecured = request -> {
		// ✅ CRITICAL: OPTIONS requests must NOT be secured (for CORS preflight)
		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			return false;
		}
		
		// Check if request URI matches any open endpoint
		return openEndpoints.stream()
				.noneMatch(uri -> request.getRequestURI().startsWith(uri));
	};
}