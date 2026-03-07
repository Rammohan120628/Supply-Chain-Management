import { Breadcrumb, Button, Card, Tooltip } from "flowbite-react";
import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { HiViewList, HiUser, HiReceiptTax, HiCalendar, HiHashtag, HiDocument, HiCash, HiTag } from 'react-icons/hi';
import { Icon } from '@iconify/react/dist/iconify.js';
import StockReceiveInvoiceView2 from "./StockReceiveInvoiceView2";
import { HiBuildingStorefront } from "react-icons/hi2";
import SessionModal from "../SessionModal";
import { FaBoxOpen, FaCalendarAlt, FaMapMarkerAlt, FaReceipt, FaTruck } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

export interface StockReceiveViewData {
  period: string | null;
  periodStr: string | null;
  grnNo: string | null;
  grnDate: string | null;
  grnDateStr: string | null;
  supplierId: string;
  supplierName: string;
  delNote: string | null;
  delNoteDate: string | null;
  poNumber: string | null;
  locId: string | null;
  locName: string | null;
  discAmount: number;
  netInvoice: number;
  suppInvId: string | null;
  ourGrpInvNo: string | null;
  delType: number;
  currencyValue: number;
  currencyId: string | null;
  entity: string;
  userFk: number;
  itemList: StockReceiveItem[];
  ourInvoiceNumber: string | null;
  supplierInvNo: string | null;
  supplierInvDate: string | null;
  vatAmount: number;
  discount: number;
  netInvValue: number;
  vatId: string | null;
  accountId: string | null;
  gross: number;
  vatPerc: number;
  vatAdjValue: number;
  vatAmountInside: number;
  net: number;
  itemCount: number;
  invoicePk: number;
  vatCode: string | null;
  invStatusFk: number;
  selectedOptions: string | null;
  userId: string;
  createdDataTime: string;
}

export interface StockReceiveItem {
  period: string | null;
  periodStr: string | null;
  grnNo: string;
  grnDate: string | null;
  grnDateStr: string | null;
  supplierId: string | null;
  supplierName: string | null;
  delNote: string;
  delNoteDate: string | null;
  supplierInvDate: string | null;
  poNumber: string;
  locId: string;
  locName: string;
  discAmount: number;
  netInvoice: number;
  suppInvId: string | null;
  ourGrpInvNo: string | null;
  delType: number;
  currencyValue: number;
  currencyId: string;
  entity: string;
  userFk: number;
  itemList: any[];
  poDetailPk: number;
  itemId: number;
  itemName: string | null;
  packageId: string | null;
  qty: number;
  gp: number;
  cp: number;
  actInv: number;
  qtyUnit: number;
  gpUnit: number;
  cpUnit: number;
  actInvUnit: number;
  ordQty: number;
  prQty: number;
  recvdQty: number;
  maxQty: number;
  invValue: number;
  orgInvValue: number;
  grossIncDisc: number;
  netAmount: number;
  ajdValue: number;
  totalGp: number;
  poGp: number;
  expDate: string | null;
  batchNo: string | null;
  binNo: string | null;
  ourInvoiceNumber: string | null;
  supplierInvNo: string | null;
  vatAmount: number;
  discount: number;
  netInvValue: number;
  vatId: string | null;
  accountId: string | null;
  gross: number;
  vatPerc: number;
  vatAdjValue: number;
  vatAmountInside: number;
  net: number;
  itemCount: number;
  invoicePk: number;
  vatCode: string | null;
  invStatusFk: number;
  selectedOptions: string | null;
  userId: string;
  createdDataTime: string;
}

interface StockReceiveInvoiceViewProps {
  rowData?: any;
  onBack: () => void;
}

