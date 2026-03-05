package com.esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.esfita.entity.MstUserHib;

@Repository
public interface MstUserRepository extends JpaRepository<MstUserHib, Integer> {

	@Query("SELECT u FROM MstUserHib u WHERE u.emailId = :email")
	MstUserHib findByEmailId(@Param("email") String email);
}
