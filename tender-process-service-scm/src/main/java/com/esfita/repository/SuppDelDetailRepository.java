package com.esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.SuppDelDetailHib;

public interface SuppDelDetailRepository extends JpaRepository<SuppDelDetailHib, Integer> {
//
	@Query("SELECT r from SuppDelDetailHib r WHERE r.grnId = ?1")
	List<SuppDelDetailHib> byGrnId(String grnId);

//	@Query("SELECT r from SuppDelDetailHib r WHERE r.grnId IN (SELECT m.grnId from SuppDelHeadHib m WHERE m.period BETWEEN ?1 AND ?2 AND m.supplierId = ?3)")
//	List<SuppDelDetailHib> betweenPeriodOld(Date from, Date to, String supId);
	
//
//	@Query("SELECT sdd FROM SuppDelDetailHib sdd " +
//		       "JOIN sdd.suppDelHead sdh " + // Using entity relationship instead of ON condition
//		       "WHERE sdh.period BETWEEN ?1 AND ?2 " +
//		       "AND sdh.supplierId = ?3")
//		List<SuppDelDetailHib> betweenPeriod(Date from, Date to, String supId);


}
