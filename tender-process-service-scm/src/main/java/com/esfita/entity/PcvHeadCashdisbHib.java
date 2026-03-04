package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "cashdisbhead")
public class PcvHeadCashdisbHib implements Serializable {

    private static final long serialVersionUID = 3725050690026705071L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PCV_HEAD_PK", updatable = false, nullable = false)
    private Integer pcvHeadPk;

	@Column(name = "PCV_No")
    private String pcvNo;

    @Column(name = "Period")
    private Date period;

    @Column(name = "PCV_Date")
    private Date pcvDate;

    @Column(name = "PCV_Type")
    private String pcvType;

    @Column(name = "Pcv_Description")
    private String pcvDescription;

    @Column(name = "Cash_Purch_Ref")
    private Integer cashPurchRef;

    @Column(name = "Entity_ID")
    private String entityId;

    @Column(name = "Last_User")
    private Integer lastUser;

    @Column(name = "LastUpdate")
    private Date lastUpdate;
    
    
    public Integer getPcvHeadPk() {
		return pcvHeadPk;
	}

	public void setPcvHeadPk(Integer pcvHeadPk) {
		this.pcvHeadPk = pcvHeadPk;
	}

	public String getPcvNo() {
		return pcvNo;
	}

	public void setPcvNo(String pcvNo) {
		this.pcvNo = pcvNo;
	}

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public Date getPcvDate() {
		return pcvDate;
	}

	public void setPcvDate(Date pcvDate) {
		this.pcvDate = pcvDate;
	}

	public String getPcvType() {
		return pcvType;
	}

	public void setPcvType(String pcvType) {
		this.pcvType = pcvType;
	}

	public String getPcvDescription() {
		return pcvDescription;
	}

	public void setPcvDescription(String pcvDescription) {
		this.pcvDescription = pcvDescription;
	}

	public Integer getCashPurchRef() {
		return cashPurchRef;
	}

	public void setCashPurchRef(Integer cashPurchRef) {
		this.cashPurchRef = cashPurchRef;
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
