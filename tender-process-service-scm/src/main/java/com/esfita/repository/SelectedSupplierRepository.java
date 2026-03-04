package com.esfita.repository;

import java.util.Date;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.SelectedSupplierHib;

import jakarta.transaction.Transactional;



public interface SelectedSupplierRepository extends JpaRepository<SelectedSupplierHib, Integer> {

	@Transactional
	@Modifying
	@Query("delete from SelectedSupplierHib m where m.consolidationId=?1")
	void deleteItem(String consolidationId);
	
	
	@Query("SELECT m FROM SelectedSupplierHib m WHERE m.consolidationId = ?1 AND m.itemId = ?2 AND m.supplierId = ?3 AND m.period = ?4")
	SelectedSupplierHib retriveBYConItemSuppl(String conId, int itemId, String oldSupplier, Date period);
	

	@Transactional
	@Modifying
	@Query("UPDATE SelectedSupplierHib r SET r.supplierId =?3 WHERE r.consolidationId = ?1 AND r.itemId=?2")
	void updateSupplier(String conId, int itemId, String newSupplier);
	
	@Transactional
	@Modifying
	@Query("delete from SelectedSupplierHib m WHERE m.consolidationId = ?1 AND m.itemId=?2 AND m.supplierId =?3")
	void deleteItemBy(String conId, int itemId, String oldSupplier);
	
	@Query(value = """
		    SELECT * FROM public.selectedsupplier 
		    WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(:period AS DATE))
		      AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(:period AS DATE))
		      AND item_id IN (:itemIds)
		""", nativeQuery = true)
		List<SelectedSupplierHib> findByPeriodAndItemIds(@Param("period") Date period, @Param("itemIds") Set<Integer> itemIds);
	
	
	@Query(value = """
		    SELECT supplier_id, item_id, period
		    FROM public.selectedsupplier
		    WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(:period AS DATE))
		      AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(:period AS DATE))
		      AND item_id = :itemId
		    """, nativeQuery = true)
		List<Object[]> findByPeriodAndItemIdByLocReqBulkUpload(
		        @Param("period") Date period,
		        @Param("itemId") Integer itemId);



	
	@Transactional
	@Modifying
	@Query(
	    value = """
	        DELETE FROM selectedsupplier
	        WHERE EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
	          AND EXTRACT(YEAR  FROM period) = EXTRACT(YEAR  FROM CAST(?1 AS DATE))
	        """,
	    nativeQuery = true
	)
	void deleteByPeriod(Date period);
	
	@Transactional
	@Modifying
	@Query(
	    value = """
	        INSERT INTO selectedsupplier (
	            ITEM_ID, PACKAGE_ID, PERIOD, CONSOLIDATION_ID, SUPPLIER_ID, CURRENCY_ID,
	            CURRENCY_RATE, GP, NP, AC01, AC02, AC03, AC04, NCT01, NCT02, NCT03, NCT04,
	            IS_PRICE_MAIL_SENT, IS_PRICE_CONFIRM, IS_ORDERED_BY_ZDP, ENTITY_ID, CREATED_BY,
	            CREATED_DATE, LAST_ACT_BY, LAST_ACT_DATE, S_DISCOUNT_PERC, S_NO_DAYS, S_OPER_REGION
	        )
	        SELECT
	            ITEM_ID, PACKAGE_ID, CAST(?2 AS DATE) AS PERIOD, CONSOLIDATION_ID, SUPPLIER_ID, CURRENCY_ID,
	            CURRENCY_RATE, GP, NP, AC01, AC02, AC03, AC04, NCT01, NCT02, NCT03, NCT04,
	            IS_PRICE_MAIL_SENT, IS_PRICE_CONFIRM, IS_ORDERED_BY_ZDP, ENTITY_ID, CREATED_BY,
	            CREATED_DATE, LAST_ACT_BY, LAST_ACT_DATE, S_DISCOUNT_PERC, S_NO_DAYS, S_OPER_REGION
	        FROM selectedsupplier
	        WHERE EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
	          AND EXTRACT(YEAR  FROM period) = EXTRACT(YEAR  FROM CAST(?1 AS DATE))
	        """,
	    nativeQuery = true
	)
	void copyDate(Date from, Date to);


	@Query("SELECT m FROM SelectedSupplierHib m WHERE m.consolidationId = ?1 AND m.itemId=?2 AND m.supplierId =?3")
	SelectedSupplierHib retriveBYConItemSuppl(String conId, int itemId, String oldSupplier);
	
	@Transactional
	@Modifying
	@Query("delete from SelectedSupplierHib m WHERE m.consolidationId = ?1 AND m.itemId=?2")
	void deleteItemByItemCon(String conId, int itemId);

	
	@Query("SELECT m FROM SelectedSupplierHib m WHERE m.consolidationId = ?1 AND m.itemId=?2")
	SelectedSupplierHib retriveBYConItem(String conId, int itemId);
	
	
	@Query("SELECT m FROM SelectedSupplierHib m " +
		       "WHERE m.consolidationId = ?1 " +
		       "AND m.itemId = ?2 " +
		       "AND FUNCTION('DATE', m.period) = FUNCTION('DATE', ?3)")
		SelectedSupplierHib retriveBYConItem(String conId, int itemId, Date period);
	
	@Query("SELECT m FROM SelectedSupplierHib m WHERE m.itemId=?1 AND m.supplierId =?2")
	List<SelectedSupplierHib> byItemAndSupplier(int itemId, String oldSupplier);
	
	@Query(value = 
		    "SELECT m " +
		    "FROM SelectedSupplierHib m " +
		    "WHERE m.itemId = ?1 " +
		    "AND m.supplierId = ?2 " +
		    "AND FUNCTION('DATE_PART', 'year', m.period) = FUNCTION('DATE_PART', 'year', CAST(?3 AS date)) " +
		    "AND FUNCTION('DATE_PART', 'month', m.period) = FUNCTION('DATE_PART', 'month', CAST(?3 AS date))"
		)
		List<SelectedSupplierHib> byItemAndSupplierPeriod(int itemId, String oldSupplier, Date period);

	
	@Query("SELECT m FROM SelectedSupplierHib m WHERE YEAR(m.period) = YEAR(?1) AND MONTH(m.period) = MONTH(?1)")
	List<SelectedSupplierHib> byPeriod(Date period);
	
	@Query("SELECT m FROM SelectedSupplierHib m WHERE YEAR(m.period) = YEAR(?1) AND MONTH(m.period) = MONTH(?1) AND m.itemId=?2")
	List<SelectedSupplierHib> byPeriodAndItemId(Date period,int itemId);
	
	@Query("SELECT m FROM SelectedSupplierHib m WHERE m.itemId=?1")
	SelectedSupplierHib retriveBYItem(int itemId);
	
	@Query(value = 
		       "SELECT * FROM selectedsupplier s " +
		       "WHERE s.item_id = :itemId " +
		       "AND EXTRACT(YEAR FROM s.period) = EXTRACT(YEAR FROM CAST(:period AS date)) " +
		       "AND EXTRACT(MONTH FROM s.period) = EXTRACT(MONTH FROM CAST(:period AS date)) " +
		       "AND s.supplier_id = :supplierId",
		       nativeQuery = true)
		SelectedSupplierHib retriveBYItembyPeriod(
		        @Param("itemId") int itemId,
		        @Param("period") Date period,
		        @Param("supplierId") String supplierId);
	
	@Query("SELECT m FROM SelectedSupplierHib m WHERE m.itemId=?1")
	List<SelectedSupplierHib> retriveBYItemList(int itemId);

}
