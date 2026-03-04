package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.esfita.entity.QuotationRequestDetailHib;

import jakarta.transaction.Transactional;

public interface QuotationRequestDetailRepository extends JpaRepository<QuotationRequestDetailHib, Integer> {

    // Basic fetch
    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = ?1")
    List<QuotationRequestDetailHib> findId(int headPk);

    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = ?1 AND m.deliveryMode = ?2")
    List<QuotationRequestDetailHib> findByHeadPkAndDeliveryMode(int headPk, String deliveryMode);

//    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqNo = ?1")
//    List<QuotationRequestDetailHib> findByReqNo(String reqNo);

    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqNo = ?1 AND m.supplierId = ?2")
    List<QuotationRequestDetailHib> findByReqNoAndSupplierId(String reqNo, String supplierId);

    // ✅ PostgreSQL-compatible: extract day
    @Query(value = "SELECT EXTRACT(DAY FROM request_date) FROM req_detail WHERE req_no = :reqNo GROUP BY request_date", nativeQuery = true)
    List<Integer> findDistinctDaysByReqNo(@Param("reqNo") String reqNo);

    // ✅ Grouping and filtering
    @Query("SELECT m FROM QuotationRequestDetailHib m " +
 	       "WHERE m.reqHeadFk = :headPk AND m.reqDetailPk IN (" +
 	       "    SELECT MAX(sub.reqDetailPk) " +
 	       "    FROM QuotationRequestDetailHib sub " +
 	       "    WHERE sub.reqHeadFk = :headPk " +
 	       "    GROUP BY sub.requestDate" +
 	       ") " +
 	       "ORDER BY m.requestDate")
 	List<QuotationRequestDetailHib> groupByRequestDate(@Param("headPk") int headPk);

    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = ?1 AND m.requestDate = ?2 GROUP BY m.supplierId")
    List<QuotationRequestDetailHib> groupByHeadPkAndDate(int headPk, Date date);

    @Query("SELECT m FROM QuotationRequestDetailHib m " +
 	       "WHERE m.reqHeadFk = :headPk " +
 	       "AND m.requestDate = :date " +
 	       "AND m.deliveryMode = :deliveryMode " +
 	       "AND m.reqDetailPk IN (" +
 	       "    SELECT MAX(sub.reqDetailPk) " +
 	       "    FROM QuotationRequestDetailHib sub " +
 	       "    WHERE sub.reqHeadFk = :headPk " +
 	       "      AND sub.requestDate = :date " +
 	       "      AND sub.deliveryMode = :deliveryMode " +
 	       "    GROUP BY sub.supplierId" +
 	       ") " +
 	       "ORDER BY m.supplierId")
 	List<QuotationRequestDetailHib> groupByHeadPkDateAndDeliveryType(
 	        @Param("headPk") int headPk,
 	        @Param("date") Date date,
 	        @Param("deliveryMode") String deliveryMode);

    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = ?1 AND m.requestDate = ?2 AND m.supplierId = ?3")
    List<QuotationRequestDetailHib> findByHeadPkDateAndSupplier(int headPk, Date date, String supplierId);

    
//    @Query("SELECT d FROM QuotationRequestDetailHib d WHERE d.reqHeadPk IN :headerIds")
//	List<QuotationRequestDetailHib> findAllByHeaderIds(@Param("headerIds") List<Integer> headerIds);
    
    // ✅ Fixed native query for PostgreSQL
//    @Query(value = """
//            SELECT * FROM req_detail rdn
//            WHERE rdn.req_head2_fk IN (
//                SELECT rh.req_head2_pk FROM req_head_new rh
//                WHERE rh.period = :period AND rh.status_fk = 0
//            )
//            GROUP BY rdn.supplier_id, rdn.req_detail2_pk
//            """, nativeQuery = true)
//    List<QuotationRequestDetailHib> findGroupedBySupplierId(@Param("period") Date period);

    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqNo = ?1 GROUP BY m.supplierId")
    List<QuotationRequestDetailHib> findGroupedByReqNo(String reqNo);

    @Query("SELECT COUNT(m.itemId) FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = ?1")
    int countItemsByHeadPk(int headPk);

    @Transactional
    @Modifying
    @Query("DELETE FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = ?1")
    void deleteByHeadPk(int headerPk);

    // ✅ sumQty by itemId for PostgreSQL (native)
    @Query(value = "SELECT COALESCE(SUM(qty),0) FROM req_detail WHERE item_id = :itemId", nativeQuery = true)
    int totalItemCount(@Param("itemId") int itemId);

    // ✅ distinct item IDs
    @Query("SELECT DISTINCT m.itemId FROM QuotationRequestDetailHib m")
    List<Integer> findDistinctItemIds();

    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.itemId = ?1 AND m.requestDate = ?2")
    List<QuotationRequestDetailHib> findByItemIdAndRequestDate(int itemId, Date reqDate);

    // ✅ use PostgreSQL extract
    @Query(value = "SELECT COALESCE(SUM(qty),0) FROM req_detail WHERE item_id = :itemId AND EXTRACT(YEAR FROM request_date) = :year AND EXTRACT(MONTH FROM request_date) = :month AND status_fk = 0", nativeQuery = true)
    int sumQtyByItemIdAndYearAndMonth(@Param("itemId") int itemId, @Param("year") int year, @Param("month") int month);

