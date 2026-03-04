/**
 * 
 * @author Rammohan R
 * @since 18-Nov-2025
 * 
 */
package com.esfita.controller;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.esfita.common.AppConstants;
import com.esfita.common.ComboBoxDTO;
import com.esfita.common.ResponseDTO;
import com.esfita.dto.ConsolidationLocationRequestDTO;
import com.esfita.dto.FileResponseDTO;
import com.esfita.dto.LocationRequestDTO;
import com.esfita.dto.SupplierItemMasterDTO;
import com.esfita.service.JsonFileStorageService;
import com.esfita.service.TenderProcessService;

import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("tenderProcessController")
public class TenderProcessController {

	private static final Logger log = LoggerFactory.getLogger(TenderProcessController.class);

	@Autowired
	TenderProcessService tenderProcessService;
	@Autowired
	JsonFileStorageService jsonFileStorageService;
	
	//-----------------------------------------------------------------------------------------//
	
	// @Tag - Its used for Swagger (API Documentation)
	// @Observed - Its used for Jeager (API Tracing)

	
	
	@GetMapping("/dropDownLocation")
	@Tag(name = "Quotation Request")
	@Tag(name = "Quotation Request Bulk Upload")
	@Observed(name = "dropDownLocation", contextualName = "dropDownLocation")
	public ResponseDTO<List<ComboBoxDTO>> dropDownLocation() {
		return tenderProcessService.dropDownLocation();
	}
	
	
	// Quotation Request - Bharath Parthiban (18-11-2025)
	
	
	@GetMapping("/loadAPLForLocationRequest/{locationId}")
	@Tag(name = "Quotation Request")
	@Observed(name = "loadAPLForLocationRequest", contextualName = "loadAPLForLocationRequest")
    public ResponseEntity<ResponseDTO<List<LocationRequestDTO>>> loadAPLForLocationRequest(
            @PathVariable("locationId") String locationId) throws IOException {
				
		Map<String, Object> locationData = new HashMap<>();
		locationData.put("locationId", locationId);
		locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
		locationData.put(AppConstants.ENDPOINT, "loadAPLForLocationRequest");

		String filePath = jsonFileStorageService.saveJsonToFile(locationData,
				"loadAPLForLocationRequest_" + locationId);
		log.info(AppConstants.FILE_GENERATED, filePath);
		
		
        ResponseDTO<List<LocationRequestDTO>> response =
        		tenderProcessService.loadAPLForLocationRequest(locationId);

        return ResponseEntity.ok(response);
    }

