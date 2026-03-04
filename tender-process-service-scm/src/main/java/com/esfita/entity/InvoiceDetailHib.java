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
@Table(name = "invoicedetail", schema = "public")
public class InvoiceDetailHib implements Serializable {

	public int getInvoicePk() {
		return invoicePk;
	}

	public void setInvoicePk(int invoicePk) {
		this.invoicePk = invoicePk;
	}

	public String getOurGrpInvNo() {
		return ourGrpInvNo;
	}

	public void setOurGrpInvNo(String ourGrpInvNo) {
		this.ourGrpInvNo = ourGrpInvNo;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
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

	public String getVatRegdNo() {
		return vatRegdNo;
	}

	public void setVatRegdNo(String vatRegdNo) {
		this.vatRegdNo = vatRegdNo;
	}

	public String getSuppInvNo() {
		return suppInvNo;
	}

	public void setSuppInvNo(String suppInvNo) {
		this.suppInvNo = suppInvNo;
	}

	public Date getSuppInvDate() {
		return suppInvDate;
	}

	public void setSuppInvDate(Date suppInvDate) {
		this.suppInvDate = suppInvDate;
	}

	public String getGrnId() {
		return grnId;
	}

	public void setGrnId(String grnId) {
		this.grnId = grnId;
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

	public String getAccountId() {
		return accountId;
	}

	public void setAccountId(String accountId) {
		this.accountId = accountId;
	}

	public int getItemCount() {
		return itemCount;
	}

	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
	}

	public String getVatId() {
		return vatId;
	}

	public void setVatId(String vatId) {
		this.vatId = vatId;
	}

	public String getVatCode() {
		return vatCode;
	}

	public void setVatCode(String vatCode) {
		this.vatCode = vatCode;
	}

	public double getVatRate() {
		return vatRate;
	}

	public void setVatRate(double vatRate) {
		this.vatRate = vatRate;
	}

	public double getGrossAmount() {
		return grossAmount;
	}

	public void setGrossAmount(double grossAmount) {
		this.grossAmount = grossAmount;
	}

	public double getAdjustValue() {
		return adjustValue;
	}

	public void setAdjustValue(double adjustValue) {
		this.adjustValue = adjustValue;
	}

	public double getDiscAmount() {
		return discAmount;
	}

	public void setDiscAmount(double discAmount) {
		this.discAmount = discAmount;
	}

	public double getNetAmount() {
		return netAmount;
	}

	public void setNetAmount(double netAmount) {
		this.netAmount = netAmount;
	}

	public double getVatAmount() {
		return vatAmount;
	}

	public void setVatAmount(double vatAmount) {
		this.vatAmount = vatAmount;
	}

	public double getNetIncValue() {
		return netIncValue;
	}

	public void setNetIncValue(double netIncValue) {
		this.netIncValue = netIncValue;
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

	/**
	 * 
	 */
	private static final long serialVersionUID = 3725050690026705071L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "INVOICE_PK", updatable = false)
	private int invoicePk;

	@Column(name = "OUR_GRP_INV_NO")
	private String ourGrpInvNo;

	@Column(name = "PERIOD")
	private Date period;

	@Column(name = "ENTITY_ID")
	private String entityId;

	@Column(name = "SUPPLIER_ID")
	private String supplierId;

	@Column(name = "SUPPLIER_NAME")
	private String supplierName;

	@Column(name = "VAT_REGD_NO")
	private String vatRegdNo;

	@Column(name = "SUPP_INV_NO")
	private String suppInvNo;

	@Column(name = "SUPP_INV_DATE")
	private Date suppInvDate;

	@Column(name = "GRN_ID")
	private String grnId;

	@Column(name = "LPO_NUMBER")
	private String lpoNumber;

	@Column(name = "SUPP_DEL_NOTE_NO")
	private String suppDelNoteNo;

	@Column(name = "ACCOUNT_ID")
	private String accountId;

	@Column(name = "ITEM_COUNT")
	private int itemCount;

	@Column(name = "VAT_ID")
	private String vatId;

	@Column(name = "VAT_CODE")
	private String vatCode;

	@Column(name = "VAT_RATE")
	private double vatRate;

	@Column(name = "GROSS_AMOUNT")
	private double grossAmount;

	@Column(name = "ADJUST_VALUE")
	private double adjustValue;

	@Column(name = "DISC_AMOUNT")
	private double discAmount;

	@Column(name = "NET_AMOUNT")
	private double netAmount;

	@Column(name = "VAT_AMOUNT")
	private double vatAmount;

	@Column(name = "NET_INC_VALUE")
	private double netIncValue;

	@Column(name = "LAST_USER")
	private int lastUser;

	@Column(name = "LAST_UPDATE")
	private Date lastUpdate;
	
	

}
