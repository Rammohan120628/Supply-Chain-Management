package com.esfita.entity;

import java.io.Serializable;

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
@Table(name = "qtn_req_detail", schema = "public")
public class QuotationProcessDetailHib implements Serializable {

	/**
	 * 
	 */
	
	private static final long serialVersionUID = 6395688408363896352L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "QTN_REQ_DETAIL_PK", updatable = false)
	private int qtnReqDetailPk;

	@Column(name = "QUOTATION_REQ_HEAD_FK")
	private int quotationReqHeadFk;

	@Column(name = "QTN_REQ_NO")
	private String qtnReqNo;

	@Column(name = "ENT_ORDER")
	private int entOrder;

	@Column(name = "ITEM_ID")
	private int itemId;

	@Column(name = "PACKAGE_ID")
	private String packageId;

	@Column(name = "QTY")
	private double qty;

	@Column(name = "GP")
	private double gp;

	@Column(name = "AC_01")
	private double ac01;

	@Column(name = "AC_02")
	private double ac02;

	@Column(name = "AC_03")
	private double ac03;

	@Column(name = "AC_04")
	private double ac04;

	@Column(name = "NCT_01")
	private double nct01;

	@Column(name = "NCT_02")
	private double nct02;

	@Column(name = "NCT_03")
	private double nct03;

	@Column(name = "NCT_04")
	private double nct04;

	@Column(name = "RGP")
	private double rgp;

	@Column(name = "RAC_01")
	private double rac01;

	@Column(name = "RAC_02")
	private double rac02;

	@Column(name = "RAC_03")
	private double rac03;

	@Column(name = "RAC_04")
	private double rac04;

	@Column(name = "RNCT_01")
	private double rnct01;

	@Column(name = "RNCT_02")
	private double rnct02;

	@Column(name = "RNCT_03")
	private double rnct03;

	@Column(name = "RNCT_04")
	private double rnct04;

	@Column(name = "NP")
	private double np;

	@Column(name = "DISC_PER")
	private double discPer;

	@Column(name = "NO_OF_DAY")
	private int noOfDay;

	@Column(name = "SELECTION_TYPE")
	private String selectionType;

	@Column(name = "REMARKS")
	private String remarks;

	@Column(name = "PRE_SUP_ID")
	private String preSupId;

	@Column(name = "ENTITY_ID")
	private String entityId;

	public int getQtnReqDetailPk() {
		return qtnReqDetailPk;
	}

	public void setQtnReqDetailPk(int qtnReqDetailPk) {
		this.qtnReqDetailPk = qtnReqDetailPk;
	}

	public int getQuotationReqHeadFk() {
		return quotationReqHeadFk;
	}

	public void setQuotationReqHeadFk(int quotationReqHeadFk) {
		this.quotationReqHeadFk = quotationReqHeadFk;
	}

	public String getQtnReqNo() {
		return qtnReqNo;
	}

	public void setQtnReqNo(String qtnReqNo) {
		this.qtnReqNo = qtnReqNo;
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

	public double getGp() {
		return gp;
	}

	public void setGp(double gp) {
		this.gp = gp;
	}

	public double getAc01() {
		return ac01;
	}

	public void setAc01(double ac01) {
		this.ac01 = ac01;
	}

	public double getAc02() {
		return ac02;
	}

	public void setAc02(double ac02) {
		this.ac02 = ac02;
	}

	public double getAc03() {
		return ac03;
	}

	public void setAc03(double ac03) {
		this.ac03 = ac03;
	}

	public double getAc04() {
		return ac04;
	}

	public void setAc04(double ac04) {
		this.ac04 = ac04;
	}

	public double getNct01() {
		return nct01;
	}

	public void setNct01(double nct01) {
		this.nct01 = nct01;
	}

	public double getNct02() {
		return nct02;
	}

	public void setNct02(double nct02) {
		this.nct02 = nct02;
	}

	public double getNct03() {
		return nct03;
	}

	public void setNct03(double nct03) {
		this.nct03 = nct03;
	}

	public double getNct04() {
		return nct04;
	}

	public void setNct04(double nct04) {
		this.nct04 = nct04;
	}

	public double getRgp() {
		return rgp;
	}

	public void setRgp(double rgp) {
		this.rgp = rgp;
	}

	public double getRac01() {
		return rac01;
	}

	public void setRac01(double rac01) {
		this.rac01 = rac01;
	}

	public double getRac02() {
		return rac02;
	}

	public void setRac02(double rac02) {
		this.rac02 = rac02;
	}

	public double getRac03() {
		return rac03;
	}

	public void setRac03(double rac03) {
		this.rac03 = rac03;
	}

	public double getRac04() {
		return rac04;
	}

	public void setRac04(double rac04) {
		this.rac04 = rac04;
	}

	public double getRnct01() {
		return rnct01;
	}

	public void setRnct01(double rnct01) {
		this.rnct01 = rnct01;
	}

	public double getRnct02() {
		return rnct02;
	}

	public void setRnct02(double rnct02) {
		this.rnct02 = rnct02;
	}

	public double getRnct03() {
		return rnct03;
	}

	public void setRnct03(double rnct03) {
		this.rnct03 = rnct03;
	}

	public double getRnct04() {
		return rnct04;
	}

	public void setRnct04(double rnct04) {
		this.rnct04 = rnct04;
	}

	public double getNp() {
		return np;
	}

	public void setNp(double np) {
		this.np = np;
	}

	public double getDiscPer() {
		return discPer;
	}

	public void setDiscPer(double discPer) {
		this.discPer = discPer;
	}

	public int getNoOfDay() {
		return noOfDay;
	}

	public void setNoOfDay(int noOfDay) {
		this.noOfDay = noOfDay;
	}

	public String getSelectionType() {
		return selectionType;
	}

	public void setSelectionType(String selectionType) {
		this.selectionType = selectionType;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public String getPreSupId() {
		return preSupId;
	}

	public void setPreSupId(String preSupId) {
		this.preSupId = preSupId;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}
	
	

}
