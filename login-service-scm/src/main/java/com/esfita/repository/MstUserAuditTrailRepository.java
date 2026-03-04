package com.esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.esfita.entity.MstUserAuditTrail;

public interface MstUserAuditTrailRepository extends JpaRepository<MstUserAuditTrail, Integer> {
}