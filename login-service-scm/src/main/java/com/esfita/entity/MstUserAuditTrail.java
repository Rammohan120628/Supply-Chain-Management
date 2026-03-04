package com.esfita.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "mst_user_audit_trail", schema = "public")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MstUserAuditTrail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "muat_user_audit_trail_pk", updatable = false)
    private Integer userAuditTrailPk;

    @Column(name = "muat_aen_ent_fk")
    private Integer entityFk;

    @Column(name = "muat_mu_user_fk")
    private Integer userFk;

    @Column(name = "muat_login_time")
    private LocalDateTime loginTime;

    @Column(name = "muat_logout_time")
    private LocalDateTime logoutTime;

    @Column(name = "muat_user_ip_address")
    private String userIpAddress;

    @Column(name = "muat_user_ipv4_address")
    private String userIpv4Address;

    @Column(name = "muat_user_mac_id")
    private String userMacId;

    @Column(name = "muat_user_os_details")
    private String userOsDetails;

    @Column(name = "muat_browser_details")
    private String browserDetails;

    @Column(name = "muat_crt_by")
    private Integer createdBy;

    // Note: muat_crt_date is TEXT in DB — safest to map as String
    @Column(name = "muat_crt_date")
    private LocalDateTime createdDate;

    // --- Getters and Setters ---

    public Integer getUserAuditTrailPk() {
        return userAuditTrailPk;
    }

    public void setUserAuditTrailPk(Integer userAuditTrailPk) {
        this.userAuditTrailPk = userAuditTrailPk;
    }

    public Integer getEntityFk() {
        return entityFk;
    }

    public void setEntityFk(Integer entityFk) {
        this.entityFk = entityFk;
    }

    public Integer getUserFk() {
        return userFk;
    }

    public void setUserFk(Integer userFk) {
        this.userFk = userFk;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public LocalDateTime getLogoutTime() {
        return logoutTime;
    }

    public void setLogoutTime(LocalDateTime logoutTime) {
        this.logoutTime = logoutTime;
    }

    public String getUserIpAddress() {
        return userIpAddress;
    }

    public void setUserIpAddress(String userIpAddress) {
        this.userIpAddress = userIpAddress;
    }

    public String getUserIpv4Address() {
        return userIpv4Address;
    }

    public void setUserIpv4Address(String userIpv4Address) {
        this.userIpv4Address = userIpv4Address;
    }

    public String getUserMacId() {
        return userMacId;
    }

    public void setUserMacId(String userMacId) {
        this.userMacId = userMacId;
    }

    public String getUserOsDetails() {
        return userOsDetails;
    }

    public void setUserOsDetails(String userOsDetails) {
        this.userOsDetails = userOsDetails;
    }

    public String getBrowserDetails() {
        return browserDetails;
    }

    public void setBrowserDetails(String browserDetails) {
        this.browserDetails = browserDetails;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}

}
