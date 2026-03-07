import { Breadcrumb, Button, Card, Tooltip } from "flowbite-react";
import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from 'flowbite-react';
import { HiViewList, HiUser, HiTruck, HiReceiptTax, HiCalendar, HiHashtag, HiDocument, HiCash, HiTag } from 'react-icons/hi';
import { Icon } from '@iconify/react/dist/iconify.js';
import { HiBuildingStorefront } from "react-icons/hi2";
import { FaBoxOpen, FaCalendarAlt, FaMapMarkerAlt, FaReceipt, FaTruck, FaClipboardList, FaDollarSign, FaPercent, FaWeightHanging } from "react-icons/fa";
import SessionModal from "../SessionModal";
import { MdKeyboardArrowRight } from "react-icons/md";
import StockReceiveTable from "../StockReceive/StockReceiveTable";

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
  {
    id: 'serialNo',
    header: 'S.No',
    cell: (info: any) => <p className="text-black text-xs font-medium">{info.row.index + 1}</p>,
    size: 40,
  },
  columnHelper.accessor("itemId", {
    header: () => <span>Item</span>,
    cell: (info) => (
      <div className="min-w-[120px]">
        <h6 className="text-xs font-medium text-black">{info.getValue()}</h6>
        <p className="text-xs text-gray-600 break-all whitespace-normal hyphens-auto leading-tight">
          {info.row.original.itemName}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("packageId", {
    header: () => <span>Package Id</span>,
    cell: (info) => <p className="text-xs font-medium text-black">{info.getValue()}</p>,
  }),
  columnHelper.accessor("qty", {
    header: () => <span>QTY</span>,
    cell: (info) => (
      <p className="text-xs font-medium text-black">
        {info.getValue().toFixed(2)}
      </p>
    ),
  }),
  columnHelper.accessor("gp", {
    header: () => <span>GP</span>,
    cell: (info) => <p className="text-xs font-medium text-black">{info.getValue().toFixed(2)}</p>,
  }),
  columnHelper.accessor("cp", {
    header: () => <span>CP</span>,
    cell: (info) => <p className="text-xs font-medium text-black">{info.getValue().toFixed(2)}</p>,
  }),
  columnHelper.display({
    id: 'totalGp',
    header: () => <span>Total Gp</span>,
    cell: (info) => {
      const qty = info.row.original.qty;
      const gp = info.row.original.gp;
      const totalGp = qty * gp;
      return <p className="text-xs font-medium text-blue-600 text-right w-full">{totalGp.toFixed(2)}</p>;
    },
  }),
  columnHelper.accessor("discount", {
    header: () => <span>Total Disc.</span>,
    cell: (info) => <p className="text-xs font-medium text-green-600 text-right w-full">{info.getValue().toFixed(2)}</p>,
  }),
  columnHelper.display({
    id: 'totalCp',
    header: () => <span>Total CP</span>,
    cell: (info) => {
      const qty = info.row.original.qty;
      const cp = info.row.original.cp;
      const totalCp = qty * cp;
      return <p className="text-xs font-medium text-purple-600 text-right w-full">{totalCp.toFixed(2)}</p>;
    },
  }),
];

const StockReceiveInvoiceView2 = ({ rowData, onBack }: StockReceiveViewProps) => {
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
          return stringValue.includes(searchLower) || formattedValue.includes(searchLower);
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
      if (isNaN(date.getTime())) {
        return dateTimeStr;
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateTimeStr;
    }
  };

  const formatDateOnly = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return 'N/A';
    
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        return dateTimeStr;
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
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
    if (!periodString) return "N/A";
    
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

  const table = useReactTable({
    data: filteredTableData,
    columns: defaultColumns as any,
    getCoreRowModel: getCoreRowModel(),
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

  // Get stock period from localStorage
  const stockPeriod = localStorage.getItem("stockPeriod") || '';

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading detailed data...</p>
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
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          Try Again
        </button>
        <button 
          onClick={onBack}
          className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
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
    window.location.href = 'StockReceiveInvoice'; 

  };


  return (
  <div>
  {/* Header - Card-based layout */}
  <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm mb-3 p-3 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                  Invoice
                </span>
              </div>
            </Breadcrumb>
          </Breadcrumb>
        </div>
        
        <h1 className="text-base sm:text-lg md:text-xl text-indigo-700 font-bold whitespace-nowrap">
          Receive Item From Supplier
        </h1>
        <span className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-800 font-bold">- {viewData?.grnNo}</span>
      </div>
      
      <Tooltip content="Back" className="z-50 mt-1">
        <Button
          color="primary"
          size="xs"
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center"
          onClick={onBack}
        >
          <HiViewList className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </Button>
      </Tooltip>
    </div>

    {/* Top Information Cards - Only 2 cards as requested */}
    <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-5 mb-2 mt-1">
      {/* Top row with 5 mini cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        <Card className="border-l-8 border-purple-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-purple-500 rounded-lg">
              <FaReceipt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                Period: <span className="font-bold dark:text-white">{formatPurchasePeriod(viewData?.periodStr || '')}</span>
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="border-l-8 border-blue-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-blue-500 rounded-lg">
              <FaCalendarAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                GRN No: <span className="font-bold dark:text-white">{viewData?.grnNo || 'N/A'}</span>
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="border-l-8 border-emerald-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-emerald-500 rounded-lg">
              <FaTruck className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                PO Number: <span className="font-bold dark:text-white">{viewData?.poNumber || 'N/A'}</span>
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="border-l-8 border-blue-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-blue-500 rounded-lg">
              <FaCalendarAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                Delivery Date: <span className="font-bold">{viewData?.grnDateStr || 'N/A'}</span>
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="border-l-8 border-amber-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-amber-500 rounded-lg">
              <FaClipboardList className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                Del.Note: <span className="font-bold">{viewData?.delNote || 0}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Spacing */}
      <div className="h-2 sm:h-3 md:h-4"></div>
      <div className="h-2 sm:h-3 md:h-4"></div>
      
      {/* Two Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Supplier Information Card */}
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm">
          <div className="absolute -top-2.5 left-2 sm:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-1">
              <HiBuildingStorefront className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600" />
              <h2 className="text-[10px] sm:text-xs font-semibold text-black dark:bg-gray-800 dark:text-white">Supplier Information</h2>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 md:p-4 pt-4 sm:pt-5">
            {/* First row - 3 columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Supplier ID</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black">{viewData?.supplierId || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Supplier Name</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black break-words">
                  {viewData?.supplierName || 'N/A'}
                </p>
              </div>
            </div>
              
            {/* Second row - 3 columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Status</span>
                <p className="text-[10px] sm:text-[11px] md:text-sm font-medium text-black">{getInvoiceStatusBadge(viewData?.invStatusFk || 0)}</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Invoice No</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black">{viewData?.suppInvId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Our Group Invoice</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black">{viewData?.ourGrpInvNo || 'N/A'}</p>
              </div>
            </div>
            
            {/* Third row - 3 columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Created By</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black break-words">{viewData?.userId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Created Date</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black">{formatDateOnly(viewData?.createdDataTime)}</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Created Time</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black">
                  {viewData?.createdDataTime ? new Date(viewData.createdDataTime).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Location Card */}
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="absolute -top-2.5 left-2 sm:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-1 dark:bg-gray-800">
              <FaMapMarkerAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600" />
              <h2 className="text-[10px] sm:text-xs font-semibold text-black dark:bg-gray-800 dark:text-white">Delivery Location Information</h2>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 md:p-4 pt-4 sm:pt-5">
            {/* First row - 3 columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Location ID</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black">{viewData?.locId || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Location Name</span>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-black break-words">
                  {viewData?.locName || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Second row - 3 columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Currency ID</span>
                <p className="text-[10px] sm:text-[11px] md:text-sm font-medium text-black">{viewData?.currencyId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Currency Rate</span>
                <p className="text-[10px] sm:text-[11px] md:text-sm font-medium text-black">{viewData?.currencyValue?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Total Cost</span>
                <p className="text-[10px] sm:text-[11px] md:text-sm font-medium text-blue-600">{viewData?.totalGp?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            
            {/* Third row - 3 columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Net Invoice</span>
                <p className="text-[10px] sm:text-[11px] md:text-sm text-violet-600 font-medium">{viewData?.netInvoice?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 block">Discount</span>
                <p className="text-[10px] sm:text-[11px] md:text-sm text-green-600 font-medium">{viewData?.discAmount?.toFixed(2) || '0.00'}</p>
              </div>
              <div></div> {/* Empty div for spacing */}
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-2 sm:h-3 md:h-4"></div>
      
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-2">
          <div>
            <div className="flex items-center gap-1 sm:gap-2">
              <FaBoxOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600" />
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                Total Items: <span className="font-semibold text-blue-600">{tableData.length}</span>
                {searchTerm && filteredTableData.length !== tableData.length && (
                  <> (Filtered: <span className="font-semibold text-blue-600">{filteredTableData.length}</span>)</>
                )}
              </p>
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${tableData.length} records...`}
                className="w-full sm:w-48 md:w-56 px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-md text-[9px] sm:text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1.5 sm:right-2 top-1 sm:top-1.5 text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="mdi:close" className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm mt-1">
          <div className="overflow-auto max-h-[250px] sm:max-h-[300px] md:max-h-[350px]">
            <div className="min-w-[800px] lg:min-w-full">
              <table className="w-full text-[9px] sm:text-[10px] md:text-xs divide-y divide-gray-200">
                <thead className="sticky top-0">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-blue-600">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 md:py-2 text-left font-medium text-white uppercase text-[8px] sm:text-[9px] md:text-[10px] tracking-wider whitespace-nowrap"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 whitespace-nowrap">
                            <div className="leading-tight">
                              <span className="text-[9px] sm:text-[10px] md:text-xs">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={defaultColumns.length} className="px-2 sm:px-3 py-4 sm:py-5 md:py-6 text-center">
                        <div className="flex flex-col items-center">
                          <Icon icon="mdi:package-variant-empty" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-300 mb-1" />
                          <p className="text-gray-500 text-[9px] sm:text-[10px] md:text-xs">
                            {searchTerm ? 'No items found matching your search' : 'No item details available'}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="mt-1 text-[8px] sm:text-[9px] md:text-xs text-blue-600 hover:text-blue-800"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    {sessionExpired && <SessionModal />}
  </div>
</div>
  );
};

export default StockReceiveInvoiceView2;