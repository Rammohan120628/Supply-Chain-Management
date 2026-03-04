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
@Table(name = "selectedsupplier", schema = "public")
public class SelectedSupplierHib implements Serializable {

    private static final long serialVersionUID = 3725050690026705071L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "selected_supplier_pk", updatable = false)
    private Integer selectedSupplierPk;

    @Column(name = "item_id")
    private Integer itemId;

    @Column(name = "package_id")
    private String packageId;

    @Column(name = "period")
    @Temporal(TemporalType.TIMESTAMP)
    private Date period;

    @Column(name = "consolidation_id")
    private String consolidationId;

    @Column(name = "supplier_id")
    private String supplierId;

    @Column(name = "currency_id")
    private String currencyId;

    @Column(name = "currency_rate")
    private Double currencyRate;

    @Column(name = "gp")
    private Double gp;

    @Column(name = "np")
    private Double np;

    @Column(name = "ac01")
    private Double ac01;

    @Column(name = "ac02")
    private Double ac02;

    @Column(name = "ac03")
    private Double ac03;

    @Column(name = "ac04")
    private Double ac04;

    @Column(name = "nct01")
    private Double nct01;

    @Column(name = "nct02")
    private Double nct02;

    @Column(name = "nct03")
    private Double nct03;

    @Column(name = "nct04")
    private Double nct04;

    @Column(name = "is_price_mail_sent")
    private String isPriceMailSent;

    @Column(name = "is_price_confirm")
    private int isPriceConfirm; // DB is text, map as String

    @Column(name = "is_ordered_by_zdp")
    private int isOrderedByZdp; // DB is text, map as String

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "last_act_by")
    private Integer lastActBy;

    @Column(name = "last_act_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastActDate;

    @Column(name = "s_discount_perc")
    private Double sDiscountPerc;

    @Column(name = "s_no_days")
    private Integer sNoDays;

    @Column(name = "s_oper_region")
    private String sOperRegion;

	public Integer getSelectedSupplierPk() {
		return selectedSupplierPk;
	}

	public void setSelectedSupplierPk(Integer selectedSupplierPk) {
		this.selectedSupplierPk = selectedSupplierPk;
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

	public Date getPeriod() {
		return period;
	}

	public void setPeriod(Date period) {
		this.period = period;
	}

	public String getConsolidationId() {
		return consolidationId;
	}

	public void setConsolidationId(String consolidationId) {
		this.consolidationId = consolidationId;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public String getCurrencyId() {
		return currencyId;
	}

	public void setCurrencyId(String currencyId) {
		this.currencyId = currencyId;
	}

	public Double getCurrencyRate() {
		return currencyRate;
	}

	public void setCurrencyRate(Double currencyRate) {
		this.currencyRate = currencyRate;
	}

	public Double getGp() {
		return gp;
	}

	public void setGp(Double gp) {
		this.gp = gp;
	}

	public Double getNp() {
		return np;
	}

	public void setNp(Double np) {
		this.np = np;
	}

	public Double getAc01() {
		return ac01;
	}

	public void setAc01(Double ac01) {
		this.ac01 = ac01;
	}

	public Double getAc02() {
		return ac02;
	}

	public void setAc02(Double ac02) {
		this.ac02 = ac02;
	}

	public Double getAc03() {
		return ac03;
	}

	public void setAc03(Double ac03) {
		this.ac03 = ac03;
	}

	public Double getAc04() {
		return ac04;
	}

	public void setAc04(Double ac04) {
		this.ac04 = ac04;
	}

	public Double getNct01() {
		return nct01;
	}

	public void setNct01(Double nct01) {
		this.nct01 = nct01;
	}

	public Double getNct02() {
		return nct02;
	}

	public void setNct02(Double nct02) {
		this.nct02 = nct02;
	}

	public Double getNct03() {
		return nct03;
	}

	public void setNct03(Double nct03) {
		this.nct03 = nct03;
	}

	public Double getNct04() {
		return nct04;
	}

	public void setNct04(Double nct04) {
		this.nct04 = nct04;
	}

	public String getIsPriceMailSent() {
		return isPriceMailSent;
	}

	public void setIsPriceMailSent(String isPriceMailSent) {
		this.isPriceMailSent = isPriceMailSent;
	}

	

	

	public int getIsPriceConfirm() {
		return isPriceConfirm;
	}

	public void setIsPriceConfirm(int isPriceConfirm) {
		this.isPriceConfirm = isPriceConfirm;
	}

	public int getIsOrderedByZdp() {
		return isOrderedByZdp;
	}

	public void setIsOrderedByZdp(int isOrderedByZdp) {
		this.isOrderedByZdp = isOrderedByZdp;
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

	public Integer getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(Integer lastActBy) {
		this.lastActBy = lastActBy;
	}

	public Date getLastActDate() {
		return lastActDate;
	}

	public void setLastActDate(Date lastActDate) {
		this.lastActDate = lastActDate;
	}

	public Double getsDiscountPerc() {
		return sDiscountPerc;
	}

	public void setsDiscountPerc(Double sDiscountPerc) {
		this.sDiscountPerc = sDiscountPerc;
	}

	public Integer getsNoDays() {
		return sNoDays;
	}

	public void setsNoDays(Integer sNoDays) {
		this.sNoDays = sNoDays;
	}

	public String getsOperRegion() {
		return sOperRegion;
	}

	public void setsOperRegion(String sOperRegion) {
		this.sOperRegion = sOperRegion;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

    
    
}
