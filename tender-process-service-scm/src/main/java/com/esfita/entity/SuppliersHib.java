package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "SUPPLIERS", schema = "PUBLIC")
public class SuppliersHib implements Serializable {

    private static final long serialVersionUID = 3725050690026705071L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SUPPLIER_PK", updatable = false)
    private Integer supplierPk;

    @Column(name = "SUPPLIER_ID")
    private String supplierId;

    @Column(name = "SUPPLIER_NAME")
    private String supplierName;

    @Column(name = "ADDRESS1")
    private String address1;

    @Column(name = "ADDRESS2")
    private String address2;

    @Column(name = "COUNTRY_ID")
    private String countryId;

    @Column(name = "CURRENCY_ID")
    private String currencyId;

    @Column(name = "CURRENCY_RATE")
    private Double currencyRate;

    @Column(name = "FAX_NO")
    private String faxNo;

    @Column(name = "TEL_NO")
    private String telNo;

    @Column(name = "MOB_NO")
    private String mobNo;

    @Column(name = "PAGER_NO")
    private String pagerNo;

    @Column(name = "EMAIL_NO")
    private String emailNo;

    @Column(name = "WEB_SITE")
    private String webSite;

    @Column(name = "CONTACT_PERSON1")
    private String contactPerson1;

    @Column(name = "CONTACT1TEL_NO")
    private String contact1TelNo;

    @Column(name = "CONTACT1MOB_NO")
    private String contact1MobNo;

    @Column(name = "CONTACT1EMAIL_NO")
    private String contact1EmailNo;

    @Column(name = "CONTACT_PERSON2")
    private String contactPerson2;

    @Column(name = "CONTACT2TEL_NO")
    private String contact2TelNo;

    @Column(name = "CONTACT2MOB_NO")
    private String contact2MobNo;

    @Column(name = "CONTACT2EMAIL_NO")
    private String contact2EmailNo;

    @Column(name = "DISCOUNT_PER")
    private Double discountPer;

    @Column(name = "NO_DAYS")
    private Integer noDays;

