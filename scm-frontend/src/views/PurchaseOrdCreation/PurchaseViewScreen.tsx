import { Label, Button, Card, Tooltip, Spinner, Breadcrumb } from "flowbite-react";
import { useState, useEffect, useMemo, useCallback } from 'react';
import React from "react";
import { HiViewList, HiSearch, HiHome } from 'react-icons/hi';
import {
  FaBoxOpen, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaTruck,
  FaTag, FaInfoCircle, FaChevronRight
} from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";
import SessionModal from "../SessionModal";
import toast, { Toaster } from "react-hot-toast";
import { useEntityFormatter } from "../Entity/UseEntityFormater";

// Interfaces (unchanged)
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
}

export interface PurchaseOrderViewData {
  periodSimple: string;
  poHeadPK: number;
  supplierFK: number;
  poHeadFK: number;
  locationFK: number;
  itemFK: number;
  userUniqueCode: string | null;
  poNumber: string;
  supplierName: string;
  consoId: string;
  periodStr: string;
  podateStr: string;
  pOSupplier: string | null;
  poLocation: string;
  poLocationName: string;
  entityId: string;
  currencyId: string;
  currencyRate: number;
  discPer: number;
  lastUser: string | null;
  lastUpdate: string;
  deliveryType: number;
  poNum: string | null;
  pOperiodStr: string | null;
  entOrder: number;
  itemId: number;
  itemName: string;
  ip02: number;
  supplierId: string;
  packageId: string | null;
  quantity: number;
  totalCost: number;
  totalCost1: number;
  quotedGP: number;
  actualGP: number;
  actualGP1: number;
  priceChReason: string | null;
  rcvdQty: number;
  poEntityID: string | null;
  userFk: number;
  userId: string;
  statusFk: number;
  statusName: string;
  paymentType: number;
  subList: SubListItem[];
  uploadedItem: any[];
}

export interface SubListItem {
  periodSimple: string | null;
  poHeadPK: number;
  supplierFK: number;
  poHeadFK: number;
  locationFK: number;
  itemFK: number;
  userUniqueCode: string | null;
  poNumber: string | null;
  supplierName: string | null;
  consoId: string | null;
  periodStr: string | null;
  podateStr: string | null;
  pOSupplier: string | null;
  poLocation: string | null;
  poLocationName: string | null;
  entityId: string | null;
  currencyId: string | null;
  currencyRate: number;
  discPer: number;
  lastUser: string | null;
  lastUpdate: string | null;
  deliveryType: number;
  poNum: string | null;
  pOperiodStr: string | null;
  entOrder: number;
  itemId: number;
  sno:number;
  itemName: string;
  ip02: number;
  supplierId: string | null;
  packageId: string;
  quantity: number;
  totalCost: number;
  totalCost1: number;
  quotedGP: number;
  actualGP: number;
  actualGP1: number;
  priceChReason: string | null;
  rcvdQty: number;
  poEntityID: string | null;
  userFk: number;
  userId: string | null;
  statusFk: number;
  statusName: string | null;
  paymentType: number;
  subList: any[];
  uploadedItem: any[];
}

interface PurchaseViewScreenProps {
  onBack: () => void;
  poNumber: string;
}

// Helper to determine alignment based on value type
const getAlignment = (value: any): string => {
  if (typeof value === 'number') return 'text-right';
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) return 'text-right';
  return 'text-left';
};

