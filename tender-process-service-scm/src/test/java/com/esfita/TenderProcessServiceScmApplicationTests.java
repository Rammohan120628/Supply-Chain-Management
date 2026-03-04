package com.esfita;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.esfita.common.ComboBoxDTO;
import com.esfita.common.ResponseDTO;
import com.esfita.dto.ConsolidationLocationRequestDTO;
import com.esfita.dto.LocationRequestDTO;
import com.esfita.entity.ConsolidationLocationRequestHib;
import com.esfita.entity.ItemHib;
import com.esfita.entity.QuotationProcessDetailHib;
import com.esfita.entity.QuotationProcessHeadHib;
import com.esfita.entity.QuotationRequestDetailHib;
import com.esfita.entity.QuotationRequeustHeadHib;
import com.esfita.entity.SuppliersHib;
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
import com.esfita.service.CommonService;
import com.esfita.service.TenderProcessService;

@ExtendWith(MockitoExtension.class)
class TenderProcessServiceTest {

    @Mock
    private QuotationRequeustHeadRepository quotationRequeustHeadRepository;
    
    @Mock
    private QuotationRequestDetailRepository quotationRequestDetailRepository;
    
    @Mock
    private ApprovalProductListRepository approvalProductListRepository;
    
    @Mock
    private SelectedSupplierRepository selectedSupplierRepository;
    
    @Mock
    private ItemRepository itemRepository;
    
    @Mock
    private SuppliersRepository suppliersRepository;
    
    @Mock
    private LocationRepository locationRepository;
    
    @Mock
    private ConsolidationLocationRequestRepository consolidationLocationRequestRepository;
    
    @Mock
    private QuotationProcessHeadRepository quotationProcessHeadRepository;
    
    @Mock
    private QuotationProcessDetailRepository quotationProcessDetailRepository;
    
    @Mock
    private SuppliersItemRepository suppliersItemRepository;
    
    @Mock
    private EntityEiisRepository entityEiisRepository;
    
    @Mock
    private LocationRequeustHeadRepository locationRequeustHeadRepository;
    
    @Mock
    private LocationRequestDetailRepository locationRequestDetailRepository;
    
    @Mock
    private CommonService commonService;
    
    @InjectMocks
    private TenderProcessService tenderProcessService;
    
    @Mock
    private MultipartFile multipartFile;
    
    @Mock
    private HttpURLConnection mockConnection;
    
//    @BeforeEach
//    void setUp() {
//        tenderProcessService = new TenderProcessService();
//        // Set up the mocks since we can't use @InjectMocks directly with all the autowired fields
//        tenderProcessService.quotationRequeustHeadRepository = quotationRequeustHeadRepository;
//        tenderProcessService.quotationRequestDetailRepository = quotationRequestDetailRepository;
//        tenderProcessService.approvalProductListRepository = approvalProductListRepository;
//        tenderProcessService.selectedSupplierRepository = selectedSupplierRepository;
//        tenderProcessService.itemRepository = itemRepository;
//        tenderProcessService.suppliersRepository = suppliersRepository;
//        tenderProcessService.locationRepository = locationRepository;
//        tenderProcessService.consolidationLocationRequestRepository = consolidationLocationRequestRepository;
//        tenderProcessService.quotationProcessHeadRepository = quotationProcessHeadRepository;
//        tenderProcessService.quotationProcessDetailRepository = quotationProcessDetailRepository;
//        tenderProcessService.suppliersItemRepository = suppliersItemRepository;
//        tenderProcessService.entityEiisRepository = entityEiisRepository;
//        tenderProcessService.locationRequeustHeadRepository = locationRequeustHeadRepository;
//        tenderProcessService.locationRequestDetailRepository = locationRequestDetailRepository;
//        tenderProcessService.commonService = commonService;
//    }
    
