import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Badge, Tooltip } from 'flowbite-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import toast from 'react-hot-toast';
import StockReceiveInvoiceView from './StockReceiveInvoiceView';
import CardBox from 'src/components/shared/CardBox';
import shape1 from "/src/assets/images/shapes/danger-card-shape.png";
import shape2 from "/src/assets/images/shapes/secondary-card-shape.png";
import shape3 from "/src/assets/images/shapes/success-card-shape.png";
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import SessionModal from '../SessionModal';
import { useEntityFormatter } from '../Entity/UseEntityFormater';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// API Response Interface - Based on your sample data
export interface StockReceiveItem {
  period: string | null;
  periodStr: string;
  supplierInvNo: string;
  grnDate: string | null;
  grnDateStr: string;
  supplierId: string;
  supplierName: string;
  supplierInvDateStr: string;
  supplierInvDateStrDate: string | null;
  supplierInvDateStrDateStr: string;
  poNumber: string;
  ourInvoiceNumber: string;
  locName: string;
  discount: number;
  netInvValue: number;
  totalGp: number;
  gross?: number;
  userId: string;
  createdDataTime: string;
  // Optional fields that might be in API response
  invStatusFk?: number;
  [key: string]: any;
}

const StockReceiveInvoiceTable = ({ onBack }) => {
  const [data, setData] = useState<StockReceiveItem[]>([]);
  const formatter = useEntityFormatter();
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<StockReceiveItem | null>(null);
  const [period, setPeriod] = useState<string>('');
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filteredData, setFilteredData] = useState<StockReceiveItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);

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
    fetchStockReceiveData(newPeriod);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    
    if (selectedMonth !== null) {
      const newPeriod = formatDateForApi(selectedMonth, newYear);
      setPeriod(newPeriod);
      fetchStockReceiveData(newPeriod);
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
        fetchStockReceiveData(initialPeriod);
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
    fetchStockReceiveData(initialPeriod);
  }, []);

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
      setSessionExpired(true);
      console.error('Error formatting date:', error);
      return dateTimeStr;
    }
  };

  // Define handleViewClick
  const handleViewClick = (rowData: StockReceiveItem) => {
    console.log('View clicked for Invoice:', rowData.supplierInvNo);
    console.log('Full row data:', rowData);
    setSelectedRow(rowData);
  };

  // Use useMemo for columns - WITH S.No column and sorting
  const columns = useMemo(() => [
  
    {
  id: 'sno',
  header: 'S.No',
  cell: (info: any) => {
    // Calculate serial number based on current page and position in current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const rowIndex = info.row.index; // This is the index in the filtered data
    const serialNumber = startIndex + (rowIndex % rowsPerPage) + 1;
    
    return (
      <span className="text-[11px] font-medium text-gray-600 text-center block">
        {serialNumber}
      </span>
    );
  },
  size: 45,
  enableSorting: false,
},
    {
      id: 'supplierName',
    
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
      accessorFn: (row) => `${row.supplierId} ${row.supplierName}`, // For sorting
      cell: (info: any) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium leading-tight text-black">{info.row.original.supplierId || 'N/A'}</div>
          <div className="text-[10px] t leading-tight break-words">{info.row.original.supplierName || 'N/A'}</div>
        </div>
      ),
      size: 130,
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      id: 'ourInvoiceNumber',
    
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Our Invoice No</span>
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
      accessorKey: 'ourInvoiceNumber',
      cell: (info: any) => (
        <span className="text-[11px] font-medium text-black break-words block max-w-[100px]">
          {info.row.original.ourInvoiceNumber || 'N/A'}
        </span>
      ),
      size: 100,
      enableSorting: true,
    },
    {
      id: 'supplierInvNo',
    
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Supp.Inv.no</span>
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
      accessorKey: 'supplierInvNo',
      cell: (info: any) => (
        <span className="text-[11px] font-medium text-black break-words block max-w-[90px]">
          {info.row.original.supplierInvNo || 'N/A'}
        </span>
      ),
      size: 85,
      enableSorting: true,
    },
    {
      id: 'supplierInvDateStr',
     size: 85,
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Supp.Inv.Date</span>
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
     accessorFn: (row: TableTypeDense) => row.supplierInvDateStr,
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
},
     
    {
      id: 'gross',
   
           header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Gross</span>
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
      accessorKey: 'gross',
      cell: (info: any) => {
        const value = info.row.original.gross || 0;
        const num = Number.parseFloat(value);
        const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
      },
      size: 70,
      enableSorting: true,
      sortingFn: 'alphanumeric',
    },
    {
      id: 'discount',
 
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
      accessorKey: 'discount',
      cell: (info: any) => {
        const value = info.row.original.discount || 0;
        const num = Number.parseFloat(value);
        const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
      },
      size: 65,
      enableSorting: true,
    },
    {
      id: 'netInvValue',
      
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
      accessorKey: 'netInvValue',
      cell: (info: any) => {
        const value = info.row.original.netInvValue || 0;
        const num = Number.parseFloat(value);
        const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
      },
      size: 75,
      enableSorting: true,
    },
    {
      id: 'userId',
 
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
      accessorKey: 'userId',
      cell: (info: any) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium leading-tight text-black break-words">{info.row.original.userId}</div>
          <div className="text-[9px] text- leading-tight break-words">{formatDateTime(info.row.original.createdDataTime)}</div>
        </div>
      ),
      size: 110,
      enableSorting: true,
    },
    {
      id: 'view',
      header: 'View',
      cell: (info: any) => (
        <button
          className="text-blue-600 hover:text-blue-800 text-[11px] px-1 py-0.5 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
          onClick={() => handleViewClick(info.row.original)}
          title="View Details"
        >
          <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
        </button>
      ),
      size: 60,
      enableSorting: false,
    },
  ], [formatter, currentPage, rowsPerPage]);

  // Custom search function
  const searchData = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return data;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    
    return data.filter(item => {
      const fieldsToSearch = [
        item.supplierInvNo,
        item.supplierId,
        item.supplierName,
        item.ourInvoiceNumber,
        item.locName,
        item.supplierInvDateStr,
        item.poNumber,
        item.userId,
        item.discount?.toString(),
        item.netInvValue?.toString(),
        item.totalGp?.toString(),
        item.gross?.toString(),
      ];

      const dateFields = [
        item.supplierInvDateStr,
        item.grnDateStr,
        item.supplierInvDateStrDateStr,
        item.periodStr,
        item.createdDataTime,
      ];

      const matchesRegularFields = fieldsToSearch.some(field => 
        field && field.toString().toLowerCase().includes(searchLower)
      );

      const matchesDateFields = dateFields.some(dateField => {
        if (!dateField) return false;
        return dateField.toLowerCase().includes(searchLower);
      });

      return matchesRegularFields || matchesDateFields;
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setGlobalFilter(searchValue);
    setCurrentPage(1); // Reset to first page on search
    
    if (searchValue.trim()) {
      const results = searchData(searchValue);
      setFilteredData(results);
    } else {
      setFilteredData(data);
    }
  };

  // Fetch data from API
  const fetchStockReceiveData = async (selectedPeriod: string) => {
    console.log('Fetching data for period:', selectedPeriod);
    setIsLoading(true);
    setError(null);
    setGlobalFilter('');
    setFilteredData([]);
    setCurrentPage(1); // Reset to first page on new data fetch
    setSorting([]); // Reset sorting on new data fetch
    
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }
    
    try {
      setIsLoading(true);
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/listReceiveInvoice/${selectedPeriod}`;
      
      console.log('API URL:', apiUrl);
      
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
      console.log('API Response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        setFilteredData(result.data);
        console.log('Data set to state:', result.data.length, 'items');
      } else {
        console.warn('API returned empty or invalid data:', result);
        setData([]);
        setFilteredData([]);
        if (!result.success) {
          setError(result.message || 'API returned unsuccessful response');
        }
      }
    } catch (err) {
      setSessionExpired(true);
      console.error('Error fetching stock receive data:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred while fetching data');
      }
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Excel function
  const exportToExcel = async () => {
    if (!period) {
      alert('Please select a period first');
      return;
    }

    console.log('Exporting to Excel for period:', period);
    setExportLoading(true);

    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }

    const excelApiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/receiveInvoiceExcel/${period}`;
    
    try {
      const response = await fetch(excelApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Server returned empty file');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReceiveInvoiceList_${period}.xlsx`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`Excel file downloaded successfully!`, {
        duration: 3000,
        position: 'top-right',
      });
      
    } catch (err) {
      setSessionExpired(true);
      console.error('Export error details:', err);
      toast.error(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExportLoading(false);
    }
  };

  const [columnVisibility] = useState({});

  const table = useReactTable({
    data: filteredData,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { 
      columnVisibility,
      globalFilter,
      sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleAddClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // Calculate pagination for table
  const totalRows = table.getRowModel().rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = table.getRowModel().rows.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  // If selectedRow exists, return StockReceiveInvoiceView
  if (selectedRow) {
    console.log('Rendering StockReceiveInvoiceView for Invoice:', selectedRow.supplierInvNo);
    return (
      <StockReceiveInvoiceView
        rowData={selectedRow}
        onBack={() => {
          console.log('Going back from view');
          setSelectedRow(null);
        }}
      />
    );
  }

  // Dashboard Cards Component - REDESIGNED
  const DashboardCards = () => {
    const receivedCount = data.filter(item => item.invStatusFk === 1).length;
    const notReceivedCount = data.filter(item => item.invStatusFk === 0 || !item.invStatusFk).length;
    const totalCount = data.length;

    const SmallCard = [
      {
        icon: "mdi:clipboard-list-outline",
        num: totalCount,
        title: "Total No.of Lists",
        shape: shape3,
        bgcolor: "warning",
        colorClass: "warning",
      },
      {
        icon: "mdi:check-circle-outline",
        num: receivedCount,
        title: "Received",
        shape: shape1,
        bgcolor: "error",
        colorClass: "error",
      },
      {
        icon: "mdi:clock-outline",
        num: notReceivedCount,
        title: "Not Received",
        shape: shape2,
        bgcolor: "secondary",
        colorClass: "secondary",
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
                {/* Left side - Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 truncate">{theme.title}</p>
                  <div className="flex items-center gap-2">
                    <h5 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{theme.num}</h5>
                  </div>
                  <p className="text-xs text-black mt-0.5 truncate hidden sm:block">
                    {theme.desc}
                  </p>
                </div>
                
                {/* Right side - Icon with background */}
                <div className="flex-shrink-0 ml-2">
                  <span
                    className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white bg-${theme.bgcolor}`}
                  >
                    <Icon icon={theme.icon} height={12} className="sm:h-[16px] md:h-[20px]" />
                  </span>
                </div>
              </div>
              
              {/* Background shape image */}
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
  const StockReceiveGrid = () => {
    const getStatusBadge = (status: number | undefined) => {
      if (status === 0) {
        return { color: 'blue', text: 'Not Received' };
      } else if (status === 1) {
        return { color: 'warning', text: 'Received' };
      }
      return { color: 'gray', text: 'Pending' };
    };

    // Calculate pagination for grid
    const totalGridRows = filteredData.length;
    const totalGridPages = Math.ceil(totalGridRows / gridRowsPerPage);
    const gridStartIndex = (gridCurrentPage - 1) * gridRowsPerPage;
    const gridEndIndex = gridStartIndex + gridRowsPerPage;
    const currentGridItems = filteredData.slice(gridStartIndex, gridEndIndex);

    // Reset to first page when search changes
    useEffect(() => {
      setGridCurrentPage(1);
    }, [globalFilter]);

    return (
      <>
        <DashboardCards />
        
        {/* Scrollable Cards Container */}
        <div className="relative grid-container-scroll max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
            {currentGridItems.map((item, index) => {
              const status = getStatusBadge(item.invStatusFk);
              
              return (
                <CardBox 
                  key={item.supplierInvNo || index} 
                  className="hover:shadow-md transition-shadow duration-300 border border-gray-200 h-auto p-3 sm:p-4"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.supplierInvNo || 'N/A'}</h3>
                      <p className="text-xs text-black mt-0.5 truncate">{item.ourInvoiceNumber || 'No Our Invoice'}</p>
                      <p className="text-xs text-black mt-0.5 font-bold truncate">
                        <span className='text-blue-600'>PO No: </span>{item.poNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Badge color={status.color} className="text-xs py-0.5 px-1.5 sm:px-2 whitespace-nowrap">
                        {status.text}
                      </Badge>
                      <button
                        onClick={() => handleViewClick(item)}
                        className="p-1 sm:p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Supplier Info */}
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:factory" className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate">Supplier</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">{item.supplierId || 'N/A'}</p>
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{item.supplierName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Financial Info */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    <div className="bg-blue-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:currency-inr" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-600">Gross</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {Number(item.gross || 0).toFixed(2)}
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
                        ₹{Number(item.netInvValue || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom Info Row */}
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-md mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black mb-0.5">Supp.Inv.Date</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {item.supplierInvDateStr || 'N/A'}
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
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300'
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
        {filteredData.length === 0 && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg text-center">
            <Icon icon="mdi:package-variant-closed" className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-gray-600">No records found for this period</p>
            <p className="text-xs sm:text-sm text-black mt-1">Try selecting a different period</p>
          </div>
        )}
        
        {filteredData.length > 0 && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-800">{filteredData.length}</span> items for period: 
                  <span className="font-bold text-blue-600 ml-1">{period}</span>
                  {globalFilter && (
                    <span className="ml-2 text-gray-500">
                      (Filtered by: <span className="font-medium">"{globalFilter}"</span>)
                    </span>
                  )}
                </p>
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
    <div className="w-full max-w-full mx-auto px-2 sm:px-2">
      {/* Header with Title and Toggle Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-">
        <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-700 whitespace-nowrap">Receive Invoice List</h1>
        
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
          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Period Picker */}
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
                <CalendarDays className="absolute right-100 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
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
            <div className="w-full sm:max-w-xs">
              <input
                type="text"
                placeholder={`Search ${data.length} records...`}
                className="form-control-input w-74 px-3 py-2 sm:py-2.5 border rounded-md text-sm"
                value={globalFilter}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="pb- sm:pb-"></div>
          
          {error && (
            <div className="text-center py-4 sm:py-6 bg-red-50 rounded-md px-3 sm:px-4">
              <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-red-600 font-medium mb-1 sm:mb-2">Error loading data</p>
              <p className="text-xs sm:text-sm text-red-500 mb-3 sm:mb-4 break-words">{error}</p>
              <button 
                onClick={() => fetchStockReceiveData(period)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!isLoading && !error && (
            <>
              {viewMode === 'table' ? (
                <>
                  <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
                      <div className="min-w-[1000px] lg:min-w-full">
                        <div className="overflow-auto max-h-[380px] relative">
                          <table className="w-full divide-y divide-gray-200 table-fixed" style={{ tableLayout: 'fixed' }}>
                            <thead className='sticky top-0 z-10 h-8'>
                              {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-blue-600">
                                  {headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      className={`px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight ${
                                        header.column.getCanSort() ? 'cursor-pointer hover:bg-blue-700' : ''
                                      }`}
                                      style={{ width: `${header.column.columnDef.size || 80}px` }}
                                      onClick={header.column.getToggleSortingHandler()}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>
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
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
                              {currentRows.length > 0 ? (
                                currentRows.map((row, index) => (
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
                                  <td colSpan={columns.length} className="px-3 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                      <Icon icon="mdi:database-outline" className="w-6 h-6 text-gray-300 mb-1" />
                                      <p className="text-black text-xs font-medium">
                                        {globalFilter ? 'No matching records found' : 'No records found'}
                                      </p>
                                      <p className="text-gray-400 text-[10px] mt-0.5">
                                        {globalFilter ? `No results for: "${globalFilter}"` : `No data for period: ${period}`}
                                      </p>
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
                  
                  {data.length > 0 && (
                    <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600">
                      <div>
                        Showing <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">{data.length}</span> records
                        {globalFilter && (
                          <span> for search: <span className="font-medium">"{globalFilter}"</span></span>
                        )}
                        {!globalFilter && (
                          <span> for period: <span className="font-medium">{period}</span></span>
                        )}
                        {sorting.length > 0 && (
                          <span className="ml-2 text-blue-600">
                            (Sorted by: {sorting.map(s => `${s.id} ${s.desc ? '↓' : '↑'}`).join(', ')})
                          </span>
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
                <StockReceiveGrid />
              )}
            </>
          )}
        </div>
      </div>
      
      {sessionExpired && <SessionModal />}
      
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

export default StockReceiveInvoiceTable;