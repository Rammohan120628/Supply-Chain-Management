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
@Table(name = "req_head")
public class QuotationRequeustHeadHib implements Serializable {

    private static final long serialVersionUID = 6395688408363896352L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REQ_HEAD_PK")
    private Integer reqHeadPk;
    

    @Column(name = "REQ_NO")
    private String reqNo;

    @Column(name = "CON_ID")
    private String conId;

    @Column(name = "PERIOD")
    private Date period;

    @Column(name = "LOCATION_ID")
    private String locationId;

    @Column(name = "ENTITY_ID")
    private String entityId;

    @Column(name = "CREATED_BY")
    private Integer createdBy;

    @Column(name = "CREATED_DATE")
    private Date createdDate;

    @Column(name = "LAST_USER")
    private Integer lastUser;

    @Column(name = "LAST_UPDATE")
    private Date lastUpdate;

    @Column(name = "PROCESSED")
    private String processed;

    @Column(name = "IS_FINAL")
    private Integer isFinal;

    @Column(name = "DELIVERY_MODE")
    private Integer deliveryMode;

    @Column(name = "STATUS_FK")
    private Integer statusFk;

	public Integer getReqHeadPk() {
		return reqHeadPk;
	}

	public void setReqHeadPk(Integer reqHeadPk) {
		this.reqHeadPk = reqHeadPk;
	}

	public String getReqNo() {
		return reqNo;
	}

	public void setReqNo(String reqNo) {
		this.reqNo = reqNo;
	}

	public String getConId() {
		return conId;
	}

	public void setConId(String conId) {
		this.conId = conId;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public String getLocationId() {
		return locationId;
	}

	public void setLocationId(String locationId) {
		this.locationId = locationId;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public Integer getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Integer createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public Integer getLastUser() {
		return lastUser;
	}

	public void setLastUser(Integer lastUser) {
		this.lastUser = lastUser;
	}

	public Date getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}

	public String getProcessed() {
		return processed;
	}

	public void setProcessed(String processed) {
		this.processed = processed;
	}

	public Integer getIsFinal() {
		return isFinal;
	}

	public void setIsFinal(Integer isFinal) {
		this.isFinal = isFinal;
	}

	public Integer getDeliveryMode() {
		return deliveryMode;
	}

	public void setDeliveryMode(Integer deliveryMode) {
		this.deliveryMode = deliveryMode;
	}

	public Integer getStatusFk() {
		return statusFk;
	}

	public void setStatusFk(Integer statusFk) {
		this.statusFk = statusFk;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}
    
    
    
}
