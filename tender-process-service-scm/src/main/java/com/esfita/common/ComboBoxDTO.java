package com.esfita.common;


import java.io.Serializable;

import lombok.Data;

@Data
public class ComboBoxDTO implements Serializable {
	
	private static final long serialVersionUID = 4003377269733806369L;
	

	private int pk;
	private String id;
	private String locationId;
	private String locationName;
	private String period;
	private String category;
	private String reqNo;
	private String supplierId;
	private String supplierName;
	private String itemCode;
	private String itemName;
	private String conId;
	private String qtnReqNo;
	private String consolidationId;
	private String code;
	private String name;
	private int itemId;
	private String tranNo;
	
	
	
	public String getTranNo() {
		return tranNo;
	}
	public void setTranNo(String tranNo) {
		this.tranNo = tranNo;
	}
	public int getItemId() {
		return itemId;
	}
	public void setItemId(int itemId) {
		this.itemId = itemId;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getReqNo() {
		return reqNo;
	}

	public void setReqNo(String reqNo) {
		this.reqNo = reqNo;
	}

	public int getPk() {
		return pk;
	}

	public void setPk(int pk) {
		this.pk = pk;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getLocationId() {
		return locationId;
	}

	public void setLocationId(String locationId) {
		this.locationId = locationId;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public String getPeriod() {
		return period;
	}

	public void setPeriod(String period) {
		this.period = period;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
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

	public String getConId() {
		return conId;
	}

	public void setConId(String conId) {
		this.conId = conId;
	}

	public String getQtnReqNo() {
		return qtnReqNo;
	}

	public void setQtnReqNo(String qtnReqNo) {
		this.qtnReqNo = qtnReqNo;
	}

	public String getConsolidationId() {
		return consolidationId;
	}

	public void setConsolidationId(String consolidationId) {
		this.consolidationId = consolidationId;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	
}
