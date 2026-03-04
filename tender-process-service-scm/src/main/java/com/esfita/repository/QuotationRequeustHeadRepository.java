package com.esfita.repository;

import java.util.Date;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.QuotationRequeustHeadHib;

import jakarta.transaction.Transactional;

public interface QuotationRequeustHeadRepository extends JpaRepository<QuotationRequeustHeadHib, Integer> {

	@Query("SELECT r FROM QuotationRequeustHeadHib r WHERE r.reqNo LIKE :ref")
	List<QuotationRequeustHeadHib> transactionNo(@Param("ref") String ref);

	@Query("select m from QuotationRequeustHeadHib m order by reqHeadPk desc")
	List<QuotationRequeustHeadHib> orderBy();

	@Query(
			  value = "SELECT * FROM req_head m " +
			          "WHERE EXTRACT(YEAR FROM CAST(m.period AS date)) = EXTRACT(YEAR FROM CAST(:monthYear AS date)) " +
			          "AND EXTRACT(MONTH FROM CAST(m.period AS date)) = EXTRACT(MONTH FROM CAST(:monthYear AS date)) " +
			          "AND m.status_fk = 0",
			  nativeQuery = true
			)
			List<QuotationRequeustHeadHib> byPeriodAndStatus0(@Param("monthYear") Date monthYear);


	@Query("select m from QuotationRequeustHeadHib m where m.locationId=?1")
	List<QuotationRequeustHeadHib> retriveByLocationId(String locationId);

	@Query("select m from QuotationRequeustHeadHib m where reqNo=?1")
	QuotationRequeustHeadHib findtransactionNo(String transactionNo);

	@Query("select m from QuotationRequeustHeadHib m where m.locationId=?1")
	QuotationRequeustHeadHib headerDetail(String locationId);

	@Query("select m from QuotationRequeustHeadHib m where YEAR(m.period)=YEAR(?2) AND MONTH(m.period)=MONTH(?2) AND m.locationId=?1")
	QuotationRequeustHeadHib headerDetailByLocationIdAndperiod(String locationId, Date period);

	@Query("select m from QuotationRequeustHeadHib m where m.reqNo=?1")
	List<QuotationRequeustHeadHib> retriveByReqNo(String reqNo);

	@Transactional
	@Modifying
	@Query("UPDATE QuotationRequeustHeadHib r SET r.statusFk =2 WHERE r.conId = ?1")
	void updateStatusFk(String conId);

	@Transactional
	@Modifying
	@Query("UPDATE QuotationRequeustHeadHib r SET r.statusFk =2 WHERE r.conId = ?1")
	void updateStatusFk2(String conId);

	@Transactional
	@Modifying
	@Query("UPDATE QuotationRequeustHeadHib r SET r.statusFk =3 WHERE r.conId = ?1")
	void updateStatusFk3(String conId);

	@Query("select m from QuotationRequeustHeadHib m where conId=?1 AND statusFk=1")
	List<QuotationRequeustHeadHib> findByConsolidationId(String conId);

	@Query("select m from QuotationRequeustHeadHib m where statusFk=0")
	List<QuotationRequeustHeadHib> findByStat0();

	@Query("select m from QuotationRequeustHeadHib m where conId=?1")
	List<QuotationRequeustHeadHib> findByConsolidationIdStatNothing(String conId);

	@Query(value = """
		    SELECT * FROM public.req_head 
		    WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(:monthYear AS DATE))
		      AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(:monthYear AS DATE))
		      AND status_fk NOT IN (3,4)
		""", nativeQuery = true)
		List<QuotationRequeustHeadHib> retriveByperiodBasedLocId(@Param("monthYear") Date monthYear);


	@Query(
		    value = "SELECT * " +
		            "FROM req_head " +
		            "WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(?1 AS DATE)) " +
		            "AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(?1 AS DATE)) " +
		            "AND status_fk = 0",
		    nativeQuery = true
		)
		List<QuotationRequeustHeadHib> retriveByPeriodBasedLocId0(Date monthYear);

	@Query("select m from QuotationRequeustHeadHib m where MONTH(m.period) = MONTH(?1) AND YEAR(m.period) = YEAR(?1)")
	List<QuotationRequeustHeadHib> activeLocations(Date period);

	@Query(
			  value = "SELECT * FROM public.req_head " +
			          "WHERE EXTRACT(YEAR FROM period) = EXTRACT(YEAR FROM CAST(:period AS DATE)) " +
			          "AND EXTRACT(MONTH FROM period) = EXTRACT(MONTH FROM CAST(:period AS DATE)) " +
			          "ORDER BY req_head_pk DESC",
			  nativeQuery = true
			)
			List<QuotationRequeustHeadHib> orderByPeriod(@Param("period") Date period);
	
	@Transactional
	
	@Query(value = "SELECT lr " +
	        "FROM QuotationRequeustHeadHib lr " +
	        "WHERE FUNCTION('DATE_PART', 'year', lr.period) = :year " +
	        "AND FUNCTION('DATE_PART', 'month', lr.period) = :month " +
	        "ORDER BY lr.reqHeadPk DESC")
	Stream<QuotationRequeustHeadHib> streamByPeriod(@Param("year") int year, @Param("month") int month);



	@Query("select m from QuotationRequeustHeadHib m where reqNo=?1")
	QuotationRequeustHeadHib getHeadBasedOnReqNo(String reqTransactionNo);

	
	@Query(
    	    value = "SELECT DISTINCT ON (supplier_id) * " +
    	            "FROM req_detail_new " +
    	            "WHERE req_no = ?1 " +
    	            "ORDER BY supplier_id",
    	    nativeQuery = true
    	)
    	List<QuotationRequeustHeadHib> byReqNoGroup(String reqNo);

    @Query(
    	    value = "SELECT * " +
    	            "FROM req_detail_new " +
    	            "WHERE req_no = ?1 " +
    	            "AND supplier_id = ?2",
    	    nativeQuery = true
    	)
    	List<QuotationRequeustHeadHib> bySuppIdReqNo(String reqNo, String supId);
    
    @Query("SELECT h FROM QuotationRequeustHeadHib h WHERE h.reqHeadPk = :id")
    QuotationRequeustHeadHib findByHeadPk(@Param("id") int id);
}