    @Test
    void testSaveQuotationRequest_Success() {
        // Arrange
        LocationRequestDTO requestDTO = new LocationRequestDTO();
        requestDTO.setLocationId("LOC001");
        requestDTO.setUserFk(1);
        requestDTO.setEntityId("ENT001");
        requestDTO.setRenderedDate(true);
        requestDTO.setRenderedDate(true);
        requestDTO.setSubList(Arrays.asList(createLocationRequestDetail()));
        
        QuotationRequeustHeadHib mockHeader = new QuotationRequeustHeadHib();
        mockHeader.setReqNo("REQ001");
        
        when(commonService.createAndSaveHeader(any(LocationRequestDTO.class), any(ResponseDTO.class)))
            .thenReturn(mockHeader);
        when(commonService.buildIntList(any(LocationRequestDTO.class)))
            .thenReturn(Arrays.asList(1, 2));
        doNothing().when(commonService).processSubListAndSaveDetails(
            any(LocationRequestDTO.class), any(QuotationRequeustHeadHib.class), 
            any(List.class), any(ResponseDTO.class));
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.saveQuotationRequest(requestDTO);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("REQ001-Record Created Successfully", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("REQ001", response.getData().getDownloadUrlPath());
        
        verify(commonService).createAndSaveHeader(any(), any());
        verify(commonService).buildIntList(any());
        verify(commonService).processSubListAndSaveDetails(any(), any(), any(), any());
    }
    
    @Test
    void testSaveQuotationRequest_Failure_NoLocationId() {
        // Arrange
        LocationRequestDTO requestDTO = new LocationRequestDTO();
        requestDTO.setLocationId(null);
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.saveQuotationRequest(requestDTO);
        
        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Please Choose Location Id", response.getMessage());
        
        verify(commonService, never()).createAndSaveHeader(any(), any());
    }
    
    @Test
    void testSaveQuotationRequest_Exception() {
        // Arrange
        LocationRequestDTO requestDTO = new LocationRequestDTO();
        requestDTO.setLocationId("LOC001");
        
        when(commonService.createAndSaveHeader(any(), any()))
            .thenThrow(new RuntimeException("Database error"));
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.saveQuotationRequest(requestDTO);
        
        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Error While Saving The Record", response.getMessage());
    }
    
    @Test
    void testQuotationRequestHeaderList_Success() {
        // Arrange
        Date period = new Date();
        List<QuotationRequeustHeadHib> hibList = Arrays.asList(
            createQuotationRequestHead(0),
            createQuotationRequestHead(1),
            createQuotationRequestHead(2)
        );
        
        LocationRequestDTO mockDTO1 = createLocationRequestDTO(0);
        LocationRequestDTO mockDTO2 = createLocationRequestDTO(1);
        LocationRequestDTO mockDTO3 = createLocationRequestDTO(2);
        
        when(quotationRequeustHeadRepository.orderByPeriod(period)).thenReturn(hibList);
        when(commonService.mapToDTO(any(QuotationRequeustHeadHib.class)))
            .thenReturn(mockDTO1, mockDTO2, mockDTO3);
        doNothing().when(commonService).assignDeliveryMode(any(LocationRequestDTO.class), any(QuotationRequeustHeadHib.class));
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.quotationRequestHeaderList(period);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Location Request Headers grouped successfully", response.getMessage());
        assertNotNull(response.getData());
        
        verify(quotationRequeustHeadRepository).orderByPeriod(period);
        verify(commonService, times(3)).mapToDTO(any());
    }
    
    @Test
    void testQuotationRequestHeaderList_NoRecords() {
        // Arrange
        Date period = new Date();
        when(quotationRequeustHeadRepository.orderByPeriod(period)).thenReturn(Collections.emptyList());
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.quotationRequestHeaderList(period);
        
        // Assert
        assertFalse(response.isSuccess());
        assertEquals("No records found for the provided period.", response.getMessage());
    }
    
    @Test
    void testQuotationRequestSubList_Success() {
        // Arrange
        int reqHeadPk = 1;
        List<QuotationRequestDetailHib> detailList = Arrays.asList(
            createQuotationRequestDetail(),
            createQuotationRequestDetail()
        );
        
        LocationRequestDTO mockDTO = new LocationRequestDTO();
        
        when(quotationRequestDetailRepository.findId(reqHeadPk)).thenReturn(detailList);
//        when(commonService.mapDetailToDTO(any(QuotationRequestDetailHib.class)))
//            .thenReturn(mockDTO);
        
        // Act
        ResponseDTO<List<LocationRequestDTO>> response = tenderProcessService.quotationRequestSubList(reqHeadPk);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Location Request Details fetched successfully", response.getMessage());
        assertNotNull(response.getData());
        assertEquals(2, response.getData().size());
        
        verify(quotationRequestDetailRepository).findId(reqHeadPk);
       // verify(commonService, times(2)).mapDetailToDTO(any());
    }
    
    @Test
    void testQuotationRequestSubList_NoRecords() {
        // Arrange
        int reqHeadPk = 1;
        when(quotationRequestDetailRepository.findId(reqHeadPk)).thenReturn(Collections.emptyList());
        
        // Act
        ResponseDTO<List<LocationRequestDTO>> response = tenderProcessService.quotationRequestSubList(reqHeadPk);
        
        // Assert
        assertFalse(response.isSuccess());
        assertEquals("No records found for ReqHeadPk: 1", response.getMessage());
    }
    
    @Test
    void testReadExcelAndConvert_Success() throws IOException {
        // Arrange
        String period = "2025-11-01";
        byte[] excelData = createTestExcelData();
        
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(excelData));
        
        LocationRequestDTO mockDTO = new LocationRequestDTO();
        when(commonService.mapRowToDTO(any(Row.class), eq(period), any(SimpleDateFormat.class), any(java.sql.Date.class)))
            .thenReturn(mockDTO);
        
        // Act
        List<LocationRequestDTO> result = tenderProcessService.readExcelAndConvert(multipartFile, period);
        
        // Assert
        assertNotNull(result);
        verify(commonService).mapRowToDTO(any(), any(), any(), any());
    }
    
