import {
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import { Check, X } from "lucide-react";
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

const StockPeriodClosing = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [showTable] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocations] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

  const [approvalData, setApprovalData] = useState<{
    canClose: boolean;
    warningMessage: string;
    success: boolean;
    message: string;
  } | null>(null);
  const stockPeriod = localStorage.getItem("stockPeriod");

  const formatPurchasePeriod = (periodString: string): string => {
    if (!periodString) return "No Period Set";
    
    try {
      const parts = periodString.split('-');
      if (parts.length !== 3) return periodString;
      
      // const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      const formattedMonth = month.padStart(2, '0');
      return `${formattedMonth}/${year}`;
    } catch (error) {
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };

  // Function to check stock closing approval - GET method
  const checkStockClosingApproval = async () => {
    if (!stockPeriod) {
      toast.error("No stock period found");
      return;
    }

    // Convert stock period format from "dd-mm-yyyy" to "yyyy-mm-dd"
    const convertPeriodFormat = (period: string): string => {
      const parts = period.split('-');
      if (parts.length !== 3) return period;
      
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      return `${year}-${month}-${day}`;
    };

    const formattedPeriod = convertPeriodFormat(stockPeriod);
    const token = localStorage.getItem("authToken");
    
  if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      setCheckLoading(true);
      
      const response = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/periodClosingController/getStockClosingApproval?period=${formattedPeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success === false) {
        setApprovalData({
          canClose: false,
          warningMessage: response.data.message || "",
          success: false,
          message: response.data.message || ""
        });
      } else {
        setApprovalData({
          canClose: true,
          warningMessage: "",
          success: true,
          message: response.data.message || ""
        });
      }
    } catch (error: any) {
      console.error("Error checking stock closing approval:", error);
      setApprovalData({
        canClose: false,
        warningMessage: "",
        success: false,
        message: ""
      });
      toast.error("Failed to check stock closing approval");
    } finally {
      setCheckLoading(false);
    }
  };

  // Function to close stock period - POST method
  const handleCloseStockPeriod = async () => {
    if (!stockPeriod || !approvalData?.canClose) {
      toast.error("Cannot close stock period");
      return;
    }

    const convertPeriodFormat = (period: string): string => {
      const parts = period.split('-');
      if (parts.length !== 3) return period;
      
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      return `${year}-${month}-${day}`;
    };

    const formattedPeriod = convertPeriodFormat(stockPeriod);
    const requestBody = {
      period: formattedPeriod
    };

    const token = localStorage.getItem("authToken");
    
     if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/periodClosingController/closeStockPeriod",
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Stock period closed successfully");
        await checkStockClosingApproval();
      } else {
        toast.error(response.data.message || "Failed to close stock period");
      }
    } catch (error: any) {
      console.error("Error closing stock period:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          toast.error(error.response.data?.message || "Failed to close stock period");
        } else if (error.request) {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error("An error occurred while closing stock period");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    toast.success("Clear functionality not implemented");
  };

  // Check approval status on component mount
  useEffect(() => {
    if (stockPeriod) {
      checkStockClosingApproval();
    }
  }, [stockPeriod]);

  /* ────────────────────── RENDER ────────────────────── */
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
        
        {/* ── Main Container ── */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
          {/* Centered input with badges */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="relative mt-2 ml-">
                <input
                  id="companyname"
                  type="text"
                  value={formatPurchasePeriod(stockPeriod || '')}
                  placeholder=" "
                  className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  required
                  readOnly
                />
                <label 
                  htmlFor="companyname"
                  className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
                            peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                            peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                            peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
                >
                  Stock Period
                </label>
              </div>


             
              
              {/* Show loading while checking approval */}
          
              
              {/* Badges container centered under the input */}
             
            </div>
          </div>
   <div className="flex items-start gap-3 bg-blue-100 p-4 mt-4">
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
          {/* Info Section - ALWAYS SHOWS */}
             {checkLoading && (
                <div className="text-center mt-4">
                  <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 mt-2">Checking stock closing approval...</p>
                </div>
              )}
              
              {/* Warning Message Section - Only show when API returns warning message */}
              {!checkLoading && approvalData && !approvalData.canClose && approvalData.warningMessage && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-yellow-500 dark:text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                    WARNThese are the GRN's and RET with no Invoice ID and Cr. Note No.,.{approvalData.warningMessage}
                      </p>
                      {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                        {approvalData.warningMessage}
                      </p> */}
                    </div>
                  </div>
                </div>
              )}
               <div className="flex justify-center gap-4 mt-6">
                {/* Buttons container - Only show check button if canClose is true */}
                <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!checkLoading && approvalData?.canClose && (
                    <button
                      type="button"
                      onClick={handleCloseStockPeriod}
                      disabled={loading || loadingLocations || !stockPeriod}
                      className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
                        text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
                        flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
                        ${loading || loadingLocations || !stockPeriod ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Close stock period"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Check size={20} />
                      )}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleClearSelection}
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
      
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl text-indigo-700 whitespace-nowrap">
          Stock Period Close
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

export default StockPeriodClosing;