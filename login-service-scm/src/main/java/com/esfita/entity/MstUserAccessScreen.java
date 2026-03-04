package com.esfita.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "mst_user_access_screen")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MstUserAccessScreen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_fk")
    private MstUserAuditTrail auditTrail;

    @Column(name = "user_fk")
    private Integer userFk;

    @Column(name = "screen_name")
    private String screenName;

    @Column(name = "in_time")
    private LocalDateTime inTime;

    @Column(name = "out_time")
    private LocalDateTime outTime;

    @Column(name = "total_time")
    private String totalTime;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    // --- Getters and Setters ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public MstUserAuditTrail getAuditTrail() {
        return auditTrail;
    }

    public void setAuditTrail(MstUserAuditTrail auditTrail) {
        this.auditTrail = auditTrail;
    }

    public Integer getUserFk() {
        return userFk;
    }

    public void setUserFk(Integer userFk) {
        this.userFk = userFk;
    }

    public String getScreenName() {
        return screenName;
    }

    public void setScreenName(String screenName) {
        this.screenName = screenName;
    }

    public LocalDateTime getInTime() {
        return inTime;
    }

    public void setInTime(LocalDateTime inTime) {
        this.inTime = inTime;
    }

    public LocalDateTime getOutTime() {
        return outTime;
    }

    public void setOutTime(LocalDateTime outTime) {
        this.outTime = outTime;
    }

    public String getTotalTime() {
        return totalTime;
    }

    public void setTotalTime(String totalTime) {
        this.totalTime = totalTime;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}

