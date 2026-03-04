package com.esfita.entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "mst_user", schema = "public")
public class MstUserHib {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mu_user_pk", updatable = false)
    private Integer userPk;

    @Column(name = "mu_aen_ent_fk")
    private Integer entityFk;

    @Column(name = "mu_mcu_cust_fk")
    private Integer customerFk;

    @Column(name = "mu_user_category")
    private Integer userCategory;

    @Column(name = "mu_user_type")
    private Integer userType;

    @Column(name = "mu_mol_outlet_fk")
    private Integer outletFk;

    @Column(name = "mu_me_emp_fk")
    private Integer employeeFk;

    @Column(name = "mu_user_name")
    private String userName;

    @Column(name = "mu_first_name")
    private String firstName;

    @Column(name = "mu_mid_name")
    private String middleName;

    @Column(name = "mu_last_name")
    private String lastName;

    @Column(name = "mu_email_id")
    private String emailId;

    @Column(name = "mu_pwd")
    private String password;

    @Column(name = "mu_status")
    private String status;

    @Column(name = "mu_mobile_no")
    private String mobileNo;

    @Column(name = "mu_arg_reg_fk")
    private Integer regionFk;

    @Column(name = "mu_alc_loc_fk")
    private Integer locationFk;

    @Column(name = "mu_alz_zone_fk")
    private Integer zoneFk;

    @Column(name = "mu_ads_delv_store_fk")
    private Integer deliveryStoreFk;

    @Column(name = "mu_mve_vendor_fk")
    private Integer vendorFk;

    @Column(name = "mu_awfs_wf_status_fk")
    private Integer workflowStatusFk;

    @Column(name = "mu_last_act_by")
    private Integer lastActBy;

    @Column(name = "mu_last_act_date")
    private Date lastActDate;

    @Column(name = "mu_first_time_login")
    private Integer firstTimeLogin;

    @Column(name = "mu_last_success_login")
    private Date lastSuccessLogin;

    @Column(name = "mu_last_unsuccess_login")
    private Date lastUnsuccessLogin;

    @Column(name = "mu_role_fk")
    private Integer roleFk;

    @Column(name = "mu_password_changed_date")
    private Date passwordChangedDate;

    @Column(name = "mu_crt_by")
    private Integer createdBy;

    @Column(name = "mu_crt_date")
    private Date createdDate;

    @Column(name = "mu_interface_date")
    private Date interfaceDate;

    @Column(name = "mu_photo_upload_path")
    private String photoUploadPath;

    @Column(name = "mu_fcm_token")
    private String fcmToken;

    @Column(name = "mu_employee_code")
    private String employeeCode;

    @Column(name = "mu_as_state_code")
    private Integer stateCode;

    @Column(name = "session_expiry")
    private Date sessionExpiry;

    @Column(name = "session_token")
    private String sessionToken;

	public Integer getUserPk() {
		return userPk;
	}

	public void setUserPk(Integer userPk) {
		this.userPk = userPk;
	}

	public Integer getEntityFk() {
		return entityFk;
	}

	public void setEntityFk(Integer entityFk) {
		this.entityFk = entityFk;
	}

	public Integer getCustomerFk() {
		return customerFk;
	}

	public void setCustomerFk(Integer customerFk) {
		this.customerFk = customerFk;
	}

	public Integer getUserCategory() {
		return userCategory;
	}

	public void setUserCategory(Integer userCategory) {
		this.userCategory = userCategory;
	}

	public Integer getUserType() {
		return userType;
	}

	public void setUserType(Integer userType) {
		this.userType = userType;
	}

	public Integer getOutletFk() {
		return outletFk;
	}

	public void setOutletFk(Integer outletFk) {
		this.outletFk = outletFk;
	}

	public Integer getEmployeeFk() {
		return employeeFk;
	}

	public void setEmployeeFk(Integer employeeFk) {
		this.employeeFk = employeeFk;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getMiddleName() {
		return middleName;
	}

	public void setMiddleName(String middleName) {
		this.middleName = middleName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmailId() {
		return emailId;
	}

	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public Integer getRegionFk() {
		return regionFk;
	}

	public void setRegionFk(Integer regionFk) {
		this.regionFk = regionFk;
	}

	public Integer getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(Integer locationFk) {
		this.locationFk = locationFk;
	}

	public Integer getZoneFk() {
		return zoneFk;
	}

	public void setZoneFk(Integer zoneFk) {
		this.zoneFk = zoneFk;
	}

	public Integer getDeliveryStoreFk() {
		return deliveryStoreFk;
	}

	public void setDeliveryStoreFk(Integer deliveryStoreFk) {
		this.deliveryStoreFk = deliveryStoreFk;
	}

	public Integer getVendorFk() {
		return vendorFk;
	}

	public void setVendorFk(Integer vendorFk) {
		this.vendorFk = vendorFk;
	}

	public Integer getWorkflowStatusFk() {
		return workflowStatusFk;
	}

	public void setWorkflowStatusFk(Integer workflowStatusFk) {
		this.workflowStatusFk = workflowStatusFk;
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

	public Integer getFirstTimeLogin() {
		return firstTimeLogin;
	}

	public void setFirstTimeLogin(Integer firstTimeLogin) {
		this.firstTimeLogin = firstTimeLogin;
	}

	public Date getLastSuccessLogin() {
		return lastSuccessLogin;
	}

	public void setLastSuccessLogin(Date lastSuccessLogin) {
		this.lastSuccessLogin = lastSuccessLogin;
	}

	public Date getLastUnsuccessLogin() {
		return lastUnsuccessLogin;
	}

	public void setLastUnsuccessLogin(Date lastUnsuccessLogin) {
		this.lastUnsuccessLogin = lastUnsuccessLogin;
	}

	public Integer getRoleFk() {
		return roleFk;
	}

	public void setRoleFk(Integer roleFk) {
		this.roleFk = roleFk;
	}

	public Date getPasswordChangedDate() {
		return passwordChangedDate;
	}

	public void setPasswordChangedDate(Date passwordChangedDate) {
		this.passwordChangedDate = passwordChangedDate;
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

	public Date getInterfaceDate() {
		return interfaceDate;
	}

	public void setInterfaceDate(Date interfaceDate) {
		this.interfaceDate = interfaceDate;
	}

	public String getPhotoUploadPath() {
		return photoUploadPath;
	}

	public void setPhotoUploadPath(String photoUploadPath) {
		this.photoUploadPath = photoUploadPath;
	}

	public String getFcmToken() {
		return fcmToken;
	}

	public void setFcmToken(String fcmToken) {
		this.fcmToken = fcmToken;
	}

	public String getEmployeeCode() {
		return employeeCode;
	}

	public void setEmployeeCode(String employeeCode) {
		this.employeeCode = employeeCode;
	}

	public Integer getStateCode() {
		return stateCode;
	}

	public void setStateCode(Integer stateCode) {
		this.stateCode = stateCode;
	}

	public Date getSessionExpiry() {
		return sessionExpiry;
	}

	public void setSessionExpiry(Date sessionExpiry) {
		this.sessionExpiry = sessionExpiry;
	}

	public String getSessionToken() {
		return sessionToken;
	}

	public void setSessionToken(String sessionToken) {
		this.sessionToken = sessionToken;
	}
    
    
    
}
