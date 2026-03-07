import React, { useState, useRef, useEffect } from 'react';
import {
  StickyNote,
  ArrowDownToLine,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';import { Tooltip} from "flowbite-react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import Toastify,{ showToast } from "src/views/Toastify";
import SessionModal from 'src/views/SessionModal';
import CommonHeader from '../../CommonHeader';


const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const dark = document.documentElement.classList.contains('dark');
          setIsDark(dark);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

interface ApiSupplierItem {
  supplierId: string;
  supplierName: string;
}

interface Supplier {
  supplierId: string;
  supplierName: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiSupplierItem[];
}

const SuppliersDeliveryDetailsByDelivery: React.FC = () => {
  // --- Dark mode ---
  const isDark = useDarkMode();

  // --- State ---
  const now = dayjs();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.month());
  const [selectedYear, setSelectedYear] = useState<number>(now.year());

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // --- Refs for outside clicks ---
  const supplierRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // --- Months array ---
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // --- Period boundaries (used for date pickers) ---
  const getPeriodBoundaries = () => {
    const periodStart = dayjs(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`);
    const periodEnd = periodStart.endOf('month');
    return { periodStart, periodEnd };
  };
  const { periodStart, periodEnd } = getPeriodBoundaries();

  // --- Authentication helpers ---
  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    return !!(token && userId);
  };

  const handleSessionExpired = () => {
    setShowExpired(true);
  };

  // --- Fetch Suppliers (unchanged) ---
  const fetchSuppliers = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const token = localStorage.getItem('authToken');
    const period = `01-${String(selectedMonth + 1).padStart(2, '0')}-${selectedYear}`;

    try {
      const res = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/dropDownPeriodBasedSupplierIdBySupplierDeliveryDetailsByDeliveryReport/${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const result: ApiResponse = await res.json();

      if (result.success) {
        showToast('Suppliers Dropdown loaded', 'success');
        if (result.data && result.data.length > 0) {
          const apiSuppliers = result.data
            .filter((item) => item.supplierId && item.supplierName)
            .map((item: ApiSupplierItem) => ({
              supplierId: item.supplierId,
              supplierName: item.supplierName,
            })) as Supplier[];
          setSuppliers(apiSuppliers);
        } else {
          showToast('No data available for the selected period', 'error');
          setSuppliers([]);
        }
      } else {
        showToast(result.message || 'Failed to load suppliers', 'error');
        setSuppliers([]);
      }
    } catch (e) {
      console.error('Error fetching suppliers:', e);
      showToast('Failed to load suppliers', 'error');
      setSuppliers([]);
      handleSessionExpired();
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [selectedMonth, selectedYear]);

  // --- Auth on mount ---
  useEffect(() => {
    if (!checkAuth()) {
      handleSessionExpired();
    }
  }, []);

  // --- Click outside handlers ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Filtered suppliers ---
  const filteredSuppliers = suppliers.filter((sup) =>
    sup.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Period picker logic (unchanged UI) ---
  const inputValue = `${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`;
  const handlePeriodClick = () => setPeriodOpen(!periodOpen);
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };
  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear((prev) => (direction === 'prev' ? prev - 1 : prev + 1));
  };

  // --- Reset dates when period changes ---
  useEffect(() => {
    setFromDate(null);
    setToDate(null);
  }, [selectedMonth, selectedYear]);

  // --- Generate filename (unchanged) ---
  const generateFileName = (): string => {
    const periodStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    let fileName = `SupplierDeliveryDetailsByDeliveryReport_${periodStr}`;
    if (selectedSupplierName) {
      const supplierPart = selectedSupplierName.replace(/\s+/g, '_');
      fileName += `_${supplierPart}`;
    }
    if (fromDate) {
      fileName += `_from_${fromDate.format('DD-MM-YYYY')}`;
    }
    if (toDate) {
      fileName += `_to_${toDate.format('DD-MM-YYYY')}`;
    }
    return `${fileName}.pdf`;
  };

  // --- Request body (unchanged) ---
  const buildRequestBody = () => {
    const period = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const body: any = { period };
    if (selectedSupplierId && selectedSupplierId.trim() !== '') {
      body.supplierId = selectedSupplierId;
    }
    if (fromDate && fromDate.isValid()) {
      body.fromDate = fromDate.format('YYYY-MM-DD');
    }
    if (toDate && toDate.isValid()) {
      body.toDate = toDate.format('YYYY-MM-DD');
    }
    return body;
  };

  // --- Date validation (unchanged, uses periodStart/periodEnd) ---
  const validateDates = (): boolean => {
    if (fromDate && fromDate.isValid()) {
      if (fromDate.isBefore(periodStart) || fromDate.isAfter(periodEnd)) {
        showToast('From date must be within the selected period', 'error');
        return false;
      }
    }
    if (toDate && toDate.isValid()) {
      if (toDate.isBefore(periodStart) || toDate.isAfter(periodEnd)) {
        showToast('To date must be within the selected period', 'error');
        return false;
      }
    }
    if (fromDate && toDate && fromDate.isValid() && toDate.isValid()) {
      if (fromDate.isAfter(toDate)) {
        showToast('From date must be before or equal to to date', 'error');
        return false;
      }
    }
    return true;
  };

  // --- API response handler (unchanged) ---
  const handleApiResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      const blob = await response.blob();
      if (blob.size === 0 || blob.size < 100) {
        throw new Error('Generated PDF is empty or invalid');
      }
      return { type: 'pdf', blob };
    } else if (
      contentType &&
      (contentType.includes('text/plain') || contentType.includes('application/json'))
    ) {
      const text = await response.text();
      try {
        const jsonResponse = JSON.parse(text);
        throw new Error(jsonResponse.message || jsonResponse.error || 'Unknown error occurred');
      } catch {
        throw new Error(text || 'Unknown error occurred');
      }
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${contentType}. Response: ${text}`);
    }
  };

  // --- Download PDF (unchanged) ---
  const handleDownload = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      handleSessionExpired();
      setLoading(false);
      return;
    }

    const requestBody = buildRequestBody();

    try {
      const res = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/supplierInvoiceDeliveryReport',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
        return;
      }

      const result = await handleApiResponse(res);

      if (result.type === 'pdf') {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Report downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorMessage = 'Failed to download';
      if (
        errorMessage.toLowerCase().includes('no record') ||
        errorMessage.toLowerCase().includes('no data') ||
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('empty')
      ) {
        showToast('No records found for the selected criteria', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Clear form (unchanged) ---
  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedSupplierId('');
    setSelectedSupplierName('');
    setSearchTerm('');
    const now = dayjs();
    setSelectedMonth(now.month());
    setSelectedYear(now.year());

  };

  // ----------------------------------------------------------------------
  // DatePicker slotProps – EXACT same as reference (dark‑aware, compact)
  // ----------------------------------------------------------------------
  const datePickerSlotProps = {
    textField: {
      fullWidth: true,
      size: 'small' as const,
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          backgroundColor: isDark ? '#374151' : '#ffffff', // gray-700 / white
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: isDark ? '#60a5fa' : '#3b82f6', // blue-400 / blue-500
            boxShadow: isDark
              ? '0 0 0 2px rgba(96,165,250,0.2)'
              : '0 0 0 2px rgba(59,130,246,0.1)',
          },
          '&.Mui-focused': {
            borderColor: isDark ? '#60a5fa' : '#2563eb', // blue-400 / blue-600
            boxShadow: isDark
              ? '0 0 0 3px rgba(96,165,250,0.3)'
              : '0 0 0 3px rgba(37,99,235,0.2)',
          },
        },
        '& .MuiOutlinedInput-input': {
          py: 1.5, // reduced height
          px: 2,
          color: isDark ? '#e5e7eb' : '#1f2937', // gray-200 / gray-800
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.9rem',
          color: isDark ? '#9ca3af' : '#6b7280', // gray-400 / gray-500
          '&.Mui-focused': {
            color: isDark ? '#60a5fa' : '#2563eb', // blue-400 / blue-600
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: isDark ? '#4b5563' : '#d1d5db', // gray-600 / gray-300
        },
      },
    },
    desktopPaper: {
      sx: {
        borderRadius: '12px',
        boxShadow: isDark
          ? '0 10px 25px rgba(0,0,0,0.5)'
          : '0 10px 25px rgba(0,0,0,0.1)',
        backgroundColor: isDark ? '#1f2937' : '#ffffff', // gray-800 / white
        '& .MuiPickersCalendarHeader-root': {
          padding: '12px 16px',
          borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb', // gray-700 / gray-200
          color: isDark ? '#e5e7eb' : '#1f2937', // gray-200 / gray-800
        },
        '& .MuiPickersDay-root': {
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: isDark ? '#e5e7eb' : '#1f2937', // gray-200 / gray-800
          '&:hover': {
            backgroundColor: isDark ? '#1e3a8a' : '#eff6ff', // blue-900 / blue-50
          },
          '&.Mui-selected': {
            backgroundColor: isDark ? '#3b82f6' : '#2563eb', // blue-500 / blue-600
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isDark ? '#2563eb' : '#1d4ed8', // blue-600 / blue-700
            },
          },
        },
        '& .MuiTypography-root': {
          color: isDark ? '#e5e7eb' : '#1f2937',
        },
        '& .MuiPickersArrowSwitcher-button': {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
    },
    popper: {
      sx: {
        '& .MuiPaper-root': {
          marginTop: '8px',
        },
      },
    },
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 p-2 sm:p-4">
      {/* Confirm Modal (unchanged) */}
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
              Do you want to download the Suppliers Delivery Details By Delivery Report for the selected criteria?
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
      {showExpired && <SessionModal />}

      {/* Header (unchanged) */}
      <CommonHeader
        title="Suppliers Delivery Details By Delivery"
        icon={<StickyNote className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
      />

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="space-y-4 sm:space-y-6">
            {/* Row 1: Period and Supplier (UI unchanged) */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Period Picker (original style) */}
              <div className="flex-1 relative" ref={periodRef}>
                <input
                  id="period"
                  type="text"
                  value={inputValue}
                  readOnly
                  onClick={handlePeriodClick}
                  className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                    focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                    transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                />
                <label
                  htmlFor="period"
                  className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                            peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                            peer-[:not(:placeholder-shown)]:px-1"
                >
                  Period <span className="text-red-500">*</span>
                </label>
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />

                {periodOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-3">
                    <div className="flex justify-between items-center mb-3">
                      <button
                        onClick={() => handleYearChange('prev')}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedYear}
                      </span>
                      <button
                        onClick={() => handleYearChange('next')}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {months.map((month, index) => (
                        <div
                          key={month}
                          onClick={() => handleMonthSelect(index)}
                          className={`text-center py-2 rounded-md cursor-pointer text-xs sm:text-sm ${
                            selectedMonth === index
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

              {/* Supplier Dropdown (original style) */}
              <div className="flex-1 relative" ref={supplierRef}>
                <input
                  id="supplier"
                  type="text"
                  value={selectedSupplierName || 'Please Select Supplier'}
                  readOnly
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                    focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                    transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                />
                <label
                  htmlFor="supplier"
                  className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                            peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                            peer-[:not(:placeholder-shown)]:px-1"
                >
                  Supplier
                </label>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  ▾
                </span>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="text"
                        placeholder="Search suppliers"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-gray-700"
                      />
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((sup) => (
                          <li
                            key={sup.supplierId}
                            onClick={() => {
                              setSelectedSupplierId(sup.supplierId);
                              setSelectedSupplierName(sup.supplierName);
                              setDropdownOpen(false);
                              setSearchTerm('');
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                          >
                            {sup.supplierId} - {sup.supplierName}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                          No results found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* From Date */}
              <div className="flex-1">
                <DatePicker
                  key={`from-${selectedMonth}-${selectedYear}`}
                  label={<>
                    
                    From Date <sup className="text-red-500 text-sm">*</sup>
                  </>}
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  minDate={periodStart}
                  maxDate={periodEnd}
                  views={['day']}
                  format="DD/MM/YYYY"
                  slotProps={datePickerSlotProps}
                />
              </div>

              {/* To Date */}
              <div className="flex-1">
                <DatePicker
                  key={`to-${selectedMonth}-${selectedYear}`}
                  label={<>
                    
                    To Date <sup className="text-red-500 text-sm">*</sup>
                  </>}
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  minDate={fromDate || periodStart}
                  maxDate={periodEnd}
                  views={['day']}
                  format="DD/MM/YYYY"
                  slotProps={datePickerSlotProps}
                />
              </div>
            </div>
          </div>
        </LocalizationProvider>

        {/* Buttons (unchanged) */}
        <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 gap-4 sm:gap-6">
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

        {/* Loading indicator (unchanged) */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
        )}

        <Toastify />
      </div>
    </div>
  );
};

export default SuppliersDeliveryDetailsByDelivery;