package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "req_detail_new", schema = "public")
public class LocationRequestDetailHib implements Serializable {

    private static final long serialVersionUID = 6395688408363896352L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REQ_DETAIL2_PK", updatable = false)
    private Integer reqDetailPk;

    @Column(name = "REQ_HEAD2_FK")
    private int reqHeadFk;

    @Column(name = "REQ_NO")
    private String reqNo;

    @Column(name = "ITEM_ID")
    private Integer itemId;

    @Column(name = "PACKAGE_ID")
    private String packageId;

    @Column(name = "REQUEST_DATE")
    @Temporal(TemporalType.DATE)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date requestDate;

    @Column(name = "ENT_ORDER")
    private Integer entOrder;

    @Column(name = "QTY")
    private Double qty;

    @Column(name = "SUPPLIER_ID")
    private String supplierId;

    @Column(name = "SUPP_DEL_DATE")
    @Temporal(TemporalType.DATE)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date suppDelDate;

    @Column(name = "CWH_DEL_DATE")
    @Temporal(TemporalType.DATE)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date cwhDelDate;

    @Column(name = "DEL_LOC_ID")
    private String delLocId;

    @Column(name = "ENTITY_ID")
    private String entityId;

    @Column(name = "DELIVERY_MODE")
    private String deliveryMode;

    @Column(name = "STATUS_FK")
    private int statusFk;

	public Integer getReqDetailPk() {
		return reqDetailPk;
	}

	public void setReqDetailPk(Integer reqDetailPk) {
		this.reqDetailPk = reqDetailPk;
	}

	public int getReqHeadFk() {
		return reqHeadFk;
	}

	public void setReqHeadFk(int reqHeadFk) {
		this.reqHeadFk = reqHeadFk;
	}

	public String getReqNo() {
		return reqNo;
	}

	public void setReqNo(String reqNo) {
		this.reqNo = reqNo;
	}

	public Integer getItemId() {
		return itemId;
	}

	public void setItemId(Integer itemId) {
		this.itemId = itemId;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public Date getRequestDate() {
		return requestDate;
	}

	public void setRequestDate(Date requestDate) {
		this.requestDate = requestDate;
	}

	public Integer getEntOrder() {
		return entOrder;
	}

	public void setEntOrder(Integer entOrder) {
		this.entOrder = entOrder;
	}

	public Double getQty() {
		return qty;
	}

	public void setQty(Double qty) {
		this.qty = qty;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public Date getSuppDelDate() {
		return suppDelDate;
	}

	public void setSuppDelDate(Date suppDelDate) {
		this.suppDelDate = suppDelDate;
	}

	public Date getCwhDelDate() {
		return cwhDelDate;
	}

	public void setCwhDelDate(Date cwhDelDate) {
		this.cwhDelDate = cwhDelDate;
	}

	public String getDelLocId() {
		return delLocId;
	}

	public int getStatusFk() {
		return statusFk;
	}

	public void setStatusFk(int statusFk) {
		this.statusFk = statusFk;
	}

	public void setDelLocId(String delLocId) {
		this.delLocId = delLocId;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public String getDeliveryMode() {
		return deliveryMode;
	}

	public void setDeliveryMode(String deliveryMode) {
		this.deliveryMode = deliveryMode;
	}

	

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

    // Getters and Setters (Lombok @Data will handle these)
}
