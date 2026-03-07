import { Label, Button, Card, Tooltip, Breadcrumb } from "flowbite-react";
import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from 'flowbite-react';
import { HiViewList, HiUser, HiHashtag, HiPhone, HiMail, HiClock } from 'react-icons/hi';
import { Icon } from '@iconify/react/dist/iconify.js';
import SessionModal from "../SessionModal";
import { HiBuildingStorefront } from "react-icons/hi2";
import { FaBoxOpen, FaCalendarAlt, FaMapMarkerAlt, FaReceipt, FaTruck } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

interface StockReceiveViewProps {
  rowData: {
    grnNo: string;
    [key: string]: any;
  };
  onBack: () => void;
}

// API Response Interface
export interface StockReceiveViewData {
  period: string | null;
  periodStr: string;
  grnNo: string;
  grnDate: string | null;
  grnDateStr: string;
  supplierId: string;
  supplierName: string;
  delNote: string;
  delNoteDate: string | null;
  delNoteDateStr: string;
  poNumber: string;
  locId: string;
  locName: string;
  discAmount: number;
  netInvoice: number;
  suppInvId: string;
  ourGrpInvNo: string;
  currencyValue: number;
  currencyId: string;
  invStatusFk: number;
  userId: string;
  createdDataTime: string | null;
  itemList: ItemDetail[];
  [key: string]: any;
}

export interface ItemDetail {
  itemId: number;
  itemName: string;
  packageId: string;
  qty: number;
  gp: number;
  cp: number;
  actInv: number;
  totalGp: number;
  discount: number;
  [key: string]: any;
}

const columnHelper = createColumnHelper<ItemDetail>();

const defaultColumns = [
  // Add Serial Number column
  columnHelper.display({
    id: 'serialNo',
    header: () => <span className="text-xs">Sl. No</span>,
    cell: (info) => <p className="text-xs text-black">{info.row.index + 1}</p>,
  }),
  columnHelper.accessor("itemName", {
    cell: (info) => (
      <div className="flex items-center space-x-1.5">
        <div>
          <p className="text-xs font-medium text-black">{info.row.original.itemId}</p>
          <h6 className="text-[10px] text-gray-600">{info.getValue()}</h6>
        </div>
      </div>
    ),
    header: () => <span className="text-xs">Item</span>,
  }),
  columnHelper.accessor("packageId", {
    header: () => <span className="text-xs">Package Id</span>,
    cell: (info) => <p className="text-xs text-black">{info.getValue()}</p>,
  }),
  columnHelper.accessor("qty", {
    header: () => <span className="text-xs text-right block w-full">QTY</span>,
    cell: (info) => <p className="text-xs text-black text-right w-full">{info.getValue().toFixed(2)}</p>,
  }),
  columnHelper.accessor("gp", {
    header: () => <span className="text-xs text-right block w-full">GP</span>,
    cell: (info) => <p className="text-xs text-black text-right w-full">{info.getValue().toFixed(2)}</p>,
  }),
  columnHelper.accessor("cp", {
    header: () => <span className="text-xs text-right block w-full">CP</span>,
    cell: (info) => <p className="text-xs text-black text-right w-full">{info.getValue().toFixed(2)}</p>,
  }),
  columnHelper.display({
    id: 'totalGp',
    header: () => <span className="text-xs text-right block w-full">Total GP</span>,
    cell: (info) => {
      const qty = info.row.original.qty;
      const gp = info.row.original.gp;
      const totalGp = qty * gp;
      return <p className="text-xs text-black text-right w-full">{totalGp.toFixed(2)}</p>;
    },
  }),
  columnHelper.accessor("discount", {
    header: () => <span className="text-xs text-right block w-full">Total Disc.</span>,
    cell: (info) => <p className="text-xs text-black text-right w-full">{info.getValue().toFixed(2)}</p>,
  }),
  columnHelper.display({
    id: 'totalCp',
    header: () => <span className="text-xs text-right block w-full">Total CP</span>,
    cell: (info) => {
      const qty = info.row.original.qty;
      const cp = info.row.original.cp;
      const totalCp = qty * cp;
      return <p className="text-xs text-black text-right w-full">{totalCp.toFixed(2)}</p>;
    },
  }),
];

const StockReceiveView = ({ rowData, onBack }: StockReceiveViewProps) => {
  const [viewData, setViewData] = useState<StockReceiveViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<ItemDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Filtered data based on search term
  const filteredTableData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    
    const searchLower = searchTerm.toLowerCase();
    return tableData.filter(item => 
      Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        const stringValue = String(value).toLowerCase();
        if (typeof value === 'number') {
          const formattedValue = value.toFixed(2).toLowerCase();
          const formattedValueNoDecimals = Math.round(value).toString().toLowerCase();
          return stringValue.includes(searchLower) || 
                 formattedValue.includes(searchLower) ||
                 formattedValueNoDecimals.includes(searchLower);
        }
        if (stringValue.includes('/') || stringValue.includes('-')) {
          return stringValue.includes(searchLower);
        }
        return stringValue.includes(searchLower);
      })
    );
  }, [tableData, searchTerm]);

  // Format date function
  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return dateTimeStr;
    }
  };

  // Get invoice status badge
