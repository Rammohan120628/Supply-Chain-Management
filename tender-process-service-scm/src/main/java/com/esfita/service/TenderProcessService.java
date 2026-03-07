/**
 * 
 * @author Rammohan R
 * @since 18-Nov-2025
 * 
 */
package com.esfita.service;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.esfita.common.AppConstants;
import com.esfita.common.ComboBoxDTO;
import com.esfita.common.ErrorDescription;
import com.esfita.common.ResponseDTO;
import com.esfita.common.RestException;
import com.esfita.dto.ConsolidationLocationRequestDTO;
import com.esfita.dto.FileResponseDTO;
import com.esfita.dto.LocationRequestDTO;
import com.esfita.dto.SupplierItemMasterDTO;
import com.esfita.entity.ApprovalProductListHib;
import com.esfita.entity.ConsolidationLocationRequestHib;
import com.esfita.entity.EntityEiisHib;
import com.esfita.entity.ItemHib;
import com.esfita.entity.LocationHib;
import com.esfita.entity.QuotationProcessDetailHib;
import com.esfita.entity.QuotationProcessHeadHib;
import com.esfita.entity.QuotationRequestDetailHib;
import com.esfita.entity.QuotationRequeustHeadHib;
import com.esfita.entity.SelectedSupplierHib;
import com.esfita.entity.SuppliersHib;
import com.esfita.entity.SuppliersItemHib;
import com.esfita.repository.ApprovalProductListRepository;
import com.esfita.repository.ConsolidationLocationRequestRepository;
import com.esfita.repository.EntityEiisRepository;
import com.esfita.repository.ItemRepository;
import com.esfita.repository.LocationRepository;
import com.esfita.repository.LocationRequestDetailRepository;
import com.esfita.repository.LocationRequeustHeadRepository;
import com.esfita.repository.QuotationProcessDetailRepository;
import com.esfita.repository.QuotationProcessHeadRepository;
import com.esfita.repository.QuotationRequestDetailRepository;
import com.esfita.repository.QuotationRequeustHeadRepository;
import com.esfita.repository.SelectedSupplierRepository;
import com.esfita.repository.SuppliersItemRepository;
import com.esfita.repository.SuppliersRepository;
import com.esfita.service.CommonService.ProcessedRequestData;

import jakarta.transaction.Transactional;



@Service
public class TenderProcessService {

	private static final Logger log = LoggerFactory.getLogger(TenderProcessService.class);

	@Autowired
	QuotationRequeustHeadRepository quotationRequeustHeadRepository;
	@Autowired
	QuotationRequestDetailRepository quotationRequestDetailRepository;
	@Autowired
	ApprovalProductListRepository approvalProductListRepository;
	@Autowired
	SelectedSupplierRepository selectedSupplierRepository;
	@Autowired
	ItemRepository itemRepository;
	@Autowired
	SuppliersRepository suppliersRepository;
	@Autowired
	LocationRepository locationRepository;
	@Autowired
	ConsolidationLocationRequestRepository consolidationLocationRequestRepository;
	@Autowired
	QuotationProcessHeadRepository quotationProcessHeadRepository;
	@Autowired
	QuotationProcessDetailRepository quotationProcessDetailRepository;
	@Autowired
	SuppliersItemRepository suppliersItemRepository;
	@Autowired
	EntityEiisRepository entityEiisRepository;
	@Autowired
	LocationRequeustHeadRepository locationRequeustHeadRepository;
	@Autowired
	LocationRequestDetailRepository locationRequestDetailRepository;
	@Autowired
	CommonService commonService;
	
	@Value("${python.api.base.url}")
	private String pythonBaseUrl;
	
	
	public ResponseDTO<List<ComboBoxDTO>> dropDownLocation() {
		try {
			List<LocationHib> locationHibList = locationRepository.activeLocations();
			List<ComboBoxDTO> comboList = new ArrayList<>();

			if (locationHibList != null && !locationHibList.isEmpty()) {
				for (LocationHib hib : locationHibList) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getLocationPk());
			//	dto.setLocationId(hib.getLocationId());
			//		dto.setLocationName(hib.getLocationName());
					comboList.add(dto);
				}
			}

