import React, { useState, useRef, useEffect } from "react";
import { ArrowDownToLine, X, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarDays } from 'lucide-react';
import { FileText } from 'lucide-react';
import Toastify,{ showToast } from "src/views/Toastify";
import SessionModal from "src/views/SessionModal";
import CommonHeader from "../../CommonHeader";
import { Tooltip} from "flowbite-react";
interface Item {
  id: string;
  name: string;
}

const ItemMovementRecap: React.FC = () => {
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [itemDropdownOpen, setItemDropdownOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);

  const periodRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

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

  

  // Fetch items for dropdown
  const fetchItems = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const token = localStorage.getItem('authToken');
    const apiUrl = 'http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController/loadItemDropdown';

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status == 401 || response.status == 403) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }

      if(response.ok){
        showToast('Items Dropdown loaded','success')
      }

      const result = await response.json();
      // Map the data to {id: code, name: name}
      const mappedItems = (result.data || []).map((item: any) => ({
        id: item.code || '',
        name: item.name || ''
      })).filter((item: Item) => item.id && item.name); // Filter out invalid items
      setItems(mappedItems);
    } catch (err) {
      handleSessionExpired();
      console.error('Error fetching items:', err);
      showToast('Failed to load items', 'error');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setItemDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handleItemSelect = (itemId: string | null) => {
    setSelectedItemId(itemId);
    setItemDropdownOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filtered items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to format date for API (YYYY-MM-DD)
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${year}-${formattedMonth}-01`;
  };

  const handleClearAll = () => {
    setSelectedMonth(10);
    setSelectedYear(2025);
    setSelectedItemId(null);
    setSearchTerm('');
    setError("");

  };

  // Function to download the PDF file
  const downloadFile = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    setLoading(true);
    setError("");

    try {
      const period = formatDateForApi(selectedMonth, selectedYear);
      const baseUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController`;
      const apiUrl = `${baseUrl}/listOfItemsMovementReport/${userId}`;

      const body: { period: string; itemId?: string } = { period };
      if (selectedItemId) {
        body.itemId = selectedItemId;
      }

      console.log('Posting to:', apiUrl, 'Body:', body);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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

      // Extension for PDF
      const fileExtension = '.pdf';

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;

      // Dynamic filename
      const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) : null;
      const itemDisplay = selectedItem ? `${selectedItem.id} - ${selectedItem.name}` : 'All Items';
      const displayPeriod = `${months[selectedMonth]} ${selectedYear}`;
      let filename = `Item Movement Recap Report - ${itemDisplay} - PDF - ${displayPeriod}${fileExtension}`;

      // Try to get filename from response headers
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

      console.log('File download initiated:', filename);
      showToast('PDF file downloaded successfully!', 'success');

    } catch (err) {
      handleSessionExpired();
      console.error('Download error:', err);
      const errorMessage ='Failed to download';

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

  // Function to handle download confirmation
  const handleDownloadConfirm = () => {
    setShowConfirmModal(false);
    downloadFile();
  };

  // Function to handle download cancellation
  const handleDownloadCancel = () => {
    setShowConfirmModal(false);
  };

  // Get selected item display
  const getSelectedItemDisplay = () => {
    if (!selectedItemId) return 'All Items';
    const item = items.find(i => i.id === selectedItemId);
    return item ? `${item.id} - ${item.name}` : 'All Items';
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-4 transition-all duration-300">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex
         items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to download the PDF report for{' '}
              <span className="font-semibold">
                {months[selectedMonth]} {selectedYear}
              </span>
              {selectedItemId && (
                <>
                  {' '}
                  <span className="font-semibold">- {getSelectedItemDisplay()}</span>
                </>
              )}
              {selectedItemId ? '.' : ' (All Items)?'}
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
                  'Yes, Download'
                )}
              </button>

           
            </div>
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      {showSessionModal && (
              <SessionModal/>
            )}

      {/* Header */}
       <CommonHeader
            title="Item Movement Recap Report"
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
            />
            {/* toast */}
<Toastify/>
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 p-2 md:p-6 rounded-2xl shadow-md w-full max-w-5xl mx-auto flex-1">
        {/* Period and Item Pickers - Horizontal */}
        <div className="flex flex-row items-center justify-center gap-6 mb-8 max-w-2xl mx-auto">
          {/* Period Picker */}
          <div className="w-full max-w-sm relative" ref={periodRef}>
            <input
              id="period"
              type="text"
              value={`${String(selectedMonth + 1).padStart(2, "0")}/${selectedYear}`}
              readOnly
              onClick={() => setPeriodOpen(!periodOpen)}
              className="peer w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none cursor-pointer bg-white dark:bg-gray-700
                transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            />
            <label
              htmlFor="period"
              className="absolute left-4 top-3 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                        peer-[:not(:placeholder-shown)]:px-1"
            >
              Period <sup className="text-red-500">*</sup>
            </label>
            <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={20} />
            
            {periodOpen && (
              <div className="absolute mt-2 w-full max-w-sm bg-white dark:bg-gray-700 border
               border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-2">
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

          {/* Item Dropdown */}
          <div className="w-full max-w-sm relative" ref={itemRef}>
            <input
              id="item"
              type="text"
              value={getSelectedItemDisplay()}
              autoFocus
              readOnly
              onClick={() => setItemDropdownOpen(!itemDropdownOpen)}
              className="peer w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none cursor-pointer bg-white dark:bg-gray-700
                transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            />
            <label
              htmlFor="item"
              className="absolute left-4 top-3 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                        peer-[:not(:placeholder-shown)]:px-1"
            >
              Item 
            </label>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">▾</span>
            
            {itemDropdownOpen && (
              <div className="absolute mt-2 w-full max-w-sm bg-white dark:bg-gray-700 border
               border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 p-2 max-h-60 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  autoFocus
                  onChange={handleSearchChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => handleItemSelect(null)}
                  className={`w-full text-left py-2 px-3 rounded-lg cursor-pointer
                     transition-all duration-200 ${
                    !selectedItemId
                      ? "bg-blue-100 dark:bg-blue-200 text-dark font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  All Items
                </button>
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`w-full text-left py-2 px-3 rounded-lg cursor-pointer
                       transition-all duration-200 ${
                      selectedItemId === item.id
                        ? "bg-blue-100 dark:bg-blue-100 text-dark font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {item.id} - {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 md:gap-6">
          <Tooltip content='Download'><button
            type="button"
            onClick={() => setShowConfirmModal(true)}
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
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine size={20} />
            )}
          </button></Tooltip>

          <Tooltip content='Clear'><button
            type="button"
            onClick={handleClearAll}
            disabled={loading}
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

export default ItemMovementRecap;