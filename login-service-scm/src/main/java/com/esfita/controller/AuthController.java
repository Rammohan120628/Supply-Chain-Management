package com.esfita.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esfita.dto.LoginRequestDTO;
import com.esfita.dto.LoginResponseDTO;
import com.esfita.dto.LogoutRequestDTO;
import com.esfita.dto.ResetPasswordRequestDTO;
import com.esfita.dto.ResponseDTO;
import com.esfita.service.AuthService;
import com.esfita.util.JwtUtil;

import io.micrometer.observation.annotation.Observed;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "Authorization")
public class AuthController {

	@Autowired
	private AuthService authService;
	@Autowired
	private JwtUtil jwtUtil;
	

	@PostMapping("/login")
	@Observed(name = "login", contextualName = "login")
	public ResponseEntity<ResponseDTO<LoginResponseDTO>> login(@RequestBody LoginRequestDTO request) throws Exception {
		return ResponseEntity.ok(authService.login(request));
	}
	
	@PostMapping("/logout")
	@Observed(name = "logout", contextualName = "logout")
	public ResponseEntity<ResponseDTO<Void>> logout(@RequestBody LogoutRequestDTO request) {
	    String token = request.getToken();
	    String email = jwtUtil.extractUsername(token.substring(7));

	    authService.logout(email, request.getAuditTrailId());

	    ResponseDTO<Void> response = ResponseDTO.<Void>builder()
	        .success(true)
	        .message("Logout successful")
	        .build();

	    return ResponseEntity.ok(response);
	}
	
	@PostMapping("/reset-password")
	@Observed(name = "reset-password", contextualName = "reset-password")
	public ResponseEntity<ResponseDTO<Void>> resetPassword(@RequestBody ResetPasswordRequestDTO request) throws Exception {
	    return ResponseEntity.ok(authService.resetPassword(request));
	}


}