    @Test
    void testSaveQuotationRequestBulUpload_Success() {
        // Arrange
        LocationRequestDTO requestDTO = new LocationRequestDTO();
        requestDTO.setLocationId("LOC001");
        requestDTO.setEntityId("ENT001");
        requestDTO.setUserFk(1);
        requestDTO.setPeriod(new Date());
        requestDTO.setSubList(Arrays.asList(createLocationRequestDetail()));
        
        when(commonService.generateLocationReqNo()).thenReturn("REQ");
        when(quotationRequeustHeadRepository.transactionNo("REQ%")).thenReturn(Collections.emptyList());
        when(commonService.generateLocationReqNo(1)).thenReturn("REQ001");
        doNothing().when(commonService).saveLocationRequestDetailsSub(
            any(LocationRequestDTO.class), any(QuotationRequeustHeadHib.class), any(ResponseDTO.class));
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.saveQuotationRequestBulUpload(requestDTO);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("REQ001-Record Created Successfully", response.getMessage());
        
        verify(quotationRequeustHeadRepository).save(any(QuotationRequeustHeadHib.class));
        verify(commonService).saveLocationRequestDetailsSub(any(), any(), any());
    }
    
    @Test
    void testDropDownQuotationReqNo_Success() {
        // Arrange
        Date monthYear = new Date();
        List<QuotationRequeustHeadHib> heads = Arrays.asList(
            createQuotationRequestHead(0),
            createQuotationRequestHead(0)
        );
        
        when(quotationRequeustHeadRepository.byPeriodAndStatus0(monthYear)).thenReturn(heads);
        
        // Act
        ResponseDTO<List<ComboBoxDTO>> response = tenderProcessService.dropDownQuotationReqNo(monthYear);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Quotation Request Numbers Loaded Successfully", response.getMessage());
        assertNotNull(response.getData());
        assertEquals(2, response.getData().size());
    }
    
    @Test
    void testGetreqDetailList_Success() {
        // Arrange
        int reqHeadFK = 1;
        List<QuotationRequestDetailHib> detailList = Arrays.asList(
            createQuotationRequestDetail(),
            createQuotationRequestDetail()
        );
        
//        ProcessedRequestData processedData = new ProcessedRequestData(null, null);
//        processedData.setRenddto(Arrays.asList(new LocationRequestDTO()));
//        processedData.setReqDetailList(Arrays.asList(new LocationRequestDTO()));
        
        when(quotationRequestDetailRepository.getreqDetailList(reqHeadFK)).thenReturn(detailList);
     //   when(commonService.processRequestDetails(detailList, reqHeadFK)).thenReturn(processedData);
        
        // Act
        ResponseDTO<Map<String, Object>> response = tenderProcessService.getreqDetailList(reqHeadFK);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Request details retrieved successfully", response.getMessage());
        assertNotNull(response.getData());
        assertTrue(response.getData().containsKey("overallList"));
        assertTrue(response.getData().containsKey("reqDetailList"));
    }
    