			return ResponseDTO.<List<ComboBoxDTO>>builder().success(true)
					.message("Location list retrieved successfully").data(comboList).build();

		} catch (RestException re) {
			return ResponseDTO.<List<ComboBoxDTO>>builder().success(false).message(AppConstants.ERROR + re.getMessage())
					.data(null).build();

		} catch (Exception e) {
			return ResponseDTO.<List<ComboBoxDTO>>builder().success(false)
					.message("Internal server error: " + e.getMessage()).data(null).build();
		}
	}

	
	
	public ResponseDTO<List<LocationRequestDTO>> loadAPLForLocationRequest(String locationId) {
		ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();
		List<LocationRequestDTO> uploadedItem = new ArrayList<>();

		try {
			List<ApprovalProductListHib> locationIdBased = approvalProductListRepository
					.retriveByLocationId(locationId);

			if (locationIdBased != null && !locationIdBased.isEmpty()) {

				for (ApprovalProductListHib hib : locationIdBased) {

					LocationRequestDTO item = new LocationRequestDTO();
					item.setAplPk(hib.getAplPk());
					item.setItemId(hib.getItemId());
					item.setPackageId(hib.getPackageId());

					ItemHib itemHib = itemRepository.findId(hib.getItemId());
					item.setItemName(itemHib != null ? itemHib.getItemName() : "N/A");

					uploadedItem.add(item);
				}
				response.setSuccess(true);
				response.setMessage("APL list retrieved successfully");
				response.setData(uploadedItem);
			} else {
				response.setSuccess(false);
				response.setMessage("No APL data found for given location");
				response.setData(Collections.emptyList());
			}
		} catch (RestException re) {
			log.warn("Error while retrieving APL list", re);
			response.setMessage(re.getMessage());

		} catch (Exception e) {
			log.error("Exception occurred while loading APL list", e);
			response.setMessage("Unexpected error occurred");
		}
		return response;
	}

	
	
	
	
	public ResponseDTO<LocationRequestDTO> saveQuotationRequest(LocationRequestDTO locationRequestDTO) {
		ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();

		try {
			if (locationRequestDTO.getLocationId() == null) {
				response.setMessage("Please Choose Location Id");
				response.setSuccess(AppConstants.FALSE);
				return response;
			}

			// Step 1: Create and save header
			QuotationRequeustHeadHib headerHib = commonService.createAndSaveHeader(locationRequestDTO, response);
			if (headerHib == null || !response.isSuccess()) {
				return response;
			}

			// Step 2: Build intList (1 to 31 based on rendered flags)
			List<Integer> intList = commonService.buildIntList(locationRequestDTO);

			// Step 3: Process subList and save details
			if (locationRequestDTO.getSubList() != null && !locationRequestDTO.getSubList().isEmpty()) {
				commonService.processSubListAndSaveDetails(locationRequestDTO, headerHib, intList, response);
				if (!response.isSuccess()) {
					return response;
				}
			}

			// SUCCESS: Only reached if ALL steps succeed
			LocationRequestDTO resultDto = new LocationRequestDTO();
			resultDto.setDownloadUrlPath(headerHib.getReqNo());
			response.setData(null);
			response.setMessage(headerHib.getReqNo()+"-"+AppConstants.MSG_RECORD_CREATED);
			response.setSuccess(AppConstants.TRUE);

		} catch (Exception re) {
			response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
			response.setSuccess(AppConstants.FALSE);
		}
		return response;
	}

	// --------------------------------------------------------------------------------------------//

	// Quotation Request - List Anand (18-11-2025)

	public ResponseDTO<LocationRequestDTO> quotationRequestHeaderList(Date period) {
		ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
		LocationRequestDTO resultDTO = new LocationRequestDTO();

		// Status → corresponding list
		Map<Integer, List<LocationRequestDTO>> statusMap = Map.of(0, new ArrayList<>(), 1, new ArrayList<>(), 2,
				new ArrayList<>(), 3, new ArrayList<>(), 4, new ArrayList<>());

		try {
			List<QuotationRequeustHeadHib> hibList = quotationRequeustHeadRepository.orderByPeriod(period);

			if (hibList == null || hibList.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No records found for the provided period.");
				return response;
			}

			for (QuotationRequeustHeadHib hib : hibList) {
				LocationRequestDTO dto = commonService.mapToDTO(hib);
				commonService.assignDeliveryMode(dto, hib);
				statusMap.getOrDefault(dto.getStatusFk(), new ArrayList<>()).add(dto);
			}

			// assign grouped lists
			resultDTO.setLocReqCreationList(statusMap.get(0));
			resultDTO.setConsolidationList(statusMap.get(1));
			resultDTO.setQuotationReplyList(statusMap.get(2));
			resultDTO.setFinalizetheSupplierSelectionList(statusMap.get(3));
			resultDTO.setAutoGeneratePOList(statusMap.get(4));

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Location Request Headers grouped successfully");
			response.setData(resultDTO);

		} catch (Exception e) {
			log.error("Exception while grouping Location Request Headers for period {}: {}", period, e.getMessage(), e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Error grouping Location Request Headers: " + e.getMessage());
		}

		return response;
	}

	public ResponseDTO<List<LocationRequestDTO>> quotationRequestSubList(int reqHeadPk) {
		ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();

		try {
			
			QuotationRequeustHeadHib headHib = quotationRequeustHeadRepository.findByHeadPk(reqHeadPk);
			
			List<QuotationRequestDetailHib> detailList = quotationRequestDetailRepository.findId(reqHeadPk);

			if (detailList == null || detailList.isEmpty()) {
				log.warn("No records found for ReqHeadPk: {}", reqHeadPk);
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No records found for ReqHeadPk: " + reqHeadPk);
				return response;
			}
			
			List<LocationRequestDTO> subList =
			        detailList.stream()
			                  .map(detail -> commonService.mapDetailToDTO(detail, headHib))
			                  .collect(Collectors.toList());

			
			
			
			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Location Request Details fetched successfully");
			response.setData(subList);
			log.info("<--- Location Request Details fetched successfully for ReqHeadPk: {} --->", reqHeadPk);

		} catch (RestException re) {
			log.warn("RestException fetching details for ReqHeadPk: {}", reqHeadPk, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Error fetching location request details: " + re.getMessage());
		} catch (Exception e) {
			log.error("Exception fetching details for ReqHeadPk: {}", reqHeadPk, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Exception occurred while fetching details: " + e.getMessage());
		}

		return response;
	}

	// ----------------------------------------------------------------------------------------------//

	// Quotation Request Bulk Upload- Bharath Parthiban (19-11-2025)

	public List<LocationRequestDTO> readExcelAndConvert(MultipartFile file, String period) throws IOException {
		SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
		java.sql.Date sqlPeriod = java.sql.Date.valueOf(LocalDate.parse(period));

		try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
			Sheet sheet = workbook.getSheetAt(0);

			return IntStream.rangeClosed(1, sheet.getLastRowNum()) // Skip header (row 0)
					.mapToObj(sheet::getRow).filter(Objects::nonNull)
					.map(row -> commonService.mapRowToDTO(row, period, sdf, sqlPeriod)).filter(Objects::nonNull) // remove
																													// invalid/null
																													// rows
					.toList();
		}
	}

	public ResponseDTO<LocationRequestDTO> saveQuotationRequestBulUpload(LocationRequestDTO locationRequestDTO) {
		ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
		try {

			if (locationRequestDTO.getLocationId() != null) {

				QuotationRequeustHeadHib headerHib = new QuotationRequeustHeadHib();

				String finalId = null;
				String ref = commonService.generateLocationReqNo();
				ref += "%";

				List<QuotationRequeustHeadHib> transactionNoList = quotationRequeustHeadRepository.transactionNo(ref);

				if (transactionNoList != null && transactionNoList.size() > AppConstants.ZERO) {
					finalId = commonService.generateLocationReqNo(transactionNoList.size() + 1);
				} else {
					finalId = commonService.generateLocationReqNo(1);
				}

				headerHib.setReqNo(finalId);
				headerHib.setPeriod(locationRequestDTO.getPeriod());
				headerHib.setLocationId(locationRequestDTO.getLocationId());
				headerHib.setEntityId(locationRequestDTO.getEntityId());

				headerHib.setProcessed("");
				headerHib.setIsFinal(0);
				headerHib.setStatusFk(0); // 0 means created

				headerHib.setDeliveryMode(1);

				headerHib.setCreatedBy(locationRequestDTO.getUserFk());
				headerHib.setCreatedDate(new Date());

				headerHib.setLastUser(locationRequestDTO.getUserFk());
				headerHib.setLastUpdate(new Date());

				headerHib.setConId("");

				quotationRequeustHeadRepository.save(headerHib);

				if (locationRequestDTO.getSubList() != null && !locationRequestDTO.getSubList().isEmpty()) {		
					commonService.saveLocationRequestDetailsSub(locationRequestDTO, headerHib, response);
				}

				if (response.isSuccess()) {
					LocationRequestDTO dto = new LocationRequestDTO();
					dto.setDownloadUrlPath(headerHib.getReqNo());
					response.setMessage(headerHib.getReqNo() + "-" + AppConstants.MSG_RECORD_CREATED);
					response.setSuccess(AppConstants.TRUE);
					response.setData(null);
				}

			} else {
				response.setMessage("Please Choose Location Id");
				response.setSuccess(AppConstants.FALSE);
			}
		} catch (RestException exception) {

			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Unsuccessful");
		}

		return response;
	}

	// -----------------------------------------------------------------------------------------------//

	public ResponseDTO<List<ComboBoxDTO>> dropDownQuotationReqNo(Date monthYear) {

		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();

		try {
			List<QuotationRequeustHeadHib> heads = quotationRequeustHeadRepository.byPeriodAndStatus0(monthYear);

			if (heads != null && !heads.isEmpty()) {
				for (QuotationRequeustHeadHib hib : heads) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getReqHeadPk());
					dto.setReqNo(hib.getReqNo());
					dto.setLocationId(hib.getLocationId());
					comboList.add(dto);
				}

				response.setSuccess(true);
				response.setMessage("Quotation Request Numbers Loaded Successfully");
				response.setData(comboList);

			} else {
				response.setSuccess(false);
				response.setMessage("No records found for given period");
				response.setData(comboList);
			}

		} catch (RestException re) {
			response.setSuccess(false);
			response.setMessage("Error: " + re.getMessage());
			response.setData(null);

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Unexpected error: " + e.getMessage());
			response.setData(null);
		}

		return response;
	}

	public ResponseDTO<Map<String, Object>> getreqDetailList(int reqHeadFK) {
		try {

			List<QuotationRequestDetailHib> locationRequestDetailHib = quotationRequestDetailRepository
					.getreqDetailList(reqHeadFK);

			if (locationRequestDetailHib == null || locationRequestDetailHib.isEmpty()) {
				return commonService.buildErrorResponse("No request details found");
			}

			ProcessedRequestData processedData = commonService.processRequestDetails(locationRequestDetailHib,
					reqHeadFK);

			Map<String, Object> responseData = new HashMap<>();
			responseData.put("overallList", processedData.getRenddto());
			responseData.put("reqDetailList", processedData.getReqDetailList());

			return ResponseDTO.<Map<String, Object>>builder().success(true)
					.message("Request details retrieved successfully").data(responseData).build();

		} catch (RestException re) {
			return commonService.buildErrorResponse("Error retrieving request details: " + re.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return commonService.buildErrorResponse("Internal server error");
		}
	}
	
	
	//-------------------------------------------------------------------------------------------------------------------//
	
	
	
	// Quotation Request Modify - Bharath Parthiban (19-11-2025)
	
	
	
	public ResponseDTO<LocationRequestDTO> updateQuotationRequestProcess(LocationRequestDTO locationRequestDTO) {
	    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();

	    try {
	        // 1. Validate Location ID
	        if (locationRequestDTO.getLocationId() == null) {
	            response.setMessage("Please Choose Location Id");
	            response.setSuccess(AppConstants.FALSE);
	            return response;
	        }
	        
	        // 2. Build list of rendered days (replaces 31 if statements)
	        List<Integer> dayList = commonService.buildRenderedDaysList(locationRequestDTO);

	        // 3. Check if there's anything to update
	     
	        

	        if (locationRequestDTO.getSubList() == null && locationRequestDTO.getSubList().isEmpty() || locationRequestDTO.getReqTransactionNo()==null) {
	        	   response.setMessage("SubList is empty or ReqTransactionNo is null");
		            response.setSuccess(AppConstants.FALSE);
		            return response;     
	        }

	        // 4. Load header
	        QuotationRequeustHeadHib headerHib = quotationRequeustHeadRepository
	                .getHeadBasedOnReqNo(locationRequestDTO.getReqTransactionNo());

	        if (headerHib == null) {
	            response.setMessage("Request number not found");
	            response.setSuccess(AppConstants.FALSE);
	            return response;
	        }

	        // 5. Delete old details
	        quotationRequestDetailRepository.deleteAlreadyExistData(locationRequestDTO.getReqTransactionNo());

	        // 6. Save all new day-wise details (clean & safe)
	        commonService.processAndSaveUpdatedDetails(locationRequestDTO, headerHib, dayList, response);
			if (response.isSuccess() != AppConstants.FALSE) {
				response.setData(null);
				response.setMessage(locationRequestDTO.getReqTransactionNo()+"-Saved Successfully");
				response.setSuccess(AppConstants.TRUE);
			}
	    } catch (Exception e) {
	        e.printStackTrace();
	        response.setSuccess(AppConstants.FALSE);
	        response.setMessage("Unsuccessful due to Internal Error");
	        return response;
	    }
	    return response;
	}
	
	
	//------------------------------------------------------------------------------------------------------------------------//
	
	
	
	// Consolidation of Location Request  - Bharath Parthiban (24-11-2025)
	
	
	
	public ResponseDTO<List<LocationRequestDTO>> retrieveConsolidationOfLocationRequest(Date monthYear) {
		 ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();
	    try {
	        List<QuotationRequestDetailHib> detailHibs = quotationRequestDetailRepository.retriveDate(monthYear);
	        if (detailHibs != null &&!detailHibs.isEmpty()) {
	            List<LocationRequestDTO> items = new ArrayList<>();

	            for (QuotationRequestDetailHib item : detailHibs) {

	                LocationRequestDTO itemDto = new LocationRequestDTO();
	                Calendar cal = Calendar.getInstance();
	                cal.setTime(item.getRequestDate());
	                int year = cal.get(Calendar.YEAR);
	                int month = cal.get(Calendar.MONTH) + 1;

	                double totalCount = quotationRequestDetailRepository.sumQtyByItemIdAndYearAndMonth(
	                        item.getItemId(), year, month);

	                itemDto.setItemId(item.getItemId());

	                ItemHib itemHib = itemRepository.findId(item.getItemId());

	                if (itemHib != null) {
	                    itemDto.setItemName(itemHib.getItemName());
	                } else {
	                    itemDto.setItemName("N/a");
	                }

	                itemDto.setLocationRequestDetailsPk(item.getReqDetailPk());
	                itemDto.setPackageId(item.getPackageId());
	                itemDto.setGrandTotal(totalCount != 0 ? totalCount : 0);
	                itemDto.setLocationReqFk(item.getReqHeadFk());

	                items.add(itemDto);
	            }

	            response.setSuccess(AppConstants.TRUE);
	            response.setMessage(AppConstants.MSG_RECORD_FETCHED);
	            response.setData(items);
	        }
	    } catch (RestException re) {
	        response.setSuccess(AppConstants.FALSE);
	        response.setMessage("failed");
	        log.warn("Error while getting all roles: ", re);
	    } catch (Exception e) {
	        response.setSuccess(AppConstants.FALSE);
	        response.setMessage("failed");
	        log.error("Exception occurred: ", e);
	    }
	    return response;
	}

	public ResponseDTO<LocationRequestDTO> saveConsolidationLocationRequest(LocationRequestDTO selectView) {
	    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
	    try {
	        String finalID = null;

	        if (selectView.getItems() != null && !selectView.getItems().isEmpty()) {
	            String ref = commonService.generateConNo() + "%";

	            List<ConsolidationLocationRequestHib> transactionNo = consolidationLocationRequestRepository.transactionNo(ref);

	            if (transactionNo != null && transactionNo.size() > AppConstants.ZERO) {
	                finalID = commonService.generateConNo(transactionNo.size() + 1);
	            } else {
	                finalID = commonService.generateConNo(1);
	            }

	            // Process items using the extracted method
	            commonService.processConsolidationItems(finalID, selectView, response);

	            // Set response if processing succeeded
	            if (response.isSuccess()) { // primitive boolean
	                response.setData(null);
	                response.setMessage(finalID+"-"+AppConstants.MSG_RECORD_CREATED);
	                response.setSuccess(AppConstants.TRUE);
	            }

	        } else {
	            response.setMessage("Item List is Empty");
	            response.setSuccess(AppConstants.FALSE);
	        }
	    } catch (RestException exception) {
	        response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
	        response.setSuccess(AppConstants.FALSE);
	        log.warn("Unexpected RestException while Saving: ", exception);
	    } catch (Exception e) {
	        response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
	        response.setSuccess(AppConstants.FALSE);
	        log.warn("Error while saving: ", e);
	    }
	    return response;
	}

	

	
	public ResponseDTO<ConsolidationLocationRequestDTO> consolidationDetailsListAPI(Date period) {

	    ResponseDTO<ConsolidationLocationRequestDTO> response = new ResponseDTO<>();

	    List<ConsolidationLocationRequestDTO> consolidation = new ArrayList<>();
	    List<ConsolidationLocationRequestDTO> quotationReply = new ArrayList<>();
	    List<ConsolidationLocationRequestDTO> finalizeSupplierSelection = new ArrayList<>();
	    List<ConsolidationLocationRequestDTO> autoGeneratePO = new ArrayList<>();

	    try {
	        // Fetch data
	        List<ConsolidationLocationRequestHib> hibList =
	                consolidationLocationRequestRepository.orderByPeriodGroupByConsolidationId(period);
	        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
	        if (hibList != null && !hibList.isEmpty()) {
	            for (ConsolidationLocationRequestHib hib : hibList) {
	                ConsolidationLocationRequestDTO dto = new ConsolidationLocationRequestDTO();

	                dto.setConsLocReqPK(hib.getConsLocReqPk());
	                dto.setConsolidationId(hib.getConsolidationId());
	                dto.setPeriodStr(sdf.format(hib.getPeriod()));
	                dto.setStatusFk(hib.getStatusFk());
	                dto.setCreateDateStr(sdf.format(hib.getCreatedDate()));
	                
	                // Client-side grouping logic
	                switch (dto.getStatusFk()) {
	                    case 0 -> consolidation.add(dto);
	                    case 1 -> quotationReply.add(dto);
	                    case 2 -> finalizeSupplierSelection.add(dto);
	                    case 3 -> autoGeneratePO.add(dto);
	                    default -> log.warn("Unexpected statusFk value: {} for consLocReqPK: {}", dto.getStatusFk(), dto.getConsLocReqPK());
	                }
	            }
	        }

	        // Wrap grouped lists into a single DTO
	        ConsolidationLocationRequestDTO data = new ConsolidationLocationRequestDTO();
	        data.setConsolidation(consolidation);
	        data.setQuotationReply(quotationReply);
	        data.setFinalizetheSupplierSelection(finalizeSupplierSelection);
	        data.setAutoGeneratePO(autoGeneratePO);

	        response.setSuccess(AppConstants.TRUE);
	        response.setMessage(AppConstants.MSG_RECORD_FETCHED);
	        response.setData(data);

	    } catch (Exception e) {
	        log.error("Error retrieving consolidation details: ", e);
	        response.setSuccess(AppConstants.FALSE);
	        response.setMessage("Error retrieving consolidation details: " + e.getMessage());
	        response.setData(null);
	    }

	    return response;
	}


	// Consolidation Sub List
	public ResponseDTO<List<ConsolidationLocationRequestDTO>> consolidationSubList(String consolidationId) {

	    ResponseDTO<List<ConsolidationLocationRequestDTO>> response = new ResponseDTO<>();
	    List<ConsolidationLocationRequestDTO> subList = new ArrayList<>();

	    try {
	        List<ConsolidationLocationRequestHib> dHibList =
	                consolidationLocationRequestRepository.byConsolidationIdsSingle(consolidationId);

	        if (dHibList != null && !dHibList.isEmpty()) {
	            for (ConsolidationLocationRequestHib dhib : dHibList) {
	                ConsolidationLocationRequestDTO dto = commonService.mapConsolidationHibToDTO(dhib, consolidationId, response);
	                if (dto != null) {
	                    subList.add(dto);
	                }
	            }
	        }

	        if (response.isSuccess()) { // No errors in mapping
	            response.setSuccess(AppConstants.TRUE);
	            response.setMessage(AppConstants.MSG_RECORD_FETCHED);
	        }
	        response.setData(subList);

	    } catch (Exception e) {
	        log.error("Error fetching consolidation sublist for consolidationId {}: ", consolidationId, e);
	        response.setSuccess(AppConstants.FALSE);
	        response.setMessage("Failed: " + e.getMessage());
	        response.setData(null);
	    }

	    return response;
	}
	
	
	
	//-------------------------------------------------------------------------------------------//
	
		// Prepare Quotation  - Anand(24-11-2025)
	
	
	public ResponseDTO<List<ComboBoxDTO>> loadConsolidationLocReq(Date monthY) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<ConsolidationLocationRequestHib> consolidationLocationRequestHib = consolidationLocationRequestRepository
					.retriveByDateAndStatus(monthY);

			if (consolidationLocationRequestHib != null) {
				for (ConsolidationLocationRequestHib hib : consolidationLocationRequestHib) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setName(hib.getConsolidationId());
					comboList.add(dto);
				}
			}
			
			response.setSuccess(true);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + re.getMessage());
			response.setData(null);
		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
		}
		return response;
	}
	
	
	
	public ResponseDTO<List<LocationRequestDTO>> viewConsolidationLocationRequest(String consolidationId) {
	    ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();

	    try {
	        List<ConsolidationLocationRequestHib> detailHIBs = 
	                consolidationLocationRequestRepository.byConsolidationId(consolidationId);

	        List<LocationRequestDTO> items = Optional.ofNullable(detailHIBs)
	                .orElse(List.of())
	                .stream()
	                .map(item -> {
	                    LocationRequestDTO dto = new LocationRequestDTO();
	                    dto.setItemId(item.getItemId());

	                    // Fetch item details
	                    ItemHib itemHib = itemRepository.findId(item.getItemId());
	                    dto.setItemName(itemHib != null ? itemHib.getItemName() : "N/a");

	                    dto.setPackageId(item.getPackageId());
	                    dto.setGrandTotal(item.getGrandTotal());
	                    return dto;
	                })
	                .toList(); // Use .distinct() if duplicates need to be removed

	        response.setSuccess(true);
	        response.setMessage(AppConstants.MSG_RECORD_FETCHED);
	        response.setData(items);

	    } catch (RestException re) {
	        response.setSuccess(false);
	        response.setMessage("Error: " + re.getMessage());
	        response.setData(null);
	    } catch (Exception e) {
	        log.error("Exception occurred while fetching consolidation location request", e);
	        response.setSuccess(false);
	        response.setMessage(AppConstants.ERROR);
	        response.setData(null);
	    }
	    return response;
	}
	
	
	
	
	public ResponseDTO<LocationRequestDTO> savePrepareQuotation(LocationRequestDTO selectView) {
	    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
	    try {
	        String quotationId = selectView.getDeliveryLocationId();
	        int userFk = selectView.getUserFk();

	        // Fetch supplier list for the consolidation and period
	        List<Object[]> supplierList = Optional.ofNullable(
	        		quotationProcessHeadRepository.getSupplierListByConsolidationIdAndPeriod(quotationId, selectView.getPeriod())
	        ).orElse(List.of());

	        if (supplierList.isEmpty()) {
	            response.setSuccess(false);
	            response.setMessage("Supplier Items Not Available. Map Supplier Item for the Period of "
	                    + new SimpleDateFormat("MMM-yyyy").format(selectView.getPeriod()));
	            return response;
	        }

	        List<LocationRequestDTO> items = supplierList.stream().map(obj -> {
	            LocationRequestDTO dto = new LocationRequestDTO();
	            dto.setSupplierId(obj[0].toString());
	            dto.setItemId(Integer.parseInt(obj[1].toString()));
	            dto.setPackageId(obj[2].toString());
	            dto.setQty((Double) obj[3]);
	            dto.setPeriod((Date) obj[4]);
	            return dto;
	        }).toList();

	        // Check if the quotation process already exists for this consolidation
	        List<QuotationProcessHeadHib> existing = quotationProcessHeadRepository.alreadyExistByConId(quotationId);
	        if (!existing.isEmpty()) {
	            response.setSuccess(false);
	            response.setMessage("Already Processed for this Consolidation ID");
	            return response;
	        }

	        StringBuilder messageBuilder = new StringBuilder();
	        for (LocationRequestDTO itemDto : items) {

	            // Create quotation head
	        	QuotationProcessHeadHib head = new QuotationProcessHeadHib();
	            head.setConId(quotationId);
	            head.setSupplierId(itemDto.getSupplierId());
	            head.setEntityId(selectView.getEntityId());
	            head.setPeriod(itemDto.getPeriod());
	            head.setStatusFk(0);
	            head.setReceivedDate(new Date());
	            head.setCreatedBy(userFk);
	            head.setCreatedDate(new Date());
	            head.setLastActBy(userFk);
	            head.setLastActDate(new Date());

	            if (quotationProcessHeadRepository.alreadySupplierByConId(itemDto.getSupplierId(), quotationId) == null) {
	                String finalID;
	                String ref = commonService.generateQuotationID() + "%";

	                List<QuotationProcessHeadHib> transactionNo = quotationProcessHeadRepository.transactionNo(ref);
	                finalID = transactionNo.isEmpty() ? commonService.generateQuotationID(1) : commonService.generateQuotationID(transactionNo.size() + 1);

	                head.setQtnReqNo(finalID);
	                messageBuilder.append(",").append(finalID);
	                quotationProcessHeadRepository.save(head);
	            }

	            // Create quotation detail
	            QuotationProcessDetailHib detail = new QuotationProcessDetailHib();
	            int maxPk = quotationProcessDetailRepository.maxPkByQtn(itemDto.getSupplierId(), quotationId);
	            String reqNo = quotationProcessHeadRepository.transByQtn(itemDto.getSupplierId(), quotationId);

	            detail.setQuotationReqHeadFk(maxPk);
	            detail.setQtnReqNo(reqNo);
	            detail.setEntOrder(1);
	            detail.setItemId(itemDto.getItemId());
	            detail.setPackageId(itemDto.getPackageId());
	            detail.setGp(0);
	            detail.setQty(itemDto.getQty());
	            detail.setEntityId(selectView.getEntityId());

	            // Update statuses
	            consolidationLocationRequestRepository.updateStatusFk(quotationId, itemDto.getItemId());
	            quotationRequeustHeadRepository.updateStatusFk(quotationId);

	            List<QuotationRequeustHeadHib> lhList = quotationRequeustHeadRepository.findByConsolidationId(quotationId);
	            if (lhList != null) {
	               lhList.forEach(h -> quotationRequestDetailRepository.updateStatusFkQtProcess(h.getReqHeadPk(), itemDto.getItemId()));
	            }

	            quotationProcessDetailRepository.save(detail);
	        }
	        
	        response.setSuccess(true);
	        response.setMessage(messageBuilder.toString()+"-"+"Successful");
	        response.setData(null);

	    } catch (RestException re) {
	        response.setSuccess(false);
	        response.setMessage("Error: " + re.getMessage());
	    } catch (Exception e) {
	        log.error("Exception occurred while saving quotation process", e);
	        response.setSuccess(false);
	        response.setMessage("An unexpected error occurred");
	    }

	    return response;
	}


