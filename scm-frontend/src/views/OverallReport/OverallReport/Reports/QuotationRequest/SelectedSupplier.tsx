import React, { useState, useRef, useEffect } from 'react';
import {
  UserRoundCheck,
  ArrowDownToLine,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import Toastify, { showToast } from 'src/views/Toastify';
import SessionModal from 'src/views/SessionModal';
import CommonHeader from '../../CommonHeader';
import {Tooltip} from "flowbite-react";

interface Location {
  pk: number;
  locationId: string;
  locationName: string;
}

const SelectedSupplier: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);

  const locationRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Fetch consolidations from API
  const fetchConsolidations = async () => {
    try {
      setLoadingLocations(true);
      const token = localStorage.getItem('authToken');
      const formattedDate = formatDateForApi(selectedMonth, selectedYear);

      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (isTokenExpired(token)) {
        handleSessionExpired();
        throw new Error('Session expired');
      }

      const response = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/dropDownPeriodBasedConsolidationIdBySelecedSupplier/${formattedDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 401) {
        handleSessionExpired();
        throw new Error('Session expired - Unauthorized');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.data && result.data.length > 0) {
          setLocations(
            result.data.map((item: any) => ({
              pk: item.pk,
              locationId: item.code ? item.code : '',
              locationName: '',
            })),
          );
        } else {
          setLocations([]);
          showToast('No data for this period.', 'error');
        }
      } else {
        throw new Error(result.message || 'Failed to fetch consolidations');
      }
    } catch (err) {
      console.error('Error fetching consolidations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load consolidations';
      showToast(errorMessage, 'error');
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    fetchConsolidations();
  }, [selectedMonth, selectedYear]);

  // Close both dropdowns when clicking outside
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

  // Filtered dropdown options based on search term
  const filteredLocations = locations.filter((location) =>
    `${location.locationId} ${location.locationName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // Format location for display (LocationID + LocationName)
  const formatLocationDisplay = (location: Location): string => {
    return location.locationId;
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedLocation('');
    setSearchTerm('');
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedLocation('');
    setSearchTerm('');
    setSelectedYear((prev) => (direction === 'prev' ? prev - 1 : prev + 1));
  };

  // Function to format date for API (DD-MM-YYYY with 01 as default day)
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  // Function to get location ID from selected location
  const getSelectedLocationId = (): string => {
    if (!selectedLocation) return '';
    return selectedLocation;
  };

  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Function to handle session expiration
  const handleSessionExpired = () => {
    setShowSessionExpiredModal(true);
  };

  // Function to download the file
  const downloadFile = async () => {
    setLoading(true);
    setError('');

    try {
      const formattedDate = formatDateForApi(selectedMonth, selectedYear);
      const token = localStorage.getItem('authToken');

      if (!token) {
        handleSessionExpired();
        throw new Error('Authentication token not found');
      }

      if (isTokenExpired(token)) {
        handleSessionExpired();
        throw new Error('Session expired');
      }

      const consolidationId = getSelectedLocationId();
      if (!consolidationId) {
        throw new Error('Please select a Consolidation ID');
      }
      const params = new URLSearchParams();

      if (consolidationId) {
        params.append('consolidationId', consolidationId);
      }
      if (formattedDate) {
        params.append('period', formattedDate);
      }
      console.log('params:', {
        consolidationId,
        period: formattedDate,
      });

      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/downloadSelectedSupplierReport?${params.toString()}`;

      console.log('Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleSessionExpired();
        throw new Error('Session expired - Unauthorized');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Check content-type to handle JSON vs. file responses
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        // Parse as JSON (handles "no records found" cases)
        const result = await response.json();
        if (!result.success && result.message) {
          // Specific handling for no data - show friendly toast, no file download
          const noDataMessage =
            result.message.includes('no record') || result.message.includes('No records')
              ? 'No records found for the selected period and consolidation.'
              : result.message;
          showToast(noDataMessage, 'error');
          return; // Exit early, no download
        } else {
          throw new Error(result.message || 'Unexpected JSON response');
        }
      }

      // If not JSON, treat as file blob
      const blob = await response.blob();

      console.log('Blob size:', blob.size, 'Blob type:', blob.type);

      if (blob.size === 0) {
        throw new Error('No file content received - empty file');
      }

      // Determine the file extension
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

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `SelectedSupplier-${consolidationId}-${formattedDate}${fileExtension}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);

      console.log('File download initiated:', filename);
      showToast('File downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      if (!errorMessage.includes('Session expired') && !errorMessage.includes('Unauthorized')) {
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setSelectedLocation('');
    setSearchTerm('');
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
    setError('');
    console.log('All selections cleared');
  };

  // Function to handle download confirmation
  const handleDownloadConfirm = () => {
    setShowConfirmModal(false);
    downloadFile();
  };

  // Function to handle download cancellation
  const handleDownloadCancel = () => {
    setShowConfirmModal(false);
  };

  // Function to get modal message based on selection
  const getModalMessage = () => {
    const period = `${months[selectedMonth]} ${selectedYear}`;
    return `Are you sure you want to download the Selected Supplier report for ${selectedLocation} for ${period}?`;
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-2 sm:p-4 transition-all duration-300">
      {/* Toast Notifications */}
      <Toastify
      />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Confirm Download
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              {getModalMessage()}
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={handleDownloadCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadConfirm}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base order-1 sm:order-2"
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

      {/* Enhanced Session Expired Modal */}
      {showSessionExpiredModal && (
        <SessionModal />
      )}

      {/* Header */}
      <CommonHeader
      title="Selected Supplier Report"
              icon={<UserRoundCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}/>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto flex-1">
        {/* Form Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Period Picker */}
          <div className="flex flex-col w-full lg:w-1/3 relative" ref={periodRef}>
            <div className="relative mt-2">
              <input
                id="period"
                type="text"
                placeholder=" "
                value={`${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`}
                readOnly
                onClick={() => setPeriodOpen(!periodOpen)}
                className="form-control peer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10"
                required
              />
              <label
                htmlFor="period"
                className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none
                          peer-focus:-top-2 peer-focus:scale-75 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:bg-gray-800 dark:peer-focus:text-blue-400
                          peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:left-2 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 dark:peer-[:not(:placeholder-shown)]:bg-gray-800"
              >
                Period
              </label>
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            </div>

            {periodOpen && (
              <div className="absolute top-full mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 border 
              border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-20 p-3 sm:p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => handleYearChange('prev')}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-base sm:text-lg">
                    {selectedYear}
                  </span>
                  <button
                    onClick={() => handleYearChange('next')}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(index)}
                      className={`text-center py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-xs sm:text-sm ${
                        selectedMonth === index
                          ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg transform scale-105'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Dropdown with Search */}
          <div className="flex flex-col w-full lg:w-1/3 relative" ref={locationRef}>
            <div className="relative mt-2">
              <input
                id="location"
                type="text"
                placeholder=" "
                value={loadingLocations ? 'Loading consolidations...' : selectedLocation || ''}
                readOnly
                onClick={() => !loadingLocations && setDropdownOpen(!dropdownOpen)}
                disabled={loadingLocations}
                className="form-control peer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <label
                htmlFor="location"
                className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none
                          peer-focus:-top-2 peer-focus:scale-75 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:bg-gray-800 dark:peer-focus:text-blue-400
                          peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:left-2 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 dark:peer-[:not(:placeholder-shown)]:bg-gray-800"
              >
                Quotation No <sup className='text-red-600'>*</sup>
              </label>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 transform transition-transform duration-200">
                ▾
              </span>
            </div>

            {dropdownOpen && !loadingLocations && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search consolidations..."
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 bg-white dark:bg-gray-700"
                  />
                </div>
                <ul className="max-h-48 sm:max-h-60 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => (
                      <li
                        key={location.pk}
                        onClick={() => {
                          setSelectedLocation(formatLocationDisplay(location));
                          setDropdownOpen(false);
                          setSearchTerm('');
                        }}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                          {location.locationId}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-gray-500 dark:text-gray-400 text-sm text-center">
                      No consolidations found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 pt-4">
          <Tooltip content='Download'><button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading || loadingLocations || !selectedLocation}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800
               hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
              text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
              ${loading || loadingLocations || !selectedLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Download report"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine size={20} />
            )}
          </button></Tooltip>
 <Tooltip content='Clear'>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={loading || loadingLocations}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
              text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear selection"
          >
            <X size={20} />
          </button></Tooltip>
        </div>

        {/* Loading indicator */}
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

export default SelectedSupplier;