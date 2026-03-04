package com.esfita.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.esfita.entity.AppPreference;

@Repository
public interface AppPreferenceRepository extends JpaRepository<AppPreference, Integer> {
	@Query(value = "SELECT * FROM public.APP_PREFERENCES ORDER BY AP_APP_PREFERENCES_PK DESC LIMIT 1", nativeQuery = true)
    Optional<AppPreference> findTopByOrderByIdDesc();
}