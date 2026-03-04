package com.esfita.dto;

public class LogoutRequestDTO {
	private String token;
	private Integer auditTrailId;

	// Getters and Setters
	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public Integer getAuditTrailId() {
		return auditTrailId;
	}

	public void setAuditTrailId(Integer auditTrailId) {
		this.auditTrailId = auditTrailId;
	}
}
