package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.esfita.entity.QuotationProcessHeadHib;

import jakarta.transaction.Transactional;

@Repository
public interface QuotationProcessHeadRepository extends JpaRepository<QuotationProcessHeadHib, Integer> {

	@Query("select m from QuotationProcessHeadHib m where qtnReqNo=?1")
	QuotationProcessHeadHib findtransactionNo(String transactionNo);
	
	@Modifying
	@Transactional
	@Query("""
	UPDATE QuotationProcessHeadHib q
	SET q.receivedDate = :date
	WHERE q.qtnReqNo = :qtnReqNo
	""")
	void updateReceivedDate(@Param("qtnReqNo") String qtnReqNo,
	                        @Param("date") Date date);

	
	@Query("select q from QuotationProcessHeadHib q where q.qtnReqHeadPk = :id")
	QuotationProcessHeadHib findByIdPk(@Param("id") int id);
//
//	@Query(value = "SELECT s.supplier_id, \r\n" + "       s.last_qtd_price AS gp, \r\n" + "       s.item_id, \r\n"
//			+ "       c.grand_total AS Request_Qty, \r\n" + "       c.period \r\n" + "FROM suppliersitem s \r\n"
//			+ "INNER JOIN consolidation_location_request c ON s.item_id = c.item_id \r\n"
//			+ "WHERE YEAR(c.period) = YEAR(?1) AND MONTH(c.period) = MONTH(?1)" + "" +
//
//			"", nativeQuery = true)
//	List<Object[]> supplier();
//
//	@Query(value = "SELECT s.supplier_id, s.item_id, c.grand_total AS Request_Qty, c.period " + "FROM suppliersitem s "
//			+ "INNER JOIN consolidation_location_request c ON s.item_id = c.item_id "
//			+ "WHERE YEAR(c.period) = YEAR(?1) AND MONTH(c.period) = MONTH(?1)", nativeQuery = true)
//	List<Object[]> supplier(Date monthYear);
//
//	@Query(value = "SELECT s.supplier_id, s.item_id,c.package_id, c.grand_total AS Request_Qty, c.period "
//			+ "FROM suppliersitem s " + "INNER JOIN consolidation_location_request c ON s.item_id = c.item_id "
//			+ "WHERE c.CONSOLIDATION_ID =?1 and c.STATUS_FK=0", nativeQuery = true)
//	List<Object[]> getSupplierListByConsolidationId(String qtnId);
//
//	@Query(value = "SELECT s.supplier_id, s.item_id,c.package_id, c.grand_total AS Request_Qty, c.period "
//			+ "FROM suppliersitem s " + "INNER JOIN consolidation_location_request c ON s.item_id = c.item_id "
//			+ "INNER JOIN suppliers ss ON ss.Supplier_id = s.supplier_id "
//			+ "WHERE c.CONSOLIDATION_ID =?1 and YEAR(s.Period) = YEAR(?2) AND MONTH(s.Period) = MONTH(?2) and c.STATUS_FK=0 and ss.Is_Active = 1", nativeQuery = true)
//	List<Object[]> getSupplierListByConsolidationIdAndPeriod(String qtnId, Date period);
	
	@Query(value = "SELECT s.supplier_id, s.item_id, c.package_id, c.grand_total AS request_qty, c.period " +
            "FROM suppliersitem s " +
            "INNER JOIN consolidation_location_request c ON s.item_id::int = c.item_id " +
            "INNER JOIN suppliers ss ON ss.supplier_id = s.supplier_id " +
            "WHERE c.consolidation_id = ?1 " +
            "AND EXTRACT(YEAR FROM s.period) = EXTRACT(YEAR FROM CAST(?2 AS DATE)) " +
            "AND EXTRACT(MONTH FROM s.period) = EXTRACT(MONTH FROM CAST(?2 AS DATE)) " +
            "AND c.status_fk = 0 " +
            "AND ss.is_active = 1",
       nativeQuery = true)
List<Object[]> getSupplierListByConsolidationIdAndPeriod(String qtnId, Date period);

//
	@Query("select r from QuotationProcessHeadHib r where r.qtnReqNo LIKE ?1")
	List<QuotationProcessHeadHib> transactionNo(String ref);
	
	@Query("select m from QuotationProcessHeadHib m where m.conId = ?1 AND m.statusFk=0")
	List<QuotationProcessHeadHib> byConsIdAndStatus0(String consId);
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where m.sUPPLIER_ID=?1 AND YEAR(m.pERIOD) = YEAR(?2) AND MONTH(m.pERIOD) = MONTH(?2)")
//	QUOTATION_PROCESS_HEAD_HIB alreadySupplier(String supplierId, Date date);
//
	@Query("select m from QuotationProcessHeadHib m where m.supplierId=?1 AND m.conId=?2")
	QuotationProcessHeadHib alreadySupplierByConId(String supplierId, String conId);

	@Query("select m.qtnReqNo from QuotationProcessHeadHib m where m.supplierId=?1 AND m.conId=?2")
	String transByQtn(String supplierId, String qtn);
	
