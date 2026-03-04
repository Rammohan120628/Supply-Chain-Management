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
@Table(name = "app_preferences", schema = "public")
public class AppPreference implements Serializable {

    private static final long serialVersionUID = 8383327729211469919L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ap_app_preferences_pk", updatable = false)
    private Integer apAppPreferencesPk;

    @Column(name = "ap_aen_entity_fk")
    private Integer apAenEntityFk;

    @Column(name = "ap_item_count")
    private Integer apItemCount;

    @Column(name = "ap_date_format")
    private String apDateFormat;

    @Column(name = "ap_date_time_format")
    private String apDateTimeFormat;

    @Column(name = "ap_last_act_date_format")
    private String apLastActDateFormat;

    @Column(name = "ap_language")
    private String apLanguage;

    @Column(name = "ap_time_zone")
    private String apTimeZone;

    @Column(name = "ap_currency")
    private String apCurrency;

    @Column(name = "ap_status")
    private String apStatus;

    @Column(name = "ap_last_act_by")
    private Integer apLastActBy;

    @Column(name = "ap_last_act_date")
    private Date apLastActDate;

    @Column(name = "number_format")
    private String numberFormat;

	public Integer getApAppPreferencesPk() {
		return apAppPreferencesPk;
	}

	public void setApAppPreferencesPk(Integer apAppPreferencesPk) {
		this.apAppPreferencesPk = apAppPreferencesPk;
	}

	public Integer getApAenEntityFk() {
		return apAenEntityFk;
	}

	public void setApAenEntityFk(Integer apAenEntityFk) {
		this.apAenEntityFk = apAenEntityFk;
	}

	public Integer getApItemCount() {
		return apItemCount;
	}

	public void setApItemCount(Integer apItemCount) {
		this.apItemCount = apItemCount;
	}

	public String getApDateFormat() {
		return apDateFormat;
	}

	public void setApDateFormat(String apDateFormat) {
		this.apDateFormat = apDateFormat;
	}

	public String getApDateTimeFormat() {
		return apDateTimeFormat;
	}

	public void setApDateTimeFormat(String apDateTimeFormat) {
		this.apDateTimeFormat = apDateTimeFormat;
	}

	public String getApLastActDateFormat() {
		return apLastActDateFormat;
	}

	public void setApLastActDateFormat(String apLastActDateFormat) {
		this.apLastActDateFormat = apLastActDateFormat;
	}

	public String getApLanguage() {
		return apLanguage;
	}

	public void setApLanguage(String apLanguage) {
		this.apLanguage = apLanguage;
	}

	public String getApTimeZone() {
		return apTimeZone;
	}

	public void setApTimeZone(String apTimeZone) {
		this.apTimeZone = apTimeZone;
	}

	public String getApCurrency() {
		return apCurrency;
	}

	public void setApCurrency(String apCurrency) {
		this.apCurrency = apCurrency;
	}

	public String getApStatus() {
		return apStatus;
	}

	public void setApStatus(String apStatus) {
		this.apStatus = apStatus;
	}

	public Integer getApLastActBy() {
		return apLastActBy;
	}

	public void setApLastActBy(Integer apLastActBy) {
		this.apLastActBy = apLastActBy;
	}

	public Date getApLastActDate() {
		return apLastActDate;
	}

	public void setApLastActDate(Date apLastActDate) {
		this.apLastActDate = apLastActDate;
	}

	public String getNumberFormat() {
		return numberFormat;
	}

	public void setNumberFormat(String numberFormat) {
		this.numberFormat = numberFormat;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}
    
    
    
}
