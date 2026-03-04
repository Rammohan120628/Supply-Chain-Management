package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.LocationRequestDetailHib;

import jakarta.transaction.Transactional;

public interface LocationRequestDetailRepository extends JpaRepository<LocationRequestDetailHib, Integer> {

    // Basic fetch
    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqHeadFk = ?1")
    List<LocationRequestDetailHib> findId(int headPk);

    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqHeadFk = ?1 AND m.deliveryMode = ?2")
    List<LocationRequestDetailHib> findByHeadPkAndDeliveryMode(int headPk, String deliveryMode);

//    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqNo = ?1")
//    List<LocationRequestDetailHib> findByReqNo(String reqNo);

    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqNo = ?1 AND m.supplierId = ?2")
    List<LocationRequestDetailHib> findByReqNoAndSupplierId(String reqNo, String supplierId);

    // ✅ PostgreSQL-compatible: extract day
    @Query(value = "SELECT EXTRACT(DAY FROM request_date) FROM req_detail_new WHERE req_no = :reqNo GROUP BY request_date", nativeQuery = true)
    List<Integer> findDistinctDaysByReqNo(@Param("reqNo") String reqNo);

    // ✅ Grouping and filtering
    @Query("SELECT m FROM LocationRequestDetailHib m " +
 	       "WHERE m.reqHeadFk = :headPk AND m.reqDetailPk IN (" +
 	       "    SELECT MAX(sub.reqDetailPk) " +
 	       "    FROM LocationRequestDetailHib sub " +
 	       "    WHERE sub.reqHeadFk = :headPk " +
 	       "    GROUP BY sub.requestDate" +
 	       ") " +
 	       "ORDER BY m.requestDate")
 	List<LocationRequestDetailHib> groupByRequestDate(@Param("headPk") int headPk);

    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqHeadFk = ?1 AND m.requestDate = ?2 GROUP BY m.supplierId")
    List<LocationRequestDetailHib> groupByHeadPkAndDate(int headPk, Date date);

    @Query("SELECT m FROM LocationRequestDetailHib m " +
 	       "WHERE m.reqHeadFk = :headPk " +
 	       "AND m.requestDate = :date " +
 	       "AND m.deliveryMode = :deliveryMode " +
 	       "AND m.reqDetailPk IN (" +
 	       "    SELECT MAX(sub.reqDetailPk) " +
 	       "    FROM LocationRequestDetailHib sub " +
 	       "    WHERE sub.reqHeadFk = :headPk " +
 	       "      AND sub.requestDate = :date " +
 	       "      AND sub.deliveryMode = :deliveryMode " +
 	       "    GROUP BY sub.supplierId" +
 	       ") " +
 	       "ORDER BY m.supplierId")
 	List<LocationRequestDetailHib> groupByHeadPkDateAndDeliveryType(
 	        @Param("headPk") int headPk,
 	        @Param("date") Date date,
 	        @Param("deliveryMode") String deliveryMode);

    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqHeadFk = ?1 AND m.requestDate = ?2 AND m.supplierId = ?3")
    List<LocationRequestDetailHib> findByHeadPkDateAndSupplier(int headPk, Date date, String supplierId);

    
//    @Query("SELECT d FROM LocationRequestDetailHib d WHERE d.reqHeadPk IN :headerIds")
//	List<LocationRequestDetailHib> findAllByHeaderIds(@Param("headerIds") List<Integer> headerIds);
    
    // ✅ Fixed native query for PostgreSQL
//    @Query(value = """
//            SELECT * FROM req_detail_new rdn
//            WHERE rdn.req_head2_fk IN (
//                SELECT rh.req_head2_pk FROM req_head_new rh
//                WHERE rh.period = :period AND rh.status_fk = 0
//            )
//            GROUP BY rdn.supplier_id, rdn.req_detail2_pk
//            """, nativeQuery = true)
//    List<LocationRequestDetailHib> findGroupedBySupplierId(@Param("period") Date period);

    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqNo = ?1 GROUP BY m.supplierId")
    List<LocationRequestDetailHib> findGroupedByReqNo(String reqNo);

