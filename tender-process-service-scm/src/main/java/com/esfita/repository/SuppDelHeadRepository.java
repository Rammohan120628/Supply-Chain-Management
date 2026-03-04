package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.SuppDelHeadHib;

public interface SuppDelHeadRepository extends JpaRepository<SuppDelHeadHib, Integer> {

	@Query("SELECT r FROM SuppDelHeadHib r WHERE r.grnId LIKE ?1")
	List<SuppDelHeadHib> transactionNo(String ref);

	@Query("SELECT r FROM SuppDelHeadHib r WHERE r.grnId = ?1")
	SuppDelHeadHib byGrnId(String ref);
	
	
	
	@Query(
		    value = """
		        SELECT grn_id
		        FROM suppdelhead
		       WHERE (supp_inv_id = '' OR supp_inv_id IS NULL)
		          AND EXTRACT(YEAR  FROM period) = EXTRACT(YEAR  FROM CAST(?1 AS DATE))
		          AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
		        """,
		    nativeQuery = true
		)
		List<String> getGrnList(Date period);

	
	@Query(
		    value = """
		        SELECT r.supp_return_id
		        FROM returntosupphead r
		        WHERE r.cr_note_no IS NULL
		          AND EXTRACT(YEAR  FROM r.period) = EXTRACT(YEAR  FROM CAST(?1 AS DATE))
		          AND EXTRACT(MONTH FROM r.period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
		        """,
		    nativeQuery = true
		)
		List<String> getRetnList(Date period);


	@Query(
		    value = "SELECT * FROM suppdelhead r " +
		            "WHERE EXTRACT(YEAR FROM r.period) = EXTRACT(YEAR FROM CAST(?1 AS DATE)) " +
		            "AND EXTRACT(MONTH FROM r.period) = EXTRACT(MONTH FROM CAST(?1 AS DATE)) " +
		            "AND r.supplier_id = ?2 " +
		            "AND r.status_fk = 0",
		    nativeQuery = true
		)
		List<SuppDelHeadHib> byStatusFk0periodSupId(Date period, String supId);
	
	@Query("SELECT s FROM SuppDelHeadHib s WHERE s.pk = :pk")
    SuppDelHeadHib findByPkCustom(@Param("pk") int pk);


//	@Query("SELECT r FROM SuppDelHeadHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1) ORDER BY r.pk DESC")
//	List<SuppDelHeadHib> byPeriod(Date period);
@Query(
    value = "SELECT * FROM suppdelhead " +
            "WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(?1 AS timestamp)) " +
            "AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS timestamp)) " +
            "ORDER BY pk DESC",
    nativeQuery = true
)
List<SuppDelHeadHib> byPeriod(Date period);

 
	@Query("SELECT r FROM SuppDelHeadHib r WHERE r.suppDelNoteNo = ?1")
	List<SuppDelHeadHib> byDelNoteNo(String delNoteNo);
//
	@Query("SELECT r FROM SuppDelHeadHib r WHERE r.suppInvId = ?1")
	List<SuppDelHeadHib> bySuppInvId(String delNoteNo);
//
//	@Query("SELECT r.grnId FROM SuppDelHeadHib r WHERE r.suppInvId = '' AND YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1)")
//	List<String> getGrnList(Date period);

