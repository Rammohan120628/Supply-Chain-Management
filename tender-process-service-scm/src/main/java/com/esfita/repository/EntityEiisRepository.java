package com.esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.esfita.entity.EntityEiisHib;


public interface EntityEiisRepository extends JpaRepository<EntityEiisHib, Integer> {
	EntityEiisHib findByPk(int pk);
}
