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
@Table(name = "mst_user" , schema = "public")
public class MstUserHib implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 2948952686087571467L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "MU_USER_PK", updatable = false)
	private int muUserPk;

	@Column(name = "MU_AEN_ENT_FK")
	private int muAenEntFk;

	@Column(name = "MU_MCU_CUST_FK")
	private int muMcuCustFk;

	@Column(name = "MU_USER_CATEGORY")
	private int muUserCategory;

	@Column(name = "MU_USER_TYPE")
	private int muUserType;

	@Column(name = "MU_MOL_OUTLET_FK")
	private int muMolOutletFk;

	@Column(name = "MU_ME_EMP_FK")
	private int muMeEmpFk;

	@Column(name = "MU_USER_NAME")
	private String muUserName;

	@Column(name = "MU_FIRST_NAME")
	private String muFirstName;

	@Column(name = "MU_MID_NAME")
	private String muMidName;

	@Column(name = "MU_LAST_NAME")
	private String muLastName;

	@Column(name = "MU_EMAIL_ID")
	private String muEmailId;

	@Column(name = "MU_PWD")
	private String muPwd;

	@Column(name = "MU_STATUS")
	private String muStatus;

	@Column(name = "MU_MOBILE_NO")
	private String muMobileNo;

	@Column(name = "MU_ARG_REG_FK")
	private int muArgRegFk;

	@Column(name = "MU_ALC_LOC_FK")
	private int muAlcLocFk;

	@Column(name = "MU_ALZ_ZONE_FK")
	private int muAlzZoneFk;

	@Column(name = "MU_ADS_DELV_STORE_FK")
	private int muAdsDelvStoreFk;

	@Column(name = "MU_MVE_VENDOR_FK")
	private int muMveVendorFk;

	@Column(name = "MU_AWFS_WF_STATUS_FK")
	private int muAwfsWfStatusFk;

	@Column(name = "MU_LAST_ACT_BY")
	private int muLastActBy;

	@Column(name = "MU_LAST_ACT_DATE")
	private Date muLastActDate;

	@Column(name = "MU_FIRST_TIME_LOGIN")
	private int muFirstTimeLogin;

	@Column(name = "MU_LAST_SUCCESS_LOGIN")
	private Date muLastSuccessLogin;

	@Column(name = "MU_LAST_UNSUCCESS_LOGIN")
	private Date muLastUnsuccessLogin;

	@Column(name = "MU_ROLE_FK")
	private int muRoleFk;

	@Column(name = "MU_PASSWORD_CHANGED_DATE")
	private Date muPasswordChangedDate;

	public int getMuUserPk() {
		return muUserPk;
	}

	public void setMuUserPk(int muUserPk) {
		this.muUserPk = muUserPk;
	}

	public int getMuAenEntFk() {
		return muAenEntFk;
	}

	public void setMuAenEntFk(int muAenEntFk) {
		this.muAenEntFk = muAenEntFk;
	}

	public int getMuMcuCustFk() {
		return muMcuCustFk;
	}

	public void setMuMcuCustFk(int muMcuCustFk) {
		this.muMcuCustFk = muMcuCustFk;
	}

	public int getMuUserCategory() {
		return muUserCategory;
	}

	public void setMuUserCategory(int muUserCategory) {
		this.muUserCategory = muUserCategory;
	}

	public int getMuUserType() {
		return muUserType;
	}

	public void setMuUserType(int muUserType) {
		this.muUserType = muUserType;
	}

	public int getMuMolOutletFk() {
		return muMolOutletFk;
	}

	public void setMuMolOutletFk(int muMolOutletFk) {
		this.muMolOutletFk = muMolOutletFk;
	}

	public int getMuMeEmpFk() {
		return muMeEmpFk;
	}

	public void setMuMeEmpFk(int muMeEmpFk) {
		this.muMeEmpFk = muMeEmpFk;
	}

	public String getMuUserName() {
		return muUserName;
	}

	public void setMuUserName(String muUserName) {
		this.muUserName = muUserName;
	}

	public String getMuFirstName() {
		return muFirstName;
	}

	public void setMuFirstName(String muFirstName) {
		this.muFirstName = muFirstName;
	}

	public String getMuMidName() {
		return muMidName;
	}

	public void setMuMidName(String muMidName) {
		this.muMidName = muMidName;
	}

	public String getMuLastName() {
		return muLastName;
	}

	public void setMuLastName(String muLastName) {
		this.muLastName = muLastName;
	}

	public String getMuEmailId() {
		return muEmailId;
	}

	public void setMuEmailId(String muEmailId) {
		this.muEmailId = muEmailId;
	}

	public String getMuPwd() {
		return muPwd;
	}

	public void setMuPwd(String muPwd) {
		this.muPwd = muPwd;
	}

	public String getMuStatus() {
		return muStatus;
	}

	public void setMuStatus(String muStatus) {
		this.muStatus = muStatus;
	}

	public String getMuMobileNo() {
		return muMobileNo;
	}

	public void setMuMobileNo(String muMobileNo) {
		this.muMobileNo = muMobileNo;
	}

	public int getMuArgRegFk() {
		return muArgRegFk;
	}

	public void setMuArgRegFk(int muArgRegFk) {
		this.muArgRegFk = muArgRegFk;
	}

	public int getMuAlcLocFk() {
		return muAlcLocFk;
	}

	public void setMuAlcLocFk(int muAlcLocFk) {
		this.muAlcLocFk = muAlcLocFk;
	}

	public int getMuAlzZoneFk() {
		return muAlzZoneFk;
	}

	public void setMuAlzZoneFk(int muAlzZoneFk) {
		this.muAlzZoneFk = muAlzZoneFk;
	}

	public int getMuAdsDelvStoreFk() {
		return muAdsDelvStoreFk;
	}

	public void setMuAdsDelvStoreFk(int muAdsDelvStoreFk) {
		this.muAdsDelvStoreFk = muAdsDelvStoreFk;
	}

	public int getMuMveVendorFk() {
		return muMveVendorFk;
	}

	public void setMuMveVendorFk(int muMveVendorFk) {
		this.muMveVendorFk = muMveVendorFk;
	}

	public int getMuAwfsWfStatusFk() {
		return muAwfsWfStatusFk;
	}

	public void setMuAwfsWfStatusFk(int muAwfsWfStatusFk) {
		this.muAwfsWfStatusFk = muAwfsWfStatusFk;
	}

	public int getMuLastActBy() {
		return muLastActBy;
	}

	public void setMuLastActBy(int muLastActBy) {
		this.muLastActBy = muLastActBy;
	}

	public Date getMuLastActDate() {
		return muLastActDate;
	}

	public void setMuLastActDate(Date muLastActDate) {
		this.muLastActDate = muLastActDate;
	}

	public int getMuFirstTimeLogin() {
		return muFirstTimeLogin;
	}

	public void setMuFirstTimeLogin(int muFirstTimeLogin) {
		this.muFirstTimeLogin = muFirstTimeLogin;
	}

	public Date getMuLastSuccessLogin() {
		return muLastSuccessLogin;
	}

	public void setMuLastSuccessLogin(Date muLastSuccessLogin) {
		this.muLastSuccessLogin = muLastSuccessLogin;
	}

	public Date getMuLastUnsuccessLogin() {
		return muLastUnsuccessLogin;
	}

	public void setMuLastUnsuccessLogin(Date muLastUnsuccessLogin) {
		this.muLastUnsuccessLogin = muLastUnsuccessLogin;
	}

	public int getMuRoleFk() {
		return muRoleFk;
	}

	public void setMuRoleFk(int muRoleFk) {
		this.muRoleFk = muRoleFk;
	}

	public Date getMuPasswordChangedDate() {
		return muPasswordChangedDate;
	}

	public void setMuPasswordChangedDate(Date muPasswordChangedDate) {
		this.muPasswordChangedDate = muPasswordChangedDate;
	}

	public int getMuCrtBy() {
		return muCrtBy;
	}

	public void setMuCrtBy(int muCrtBy) {
		this.muCrtBy = muCrtBy;
	}

	public Date getMuCrtDate() {
		return muCrtDate;
	}

	public void setMuCrtDate(Date muCrtDate) {
		this.muCrtDate = muCrtDate;
	}

	public Date getMuInterfaceDate() {
		return muInterfaceDate;
	}

	public void setMuInterfaceDate(Date muInterfaceDate) {
		this.muInterfaceDate = muInterfaceDate;
	}

	public String getMuEmployeeCode() {
		return muEmployeeCode;
	}

	public void setMuEmployeeCode(String muEmployeeCode) {
		this.muEmployeeCode = muEmployeeCode;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "MU_CRT_BY")
	private int muCrtBy;

	@Column(name = "MU_CRT_DATE")
	private Date muCrtDate;

	@Column(name = "MU_INTERFACE_DATE")
	private Date muInterfaceDate;

	@Column(name = "MU_EMPLOYEE_CODE")
	private String muEmployeeCode;

}
