package com.esfita.dto;

public class LoginRequestDTO {
	private String email;
	private String password;
	private String ipAddress;
	private String browserDetails;
	private String osDetails;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getIpAddress() {
		return ipAddress;
	}

	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}

	public String getBrowserDetails() {
		return browserDetails;
	}

	public void setBrowserDetails(String browserDetails) {
		this.browserDetails = browserDetails;
	}

	public String getOsDetails() {
		return osDetails;
	}

	public void setOsDetails(String osDetails) {
		this.osDetails = osDetails;
	}

}
