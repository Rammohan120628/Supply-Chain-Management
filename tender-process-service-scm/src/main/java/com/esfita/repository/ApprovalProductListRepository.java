package com.esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.esfita.entity.ApprovalProductListHib;

public interface ApprovalProductListRepository  extends JpaRepository<ApprovalProductListHib, Integer> { 

    @Query("select m from ApprovalProductListHib m order by m.locationId, m.itemId desc")
    List<ApprovalProductListHib> orderBy();

    @Query("select m from ApprovalProductListHib m where m.locationId = ?1 and m.itemId = ?2")
    List<ApprovalProductListHib> findItem(String loc, int item);

    @Query("SELECT COUNT(m.itemId) FROM ApprovalProductListHib m WHERE m.locationId = ?1")
    Long itemIdCount(String locationId);

    @Query("select m from ApprovalProductListHib m where m.locationId = ?1")
    List<ApprovalProductListHib> retriveByLocationId(String locationId);

    @Transactional
    @Modifying
    @Query("delete from ApprovalProductListHib m where m.locationId = ?1")
    void deleteLocationId(String locationId);

    @Transactional
    @Modifying
    @Query("delete from ApprovalProductListHib m where m.itemId = ?1")
    void deleteItemId(int itemCode);
}
