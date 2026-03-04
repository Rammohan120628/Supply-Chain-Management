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
@Table(name = "mst_item_account")
public class MstItemAccountHib implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ITEM_ACCOUNT_PK", updatable = false, nullable = false)
    private Integer itemAccountPk;

    
    public int getItemAccountPk() {
		return itemAccountPk;
	}

	public void setItemAccountPk(int itemAccountPk) {
		this.itemAccountPk = itemAccountPk;
	}

	public String getAccountId() {
		return accountId;
	}

	public void setAccountId(String accountId) {
		this.accountId = accountId;
	}

	public String getAccountName() {
		return accountName;
	}

	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}

	public String getAccountType() {
		return accountType;
	}

	public void setAccountType(String accountType) {
		this.accountType = accountType;
	}

	public String getConsAccountId() {
		return consAccountId;
	}

	public void setConsAccountId(String consAccountId) {
		this.consAccountId = consAccountId;
	}

	public String getConsAccountName() {
		return consAccountName;
	}

	public void setConsAccountName(String consAccountName) {
		this.consAccountName = consAccountName;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
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

	@Column(name = "ACCOUNT_ID")
    private String accountId;

    @Column(name = "ACCOUNT_NAME")
    private String accountName;

    @Column(name = "ACCOUNT_TYPE")
    private String accountType;

    @Column(name = "CONS_ACCOUNT_ID")
    private String consAccountId;

    @Column(name = "CONS_ACCOUNT_NAME")
    private String consAccountName;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "ENTITY_ID")
    private String entityId;

    @Column(name = "CREATED_BY")
    private int createdBy;

    @Column(name = "CREATED_DATE")
    private Date createdDate;

    @Column(name = "LAST_ACT_BY")
    private int lastActBy;

    @Column(name = "LAST_ACT_DATE")
    private Date lastActDate;
}
