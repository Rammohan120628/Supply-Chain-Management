import React, { useState, useRef, useEffect } from "react";
import { ArrowDownToLine, X, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarDays } from 'lucide-react';
import { FileText } from 'lucide-react';
import { FaFilePdf } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa6";
import SessionModal from "src/views/SessionModal";
import Toastify, { showToast } from 'src/views/Toastify';
import CommonHeader from "../../CommonHeader";
import { Tooltip} from "flowbite-react";
const SupplierStatementSummary: React.FC = () => {
  const [, setDropdownOpen] = useState<boolean>(false);
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  // ✅ FIX: added parentheses to call getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [downloadType, setDownloadType] = useState<'pdf' | 'excel'>('pdf');
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    return !!(token && userId);
  };

  // Handle session expiration
  const handleSessionExpired = () => {
    setShowSessionModal(true);
  };

  // Close both dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  // Function to format date for API (DD-MM-YYYY with 01 as default day)
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  const handleClearAll = () => {
    setSelectedMonth(10);
    setSelectedYear(2025);
    setError("");
    console.log('All selections cleared');
  };

  // Function to download the file (UPDATED: Dynamic extension based on content-type)
  const downloadFile = async (type: 'pdf' | 'excel') => {
    // Check authentication before proceeding
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    setLoading(true);
    setError("");

    try {
      const formattedDate = formatDateForApi(selectedMonth, selectedYear);
      const baseUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController`;

      let apiUrl = '';
      if (type === 'pdf') {
        if (!userId) {
          throw new Error('User ID not found. Please log in again.');
        }
        apiUrl = `${baseUrl}/listSupplierStatementsPdfReport/${formattedDate}/${userId}`;
      } else {
        apiUrl = `${baseUrl}/listSupplierStatementsExcelReport/${formattedDate}`;
      }

      console.log('Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Check content-type to handle JSON vs. file responses
      const contentType = response.headers.get('content-type') || '';
      console.log('Content-Type:', contentType);

      if (contentType.includes('application/json')) {
        // Parse as JSON (handles "no records found" cases)
        const result = await response.json();
        if (!result.success && result.message) {
          // Specific handling for no data - show friendly toast, no file download
          const noDataMessage = result.message.includes('no record') || result.message.includes('No records')
            ? 'No records found for the selected period.'
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

      // Check if blob has content
      if (blob.size === 0) {
        throw new Error('No file content received - empty file');
      }

      // Determine the file extension and report type based on content type
      let fileExtension = '';
      let reportType = type.toUpperCase();

      if (contentType.includes('pdf') || contentType.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        fileExtension = contentType.includes('pdf') ? '.pdf' : '.xlsx';
        reportType = contentType.includes('pdf') ? 'PDF' : 'Excel';
      } else if (contentType.includes('xls') || contentType.includes('vnd.ms-excel')) {
        fileExtension = '.xls';
        reportType = 'Excel';
      } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
        fileExtension = '.xlsx';
        reportType = 'Excel';
      } else {
        // Fallback
        fileExtension = type === 'pdf' ? '.pdf' : '.xlsx';
      }

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;

      // Dynamic filename
      let filename = `Supplier Statements Summary Report - ${reportType} - ${formattedDate}${fileExtension}`;

      // Try to get filename from response headers or use the dynamic name
      const contentDisposition = response.headers.get('content-disposition');
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

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);

      console.log('File download initiated:', filename, 'Extension:', fileExtension, 'Content-Type:', contentType);
      showToast(`${reportType} file downloaded successfully!`, 'success');

    } catch (err) {
      console.error('Download error:', err);
      const errorMessage =  'Failed to download';
      handleSessionExpired();

      // Check for authentication errors
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        handleSessionExpired();
      } else {
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle download confirmation (UPDATED: Uses downloadType)
  const handleDownloadConfirm = () => {
    setShowConfirmModal(false);
    downloadFile(downloadType);
  };

  // Function to handle download cancellation
  const handleDownloadCancel = () => {
    setShowConfirmModal(false);
  };

  // Handlers for opening modal with specific type
  const handlePdfDownloadClick = () => {
    setDownloadType('pdf');
    setShowConfirmModal(true);
  };

  const handleExcelDownloadClick = () => {
    setDownloadType('excel');
    setShowConfirmModal(true);
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-4 transition-all duration-300">
      {/* Toast Notifications */}
      <Toastify/>

      {/* Confirmation Modal (UPDATED: Dynamic for PDF/Excel) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex
         items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-full mr-3 ${downloadType === 'pdf' ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
                <ArrowDownToLine className={`text-${downloadType === 'pdf' ? 'red' : 'green'}-600`} size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to download the{' '}
              <span className="font-semibold capitalize">{downloadType}</span> report for{' '}
              <span className="font-semibold">
                {months[selectedMonth]} {selectedYear}
              </span>?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleDownloadCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600
                 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </button>

              <button
                onClick={handleDownloadConfirm}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Downloading...
                  </div>
                ) : (
                  downloadType.toUpperCase()
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      {showSessionModal && (
        <SessionModal />
      )}

      {/* Header */}
      <CommonHeader
       title="Supplier Statements Summary Report"
        icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
        />

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-2xl shadow-md w-full
       max-w-5xl mx-auto flex-1">
        {/* Period Picker */}
        <div className="flex flex-col items-center justify-center gap-6 mb-8">
          <div className="w-full max-w-[300px] relative" ref={periodRef}>
            <div className="relative mt-2">
              <input
                id="period"
                type="text"
                placeholder=" "
                value={`${String(selectedMonth + 1).padStart(2, "0")}/${selectedYear}`}
                readOnly
                onClick={() => setPeriodOpen(!periodOpen)}
                className="form-control peer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            </div>

            {periodOpen && (
              <div className="absolute mt-2 w-full max-w-sm bg-white dark:bg-gray-700 border
               border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 p-2">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange("next")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(index)}
                      className={`text-center py-2 rounded-lg cursor-pointer
                         transition-all duration-200 ${
                        selectedMonth === index
                          ? "bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow-md"
                          : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-center gap-4 md:gap-6">
          <Tooltip content='PDF'>
          <button
            type="button"
            onClick={handlePdfDownloadClick}
            disabled={loading}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
              text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Download report"
          >
            {loading && downloadType === 'pdf' ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaFilePdf size={20} />
            )}
          </button>
          </Tooltip>


          <Tooltip content='EXCEL'>
          <button
            type="button"
            onClick={handleExcelDownloadClick}
            disabled={loading}
            className={`bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 hover:from-green-700 hover:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900 
              text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Download report excel"
          >
            {loading && downloadType === 'excel' ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent
               rounded-full animate-spin"></div>
            ) : (
              <FaFileExcel size={20} />
            )}
          </button>
          </Tooltip>

         <Tooltip content='Clear'>
          <button
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

export default SupplierStatementSummary;