    @Query(value = "SELECT * FROM req_detail WHERE EXTRACT(YEAR FROM request_date) = :year AND EXTRACT(MONTH FROM request_date) = :month", nativeQuery = true)
    List<QuotationRequestDetailHib> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Transactional
    @Modifying
    @Query("UPDATE QuotationRequestDetailHib r SET r.statusFk = 1 WHERE r.reqHeadFk = ?1 AND r.itemId = ?2")
    void updateStatusTo1(int headFk, int itemId);

    @Transactional
    @Modifying
    @Query("UPDATE QuotationRequestDetailHib r SET r.statusFk = 2 WHERE r.reqHeadFk = ?1 AND r.itemId = ?2")
    void updateStatusTo2(int headFk, int itemId);

    @Transactional
    @Modifying
    @Query("DELETE FROM QuotationRequestDetailHib m WHERE m.reqNo = ?1")
    void deleteByReqNo(String reqTransactionNo);

    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = ?1 ORDER BY m.itemId")
    List<QuotationRequestDetailHib> findByHeadPkOrderByItemId(int reqHeadFk);
    
    @Query("SELECT d FROM QuotationRequestDetailHib d WHERE d.reqHeadFk IN :reqHeadIds")
    List<QuotationRequestDetailHib> findByReqHeadIds(@Param("reqHeadIds") List<Integer> reqHeadIds);
    
    @Query("SELECT d FROM QuotationRequestDetailHib d WHERE d.reqNo = :reqNo")
    List<QuotationRequestDetailHib> findByReqNo(@Param("reqNo") String reqNo);
    
    @Query("SELECT m FROM QuotationRequestDetailHib m WHERE m.reqHeadFk = :reqHeadFK ORDER BY m.itemId")
    List<QuotationRequestDetailHib> getreqDetailList(@Param("reqHeadFK") int reqHeadFK);
    
    
    @Transactional
    @Modifying
    @Query("DELETE FROM QuotationRequestDetailHib m WHERE m.reqNo = ?1")
    void deleteAlreadyExistData(String reqTransactionNo);
    
    @Query(
    	    value = "SELECT DISTINCT ON (supplier_id) * " +
    	            "FROM req_detail " +
    	            "WHERE req_no = ?1 " +
    	            "ORDER BY supplier_id",
    	    nativeQuery = true
    	)
    	List<QuotationRequestDetailHib> byReqNoGroup(String reqNo);

    @Query(
    	    value = "SELECT * " +
    	            "FROM req_detail " +
    	            "WHERE req_no = ?1 " +
    	            "AND supplier_id = ?2",
    	    nativeQuery = true
    	)
    	List<QuotationRequestDetailHib> bySuppIdReqNo(String reqNo, String supId);
    
    
    
    @Query(
    	    value = "SELECT " +
    	            "MAX(req_detail_pk1) AS req_detail_pk1, " +
    	            "item_id, " +
    	            "MAX(req_head_fk1) AS req_head_fk1, " +
    	            "MAX(req_no) AS req_no, " +
    	            "MAX(package_id) AS package_id, " +
    	            "MAX(request_date) AS request_date, " +
    	            "MAX(ent_order) AS ent_order, " +
    	            "MAX(qty) AS qty, " +
    	            "MAX(supplier_id) AS supplier_id, " +
    	            "MAX(supp_del_date) AS supp_del_date, " +
    	            "MAX(cwh_del_date) AS cwh_del_date, " +
    	            "MAX(del_loc_id) AS del_loc_id, " +
    	            "MAX(entity_id) AS entity_id, " +
    	            "MAX(delivery_mode) AS delivery_mode, " +
    	            "MAX(status_fk) AS status_fk " +
    	            "FROM req_detail " +
    	            "WHERE EXTRACT(YEAR FROM request_date) = EXTRACT(YEAR FROM CAST(:period AS DATE)) " +
    	            "AND EXTRACT(MONTH FROM request_date) = EXTRACT(MONTH FROM CAST(:period AS DATE)) " +
    	            "AND status_fk = 0 " +
    	            "GROUP BY item_id",
    	    nativeQuery = true
    	)
    	List<QuotationRequestDetailHib> retriveDate(@Param("period") Date period);

    
    
    @Query(
    	    value = "SELECT * FROM req_detail " +
    	            "WHERE EXTRACT(YEAR FROM request_date) = EXTRACT(YEAR FROM CAST(:yearDate AS DATE)) " +
    	            "AND EXTRACT(MONTH FROM request_date) = EXTRACT(MONTH FROM CAST(:yearDate AS DATE)) " +
    	            "AND item_id = :itemId " +
    	            "AND status_fk = 0",
    	    nativeQuery = true
    	)
    	List<QuotationRequestDetailHib> retriveByPeriodItemIdStatusFk(
    	        @Param("yearDate") Date yearDate,
    	        @Param("itemId") int itemId
    	);
    
    
    @Transactional
   	@Modifying
   	@Query("UPDATE QuotationRequestDetailHib r SET r.statusFk =2 WHERE r.reqHeadFk = ?1 AND  r.itemId = ?2")
   	void updateStatusFkQtProcess(int headFk, int itemId); 

}
