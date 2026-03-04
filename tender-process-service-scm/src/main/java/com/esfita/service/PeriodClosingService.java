/**
 * 
 * @author Rammohan R
 * @since 17-Jan-2026
 * 
 */
package com.esfita.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.esfita.common.AppConstants;
import com.esfita.common.ResponseDTO;
import com.esfita.common.RestException;
import com.esfita.dto.LocationRequestDTO;
import com.esfita.entity.EntityEiisHib;
import com.esfita.repository.EntityEiisRepository;
import com.esfita.repository.SelectedSupplierRepository;
import com.esfita.repository.StockRepository;
import com.esfita.repository.SuppDelHeadRepository;
import com.esfita.repository.SuppliersItemRepository;


@Service
public class PeriodClosingService {

	private static final Logger log = LoggerFactory.getLogger(PeriodClosingService.class);
	
	@Autowired
	EntityEiisRepository entityEiisRepository;
	@Autowired
    private SelectedSupplierRepository selectedSupplierRepository;
	@Autowired
	private SuppliersItemRepository suppliersItemRepository;
	@Autowired
	StockRepository stockRepository;
	@Autowired
	SuppDelHeadRepository suppDelHeadRepository;
	
	// Purchase Period Closing
	public ResponseDTO<String> closePurchasePeriod(LocationRequestDTO dto) {

	    ResponseDTO<String> response = new ResponseDTO<>();

	    try {
	    	EntityEiisHib hib = entityEiisRepository.findByPk(1);

	        if (hib == null || hib.getPurchasePeriod() == null) {
	            response.setSuccess(false);
	            response.setMessage("Purchase period not found");
	            response.setData(null);
	            return response;
	        }

	        Calendar calendar = Calendar.getInstance();
	        calendar.setTime(hib.getPurchasePeriod());
	        calendar.add(Calendar.MONTH, 1);

	        hib.setPurchasePeriod(calendar.getTime());
	        entityEiisRepository.save(hib);

	        response.setSuccess(true);
	        response.setMessage("Purchase period closed successfully");
	        response.setData("SUCCESS");

	    } catch (RestException re) {
	        response.setSuccess(false);
	        response.setMessage("Error while closing purchase period");
	        response.setData(null);
	        log.error("RestException while Closing Purchase Period", re);

	    } catch (Exception e) {
	        response.setSuccess(false);
	        response.setMessage("Unexpected error while closing purchase period");
	        response.setData(null);
	        log.error("Exception while Closing Purchase Period", e);
	    }

	    return response;
	}

	
	// Duplicate Supplier Selection - Stock	
	public ResponseDTO<LocationRequestDTO> copyPurchasePeriodData(LocationRequestDTO locationRequestDTO) {

	    ResponseDTO<LocationRequestDTO> response = new ResponseDTO<>();

	    try {

	        Date startDate = locationRequestDTO.getPeriod();
	        Date endDate = locationRequestDTO.getLastUpdate();

	        List<Date> dates = CommonService.getStartDatesOfMonths(startDate, endDate);

	        for (Date date : dates) {

	            if (locationRequestDTO.getAplPk() == 0) {

	            	selectedSupplierRepository.deleteByPeriod(date);
	            	selectedSupplierRepository.copyDate(locationRequestDTO.getPeriod(), date);

	            	suppliersItemRepository.deleteByPeriod(date);
	            	suppliersItemRepository.copyDate(locationRequestDTO.getPeriod(), date);

	            } else if (locationRequestDTO.getAplPk() == 1) {

	            	suppliersItemRepository.deleteByPeriod(date);
	            	suppliersItemRepository.copyDate(locationRequestDTO.getPeriod(), date);
	            }
	        }

	        response.setSuccess(AppConstants.TRUE);
	        response.setMessage("Successful");
	        response.setData(locationRequestDTO);

	    } catch (RestException re) {

	    	 response.setSuccess(AppConstants.FALSE);
	        response.setMessage("Un Expected error"+re);
	        response.setData(locationRequestDTO);
	        log.info("Exception occurred while copying Selected Supplier and Suppliers Item: {}", re.getMessage(), re);

	    } catch (Exception e) {

	    	 response.setSuccess(AppConstants.FALSE);
		        response.setMessage("Un expected error"+e);
	        response.setData(locationRequestDTO);
	        log.info("Exception Occured while Copying Selected Supplier and Suppliers Item: {}", e.getMessage());

	    }

	    return response;
	}
	
	//----------------------------------------------------------------------------------------------------------------//
	
