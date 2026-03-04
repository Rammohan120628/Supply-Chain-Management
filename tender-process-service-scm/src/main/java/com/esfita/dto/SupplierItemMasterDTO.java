package com.esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class SupplierItemMasterDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = -2164558493010190223L;

	

	private int itemPk;

	private String supplierId;

	private int supplierItemPk;

	private int supplierFk;
	
	private int itemId;

	private String packageId;

	private String itemName;

	private int itemCount;

	private String supplierName;

	private Date period;

	private double price;

	private int supplierItemId;
	private String supplierItemId1;

	

	private String periodString;

	private String supplierPackageId;

	private String entityId;

	private int registered;

	private int isActive;

	private int lastUser;

	private Date lastUpdate;

	private List<SupplierItemMasterDTO> itemList = new ArrayList<>();

	private List<SupplierItemMasterDTO> uploadedItem = new ArrayList<>();

	private List<SupplierItemMasterDTO> itemIds = new ArrayList<>();


	public String getSupplierItemId1() {
		return supplierItemId1;
	}

	public void setSupplierItemId1(String supplierItemId1) {
		this.supplierItemId1 = supplierItemId1;
	}
	public int getItemPk() {
		return itemPk;
	}

	public void setItemPk(int itemPk) {
		this.itemPk = itemPk;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public int getSupplierItemPk() {
		return supplierItemPk;
	}

	public void setSupplierItemPk(int supplierItemPk) {
		this.supplierItemPk = supplierItemPk;
	}

	public int getSupplierFk() {
		return supplierFk;
	}

	public void setSupplierFk(int supplierFk) {
		this.supplierFk = supplierFk;
	}

	

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public int getItemCount() {
		return itemCount;
	}

	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
	}

	public String getSupplierName() {
		return supplierName;
	}

	public void setSupplierName(String supplierName) {
		this.supplierName = supplierName;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public int getSupplierItemId() {
		return supplierItemId;
	}

	public void setSupplierItemId(int supplierItemId) {
		this.supplierItemId = supplierItemId;
	}

	public String getPeriodString() {
		return periodString;
	}

	public void setPeriodString(String periodString) {
		this.periodString = periodString;
	}

	public String getSupplierPackageId() {
		return supplierPackageId;
	}

	public void setSupplierPackageId(String supplierPackageId) {
		this.supplierPackageId = supplierPackageId;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public int getRegistered() {
		return registered;
	}

	public void setRegistered(int registered) {
		this.registered = registered;
	}

	public int getIsActive() {
		return isActive;
	}

	public void setIsActive(int isActive) {
		this.isActive = isActive;
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

	public List<SupplierItemMasterDTO> getItemList() {
		return itemList;
	}

	public void setItemList(List<SupplierItemMasterDTO> itemList) {
		this.itemList = itemList;
	}

	public List<SupplierItemMasterDTO> getUploadedItem() {
		return uploadedItem;
	}

	public void setUploadedItem(List<SupplierItemMasterDTO> uploadedItem) {
		this.uploadedItem = uploadedItem;
	}

	public List<SupplierItemMasterDTO> getItemIds() {
		return itemIds;
	}

	public void setItemIds(List<SupplierItemMasterDTO> itemIds) {
		this.itemIds = itemIds;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	public int getItemId() {
		return itemId;
	}

	public void setItemId(int itemId) {
		this.itemId = itemId;
	}
}