    @Query("SELECT COUNT(m.itemId) FROM LocationRequestDetailHib m WHERE m.reqHeadFk = ?1")
    int countItemsByHeadPk(int headPk);

    @Transactional
    @Modifying
    @Query("DELETE FROM LocationRequestDetailHib m WHERE m.reqHeadFk = ?1")
    void deleteByHeadPk(int headerPk);

    // ✅ sumQty by itemId for PostgreSQL (native)
    @Query(value = "SELECT COALESCE(SUM(qty),0) FROM req_detail_new WHERE item_id = :itemId", nativeQuery = true)
    int totalItemCount(@Param("itemId") int itemId);

    // ✅ distinct item IDs
    @Query("SELECT DISTINCT m.itemId FROM LocationRequestDetailHib m")
    List<Integer> findDistinctItemIds();

    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.itemId = ?1 AND m.requestDate = ?2")
    List<LocationRequestDetailHib> findByItemIdAndRequestDate(int itemId, Date reqDate);

    // ✅ use PostgreSQL extract
    @Query(value = "SELECT COALESCE(SUM(qty),0) FROM req_detail_new WHERE item_id = :itemId AND EXTRACT(YEAR FROM request_date) = :year AND EXTRACT(MONTH FROM request_date) = :month AND status_fk = 0", nativeQuery = true)
    int sumQtyByItemIdAndYearAndMonth(@Param("itemId") int itemId, @Param("year") int year, @Param("month") int month);

    @Query(value = "SELECT * FROM req_detail_new WHERE EXTRACT(YEAR FROM request_date) = :year AND EXTRACT(MONTH FROM request_date) = :month", nativeQuery = true)
    List<LocationRequestDetailHib> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Transactional
    @Modifying
    @Query("UPDATE LocationRequestDetailHib r SET r.statusFk = 1 WHERE r.reqHeadFk = ?1 AND r.itemId = ?2")
    void updateStatusTo1(int headFk, int itemId);

    @Transactional
    @Modifying
    @Query("UPDATE LocationRequestDetailHib r SET r.statusFk = 2 WHERE r.reqHeadFk = ?1 AND r.itemId = ?2")
    void updateStatusTo2(int headFk, int itemId);

    @Transactional
    @Modifying
    @Query("DELETE FROM LocationRequestDetailHib m WHERE m.reqNo = ?1")
    void deleteByReqNo(String reqTransactionNo);

    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqHeadFk = ?1 ORDER BY m.itemId")
    List<LocationRequestDetailHib> findByHeadPkOrderByItemId(int reqHeadFk);
    
    @Query("SELECT d FROM LocationRequestDetailHib d WHERE d.reqHeadFk IN :reqHeadIds")
    List<LocationRequestDetailHib> findByReqHeadIds(@Param("reqHeadIds") List<Integer> reqHeadIds);
    
    @Query("SELECT d FROM LocationRequestDetailHib d WHERE d.reqNo = :reqNo")
    List<LocationRequestDetailHib> findByReqNo(@Param("reqNo") String reqNo);
    
    @Query("SELECT m FROM LocationRequestDetailHib m WHERE m.reqHeadFk = :reqHeadFK ORDER BY m.itemId")
    List<LocationRequestDetailHib> getreqDetailList(@Param("reqHeadFK") int reqHeadFK);
    
    
    @Transactional
    @Modifying
    @Query("DELETE FROM LocationRequestDetailHib m WHERE m.reqNo = ?1")
    void deleteAlreadyExistData(String reqTransactionNo);
    
    @Query(
    	    value = "SELECT DISTINCT ON (supplier_id) * " +
    	            "FROM req_detail_new " +
    	            "WHERE req_no = ?1 " +
    	            "ORDER BY supplier_id",
    	    nativeQuery = true
    	)
    	List<LocationRequestDetailHib> byReqNoGroup(String reqNo);

    @Query(
    	    value = "SELECT * " +
    	            "FROM req_detail_new " +
    	            "WHERE req_no = ?1 " +
    	            "AND supplier_id = ?2",
    	    nativeQuery = true
    	)
    	List<LocationRequestDetailHib> bySuppIdReqNo(String reqNo, String supId);

}