    @Column(name = "USER_ID")
    private String userId;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "IS_ACTIVE")
    private Integer isActive;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "CT01")
    private Double ct01;

    @Column(name = "CT02")
    private Double ct02;

    @Column(name = "CT03")
    private Double ct03;

    @Column(name = "CT04")
    private Double ct04;

    @Column(name = "OPER_REGION")
    private String operRegion;

    @Column(name = "ENTITY_ID")
    private String entityId;

    @Column(name = "IS_REGISTRED")
    private Integer isRegistred;

    @Column(name = "VAT_REGISTRED_NO")
    private String vatRegistredNo;

    @Column(name = "ORIGIN_SUPPLIERS")
    private String originSuppliers;

    @Column(name = "DISCOUNT")
    private String discount;

    @Column(name = "LAST_USER")
    private Integer lastUser;

    @Column(name = "LAST_UPDATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdate;

	public Integer getSupplierPk() {
		return supplierPk;
	}

	public void setSupplierPk(Integer supplierPk) {
		this.supplierPk = supplierPk;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public String getSupplierName() {
		return supplierName;
	}

	public void setSupplierName(String supplierName) {
		this.supplierName = supplierName;
	}

	public String getAddress1() {
		return address1;
	}

	public void setAddress1(String address1) {
		this.address1 = address1;
	}

	public String getAddress2() {
		return address2;
	}

	public void setAddress2(String address2) {
		this.address2 = address2;
	}

	public String getCountryId() {
		return countryId;
	}

	public void setCountryId(String countryId) {
		this.countryId = countryId;
	}

	public String getCurrencyId() {
		return currencyId;
	}

	public void setCurrencyId(String currencyId) {
		this.currencyId = currencyId;
	}

	public Double getCurrencyRate() {
		return currencyRate;
	}

	public void setCurrencyRate(Double currencyRate) {
		this.currencyRate = currencyRate;
	}

	public String getFaxNo() {
		return faxNo;
	}

	public void setFaxNo(String faxNo) {
		this.faxNo = faxNo;
	}

	public String getTelNo() {
		return telNo;
	}

	public void setTelNo(String telNo) {
		this.telNo = telNo;
	}

	public String getMobNo() {
		return mobNo;
	}

	public void setMobNo(String mobNo) {
		this.mobNo = mobNo;
	}

	public String getPagerNo() {
		return pagerNo;
	}

	public void setPagerNo(String pagerNo) {
		this.pagerNo = pagerNo;
	}

	public String getEmailNo() {
		return emailNo;
	}

	public void setEmailNo(String emailNo) {
		this.emailNo = emailNo;
	}

	public String getWebSite() {
		return webSite;
	}

	public void setWebSite(String webSite) {
		this.webSite = webSite;
	}

	public String getContactPerson1() {
		return contactPerson1;
	}

	public void setContactPerson1(String contactPerson1) {
		this.contactPerson1 = contactPerson1;
	}

	public String getContact1TelNo() {
		return contact1TelNo;
	}

	public void setContact1TelNo(String contact1TelNo) {
		this.contact1TelNo = contact1TelNo;
	}

	public String getContact1MobNo() {
		return contact1MobNo;
	}

	public void setContact1MobNo(String contact1MobNo) {
		this.contact1MobNo = contact1MobNo;
	}

	public String getContact1EmailNo() {
		return contact1EmailNo;
	}

	public void setContact1EmailNo(String contact1EmailNo) {
		this.contact1EmailNo = contact1EmailNo;
	}

	public String getContactPerson2() {
		return contactPerson2;
	}

	public void setContactPerson2(String contactPerson2) {
		this.contactPerson2 = contactPerson2;
	}

	public String getContact2TelNo() {
		return contact2TelNo;
	}

	public void setContact2TelNo(String contact2TelNo) {
		this.contact2TelNo = contact2TelNo;
	}

	public String getContact2MobNo() {
		return contact2MobNo;
	}

	public void setContact2MobNo(String contact2MobNo) {
		this.contact2MobNo = contact2MobNo;
	}

	public String getContact2EmailNo() {
		return contact2EmailNo;
	}

	public void setContact2EmailNo(String contact2EmailNo) {
		this.contact2EmailNo = contact2EmailNo;
	}

	public Double getDiscountPer() {
		return discountPer;
	}

	public void setDiscountPer(Double discountPer) {
		this.discountPer = discountPer;
	}

	public Integer getNoDays() {
		return noDays;
	}

	public void setNoDays(Integer noDays) {
		this.noDays = noDays;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Integer getIsActive() {
		return isActive;
	}

	public void setIsActive(Integer isActive) {
		this.isActive = isActive;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public Double getCt01() {
		return ct01;
	}

	public void setCt01(Double ct01) {
		this.ct01 = ct01;
	}

	public Double getCt02() {
		return ct02;
	}

	public void setCt02(Double ct02) {
		this.ct02 = ct02;
	}

	public Double getCt03() {
		return ct03;
	}

	public void setCt03(Double ct03) {
		this.ct03 = ct03;
	}

	public Double getCt04() {
		return ct04;
	}

	public void setCt04(Double ct04) {
		this.ct04 = ct04;
	}

	public String getOperRegion() {
		return operRegion;
	}

	public void setOperRegion(String operRegion) {
		this.operRegion = operRegion;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public Integer getIsRegistred() {
		return isRegistred;
	}

	public void setIsRegistred(Integer isRegistred) {
		this.isRegistred = isRegistred;
	}

	public String getVatRegistredNo() {
		return vatRegistredNo;
	}

	public void setVatRegistredNo(String vatRegistredNo) {
		this.vatRegistredNo = vatRegistredNo;
	}

	public String getOriginSuppliers() {
		return originSuppliers;
	}

	public void setOriginSuppliers(String originSuppliers) {
		this.originSuppliers = originSuppliers;
	}

	public String getDiscount() {
		return discount;
	}

	public void setDiscount(String discount) {
		this.discount = discount;
	}

	public Integer getLastUser() {
		return lastUser;
	}

	public void setLastUser(Integer lastUser) {
		this.lastUser = lastUser;
	}

	public Date getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

    
    
}