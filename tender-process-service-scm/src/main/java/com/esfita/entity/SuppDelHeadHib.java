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
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "suppdelhead")
public class SuppDelHeadHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3725050690026705071L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "PK", updatable = false)
	private int pk;
	@Column(name = "GRN_ID")
	private String grnId;

	@Column(name = "PERIOD")
	private Date period;

	@Column(name = "GRN_DATE")
	private Date grnDate;

	@Column(name = "SUPPLIER_ID")
	private String supplierId;

	@Column(name = "LPO_NUMBER")
	private String lpoNumber;

	@Column(name = "SUPP_DEL_NOTE_NO")
	private String suppDelNoteNo;

	@Column(name = "SUPP_DEL_DATE")
	private Date suppDelDate;

	@Column(name = "ORD_LOC_ID")
	private String ordLocId;

	@Column(name = "ORD_ORG_LOC_ID")
	private String ordOrgLocId;

	@Column(name = "CURRENCY_ID")
	private String currencyId;

	@Column(name = "CURRENCY_RATE")
	private double currencyRate;

	@Column(name = "CT01")
	private double ct01;

	@Column(name = "CT02")
	private double ct02;

	@Column(name = "CT03")
	private double ct03;

	@Column(name = "CT04")
	private double ct04;

	@Column(name = "OUR_GRP_INV_NO")
	private String ourGrpInvNo;

	@Column(name = "SUPP_INV_ID")
	private String suppInvId;

	@Column(name = "SUPP_INV_DATE")
	private Date suppInvDate;

	@Column(name = "DISCOUNT")
	private double discount;

	@Column(name = "ENTITY_ID")
	private String entityId;

	@Column(name = "ADJUST_VALUE")
	private double adjustValue;

	@Column(name = "NET_INVOICE")
	private double netInvoice;

	@Column(name = "STATUS_FK")
	private int statusFk;

	@Column(name = "LAST_USER")
	private int lastUser;

	@Column(name = "LAST_UPDATE")
	private Date lastUpdate;
	
	
	
	public int getPk() {
		return pk;
	}

	public void setPk(int pk) {
		this.pk = pk;
	}

	public String getGrnId() {
		return grnId;
	}

	public void setGrnId(String grnId) {
		this.grnId = grnId;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public Date getGrnDate() {
		return grnDate;
	}

	public void setGrnDate(Date grnDate) {
		this.grnDate = grnDate;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public String getLpoNumber() {
		return lpoNumber;
	}

	public void setLpoNumber(String lpoNumber) {
		this.lpoNumber = lpoNumber;
	}

	public String getSuppDelNoteNo() {
		return suppDelNoteNo;
	}

	public void setSuppDelNoteNo(String suppDelNoteNo) {
		this.suppDelNoteNo = suppDelNoteNo;
	}

	public Date getSuppDelDate() {
		return suppDelDate;
	}

	public void setSuppDelDate(Date suppDelDate) {
		this.suppDelDate = suppDelDate;
	}

	public String getOrdLocId() {
		return ordLocId;
	}

	public void setOrdLocId(String ordLocId) {
		this.ordLocId = ordLocId;
	}

	public String getOrdOrgLocId() {
		return ordOrgLocId;
	}

	public void setOrdOrgLocId(String ordOrgLocId) {
		this.ordOrgLocId = ordOrgLocId;
	}

	public String getCurrencyId() {
		return currencyId;
	}

	public void setCurrencyId(String currencyId) {
		this.currencyId = currencyId;
	}

	public double getCurrencyRate() {
		return currencyRate;
	}

	public void setCurrencyRate(double currencyRate) {
		this.currencyRate = currencyRate;
	}

	public double getCt01() {
		return ct01;
	}

	public void setCt01(double ct01) {
		this.ct01 = ct01;
	}

	public double getCt02() {
		return ct02;
	}

	public void setCt02(double ct02) {
		this.ct02 = ct02;
	}

	public double getCt03() {
		return ct03;
	}

	public void setCt03(double ct03) {
		this.ct03 = ct03;
	}

	public double getCt04() {
		return ct04;
	}

	public void setCt04(double ct04) {
		this.ct04 = ct04;
	}

	public String getOurGrpInvNo() {
		return ourGrpInvNo;
	}

	public void setOurGrpInvNo(String ourGrpInvNo) {
		this.ourGrpInvNo = ourGrpInvNo;
	}

	public String getSuppInvId() {
		return suppInvId;
	}

	public void setSuppInvId(String suppInvId) {
		this.suppInvId = suppInvId;
	}

	public Date getSuppInvDate() {
		return suppInvDate;
	}

	public void setSuppInvDate(Date suppInvDate) {
		this.suppInvDate = suppInvDate;
	}

	public double getDiscount() {
		return discount;
	}

	public void setDiscount(double discount) {
		this.discount = discount;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public double getAdjustValue() {
		return adjustValue;
	}

	public void setAdjustValue(double adjustValue) {
		this.adjustValue = adjustValue;
	}

	public double getNetInvoice() {
		return netInvoice;
	}

	public void setNetInvoice(double netInvoice) {
		this.netInvoice = netInvoice;
	}

	public int getStatusFk() {
		return statusFk;
	}

	public void setStatusFk(int statusFk) {
		this.statusFk = statusFk;
	}

	public int getLastUser() {
		return lastUser;
	}

	public void setLastUser(int lastUser) {
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
