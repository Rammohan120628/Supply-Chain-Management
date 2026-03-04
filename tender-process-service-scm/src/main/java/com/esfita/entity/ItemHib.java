package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "item", schema = "public")
public class ItemHib implements Serializable {

    private static final long serialVersionUID = 3725050690026705071L;

    @Id
    @Column(name = "item_pk")
    private Integer itemPk;

    @Column(name = "item_id")
    private String itemId;

    @Column(name = "package_id")
    private String packageId;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "ip01")
    private Double ip01;

    @Column(name = "ip02")
    private Double ip02;

    @Column(name = "ip03")
    private Double ip03;

    @Column(name = "ip04")
    private Double ip04;

    @Column(name = "ip05")
    private Double ip05;

    @Column(name = "ip06")
    private Double ip06;

    @Column(name = "ip07")
    private Double ip07;

    @Column(name = "ip08")
    private Double ip08;

    @Column(name = "ip09")
    private Double ip09;

    @Column(name = "ip10")
    private Double ip10;

    @Column(name = "created_date")
    @Temporal(TemporalType.DATE)
    private Date createdDate;

    @Column(name = "last_purch_price")
    private Double lastPurchPrice;
    
    @Column(name = "last_purch_exp_dt")
    @Temporal(TemporalType.DATE)
    private Date lastPurchExpDt;

    @Column(name = "is_active")
    private Integer isActive;

    @Column(name = "account_id")
    private String accountId;

    @Column(name = "report_head_group")
    private String reportHeadGroup;

    @Column(name = "min_stock")
    private Double minStock;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "last_user")
    private Integer lastUser;

    @Column(name = "last_update")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdate;

	public Integer getItemPk() {
		return itemPk;
	}

	public void setItemPk(Integer itemPk) {
		this.itemPk = itemPk;
	}

	public String getItemId() {
		return itemId;
	}

	public void setItemId(String itemId) {
		this.itemId = itemId;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public Double getIp01() {
		return ip01;
	}

	public void setIp01(Double ip01) {
		this.ip01 = ip01;
	}

	public Double getIp02() {
		return ip02;
	}

	public void setIp02(Double ip02) {
		this.ip02 = ip02;
	}

	public Double getIp03() {
		return ip03;
	}

	public void setIp03(Double ip03) {
		this.ip03 = ip03;
	}

	public Double getIp04() {
		return ip04;
	}

	public void setIp04(Double ip04) {
		this.ip04 = ip04;
	}

	public Double getIp05() {
		return ip05;
	}

	public void setIp05(Double ip05) {
		this.ip05 = ip05;
	}

	public Double getIp06() {
		return ip06;
	}

	public void setIp06(Double ip06) {
		this.ip06 = ip06;
	}

	public Double getIp07() {
		return ip07;
	}

	public void setIp07(Double ip07) {
		this.ip07 = ip07;
	}

	public Double getIp08() {
		return ip08;
	}

	public void setIp08(Double ip08) {
		this.ip08 = ip08;
	}

	public Double getIp09() {
		return ip09;
	}

	public void setIp09(Double ip09) {
		this.ip09 = ip09;
	}

	public Double getIp10() {
		return ip10;
	}

	public void setIp10(Double ip10) {
		this.ip10 = ip10;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public Double getLastPurchPrice() {
		return lastPurchPrice;
	}

	public void setLastPurchPrice(Double lastPurchPrice) {
		this.lastPurchPrice = lastPurchPrice;
	}

	public Date getLastPurchExpDt() {
		return lastPurchExpDt;
	}

	public void setLastPurchExpDt(Date lastPurchExpDt) {
		this.lastPurchExpDt = lastPurchExpDt;
	}

	public Integer getIsActive() {
		return isActive;
	}

	public void setIsActive(Integer isActive) {
		this.isActive = isActive;
	}

	public String getAccountId() {
		return accountId;
	}

	public void setAccountId(String accountId) {
		this.accountId = accountId;
	}

	public String getReportHeadGroup() {
		return reportHeadGroup;
	}

	public void setReportHeadGroup(String reportHeadGroup) {
		this.reportHeadGroup = reportHeadGroup;
	}

	public Double getMinStock() {
		return minStock;
	}

	public void setMinStock(Double minStock) {
		this.minStock = minStock;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
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

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

    
    
    
}
