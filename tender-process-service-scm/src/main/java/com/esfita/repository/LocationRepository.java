package com.esfita.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.LocationHib;

public interface LocationRepository extends JpaRepository<LocationHib, Integer> {

	@Query("select m from LocationHib m order by locationPk desc")
	List<LocationHib> orderBy();

	@Query("select loc from LocationHib loc where loc.locationId=?1")
	LocationHib findByLocationId(String locationId);

	@Query("select locationId from LocationHib loc where loc.locationId=?1")
	String getLocationId(String locationId);

	@Query("select m from LocationHib m where m.isActive=1")
	List<LocationHib> activeLocations();

	@Query("select m from LocationHib m where m.locationId=?1")
	LocationHib findLocationName(String locationId);

	@Query("select m from LocationHib m where m.locationType=1")
	List<LocationHib> findByType1();

	@Query("select m from LocationHib m where m.locationType=1")
	LocationHib findByType2();

	@Query("SELECT l FROM LocationHib l WHERE l.locationId IN :locationIds")
	List<LocationHib> findAllByIdIn(@Param("locationIds") List<String> locationIds);
}
