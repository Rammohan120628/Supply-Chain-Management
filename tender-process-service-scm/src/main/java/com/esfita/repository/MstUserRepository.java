package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.esfita.entity.MstUserHib;



public interface MstUserRepository extends JpaRepository<MstUserHib, Integer> {

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.muEmailId = ?1")
	MstUserHib isAlreadyRegistered(String emailId);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.muUserPk = ?1")
	MstUserHib getUser(Integer userFk);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.muEmailId = ?1 AND r.muPwd = ?2")
	MstUserHib isRegistered(String emailId, String password);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.muMobileNo = ?1")
	MstUserHib alreadyRegistered(String mobile);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.muUserPk = ?1")
	MstUserHib findentity(Integer entityId);

	@Query("SELECT m FROM MstUserHib m ORDER BY m.muUserPk DESC")
	List<MstUserHib> orderBy();

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.muEmailId = ?1 AND r.muStatus = 'A'")
	MstUserHib alreadyRegisteredMailId(String mailId);

	@Query("SELECT m FROM MstUserHib m WHERE m.muUserType = ?1 AND m.muStatus = 'A' ORDER BY m.muUserName ASC")
	List<MstUserHib> forUserDropdown(int typeFk);

	@Query("SELECT m FROM MstUserHib m WHERE m.muUserType IN (2,3) AND m.muStatus = 'A' ORDER BY m.muUserName ASC")
	List<MstUserHib> forUserDropdown();

	@Transactional
	@Modifying
	@Query("UPDATE MstUserHib r SET r.muPwd = ?2, r.muPasswordChangedDate = ?3 WHERE r.muUserPk = ?1")
	void changePassword(int userPk, String userPassword, Date passwordChangedDate);

	// new add
	@Query("SELECT m FROM MstUserHib m ORDER BY m.muStatus ASC, m.muUserName ASC")
	List<MstUserHib> orderByStatusAndName();

}
