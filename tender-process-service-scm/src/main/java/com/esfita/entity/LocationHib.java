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
@Table(name = "location", schema = "public")
public class LocationHib implements Serializable {

    private static final long serialVersionUID = 3725050690026705071L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOCATION_PK", updatable = false)
    private Integer locationPk;

    @Column(name = "LOCATION_ID")
    private String locationId;

    @Column(name = "LOCATION_NAME")
    private String locationName;

    @Column(name = "LOCATION_TYPE")
    private int locationType;

    @Column(name = "PAYMENT_TYPE")
    private int paymentType;

    @Column(name = "MARKET_SEGMENT")
    private Integer marketSegment;

    @Column(name = "ST_ADDRESS1")
    private String stAddress1;

    @Column(name = "ST_ADDRESS2")
    private String stAddress2;

    @Column(name = "COUNTRY_ID")
    private String countryId;

    @Column(name = "TEL_PHONE_NO")
    private String telPhoneNo;

    @Column(name = "LMID")
    private String lmid;

    @Column(name = "OMID")
    private String omid;

    @Column(name = "PMID")
    private String pmid;

    @Column(name = "IS_ACTIVE")
    private int isActive;

    @Column(name = "REGION")
    private String region;

    @Column(name = "CONTRACT_START_DT")
    @Temporal(TemporalType.DATE)
    private Date contractStartDt;

    @Column(name = "CONTRACT_END_DT")
    @Temporal(TemporalType.DATE)
    private Date contractEndDt;

    @Column(name = "ENTITY_ID")
    private String entityId;

    @Column(name = "LAST_USER")
    private Integer lastUser;

    @Column(name = "LAST_UPDATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdate;

    // Additional columns
    @Column(name = "CONTRACT")
    private Integer contract;

    @Column(name = "SEGMENT")
    private Integer segment;

    @Column(name = "IS_CWH")
    private Integer isCwh;

	public Integer getLocationPk() {
		return locationPk;
	}

	public void setLocationPk(Integer locationPk) {
		this.locationPk = locationPk;
	}

	public String getLocationId() {
		return locationId;
	}

	public void setLocationId(String locationId) {
		this.locationId = locationId;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public int getLocationType() {
		return locationType;
	}

	public void setLocationType(int locationType) {
		this.locationType = locationType;
	}

	public int getPaymentType() {
		return paymentType;
	}

	public void setPaymentType(int paymentType) {
		this.paymentType = paymentType;
	}

	public Integer getMarketSegment() {
		return marketSegment;
	}

	public void setMarketSegment(Integer marketSegment) {
		this.marketSegment = marketSegment;
	}

	public String getStAddress1() {
		return stAddress1;
	}

	public void setStAddress1(String stAddress1) {
		this.stAddress1 = stAddress1;
	}

	public String getStAddress2() {
		return stAddress2;
	}

	public void setStAddress2(String stAddress2) {
		this.stAddress2 = stAddress2;
	}

	public String getCountryId() {
		return countryId;
	}

	public void setCountryId(String countryId) {
		this.countryId = countryId;
	}

	public String getTelPhoneNo() {
		return telPhoneNo;
	}

	public void setTelPhoneNo(String telPhoneNo) {
		this.telPhoneNo = telPhoneNo;
	}

	public String getLmid() {
		return lmid;
	}

	public void setLmid(String lmid) {
		this.lmid = lmid;
	}

	public String getOmid() {
		return omid;
	}

	public void setOmid(String omid) {
		this.omid = omid;
	}

	public String getPmid() {
		return pmid;
	}

	public void setPmid(String pmid) {
		this.pmid = pmid;
	}

	public int getIsActive() {
		return isActive;
	}

	public void setIsActive(int isActive) {
		this.isActive = isActive;
	}

	public String getRegion() {
		return region;
	}

	public void setRegion(String region) {
		this.region = region;
	}

	public Date getContractStartDt() {
		return contractStartDt;
	}

	public void setContractStartDt(Date contractStartDt) {
		this.contractStartDt = contractStartDt;
	}

	public Date getContractEndDt() {
		return contractEndDt;
	}

	public void setContractEndDt(Date contractEndDt) {
		this.contractEndDt = contractEndDt;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
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

	public Integer getContract() {
		return contract;
	}

	public void setContract(Integer contract) {
		this.contract = contract;
	}

	public Integer getSegment() {
		return segment;
	}

	public void setSegment(Integer segment) {
		this.segment = segment;
	}

	public Integer getIsCwh() {
		return isCwh;
	}

	public void setIsCwh(Integer isCwh) {
		this.isCwh = isCwh;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

    
    
}