//-----------------------------------------------------------------------------------------------------------------------------------//
	
	
	
	
	// Quotation Reply - Bharath Parthiban (25-11-2025)
	
	
	
	
	 public ResponseDTO<List<ComboBoxDTO>> dropDownQuotation(String consId) {
	        ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
	        List<ComboBoxDTO> comboList = new ArrayList<>();

	        try {
	            List<QuotationProcessHeadHib> quotationHeads = quotationProcessHeadRepository
	                    .byConsIdAndStatus0(consId);

	            List<SuppliersHib> suppliers = suppliersRepository.findAll();

	            if (quotationHeads != null && !quotationHeads.isEmpty()) {
	                for (QuotationProcessHeadHib head : quotationHeads) {
	                    ComboBoxDTO item = new ComboBoxDTO();

	                    item.setPk(head.getQtnReqHeadPk());
	                    item.setPeriod(new SimpleDateFormat("dd-MM-yyyy").format(head.getPeriod()));
	                    item.setTranNo(head.getQtnReqNo());
	                    item.setName(head.getSupplierId());

	                    String supplierName = commonService.getSupplierName(head.getSupplierId(), suppliers);
	                    item.setCode(supplierName);

	                    comboList.add(item);
	                }
	            } else {
	                response.setSuccess(AppConstants.FALSE);
	                response.setMessage(AppConstants.NO_RECORD_FOUND);
	                return response; // early return
	            }

	            response.setData(comboList);
	            response.setSuccess(AppConstants.TRUE);
	            response.setMessage(AppConstants.MSG_RECORD_FETCHED);

	        } catch (RestException re) {
	            response.setSuccess(AppConstants.FALSE);
	            response.setMessage("Errors: " + re.getMessage());

	        } catch (Exception e) {
	            log.error("Unexpected error in dropDownQuotation for date: {}", consId, e);
	            response.setSuccess(AppConstants.FALSE);
	            response.setMessage("Internal server error");
	        }

	        return response;
	    }
	
	 
	 public ResponseDTO<LocationRequestDTO> listOfQuotationReply(Date period) {

		    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
		    LocationRequestDTO finalDto = new LocationRequestDTO();

		    try {

		        List<Object[]> rows = quotationProcessHeadRepository.fetchQuotationFast(period);
		        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

		        List<LocationRequestDTO> prepared = rows.stream()
		                .map(r -> mapToDto(r, sdf))
		                .filter(dto -> dto.getStatusFk() == 0)
		                .peek(dto -> dto.setQuotationProcessStatus("Prepared"))
		                .toList();

		        List<LocationRequestDTO> finalized = rows.stream()
		                .map(r -> mapToDto(r, sdf))
		                .filter(dto -> dto.getStatusFk() == 1)
		                .peek(dto -> dto.setQuotationProcessStatus("Finalized"))
		                .toList();

		        finalDto.setQuotationPreparedList(prepared);
		        finalDto.setFinalizedList(finalized);

		        response.setSuccess(true);
		        response.setMessage("Success");
		        response.setData(finalDto);

		    } catch (Exception e) {
		        log.error("Exception Occurred ===>>", e);
		        response.setSuccess(false);
		        response.setMessage("Internal Server Error");
		    }

		    return response;
		}

	 
	 private LocationRequestDTO mapToDto(Object[] r, SimpleDateFormat sdf) {

		    LocationRequestDTO dto = new LocationRequestDTO();

		    dto.setQuotationProcessHeadPk(((Number) r[0]).intValue());
		    dto.setReqTransactionNo((String) r[1]);
		    dto.setSupplierId((String) r[2]);
		    dto.setSupplierName(r[3] != null ? (String) r[3] : "N/A");
		    dto.setEntityId((String) r[4]);
		    dto.setPeriod((Date) r[5]);

		    if (r[5] != null) {
		        dto.setPeriodStr(sdf.format((Date) r[5]));
		    }

		    dto.setReceiveDate((Date) r[6]);

		    int status = r[7] == null ? 0 : ((Number) r[7]).intValue();
		    dto.setStatusFk(status);
		    dto.setQuotationProcessStatusFk(status);

		    dto.setConsolidationId((String) r[8]);
		    dto.setCurrencyId("OMR");
		    dto.setCurrencyRate(1);

		    return dto;
		}

	
	
