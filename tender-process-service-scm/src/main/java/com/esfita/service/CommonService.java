/**
 * 
 * @author Rammohan R
 * @since 18-Nov-2025
 * 
 */
package com.esfita.service;

import java.lang.reflect.Method;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.esfita.common.AppConstants;
import com.esfita.common.ResponseDTO;
import com.esfita.common.RestException;
import com.esfita.dto.ConsolidationLocationRequestDTO;
import com.esfita.dto.LocationRequestDTO;
import com.esfita.entity.ConsolidationLocationRequestHib;
import com.esfita.entity.EntityEiisHib;
import com.esfita.entity.ItemHib;
import com.esfita.entity.LocationHib;
import com.esfita.entity.LocationRequestDetailHib;
import com.esfita.entity.LocationRequeustHeadHib;
import com.esfita.entity.QuotationProcessDetailHib;
import com.esfita.entity.QuotationProcessHeadHib;
import com.esfita.entity.QuotationRequestDetailHib;
import com.esfita.entity.QuotationRequeustHeadHib;
import com.esfita.entity.SelectedSupplierHib;
import com.esfita.entity.SuppliersHib;
import com.esfita.repository.ConsolidationLocationRequestRepository;
import com.esfita.repository.EntityEiisRepository;
import com.esfita.repository.InvoiceDetailRepository;
import com.esfita.repository.ItemRepository;
import com.esfita.repository.LocationRepository;
import com.esfita.repository.LocationRequestDetailRepository;
import com.esfita.repository.LocationRequeustHeadRepository;
import com.esfita.repository.MstItemMasterRepository;
import com.esfita.repository.MstUserRepository;
import com.esfita.repository.PoDetailsRepository;
import com.esfita.repository.QuotationProcessDetailRepository;
import com.esfita.repository.QuotationProcessHeadRepository;
import com.esfita.repository.QuotationRequestDetailRepository;
import com.esfita.repository.QuotationRequeustHeadRepository;
import com.esfita.repository.SelectedSupplierRepository;
import com.esfita.repository.SuppDelDetailRepository;
import com.esfita.repository.SuppDelHeadRepository;
import com.esfita.repository.SuppliersRepository;

@Service
public class CommonService {

	private static final Logger log = LoggerFactory.getLogger(CommonService.class);

	@Autowired
	QuotationRequeustHeadRepository quotationRequeustHeadRepository;
	@Autowired
	QuotationRequestDetailRepository quotationRequestDetailRepository;
	@Autowired
	SuppliersRepository suppliersRepository;
	@Autowired
	LocationRepository locationRepository;
	@Autowired
	ItemRepository itemRepository;
	@Autowired
	PoDetailsRepository poDetailsRepository;
	@Autowired
	MstItemMasterRepository itemMasterRepository;
	@Autowired
	MstUserRepository userRepository;
	@Autowired
	SelectedSupplierRepository selectedSupplierRepository;
	@Autowired
	EntityEiisRepository entityEiisRepository;
	@Autowired
	SuppDelDetailRepository suppDelDetailRepository;
	@Autowired
	SuppDelHeadRepository suppDelHeadRepository;
	@Autowired
	InvoiceDetailRepository invoiceDetailRepository;
	@Autowired
	ConsolidationLocationRequestRepository consolidationLocationRequestRepository;
	@Autowired
	QuotationProcessDetailRepository quotationProcessDetailRepository;
	@Autowired
	QuotationProcessHeadRepository quotationProcessHeadRepository;
	@Autowired
	LocationRequeustHeadRepository locationRequeustHeadRepository;
	@Autowired
	LocationRequestDetailRepository locationRequestDetailRepository;

	public QuotationRequeustHeadHib createAndSaveHeader(LocationRequestDTO dto, ResponseDTO<LocationRequestDTO> response) {
		try {
			String finalID = null;
			String ref = generateLocationReqNo();
			ref += "%";

			List<QuotationRequeustHeadHib> transactionNo = quotationRequeustHeadRepository.transactionNo(ref);

			if (transactionNo != null && transactionNo.size() > AppConstants.ZERO) {
				finalID = generateLocationReqNo(transactionNo.size() + 1);
			} else {
				finalID = generateLocationReqNo(1);
			}

			QuotationRequeustHeadHib headerHib = new QuotationRequeustHeadHib();
			headerHib.setReqNo(finalID);
			headerHib.setPeriod(dto.getPeriod());
			headerHib.setLocationId(dto.getLocationId());
			headerHib.setEntityId(dto.getEntityId());
			headerHib.setProcessed("");
			headerHib.setIsFinal(0);
			headerHib.setStatusFk(0); // 0 means created
			headerHib.setDeliveryMode(1);
			headerHib.setCreatedBy(dto.getUserFk());
			headerHib.setCreatedDate(new Date());
			headerHib.setLastUser(dto.getUserFk());
			headerHib.setLastUpdate(new Date());
			headerHib.setConId("");

			quotationRequeustHeadRepository.save(headerHib);
			response.setSuccess(AppConstants.TRUE);

			return headerHib;

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to save location request header: " + e.getMessage());
			return null;
		}
	}

	public String generateLocationReqNo() {
		Date date = new Date(); // current date
		String year = new SimpleDateFormat("yyyy").format(date);
		String month = new SimpleDateFormat("MM").format(date);
		String day = new SimpleDateFormat("dd").format(date);

		return "LOCR" + year + month + day;
	}

	public String generateLocationReqNo(Integer number) {
		Date date = new Date(); // current date
		String year = new SimpleDateFormat("yyyy").format(date);
		String month = new SimpleDateFormat("MM").format(date);
		String day = new SimpleDateFormat("dd").format(date);
		NumberFormat decimalFormat = new DecimalFormat("0000");
		String x = decimalFormat.format(number);

		return "LOCR" + year + month + day + x;
	}

	public List<Integer> buildIntList(LocationRequestDTO dto) {
		List<Integer> intList = new ArrayList<>();
		boolean[] rendered = { dto.isQtyRendered1(), dto.isQtyRendered2(), dto.isQtyRendered3(), dto.isQtyRendered4(),
				dto.isQtyRendered5(), dto.isQtyRendered6(), dto.isQtyRendered7(), dto.isQtyRendered8(),
				dto.isQtyRendered9(), dto.isQtyRendered10(), dto.isQtyRendered11(), dto.isQtyRendered12(),
				dto.isQtyRendered13(), dto.isQtyRendered14(), dto.isQtyRendered15(), dto.isQtyRendered16(),
				dto.isQtyRendered17(), dto.isQtyRendered18(), dto.isQtyRendered19(), dto.isQtyRendered20(),
				dto.isQtyRendered21(), dto.isQtyRendered22(), dto.isQtyRendered23(), dto.isQtyRendered24(),
				dto.isQtyRendered25(), dto.isQtyRendered26(), dto.isQtyRendered27(), dto.isQtyRendered28(),
				dto.isQtyRendered29(), dto.isQtyRendered30(), dto.isQtyRendered31() };

		for (int i = 0; i < rendered.length; i++) {
			if (rendered[i]) {
				intList.add(i + 1);
			}
		}

		return intList;
	}

