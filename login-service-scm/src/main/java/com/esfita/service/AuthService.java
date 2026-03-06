package com.esfita.service;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.esfita.dto.LoginRequestDTO;
import com.esfita.dto.LoginResponseDTO;
import com.esfita.dto.ResetPasswordRequestDTO;
import com.esfita.dto.ResponseDTO;
import com.esfita.entity.MstUserAuditTrail;
import com.esfita.entity.MstUserHib;
import com.esfita.repository.EntityEiisRepository;
import com.esfita.repository.LocationRepository;
import com.esfita.repository.MstUserAuditTrailRepository;
import com.esfita.repository.MstUserRepository;
import com.esfita.util.AppUtils;
import com.esfita.util.JwtUtil;

@Service
public class AuthService {

	@Autowired
	private MstUserRepository userRepo;
	@Autowired
	private MstUserAuditTrailRepository auditRepo;
	@Autowired
	EntityEiisRepository entityEiisRepository;
	@Autowired
	LocationRepository locationRepository;
	@Autowired
	private JwtUtil jwtUtil;

	public ResponseDTO<LoginResponseDTO> loginds(LoginRequestDTO request) throws Exception {
		Optional<MstUserHib> optionalUser = userRepo.findByEmailId(request.getEmail());

		if (optionalUser.isEmpty()) {
			return ResponseDTO.<LoginResponseDTO>builder().success(false).message("User ID does not exist").data(null)
					.build();
		}

		MstUserHib user = optionalUser.get();

		if (!"A".equalsIgnoreCase(user.getStatus())) {
			return ResponseDTO.<LoginResponseDTO>builder().success(false).message("User is not active").data(null)
					.build();
		}



		// Invalidate old session
		user.setSessionToken(null);
		user.setSessionExpiry(null);

		String token = jwtUtil.generateToken(user.getEmailId());
		Date expiry = new Date(System.currentTimeMillis() + (30 * 60 * 1000));
		long minutes = (30 * 60 * 1000) / (60 * 1000);
		System.out.println("Time - " + minutes + " minutes");
		user.setSessionToken(token);
		
		user.setSessionExpiry(expiry);
		user.setLastSuccessLogin(new Date());
		userRepo.save(user);

		// Audit trail
		MstUserAuditTrail audit = new MstUserAuditTrail();
		audit.setUserFk(user.getUserPk());
		audit.setLoginTime(LocalDateTime.now());
		audit.setUserIpAddress(request.getIpAddress());
		audit.setBrowserDetails(request.getBrowserDetails());
		audit.setUserOsDetails(request.getOsDetails());
		audit.setCreatedBy(user.getUserPk());
		audit.setCreatedDate(LocalDateTime.now());
		auditRepo.save(audit);

		// Prepare response DTO
		LoginResponseDTO loginResponse = new LoginResponseDTO();
		loginResponse.setToken(token);
		loginResponse.setUserId(user.getUserPk());
		loginResponse.setUserType(user.getUserType());
		loginResponse.setEmailId(user.getEmailId());
		loginResponse.setFirstName(user.getFirstName());
		loginResponse.setLastName(user.getLastName());
		loginResponse.setUserName(user.getUserName());
		loginResponse.setAuditPk(audit.getUserAuditTrailPk());
		loginResponse.setLoginTime(new Date());
			
		// Load preferences from entityeiis
		entityEiisRepository.findTopByOrderByPkDesc().ifPresent(entity -> {
		    loginResponse.setEntityEiis(entity);
		    loginResponse.setNumberFormat(getFormat(entity.getNumberFormat()));

		    String dateFormat = entity.getApDateFormat() != null ? entity.getApDateFormat() : "dd-MM-yyyy";
		    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat);

		    if (entity.getTenderPeriod() != null) {
		        loginResponse.setTenderPeriod(entity.getTenderPeriod().toInstant()
		                .atZone(ZoneId.systemDefault())
		                .toLocalDate()
		                .format(formatter));
		    }

		    if (entity.getPurchasePeriod() != null) {
		        loginResponse.setPurchasePeriod(entity.getPurchasePeriod().toInstant()
		                .atZone(ZoneId.systemDefault())
		                .toLocalDate()
		                .format(formatter));
		    }

		    if (entity.getStockPeriod() != null) {
		        loginResponse.setStockPeriod(entity.getStockPeriod().toInstant()
		                .atZone(ZoneId.systemDefault())
		                .toLocalDate()
		                .format(formatter));
		    }
		});


	
		return ResponseDTO.<LoginResponseDTO>builder().success(true).message("Login successful").data(loginResponse)
				.build();
	}
	
	public ResponseDTO<LoginResponseDTO> login(LoginRequestDTO request) throws Exception {
	    Optional<MstUserHib> optionalUser = userRepo.findByEmailId(request.getEmail());

	    if (optionalUser.isEmpty()) {
	        return ResponseDTO.<LoginResponseDTO>builder().success(false).message("User ID does not exist").data(null)
	                .build();
	    }

	    MstUserHib user = optionalUser.get();

	    if (!"A".equalsIgnoreCase(user.getStatus())) {
	        return ResponseDTO.<LoginResponseDTO>builder().success(false).message("User is not active").data(null)
	                .build();
	    }
	    
//		if (!AppUtils.decrypt(user.getPassword()).trim().equals(request.getPassword().trim())) {
//		return ResponseDTO.<LoginResponseDTO>builder().success(false).message("Invalid credentials").data(null)
//				.build();
//	}

	    // Invalidate old session
	    user.setSessionToken(null);
	    user.setSessionExpiry(null);

	    String token = jwtUtil.generateToken(user.getEmailId());
	    
	    // Set session expiry to 30 minutes (same as token)
	    
	    Date expiry = new Date(System.currentTimeMillis() + (30 * 60 * 1000));
		long minutes = (30 * 60 * 1000) / (60 * 1000);
		System.out.println("Time - " + minutes + " minutes");
	    
	    user.setSessionToken(token);
	    user.setSessionExpiry(expiry);
	    user.setLastSuccessLogin(new Date());
	    userRepo.save(user);

	    // ... rest of your login method remains the same
	    // Audit trail
	    MstUserAuditTrail audit = new MstUserAuditTrail();
	    audit.setUserFk(user.getUserPk());
	    audit.setLoginTime(LocalDateTime.now());
	    audit.setUserIpAddress(request.getIpAddress());
	    audit.setBrowserDetails(request.getBrowserDetails());
	    audit.setUserOsDetails(request.getOsDetails());
	    audit.setCreatedBy(user.getUserPk());
	    audit.setCreatedDate(LocalDateTime.now());
	    audit.setEntityFk(user.getEntityFk());
	    auditRepo.save(audit);

	    // Prepare response DTO
	    LoginResponseDTO loginResponse = new LoginResponseDTO();
	    loginResponse.setToken(token);
	    loginResponse.setUserId(user.getUserPk());
	    loginResponse.setUserType(user.getUserType());
	    loginResponse.setEmailId(user.getEmailId());
	    loginResponse.setFirstName(user.getFirstName());
	    loginResponse.setLastName(user.getLastName());
	    loginResponse.setUserName(user.getUserName());
	    loginResponse.setAuditPk(audit.getUserAuditTrailPk());
	    loginResponse.setLoginTime(new Date());
		loginResponse.setTokenExpire(new SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(user.getSessionExpiry()));

	        
	    // Load preferences from entityeiis
	    entityEiisRepository.findTopByOrderByPkDesc().ifPresent(entity -> {
	        loginResponse.setEntityEiis(entity);
	        loginResponse.setNumberFormat(getFormat(entity.getNumberFormat()));

	        String dateFormat = entity.getApDateFormat() != null ? entity.getApDateFormat() : "dd-MM-yyyy";
	        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat);
	        
	        
	        
			if (entity.getCwh() != null) {
				locationRepository.findByLocationId(entity.getCwh()).ifPresent(loc -> {
					loginResponse.setCwhName(loc.getLocationName());
				});
			}
	        
	        

	        if (entity.getTenderPeriod() != null) {
	            loginResponse.setTenderPeriod(entity.getTenderPeriod().toInstant()
	                    .atZone(ZoneId.systemDefault())
	                    .toLocalDate()
	                    .format(formatter));
	        }

	        if (entity.getPurchasePeriod() != null) {
	            loginResponse.setPurchasePeriod(entity.getPurchasePeriod().toInstant()
	                    .atZone(ZoneId.systemDefault())
	                    .toLocalDate()
	                    .format(formatter));
	        }

	        if (entity.getStockPeriod() != null) {
	            loginResponse.setStockPeriod(entity.getStockPeriod().toInstant()
	                    .atZone(ZoneId.systemDefault())
	                    .toLocalDate()
	                    .format(formatter));
	        }
	    });

	    return ResponseDTO.<LoginResponseDTO>builder().success(true).message("Login successful").data(loginResponse)
	            .build();
	}
	
	public static String getFormat(String formatType) {
        switch (formatType.toUpperCase()) {
            case "EUROPE":
                return "Decimal Separator: ',', Grouping Separator: '.', Grouping Pattern: 3-3-3";
            case "INDIAN":
                return "Decimal Separator: '.', Grouping Separator: ',', Grouping Pattern: 3-2-2";
            default: // US
                return "Decimal Separator: '.', Grouping Separator: ',', Grouping Pattern: 3-3-3";
        }
    }

	public void logout(String email) {
		userRepo.findByEmailId(email).ifPresent(user -> {
			user.setSessionToken(null);
			user.setSessionExpiry(null);
			userRepo.save(user);
		});
	}

	public void logout(String email, Integer auditTrailId) {
		userRepo.findByEmailId(email).ifPresent(user -> {
			user.setSessionToken(null);
			user.setSessionExpiry(null);
			userRepo.save(user);

			// Set logout time if trail exists
			auditRepo.findById(auditTrailId).ifPresent(audit -> {
				if (audit.getLogoutTime() == null) {
					audit.setLogoutTime(LocalDateTime.now());
					auditRepo.save(audit);
				}
			});
		});
	}

	public ResponseDTO<Void> resetPassword(ResetPasswordRequestDTO request) throws Exception {
		MstUserHib user = userRepo.findByEmailId(request.getEmail())
				.orElseThrow(() -> new RuntimeException("User ID does not exist"));

		if (!"A".equalsIgnoreCase(user.getStatus())) {
			return ResponseDTO.<Void>builder().success(false).message("User is not active").build();
		}
		user.setPassword(AppUtils.encrypt(request.getNewPassword()));
		user.setPasswordChangedDate(new Date());

		userRepo.save(user);

		return ResponseDTO.<Void>builder().success(true).message("Password reset successfully").build();
	}

}
