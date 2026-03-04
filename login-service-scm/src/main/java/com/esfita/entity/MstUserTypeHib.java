package com.esfita.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mst_user_type")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MstUserTypeHib {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "USER_TYPE_PK", updatable = false)
	private Integer userTypePk;

	@Column(name = "USER_TYPE_NAME")
	private String userTypeName;

	public Integer getUserTypePk() {
		return userTypePk;
	}

	public void setUserTypePk(Integer userTypePk) {
		this.userTypePk = userTypePk;
	}

	public String getUserTypeName() {
		return userTypeName;
	}

	public void setUserTypeName(String userTypeName) {
		this.userTypeName = userTypeName;
	}
}
