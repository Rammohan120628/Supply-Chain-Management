package com.esfita.dto;

import java.util.Date;

import com.esfita.entity.AppPreference;
import com.esfita.entity.EntityEiisHib;

public class LoginResponseDTO {
	private String token;
	private String emailId;
	private int userId;
	private int userType;
	private int auditPk;
	private String firstName;
	private String lastName;
	private Date loginTime;
	private String numberFormat;
	private String stockPeriod;
	private String tenderPeriod;
	private String purchasePeriod;
	private String userName;
	private String currency;
	private String tokenExpire;
	private String cwhName;
	private EntityEiisHib entityEiis;

	
	
	public String getCwhName() {
		return cwhName;
	}

	public void setCwhName(String cwhName) {
		this.cwhName = cwhName;
	}

	public String getTokenExpire() {
		return tokenExpire;
	}

	public void setTokenExpire(String tokenExpire) {
		this.tokenExpire = tokenExpire;
	}

	public Date getLoginTime() {
		return loginTime;
	}

	public void setLoginTime(Date loginTime) {
		this.loginTime = loginTime;
	}

	
	public EntityEiisHib getEntityEiis() {
		return entityEiis;
	}

	public void setEntityEiis(EntityEiisHib entityEiis) {
		this.entityEiis = entityEiis;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getStockPeriod() {
		return stockPeriod;
	}

	public void setStockPeriod(String stockPeriod) {
		this.stockPeriod = stockPeriod;
	}

	public String getTenderPeriod() {
		return tenderPeriod;
	}

	public void setTenderPeriod(String tenderPeriod) {
		this.tenderPeriod = tenderPeriod;
	}

	

	public String getPurchasePeriod() {
		return purchasePeriod;
	}

	public void setPurchasePeriod(String purchasePeriod) {
		this.purchasePeriod = purchasePeriod;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public int getAuditPk() {
		return auditPk;
	}

	public void setAuditPk(int auditPk) {
		this.auditPk = auditPk;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmailId() {
		return emailId;
	}

	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public int getUserType() {
		return userType;
	}

	public void setUserType(int userType) {
		this.userType = userType;
	}

	public String getNumberFormat() {
		return numberFormat;
	}

	public void setNumberFormat(String numberFormat) {
		this.numberFormat = numberFormat;
	}

}
