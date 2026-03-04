package com.esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class ConsolidationLocationRequestDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = -2164558493010190223L;

	private int consLocReqPK;

	private Date period;

	private int itemId;

	private String itemName;
	private String periodStr;


	private double grandTotal;

	private String lastUser;

	private Date lastUpdate;
	private String createDateStr;

	private List<ConsolidationLocationRequestDTO> items = new ArrayList<>();

	private String consolidationId;
	private String packageId;
	private String supplierId;

	
	public String getCreateDateStr() {
		return createDateStr;
	}

	public void setCreateDateStr(String createDateStr) {
		this.createDateStr = createDateStr;
	}

	public int getConsLocReqPK() {
		return consLocReqPK;
	}

	public void setConsLocReqPK(int consLocReqPK) {
		this.consLocReqPK = consLocReqPK;
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

	public double getGrandTotal() {
		return grandTotal;
	}

	public void setGrandTotal(double grandTotal) {
		this.grandTotal = grandTotal;
	}

	public String getLastUser() {
		return lastUser;
	}

	public void setLastUser(String lastUser) {
		this.lastUser = lastUser;
	}

	public Date getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}

	public List<ConsolidationLocationRequestDTO> getItems() {
		return items;
	}

	public void setItems(List<ConsolidationLocationRequestDTO> items) {
		this.items = items;
	}

	public String getConsolidationId() {
		return consolidationId;
	}

	public void setConsolidationId(String consolidationId) {
		this.consolidationId = consolidationId;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public double getGp() {
		return gp;
	}

	public void setGp(double gp) {
		this.gp = gp;
	}

	public double getNetValue() {
		return netValue;
	}

	public void setNetValue(double netValue) {
		this.netValue = netValue;
	}

	public String getSupplierName() {
		return supplierName;
	}

	public void setSupplierName(String supplierName) {
		this.supplierName = supplierName;
	}

	public String getStatusWord() {
		return statusWord;
	}

	public void setStatusWord(String statusWord) {
		this.statusWord = statusWord;
	}

	public int getStatusFk() {
		return statusFk;
	}

	public void setStatusFk(int statusFk) {
		this.statusFk = statusFk;
	}

	public List<ConsolidationLocationRequestDTO> getSubList() {
		return subList;
	}

	public void setSubList(List<ConsolidationLocationRequestDTO> subList) {
		this.subList = subList;
	}

	public List<ConsolidationLocationRequestDTO> getConsolidation() {
		return consolidation;
	}

	public void setConsolidation(List<ConsolidationLocationRequestDTO> consolidation) {
		this.consolidation = consolidation;
	}

	public List<ConsolidationLocationRequestDTO> getQuotationReply() {
		return quotationReply;
	}

	public void setQuotationReply(List<ConsolidationLocationRequestDTO> quotationReply) {
		this.quotationReply = quotationReply;
	}

	public List<ConsolidationLocationRequestDTO> getFinalizetheSupplierSelection() {
		return finalizetheSupplierSelection;
	}

	public void setFinalizetheSupplierSelection(List<ConsolidationLocationRequestDTO> finalizetheSupplierSelection) {
		this.finalizetheSupplierSelection = finalizetheSupplierSelection;
	}

	public List<ConsolidationLocationRequestDTO> getAutoGeneratePO() {
		return autoGeneratePO;
	}

	public void setAutoGeneratePO(List<ConsolidationLocationRequestDTO> autoGeneratePO) {
		this.autoGeneratePO = autoGeneratePO;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	public String getPeriodStr() {
		return periodStr;
	}

	public void setPeriodStr(String periodStr) {
		this.periodStr = periodStr;
	}

	private double gp;

	private double netValue;

	private String supplierName;

	private String statusWord;

	private int statusFk;
	private List<ConsolidationLocationRequestDTO> subList = new ArrayList<>();

	private List<ConsolidationLocationRequestDTO> consolidation = new ArrayList<>();

	private List<ConsolidationLocationRequestDTO> quotationReply = new ArrayList<>();

	private List<ConsolidationLocationRequestDTO> finalizetheSupplierSelection = new ArrayList<>();

	private List<ConsolidationLocationRequestDTO> autoGeneratePO = new ArrayList<>();
}
