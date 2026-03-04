package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.PcvHeadCashdisbHib;

public interface PcvHeadRepository extends JpaRepository<PcvHeadCashdisbHib, Integer> {

	@Query("SELECT r FROM PcvHeadCashdisbHib r WHERE r.pcvNo LIKE ?1")
	List<PcvHeadCashdisbHib> transactionNo(String ref);

//
	@Query(value = """
			    SELECT
			        e.cash_op_balance
			        - (COALESCE(td.sumamount, 0) - COALESCE(ti.sumnetinvoice, 0)) AS result
			    FROM
			        entityeiis e
			    LEFT JOIN (
			        SELECT
			            SUM(amount) AS sumamount
			        FROM
			            cashdisbdetail
			        WHERE
			            pcv_no IN (
			                SELECT pcv_no
			                FROM cashdisbhead
			                WHERE period BETWEEN :startDate AND :endDate
			            )
			    ) td ON TRUE
			    LEFT JOIN (
			        SELECT
			            SUM(net_invoice) AS sumnetinvoice
			        FROM
			            suppdelhead
			        WHERE
			            supplier_id = 'OMS00000'
			            AND period BETWEEN :startDate AND :endDate
			    ) ti ON TRUE
			""", nativeQuery = true)
	double getOpeningBalance(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

//
//	@Query(value = "SELECT cd.pcv_no AS id, cd.description, ch.pcv_date AS date, ch.pcv_type AS type, ABS(cd.amount) AS amount, cd.account_id AS accid, cd.sub_account_id AS accname, ch.last_update, COALESCE(mu.mu_email_id, '') AS mu_email_id FROM cashdisbhead ch JOIN cashdisbdetail cd ON cd.pcv_no = ch.pcv_no AND cd.entity_id = ch.entity_id LEFT JOIN mst_user mu ON mu.mu_user_pk = ch.last_user WHERE EXTRACT(YEAR FROM ch.period) = EXTRACT(YEAR FROM CAST(?1 AS DATE)) AND EXTRACT(MONTH FROM ch.period) = EXTRACT(MONTH FROM CAST(?1 AS DATE)) UNION ALL SELECT sd.grn_id AS id, 'Cash Purchase' AS description, sd.grn_date AS date, 'Payment' AS type, sd.net_invoice AS amount, acc.account_id AS accid, acc.account_name AS accname, sd.last_update, COALESCE(mu.mu_email_id, '') AS mu_email_id FROM suppdelhead sd LEFT JOIN mst_user mu ON mu.mu_user_pk = sd.last_user LEFT JOIN suppdeldetail s ON s.grn_id = sd.grn_id INNER JOIN mst_item_category m ON LEFT(s.item_id, 2)::int = m.item_cat_pk INNER JOIN mst_item_account acc ON acc.item_account_pk = m.account_fk WHERE EXTRACT(YEAR FROM sd.period) = EXTRACT(YEAR FROM CAST(?1 AS DATE)) AND EXTRACT(MONTH FROM sd.period) = EXTRACT(MONTH FROM CAST(?1 AS DATE)) AND sd.supplier_id = 'OMS00000' GROUP BY sd.grn_id, sd.grn_date, sd.net_invoice, acc.account_id, acc.account_name, sd.last_update, mu.mu_email_id ORDER BY last_update ASC", nativeQuery = true)
//	List<Object[]> getCashPurchaseList(Date monthYear);
	
	@Query(value = """
		    SELECT 
		        cd.pcv_no AS id,
		        cd.description,
		        ch.pcv_date AS date,
		        ch.pcv_type AS type,
		        ABS(cd.amount) AS amount,
		        cd.account_id AS accid,
		        cd.sub_account_id AS accname,
		        ch.last_update,
		        COALESCE(mu.mu_email_id, '') AS mu_email_id
		    FROM cashdisbhead ch
		    JOIN cashdisbdetail cd 
		        ON cd.pcv_no = ch.pcv_no 
		        AND cd.entity_id = ch.entity_id
		    LEFT JOIN mst_user mu 
		        ON mu.mu_user_pk = ch.last_user
		    WHERE 
		        EXTRACT(YEAR FROM ch.period) = EXTRACT(YEAR FROM CAST(?1 AS DATE))
		        AND EXTRACT(MONTH FROM ch.period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))

		    UNION ALL

		    SELECT 
		        sd.grn_id AS id,
		        'Cash Purchase' AS description,
		        sd.grn_date AS date,
		        'Payment' AS type,
		        sd.net_invoice AS amount,
		        acc.account_id AS accid,
		        acc.account_name AS accname,
		        sd.last_update,
		        COALESCE(mu.mu_email_id, '') AS mu_email_id
		    FROM suppdelhead sd
		    LEFT JOIN mst_user mu 
		        ON mu.mu_user_pk = sd.last_user
		    LEFT JOIN suppdeldetail s 
		        ON s.grn_id = sd.grn_id
		    INNER JOIN mst_item_category m 
		        ON s.item_id BETWEEN (m.item_cat_pk * 10000) AND ((m.item_cat_pk * 10000) + 9999)
		    INNER JOIN mst_item_account acc 
		        ON acc.item_account_pk = m.account_fk
		    WHERE 
		        EXTRACT(YEAR FROM sd.period) = EXTRACT(YEAR FROM CAST(?1 AS DATE))
		        AND EXTRACT(MONTH FROM sd.period) = EXTRACT(MONTH FROM CAST(?1 AS DATE))
		        AND sd.supplier_id = 'OMS00000'
		    GROUP BY 
		        sd.grn_id, sd.grn_date, sd.net_invoice, 
		        acc.account_id, acc.account_name, 
		        sd.last_update, mu.mu_email_id
		    ORDER BY last_update ASC
		""", nativeQuery = true)
		List<Object[]> getCashPurchaseList(Date monthYear);







}