//	 public ResponseDTO<LocationRequestDTO> listOfQuotationReply(Date period) {
//
//	        ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
//	        List<QuotationProcessHeadHib> quotationProcessHeadHibList = new ArrayList<>();
//
//	        // Create one DTO to return (NO LIST)
//	        LocationRequestDTO finalDto = new LocationRequestDTO();
//
//	        // For internal filtering
//	        List<LocationRequestDTO> quotationList0 = new ArrayList<>();
//	        List<LocationRequestDTO> quotationList1 = new ArrayList<>();
//
//	        try {
//
//	            quotationProcessHeadHibList = quotationProcessHeadRepository.orderByPeriodAndStatusAll(period);
//
//	            if (quotationProcessHeadHibList != null && !quotationProcessHeadHibList.isEmpty()) {
//
//	                for (QuotationProcessHeadHib headHib : quotationProcessHeadHibList) {
//
//	                    LocationRequestDTO dto = new LocationRequestDTO();
//	                    dto.setReqTransactionNo(headHib.getQtnReqNo());
//	                    dto.setQuotationProcessHeadPk(headHib.getQtnReqHeadPk());
//	                    dto.setSupplierId(headHib.getSupplierId());
//	                    dto.setEntityId(headHib.getEntityId());
//	                    dto.setCurrencyId("OMR");
//	                    dto.setCurrencyRate(1);
//	                    dto.setQuotationProcessStatusFk(headHib.getStatusFk());
//	                    dto.setConsolidationId(headHib.getConId());
//	                    dto.setStatusFk(headHib.getStatusFk());
//
//	                    SuppliersHib suppliersHib = suppliersRepository.findName(headHib.getSupplierId());
//	                    dto.setSupplierName(suppliersHib != null ? suppliersHib.getSupplierName() : "N/A");
//	                    dto.setPeriod(headHib.getPeriod());
//	                  
//	                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
//	                        dto.setPeriodStr(sdf.format(headHib.getPeriod()));
//	                    
//	                    
//
//	                    dto.setReceiveDate(headHib.getReceivedDate());
//	                    
//	                    int status = headHib.getStatusFk();
//	                    if (status == 0) {
//	                        dto.setQuotationProcessStatus("Prepared");
//	                        quotationList0.add(dto);
//	                    }
//	                    if (status == 1) {
//	                        dto.setQuotationProcessStatus("Finalized");
//	                        quotationList1.add(dto);
//	                    }
//
//	                  
//	                }
//	            }
//
//	            finalDto.setQuotationPreparedList(quotationList0);
//	            finalDto.setFinalizedList(quotationList1);
//
//	            response.setData(finalDto);
//	            response.setSuccess(AppConstants.TRUE);
//	            response.setMessage("Success");
//
//	        } catch (RestException re) {
//	            log.warn("Error while get All role=====", re);
//	            response.setSuccess(AppConstants.FALSE);
//	            response.setMessage(re.getMessage());
//
//	        } catch (Exception e) {
//	            log.error("Exception Occurred ===>>", e);
//	            response.setSuccess(AppConstants.FALSE);
//	            response.setMessage("Internal Server Error");
//	        }
//
//	        return response;
//	    }
	
	
	 
	
	
	
	 public ResponseDTO<List<LocationRequestDTO>> subListOfQuotationReply(int headPk) {

		    ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();

		    try {
		        List<QuotationProcessDetailHib> detailHibList =
		                quotationProcessDetailRepository.subTable(headPk);

		        List<LocationRequestDTO> items = new ArrayList<>();

		        if (detailHibList != null && !detailHibList.isEmpty()) {

		            for (QuotationProcessDetailHib detailHib : detailHibList) {

		                LocationRequestDTO detailDTO = new LocationRequestDTO();
		                detailDTO.setQuotationProcessDetailPk(detailHib.getQtnReqDetailPk());
		                detailDTO.setItemId(detailHib.getItemId());

		                ItemHib itemHib = itemRepository.findId(detailHib.getItemId());
		                detailDTO.setItemName(itemHib != null ? itemHib.getItemName() : "N/A");

		                detailDTO.setQty(detailHib.getQty());
		                detailDTO.setPackageId(detailHib.getPackageId());
		                detailDTO.setGpOld(detailHib.getGp());
		                detailDTO.setGp(detailHib.getRgp());
		                detailDTO.setNp(detailHib.getNp());
		                detailDTO.setCurrencyId(detailHib.getSelectionType());

		                items.add(detailDTO);
		            }
		        }

		        response.setSuccess(AppConstants.TRUE);
		        response.setData(items);
		        response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		    } catch (Exception e) {
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage("Error: " + e.getMessage());
		    }

		    return response;
		}
	
	
	
	 public ResponseDTO<List<ComboBoxDTO>> loadConsolidationLocReqForNp(Date monthY) {
			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		    List<ComboBoxDTO> comboList = new ArrayList<>();

		    try {
		        List<ConsolidationLocationRequestHib> locationRequests = 
		            consolidationLocationRequestRepository.retriveByDateAndStatusNot0(monthY);

		        if (locationRequests != null && !locationRequests.isEmpty()) {
		            for (ConsolidationLocationRequestHib request : locationRequests) {
		                ComboBoxDTO item = new ComboBoxDTO();
		                item.setName(request.getConsolidationId());
		                comboList.add(item);
		            }
		        }

		        response.setData(comboList);
		        response.setSuccess(AppConstants.TRUE);
		        response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		    } catch (RestException re) {
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage("Error: " + re.getMessage());

		    } catch (Exception e) {
		        log.error("Unexpected error in loadConsolidationLocReqForNp for date: {}", monthY, e);
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage("Internal server error");
		    }

		    return response;
		}
	
	 
	 
	 public ResponseDTO<LocationRequestDTO> quotationReqNoDetail(String reqNo) {
		    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
		    LocationRequestDTO dto = new LocationRequestDTO();

		    try {
		        QuotationProcessHeadHib headHib = quotationProcessHeadRepository.headerDetail(reqNo);

		        if (headHib != null) {
		            // --- SUB LIST FROM CONSOLIDATION ---
		            List<LocationRequestDTO> subList = commonService.buildConsolidationSubList(headHib.getConId());
		            dto.setSubList(subList);

		            // --- HEADER FIELDS ---
		            dto.setQuotationProcessHeadPk(headHib.getQtnReqHeadPk());
		            dto.setQuotationTransNo(headHib.getQtnReqNo());
		           // dto.setPeriod(headHib.getPeriod());
		            dto.setSupplierId(headHib.getSupplierId());

		            SuppliersHib supplierHib = suppliersRepository.findName(headHib.getSupplierId());
		            dto.setSupplierName(supplierHib != null ? supplierHib.getSupplierName() : "N/A");

		            dto.setReceiveDate(headHib.getReceivedDate());
		            dto.setQuotationProcessStatusFk(headHib.getStatusFk());

		            if (headHib.getStatusFk() == 0) {
		                dto.setQuotationProcessStatus("Processed");
		            } else if (headHib.getStatusFk() == 1) {
		                dto.setQuotationProcessStatus("Finalised");
		            }

		            dto.setPeriodStr(new SimpleDateFormat("dd-MM-yyyy").format(headHib.getPeriod()));

		            // --- DETAIL ITEMS (Extracted) ---
		            List<QuotationProcessDetailHib> detailList = quotationProcessDetailRepository
		                    .subTable(headHib.getQtnReqHeadPk());

		            List<LocationRequestDTO> items = commonService.buildQuotationDetailItems(detailList);
		            dto.setItems(items);
		        }

		        response.setSuccess(AppConstants.TRUE);
		        response.setMessage(AppConstants.MSG_RECORD_FETCHED);
		        response.setData(dto);

		    } catch (RestException re) {
		        log.warn("Error while fetching quotation details", re);
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage(AppConstants.EXCEPTION);
		    } catch (Exception e) {
		        log.error("Unexpected Exception", e);
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage("Failed");
		    }

		    return response;
		}
	 
	 
	 
	 public ResponseDTO<SupplierItemMasterDTO> saveSupplierItemDetails(SupplierItemMasterDTO supplierItemMasterDTO) {
		    ResponseDTO<SupplierItemMasterDTO> response = new ResponseDTO<>();
		    
		    try {
		        if (supplierItemMasterDTO.getSupplierId() != null) {
		            SuppliersHib suppliersHib = suppliersRepository.findName(supplierItemMasterDTO.getSupplierId());
		            supplierItemMasterDTO.setSupplierFk(suppliersHib.getSupplierPk());
		            
		            if (!supplierItemMasterDTO.getUploadedItem().isEmpty()) {
		                for (SupplierItemMasterDTO itemDto : supplierItemMasterDTO.getUploadedItem()) {
		                    SuppliersItemHib suppliersItemsHib = new SuppliersItemHib();
		                    suppliersItemsHib.setSuppFk(supplierItemMasterDTO.getSupplierFk());
		                    suppliersItemsHib.setSupplierId(supplierItemMasterDTO.getSupplierId());
		                    suppliersItemsHib.setItemId(itemDto.getItemId());
		                    String itemIdStr = String.valueOf(itemDto.getItemId());

							if (suppliersItemRepository.findItem(supplierItemMasterDTO.getSupplierFk(), itemIdStr)
									.isEmpty()) {

		                        // logic 		                    

		                        suppliersItemsHib.setPackageId(itemDto.getPackageId());
		                        suppliersItemsHib.setIsActive(1);
		                        suppliersItemsHib.setPeriod(new Date());
		                        suppliersItemsHib.setEntityId("1");
		                        suppliersItemsHib.setLastUser(supplierItemMasterDTO.getLastUser());
		                        suppliersItemsHib.setSuppFk(suppliersItemsHib.getSuppFk());
		                        suppliersItemsHib.setPeriod(supplierItemMasterDTO.getPeriod());
		                        suppliersItemsHib.setCreatedDate(new Date());
		                        suppliersItemsHib.setLastUpdate(new Date());
		                        
		                        suppliersItemRepository.save(suppliersItemsHib);
		                    }
		                }
		                
		                response.setSuccess(AppConstants.TRUE);
		                response.setMessage(AppConstants.MSG_RECORD_CREATED);
		            } else {
		            	response.setSuccess(AppConstants.FALSE);
		            	 response.setMessage("Item List is Empty");
		            }
		        } else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Please Select Supplier Id");
		         
		        }
		        
		    } catch (RestException exception) {
		    	response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EXCEPTION_SAVING);
		    }
		    
		    return response;
		}
	 
	 
	 @Transactional
	 public ResponseDTO<LocationRequestDTO> updateQuotationReply(LocationRequestDTO selectView) {
		    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();

		    try {
		        QuotationProcessHeadHib quotationProcessHeadHib = quotationProcessHeadRepository
		                .headerDetail(selectView.getQuotationTransNo());

		        if (quotationProcessHeadHib != null) {
		        	quotationProcessHeadRepository.updateReceivedDate(
		        		    selectView.getQuotationTransNo(), new Date()
		        		);

		            // Extracted + passes response for error handling
		            commonService.updateGpForItems(selectView.getItems(), selectView.getQuotationTransNo(), response);

		            // Only set success if no error occurred during item update
		            if (response.isSuccess()!=AppConstants.FALSE) {
		                response.setMessage(AppConstants.MSG_RECORD_UPDATED);
		                response.setSuccess(AppConstants.TRUE);
		            }

		        } else {
		            response.setSuccess(AppConstants.FALSE);
		            response.setMessage("No Data found to update GP");
		        }

		    } catch (RestException exception) {
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage(AppConstants.REST_EXCEPTION_SAVE);

		    } catch (Exception e) {
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage(AppConstants.EXCEPTION_SAVING);
		        log.error("Exception occurred while trying to update GP in Quotation Reply: {}", e.getMessage(), e);
		    }

		    return response;
		}

	 
	 
	 public ResponseDTO<LocationRequestDTO> addAdditionQuotationData(LocationRequestDTO locationRequestDTO) {
		 ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();

			try {
				if (locationRequestDTO.getQuotationTransNo() != null) {
					
					QuotationProcessHeadHib hHib = quotationProcessHeadRepository
							.findtransactionNo(locationRequestDTO.getQuotationTransNo());

					int maxPk = hHib.getQtnReqHeadPk();
					if (locationRequestDTO.getDateWiseQty() != null && locationRequestDTO.getDateWiseQty().size() > 0) {

						for (LocationRequestDTO itemDto : locationRequestDTO.getDateWiseQty()) {

							QuotationProcessDetailHib detailHib = new QuotationProcessDetailHib();
							
							detailHib.setQuotationReqHeadFk(maxPk);
							detailHib.setQtnReqNo(locationRequestDTO.getQuotationTransNo());

							detailHib.setEntOrder(1);
							detailHib.setItemId(itemDto.getItemId());
							detailHib.setPackageId(itemDto.getPackageId());
							detailHib.setGp(0);
							detailHib.setQty(itemDto.getQty());
							detailHib.setEntityId(locationRequestDTO.getEntityId());
							quotationProcessDetailRepository.save(detailHib);
						}
						response.setMessage(AppConstants.SUCCESSFUL);
		                response.setSuccess(AppConstants.TRUE);
					} else {
						response.setMessage(AppConstants.NO_RECORD_FOUND);
					}
				} else {
					response.setMessage("Quotation Request-"+AppConstants.NO_RECORD_FOUND);
				}

			} catch (RestException exception) {
				   response.setSuccess(AppConstants.FALSE);
			        response.setMessage(AppConstants.EXCEPTION_SAVING);
			}
			return response;
		}
		

		public ResponseDTO<LocationRequestDTO> updateEditSelectedSupplier(LocationRequestDTO locationRequestDTO) {
		    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();

		    try {

		        if (locationRequestDTO != null) {

		            List<QuotationProcessHeadHib> qHeadHibList =
		                    quotationProcessHeadRepository.alreadyExistByConId(locationRequestDTO.getConsolidationId());

		            for (LocationRequestDTO dto : locationRequestDTO.getItems()) {

		            	System.out.println(" Check Box -"+dto.isCheckBox());
		                if (!dto.isCheckBox()) {

		                    commonService.resetSupplierSelectionForItem(
		                            locationRequestDTO.getConsolidationId(),
		                            dto.getItemId(),
		                            qHeadHibList,
		                            response
		                    );

		                    // If inner method sets failure → stop flow
		                    if (!response.isSuccess()) {
		                        return response;
		                    }
		                }
		            }

		            response.setSuccess(AppConstants.TRUE);   // BOOLEAN
		            response.setMessage("Success");

		        } else {
		            response.setSuccess(AppConstants.FALSE);
		            response.setMessage("No Record found");
		        }

		    } catch (Exception e) {
		        log.error("Exception Occurred while trying to Update Selected Supplier: {}", e.getMessage(), e);
		        response.setSuccess(AppConstants.FALSE);
		        response.setMessage("Failed to Update");
		    }

		    return response;
		}
		
		
		//-------------------------------------------------------------------------------//
		
		
		// Price Computation	- Anand (27-11-2025)
		
		
		
		public ResponseDTO<String> updateNNPrice(String consolidationId, int userFk) {

			ResponseDTO<String> response = new ResponseDTO<>();

			try {
				List<QuotationProcessHeadHib> headList = quotationProcessHeadRepository
						.alreadyExistByConId(consolidationId);

				if (headList == null || headList.isEmpty()) {
					return commonService.failureResponse("Not able to process, No record found");
				}

				// Step 1: Update Net Price for all suppliers
				commonService.updateNetPrices(headList);

				// Step 2: Fetch all detail rows in single list
				List<QuotationProcessDetailHib> allDetails = commonService.fetchAllDetails(headList);

				// Step 3: Delete previous selections
				selectedSupplierRepository.deleteItem(consolidationId);

				// Step 4: Select minimum NP supplier for each item
				commonService.processSelection(consolidationId, userFk, headList, allDetails);

				return commonService.successResponse("NN Price Updated Successfully");

			} catch (Exception e) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Error: " + e.getMessage());
				return response;
			}
		}

		
		
		@Transactional
		public ResponseDTO<String> updateNNPricess(String consolidationId, int userFk) {

		    ResponseDTO<String> response = new ResponseDTO<>();

		    try {
		        List<QuotationProcessHeadHib> heads =
		                quotationProcessHeadRepository.alreadyExistByConId(consolidationId);

		        if (heads == null || heads.isEmpty()) {
		            response.setSuccess(false);
		            response.setMessage("No quotations found");
		            return response;
		        }

		        EntityEiisHib eiis = entityEiisRepository.findByPk(1);
		        double interestRate = eiis.getInterestRate();

		        List<QuotationProcessDetailHib> allDetails = new ArrayList<>();

		        /* -------------------------
		         * 1. Calculate NP (NO SAVE YET)
		         * ------------------------- */
		        for (QuotationProcessHeadHib head : heads) {

		            SuppliersHib supplier =
		                    suppliersRepository.findName(head.getSupplierId());

		            if (supplier == null) continue;

		            double discount = supplier.getDiscountPer();
		            double days = supplier.getNoDays();

		            List<QuotationProcessDetailHib> details =
		                    quotationProcessDetailRepository.subTable(head.getQtnReqHeadPk());

		            for (QuotationProcessDetailHib d : details) {
		                double gp = d.getRgp();
		                double np = gp
		                        - (gp * discount / 100)
		                        - (gp * interestRate * days / 36500);

		                d.setNp(np);
		                d.setDiscPer(discount);
		                d.setNoOfDay((int) days);
		                d.setSelectionType("");

		                allDetails.add(d);
		            }
		        }

		        // 🔥 ONE batch save instead of thousands
		        quotationProcessDetailRepository.saveAll(allDetails);

		        /* -------------------------
		         * 2. Find min NP per item (STREAM + MAP)
		         * ------------------------- */
		        Map<Integer, QuotationProcessDetailHib> minPriceByItem =
		                allDetails.stream()
		                        .filter(d -> d.getNp() > 0)
		                        .collect(Collectors.toMap(
		         
		                        		QuotationProcessDetailHib::getItemId,
		                                d -> d,
		                                (d1, d2) -> d1.getNp() < d2.getNp() ? d1 : d2
		                        ));

		        selectedSupplierRepository.deleteItem(consolidationId);

		        List<ConsolidationLocationRequestHib> locations =
		                consolidationLocationRequestRepository.byConsolidationIdSingle(consolidationId);

		        List<SelectedSupplierHib> selectedSuppliers = new ArrayList<>();

		        for (ConsolidationLocationRequestHib loc : locations) {

		            QuotationProcessDetailHib minDetail =
		                    minPriceByItem.get(loc.getItemId());

		            if (minDetail == null) continue;

		            minDetail.setSelectionType("S");

		            QuotationProcessHeadHib head =
		                    quotationProcessHeadRepository
		                            .findOne(minDetail.getQuotationReqHeadFk());

		            SelectedSupplierHib ss = new SelectedSupplierHib();
		            ss.setItemId(minDetail.getItemId());
		            ss.setPackageId(minDetail.getPackageId());
		            ss.setPeriod(loc.getPeriod());
		            ss.setConsolidationId(consolidationId);
		            ss.setNp(minDetail.getNp());
		            ss.setSupplierId(head.getSupplierId());
		            ss.setCurrencyId(eiis.getCurrencyId());
		            ss.setCurrencyRate(1.0);
		            ss.setGp(minDetail.getRgp());
		            ss.setEntityId(eiis.getEntity());
		            ss.setsDiscountPerc(minDetail.getDiscPer());
		            ss.setsNoDays(minDetail.getNoOfDay());
		            ss.setCreatedBy(userFk);
		            ss.setCreatedDate(new Date());
		            ss.setLastActBy(userFk);
		            ss.setLastActDate(new Date());
		            ss.setIsPriceMailSent("");
		            selectedSuppliers.add(ss);
		        }

		        selectedSupplierRepository.saveAll(selectedSuppliers);

		        response.setSuccess(true);
		        response.setMessage("NN Price updated successfully");

		    } catch (Exception e) {
		        log.error("Error updating NN Price", e);
		        response.setSuccess(false);
		        response.setMessage("Failed");
		    }

		    return response;
		}

		
	

		
		
		//-----------------------------------------------------------------------------------------------//
		
		
		// Price Comparison Preview - Anand (27-11-2025)
		
	
		public ResponseDTO<List<ComboBoxDTO>> loadItemFromConsolidationLocReq(String consolidationId) {

			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();

			try {
				List<ConsolidationLocationRequestHib> list = consolidationLocationRequestRepository
						.byConsolidationIdSingle(consolidationId);

				List<ComboBoxDTO> comboList = Optional.ofNullable(list).orElse(List.of()).stream().map(hib -> {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setItemId(hib.getItemId());
					dto.setItemName(hib.getItemName());
					return dto;
				}).distinct() // remove duplicates
						.toList();

				response.setSuccess(true);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				response.setData(comboList);

			} catch (RestException re) {
				response.setSuccess(false);
				response.setMessage("Error: " + re.getMessage());
				response.setData(null);
			} catch (Exception e) {
				response.setSuccess(false);
				response.setMessage(AppConstants.ERROR);
				response.setData(null);
			}

			return response;
		}

		
		
		
		private LocationRequestDTO buildItemDTOOptimized(
		        Object[] obj, 
		        Map<Integer, List<QuotationProcessDetailHib>> detailMap,
		        Map<Integer, QuotationProcessHeadHib> headByPkMap,
		        Map<String, String> supplierNameCache) {
		    
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
		    
		    List<LocationRequestDTO> subList = details.stream()
		            .filter(detail -> detail.getRgp() != 0)
		            .map(detail -> {
		                LocationRequestDTO sdto = new LocationRequestDTO();
		                
		                QuotationProcessHeadHib hHib = headByPkMap.get(detail.getQuotationReqHeadFk());
		                
		                sdto.setSupplierId(hHib.getSupplierId());
		                sdto.setSupplierName(supplierNameCache.getOrDefault(hHib.getSupplierId(), ""));
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
		                sdto.setRemarks(detail.getRemarks() == null ? "" : detail.getRemarks());
		                
		                if ("S".equalsIgnoreCase(detail.getSelectionType())) {
		                    idto.setNetPp(detail.getNp());
		                    idto.setSupplierId(hHib.getSupplierId());
		                }
		                
		                if (detail.getPreSupId() != null && !detail.getPreSupId().trim().isEmpty()) {
		                    idto.setPreSupId(detail.getPreSupId());
		                }
		                
		                return sdto;
		            })
		            .toList();
		    
		    idto.setSubList(subList);
		    return idto;
		}
		
		
		public ResponseDTO<List<LocationRequestDTO>> showPriceComparison(LocationRequestDTO locationRequestDTO) {

			ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();
			List<LocationRequestDTO> resultSet = new ArrayList<>();

			try {
				if (locationRequestDTO == null || locationRequestDTO.getPeriod() == null) {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Period is null ....! ");
					response.setData(null);
					return response;
				}

				String oldConsolidationId = consolidationLocationRequestRepository.findSecondLastConsolidationId();
				Date period = locationRequestDTO.getPeriod();

				boolean hasConId = locationRequestDTO.getConsolidationId() != null
						&& !locationRequestDTO.getConsolidationId().trim().isEmpty();
				boolean hasItem = locationRequestDTO.getItemId() != 0;

				// 🔥 COMMON METHOD: Build quotation details grouped by itemId
				Function<List<QuotationProcessHeadHib>, Map<Integer, List<QuotationProcessDetailHib>>> buildDetailMap = qHeadHibList -> qHeadHibList
						.stream().flatMap(h -> quotationProcessDetailRepository.subTable(h.getQtnReqHeadPk()).stream())
						.collect(Collectors.groupingBy(QuotationProcessDetailHib::getItemId));

				// ============ CASE 1: FETCH ALL CONSOLIDATIONS ===============
				if (!hasConId && !hasItem) {

				    List<String> conHibList = consolidationLocationRequestRepository
				            .retriveConsolidateIdsByDateAndStatus1(period);

				    if (conHibList == null || conHibList.isEmpty()) {
				        response.setSuccess(true);
				        response.setMessage("No records found");
				        return response;
				    }

				    // 🔥 OPTIMIZATION: Pre-fetch all data in memory
				    Map<String, List<Object[]>> allItemRowsMap = new HashMap<>();
				    Map<String, List<QuotationProcessHeadHib>> allQHeadsMap = new HashMap<>();
				    Map<Integer, QuotationProcessHeadHib> headByPkMap = new HashMap<>();
				    Map<String, String> supplierNameCache = new HashMap<>();
				    
				    // Batch fetch all consolidations data
				    for (String consolidationId : conHibList) {
				        // Fetch items for this consolidation
				        List<Object[]> itemRows = consolidationLocationRequestRepository
				                .byConsolidationIdSingleNew(consolidationId, oldConsolidationId);
				        allItemRowsMap.put(consolidationId, itemRows);
				        
				        // Fetch heads for this consolidation
				        List<QuotationProcessHeadHib> qHeads = quotationProcessHeadRepository
				                .alreadyExistByConId(consolidationId);
				        allQHeadsMap.put(consolidationId, qHeads);
				        
				        // Cache heads by PK for later lookup
				        for (QuotationProcessHeadHib head : qHeads) {
				            headByPkMap.put(head.getQtnReqHeadPk(), head);
				        }
				    }
				    
				    // Batch fetch all details for all heads in one go
				    Set<Integer> allHeadPks = headByPkMap.keySet();
				    Map<Integer, List<QuotationProcessDetailHib>> allDetailsMap = new HashMap<>();
				    
				    if (!allHeadPks.isEmpty()) {
				        // Fetch details for each head and aggregate
				        for (Integer headPk : allHeadPks) {
				            List<QuotationProcessDetailHib> details = quotationProcessDetailRepository.subTable(headPk);
				            allDetailsMap.put(headPk, details);
				            
				            // Pre-cache supplier names
				            for (QuotationProcessDetailHib detail : details) {
				                if (detail.getQuotationReqHeadFk() != 0) {
				                    QuotationProcessHeadHib head = headByPkMap.get(detail.getQuotationReqHeadFk());
				                    if (head != null && head.getSupplierId() != null && 
				                        !supplierNameCache.containsKey(head.getSupplierId())) {
				                        try {
				                            SuppliersHib sup = suppliersRepository.findName(head.getSupplierId());
				                            if (sup != null) {
				                                supplierNameCache.put(head.getSupplierId(), sup.getSupplierName());
				                            }
				                        } catch (Exception e) {
				                            supplierNameCache.put(head.getSupplierId(), "");
				                        }
				                    }
				                }
				            }
				        }
				    }
				    
				    // Build consolidated detail map for each consolidation
				    Map<String, Map<Integer, List<QuotationProcessDetailHib>>> consolidationDetailMap = new HashMap<>();
				    
				    for (Map.Entry<String, List<QuotationProcessHeadHib>> entry : allQHeadsMap.entrySet()) {
				        String consolidationId = entry.getKey();
				        List<QuotationProcessHeadHib> qHeads = entry.getValue();
				        
				        Map<Integer, List<QuotationProcessDetailHib>> detailMap = qHeads.stream()
				                .flatMap(h -> {
				                    List<QuotationProcessDetailHib> details = allDetailsMap
				                            .getOrDefault(h.getQtnReqHeadPk(), Collections.emptyList());
				                    return details.stream();
				                })
				                .collect(Collectors.groupingBy(QuotationProcessDetailHib::getItemId));
				        
				        consolidationDetailMap.put(consolidationId, detailMap);
				    }
				    
				    // Process all consolidations using cached data
				    resultSet = conHibList.stream().map(consolidationId -> {
				        LocationRequestDTO dto = new LocationRequestDTO();
				        dto.setConsolidationId(consolidationId);
				        
				        List<Object[]> itemRows = allItemRowsMap.getOrDefault(consolidationId, Collections.emptyList());
				        Map<Integer, List<QuotationProcessDetailHib>> detailMap = consolidationDetailMap
				                .getOrDefault(consolidationId, Collections.emptyMap());
				        List<QuotationProcessHeadHib> qHeads = allQHeadsMap.getOrDefault(consolidationId, Collections.emptyList());
				        
				        List<LocationRequestDTO> items = itemRows.stream()
				                .map(obj -> buildItemDTOOptimized(obj, detailMap, headByPkMap, supplierNameCache))
				                .toList();
				        
				        dto.setItems(items);
				        return dto;
				        
				    }).collect(Collectors.toList());
				}


				// ============ CASE 2: SPECIFIC CONSOLIDATION ONLY ============
				else if (hasConId && !hasItem) {

					LocationRequestDTO dto = new LocationRequestDTO();
					dto.setConsolidationId(locationRequestDTO.getConsolidationId());

					List<Object[]> itemRows = consolidationLocationRequestRepository
							.byConsolidationIdSingleNew(locationRequestDTO.getConsolidationId(), oldConsolidationId);

					List<QuotationProcessHeadHib> qHeads = quotationProcessHeadRepository
							.alreadyExistByConId(locationRequestDTO.getConsolidationId());

					Map<Integer, List<QuotationProcessDetailHib>> detailMap = buildDetailMap.apply(qHeads);

					List<LocationRequestDTO> items = itemRows.stream().map(obj -> commonService.buildItemDTO(obj, detailMap))
							.filter(i -> !i.getSubList().isEmpty()) // original logic
							.toList();

					
					
					
					
					dto.setItems(items);
					resultSet.add(dto);
				}

				// ============ CASE 3: CONSOLIDATION + ITEM ====================
				else if (hasConId && hasItem) {

					LocationRequestDTO dto = new LocationRequestDTO();
					dto.setConsolidationId(locationRequestDTO.getConsolidationId());

					Object[] itemObj = consolidationLocationRequestRepository.byConsolidationIdandItemIdNew(
							locationRequestDTO.getConsolidationId(), oldConsolidationId, locationRequestDTO.getItemId());

					if (itemObj != null) {
						Object[] nested = (Object[]) itemObj[0];

						List<QuotationProcessHeadHib> qHeads = quotationProcessHeadRepository
								.alreadyExistByConId(locationRequestDTO.getConsolidationId());

						Map<Integer, List<QuotationProcessDetailHib>> detailMap = buildDetailMap.apply(qHeads);

						LocationRequestDTO itemDto = commonService.buildItemDTOByConAndItemId(nested, detailMap);
						dto.setItems(List.of(itemDto));
					}

					resultSet.add(dto);
				}

				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				response.setData(resultSet);

			} catch (Exception e) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.ERROR);
				response.setData(null);
			}

			return response;
		}

		
		
		public FileResponseDTO downloadPcReport(Date period, String consolidationId, String itemId) throws IOException {

			if (period == null || consolidationId == null || consolidationId.trim().isEmpty()) {
				throw new IllegalArgumentException("Period & Consolidation ID are required");
			}

			SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
			String periodString = sdf.format(period);

			if (itemId == null) {
				itemId = "";
			}
			
			 String endpoint = "/price_comparison_by_period";
		        String apiUrl = pythonBaseUrl + endpoint;

			// Build form data
			String formData = "period=" + periodString + "&consolidationId="
					+ URLEncoder.encode(consolidationId, StandardCharsets.UTF_8) + "&itemId="
					+ URLEncoder.encode(itemId, StandardCharsets.UTF_8);

			log.info("📦 Sending Form Data: {}", formData);

			return callPythonApi(apiUrl, formData);
		}

		public FileResponseDTO callPythonApi(String apiUrl, String formData) throws IOException {

			HttpURLConnection conn = null;

			try {
				log.info(" Calling Python API: {}", apiUrl);

				URL url = new URL(apiUrl);

				conn = (HttpURLConnection) url.openConnection();
				conn.setRequestMethod("POST");
				conn.setDoOutput(true);
				conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

				try (OutputStream os = conn.getOutputStream()) {
					os.write(formData.getBytes(StandardCharsets.UTF_8));
				}

				int responseCode = conn.getResponseCode();
				log.info(" Response Code: {}", responseCode);

				if (responseCode != 200) {
					try (InputStream errorStream = conn.getErrorStream()) {
						String error = new String(errorStream.readAllBytes(), StandardCharsets.UTF_8);
						log.error(" Python API Error: {}", error);
						throw new PythonApiException("Python API Error Code: " + responseCode);
					}
				}

				try (InputStream inputStream = conn.getInputStream()) {
					String responseBody = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
					log.info(" Python API Response: {}", responseBody);

					String downloadLink = commonService.extractJsonValue(responseBody, "download_link");
					String fileName = commonService.extractJsonValue(responseBody, "fileName");

					if (downloadLink == null || fileName == null) {
						throw new PythonApiException("Invalid Python API Response: " + responseBody);
					}

					InputStream resultStream = new BufferedInputStream(new URL(downloadLink).openStream());

					return new FileResponseDTO(fileName, resultStream);
				}

			} finally {
				if (conn != null)
					conn.disconnect();
			}
		}

		public class PythonApiException extends RuntimeException {
			/**
			 * 
			 */
			private static final long serialVersionUID = -2544897923639056113L;

			public PythonApiException(String message) {
				super(message);
			}

			public PythonApiException(String message, Throwable cause) {
				super(message, cause);
			}
		}
		
		
