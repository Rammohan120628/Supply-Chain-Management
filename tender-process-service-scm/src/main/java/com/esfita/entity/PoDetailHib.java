package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "podetail", schema = "public")
public class PoDetailHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3725050690026705071L;
	@Id
	@SequenceGenerator(
	    name = "podetail_seq_gen",
	    sequenceName = "public.podetail_seq",
	    allocationSize = 1
	)
	@GeneratedValue(
	    strategy = GenerationType.SEQUENCE,
	    generator = "podetail_seq_gen"
	)
	@Column(name = "PODETAIL_PK", updatable = false, nullable = false)
	private Integer poDetailPk;

	@Column(name = "POHEAD_FK")
	private int poHeadFk;

	@Column(name = "PO_NUM")
	private String poNum;

	@Column(name = "PERIOD")
	private Date period;

	@Column(name = "ENT_ORDER")
	private int entOrder;

	@Column(name = "ITEM_ID")
	private int itemId;

	@Column(name = "PACKAGE_ID")
	private String packageId;

	@Column(name = "QTY")
	private double qty;

	public int getPoDetailPk() {
		return poDetailPk;
	}

	public void setPoDetailPk(int poDetailPk) {
		this.poDetailPk = poDetailPk;
	}

	public int getPoHeadFk() {
		return poHeadFk;
	}

	public void setPoHeadFk(int poHeadFk) {
		this.poHeadFk = poHeadFk;
	}

	public String getPoNum() {
		return poNum;
	}

	public void setPoNum(String poNum) {
		this.poNum = poNum;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
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

	public double getQuotedGp() {
		return quotedGp;
	}

	public void setQuotedGp(double quotedGp) {
		this.quotedGp = quotedGp;
	}

	public double getActualGp() {
		return actualGp;
	}

	public void setActualGp(double actualGp) {
		this.actualGp = actualGp;
	}

	public String getPricechReason() {
		return pricechReason;
	}

	public void setPricechReason(String pricechReason) {
		this.pricechReason = pricechReason;
	}

	public double getRcvdQty() {
		return rcvdQty;
	}

	public void setRcvdQty(double rcvdQty) {
		this.rcvdQty = rcvdQty;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "QUOTED_GP")
	private double quotedGp;

	@Column(name = "ACTUAL_GP")
	private double actualGp;

	@Column(name = "PRICECH_REASON")
	private String pricechReason;

	@Column(name = "RCVD_QTY")
	private double rcvdQty;

	@Column(name = "ENTITY_ID")
	private String entityId;


}
