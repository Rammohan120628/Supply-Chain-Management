package com.esfita.repository;


import java.util.Date;
import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.StockHib;

import jakarta.transaction.Transactional;


public interface StockRepository extends JpaRepository<StockHib, Integer> {
	
	@Transactional
	@Modifying
	@Query(
	    value = "INSERT INTO stockhist (PERIOD, ITEM_ID, PACKAGE_ID, OP_QTY, OP_GP, OP_CP, OP_DISC, " +
	            "IN_QTY, IN_GP, IN_CP, IN_DISC, OUT_QTY, OUT_GP, OUT_CP, OUT_DISC, ENTITY_ID) " +
	            "SELECT ?1, ITEM_ID, PACKAGE_ID, OP_QTY, OP_GP, OP_CP, OP_DISC, " +
	            "IN_QTY, IN_GP, IN_CP, IN_DISC, OUT_QTY, OUT_GP, OUT_CP, OUT_DISC, ENTITY_ID " +
	            "FROM stock",
	    nativeQuery = true
	)
	void insertStockHist(Date period);
	
	@Transactional
	@Modifying
	@Query(value = "TRUNCATE TABLE stock;", nativeQuery = true)
	void truncateStockTable();

	
	@Transactional
	@Modifying
	@Query(value =
	    "INSERT INTO stock (ITEM_ID, PACKAGE_ID, OP_QTY, OP_GP, OP_CP, ENTITY_ID) " +
	    "SELECT ITEM_ID, PACKAGE_ID, " +
	    "       (OP_QTY + IN_QTY - OUT_QTY), " +
	    "       ROUND((OP_GP + IN_GP - OUT_GP)::numeric, 3), " +
	    "       ROUND((OP_CP + IN_CP - OUT_CP)::numeric, 3), " +
	    "       ENTITY_ID " +
	    "FROM stockhist " +
	    
"WHERE EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))"+
  "AND EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(?1 AS DATE))"+
	
	    "  AND (OP_GP + IN_GP - OUT_GP) <> 0",
	    nativeQuery = true)
	void insertIntoStock(Date previousPeriod);



////    // Corrected JPQL query
////    @Query("SELECT m FROM StockHib m WHERE m.itemId = ?1")
////    StockHib byItemId(int itemId);
////
////    // Corrected JPQL query
////    @Query("SELECT m FROM StockHib m WHERE (m.inwardQty + m.openingQty - m.outwardQty) > 0")
////    List<StockHib> orderByInQtyNot0();
//
//    // Native queries remain unchanged
//    @Query(value = "SELECT " +
//            "    st.ITEM_ID, " +
//            "    mst.Item_Name, " +
//            "    st.PACKAGE_ID, " +
//            "    mst.PACKAGE_BASE_UNIT AS Unit, " +
//            "    st.OP_QTY,  " +
//            "    st.OP_GP  " +
//            "FROM stock AS st   " +
//            "LEFT JOIN mst_item_master AS mst ON mst.ITEM_CODE = st.ITEM_ID  " +
//            "WHERE st.OP_QTY > 0  " +
//            "ORDER BY st.ITEM_ID;", nativeQuery = true)
//    List<Object[]> getTheoreticalStock();
//
//    @Query(value = "SELECT " +
//            "    st.ITEM_ID, " +
//            "    mst.Item_Name, " +
//            "    st.PACKAGE_ID, " +
//            "    mst.PACKAGE_BASE_UNIT AS Unit, " +
//            "    st.OP_QTY,  " +
//            "    st.OP_GP  " +
//            "FROM stockhist AS st  " +
//            "LEFT JOIN mst_item_master AS mst ON mst.ITEM_CODE = st.ITEM_ID  " +
//            "WHERE MONTH(st.PERIOD) = MONTH(?1) AND YEAR(st.PERIOD) = YEAR(?1) AND st.OP_QTY > 0  " +
//            "ORDER BY st.ITEM_ID;", nativeQuery = true)
//    List<Object[]> getTheoreticalStock(Date period);
//
//    @Query(value = "SELECT " +
//            "    sd.ITEM_ID, " +
//            "    i.ITEM_NAME, " +
//            "    sd.PACKAGE_ID, " +
//            "    sd.GRN_ID, " +
//            "    sd.GP, " +
//            "    COALESCE((s.OP_QTY + s.IN_QTY - s.OUT_QTY),0) AS QTY " +
//            "FROM suppdeldetail sd " +
//            "LEFT JOIN item i ON sd.ITEM_ID = i.ITEM_ID " +
//            "LEFT JOIN stock s ON s.ITEM_ID = sd.ITEM_ID " +
//            "WHERE COALESCE((s.OP_QTY + s.IN_QTY - s.OUT_QTY),0) > 0 " +
//            "AND sd.GRN_ID IN ( " +
//            "    SELECT GRN_ID FROM suppdelhead " +
//            "    WHERE MONTH(PERIOD) = MONTH(?2) AND YEAR(PERIOD) = YEAR(?2) AND SUPPLIER_ID = ?1)", nativeQuery = true)
//    List<Object[]> getItemListForReturnItem(String supplierId, Date period);
//
//    @Query(value = "SELECT " +
//            "    sd.ITEM_ID, " +
//            "    i.ITEM_NAME, " +
//            "    sd.PACKAGE_ID, " +
//            "    sd.GRN_ID, " +
//            "    sd.GP, " +
//            "    s.QTY, " +
//            "    sh.PERIOD, " +
//            "    sh.ORD_LOC_ID, " +
//            "    l.Location_Name " +
//            "FROM suppdeldetail sd " +
//            "JOIN item i ON sd.ITEM_ID = i.ITEM_ID " +
//            "JOIN (SELECT ITEM_ID, COALESCE(OP_QTY + IN_QTY - OUT_QTY, 0) AS QTY FROM stock HAVING QTY > 0) s ON s.ITEM_ID = sd.ITEM_ID " +
//            "JOIN suppdelhead sh ON sd.GRN_ID = sh.GRN_ID " +
//            "JOIN location l ON l.Location_ID = sh.ORD_LOC_ID " +
//            "WHERE sh.PERIOD BETWEEN ?3 AND ?2 " +
//            "AND sh.SUPPLIER_ID = ?1 " +
//            "ORDER BY sd.ITEM_ID, sd.GRN_ID DESC;", nativeQuery = true)
//    List<Object[]> getItemListForReturnBetweenPeriod(String supplierId, Date fromDate, Date toDate);
//
//    @Transactional
//    @Modifying
//    @Query(value = "INSERT INTO stockhist (PERIOD, ITEM_ID, PACKAGE_ID, OP_QTY, OP_GP, OP_CP, OP_DISC, IN_QTY, IN_GP, IN_CP, IN_DISC, OUT_QTY, OUT_GP, OUT_CP, OUT_DISC, ENTITY_ID) " +
//            "SELECT ?1, ITEM_ID, PACKAGE_ID, OP_QTY, OP_GP, OP_CP, OP_DISC, IN_QTY, IN_GP, IN_CP, IN_DISC, OUT_QTY, OUT_GP, OUT_CP, OUT_DISC, ENTITY_ID FROM stock;", nativeQuery = true)
//    void insertStockHist(Date period);
//
//    @Transactional
//    @Modifying
//    @Query(value = "TRUNCATE TABLE stock;", nativeQuery = true)
//    void truncateStockTable();
//
	@Query(value = """
		    SELECT 
		        e.cash_op_balance + 
		        (COALESCE(td.sumamount, 0) - COALESCE(ti.sumnetinvoice, 0)) AS result
		    FROM entityeiis e,
		         (
		             SELECT SUM(amount) AS sumamount 
		             FROM cashdisbdetail 
		             WHERE pcv_no IN (
		                 SELECT pcv_no 
		                 FROM cashdisbhead 
		                 WHERE EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
		                   AND EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(?1 AS DATE))
		             )
		         ) td,
		         (
		             SELECT SUM(net_invoice) AS sumnetinvoice 
		             FROM suppdelhead 
		             WHERE supplier_id = 'OMS00000'
		               AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
		               AND EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(?1 AS DATE))
		         ) ti
		""", nativeQuery = true)
		double getCashOpBalance(Date period);

//
//    @Transactional
//    @Modifying
//    @Query(value = "INSERT INTO stock (ITEM_ID, PACKAGE_ID, OP_QTY, OP_GP, OP_CP, ENTITY_ID) " +
//            "SELECT ITEM_ID, PACKAGE_ID, (OP_QTY + IN_QTY - OUT_QTY), ROUND((OP_GP + IN_GP - OUT_GP),3), ROUND((OP_CP + IN_CP - OUT_CP),3), ENTITY_ID " +
//            "FROM stockhist WHERE MONTH(PERIOD) = MONTH(?1) AND YEAR(PERIOD) = YEAR(?1) AND (OP_GP + IN_GP - OUT_GP) != 0;", nativeQuery = true)
//    void insertIntoStock(Date previousPeriod);

//    @Query(value = "SELECT ITEM_ID, PACKAGE_ID, SUM(OP_QTY) AS OP_QTY, SUM(OP_GP) AS OP_GP, SUM(OP_GP) AS OP_CP, 0 AS OP_DISC, " +
//            "SUM(IN_QTY) AS IN_QTY, SUM(IN_GP) AS IN_GP, SUM(IN_GP) AS IN_CP, 0 AS IN_DISC, SUM(OUT_QTY) AS OUT_QTY, " +
//            "SUM(OUT_GP) AS OUT_GP, SUM(OUT_GP) AS OUT_CP, 0 AS OUT_DISC, (SELECT ENTITY FROM entityeiis) AS ENTITY_ID " +
//            "FROM (SELECT ITEM_ID, PACKAGE_ID, 0 AS OP_QTY, 0 AS OP_GP, QTY AS IN_QTY, (QTY * STOCK_GP) AS IN_GP, 0 AS OUT_QTY, 0 AS OUT_GP FROM locretdetail WHERE LOC_RET_H_FK IN (SELECT LOC_RET_H_PK FROM locrethead WHERE PERIOD = ?1) " +
//            "UNION ALL SELECT ITEM_ID, PACKAGE_ID, OP_QTY, OP_GP, 0, 0, 0, 0 FROM stock " +
//            "UNION ALL SELECT ITEM_ID, PACKAGE_ID, 0, 0, 0, 0, QTY, (QTY * STOCK_GP) FROM cwhdeldetail WHERE CWH_DEL_ID IN (SELECT CWH_DEL_ID FROM cwhdelhead WHERE PERIOD = ?1) " +
//            "UNION ALL SELECT ITEM_ID, PACKAGE_ID, 0, 0, QTY, ACTUAL_INV, 0, 0 FROM suppdeldetail WHERE GRN_ID IN (SELECT GRN_ID FROM suppdelhead WHERE PERIOD = ?1 AND ORD_LOC_ID = (SELECT CWH FROM entityeiis)) " +
//            "UNION ALL SELECT ITEM_ID, PACKAGE_ID, 0, 0, 0, 0, QTY, (QTY * GP) FROM returntosuppdetail WHERE SUPP_RETURN_ID IN (SELECT SUPP_RETURN_ID FROM returntosupphead WHERE PERIOD = ?1)) AS combined " +
//            "GROUP BY ITEM_ID;", nativeQuery = true)
//    List<Object[]> retrieveStock(Date period);
//
//    @Transactional
//    @Modifying
//    @Query(value = "TRUNCATE TABLE physicalstock;", nativeQuery = true)
//    void truncatePhysicalStockTable();

//    @Query(value = "SELECT mst_item_category.ITEM_CAT_PK, mst_item_category.name, st.ITEM_ID, item.Item_Name, st.PACKAGE_ID, " +
//            "mst_item_master.PACKAGE_BASE_UNIT, (st.OP_QTY+st.IN_QTY-st.OUT_QTY), ROUND((st.OP_GP+st.IN_GP-st.OUT_GP),3) " +
//            "FROM stock AS st " +
//            "INNER JOIN item ON item.Item_ID = st.ITEM_ID " +
//            "INNER JOIN mst_item_category ON SUBSTRING(st.ITEM_ID, 1, 2) = mst_item_category.ITEM_CAT_PK " +
//            "INNER JOIN mst_item_master ON mst_item_master.ITEM_CODE = st.ITEM_ID WHERE (st.OP_QTY+st.IN_QTY-st.OUT_QTY) > 0 " +
//            "ORDER BY mst_item_category.ITEM_CAT_PK, st.ITEM_ID;", nativeQuery = true)
//    List<Object[]> getTheoreticalStockByTheoreticalStockReportNew();

