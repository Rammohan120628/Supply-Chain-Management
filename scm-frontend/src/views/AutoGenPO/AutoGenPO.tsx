import { Card, Label } from "flowbite-react";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button, Modal, ModalHeader, ModalBody } from 'flowbite-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import SessionModal from "../SessionModal";
import { FaCalendarAlt } from "react-icons/fa";

export interface TableTypeDense {
  avatar?: any;
  name?: string;
  post?: string;
  pname?: string;
  teams: {
    id: string;
    color: string;
    text: string;
  }[];
  status?: string;
  statuscolor?: string;
  budget?: string;
  reqTransactionNo?: string;
  locationId?: string;
  locationName?: string;
}

const columnHelper = createColumnHelper<TableTypeDense>();

const AutoGeneratePO = () => {


  const [data, setData] = useState<TableTypeDense[]>([]);
  const [filteredData, setFilteredData] = useState<TableTypeDense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  
  const [saving, setSaving] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
    const [sessionExpired, setSessionExpired] = useState(false);
  
  const currentDate = new Date();
  const purchasePeriod = localStorage.getItem("purchasePeriod");


  // Replace ALL your postApiDate logic with this clean version:
const formatToYYYYMMDD = (dateString: string | null): string => {
  if (!dateString) return "";
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const [day, month, year] = parts;

  // Validate that it's DD-MM-YYYY format
  if (parseInt(day) >= 1 && parseInt(day) <= 31 && 
      parseInt(month) >= 1 && parseInt(month) <= 12) {
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }

  // Return original if not in expected format
  return dateString;
};
const postApiDate = formatToYYYYMMDD(purchasePeriod);
console.log("sdvfj",postApiDate)

 const formatPurchasePeriod = (periodString: string): string => {
    if (!periodString) return "No Period Set";
    
    try {
      const parts = periodString.split('-');
      if (parts.length !== 3) return periodString;
      
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthName = date.toLocaleString('default', { month: 'short' });
      return `${monthName} ${year}`;
    } catch (error) {
      setSessionExpired(true);

      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };// "Nov 2025"
  
  
  // Format for your API → 01-11-2025
  const apiDate = purchasePeriod;
  // Format for POST API → 2025-11-01
 

// Format for POST API → 2025-11-01 (YYYY-MM-DD)


  // Get token and user data
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");
  const entityId = localStorage.getItem("entity"); // From your login API response
const currencyId = localStorage.getItem("currencyId");

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item =>
        item.reqTransactionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  useEffect(() => {
    const fetchData = async () => {
       if (!token) {
      setSessionExpired(true);
      return;
    }
    setIsLoading(true);

  
      try {
        const response = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/loadLocReqForAutoPO/${apiDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
         if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
        if (response.data.success) {
          const apiData = response.data.data.map((item: any) => ({
            reqTransactionNo: item.reqTransactionNo || "-",
            locationId: item.locationId || "-",
            locationName: item.locationName || "-",
            teams: [{
              id: "1",
              color: "blue-600",
              text: (item.locationName?.[0] || "L").toUpperCase()
            }],
          }));
          setData(apiData);
          setFilteredData(apiData);
        }
      } catch (err: any) {
      setSessionExpired(true);

        console.error("API Error:", err.response?.data || err.message);
        toast.error("Failed to load data. Please try again.");
        setData([]);
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [apiDate, token]);

  // Handle button click to save table data
  const handleGeneratePO = async () => {
   if (!token) {
      setSessionExpired(true);
      return;
    }

    if (data.length === 0) {
      toast.error("No data available to generate purchase order");
      return;
    }

    setSaving(true);
    try {
      const requestBody = {
        periodStr: postApiDate,
        currencyId: currencyId,
        userFk: parseInt(userId),
        entityId: entityId
        
      };
console.log("Sending period:", postApiDate); // Should log: "2025-11-01"
      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/createAutoGeneratedPOProcess2",
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
       if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      if (response.data.success) {
        toast.success("Purchase Order generated successfully!");
        // Clear table data after successful generation
        setData([]);
        setFilteredData([]);
      } else {
        toast.error("Failed to generate Purchase Order: " + (response.data.message || "Unknown error"));
      }
    } catch (err: any) {
      setSessionExpired(true);

      console.error("Save API Error:", err.response?.data || err.message);
      toast.error("Error generating Purchase Order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const defaultColumns = [
    columnHelper.accessor("reqTransactionNo", {
      cell: (info) => (
        <div className="flex items-center space-x-2 p-1">
          <div className="truncate max-w-36">
            <h6 className="text-sm font-medium">{info.getValue()}</h6>
          </div>
        </div>
      ),
      header: () => <span>LocReq No</span>,
    }),
    columnHelper.accessor("locationId", {
      header: () => <span>Location Id</span>,
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
    columnHelper.accessor("locationName", {
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Your original content with proper scrollbar on mobile
let content = (
  <div className="space-y-4 w-full max-w-full mx-auto">
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 sm:p-4">
      <br className="hidden sm:block" />
      
      {/* FIXED: Grid with proper column handling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* FIXED: Use more columns for table container */}
        <div className="lg:col-span-9 xl:col-span-8 col-span-1 w-full">
          
          {/* Period Card and Button Row - Responsive */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:ml-0 xl:ml-70">
            {/* Period Card */}
            <Card className="bg-blue-50 border-l-8 border-blue-500 shadow-sm p-1.5 sm:p-2 md:p-3 h-auto min-h-[32px] sm:h-9 md:h-10 w-full sm:w-auto min-w-[120px] sm:min-w-[130px] md:w-70">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="p-1 sm:p-1.5 md:p-2 bg-blue-500 rounded-lg flex-shrink-0">
                  <FaCalendarAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-sm font-medium text-black dark:text-white truncate">
                    Period: <span className="font-bold text-black dark:text-white truncate">
                      {formatPurchasePeriod(purchasePeriod || '')}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Generate Button */}
            <Button
              type="button"
              onClick={handleGeneratePO}
              disabled={saving || data.length === 0}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-full p-2.5 sm:p-3 transition-colors duration-200 disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
            >
              {saving ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
          
          {/* Table Section - FIXED: Added proper scrollbar for mobile */}
        {/* Table Section - FIXED: Added proper scrollbar for mobile */}
<div className="w-full overflow-x-auto lg:overflow-x-visible">
  {/* FIXED: Removed fixed width that was causing issues */}
  <div className="min-w-[900px] lg:min-w-full ">
    
    {/* Search Header - Responsive */}
    <div className="flex flex-col  lg:ml-160 sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 ">
      <Label className="text-blue-600 dark:text-blue-400 text-base sm:text-lg font-semibold whitespace-nowrap">
      </Label>
      <input
        type="text"
        placeholder={`Search ${data.length} records...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control-input w-full  sm:w-auto sm:max-w-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
      />
    </div>
    
    <div className="pb-2"></div>
    
    {/* Table - FIXED: Added custom scrollbar styling */}
    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden w-[900px]">
      <div className="overflow-x-auto lg:overflow-x-visible scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        <table className="w-full table-auto">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-sm sm:text-base text-white dark:text-gray-100 whitespace-nowrap font-semibold text-left border-b border-gray-200 dark:border-gray-600 p-2 bg-blue-600 dark:bg-blue-800"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-8 sm:py-10 text-sm text-gray-600 dark:text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 sm:py-10 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? "No matching records found" : "No records found"}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap p-2 text-xs sm:text-sm text-gray-800 dark:text-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
        </div>
        
        {/* FIXED: Added empty columns for spacing on right side */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-4"></div>
      </div>
    </div>
    
    {/* Modal for messages - EXACTLY AS PROVIDED */}
    <Modal show={!!errorModal} onClose={() => setErrorModal(null)} size="md">
      <ModalHeader
        className={
          errorModal?.includes("success") || errorModal?.includes("Success")
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }
      >
        {errorModal?.includes("success") || errorModal?.includes("Success") ? "Success" : "Error"}
      </ModalHeader>
      <ModalBody className="bg-white dark:bg-gray-800">
        <p className="text-sm text-gray-800 dark:text-gray-300">{errorModal}</p>
      </ModalBody>
    </Modal>
  </div>
);

return (
  <>
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
    
    <div className="w-full max-w-full mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl text-indigo-700 whitespace-normal break-words">
          Generate Purchase Order
        </h1>
      </div>
      
      {content}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-lg shadow-xl flex items-center gap-3 mx-3">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}
      
      {sessionExpired && <SessionModal/>}
    </div>
  </>
);
};

export default AutoGeneratePO;