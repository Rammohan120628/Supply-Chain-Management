package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.MstItemMasterHib;


public interface MstItemMasterRepository extends JpaRepository<MstItemMasterHib, Integer> {

	@Query("select r from MstItemMasterHib r where r.itemCode=?1")
	MstItemMasterHib findByItemCode(String itemCode);

	@Query("select m from MstItemMasterHib m order by itemPk desc")
	List<MstItemMasterHib> orderBy();
	
	@Query(value = "SELECT " +
	        "mc.Name AS category_name, " +
	        "mc.ITEM_CAT_PK AS category_id, " +
	        "mi.ITEM_CODE, " +
	        "mi.ITEM_NAME, " +
	        "0.000 AS RE_ORDER_QTY, " +
	        "mi.ITEM_CODE AS CWH_ITEM_ID, " +
	        "mi.PURCHASE_ID AS CWH_PACKAGE_ID, " +
	        "mi.PURCHASE_ID AS PACKAGE_ID, " +
	        "0.000 AS CO_EFF, " +
	        "acc.ACCOUNT_ID AS ACCOUNT_ID, " +
	        "acc.ACCOUNT_NAME AS ACCOUNT_NAME, " +
	        "CASE " +
	        "    WHEN acc.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN acc.ACCOUNT_NAME " +
	        "    ELSE 'OTHERS' " +
	        "END AS report_group, " +
	        "0 AS exp_days " +
	        "FROM mst_item_master AS mi " +
	        "INNER JOIN mst_item_category AS mc ON LEFT(mi.ITEM_CODE, 2) = mc.ITEM_CAT_PK " +
	        "INNER JOIN mst_item_account AS acc ON acc.ITEM_ACCOUNT_PK = mi.ACCOUNT_FK " +
	        "ORDER BY mc.ITEM_CAT_PK;",
	        nativeQuery = true)
	List<Object[]> getItemDetails();
	
	@Query(value = "SELECT " +
	        "mc.Name AS category_name, " +
	        "mc.ITEM_CAT_PK AS category_id, " +
	        "mi.ITEM_CODE, " +
	        "mi.ITEM_NAME, " +
	        "0.000 AS RE_ORDER_QTY, " +
	        "mi.ITEM_CODE AS CWH_ITEM_ID, " +
	        "mi.PURCHASE_ID AS CWH_PACKAGE_ID, " +
	        "mi.PURCHASE_ID AS PACKAGE_ID, " +
	        "0.000 AS CO_EFF, " +
	        "acc.ACCOUNT_ID AS ACCOUNT_ID, " +
	        "CASE " +
	        "    WHEN acc.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN acc.ACCOUNT_NAME " +
	        "    ELSE 'OTHERS' " +
	        "END AS ACCOUNT_DESCRIPTION, " +
	        "CASE " +
	        "    WHEN acc.ACCOUNT_NAME IN ('FOOD', 'CLEANING', 'DISPOSABLES') THEN acc.ACCOUNT_NAME " +
	        "    ELSE 'OTHERS' " +
	        "END AS report_group, " +
	        "0 AS exp_days " +
	        "FROM mst_item_master AS mi " +
	        "INNER JOIN mst_item_category AS mc ON LEFT(mi.ITEM_CODE, 2) = mc.ITEM_CAT_PK " +
	        "INNER JOIN mst_item_account AS acc ON acc.ITEM_ACCOUNT_PK = mi.ACCOUNT_FK " +
	        "WHERE mi.ITEM_CODE LIKE ?1 " +
	        "ORDER BY mc.ITEM_CAT_PK",
	        nativeQuery = true)
	List<Object[]> getItemDetailsByFamilyId(String id);

	
	@Query(value = "SELECT " +
	        "d.Item_ID, " +
	        "i.item_name AS Item_Name, " +
	        "d.Package_Id, " +
	        "mi.uom AS UOM, " +
	        "SUM(d.Qty) AS Qty, " +
	        "COALESCE(s.supplier_name, '') AS Supplier_Name " +
	        "FROM req_head_new h " +
	        "JOIN req_detail_new d ON d.Req_No = h.Req_No AND d.Entity_ID = h.Entity_ID " +
	        "LEFT JOIN Suppliers s ON s.Supplier_ID = d.Supplier_ID " +
	        "INNER JOIN Item i ON i.item_id = d.item_id " +
	        "INNER JOIN mst_item_master mi ON mi.item_code = d.Item_ID " +
	        "WHERE h.Period = ?1 " +
	        "GROUP BY d.Item_ID, i.item_name, d.Package_Id, mi.uom, s.supplier_name",
	        nativeQuery = true)
	List<Object[]> getLocationRequestRecapReportData(Date period);

	
	