const getInvoiceStatusBadge = (status: number) => {
  if (status === 0) {
    return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-200 text-black">
  <span className="rounded-full bg-amber-400 p-0.5">
    <svg className="w-3 h-3" fill="none" stroke="white" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 4h14M5 20h14M7 6v2a5 5 0 005 5 5 5 0 005-5V6M7 18v-2a5 5 0 015-5 5 5 0 015 5v2" />
    </svg>
  </span>
  Not Received
</span>
    );
  } else if (status === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-300 text-black">
        <span className="rounded-full bg-green-500 p-0.5">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        Received
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-black">
      <span className="rounded-full bg-gray-400 p-0.5">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      Pending
    </span>
  );
};

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
      return periodString;
    }
  };

  useEffect(() => {
    const fetchViewData = async () => {
      if (!rowData?.grnNo) {
        setError('GRN number is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setSessionExpired(true);
          return;
        }

        const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/viewGrn/${rowData.grnNo}`;
        
        console.log('Fetching view data from:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.status === 401) {
          setSessionExpired(true);
          return;
        }

        const result = await response.json();
        console.log('View API Response:', result);

        if (result.success && result.data) {
          setViewData(result.data);
          setTableData(result.data.itemList || []);
        } else {
          throw new Error(result.message || 'Failed to fetch view data');
        }
      } catch (err) {
        console.error('Error fetching view data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchViewData();
  }, [rowData]);

  const [columns] = useState(() => [...defaultColumns]);
  const [columnVisibility, setColumnVisibility] = useState({});
  
  const table = useReactTable({
    data: filteredTableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  // Calculate totals
  const calculateTotals = () => {
    if (!tableData || tableData.length === 0) {
      return {
        totalQuantity: 0,
        totalGpAmount: 0,
        totalCpAmount: 0,
        totalDiscount: 0,
        totalItems: 0
      };
    }

    return tableData.reduce((acc, item) => {
      const totalGp = (item.qty || 0) * (item.gp || 0);
      const totalCp = (item.qty || 0) * (item.cp || 0);
      
      return {
        totalQuantity: acc.totalQuantity + (item.qty || 0),
        totalGpAmount: acc.totalGpAmount + totalGp,
        totalCpAmount: acc.totalCpAmount + totalCp,
        totalDiscount: acc.totalDiscount + (item.discount || 0),
        totalItems: acc.totalItems + 1
      };
    }, {
      totalQuantity: 0,
      totalGpAmount: 0,
      totalCpAmount: 0,
      totalDiscount: 0,
      totalItems: 0
    });
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="text-black dark:text-gray-200 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 bg-red-50 rounded-md">
        <Icon icon="mdi:alert-circle-outline" className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-medium mb-2">Error loading detailed data</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  const handleCreationClick = () => {
    // Navigate to purchase order creation page
    // This could be a route or a function call
    if (onBack) {
      onBack(); // This goes back to the list
      // Then you might want to navigate to creation
      // window.location.href = '/purchase-order/create';
    }
  // Adjust this path as needed

  };
   const handleCreationClick1 = () => {
    // Navigate to purchase order creation page
    // This could be a route or a function call
    window.location.href = 'ReceiveItemFromSupplier'; 

  };

return (
  <div>
    {/* Header */}
    <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm mb-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="px-1 sm:px-2 pt-1 sm:pt-2 pb-1">
          <Breadcrumb 
            aria-label="Purchase order navigation" 
            className="text-[10px] sm:text-xs md:text-sm"
            theme={{
              base: "flex items-center",
              list: "flex items-center gap-1 sm:gap-2 flex-wrap",
            }}
          >
            <Breadcrumb 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleCreationClick1();
              }}
            >
              <div className="flex items-center">
                <MdKeyboardArrowRight className="mx-0.5 sm:mx-1 text-gray-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-[10px] sm:text-xs">
                  Creation
                </span>
              </div>
            </Breadcrumb>
         
            <Breadcrumb 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleCreationClick();
              }}
            >
              <div className="flex items-center">
                <MdKeyboardArrowRight className="mx-0.5 sm:mx-1 text-gray-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-[10px] sm:text-xs">
                  List
                </span>
              </div>
            </Breadcrumb>
              <h1 className="text-base sm:text-lg md:text-xl lg:text-xl text-start  text-indigo-700 whitespace-nowrap">
  Receive Item From Supplier
</h1>
          </Breadcrumb>
          
        </div>
          {/* <h1 className="text-xl text-indigo-700 lg:mr-125 whitespace-nowrap">
          Receive Item From Supplier
        </h1> */}

        <Tooltip content="Back" className="z-50">
          <Button
            color="primary"
            size="xs"
            className="w-8 h-8 sm:w-9   sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center"
            onClick={onBack}
          >
            <HiViewList className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
          </Button>
        </Tooltip>
      </div>

      {/* CARD 1: All Header Information */}
      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm mb-3">
        {/* Floating Heading */}
        <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-gray-800">
          {/* Empty div */}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 sm:gap-2 p-2">
          <Card className="border-l-8 border-purple-500 shadow-sm p-1 sm:p-2 h-8 sm:h-9">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-purple-500 rounded-lg">
                <FaReceipt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                  Period: <span className="font-bold">{formatPurchasePeriod(viewData?.periodStr || '')}</span>
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-8 border-blue-500 shadow-sm p-1 sm:p-2 h-8 sm:h-9">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-blue-500 rounded-lg">
                <FaCalendarAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                  GRN No: <span className="font-bold">{viewData?.grnNo || 'N/A'}</span>
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-8 border-emerald-500 shadow-sm p-1 sm:p-2 h-8 sm:h-9">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-emerald-500 rounded-lg">
                <FaTruck className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                  Po No: <span className="font-bold">{viewData?.poNumber || 'N/A'}</span>
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-8 border-amber-500 shadow-sm p-1 sm:p-2 h-8 sm:h-9">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-amber-500 rounded-lg">
                <FaBoxOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                  Del.Note: <span className="font-bold">{viewData?.delNote || 'N/A'}</span>
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="border-l-8 border-gray-500 shadow-sm p-1 sm:p-2 h-8 sm:h-9">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-violet-500 rounded-lg">
                <FaBoxOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                  Del.Date: <span className="font-bold">{viewData?.delNoteDateStr || 'N/A'}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="p-2 sm:p-3">
          {/* Row 2: Supplier Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {/* Supplier Card */}
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm">
              <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-1">
                  <FaTruck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                  <h2 className="text-[10px] sm:text-xs font-semibold text-black dark:text-white">Supplier Details</h2>
                </div>
              </div>
              
              <div className="p-2 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Supplier ID</span>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black dark:text-white">{viewData?.supplierId || 'N/A'}</p>
                    <p className="text-[8px] sm:text-[9px] md:text-[11px] text-gray-600 dark:text-white break-words">
                      {viewData?.supplierName || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Invoice No</span>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black dark:text-white">{viewData?.suppInvId || 'N/A'}</p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Group Inv No</span>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black dark:text-white">{viewData?.ourGrpInvNo || 'N/A'}</p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Inv Status</span>
                    <div className="text-[9px] sm:text-[10px] md:text-xs dark:text-white">{getInvoiceStatusBadge(viewData?.invStatusFk || 0)}</div>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Created By</span>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-medium break-all text-black dark:text-white">{viewData?.userId || 'N/A'}</p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Created Date</span>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black dark:text-white">{formatDateTime(viewData?.createdDataTime || null)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm">
              <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                  <h2 className="text-[10px] sm:text-xs font-semibold text-black dark:text-white">Delivery Location Details</h2>
                </div>
              </div>
              
              <div className="p-2 sm:p-3 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Location ID</span>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">{viewData?.locId || 'N/A'}</p>
                    <p className="text-[8px] sm:text-[9px] md:text-[11px] text-gray-600 dark:text-white break-words">
                      {viewData?.locName || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Currency</span>
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-black dark:text-white">{viewData?.currencyId || 'N/A'}</p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Currency Rate</span>
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-black dark:text-white">{viewData?.currencyValue?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Total Cost</span>
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-blue-700">{viewData?.netInvoice?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Discount</span>
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">{viewData?.discAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div className="bg--50 p-1 sm:p-1.5 rounded">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Net Invoice</span>
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-700">{viewData?.netInvoice?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Total Items */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2 sm:px-3 pb-2">
          <div className="text-[10px] sm:text-xs font-medium text-gray-700">
            Total Items: <span className="font-bold text-blue-600">{filteredTableData.length}</span>
          </div>
          <input
            type="text"
            placeholder="Search items..."
            className="w-full sm:w-40 md:w-48 px-2 py-1 border border-gray-300 rounded text-[10px] sm:text-xs focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded overflow-hidden mx-2 sm:mx-3 mb-2">
          <div className="overflow-auto max-h-[200px] sm:max-h-[220px] md:max-h-[250px]">
            <table className="w-full text-[9px] sm:text-[10px] md:text-xs">
              <thead className="sticky top-0 bg-blue-600 text-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-1 sm:px-2 py-1 sm:py-1.5 text-left font-medium whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-1 sm:px-2 py-1 sm:py-1.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-2 py-2 sm:py-3 text-center text-black text-[9px] sm:text-[10px] md:text-xs">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {sessionExpired && <SessionModal />}
    </div>
  </div>
);
};

export default StockReceiveView;