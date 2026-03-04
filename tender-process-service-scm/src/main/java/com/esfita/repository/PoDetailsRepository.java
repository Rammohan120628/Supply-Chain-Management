package com.esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.PoDetailHib;

public interface PoDetailsRepository extends JpaRepository<PoDetailHib, Integer> {

	@Query("SELECT r from PoDetailHib r WHERE r.poHeadFk = ?1")
	List<PoDetailHib> orderByHfk(int fk);

	@Query("SELECT r from PoDetailHib r WHERE r.poNum = ?1")
	List<PoDetailHib> byPoNumber(String poNumber);
	
	@Query("SELECT COALESCE(SUM(actualGp * qty),0) FROM PoDetailHib WHERE poNum = ?1")
	double totalCostByPoNumber(String po);

}
