/**
 * 
 * @author Rammohan R
 * @since 17-Jan-2026
 * 
 */
package com.esfita.controller;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.esfita.common.ResponseDTO;
import com.esfita.dto.LocationRequestDTO;
import com.esfita.service.PeriodClosingService;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("periodClosingController")
public class PeriodClosingController {

	
	private static final Logger log = LoggerFactory.getLogger(PeriodClosingController.class);
	
	@Autowired
	PeriodClosingService periodClosingService;
	
	
	// Purchase Period Closing
	
	@Tag(name = "Purchase Period Closing")
	@PostMapping("/closePurchasePeriod")
    public ResponseEntity<ResponseDTO<String>> closePurchasePeriod(
            @RequestBody LocationRequestDTO locationRequestDTO) {
        ResponseDTO<String> response;

        try {
            response = periodClosingService.closePurchasePeriod(locationRequestDTO);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Exception in closePurchasePeriod controller", e);

            ResponseDTO<String> errorResponse = new ResponseDTO<>();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Internal server error");
            errorResponse.setData(null);

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
	
	//------------------------------------------------------------------------------------------------------//
	
	// Duplicate Supplier Selection - Stock
	
	@Tag(name = "Duplicate Supplier Selection - Stock")
	@PostMapping("/copyPurchasePeriodData")
	public ResponseDTO<LocationRequestDTO> copyPurchasePeriodData(@RequestBody LocationRequestDTO locationRequestDTO) {
		return periodClosingService.copyPurchasePeriodData(locationRequestDTO);
	}
	
	//----------------------------------------------------------------------------------------------------------//
	
	// Stock Period Closing
	
	@Tag(name = "Stock Period Closing")
	@PostMapping("/closeStockPeriod")
    public ResponseDTO<String> closeStockPeriod(
            @RequestBody LocationRequestDTO locationRequestDTO) {

        log.info("Request received to close stock period");
        return periodClosingService.closeStockPeriod(locationRequestDTO);
    }

	@Tag(name = "Stock Period Closing")
    @GetMapping("/getStockClosingApproval")
    public ResponseDTO<String> getStockClosingApproval(
            @RequestParam("period")
            @DateTimeFormat(pattern = "yyyy-MM-dd") Date period) {

        log.info("Request received to validate stock closing approval for period: {}", period);
        return periodClosingService.getStockClosingApproval(period);
    }
	
    //-----------------------------------------------------------------------------------------------------------//
    
    // Duplicate Supplier Item-Tender
    
	@Tag(name = "Duplicate Supplier Item-Tender")
    @PostMapping("/copyTenderPeriodData")
    public ResponseDTO<String> copyTenderPeriodData(@RequestBody LocationRequestDTO locationRequestDTO) {
        log.info("Request received to copy tender period data from {} to {}",
                locationRequestDTO.getPeriod(), locationRequestDTO.getEndDate());
        return periodClosingService.copyTenderPeriodData(locationRequestDTO);
    }

    //-----------------------------------------------------------------------------------------------------------//
    
    // Tender Period Closing
      
	@Tag(name = "Tender Period Closing")
    @PostMapping("/closeTenderPeriod")
    public ResponseDTO<String> closeTenderPeriod(@RequestBody LocationRequestDTO locationRequestDTO) {
        log.info("Request received to close tender period for location: {}", locationRequestDTO.getLocationId());
        return periodClosingService.closeTenderPeriod(locationRequestDTO);
    }
}