	@Query("SELECT r FROM SuppDelHeadHib r WHERE r.ourGrpInvNo = ?1")
	List<SuppDelHeadHib> byOurGrpInvNo(String ourGrpInvNo);

//	@Query("SELECT COALESCE(SUM(r.netInvoice), 0) FROM SuppDelHeadHib r WHERE r.supplierId = 'OMS00000'")
//	double sumOfAmount();
//
//	@Query("SELECT COALESCE(SUM(r.netInvoice), 0) FROM SuppDelHeadHib r WHERE r.supplierId = 'OMS00000' AND YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1)")
//	double sumOfAmount(Date period);
//
//
//	// SUPP_DEL_HEAD_REPOSTORY
//	@Query(value = "SELECT\r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END AS Item_Category_Name,\r\n" + 
//			"    SUM(sdet.QTY * sdet.GP) AS Total,\r\n" + 
//			"    sup.Discount_Per AS DISCOUNT\r\n" + 
//			"FROM \r\n" + 
//			"    suppdelhead AS shead\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS ma ON ma.ITEM_ACCOUNT_PK = m.ACCOUNT_FK    \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)\r\n" + 
//			"GROUP BY \r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END \r\n" + 
//			"\r\n" + 
//			"UNION ALL\r\n" + 
//			"\r\n" + 
//			"SELECT\r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END AS Item_Category_Name,\r\n" + 
//			"    -SUM(sdet.QTY * sdet.GP) AS Total,\r\n" + 
//			"    sup.Discount_Per AS DISCOUNT\r\n" + 
//			"FROM \r\n" + 
//			"    returntosupphead AS shead\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK\r\n" + 
//			"INNER JOIN \r\n" + 
//			"    mst_item_account AS ma ON ma.ITEM_ACCOUNT_PK = m.ACCOUNT_FK    \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)\r\n" + 
//			"    AND shead.CR_NOTE_NO IS NOT NULL\r\n" + 
//			"GROUP BY \r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END ORDER BY \r\n" + 
//			"    SUPPLIER_ID ASC ;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getSupplierStatementSummaryData(Date period);
//	
//	// SUPP_DEL_HEAD_REPOSTORY
//	@Query(value = "SELECT \r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END AS Item_Category_Name,\r\n" + 
//			"    SUM(sdet.QTY * sdet.GP) AS Total,\r\n" + 
//			"    SUM(sdet.QTY * sdet.STOCK_CP) AS Total_CP,\r\n" + 
//			"    sup.Discount_Per AS DISCOUNT\r\n" + 
//			"FROM suppdelhead AS shead\r\n" + 
//			"INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID\r\n" + 
//			"INNER JOIN suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID\r\n" + 
//			"INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK\r\n" + 
//			"INNER JOIN mst_item_account AS ma ON ma.ITEM_ACCOUNT_PK = m.ACCOUNT_FK    \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1)\r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)\r\n" + 
//			"GROUP BY \r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END \r\n" + 
//			"\r\n" + 
//			"UNION ALL\r\n" + 
//			"\r\n" + 
//			"SELECT \r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END AS Item_Category_Name,\r\n" + 
//			"    -SUM(sdet.QTY * sdet.GP) AS Total,\r\n" + 
//			"    -SUM(sdet.QTY * sdet.STOCK_CP) AS Total_CP,\r\n" + 
//			"    sup.Discount_Per AS DISCOUNT\r\n" + 
//			"FROM returntosupphead AS shead\r\n" + 
//			"INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID\r\n" + 
//			"INNER JOIN returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID\r\n" + 
//			"INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK\r\n" + 
//			"INNER JOIN mst_item_account AS ma ON ma.ITEM_ACCOUNT_PK = m.ACCOUNT_FK    \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)\r\n" + 
//			"    AND shead.CR_NOTE_NO IS NOT NULL\r\n" + 
//			"GROUP BY \r\n" + 
//			"    shead.SUPPLIER_ID, \r\n" + 
//			"    sup.Supplier_Name,\r\n" + 
//			"    CASE \r\n" + 
//			"        WHEN ma.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN ma.ACCOUNT_NAME \r\n" + 
//			"        ELSE 'OTHERS' \r\n" + 
//			"    END \r\n" + 
//			"ORDER BY SUPPLIER_ID ASC;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getSupplierStatementSummaryDataNew(Date period);
//
//	// SUPP_DEL_HEAD_REPOSTORY
//	@Query(value = "SELECT DISTINCT SUPPLIER_ID FROM suppdelhead WHERE MONTH(PERIOD) = MONTH(?1) AND YEAR(PERIOD) = YEAR(?1) ", nativeQuery = true)
//	List<String> getSupplierId(Date period);
//	
//	@Query(value = "SELECT \r\n" + 
//			"    shead.Supplier_ID,\r\n" + 
//			"    sup.Supplier_Name, \r\n" + 
//			"    shead.SUPP_INV_DATE,  \r\n" + 
//			"    shead.OUR_GRP_INV_NO, \r\n" + 
//			"    shead.SUPP_INV_ID,     \r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'FOOD' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_FOOD_GP,\r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'CLEANING' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_CLEANING_GP,\r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'DISPOSABLES' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_DISPOSABLES_GP,\r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME NOT IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_OTHERS_GP,    \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS Total_GP,\r\n" + 
//			"    SUM(sdet.STOCK_CP * sdet.QTY) AS Total_CP, \r\n" + 
//			"    SUM(sdet.DIS_AMOUNT) AS DISCOUNT \r\n" + 
//			"FROM suppdelhead AS shead  \r\n" + 
//			"INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.Supplier_ID \r\n" + 
//			"INNER JOIN suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID \r\n" + 
//			"INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)    \r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.Supplier_ID, \r\n" + 
//			"    shead.SUPP_INV_DATE,  \r\n" + 
//			"    shead.OUR_GRP_INV_NO\r\n" + 
//			"\r\n" + 
//			"UNION ALL   \r\n" + 
//			"\r\n" + 
//			"SELECT \r\n" + 
//			"    shead.Supplier_ID,\r\n" + 
//			"    sup.Supplier_Name, \r\n" + 
//			"    shead.CR_NOTE_RCV_DATE AS SUPP_INV_DATE,  \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO AS OUR_GRP_INV_NO, \r\n" + 
//			"    shead.CR_NOTE_NO AS SUPP_INV_ID,     \r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'FOOD' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_FOOD_GP,\r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'CLEANING' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_CLEANING_GP,\r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'DISPOSABLES' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_DISPOSABLES_GP,\r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME NOT IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_OTHERS_GP,    \r\n" + 
//			"    -SUM(sdet.GP * sdet.QTY) AS Total_GP,\r\n" + 
//			"    -SUM(sdet.STOCK_CP * sdet.QTY) AS Total_CP, \r\n" + 
//			"    -SUM(sdet.DIS_AMOUNT) AS DISCOUNT \r\n" + 
//			"FROM returntosupphead AS shead  \r\n" + 
//			"INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.Supplier_ID \r\n" + 
//			"INNER JOIN returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID \r\n" + 
//			"INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)    \r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.Supplier_ID, \r\n" + 
//			"    shead.CR_NOTE_RCV_DATE,  \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO\r\n" + 
//			"ORDER BY\r\n" + 
//			"    Supplier_ID, \r\n" + 
//			"    SUPP_INV_DATE,\r\n" + 
//			"    OUR_GRP_INV_NO;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getMonthlyInvoiceData(Date period);
//	
//	@Query(value = "SELECT \r\n" + 
//			"    shead.Supplier_ID,\r\n" + 
//			"    sup.Supplier_Name, \r\n" + 
//			"    shead.SUPP_INV_DATE,  \r\n" + 
//			"    shead.OUR_GRP_INV_NO, \r\n" + 
//			"    shead.SUPP_INV_ID,     \r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'FOOD' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_FOOD_GP,\r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'CLEANING' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_CLEANING_GP,\r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'DISPOSABLES' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_DISPOSABLES_GP,\r\n" + 
//			"    SUM(CASE WHEN it_acc.ACCOUNT_NAME NOT IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_OTHERS_GP,    \r\n" + 
//			"    SUM(sdet.GP * sdet.QTY) AS Total_GP,\r\n" + 
//			"    SUM(sdet.STOCK_CP * sdet.QTY) AS Total_CP, \r\n" + 
//			"    SUM(sdet.DIS_AMOUNT) AS DISCOUNT \r\n" + 
//			"FROM suppdelhead AS shead  \r\n" + 
//			"INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.Supplier_ID \r\n" + 
//			"INNER JOIN suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID \r\n" + 
//			"INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)\r\n" + 
//			"    AND shead.Supplier_ID = ?2    \r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.Supplier_ID, \r\n" + 
//			"    shead.SUPP_INV_DATE,  \r\n" + 
//			"    shead.OUR_GRP_INV_NO\r\n" + 
//			"\r\n" + 
//			"UNION ALL   \r\n" + 
//			"\r\n" + 
//			"SELECT \r\n" + 
//			"    shead.Supplier_ID,\r\n" + 
//			"    sup.Supplier_Name, \r\n" + 
//			"    shead.CR_NOTE_RCV_DATE AS SUPP_INV_DATE,  \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO AS OUR_GRP_INV_NO, \r\n" + 
//			"    shead.CR_NOTE_NO AS SUPP_INV_ID,     \r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'FOOD' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_FOOD_GP,\r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'CLEANING' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_CLEANING_GP,\r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME = 'DISPOSABLES' THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_DISPOSABLES_GP,\r\n" + 
//			"    -SUM(CASE WHEN it_acc.ACCOUNT_NAME NOT IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN sdet.GP * sdet.QTY ELSE 0 END) AS Total_OTHERS_GP,    \r\n" + 
//			"    -SUM(sdet.GP * sdet.QTY) AS Total_GP,\r\n" + 
//			"    -SUM(sdet.STOCK_CP * sdet.QTY) AS Total_CP, \r\n" + 
//			"    -SUM(sdet.DIS_AMOUNT) AS DISCOUNT \r\n" + 
//			"FROM returntosupphead AS shead  \r\n" + 
//			"INNER JOIN suppliers AS sup ON sup.Supplier_ID = shead.Supplier_ID \r\n" + 
//			"INNER JOIN returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID \r\n" + 
//			"INNER JOIN mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK \r\n" + 
//			"INNER JOIN mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK \r\n" + 
//			"WHERE \r\n" + 
//			"    MONTH(shead.PERIOD) = MONTH(?1) \r\n" + 
//			"    AND YEAR(shead.PERIOD) = YEAR(?1)\r\n" + 
//			"    AND shead.Supplier_ID = ?2    \r\n" + 
//			"GROUP BY  \r\n" + 
//			"    shead.Supplier_ID, \r\n" + 
//			"    shead.CR_NOTE_RCV_DATE,  \r\n" + 
//			"    shead.OUR_GROUP_CR_NOTE_NO\r\n" + 
//			"ORDER BY\r\n" + 
//			"    Supplier_ID, \r\n" + 
//			"    SUPP_INV_DATE,\r\n" + 
//			"    OUR_GRP_INV_NO;\r\n" + 
//			"", nativeQuery = true)
//	List<Object[]> getMonthlyInvoiceDataBySupplier(Date period,String suppId);
//	
//
//	@Query(value = "SELECT head.OUR_GRP_INV_NO, head.SUPP_INV_DATE, head.SUPPLIER_ID, sup.Supplier_Name, head.SUPP_INV_ID , sup.Discount_Per FROM suppdelhead AS head "
//			+ "INNER JOIN suppliers AS sup ON sup.Supplier_ID = head.SUPPLIER_ID "
//			+ "WHERE MONTH(head.PERIOD) = MONTH(:period) AND YEAR(head.PERIOD) = YEAR(:period) AND head.SUPPLIER_ID = :supplierId GROUP BY head.OUR_GRP_INV_NO;", nativeQuery = true)
//	List<Object[]> getPeriodSupplierId(@Param("period") Date period, @Param("supplierId") String supplierId);
//
//	@Query(value = "SELECT head.OUR_GROUP_CR_NOTE_NO, head.CR_NOTE_RCV_DATE, head.SUPPLIER_ID, sup.Supplier_Name, head.CR_NOTE_NO as sn , sup.Discount_Per FROM returntosupphead AS head "
//			+ "INNER JOIN suppliers AS sup ON sup.Supplier_ID = head.SUPPLIER_ID "
//			+ "WHERE MONTH(head.PERIOD) = MONTH(:period) AND YEAR(head.PERIOD) = YEAR(:period) AND head.SUPPLIER_ID = :supplierId AND head.CR_NOTE_NO IS NOT NULL", nativeQuery = true)
//	List<Object[]> getPeriodSupplierIdForReturn(@Param("period") Date period, @Param("supplierId") String supplierId);
//
//	@Query(value = "SELECT  shead.OUR_GRP_INV_NO, CASE \r\n"
//			+ "        WHEN it_acc.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN it_acc.ACCOUNT_NAME \r\n"
//			+ "        ELSE 'OTHERS'   END AS Item_Category_Name,  \r\n"
//			+ "    SUM(sdet.GP * sdet.QTY) AS Total_GP, SUM(sdet.DIS_AMOUNT) AS DISCOUNT FROM \r\n"
//			+ "    suppdelhead AS shead  INNER JOIN \r\n"
//			+ "    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID INNER JOIN  \r\n"
//			+ "    suppdeldetail AS sdet ON sdet.GRN_ID = shead.GRN_ID INNER JOIN  \r\n"
//			+ "    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK INNER JOIN \r\n"
//			+ "    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK WHERE \r\n"
//			+ "    MONTH(shead.PERIOD) = MONTH(:period) AND YEAR(shead.PERIOD) = YEAR(:period) AND shead.OUR_GRP_INV_NO  = :grNo   \r\n"
//			+ "GROUP BY  shead.OUR_GRP_INV_NO,   CASE \r\n"
//			+ "        WHEN it_acc.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN it_acc.ACCOUNT_NAME \r\n"
//			+ "        ELSE 'OTHERS' \r\n" + "    END;", nativeQuery = true)
//	List<Object[]> getPeriodGrno(@Param("period") Date period, @Param("grNo") String grNo);
//
//	@Query(value = "SELECT  shead.OUR_GROUP_CR_NOTE_NO, CASE \r\n"
//			+ "        WHEN it_acc.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN it_acc.ACCOUNT_NAME \r\n"
//			+ "        ELSE 'OTHERS'   END AS Item_Category_Name,  \r\n"
//			+ "    SUM(sdet.GP * sdet.QTY) AS Total_GP, SUM(0) AS DISCOUNT FROM \r\n"
//			+ "    returntosupphead AS shead  INNER JOIN \r\n"
//			+ "    suppliers AS sup ON sup.Supplier_ID = shead.SUPPLIER_ID INNER JOIN  \r\n"
//			+ "    returntosuppdetail AS sdet ON sdet.SUPP_RETURN_ID = shead.SUPP_RETURN_ID INNER JOIN  \r\n"
//			+ "    mst_item_category AS m ON LEFT(sdet.ITEM_ID, 2) = m.ITEM_CAT_PK INNER JOIN \r\n"
//			+ "    mst_item_account AS it_acc ON it_acc.ITEM_ACCOUNT_PK = m.ACCOUNT_FK WHERE \r\n"
//			+ "    MONTH(shead.PERIOD) = MONTH(:period) AND YEAR(shead.PERIOD) = YEAR(:period) AND shead.OUR_GROUP_CR_NOTE_NO  = :grNo \r\n"
//			+ "GROUP BY  shead.OUR_GROUP_CR_NOTE_NO,   CASE \r\n"
//			+ "        WHEN it_acc.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN it_acc.ACCOUNT_NAME \r\n"
//			+ "        ELSE 'OTHERS' \r\n" + "    END;", nativeQuery = true)
//	List<Object[]> getPeriodRetno(@Param("period") Date period, @Param("grNo") String grNo);
//
//	@Query(value = "SELECT supplier_id FROM suppdelhead WHERE YEAR(PERIOD) = YEAR(?1) AND MONTH(PERIOD) = MONTH(?1) GROUP BY supplier_id ", nativeQuery = true)
//	List<String> getPeriodBasedSupplierIdBySupplierDeliveryDetailsByDeliveryReport(Date monthYear);
//
//	@Query(value = "SELECT supplier_id FROM suppdelhead WHERE YEAR(PERIOD) = YEAR(?1) AND MONTH(PERIOD) = MONTH(?1) GROUP BY supplier_id ", nativeQuery = true)
//	List<String> getPeriodBasedSupplierIdBySupplierInvoiceDetailsByInvoiceReport(Date monthYear);
//	
//	@Query(value = "SELECT SUPP_INV_ID FROM suppdelhead WHERE YEAR(PERIOD) = YEAR(?1) AND MONTH(PERIOD) = MONTH(?1) AND STATUS_FK = 1 GROUP BY SUPP_INV_ID ", nativeQuery = true)
//	List<String> getInvoiceNoPeriodBasedSupplierIdBySupplierInvoiceDetailsByInvoiceReport(Date monthYear);
//
//	@Query(value = "\r\n" + "SELECT supp.ord_loc_id,loc.location_name FROM suppdelhead supp \r\n"
//			+ "INNER JOIN location loc ON loc.location_id=supp.ord_loc_id \r\n"
//			+ "WHERE YEAR(supp.PERIOD) = YEAR(?1) AND MONTH(supp.PERIOD) =  MONTH(?1)  GROUP BY supp.ord_loc_id", nativeQuery = true)
//	List<Object[]> getPeriodBasedLocationId(Date monthYear);
//	
//	@Query(value = "SELECT supplier_id " +
//            "FROM suppdelhead " +
//            "WHERE PERIOD >= :startDate AND PERIOD <= :endDate " +
//            "GROUP BY supplier_id", 
//    nativeQuery = true)
//	List<String> getPeriodBasedSupplierIdByPurchasePriceAnalysisReport(
//			@Param("startDate") Date startDate, 
//			@Param("endDate") Date endDate);
//	
//	 @Query(value = "SELECT sd.item_id " + 
//             "FROM suppdeldetail sd " + 
//             "INNER JOIN suppdelhead sh " + 
//             "ON sh.GRN_ID = sd.GRN_ID " + 
//             "WHERE sh.PERIOD >= :startDate AND sh.PERIOD <= :endDate " + 
//             "GROUP BY sd.item_id", 
//     nativeQuery = true)
//	 List<Integer> getPeriodBasedItemIdByPurchasePriceAnalysisReport(
//			 @Param("startDate") Date startDate, 
//			 @Param("endDate") Date endDate);
//	 
//	 @Query(value = " SELECT DISTINCT " + 
//		        "     head.SUPPLIER_ID, " + 
//		        "     sup.Supplier_Name, " + 
//		        "     head.SUPP_INV_ID, " + 
//		        "     head.SUPP_INV_DATE, " + 
//		        "     head.ORD_LOC_ID, " + 
//		        "     loc.Location_Name, " + 
//		        "     head.GRN_ID, " + 
//		        "     det.ITEM_ID, " + 
//		        "     it.Item_Name, " + 
//		        "     det.PACKAGE_ID, " + 
//		        "     det.QTY, " + 
//		        "     det.STOCK_GP, " + 
//		        "     (det.QTY * det.STOCK_GP),  " + 
//		        "     det.IP AS cessionPrice, det.IP * det.QTY AS totalCessionPrice  " + 
//		        " FROM " + 
//		        "     suppdelhead AS head " + 
//		        " INNER JOIN " + 
//		        "     suppliers AS sup " + 
//		        "     ON sup.Supplier_ID = head.SUPPLIER_ID " + 
//		        " INNER JOIN " + 
//		        "     suppdeldetail AS det " + 
//		        "     ON det.GRN_ID = head.GRN_ID " + 
//		        " INNER JOIN " + 
//		        "     item AS it " + 
//		        "     ON it.Item_Id = det.ITEM_ID " + 
//		        " INNER JOIN " + 
//		        "     location AS loc " + 
//		        "     ON loc.Location_ID = head.ORD_LOC_ID " + 
//		        " WHERE " + 
//		        "     MONTH(head.PERIOD) = :month " + 
//		        "     AND YEAR(head.PERIOD) = :year " + 
//		        "     AND (:startDate IS NULL OR :endDate IS NULL OR head.SUPP_INV_DATE BETWEEN :startDate AND :endDate) " + 
//		        "     AND (:suppInvId IS NULL OR head.SUPP_INV_ID = :suppInvId) " + 
//		        "     AND (:supplierId IS NULL OR head.SUPPLIER_ID = :supplierId) " + 
//		        "     AND head.STATUS_FK = '1' " + 
//		        "     AND head.ORD_LOC_ID IN (SELECT cwh FROM entityeiis WHERE cwh IS NOT NULL) " + 
//		        " ORDER BY " + 
//		        "     head.SUPPLIER_ID, " + 
//		        "     head.SUPP_INV_ID, " + 
//		        "     head.ORD_LOC_ID, " + 
//		        "     head.GRN_ID, " + 
//		        "     det.ITEM_ID", 
//		        nativeQuery = true)
//		List<Object[]> listOfCWH(@Param("month") int month, 
//		                         @Param("year") int year, 
//		                         @Param("startDate") Date startDate, 
//		                         @Param("endDate") Date endDate, 
//		                         @Param("suppInvId") String suppInvId, 
//		                         @Param("supplierId") String supplierId);
//
//
//
//
//
//
//
//@Query(value = " SELECT DISTINCT " + 
//        "     head.SUPPLIER_ID, " + 
//        "     sup.Supplier_Name, " + 
//        "     head.SUPP_INV_ID, " + 
//        "     head.SUPP_INV_DATE, " + 
//        "     head.ORD_LOC_ID, " + 
//        "     loc.Location_Name, " + 
//        "     head.GRN_ID, " + 
//        "     det.ITEM_ID, " + 
//        "     it.Item_Name, " + 
//        "     det.PACKAGE_ID, " + 
//        "     det.QTY, " + 
//        "     det.STOCK_GP, " + 
//        "     (det.QTY * det.STOCK_GP),  " + 
//        "     det.IP AS cessionPrice, det.IP * det.QTY AS totalCessionPrice  " + 
//        " FROM " + 
//        "     suppdelhead AS head " + 
//        " INNER JOIN " + 
//        "     suppliers AS sup " + 
//        "     ON sup.Supplier_ID = head.SUPPLIER_ID " + 
//        " INNER JOIN " + 
//        "     suppdeldetail AS det " + 
//        "     ON det.GRN_ID = head.GRN_ID " + 
//        " INNER JOIN " + 
//        "     item AS it " + 
//        "     ON it.Item_Id = det.ITEM_ID " +  
//		        " INNER JOIN " + 
//		        "     location AS loc " + 
//		        "     ON loc.Location_ID = head.ORD_LOC_ID " + 
//		        " WHERE " + 
//		        "     MONTH(head.PERIOD) = :month " + 
//		        "     AND YEAR(head.PERIOD) = :year " + 
//		        "     AND (:startDate IS NULL OR :endDate IS NULL OR head.SUPP_INV_DATE BETWEEN :startDate AND :endDate) " + 
//		        "     AND (:suppInvId IS NULL OR head.SUPP_INV_ID = :suppInvId) " + 
//		        "     AND (:supplierId IS NULL OR head.SUPPLIER_ID = :supplierId) " + 
//		        "     AND head.STATUS_FK = '1' " + 
//		        "     AND head.ORD_LOC_ID NOT IN (SELECT cwh FROM entityeiis WHERE cwh IS NOT NULL) " + 
//		        " ORDER BY " + 
//		        "     head.SUPPLIER_ID, " + 
//		        "     head.SUPP_INV_ID, " + 
//		        "     head.ORD_LOC_ID, " + 
//		        "     head.GRN_ID, " + 
//		        "     det.ITEM_ID", 
//		        nativeQuery = true)
//		List<Object[]> listOfDD(@Param("month") int month, 
//		                         @Param("year") int year, 
//		                         @Param("startDate") Date startDate, 
//		                         @Param("endDate") Date endDate, 
//		                         @Param("suppInvId") String suppInvId,
//		                         @Param("supplierId") String supplierId);
//
//
//
//
//
//@Query(value = " SELECT DISTINCT " + 
//        "     head.SUPPLIER_ID, " + 
//        "     sup.Supplier_Name, " + 
//        "     head.SUPP_INV_ID, " + 
//        "     head.SUPP_INV_DATE, " + 
//        "     head.ORD_LOC_ID, " + 
//        "     loc.Location_Name, " + 
//        "     head.GRN_ID, " + 
//        "     det.ITEM_ID, " + 
//        "     it.Item_Name, " + 
//        "     det.PACKAGE_ID, " + 
//        "     det.QTY, " + 
//        "     det.STOCK_GP, " + 
//        "     (det.QTY * det.STOCK_GP),  " + 
//        "     det.IP AS cessionPrice, det.IP * det.QTY AS totalCessionPrice  " + 
//        " FROM " + 
//        "     suppdelhead AS head " + 
//        " INNER JOIN " + 
//        "     suppliers AS sup " + 
//        "     ON sup.Supplier_ID = head.SUPPLIER_ID " + 
//        " INNER JOIN " + 
//        "     suppdeldetail AS det " + 
//        "     ON det.GRN_ID = head.GRN_ID " + 
//        " INNER JOIN " + 
//        "     item AS it " + 
//        "     ON it.Item_Id = det.ITEM_ID " +  
//     " INNER JOIN " + 
//     "     location AS loc " + 
//     "     ON loc.Location_ID = head.ORD_LOC_ID " + 
//     " WHERE " + 
//     "     MONTH(head.PERIOD) = :month " + 
//     "     AND YEAR(head.PERIOD) = :year " + 
//     "     AND (:startDate IS NULL OR :endDate IS NULL OR head.SUPP_INV_DATE BETWEEN :startDate AND :endDate) " + 
//     "     AND (:supplierId IS NULL OR head.SUPPLIER_ID = :supplierId) " + 
//     "     AND (:suppInvId IS NULL OR head.SUPP_INV_ID = :suppInvId) " + 
//     "     AND head.STATUS_FK = '1' " + 
//     " ORDER BY " + 
//     "     head.SUPPLIER_ID, " + 
//     "     head.SUPP_INV_ID, " + 
//     "     head.ORD_LOC_ID, " + 
//     "     head.GRN_ID, " + 
//     "     det.ITEM_ID", 
//     nativeQuery = true)
//List<Object[]> listOfCWHAndDD(@Param("month") int month, 
//                      @Param("year") int year, 
//                      @Param("startDate") Date startDate, 
//                      @Param("endDate") Date endDate, 
//                      @Param("supplierId") String supplierId,
//                      @Param("suppInvId") String suppInvId);

}
