package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.InvoiceDetailHib;

public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetailHib, Integer> {
	@Query("SELECT r from InvoiceDetailHib r WHERE r.ourGrpInvNo LIKE ?1")
	List<InvoiceDetailHib> transactionNo(String ref);
	
	@Query("SELECT r from InvoiceDetailHib r WHERE r.ourGrpInvNo = ?1")
	InvoiceDetailHib byInvoiceNo(String inv);

//	@Query("SELECT r from InvoiceDetailHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1) ORDER BY r.invoicePk DESC")
//	List<InvoiceDetailHib> byPeriod(Date period);
	@Query(value = "SELECT r FROM InvoiceDetailHib r " +
		       "WHERE EXTRACT(YEAR FROM r.period) = EXTRACT(YEAR FROM CAST(?1 AS date)) " +
		       "AND EXTRACT(MONTH FROM r.period) = EXTRACT(MONTH FROM CAST(?1 AS date)) " +
		       "ORDER BY r.invoicePk DESC")
		List<InvoiceDetailHib> byPeriod(Date period);

//	@Query(value = "SELECT \r\n" + 
//			"    1 AS PK,\r\n" + 
//			"    shead.OUR_GRP_INV_NO,\r\n" + 
//			"    shead.PERIOD,\r\n" + 
//			"    id.ENTITY_ID,\r\n" + 
//			"    shead.SUPPLIER_ID,\r\n" + 
//			"    sup.SUPPLIER_NAME,\r\n" + 
//			"    id.VAT_REGD_NO,\r\n" + 
//			"    id.SUPP_INV_NO,\r\n" + 
//			"    id.SUPP_INV_DATE,\r\n" + 
//			"    shead.SUPP_DEL_NOTE_NO,\r\n" + 
//			"    shead.LPO_NUMBER,\r\n" + 
//			"    shead.GRN_ID, \r\n" + 
//			"    it_acc.ACCOUNT_ID,\r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT,\r\n" + 
//			"    id.VAT_ID,\r\n" + 
//			"    'FOT' AS VAT_CODE,\r\n" + 
//			"    id.VAT_RATE,  \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT,\r\n" + 
//			"    0 AS ADJUST_VALUE,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100 AS DISC_AMOUNT,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) - (SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100) AS NET_AMOUNT,\r\n" + 
//			"    id.VAT_AMOUNT,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) - (SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100) AS NET_INC_VALUE,         \r\n" + 
//			"    id.LAST_USER,\r\n" + 
//			"    id.LAST_UPDATE,\r\n" + 
//			"    (SELECT CURRENCY_ID FROM `entityeiis`) AS CURRENCY_ID\r\n" + 
//			"FROM \r\n" + 
//			"    suppdelhead AS shead  \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID\r\n" + 
//			"INNER JOIN\r\n" + 
//			"    invoicedetail AS id ON id.OUR_GRP_INV_NO = shead.OUR_GRP_INV_NO      \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1) \r\n" + 
//			"    AND  shead.OUR_GRP_INV_NO IS NOT NULL\r\n" + 
//			"GROUP BY  \r\n" + 
//			"    sdet.GRN_ID,   \r\n" + 
//			"    it_acc.ACCOUNT_ID;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getIpassListIfINV(Date period);
	@Query(value =
		    "SELECT " +
		    "    1 AS PK, " +
		    "    shead.OUR_GRP_INV_NO, " +
		    "    shead.PERIOD, " +
		    "    id.ENTITY_ID, " +
		    "    shead.SUPPLIER_ID, " +
		    "    sup.SUPPLIER_NAME, " +
		    "    id.VAT_REGD_NO, " +
		    "    id.SUPP_INV_NO, " +
		    "    id.SUPP_INV_DATE, " +
		    "    shead.SUPP_DEL_NOTE_NO, " +
		    "    shead.LPO_NUMBER, " +
		    "    shead.GRN_ID, " +
		    "    it_acc.ACCOUNT_ID, " +
		    "    COUNT(sdet.ITEM_ID) AS ITEM_COUNT, " +
		    "    id.VAT_ID, " +
		    "    'FOT' AS VAT_CODE, " +
		    "    id.VAT_RATE, " +
		    "    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT, " +
		    "    0 AS ADJUST_VALUE, " +
		    "    SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100 AS DISC_AMOUNT, " +
		    "    SUM(sdet.GP * sdet.QTY) - (SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100) AS NET_AMOUNT, " +
		    "    id.VAT_AMOUNT, " +
		    "    SUM(sdet.GP * sdet.QTY) - (SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100) AS NET_INC_VALUE, " +
		    "    id.LAST_USER, " +
		    "    id.LAST_UPDATE, " +
		    "    (SELECT CURRENCY_ID FROM entityeiis LIMIT 1) AS CURRENCY_ID " +
		    "FROM suppdelhead AS shead " +
		    "INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID " +
		    "INNER JOIN suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID " +
		    "INNER JOIN invoicedetail AS id ON id.OUR_GRP_INV_NO = shead.OUR_GRP_INV_NO " +
		    "INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK " +
		    "INNER JOIN mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK " +
		    "WHERE EXTRACT(MONTH FROM shead.PERIOD) = EXTRACT(MONTH FROM ?1) " +
		    "  AND EXTRACT(YEAR FROM shead.PERIOD) = EXTRACT(YEAR FROM ?1) " +
		    "  AND shead.OUR_GRP_INV_NO IS NOT NULL " +
		    "GROUP BY sdet.GRN_ID, it_acc.ACCOUNT_ID;",
		    nativeQuery = true)
		List<Object[]> getIpassListIfINV(Date period);

	
//	
//	@Query(value = "SELECT  \r\n" + 
//			"    1 AS PK,  \r\n" + 
//			"    shead.OUR_GRP_INV_NO,  \r\n" + 
//			"    shead.PERIOD,  \r\n" + 
//			"    shead.ENTITY_ID,  \r\n" + 
//			"    shead.SUPPLIER_ID,  \r\n" + 
//			"    sup.SUPPLIER_NAME,\r\n" + 
//			"    '' AS VAT_REGD_NO, \r\n" + 
//			"    shead.SUPP_INV_ID, \r\n" + 
//			"    shead.SUPP_INV_DATE, \r\n" + 
//			"    shead.SUPP_DEL_NOTE_NO,  \r\n" + 
//			"    shead.LPO_NUMBER,  \r\n" + 
//			"    shead.GRN_ID,  \r\n" + 
//			"    it_acc.ACCOUNT_ID,  \r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT,  \r\n" + 
//			"    '' AS VAT_ID, \r\n" + 
//			"    'FOT' AS VAT_CODE, \r\n" + 
//			"    '' AS VAT_RATE,  \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT,  \r\n" + 
//			"    0 AS ADJUST_VALUE,  \r\n" + 
//			"    SUM(sdet.DIS_AMOUNT) AS DISC_AMOUNT, \r\n" + 
//			"    SUM(sdet.NET_AMOUNT) AS NET_AMOUNT, \r\n" + 
//			"    0 AS VAT_AMOUNT, \r\n" + 
//			"    SUM(sdet.GROSS_INC_DIS) AS NET_INC_VALUE,  \r\n" + 
//			"    shead.LAST_USER, \r\n" + 
//			"    shead.LAST_UPDATE    \r\n" + 
//			"FROM  \r\n" + 
//			"    suppdelhead AS shead  \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID  \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID   \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK  \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK  \r\n" + 
//			"WHERE  \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1)  \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)  \r\n" + 
//			"    AND shead.OUR_GRP_INV_NO IS NOT NULL  \r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.OUR_GRP_INV_NO,  \r\n" + 
//			"    it_acc.ACCOUNT_ID;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getIpassListIfINVNew(Date period);
		
		@Query(value =
			    "SELECT " +
			    "    1 AS PK, " +
			    "    shead.OUR_GRP_INV_NO, " +
			    "    shead.PERIOD, " +
			    "    shead.ENTITY_ID, " +
			    "    shead.SUPPLIER_ID, " +
			    "    sup.SUPPLIER_NAME, " +
			    "    '' AS VAT_REGD_NO, " +
			    "    shead.SUPP_INV_ID, " +
			    "    shead.SUPP_INV_DATE, " +
			    "    shead.SUPP_DEL_NOTE_NO, " +
			    "    shead.LPO_NUMBER, " +
			    "    shead.GRN_ID, " +
			    "    it_acc.ACCOUNT_ID, " +
			    "    COUNT(sdet.ITEM_ID) AS ITEM_COUNT, " +
			    "    '' AS VAT_ID, " +
			    "    'FOT' AS VAT_CODE, " +
			    "    '' AS VAT_RATE, " +
			    "    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT, " +
			    "    0 AS ADJUST_VALUE, " +
			    "    SUM(sdet.DIS_AMOUNT) AS DISC_AMOUNT, " +
			    "    SUM(sdet.NET_AMOUNT) AS NET_AMOUNT, " +
			    "    0 AS VAT_AMOUNT, " +
			    "    SUM(sdet.GROSS_INC_DIS) AS NET_INC_VALUE, " +
			    "    shead.LAST_USER, " +
			    "    shead.LAST_UPDATE " +
			    "FROM suppdelhead AS shead " +
			    "INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID " +
			    "INNER JOIN suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID " +
			    "INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK " +
			    "INNER JOIN mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK " +
			    "WHERE MONTH(shead.PERIOD) = MONTH(?1) " +
			    "  AND YEAR(shead.PERIOD) = YEAR(?1) " +
			    "  AND shead.OUR_GRP_INV_NO IS NOT NULL " +
			    "GROUP BY shead.OUR_GRP_INV_NO, it_acc.ACCOUNT_ID;",
			    nativeQuery = true)
			List<Object[]> getIpassListIfINVNew(Date period);

	
//	@Query(value = "SELECT  \r\n" + 
//			"    1 AS PK,  \r\n" + 
//			"    shead.OUR_GRP_INV_NO,  \r\n" + 
//			"    shead.PERIOD,  \r\n" + 
//			"    shead.ENTITY_ID,  \r\n" + 
//			"    shead.SUPPLIER_ID,  \r\n" + 
//			"    sup.SUPPLIER_NAME,  \r\n" + 
//			"    '' AS VAT_REGD_NO,  \r\n" + 
//			"    shead.SUPP_INV_ID, \r\n" + 
//			"    shead.SUPP_INV_DATE,  \r\n" + 
//			"    shead.SUPP_DEL_NOTE_NO,  \r\n" + 
//			"    shead.LPO_NUMBER,  \r\n" + 
//			"    shead.GRN_ID,  \r\n" + 
//			"    it_acc.ACCOUNT_ID,  \r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT,  \r\n" + 
//			"    '' AS VAT_ID, \r\n" + 
//			"    'FOT' AS VAT_CODE, \r\n" + 
//			"    '' AS VAT_RATE,  \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT,  \r\n" + 
//			"    0 AS ADJUST_VALUE,  \r\n" + 
//			"    SUM(sdet.DIS_AMOUNT) AS DISC_AMOUNT, \r\n" + 
//			"    SUM(sdet.NET_AMOUNT) AS NET_AMOUNT, \r\n" + 
//			"    0 AS VAT_AMOUNT, \r\n" + 
//			"    SUM(sdet.GROSS_INC_DIS) AS NET_INC_VALUE,  \r\n" + 
//			"    shead.LAST_USER, \r\n" + 
//			"    shead.LAST_UPDATE \r\n" + 
//			"FROM  \r\n" + 
//			"    suppdelhead AS shead  \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID  \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID   \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK  \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK  \r\n" + 
//			"WHERE  \r\n" + 
//			"     MONTH(shead.PERIOD) = MONTH(?1)  \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1) \r\n" + 
//			"    AND shead.OUR_GRP_INV_NO IS NOT NULL  \r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.OUR_GRP_INV_NO,\r\n" + 
//			"    it_acc.ACCOUNT_ID;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getIpassListIfINVForCsvNew(Date period);
//	
//	
//	@Query(value = "SELECT \r\n" + 
//			"    1 AS PK,\r\n" + 
//			"    shead.OUR_GRP_INV_NO,\r\n" + 
//			"    shead.PERIOD,\r\n" + 
//			"    id.ENTITY_ID,\r\n" + 
//			"    shead.SUPPLIER_ID,\r\n" + 
//			"    sup.SUPPLIER_NAME,\r\n" + 
//			"    id.VAT_REGD_NO,\r\n" + 
//			"    id.SUPP_INV_NO,\r\n" + 
//			"    id.SUPP_INV_DATE,\r\n" + 
//			"    shead.SUPP_DEL_NOTE_NO,\r\n" + 
//			"    shead.LPO_NUMBER,\r\n" + 
//			"    shead.GRN_ID, \r\n" + 
//			"    it_acc.ACCOUNT_ID,\r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT,\r\n" + 
//			"    id.VAT_ID,\r\n" + 
//			"    'FOT' AS VAT_CODE,\r\n" + 
//			"    id.VAT_RATE,  \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT,\r\n" + 
//			"    0 AS ADJUST_VALUE,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100 AS DISC_AMOUNT,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) - (SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100) AS NET_AMOUNT,\r\n" + 
//			"    id.VAT_AMOUNT,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) - (SUM(sdet.GP * sdet.QTY) * sup.Discount_Per / 100) AS NET_INC_VALUE,         \r\n" + 
//			"    id.LAST_USER,\r\n" + 
//			"    id.LAST_UPDATE,\r\n" + 
//			"    (SELECT CURRENCY_ID FROM entityeiis) AS CURRENCY_ID\r\n" + 
//			"FROM \r\n" + 
//			"    suppdelhead AS shead  \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID\r\n" + 
//			"INNER JOIN\r\n" + 
//			"    invoicedetail AS id ON id.OUR_GRP_INV_NO = shead.OUR_GRP_INV_NO      \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1) \r\n" + 
//			"    AND  shead.OUR_GRP_INV_NO IS NOT NULL\r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.OUR_GRP_INV_NO;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getIpassListIfINVForCsv(Date period);
//	
//	@Query(value = "SELECT\r\n" + 
//			"    1 AS PK,\r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO,\r\n" + 
//			"    shead.PERIOD,\r\n" + 
//			"    shead.ENTITY_ID,\r\n" + 
//			"    shead.SUPPLIER_ID,\r\n" + 
//			"    sup.SUPPLIER_NAME,    \r\n" + 
//			"    '' AS VAT_REGD_NO,\r\n" + 
//			"    shead.CR_NOTE_NO,\r\n" + 
//			"    shead.CR_NOTE_RCV_DATE,\r\n" + 
//			"    '' AS LPO_NUMBER, \r\n" + 
//			"    it_acc.ACCOUNT_ID,\r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT,\r\n" + 
//			"    '' AS VAT_ID,\r\n" + 
//			"    'FOT' AS VAT_CODE,\r\n" + 
//			"    '' AS VAT_RATE,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT,\r\n" + 
//			"    0 AS ADJUST_VALUE,     \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY)*sup.Discount_Per/100 AS DISC_AMOUNT,  \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY)-(SUM(sdet.GP * sdet.QTY)*sup.Discount_Per/100)  AS NET_AMOUNT,\r\n" + 
//			"    0 AS VAT_AMOUNT,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY)-(SUM(sdet.GP * sdet.QTY)*sup.Discount_Per/100) AS NET_INC_VALUE,         \r\n" + 
//			"    shead.LAST_USER,\r\n" + 
//			"    shead.LAST_UPDATE, \r\n" + 
//			"    (SELECT CURRENCY_ID FROM entityeiis) AS CURRENCY_ID\r\n" + 
//			"FROM \r\n" + 
//			"    returntosupphead AS shead  \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID    \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1) \r\n" + 
//			"    AND shead.OUR_GROUP_CR_NOTE_NO IS NOT NULL\r\n" + 
//			"GROUP BY  \r\n" + 
//			"    sdet.SUPP_RETURN_ID,   \r\n" + 
//			"    it_acc.ACCOUNT_ID;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getCrNoteList(Date period);
//	
//	@Query(value = "SELECT \r\n" + 
//			"    1 AS PK, \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO, \r\n" + 
//			"    shead.PERIOD, \r\n" + 
//			"    shead.ENTITY_ID, \r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.SUPPLIER_NAME, \r\n" + 
//			"    '' AS VAT_REGD_NO, \r\n" + 
//			"    shead.CR_NOTE_NO, \r\n" + 
//			"    shead.CR_NOTE_RCV_DATE, \r\n" + 
//			"    '' AS LPO_NUMBER, \r\n" + 
//			"    it_acc.ACCOUNT_ID, \r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT, \r\n" + 
//			"    '' AS VAT_ID, \r\n" + 
//			"    'FOT' AS VAT_CODE, \r\n" + 
//			"    '' AS VAT_RATE, \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT, \r\n" + 
//			"    0 AS ADJUST_VALUE, \r\n" + 
//			"    SUM(sdet.DIS_AMOUNT) AS DISC_AMOUNT, \r\n" + 
//			"    SUM(sdet.NET_AMOUNT) AS NET_AMOUNT, \r\n" + 
//			"    0 AS VAT_AMOUNT, \r\n" + 
//			"    SUM(sdet.GROSS_INC_DIC) AS NET_INC_VALUE, \r\n" + 
//			"    shead.LAST_USER, \r\n" + 
//			"    shead.LAST_UPDATE\r\n" + 
//			"FROM \r\n" + 
//			"    returntosupphead AS shead  \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID    \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1)  \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1) \r\n" + 
//			"    AND shead.OUR_GROUP_CR_NOTE_NO IS NOT NULL \r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO,   \r\n" + 
//			"    it_acc.ACCOUNT_ID;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getCrNoteListNew(Date period);
//	
//	@Query(value = "SELECT\r\n" + 
//			"    1 AS PK,\r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO,\r\n" + 
//			"    shead.PERIOD,\r\n" + 
//			"    shead.ENTITY_ID,\r\n" + 
//			"    shead.SUPPLIER_ID,\r\n" + 
//			"    sup.SUPPLIER_NAME,    \r\n" + 
//			"    '' AS VAT_REGD_NO,\r\n" + 
//			"    shead.CR_NOTE_NO,\r\n" + 
//			"    shead.CR_NOTE_RCV_DATE,\r\n" + 
//			"    '' AS LPO_NUMBER, \r\n" + 
//			"    it_acc.ACCOUNT_ID,\r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT,\r\n" + 
//			"    '' AS VAT_ID,\r\n" + 
//			"    'FOT' AS VAT_CODE,\r\n" + 
//			"    '' AS VAT_RATE,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT,\r\n" + 
//			"    0 AS ADJUST_VALUE,     \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY)*sup.Discount_Per/100 AS DISC_AMOUNT,  \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY)-(SUM(sdet.GP * sdet.QTY)*sup.Discount_Per/100)  AS NET_AMOUNT,\r\n" + 
//			"    0 AS VAT_AMOUNT,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY)-(SUM(sdet.GP * sdet.QTY)*sup.Discount_Per/100) AS NET_INC_VALUE,         \r\n" + 
//			"    shead.LAST_USER,\r\n" + 
//			"    shead.LAST_UPDATE, \r\n" + 
//			"    (SELECT CURRENCY_ID FROM entityeiis) AS CURRENCY_ID\r\n" + 
//			"FROM \r\n" + 
//			"    returntosupphead AS shead  \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID    \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1) \r\n" + 
//			"    AND shead.OUR_GROUP_CR_NOTE_NO IS NOT NULL\r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getCrNoteListCsv(Date period);
//	
//	@Query(value = "SELECT \r\n" + 
//			"    1 AS PK,\r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO,\r\n" + 
//			"    shead.PERIOD,\r\n" + 
//			"    shead.ENTITY_ID,\r\n" + 
//			"    shead.SUPPLIER_ID,\r\n" + 
//			"    sup.SUPPLIER_NAME,    \r\n" + 
//			"    '' AS VAT_REGD_NO,\r\n" + 
//			"    shead.CR_NOTE_NO,\r\n" + 
//			"    shead.CR_NOTE_RCV_DATE,\r\n" + 
//			"    '' AS LPO_NUMBER, \r\n" + 
//			"    it_acc.ACCOUNT_ID,\r\n" + 
//			"    COUNT(sdet.ITEM_ID) AS ITEM_COUNT,\r\n" + 
//			"    '' AS VAT_ID,\r\n" + 
//			"    'FOT' AS VAT_CODE,\r\n" + 
//			"    '' AS VAT_RATE,\r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS GROSS_AMOUNT,\r\n" + 
//			"    0 AS ADJUST_VALUE,     \r\n" + 
//			"    SUM(sdet.DIS_AMOUNT) AS DISC_AMOUNT, \r\n" + 
//			"    SUM(sdet.NET_AMOUNT) AS NET_AMOUNT, \r\n" + 
//			"    0 AS VAT_AMOUNT, \r\n" + 
//			"    SUM(sdet.GROSS_INC_DIC) AS NET_INC_VALUE, \r\n" + 
//			"    shead.LAST_USER, \r\n" + 
//			"    shead.LAST_UPDATE\r\n" + 
//			"FROM \r\n" + 
//			"    returntosupphead AS shead  \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID    \r\n" + 
//			"INNER JOIN  \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1) \r\n" + 
//			"    AND shead.OUR_GROUP_CR_NOTE_NO IS NOT NULL\r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO,   \r\n" + 
//			"    it_acc.ACCOUNT_ID;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getCrNoteListCsvNew(Date period);
}
