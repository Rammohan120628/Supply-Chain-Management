import React, { useState, useRef, useEffect } from "react";
import { ArrowDownToLine, X, ChevronLeft, ChevronRight, MapPinned,CalendarDays } from "lucide-react";
import Toastify,{ showToast } from "src/views/Toastify";
import SessionModal from "src/views/SessionModal";
import CommonHeader from "../../CommonHeader";
import { Tooltip} from "flowbite-react";
const SavingsByCWHInvoiceWithLocations: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth()); 
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); 
  const [, setError] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState<boolean>(false);

  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const periodOptions = [...months];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${year}-${formattedMonth}-01`;
  };

  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
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
    if (selectedMonth === null) return;

    setLoading(true);
    setError("");

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

      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/savingsByCwhInvoiceWithLocationReport`;

      console.log('Posting to:', apiUrl); 
       console.log('Request body:', JSON.stringify({ period: formattedDate }));
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period: formattedDate }),
      });
     
      console.log('Response status:', response.status);

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
          const noDataMessage = result.message.includes('no record') || result.message.includes('No records') 
            ? 'No records found for the selected period.' 
            : result.message;
          showToast(noDataMessage, 'error');
          return; 
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
      let filename = `SavingsByCWHInvoiceWithLocationReport-${formattedDate}${fileExtension}`;
      
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
      const errorMessage = 'Failed to download';
      if (!errorMessage.includes('Session expired') && !errorMessage.includes('Unauthorized')) {
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setSelectedMonth(null);
    setSelectedYear(new Date().getFullYear());
    setError("");

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
    if (selectedMonth === null) return "";
    const period = `${months[selectedMonth]} ${selectedYear}`;
    return `Are you sure you want to download the CWH Savings By Location report for ${period}?`;
  };

  const displayValue = selectedMonth === null ? "Please select a month" : `${String(selectedMonth + 1).padStart(2, "0")}/${selectedYear}`;

  const isPeriodSelected = (index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-2 sm:p-4 transition-all duration-300">
      {/* toast notfiy */}
      <Toastify/>


      {showConfirmModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
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
              <SessionModal/>
            )}

      {/* Header */}
       <CommonHeader
            title="CWH Savings By Location Report"
              icon={<MapPinned className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
            />

            {/* toast */}
            <Toastify/>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto flex-1">

        {/* Form Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Period Picker */}
          <div className="flex flex-col w-full lg:w-1/3 relative" ref={periodRef}>
            <div className="relative mt-2">
              <input
                id="periodInput"
                type="text"
                value={displayValue}
                readOnly
                onClick={() => setPeriodOpen(!periodOpen)}
                className="form-control peer w-full px-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none cursor-pointer transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              />
              <label
                htmlFor="periodInput"
                className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                          peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1
                          peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
              >
                Period
              </label>
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            </div>
            
            {periodOpen && (
              <div className="absolute top-full mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-20 p-3 sm:p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-base sm:text-lg">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange("next")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {periodOptions.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => handlePeriodSelect(index)}
                      className={`text-center py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-xs sm:text-sm ${
                        isPeriodSelected(index)
                          ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg transform scale-105"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 pt-4">
          <Tooltip content='Download'><button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading || selectedMonth === null}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
              text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
              ${loading || selectedMonth === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Download report"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine size={20} />
            )}
          </button></Tooltip>

          <Tooltip content='Clear'><button
            type="button"
            onClick={handleClearAll}
            disabled={loading}
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

export default SavingsByCWHInvoiceWithLocations;