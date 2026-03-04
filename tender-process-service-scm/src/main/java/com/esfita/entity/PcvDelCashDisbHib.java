package com.esfita.entity;

import java.io.Serializable;

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
@Table(name = "cashdisbdetail")
public class PcvDelCashDisbHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3725050690026705071L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "PCV_DEL_PK", updatable = false, nullable = false)
	private int pcvDelPk;

	@Column(name = "PCV_HEAD_FK")
	private int pcvHeadFk;

	@Column(name = "PCV_No")
	private String pcvNo;

	@Column(name = "Ent_Order")
	private int entOrder;

	@Column(name = "Account_ID")
	private String accountId;

	@Column(name = "Sub_Account_Id")
	private String subAccountId;

	@Column(name = "Description")
	private String description;

	@Column(name = "Amount")
	private double amount;

	@Column(name = "Entity_ID")
	private String entityId;

	public int getPcvDelPk() {
		return pcvDelPk;
	}

	public void setPcvDelPk(int pcvDelPk) {
		this.pcvDelPk = pcvDelPk;
	}

	public int getPcvHeadFk() {
		return pcvHeadFk;
	}

	public void setPcvHeadFk(int pcvHeadFk) {
		this.pcvHeadFk = pcvHeadFk;
	}

	public String getPcvNo() {
		return pcvNo;
	}

	public void setPcvNo(String pcvNo) {
		this.pcvNo = pcvNo;
	}

	public int getEntOrder() {
		return entOrder;
	}

	public void setEntOrder(int entOrder) {
		this.entOrder = entOrder;
	}

	public String getAccountId() {
		return accountId;
	}

	public void setAccountId(String accountId) {
		this.accountId = accountId;
	}

	public String getSubAccountId() {
		return subAccountId;
	}

	public void setSubAccountId(String subAccountId) {
		this.subAccountId = subAccountId;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}


}