	@PostMapping("/saveQuotationRequest")
	@Tag(name = "Quotation Request")
	@Observed(name = "saveQuotationRequest", contextualName = "saveQuotationRequest")
	public ResponseDTO<LocationRequestDTO> saveQuotationRequest(@RequestBody LocationRequestDTO locationRequestDTO) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(locationRequestDTO, "saveQuotationRequest");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.saveQuotationRequest(locationRequestDTO);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}

	@GetMapping("/quotationRequestHeaderList/{date}")
	@Tag(name = "Quotation Request")
	@Tag(name = "Quotation Request Bulk Upload")
	@Observed(name = "quotationRequestHeaderList", contextualName = "quotationRequestHeaderList")
	public ResponseDTO<LocationRequestDTO> quotationRequestHeaderList(@PathVariable("date") String date)
			throws java.text.ParseException {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("date", date);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "quotationRequestHeaderList");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "quotationRequestHeaderList_" + date);
			log.info(AppConstants.FILE_GENERATED, filePath);

			SimpleDateFormat dateFormat = new SimpleDateFormat(AppConstants.DD_MM_YYYY);
			Date period = dateFormat.parse(date);
			return tenderProcessService.quotationRequestHeaderList(period);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@GetMapping("/quotationRequestSubList/{reqHeadPk}")
	@Tag(name = "Quotation Request")
	@Tag(name = "Quotation Request Bulk Upload")
	@Observed(name = "quotationRequestSubList", contextualName = "quotationRequestSubList")
	public ResponseDTO<List<LocationRequestDTO>> quotationRequestSubList(@PathVariable("reqHeadPk") int reqHeadPk) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("reqHeadPk", reqHeadPk);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "quotationRequestSubList");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"quotationRequestSubList_" + reqHeadPk);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.quotationRequestSubList(reqHeadPk);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	// -----------------------------------------------------------------------------------------------//

	// Quotation Request Bulk Upload- Bharath Parthiban (19-11-2025)

	// Exce - Rammohan
	@PostMapping(value = "/uploadExcelByQuotationRequest/{period}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Tag(name = "Quotation Request Bulk Upload")
	@Observed(name = "uploadExcelByQuotationRequest", contextualName = "uploadExcelByQuotationRequest")
	public ResponseDTO<List<LocationRequestDTO>> uploadExcel(@PathVariable("period") String period,
			@RequestParam("file") MultipartFile file) { // Change "data" to "file" if that's what client sends
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("period", period);
			locationData.put("fileName", file.getOriginalFilename());
			locationData.put("fileType", file.getContentType());
			locationData.put("fileSize", file.getSize());
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "uploadExcelByQuotationRequest");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"uploadExcelByQuotationRequest_" + period + file);
			log.info(AppConstants.FILE_GENERATED, filePath);
			List<LocationRequestDTO> list = tenderProcessService.readExcelAndConvert(file, period);
			return ResponseDTO.<List<LocationRequestDTO>>builder().success(true).message("Excel imported successfully")
					.data(list).build();
		} catch (Exception e) {
			return ResponseDTO.<List<LocationRequestDTO>>builder().success(false).message("Error: " + e.getMessage())
					.data(null).build();
		}
	}

	@PostMapping("/saveQuotationRequestBulUpload")
	@Tag(name = "Quotation Request Bulk Upload")
	@Observed(name = "saveQuotationRequestBulUpload", contextualName = "saveQuotationRequestBulUpload")
	public ResponseDTO<LocationRequestDTO> saveQuotationRequestBulUpload(
			@RequestBody LocationRequestDTO locationRequestDTO) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(locationRequestDTO,
					"saveQuotationRequestBulUpload");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.saveQuotationRequestBulUpload(locationRequestDTO);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}

	

	

	// -----------------------------------------------------------------------------------------------//

	// Quotation Request Modify - Bharath Parthiban (19-11-2025)
	
	
	@GetMapping("/dropDownQuotationReqNo")
	@Tag(name = "Edit-Quotation Request")
	@Observed(name = "dropDownQuotationReqNo", contextualName = "dropDownQuotationReqNo")
	public ResponseDTO<List<ComboBoxDTO>> dropDownQuotationReqNo(
			@RequestParam("period") @DateTimeFormat(pattern = "dd-MM-yyyy") Date period) {
		Map<String, Object> locationData = new HashMap<>();
		locationData.put("period", period);
		locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
		locationData.put(AppConstants.ENDPOINT, "dropDownQuotationReqNo");

//	String filePath = jsonFileStorageService.saveJsonToFile(locationData, "dropDownQuotationReqNo_" + period);
//	log.info(AppConstants.FILE_GENERATED, filePath);
		return tenderProcessService.dropDownQuotationReqNo(period);
	}
	
	@GetMapping("/getRequestDetails/{reqHeadFK}")
	@Tag(name = "Edit-Quotation Request")
	@Observed(name = "getRequestDetails", contextualName = "getRequestDetails")
	public ResponseDTO<Map<String, Object>> getRequestDetails(@PathVariable("reqHeadFK") int reqHeadFK) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("reqHeadFK", reqHeadFK);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "getRequestDetails");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "getRequestDetails_" + reqHeadFK);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.getreqDetailList(reqHeadFK);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<Map<String, Object>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@PostMapping("/updateQuotationRequestProcess")
	@Tag(name = "Edit-Quotation Request")
	@Observed(name = "updateQuotationRequestProcess", contextualName = "updateQuotationRequestProcess")
	public ResponseDTO<LocationRequestDTO> updateQuotationRequestProcess(
			@RequestBody LocationRequestDTO locationRequestDTO) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(locationRequestDTO,
					"updateLocationRequestProcess2");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.updateQuotationRequestProcess(locationRequestDTO);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}