    @Test
    void testUpdateLocationRequestProcess2_Success() {
        // Arrange
        LocationRequestDTO requestDTO = new LocationRequestDTO();
        requestDTO.setLocationId("LOC001");
        requestDTO.setReqTransactionNo("REQ001");
        requestDTO.setSubList(Arrays.asList(createLocationRequestDetail()));
        
        QuotationRequeustHeadHib headerHib = new QuotationRequeustHeadHib();
        
        when(commonService.buildRenderedDaysList(requestDTO)).thenReturn(Arrays.asList(1, 2, 3));
        when(quotationRequeustHeadRepository.getHeadBasedOnReqNo("REQ001")).thenReturn(headerHib);
        doNothing().when(quotationRequestDetailRepository).deleteAlreadyExistData("REQ001");
        doNothing().when(commonService).processAndSaveUpdatedDetails(
            any(LocationRequestDTO.class), any(QuotationRequeustHeadHib.class), 
            any(List.class), any(ResponseDTO.class));
        
        // Act
   //     ResponseDTO<LocationRequestDTO> response = tenderProcessService.updateLocationRequestProcess2(requestDTO);
        
        // Assert
//        assertTrue(response.isSuccess());
//        assertEquals("Successfull", response.getMessage());
        
        verify(quotationRequestDetailRepository).deleteAlreadyExistData("REQ001");
        verify(commonService).processAndSaveUpdatedDetails(any(), any(), any(), any());
    }
    
    @Test
    void testRetrieveConsolidationOfLocationRequest_Success() {
        // Arrange
        Date monthYear = new Date();
        List<QuotationRequestDetailHib> detailList = Arrays.asList(
            createQuotationRequestDetail(),
            createQuotationRequestDetail()
        );
        
        ItemHib itemHib = new ItemHib();
        itemHib.setItemName("Test Item");
        
        when(quotationRequestDetailRepository.retriveDate(monthYear)).thenReturn(detailList);
        when(itemRepository.findId(anyInt())).thenReturn(itemHib);
//        when(quotationRequestDetailRepository.sumQtyByItemIdAndYearAndMonth(anyInt(), anyInt(), anyInt()))
//            .thenReturn(100.0);
        
        // Act
        ResponseDTO<List<LocationRequestDTO>> response = tenderProcessService.retrieveConsolidationOfLocationRequest(monthYear);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Record Fetched Successfully", response.getMessage());
        assertNotNull(response.getData());
    }
    
    @Test
    void testSaveConsolidationLocationRequest_Success() {
        // Arrange
        LocationRequestDTO selectView = new LocationRequestDTO();
        selectView.setItems(Arrays.asList(createLocationRequestDetail()));
        
        when(commonService.generateConNo()).thenReturn("CON");
        when(consolidationLocationRequestRepository.transactionNo("CON%")).thenReturn(Collections.emptyList());
        when(commonService.generateConNo(1)).thenReturn("CON001");
        doNothing().when(commonService).processConsolidationItems(
            eq("CON001"), any(LocationRequestDTO.class), any(ResponseDTO.class));
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.saveConsolidationLocationRequest(selectView);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("CON001-Record Created Successfully", response.getMessage());
        
        verify(commonService).processConsolidationItems(any(), any(), any());
    }
    
    @Test
    void testSaveConsolidationLocationRequest_EmptyItemList() {
        // Arrange
        LocationRequestDTO selectView = new LocationRequestDTO();
        selectView.setItems(Collections.emptyList());
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.saveConsolidationLocationRequest(selectView);
        
        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Item List is Empty", response.getMessage());
    }
    
