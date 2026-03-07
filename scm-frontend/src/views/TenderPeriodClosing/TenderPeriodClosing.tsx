import {
  Modal,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { FaInfoCircle } from "react-icons/fa";
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

const TenderPeriodClosing = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [showTable] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocations] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
  
  const tenderPeriod = localStorage.getItem("tenderPeriod");

  const parsePurchasePeriod = () => {
    if (!tenderPeriod) {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      return {
        display: `${month}/${year}`,
        apiFormat: `${year}-${month}-01`
      };
    }
    
    const parts = tenderPeriod.split('-');
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
      display: tenderPeriod,
      apiFormat: tenderPeriod
    };
  };

  const fromPeriodData = parsePurchasePeriod();
  const [fromPeriod] = useState(fromPeriodData.display);
  // const [fromPeriodApi] = useState(fromPeriodData.apiFormat);

  /* ────────────────────── HANDLERS ────────────────────── */
  const handleCloseTenderPeriod = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
        if (!token) {
      setSessionExpired(true);
      return;
    }
      // Prepare request body (empty object as per your requirement)
      const requestBody = {};
      
      // Make API call
      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/periodClosingController/closeTenderPeriod",
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Tender period closed successfully");
      } else {
        toast.error(response.data.message || "Failed to close tender period");
      }
    } catch (error: any) {
      console.error("Error closing tender period:", error);
      toast.error(error.response?.data?.message || "An error occurred while closing tender period");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    // Clear any selection if needed
    toast.success("Selection cleared");
  };

  /* ────────────────────── RENDER ────────────────────── */
  let content;
  if (showTable) {
    // Table content
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
                  Tender Period
                </label>
              </div>
            </div>
            
            {/* Info message under the input */}
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
        
            
            
            {/* Badges container centered under the input */}
        
          </div>

          {/* Info Section */}
        
       
            {/* Badges container centered under the input */}
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Close Tender Period Button */}
                <button
                  type="button"
                  onClick={handleCloseTenderPeriod}
                  disabled={loading || loadingLocations}
                  className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
                    text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
                    flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
                    ${loading || loadingLocations ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Close tender period"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check size={16} />
                  )}
                </button>

                {/* Clear Button */}
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

          {/* Info Section */}
        
        </div>
      </div>
        
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl text-indigo-700 whitespace-nowrap">
          Tender Period Close
        </h1>
      </div>

      {content}

      {/* ── GLOBAL ERROR / SUCCESS MODAL ── */}
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

export default TenderPeriodClosing;