//-------------------------------------------------------------------------------------------------//
		
		 // Change the System Selected Supplier - Udayakumar(03-12-2025)
		
		
		public ResponseDTO<List<ComboBoxDTO>> loadConsolidationLocReqForSc(Date monthY) {

			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
			List<ComboBoxDTO> comboList = new ArrayList<>();
			try {
				List<String> consolidationLocationRequestHib = consolidationLocationRequestRepository
						.retriveConsolidateIdsByDateAndStatus1(monthY);

				if (consolidationLocationRequestHib != null) {
					for (String hib : consolidationLocationRequestHib) {
						ComboBoxDTO dto = new ComboBoxDTO();
						dto.setName(hib);
						comboList.add(dto);
					}
				}
				response.setSuccess(true);
				response.setMessage("Fetched List Sucessfully");
				response.setData(comboList);
				log.info("Fetched List Sucessfully");
			} catch (RestException re) {
				response.setSuccess(false);
				response.setMessage(AppConstants.FAILED+ re);
				log.warn("Exception : ", re);

			} catch (Exception e) {
				response.setSuccess(false);
				response.setMessage(AppConstants.FAILED + e);
				log.warn("Exception : ", e);
			}
			return response;
		}

		public ResponseDTO<List<ComboBoxDTO>> loadItemFromConsolidationLocReqsd(String consolidationId) {

			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
			List<ComboBoxDTO> comboList = new ArrayList<>();
			try {
				List<ConsolidationLocationRequestHib> consolidationLocationRequestHib = consolidationLocationRequestRepository
						.byConsolidationIdSingle(consolidationId);

				if (consolidationLocationRequestHib != null) {
					for (ConsolidationLocationRequestHib hib : consolidationLocationRequestHib) {
						ComboBoxDTO dto = new ComboBoxDTO();
						dto.setCode(String.valueOf(hib.getItemId()));
						dto.setName(hib.getItemName());
						comboList.add(dto);
					}
				}

				response.setSuccess(true);
				response.setMessage("List Fetched Sucessfully");
				response.setData(comboList);
			} catch (RestException re) {
				response.setSuccess(false);
				response.setMessage(AppConstants.FAILED + re);
				log.warn("Exception :", re);
			} catch (Exception e) {
				response.setSuccess(false);
				response.setMessage(AppConstants.FAILED + e);
				log.warn("Exception :", e);
			}
			return response;
		}


		
		public ResponseDTO<String> updateSelectedSupplier(LocationRequestDTO locationRequestDTO) {
		    ResponseDTO<String> response = new ResponseDTO<>();

		    try {
		        if (locationRequestDTO == null) {
		            return commonService.buildFailureResponse(response, "No Record found");
		        }

		        List<QuotationProcessHeadHib> qHeadHibList =
		                quotationProcessHeadRepository.alreadyExistByConId(locationRequestDTO.getConsolidationId());

		        List<QuotationProcessDetailHib> qDetailHibListCalc = commonService.collectAllDetails(qHeadHibList);

		        if (commonService.hasItems(locationRequestDTO)) {
		        	commonService.processItems(locationRequestDTO, qDetailHibListCalc);
		        }

		        response.setSuccess(true);
		        response.setMessage("Success");
		        response.setData("Saved Successfully");
		        log.info("Saved Successfully");

		    } catch (RestException exception) {
		       commonService.buildFailureResponse(response, "Failed to vUpdate");
		        log.warn("Failed to Update");
//
		    } catch (Exception e) {
		        log.info("Exception Occurred while trying to Update the Selected Supplier", e);
		        commonService.buildFailureResponse(response, "Failed to Update");
		    }

		    return response;
		}

		
