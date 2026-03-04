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
@Table(name = "consolidation_location_request")
public class ConsolidationLocationRequestHib implements Serializable {

    private static final long serialVersionUID = 6395688408363896352L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CONS_LOC_REQ_PK")
    private int consLocReqPk;

    @Column(name = "CONSOLIDATION_ID")
    private String consolidationId;

    @Column(name = "PERIOD")
    private Date period;

    @Column(name = "ITEM_ID")
    private int itemId;

    @Column(name = "ITEM_NAME")
    private String itemName;

    @Column(name = "PACKAGE_ID")
    private String packageId;

    @Column(name = "GRAND_TOTAL")
    private double grandTotal;

    @Column(name = "SUP_ID")
    private String supId;

    @Column(name = "GROSS_PRICE")
    private double grossPrice;

    @Column(name = "NET_PRICE")
    private double netPrice;
    
    @Column(name = "STATUS_FK")
    private int statusFk; // 0 Created, 1 Qtn Processed, 2 Qtn Finalised (Price Assigned)

    @Column(name = "CREATED_BY")
    private int createdBy;

    @Column(name = "CREATED_DATE")
    private Date createdDate;

    @Column(name = "LAST_ACT_BY")
    private int lastActBy;

    @Column(name = "LAST_ACT_DATE")
    private Date lastActDate;

	public int getConsLocReqPk() {
		return consLocReqPk;
	}

	public void setConsLocReqPk(int consLocReqPk) {
		this.consLocReqPk = consLocReqPk;
	}

	public String getConsolidationId() {
		return consolidationId;
	}

	public void setConsolidationId(String consolidationId) {
		this.consolidationId = consolidationId;
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

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public double getGrandTotal() {
		return grandTotal;
	}

	public void setGrandTotal(double grandTotal) {
		this.grandTotal = grandTotal;
	}

	public String getSupId() {
		return supId;
	}

	public void setSupId(String supId) {
		this.supId = supId;
	}

	public double getGrossPrice() {
		return grossPrice;
	}

	public void setGrossPrice(double grossPrice) {
		this.grossPrice = grossPrice;
	}

	public double getNetPrice() {
		return netPrice;
	}

	public void setNetPrice(double netPrice) {
		this.netPrice = netPrice;
	}

	public int getStatusFk() {
		return statusFk;
	}

	public void setStatusFk(int statusFk) {
		this.statusFk = statusFk;
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

    
    
}

