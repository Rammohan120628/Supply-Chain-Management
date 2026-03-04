package com.esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.esfita.entity.QuotationProcessDetailHib;

import jakarta.transaction.Transactional;

@Repository
public interface QuotationProcessDetailRepository extends JpaRepository<QuotationProcessDetailHib, Integer> {

	@Query("select m from QuotationProcessDetailHib m where m.quotationReqHeadFk=?1")
	List<QuotationProcessDetailHib> subTable(int headPk);
	
	QuotationProcessDetailHib findByQtnReqDetailPk(int qtnReqDetailPk);

	@Query("SELECT q FROM QuotationProcessDetailHib q WHERE q.qtnReqDetailPk = :id")
	QuotationProcessDetailHib findById(@Param("id") int id);
	
	@Transactional
	@Modifying
	@Query("delete from QuotationProcessDetailHib m where m.quotationReqHeadFk=?1")
	int deleteItem(int quotationFk);

	@Query("select m from QuotationProcessDetailHib m where m.itemId=?1 AND m.qtnReqNo=?2")
	QuotationProcessDetailHib byItemIdAndQtn(int headPk, String qtn);

	@Query("select m.qtnReqHeadPk from QuotationProcessHeadHib m where m.supplierId=?1 AND m.conId=?2")
	int maxPkByQtn(String id, String qtn);
}
