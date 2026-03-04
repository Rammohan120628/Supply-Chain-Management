package com.esfita.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.esfita.entity.MstUserHib;
@Repository
public interface MstUserRepository extends JpaRepository<MstUserHib, Integer> {
	 Optional<MstUserHib> findByEmailId(String email);	
}
