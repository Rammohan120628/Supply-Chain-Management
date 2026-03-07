
import { useState, useEffect } from "react";

import { FaInfoCircle } from "react-icons/fa";
import { Check, X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
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

const PurchasePeriodClosing = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [showTable, ] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, ] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

  const purchasePeriodStr = localStorage.getItem("purchasePeriod");
  
  let periodDate: Date;
  let requestPeriod: string;
  
  if (purchasePeriodStr) {
    const [day, month, year] = purchasePeriodStr.split('-').map(Number);
    periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  } else {
    periodDate = new Date();
    requestPeriod = periodDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  }

  useEffect(() => {
    if (!purchasePeriodStr) {
      toast.error("Purchase period not found in localStorage.", { 
        duration: 3000, 
        position: 'top-right' 
      });
    }
  }, [purchasePeriodStr]);

  /* ────────────────────── HANDLERS ────────────────────── */
  const handleClosePeriod = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
     if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      const { data } = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/periodClosingController/closePurchasePeriod",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message || "Purchase period closed successfully!", { 
          duration: 3000, 
          position: 'top-right' 
        });
      } else {
        toast.error(data.message || "Failed to close purchase period.", { 
          duration: 3000, 
          position: 'top-right' 
        });
      }
    } catch (err) {
      toast.error("Error closing purchase period. Please try again.", { 
        duration: 3000, 
        position: 'top-right' 
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      {/* Centered input with badges */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="relative">
            <input
              id="requestPeriod"
              type="text"
              value={requestPeriod}
              readOnly
              className="form-control peer w-full px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            />
            <label
              htmlFor="requestPeriod"
              className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none
                        peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                        peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
            >
              Purchase Period
            </label>
          </div>
          
          {/* Badges container centered under the input */}
          <div className="flex justify-center gap-4 mt-6">
            {/* Save Badge with tick icon */}
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                disabled={loading || loadingLocations}
                onClick={handleClosePeriod}
                className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
                  text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
                  flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
                  ${loading || loadingLocations ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Close period"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check size={16} />
                )}
              </button>

              <button
                type="button"
                className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900
                  text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
                  flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section - like in the image */}
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
          Purchase Period Close
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

export default PurchasePeriodClosing;