import React, { useState, useRef, useEffect } from "react";
import { FileText, ArrowDownToLine, X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import Toastify,{ showToast } from "src/views/Toastify";
import SessionModal from "src/views/SessionModal";
import CommonHeader from "../../CommonHeader";
import { Tooltip} from "flowbite-react";
interface ApiSupplierItem {
  code: string;
  name: string;
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

const SupplierStatement: React.FC = () => {
  // Use a constant to ensure the date is evaluated only once
  const today = new Date();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([{ supplierId: "", supplierName: "All Suppliers" }]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const baseUrl = "http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  // Check authentication status on mount
  useEffect(() => {
    if (!checkAuth()) {
      handleSessionExpired();
    } else {
      fetchSuppliers();
    }
  }, []);

  

  // Fetch suppliers based on period
  const fetchSuppliers = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }
    const day = "01";
    const month = String(selectedMonth + 1).padStart(2, "0");
    const periodStr = `${day}-${month}-${selectedYear}`;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/dropDownSupplierIdByMonthlyInvoiceStatementReport/${periodStr}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      const result: ApiResponse = await response.json();
      if (result.success) {
        showToast('Suppliers Dropdown loaded','success')
        const apiSuppliers = result.data
          .filter(item => item.code && item.name)
          .map((item: ApiSupplierItem) => ({
            supplierId: item.code,
            supplierName: item.name,
          })) as Supplier[];
        const allSuppliers: Supplier = { supplierId: "", supplierName: "All Suppliers" };
        setSuppliers([allSuppliers, ...apiSuppliers]);
      } else {
       
        const allSuppliers: Supplier = { supplierId: "", supplierName: "All Suppliers" };
        setSuppliers([allSuppliers]);
    
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load suppliers", "error");
      const allSuppliers: Supplier = { supplierId: "", supplierName: "All Suppliers" };
      setSuppliers([allSuppliers]);
      handleSessionExpired();
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [selectedMonth, selectedYear]);

  // Filtered dropdown options
  const filteredSuppliers = suppliers.filter((sup) =>
    sup.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  };

  // Handle session expiration
  const handleSessionExpired = () => {
    setShowExpired(true);
  };

  // Function to download the file
  const downloadFile = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }
    const userId = localStorage.getItem('userId')
    setLoading(true);
    try {
      const day = "01";
      const month = String(selectedMonth + 1).padStart(2, "0");
      const dateStr = `${day}-${month}-${selectedYear}`;
      const token = localStorage.getItem("authToken");
      let apiUrl: string;
      if (selectedSupplier && selectedSupplier.supplierId) {
        apiUrl = `${baseUrl}/listMonthlyInvoiceStatementSupplierIdBased/${dateStr}/${selectedSupplier.supplierId}/${userId}`;
      } else {
        apiUrl = `${baseUrl}/listMonthlyInvoiceStatement/${dateStr}/${userId}`;
      }
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
      if (contentType.includes('application/json')) {
        // Parse as JSON (handles "no records found" cases)
        const result = await response.json();
        if (!result.success && result.message) {
          const noDataMessage = result.message.includes('no record') || result.message.includes('No records')
            ? 'No records found for the selected period.'
            : result.message;
          showToast(noDataMessage, 'error');
          return;
        } else {
          throw new Error(result.message || 'Unexpected JSON response');
        }
      }
      // Treat as file blob
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('No file content received - empty file');
      }
      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `Supplier statement - ${dateStr}_${selectedSupplier?.supplierId || "ALL"}.pdf`;
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
      showToast('File downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        handleSessionExpired();
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle download confirmation
  const handleDownloadConfirm = () => {
    setShowConfirm(false);
    downloadFile();
  };

  // Function to handle download cancellation
  const handleDownloadCancel = () => {
    setShowConfirm(false);
  };

  const handleClear = () => {
    setSelectedSupplier(null);
    setSearchTerm("");
  };

  const monthDisplay = String(selectedMonth + 1).padStart(2, "0");

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-4 transition-all duration-300">
      {/* Toastify Component */}
      <Toastify />
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex
        items-center justify-center z-40 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to download the Monthly Invoice Statement report for{' '}
              <span className="font-semibold">
                {months[selectedMonth]} {selectedYear}
              </span>
              {selectedSupplier && selectedSupplier.supplierId && (
                <> and supplier <span className="font-semibold">{selectedSupplier.supplierName}</span></>
              )}
              ?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleDownloadCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadConfirm}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
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
      {/* Session Expired Modal */}
      {showExpired && (
        <SessionModal/>
      )}
      {/* Header */}
      <CommonHeader
      title="Monthly Invoice Statement Report"
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
      />
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-2xl shadow-md w-full max-w-5xl mx-auto flex-1">
        <div className="flex flex-col md:flex-row items-start justify-center gap-6 mb-8">
          {/* Period Picker */}
          <div className="w-full md:w-1/3 relative" ref={periodRef}>
            <div className="relative mt-2">
              <input
                id="period"
                type="text"
                placeholder=" "
                value={`${monthDisplay}/${selectedYear}`}
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
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            </div>
            {periodOpen && (
              <div className="absolute mt-2 w-full bg-white dark:bg-gray-700 border
               border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 p-2">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-600
                     rounded-full transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange("next")}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-600
                     rounded-full transition-colors"
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
                          ? "bg-blue-600 text-white font-semibold shadow-md"
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
          {/* Supplier Dropdown with Search */}
          <div className="w-full md:w-1/3 relative" ref={dropdownRef}>
            <div className="relative mt-2">
              <input
                id="supplier"
                type="text"
                value={selectedSupplier?.supplierName || ""}
                readOnly
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="form-control peer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10"
                required
              />
              <label 
                htmlFor="supplier"
                className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none
                          peer-focus:-top-2 peer-focus:scale-75 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:bg-gray-800 dark:peer-focus:text-blue-400
                          peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:left-2 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 dark:peer-[:not(:placeholder-shown)]:bg-gray-800"
              >
                  Please select supplier id
              </label>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">▾</span>
            </div>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
               rounded-lg shadow-lg z-20 max-h-60 overflow-hidden">
                <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                  <input
                    type="text"
                    placeholder="Search suppliers"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-500 rounded-md px-2 py-1
                    text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((sup) => (
                      <li
                        key={sup.supplierId}
                        onClick={() => {
                          setSelectedSupplier(sup);
                          setDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/50 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {sup.supplierName}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                      No results found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 md:gap-6">
         <Tooltip content='Download'> <button
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
            aria-label="Download report"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine size={20} />
            )}
          </button></Tooltip>
         <Tooltip content='Clear'> <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-700 
      hover:from-red-700 hover:to-red-800 
      text-white text-base sm:text-lg p-3 rounded-full 
      shadow-lg transition-all duration-300 
      flex items-center justify-center 
      hover:shadow-xl transform hover:scale-105 active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear selection"
          >
            <X size={20} />
          </button></Tooltip>
        </div>
        {/* Updated loading indicator */}
        {loading && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium text-sm sm:text-base">Preparing your download...</span>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default SupplierStatement;