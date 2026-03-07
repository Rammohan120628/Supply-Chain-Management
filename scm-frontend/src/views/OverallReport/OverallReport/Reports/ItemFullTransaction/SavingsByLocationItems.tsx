import React, { useState, useRef, useEffect } from 'react';
import {
  StickyNote,
  ArrowDownToLine,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import Toastify,{ showToast } from "src/views/Toastify";
import SessionModal from 'src/views/SessionModal';
import CommonHeader from '../../CommonHeader';
import { Tooltip} from "flowbite-react";

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

interface ApiDataItem {
  locationId: string;
  locationName: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiDataItem[];
  status?: string;
  statusCode?: number;
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const SavingsByLocationItems: React.FC = () => {
  // --- Dark mode ---
  const isDark = useDarkMode();

  // --- State (unchanged) ---
  const now = dayjs();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
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
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);

  // --- Refs for closing on outside click (unchanged) ---
  const locationRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // --- Months array (unchanged) ---
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // --- Get period boundaries (used for date pickers) ---
  const getPeriodBoundaries = () => {
    const periodStart = dayjs(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`);
    const periodEnd = periodStart.endOf('month');
    return { periodStart, periodEnd };
  };
  const { periodStart, periodEnd } = getPeriodBoundaries();

  // --- Format date for API (YYYY-MM-DD) ---
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${year}-${formattedMonth}-01`;
  };

  // --- Format period for dropdown API (DD-MM-YYYY) ---
  const formatPeriodForDropdown = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  // --- Format period for display (MM/YYYY) ---
  const formatPeriodForDisplay = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };

  // --- Check authentication status (unchanged) ---
  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('Auth check failed', { hasToken: !!token });
      return false;
    }
    return true;
  };

  // --- Handle session expiration (unchanged) ---
  const handleSessionExpired = () => {
    setShowExpired(true);
  };

  // --- Fetch Locations (unchanged) ---
  const fetchLocations = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const token = localStorage.getItem('authToken');
    const period = formatPeriodForDropdown(selectedMonth, selectedYear);

    console.log('Fetching locations for period:', period, 'Format: DD-MM-YYYY');

    const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/dropDownPeriodBasedLocationIdBySavings?period=${period}`;

    console.log('API URL:', apiUrl);

    setLoadingLocations(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      console.log('Response status:', res.status);

      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.log('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      if (!res.ok) {
        const errorResult = await res.json();
        console.error('API Error Response:', errorResult);
        throw new Error(errorResult.message || `HTTP ${res.status}: Failed to fetch locations`);
      }

      const result: ApiResponse = await res.json();
      console.log('API Response received:', {
        success: result.success,
        message: result.message,
        dataLength: Array.isArray(result.data) ? result.data.length : 'not an array',
        dataType: typeof result.data,
      });

      if (result.success) {
        let apiLocations: Location[] = [];

        if (Array.isArray(result.data)) {
          apiLocations = result.data
            .filter((item) => item && (item.locationId || item.locationName))
            .map((item: ApiDataItem) => ({
              locationId: String(item.locationId || ''),
              locationName: String(item.locationName || `Location ${item.locationId}`),
            }));
        } else if (result.data && typeof result.data === 'object') {
          const data = result.data as any;
          const possibleArrays = [
            data.locations,
            data.data,
            data.items,
            data.values,
            data.list,
          ];

          const dataArray = possibleArrays.find((arr) => Array.isArray(arr)) || [];

          if (Array.isArray(dataArray)) {
            apiLocations = dataArray
              .filter((item) => item && (item.locationId || item.locationName))
              .map((item: any) => ({
                locationId: String(item.locationId || item.id || ''),
                locationName: String(item.locationName || item.name || `Location ${item.locationId || item.id}`),
              }));
          }
        }

        console.log('Processed locations:', apiLocations);

        apiLocations.sort((a, b) => a.locationName.localeCompare(b.locationName));

        setLocations(apiLocations);

        if (apiLocations.length === 0) {
          showToast(`No locations found for this period`, 'error');
        } else {
          showToast(`Locations dropdown loaded`, 'success');
        }

        if (selectedLocationId && !apiLocations.some((loc) => loc.locationId === selectedLocationId)) {
          setSelectedLocationId('');
          setSelectedLocationName('');
        }
      } else {
        const errorMessage = result.message || 'Failed to load locations';
        console.error('API returned success: false:', errorMessage);
        showToast(errorMessage, 'error');
        setLocations([]);
        setSelectedLocationId('');
        setSelectedLocationName('');
      }
    } catch (e) {
      console.error('Error fetching locations:', e);
      const errorMessage = e instanceof Error ? e.message : 'Failed to load locations';

      if (errorMessage.includes('non-JSON')) {
        showToast('Server returned unexpected response format', 'error');
      } else if (errorMessage.includes('Failed to fetch')) {
        showToast('Network error. Please check your connection.', 'error');
      } else {
        showToast(errorMessage, 'error');
      }

      setLocations([]);
      setSelectedLocationId('');
      setSelectedLocationName('');
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!checkAuth()) {
      handleSessionExpired();
    }
  }, []);

  // --- Handle Click Outside (unchanged) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Filtered Locations (unchanged) ---
  const filteredLocations = locations.filter(
    (loc) =>
      loc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.locationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Period Selection (unchanged) ---
  const inputValue = formatPeriodForDisplay(selectedMonth, selectedYear);

  const handlePeriodClick = () => {
    if (!loadingLocations) {
      setPeriodOpen(!periodOpen);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
    fetchLocations();
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    fetchLocations();
  };

  // --- Generate base filename (unchanged) ---
  const generateFileNameBase = (): string => {
    const periodStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    let fileName = `SavingsByLocationByItemReport_${periodStr}`;

    if (selectedLocationName) {
      const locationPart = selectedLocationName.replace(/\s+/g, '_');
      fileName += `_${locationPart}`;
    }

    if (fromDate) {
      fileName += `_from_${fromDate.format('YYYY-MM-DD')}`;
    }

    if (toDate) {
      fileName += `_to_${toDate.format('YYYY-MM-DD')}`;
    }

    return fileName;
  };

  // --- Build request body (unchanged) ---
  const buildRequestBody = () => {
    const period = formatDateForApi(selectedMonth, selectedYear);

    const body: any = {
      period,
      locationId: selectedLocationId,
    };

    if (fromDate && fromDate.isValid()) {
      body.fromDate = fromDate.format('YYYY-MM-DD');
    }

    if (toDate && toDate.isValid()) {
      body.toDate = toDate.format('YYYY-MM-DD');
    }

    console.log('Final Request body:', body);
    return body;
  };

  // --- Validate dates within period (unchanged) ---
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

  // --- Handle API response (unchanged) ---
  const handleApiResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const result = await response.json();
      if (!result.success && result.message) {
        const noDataMessage =
          result.message.includes('no record') || result.message.includes('No records')
            ? 'No records found for the selected period.'
            : result.message;
        throw new Error(noDataMessage);
      } else {
        throw new Error(result.message || 'Unexpected JSON response');
      }
    }

    const blob = await response.blob();

    console.log('Blob size:', blob.size, 'Blob type:', blob.type);

    if (blob.size === 0) {
      throw new Error('No file content received - empty file');
    }

    let fileExtension = '.xlsx';
    if (contentType) {
      if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
        fileExtension = '.xlsx';
      } else if (contentType.includes('pdf')) {
        fileExtension = '.pdf';
      } else if (contentType.includes('csv')) {
        fileExtension = '.csv';
      }
    }

    return { type: 'file', blob, fileExtension };
  };

  // --- Download Report (unchanged) ---
  const handleDownload = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    if (!validateDates()) {
      return;
    }

    if (!selectedLocationId) {
      showToast('Please select a location', 'error');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      const requestBody = buildRequestBody();
      console.log('Sending request with body:', JSON.stringify(requestBody, null, 2));

      const res = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/savingsByLocationByItemReport',
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

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }

      const result = await handleApiResponse(res);

      if (result.type === 'file') {
        const contentDisposition = res.headers.get('content-disposition');
        let filename = generateFileNameBase();

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          } else {
            filename += result.fileExtension;
          }
        } else {
          filename += result.fileExtension;
        }

        const blobUrl = window.URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);

        console.log('File download initiated:', filename);
        showToast('File downloaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error downloading file:', error);

      const errorMessage = 'Failed to Download';

      if (
        errorMessage.toLowerCase().includes('no record') ||
        errorMessage.toLowerCase().includes('no data') ||
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('empty')
      ) {
        showToast('No records found for the selected criteria', 'error');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        handleSessionExpired();
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Clear Form (unchanged) ---
  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedLocationId('');
    setSelectedLocationName('');
    setSearchTerm('');
    const now = dayjs();
    setSelectedMonth(now.month());
    setSelectedYear(now.year());
    fetchLocations();
  };

  // --- Reset dates when period changes (unchanged) ---
  useEffect(() => {
    setFromDate(null);
    setToDate(null);
  }, [selectedMonth, selectedYear]);

  // ----------------------------------------------------------------------
  // DatePicker slotProps – exactly as in the reference component
  // (dark‑aware, compact, responsive)
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
  // Render (only DatePickers are changed)
  // ----------------------------------------------------------------------
  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 p-2 sm:p-4">
      {/* toast notify */}
      <Toastify />

      {/* Confirm Modal (unchanged) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Confirm Download
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to download the Savings By Location By Item Report for the selected criteria?
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
                  'Yes, Download'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Expired Modal (unchanged) */}
      {showExpired && <SessionModal />}

      {/* Header (unchanged) */}
      <CommonHeader
        title="Savings By Location By Item Report"
        icon={<StickyNote className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
      />

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="space-y-4 sm:space-y-6">
            {/* Row 1: Period and Location (unchanged) */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Period Picker */}
              <div className="flex-1 relative" ref={periodRef}>
                <div className="relative">
                  <input
                    id="period"
                    type="text"
                    value={inputValue}
                    readOnly
                    onClick={handlePeriodClick}
                    className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                      focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                      transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50"
                    disabled={loadingLocations}
                    title={`Selected: ${months[selectedMonth]} ${selectedYear}`}
                  />
                  <label
                    htmlFor="period"
                    className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                              peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                              peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                              peer-[:not(:placeholder-shown)]:px-1"
                  >
                    Period <sup className ='text-red-500'>*</sup>
                  </label>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {loadingLocations ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CalendarDays className="h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    )}
                  </div>
                </div>

                {periodOpen && !loadingLocations && (
                  <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-3">
                    <div className="flex justify-between items-center mb-3">
                      <button
                        onClick={() => handleYearChange('prev')}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={loadingLocations}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedYear}
                      </span>
                      <button
                        onClick={() => handleYearChange('next')}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={loadingLocations}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {months.map((month, index) => (
                        <div
                          key={month}
                          onClick={() => handleMonthSelect(index)}
                          className={`text-center py-2 rounded-md cursor-pointer text-xs sm:text-sm transition-colors ${
                            selectedMonth === index
                              ? 'bg-blue-600 dark:bg-blue-700 text-white font-semibold'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          } ${loadingLocations ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={`Select ${month} ${selectedYear}`}
                        >
                          {month}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Dropdown (unchanged) */}
              <div className="flex-1 relative" ref={locationRef}>
                <div className="relative">
                  <input
                    id="location"
                    type="text"
                    value={selectedLocationName || 'Please Select Location Id'}
                    readOnly
                    onClick={() => !loadingLocations && setDropdownOpen(!dropdownOpen)}
                    className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                      focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                      transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50"
                    disabled={loadingLocations}
                    title={selectedLocationId ? `ID: ${selectedLocationId}` : 'Select a location'}
                  />
                  <label
                    htmlFor="location"
                    className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                              peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                              peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                              peer-[:not(:placeholder-shown)]:px-1"
                  >
                    Location Id <sup className ='text-red-500'>*</sup>
                  </label>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {loadingLocations ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 pointer-events-none">▾</span>
                    )}
                  </div>
                </div>

                {dropdownOpen && !loadingLocations && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                    {locations.length > 0 ? (
                      <>
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Search locations by name or ID..."
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-gray-700"
                          />
                        </div>
                        <ul className="max-h-48 overflow-y-auto">
                          {filteredLocations.length > 0 ? (
                            filteredLocations.map((loc) => (
                              <li
                                key={loc.locationId}
                                onClick={() => {
                                  setSelectedLocationId(loc.locationId);
                                  setSelectedLocationName(loc.locationName);
                                  setDropdownOpen(false);
                                  setSearchTerm('');
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                  selectedLocationId === loc.locationId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                                title={`ID: ${loc.locationId}`}
                              >
                                <div className="font-medium truncate">{loc.locationName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  ID: {loc.locationId}
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                              No locations match your search
                            </li>
                          )}
                        </ul>
                      </>
                    ) : (
                      <div className="px-4 py-3 text-center"></div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: From Date and To Date – UPDATED with day calendar and theme */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* From Date */}
              <div className="flex-1">
                <DatePicker
                  key={`from-${selectedMonth}-${selectedYear}`} // force re‑render when period changes
                  label="From Date"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  minDate={periodStart}
                  maxDate={periodEnd}
                  views={['day']} 
                  format="DD/MM/YYYY"
                  disabled={loadingLocations}
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
                  disabled={loadingLocations}
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
            disabled={loading || !selectedLocationId || loadingLocations}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 
      dark:from-blue-700 dark:to-blue-800 
      hover:from-blue-700 hover:to-blue-800 
      dark:hover:from-blue-800 dark:hover:to-blue-900 
      text-white text-base sm:text-lg p-3 rounded-full 
      shadow-lg transition-all duration-300 
      flex items-center justify-center 
      hover:shadow-xl transform hover:scale-105 active:scale-95
      ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!selectedLocationId ? 'Please select a location' : loadingLocations ? 'Loading locations...' : 'Download report'}
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
            disabled={loading || loadingLocations}
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

        {loading && <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default SavingsByLocationItems;