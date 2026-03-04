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
@Table(name = "qtn_req_head")
public class QuotationProcessHeadHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6395688408363896352L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "QTN_REQ_HEAD_PK", updatable = false)
	private int qtnReqHeadPk;

	@Column(name = "QTN_REQ_NO")
	private String qtnReqNo;

	@Column(name = "CON_ID")
	private String conId;

	@Column(name = "PERIOD")
	private Date period;

	@Column(name = "SUPPLIER_ID")
	private String supplierId;

	@Column(name = "RECEIVED_DATE")
	private Date receivedDate;

	@Column(name = "CURRENCY_ID")
	private String currencyId;

	@Column(name = "CURRENCY_RATE")
	private double currencyRate;

	@Column(name = "IS_QTN_MAIL_SEND")
	private int isQtnMailSend;

	@Column(name = "REMARKS")
	private int remarks;

	@Column(name = "ENTITY_ID")
	private String entityId;

	@Column(name = "STATUS_FK")
	private int statusFk;

	@Column(name = "CREATED_BY")
	private int createdBy;

	@Column(name = "CREATED_DATE")
	private Date createdDate;

	@Column(name = "LAST_ACT_BY")
	private int lastActBy;

	@Column(name = "LAST_ACT_DATE")
	private Date lastActDate;

	public int getQtnReqHeadPk() {
		return qtnReqHeadPk;
	}

	public void setQtnReqHeadPk(int qtnReqHeadPk) {
		this.qtnReqHeadPk = qtnReqHeadPk;
	}

	public String getQtnReqNo() {
		return qtnReqNo;
	}

	public void setQtnReqNo(String qtnReqNo) {
		this.qtnReqNo = qtnReqNo;
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

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public Date getReceivedDate() {
		return receivedDate;
	}

	public void setReceivedDate(Date receivedDate) {
		this.receivedDate = receivedDate;
	}

	public String getCurrencyId() {
		return currencyId;
	}

	public void setCurrencyId(String currencyId) {
		this.currencyId = currencyId;
	}

	public double getCurrencyRate() {
		return currencyRate;
	}

	public void setCurrencyRate(double currencyRate) {
		this.currencyRate = currencyRate;
	}

	

	

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	public int getRemarks() {
		return remarks;
	}

	public void setRemarks(int remarks) {
		this.remarks = remarks;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
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
	
	


}
