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
@Table(name = "suppliersitem", schema = "public")
public class SuppliersItemHib implements Serializable {

	
	private static final long serialVersionUID = 3725050690026705071L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "Supp_Item_Pk", updatable = false)
	private Integer suppItemPk;

	@Column(name = "Supplier_ID")
	private String supplierId;

	@Column(name = "Supp_FK")
	private int suppFk;

	@Column(name = "Item_ID")
	private int itemId;

	@Column(name = "Package_Id")
	private String packageId;

	@Column(name = "NCT01")
	private double nct01;

	@Column(name = "NCT02")
	private double nct02;

	@Column(name = "NCT03")
	private double nct03;

	@Column(name = "NCT04")
	private double nct04;

	@Column(name = "Created_Date")
	private Date createdDate;

	@Column(name = "Period")
	private Date period;

	@Column(name = "Last_Qtd_Price")
	private double lastQtdPrice;

	@Column(name = "Last_Purch_Price")
	private double lastPurchPrice;

	@Column(name = "Last_Purch_Exp_Dt")
	private Date lastPurchExpDt;

	@Column(name = "Is_Active")
	private int isActive;

	@Column(name = "Entity_ID")
	private String entityId;

	@Column(name = "Last_User")
	private int lastUser;

	@Column(name = "Last_Update")
	private Date lastUpdate;

	@Column(name = "Supplier_Imtem_ID")
	private int supplierItemId;

	@Column(name = "Supplier_Package_ID")
	private String supplierPackageId;

	@Column(name = "MB_Status")
	private String mbStatus;

	public int getSuppItemPk() {
		return suppItemPk;
	}

	public void setSuppItemPk(int suppItemPk) {
		this.suppItemPk = suppItemPk;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public int getSuppFk() {
		return suppFk;
	}

	public void setSuppFk(int suppFk) {
		this.suppFk = suppFk;
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

	public double getNct01() {
		return nct01;
	}

	public void setNct01(double nct01) {
		this.nct01 = nct01;
	}

	public double getNct02() {
		return nct02;
	}

	public void setNct02(double nct02) {
		this.nct02 = nct02;
	}

	public double getNct03() {
		return nct03;
	}

	public void setNct03(double nct03) {
		this.nct03 = nct03;
	}

	public double getNct04() {
		return nct04;
	}

	public void setNct04(double nct04) {
		this.nct04 = nct04;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public double getLastQtdPrice() {
		return lastQtdPrice;
	}

	public void setLastQtdPrice(double lastQtdPrice) {
		this.lastQtdPrice = lastQtdPrice;
	}

	public double getLastPurchPrice() {
		return lastPurchPrice;
	}

	public void setLastPurchPrice(double lastPurchPrice) {
		this.lastPurchPrice = lastPurchPrice;
	}

	public Date getLastPurchExpDt() {
		return lastPurchExpDt;
	}

	public void setLastPurchExpDt(Date lastPurchExpDt) {
		this.lastPurchExpDt = lastPurchExpDt;
	}

	public int getIsActive() {
		return isActive;
	}

	public void setIsActive(int isActive) {
		this.isActive = isActive;
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

	public int getSupplierItemId() {
		return supplierItemId;
	}

	public void setSupplierItemId(int supplierItemId) {
		this.supplierItemId = supplierItemId;
	}

	public String getSupplierPackageId() {
		return supplierPackageId;
	}

	public void setSupplierPackageId(String supplierPackageId) {
		this.supplierPackageId = supplierPackageId;
	}

	public String getMbStatus() {
		return mbStatus;
	}

	public void setMbStatus(String mbStatus) {
		this.mbStatus = mbStatus;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

}
