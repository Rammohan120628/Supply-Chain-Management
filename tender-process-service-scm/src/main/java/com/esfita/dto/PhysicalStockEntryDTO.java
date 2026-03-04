package com.esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class PhysicalStockEntryDTO implements Serializable {

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public int getPsPk() {
		return psPk;
	}

	public void setPsPk(int psPk) {
		this.psPk = psPk;
	}

	public int getItemID() {
		return itemID;
	}

	public void setItemID(int itemID) {
		this.itemID = itemID;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getPackageID() {
		return packageID;
	}

	public void setPackageID(String packageID) {
		this.packageID = packageID;
	}

	public double getPhysicalStock() {
		return physicalStock;
	}

	public void setPhysicalStock(double physicalStock) {
		this.physicalStock = physicalStock;
	}

	public double getTheoriticalStock() {
		return theoriticalStock;
	}

	public void setTheoriticalStock(double theoriticalStock) {
		this.theoriticalStock = theoriticalStock;
	}

	public double getAdjust() {
		return adjust;
	}

	public void setAdjust(double adjust) {
		this.adjust = adjust;
	}

	public String getfReason() {
		return fReason;
	}

	public void setfReason(String fReason) {
		this.fReason = fReason;
	}

	public double getRemainingQty() {
		return remainingQty;
	}

	public void setRemainingQty(double remainingQty) {
		this.remainingQty = remainingQty;
	}

	public double getUnitCP() {
		return unitCP;
	}

	public void setUnitCP(double unitCP) {
		this.unitCP = unitCP;
	}

	public double getfPhysicalQty() {
		return fPhysicalQty;
	}

	public void setfPhysicalQty(double fPhysicalQty) {
		this.fPhysicalQty = fPhysicalQty;
	}

	public int getSerialNo() {
		return serialNo;
	}

	public void setSerialNo(int serialNo) {
		this.serialNo = serialNo;
	}

	public String getEntityID() {
		return entityID;
	}

	public void setEntityID(String entityID) {
		this.entityID = entityID;
	}

	public int getLastuser() {
		return lastuser;
	}

	public void setLastuser(int lastuser) {
		this.lastuser = lastuser;
	}

	public int getSaveType() {
		return saveType;
	}

	public void setSaveType(int saveType) {
		this.saveType = saveType;
	}

	public List<PhysicalStockEntryDTO> getPhysicalStockEntryList() {
		return physicalStockEntryList;
	}

	public void setPhysicalStockEntryList(List<PhysicalStockEntryDTO> physicalStockEntryList) {
		this.physicalStockEntryList = physicalStockEntryList;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	/**
	 * 
	 */
	private static final long serialVersionUID = 5882635527071903052L;

	private Date period;

	private int psPk;

	private int itemID; //

	private String itemName; //

	private String packageID; //

	private double physicalStock; //

	private double theoriticalStock; //

	private double adjust; //

	private String fReason; //

	private double remainingQty; // REMAINING_QTY

	private double unitCP; //

	private double fPhysicalQty; //

	private int serialNo;

	private String entityID;

	private int lastuser;

	private int saveType;
	
	private boolean status;
	
	private String message;

	public boolean isStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	public int getFinancePk() {
		return financePk;
	}

	public void setFinancePk(int financePk) {
		this.financePk = financePk;
	}

	private int financePk;

	private List<PhysicalStockEntryDTO> physicalStockEntryList = new ArrayList<>();
	// private Date expiryDate; //

//	private double theoriticalAmount;
//	private double physicalAmount;
//	private double adjustment;
//	private String reason;
//	private String batchNo;
//	private String binNumber;
//	private String entityID;
//	private int lastuser;
//	private Date lastUpdate;

}