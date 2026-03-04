package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.PoHeadHib;

public interface PoHeadRepository extends JpaRepository<PoHeadHib, Integer> {

	@Query("SELECT r from PoHeadHib r WHERE r.poNum LIKE ?1")
	List<PoHeadHib> transactionNo(String ref);

	@Query("select m from PoHeadHib m order by poheadPk desc")
	List<PoHeadHib> orderBy();

	@Query("select m from PoHeadHib m WHERE poNum = ?1")
	PoHeadHib byPoNumber(String poNumber);

	@Query(
		    value = "SELECT * FROM pohead " +
		            "WHERE DATE_TRUNC('month', period) = DATE_TRUNC('month', CAST(:period AS DATE)) " +
		            "ORDER BY pohead_pk DESC",
		    nativeQuery = true
		)
		List<PoHeadHib> byPeriod(@Param("period") String period);




	@Query("select m from PoHeadHib m WHERE YEAR(period) = YEAR(?1) AND MONTH(period) = MONTH(?1) AND supplierId=?2 AND statusFk!=2 order by poheadPk desc")
	List<PoHeadHib> byPeriodAndStatusAndSupplierNot2(Date period, String supId);

	@Query(value = "SELECT supplier_id FROM pohead WHERE YEAR(PERIOD) = YEAR(?1) AND MONTH(PERIOD) = MONTH(?1) GROUP BY supplier_id", nativeQuery = true)
	List<String> getSupplierIdsByPODateMergerReport(Date monthYear);

}
