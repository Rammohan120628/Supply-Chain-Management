package com.esfita.repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.SuppliersHib;


public interface SuppliersRepository extends JpaRepository<SuppliersHib, Integer> {

	@Query("select m from SuppliersHib m order by supplierPk asc")
	List<SuppliersHib> orderBy();

	@Query("select m from SuppliersHib m where supplierId=?1")
	SuppliersHib findName(String supplierId);
	
	@Query("select m from SuppliersHib m where m.isActive=1")
	List<SuppliersHib> activeSuppliers();

	
	@Query("SELECT s FROM SuppliersHib s WHERE s.supplierId IN :supplierIds")
	List<SuppliersHib> findAllByIds(@Param("supplierIds") Collection<String> supplierIds);
	
	@Query("SELECT s FROM SuppliersHib s WHERE s.supplierId IN :supplierIds")
	List<SuppliersHib> findAllByIdIn(@Param("supplierIds") Set<String> supplierIds);
}
