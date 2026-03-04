package com.esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.MstItemAccountHib;

public interface MstItemAccountRepository extends JpaRepository<MstItemAccountHib, Integer> {

    @Query("SELECT m FROM MstItemAccountHib m WHERE m.status = 'A' ORDER BY m.accountId ASC")
    List<MstItemAccountHib> byActive();

    @Query("SELECT m FROM MstItemAccountHib m ORDER BY m.itemAccountPk DESC")
    List<MstItemAccountHib> orderBy();

    @Query("SELECT m FROM MstItemAccountHib m WHERE m.accountId = ?1")
    MstItemAccountHib findAccountName(String accountId);
}