	@Query("select m from QuotationProcessHeadHib m where conId=?1 AND statusFk=1")
	List<QuotationProcessHeadHib> findByConsolidationId(String conId);
	
	@Query(value = "SELECT * FROM qtn_req_head m " +
            "WHERE EXTRACT(MONTH FROM m.period) = EXTRACT(MONTH FROM CAST(?1 AS DATE)) " +
            "AND EXTRACT(YEAR FROM m.period) = EXTRACT(YEAR FROM CAST(?1 AS DATE)) " +
            "ORDER BY m.qtn_req_head_pk DESC",
    nativeQuery = true)
List<QuotationProcessHeadHib> orderByPeriodAndStatusAll(Date period);
	
		
		
	@Query(value = """
		    SELECT 
		        q.qtn_req_head_pk,
		        q.qtn_req_no,
		        q.supplier_id,
		        s.supplier_name,
		        q.entity_id,
		        q.period,
		        q.received_date,
		        q.status_fk,
		        q.con_id
		    FROM qtn_req_head q
		    LEFT JOIN suppliers s ON s.supplier_id = q.supplier_id
		    WHERE q.period >= date_trunc('month', CAST(:period AS date))
		      AND q.period < date_trunc('month', CAST(:period AS date)) + interval '1 month'
		    ORDER BY q.qtn_req_head_pk DESC
		""", nativeQuery = true)
		List<Object[]> fetchQuotationFast(@Param("period") Date period);

	
	
	@Query("select m from QuotationProcessHeadHib m where m.qtnReqNo=?1")
	QuotationProcessHeadHib headerDetail(String reqNo);

//	@Query("select m.qTN_REQ_NO from QUOTATION_PROCESS_HEAD_HIB m where m.sUPPLIER_ID=?1 AND YEAR(m.pERIOD) = YEAR(?2) AND MONTH(m.pERIOD) = MONTH(?2)")
//	String tran(String supplierId, Date date);
//
//	@Query("select m.qTN_REQ_HEAD_PK from QUOTATION_PROCESS_HEAD_HIB m where m.sUPPLIER_ID=?1 AND YEAR(m.pERIOD) = YEAR(?2) AND MONTH(m.pERIOD) = MONTH(?2)")
//	int maxPk(String id, Date date);
//
//	@Query("select m.qTN_REQ_HEAD_PK from QUOTATION_PROCESS_HEAD_HIB m where m.sUPPLIER_ID=?1 AND m.cON_ID=?2")
//	int maxPkByQtn(String id, String qtn);
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m order by qTN_REQ_HEAD_PK desc")
//	List<QUOTATION_PROCESS_HEAD_HIB> orderBy();
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where MONTH(m.pERIOD) = MONTH(?1) AND YEAR(m.pERIOD) = YEAR(?1) order by m.qTN_REQ_HEAD_PK desc")
//	List<QUOTATION_PROCESS_HEAD_HIB> orderByPeriodAndStatusAll(Date period);
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m WHERE sTATUS_FK = 0  order by qTN_REQ_HEAD_PK desc")
//	List<QUOTATION_PROCESS_HEAD_HIB> orderByStatus0();
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where YEAR(m.pERIOD) = YEAR(?1) AND MONTH(m.pERIOD) = MONTH(?1)")
//	List<QUOTATION_PROCESS_HEAD_HIB> alreadymonth(Date date);
//
	@Query("select m from QuotationProcessHeadHib m where m.conId = ?1")
	List<QuotationProcessHeadHib> alreadyExistByConId(String consId);
	
	@Query("select m from QuotationProcessHeadHib m where m.qtnReqHeadPk = ?1")
	QuotationProcessHeadHib findOne(int quotationReqHeadPk);
	
	@Transactional
	@Modifying
	@Query("UPDATE QuotationProcessHeadHib r SET r.statusFk =2 WHERE r.conId = ?1")
	void updateStatusFk(String conId);
	
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where YEAR(m.pERIOD) = YEAR(?1) AND MONTH(m.pERIOD) = MONTH(?1) AND m.sTATUS_FK=0 order by qTN_REQ_HEAD_PK desc")
//	List<QUOTATION_PROCESS_HEAD_HIB> monthWiseTranNo(Date date);
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where m.cON_ID = ?1 AND m.sTATUS_FK=0")
//	List<QUOTATION_PROCESS_HEAD_HIB> byConsIdAndStatus0(String consId);
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where m.qTN_REQ_NO=?1 AND m.sTATUS_FK=1")
//	List<QUOTATION_PROCESS_HEAD_HIB> retriveByQtnReqNo(String reqNo);
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where m.qTN_REQ_NO=?1")
//	QUOTATION_PROCESS_HEAD_HIB headerDetail(String reqNo);
//
//	@Query("select m from QUOTATION_PROCESS_HEAD_HIB m where MONTH(m.pERIOD) = MONTH(?1) AND YEAR(m.pERIOD) = YEAR(?1)")
//	List<QUOTATION_PROCESS_HEAD_HIB> activeQtnNo(Date period);

}
