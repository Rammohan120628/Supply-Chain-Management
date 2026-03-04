package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "suppdeldetail")
public class SuppDelDetailHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3725050690026705071L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "SUPP_DEL_DET_PK", updatable = false)
	private int suppDelDetPk;

	@Column(name = "SUPP_DEL_HEAD_FK")
	private int suppDelHeadFk;

	@ManyToOne(fetch = FetchType.LAZY) // Many details belong to one head
	@JoinColumn(name = "GRN_ID", referencedColumnName = "GRN_ID", updatable = false, insertable = false)
	private SuppDelDetailHib suppDelHead;

	@Column(name = "GRN_ID", updatable = false, insertable = true)
	private String grnId;

	@Column(name = "ENT_ORDER")
	private int entOrder;

	@Column(name = "ITEM_ID")
	private int itemId;
	
	@Column(name = "PACKAGE_ID")
	private String packageId;

	@Column(name = "QTY")
	private double qty;

	@Column(name = "GP")
	private double gp;

	@Column(name = "ACTUAL_INV")
	private double actualInv;

	@Column(name = "NCT01")
	private double nct01;

	@Column(name = "NCT02")
	private double nct02;

	@Column(name = "NCT03")
	private double nct03;

	@Column(name = "NCT04")
	private double nct04;

	@Column(name = "AC01")
	private double ac01;

	@Column(name = "AC02")
	private double ac02;

	@Column(name = "AC03")
	private double ac03;

	@Column(name = "AC04")
	private double ac04;

	@Column(name = "EXPIRY_DATE")
	private Date expiryDate;

	@Column(name = "IP")
	private double ip;

	@Column(name = "ENTITY_ID")
	private String entityId;

	@Column(name = "STOCK_GP")
	private double stockGp;

	@Column(name = "STOCK_CP")
	private double stockCp;

	@Column(name = "QTY_UNIT")
	private double qtyUnit;

	@Column(name = "GP_UNIT")
	private double gpUnit;

	@Column(name = "ACTUAL_INV_UNIT")
	private double actualInvUnit;

	@Column(name = "IP_UNIT")
	private double ipUnit;

	@Column(name = "STOCK_CP_UNIT")
	private double stockCpUnit;

	@Column(name = "STOCK_GP_UNIT")
	private double stockGpUnit;

	@Column(name = "BATCH_NO")
	private String batchNo;

	@Column(name = "BIN_NUMBER")
	private String binNumber;

	@Column(name = "ITEM_VAT_RATE")
	private double itemVatRate;

	@Column(name = "AMOUNT")
	private double amount;

	@Column(name = "IS_REGISTERED")
	private int isRegistered;

	@Column(name = "VAT_ID")
	private String vatId;

	@Column(name = "IS_DISCOUNT")
	private String isDiscount;

	@Column(name = "DIS_AMOUNT")
	private double disAmount;

	@Column(name = "GROSS_INC_DIS")
	private double grossIncDis;

	@Column(name = "NET_AMOUNT")
	private double netAmount;

	public int getSuppDelDetPk() {
		return suppDelDetPk;
	}

	public void setSuppDelDetPk(int suppDelDetPk) {
		this.suppDelDetPk = suppDelDetPk;
	}

	public int getSuppDelHeadFk() {
		return suppDelHeadFk;
	}

	public void setSuppDelHeadFk(int suppDelHeadFk) {
		this.suppDelHeadFk = suppDelHeadFk;
	}

	public SuppDelDetailHib getSuppDelHead() {
		return suppDelHead;
	}

	public void setSuppDelHead(SuppDelDetailHib suppDelHead) {
		this.suppDelHead = suppDelHead;
	}

	public String getGrnId() {
		return grnId;
	}

	public void setGrnId(String grnId) {
		this.grnId = grnId;
	}

	public int getEntOrder() {
		return entOrder;
	}

	public void setEntOrder(int entOrder) {
		this.entOrder = entOrder;
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

	public double getQty() {
		return qty;
	}

	public void setQty(double qty) {
		this.qty = qty;
	}

	public double getGp() {
		return gp;
	}

	public void setGp(double gp) {
		this.gp = gp;
	}

	public double getActualInv() {
		return actualInv;
	}

	public void setActualInv(double actualInv) {
		this.actualInv = actualInv;
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

	public double getAc01() {
		return ac01;
	}

	public void setAc01(double ac01) {
		this.ac01 = ac01;
	}

	public double getAc02() {
		return ac02;
	}

	public void setAc02(double ac02) {
		this.ac02 = ac02;
	}

	public double getAc03() {
		return ac03;
	}

	public void setAc03(double ac03) {
		this.ac03 = ac03;
	}

	public double getAc04() {
		return ac04;
	}

	public void setAc04(double ac04) {
		this.ac04 = ac04;
	}

	public Date getExpiryDate() {
		return expiryDate;
	}

	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}

	public double getIp() {
		return ip;
	}

	public void setIp(double ip) {
		this.ip = ip;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public double getStockGp() {
		return stockGp;
	}

	public void setStockGp(double stockGp) {
		this.stockGp = stockGp;
	}

	public double getStockCp() {
		return stockCp;
	}

	public void setStockCp(double stockCp) {
		this.stockCp = stockCp;
	}

	public double getQtyUnit() {
		return qtyUnit;
	}

	public void setQtyUnit(double qtyUnit) {
		this.qtyUnit = qtyUnit;
	}

	public double getGpUnit() {
		return gpUnit;
	}

	public void setGpUnit(double gpUnit) {
		this.gpUnit = gpUnit;
	}

	public double getActualInvUnit() {
		return actualInvUnit;
	}

	public void setActualInvUnit(double actualInvUnit) {
		this.actualInvUnit = actualInvUnit;
	}

	public double getIpUnit() {
		return ipUnit;
	}

	public void setIpUnit(double ipUnit) {
		this.ipUnit = ipUnit;
	}

	public double getStockCpUnit() {
		return stockCpUnit;
	}

	public void setStockCpUnit(double stockCpUnit) {
		this.stockCpUnit = stockCpUnit;
	}

	public double getStockGpUnit() {
		return stockGpUnit;
	}

	public void setStockGpUnit(double stockGpUnit) {
		this.stockGpUnit = stockGpUnit;
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

	public double getItemVatRate() {
		return itemVatRate;
	}

	public void setItemVatRate(double itemVatRate) {
		this.itemVatRate = itemVatRate;
	}

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public int getIsRegistered() {
		return isRegistered;
	}

	public void setIsRegistered(int isRegistered) {
		this.isRegistered = isRegistered;
	}

	public String getVatId() {
		return vatId;
	}

	public void setVatId(String vatId) {
		this.vatId = vatId;
	}

	public String getIsDiscount() {
		return isDiscount;
	}

	public void setIsDiscount(String isDiscount) {
		this.isDiscount = isDiscount;
	}

	public double getDisAmount() {
		return disAmount;
	}

	public void setDisAmount(double disAmount) {
		this.disAmount = disAmount;
	}

	public double getGrossIncDis() {
		return grossIncDis;
	}

	public void setGrossIncDis(double grossIncDis) {
		this.grossIncDis = grossIncDis;
	}

	public double getNetAmount() {
		return netAmount;
	}

	public void setNetAmount(double netAmount) {
		this.netAmount = netAmount;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	

}