    @Test
    void testConsolidationDetailsListAPI_Success() {
        // Arrange
        Date period = new Date();
        List<ConsolidationLocationRequestHib> hibList = Arrays.asList(
            createConsolidationLocationRequest(0),
            createConsolidationLocationRequest(1),
            createConsolidationLocationRequest(2)
        );
        
        when(consolidationLocationRequestRepository.orderByPeriodGroupByConsolidationId(period))
            .thenReturn(hibList);
        
        // Act
        ResponseDTO<ConsolidationLocationRequestDTO> response = tenderProcessService.consolidationDetailsListAPI(period);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Record Fetched Successfully", response.getMessage());
        assertNotNull(response.getData());
    }
    
    @Test
    void testConsolidationSubList_Success() {
        // Arrange
        String consolidationId = "CON001";
        List<ConsolidationLocationRequestHib> hibList = Arrays.asList(
            createConsolidationLocationRequest(0),
            createConsolidationLocationRequest(0)
        );
        
        ConsolidationLocationRequestDTO mockDTO = new ConsolidationLocationRequestDTO();
        
        when(consolidationLocationRequestRepository.byConsolidationIdsSingle(consolidationId))
            .thenReturn(hibList);
        when(commonService.mapConsolidationHibToDTO(any(ConsolidationLocationRequestHib.class), eq(consolidationId), any(ResponseDTO.class)))
            .thenReturn(mockDTO);
        
        // Act
        ResponseDTO<List<ConsolidationLocationRequestDTO>> response = tenderProcessService.consolidationSubList(consolidationId);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Record Fetched Successfully", response.getMessage());
        assertNotNull(response.getData());
    }
    
    @Test
    void testLoadConsolidationLocReq_Success() {
        // Arrange
        Date monthY = new Date();
        List<ConsolidationLocationRequestHib> hibList = Arrays.asList(
            createConsolidationLocationRequest(0),
            createConsolidationLocationRequest(0)
        );
        
        when(consolidationLocationRequestRepository.retriveByDateAndStatus(monthY))
            .thenReturn(hibList);
        
        // Act
        ResponseDTO<List<ComboBoxDTO>> response = tenderProcessService.loadConsolidationLocReq(monthY);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Record Fetched Successfully", response.getMessage());
        assertNotNull(response.getData());
        assertEquals(2, response.getData().size());
    }
    
    @Test
    void testSaveQuotationProcess_Success() {
        // Arrange
        LocationRequestDTO selectView = new LocationRequestDTO();
        selectView.setDeliveryLocationId("CON001");
        selectView.setUserFk(1);
        selectView.setPeriod(new Date());
        selectView.setEntityId("ENT001");
        
//        List<Object[]> supplierList = Arrays.asList(
//            new Object[]{"SUP001", 1, "PKG001", 100.0, new Date()}
//        );
//        
//        when(quotationProcessHeadRepository.getSupplierListByConsolidationIdAndPeriod("CON001", selectView.getPeriod()))
//            .thenReturn(supplierList);
        when(quotationProcessHeadRepository.alreadyExistByConId("CON001")).thenReturn(Collections.emptyList());
        when(quotationProcessHeadRepository.alreadySupplierByConId("SUP001", "CON001")).thenReturn(null);
        when(commonService.generateQuotationID()).thenReturn("QTN");
        when(quotationProcessHeadRepository.transactionNo("QTN%")).thenReturn(Collections.emptyList());
        when(commonService.generateQuotationID(1)).thenReturn("QTN001");
        when(quotationProcessHeadRepository.transByQtn("SUP001", "CON001")).thenReturn("QTN001");
        when(quotationProcessDetailRepository.maxPkByQtn("SUP001", "CON001")).thenReturn(1);
        
        // Act
   //     ResponseDTO<LocationRequestDTO> response = tenderProcessService.saveQuotationProcess(selectView);
        
        // Assert
//        assertTrue(response.isSuccess());
//        assertTrue(response.getMessage().contains("Successful"));
        
        verify(quotationProcessHeadRepository, times(1)).save(any());
        verify(quotationProcessDetailRepository, times(1)).save(any());
    }
    
