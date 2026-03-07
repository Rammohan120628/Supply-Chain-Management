import {

  Radio,
  Label,
} from "flowbite-react";
import { useState, useEffect } from "react";

import { FaInfoCircle } from "react-icons/fa";
import { Check, X } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
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

const DuplicateSupplierSelectionStock = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [showTable,] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLocations,] = useState(false);
  const [fromPeriod, setFromPeriod] = useState("");
  const [, setToPeriod] = useState("");
  const [noOfMonths, setNoOfMonths] = useState(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [duplicationType, setDuplicationType] = useState("all");
    const [sessionExpired, setSessionExpired] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
  const currentMonthValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    resetToDefault();
  }, []);

  const resetToDefault = () => {
    const stockPeriodStr = sessionStorage.getItem("stockPeriod");
    let initialFromDate: Date;
    let initialFromPeriod: string;

    if (stockPeriodStr) {
      const [, month, year] = stockPeriodStr.split('-').map(Number);
      initialFromDate = new Date(year, month - 1, 1);
      initialFromPeriod = initialFromDate.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    } else {
      initialFromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      initialFromPeriod = currentMonth;
    }

    setFromPeriod(initialFromPeriod);
    setFromDate(initialFromDate);

    // Default to current month
    const initialToDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    setToDate(initialToDate);
    setToPeriod(initialToDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    }));

    setDuplicationType("all");
    setNoOfMonths(0);
  };

  useEffect(() => {
    if (fromDate && toDate) {
      const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
                     (toDate.getMonth() - fromDate.getMonth());
      setNoOfMonths(months);
    }
  }, [fromDate, toDate]);

  const handleToPeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const [year, month] = value.split('-').map(Number);
      const newToDate = new Date(year, month - 1, 1);
      if (fromDate && newToDate.getTime() <= fromDate.getTime()) {
        toast.error("To period must be after From period.", { 
          duration: 3000, 
          position: 'top-right' 
        });
        return;
      }
      setToDate(newToDate);
      setToPeriod(newToDate.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }));
    }
  };

  const handleCheck = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select valid periods.", { 
        duration: 3000, 
        position: 'top-right' 
      });
      return;
    }

    if (noOfMonths <= 0) {
      toast.error("No of month should not be zero.", { 
        duration: 3000, 
        position: 'top-right' 
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }

    setLoading(true);

    const period = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-01`;
    const lastUpdate = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-01`;
    const aplPk = duplicationType === "all" ? 0 : 1;

    const payload = {
      period,
      lastUpdate,
      aplPk,
    };

    try {
      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm//periodClosingController/copyPurchasePeriodData",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Operation successful!", { 
          duration: 3000, 
          position: 'top-right' 
        });
        resetToDefault();
      } else {
        toast.error(response.data.message || "Operation failed.", { 
          duration: 3000, 
          position: 'top-right' 
        });
      }
    } catch (err) {
      toast.error("Error during operation. Please try again.", { 
        duration: 3000, 
        position: 'top-right' 
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    resetToDefault();
  };

  /* ────────────────────── RENDER ────────────────────── */
  let content;
  if (showTable) {
    // Table content
  } else {
    content = (
      <div className="space-y-4">
        {/* ── Main Container ── */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: From Period + No of Month */}
            <div className="space-y-4">
              {/* From Period */}
              <div className="relative">
                <input
                  id="fromPeriod"
                  type="text"
                  value={fromPeriod}
                  readOnly
                  className="form-control peer w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <label
                  htmlFor="fromPeriod"
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none
                          peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                          peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
                >
                  From Period
                </label>
              </div>
              
              {/* No of Month */}
              <div className="relative">
                <input
                  id="noOfMonths"
                  type="text"
                  value={noOfMonths}
                  readOnly
                  className="form-control peer w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <label 
                  htmlFor="noOfMonths"
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none
                          peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                          peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                          peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
                >
                  No of Month
                </label>
              </div>
            </div>
            
            {/* Right Column: To Period + Radio Buttons */}
            <div className="space-y-4">
              {/* To Period */}
              <div className="relative">
                <input
                  id="toPeriod"
                  type="month"
                  value={toDate ? `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}` : currentMonthValue}
                  onChange={handleToPeriodChange}
                  className="form-control peer w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <label
                  htmlFor="toPeriod"
                  className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none
                          peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                          peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
                >
                  To Period
                </label>
              </div>
              
              {/* Radio Buttons */}
              <div className="space-y-3 pt-1">
                <Label className="text-gray-700 dark:text-gray-300 font-medium">For</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Radio 
                      id="all" 
                      name="duplicationType" 
                      value="all" 
                      checked={duplicationType === "all"}
                      onChange={() => setDuplicationType("all")}
                      className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <Label htmlFor="all" className="text-gray-700 dark:text-gray-300 cursor-pointer">All</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio 
                      id="supplierItem" 
                      name="duplicationType" 
                      value="supplierItem" 
                      checked={duplicationType === "supplierItem"}
                      onChange={() => setDuplicationType("supplierItem")}
                      className="text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <Label htmlFor="supplierItem" className="text-gray-700 dark:text-gray-300 cursor-pointer">Only Supplier Item</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons (Check and Clear) */}
          <div className="flex justify-center gap-6 pt-8 mt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Check Button */}
            <button
              type="button"
              disabled={loading || loadingLocations}
              onClick={handleCheck}
              className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
                text-white p-3 rounded-full shadow-lg transition-all duration-300 
                flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
                ${loading || loadingLocations ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Check and process"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check size={20} />
              )}
            </button>

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900
                text-white p-3 rounded-full shadow-lg transition-all duration-300 
                flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Clear selection"
            >
              <X size={20} />
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                  INFO
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please ensure you have completed the tender process and duplicated supplier items for next month before closing the purchase period. If you close it, we can't revert the changes. Please check thoroughly before closing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl text-indigo-700 whitespace-nowrap">
          Duplicate Supplier Selection
        </h1>
      </div>

      {content}

      <Toaster
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
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
        }}
      />
                              {sessionExpired && <SessionModal/>}

    </>
  );
};

export default DuplicateSupplierSelectionStock;