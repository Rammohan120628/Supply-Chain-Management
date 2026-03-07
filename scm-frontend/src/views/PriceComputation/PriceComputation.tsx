import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, ModalBody, ModalFooter, Card, Tooltip, Badge, Button } from "flowbite-react";
import { FaSave, FaMapPin, FaChevronDown, FaCalendarAlt, FaBoxOpen } from "react-icons/fa";
import { HiInformationCircle, HiRefresh, HiSearch } from "react-icons/hi";
import SessionModal from "../SessionModal";

export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  status?: string;
  statuscolor?: string;
  budget?: string;
  name?: string;
  post?: string;
  pname?: string;
  isSelected?: boolean;
  totalQty?: string;
  quantities?: { [key: string]: string };
}

interface LocationItem {
  pk: number;
  id: number | null;
  locationId: string | null;
  locationName: string | null;
  period: string | null;
  category: string | null;
  reqNo: string | null;
  supplierId: string | null;
  supplierName: string | null;
  itemCode: string | null;
  itemName: string | null;
  conId: string | null;
  qtnReqNo: string | null;
  consolidationId: string | null;
  code: string | null;
  name: string;
  itemId: number;
  tranNo: string | null;
}

const PriceComputation = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [isLoading, setIsLoading] = useState(false);
  const [showProcessConfirm, setShowProcessConfirm] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationItem[]>([]);
  const [locationSearch, setLocationSearch] = useState("");
  const userFk = parseInt(localStorage.getItem('userId') || '0');
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  
  // Month Picker State
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const periodRef = useRef<HTMLDivElement>(null);
    const [sessionExpired, setSessionExpired] = useState(false);
  

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current && 
        !supplierDropdownRef.current.contains(event.target as Node) 
      ) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to format date for API (01-MM-YYYY with dashes)
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  // Function to format date for display (MM/YYYY)
  const formatDateForDisplay = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };

  // Parse tenderPeriod from localStorage (format: dd-mm-yyyy)
  const parseTenderPeriod = (tenderPeriod: string | null): { month: number | null, year: number | null } => {
    if (!tenderPeriod) return { month: null, year: null };
    
    try {
      const parts = tenderPeriod.split('-');
      if (parts.length >= 2) {
        const month = parseInt(parts[1], 10) - 1; // Convert to 0-based month
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(month) && !isNaN(year)) {
          return { month, year };
        }
      }
    } catch (error) {
      console.error('Error parsing tenderPeriod:', error);
    }
    
    return { month: null, year: null };
  };

  // Handler functions for month picker
  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
    setSelectedLocation(null);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    setSelectedLocation(null);
  };

  const isPeriodSelected = (index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  };

  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  // Get current period for API
  const getCurrentPeriod = (): string | null => {
    if (selectedMonth === null) return null;
    return formatDateForApi(selectedMonth, selectedYear);
  };

  /* ────────────────────── API CALLS ────────────────────── */
  // Fetch locations based on tender period
  useEffect(() => {
    const fetchLocations = async () => {
      const currentPeriod = getCurrentPeriod();
      if (!currentPeriod) return;

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      try {
        const { data } = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadConsolidationLocReqForNp/${currentPeriod}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (data.success) {
          setLocations(data.data);
          setFilteredLocations(data.data);
        } else {
          toast.error(data.message || "Failed to fetch locations.");
        }
      } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      }
    };
    
    if (selectedMonth !== null) {
      fetchLocations();
    }
  }, [selectedMonth, selectedYear]);

  // Initial setup from localStorage
  useEffect(() => {
    const tenderPeriod = localStorage.getItem("tenderPeriod");
    
    if (tenderPeriod) {
      const { month, year } = parseTenderPeriod(tenderPeriod);
      
      if (month !== null && year !== null) {
        setSelectedMonth(month);
        setSelectedYear(year);
        return;
      }
    }
    
    // Fallback to current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, []);

  /* ────────────────────── PROCESS BUTTON API CALL ────────────────────── */
  const handleProcessButton = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location first.", { duration: 3000, position: 'top-right' });
      return;
    }

    if (selectedMonth === null) {
      toast.error("Please select a period first.", { duration: 3000, position: 'top-right' });
      return;
    }

    if (!userFk || userFk === 0) {
      toast.error("User ID not found. Please log in again.", { duration: 3000, position: 'top-right' });
      return;
    }

    setShowProcessConfirm(true);
  };

  const performProcess = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found. Please log in.", { duration: 3000, position: 'top-right' });
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/updateNNPrice/${selectedLocation.name}/${userFk}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (data.success) {
        toast.success(data.message || "Process completed successfully!", { duration: 3000, position: 'top-right' });
        // Reset to default states on success
        setSelectedLocation(null);
        setLocationSearch("");
        setIsLocationDropdownOpen(false);
        setSelectedMonth(null);
        setSelectedYear(new Date().getFullYear());
        setLocations([]);
        setFilteredLocations([]);
      } else {
        toast.error(data.message || "Process failed.", { duration: 3000, position: 'top-right' });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error processing request. Please try again.";
      toast.error(errorMessage, { duration: 3000, position: 'top-right' });
      console.error(err);
    } finally {
      setIsLoading(false);
      setShowProcessConfirm(false);
    }
  };

  /* ────────────────────── FILTER LOCATIONS ────────────────────── */
  useEffect(() => {
    if (locationSearch.trim() === "") {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location =>
        location.name?.toLowerCase().includes(locationSearch.toLowerCase()) ||
        location.locationName?.toLowerCase().includes(locationSearch.toLowerCase()) ||
        location.supplierName?.toLowerCase().includes(locationSearch.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [locationSearch, locations]);

  const refresh = () => {
    setSelectedLocation(null);
    setLocationSearch("");
    setIsLocationDropdownOpen(false);
    setSelectedMonth(null);
    setSelectedYear(new Date().getFullYear());
    setLocations([]);
    setFilteredLocations([]);
    setPeriodOpen(false);
  };

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header with title and quick tips */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">           <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400">
              Price Computation
            </h1>
              <Tooltip
                            content={
                              <div className="text-xs max-w-xs">
                                 <p className="font-semibold mb-1">Quick Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Select a period (month/year) from the calendar</li>
                    <li>Choose a consolidation location from the dropdown</li>
                    <li>Click the process button to compute prices</li>
                  </ol>
                              </div>
                            }
                            placement="bottom"
                            className="dark:bg-gray-800 dark:text-white z-50"
                          >
                            <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                              <HiInformationCircle className="w-5 h-5" />
                            </button>
                          </Tooltip>
          </div>
          <div className="flex gap-2">
            <Tooltip content="Refresh page" placement="bottom" className="dark:bg-gray-800 dark:text-white">
              <button
                onClick={refresh}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all duration-200 hover:scale-110"
              >
                <HiRefresh className="w-4 h-4 text-white" />
              </button>
            </Tooltip>
          </div>
        </div>
        </div>

        {/* Main Card */}
        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Period Picker (styled as dropdown) */}
              <div ref={periodRef} className="relative w-full sm:w-64">
                <Tooltip
                  content="Select the tender period"
                  placement="top"
                  className="dark:bg-gray-800 dark:text-white z-50"
                >
                  <button
                    onClick={() => setPeriodOpen(!periodOpen)}
                    className={`w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                      selectedMonth !== null
                        ? 'border-blue-500 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`p-1 rounded-full ${selectedMonth !== null ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <FaCalendarAlt className={`w-3.5 h-3.5 ${selectedMonth !== null ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <span className={`text-xs font-medium truncate ${selectedMonth !== null ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {displayValue}
                      </span>
                    </div>
                    <FaChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        periodOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </Tooltip>

                {periodOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleYearChange("prev")}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-base">{selectedYear}</span>
                        <button
                          onClick={() => handleYearChange("next")}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-3">
                      {periodOptions.map((option, index) => (
                        <button
                          key={option}
                          onClick={() => handlePeriodSelect(index)}
                          className={`text-center py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-xs ${
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

              {/* Location Dropdown */}
              <div ref={supplierDropdownRef} className="relative w-full sm:w-80">
                <Tooltip
                  content="Select a consolidation location"
                  placement="top"
                  className="dark:bg-gray-800 dark:text-white z-50"
                >
                  <button
                    onClick={() => {
                      if (selectedMonth !== null) {
                        setIsLocationDropdownOpen(!isLocationDropdownOpen);
                      } else {
                        toast.error("Please select a period first.", { duration: 3000, position: 'top-right' });
                      }
                    }}
                    className={`w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                      selectedLocation
                        ? 'border-blue-500 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`p-1 rounded-full ${selectedLocation ? 'bg-blue-100 dark:bg-blue-300' : 'bg-blue-100 dark:bg-blue-300'}`}>
                        <FaBoxOpen className={`w-3.5 h-3.5 ${selectedLocation ? 'text-blue-600' : 'text-blue-500'}`} />
                      </div>
                      <div className="truncate text-left">
                        <span className={`text-xs font-medium truncate ${selectedLocation ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                          {selectedLocation?.name || "Select Consolidation"}
                        </span>
                        {selectedLocation?.locationName && (
                          <span className="block text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {selectedLocation.locationName}
                          </span>
                        )}
                      </div>
                    </div>
                    <FaChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        isLocationDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </Tooltip>

                {isLocationDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search locations..."
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {/* "Please select" option */}
                      <div
                        className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                        onClick={() => {
                          setSelectedLocation(null);
                          setIsLocationDropdownOpen(false);
                          setLocationSearch("");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 flex items-center justify-center">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>                  
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Please select</div>
                        </div>
                      </div>

                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location) => (
                          <div
                            key={location.pk}
                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                            onClick={() => {
                              setSelectedLocation(location);
                              setIsLocationDropdownOpen(false);
                              setLocationSearch("");
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  selectedLocation?.pk === location.pk
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                                }`}>
                                  <span className="text-xs">{location.pk}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {location.name}
                                  </div>
                                  {location.locationName && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {location.locationName}
                                    </div>
                                  )}
                                  {location.supplierName && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      Supplier: {location.supplierName}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {selectedLocation?.pk === location.pk && (
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <div className="text-4xl mb-2">🔍</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedMonth !== null ? "No locations found for this period" : "Select a period first"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-500 text-center">
                        {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Process Button */}
              <div className="flex items-center justify-center">
                <Tooltip
                  content={
                    isLoading ? "Processing..." :
                    selectedMonth === null ? "Select period first" :
                    !selectedLocation ? "Select Consolidation first" :
                    "Process price computation"
                  }
                  placement="top"
                  className="dark:bg-gray-800 dark:text-white z-50"
                >
                  <button
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isLoading || selectedMonth === null || !selectedLocation
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 hover:scale-110 shadow-lg'
                    }`}
                    onClick={handleProcessButton}
                    disabled={isLoading || selectedMonth === null || !selectedLocation}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 5.5L14 12L7 18.5V5.5Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 5.5L22 12L15 18.5V5.5Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Optional summary badge */}
      
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showProcessConfirm} onClose={() => setShowProcessConfirm(false)} size="md">
        <ModalBody className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div className="flex items-center justify-center text-4xl sm:text-6xl text-blue-500 mb-4">
              <FaSave />
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to process this?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center">
          <Button
            color="success"
            onClick={performProcess}
            disabled={isLoading}
            className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm dark:bg-green-700 dark:hover:bg-green-800"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                <span className="text-xs sm:text-sm">Processing...</span>
              </>
            ) : (
              "Process"
            )}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowProcessConfirm(false)}
            disabled={isLoading}
            className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

              {sessionExpired && <SessionModal />}
      

      {/* Toaster */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            background: '#363636',
            color: '#fff',
            zIndex: 999999,
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
          duration: 2000,
        }}
      />

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default PriceComputation;