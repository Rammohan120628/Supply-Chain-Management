import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  FilterFn,
} from '@tanstack/react-table';
import { Badge, Modal, ModalHeader, ModalBody, Tooltip } from 'flowbite-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import toast, { Toaster } from 'react-hot-toast';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import CardBox from 'src/components/shared/CardBox';
import shape1 from "/src/assets/images/shapes/danger-card-shape.png";
import shape2 from "/src/assets/images/shapes/secondary-card-shape.png";
import shape3 from "/src/assets/images/shapes/success-card-shape.png";
import SessionModal from '../SessionModal';
import { useEntityFormatter } from '../Entity/UseEntityFormater';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Define interfaces based on your API response
export interface ReturnItem {
  returnSuppHeadPk: number;
  returnSuppDetailPk: number;
  suppReturnId: string;
  serialNo: number;
  returnDateStr: string;
  period: string;
  supplierFk: number;
  supplierId: string;
  supplierName: string;
  currencyId: string;
  currencyRate: number;
  locationFk: number;
  locationId: string;
  locationName: string;
  itemId: number;
  itemName: string | null;
  packageId: string | null;
  ip02: number;
  lastQtyPrice: number;
  lastPurchPrice: number;
  unitPrice: number;
  expiryDate: string | null;
  batchNo: string | null;
  binNo: string | null;
  qty: number;
  grossPrice: number;
  total: number;
  netTotal: number;
  entity: string;
  userFk: number;
  lastUser: number;
  lastUpdate: string | null;
  stockGp: number;
  stockCp: number;
  crNoteNo: string | null;
  discount: number;
  vatAmount: number;
  netReturnValue: number;
  vatId: string | null;
  accountId: string | null;
  discAmount: number;
  vatPerc: number;
  vatAdjValue: number;
  vatAmountInside: number;
  recieveDate: string | null;
  reaminingQty: number;
  ip: number;
  cp: number;
  savings: number;
  ipStr: string | null;
  cpStr: string | null;
  savingsStr: string | null;
  discAmountStr: string | null;
  sumIpStr: string | null;
  sumCpStr: string | null;
  sumSavingsStr: string | null;
  sumDiscAmountStr: string | null;
  grnId: string | null;
  ourGroupCrNoteNo: string | null;
  crNoteReceiveDateStr: string | null;
  itemSubList: any[];
  selectedOptions: any[] | null;
  userId: string;
  createdDataTime: string;
}

export interface TableTypeDense {
  id?: number;
  siNo?: number;
  period?: string;
  returnId?: string;
  ourGroupCrNoteNo?: string;
  returnDateStr?: string;
  locationId?: string;
  locationName?: string;
  supplierId?: string;
  totalGp?: number;
  totalCp?: number;
  totalIp?: number;
  createdBy?: string;
  supplierName?: string;
  userId?: string;
  createdDataTime?: string;
  discount?: number;
  netInvoice?: number;
  returnItem?: ReturnItem;
  crNoteReceiveDateStr?: string;
  crNoteNo: string;
}

// Define column helper with proper type
const columnHelper = createColumnHelper<TableTypeDense>();

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
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateTimeStr;
  }
};

// Simple filter function
const simpleFilterFn: FilterFn<TableTypeDense> = (row, columnId, filterValue: string) => {
  if (!filterValue || filterValue.trim() === '') return true;
  
  const searchValue = filterValue.toLowerCase().trim();
  const rowData = row.original;
  
  const searchableFields = [
    rowData.returnId,
    rowData.supplierId,
    rowData.supplierName,
    rowData.locationId,
    rowData.locationName,
    rowData.ourGroupCrNoteNo,
    rowData.crNoteNo,
    rowData.returnDateStr,
    rowData.createdBy,
    rowData.userId,
    rowData.createdDataTime,
    rowData.period,
    rowData.totalGp?.toString(),
    rowData.discount?.toString(),
    rowData.netInvoice?.toString(),
    rowData.siNo?.toString(),
    rowData.returnItem?.itemId?.toString(),
    rowData.returnItem?.packageId,
    rowData.returnItem?.qty?.toString(),
    rowData.returnItem?.stockGp?.toString(),
    rowData.returnItem?.stockCp?.toString(),
    rowData.returnItem?.ip02?.toString(),
    rowData.returnItem?.discAmount?.toString(),
    rowData.returnItem?.grossPrice?.toString(),
    rowData.returnItem?.netTotal?.toString(),
    rowData.returnItem?.itemName,
    rowData.returnItem?.batchNo,
    rowData.returnItem?.binNo,
    rowData.returnItem?.grnId,
    rowData.returnItem?.crNoteNo,
  ].filter(Boolean).map(v => String(v).toLowerCase());
  
  return searchableFields.some(field => field.includes(searchValue));
};

