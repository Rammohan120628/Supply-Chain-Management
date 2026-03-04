package com.esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.esfita.entity.MstUserTypeHib;

@Repository
public interface MstUserTypeRepository extends JpaRepository<MstUserTypeHib, Integer> {

}