const PurchaseViewScreen = ({ onBack, poNumber }: PurchaseViewScreenProps) => {
  const { formatDate, formatDateTime, formatAmount, formatQuantity } = useEntityFormatter();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [selectedDates] = useState([]);
  const [poData, setPoData] = useState<PurchaseOrderViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);

  const [fromDate] = useState(() => {
    const offset = twoYearsAgo.getTimezoneOffset();
    const localDate = new Date(twoYearsAgo.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });

  // Format date for display
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
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };

  // Fetch PO data when component mounts or poNumber changes
  useEffect(() => {
    if (poNumber) {
      fetchPurchaseOrderData(poNumber);
    }
  }, [poNumber]);

  const fetchPurchaseOrderData = async (poNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/viewPo/${poNumber}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      const result = await response.json();
      if (result.success) {
        setPoData(result.data);
        toast.success('PO data loaded successfully');
      } else {
        throw new Error(result.message || 'Failed to fetch PO data');
      }
    } catch (err) {
      setSessionExpired(true);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching PO data');
      console.error('Error fetching purchase order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredItems = useMemo(() =>
    poData?.subList?.filter(item =>
      item.itemName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      item.itemId?.toString().includes(debouncedSearchTerm.toLowerCase()) ||
      item.packageId?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ) || [],
    [poData?.subList, debouncedSearchTerm]
  );

  // Column definitions (simplified, no tanstack)
  const columns = useMemo(() => [
      { 
      id: 'sno', 
      header: 'S.No', 
      accessor: (_row: SubListItem, index: number) => index + 1, 
      align: 'center', 
      width: 30 
    },
    { id: 'itemId', header: 'Item Code', accessor: (row: SubListItem) => row.itemId, align: 'left', width: 70 },
    { id: 'itemName', header: 'Item Name', accessor: (row: SubListItem) => row.itemName, align: 'left', width: 110 },
    { id: 'packageId', header: 'Package Id', accessor: (row: SubListItem) => row.packageId, align: 'left', width: 80 },
    { id: 'quantity', header: 'QTY', accessor: (row: SubListItem) => row.quantity, align: 'right', width: 20 },
    { id: 'rcvdQty', header: 'Rcvd. Qty', accessor: (row: SubListItem) => row.rcvdQty, align: 'right', width: 55 },
    { id: 'quotedGP', header: 'Quoted Gp', accessor: (row: SubListItem) => row.quotedGP, align: 'right', width: 60 },
    { id: 'actualGP', header: 'Actual GP', accessor: (row: SubListItem) => row.actualGP, align: 'right', width: 60 },
    { id: 'gpDiff', header: 'GP Diff', accessor: (row: SubListItem) => (row.actualGP || 0) - (row.quotedGP || 0), align: 'right', width: 55 },
    { id: 'quotedTTL', header: 'Quoted TTL GP', accessor: (row: SubListItem) => (row.quotedGP || 0) * (row.quantity || 0), align: 'right', width: 65 },
    { id: 'actualTTL', header: 'Actual TTL GP', accessor: (row: SubListItem) => (row.actualGP || 0) * (row.quantity || 0), align: 'right', width: 65 },
    { id: 'ttlGpDiff', header: 'TTL GP Diff', accessor: (row: SubListItem) => ((row.actualGP || 0) - (row.quotedGP || 0)) * (row.quantity || 0), align: 'right', width: 65 },
  ], []);

  // Render cell based on column definition - UPDATED to include index
const renderCell = (item: SubListItem, col: typeof columns[0], index: number) => {
    // Check if the accessor function expects more than 1 parameter (i.e., expects index)
    const value = col.accessor.length > 1 ? col.accessor(item, index) : col.accessor(item);
    const alignClass = col.align === 'right' ? 'text-right' : 'text-left';
    let formattedValue = value;

    // Format numbers using entity formatter
    if (typeof value === 'number') {
      if (col.id === 'quantity' || col.id === 'rcvdQty') {
        formattedValue = formatQuantity(value, 0);
      } else if (col.id.includes('GP') || col.id.includes('Diff') || col.id.includes('TTL')) {
        formattedValue = formatAmount(value, 2);
      } else {
        formattedValue = value.toString();
      }
    } else if (value === null || value === undefined) {
      formattedValue = '';
    }

    return (
      <td key={col.id} className={`px-1 py-0.5 ${alignClass} truncate`} style={{ width: col.width }}>
        <span className="text-[10px] sm:text-[11px] text-gray-800 dark:text-gray-200" title={String(value)}>
          {formattedValue}
        </span>
      </td>
    );
  };

  const handleListClick = () => {
    if (onBack && typeof onBack === 'function') {
      onBack();
    } else {
      console.error('onBack is not a function or is undefined');
    }
  };

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
    window.location.href = 'PurchaseOrderCreation'; 

  };

  return (
    <>
   
<Card className="w-full max-w-[1060px] mx-auto rounded">
      {/* Breadcrumb Navigation */}
     
      {/* Header */}  
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 w-full mb-1 sm:mb-2 px-1 sm:px-2">
          <div className="px-1 sm:px-2 pt-1 sm:pt-2 pb-0 sm:pb-1">
        <Breadcrumb 
          aria-label="Purchase order navigation" 
          className="text-[10px] sm:text-xs md:text-sm"
          theme={{
            base: "flex items-center",
            list: "flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap",
        
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
              Po Creation
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
              Po List
              </span>
            </div>
          </Breadcrumb>
          
        
        </Breadcrumb>
      </div>
        <h1 className="text-sm sm:text-base md:text-lg lg:mr-110 lg:text-xl text-indigo-700 dark:text-indigo-400 whitespace-normal break-words">
          PO Details - {poData?.poNumber || poNumber}
          
        </h1> 
      

        <div className="flex gap-1 sm:gap-2 justify-end sm:justify-center items-center w-full sm:w-auto">
          <Tooltip content="Back to list" className="z-50">
            <Button
              color="primary"
              size="md"
              className="w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              onClick={handleListClick}
            >
              <HiViewList className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40 sm:h-48">
          <Spinner size="md sm:lg" />
          <span className="ml-2 sm:ml-3 text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">Loading PO details...</span>
        </div>
      ) : error ? (
        <div className="p-2 sm:p-4 mx-2 sm:mx-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-[10px] sm:text-xs">
          Error: {error}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 w-full max-w-[1100px] mx-auto px-1 sm:px-2 md:px-4">
          {/* Top 4 mini cards - increased font size slightly */}
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2">
              <Card className="border-l-8 border-emerald-500 shadow-sm p-0.5 sm:p-1 h-8 sm:h-9">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="p-0.5 sm:p-1 bg-emerald-500 rounded-lg">
                  <FaCalendarAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-black dark:text-white truncate">
                  Period: <span className="font-bold">{formatPurchasePeriod(poData?.periodStr || '')}</span>
                </p>
              </div>
            </Card>
            <Card className="border-l-8 border-blue-500 shadow-sm p-0.5 sm:p-1 h-8 sm:h-9">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="p-0.5 sm:p-1 bg-blue-500 rounded-lg">
                  <FaTag className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-black dark:text-white truncate">
                  PO: <span className="font-bold">{poData?.poNumber || '-'}</span>
                </p>
              </div>
            </Card>
          
            <Card className="border-l-8 border-purple-500 shadow-sm p-0.5 sm:p-1 h-8 sm:h-9">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="p-0.5 sm:p-1 bg-purple-500 rounded-lg">
                  <FaTruck className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-black dark:text-white truncate">
                  Delivery Date: <span className="font-bold">{(poData?.podateStr || '')  }</span>
                </p>
              </div>
            </Card>
            <Card className="border-l-8 border-amber-500 shadow-sm p-0.5 sm:p-1 h-8 sm:h-9">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="p-0.5 sm:p-1 bg-amber-500 rounded-lg">
                  <FaUser className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-black dark:text-white truncate">
                  Status: <span className="font-bold">{poData?.statusName || ''}</span>
                </p>
              </div>
            </Card>
          </div>

          {/* Supplier & Location cards - increased font size slightly */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            {/* Supplier Card */}
            <Card className="border border-blue-300 dark:border-blue-700 relative pt-1 h-auto">
              <div className="absolute -top-2 left-2 sm:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <div className="p-0.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <FaUser className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-blue-600 dark:text-blue-400">SUPPLIER</h3>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-1.5">
                <input
                  type="text"
                  placeholder="Supplier ID"
                  className="w-full h-7 sm:h-8 px-1.5 sm:px-2 text-[9px] sm:text-[10px] md:text-[11px] border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  value={`${poData?.supplierId || ''} - ${poData?.supplierName || ''}`}
                  readOnly
                />
              </div>
             
                <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-black dark:text-white truncate">
                  Created: <span className="font-bold">{poData?.userId || '-'}</span>
                </p>
             
            <div className="flex flex-row gap-3 sm:gap-6 w-full">
 
      <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-black dark:text-white truncate">
        Delivery Type: <span className="font-bold text-white p-2 sm:p-4 bg-green-500">{poData?.periodSimple}</span>
      </p> 

 
      
      <p className="text-[9px] sm:text-[10px] md:text-[11px] font-medium text-black dark:text-white truncate">
        Creation Type: <span className="font-bold text-white p-2 sm:p-4 bg-blue-500">{poData?.itemName || '-'}</span>
      </p>
  
</div>
            </Card>

            {/* Location Card */}
            <Card className="border border-blue-300 dark:border-blue-700 relative pt-1 h-auto">
              <div className="absolute -top-2 left-2 sm:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <div className="p-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                    <FaMapMarkerAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">LOCATION</h3>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-1.5">
                <div className="flex items-center gap-1 sm:gap-2 border border-gray-300 dark:border-gray-600 rounded-md h-7 sm:h-8 px-1.5 sm:px-2">
                  <FaMapMarkerAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] truncate text-gray-900 dark:text-gray-200">
                    {poData?.poLocation ? `${poData.poLocation} - ${poData.poLocationName || ''}` : 'No location'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                  <div>
                    <label className="block text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Currency</label>
                    <input
                      type="text"
                      className="w-full h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] border border-gray-400 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      value={poData?.currencyId || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Rate</label>
                    <input
                      type="text"
                      className="w-full h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] border border-gray-400 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-right"
                      value={formatAmount(poData?.currencyRate || 0, 2) || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">Disc%</label>
                    <input
                      type="text"
                      className="w-full h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] border border-gray-400 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-right"
                      value={formatAmount(poData?.discPer || 0, 2) || ''}
                      readOnly
                    />
                  </div>
                
                </div>
              </div>
            </Card>
          </div>

          {/* Items Table Card - COMPLETELY UNCHANGED */}
   
  {/* Header with title and search */}
  <div className="p-0.5 sm:p-1 border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 bg--50 dark:bg-gray-800">
    <h3 className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-0.5 sm:gap-1 px-0.5 sm:px-1">
      <FaBoxOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-blue-600 dark:text-blue-400" />
   Total   Items :<span className="text-blue0-600">{filteredItems.length}</span>
     <div className="inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full ml-1 sm:ml-2 md:ml-4">
  <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium text-black">Total Cost</span>
  <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-sm font-bold text-blue-900">
    {poData?.totalCost?.toFixed(2) || '0.00'}
  </span>
</div>
    </h3>
    <div className="relative w-full sm:w-48 md:w-56">
      <HiSearch className="absolute left-1.5 sm:left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
      <input
        type="text"
        placeholder={`Search ${poData?.subList?.length || 0} items...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-5 sm:pl-6 md:pl-7 h-6 sm:h-7 md:h-8 pr-1.5 sm:pr-2 py-0.5 text-[8px] sm:text-[9px] md:text-[10px] border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      />  
    </div>
  </div>

  {/* Table container - removed overflow-x-auto, only vertical scroll */}
  <div className="overflow-y-auto max-h-[180px] sm:max-h-[200px] md:max-h-[220px]">
    <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="sticky top-0 z-10 bg-blue-600 dark:bg-blue-800">
        <tr>
          {columns.map(col => (
            <th
              key={col.id}
              className={`px-0.5 sm:px-1 py-0.5 text-[7px] sm:text-[8px] md:text-[9px] font-semibold text-white uppercase tracking-wider whitespace-nowrap ${
                col.align === 'right' ? 'text-right' : 'text-left'
              }`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
  {filteredItems.length > 0 ? (
    filteredItems.map((item, index) => (  // Add index here
      <tr
        key={item.itemId}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50 dark:even:bg-gray-800/50"
      >
        {columns.map(col => renderCell(item, col, index))}  {/* Pass index here */}
      </tr>
    ))
  ) : (
          <tr>
            <td colSpan={columns.length} className="p-1 sm:p-2 text-center">
              <div className="flex flex-col items-center justify-center py-2 sm:py-3 md:py-4">
                <div className="p-0.5 sm:p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-0.5 sm:mb-1">
                  <FaBoxOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400 dark:text-blue-500" />
                </div>
                <h4 className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                  No Items Found
                </h4>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No items match your search.' : 'No items available for this PO.'}
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Row count hint */}
  {filteredItems.length > 0 && (
    <div className="p-0.5 text-[7px] sm:text-[8px] md:text-[9px] text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-800">
      <span>
        Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
      </span>
      {filteredItems.length > 10 && (
        <span className="text-blue-600 dark:text-blue-400">(scroll for more)</span>
      )}
    </div>
  )}

        </div>
      )}

      {sessionExpired && <SessionModal />}
      </Card>
    </>
  );
};

export default PurchaseViewScreen;