    @Test
    void testDropDownQuotation_Success() {
        // Arrange
        String consId = "CON001";
        List<QuotationProcessHeadHib> heads = Arrays.asList(
            createQuotationProcessHead(),
            createQuotationProcessHead()
        );
        
        List<SuppliersHib> suppliers = Arrays.asList(
            createSupplier()
        );
        
        when(quotationProcessHeadRepository.byConsIdAndStatus0(consId)).thenReturn(heads);
        when(suppliersRepository.findAll()).thenReturn(suppliers);
        when(commonService.getSupplierName(anyString(), anyList())).thenReturn("Supplier Name");
        
        // Act
        ResponseDTO<List<ComboBoxDTO>> response = tenderProcessService.dropDownQuotation(consId);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Record Fetched Successfully", response.getMessage());
        assertNotNull(response.getData());
    }
    
    @Test
    void testUpdateQuotationReply_Success() {
        // Arrange
        LocationRequestDTO selectView = new LocationRequestDTO();
        selectView.setQuotationTransNo("QTN001");
        selectView.setItems(Arrays.asList(createLocationRequestDetail()));
        
        QuotationProcessHeadHib headHib = new QuotationProcessHeadHib();
        
        when(quotationProcessHeadRepository.headerDetail("QTN001")).thenReturn(headHib);
        doNothing().when(commonService).updateGpForItems(anyList(), eq("QTN001"), any(ResponseDTO.class));
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.updateQuotationReply(selectView);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Record Updated Successfully", response.getMessage());
        
        verify(quotationProcessHeadRepository).save(any());
        verify(commonService).updateGpForItems(any(), any(), any());
    }
    
    @Test
    void testUpdateNNPrice_Success() {
        // Arrange
        String consolidationId = "CON001";
        int userFk = 1;
        
        List<QuotationProcessHeadHib> headList = Arrays.asList(createQuotationProcessHead());
        List<QuotationProcessDetailHib> detailList = Arrays.asList(createQuotationProcessDetailEntity());
        
        when(quotationProcessHeadRepository.alreadyExistByConId(consolidationId)).thenReturn(headList);
        doNothing().when(commonService).updateNetPrices(headList);
        when(commonService.fetchAllDetails(headList)).thenReturn(detailList);
        doNothing().when(selectedSupplierRepository).deleteItem(consolidationId);
        doNothing().when(commonService).processSelection(eq(consolidationId), eq(userFk), eq(headList), eq(detailList));
     //   when(commonService.successResponse(anyString())).thenReturn(new ResponseDTO<>(true, "Success"));
        
        // Act
        ResponseDTO<String> response = tenderProcessService.updateNNPrice(consolidationId, userFk);
        
        // Assert
        assertTrue(response.isSuccess());
        
        verify(commonService).updateNetPrices(headList);
        verify(selectedSupplierRepository).deleteItem(consolidationId);
        verify(commonService).processSelection(any(), any(), any(), any());
    }
    
    @Test
    void testUpdateSelectedSupplier_Success() {
        // Arrange
        LocationRequestDTO requestDTO = new LocationRequestDTO();
        requestDTO.setConsolidationId("CON001");
        requestDTO.setItems(Arrays.asList(createLocationRequestDetail()));
        
        List<QuotationProcessHeadHib> headList = Arrays.asList(createQuotationProcessHead());
        List<QuotationProcessDetailHib> detailList = Arrays.asList(createQuotationProcessDetailEntity());
        
        when(quotationProcessHeadRepository.alreadyExistByConId("CON001")).thenReturn(headList);
        when(commonService.collectAllDetails(headList)).thenReturn(detailList);
        when(commonService.hasItems(requestDTO)).thenReturn(true);
        doNothing().when(commonService).processItems(eq(requestDTO), eq(detailList));
//        when(commonService.buildFailureResponse(any(ResponseDTO.class), anyString()))
//            .thenReturn(new ResponseDTO<>(false, "Error"));
        
        // Act
        ResponseDTO<String> response = tenderProcessService.updateSelectedSupplier(requestDTO);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Success", response.getMessage());
        
        verify(commonService).processItems(any(), any());
    }
    
