import React, { useState, useRef, useEffect } from 'react';
import {
  StickyNote,
  ArrowDownToLine,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import Toastify,{ showToast } from "src/views/Toastify";
import SessionModal from 'src/views/SessionModal';
import CommonHeader from '../../CommonHeader';
import { Tooltip} from "flowbite-react";
const PurchasePriceAnalysisReport: React.FC = () => {
  // --- State ---
  const now = new Date();
  const [fromMonth, setFromMonth] = useState<string>(`${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`);
  const [toMonth, setToMonth] = useState<string>(`${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`);
  const [selectedExcelType, setSelectedExcelType] = useState<string>('Please Select Excel Type');
  
  const [fromMonthOpen, setFromMonthOpen] = useState<boolean>(false);
  const [toMonthOpen, setToMonthOpen] = useState<boolean>(false);
  const [excelTypeOpen, setExcelTypeOpen] = useState<boolean>(false);
  
  // Month/Year selection state for both dropdowns
  const [fromSelectedMonth, setFromSelectedMonth] = useState<number>(now.getMonth());
  const [fromSelectedYear, setFromSelectedYear] = useState<number>(now.getFullYear());
  const [toSelectedMonth, setToSelectedMonth] = useState<number>(now.getMonth());
  const [toSelectedYear, setToSelectedYear] = useState<number>(now.getFullYear());
  
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // --- Refs for closing on outside click ---
  const fromMonthRef = useRef<HTMLDivElement>(null);
  const toMonthRef = useRef<HTMLDivElement>(null);
  const excelTypeRef = useRef<HTMLDivElement>(null);
  
  // --- Data ---
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const excelTypes = [
    { label: '1 - Purchase Price Analysis Report (Cash Purchase Items)', value: '1' },
    { label: '2 - Purchase Price Analysis Report (Out of Catalogue Items)', value: '2' },
    { label: '3 - Purchase Price Analysis (OverAll)', value: '3' }
  ];
  
  // --- Helper function to parse month string to Date ---
  const parseMonthString = (monthStr: string): Date => {
    const [month, year] = monthStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  };
  
  // --- Get available months for To dropdown ---
  const getAvailableToMonths = () => {
    if (!fromMonth) return [];
    
    const fromDate = parseMonthString(fromMonth);
    const currentYear = toSelectedYear;
    
    return months.map((month, index) => {
      const monthDate = new Date(currentYear, index, 1);
      return {
        month: month,
        index: index,
        isDisabled: monthDate < fromDate
      };
    });
  };
  
  // --- Check if year should be disabled for To dropdown ---
  const isToYearDisabled = (year: number): boolean => {
    if (!fromMonth) return true;
    
    const fromDate = parseMonthString(fromMonth);
    // Check if any month in this year is after fromDate
    const lastMonthOfYear = new Date(year, 11, 1); // December of the year
    return lastMonthOfYear < fromDate;
  };
  
  // --- Check authentication status ---
  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('Auth check failed', { hasToken: !!token });
      return false;
    }
    return true;
  };
  
  // --- Handle session expiration ---
  const handleSessionExpired = () => {
    setShowExpired(true);
  };
  
  // --- Redirect to login ---

  
  // --- Check authentication on mount ---
  useEffect(() => {
    if (!checkAuth()) {
      handleSessionExpired();
    }
  }, []);
  
  // --- Handle Click Outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromMonthRef.current && !fromMonthRef.current.contains(event.target as Node)) {
        setFromMonthOpen(false);
      }
      if (toMonthRef.current && !toMonthRef.current.contains(event.target as Node)) {
        setToMonthOpen(false);
      }
      if (excelTypeRef.current && !excelTypeRef.current.contains(event.target as Node)) {
        setExcelTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // --- Handle From Month Selection ---
  const handleFromMonthClick = () => {
    setFromMonthOpen(!fromMonthOpen);
  };
  
  const handleFromMonthSelect = (monthIndex: number) => {
    const newFromMonth = `${String(monthIndex + 1).padStart(2, '0')}/${fromSelectedYear}`;
    setFromMonth(newFromMonth);
    setFromSelectedMonth(monthIndex);
    setFromMonthOpen(false);
    
    // Reset toMonth if it's now invalid
    if (toMonth) {
      const fromDate = parseMonthString(newFromMonth);
      const toDate = parseMonthString(toMonth);
      
      if (toDate < fromDate) {
        setToMonth('');
        // Reset toYear to fromYear if toDate is before fromDate
        if (toSelectedYear < fromSelectedYear) {
          setToSelectedYear(fromSelectedYear);
          setToSelectedMonth(monthIndex);
        }
      }
    } else {
      // If no toMonth selected, set toYear to fromYear
      setToSelectedYear(fromSelectedYear);
    }
  };
  
  const handleFromYearChange = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? fromSelectedYear - 1 : fromSelectedYear + 1;
    setFromSelectedYear(newYear);
    const newFromMonth = `${String(fromSelectedMonth + 1).padStart(2, '0')}/${newYear}`;
    setFromMonth(newFromMonth);
    
    // Adjust toYear if needed
    if (toSelectedYear < newYear) {
      setToSelectedYear(newYear);
    }
    
    // Reset toMonth if it's now invalid
    if (toMonth) {
      const fromDate = parseMonthString(newFromMonth);
      const toDate = parseMonthString(toMonth);
      if (toDate < fromDate) {
        setToMonth('');
      }
    }
  };
  
  // --- Handle To Month Selection ---
  const handleToMonthClick = () => {
    if (!fromMonth) {
      showToast('Please select From Month first', 'error');
      return;
    }
    setToMonthOpen(!toMonthOpen);
  };
  
  const handleToMonthSelect = (monthIndex: number) => {
    const newToMonth = `${String(monthIndex + 1).padStart(2, '0')}/${toSelectedYear}`;
    const fromDate = parseMonthString(fromMonth);
    const toDate = new Date(toSelectedYear, monthIndex, 1);
    
    if (toDate < fromDate) {
      showToast('To Month cannot be before From Month', 'error');
      return;
    }
    
    setToMonth(newToMonth);
    setToSelectedMonth(monthIndex);
    setToMonthOpen(false);
  };
  
  const handleToYearChange = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? toSelectedYear - 1 : toSelectedYear + 1;
    
    // Don't allow years before fromYear
    if (fromMonth) {
      const fromDate = parseMonthString(fromMonth);
      const fromYear = fromDate.getFullYear();
      
      if (newYear < fromYear) {
        showToast(`Year cannot be before ${fromYear}`, 'error');
        return;
      }
    }
    
    setToSelectedYear(newYear);
    
    // Only update toMonth if it already has a value
    if (toMonth) {
      const newToMonth = `${String(toSelectedMonth + 1).padStart(2, '0')}/${newYear}`;
      const fromDate = parseMonthString(fromMonth);
      const toDate = new Date(newYear, toSelectedMonth, 1);
      
      if (toDate < fromDate) {
        // If the selected month in new year is before fromDate, reset toMonth
        setToMonth('');
        showToast('Selected month is before From Month', 'error');
      } else {
        setToMonth(newToMonth);
      }
    }
  };
  
  // --- Handle Excel Type Selection ---
  const handleExcelTypeSelect = (type: string) => {
    const selected = excelTypes.find(et => et.value === type);
    setSelectedExcelType(selected ? selected.label : 'Please Select Excel Type');
    setExcelTypeOpen(false);
  };
  
  // --- Generate dynamic filename ---
  const generateFileName = (): string => {
    let fileName = 'Purchase_Price_Analysis_Report';
    
    if (fromMonth) {
      const fromPart = fromMonth.replace('/', '-');
      fileName += `_from_${fromPart}`;
    }
    
    if (toMonth) {
      const toPart = toMonth.replace('/', '-');
      fileName += `_to_${toPart}`;
    }
    
    const typeValue = excelTypes.find(et => et.label === selectedExcelType)?.value || '';
    if (typeValue) {
      fileName += `_${typeValue}`;
    }
    
    return `${fileName}.xls`;
  };
  
  // --- Validate inputs ---
  const validateInputs = (): boolean => {
    if (!fromMonth) {
      showToast('Please select From Month', 'error');
      return false;
    }
    
    if (!toMonth) {
      showToast('Please select To Month', 'error');
      return false;
    }
    
    if (selectedExcelType === 'Please Select Excel Type') {
      showToast('Please select Excel Type', 'error');
      return false;
    }
    
    const fromDate = parseMonthString(fromMonth);
    const toDate = parseMonthString(toMonth);
    
    if (toDate < fromDate) {
      showToast('To Month cannot be before From Month', 'error');
      return false;
    }
    
    return true;
  };
  
  // --- Get excel type value ---
  const getExcelTypeValue = (): string => {
    const selected = excelTypes.find(et => et.label === selectedExcelType);
    return selected ? selected.value : '';
  };
  
  // --- Download Report ---
  const handleDownload = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }
    
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      handleSessionExpired();
      setLoading(false);
      return;
    }
    
    try {
      const fromDateStr = `${fromMonth.replace('/', '-')}-01`;
      const toDateStr = `${toMonth.replace('/', '-')}-01`;
      const excelType = getExcelTypeValue();
      
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/purchase-price-analysis-report?from_date=${fromDateStr}&to_date=${toDateStr}&excel_type=${excelType}`;
      
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
        return;
      }
      
      if (res.status === 500) {
        showToast('No records found for the selected criteria', 'error');
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      
      // Check if response is Excel file
      const contentType = res.headers.get('content-type');
      if (contentType && (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || contentType.includes('application/vnd.ms-excel'))) {
        const blob = await res.blob();
        
        // Create and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Report downloaded successfully', 'success');
      } else {
        // Handle error response
        const errorText = await res.text();
        throw new Error(errorText || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      const errorMessage =  'Failed to Download';
      
      if (
        errorMessage.toLowerCase().includes('no record') ||
        errorMessage.toLowerCase().includes('no data') ||
        errorMessage.toLowerCase().includes('not found')
      ) {
        showToast('No records found for the selected criteria', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // --- Clear Form ---
  const handleClear = () => {
    setFromMonth(`${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`);
    setToMonth('');
    setSelectedExcelType('Please Select Excel Type');
    setFromSelectedMonth(now.getMonth());
    setFromSelectedYear(now.getFullYear());
    setToSelectedMonth(now.getMonth());
    setToSelectedYear(now.getFullYear());
    showToast('Selections cleared', 'success');
  };
  
  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 p-2 sm:p-4">
     
     {/* Toastify */}
     <Toastify/>
      {/* Confirm Modal - Updated UI */}
      {showConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to download the Purchase Price Analysis Report for the selected criteria?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleDownload();
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Downloading...
                  </div>
                ) : (
                  "Yes, Download"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Session Expired Modal */}
      {showExpired && (
        <SessionModal/>
      )}
      
      {/* Header */}
      <CommonHeader
      title="Purchase Price Analysis Report"
              icon={<StickyNote className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
              />
      
      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl 
      shadow-md w-full max-w-6xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: From Month, To Month, Excel Type */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* From Month Dropdown */}
            <div className="flex-1 relative" ref={fromMonthRef}>
              <input
                id="fromMonth"
                type="text"
                value={fromMonth}
                readOnly
                onClick={handleFromMonthClick}
                className="peer w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                  transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              />
              <label
                htmlFor="fromMonth"
                className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                          peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                          peer-[:not(:placeholder-shown)]:px-1"
              >
                From Month <sup className='text-red-500'>*</sup>
              </label>
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400
               dark:text-gray-500 pointer-events-none" />
              
              {fromMonthOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white dark:bg-gray-800 border
                 border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-3">
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={() => handleFromYearChange('prev')}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {fromSelectedYear}
                    </span>
                    <button
                      onClick={() => handleFromYearChange('next')}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                      <div
                        key={`from-${month}`}
                        onClick={() => handleFromMonthSelect(index)}
                        className={`text-center py-2 rounded-md cursor-pointer text-xs sm:text-sm ${
                          fromSelectedMonth === index
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* To Month Dropdown */}
            <div className="flex-1 relative" ref={toMonthRef}>
              <input
                id="toMonth"
                type="text"
                value={toMonth}
                readOnly
                onClick={handleToMonthClick}
                className={`peer w-full px-3 py-3 pr-10 border rounded-md text-gray-700 dark:text-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-gray-700
                  transition-colors duration-200 ${
                    !fromMonth 
                      ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60' 
                      : 'border-gray-300 dark:border-gray-600 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
              />
              <label
                htmlFor="toMonth"
                className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                          peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                          peer-[:not(:placeholder-shown)]:px-1"
              >
                To Month <sup className='text-red-500'>*</sup>
              </label>
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400
               dark:text-gray-500 pointer-events-none" />
              
              {toMonthOpen && fromMonth && (
                <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white dark:bg-gray-800 border
                 border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-3">
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={() => handleToYearChange('prev')}
                      disabled={isToYearDisabled(toSelectedYear - 1)}
                      className={`${
                        isToYearDisabled(toSelectedYear - 1)
                          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {toSelectedYear}
                    </span>
                    <button
                      onClick={() => handleToYearChange('next')}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {getAvailableToMonths().map(({ month, index, isDisabled }) => {
                      return (
                        <div
                          key={`to-${month}`}
                          onClick={() => !isDisabled && handleToMonthSelect(index)}
                          className={`text-center py-2 rounded-md text-xs sm:text-sm ${
                            isDisabled
                              ? 'cursor-not-allowed opacity-40 text-gray-400 dark:text-gray-600'
                              : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          } ${
                            toSelectedMonth === index && !isDisabled
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                              : ''
                          }`}
                        >
                          {month}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Excel Type Dropdown */}
            <div className="flex-1 relative" ref={excelTypeRef}>
              <input
                id="excelType"
                type="text"
                value={selectedExcelType}
                readOnly
                onClick={() => setExcelTypeOpen(!excelTypeOpen)}
                className="peer w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                  transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              />
              <label
                htmlFor="excelType"
                className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                          peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                          peer-[:not(:placeholder-shown)]:px-1"
              >
                Please Select Excel Type <sup className='text-red-500'>*</sup>
              </label>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                ▼
              </span>
              
              {excelTypeOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                  <ul className="max-h-48 overflow-y-auto">
                    {excelTypes.map((type) => (
                      <li
                        key={type.value}
                        onClick={() => handleExcelTypeSelect(type.value)}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        {type.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-center mt-8 sm:mt-10 md:mt-12 gap-4 sm:gap-6">
          <Tooltip content='Download'><button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 
      dark:from-blue-700 dark:to-blue-800 
      hover:from-blue-700 hover:to-blue-800 
      dark:hover:from-blue-800 dark:hover:to-blue-900 
      text-white text-base sm:text-lg p-3 rounded-full 
      shadow-lg transition-all duration-300 
      flex items-center justify-center 
      hover:shadow-xl transform hover:scale-105 active:scale-95
      ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine size={20} />
            )}
          </button></Tooltip>
          <Tooltip content='Clear'><button
            type="button"
            onClick={handleClear}
            className="bg-gradient-to-r from-red-600 to-red-700 
      hover:from-red-700 hover:to-red-800 
      text-white text-base sm:text-lg p-3 rounded-full 
      shadow-lg transition-all duration-300 
      flex items-center justify-center 
      hover:shadow-xl transform hover:scale-105 active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button></Tooltip>
        </div>
        
        {/* Loading UI */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PurchasePriceAnalysisReport;