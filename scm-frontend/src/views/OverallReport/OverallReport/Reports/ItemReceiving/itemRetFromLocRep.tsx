import React, { useState, useRef, useEffect } from "react";
import { Package, ArrowDownToLine, X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import dayjs from "dayjs";
import SessionModal from "src/views/SessionModal";

import Toastify,{ showToast } from "src/views/Toastify";

import CommonHeader from "../../CommonHeader";

import { Tooltip} from "flowbite-react";
interface Location {
  locationId: string;
  locationName: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: any[];
}

const BASE_URL = "http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController";

const ItemReturnFromLocation: React.FC = () => {
  const now = dayjs();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [searchTermLocation, setSearchTermLocation] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<string[]>([]);
  const [selectedReturnNo, setSelectedReturnNo] = useState<string>("");
  const [searchTermTransaction, setSearchTermTransaction] = useState<string>("");
  const [openTransaction, setOpenTransaction] = useState<boolean>(false);

  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.month());
  const [selectedYear, setSelectedYear] = useState<number>(now.year());

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const transactionRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      console.log("Auth check failed", { hasToken: !!token, hasUserId: !!userId });
      return false;
    }
    return true;
  };

  // Handle session expiration
  const handleSessionExpired = () => {
    setShowExpired(true);
  };



  // Get formatted period for GET APIs (dd-mm-yyyy format)
  const getFormattedPeriodForGet = () => {
    return `01-${String(selectedMonth + 1).padStart(2, "0")}-${selectedYear}`;
  };

  // Get formatted period for POST API (yyyy-mm-dd format)
  const getFormattedPeriodForPost = () => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
  };

  // Fetch Locations with correct data extraction
  const fetchLocations = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const token = localStorage.getItem("authToken");
    const period = getFormattedPeriodForGet();

    setFetchingData(true);
    try {
      const res = await fetch(
        `${BASE_URL}/dropDownPeriodBasedLocationIdByItemReturnFromLocationReport/${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch locations");
      }

      const result: ApiResponse = await res.json();

      if (result.success) {
        showToast("Locations Dropdown loaded", "success");
        const apiLocations = result.data
          .filter((item: any) => item.code && item.name)
          .map((item: any) => ({
            locationId: item.code,
            locationName: `${item.code} - ${item.name}`,
          })) as Location[];
        setLocations(apiLocations);
      } else {
        showToast(result.message || "Failed to load locations", "error");
        setLocations([]);
      }
    } catch (e) {
      console.error("Error fetching locations:", e);
      showToast("Failed to load locations", "error");
      setLocations([]);
    } finally {
      setFetchingData(false);
    }
  };

  // Fetch Transactions with correct data extraction
  const fetchTransactions = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const token = localStorage.getItem("authToken");
    const period = getFormattedPeriodForGet();

    setFetchingData(true);
    try {
      const res = await fetch(
        `${BASE_URL}/loadTransactionNODropdownData/${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const result: ApiResponse = await res.json();

      if (result.success) {
        if(result.data.length === 0) {
          showToast("No transactions found for the selected period", "error");
          setTransactions([]);
          return;
        }
        if(result.data.length){
        showToast("Transactions Dropdown loaded", "success");
      }
        // Extract transaction numbers from the 'name' field
        const transactionNumbers = result.data
          .filter((item: any) => item.name)
          .map((item: any) => item.name);
        setTransactions(transactionNumbers);
      } else {
        showToast(result.message || "Failed to load transactions", "error");
        setTransactions([]);
      }
    } catch (e) {
      handleSessionExpired();
      console.error("Error fetching transactions:", e);
      showToast("Failed to load transactions", "error");
      setTransactions([]);
    } finally {
      setFetchingData(false);
    }
  };

  // Fetch data on period change
  useEffect(() => {
    fetchLocations();
    fetchTransactions();
  }, [selectedMonth, selectedYear]);

  // Check authentication on mount
  useEffect(() => {
    if (!checkAuth()) {
      handleSessionExpired();
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
      if (transactionRef.current && !transactionRef.current.contains(event.target as Node)) {
        setOpenTransaction(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered dropdown options
  const filteredLocations = locations.filter((loc) =>
    loc.locationName.toLowerCase().includes(searchTermLocation.toLowerCase())
  );
  const filteredTransactions = transactions.filter((item) =>
    item.toLowerCase().includes(searchTermTransaction.toLowerCase())
  );

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const inputValue = `${String(selectedMonth + 1).padStart(2, "0")}/${selectedYear}`;

  const handlePeriodClick = () => {
    setPeriodOpen(!periodOpen);
  };

  // Generate dynamic filename
  const generateFileName = (): string => {
    const periodStr = `${String(selectedMonth + 1).padStart(2, "0")}-${selectedYear}`;
    let fileName = `ItemsReturnFromLocationReport_${periodStr}`;

    if (selectedLocationName) {
      const locationPart = selectedLocationName.replace(/\s+/g, '_');
      fileName += `_${locationPart}`;
    }

    if (selectedReturnNo) {
      fileName += `_${selectedReturnNo}`;
    }

    return `${fileName}.pdf`;
  };

  // Build request body with proper structure
  const buildRequestBody = () => {
    const userIdStr = localStorage.getItem("userId");
    const period = getFormattedPeriodForPost();
    
    const body: any = {
      period: period,
      userId: Number(userIdStr)
    };

    if (selectedLocationId && selectedLocationId.trim() !== "") {
      body.locationId = selectedLocationId;
    }

    if (selectedReturnNo && selectedReturnNo.trim() !== "") {
      body.returnNo = selectedReturnNo;
    }

    console.log("Final Request body:", body);
    return body;
  };

  // Handle API response - check if it's PDF or error message
  const handleApiResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/pdf')) {
      const blob = await response.blob();
      
      if (blob.size === 0 || blob.size < 100) {
        throw new Error("Generated PDF is empty or invalid");
      }

      return {
        type: 'pdf',
        blob: blob
      };
    } 
    else if (contentType && (contentType.includes('text/plain') || contentType.includes('application/json'))) {
      const text = await response.text();
      
      try {
        const jsonResponse = JSON.parse(text);
        throw new Error(jsonResponse.message || jsonResponse.error || "Unknown error occurred");
      } catch {
        throw new Error(text || "Unknown error occurred");
      }
    }
    else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${contentType}. Response: ${text}`);
    }
  };

  // Download PDF
  const handleDownload = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    setLoading(true);
    const userIdStr = localStorage.getItem("userId");
    if (!userIdStr) {
      handleSessionExpired();
      setLoading(false);
      return;
    }

    const requestBody = buildRequestBody();
    const token = localStorage.getItem("authToken");
    
    try {
      console.log("Sending request with body:", JSON.stringify(requestBody, null, 2));
      
      const res = await fetch(
        `${BASE_URL}/listOfItemReturnFromLocationReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
        const a = document.createElement("a");
        a.href = url;
        a.download = generateFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast("Report downloaded successfully", "success");
      }

    } catch (error) {
      console.error("Error downloading PDF:", error);      
      const errorMessage = "Failed to Download";
      
      if (errorMessage.toLowerCase().includes("no record") || 
          errorMessage.toLowerCase().includes("no data") || 
          errorMessage.toLowerCase().includes("not found") ||
          errorMessage.toLowerCase().includes("empty")) {
        showToast("No records found for the selected criteria", "error");
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear Form
  const handleClear = () => {
    setSelectedLocationId("");
    setSelectedLocationName("");
    setSelectedReturnNo("");
    setSearchTermLocation("");
    setSearchTermTransaction("");
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 p-2 sm:p-4">
      {/* Toastify */}
      <Toastify/>
      
      
      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to download the Items Return From Location Report for the selected criteria?
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


      {/* header */}
       <CommonHeader
            title="Items Return From Location Report"
              icon={<Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
            />

      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Period Picker */}
          <div className="flex-1 relative" ref={periodRef}>
            <input
              id="period"
              type="text"
              value={inputValue}
              readOnly
              onClick={handlePeriodClick}
              className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 dark:bg-gray-700 
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
            />
            <label
              htmlFor="period"
              className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                        peer-[:not(:placeholder-shown)]:px-1"
            >
              Period
            </label>
            <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            {periodOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-3">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange("next")}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
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
                          ? "bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Dropdown with Search */}
          <div className="flex-1 relative" ref={locationRef}>
            <input
              id="location"
              type="text"
              value={selectedLocationName || "Please Select Location Id"}
              readOnly
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={fetchingData}
              className="peer w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 dark:bg-gray-700 
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-gray-500"
            />
            <label
              htmlFor="location"
              className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                        peer-[:not(:placeholder-shown)]:px-1"
            >
              Location Id
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">▾</span>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search locations"
                    autoFocus
                    value={searchTermLocation}
                    onChange={(e) => setSearchTermLocation(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-300"
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
                          setSearchTermLocation("");
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                      >
                        {loc.locationName}
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

          {/* Transaction Dropdown */}
          <div className="flex-1 relative" ref={transactionRef}>
            <input
              id="transaction"
              type="text"
              value={selectedReturnNo || "Please Select Transaction No"}
              readOnly
              onClick={() => setOpenTransaction(!openTransaction)}
              disabled={fetchingData}
              className="peer w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 dark:bg-gray-700 
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-gray-500"
            />
            <label
              htmlFor="transaction"
              className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                        peer-[:not(:placeholder-shown)]:px-1"
            >
              Transaction No
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">▾</span>

            {openTransaction && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search transactions"
                    autoFocus
                    value={searchTermTransaction}
                    onChange={(e) => setSearchTermTransaction(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2
                     focus:ring-blue-400 dark:focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((item) => (
                      <li
                        key={item}
                        onClick={() => {
                          setSelectedReturnNo(item);
                          setOpenTransaction(false);
                          setSearchTermTransaction("");
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                      >
                        {item}
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

        {/* Buttons */}
        <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 gap-4 sm:gap-6">
          <Tooltip content='Download'> <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={loading || fetchingData}
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
            disabled={fetchingData}
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

export default ItemReturnFromLocation;