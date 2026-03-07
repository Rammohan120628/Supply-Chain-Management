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
export interface ReceiveItem {
  receiveHeadPK: number;
  receivedeltailPk: number;
  receiveHeadFK: number;
  locationFK: number;
  expiryDate: string | null;
  traceItemPk: number;
  itemFK: number;
  userUniqueCode: string | null;
  supplierName: string | null;
  period: string | null;
  retrunDate: string | null;
  locationId: string;
  locationName: string;
  entityId: string | null;
  currencyId: string | null;
  currencyRate: number;
  discPer: number;
  lastUser: string | null;
  lastUpdate: string | null;
  receiveTranNum: string;
  remainQuantity: number;
  lastPurchPrice: number;
  entOrder: number;
  itemId: number;
  itemName: string | null;
  batchNo: string | null;
  ip02: number;
  packageId: string | null;
  quantity: number;
  totalCost: number;
  totalCostCp: number;
  totalCostIp: number;
  renderGp: boolean;
  renderIp: boolean;
  stockGp: number;
  stockCp: number;
  gp: number;
  cp: number;
  binNo: string | null;
  userFk: number;
  supplierId: string | null;
  userId: string;
  createdDataTime: string;
  subList: any[] | null;
  periodStr: string;
  retrunDateStr: string;
  expiryDateStr: string | null;
}

export interface TableTypeDense {
  id?: number;
  siNo?: number;
  period?: string;
  returnId?: string;
  returnDate?: string;
  locationId?: string;
  totalGp?: number;
  totalCp?: number;
  totalIp?: number;
  createdBy?: string;
  receiveItem?: ReceiveItem;
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
  
// Custom filter function for global search
const globalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue) return true;
  
  const searchTerm = String(filterValue).toLowerCase().trim();
  if (!searchTerm) return true;
  
  // Search through all columns/values of the row
  const rowValues: string[] = [];
  
  // Helper function to extract values recursively
  const extractValues = (obj: any): string[] => {
    if (!obj) return [];
    
    const values: string[] = [];
    
    // Handle primitive values
    if (typeof obj !== 'object') {
      return [String(obj).toLowerCase()];
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        values.push(...extractValues(item));
      });
      return values;
    }
    
    // Handle objects
    Object.values(obj).forEach(value => {
      if (value === null || value === undefined) return;
      
      if (typeof value === 'object') {
        values.push(...extractValues(value));
      } else {
        values.push(String(value).toLowerCase());
      }
    });
    
    return values;
  };
  
  // Extract all values from the row
  const allValues = extractValues(row.original);
  
  // Check if any value contains the search term
  return allValues.some(value => 
    value && value.includes(searchTerm)
  );
};

// Define columns for main table - REDESIGNED with compact styling


const RecItemTable = ({ onBack }) => {

  const formatter = useEntityFormatter();
  // State management
  const [exportLoading, setExportLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<TableTypeDense[]>([]);
  const [modalData, setModalData] = useState<TableTypeDense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableTypeDense | null>(null);
  const [search, setSearch] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [debouncedModalSearch, setDebouncedModalSearch] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);
  
  // Table states
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [modalColumnFilters, setModalColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalSorting, setModalSorting] = useState<SortingState>([]);
  const [modalGlobalFilter, setModalGlobalFilter] = useState('');
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const defaultColumns1 = [
  columnHelper.accessor('returnId', {
  
        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Return Id</span>
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
    
    cell: (info) => <span className="text-[11px] font-medium text-black break-words block">{info.getValue()}</span>,
    enableSorting: true,
    sortingFn: 'alphanumeric',
    size: 120,
  }),
  columnHelper.accessor('returnDate', {
  size: 100,
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
}),
  columnHelper.accessor('locationId', {

        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Location</span>
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
        <div className="text-[11px] font-medium leading-tight break-all">{info.getValue()}</div>
        <div className="text-[10px] text-black leading-tight break-all">
          {info.row.original.receiveItem?.locationName || 'N/A'}
        </div>
      </div>
    ),
    enableSorting: true,
    sortingFn: 'alphanumeric',
    size: 120,
  }),
  columnHelper.accessor('totalGp', {
 
        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total.Gp</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 70,
  }),
  columnHelper.accessor('totalCp', {
  
       header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total.Cp</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 70,
  }),
  columnHelper.accessor('totalIp', {
 
         header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total.Ip</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 70,
  }),
  columnHelper.accessor('createdBy', {
 
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
        <div className="text-[11px] font-medium leading-tight text-black break-all">{info.getValue()}</div>
        <div className="text-[9px] text- leading-tight break-all">
          {formatDateTime(info.row.original.receiveItem?.createdDataTime)}
        </div>
      </div>
    ),
    enableSorting: true,
    sortingFn: 'alphanumeric',
    size: 110,
  }),
];

