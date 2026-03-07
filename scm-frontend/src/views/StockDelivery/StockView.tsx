import { Breadcrumb, Button, Card, Label, Tooltip } from "flowbite-react";
import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { HiViewList } from 'react-icons/hi';
import { Icon } from '@iconify/react/dist/iconify.js';
import SessionModal from "../SessionModal";
import { FaBoxOpen, FaCalendarAlt, FaReceipt, FaTruck } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";

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

interface StockViewDetails {
  periodStr: string;
  cwhDelId: string;
  ordLocId: string;
  locationName: string;
  deliveryNote: string;
  delDateStr: string;
  userId: string;
  createdDataTime: string;
  subList: Array<{
    itemId: number;
    itemName: string;
    packageId: string;
    quantity: number;
    ip02: number;
    stockCp: number;
    expiryDateFormat: string;
    batchNo: string;
  }>;
}

const StockViewScreen = ({ rowData, onBack }) => {
  const [viewData, setViewData] = useState<StockViewDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);
  
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
  
  useEffect(() => {
    if (rowData?.cwhDelId) {
      fetchStockViewData(rowData.cwhDelId);
    }
  }, [rowData]);

  const fetchStockViewData = async (cwhDelId: string) => {
    console.log('Fetching view data for CWH Del ID:', cwhDelId);
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }
    
    try {
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/viewCwhDel/${cwhDelId}`;
      
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
    
      const result = await response.json();
      console.log('View API Response:', result);
      
      if (result.success && result.data) {
        setViewData(result.data);
      } else {
        setError(result.message || 'Failed to load detailed data');
      }
    } catch (err) {
      setSessionExpired(true);
      console.error('Error fetching stock view data:', err);
      setError(err.message || 'Unknown error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!viewData?.subList || viewData.subList.length === 0) {
      return {
        totalQuantity: 0,
        totalIpPrice: 0,
        totalGpPrice: 0,
        totalItems: 0
      };
    }

    return viewData.subList.reduce((acc, item) => {
      const totalIpPrice = (item.quantity || 0) * (item.ip02 || 0);
      const totalGpPrice = (item.quantity || 0) * ((item.ip02 || 0) - (item.stockCp || 0));
      
      return {
        totalQuantity: acc.totalQuantity + (item.quantity || 0),
        totalIpPrice: acc.totalIpPrice + totalIpPrice,
        totalGpPrice: acc.totalGpPrice + totalGpPrice,
        totalItems: acc.totalItems + 1
      };
    }, {
      totalQuantity: 0,
      totalIpPrice: 0,
      totalGpPrice: 0,
      totalItems: 0
    });
  };

  const formatExpiryDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateStr;
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
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

  const tableData = useMemo(() => {
    if (!viewData?.subList) return [];
    
    return viewData.subList.map((item, index) => ({
      id: index + 1,
      itemId: item.itemId || 'N/A',
      itemName: item.itemName || 'N/A',
      packageId: item.packageId || 'N/A',
      quantity: item.quantity || 0,
      issuePrice: item.ip02 || 0,
      costPrice: item.stockCp || 0,
      expDate: formatExpiryDate(item.expiryDateFormat),
      batchNo: item.batchNo || 'N/A',
      totalIpPrice: (item.quantity || 0) * (item.ip02 || 0),
      totalGpPrice: (item.quantity || 0) * ((item.ip02 || 0) - (item.stockCp || 0))
    }));
  }, [viewData]);

  const columns = useMemo(() => [
    {
      id: 'serialNo',
      header: 'S.No',
      cell: (info: any) => <p className="text-black text-[10px] sm:text-xs">{info.row.index + 1}</p>,
      size: 40,
    },
    {
      id: 'itemId',
      header: 'Item Code',
      accessorKey: 'itemId',
      cell: (info: any) => (
        <div className="min-w-[70px] sm:min-w-[80px] max-w-[120px] sm:max-w-[150px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.row.original.itemId}</p>
          <p className="text-[8px] sm:text-[11px] font-medium text-gray-600 break-words whitespace-normal">
            {info.row.original.itemName}
          </p>
        </div>
      ),
      size: 100,
    },
    {
      id: 'packageId',
      header: 'Package Id',
      accessorKey: 'packageId',
      cell: (info: any) => (
        <div className="min-w-[70px] sm:min-w-[80px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.getValue()}</p>
        </div>
      ),
      size: 80,
    },
    {
      id: 'quantity',
      header: 'QTY',
      accessorKey: 'quantity',
      cell: (info: any) => (
        <div className="min-w-[50px] sm:min-w-[60px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.getValue().toFixed(2)}</p>
        </div>
      ),
      size: 60,
    },
    {
      id: 'issuePrice',
      header: 'Issue Price',
      accessorKey: 'issuePrice',
      cell: (info: any) => (
        <div className="min-w-[70px] sm:min-w-[80px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.getValue().toFixed(2)}</p>
        </div>
      ),
      size: 80,
    },
    {
      id: 'costPrice',
      header: 'Cost Price',
      accessorKey: 'costPrice',
      cell: (info: any) => (
        <div className="min-w-[70px] sm:min-w-[80px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.getValue().toFixed(2)}</p>
        </div>
      ),
      size: 80,
    },
    {
      id: 'expDate',
      header: 'Exp Date',
      accessorKey: 'expDate',
      cell: (info: any) => (
        <div className="min-w-[70px] sm:min-w-[80px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.getValue()}</p>
        </div>
      ),
      size: 80,
    },
    {
      id: 'totalIpPrice',
      header: 'Total IP',
      accessorKey: 'totalIpPrice',
      cell: (info: any) => (
        <div className="min-w-[70px] sm:min-w-[80px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.getValue().toFixed(2)}</p>
        </div>
      ),
      size: 80,
    },
    {
      id: 'totalGpPrice',
      header: 'Total GP',
      accessorKey: 'totalGpPrice',
      cell: (info: any) => (
        <div className="min-w-[70px] sm:min-w-[80px]">
          <p className="text-[9px] sm:text-xs font-medium text-black whitespace-nowrap">{info.getValue().toFixed(2)}</p>
        </div>
      ),
      size: 80,
    },
  ], []);

  const table = useReactTable({
    data: tableData,
    columns: columns as any,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchTerm = filterValue.toLowerCase();
      const itemId = String(row.original.itemId).toLowerCase();
      const itemName = String(row.original.itemName).toLowerCase();
      const packageId = String(row.original.packageId).toLowerCase();
      const batchNo = String(row.original.batchNo).toLowerCase();
      
      return itemId.includes(searchTerm) || 
             itemName.includes(searchTerm) || 
             packageId.includes(searchTerm) || 
             batchNo.includes(searchTerm);
    },
  });

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="text-center py-6 sm:py-8 px-3 sm:px-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-[10px] sm:text-sm text-gray-600">Loading detailed data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 sm:py-6 px-3 sm:px-4 bg-red-50 rounded-md mx-2 sm:mx-4">
        <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
        <p className="text-red-600 font-medium mb-1 sm:mb-2 text-xs sm:text-sm">Error loading detailed data</p>
        <p className="text-red-500 text-[10px] sm:text-xs mb-3 sm:mb-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button 
            onClick={() => rowData?.cwhDelId && fetchStockViewData(rowData.cwhDelId)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-[10px] sm:text-sm"
          >
            Try Again
          </button>
          <button 
            onClick={onBack}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-[10px] sm:text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  const handleCreationClick2 = () => {
    if (onBack) {
      onBack();
    }
  };
  
  const handleCreationClick1 = () => {
    window.location.href = 'DeliveryItemToLocation'; 
  };

  return (
    <Card className="w-full max-w-[1050px] mx-auto">
      <div className="w-full px-2 sm:px-3 lg:px-4 pb-2 sm:pb-3 ">
        {/* Header - Responsive */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 ">
          <div className="px-1 sm:px-2 pt-1 sm:pt-2 pb-1 ">
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
                  handleCreationClick2();
                }}
              >
                <div className="flex items-center">
                  <MdKeyboardArrowRight className="mx-0.5 sm:mx-1 text-gray-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-[10px] sm:text-xs">
                    List
                  </span>
                </div>
                  <h1 className="text-base sm:text-lg ml-2  md:text-xl text-indigo-700 font-semibold whitespace-nowrap">
            Delivery Item To Location
          </h1>
              </Breadcrumb>
            </Breadcrumb>
          </div>
          
        
          
          <Tooltip content="Add">
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          <Card className="border-l-8 border-purple-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-purple-500 rounded-lg">
                <FaReceipt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-black dark:text-white">
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
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-black dark:text-white">
                  CWH Del Id: <span className="font-bold dark:text-white">{viewData?.cwhDelId || 'N/A'}</span>
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
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-black dark:text-white">
                  Ord.ID: <span className="font-bold dark:text-white">{viewData?.deliveryNote || 'N/A'}</span>
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
                <p className="text-[8px] sm:text-[9px] md:text-xs font-medium text-black dark:text-white">
                  Delivery Date: <span className="font-bold dark:text-white">{viewData?.delDateStr || 'N/A'}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="h-1 sm:h-2"></div>
        <div className="h-1 sm:h-2"></div>
        <div className="h-1 sm:h-2"></div>
        
        <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="absolute -top-2.5 left-2 sm:left-3 px-1 sm:px-1.5 bg-white">
              <div className="flex items-center gap-1">
                <FaTruck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                <h2 className="text-[10px] sm:text-xs font-semibold text-black">Delivery Location Information</h2>
              </div>
            </div>
            
            <div className="p-1 sm:p-2 pt-3 sm:pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
                <div className="bg--50 p-1 sm:p-1.5 rounded">
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Location Id</span>
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black dark:text-white">{viewData?.ordLocId || 'N/A'}</p>
                </div>
                
                <div className="bg--50 p-1 sm:p-1.5 rounded">
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-black dark:text-white">Location Name</span>
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-medium truncate text-black dark:text-white">{viewData?.locationName || 'N/A'}</p>
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
        </div>

        {/* Items Details Section */}
        <div className="w-full">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 sm:mb-3">
            <div className="text-[9px] sm:text-xs md:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              Total Items: <span className="font-semibold text-blue-600">{totals.totalItems}</span>
            </div>
            <div className="relative w-full sm:w-56 md:w-64">
              <input
                type="text"
                placeholder="Search items..."
                value={globalFilter || ''}
                onChange={e => setGlobalFilter(e.target.value)}
                className="w-full px-2 sm:px-3 h-7 sm:h-8 py-1 sm:py-2 pl-8 sm:pl-10 pr-3 sm:pr-4 text-[10px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
              <Icon icon="mdi:magnify" className="absolute left-2 sm:left-3 top-1.5 sm:top-2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>

          {/* Responsive Table with Scroll */}
          <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[800px] lg:min-w-full">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-1 sm:px-2 py-1 sm:py-1.5 text-left font-medium text-white uppercase text-[8px] sm:text-[9px] md:text-[10px] whitespace-nowrap"
                            style={{ width: `${header.column.columnDef.size || 'auto'}px` }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                </table>
              </div>
            </div>
            
            {/* Scrollable Tbody with fixed height */}
            <div className="overflow-y-auto" style={{ maxHeight: '200px', minHeight: '150px' }}>
              <div className="min-w-[800px] lg:min-w-full">
                <table className="w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-1 sm:px-2 py-1 sm:py-1.5 align-top">
                              <div className="leading-tight">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="px-2 sm:px-3 py-4 sm:py-6 md:py-8 text-center">
                          <div className="flex flex-col items-center">
                            <Icon icon="mdi:package-variant-empty" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-300 mb-1 sm:mb-2" />
                            <p className="text-gray-500 text-[9px] sm:text-xs md:text-sm">No items found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Show items count */}
          {table.getRowModel().rows.length > 0 && (
            <div className="mt-1 sm:mt-2 text-[8px] sm:text-xs text-gray-500 text-right">
              Showing {table.getRowModel().rows.length} of {tableData.length} items
            </div>
          )}
        </div>
        
        {sessionExpired && <SessionModal />}
      </div>
    </Card>
  );
};

export default StockViewScreen;