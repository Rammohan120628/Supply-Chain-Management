import React, { useState, useRef, useEffect } from "react";
import { Package, ArrowDownToLine, X, ChevronLeft, ChevronRight, CalendarDays, LogOut } from "lucide-react";
import CommonHeader from "../../CommonHeader";
import Toastify,{ showToast } from "src/views/Toastify";
import { Tooltip} from "flowbite-react";
interface ApiLocationItem {
  code: string;
  name: string;
}

interface Location {
  locationId: string;
  locationName: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiLocationItem[];
}

const ItemReturnFromLocationsSummaryReport: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([{ locationId: "", locationName: "All Locations" }]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const baseUrl = "http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController";

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

  // Check authentication status on mount
  useEffect(() => {
    if (!checkAuth()) {
      handleSessionExpired();
    }
  }, []);

  // Handle session expiration
  const handleSessionExpired = () => {
    setShowExpired(true);
  };

  // Redirect to login
  const redirectToLogin = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    window.location.href = "/login"; 
  };

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      if (userId === null) {
        console.log('User id not found');
      }
      return false;
    }
    return true;
  };

  // Fetch locations based on period
  const fetchLocations = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const userId = localStorage.getItem("userId") || "";

    const day = "01";
    const month = String(selectedMonth + 1).padStart(2, "0");
    const periodStr = `${day}-${month}-${selectedYear}`;

    try {
      const token = localStorage.getItem("authToken");
      const url = `${baseUrl}/loadLocationDropDownBasedOnPeriod/${periodStr}?userId=${userId}`;
      const response = await fetch(url, {
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
        throw new Error("Failed to fetch locations");
      }

      const result: ApiResponse = await response.json();
      if (result.success) {
        if(result.data.length === 0) {
          showToast("No locations found for the selected period", "error");
          setLocations([{ locationId: "", locationName: "All Locations" }]);
          return;
        }
        if(result.data.length){
        showToast("Locations Dropdown loaded", "success");
      }
        const apiLocations = result.data
          .filter(item => item.code && item.name) 
          .map((item: ApiLocationItem) => ({
            locationId: item.code,
            locationName: item.name,
          })) as Location[];

        const allLocations: Location = { locationId: "", locationName: "All Locations" };
        setLocations([allLocations, ...apiLocations]);
      } else {
        showToast(result.message || "Failed to load locations", "error");
        const allLocations: Location = { locationId: "", locationName: "All Locations" };
        setLocations([allLocations]);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load locations", "error");
       handleSessionExpired();
      const allLocations: Location = { locationId: "", locationName: "All Locations" };
      setLocations([allLocations]);
    }
  };

  useEffect(() => {
    if (selectedMonth !== -1) {
      fetchLocations();
    } else {
      const allLocations: Location = { locationId: "", locationName: "All Locations" };
      setLocations([allLocations]);
    }
  }, [selectedMonth, selectedYear]);

  // Filtered dropdown options
  const filteredLocations = locations.filter((loc) =>
    loc.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handlePeriodClick = () => {
    if (selectedMonth === -1) {
      setSelectedMonth(10); // Default to November
      setSelectedYear(2025);
    }
    setPeriodOpen(!periodOpen);
  };

  const handleDownload = async () => {
    if (selectedMonth === -1) {
      showToast("Please select a period", "error");
      return;
    }

    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem("userId") || "";
    const month = String(selectedMonth + 1).padStart(2, "0");
    const periodBody = `${selectedYear}-${month}-01`;
    const body = {
      period: periodBody,
      locationId: selectedLocation?.locationId || "",
      userId: userId,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/generateReturnItemsToSupplierReport/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        if (text.toLowerCase().includes("no records found")) {
          showToast("No records found", "error");
        } else {
          throw new Error("Download failed");
        }
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ItemReturnFromLocationsSummaryReport_${periodBody}_${selectedLocation?.locationId || "ALL"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Download started successfully", "success");
    } catch (error) {
      console.error(error);
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        handleSessionExpired();
      } else {
        showToast("Failed to Download", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setSearchTerm("");
    setSelectedMonth(-1);
    setSelectedYear(2025);
  };

  const inputValue = selectedMonth === -1 
    ? "Select Period" 
    : `${String(selectedMonth + 1).padStart(2, "0")}/${selectedYear}`;

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-0 m-0 transition-all duration-300 relative">
      {/* Toast Notifications - using imported component */}
      <Toastify />

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to download the report for the selected period and location?
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

      {/* Session Expired Modal */}
      {showExpired && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                <LogOut className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Session Expired</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your session has expired. Please log in again.</p>
            <div className="flex justify-end">
              <button
                onClick={redirectToLogin}
                className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      <CommonHeader 
        icon={<Package size={24} />}
        title="Item Return From Locations Summary Report" 
      />

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-md w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-center gap-6">
          {/* Period Picker */}
          <div className="flex flex-col w-full md:w-1/3 relative" ref={periodRef}>
            <input
              id="period"
              type="text"
              value={inputValue}
              readOnly
              onClick={handlePeriodClick}
              className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
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
              <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-3">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange("next")}
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
                      className={`text-center py-2 rounded-md cursor-pointer text-sm text-gray-700 dark:text-gray-300 ${
                        selectedMonth === index
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
          <div className="flex flex-col w-full md:w-1/3 relative" ref={locationRef}>
            <input
              id="location"
              type="text"
              value={selectedLocation?.locationName || "Please Select Location Id"}
              readOnly
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
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
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none ml-2">▾</span>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-hidden">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search locations"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                      <li
                        key={loc.locationId}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {loc.locationName}
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

        {/* Buttons */}
        <div className="flex justify-center mt-10 gap-6">
          <Tooltip content='Download'><button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={selectedMonth === -1 || loading}
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

export default ItemReturnFromLocationsSummaryReport;