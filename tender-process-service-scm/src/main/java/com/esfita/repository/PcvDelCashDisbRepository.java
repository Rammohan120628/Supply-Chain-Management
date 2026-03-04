package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.PcvDelCashDisbHib;


public interface PcvDelCashDisbRepository extends JpaRepository<PcvDelCashDisbHib, Integer> {

    @Query("SELECT r FROM PcvDelCashDisbHib r WHERE r.pcvHeadFk = ?1")
    PcvDelCashDisbHib findByHeadFk(int fk);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM PcvDelCashDisbHib r WHERE r.pcvHeadFk = ?1")
    double sumOfAmountForIndividual(int fk);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM PcvDelCashDisbHib r")
    double sumOfAmount();

    @Query("""
        SELECT COALESCE(SUM(r.amount), 0) 
        FROM PcvDelCashDisbHib r 
        WHERE r.pcvHeadFk IN (
            SELECT h.pcvHeadPk 
            FROM PcvHeadCashdisbHib h 
            WHERE YEAR(h.period) = YEAR(?1) 
            AND MONTH(h.period) = MONTH(?1)
        )
    """)
    double sumOfAmountByPeriod(Date period);

    @Query("SELECT r FROM PcvDelCashDisbHib r WHERE r.pcvHeadFk = ?1")
    List<PcvDelCashDisbHib> findAllByHeadFk(int fk);
}