const StockReceiveInvoiceView = ({ rowData, onBack }: StockReceiveInvoiceViewProps) => {
  const [selectedRow, setSelectedRow] = useState<StockReceiveItem | null>(null);
  const [viewData, setViewData] = useState<StockReceiveViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Extract data from rowData
  const ourInvoiceNumber = rowData?.ourInvoiceNumber || '';
  const supplierInvNo = rowData?.supplierInvNo || '';
  const supplierName = rowData?.supplierName || '';
  const supplierId = rowData?.supplierId || '';
  const gross = rowData?.gross || 0;
  const discount = rowData?.discount || 0;
  const netInvValue = rowData?.netInvValue || 0;
  const userId = rowData?.userId || '';
  const createdDataTime = rowData?.createdDataTime || '';
  const supplierInvDate = rowData?.supplierInvDateStr || '';
  
  // Get stock period from localStorage
  const stockPeriod = localStorage.getItem("stockPeriod") || '';
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
  // Fetch view data when component mounts
  useEffect(() => {
    if (ourInvoiceNumber) {
      fetchViewData(ourInvoiceNumber);
    }
  }, [ourInvoiceNumber]);

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
      setSessionExpired(true);
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };

  // Fetch view data from API
  const fetchViewData = async (invoiceNumber: string) => {
    if (!invoiceNumber) return;

    console.log('Fetching view data for invoice:', invoiceNumber);
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/viewInvoice/${invoiceNumber}`;
      
      console.log('View API URL:', apiUrl);
      
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
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('View API Response:', result);
      
      if (result.success && result.data) {
        setViewData(result.data);
        console.log('View data set:', result.data);
      } else {
        setError(result.message || 'Failed to fetch view data');
      }
    } catch (err) {
      setSessionExpired(true);
      console.error('Error fetching view data:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred while fetching view data');
      }
    } finally {
      setLoading(false);
    }
  };

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

  // Global search filter function
  const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
    const searchValue = filterValue.toLowerCase();
    
    // Search through all relevant fields
    const searchableFields = [
      row.original.locId,
      row.original.locName,
      row.original.grnNo,
      row.original.poNumber,
      row.original.delNote,
      row.original.delNoteDate,
      row.original.userId,
      row.original.totalGp?.toString(),
      row.original.discAmount?.toString(),
      row.original.netInvoice?.toString(),
      formatDateOnly(row.original.delNoteDate),
      formatDateTime(row.original.createdDataTime)
    ];
    
    return searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(searchValue)
    );
  };

  const defaultColumns = useMemo(() => [
    {
      id: 'serialNo',
      header: 'S.No',
      cell: (info: any) => <p className="text-black text-xs font-medium">{info.row.index + 1}</p>,
      size: 40,
    },
    {
      id: 'locId',
      header: 'Location',
      cell: (info: any) => (
        <div className="min-w-[100px]">
          <p className="text-xs font-medium text-black">{info.row.original.locId || 'N/A'}</p>
          <p className="text-xs text-gray-600">{info.row.original.locName || 'N/A'}</p>
        </div>
      ),
      size: 100,
    },
    {
      id: 'grnPo',
      header: 'GRN/PO No',
      cell: (info: any) => (
        <div className="min-w-[110px]">
          <p className="text-xs font-medium text-black">{info.row.original.grnNo || 'N/A'}</p>
          <p className="text-xs text-gray-600">{info.row.original.poNumber || 'N/A'}</p>
        </div>
      ),
      size: 120,
    },
    {
      id: 'delNote',
      header: 'Del Note No',
      cell: (info: any) => (
        <p className="text-xs font-medium text-black">
          {info.row.original.delNote || 'N/A'}
        </p>
      ),
      size: 90,
    },
    {
      id: 'delNoteDate',
      header: 'Supp.Del.Date',
      cell: (info: any) => (
        <p className="text-xs font-medium text-black">
          {formatDateOnly(info.row.original.delNoteDate) || 'N/A'}
        </p>
      ),
      size: 100,
    },
    {
      id: 'totalGp',
      header: 'Total Gp',
      cell: (info: any) => (
        <p className="text-xs font-medium text-blue-600 text-right w-full ">
          {Number(info.row.original.totalGp || 0).toFixed(2)}
        </p>
      ),
      size: 80,
    },
    {
      id: 'discAmount',
      header: 'Discount',
      cell: (info: any) => (
        <p className="text-xs font-medium text-blue-600 text-right w-full">
          {Number(info.row.original.discAmount || 0).toFixed(2)}
        </p>
      ),
      size: 80,
    },
    {
      id: 'netInvoice',
      header: 'Net Invoice',
      cell: (info: any) => (
        <p className="text-xs font-medium text-blue-600 text-right w-full">
          {Number(info.row.original.netInvoice || 0).toFixed(2)}
        </p>
      ),
      size: 90,
    },
    {
      id: 'userId',
      header: 'Created By',
      cell: (info: any) => (
        <div className="min-w-[110px]">
          <p className="text-xs font-medium  break-all text-black">{info.row.original.userId}</p>
          <p className="text-xs text-gray-600 break-all">{formatDateTime(info.row.original.createdDataTime)}</p>
        </div>
      ),
      size: 120,
    },
    {
      id: 'view',
      header: 'View',
      cell: (info: any) => (
        <button
          className="text-blue-600 hover:text-blue-800 text-xs px-1 py-0.5 flex items-center gap-1"
          onClick={() => handleViewClick(info.row.original)}
          title="View Details"
        >
          <Icon icon="mdi:eye-outline" className="w-4 h-4" />
        </button>
      ),
      size: 60,
    },
  ], []);

  const handleViewClick = (rowData: StockReceiveItem) => {
    console.log('View clicked for item:', rowData.grnNo);
    setSelectedRow(rowData);
  };

  const handleListClick = () => {
    console.log('List clicked, going back to table');
    if (onBack) {
      onBack();
    }
  };

  const table = useReactTable({
    data: viewData?.itemList || [],
    columns: defaultColumns as any,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
  });

  // Calculate totals
  const calculateTotals = () => {
    if (!viewData?.itemList || viewData.itemList.length === 0) {
      return {
        totalGp: 0,
        totalDiscount: 0,
        totalNetInvoice: 0,
        totalItems: 0
      };
    }

    // Filter the item list based on global filter
    const filteredItems = table.getRowModel().rows.map(row => row.original);

    return filteredItems.reduce((acc, item) => {
      return {
        totalGp: acc.totalGp + (item.totalGp || 0),
        totalDiscount: acc.totalDiscount + (item.discAmount || 0),
        totalNetInvoice: acc.totalNetInvoice + (item.netInvoice || 0),
        totalItems: acc.totalItems + 1
      };
    }, {
      totalGp: 0,
      totalDiscount: 0,
      totalNetInvoice: 0,
      totalItems: 0
    });
  };

  const totals = calculateTotals();
  const filteredItemsCount = table.getRowModel().rows.length;

  if (selectedRow) {
    return (
      <StockReceiveInvoiceView2
        rowData={selectedRow}
        onBack={() => {
          console.log('Going back from view');
          setSelectedRow(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading invoice details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 bg-red-50 rounded-md">
        <Icon icon="mdi:alert-circle-outline" className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 font-medium mb-2">Error loading invoice details</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button 
          onClick={() => ourInvoiceNumber && fetchViewData(ourInvoiceNumber)}
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
  {/* Header - Same card-based layout */}
  <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded shadow-sm mb-3 p-3 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
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
                  List
                </span>
              </div>
            </Breadcrumb>
          </Breadcrumb>
        </div>
        
        <h1 className="text-lg sm:text-xl md:text-2xl text-indigo-700 font-bold whitespace-nowrap">
          Receive Invoice
        </h1>
        <span className="text-base sm:text-lg md:text-xl text-purple-800 font-bold">- {ourInvoiceNumber}</span>
      </div>
      
      <Tooltip content="Back" className="z-50"> 
        <Button
          color="primary"
          size="xs"
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center"
          onClick={handleListClick}
        >
          <HiViewList className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </Button>
      </Tooltip>
    </div>

    {/* Top Information Card */}
    <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="border-l-8 border-purple-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-purple-500 rounded-lg">
              <FaReceipt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                Period: <span className="font-bold dark:text-white">{formatPurchasePeriod(stockPeriod)}</span>
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
                Our Invoice No: <span className="font-bold whitespace-normal dark:text-white">{ourInvoiceNumber || 'N/A'}</span>
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
                Supplier Inv No: <span className="font-bold dark:text-white">{supplierInvNo || 'N/A'}</span>
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="border-l-8 border-amber-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-amber-500 rounded-lg">
              <FaBoxOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
                Invoice Date: <span className="font-bold dark:text-white">{formatDateOnly(supplierInvDate) || 'N/A'}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="h-1 sm:h-2"></div>
      <div className="h-1 sm:h-2"></div>
      <div className="h-1 sm:h-2"></div>

      {/* Second Row - Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-2">
        {/* Supplier Card */}
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm">
          <div className="absolute -top-2.5 left-2 sm:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-1">
              <HiBuildingStorefront className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600 dark:bg-gray-800" />
              <h2 className="text-[10px] sm:text-xs font-semibold text-black dark:text-white dark:bg-gray-800">Supplier Information</h2>
            </div>
          </div>
          
          <div className="p-1 sm:p-2 pt-3 sm:pt-4">
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              <div className="bg--50 p-1 sm:p-1.5 rounded">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black">Supplier ID</span>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black">{supplierId || 'N/A'}</p>
                <p className="text-[8px] sm:text-[9px] md:text-[11px] text-gray-600 break-words">
                  {viewData?.supplierName || 'N/A'}
                </p>
              </div>
              
              <div className="bg--50 p-1 sm:p-1.5 rounded">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black">Created By</span>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium break-all text-black">{viewData?.userId || 'N/A'}</p>
              </div>
              
              <div className="bg--50 p-1 sm:p-1.5 rounded">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black">Created Date</span>
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black">{formatDateTime(viewData?.createdDataTime || null)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details Card */}
        <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="absolute -top-2.5 left-2 sm:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-1">
              <HiReceiptTax className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-600" />
              <h2 className="text-[10px] sm:text-xs font-semibold text-black dark:text-white">Financial Details</h2>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 pt-3 sm:pt-4">
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              <div className="bg--50 p-1 sm:p-1.5 rounded">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black">Gross</span>
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-blue-700">{Number(gross || 0).toFixed(2)}</p>
              </div>
              
              <div className="bg--50 p-1 sm:p-1.5 rounded">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black">Discount</span>
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">{Number(discount || 0).toFixed(2)}</p>
              </div>
              
              <div className="bg--50 p-1 sm:p-1.5 rounded">
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black">Net Invoice</span>
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-700">{Number(netInvValue || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full mt-3 sm:mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
              Total Items: <span className="font-semibold text-blue-600">{viewData?.itemList?.length || 0}</span>
              {globalFilter && filteredItemsCount !== viewData?.itemList?.length && (
                <> (Filtered: <span className="font-semibold text-blue-600">{filteredItemsCount}</span>)</>
              )}
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full sm:w-56 md:w-64 mt-1 sm:mt-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-[10px] sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="mdi:close" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

       <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
  <div className="overflow-auto max-h-[300px] sm:max-h-[350px] md:max-h-[400px]">
    <div className="min-w-[600px] md:min-w-[700px] lg:min-w-full">
      <table className="w-full divide-y divide-gray-200">
        <thead className="sticky top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-blue-600">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 md:py-2 text-left font-medium text-white uppercase text-[8px] sm:text-[9px] md:text-[10px] whitespace-nowrap"
                  style={{ width: header.getSize() ? `${header.getSize()}px` : 'auto' }}
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
                  <td key={cell.id} className="px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 md:py-2">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] block truncate max-w-full">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={defaultColumns.length} className="px-2 sm:px-3 py-3 sm:py-4 md:py-5 text-center">
                <div className="flex flex-col items-center">
                  <Icon icon="mdi:package-variant-empty" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-300 mb-1" />
                  <p className="text-gray-500 text-[8px] sm:text-[9px] md:text-xs">
                    {globalFilter ? 'No matching items found' : 'No delivery items found'}
                  </p>
                  {globalFilter && (
                    <button
                      onClick={() => setGlobalFilter('')}
                      className="mt-1 text-[7px] sm:text-[8px] md:text-[10px] text-blue-600 hover:text-blue-800"
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
      
      {sessionExpired && <SessionModal/>}
    </div>
  </div>
</div>
  );
};

export default StockReceiveInvoiceView;