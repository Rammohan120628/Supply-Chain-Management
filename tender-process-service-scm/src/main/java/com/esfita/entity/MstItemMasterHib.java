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
@Table(name = "mst_item_master", schema = "public")
public class MstItemMasterHib implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ITEM_PK", updatable = false)
	private int itemPk;

	@Column(name = "ITEM_CODE")
	private String itemCode;

	@Column(name = "ITEM_NAME")
	private String itemName;

	@Column(name = "ITEM_ALT_NAME")
	private String itemAltName;

	@Column(name = "ITEM_STATE_FK")
	private int itemStateFk;

	@Column(name = "ITEM_QUALITY_FK")
	private int itemQualityFk;

	@Column(name = "ITEM_ORIGIN")
	private int itemOrigin;

	@Column(name = "ACCOUNT_FK")
	private int accountFk;

	@Column(name = "CATEGORY_FK")
	private int categoryFk;

	@Column(name = "PURCHASE_BASE_UNIT")
	private String purchaseBaseUnit;

	@Column(name = "PURCHASE_SECONDARY_UNIT")
	private String purchaseSecondaryUnit;

	@Column(name = "PURCHASE_BASE_FACTOR")
	private double purchaseBaseFactor;

	@Column(name = "PURCHASE_SECONDARY_FACTOR")
	private double purchaseSecondaryFactor;

	@Column(name = "PURCHASE_ID")
	private String purchaseId;

	@Column(name = "PACKAGE_BASE_UNIT")
	private String packageBaseUnit;

	@Column(name = "PACKAGE_SECONDARY_UNIT")
	private String packageSecondaryUnit;

	@Column(name = "PACKAGE_BASE_FACTOR")
	private double packageBaseFactor;

	@Column(name = "PACKAGE_SECONDARY_FACTOR")
	private double packageSecondaryFactor;

	@Column(name = "PACKAGE_ID")
	private String packageId;

	@Column(name = "UOM")
	private String uom;

	@Column(name = "IMAGE_URL")
	private String imageUrl;

	@Column(name = "STATUS")
	private String status;

	public int getItemPk() {
		return itemPk;
	}

	public void setItemPk(int itemPk) {
		this.itemPk = itemPk;
	}

	public String getItemCode() {
		return itemCode;
	}

	public void setItemCode(String itemCode) {
		this.itemCode = itemCode;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getItemAltName() {
		return itemAltName;
	}

	public void setItemAltName(String itemAltName) {
		this.itemAltName = itemAltName;
	}

	public int getItemStateFk() {
		return itemStateFk;
	}

	public void setItemStateFk(int itemStateFk) {
		this.itemStateFk = itemStateFk;
	}

	public int getItemQualityFk() {
		return itemQualityFk;
	}

	public void setItemQualityFk(int itemQualityFk) {
		this.itemQualityFk = itemQualityFk;
	}

	public int getItemOrigin() {
		return itemOrigin;
	}

	public void setItemOrigin(int itemOrigin) {
		this.itemOrigin = itemOrigin;
	}

	public int getAccountFk() {
		return accountFk;
	}

	public void setAccountFk(int accountFk) {
		this.accountFk = accountFk;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getPurchaseBaseUnit() {
		return purchaseBaseUnit;
	}

	public void setPurchaseBaseUnit(String purchaseBaseUnit) {
		this.purchaseBaseUnit = purchaseBaseUnit;
	}

	public String getPurchaseSecondaryUnit() {
		return purchaseSecondaryUnit;
	}

	public void setPurchaseSecondaryUnit(String purchaseSecondaryUnit) {
		this.purchaseSecondaryUnit = purchaseSecondaryUnit;
	}

	public double getPurchaseBaseFactor() {
		return purchaseBaseFactor;
	}

	public void setPurchaseBaseFactor(double purchaseBaseFactor) {
		this.purchaseBaseFactor = purchaseBaseFactor;
	}

	public double getPurchaseSecondaryFactor() {
		return purchaseSecondaryFactor;
	}

	public void setPurchaseSecondaryFactor(double purchaseSecondaryFactor) {
		this.purchaseSecondaryFactor = purchaseSecondaryFactor;
	}

	public String getPurchaseId() {
		return purchaseId;
	}

	public void setPurchaseId(String purchaseId) {
		this.purchaseId = purchaseId;
	}

	public String getPackageBaseUnit() {
		return packageBaseUnit;
	}

	public void setPackageBaseUnit(String packageBaseUnit) {
		this.packageBaseUnit = packageBaseUnit;
	}

	public String getPackageSecondaryUnit() {
		return packageSecondaryUnit;
	}

	public void setPackageSecondaryUnit(String packageSecondaryUnit) {
		this.packageSecondaryUnit = packageSecondaryUnit;
	}

	public double getPackageBaseFactor() {
		return packageBaseFactor;
	}

	public void setPackageBaseFactor(double packageBaseFactor) {
		this.packageBaseFactor = packageBaseFactor;
	}

	public double getPackageSecondaryFactor() {
		return packageSecondaryFactor;
	}

	public void setPackageSecondaryFactor(double packageSecondaryFactor) {
		this.packageSecondaryFactor = packageSecondaryFactor;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public String getUom() {
		return uom;
	}

	public void setUom(String uom) {
		this.uom = uom;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public int getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(int lastActBy) {
		this.lastActBy = lastActBy;
	}

	public Date getLastActDate() {
		return lastActDate;
	}

	public void setLastActDate(Date lastActDate) {
		this.lastActDate = lastActDate;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "CREATED_BY")
	private int createdBy;

	@Column(name = "CREATED_DATE")
	private Date createdDate;

	@Column(name = "LAST_ACT_BY")
	private int lastActBy;

	@Column(name = "LAST_ACT_DATE")
	private Date lastActDate;

}