package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.esfita.entity.PhysicalStockHib;


public interface PhysicalStockRepository extends JpaRepository<PhysicalStockHib, Integer> {

//	@Query(value = "SELECT  COALESCE(s.`ITEM_ID`,'NA'),COALESCE(i.`Item_Name`,'NA'),COALESCE(s.`PACKAGE_ID`,'NA'),COALESCE(`F_PHYSICAL_QTY`,0),\r\n"
//			+ "ROUND(COALESCE((s.`OP_QTY`+s.`IN_QTY`-s.`OUT_QTY`),0),2) AS THEORITICAL_STOCK,COALESCE(ti.`REMAINING_QTY`,0) AS ADJUST\r\n"
//			+ ",COALESCE(`F_REASON`,'NA'),COALESCE(((s.`OP_CP`+s.`IN_CP`-s.`OUT_CP`)/(s.`OP_QTY`+s.`IN_QTY`-s.`OUT_QTY`)), 0) AS UNIT_CP   \r\n"
//			+ "FROM `stock` s  LEFT JOIN `traceitem` ti ON  s.`ITEM_ID` = ti.`ITEM_ID` AND s.`PACKAGE_ID` = ti.`PACKAGE_ID` AND   s.`ENTITY_ID` = ti.`ENTITY_ID` AND ti.`REMAINING_QTY`!=0 \r\n"
//			+ "LEFT JOIN `physicalstock` p  ON s.`ITEM_ID`=p.`ITEM_ID` AND s.`PACKAGE_ID`=p.`PACKAGE_ID` AND s.`ENTITY_ID`=p.`ENTITY_ID` AND p.`BATCH_NO`=ti.`BATCH_NO`  \r\n"
//			+ "LEFT JOIN `item` i ON i.`Item_Name` = s.`ITEM_ID` AND s.`PACKAGE_ID` = i.`Package_Id`\r\n"
//			+ "WHERE  AND ROUND((s.`OP_QTY`+s.`IN_QTY`-s.`OUT_QTY`),2)!=0 \r\n"
//			+ "GROUP BY s.`ITEM_ID`, s.`PACKAGE_ID`;", nativeQuery = true)
//	List<Object[]> retriveDataFromWith_PStock();
//
//	@Query(value = "SELECT  COALESCE(s.`ITEM_ID`,'NA'),COALESCE(i.`Item_Name`,'NA'),COALESCE(s.`PACKAGE_ID`,'NA'),ROUND(COALESCE((s.`OP_QTY`+s.`IN_QTY`-s.`OUT_QTY`),0),2) AS THEORITICAL_STOCK,COALESCE(ti.`REMAINING_QTY`,0) AS ADJUST\r\n"
//			+ ",COALESCE(((s.`OP_CP`+s.`IN_CP`-s.`OUT_CP`)/(s.`OP_QTY`+s.`IN_QTY`-s.`OUT_QTY`)), 0) AS UNIT_CP   \r\n"
//			+ "FROM `stock` s  LEFT JOIN `traceitem` ti ON  s.`ITEM_ID` = ti.`ITEM_ID` AND s.`PACKAGE_ID` = ti.`PACKAGE_ID` AND   s.`ENTITY_ID` = ti.`ENTITY_ID` AND ti.`REMAINING_QTY`!=0 \r\n"
//			+ "LEFT JOIN `item` i ON i.`Item_Name` = s.`ITEM_ID` AND s.`PACKAGE_ID` = i.`Package_Id`\r\n"
//			+ "WHERE  ROUND((s.`OP_QTY`+s.`IN_QTY`-s.`OUT_QTY`),2)!=0 \r\n"
//			+ "GROUP BY s.`ITEM_ID`, s.`PACKAGE_ID`;", nativeQuery = true)
//	List<Object[]> retriveDatafrom_stock();
//
	@Query(value =
	        "SELECT " +
	        "s.ITEM_ID AS ITEM_ID, " +
	        "i.ITEM_NAME AS ITEM_NAME, " +
	        "i.PACKAGE_ID AS PACKAGE_ID, " +
	        "COALESCE(((s.OP_CP + s.IN_CP - s.OUT_CP) / NULLIF((s.OP_QTY + s.IN_QTY - s.OUT_QTY),0)), 0) AS UNIT_CP, " +

	        "ROUND(COALESCE((s.OP_QTY + s.IN_QTY - s.OUT_QTY), 0)::numeric, 4) AS THEORETICAL_QTY, " +
	        "ROUND(COALESCE(ps.PHYSICAL_QTY, 0)::numeric, 4) AS PHYSICAL_QTY, " +

	        "ROUND( " +
	        "    (ROUND(COALESCE(ps.PHYSICAL_QTY, 0)::numeric, 4) - " +
	        "     ROUND(COALESCE((s.OP_QTY + s.IN_QTY - s.OUT_QTY), 0)::numeric, 4))::numeric, 4 " +
	        ") AS ADJUST, " +

	        "COALESCE(ps.REASON, '') AS REASON " +
	        "FROM stock s " +
	        "LEFT JOIN physicalstock ps " +
	        "ON ps.ITEM_ID = s.ITEM_ID " +
	        "AND EXTRACT(MONTH FROM ps.PERIOD) = EXTRACT(MONTH FROM CAST(?1 AS DATE)) " +
	        "AND EXTRACT(YEAR FROM ps.PERIOD) = EXTRACT(YEAR FROM CAST(?1 AS DATE)) " +
	        "LEFT JOIN mst_item_master i " +
	        "ON i.ITEM_CODE = CAST(s.ITEM_ID AS VARCHAR) " +
	        "WHERE (s.OP_QTY + s.IN_QTY - s.OUT_QTY) > 0",
	        nativeQuery = true)
	List<Object[]> retreivePhysicalStock(Date period);


	@Transactional
	@Modifying
	@Query(
	  "delete from PhysicalStockHib m " +
	  "where EXTRACT(MONTH FROM m.period) = EXTRACT(MONTH FROM CAST(:period AS date)) " +
	  "and   EXTRACT(YEAR  FROM m.period) = EXTRACT(YEAR  FROM CAST(:period AS date))"
	)
	void deleteByPeriod(@Param("period") Date period);


//
//	@Transactional
//	@Modifying
//	@Query("delete from PhysicalStockHib m where MONTH(m.period) = MONTH(?1) AND YEAR(m.period) = YEAR(?1)")
//	void deleteByPeriod(Date period);

	@Query("SELECT m FROM PhysicalStockHib m where MONTH(period) = MONTH(?1)  AND YEAR(period) = YEAR(?2)")
	List<PhysicalStockHib> exist(Date period);

}