const ReceiveCreditTable = ({ onBack }) => {
  const formatter = useEntityFormatter();
  
  // State management
  const [sessionExpired, setSessionExpired] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);
  
  const [, setSelectedDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState<string>('');
  const [data, setData] = useState<TableTypeDense[]>([]);
  const [modalData, setModalData] = useState<TableTypeDense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableTypeDense | null>(null);
  const [search, setSearch] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const periodRef = useRef<HTMLDivElement>(null);
  
  // Table states
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [modalColumnFilters, setModalColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalSorting, setModalSorting] = useState<SortingState>([]);
  const [modalGlobalFilter, setModalGlobalFilter] = useState('');
  
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const periodOptions = [...months];

  // Handle grid page changes
  const handleGridPageChange = (page: number) => {
    setGridCurrentPage(page);
    const gridContainer = document.querySelector('.grid-container-scroll');
    if (gridContainer) {
      gridContainer.scrollTop = 0;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to format date for API (01-MM-YYYY with dashes)
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  // Function to format date for display (MM/YYYY)
  const formatDateForDisplay = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };

  // Parse stockPeriod from localStorage
  const parseStockPeriod = (stockPeriod: string | null): { month: number | null, year: number | null } => {
    if (!stockPeriod) return { month: null, year: null };
    
    try {
      const parts = stockPeriod.split('-');
      if (parts.length >= 2) {
        let month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        
        if (parts.length === 2) {
          month = parseInt(parts[0], 10) - 1;
          year = parseInt(parts[1], 10);
        }
        
        if (!isNaN(month) && !isNaN(year) && month >= 0 && month <= 11) {
          return { month, year };
        }
      }
    } catch (error) {
      setSessionExpired(true);
      console.error('Error parsing stockPeriod:', error);
    }
    
    return { month: null, year: null };
  };

  const isPeriodSelected = (index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  };

  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  // Handler functions
  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
    const newPeriod = formatDateForApi(index, selectedYear);
    setPeriod(newPeriod);
    fetchData(newPeriod);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    
    if (selectedMonth !== null) {
      const newPeriod = formatDateForApi(selectedMonth, newYear);
      setPeriod(newPeriod);
      fetchData(newPeriod);
    }
  };

  // Initial fetch
  useEffect(() => {
    const stockPeriod = localStorage.getItem("stockPeriod");
    
    if (stockPeriod) {
      console.log('stockPeriod from localStorage:', stockPeriod);
      
      const { month, year } = parseStockPeriod(stockPeriod);
      
      if (month !== null && year !== null) {
        setSelectedMonth(month);
        setSelectedYear(year);
        const initialPeriod = formatDateForApi(month, year);
        setPeriod(initialPeriod);
        fetchData(initialPeriod);
        return;
      }
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    const initialPeriod = formatDateForApi(currentMonth, currentYear);
    setPeriod(initialPeriod);
    fetchData(initialPeriod);
  }, []);

  // Format date to dd-mm-yyyy
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch data from API
  const fetchData = async (periodParam: string) => {
    if (!periodParam) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/listReceiveCreditNote/${periodParam}`;
      
      console.log('Fetching data with period:', periodParam);
      console.log('API URL:', apiUrl);

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
      
      if (result.success && result.data) {
        const transformedData = result.data.map((item: ReturnItem, index: number) => ({
          id: item.returnSuppHeadPk,
          siNo: index + 1,
          period: item.period,
          returnId: item.suppReturnId,
          ourGroupCrNoteNo: item.ourGroupCrNoteNo,
          crNoteNo: item.crNoteNo,
          returnDateStr: item.returnDateStr,
          locationId: item.locationId,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          locationName: item.locationName,
          totalGp: item.grossPrice,
          discount: item.discount,
          netInvoice: item.netTotal,
          createdBy: item.userId,
          userId: item.userId,
          createdDataTime: item.createdDataTime,
          crNoteReceiveDateStr: item.crNoteReceiveDateStr,
          returnItem: item,
        }));
        
        setData(transformedData);
        setGlobalFilter('');
        setSearch('');
      } else {
        toast.error(result.message || 'Failed to load data');
        setData([]);
        setSearch('');
      }

    } catch (error: any) {
      setSessionExpired(true);
      console.error('Error fetching data:', error);
      toast.error(`Failed to fetch data: ${error.message}`);
      setData([]);
      setSearch('');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sublist data for modal
  const fetchSubListData = async (suppReturnId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }

    setModalLoading(true);
    try {
      setIsLoading(true);

      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/listReceiveCreditNoteSub/${suppReturnId}`;
      
      console.log('Fetching sublist data for suppReturnId:', suppReturnId);
      console.log('API URL:', apiUrl);

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
      
      if (result.success && result.data) {
        const modalTransformedData = result.data.map((item: ReturnItem, index: number) => ({
          id: index,
          siNo: index + 1,
          returnItem: item,
        }));
        
        setModalData(modalTransformedData);
        setModalGlobalFilter('');
        setModalSearch('');
      } else {
        toast.error(result.message || 'Failed to load sublist data');
        setModalData([]);
        setModalSearch('');
      }
    } catch (error: any) {
      setSessionExpired(true);
      console.error('Error fetching sublist data:', error);
      toast.error(`Failed to fetch sublist data: ${error.message}`);
      setModalData([]);
      setModalSearch('');
    } finally {
      setModalLoading(false);
      setIsLoading(false);
    }
  };

  // Handle view click - fetch sublist data
  const handleViewClick = (rowData: TableTypeDense) => {
    console.log('handleViewClick called for:', rowData.returnId);
    setSelectedRow(rowData);
    
    const suppReturnId = rowData.returnId;
    if (suppReturnId) {
      fetchSubListData(suppReturnId);
    } else {
      if (rowData.returnItem?.itemSubList && rowData.returnItem.itemSubList.length > 0) {
        const modalTransformedData = rowData.returnItem.itemSubList.map((item: any, index: number) => ({
          id: index,
          siNo: index + 1,
          returnItem: item,
        }));
        setModalData(modalTransformedData);
        setModalGlobalFilter('');
        setModalSearch('');
      } else {
        setModalData([rowData]);
        setModalGlobalFilter('');
        setModalSearch('');
      }
    }
    
    setOpenModal(true);
  };

  // Export to Excel
  const exportToExcel = async () => {
    if (!period) {
      toast.error('Please select a period first');
      return;
    }

    console.log('Exporting to Excel for period:', period);
    setExportLoading(true);

    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      const excelApiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/downloadReceiveCreditNote/${period}`;
      
      console.log('Excel API URL:', excelApiUrl);
      
      const response = await fetch(excelApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream',
        },
      });
      
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Server returned empty file');
      }
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `ReceiveCreditNote.xlsx`;
      
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename\*?=["']?([^"'\s;]+)["']?/i);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        } else {
          const simpleMatches = contentDisposition.match(/filename=["']?([^"'\s;]+)["']?/i);
          if (simpleMatches && simpleMatches[1]) {
            filename = simpleMatches[1];
          }
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`Excel file downloaded successfully for ${period}!`, {
        duration: 3000,
        position: 'top-right',
      });
      
    } catch (err: any) {
      console.error('Export error details:', err);
      
      if (err.name === 'AbortError') {
        toast.error('Request timeout: Server took too long to respond');
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        if (!navigator.onLine) {
          toast.error('You are offline. Please check your internet connection.');
        } else {
          toast.error('Cannot connect to server. Please check server availability.');
        }
      } else {
        toast.error(`Export failed: ${err.message || 'Unknown error'}`);
      }
      
    } finally {
      setExportLoading(false);
    }
  };

  // Handle search input change for main table
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setGlobalFilter(value);
    setCurrentPage(1);
    setGridCurrentPage(1);
  };

  // Handle modal search input change
  const handleModalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setModalSearch(value);
    setModalGlobalFilter(value);
  };

  // Clear main search
  const handleClearSearch = () => {
    setSearch('');
    setGlobalFilter('');
  };

  // Clear modal search
  const handleClearModalSearch = () => {
    setModalSearch('');
    setModalGlobalFilter('');
  };

  // Define columns for main table - REDESIGNED with compact styling
  const defaultColumns1 = [
    columnHelper.accessor('siNo', {
         header: () => <span className="break-words whitespace-normal">S.No</span>,
      cell: (info) => <span className="text-[11px] text-left text-black w-full block">{info.getValue()}</span>,
      size: 55,
    }),
    columnHelper.accessor('returnId', {
    
           header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white-[10px] uppercase">Return Id</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => (
        <span className="text-[11px] font-medium text-black  dark:text-white text break-words block max-w-[120px]">
          {info.getValue()}
        </span>
      ),
      size: 100,
    }),
    columnHelper.accessor('supplierName', {
     
      
           header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Supplier</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium  text-black leading-tight break-all">{info.row.original.supplierId}</div>
          <div className="text-[10px] leading-tight break-all">
            {info.row.original.supplierName || 'N/A'}
          </div>
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor('ourGroupCrNoteNo', {
   
         header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Our Grp Inv/CR Note</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => (
        <div className="min-w-[120px]">
          <div className="text-[11px] font-medium  text-black leading-tight break-all">{info.row.original.ourGroupCrNoteNo}</div>
          <div className="text-[10px] text- leading-tight break-all">{info.row.original.crNoteNo}</div>
        </div>
      ),
      size: 140,
    }),
    columnHelper.accessor('crNoteReceiveDateStr', {
  
         header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">CR Note Rec.Date</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      // cell: (info) => (
      //   <span className="text-[11px] text-black break-words block max-w-[85px]">
      //     {info.row.original.crNoteReceiveDateStr || "N/A"}
      //   </span>
      // ),
       cell: (info) => {
    const value = info.getValue() || '';
    let formattedDate = value;
    
    try {
      // Manually parse dd-MM-yyyy
      const parts = value.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          formattedDate = formatter.formatDate(date);
        }
      } else {
        // fallback to default parsing if format is unexpected
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          formattedDate = formatter.formatDate(date);
        }
      }
    } catch {
      // keep original value if parsing fails
    }
    
    return (
      <div>
        <span className="text-[11px] font- text-black dark:text-white">{formattedDate}</span>
      </div>
    );
  },
      size: 105,
    }),
    columnHelper.accessor('returnDateStr', {
   
        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Return Date</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
       cell: (info) => {
    const value = info.getValue() || '';
    let formattedDate = value;
    
    try {
      // Manually parse dd-MM-yyyy
      const parts = value.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          formattedDate = formatter.formatDate(date);
        }
      } else {
        // fallback to default parsing if format is unexpected
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          formattedDate = formatter.formatDate(date);
        }
      }
    } catch {
      // keep original value if parsing fails
    }
    
    return (
      <div>
        <span className="text-[11px] font- text-black dark:text-white">{formattedDate}</span>
      </div>
    );
  },
      size: 85,
    }),
    columnHelper.accessor('totalGp', {
  
         header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total GP</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      size: 70,
    }),
    columnHelper.accessor('discount', {
   
         header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Discount</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      size: 70,
    }),
    columnHelper.accessor('netInvoice', {
  
           header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Net Invoice</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      size: 75,
    }),
    columnHelper.accessor('userId', {
             header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Created By</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      
      cell: (info) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium leading-tight break-all max-w-[200px]">
            {info.row.original.userId.replace(/\.(\w+)/, '.\u200B$1')}
          </div>
          <div className="text-[9px] text-black leading-tight break-all">
            {formatDateTime(info.row.original.createdDataTime) || 'N/A'}
          </div>
        </div>
      ),
      size: 110,
    }),
  ];
  // Define columns for modal (item details) - REDESIGNED with compact styling
  const defaultColumns2 = [
    columnHelper.accessor('siNo', {
      header: () => <span>SI.NO</span>,
      cell: (info) => <span className="text-[11px] text-center w-full block">{info.getValue()}</span>,
      enableSorting: true,
      sortingFn: 'basic',
      size: 45,
    }),
    columnHelper.accessor(row => row.returnItem?.itemId, {
      id: 'itemId',

          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Item Id</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium">{info.getValue()}</div>
          <div className="text-[10px] text-black">
            {(info.row.original.returnItem?.itemName || 'N/A').match(/.{1,14}/g)?.map((chunk, i, arr) => (
              <span key={i}>
                {chunk}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      ),
      enableSorting: true,
      sortingFn: 'basic',
      size: 120,
    }),
    columnHelper.accessor(row => row.returnItem?.packageId, {
      id: 'packageId',
 
           header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Package Id</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => <span className="text-[11px] text-black">{info.getValue()}</span>,
      enableSorting: true,
      sortingFn: 'alphanumeric',
      size: 85,
    }),
    columnHelper.accessor(row => row.returnItem?.qty, {
      id: 'quantity',
     
            header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Qty</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => <span className="text-[11px] text-black text-right w-full block">{info.getValue()}</span>,
      enableSorting: true,
      sortingFn: 'basic',
      size: 55,
    }),
    columnHelper.accessor(row => row.returnItem?.stockGp, {
      id: 'stockGp',
   
               header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">GP</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      enableSorting: true,
      sortingFn: 'basic',
      size: 60,
    }),
    columnHelper.accessor(row => row.returnItem?.stockCp, {
      id: 'stockCp',
   
               header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">CP</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      enableSorting: true,
      sortingFn: 'basic',
      size: 60,
    }),
    columnHelper.accessor(row => row.returnItem?.ip02, {
      id: 'ip',
     
               header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">IP</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      enableSorting: true,
      sortingFn: 'basic',
      size: 60,
    }),
    columnHelper.accessor(row => row.returnItem?.discAmount, {
      id: 'discAmount',
    
               header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total Disc</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      enableSorting: true,
      sortingFn: 'basic',
      size: 70,
    }),
    columnHelper.accessor(row => row.returnItem?.grossPrice, {
      id: 'totalGp',
     
              header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total GP</span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      enableSorting: true,
      sortingFn: 'basic',
      size: 70,
    }),
    columnHelper.accessor(row => row.returnItem?.netTotal, {
      id: 'netTotal',

              header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Net Total </span>
        {column.getCanSort() && (
          <span className="text-[10px]">
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[column.getIsSorted() as string] ?? ' ↕️'}
          </span>
        )}
      </div>
    ),
      cell: (info) => {
        const value = info.getValue() || 0;
        const formatted = formatter.formatAmount(value);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
      },
      enableSorting: true,
      sortingFn: 'basic',
      size: 70,
    }),
   
  ];

  // Add view column to main table with eye icon
  const columns1 = useMemo(() => [
    ...defaultColumns1,
    columnHelper.display({
      id: 'view',
      header: () => <span>View</span>,
      cell: ({ row }) => (
        <button
          className="text-blue-600 hover:text-blue-800 text-[11px] px-1 py-0.5 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
          onClick={() => handleViewClick(row.original)}
          title="View Details"
        >
          <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
        </button>
      ),
      size: 60,
      enableSorting: false,
    }),
  ], []);

  // Table configurations
  const table1 = useReactTable({
    data,
    columns: columns1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: simpleFilterFn,
    enableSorting: true,
    enableMultiSort: false,
  });
const table2 = useReactTable({
  data: modalData,
  columns: defaultColumns2,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    columnFilters: modalColumnFilters,
    sorting: modalSorting,
    globalFilter: modalGlobalFilter,
  },
  onColumnFiltersChange: setModalColumnFilters,
  onSortingChange: setModalSorting,
  onGlobalFilterChange: setModalGlobalFilter,
  globalFilterFn: simpleFilterFn,
  enableSorting: true,
  enableMultiSort: false, // Add this to disable multi-column sorting
});

  // Calculate pagination for table
  const totalRows = table1.getRowModel().rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = table1.getRowModel().rows.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle add click
  const handleAddClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // Sort indicator component
 

  // Dashboard Cards Component - REDESIGNED
  const DashboardCards = () => {
    const totalCount = data.length;
    const pendingCount = 0;
    const processedCount = 0;

    const SmallCard = [
      {
        icon: "mdi:clipboard-list-outline",
        num: totalCount,
        title: "Total Returns",
        shape: shape3,
        bgcolor: "warning",
        colorClass: "warning",
        desc: "Total Return Count",
      },
      {
        icon: "mdi:check-circle-outline",
        num: processedCount,
        title: "Processed",
        shape: shape1,
        bgcolor: "error",
        colorClass: "error",
        desc: "Total Processed Count",
      },
      {
        icon: "mdi:clock-outline",
        num: pendingCount,
        title: "Pending",
        shape: shape2,
        bgcolor: "secondary",
        colorClass: "secondary",
        desc: "Total Pending Count",
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
        {SmallCard.map((theme, index) => (
          <div className="lg:col-span-2" key={index}>
            <CardBox
              className={`relative shadow-none! rounded-lg overflow-hidden bg-light${theme.bgcolor} dark:bg-dark${theme.bgcolor} h-14 sm:h-16 md:h-20`}
            >
              <div className="flex items-center justify-between p-1.5 sm:p-2 h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 truncate">{theme.title}</p>
                  <div className="flex items-center gap-2">
                    <h5 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{theme.num}</h5>
                  </div>
                  <p className="text-xs text-black mt-0.5 truncate hidden sm:block">
                    {theme.desc}
                  </p>
                </div>
                
                <div className="flex-shrink-0 ml-2">
                  <span
                    className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white bg-${theme.bgcolor}`}
                  >
                    <Icon icon={theme.icon} height={12} className="sm:h-[16px] md:h-[20px]" />
                  </span>
                </div>
              </div>
              
              <img
                src={theme.shape}
                alt="shape"
                className="absolute end-0 top-0 opacity-20 h-full w-auto"
              />
            </CardBox>
          </div>
        ))}
      </div>
    );
  };

  // Grid View Component - REDESIGNED
  const ReceiveCreditGrid = () => {
    // Calculate pagination for grid
    const totalGridRows = table1.getRowModel().rows.length;
    const totalGridPages = Math.ceil(totalGridRows / gridRowsPerPage);
    const gridStartIndex = (gridCurrentPage - 1) * gridRowsPerPage;
    const gridEndIndex = gridStartIndex + gridRowsPerPage;
    const currentGridRows = table1.getRowModel().rows.slice(gridStartIndex, gridEndIndex);

    // Reset to first page when search changes
    useEffect(() => {
      setGridCurrentPage(1);
    }, [search]);

    return (
      <>
        <DashboardCards />
        
        <div className="relative grid-container-scroll max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">
            {currentGridRows.map((row) => {
              const item = row.original;
              
              return (
                <CardBox 
                  key={item.returnId || item.id} 
                  className="hover:shadow-md transition-shadow duration-300 border border-gray-200 h-auto p-3 sm:p-4"
                >
                  {/* Card Header with View button integrated */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.returnId || 'N/A'}</h3>
                      <p className="text-xs text-black mt-0.5 truncate">{item.ourGroupCrNoteNo || 'No CR Note'}</p>
                      <p className="text-xs text-black mt-0.5 truncate">{item.crNoteNo || ''}</p>
                      <p className="text-xs text-black mt-0.5 font-bold truncate">
                        <span className='text-blue-600'>Date: </span>{item.returnDateStr || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewClick(item)}
                      className="p-1 sm:p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                      title="View Details"
                    >
                      <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  {/* Supplier Info */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon icon="mdi:factory" className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-600 truncate">Supplier</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 break-words">{item.supplierId || 'N/A'}</p>
                    <p className="text-xs text-gray-600 break-words line-clamp-2">{item.supplierName || 'N/A'}</p>
                  </div>
                  
                  {/* Financial Info - Compact */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    <div className="bg-blue-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:currency-inr" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-600">Total GP</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {Number(item.totalGp || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:percent" className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-600">Disc</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {Number(item.discount || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:file-document" className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        <span className="text-xs text-purple-600">Net</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        ₹{Number(item.netInvoice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom Info Row */}
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-md mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black mb-0.5">CR Note Rec.Date</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {item.crNoteReceiveDateStr || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="flex-1 min-w-100px text-right">
                        <p className="text-xs text-black mb-0.5">Created By</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 break-all">{item.userId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardBox>
              );
            })}
          </div>
        </div>
        
        {/* Grid Pagination */}
        {totalGridRows > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 px-1">
            <div className="text-xs text-gray-600 order-2 sm:order-1">
              Showing <span className="font-medium">{gridStartIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(gridEndIndex, totalGridRows)}</span> of{' '}
              <span className="font-medium">{totalGridRows}</span> items
            </div>
            
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => handleGridPageChange(gridCurrentPage - 1)}
                disabled={gridCurrentPage === 1}
                className={`px-3 py-1.5 rounded border text-xs flex items-center gap-1 ${
                  gridCurrentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                }`}
              >
                <FaChevronLeft className="w-3 h-3" />
                Previous
              </button>
              
              <span className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded border border-blue-200 font-medium">
                {gridCurrentPage} of {totalGridPages}
              </span>
              
              <button
                onClick={() => handleGridPageChange(gridCurrentPage + 1)}
                disabled={gridCurrentPage === totalGridPages}
                className={`px-3 py-1.5 rounded border text-xs flex items-center gap-1 ${
                  gridCurrentPage === totalGridPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                }`}
              >
                Next
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        
        {/* Stats */}
        {totalGridRows === 0 && search && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
            <Icon icon="mdi:database-outline" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No results found for "{search}"</p>
          </div>
        )}
        
        {totalGridRows > 0 && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-800">{totalGridRows}</span> items for period: 
                  <span className="font-bold text-blue-600 ml-1 break-all">{period}</span>
                </p>
                {search && (
                  <p className="text-xs text-gray-500 mt-1">
                    Filtered by: <span className="font-medium">"{search}"</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e0 #f1f5f9;
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </>
    );
  };

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-2 pb-4 sm:pb-6">
      
      {/* Header with Title and Toggle Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-1">
        <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-700 whitespace-normal break-words">
          Receive Credit List
        </h1>
        
        {/* View Mode Toggle Button */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto mt-1 gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon icon="mdi:table" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Table </span>
            <span className="sm:hidden">Table</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon icon="mdi:view-grid" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid </span>
            <span className="sm:hidden">Grid</span>
          </button>
          <div className="flex gap-2 justify-end sm:justify-start mt-1">
            <Tooltip content="Excel" className='z-50'>
              <Badge
                color="success"
                className={`h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-green-700 text-xs sm:text-sm ${(exportLoading || !period) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={exportLoading || !period ? undefined : exportToExcel}
              >
                {exportLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Icon icon="file-icons:microsoft-excel" className="text-sm sm:text-base" />
                )}
              </Badge>
            </Tooltip>
            <Tooltip content="Add" className='z-50'>
              <Badge
                color="primary"
                className="h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-blue-700 text-xs sm:text-sm"
                onClick={handleAddClick}
              >
                <Icon icon="mingcute:add-line" className="text-sm sm:text-base" />
              </Badge>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 sm:p-4">
        <div className="w-full">
          {/* Filter and Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-2">
            
            {/* Period Selector */}
            <div className="w-full sm:flex-1 relative" ref={periodRef}>
              <div className="relative">
                <input
                  type="text"
                  value={displayValue}
                  readOnly
                  onClick={() => setPeriodOpen(!periodOpen)}
                  className="peer w-60 px-3 h-10 sm:px-4 pr-10 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                />
                <label className="absolute left-3 sm:left-4 top-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1">
                  Period <sup className='text-red-600'>*</sup>
                </label>
                <CalendarDays className="absolute right-50   top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              </div>
              
              {periodOpen && (
                <div className="absolute w-80 top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 p-2 sm:p-3">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <button
                      onClick={() => handleYearChange("prev")}
                      className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">{selectedYear}</span>
                    <button
                      onClick={() => handleYearChange("next")}
                      className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {periodOptions.map((option, index) => (
                      <button
                        key={option}
                        onClick={() => handlePeriodSelect(index)}
                        className={`text-center py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-xs sm:text-sm ${
                          isPeriodSelected(index)
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg transform scale-105"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${data.length} records...`}
                  className="form-control-input sm:w-70 lg:ml-60  px-3 sm:px-4 py-2 text-xs sm:text-sm pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                  value={search}
                  onChange={handleSearchChange}
                />
                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <Icon icon="mdi:close-circle" className="text-base sm:text-lg" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="pb-2 sm:pb-1"></div>
          
          {isLoading && (
            <div className="text-center py-6 sm:py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Loading data for period: {period}...</p>
            </div>
          )}
          
          {!isLoading && data.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Icon icon="mdi:database-outline" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-gray-600">No data found for period: {period}</p>
              <p className="text-xs text-gray-500 mt-1">Try selecting a different period</p>
            </div>
          )}
          
          {!isLoading && data.length > 0 && (
            <>
              {viewMode === 'table' ? (
                <>
                  {/* Table View */}
                  <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
                      <div className="min-w-[1000px] lg:min-w-full">
                        <div className="overflow-auto max-h-[360px] relative">
                          <table className="w-full divide-y divide-gray-200 table-" style={{ tableLayout: '' }}>
                         <thead className='sticky top-0 z-10 h-auto min-h-[32px]'> {/* Changed to h-auto */}
  {table1.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id} className="bg-blue-600">
      {headerGroup.headers.map((header) => (
        <th
          key={header.id}
          className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer hover:bg-blue-700 align-top" 
          style={{ width: `${header.column.columnDef.size || 80}px` }}
          onClick={header.column.getToggleSortingHandler()}
        >
          <div className="flex items-start justify-between gap-0.5"> {/* Changed to items-start */}
            <span className="break-words whitespace-normal"> {/* Changed from truncate to break-words */}
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </span>
            {/* Sort indicator - you can add this if needed */}
            {header.column.getIsSorted() && (
              <span className="flex-shrink-0 text-white ml-0.5">
                {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </th>
      ))}
    </tr>
  ))}
</thead>
                            <tbody className="bg-white  dark:bg-gray-800 divide-y divide-gray-200">
                              {currentRows.length > 0 ? (
                                currentRows.map((row) => (
                                  <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50/50">
                                    {row.getVisibleCells().map((cell) => (
                                      <td 
                                        key={cell.id} 
                                        className="px-1.5 py-1 align-top"
                                        style={{ width: `${cell.column.columnDef.size || 80}px` }}
                                      >
                                        <div className="leading-tight min-h-[24px] flex items-start text-[11px]">
                                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={columns1.length} className="px-3 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                      <Icon icon="mdi:database-outline" className="w-6 h-6 text-gray-300 mb-1" />
                                      <p className="text-black text-xs font-medium">
                                        {search ? 'No matching records found' : 'No records found'}
                                      </p>
                                      {search && (
                                        <p className="text-gray-400 text-[10px] mt-0.5">
                                          No results for: "{search}"
                                        </p>
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
                  
                  {/* Table Pagination */}
                  {data.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600">
                      <div>
                        Showing <span className="font-medium">{table1.getRowModel().rows.length}</span> of <span className="font-medium">{data.length}</span> records
                        {search && (
                          <span> for search: <span className="font-medium">"{search}"</span></span>
                        )}
                        {!search && (
                          <span> for period: <span className="font-medium">{period}</span></span>
                        )}
                      </div>
                      
                      {totalRows > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-gray-600">
                            {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                              className={`px-1.5 py-0.5 rounded border text-[12px] ${
                                currentPage === 1 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <FaChevronLeft className="w-2.5 h-2.5 inline mr-0.5" />
                              Prev
                            </button>
                            <span className="px-2 py-0.5 text-[12px] bg-blue-50 text-blue-600 rounded border border-blue-200">
                              {currentPage}/{totalPages}
                            </span>
                            <button
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                              className={`px-1.5 py-0.5 rounded border text-[12px] ${
                                currentPage === totalPages 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Next
                              <FaChevronRight className="w-2.5 h-2.5 inline ml-0.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <ReceiveCreditGrid />
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL - REDESIGNED with compact styling */}
      <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
        <ModalHeader className="rounded-t-md pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-base">Item Details</span>
            {selectedRow?.returnId && (
              <span className="text-xs sm:text-sm text-gray-600">- {selectedRow.returnId}</span>
            )}
            
            {period && (
              <span className="text-xs text-gray-500 ml-0 sm:ml-2">
                (Period: {period})
              </span>
              
            )}
              <input
                type="text"
                placeholder={`Search ${modalData.length} records...`}
                value={modalSearch}
                onChange={handleModalSearchChange}
                className="form-control-input w-full lg:ml-130 sm:w-64 px-3 py-1.5 text-sm border rounded-md"
                autoFocus
              />
              {modalSearch && (
                <button
                  onClick={handleClearModalSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              )}
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:w-auto">
              {/* <input
                type="text"
                placeholder={`Search ${modalData.length} records...`}
                value={modalSearch}
                onChange={handleModalSearchChange}
                className="form-control-input w-full sm:w-64 px-3 py-1.5 text-sm border rounded-md"
                autoFocus
              />
              {modalSearch && (
                <button
                  onClick={handleClearModalSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              )} */}
            </div>
            
            {modalLoading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-xs">Loading details...</span>
              </div>
            )}
          </div>
          
       <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
    <table className="min-w-full divide-y divide-gray-200" style={{ fontSize: '11px' }}>
      <thead className="sticky top-0 z-10">
        {table2.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="bg-blue-600">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-2 py-1.5 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer hover:bg-blue-700 whitespace-nowrap"
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="break-words whitespace-normal">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </span>
                
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="bg-white   dark:bg-gray-800 divide-y divide-gray-200">
        {table2.getRowModel().rows.length > 0 ? (
          table2.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-1 align-top whitespace-nowrap">
                  <div className="leading-tight min-h-[20px] flex items-start text-[11px]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={defaultColumns2.length} className="text-center py-8 text-gray-500 text-sm">
              {modalSearch ? 'No matching records found' : 'No item details available'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
          {modalData.length > 0 && (
            <div className="mt-3 text-xs text-gray-600">
              Showing {table2.getRowModel().rows.length} of {modalData.length} items
              {modalSearch && table2.getRowModel().rows.length !== modalData.length && (
                <span> (filtered)</span>
              )}
            </div>
          )}
        </ModalBody>
      </Modal>
      
      {sessionExpired && <SessionModal/>}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}
      
    
    </div>
  );
};

export default ReceiveCreditTable;