	public void processSubListAndSaveDetails(LocationRequestDTO parentDto, QuotationRequeustHeadHib headerHib,
			List<Integer> intList, ResponseDTO<LocationRequestDTO> response) {
		try {
			if (parentDto.getSubList() == null || parentDto.getSubList().isEmpty()) {
				return;
			}

			for (LocationRequestDTO itemDto : parentDto.getSubList()) {
				if ( intList != null && !intList.isEmpty()) {

					for (Integer day : intList) {
						saveSingleDayDetail(itemDto, parentDto, headerHib, day, response);

					}
				}
			}

		} catch (RestException exception) {
			response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
			response.setSuccess(AppConstants.FALSE);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to save location request details: " + e.getMessage());
		}
	}

	private void saveSingleDayDetail(LocationRequestDTO itemDto, LocationRequestDTO parentDto,
			QuotationRequeustHeadHib headerHib, Integer day, ResponseDTO<LocationRequestDTO> response) {
		try {
			QuotationRequestDetailHib dayHib = new QuotationRequestDetailHib();

			dayHib.setReqHeadFk(headerHib.getReqHeadPk());
			dayHib.setReqNo(headerHib.getReqNo());
			dayHib.setItemId(itemDto.getItemId());
			dayHib.setPackageId(itemDto.getPackageId());
			dayHib.setEntOrder(itemDto.getEntOrder());
			dayHib.setSupplierId(itemDto.getSupplierId());
			dayHib.setDelLocId(parentDto.getLocationId());
			dayHib.setDeliveryMode(itemDto.getDeliveryMode());
			dayHib.setEntityId(parentDto.getEntityId());

			Date resultDate = setDayOfMonth(headerHib.getPeriod(), day);
			dayHib.setRequestDate(resultDate);
			dayHib.setSuppDelDate(resultDate);
			dayHib.setCwhDelDate(resultDate);
			dayHib.setDeliveryMode("DD");
			dayHib.setStatusFk(0);

// EXTRACTED: Clean, readable, maintainable
			dayHib.setQty(getQtyByDay(itemDto, day));

			if (dayHib.getQty() != 0) {
				quotationRequestDetailRepository.save(dayHib);
				response.setSuccess(AppConstants.TRUE);

			}

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to save detail for day " + day + ": " + e.getMessage());
		}
	}

	public static Date setDayOfMonth(Date date, int dayOfMonth) {
		// Create a Calendar instance and set the passed date
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);

		// Set the desired day of the month
		calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);

		// Get the modified date
		return calendar.getTime();
	}

	private double getQtyByDay(LocationRequestDTO dto, int day) {
		return switch (day) {
		case 1 -> dto.getQty1();
		case 2 -> dto.getQty2();
		case 3 -> dto.getQty3();
		case 4 -> dto.getQty4();
		case 5 -> dto.getQty5();
		case 6 -> dto.getQty6();
		case 7 -> dto.getQty7();
		case 8 -> dto.getQty8();
		case 9 -> dto.getQty9();
		case 10 -> dto.getQty10();
		case 11 -> dto.getQty11();
		case 12 -> dto.getQty12();
		case 13 -> dto.getQty13();
		case 14 -> dto.getQty14();
		case 15 -> dto.getQty15();
		case 16 -> dto.getQty16();
		case 17 -> dto.getQty17();
		case 18 -> dto.getQty18();
		case 19 -> dto.getQty19();
		case 20 -> dto.getQty20();
		case 21 -> dto.getQty21();
		case 22 -> dto.getQty22();
		case 23 -> dto.getQty23();
		case 24 -> dto.getQty24();
		case 25 -> dto.getQty25();
		case 26 -> dto.getQty26();
		case 27 -> dto.getQty27();
		case 28 -> dto.getQty28();
		case 29, 30, 31 -> getQtyForLastThreeDays(dto, day); // MERGED
		default -> 0.0;
		};
	}

	private double getQtyForLastThreeDays(LocationRequestDTO dto, int day) {
		return switch (day) {
		case 29 -> dto.getQty29();
		case 30 -> dto.getQty30();
		case 31 -> dto.getQty31();
		default -> 0.0;
		};
	}

