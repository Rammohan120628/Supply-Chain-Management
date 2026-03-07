import {
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import SessionModal from "../SessionModal";

const DuplicateSupplierItemTender = () => {
  const [showTable] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocations] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
  
  const purchasePeriod = localStorage.getItem("purchasePeriod");
  
  const parsePurchasePeriod = () => {
    if (!purchasePeriod) {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      return {
        display: `${month}/${year}`,
        apiFormat: `${year}-${month}-01`
      };
    }
    
    const parts = purchasePeriod.split('-');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return {
        display: `${month}/${year}`,
        apiFormat: `${year}-${month}-${day}`
      };
    }
    
    return {
      display: purchasePeriod,
      apiFormat: purchasePeriod
    };
  };

  const fromPeriodData = parsePurchasePeriod();
  const [fromPeriod] = useState(fromPeriodData.display);
  const [fromPeriodApi] = useState(fromPeriodData.apiFormat);
  
  const [toPeriodOpen, setToPeriodOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const toPeriodRef = useRef<HTMLDivElement>(null);
  
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const getFromPeriodMonth = () => {
    const parts = fromPeriod.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) - 1;
    }
    return new Date().getMonth();
  };

  const getFromPeriodYear = () => {
    const parts = fromPeriod.split('/');
    if (parts.length === 2) {
      return parseInt(parts[1], 10);
    }
    return new Date().getFullYear();
  };

  const fromPeriodMonth = getFromPeriodMonth();
  const fromPeriodYear = getFromPeriodYear();

  useEffect(() => {
    setSelectedMonth(fromPeriodMonth);
    setSelectedYear(fromPeriodYear);
  }, [fromPeriodMonth, fromPeriodYear]);

  // Updated: Allow same month as fromPeriod
  const getAvailableMonths = (year: number) => {
    const availableMonths = [];
    
    for (let i = 0; i < 12; i++) {
      if (year > fromPeriodYear || (year === fromPeriodYear && i >= fromPeriodMonth)) {
        availableMonths.push({
          index: i,
          name: months[i],
          year: year
        });
      }
    }
    
    return availableMonths;
  };

  const formatToPeriodForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${year}-${formattedMonth}-01`;
  };

  const formatToPeriodForDisplay = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };

  const handleToPeriodSelect = (monthIndex: number, year: number) => {
    setSelectedMonth(monthIndex);
    setSelectedYear(year);
    setToPeriodOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    
    const availableMonths = getAvailableMonths(newYear);
    if (selectedMonth !== null && !availableMonths.some(m => m.index === selectedMonth)) {
      setSelectedMonth(null);
    }
  };

  const handleCopyTenderData = async () => {
    if (selectedMonth === null) {
      toast.error("Please select a To Period");
      return;
    }

    const toPeriodApi = formatToPeriodForApi(selectedMonth, selectedYear);
    
    const requestBody = {
      period: fromPeriodApi,
      endDate: toPeriodApi
    };

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
        if (!token) {
      setSessionExpired(true);
      return;
    }
      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/periodClosingController/copyTenderPeriodData",
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Tender period data copied successfully");
      } else {
        toast.error(response.data.message || "Failed to copy tender data");
      }
    } catch (error: any) {
      console.error("Error copying tender data:", error);
      toast.error(error.response?.data?.message || "An error occurred while copying tender data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedMonth(fromPeriodMonth);
    setSelectedYear(fromPeriodYear);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toPeriodRef.current && !toPeriodRef.current.contains(event.target as Node)) {
        setToPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let content;
  if (showTable) {
    content = null;
  } else {
    content = (
      <div className="space-y-4">
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
            duration: 3000,
          }}
        />
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
          <div className="grid grid-cols-1 ml-31 md:grid-cols-2 gap-2">
            
            <div className="relative">
              <input
                id="fromPeriod"
                type="text"
                value={fromPeriod}
                readOnly
                className="form-control peer w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
              <label
                htmlFor="fromPeriod"
                className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none
                          peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 
                          peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                          peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
              >
                From Period
              </label>
            </div>
            
            <div className="relative" ref={toPeriodRef}>
              <div className="relative">
                <input
                  type="text"
                  value={selectedMonth !== null ? formatToPeriodForDisplay(selectedMonth, selectedYear) : ""}
                  readOnly
                  onClick={() => setToPeriodOpen(!toPeriodOpen)}
                  className="form-control peer w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 cursor-pointer focus:outline-none focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="toPeriod"
                  className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none
                            peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 
                            peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                            peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
                >
                  To Period <sup className='text-red-600'>*</sup>
                </label>
              </div>
              
              {toPeriodOpen && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 p-3 w-80">
                  <div className="flex justify-between items-center mb-4">
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
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => {
                      const isAvailable = selectedYear > fromPeriodYear || 
                                        (selectedYear === fromPeriodYear && index >= fromPeriodMonth); // Changed >= instead of >
                      const isSelected = selectedMonth === index;
                      
                      return (
                        <button
                          key={`${month}-${index}`}
                          onClick={() => isAvailable && handleToPeriodSelect(index, selectedYear)}
                          disabled={!isAvailable}
                          className={`text-center py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-xs ${
                            isSelected
                              ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg transform scale-105"
                              : !isAvailable
                              ? "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md bg-white dark:bg-gray-800"
                          }`}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                    {getAvailableMonths(selectedYear).length > 0 
                      ? "Select a month same as or after From Period"
                      : "No available months in this year"}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center gap-6 pt-8 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCopyTenderData}
              disabled={loading || loadingLocations || selectedMonth === null}
              className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
                text-white p-3 rounded-full shadow-lg transition-all duration-300 
                flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
                ${loading || loadingLocations || selectedMonth === null ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Copy tender data"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900
                text-white p-3 rounded-full shadow-lg transition-all duration-300 
                flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl text-indigo-700 whitespace-nowrap">
          Duplicate Supplier Item
        </h1>
      </div>

      {content}

      <Modal show={!!errorModal} onClose={() => setErrorModal(null)} size="md">
        <ModalHeader
          className={
            errorModal?.includes("success")
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {errorModal?.includes("success") ? "Success" : "Error"}
        </ModalHeader>
        <ModalBody>
          <p className="text-sm">{errorModal}</p>
        </ModalBody>
      </Modal>
                                    {sessionExpired && <SessionModal/>}
      
    </>
  );
};

export default DuplicateSupplierItemTender;



