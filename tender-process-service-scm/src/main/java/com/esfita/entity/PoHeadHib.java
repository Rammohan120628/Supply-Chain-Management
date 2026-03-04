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
@Table(name = "pohead", schema = "public")
public class PoHeadHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3725050690026705071L;
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Pohead_Pk", updatable = false)
	private int poheadPk;

	@Column(name = "Po_Num")
	private String poNum;

	@Column(name = "Is_Manual")
	private int isManual;

	@Column(name = "Con_Id")
	private String conId;

	@Column(name = "Period")
	private Date period;

	@Column(name = "PO_Date")
	private Date poDate;

	@Column(name = "Supplier_ID")
	private String supplierId;

	@Column(name = "Ord_Loc")
	private String ordLoc;

	@Column(name = "Currency_ID")
	private String currencyId;

	@Column(name = "Currency_Rate")
	private double currencyRate;

	@Column(name = "Disc_Per")
	private double discPer;

	@Column(name = "Is_Po_Mail_Sent")
	private int isPoMailSent;

	@Column(name = "Entity_ID")
	private String entityId;

	@Column(name = "Last_User")
	private int lastUser;

	@Column(name = "Last_Update")
	private Date lastUpdate;

	@Column(name = "Delivery_Type")
	private int deliveryType; // 0 means CWH, 1 means DD

	@Column(name = "Status_Fk")
	private int statusFk;

	public int getPoheadPk() {
		return poheadPk;
	}

	public void setPoheadPk(int poheadPk) {
		this.poheadPk = poheadPk;
	}

	public String getPoNum() {
		return poNum;
	}

	public void setPoNum(String poNum) {
		this.poNum = poNum;
	}

	public int getIsManual() {
		return isManual;
	}

	public void setIsManual(int isManual) {
		this.isManual = isManual;
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

	public Date getPoDate() {
		return poDate;
	}

	public void setPoDate(Date poDate) {
		this.poDate = poDate;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public String getOrdLoc() {
		return ordLoc;
	}

	public void setOrdLoc(String ordLoc) {
		this.ordLoc = ordLoc;
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

	public double getDiscPer() {
		return discPer;
	}

	public void setDiscPer(double discPer) {
		this.discPer = discPer;
	}

	public int getIsPoMailSent() {
		return isPoMailSent;
	}

	public void setIsPoMailSent(int isPoMailSent) {
		this.isPoMailSent = isPoMailSent;
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

	public int getDeliveryType() {
		return deliveryType;
	}

	public void setDeliveryType(int deliveryType) {
		this.deliveryType = deliveryType;
	}

	public int getStatusFk() {
		return statusFk;
	}

	public void setStatusFk(int statusFk) {
		this.statusFk = statusFk;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

}
