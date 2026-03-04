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
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "physicalstock")
public class PhysicalStockHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -2474099558212907177L;

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "PS_PK", updatable = false)
	private int psPk;

	@Column(name = "PERIOD")
	private Date period;

	public int getPsPk() {
		return psPk;
	}

	public void setPsPk(int psPk) {
		this.psPk = psPk;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public int getItemId() {
		return itemId;
	}

	public void setItemId(int itemId) {
		this.itemId = itemId;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public double getPhysicalQty() {
		return physicalQty;
	}

	public void setPhysicalQty(double physicalQty) {
		this.physicalQty = physicalQty;
	}

	public double getTheoriticalQty() {
		return theoriticalQty;
	}

	public void setTheoriticalQty(double theoriticalQty) {
		this.theoriticalQty = theoriticalQty;
	}

	public double getUnitCp() {
		return unitCp;
	}

	public void setUnitCp(double unitCp) {
		this.unitCp = unitCp;
	}

	public double getTheoriticalAmount() {
		return theoriticalAmount;
	}

	public void setTheoriticalAmount(double theoriticalAmount) {
		this.theoriticalAmount = theoriticalAmount;
	}

	public double getPhysicalAmount() {
		return physicalAmount;
	}

	public void setPhysicalAmount(double physicalAmount) {
		this.physicalAmount = physicalAmount;
	}

	public double getAdjustment() {
		return adjustment;
	}

	public void setAdjustment(double adjustment) {
		this.adjustment = adjustment;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public double getfPhysicalQty() {
		return fPhysicalQty;
	}

	public void setfPhysicalQty(double fPhysicalQty) {
		this.fPhysicalQty = fPhysicalQty;
	}

	public String getfReason() {
		return fReason;
	}

	public void setfReason(String fReason) {
		this.fReason = fReason;
	}

	public String getBatchNo() {
		return batchNo;
	}

	public void setBatchNo(String batchNo) {
		this.batchNo = batchNo;
	}

	public String getBinNumber() {
		return binNumber;
	}

	public void setBinNumber(String binNumber) {
		this.binNumber = binNumber;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
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

	@Column(name = "ITEM_ID")
	private int itemId;

	@Column(name = "PACKAGE_ID")
	private String packageId;

	@Column(name = "PHYSICAL_QTY")
	private double physicalQty;

	@Column(name = "THEORITICAL_QTY")
	private double theoriticalQty;

	@Column(name = "UNIT_CP")
	private double unitCp;

	@Column(name = "THEORITICAL_AMOUNT")
	private double theoriticalAmount;

	@Column(name = "PHYSICAL_AMOUNT")
	private double physicalAmount;

	@Column(name = "ADJUSTMENT")
	private double adjustment;

	@Column(name = "REASON")
	private String reason;

	@Column(name = "F_PHYSICAL_QTY")
	private double fPhysicalQty;

	@Column(name = "F_REASON")
	private String fReason;

	@Column(name = "BATCH_NO")
	private String batchNo;

	@Column(name = "BIN_NUMBER")
	private String binNumber;

	@Column(name = "ENTITY_ID")
	private String entityId;

	@Column(name = "LAST_USER")
	private int lastUser;

	@Column(name = "LAST_UPDATE")
	private Date lastUpdate;

}