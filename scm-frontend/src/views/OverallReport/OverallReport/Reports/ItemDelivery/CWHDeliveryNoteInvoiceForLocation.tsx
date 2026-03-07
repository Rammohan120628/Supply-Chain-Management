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
import CommonHeader from '../../CommonHeader';
import SessionModal from 'src/views/SessionModal';

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

interface Location {
  locationId: string;
  locationName: string;
}

const CWHDeliveryNoteInvoiceForLocation: React.FC = () => {
  // --- Dark mode ---
  const isDark = useDarkMode();

  // --- State (unchanged) ---
  const now = dayjs();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedLocationName, setSelectedLocationName] = useState<string>('Please Select Location');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState<boolean>(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState<string>('');

  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [selectedReportTypeName, setSelectedReportTypeName] = useState<string>('Please Select Report Type');
  const [reportTypeDropdownOpen, setReportTypeDropdownOpen] = useState<boolean>(false);

  const [selectedLocationType, setSelectedLocationType] = useState<string>('Both');
  const [locationTypeDropdownOpen, setLocationTypeDropdownOpen] = useState<boolean>(false);

  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.month());
  const [selectedYear, setSelectedYear] = useState<number>(now.year());

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setValidationErrors] = useState<string[]>([]);

  // --- Refs ---
  const locationRef = useRef<HTMLDivElement>(null);
  const reportTypeRef = useRef<HTMLDivElement>(null);
  const locationTypeRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // --- Data ---
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const locationTypeOptions = [
    { value: 'Both', label: 'Both' },
    { value: 'cwh_delivery', label: 'CWH Delivery' },
    { value: 'direct_delivery', label: 'Direct Delivery' }
  ];

  const reportTypeOptions = [
    { value: '1', label: '1 - CWH' },
    { value: '2', label: '2 - Location' }
  ];

  // --- Get period boundaries ---
  const getPeriodBoundaries = () => {
    const periodStart = dayjs(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`);
    const periodEnd = periodStart.endOf('month');
    return { periodStart, periodEnd };
  };
  const { periodStart, periodEnd } = getPeriodBoundaries();

  // --- Auth helpers ---
  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    return !!(token && userId);
  };

  const handleSessionExpired = () => {
    setShowExpired(true);
  };

  // --- Fetch Locations (with toasts) ---
  const fetchLocations = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const token = localStorage.getItem('authToken');
    const period = `01-${String(selectedMonth + 1).padStart(2, '0')}-${selectedYear}`;

    try {
      const url = new URL('http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/dropDownPeriodBasedByLocationIdByCwhDeliveryInvoiceForLocationReport');
      url.searchParams.append('period', period);
      url.searchParams.append('locationType', selectedLocationType);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch locations');
      }

      const result = await res.json();

      if (result.success) {
        if (result.data && result.data.length > 0) {
          const apiLocations = result.data
            .filter((item: any) => item.locationId && item.locationName)
            .map((item: any) => ({
              locationId: item.locationId,
              locationName: item.locationName,
            }));
          setLocations(apiLocations);
          showToast('Locations Dropdown loaded', 'success'); // success toast
        } else {
          showToast('No locations available for the selected period and location type', 'error');
          setLocations([]);
        }
      } else {
        showToast(result.message || 'Failed to load locations', 'error');
        setLocations([]);
      }
    } catch (e) {
      console.error('Error fetching locations:', e);
      showToast('Failed to load locations', 'error');
      setLocations([]);
      handleSessionExpired();
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedMonth, selectedYear, selectedLocationType]);

  // --- Auth check on mount ---
  useEffect(() => {
    if (!checkAuth()) {
      handleSessionExpired();
    }
  }, []);

  // --- Click outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationDropdownOpen(false);
      }
      if (reportTypeRef.current && !reportTypeRef.current.contains(event.target as Node)) {
        setReportTypeDropdownOpen(false);
      }
      if (locationTypeRef.current && !locationTypeRef.current.contains(event.target as Node)) {
        setLocationTypeDropdownOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Filtered Locations ---
  const filteredLocations = locations.filter((loc) =>
    loc.locationName.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
    loc.locationId.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  // --- Period Picker ---
  const inputValue = `${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`;

  const handlePeriodClick = () => {
    setPeriodOpen(!periodOpen);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear((prev) => (direction === 'prev' ? prev - 1 : prev + 1));
  };

  // --- Filename generation ---
  const generateFileName = (): string => {
    const periodStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    let fileName = `CWHDeliveryNoteInvoiceForLocationReport_${periodStr}`;

    if (selectedLocationName && selectedLocationName !== 'Please Select Location') {
      const locationPart = selectedLocationName.replace(/\s+/g, '_');
      fileName += `_${locationPart}`;
    }

    if (selectedReportTypeName && selectedReportTypeName !== 'Please Select Report Type') {
      const reportTypePart = selectedReportTypeName.replace(/\s+/g, '_');
      fileName += `_${reportTypePart}`;
    }

    if (fromDate) {
      fileName += `_from_${fromDate.format('DD-MM-YYYY')}`;
    }

    if (toDate) {
      fileName += `_to_${toDate.format('DD-MM-YYYY')}`;
    }

    fileName += `_${selectedLocationType}`;

    return `${fileName}.pdf`;
  };

  // --- Request body ---
  const buildRequestBody = () => {
    const period = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;

    const body: any = {
      period: period,
      screenNum: selectedReportType,
      deliveryType: selectedLocationType === 'Both' ? 'Both' : selectedLocationType,
    };

    if (selectedLocationId && selectedLocationId.trim() !== '') {
      body.locationId = selectedLocationId;
    }

    if (fromDate && fromDate.isValid()) {
      body.fromDate = fromDate.format('YYYY-MM-DD');
    }

    if (toDate && toDate.isValid()) {
      body.toDate = toDate.format('YYYY-MM-DD');
    }

    return body;
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!selectedReportType) {
      errors.push('Report Type is required');
    }

    if (!selectedLocationType) {
      errors.push('Location Type is required');
    }

    if (fromDate && fromDate.isValid()) {
      if (fromDate.isBefore(periodStart) || fromDate.isAfter(periodEnd)) {
        errors.push('From date must be within the selected period');
      }
    }

    if (toDate && toDate.isValid()) {
      if (toDate.isBefore(periodStart) || toDate.isAfter(periodEnd)) {
        errors.push('To date must be within the selected period');
      }
    }

    if (fromDate && toDate && fromDate.isValid() && toDate.isValid()) {
      if (fromDate.isAfter(toDate)) {
        errors.push('From date must be before or equal to to date');
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      errors.forEach(error => showToast(error, 'error'));
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  // --- API response handler ---
  const handleApiResponse = async (response: Response) => {
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const header = String.fromCharCode(uint8Array[0], uint8Array[1], uint8Array[2], uint8Array[3]);

    if (header === '%PDF') {
      if (buffer.byteLength === 0 || buffer.byteLength < 100) {
        throw new Error('Generated PDF is empty or invalid');
      }
      const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
      return { type: 'pdf', blob: pdfBlob };
    } else {
      const text = new TextDecoder().decode(uint8Array);
      try {
        const jsonResponse = JSON.parse(text);
        throw new Error(jsonResponse.message || jsonResponse.error || 'Unknown error occurred');
      } catch {
        throw new Error(text || 'Unknown error occurred');
      }
    }
  };

  // --- Download ---
  const handleDownload = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    if (!validateForm()) {
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
        'http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/cwhDeliveryNoteInvoiceFilterBothReport',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
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

        showToast('Downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const errorMessage = 'Failed to Download';

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

  // --- Clear ---
  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedLocationId('');
    setSelectedLocationName('Please Select Location');
    setLocationSearchTerm('');
    setSelectedReportType('');
    setSelectedReportTypeName('Please Select Report Type');
    setSelectedLocationType('Both');
    setSelectedMonth(now.month());
    setSelectedYear(now.year());
    setValidationErrors([]);
    showToast('Selections cleared', 'success');
  };

  // --- Reset dates when period changes ---
  useEffect(() => {
    setFromDate(null);
    setToDate(null);
    setSelectedLocationId('');
    setSelectedLocationName('Please Select Location');
    setLocations([]);
  }, [selectedMonth, selectedYear, selectedLocationType]);

  // ----------------------------------------------------------------------
  // DatePicker slotProps – exact copy from reference (dark‑aware, compact)
  // ----------------------------------------------------------------------
  const datePickerSlotProps = {
    textField: {
      fullWidth: true,
      size: 'small' as const,
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '30px',
          backgroundColor: isDark ? '#374151' : '#ffffff',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: isDark ? '#60a5fa' : '#3b82f6',
            boxShadow: isDark
              ? '0 0 0 2px rgba(96,165,250,0.2)'
              : '0 0 0 2px rgba(59,130,246,0.1)',
          },
          '&.Mui-focused': {
            borderColor: isDark ? '#60a5fa' : '#2563eb',
            boxShadow: isDark
              ? '0 0 0 3px rgba(96,165,250,0.3)'
              : '0 0 0 3px rgba(37,99,235,0.2)',
          },
        },
        '& .MuiOutlinedInput-input': {
          py: 1.5,
          px: 2,
          color: isDark ? '#e5e7eb' : '#1f2937',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.9rem',
          color: isDark ? '#9ca3af' : '#6b7280',
          '&.Mui-focused': {
            color: isDark ? '#60a5fa' : '#2563eb',
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: isDark ? '#4b5563' : '#d1d5db',
        },
      },
    },
    desktopPaper: {
      sx: {
        borderRadius: '12px',
        boxShadow: isDark
          ? '0 10px 25px rgba(0,0,0,0.5)'
          : '0 10px 25px rgba(0,0,0,0.1)',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        '& .MuiPickersCalendarHeader-root': {
          padding: '12px 16px',
          borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          color: isDark ? '#e5e7eb' : '#1f2937',
        },
        '& .MuiPickersDay-root': {
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: isDark ? '#e5e7eb' : '#1f2937',
          '&:hover': {
            backgroundColor: isDark ? '#1e3a8a' : '#eff6ff',
          },
          '&.Mui-selected': {
            backgroundColor: isDark ? '#3b82f6' : '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isDark ? '#2563eb' : '#1d4ed8',
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
      <Toastify />

      {/* Confirm Modal */}
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
              Do you want to download the CWH Delivery Note/Invoice For Location Report for the selected criteria?
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

      {/* Header */}
      <CommonHeader
        title="CWH Delivery Note/Invoice For Location"
        icon={<StickyNote className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
      />

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="space-y-4 sm:space-y-6">
            {/* Row 1: Period, Location Type, Report Type, Location */}
            <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 items-end">
              {/* Period Picker */}
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

              {/* Location Type Dropdown */}
              <div className="flex-1 relative" ref={locationTypeRef}>
                <input
                  id="locationType"
                  type="text"
                  value={selectedLocationType}
                  readOnly
                  onClick={() => setLocationTypeDropdownOpen(!locationTypeDropdownOpen)}
                  className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                    focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                    transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                />
                <label
                  htmlFor="locationType"
                  className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                            peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                            peer-[:not(:placeholder-shown)]:px-1"
                >
                  Location Type <span className="text-red-500">*</span>
                </label>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  ▼
                </span>

                {locationTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                    <ul className="max-h-48 overflow-y-auto">
                      {locationTypeOptions.map((option) => (
                        <li
                          key={option.value}
                          onClick={() => {
                            setSelectedLocationType(option.value);
                            setLocationTypeDropdownOpen(false);
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Location Dropdown */}
              <div className="flex-1 relative" ref={locationRef}>
                <input
                  id="location"
                  type="text"
                  value={selectedLocationName}
                  readOnly
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                    focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                    transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                />
                <label
                  htmlFor="location"
                  className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                            peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                            peer-[:not(:placeholder-shown)]:px-1"
                >
                  Location
                </label>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  ▼
                </span>

                {locationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="text"
                        placeholder="Search locations"
                        autoFocus
                        value={locationSearchTerm}
                        onChange={(e) => setLocationSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-gray-700"
                      />
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      <li
                        key="default"
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                        onClick={() => {
                          setSelectedLocationId('');
                          setSelectedLocationName('Please Select Location');
                          setLocationDropdownOpen(false);
                        }}
                      >
                        Please Select Location
                      </li>
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                          <li
                            key={loc.locationId}
                            onClick={() => {
                              setSelectedLocationId(loc.locationId);
                              setSelectedLocationName(loc.locationName);
                              setLocationDropdownOpen(false);
                              setLocationSearchTerm('');
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                          >
                            {loc.locationName} ({loc.locationId})
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                          No locations found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Report Type Dropdown */}
              <div className="flex-1 relative" ref={reportTypeRef}>
                <input
                  id="reportType"
                  type="text"
                  value={selectedReportTypeName}
                  readOnly
                  onClick={() => setReportTypeDropdownOpen(!reportTypeDropdownOpen)}
                  className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                    focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                    transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                />
                <label
                  htmlFor="reportType"
                  className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                            peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                            peer-[:not(:placeholder-shown)]:px-1"
                >
                  Report Type <span className="text-red-500">*</span>
                </label>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  ▼
                </span>

                {reportTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                    <ul className="max-h-48 overflow-y-auto">
                      <li
                        key="default"
                        onClick={() => {
                          setSelectedReportType('');
                          setSelectedReportTypeName('Please Select Report Type');
                          setReportTypeDropdownOpen(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                      >
                        Please Select Report Type
                      </li>
                      {reportTypeOptions.map((option) => (
                        <li
                          key={option.value}
                          onClick={() => {
                            setSelectedReportType(option.value);
                            setSelectedReportTypeName(option.label);
                            setReportTypeDropdownOpen(false);
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: From Date and To Date – UPDATED: day-only view, default month = periodStart */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* From Date */}
              <div className="flex-1">
                <DatePicker
                  key={`from-${selectedMonth}-${selectedYear}`}
                  label="From Date"
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
                  label="To Date"
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

        {/* Buttons */}
        <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 gap-4 sm:gap-6">
          <Tooltip content='Download'><button
            type="button"
            onClick={() => {
              if (validateForm()) {
                setShowConfirm(true);
              }
            }}
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

export default CWHDeliveryNoteInvoiceForLocation;