//--------------------------------------------------------------------------------------------------//

	// Consoliadtion of Quotation Request - Bharath Parthiban (24-11-2025)

	@GetMapping("/retrieveConsolidationOfLocationRequest/{date}")
	@Tag(name = "Consoliadtion of Quotation Request")
	@Observed(name = "retrieveConsolidationOfLocationRequest", contextualName = "retrieveConsolidationOfLocationRequest")
	public ResponseDTO<List<LocationRequestDTO>> retrieveConsolidationOfLocationRequest(
			@PathVariable("date") String date) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("date", date);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "retrieveConsolidationOfLocationRequest");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"retrieveConsolidationOfLocationRequest_" + date);
			log.info(AppConstants.FILE_GENERATED, filePath);
			SimpleDateFormat df = new SimpleDateFormat(AppConstants.DD_MM_YYYY);
			Date parsedDate = df.parse(date);
			return tenderProcessService.retrieveConsolidationOfLocationRequest(parsedDate);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@PostMapping("/saveConsolidationLocationRequest")
	@Tag(name = "Consoliadtion of Quotation Request")
	@Observed(name = "saveConsolidationLocationRequest", contextualName = "saveConsolidationLocationRequest")
	public ResponseDTO<LocationRequestDTO> saveConsolidationLocationRequest(
			@RequestBody LocationRequestDTO locationRequestDTO) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(locationRequestDTO,
					"saveConsolidationLocationRequest");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.saveConsolidationLocationRequest(locationRequestDTO);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}

	@GetMapping("/consolidationDetailsListAPI/{date}")
	@Tag(name = "Consoliadtion of Quotation Request")
	@Observed(name = "consolidationDetailsListAPI", contextualName = "consolidationDetailsListAPI")
	public ResponseDTO<ConsolidationLocationRequestDTO> consolidationDetailsListAPI(@PathVariable("date") String date) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("date", date);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "consolidationDetailsListAPI");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"consolidationDetailsListAPI_" + date);
			log.info(AppConstants.FILE_GENERATED, filePath);
			SimpleDateFormat df = new SimpleDateFormat(AppConstants.DD_MM_YYYY);
			df.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata")); // fix timezone
			Date parsedDate = df.parse(date);
			return tenderProcessService.consolidationDetailsListAPI(parsedDate);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<ConsolidationLocationRequestDTO> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@GetMapping("/consolidationSubList/{consolidationId}")
	@Tag(name = "Consoliadtion of Quotation Request")
	@Observed(name = "consolidationSubList", contextualName = "consolidationSubList")
	public ResponseDTO<List<ConsolidationLocationRequestDTO>> consolidationSubList(
			@PathVariable("consolidationId") String consolidationId) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("consolidationId", consolidationId);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "consolidationSubList");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"consolidationSubList_" + consolidationId);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.consolidationSubList(consolidationId);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<ConsolidationLocationRequestDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	// -------------------------------------------------------------------------------------------------------------------------------//

	// Prepare Quotation - Anand (24-11-2025)

	@GetMapping("/loadConsolidationLocReq/{date}")
	@Tag(name = "Prepare Quotation")
	@Observed(name = "loadConsolidationLocReq", contextualName = "loadConsolidationLocReq")
	public ResponseDTO<List<ComboBoxDTO>> loadConsolidationLocReq(@PathVariable("date") String date) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("date", date);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "loadConsolidationLocReq");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "loadConsolidationLocReq_" + date);
			log.info(AppConstants.FILE_GENERATED, filePath);
			SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
			Date monthYear = dateFormat.parse(date);
			return tenderProcessService.loadConsolidationLocReq(monthYear);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@GetMapping("/viewConsolidationLocationRequest/{reqNo}")
	@Tag(name = "Prepare Quotation")
	@Observed(name = "viewConsolidationLocationRequest", contextualName = "viewConsolidationLocationRequest")
	public ResponseDTO<List<LocationRequestDTO>> viewConsolidationLocationRequest(@PathVariable("reqNo") String consolidationId) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("consolidationId", consolidationId);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "viewConsolidationLocationRequest");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"viewConsolidationLocationRequest_" + consolidationId);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.viewConsolidationLocationRequest(consolidationId);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@PostMapping("/savePrepareQuotation")
	@Tag(name = "Prepare Quotation")
	@Observed(name = "savePrepareQuotation", contextualName = "savePrepareQuotation")
	public ResponseDTO<LocationRequestDTO> savePrepareQuotation(@RequestBody LocationRequestDTO selectView) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(selectView, "savePrepareQuotation");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.savePrepareQuotation(selectView);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}

	// -----------------------------------------------------------------------------------------//

	// Quotation Reply - Bharath Parthiban (25-11-2025)

	@GetMapping("/dropDownQuotation/{conId}")
	@Tag(name = "Quotation Reply")
	@Observed(name = "dropDownQuotation", contextualName = "dropDownQuotation")
	public ResponseDTO<List<ComboBoxDTO>> dropDownQuotation(@PathVariable("conId") String conId) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("conId", conId);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "dropDownQuotation");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "dropDownQuotation_" + conId);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.dropDownQuotation(conId);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@GetMapping("/loadConsolidationLocReqForNp/{date}")
	@Tag(name = "Quotation Reply")
	@Tag(name = "Price Computation")
	@Tag(name = "Price Comparison Preview")
	@Observed(name = "loadConsolidationLocReqForNp", contextualName = "loadConsolidationLocReqForNp")
	public ResponseDTO<List<ComboBoxDTO>> loadConsolidationLocReqForNp(@PathVariable("date") String date) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("date", date);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "loadConsolidationLocReqForNp");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"loadConsolidationLocReqForNp_" + date);
			log.info(AppConstants.FILE_GENERATED, filePath);
			SimpleDateFormat df = new SimpleDateFormat(AppConstants.DD_MM_YYYY);
			df.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata")); // fix timezone
			Date parsedDate = df.parse(date);
			return tenderProcessService.loadConsolidationLocReqForNp(parsedDate);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	@GetMapping("/quotationReqNoDetail/{reqNo}")
	@Tag(name = "Quotation Reply")
	@Observed(name = "quotationReqNoDetail", contextualName = "quotationReqNoDetail")
	public ResponseDTO<LocationRequestDTO> quotationReqNoDetail(@PathVariable("reqNo") String reqNo) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("reqNo", reqNo);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "quotationReqNoDetail");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "quotationReqNoDetail_" + reqNo);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.quotationReqNoDetail(reqNo);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@PostMapping("/saveSupplierItemDetails")
	@Tag(name = "Quotation Reply")
	@Observed(name = "saveSupplierItemDetails", contextualName = "saveSupplierItemDetails")
	public ResponseDTO<SupplierItemMasterDTO> saveSupplierItemDetails(
			@RequestBody SupplierItemMasterDTO supplierItemMasterDTO) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(supplierItemMasterDTO, "saveSupplierItemDetails");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.saveSupplierItemDetails(supplierItemMasterDTO);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<SupplierItemMasterDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}

	@PostMapping("/updateQuotationReply")
	@Tag(name = "Quotation Reply")
	@Observed(name = "updateQuotationReply", contextualName = "updateQuotationReply")
	public ResponseDTO<LocationRequestDTO> updateQuotationReply(@RequestBody LocationRequestDTO selectView) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(selectView, "updateQuotationReply");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.updateQuotationReply(selectView);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}
	
	 @PostMapping("/addAdditionalQuotation")
	 @Tag(name = "Quotation Reply")
		@Observed(name = "addAdditionalQuotation", contextualName = "addAdditionalQuotation")
	    public ResponseEntity<ResponseDTO<LocationRequestDTO>> addAdditionalQuotation(
	            @RequestBody LocationRequestDTO locationRequestDTO) throws IOException {

		 String filePath = jsonFileStorageService.saveJsonToFile(locationRequestDTO, "addAdditionalQuotation");
			log.info(AppConstants.JSON, filePath);
	        ResponseDTO<LocationRequestDTO> response =
	        		tenderProcessService.addAdditionQuotationData(locationRequestDTO);

	        if (Boolean.TRUE.equals(response.isSuccess())) {
	            return ResponseEntity.ok(response);
	        } else {
	            return ResponseEntity.badRequest().body(response);
	        }
	    }

	@GetMapping("/listOfQuotationReply/{date}")
	@Tag(name = "Quotation Reply")
	@Observed(name = "listOfQuotationReply", contextualName = "listOfQuotationReply")
	public ResponseDTO<LocationRequestDTO> listOfPrepareQuotation(@PathVariable("date") String date) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("date", date);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "listOfQuotationReply");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "listOfQuotationReply_" + date);
			log.info(AppConstants.FILE_GENERATED, filePath);
			SimpleDateFormat df = new SimpleDateFormat(AppConstants.DD_MM_YYYY);
			Date parsedDate = df.parse(date);
			return tenderProcessService.listOfQuotationReply(parsedDate);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}
	
	@GetMapping("/subListOfQuotationReply/{headPk}")
	@Tag(name = "Quotation Reply")
	@Observed(name = "subListOfQuotationReply", contextualName = "subListOfQuotationReply")
	public ResponseDTO<List<LocationRequestDTO>> getQuotationItemDetails(@PathVariable("headPk") int headPk) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("headPk", headPk);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "subListOfQuotationReply");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "subListOfQuotationReply_" + headPk);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.subListOfQuotationReply(headPk);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<LocationRequestDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	

	// ------------------------------------------------------------------------------------------//

	// Price Computation - Anand (27-11-2025)

	@GetMapping("/updateNNPrice/{consolidationId}/{userFk}")
	@Tag(name = "Price Computation")
	@Observed(name = "updateNNPrice", contextualName = "updateNNPrice")
	public ResponseDTO<String> updateNNPrice(@PathVariable("consolidationId") String consolidationId,
			@PathVariable("userFk") int userFk) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("consolidationId", consolidationId);
			locationData.put("userFk", userFk);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "updateNNPrice");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"updateNNPrice_" + consolidationId + userFk);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.updateNNPricess(consolidationId, userFk);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<String> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	// ------------------------------------------------------------------------------------------//

	// Price Comparison Preview - Anand (27-11-2025)

	@GetMapping("/loadItemFromConsolidationLocReq/{con}")
	@Tag(name = "Price Comparison Preview")
	@Observed(name = "loadItemFromConsolidationLocReq", contextualName = "loadItemFromConsolidationLocReq")
	public ResponseDTO<List<ComboBoxDTO>> loadItemFromConsolidationLocReq(@PathVariable("con") String con) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("con", con);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "loadItemFromConsolidationLocReq");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"loadItemFromConsolidationLocReq_" + con);
			log.info(AppConstants.FILE_GENERATED, filePath);
			return tenderProcessService.loadItemFromConsolidationLocReq(con);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}

	@PostMapping("/showPriceComparison")
	@Tag(name = "Price Comparison Preview")
	@Tag(name = "Change System Selected Supplier for Items")
	@Tag(name = "Edit-System Selected Supplier for Items")
	@Observed(name = "showPriceComparison", contextualName = "showPriceComparison")
	public ResponseDTO<List<LocationRequestDTO>> showPriceComparison(
			@RequestBody LocationRequestDTO locationRequestDTO) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(locationRequestDTO, "showPriceComparison");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.showPriceComparison(locationRequestDTO);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<LocationRequestDTO>> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}

	@GetMapping("/priceComparisonReport")
	@Tag(name = "Price Comparison Preview")
	@Observed(name = "priceComparisonReport", contextualName = "priceComparisonReport")
	public ResponseEntity<InputStreamResource> priceComparisonReport(
			@RequestParam(name = "period", required = true) String periodStr,
			@RequestParam(name = "consolidationId", required = true) String consolidationId,
			@RequestParam(name = "itemId", required = false) String itemId) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("period", periodStr);
			locationData.put("consolidationId", consolidationId);
			locationData.put("itemId", itemId);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "priceComparisonReport");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData,
					"priceComparisonReport_" + periodStr + consolidationId + itemId);
			log.info(AppConstants.FILE_GENERATED, filePath);
			SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
			Date period = dateFormat.parse(periodStr);

			FileResponseDTO fileResponse = tenderProcessService.downloadPcReport(period, consolidationId, itemId);

			HttpHeaders headers = new HttpHeaders();
			headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileResponse.getFileName());
			headers.setContentType(MediaType.APPLICATION_PDF);

			return ResponseEntity.ok().headers(headers).body(new InputStreamResource(fileResponse.getInputStream()));

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	
	//---------------------------------------------------------------------------------------//
	
	//  Change System Selected Supplier for Items - Udayakumar
	
	
	
	@GetMapping("/loadConsolidationLocReqForSc/{date}")
	@Tag(name = "Change System Selected Supplier for Items")
	@Tag(name = "Edit-System Selected Supplier for Items")
	@Observed(name = "loadConsolidationLocReqForSc", contextualName = "loadConsolidationLocReqForSc")
	public ResponseDTO<List<ComboBoxDTO>> loadConsolidationLocReqForSc(@PathVariable("date") String date) {
		try {
			Map<String, Object> locationData = new HashMap<>();
			locationData.put("date", date);
			locationData.put(AppConstants.TIMESTAMP, LocalDateTime.now().toString());
			locationData.put(AppConstants.ENDPOINT, "loadConsolidationLocReqForSc");

			String filePath = jsonFileStorageService.saveJsonToFile(locationData, "loadConsolidationLocReqForSc_" + date);
			log.info(AppConstants.FILE_GENERATED, filePath);
			SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
			Date monthYear = dateFormat.parse(date);
			return tenderProcessService.loadConsolidationLocReqForSc(monthYear);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
			response.setSuccess(false);
			response.setMessage(AppConstants.ERROR + e.getMessage());
			response.setData(null);
			return response;
		}
	}
	
	
	@PostMapping("/updateSelectedSupplier")
	@Tag(name = "Change System Selected Supplier for Items")
	public ResponseDTO<String> updateSelectedSupplier(@RequestBody LocationRequestDTO locationRequestDTO) throws IOException {
		String filePath = jsonFileStorageService.saveJsonToFile(locationRequestDTO, "updateSelectedSupplier");
		log.info(AppConstants.JSON, filePath);
		return tenderProcessService.updateSelectedSupplier(locationRequestDTO);
	}

	
	//----------------------------------------------------------------------------------------------//
	
	
	//  Edit Change System Selected Supplier for Items - Udayakumar
	
	@PostMapping("/updateEditSelectedSupplier")
	@Tag(name = "Edit-System Selected Supplier for Items")
	@Observed(name = "updateEditSelectedSupplier", contextualName = "updateEditSelectedSupplier")
	public ResponseDTO<LocationRequestDTO> updateEditSelectedSupplier(@RequestBody LocationRequestDTO selectView) {
		try {
			String filePath = jsonFileStorageService.saveJsonToFile(selectView, "updateEditSelectedSupplier");
			log.info(AppConstants.JSON, filePath);
			return tenderProcessService.updateEditSelectedSupplier(selectView);
		} catch (IOException e) {
			log.error(AppConstants.FILE, e.getMessage());

			// Return a proper error response
			ResponseDTO<LocationRequestDTO> res = new ResponseDTO<>();
			res.setSuccess(false);
			res.setMessage(AppConstants.ERROR + e.getMessage());
			res.setData(null);
			return res;
		}
	}
	
	
	//---------------------------------------------------------------------------------------------//
	
	@PostMapping("/finalizeTheSupplierSelection")
	@Tag(name = "Finalize the supplier Selection")
	public ResponseDTO<LocationRequestDTO> finalizeTheSupplierSelection(
	        @RequestBody LocationRequestDTO locationRequestDTO) {
	    return tenderProcessService.finalizeTheSupplierSelection(locationRequestDTO);
	}
	
}
