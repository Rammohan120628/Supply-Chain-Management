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

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "entityeiis")
public class EntityEiisHib implements Serializable {

    private static final long serialVersionUID = 3725050690026705071L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PK", updatable = false)
    private int pk;

    @Column(name = "CWH")
    private String cwh;

    @Column(name = "TENDER_COUNT")
    private int tenderCount;

    @Column(name = "TENDER_PERIOD")
    private Date tenderPeriod;

    @Column(name = "PURCHASE_PERIOD")
    private Date purchasePeriod;

    @Column(name = "STOCK_PERIOD")
    private Date stockPeriod;

    // 0 = Stock Open, 1 = Physical Stock Started, 2 = Physical Stock Finalized
    @Column(name = "STOCK_CLOSING")
    private int stockClosing;

    @Column(name = "ENTITY")
    private String entity;

    @Column(name = "CURRENCY_ID")
    private String currencyId;

    @Column(name = "INTREST_RATE")
    private double interestRate;

    @Column(name = "PROCESS")
    private int process;

    @Column(name = "CASH_OP_BALANCE")
    private double cashOpBalance;

    @Column(name = "DECIMAL_TO_VALUE")
    private int decimalToValue;

    @Column(name = "DECIMAL_TO_QTY")
    private int decimalToQty;

    @Column(name = "MANAGER")
    private String manager;

    @Column(name = "ENTITY_NAME")
    private String entityName;

    @Column(name = "COUNTRY")
    private String country;

    @Column(name = "LOGO_PATH")
    private String logoPath;

    @Column(name = "REPORT_LOGO_PATH")
    private String reportLogoPath;

    @Column(name = "AP_DATE_FORMAT")
    private String apDateFormat;

    @Column(name = "AP_DATE_TIME_FORMAT")
    private String apDateTimeFormat;

    @Column(name = "AP_LANGUAGE")
    private String apLanguage;

    @Column(name = "AP_TIME_ZONE")
    private String apTimeZone;

    @Column(name = "NUMBER_FORMAT")
    private String numberFormat;

    @Column(name = "JSON_PATH")
    private String jsonPath;
    
    @Column(name = "IP_ADDRESS")
    private String ipAddress;

    // ======== Getters and Setters =========

    
    
    public int getPk() {
        return pk;
    }

    public String getJsonPath() {
		return jsonPath;
	}

	public void setJsonPath(String jsonPath) {
		this.jsonPath = jsonPath;
	}

	public String getIpAddress() {
		return ipAddress;
	}

	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	public void setPk(int pk) {
        this.pk = pk;
    }

    public String getCwh() {
        return cwh;
    }

    public void setCwh(String cwh) {
        this.cwh = cwh;
    }

    public int getTenderCount() {
        return tenderCount;
    }

    public void setTenderCount(int tenderCount) {
        this.tenderCount = tenderCount;
    }

    public Date getTenderPeriod() {
        return tenderPeriod;
    }

    public void setTenderPeriod(Date tenderPeriod) {
        this.tenderPeriod = tenderPeriod;
    }

    public Date getPurchasePeriod() {
        return purchasePeriod;
    }

    public void setPurchasePeriod(Date purchasePeriod) {
        this.purchasePeriod = purchasePeriod;
    }

    public Date getStockPeriod() {
        return stockPeriod;
    }

    public void setStockPeriod(Date stockPeriod) {
        this.stockPeriod = stockPeriod;
    }

    public int getStockClosing() {
        return stockClosing;
    }

    public void setStockClosing(int stockClosing) {
        this.stockClosing = stockClosing;
    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }

    public String getCurrencyId() {
        return currencyId;
    }

    public void setCurrencyId(String currencyId) {
        this.currencyId = currencyId;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public int getProcess() {
        return process;
    }

    public void setProcess(int process) {
        this.process = process;
    }

    public double getCashOpBalance() {
        return cashOpBalance;
    }

    public void setCashOpBalance(double cashOpBalance) {
        this.cashOpBalance = cashOpBalance;
    }

    public int getDecimalToValue() {
        return decimalToValue;
    }

    public void setDecimalToValue(int decimalToValue) {
        this.decimalToValue = decimalToValue;
    }

    public int getDecimalToQty() {
        return decimalToQty;
    }

    public void setDecimalToQty(int decimalToQty) {
        this.decimalToQty = decimalToQty;
    }

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getLogoPath() {
        return logoPath;
    }

    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }

   

    public String getReportLogoPath() {
		return reportLogoPath;
	}

	public void setReportLogoPath(String reportLogoPath) {
		this.reportLogoPath = reportLogoPath;
	}

	public String getApDateFormat() {
        return apDateFormat;
    }

    public void setApDateFormat(String apDateFormat) {
        this.apDateFormat = apDateFormat;
    }

    public String getApDateTimeFormat() {
        return apDateTimeFormat;
    }

    public void setApDateTimeFormat(String apDateTimeFormat) {
        this.apDateTimeFormat = apDateTimeFormat;
    }

    public String getApLanguage() {
        return apLanguage;
    }

    public void setApLanguage(String apLanguage) {
        this.apLanguage = apLanguage;
    }

    public String getApTimeZone() {
        return apTimeZone;
    }

    public void setApTimeZone(String apTimeZone) {
        this.apTimeZone = apTimeZone;
    }

    public String getNumberFormat() {
        return numberFormat;
    }

    public void setNumberFormat(String numberFormat) {
        this.numberFormat = numberFormat;
    }
}
