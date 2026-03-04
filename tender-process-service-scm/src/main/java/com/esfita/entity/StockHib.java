package com.esfita.entity;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "stock")
public class StockHib implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PK", updatable = false)
    private int pk;

    @Column(name = "ITEM_ID")
    private int itemId;

    @Column(name = "PACKAGE_ID")
    private String packageId;

    @Column(name = "OP_QTY")
    private double openingQty;

    @Column(name = "OP_GP")
    private double openingGp;

    @Column(name = "OP_CP")
    private double openingCp;

    @Column(name = "OP_DISC")
    private double openingDiscount;

    @Column(name = "IN_QTY")
    private double inwardQty;

    @Column(name = "IN_GP")
    private double inwardGp;

    @Column(name = "IN_CP")
    private double inwardCp;

    @Column(name = "IN_DISC")
    private double inwardDiscount;

    @Column(name = "OUT_QTY")
    private double outwardQty;

    @Column(name = "OUT_GP")
    private double outwardGp;

    @Column(name = "OUT_CP")
    private double outwardCp;

    @Column(name = "OUT_DISC")
    private double outwardDiscount;

    @Column(name = "ENTITY_ID")
    private String entityId;
}