//----------------------------------------------------------------------------------------//
		
		
		//Finalize the Supplier Selection - Bharath Parthiban(06-12-2025)
		
		
		
		public ResponseDTO<LocationRequestDTO> finalizeTheSupplierSelection(LocationRequestDTO locationRequestDTO) {		 
		    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
	 
		    try {
	 
		        if (locationRequestDTO == null) {
		            response.setSuccess(false);
		            response.setMessage("No Record found");
		            return response;
		        }
	 
		        // Fetch consolidation list
		        List<ConsolidationLocationRequestHib> conHibList =
		                consolidationLocationRequestRepository
		                        .byConsolidationIdSingle(locationRequestDTO.getConsolidationId());
	 
		        // Fetch quotation heads
		        List<QuotationProcessHeadHib> qHeadHibList =
		                quotationProcessHeadRepository.alreadyExistByConId(
		                        locationRequestDTO.getConsolidationId());
	 
		        // Build detail list
		        List<QuotationProcessDetailHib> qDetailHibListCalc = new ArrayList<>();
	 
		        for (QuotationProcessHeadHib hib : qHeadHibList) {
	 
		            List<QuotationProcessDetailHib> detailList =
		                    quotationProcessDetailRepository.subTable(hib.getQtnReqHeadPk());
	 
		            if (detailList != null && !detailList.isEmpty()) {
		                qDetailHibListCalc.addAll(detailList);
		            }
	 
		            hib.setStatusFk(1);
		            quotationProcessHeadRepository.save(hib);
		        }
	 
		        // CALL YOUR HELPER METHOD
		        commonService.processConsolidationSupplierSelection(
		                conHibList,
		                qDetailHibListCalc,
		                locationRequestDTO,
		                response
		        );
	 
		        response.setSuccess(true);
		        response.setMessage("Success");
		        response.setData(locationRequestDTO);
	 
		    } catch (Exception e) {
		        e.printStackTrace();
		        response.setSuccess(false);
		        response.setMessage("Failed to Update: " + e.getMessage());
		    }
		    return response;
		}
	 
}
