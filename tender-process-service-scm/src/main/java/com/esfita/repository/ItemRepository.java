package com.esfita.repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.ItemHib;

public interface ItemRepository extends JpaRepository<ItemHib, Integer> {

	@Query("select m from ItemHib m where itemId=?1")
	ItemHib findCode(int itemId);

	@Query("select m from ItemHib m where itemName=?1")
	ItemHib findName(String itemName);

	@Query("select m from ItemHib m order by itemPk desc")
	List<ItemHib> orderBy();

	@Query("select m from ItemHib m where m.itemId=?1")
	ItemHib findId(int itemId);

	@Query("select m from ItemHib m where m.isActive=1")
	List<ItemHib> activeItems();
	
	@Query(value = "SELECT \r\n" + 
			"    it.Item_Pk AS ItemPk,\r\n" + 
			"    it.Item_Id AS ItemId,\r\n" + 
			"    mi.ITEM_NAME AS ItemName,\r\n" + 
			"    mi.PACKAGE_ID AS PackageId,\r\n" + 
			"    it.IP02 AS IP02,\r\n" + 
			"    it.Account_ID AS Account_Id,\r\n" + 
			"    ma.ACCOUNT_NAME,\r\n" + 
			"    mi.PACKAGE_BASE_FACTOR,\r\n" + 
			"    mc.ITEM_CAT_PK,\r\n" + 
			"    mc.NAME\r\n" + 
			"FROM item it\r\n" + 
			"LEFT JOIN mst_item_category mc ON mc.ITEM_CAT_PK = LEFT(it.Item_Id, 2)\r\n" + 
			"LEFT JOIN mst_item_master mi ON it.Item_Id = mi.ITEM_CODE\r\n" + 
			"LEFT JOIN mst_item_account ma ON ma.ACCOUNT_ID = it.Account_Id\r\n" + 
			"\r\n" + 
			"UNION ALL\r\n" + 
			"\r\n" + 
			"SELECT \r\n" + 
			"    0 AS ItemPk,\r\n" + 
			"    mi.ITEM_CODE AS ItemId,\r\n" + 
			"    mi.ITEM_NAME AS ItemName,\r\n" + 
			"    mi.PACKAGE_ID AS PackageId,\r\n" + 
			"    0 AS IP02,\r\n" + 
			"    ma.ACCOUNT_ID AS Account_Id,\r\n" + 
			"    ma.ACCOUNT_NAME,\r\n" + 
			"    mi.PACKAGE_BASE_FACTOR,\r\n" + 
			"    mc.ITEM_CAT_PK,\r\n" + 
			"    mc.NAME\r\n" + 
			"FROM mst_item_master mi\r\n" + 
			"LEFT JOIN item it ON mi.ITEM_CODE = it.Item_Id\r\n" + 
			"LEFT JOIN mst_item_category mc ON mc.ITEM_CAT_PK = LEFT(mi.ITEM_CODE, 2)\r\n" + 
			"LEFT JOIN mst_item_account ma ON ma.ITEM_ACCOUNT_PK = mc.ACCOUNT_FK\r\n" + 
			"WHERE it.Item_Id IS NULL\r\n" + 
			"\r\n" + 
			"ORDER BY ItemId;\r\n" + 
			"", nativeQuery = true)
	List<Object[]> getItemList();
	
	
	@Query("SELECT i FROM ItemHib i WHERE i.itemId IN :itemIds")
	List<ItemHib> findAllByIds(@Param("itemIds") Collection<Integer> itemIds);

	@Query("SELECT i FROM ItemHib i WHERE i.itemId IN :itemIds")
	List<ItemHib> findAllByIdIn(@Param("itemIds") Set<String> itemIds);
}