	@Query(value = "SELECT " + "    st.ITEM_ID, " + "    item.Item_Name, " + "    st.PACKAGE_ID, "
			+ "    mst_item_master.PACKAGE_BASE_UNIT, " + "    (st.OP_QTY + st.IN_QTY - st.OUT_QTY) AS quantity, "
			+ "    ROUND((st.OP_GP + st.IN_GP - st.OUT_GP)::numeric, 3) AS gp " + "FROM stock st "
			+ "INNER JOIN item ON item.Item_ID::integer = st.ITEM_ID "
			+ "INNER JOIN mst_item_category ON SUBSTRING(st.ITEM_ID::text, 1, 2)::integer = mst_item_category.ITEM_CAT_PK "
			+ "INNER JOIN mst_item_master ON mst_item_master.ITEM_CODE::integer = st.ITEM_ID "
			+ "WHERE (st.OP_QTY + st.IN_QTY - st.OUT_QTY) > 0 "
			+ "ORDER BY mst_item_category.ITEM_CAT_PK, st.ITEM_ID", nativeQuery = true)
	List<Object[]> getTheoreticalStockByTheoreticalStockReportNewLatest();

	@Query(value = "SELECT " + "    st.ITEM_ID, " + "    item.Item_Name, " + "    st.PACKAGE_ID, "
			+ "    mst_item_master.PACKAGE_BASE_UNIT AS Unit, " + "    (st.OP_QTY + st.IN_QTY - st.OUT_QTY) AS qty, "
			+ "    ROUND((st.OP_GP + st.IN_GP - st.OUT_GP)::numeric, 3) AS gp " + "FROM stock AS st "
			+ "INNER JOIN item ON CAST(item.Item_ID AS integer) = st.ITEM_ID "
			+ "LEFT JOIN mst_item_master ON CAST(mst_item_master.ITEM_CODE AS integer) = st.ITEM_ID "
			+ "WHERE CAST(st.ITEM_ID AS text) LIKE CONCAT(?1, '%') " + "ORDER BY st.ITEM_ID", nativeQuery = true)
	List<Object[]> getTheoreticalStockFamilyIdBased(String familyId);
}
