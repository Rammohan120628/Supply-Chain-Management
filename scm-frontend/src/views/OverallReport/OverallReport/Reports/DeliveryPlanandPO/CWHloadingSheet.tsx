import React, { useState, useRef, useEffect } from "react";
import {
  StickyNote,
  ArrowDownToLine,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react"
import { Tooltip} from "flowbite-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import SessionModal from "src/views/SessionModal";
import Toastify,{ showToast } from "src/views/Toastify";
import CommonHeader from "../../CommonHeader";

// --- Custom hook to detect dark mode (checks for 'dark' class on <html>) ---
const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const dark = document.documentElement.classList.contains("dark");
          setIsDark(dark);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

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

const CWHLoadingSheet: React.FC = () => {
  const now = dayjs();
  const isDark = useDarkMode();

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.month());
  const [selectedYear, setSelectedYear] = useState<number>(now.year());

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // --- Period boundaries ---
  const getPeriodBoundaries = () => {
    const periodStart = dayjs(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`);
    const periodEnd = periodStart.endOf('month');
    return { periodStart, periodEnd };
  };
  const { periodStart, periodEnd } = getPeriodBoundaries();

  // --- Auth ---
  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    return !!(token && userId);
  };
  const handleSessionExpired = () => setShowExpired(true);

  // --- Fetch Locations ---
  const fetchLocations = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    const token = localStorage.getItem("authToken");
    const period = `01-${String(selectedMonth + 1).padStart(2, "0")}-${selectedYear}`;

    try {
      const res = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController/dropDownPeriodBasedLocationIdByCwhLoadingReport/${period}`,
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

      if (!res.ok) throw new Error("Failed to fetch locations");

      const result: ApiResponse = await res.json();

      if (result.success) {
        showToast("Locations loaded successfully", "success");
        const apiLocations = result.data
          .filter((item) => item.code && item.name)
          .map((item: ApiLocationItem) => ({
            locationId: item.code,
            locationName: item.name,
          }));
        setLocations(apiLocations);
      } else {
        showToast(result.message || "Failed to load locations", "error");
        setLocations([]);
      }
    } catch (e) {
      console.error("Error fetching locations:", e);
      showToast("Failed to load locations", "error");
      setLocations([]);
      handleSessionExpired();
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!checkAuth()) handleSessionExpired();
  }, []);

  // --- Click outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) setDropdownOpen(false);
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) setPeriodOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filtered Locations ---
  const filteredLocations = locations.filter((loc) =>
    loc.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Period picker handlers ---
  const inputValue = `${String(selectedMonth + 1).padStart(2, "0")}/${selectedYear}`;
  const handlePeriodClick = () => setPeriodOpen(!periodOpen);
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriodOpen(false);
  };
  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  // --- Reset dates when period changes ---
  useEffect(() => {
    setFromDate(null);
    setToDate(null);
  }, [selectedMonth, selectedYear]);

  // --- Filename & request body (unchanged) ---
  const generateFileName = (): string => {
    const periodStr = `${String(selectedMonth + 1).padStart(2, "0")}-${selectedYear}`;
    let fileName = `CWHLoadingSheetReport_${periodStr}`;
    if (selectedLocationName) fileName += `_${selectedLocationName.replace(/\s+/g, '_')}`;
    if (fromDate) fileName += `_from_${fromDate.format('DD-MM-YYYY')}`;
    if (toDate) fileName += `_to_${toDate.format('DD-MM-YYYY')}`;
    return `${fileName}.pdf`;
  };

  const buildRequestBody = () => {
    const userIdStr = localStorage.getItem("userId");
    const period = `01-${String(selectedMonth + 1).padStart(2, "0")}-${selectedYear}`;
    const body: any = { period, userId: Number(userIdStr) };
    if (selectedLocationId?.trim()) body.locationId = selectedLocationId;
    if (fromDate?.isValid()) body.fromDate = fromDate.format("DD-MM-YYYY");
    if (toDate?.isValid()) body.toDate = toDate.format("DD-MM-YYYY");
    return body;
  };

  // --- Validations ---
  const validateDates = (): boolean => {
    if (fromDate?.isValid() && (fromDate.isBefore(periodStart) || fromDate.isAfter(periodEnd))) {
      showToast("From date must be within the selected period", "error");
      return false;
    }
    if (toDate?.isValid() && (toDate.isBefore(periodStart) || toDate.isAfter(periodEnd))) {
      showToast("To date must be within the selected period", "error");
      return false;
    }
    if (fromDate?.isValid() && toDate?.isValid() && fromDate.isAfter(toDate)) {
      showToast("From date must be before or equal to to date", "error");
      return false;
    }
    return true;
  };

  // --- API response handler ---
  const handleApiResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/pdf')) {
      const blob = await response.blob();
      if (blob.size < 100) throw new Error("Generated PDF is empty or invalid");
      return { type: 'pdf', blob };
    } else if (contentType?.includes('text/plain') || contentType?.includes('application/json')) {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || json.error || "Unknown error");
      } catch {
        throw new Error(text || "Unknown error");
      }
    } else {
      throw new Error("Unexpected response format");
    }
  };

  // --- Download PDF ---
  const handleDownload = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }
    if (!validateDates()) return;

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
      const res = await fetch(
        "http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController/listOfCwhLoadingSheetReport",
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
      const msg = error instanceof Error ? error.message : "Download failed";
      if (msg.toLowerCase().includes("no record") || msg.toLowerCase().includes("no data")) {
        showToast("No records found for the selected criteria", "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Clear Form ---
  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedLocationId("");
    setSelectedLocationName("");
    setSearchTerm("");
    setSelectedMonth(now.month());
    setSelectedYear(now.year());
  };

  // --- DatePicker slotProps – fully theme‑aware ---
  const datePickerSlotProps = {
    textField: {
      fullWidth: true,
      size: 'small' as const,
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '30px',
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
          py: 1.5,
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

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 p-2 sm:p-4">
      <Toastify />

      {/* Confirm Modal – refined styling */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Confirm Download
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to download the CWH Loading Sheet Report for the selected criteria?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleDownload();
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Preparing...</span>
                  </>
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
        title="CWH Loading Sheet Report"
        icon={<StickyNote className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
      />

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="space-y-5 sm:space-y-6">
            {/* Row 1: Period and Location – uniform "rectangle" styling */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Period Picker – floating label, rounded-lg, consistent spacing */}
              <div className="flex-1 relative" ref={periodRef}>
                <input
                  id="period"
                  type="text"
                  value={inputValue}
                  readOnly
                  onClick={handlePeriodClick}
                  className="peer w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-800 dark:text-gray-200 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer bg-white dark:bg-gray-700
                    hover:border-blue-400 transition-colors"
                />
                <label
                  htmlFor="period"
                  className="absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                            transition-all peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
                >
                  Period <sup className="text-red-600 text-sm">*</sup>
                </label>
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />

                {periodOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={() => handleYearChange("prev")}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedYear}
                      </span>
                      <button
                        onClick={() => handleYearChange("next")}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {months.map((month, index) => (
                        <div
                          key={month}
                          onClick={() => handleMonthSelect(index)}
                          className={`text-center py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                            selectedMonth === index
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
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

              {/* Location Dropdown – same style as period */}
              <div className="flex-1 relative" ref={locationRef}>
                <input
                  id="location"
                  type="text"
                  value={selectedLocationName || "Please Select Location Id"}
                  readOnly
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="peer w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-800 dark:text-gray-200 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer bg-white dark:bg-gray-700
                    hover:border-blue-400 transition-colors"
                />
                <label
                  htmlFor="location"
                  className="absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  Location Id
                </label>
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  ▾
                </span>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 max-h-60 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="text"
                        placeholder="Search locations"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700"
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
                              setSearchTerm("");
                            }}
                            className="px-4 py-2.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-gray-700 dark:text-gray-300"
                          >
                            {loc.locationName}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-sm">
                          No results found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: From Date and To Date – modern, period‑aware pickers with full theme support */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* From Date – opens to period month */}
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

              {/* To Date – cannot be before From Date */}
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

        {/* Buttons – same as reference */}
        {/* Buttons – updated UI same as reference */}
<div className="flex justify-center mt-8 sm:mt-10 gap-3 sm:gap-4 md:gap-6 pt-4">
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
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : (
      <ArrowDownToLine size={20} />
    )}
  </button></Tooltip>
<Tooltip content='Clear'>
  <button
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
  >
    <X size={20} />
  </button></Tooltip>
</div>

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

export default CWHLoadingSheet;