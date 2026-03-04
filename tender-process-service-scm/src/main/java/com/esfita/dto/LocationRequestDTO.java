package com.esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class LocationRequestDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = -2164558493010190223L;

	private int locationRequestHeaderPk;
	private int reqHeadFK;
	private int locationRequestDetailsPk;
	private String locationId;
	private String reqTransactionNo;
	private String locationName;
	private Date period;
	private String periodStr;
	private String processed;
	private int isFinal;
	private String entityId;
	private int itemId;
	private String itemName;
	private String packageId;
	private double qty;
	private int locationReqFk;
	private int aplPk;
	private int locationFk;
	private String supplierId;
	private String supplierName;
	private String supplierIdLast;
	private String supplierNameLast;
	private double gpLast;
	private Date supplierDeliveryDate;
	private Date cwhDeliveryDate;
	private String deliveryMode;
	private String deliveryLocationId;
	private int entOrder;
	private String lastUser;
	private Date lastUpdate;
	private int itemCount;
	private int totalItemCount;
	private Date startDate;
	private Date endDate;
	private Date requestDate;
	private String requestDateStr;
	private int userFk;
	private double grandTotal;
	private int consLocReqPK;
	private String consolidationId;
	private int quotationProcessHeadPk;
	private int quotationProcessDetailPk;
	private Map<String, Double> quantityMap = new HashMap<>();
	private double gp;
	private double np;
	private double gpOld;
	private double totalCost;
	private boolean renderedDate;
	private double qtyInside;
	private Date date;
	private Date receiveDate;
	private String dateStr;
	
	private List<LocationRequestDTO> dateWiseQty = new ArrayList<>();
	private List<LocationRequestDTO> uploadedItem = new ArrayList<>();
	private List<LocationRequestDTO> subList = new ArrayList<>();
	private List<LocationRequestDTO> dateBasedItem = new ArrayList<>();
	private List<LocationRequestDTO> items = new ArrayList<>();
	private List<LocationRequestDTO> quotationPreparedList= new ArrayList<>();
	private List<LocationRequestDTO> finalizedList = new ArrayList<>();
	
	private String currencyId;

	private int currencyRate;

	private int deliveryModeHeader;

	private int quotationProcessStatusFk;

	private String quotationProcessStatus;

	private String quotationTransNo;

	private boolean renderDeleteIcon;

	private String region;

	private int term;

	private double gross;

	private double net;

	private double netPp;

	private double netUp;

	private String stats;

	private double disc;
	private String remarks;

	private boolean checkBox;

	private String preSupId;
	private String statusWord;

	private int statusFk;

	private List<LocationRequestDTO> locReqCreationList = new ArrayList<>();

	private List<LocationRequestDTO> consolidationList = new ArrayList<>();

	private List<LocationRequestDTO> quotationReplyList = new ArrayList<>();

	private List<LocationRequestDTO> finalizetheSupplierSelectionList = new ArrayList<>();

	private List<LocationRequestDTO> autoGeneratePOList = new ArrayList<>();

	private double qty1;
	private double qty2;
	private double qty3;
	private double qty4;
	private double qty5;
	private double qty6;
	private double qty7;
	private double qty8;
	private double qty9;
	private double qty10;
	private double qty11;
	private double qty12;
	private double qty13;
	private double qty14;
	private double qty15;
	private double qty16;
	private double qty17;
	private double qty18;
	private double qty19;
	private double qty20;
	private double qty21;
	private double qty22;
	private double qty23;
	private double qty24;
	private double qty25;
	private double qty26;
	private double qty27;
	private double qty28;
	private double qty29;
	private double qty30;
	private double qty31;

	private boolean qtyRendered1;
	private boolean qtyRendered2;
	private boolean qtyRendered3;
	private boolean qtyRendered4;
	private boolean qtyRendered5;
	private boolean qtyRendered6;
	private boolean qtyRendered7;
	private boolean qtyRendered8;
	private boolean qtyRendered9;
	private boolean qtyRendered10;
	private boolean qtyRendered11;
	private boolean qtyRendered12;
	private boolean qtyRendered13;
	private boolean qtyRendered14;
	private boolean qtyRendered15;
	private boolean qtyRendered16;
	private boolean qtyRendered17;
	private boolean qtyRendered18;
	private boolean qtyRendered19;
	private boolean qtyRendered20;
	private boolean qtyRendered21;
	private boolean qtyRendered22;
	private boolean qtyRendered23;
	private boolean qtyRendered24;
	private boolean qtyRendered25;
	private boolean qtyRendered26;
	private boolean qtyRendered27;
	private boolean qtyRendered28;
	private boolean qtyRendered29;
	private boolean qtyRendered30;
	private boolean qtyRendered31;

	private int dateNum;
	private String downloadUrlPath;

	public int getLocationRequestHeaderPk() {
		return locationRequestHeaderPk;
	}

	public void setLocationRequestHeaderPk(int locationRequestHeaderPk) {
		this.locationRequestHeaderPk = locationRequestHeaderPk;
	}
	

	public String getDownloadUrlPath() {
		return downloadUrlPath;
	}

	public void setDownloadUrlPath(String downloadUrlPath) {
		this.downloadUrlPath = downloadUrlPath;
	}

	public String getSupplierName() {
		return supplierName;
	}

	public void setSupplierName(String supplierName) {
		this.supplierName = supplierName;
	}

	public String getSupplierNameLast() {
		return supplierNameLast;
	}

	public void setSupplierNameLast(String supplierNameLast) {
		this.supplierNameLast = supplierNameLast;
	}

	public int getReqHeadFK() {
		return reqHeadFK;
	}

	public void setReqHeadFK(int reqHeadFK) {
		this.reqHeadFK = reqHeadFK;
	}

	public int getLocationRequestDetailsPk() {
		return locationRequestDetailsPk;
	}

	public void setLocationRequestDetailsPk(int locationRequestDetailsPk) {
		this.locationRequestDetailsPk = locationRequestDetailsPk;
	}

	public String getLocationId() {
		return locationId;
	}

	public void setLocationId(String locationId) {
		this.locationId = locationId;
	}

	public String getReqTransactionNo() {
		return reqTransactionNo;
	}

	public void setReqTransactionNo(String reqTransactionNo) {
		this.reqTransactionNo = reqTransactionNo;
	}

	public List<LocationRequestDTO> getQuotationPreparedList() {
		return quotationPreparedList;
	}

	public void setQuotationPreparedList(List<LocationRequestDTO> quotationPreparedList) {
		this.quotationPreparedList = quotationPreparedList;
	}

	public List<LocationRequestDTO> getFinalizedList() {
		return finalizedList;
	}

	public void setFinalizedList(List<LocationRequestDTO> finalizedList) {
		this.finalizedList = finalizedList;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	

	public String getPeriodStr() {
		return periodStr;
	}

	public void setPeriodStr(String periodStr) {
		this.periodStr = periodStr;
	}

	public String getProcessed() {
		return processed;
	}

	public void setProcessed(String processed) {
		this.processed = processed;
	}

	public int getIsFinal() {
		return isFinal;
	}

	public void setIsFinal(int isFinal) {
		this.isFinal = isFinal;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
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

	public double getQty() {
		return qty;
	}

	public void setQty(double qty) {
		this.qty = qty;
	}

	public int getLocationReqFk() {
		return locationReqFk;
	}

	public void setLocationReqFk(int locationReqFk) {
		this.locationReqFk = locationReqFk;
	}

	public int getAplPk() {
		return aplPk;
	}

	public void setAplPk(int aplPk) {
		this.aplPk = aplPk;
	}

	public int getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(int locationFk) {
		this.locationFk = locationFk;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	

	public String getSupplierIdLast() {
		return supplierIdLast;
	}

	public void setSupplierIdLast(String supplierIdLast) {
		this.supplierIdLast = supplierIdLast;
	}

	

	public double getGpLast() {
		return gpLast;
	}

	public void setGpLast(double gpLast) {
		this.gpLast = gpLast;
	}

	public Date getSupplierDeliveryDate() {
		return supplierDeliveryDate;
	}

	public void setSupplierDeliveryDate(Date supplierDeliveryDate) {
		this.supplierDeliveryDate = supplierDeliveryDate;
	}

	public Date getCwhDeliveryDate() {
		return cwhDeliveryDate;
	}

	public void setCwhDeliveryDate(Date cwhDeliveryDate) {
		this.cwhDeliveryDate = cwhDeliveryDate;
	}

	public String getDeliveryMode() {
		return deliveryMode;
	}

	public void setDeliveryMode(String deliveryMode) {
		this.deliveryMode = deliveryMode;
	}

	public String getDeliveryLocationId() {
		return deliveryLocationId;
	}

	public void setDeliveryLocationId(String deliveryLocationId) {
		this.deliveryLocationId = deliveryLocationId;
	}

	public int getEntOrder() {
		return entOrder;
	}

	public void setEntOrder(int entOrder) {
		this.entOrder = entOrder;
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

	public int getItemCount() {
		return itemCount;
	}

	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
	}

	public int getTotalItemCount() {
		return totalItemCount;
	}

	public void setTotalItemCount(int totalItemCount) {
		this.totalItemCount = totalItemCount;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public Date getRequestDate() {
		return requestDate;
	}

	public void setRequestDate(Date requestDate) {
		this.requestDate = requestDate;
	}

	public int getUserFk() {
		return userFk;
	}

	public void setUserFk(int userFk) {
		this.userFk = userFk;
	}

	public double getGrandTotal() {
		return grandTotal;
	}

	public void setGrandTotal(double grandTotal) {
		this.grandTotal = grandTotal;
	}

	public int getConsLocReqPK() {
		return consLocReqPK;
	}

	public void setConsLocReqPK(int consLocReqPK) {
		this.consLocReqPK = consLocReqPK;
	}

	public String getConsolidationId() {
		return consolidationId;
	}

	public void setConsolidationId(String consolidationId) {
		this.consolidationId = consolidationId;
	}

	public int getQuotationProcessHeadPk() {
		return quotationProcessHeadPk;
	}

	public void setQuotationProcessHeadPk(int quotationProcessHeadPk) {
		this.quotationProcessHeadPk = quotationProcessHeadPk;
	}

	public int getQuotationProcessDetailPk() {
		return quotationProcessDetailPk;
	}

	public void setQuotationProcessDetailPk(int quotationProcessDetailPk) {
		this.quotationProcessDetailPk = quotationProcessDetailPk;
	}

	public Map<String, Double> getQuantityMap() {
		return quantityMap;
	}

	public void setQuantityMap(Map<String, Double> quantityMap) {
		this.quantityMap = quantityMap;
	}

	public double getGp() {
		return gp;
	}

	public void setGp(double gp) {
		this.gp = gp;
	}

	public double getNp() {
		return np;
	}

	public void setNp(double np) {
		this.np = np;
	}

	public double getGpOld() {
		return gpOld;
	}

	public void setGpOld(double gpOld) {
		this.gpOld = gpOld;
	}

	public double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

	public boolean isRenderedDate() {
		return renderedDate;
	}

	public void setRenderedDate(boolean renderedDate) {
		this.renderedDate = renderedDate;
	}

	public double getQtyInside() {
		return qtyInside;
	}

	public void setQtyInside(double qtyInside) {
		this.qtyInside = qtyInside;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public Date getReceiveDate() {
		return receiveDate;
	}

	public void setReceiveDate(Date receiveDate) {
		this.receiveDate = receiveDate;
	}

	public String getDateStr() {
		return dateStr;
	}

	public void setDateStr(String dateStr) {
		this.dateStr = dateStr;
	}

	public List<LocationRequestDTO> getDateWiseQty() {
		return dateWiseQty;
	}

	public void setDateWiseQty(List<LocationRequestDTO> dateWiseQty) {
		this.dateWiseQty = dateWiseQty;
	}

	public List<LocationRequestDTO> getUploadedItem() {
		return uploadedItem;
	}

	public void setUploadedItem(List<LocationRequestDTO> uploadedItem) {
		this.uploadedItem = uploadedItem;
	}

	public List<LocationRequestDTO> getSubList() {
		return subList;
	}

	public void setSubList(List<LocationRequestDTO> subList) {
		this.subList = subList;
	}

	public List<LocationRequestDTO> getDateBasedItem() {
		return dateBasedItem;
	}

	public void setDateBasedItem(List<LocationRequestDTO> dateBasedItem) {
		this.dateBasedItem = dateBasedItem;
	}

	public List<LocationRequestDTO> getItems() {
		return items;
	}

	public void setItems(List<LocationRequestDTO> items) {
		this.items = items;
	}

	public String getCurrencyId() {
		return currencyId;
	}

	public void setCurrencyId(String currencyId) {
		this.currencyId = currencyId;
	}

	public int getCurrencyRate() {
		return currencyRate;
	}

	public void setCurrencyRate(int currencyRate) {
		this.currencyRate = currencyRate;
	}

	public int getDeliveryModeHeader() {
		return deliveryModeHeader;
	}

	public void setDeliveryModeHeader(int deliveryModeHeader) {
		this.deliveryModeHeader = deliveryModeHeader;
	}

	public int getQuotationProcessStatusFk() {
		return quotationProcessStatusFk;
	}

	public void setQuotationProcessStatusFk(int quotationProcessStatusFk) {
		this.quotationProcessStatusFk = quotationProcessStatusFk;
	}

	public String getQuotationProcessStatus() {
		return quotationProcessStatus;
	}

	public void setQuotationProcessStatus(String quotationProcessStatus) {
		this.quotationProcessStatus = quotationProcessStatus;
	}

	public String getQuotationTransNo() {
		return quotationTransNo;
	}

	public void setQuotationTransNo(String quotationTransNo) {
		this.quotationTransNo = quotationTransNo;
	}

	public boolean isRenderDeleteIcon() {
		return renderDeleteIcon;
	}

	public void setRenderDeleteIcon(boolean renderDeleteIcon) {
		this.renderDeleteIcon = renderDeleteIcon;
	}

	public String getRegion() {
		return region;
	}

	public void setRegion(String region) {
		this.region = region;
	}

	public int getTerm() {
		return term;
	}

	public void setTerm(int term) {
		this.term = term;
	}

	public double getGross() {
		return gross;
	}

	public void setGross(double gross) {
		this.gross = gross;
	}

	public double getNet() {
		return net;
	}

	public void setNet(double net) {
		this.net = net;
	}

	public double getNetPp() {
		return netPp;
	}

	public void setNetPp(double netPp) {
		this.netPp = netPp;
	}

	public double getNetUp() {
		return netUp;
	}

	public void setNetUp(double netUp) {
		this.netUp = netUp;
	}

	public String getStats() {
		return stats;
	}

	public void setStats(String stats) {
		this.stats = stats;
	}

	public double getDisc() {
		return disc;
	}

	public void setDisc(double disc) {
		this.disc = disc;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public boolean isCheckBox() {
		return checkBox;
	}

	public void setCheckBox(boolean checkBox) {
		this.checkBox = checkBox;
	}

	public String getPreSupId() {
		return preSupId;
	}

	public void setPreSupId(String preSupId) {
		this.preSupId = preSupId;
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



	public List<LocationRequestDTO> getLocReqCreationList() {
		return locReqCreationList;
	}

	public void setLocReqCreationList(List<LocationRequestDTO> locReqCreationList) {
		this.locReqCreationList = locReqCreationList;
	}

	public List<LocationRequestDTO> getConsolidationList() {
		return consolidationList;
	}

	public void setConsolidationList(List<LocationRequestDTO> consolidationList) {
		this.consolidationList = consolidationList;
	}

	public List<LocationRequestDTO> getQuotationReplyList() {
		return quotationReplyList;
	}

	public void setQuotationReplyList(List<LocationRequestDTO> quotationReplyList) {
		this.quotationReplyList = quotationReplyList;
	}

	public List<LocationRequestDTO> getFinalizetheSupplierSelectionList() {
		return finalizetheSupplierSelectionList;
	}

	public void setFinalizetheSupplierSelectionList(List<LocationRequestDTO> finalizetheSupplierSelectionList) {
		this.finalizetheSupplierSelectionList = finalizetheSupplierSelectionList;
	}

	public List<LocationRequestDTO> getAutoGeneratePOList() {
		return autoGeneratePOList;
	}

	public void setAutoGeneratePOList(List<LocationRequestDTO> autoGeneratePOList) {
		this.autoGeneratePOList = autoGeneratePOList;
	}

	public double getQty1() {
		return qty1;
	}

	public void setQty1(double qty1) {
		this.qty1 = qty1;
	}

	public double getQty2() {
		return qty2;
	}

	public void setQty2(double qty2) {
		this.qty2 = qty2;
	}

	public double getQty3() {
		return qty3;
	}

	public void setQty3(double qty3) {
		this.qty3 = qty3;
	}

	public double getQty4() {
		return qty4;
	}

	public void setQty4(double qty4) {
		this.qty4 = qty4;
	}

	public double getQty5() {
		return qty5;
	}

	public void setQty5(double qty5) {
		this.qty5 = qty5;
	}

	public double getQty6() {
		return qty6;
	}

	public void setQty6(double qty6) {
		this.qty6 = qty6;
	}

	public double getQty7() {
		return qty7;
	}

	public void setQty7(double qty7) {
		this.qty7 = qty7;
	}

	public double getQty8() {
		return qty8;
	}

	public void setQty8(double qty8) {
		this.qty8 = qty8;
	}

	public double getQty9() {
		return qty9;
	}

	public void setQty9(double qty9) {
		this.qty9 = qty9;
	}

	public double getQty10() {
		return qty10;
	}

	public void setQty10(double qty10) {
		this.qty10 = qty10;
	}

	public double getQty11() {
		return qty11;
	}

	public void setQty11(double qty11) {
		this.qty11 = qty11;
	}

	public double getQty12() {
		return qty12;
	}

	public void setQty12(double qty12) {
		this.qty12 = qty12;
	}

	public double getQty13() {
		return qty13;
	}

	public void setQty13(double qty13) {
		this.qty13 = qty13;
	}

	public double getQty14() {
		return qty14;
	}

	public void setQty14(double qty14) {
		this.qty14 = qty14;
	}

	public double getQty15() {
		return qty15;
	}

	public void setQty15(double qty15) {
		this.qty15 = qty15;
	}

	public double getQty16() {
		return qty16;
	}

	public void setQty16(double qty16) {
		this.qty16 = qty16;
	}

	public double getQty17() {
		return qty17;
	}

	public void setQty17(double qty17) {
		this.qty17 = qty17;
	}

	public double getQty18() {
		return qty18;
	}

	public void setQty18(double qty18) {
		this.qty18 = qty18;
	}

	public double getQty19() {
		return qty19;
	}

	public void setQty19(double qty19) {
		this.qty19 = qty19;
	}

	public double getQty20() {
		return qty20;
	}

	public void setQty20(double qty20) {
		this.qty20 = qty20;
	}

	public double getQty21() {
		return qty21;
	}

	public void setQty21(double qty21) {
		this.qty21 = qty21;
	}

	public double getQty22() {
		return qty22;
	}

	public void setQty22(double qty22) {
		this.qty22 = qty22;
	}

	public double getQty23() {
		return qty23;
	}

	public void setQty23(double qty23) {
		this.qty23 = qty23;
	}

	public double getQty24() {
		return qty24;
	}

	public void setQty24(double qty24) {
		this.qty24 = qty24;
	}

	public double getQty25() {
		return qty25;
	}

	public void setQty25(double qty25) {
		this.qty25 = qty25;
	}

	public double getQty26() {
		return qty26;
	}

	public void setQty26(double qty26) {
		this.qty26 = qty26;
	}

	public double getQty27() {
		return qty27;
	}

	public void setQty27(double qty27) {
		this.qty27 = qty27;
	}

	public double getQty28() {
		return qty28;
	}

	public void setQty28(double qty28) {
		this.qty28 = qty28;
	}

	public double getQty29() {
		return qty29;
	}

	public void setQty29(double qty29) {
		this.qty29 = qty29;
	}

	public double getQty30() {
		return qty30;
	}

	public void setQty30(double qty30) {
		this.qty30 = qty30;
	}

	public double getQty31() {
		return qty31;
	}

	public void setQty31(double qty31) {
		this.qty31 = qty31;
	}

	public boolean isQtyRendered1() {
		return qtyRendered1;
	}

	public void setQtyRendered1(boolean qtyRendered1) {
		this.qtyRendered1 = qtyRendered1;
	}

	public boolean isQtyRendered2() {
		return qtyRendered2;
	}

	public void setQtyRendered2(boolean qtyRendered2) {
		this.qtyRendered2 = qtyRendered2;
	}

	public boolean isQtyRendered3() {
		return qtyRendered3;
	}

	public void setQtyRendered3(boolean qtyRendered3) {
		this.qtyRendered3 = qtyRendered3;
	}

	public boolean isQtyRendered4() {
		return qtyRendered4;
	}

	public void setQtyRendered4(boolean qtyRendered4) {
		this.qtyRendered4 = qtyRendered4;
	}

	public boolean isQtyRendered5() {
		return qtyRendered5;
	}

	public void setQtyRendered5(boolean qtyRendered5) {
		this.qtyRendered5 = qtyRendered5;
	}

	public boolean isQtyRendered6() {
		return qtyRendered6;
	}

	public void setQtyRendered6(boolean qtyRendered6) {
		this.qtyRendered6 = qtyRendered6;
	}

	public boolean isQtyRendered7() {
		return qtyRendered7;
	}

	public void setQtyRendered7(boolean qtyRendered7) {
		this.qtyRendered7 = qtyRendered7;
	}

	public boolean isQtyRendered8() {
		return qtyRendered8;
	}

	public void setQtyRendered8(boolean qtyRendered8) {
		this.qtyRendered8 = qtyRendered8;
	}

	public boolean isQtyRendered9() {
		return qtyRendered9;
	}

	public void setQtyRendered9(boolean qtyRendered9) {
		this.qtyRendered9 = qtyRendered9;
	}

	public boolean isQtyRendered10() {
		return qtyRendered10;
	}

	public void setQtyRendered10(boolean qtyRendered10) {
		this.qtyRendered10 = qtyRendered10;
	}

	public boolean isQtyRendered11() {
		return qtyRendered11;
	}

	public void setQtyRendered11(boolean qtyRendered11) {
		this.qtyRendered11 = qtyRendered11;
	}

	public boolean isQtyRendered12() {
		return qtyRendered12;
	}

	public void setQtyRendered12(boolean qtyRendered12) {
		this.qtyRendered12 = qtyRendered12;
	}

	public boolean isQtyRendered13() {
		return qtyRendered13;
	}

	public void setQtyRendered13(boolean qtyRendered13) {
		this.qtyRendered13 = qtyRendered13;
	}

	public boolean isQtyRendered14() {
		return qtyRendered14;
	}

	public void setQtyRendered14(boolean qtyRendered14) {
		this.qtyRendered14 = qtyRendered14;
	}

	public boolean isQtyRendered15() {
		return qtyRendered15;
	}

	public void setQtyRendered15(boolean qtyRendered15) {
		this.qtyRendered15 = qtyRendered15;
	}

	public boolean isQtyRendered16() {
		return qtyRendered16;
	}

	public void setQtyRendered16(boolean qtyRendered16) {
		this.qtyRendered16 = qtyRendered16;
	}

	public boolean isQtyRendered17() {
		return qtyRendered17;
	}

	public void setQtyRendered17(boolean qtyRendered17) {
		this.qtyRendered17 = qtyRendered17;
	}

	public boolean isQtyRendered18() {
		return qtyRendered18;
	}

	public void setQtyRendered18(boolean qtyRendered18) {
		this.qtyRendered18 = qtyRendered18;
	}

	public boolean isQtyRendered19() {
		return qtyRendered19;
	}

	public void setQtyRendered19(boolean qtyRendered19) {
		this.qtyRendered19 = qtyRendered19;
	}

	public boolean isQtyRendered20() {
		return qtyRendered20;
	}

	public void setQtyRendered20(boolean qtyRendered20) {
		this.qtyRendered20 = qtyRendered20;
	}

	public boolean isQtyRendered21() {
		return qtyRendered21;
	}

	public void setQtyRendered21(boolean qtyRendered21) {
		this.qtyRendered21 = qtyRendered21;
	}

	public boolean isQtyRendered22() {
		return qtyRendered22;
	}

	public void setQtyRendered22(boolean qtyRendered22) {
		this.qtyRendered22 = qtyRendered22;
	}

	public boolean isQtyRendered23() {
		return qtyRendered23;
	}

	public void setQtyRendered23(boolean qtyRendered23) {
		this.qtyRendered23 = qtyRendered23;
	}

	public boolean isQtyRendered24() {
		return qtyRendered24;
	}

	public void setQtyRendered24(boolean qtyRendered24) {
		this.qtyRendered24 = qtyRendered24;
	}

	public boolean isQtyRendered25() {
		return qtyRendered25;
	}

	public void setQtyRendered25(boolean qtyRendered25) {
		this.qtyRendered25 = qtyRendered25;
	}

	public boolean isQtyRendered26() {
		return qtyRendered26;
	}

	public void setQtyRendered26(boolean qtyRendered26) {
		this.qtyRendered26 = qtyRendered26;
	}

	public boolean isQtyRendered27() {
		return qtyRendered27;
	}

	public void setQtyRendered27(boolean qtyRendered27) {
		this.qtyRendered27 = qtyRendered27;
	}

	public boolean isQtyRendered28() {
		return qtyRendered28;
	}

	public void setQtyRendered28(boolean qtyRendered28) {
		this.qtyRendered28 = qtyRendered28;
	}

	public boolean isQtyRendered29() {
		return qtyRendered29;
	}

	public void setQtyRendered29(boolean qtyRendered29) {
		this.qtyRendered29 = qtyRendered29;
	}

	public boolean isQtyRendered30() {
		return qtyRendered30;
	}

	public void setQtyRendered30(boolean qtyRendered30) {
		this.qtyRendered30 = qtyRendered30;
	}

	public boolean isQtyRendered31() {
		return qtyRendered31;
	}

	public void setQtyRendered31(boolean qtyRendered31) {
		this.qtyRendered31 = qtyRendered31;
	}

	public String getRequestDateStr() {
		return requestDateStr;
	}

	public void setRequestDateStr(String requestDateStr) {
		this.requestDateStr = requestDateStr;
	}

	public int getDateNum() {
		return dateNum;
	}

	public void setDateNum(int dateNum) {
		this.dateNum = dateNum;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	
	
	
}
