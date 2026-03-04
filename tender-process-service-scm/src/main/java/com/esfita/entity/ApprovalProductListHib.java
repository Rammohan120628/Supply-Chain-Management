package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "apl", schema = "public")
public class ApprovalProductListHib implements Serializable {

    private static final long serialVersionUID = 6395688408363896352L;
    
    @Id
    @Column(name = "apl_pk")
    private Integer aplPk;

    @Column(name = "item_id")
    private Integer itemId;

    @Column(name = "package_id")
    private String packageId;
    
    @Column(name = "entity_id")
    private String entityId;
    
    @Column(name = "location_id")
    private String locationId;

    @Column(name = "last_user")
    private Integer lastUser;

    @Column(name = "last_update")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdate;


	public Integer getAplPk() {
		return aplPk;
	}

	public void setAplPk(Integer aplPk) {
		this.aplPk = aplPk;
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

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public String getLocationId() {
		return locationId;
	}

	public void setLocationId(String locationId) {
		this.locationId = locationId;
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