    @Test
    void testFinalizeTheSupplierSelection_Success() {
        // Arrange
        LocationRequestDTO requestDTO = new LocationRequestDTO();
        requestDTO.setConsolidationId("CON001");
        
        List<ConsolidationLocationRequestHib> conList = Arrays.asList(createConsolidationLocationRequest(0));
        List<QuotationProcessHeadHib> headList = Arrays.asList(createQuotationProcessHead());
        List<QuotationProcessDetailHib> detailList = Arrays.asList(createQuotationProcessDetailEntity());
        
        when(consolidationLocationRequestRepository.byConsolidationIdSingle("CON001")).thenReturn(conList);
        when(quotationProcessHeadRepository.alreadyExistByConId("CON001")).thenReturn(headList);
        when(quotationProcessDetailRepository.subTable(anyInt())).thenReturn(detailList);
        doNothing().when(commonService).processConsolidationSupplierSelection(
            eq(conList), eq(detailList), eq(requestDTO), any(ResponseDTO.class));
        
        // Act
        ResponseDTO<LocationRequestDTO> response = tenderProcessService.finalizeTheSupplierSelection(requestDTO);
        
        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Success", response.getMessage());
        
        verify(quotationProcessHeadRepository, atLeastOnce()).save(any());
        verify(commonService).processConsolidationSupplierSelection(any(), any(), any(), any());
    }
    
    // Helper methods to create test entities
    private LocationRequestDTO createLocationRequestDetail() {
        LocationRequestDTO dto = new LocationRequestDTO();
        dto.setItemId(1);
        dto.setItemName("Test Item");
        dto.setQty(100.0);
        dto.setPackageId("PKG001");
        dto.setCheckBox(true);
        return dto;
    }
    
    private QuotationRequeustHeadHib createQuotationRequestHead(int status) {
        QuotationRequeustHeadHib head = new QuotationRequeustHeadHib();
        head.setReqHeadPk(1);
        head.setReqNo("REQ001");
        head.setLocationId("LOC001");
        head.setStatusFk(status);
        head.setPeriod(new Date());
        return head;
    }
    
    private QuotationRequestDetailHib createQuotationRequestDetail() {
        QuotationRequestDetailHib detail = new QuotationRequestDetailHib();
        detail.setReqDetailPk(1);
        detail.setItemId(1);
        detail.setQty(100.0);
        detail.setRequestDate(new Date());
        detail.setPackageId("PKG001");
        return detail;
    }
    
    private LocationRequestDTO createLocationRequestDTO(int statusFk) {
        LocationRequestDTO dto = new LocationRequestDTO();
        dto.setStatusFk(statusFk);
        return dto;
    }
    
    private byte[] createTestExcelData() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Test");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Item ID");
        headerRow.createCell(1).setCellValue("Item Name");
        
        Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue(1);
        dataRow.createCell(1).setCellValue("Test Item");
        
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();
        return bos.toByteArray();
    }
    
    private ConsolidationLocationRequestHib createConsolidationLocationRequest(int status) {
        ConsolidationLocationRequestHib entity = new ConsolidationLocationRequestHib();
        entity.setConsLocReqPk(1);
        entity.setConsolidationId("CON001");
        entity.setPeriod(new Date());
        entity.setStatusFk(status);
        entity.setCreatedDate(new Date());
        entity.setItemId(1);
        entity.setItemName("Test Item");
        entity.setPackageId("PKG001");
        entity.setGrandTotal(100.0);
        return entity;
    }
    
    private QuotationProcessHeadHib createQuotationProcessHead() {
        QuotationProcessHeadHib head = new QuotationProcessHeadHib();
        head.setQtnReqHeadPk(1);
        head.setQtnReqNo("QTN001");
        head.setSupplierId("SUP001");
        head.setConId("CON001");
        head.setPeriod(new Date());
        head.setStatusFk(0);
        return head;
    }
    
    private QuotationProcessDetailHib createQuotationProcessDetailEntity() {
        QuotationProcessDetailHib detail = new QuotationProcessDetailHib();
        detail.setQtnReqDetailPk(1);
        detail.setItemId(1);
        detail.setQty(100.0);
        detail.setNp(90.0);
        detail.setGp(10.0);
        detail.setRgp(10.0);
        return detail;
    }
    
    private SuppliersHib createSupplier() {
        SuppliersHib supplier = new SuppliersHib();
        supplier.setSupplierPk(1);
        supplier.setSupplierId("SUP001");
        supplier.setSupplierName("Test Supplier");
        return supplier;
    }
}