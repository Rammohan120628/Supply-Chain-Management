package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.esfita.entity.ConsolidationLocationRequestHib;

import jakarta.transaction.Transactional;

@Repository
public interface ConsolidationLocationRequestRepository
		extends JpaRepository<ConsolidationLocationRequestHib, Integer> {

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE r.consolidationId LIKE ?1")
	List<ConsolidationLocationRequestHib> transactionNo(String ref);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1)")
	List<ConsolidationLocationRequestHib> retrieveDate(Date yearDate);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1) AND r.statusFk = 0 GROUP BY r.consolidationId ORDER BY r.consLocReqPk DESC")
	List<ConsolidationLocationRequestHib> retrieveByDateAndStatus(Date yearDate);
	
	
	
	
	
	
	@Query(value = """
		    SELECT DISTINCT r.consolidation_id
		    FROM consolidation_location_request r
		    WHERE EXTRACT(YEAR FROM r.period) = EXTRACT(YEAR FROM CAST(:dateParam AS DATE))
		      AND EXTRACT(MONTH FROM r.period) = EXTRACT(MONTH FROM CAST(:dateParam AS DATE))
		      AND r.status_fk = 1
		    ORDER BY r.consolidation_id DESC
		    """, nativeQuery = true)
		List<String> retriveConsolidateIdsByDateAndStatus1(@Param("dateParam") Date dateParam);

	
	
	
	
	
	
	
	@Query(value = "SELECT " + "    clr1.item_id, " + "    clr1.item_name, " + "    clr1.package_id, "
			+ "    COALESCE(clr2.sup_id, '') AS sup_id, " + "    COALESCE(clr2.gross_price, 0) AS gross_price, "
			+ "    COALESCE(s.supplier_name, '') AS sup_name " + "FROM consolidation_location_request clr1 "
			+ "LEFT JOIN consolidation_location_request clr2 " + "       ON clr1.item_id = clr2.item_id "
			+ "      AND clr2.consolidation_id = ?2 " + "LEFT JOIN suppliers s "
			+ "       ON clr2.sup_id = s.supplier_id " + "WHERE clr1.consolidation_id = ?1 "
			+ "  AND clr1.item_id = ?3", nativeQuery = true)
	Object[] byConsolidationIdandItemIdNew(String consolidationId, String oldConsolidationId, int itemId);

	@Query(value = "SELECT * FROM consolidation_location_request r "
			+ "WHERE EXTRACT(YEAR FROM r.period) = EXTRACT(YEAR FROM CAST(:monthYear AS DATE)) "
			+ "AND EXTRACT(MONTH FROM r.period) = EXTRACT(MONTH FROM CAST(:monthYear AS DATE)) "
			+ "AND r.status_fk <> 0 "
			+ "GROUP BY r.consolidation_id, r.cons_loc_req_pk, r.period, r.item_id, r.item_name, "
			+ "r.package_id, r.grand_total, r.sup_id, r.gross_price, r.net_price, "
			+ "r.status_fk, r.created_by, r.created_date, r.last_act_by, r.last_act_date", nativeQuery = true)
	List<ConsolidationLocationRequestHib> retrivePeriodBasedConsolidationIdStatusNot0(
			@Param("monthYear") Date monthYear);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1) AND r.statusFk = 1 GROUP BY r.consolidationId ORDER BY r.consLocReqPk DESC")
	List<ConsolidationLocationRequestHib> retrieveByDateAndStatus1(Date yearDate);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1) AND r.statusFk = 2 GROUP BY r.consolidationId ORDER BY r.consLocReqPk DESC")
	List<ConsolidationLocationRequestHib> retrieveByDateAndStatus2(Date yearDate);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE r.consolidationId = ?1 AND r.statusFk = 0")
	List<ConsolidationLocationRequestHib> byConsolidationId(String conId);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE r.consolidationId = ?1")
	List<ConsolidationLocationRequestHib> byConsolidationIdSingle(String conId);

	@Query(value = """
			SELECT
			    clr1.ITEM_ID,
			    clr1.ITEM_NAME,
			    clr1.PACKAGE_ID,
			    COALESCE(clr2.SUP_ID, '') AS SUP_ID,
			    COALESCE(clr2.GROSS_PRICE, 0) AS GROSS_PRICE,
			    COALESCE(s.Supplier_Name, '') AS SUP_NAME
			FROM consolidation_location_request clr1
			LEFT JOIN consolidation_location_request clr2
			    ON clr1.ITEM_ID = clr2.ITEM_ID
			    AND clr2.CONSOLIDATION_ID = ?2
			LEFT JOIN suppliers s
			    ON clr2.SUP_ID = s.Supplier_ID
			WHERE clr1.CONSOLIDATION_ID = ?1
			ORDER BY clr1.ITEM_ID ASC
			""", nativeQuery = true)
	List<Object[]> byConsolidationIdSingleNew(String conId, String oldConId);

	@Query(value = """
			SELECT CONSOLIDATION_ID
			FROM (
			    SELECT CONSOLIDATION_ID
			    FROM consolidation_location_request
			    GROUP BY CONSOLIDATION_ID
			    ORDER BY CONSOLIDATION_ID DESC
			    LIMIT 2
			) AS subquery
			ORDER BY CONSOLIDATION_ID ASC
			LIMIT 1
			""", nativeQuery = true)
	String findSecondLastConsolidationId();

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE r.consolidationId = ?1 AND r.itemId = ?2")
	ConsolidationLocationRequestHib byConsolidationIdAndItemId(String conId, int itemId);

	@Query(value = """
			SELECT
			    clr1.ITEM_ID,
			    clr1.ITEM_NAME,
			    clr1.PACKAGE_ID,
			    COALESCE(clr2.SUP_ID, '') AS SUP_ID,
			    COALESCE(clr2.GROSS_PRICE, 0) AS GROSS_PRICE,
			    COALESCE(s.Supplier_Name, '') AS SUP_NAME
			FROM consolidation_location_request clr1
			LEFT JOIN consolidation_location_request clr2
			    ON clr1.ITEM_ID = clr2.ITEM_ID
			    AND clr2.CONSOLIDATION_ID = ?2
			LEFT JOIN suppliers s
			    ON clr2.SUP_ID = s.Supplier_ID
			WHERE clr1.CONSOLIDATION_ID = ?1
			AND clr1.ITEM_ID = ?3
			""", nativeQuery = true)
	Object[] byConsolidationIdAndItemIdNew(String conId, String oldConId, int itemId);

	@Transactional
	@Modifying
	@Query("UPDATE ConsolidationLocationRequestHib r SET r.statusFk = 1 WHERE r.consolidationId = ?1 AND r.itemId = ?2")
	void updateStatusFk(String conId, int itemId);

	@Transactional
	@Modifying
	@Query("UPDATE ConsolidationLocationRequestHib r SET r.statusFk = 3 WHERE r.consolidationId = ?1")
	void updateStatusFk3(String conId);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1) GROUP BY r.consolidationId")
	List<ConsolidationLocationRequestHib> retrievePeriodBasedConsolidationId(Date monthYear);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE YEAR(r.period) = YEAR(?1) AND MONTH(r.period) = MONTH(?1) AND r.statusFk != 0 GROUP BY r.consolidationId")
	List<ConsolidationLocationRequestHib> retrievePeriodBasedConsolidationIdStatusNot0(Date monthYear);

	@Query("SELECT r FROM ConsolidationLocationRequestHib r WHERE r.consolidationId = ?1")
	List<ConsolidationLocationRequestHib> byConsolidationIdsSingle(String conId);

	@Query(value = "SELECT * FROM public.consolidation_location_request m "
			+ "WHERE EXTRACT(YEAR FROM CAST(m.period AS timestamp)) = EXTRACT(YEAR FROM CAST(:monthYear AS timestamp)) "
			+ "AND EXTRACT(MONTH FROM CAST(m.period AS timestamp)) = EXTRACT(MONTH FROM CAST(:monthYear AS timestamp))", nativeQuery = true)
	List<ConsolidationLocationRequestHib> retrivePeriodBasedConsolidationId(@Param("monthYear") Date monthYear);

	@Query("select r from ConsolidationLocationRequestHib r where r.consolidationId = ?1 AND r.itemId = ?2")
	ConsolidationLocationRequestHib byConsolidationIdandItemId(String conid, int itemId);

	@Query(value = "SELECT " + "MAX(cons_loc_req_pk) AS cons_loc_req_pk, " + "consolidation_id, "
			+ "MAX(period) AS period, " + "MAX(item_id) AS item_id, " + "MAX(item_name) AS item_name, "
			+ "MAX(package_id) AS package_id, " + "MAX(grand_total) AS grand_total, " + "MAX(sup_id) AS sup_id, "
			+ "MAX(gross_price) AS gross_price, " + "MAX(net_price) AS net_price, " + "MAX(status_fk) AS status_fk, "
			+ "MAX(created_by) AS created_by, " + "MAX(created_date) AS created_date, "
			+ "MAX(last_act_by) AS last_act_by, " + "MAX(last_act_date) AS last_act_date "
			+ "FROM consolidation_location_request "
			+ "WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(:period AS DATE)) "
			+ "AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(:period AS DATE)) "
			+ "GROUP BY consolidation_id " + "ORDER BY consolidation_id DESC", nativeQuery = true)
	List<ConsolidationLocationRequestHib> orderByPeriodGroupByConsolidationId(@Param("period") Date period);

	@Query(value = """
		    SELECT DISTINCT ON (r.consolidation_id)
		           r.*
		    FROM consolidation_location_request r
		    WHERE EXTRACT(YEAR FROM r.period) = EXTRACT(YEAR FROM CAST(:yearDate AS DATE))
		      AND EXTRACT(MONTH FROM r.period) = EXTRACT(MONTH FROM CAST(:yearDate AS DATE))
		      AND r.status_fk = 0
		    ORDER BY r.consolidation_id, r.cons_loc_req_pk DESC
		""", nativeQuery = true)
		List<ConsolidationLocationRequestHib>
		retriveByDateAndStatus(@Param("yearDate") Date yearDate);

	
	@Query(
		    value = "SELECT " +
		            "MAX(cons_loc_req_pk) AS cons_loc_req_pk, " +
		            "consolidation_id, " +
		            "MAX(period) AS period, " +
		            "MAX(item_id) AS item_id, " +
		            "MAX(item_name) AS item_name, " +
		            "MAX(package_id) AS package_id, " +
		            "MAX(grand_total) AS grand_total, " +
		            "MAX(sup_id) AS sup_id, " +
		            "MAX(gross_price) AS gross_price, " +
		            "MAX(net_price) AS net_price, " +
		            "MAX(status_fk) AS status_fk, " +
		            "MAX(created_by) AS created_by, " +
		            "MAX(created_date) AS created_date, " +
		            "MAX(last_act_by) AS last_act_by, " +
		            "MAX(last_act_date) AS last_act_date " +
		            "FROM consolidation_location_request " +
		            "WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(:period AS DATE)) " +
		            "AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(:period AS DATE)) " +
		            "AND status_fk != 0 " +
		            "GROUP BY consolidation_id " +
		            "ORDER BY consolidation_id DESC",
		    nativeQuery = true
		)
		List<ConsolidationLocationRequestHib> retriveByDateAndStatusNot0(@Param("period") Date period);

}
