package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.SuppliersItemHib;

import jakarta.transaction.Transactional;

public interface SuppliersItemRepository extends JpaRepository<SuppliersItemHib, Integer> {

	@Query("select m from SuppliersItemHib m order by suppItemPk desc")
	List<SuppliersItemHib> orderBy();
	
	@Query(
		    value = "SELECT * FROM suppliersitem m WHERE m.supp_fk = ?1 AND m.item_id = ?2",
		    nativeQuery = true
		)
		List<SuppliersItemHib> findItem(int fk, String item);

	@Query("select r from SuppliersItemHib r where r.mbStatus = 'A' and r.suppFk = ?1 order by r.supplierId asc")
	List<SuppliersItemHib> retrieveAllActive(int suppFk);

	@Query("select m from SuppliersItemHib m where mbStatus = 'A' order by suppItemPk desc")
	List<SuppliersItemHib> orderByActive();

	@Query("select r from SuppliersItemHib r where r.mbStatus = 'A' order by r.supplierId asc")
	List<SuppliersItemHib> retrieveAll();

	@Transactional
	@Modifying
	@Query("delete from SuppliersItemHib m where m.suppFk = ?1")
	void deletesupplierId(int srcId);

	@Transactional
	@Modifying
	@Query("delete from SuppliersItemHib m where m.suppFk = ?1  AND YEAR(m.period) =YEAR(?2) AND MONTH(m.period) = MONTH(?2)")
	void deletesupplierIdByPeriod(int srcId, Date period);
	
	@Transactional
	@Modifying
	@Query(
	    value = """
	        DELETE FROM suppliersitem
	        WHERE EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
	          AND EXTRACT(YEAR  FROM period) = EXTRACT(YEAR  FROM CAST(?1 AS DATE))
	        """,
	    nativeQuery = true
	)
	void deleteByPeriod(Date period);

	
	@Transactional
	@Modifying
	@Query("delete from SuppliersItemHib m where m.itemId =?1")
	void deleteByItemId(int itemId);

	@Transactional
	@Modifying
	@Query(value = "INSERT INTO suppliersitem ( " +
	        "  supplier_id, supp_fk, item_id, package_id, nct01, nct02, nct03, nct04, " +
	        "  created_date, period, last_qtd_price, last_purch_price, last_purch_exp_dt, " +
	        "  is_active, entity_id, mb_status, last_user, last_update, supplier_imtem_id, supplier_package_id " +
	        ") " +
	        "SELECT " +
	        "  supplier_id, supp_fk, item_id, package_id, nct01, nct02, nct03, nct04, " +
	        "  created_date, ?2 AS period, last_qtd_price, last_purch_price, last_purch_exp_dt, " +
	        "  is_active, entity_id, mb_status, last_user, last_update, supplier_imtem_id, supplier_package_id " +
	        "FROM suppliersitem " +
	        "WHERE EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE)) " +
	        "AND EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(?1 AS DATE));",
	        nativeQuery = true)
	void copyDate(Date from, Date to);

	
	
	@Transactional
	@Modifying
	@Query("delete from SuppliersItemHib m where m.supplierId = ?1")
	void deleteBysupplierId(String srcId);

	@Query("select m from SuppliersItemHib m where m.suppFk = ?1 and m.itemId = ?2")
	List<SuppliersItemHib> findItem(int fk, int item);

	@Query("SELECT COUNT(m.itemId) FROM SuppliersItemHib m WHERE m.suppFk = ?1 ")
	int itemIdCount(int suppFk);

	@Query("select m from SuppliersItemHib m where m.suppFk=?1")
	List<SuppliersItemHib> retriveBySupplierId(int supplierId);

	@Query(
		    value = "SELECT * " +
		            "FROM suppliersitem si " +
		            "WHERE si.supp_fk = :supplierId " +
		            "AND EXTRACT(YEAR FROM si.period) = EXTRACT(YEAR FROM CAST(:period AS DATE)) " +
		            "AND EXTRACT(MONTH FROM si.period) = EXTRACT(MONTH FROM CAST(:period AS DATE))",
		    nativeQuery = true
		)
		List<SuppliersItemHib> retriveBySupplierIdAndPeriod(
		        @Param("supplierId") int supplierId,
		        @Param("period") Date period);


	@Query("select m from SuppliersItemHib m where m.suppFk = ?1 and m.itemId = ?2 AND YEAR(m.period) =YEAR(?3) AND MONTH(m.period) = MONTH(?3)")
	List<SuppliersItemHib> findItemBySfkAndPeriod(int fk, int item, Date period);

	@Query("select m from SuppliersItemHib m where YEAR(m.period) =YEAR(?1) AND MONTH(m.period) = MONTH(?1) GROUP BY supplierId")
	List<SuppliersItemHib> getDataByPeriod(Date period);

	@Query("SELECT COUNT(m.itemId) FROM SuppliersItemHib m WHERE m.suppFk = ?1 AND m.period=?2")
	int itemIdCounWithPeriod(int suppFk, Date period);

	@Query("select m from SuppliersItemHib m where YEAR(m.period) =YEAR(?1) AND MONTH(m.period) = MONTH(?1) and supplierId=?2")
	List<SuppliersItemHib> findBySupplierIdAndPeriod(Date period, String supplierId);

	@Query("select m from SuppliersItemHib m where m.suppFk=?1 and m.period=?2")
	List<SuppliersItemHib> retriveBySupplierId(int supplierId, Date period);

	@Query(value = "SELECT DISTINCT su.Item_ID AS Item_ID,it.Item_Name AS Item_Name,su.package_id AS Package_Id,sp.supplier_id AS SupplierId, sp.supplier_name AS SupplierName,it.IP02, sd.GP,sd.STOCK_GP,sd.STOCK_CP,su.Last_Qtd_Price,su.Last_Purch_Price, ti.Unit_Price AS UnitBatchPrice,ti.expiry_date,ti.batch_no,ti.BIN_NUMBER FROM suppliersItem su LEFT JOIN suppdeldetail sd ON sd.Item_ID=su.Item_ID AND sd.package_id=su.package_id LEFT JOIN selectedsupplier se ON su.Item_ID = se.Item_ID AND su.package_id = se.package_id AND su.Entity_ID = se.Entity_ID LEFT JOIN  suppliers sp ON sp.supplier_id = se.supplier_id     AND sp.Entity_ID = se.Entity_ID LEFT JOIN item it ON it.item_Id = su.item_Id AND it.Entity_ID = su.Entity_ID  AND it.package_id = su.package_id LEFT JOIN traceitem ti ON it.item_id = ti.item_id  AND it.package_id = ti.package_id   AND it.entity_id = ti.entity_id  AND ti.remaining_Qty > 0 WHERE  su.supplier_id = ?1", nativeQuery = true)
	List<Object[]> itemListBySupplierId(String supplierId);

}