// Define columns for modal (item details) - REDESIGNED with compact styling
const defaultColumns2 = [
  columnHelper.accessor('siNo', {
    header: () => <span>SI.NO</span>,
    cell: (info) => <span className="text-[11px] text- w-full ">{info.getValue()}</span>,
    enableSorting: true,
    sortingFn: 'basic',
    size: 50,
  }),
  columnHelper.accessor(row => row.receiveItem?.itemId, {
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
    cell: (info) => <span className="text-[11px] text-black">{info.getValue()}</span>,
    enableSorting: true,
    sortingFn: 'basic',
    size: 70,
  }),
  columnHelper.accessor(row => row.receiveItem?.itemName, {
    id: 'itemName',
         header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Item Name</span>
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
 
    cell: (info) => <span className="text-[11px] text-black break-words block max-w-[150px]">{info.getValue() || 'N/A'}</span>,
    enableSorting: true,
    sortingFn: 'alphanumeric',
    size: 150,
  }),
  columnHelper.accessor(row => row.receiveItem?.packageId, {
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
  columnHelper.accessor(row => row.receiveItem?.quantity, {
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
    size: 60,
  }),
  columnHelper.accessor(row => row.receiveItem?.gp, {
    id: 'gp',

       header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Gp</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 60,
  }),
  columnHelper.accessor(row => row.receiveItem?.cp, {
    id: 'cp',

        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Cp</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 60,
  }),
  columnHelper.accessor(row => row.receiveItem?.ip02, {
    id: 'ip',
  
      header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Ip</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 60,
  }),
  columnHelper.accessor(row => row.receiveItem?.totalCost, {
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
    cell: (info) => (
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 70,
  }),
  columnHelper.accessor(row => row.receiveItem?.totalCostCp, {
    id: 'totalCp',

     header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total CP</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 70,
  }),
  columnHelper.accessor(row => row.receiveItem?.totalCostIp, {
    id: 'totalIp',

     header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total IP</span>
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
      <span className="text-[11px] text-blue-600 font-medium text-right w-full block">
        {info.getValue()?.toFixed(2) || '0.00'}
      </span>
    ),
    enableSorting: true,
    sortingFn: 'basic',
    size: 70,
  }),
  
];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const periodOptions = [...months];

  const isPeriodSelected = (index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  };
  
  const formatDateForDisplay = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };
  
  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  // Handle grid page changes
  const handleGridPageChange = (page: number) => {
    setGridCurrentPage(page);
    const gridContainer = document.querySelector('.grid-container-scroll');
    if (gridContainer) {
      gridContainer.scrollTop = 0;
    }
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
  
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  // Parse stockPeriod from localStorage and set the month/year
  useEffect(() => {
    const stockPeriod = localStorage.getItem("stockPeriod");
    
    if (stockPeriod) {
      console.log('stockPeriod from localStorage:', stockPeriod);
      
      const parts = stockPeriod.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        console.log('Parsed parts:', { day, month, year });
        
        if (!isNaN(month) && !isNaN(year)) {
          setSelectedMonth(month - 1);
          setSelectedYear(year);
          
          const formattedMonth = String(month).padStart(2, '0');
          const apiPeriod = `01-${formattedMonth}-${year}`;
          setPeriod(apiPeriod);
          
          console.log('Setting period to:', apiPeriod);
          fetchData(apiPeriod);
          return;
        }
      }
    }
    
    console.log('Using fallback current month');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    const initialPeriod = formatDateForApi(currentMonth, currentYear);
    setPeriod(initialPeriod);
    fetchData(initialPeriod);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/receiveItemToLocationList/${periodParam}`;
      
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
        const transformedData = result.data.map((item: ReceiveItem, index: number) => ({
          id: item.receiveHeadPK,
          siNo: index + 1,
          period: item.periodStr || periodParam,
          returnId: item.receiveTranNum,
          returnDate: item.retrunDateStr,
          locationId: item.locationId,
          totalGp: item.totalCost,
          totalCp: item.totalCostCp,
          totalIp: item.totalCostIp,
          createdBy: item.userId,
          receiveItem: item,
        }));
        
        setData(transformedData);
        setGlobalFilter('');
      } else {
        toast.error(result.message || 'Failed to load data');
        setData([]);
      }
    } catch (error: any) {
      setSessionExpired(true);
      console.error('Error fetching data:', error);
      toast.error(`Failed to fetch data: ${error.message}`);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sublist data for modal
  const fetchSubListData = async (headPk: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }

    setModalLoading(true);
    try {
      setIsLoading(true);

      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/receiveItemToLocationSubList/${headPk}`;
      
      console.log('Fetching sublist data for headPk:', headPk);
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
        const modalTransformedData = result.data.map((item: any, index: number) => ({
          id: index,
          siNo: index + 1,
          receiveItem: item,
        }));
        
        setModalData(modalTransformedData);
        setModalGlobalFilter('');
      } else {
        toast.error(result.message || 'Failed to load sublist data');
        setModalData([]);
      }
    } catch (error: any) {
      setSessionExpired(true);
      console.error('Error fetching sublist data:', error);
      toast.error(`Failed to fetch sublist data: ${error.message}`);
      setModalData([]);
    } finally {
      setModalLoading(false);
      setIsLoading(false);
    }
  };

  // Handle view click - fetch sublist data
  const handleViewClick = (rowData: TableTypeDense) => {
    console.log('handleViewClick called for:', rowData.returnId);
    setSelectedRow(rowData);
    setModalSearch('');
    setDebouncedModalSearch('');
    setModalGlobalFilter('');
    
    const headPk = rowData.receiveItem?.receiveHeadPK;
    if (headPk) {
      fetchSubListData(headPk);
    } else {
      if (rowData.receiveItem?.subList && rowData.receiveItem.subList.length > 0) {
        const modalTransformedData = rowData.receiveItem.subList.map((item: any, index: number) => ({
          id: index,
          siNo: index + 1,
          receiveItem: item,
        }));
        setModalData(modalTransformedData);
        setModalGlobalFilter('');
      } else {
        setModalData([rowData]);
        setModalGlobalFilter('');
      }
    }
    
    setOpenModal(true);
  };

  // Add view column to main table with eye icon
  const columns1 = useMemo(() => [
    columnHelper.accessor('siNo', {
      header: () => <span>S.No</span>,
      cell: (info) => <span className="text-[11px] text-center w-full block">{info.getValue()}</span>,
      enableSorting: true,
      sortingFn: 'basic',
      size: 45,
    }),
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
      const excelApiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/receiveItemFromLocExcel/${period}`;
      
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
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Server returned empty file');
      }
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `ReceiveItemFromLocation.xlsx`;
      
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

  // Table configurations with filtering and sorting
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
    globalFilterFn: globalFilterFn,
    enableSorting: true,
    enableMultiSort: false,
    debugTable: process.env.NODE_ENV === 'development',
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
    globalFilterFn: globalFilterFn,
    enableSorting: true,
    enableMultiSort: false,
    debugTable: process.env.NODE_ENV === 'development',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(debouncedSearch);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setDebouncedSearch(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setModalGlobalFilter(debouncedModalSearch);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [debouncedModalSearch]);

  const handleModalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setModalSearch(value);
    setDebouncedModalSearch(value);
  };

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

  // Filtered grid data
  const filteredGridData = useMemo(() => {
    if (!search) return data;
    
    const searchTerm = search.toLowerCase().trim();
    return data.filter(item => {
      const searchableValues = [
        item.returnId,
        item.returnDate,
        item.locationId,
        item.createdBy,
        item.receiveItem?.locationName,
        item.receiveItem?.userId,
        item.period,
        String(item.totalGp),
        String(item.totalCp),
        String(item.totalIp)
      ].map(val => val?.toString().toLowerCase() || '');
      
      return searchableValues.some(val => val.includes(searchTerm));
    });
  }, [data, search]);

  // Dashboard Cards Component - REDESIGNED
  const DashboardCards = () => {
    const totalCount = data.length;
    const recentCount = data.filter(item => {
      if (!item.receiveItem?.createdDataTime) return false;
      const createdDate = new Date(item.receiveItem.createdDataTime);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;
    const olderCount = totalCount - recentCount;

    const SmallCard = [
      {
        icon: "mdi:clipboard-list-outline",
        num: totalCount,
        title: "Total Items",
        shape: shape3,
        bgcolor: "warning",
        colorClass: "warning",
        desc: "Total Receive Items Count",
      },
      {
        icon: "mdi:check-circle-outline",
        num: recentCount,
        title: "Recent (30 days)",
        shape: shape1,
        bgcolor: "error",
        colorClass: "error",
        desc: "Items created in last 30 days",
      },
      {
        icon: "mdi:history",
        num: olderCount,
        title: "Older Items",
        shape: shape2,
        bgcolor: "secondary",
        colorClass: "secondary",
        desc: "Items older than 30 days",
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
  const ReceiveItemGrid = () => {
    // Calculate pagination for grid
    const totalGridRows = filteredGridData.length;
    const totalGridPages = Math.ceil(totalGridRows / gridRowsPerPage);
    const gridStartIndex = (gridCurrentPage - 1) * gridRowsPerPage;
    const gridEndIndex = gridStartIndex + gridRowsPerPage;
    const currentGridItems = filteredGridData.slice(gridStartIndex, gridEndIndex);

    // Reset to first page when search changes
    useEffect(() => {
      setGridCurrentPage(1);
    }, [search]);

    return (
      <>
        <DashboardCards />
        
        <div className="relative grid-container-scroll max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
            {currentGridItems.map((item, index) => (
              <CardBox 
                key={item.id || index} 
                className="hover:shadow-md transition-shadow duration-300 border border-gray-200 h-auto p-3 sm:p-4"
              >
                {/* Card Header with View button integrated */}
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.returnId || 'N/A'}</h3>
                    <p className="text-xs text-black mt-0.5 truncate">{item.returnDate || 'No Date'}</p>
                    <p className="text-xs text-black mt-0.5 font-bold truncate">
                      <span className='text-blue-600'>Location: </span>{item.locationId || 'N/A'}
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
                
                {/* Location Info */}
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Icon icon="mdi:map-marker" className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-600 truncate">Location Details</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 break-words">{item.locationId || 'N/A'}</p>
                  <p className="text-xs text-gray-600 break-words line-clamp-2">
                    {item.receiveItem?.locationName || 'N/A'}
                  </p>
                </div>
                
                {/* Financial Info - Compact */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                  <div className="bg-blue-50 p-1.5 sm:p-2 rounded">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon icon="mdi:currency-inr" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="text-xs text-blue-600">GP</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                      {Number(item.totalGp || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-1.5 sm:p-2 rounded">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon icon="mdi:currency-inr" className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-green-600">CP</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                      {Number(item.totalCp || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-1.5 sm:p-2 rounded">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon icon="mdi:currency-inr" className="w-3 h-3 text-purple-600 flex-shrink-0" />
                      <span className="text-xs text-purple-600">IP</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                      {Number(item.totalIp || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {/* Bottom Info Row */}
                <div className="bg-blue-50 p-2 sm:p-3 rounded-md mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-black mb-0.5">Return Date</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {item.returnDate || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="flex-1 min-w-100px text-right">
                      <p className="text-xs text-black mb-0.5">Created By</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 break-all">{item.createdBy || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardBox>
            ))}
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
        {filteredGridData.length === 0 && search && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
            <Icon icon="mdi:database-outline" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No results found for "{search}"</p>
          </div>
        )}
        
        {filteredGridData.length > 0 && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-800">{filteredGridData.length}</span> items for period: 
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

  // Sort indicator component
 

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-2  ">
      {/* Header with Title and Toggle Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-1 sm:mb-">
        <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-700 whitespace-normal break-words">
          Receive Item From Location
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
          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
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
                <CalendarDays className="absolute right-110 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
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
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder={`Search ${data.length} records...`}
                className="form-control-input w-74 px-3 py-2 sm:py-2.5 border rounded-md text-sm"
                disabled={isLoading}
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="pb- sm:pb-"></div>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Loading data for period: {period}...</p>
            </div>
          )}
          
          {!isLoading && data.length === 0  && (
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
                          <table className="w-full divide-y divide-gray-200 table-fixed" style={{ tableLayout: 'fixed' }}>
                            <thead className='sticky top-0 z-10 h-8'>
                              {table1.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-blue-600">
                                  {headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer hover:bg-blue-700"
                                      style={{ width: `${header.column.columnDef.size || 80}px` }}
                                      onClick={header.column.getToggleSortingHandler()}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="truncate">
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
                        Showing <span className="font-medium">{filteredGridData.length}</span> of <span className="font-medium">{data.length}</span> records
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
                <ReceiveItemGrid />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal - UPDATED with compact styling */}
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
                className="form-control-input w-full sm:w-64 px-3 lg:ml-130 py-1.5 text-sm border rounded-md"
                autoFocus
              />
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-1">
            <div className="relative w-full sm:w-auto">
            
              {modalSearch && (
                <button
                  onClick={() => {
                    setModalSearch('');
                    setDebouncedModalSearch('');
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              )}
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
                <thead className="sticky top-0 z-10 ">
                  {table2.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-blue-600">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-2 py-1.5 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer hover:bg-blue-700 whitespace-nowrap"
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
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {table2.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50/50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-2 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[20px] flex items-start text-[11px]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {!modalLoading && modalData.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No item details available
                </div>
              )}
              
              {modalSearch && table2.getRowModel().rows.length === 0 && modalData.length > 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No results found for search: <strong>"{modalSearch}"</strong>
                </div>
              )}
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
      
      <Toaster position="top-right" />
    </div>
  );
};

export default RecItemTable;