//--------------------------------------------------------------------------------------------------------------------------------------//

	public LocationRequestDTO mapToDTO(QuotationRequeustHeadHib hib) {
		LocationRequestDTO dto = new LocationRequestDTO();
		dto.setLocationRequestHeaderPk(hib.getReqHeadPk());
		dto.setReqTransactionNo(hib.getReqNo());
		dto.setPeriodStr(new SimpleDateFormat(AppConstants.DD_MM_YYYY).format(hib.getPeriod()));
		dto.setLocationId(hib.getLocationId());
		dto.setStatusFk(hib.getStatusFk());

		if (hib.getStatusFk() != 0) {
			dto.setConsolidationId(hib.getConId());
		}
		return dto;
	}

	public void assignDeliveryMode(LocationRequestDTO dto, QuotationRequeustHeadHib hib) {
		if (hib.getDeliveryMode() == 0) {
			dto.setDeliveryMode("CWH");
			return;
		}

		if (hib.getDeliveryMode() == 1) {
			dto.setDeliveryMode("DD");

			LocationHib locationHib = locationRepository.findLocationName(hib.getLocationId());
			if (locationHib != null && locationHib.getLocationType() == 1) {
				dto.setDeliveryMode("CWH");
			}
		}
	}

	public LocationRequestDTO mapDetailToDTO(QuotationRequestDetailHib detailHib,QuotationRequeustHeadHib headHib) {
		LocationRequestDTO dto = new LocationRequestDTO();

		
		
		
		
		dto.setLocationRequestDetailsPk(detailHib.getReqDetailPk());
		dto.setReqTransactionNo(detailHib.getReqNo());
		dto.setItemId(detailHib.getItemId());
		dto.setPackageId(detailHib.getPackageId());
		dto.setSupplierId("N/A");
		dto.setSupplierName("N/A");
		if(headHib.getConId() !=null) {
		dto.setConsolidationId(headHib.getConId());
		}
		fillSupplierInfo(dto, detailHib);
		fillConsolidationInfo(dto, detailHib);
		fillItemInfo(dto);

		dto.setRequestDate(detailHib.getRequestDate());
		dto.setQty(detailHib.getQty());
		dto.setDeliveryLocationId(detailHib.getDelLocId());

		return dto;
	}

	public void fillSupplierInfo(LocationRequestDTO dto, QuotationRequestDetailHib detailHib) {
		String supplierId = detailHib.getSupplierId();
		if (supplierId == null || supplierId.isBlank()) {
			return;
		}

		dto.setSupplierId(supplierId);
		SuppliersHib supplier = suppliersRepository.findName(supplierId);
		dto.setSupplierName(supplier != null ? supplier.getSupplierName() : "N/A");
	}

	public void fillConsolidationInfo(LocationRequestDTO dto, QuotationRequestDetailHib detailHib) {
		String consolidationId = dto.getConsolidationId();
		if (consolidationId == null || consolidationId.isBlank()) {
			return;
		}

		ConsolidationLocationRequestHib conHib = consolidationLocationRequestRepository
				.byConsolidationIdandItemId(consolidationId, detailHib.getItemId());

		if (conHib != null) {
			dto.setNet(conHib.getNetPrice());
			dto.setGross(conHib.getGrossPrice());
		}
	}

	public void fillItemInfo(LocationRequestDTO dto) {
		ItemHib item = itemRepository.findId(dto.getItemId());
		dto.setItemName(item != null ? item.getItemName() : "N/A");
	}

	// --------------------------------------------------------------------------------------------//

	// Quotation Request Bulk Upload- Bharath Parthiban (19-11-2025)

	public void saveLocationRequestDetailsSub(LocationRequestDTO locationRequestDTO, QuotationRequeustHeadHib headerHib,
			ResponseDTO<LocationRequestDTO> response) {
		if (locationRequestDTO.getSubList() == null || locationRequestDTO.getSubList().isEmpty()) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("No details to save.");
			return;
		}

		for (LocationRequestDTO itemDto : locationRequestDTO.getSubList()) {
			log.info("Qty Called");
			if (itemDto.getQty() != 0) {
				log.info("Qty Called");
				try {
					QuotationRequestDetailHib detailHib = new QuotationRequestDetailHib();

					detailHib.setReqHeadFk(headerHib.getReqHeadPk());
					detailHib.setReqNo(headerHib.getReqNo());
					detailHib.setItemId(itemDto.getItemId());
					detailHib.setPackageId(itemDto.getPackageId());
					detailHib.setEntOrder(itemDto.getEntOrder());
					detailHib.setSupplierId(itemDto.getSupplierId());
					detailHib.setDelLocId(locationRequestDTO.getLocationId());
					detailHib.setDeliveryMode("DD"); // Fixed value
					detailHib.setEntityId(locationRequestDTO.getEntityId());
					detailHib.setRequestDate(itemDto.getRequestDate());
					detailHib.setSuppDelDate(itemDto.getRequestDate());
					detailHib.setCwhDelDate(itemDto.getRequestDate());
					detailHib.setQty(itemDto.getQty());

					quotationRequestDetailRepository.save(detailHib);
					response.setSuccess(AppConstants.TRUE);
				} catch (Exception e) {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Failed to save Item ID " + itemDto.getItemId() + ": " + e.getMessage());
					log.error("Error saving LocationRequestDetail for Item ID {}: {}", itemDto.getItemId(),
							e.getMessage());

					e.printStackTrace();
				}
			}
		}

	}

	public LocationRequestDTO mapRowToDTO(Row row, String period, SimpleDateFormat sdf, java.sql.Date sqlPeriod) {
		String deliveryDayStr = getStringCellValue(row, 0);
		String itemIdStr = getStringCellValue(row, 1);

		if (isNullOrEmpty(deliveryDayStr) || isNullOrEmpty(itemIdStr)) {
			log.info("⚠ Skipped empty row {}", row.getRowNum() + 1);
			return null;
		}

		Integer deliveryDay = parseInteger(deliveryDayStr, "deliveryDay", row.getRowNum());
		Integer itemId = parseInteger(itemIdStr, "itemId", row.getRowNum());
		if (deliveryDay == null || itemId == null)
			return null;

		LocalDate deliveryDate = getValidDeliveryDate(period, deliveryDay, row.getRowNum());
		if (deliveryDate == null)
			return null;

		LocationRequestDTO dto = new LocationRequestDTO();
		dto.setItemId(itemId);
		dto.setItemName(getStringCellValue(row, 2));
		dto.setPackageId(getStringCellValue(row, 3));
		dto.setQty(Optional.ofNullable(getDoubleCellValue(row, 4)).orElse(0.0));
		dto.setRequestDateStr(sdf.format(java.sql.Date.valueOf(deliveryDate)));
		dto.setReceiveDate(java.sql.Date.valueOf(deliveryDate));
		List<Object[]> supplierRows = selectedSupplierRepository.findByPeriodAndItemIdByLocReqBulkUpload(sqlPeriod,
				itemId);

		if (!supplierRows.isEmpty()) {
			Object[] rows = supplierRows.get(0);
			String supplierId = rows[0] != null ? rows[0].toString() : null;
			dto.setSupplierId(supplierId);
		} else {
			dto.setSupplierId("");
		}

		return dto;
	}

	/**
	 * Safely parses an integer, logs error if invalid.
	 */
	public Integer parseInteger(String value, String fieldName, int rowNum) {
		try {
			return Integer.parseInt(value.trim());
		} catch (NumberFormatException e) {
			log.info("⚠ Invalid {} '{}' in row {}", fieldName, value, rowNum + 1);
			return null;
		}
	}

	/**
	 * Validates and computes delivery date.
	 */
	public LocalDate getValidDeliveryDate(String period, int deliveryDay, int rowNum) {
		try {
			LocalDate baseDate = LocalDate.parse(period);
			return baseDate.withDayOfMonth(deliveryDay);
		} catch (DateTimeException e) {
			log.info("⚠ Invalid delivery day {} for period {} (row {})", deliveryDay, period, rowNum + 1);
			return null;
		}
	}

	/**
	 * Utility to check if a string is null or empty.
	 */
	public boolean isNullOrEmpty(String str) {
		return str == null || str.trim().isEmpty();
	}

	// Helper methods with better null handling
	public String getStringCellValue(Row row, int cellIndex) {
		if (row == null)
			return null;
		Cell cell = row.getCell(cellIndex);
		if (cell == null)
			return null;

		switch (cell.getCellType()) {
		case STRING:
			return cell.getStringCellValue().trim();
		case NUMERIC:
			if (DateUtil.isCellDateFormatted(cell)) {
				return cell.getDateCellValue().toString();
			} else {
				// For numeric values, remove decimal if it's .0
				double num = cell.getNumericCellValue();
				if (num == (int) num) {
					return String.valueOf((int) num);
				} else {
					return String.valueOf(num);
				}
			}
		case BOOLEAN:
			return String.valueOf(cell.getBooleanCellValue());
		case FORMULA:
			try {
				return cell.getStringCellValue();
			} catch (Exception e) {
				try {
					return String.valueOf(cell.getNumericCellValue());
				} catch (Exception ex) {
					return cell.getCellFormula();
				}
			}
		default:
			return null;
		}
	}

	public Double getDoubleCellValue(Row row, int cellIndex) {
		if (row == null)
			return null;
		Cell cell = row.getCell(cellIndex);
		if (cell == null)
			return null;

		try {
			switch (cell.getCellType()) {
			case NUMERIC:
				return cell.getNumericCellValue();
			case STRING:
				String strValue = cell.getStringCellValue().trim();
				if (strValue.isEmpty())
					return 0.0;
				return Double.parseDouble(strValue);
			case FORMULA:
				return getNumericValueFromFormulaCell(cell);
			default:
				return 0.0;
			}
		} catch (Exception e) {
			return 0.0;
		}
	}

	private Double getNumericValueFromFormulaCell(Cell cell) {
		try {
			return cell.getNumericCellValue();
		} catch (Exception e) {
			return 0.0;
		}
	}

	// ---------------------------------------------------------------------------------------------------//

	protected ResponseDTO<Map<String, Object>> buildErrorResponse(String message) {
		return ResponseDTO.<Map<String, Object>>builder().success(false).message(message).data(null).build();
	}

	public static class ProcessedRequestData {
		private final LocationRequestDTO renddto;
		private final List<LocationRequestDTO> reqDetailList;

		public ProcessedRequestData(LocationRequestDTO renddto, List<LocationRequestDTO> reqDetailList) {
			this.renddto = renddto;
			this.reqDetailList = reqDetailList;
		}

		

		public LocationRequestDTO getRenddto() {
			return renddto;
		}

		public List<LocationRequestDTO> getReqDetailList() {
			return reqDetailList;
		}
	}

	public ProcessedRequestData processRequestDetails(List<QuotationRequestDetailHib> locationRequestDetailHib,
			int reqDeailFK) {
		List<LocationRequestDTO> reqDetailList = new ArrayList<>();
		LocationRequestDTO tempdto = null;
		LocationRequestDTO renddto = initializeRenddto(reqDeailFK);
		boolean flag = false;
		int tempItemName = 0;

		for (QuotationRequestDetailHib hib : locationRequestDetailHib) {
			if (isNewItem(hib.getItemId(), tempItemName)) {
				tempItemName = hib.getItemId();
				if (flag) {
					reqDetailList.add(tempdto);
				}
				flag = true;
				tempdto = createNewLocationRequestDTO(hib, renddto);
			}
			processDayQuantity(tempdto, renddto, hib);
		}

		if (tempdto != null) {
			reqDetailList.add(tempdto);
		}

		return new ProcessedRequestData(renddto, reqDetailList);
	}

	protected LocationRequestDTO initializeRenddto(int reqDeailFK) {
		LocationRequestDTO renddto = new LocationRequestDTO();
		renddto.setReqHeadFK(reqDeailFK);
		return renddto;
	}

	protected boolean isNewItem(int currentItemId, int previousItemId) {
		return currentItemId != previousItemId;
	}

	protected LocationRequestDTO createNewLocationRequestDTO(QuotationRequestDetailHib hib,
			LocationRequestDTO renddto) {
		setRenddtoLocationInfo(hib, renddto);

		LocationRequestDTO newDto = new LocationRequestDTO();
		newDto.setItemId(hib.getItemId());
		newDto.setSupplierId(hib.getSupplierId());
		newDto.setItemName(getItemName(hib.getItemId()));
		newDto.setPackageId(hib.getPackageId());

		return newDto;
	}

	protected void setRenddtoLocationInfo(QuotationRequestDetailHib hib, LocationRequestDTO renddto) {
		renddto.setLocationId(hib.getDelLocId());
		renddto.setLocationName(getLocationName(hib.getDelLocId()));
		renddto.setReqTransactionNo(hib.getReqNo());
	}

	protected String getLocationName(String delLocId) {
		LocationHib location = locationRepository.findLocationName(delLocId);
		return location != null ? location.getLocationName() : "N/A";
	}

	protected String getItemName(int itemId) {
		ItemHib item = itemRepository.findId(itemId);
		return item != null ? item.getItemName() : "N/a";
	}

	protected void processDayQuantity(LocationRequestDTO tempdto, LocationRequestDTO renddto,
			QuotationRequestDetailHib hib) {
		Calendar cal = Calendar.getInstance();
		cal.setTime(hib.getRequestDate());
		int day = cal.get(Calendar.DATE);
		setQuantityByDay(tempdto, renddto, day, hib.getQty());
	}

	protected void setQuantityByDay(LocationRequestDTO tempdto, LocationRequestDTO renddto, int day, double quantity) {
		if (day < 1 || day > 31)
			return;

		setQuantityUsingSwitch(tempdto, renddto, day, quantity);
	}

	protected void setQuantityUsingSwitch(LocationRequestDTO tempdto, LocationRequestDTO renddto, int day,
			double quantity) {
		try {
			// Build method names: setQtyX and setQtyRenderedX
			String qtyMethod = "setQty" + day;
			String renderedMethod = "setQtyRendered" + day;

			// Set quantity
			Method qtySetter = LocationRequestDTO.class.getMethod(qtyMethod, double.class);
			qtySetter.invoke(tempdto, quantity);

			// Mark rendered flag
			Method renderSetter = LocationRequestDTO.class.getMethod(renderedMethod, boolean.class);
			renderSetter.invoke(renddto, true);

		} catch (Exception e) {
			// System.out.println("Invalid day or method not found for day = " + day);
		}
	}

	// --------------------------------------------------------------------------------------//

	public List<Integer> buildRenderedDaysList(LocationRequestDTO dto) {
		List<Integer> dayList = new ArrayList<>();

		// Array maps index 0 → day 1, index 1 → day 2, etc.
		boolean[] renderedFlags = { dto.isQtyRendered1(), dto.isQtyRendered2(), dto.isQtyRendered3(),
				dto.isQtyRendered4(), dto.isQtyRendered5(), dto.isQtyRendered6(), dto.isQtyRendered7(),
				dto.isQtyRendered8(), dto.isQtyRendered9(), dto.isQtyRendered10(), dto.isQtyRendered11(),
				dto.isQtyRendered12(), dto.isQtyRendered13(), dto.isQtyRendered14(), dto.isQtyRendered15(),
				dto.isQtyRendered16(), dto.isQtyRendered17(), dto.isQtyRendered18(), dto.isQtyRendered19(),
				dto.isQtyRendered20(), dto.isQtyRendered21(), dto.isQtyRendered22(), dto.isQtyRendered23(),
				dto.isQtyRendered24(), dto.isQtyRendered25(), dto.isQtyRendered26(), dto.isQtyRendered27(),
				dto.isQtyRendered28(), dto.isQtyRendered29(), dto.isQtyRendered30(), dto.isQtyRendered31() };

		for (int i = 0; i < renderedFlags.length; i++) {
			if (renderedFlags[i]) {
				dayList.add(i + 1); // i=0 → day 1, i=1 → day 2, etc.
			}
		}

		return dayList;
	}

	public void processAndSaveUpdatedDetails(LocationRequestDTO parentDto, QuotationRequeustHeadHib headerHib,
			List<Integer> dayList, ResponseDTO<LocationRequestDTO> response) {
		try {
			for (LocationRequestDTO itemDto : parentDto.getSubList()) {
				if (itemDto.getQty() == 0 || dayList.isEmpty()) {
					continue;
				}

				for (Integer day : dayList) {
					saveSingleDayDetail(itemDto, parentDto, headerHib, day, response);
				}
			}
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to update details: " + e.getMessage());
		}
	}

	// ------------------------------------------------------------------------------------------------------------------------//

	public void processConsolidationItems(String finalID, LocationRequestDTO selectView,
			ResponseDTO<LocationRequestDTO> response) {
		try {
			for (LocationRequestDTO itemDto : selectView.getItems()) {
				ConsolidationLocationRequestHib hib = new ConsolidationLocationRequestHib();

				hib.setConsolidationId(finalID);
				hib.setPeriod(selectView.getPeriod());
				hib.setItemId(itemDto.getItemId());

				// Fetch item name
				ItemHib itemHib = itemRepository.findId(itemDto.getItemId());
				hib.setItemName(itemHib != null ? itemHib.getItemName() : "N/a");

				hib.setPackageId(itemDto.getPackageId());
				hib.setGrandTotal(itemDto.getGrandTotal());

				hib.setCreatedBy(selectView.getUserFk());
				hib.setCreatedDate(new Date());

				hib.setLastActBy(selectView.getUserFk());
				hib.setLastActDate(new Date());

				consolidationLocationRequestRepository.save(hib);

				// Update location request details
				List<QuotationRequestDetailHib> lrHib = quotationRequestDetailRepository
						.retriveByPeriodItemIdStatusFk(selectView.getPeriod(), itemDto.getItemId());

				if (lrHib != null && !lrHib.isEmpty()) {
					for (QuotationRequestDetailHib lrh : lrHib) {
						lrh.setStatusFk(1);
						quotationRequestDetailRepository.save(lrh);

						QuotationRequeustHeadHib hi = quotationRequeustHeadRepository.findByHeadPk(lrh.getReqHeadFk());
						if (hi != null) {
							hi.setStatusFk(1); // Consolidated
							hi.setConId(finalID);
							quotationRequeustHeadRepository.save(hi);
						}
					}
				}

				response.setSuccess(AppConstants.TRUE);
			}
		} catch (Exception e) {
			log.error("Error processing consolidation items: ", e);
			response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
			response.setSuccess(AppConstants.FALSE);
		}
	}

	public String generateConNo() {
		Date date = new Date(); // current date
		String year = new SimpleDateFormat("yyyy").format(date);
		String month = new SimpleDateFormat("MM").format(date);
		String day = new SimpleDateFormat("dd").format(date);

		return "CON" + year + month + day;
	}

	public String generateConNo(Integer number) {
		Date date = new Date(); // current date
		String year = new SimpleDateFormat("yyyy").format(date);
		String month = new SimpleDateFormat("MM").format(date);
		String day = new SimpleDateFormat("dd").format(date);
		NumberFormat decimalFormat = new DecimalFormat("0000");
		String x = decimalFormat.format(number);

		return "CON" + year + month + day + x;
	}

	public ConsolidationLocationRequestDTO mapConsolidationHibToDTO(ConsolidationLocationRequestHib hib,
			String consolidationId, ResponseDTO<List<ConsolidationLocationRequestDTO>> response) {

		try {
			ConsolidationLocationRequestDTO dto = new ConsolidationLocationRequestDTO();

			dto.setConsolidationId(consolidationId);
			dto.setItemId(hib.getItemId());
			dto.setPackageId(hib.getPackageId());
			dto.setGrandTotal(hib.getGrandTotal());
			dto.setSupplierId("N/A");
			dto.setSupplierName("N/A");
			dto.setStatusFk(hib.getStatusFk());

			// Supplier logic for status 2 or 3
			if (dto.getStatusFk() == 2 || dto.getStatusFk() == 3) {
				if (hib.getSupId() != null) {
					SuppliersHib suppliersHib = suppliersRepository.findName(hib.getSupId());
					dto.setSupplierId(hib.getSupId());
					dto.setSupplierName(suppliersHib != null ? suppliersHib.getSupplierName() : "N/A");
				}
				dto.setNetValue(hib.getNetPrice());
				dto.setGp(hib.getGrossPrice());
			}

			// Item name
			ItemHib itemHib = itemRepository.findId(dto.getItemId());
			dto.setItemName(itemHib != null ? itemHib.getItemName() : "N/a");
			response.setSuccess(AppConstants.TRUE);

			return dto;
		} catch (Exception e) {
			log.warn("Error mapping consolidation DTO for consLocReqPK {}: {}", hib.getConsLocReqPk(), e.getMessage());
			// Set failure in response
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed mapping consolidation record: " + e.getMessage());
			return null; // Skip this record
		}
	}

	public String generateQuotationID() {
		Date date = new Date();
		return "QTN" + new SimpleDateFormat("yyyyMMdd").format(date);
	}

	public String generateQuotationID(Integer number) {
		Date date = new Date();
		String datePart = new SimpleDateFormat("yyyyMMdd").format(date);
		String numPart = new DecimalFormat("0000").format(number);
		return "QTN" + datePart + numPart;
	}

	// ------------------------------------------------------------------------------------//

	// Quotation Reply - Bharath Parthiban (25-11-2025)

	public String getSupplierName(String supplierId, List<SuppliersHib> suppliers) {
		if (suppliers == null || suppliers.isEmpty() || supplierId == null) {
			return "N/A";
		}

		for (SuppliersHib supplier : suppliers) {
			if (supplier.getSupplierId().equalsIgnoreCase(supplierId)) {
				return supplier.getSupplierName();
			}
		}

		return "N/A";
	}

	public List<LocationRequestDTO> buildConsolidationSubList(String consolidationId) {
		List<LocationRequestDTO> subList = new ArrayList<>();

		if (consolidationId == null) {
			return subList;
		}

		List<ConsolidationLocationRequestHib> consolidationList = consolidationLocationRequestRepository
				.byConsolidationIdSingle(consolidationId);

		if (consolidationList != null && !consolidationList.isEmpty()) {
			for (ConsolidationLocationRequestHib cHib : consolidationList) {
				LocationRequestDTO subDto = new LocationRequestDTO();

				ItemHib itemHib = itemRepository.findId(cHib.getItemId());
				subDto.setItemName(itemHib != null ? itemHib.getItemName() : "N/A");

				subDto.setItemId(cHib.getItemId());
				subDto.setPackageId(cHib.getPackageId());
				subDto.setQty(cHib.getGrandTotal());

				subList.add(subDto);
			}
		}

		return subList;
	}

	public List<LocationRequestDTO> buildQuotationDetailItems(List<QuotationProcessDetailHib> detailList) {
		List<LocationRequestDTO> items = new ArrayList<>();

		if (detailList == null || detailList.isEmpty()) {
			return items; // return empty list early
		}

		for (QuotationProcessDetailHib detailHib : detailList) {
			LocationRequestDTO itemDto = new LocationRequestDTO();

			itemDto.setQuotationProcessDetailPk(detailHib.getQtnReqDetailPk());

			ItemHib itemHib = itemRepository.findId(detailHib.getItemId());
			itemDto.setItemName(itemHib != null ? itemHib.getItemName() : "N/A");

			itemDto.setItemId(detailHib.getItemId());
			itemDto.setPackageId(detailHib.getPackageId());
			itemDto.setQty(detailHib.getQty());
			itemDto.setGp(detailHib.getRgp());     
			itemDto.setGpOld(detailHib.getGp());
			itemDto.setTotalCost(detailHib.getQty() * detailHib.getRgp());

			items.add(itemDto);
		}

		return items;
	}

	public void updateGpForItems(List<LocationRequestDTO> items, String quotationTransNo,
			ResponseDTO<LocationRequestDTO> response) {

		if (items == null || items.isEmpty()) {
			return; // nothing to do
		}

		try {
			for (LocationRequestDTO editDto : items) {

				QuotationProcessDetailHib detailHib = quotationProcessDetailRepository
						.findById(editDto.getQuotationProcessDetailPk());

				if (detailHib == null) {
					detailHib = quotationProcessDetailRepository.byItemIdAndQtn(editDto.getItemId(), quotationTransNo);
				}

				if (detailHib != null) {
					if (detailHib.getRgp() == 0) {
						detailHib.setRgp(editDto.getGp());
					} else if (detailHib.getRgp() != 0) {
						detailHib.setGp(detailHib.getRgp()); // backup old RGP
						detailHib.setRgp(editDto.getGp()); // set new price
					}
					quotationProcessDetailRepository.save(detailHib);
				}
			}

			// Only reach here if everything succeeded
			response.setSuccess(AppConstants.TRUE);

		} catch (Exception e) {
			// Any DB or unexpected error → mark response as failed
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to update GP for one or more items");
			log.error("Error updating GP for quotation {}: {}", quotationTransNo, e.getMessage(), e);
			// Do NOT rethrow — we want to continue and return proper response
		}
	}

	void resetSupplierSelectionForItem(String consolidationId, int itemId, List<QuotationProcessHeadHib> qHeadHibList,
			ResponseDTO<LocationRequestDTO> response) {

		try {

			for (QuotationProcessHeadHib hib : qHeadHibList) {

				List<QuotationProcessDetailHib> detailList = quotationProcessDetailRepository
						.subTable(hib.getQtnReqHeadPk());

				if (detailList != null && !detailList.isEmpty()) {

					for (QuotationProcessDetailHib detail : detailList) {

						if (detail.getItemId() == itemId) {

							detail.setGp(0);
							detail.setRgp(0);
							detail.setNp(0);
							detail.setSelectionType("");
							detail.setPreSupId("");
							detail.setDiscPer(0);
							detail.setNoOfDay(0);

							quotationProcessDetailRepository.save(detail);

							selectedSupplierRepository.deleteItemByItemCon(consolidationId, itemId);
						}
					}
				}
			}

			response.setSuccess(AppConstants.TRUE); // BOOLEAN
		} catch (Exception ex) {
			response.setSuccess(AppConstants.FALSE); // BOOLEAN
			response.setMessage("Failed while updating itemId: " + itemId);

			log.error("Error in resetSupplierSelectionForItem for itemId {}: {}", itemId, ex.getMessage(), ex);
		}
	}

	// ------------------------------------------------------------------------------------------//

	
	// Price Computation
	
	public void updateNetPrices(List<QuotationProcessHeadHib> headList) {

		EntityEiisHib eiisEntity = entityEiisRepository.findByPk(1);

		headList.forEach(head -> {
			List<QuotationProcessDetailHib> details = quotationProcessDetailRepository.subTable(head.getQtnReqHeadPk());

			if (details == null || details.isEmpty())
				return;

			SuppliersHib supplier = suppliersRepository.findName(head.getSupplierId());
			if (supplier == null)
				return;

			double termDiscount = supplier.getDiscountPer();
			double supplierTerm = supplier.getNoDays();
			double interestRate = eiisEntity.getInterestRate();

			details.forEach(d -> {
				double gp = d.getRgp();
				double d1 = (gp * termDiscount) / 100;
				double d2 = (gp * interestRate * supplierTerm) / 36500;
				double netPrice = gp - d1 - d2;

				d.setNp(netPrice);
				d.setNoOfDay((int) supplierTerm);
				d.setDiscPer(termDiscount);
				d.setSelectionType("");

				quotationProcessDetailRepository.save(d);
			});
		});
	}

	public List<QuotationProcessDetailHib> fetchAllDetails(List<QuotationProcessHeadHib> headList) {

		return headList.stream().map(head -> quotationProcessDetailRepository.subTable(head.getQtnReqHeadPk()))
				.filter(Objects::nonNull).flatMap(List::stream).toList();
	}

	public void processSelection(String consolidationId, int userFk, List<QuotationProcessHeadHib> headList,
			List<QuotationProcessDetailHib> allDetails) {

		List<ConsolidationLocationRequestHib> locations = consolidationLocationRequestRepository
				.byConsolidationIdSingle(consolidationId);

		if (locations == null || locations.isEmpty())
			return;

		EntityEiisHib eiisEntity = entityEiisRepository.findByPk(1);

		locations.forEach(loc -> {

			// ---- Find minimum NP ----
			double minNp = allDetails.stream().filter(d -> d.getItemId() == loc.getItemId())
					.mapToDouble(QuotationProcessDetailHib::getNp).filter(v -> v > 0).min().orElse(Double.MAX_VALUE);

			if (minNp == Double.MAX_VALUE)
				return;

		
			allDetails.stream()
		    .filter(d -> d.getItemId() == loc.getItemId() && d.getNp() == minNp)
		    .findFirst()
		    .ifPresent(detail -> {

		        detail.setSelectionType("S");
		        quotationProcessDetailRepository.save(detail);

		        saveSelectedSupplier(detail, headList, loc, minNp, userFk, eiisEntity);
		    });
		});
	}

	public void saveSelectedSupplier(QuotationProcessDetailHib detail, List<QuotationProcessHeadHib> headList,
			ConsolidationLocationRequestHib loc, double minNp, int userFk, EntityEiisHib eiisEntity) {

		QuotationProcessHeadHib head = headList.stream()
				.filter(h -> h.getQtnReqHeadPk() == detail.getQuotationReqHeadFk()).findFirst().orElseThrow();

		SelectedSupplierHib ss = new SelectedSupplierHib();
		ss.setItemId(detail.getItemId());
		ss.setPackageId(detail.getPackageId());
		ss.setPeriod(loc.getPeriod());
		ss.setConsolidationId(loc.getConsolidationId());
		ss.setNp(minNp);

		ss.setSupplierId(head.getSupplierId());
		ss.setCurrencyId(eiisEntity.getCurrencyId());
		ss.setCurrencyRate(1.0);
		ss.setGp(detail.getRgp());
		ss.setEntityId(eiisEntity.getEntity());
		ss.setIsPriceMailSent("");

		ss.setCreatedBy(userFk);
		ss.setCreatedDate(new Date());
		ss.setLastActBy(userFk);
		ss.setLastActDate(new Date());

		ss.setsDiscountPerc(detail.getDiscPer());
		ss.setsNoDays(detail.getNoOfDay());

		selectedSupplierRepository.save(ss);
	}

	public ResponseDTO<String> successResponse(String msg) {
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setSuccess(AppConstants.TRUE);
		response.setMessage("Success");
		response.setData(msg);
		return response;
	}

	public ResponseDTO<String> failureResponse(String msg) {
		ResponseDTO<String> response = new ResponseDTO<>();
		response.setSuccess(AppConstants.FALSE);
		response.setMessage("failed");
		response.setData(msg);
		return response;
	}

	// ---------------------------------------------------------------------------------------------------------//

	
	
	public LocationRequestDTO buildItemDTO(Object[] obj,
	        Map<Integer, List<QuotationProcessDetailHib>> detailMap) {

	    LocationRequestDTO idto = new LocationRequestDTO();

	    idto.setItemId(Integer.parseInt(obj[0].toString()));
	    idto.setItemName(obj[1].toString());
	    idto.setPackageId(obj[2].toString());
	    idto.setSupplierIdLast(obj[3].toString());
	    idto.setGpLast((double) obj[4]);
	    idto.setSupplierNameLast(obj[5].toString());
	    idto.setCheckBox(true);

	    int itemId = idto.getItemId();

	    List<QuotationProcessDetailHib> details =
	            detailMap.getOrDefault(itemId, Collections.emptyList());

	    List<LocationRequestDTO> subList = details.stream()

	            // ✅ same as original: skip gross = 0
	            .filter(detail -> detail.getRgp() != 0)

	            .map(detail -> {

	                LocationRequestDTO sdto = new LocationRequestDTO();

	                QuotationProcessHeadHib hHib =
	                        quotationProcessHeadRepository.findOne(
	                                detail.getQuotationReqHeadFk());

	                SuppliersHib sup =
	                        suppliersRepository.findName(hHib.getSupplierId());

	                sdto.setSupplierId(hHib.getSupplierId());
	                sdto.setSupplierName(sup.getSupplierName());
	                sdto.setRegion(detail.getEntityId());
	                sdto.setLocationRequestDetailsPk(detail.getQtnReqDetailPk());
	                sdto.setTerm(detail.getNoOfDay());
	                sdto.setDisc(detail.getDiscPer());
	                sdto.setGross(detail.getRgp());
	                sdto.setNet(detail.getRgp());
	                sdto.setNetPp(detail.getNp());
	                sdto.setQty(detail.getQty());
	                sdto.setTotalCost(detail.getQty() * detail.getNp());
	                sdto.setNetUp(detail.getNp());
	                sdto.setStats(detail.getSelectionType());
	                sdto.setRemarks(
	                        detail.getRemarks() == null ? "" : detail.getRemarks()
	                );

	                // ✅ handle selected supplier logic (missing in your version)
	                if ("S".equalsIgnoreCase(detail.getSelectionType())) {
	                    idto.setNetPp(detail.getNp());
	                    idto.setSupplierId(hHib.getSupplierId());
	                }

	                // ✅ previous supplier logic (missing in your version)
	                if (detail.getPreSupId() != null &&
	                        !detail.getPreSupId().trim().isEmpty()) {
	                    idto.setPreSupId(detail.getPreSupId());
	                }

	                return sdto;
	            })
	            .toList();

	    idto.setSubList(subList);
	    return idto;
	}

	
	
	
	public LocationRequestDTO buildItemDTOByConAndItemId(Object[] obj, Map<Integer, List<QuotationProcessDetailHib>> detailMap) {

		LocationRequestDTO idto = new LocationRequestDTO();

		idto.setItemId(Integer.parseInt(obj[0].toString()));
		idto.setItemName(obj[1].toString());
		idto.setPackageId(obj[2].toString());
		idto.setSupplierIdLast(obj[3].toString());
		idto.setGpLast((double) obj[4]);
		idto.setSupplierNameLast(obj[5].toString());
		idto.setCheckBox(true);
		int itemId = idto.getItemId();

		List<QuotationProcessDetailHib> details = detailMap.getOrDefault(itemId, Collections.emptyList());

		List<LocationRequestDTO> subList = details.stream().map(detail -> {
			LocationRequestDTO sdto = new LocationRequestDTO();

			QuotationProcessHeadHib hHib = quotationProcessHeadRepository.findOne(detail.getQuotationReqHeadFk());

			System.out.println("Pk value is  - "+detail.getQuotationReqHeadFk());
			
			SuppliersHib sup = suppliersRepository.findName(hHib.getSupplierId());

			sdto.setSupplierId(hHib.getSupplierId());
			sdto.setSupplierName(sup.getSupplierName());
			sdto.setRegion(detail.getEntityId());
			sdto.setLocationRequestDetailsPk(detail.getQtnReqDetailPk());
			sdto.setTerm(detail.getNoOfDay());
			sdto.setDisc(detail.getDiscPer());
			sdto.setGross(detail.getRgp());
			sdto.setNet(detail.getRgp());
			sdto.setNetPp(detail.getNp());
			
			System.out.println("NNP - "+detail.getNp());
			sdto.setQty(detail.getQty());
			sdto.setTotalCost(detail.getQty() * detail.getNp());
			sdto.setNetUp(detail.getNp());
			sdto.setStats(detail.getSelectionType());
			sdto.setRemarks(detail.getRemarks() == null ? "" : detail.getRemarks());

			return sdto;
		}).toList();

		idto.setSubList(subList);
		return idto;
	}

	public String extractJsonValue(String json, String key) {
		String pattern = "\"" + key + "\":\\s*\"([^\"]+)\"";
		java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
		return m.find() ? m.group(1) : null;
	}

	// -------------------------------------------------------------------------------------------------------------//

	// Change the System Selected Supplier - Udayakumar(03-12-2025)

	public List<QuotationProcessDetailHib> collectAllDetails(List<QuotationProcessHeadHib> headList) {
		List<QuotationProcessDetailHib> result = new ArrayList<>();

		for (QuotationProcessHeadHib hib : headList) {
			List<QuotationProcessDetailHib> details = quotationProcessDetailRepository.subTable(hib.getQtnReqHeadPk());

			if (details != null && !details.isEmpty()) {
				result.addAll(details);
			}
		}
		return result;
	}

	public boolean hasItems(LocationRequestDTO dto) {
		return dto.getItems() != null && !dto.getItems().isEmpty();
	}

	public void processItems(LocationRequestDTO locationDTO, List<QuotationProcessDetailHib> qDetailHibListCalc) {

		for (LocationRequestDTO dto : locationDTO.getItems()) {
			for (LocationRequestDTO sdto : dto.getSubList()) {

				QuotationProcessDetailHib hib = quotationProcessDetailRepository
						.findByQtnReqDetailPk(sdto.getLocationRequestDetailsPk());

				if (hib != null) {
					updateQuotationDetail(dto, sdto, hib);
					updateSelectedSupplierRecord(locationDTO, dto, sdto, hib);
					quotationProcessDetailRepository.save(hib);
				}
			}
		}
	}

	public void updateQuotationDetail(LocationRequestDTO dto, LocationRequestDTO sdto, QuotationProcessDetailHib hib) {
		hib.setSelectionType("");

		if ("S".equalsIgnoreCase(sdto.getStats())) {
			hib.setSelectionType("S");
			hib.setRemarks(dto.getCurrencyId());
			hib.setPreSupId(dto.getSupplierId());
		}
	}

	private void updateSelectedSupplierRecord(LocationRequestDTO locationDTO, LocationRequestDTO dto,
			LocationRequestDTO sdto, QuotationProcessDetailHib hib) {
		if (!"S".equalsIgnoreCase(sdto.getStats())) {
			return;
		}

		SelectedSupplierHib shib = selectedSupplierRepository.retriveBYConItem(locationDTO.getConsolidationId(),
				dto.getItemId(), dto.getPeriod());

		if (shib != null) {
			shib.setSupplierId(sdto.getSupplierId());
			shib.setGp(hib.getRgp());
			shib.setNp(hib.getNp());
			shib.setsDiscountPerc(hib.getDiscPer());
			shib.setsNoDays(hib.getNoOfDay());
			selectedSupplierRepository.save(shib);
		}
	}

	public ResponseDTO<String> buildFailureResponse(ResponseDTO<String> response, String message) {
		response.setSuccess(false);
		response.setMessage(message);
		response.setData(null);
		return response;
	}
	
	//-------------------------------------------------------------------------------//
	
	//Finalize the Supplier Selection - Bharath Parthiban(06-12-2025)
	
	
	public void processConsolidationSupplierSelection(
	        List<ConsolidationLocationRequestHib> conHibList,
	        List<QuotationProcessDetailHib> qDetailHibListCalc,
	        LocationRequestDTO locationRequestDTO,
	        ResponseDTO<LocationRequestDTO> response) {
 
	    try {
 
	        if (conHibList != null && !conHibList.isEmpty()) {
 
	            for (ConsolidationLocationRequestHib cHib : conHibList) {
 
	                // CALL THE NEW METHOD (contains same original logic)
	                processSupplierSelection(cHib, qDetailHibListCalc, locationRequestDTO, response);
	            }
 
	            // update status
	            
	            quotationRequeustHeadRepository.updateStatusFk3(locationRequestDTO.getConsolidationId());
	            
	            
	        }
 
	        response.setSuccess(true);
	        response.setMessage("Supplier consolidation process completed.");
 
	    } catch (Exception e) {
	        e.printStackTrace();
	        response.setSuccess(false);
	        response.setMessage("Error during supplier consolidation: " + e.getMessage());
	    }
	}
	private void processSupplierSelection(
	        ConsolidationLocationRequestHib cHib,
	        List<QuotationProcessDetailHib> qDetailHibListCalc,
	        LocationRequestDTO locationRequestDTO,
	        ResponseDTO<LocationRequestDTO> response) {
 
	    try {
 
	        String selectedSup = "";
	        double gp = 0;
	        double np = 0;
 
	        // find supplier and prices
	        for (QuotationProcessDetailHib dHib : qDetailHibListCalc) {
 
	            if (dHib.getItemId() == cHib.getItemId()
	                    && "S".equalsIgnoreCase(dHib.getSelectionType())) {
 
	                QuotationProcessHeadHib hib =
	                        quotationProcessHeadRepository.findByIdPk(
	                                dHib.getQuotationReqHeadFk());
 
	                if (hib != null) {
	                    selectedSup = hib.getSupplierId();
	                }
 
	                gp = dHib.getRgp();
	                np = dHib.getNp();
 
	                SelectedSupplierHib selHib =
	                        selectedSupplierRepository.retriveBYConItemSuppl(
	                                cHib.getConsolidationId(),
	                                cHib.getItemId(),
	                                selectedSup,
	                                cHib.getPeriod());
 
	                if (selHib != null) {
	                    selHib.setGp(gp);
	                    selHib.setNp(np);
	                }
	            }
	        }
 
	        // CALL your existing updateRequestDetailsAndSave()
	        applyRequestDetailsAndSaveLogic(cHib, selectedSup, gp, np, locationRequestDTO, response);
 
	    } catch (Exception e) {
	        e.printStackTrace();
	        response.setSuccess(false);
	        response.setMessage("Error in supplier selection: " + e.getMessage());
	    }
	}
 
 
	
	
 
	private void applyRequestDetailsAndSaveLogic(
	        ConsolidationLocationRequestHib cHib,
	        String selectedSup,
	        double gp,
	        double np,
	        LocationRequestDTO locationRequestDTO,
	        ResponseDTO<LocationRequestDTO> response) {
 
	    try {
 
	        // update consolidation hib
	        cHib.setSupId(selectedSup);
	        cHib.setGrossPrice(gp);
	        cHib.setNetPrice(np);
	        cHib.setStatusFk(2);
 
	        // call the split method
	        updateRequestDetails(locationRequestDTO, cHib, selectedSup);
 
	        // save consolidation
	        consolidationLocationRequestRepository.save(cHib);
 
	    } catch (Exception e) {
	        e.printStackTrace();
	        response.setSuccess(AppConstants.FALSE);
	        response.setMessage("Unexpected error while updating");
	    }
	}
	
	private void updateRequestDetails(
	        LocationRequestDTO locationRequestDTO,
	        ConsolidationLocationRequestHib cHib,
	        String selectedSup) {
 
	    List<QuotationRequeustHeadHib> headList =
	    		quotationRequeustHeadRepository.findByConsolidationIdStatNothing(
	                    locationRequestDTO.getConsolidationId());
 
	    if (headList == null || headList.isEmpty()) {
	        return;
	    }
 
	    for (QuotationRequeustHeadHib head : headList) {
	        processDetailList(head.getReqHeadPk(), cHib, selectedSup);
	    }
	}
	
	private void processDetailList(
	        int reqHeadPk,
	        ConsolidationLocationRequestHib cHib,
	        String selectedSup) {
 
	    List<QuotationRequestDetailHib> detailList =
	    		quotationRequestDetailRepository.findId(reqHeadPk);
 
	    if (detailList == null || detailList.isEmpty()) {
	        return;
	    }
 
	    for (QuotationRequestDetailHib detail : detailList) {
	        if (detail.getItemId() == cHib.getItemId()) {
	            detail.setSupplierId(selectedSup);
	            quotationRequestDetailRepository.save(detail);
	        }
	    }
	}
	
	public static List<Date> getStartDatesOfMonths(Date startDate, Date endDate) {
		List<Date> startDates = new ArrayList<>();
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(startDate);
 
		// Move to the start of the next month to exclude the first month
		calendar.add(Calendar.MONTH, 1);
		calendar.set(Calendar.DAY_OF_MONTH, 1);
 
		while (!calendar.getTime().after(endDate)) {
			startDates.add(calendar.getTime());
			calendar.add(Calendar.MONTH, 1);
		}
 
		return startDates;
	}
}