	@Query(value = "SELECT " +
	        "lh.LOCATION_ID AS LocationID, " +
	        "loc.location_name, " +
	        "ld.ITEM_ID AS ItemID, " +
	        "i.ITEM_NAME AS ItemName, " +
	        "ld.PACKAGE_ID AS PackageId, " +
	        "COALESCE(ld.SUPPLIER_ID, '') AS SupplierID, " +
	        "COALESCE(s.SUPPLIER_NAME, '') AS SupplierName, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 1 THEN ld.QTY ELSE 0 END) AS QTY1, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 8 THEN ld.QTY ELSE 0 END) AS QTY8, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 14 THEN ld.QTY ELSE 0 END) AS QTY14, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 22 THEN ld.QTY ELSE 0 END) AS QTY22 " +
	        "FROM req_head_new lh " +
	        "JOIN req_detail_new ld ON ld.Req_no = lh.Req_no " +
	        "LEFT JOIN Suppliers s ON s.Supplier_ID = ld.Supplier_id " +
	        "LEFT JOIN item i ON i.ITEM_ID = ld.ITEM_ID " +
	        "INNER JOIN location loc ON loc.Location_Id = lh.LOCATION_ID " +
	        "WHERE MONTH(ld.REQUEST_DATE) = MONTH(?1) " +
	        "AND YEAR(ld.REQUEST_DATE) = YEAR(?1) " +
	        "GROUP BY lh.LOCATION_ID, loc.location_name, ld.ITEM_ID, i.ITEM_NAME, ld.PACKAGE_ID, " +
	        "ld.SUPPLIER_ID, s.SUPPLIER_NAME",
	        nativeQuery = true)
	List<Object[]> getLocationRequestParticularReportData(Date monthYear);

	
	
	
	
	@Query(value = "SELECT " +
	        "lh.LOCATION_ID AS LocationID, " +
	        "loc.location_name, " +
	        "ld.ITEM_ID AS ItemID, " +
	        "i.ITEM_NAME AS ItemName, " +
	        "ld.PACKAGE_ID AS PackageId, " +
	        "COALESCE(ld.SUPPLIER_ID, '') AS SupplierID, " +
	        "COALESCE(s.SUPPLIER_NAME, '') AS SupplierName, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 1 THEN ld.QTY ELSE 0 END) AS QTY1, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 8 THEN ld.QTY ELSE 0 END) AS QTY8, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 14 THEN ld.QTY ELSE 0 END) AS QTY14, " +
	        "MAX(CASE WHEN DAY(ld.REQUEST_DATE) = 22 THEN ld.QTY ELSE 0 END) AS QTY22 " +
	        "FROM req_head_new lh " +
	        "JOIN req_detail_new ld ON ld.Req_no = lh.Req_no " +
	        "LEFT JOIN Suppliers s ON s.Supplier_ID = ld.Supplier_id " +
	        "LEFT JOIN item i ON i.ITEM_ID = ld.ITEM_ID " +
	        "INNER JOIN location loc ON loc.Location_Id = lh.LOCATION_ID " +
	        "WHERE MONTH(ld.REQUEST_DATE) = MONTH(?1) " +
	        "AND YEAR(ld.REQUEST_DATE) = YEAR(?1) " +
	        "AND lh.LOCATION_ID = ?2 " +
	        "GROUP BY lh.LOCATION_ID, loc.location_name, ld.ITEM_ID, i.ITEM_NAME, " +
	        "ld.PACKAGE_ID, ld.SUPPLIER_ID, s.SUPPLIER_NAME",
	        nativeQuery = true)
	List<Object[]> getLocationRequestParticularReportDataLocationIdBased(Date monthYear, String locationId);

	
	
	
	
	
	
	
	
	
	
	
	
	
	

}