	// Stock Period Closing
	
	
	public ResponseDTO<String> closeStockPeriod(LocationRequestDTO locationRequestDTO) {

	    ResponseDTO<String> response = new ResponseDTO<>();

	    try {
	        // Move current stock to history
	    	stockRepository.insertStockHist(locationRequestDTO.getPeriod());

	        // Clear stock table
	    	stockRepository.truncateStockTable();

	        // Get cash opening balance
	        double cashOp = stockRepository.getCashOpBalance(locationRequestDTO.getPeriod());

	        // Insert new stock for next period
	        stockRepository.insertIntoStock(locationRequestDTO.getPeriod());

	        // Update EIIS master
	        EntityEiisHib hib = entityEiisRepository.findByPk(1);

	        Calendar calendar = Calendar.getInstance();
	        calendar.setTime(hib.getStockPeriod());
	        calendar.add(Calendar.MONTH, 1);

	        hib.setStockPeriod(calendar.getTime());
	        hib.setStockClosing(0);
	        hib.setCashOpBalance(cashOp);

	        entityEiisRepository.save(hib);

	        response.setSuccess(true);
	        response.setMessage("Stock period closed successfully");
	        response.setData("SUCCESS");

	    } catch (RestException re) {

	        response.setSuccess(false);
	        response.setMessage(re.getMessage());
	        response.setData("FAILED");
	        log.error("Exception occurred while closing stock period", re);

	    } catch (Exception e) {

	        response.setSuccess(false);
	        response.setMessage("Error occurred while closing stock period");
	        response.setData("FAILED");
	        log.error("Exception occurred while closing stock period", e);
	    }

	    return response;
	}

	
	
	public ResponseDTO<String> getStockClosingApproval(Date period) {

	    ResponseDTO<String> response = new ResponseDTO<>();

	    try {
	        List<String> grnList = suppDelHeadRepository.getGrnList(period);
	        List<String> retList = suppDelHeadRepository.getRetnList(period);

	        StringBuilder value = new StringBuilder();
	        boolean valid = true;

	        if (grnList != null && !grnList.isEmpty()) {
	            for (String sr : grnList) {
	                value.append(sr).append(" , ");
	            }
	            valid = false;
	        }

	        if (retList != null && !retList.isEmpty()) {
	            for (String sr : retList) {
	                value.append(sr).append(" , ");
	            }
	            valid = false;
	        }
	        
	        EntityEiisHib eiisEntity = entityEiisRepository.findByPk(1);

	        if (eiisEntity.getStockClosing() != 2) {
	            value.append(". Please complete the physical stock entry before stock period closing");
	            valid = false;
	        }

	        response.setSuccess(valid);
	        response.setMessage(value.toString());
	        response.setData("SUCCESS");

	    } catch (RestException re) {

	        log.warn("Error while getting stock closing approval", re);
	        response.setSuccess(false);
	        response.setMessage(re.getMessage());
	        response.setData("FAILED");

	    } catch (Exception e) {

	        log.error("Exception occurred while getting stock closing approval", e);
	        response.setSuccess(false);
	        response.setMessage("Error occurred while validating stock closing approval");
	        response.setData("FAILED");
	    }

	    log.info("<<<< ------- Physical Stock Entry Validation Completed ------- >>>>>>>");
	    return response;
	}

	//-------------------------------------------------------------------------------------------------------------//
	
	// Duplicate Supplier Item-Tender
	
	public ResponseDTO<String> copyTenderPeriodData(LocationRequestDTO locationRequestDTO) {

	    ResponseDTO<String> response = new ResponseDTO<>();

	    try {

	        Date startDate = locationRequestDTO.getPeriod();
	        Date endDate = locationRequestDTO.getEndDate();

	        // Delete existing data for target period
	        suppliersItemRepository.deleteByPeriod(endDate);

	        // Copy data from source period to target period
	        suppliersItemRepository.copyDate(startDate, endDate);

	        response.setSuccess(true);
	        response.setMessage("Tender period data copied successfully");
	        response.setData("SUCCESS");

	    } catch (RestException re) {

	        log.error("Exception occurred while copying tender period data", re);
	        response.setSuccess(false);
	        response.setMessage(re.getMessage());
	        response.setData("FAILED");

	    } catch (Exception e) {

	        log.error("Unexpected error occurred while copying tender period data", e);
	        response.setSuccess(false);
	        response.setMessage("Error occurred while copying tender period data");
	        response.setData("FAILED");
	    }

	    return response;
	}
	
	
	// Tender Period Closing
	
	public ResponseDTO<String> closeTenderPeriod(LocationRequestDTO locationRequestDTO) {

	    ResponseDTO<String> response = new ResponseDTO<>();

	    try {
	        // Fetch EIIS master record
	        EntityEiisHib hib = entityEiisRepository.findByPk(1);

	        // Add months to the current tender period
	        Calendar calendar = Calendar.getInstance();
	        calendar.setTime(hib.getTenderPeriod());
	        calendar.add(Calendar.MONTH, hib.getTenderCount());

	        hib.setTenderPeriod(calendar.getTime());

	        // Save the updated record
	        entityEiisRepository.save(hib);

	        response.setSuccess(true);
	        response.setMessage("Tender period closed successfully");
	        response.setData("SUCCESS");

	    } catch (RestException re) {

	        log.error("Exception occurred while closing tender period", re);
	        response.setSuccess(false);
	        response.setMessage(re.getMessage());
	        response.setData("FAILED");

	    } catch (Exception e) {

	        log.error("Unexpected error occurred while closing tender period", e);
	        response.setSuccess(false);
	        response.setMessage("Error occurred while closing tender period");
	        response.setData("FAILED");
	    }

	    return response;
	}


}

