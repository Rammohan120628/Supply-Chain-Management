import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Badge, Tooltip, Modal, Button, Card, Breadcrumb } from 'flowbite-react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import StockReceiveView from './StockReceiveView';
import { Icon } from '@iconify/react/dist/iconify.js';
import toast from 'react-hot-toast';
import CardBox from 'src/components/shared/CardBox';
import shape1 from "/src/assets/images/shapes/danger-card-shape.png";
import shape2 from "/src/assets/images/shapes/secondary-card-shape.png";
import shape3 from "/src/assets/images/shapes/success-card-shape.png";
import { CalendarDays, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import SessionModal from '../SessionModal';
import { useEntityFormatter } from '../Entity/UseEntityFormater';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ModalHeader ,ModalBody,ModalFooter} from 'flowbite-react';
import { MdKeyboardArrowRight } from 'react-icons/md';

// API Response Interface - Based on your sample data
export interface StockReceiveItem {
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
  totalGp: number;
  supplierInvDateStr: string;
  userId: string;
  createdDataTime: string;
  invStatusFk?: number;
  [key: string]: any;
}

// Filter Modal Component
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: Record<string, string>) => void;
  currentFilters: Record<string, string>;
  columns: any[];
}

const FilterModal = ({ isOpen, onClose, onApplyFilter, currentFilters, columns }: FilterModalProps) => {
  const [filters, setFilters] = useState<Record<string, string>>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleApply = () => {
    // Remove empty filters
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined)
    );
    onApplyFilter(cleanedFilters);
    onClose();
  };

  const getInputType = (columnId: string) => {
    if (['totalGp', 'discAmount', 'netInvoice'].includes(columnId)) {
      return 'number';
    }
    if (columnId === 'invoiceStatus' || columnId === 'invStatusFk') {
      return 'select';
    }
    return 'text';
  };

  const getSelectOptions = (columnId: string) => {
    if (columnId === 'invoiceStatus' || columnId === 'invStatusFk') {
      return [
        { value: '', label: 'All' },
        { value: '0', label: 'Not Received' },
        { value: '1', label: 'Received' }
      ];
    }
    return [];
  };

const getHeaderName = (column: any): string => {
  if (typeof column.header === 'string') return column.header;
  if (column.id === 'supplierName') return 'Supplier Name';
  if (column.id === 'locId') return 'Location';
  if (column.id === 'grnPo') return 'GRN/PO No';
  if (column.id === 'delNote') return 'Delivery Note No';
  if (column.id === 'supplierInvDateStr') return 'Supplier Delivery Date';
  if (column.id === 'totalGp') return 'Total GP';
  if (column.id === 'discAmount') return 'Discount Amount';
  if (column.id === 'netInvoice') return 'Net Invoice';
  if (column.id === 'invoiceStatus') return 'Invoice Status';
  if (column.id === 'userId') return 'Created By';
  return column.id;
};

  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" popup>
      <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Filter className="w-5 h-5" />
          Advanced Filters
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
          {columns.map(column => {
            if (column.id === 'serialNo' || column.id === 'view') return null;
            
            const inputType = getInputType(column.id);
            const headerName = getHeaderName(column);
            
            return (
              <div key={column.id} className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  {headerName}
                </label>
                {inputType === 'select' ? (
                  <select
                    value={filters[column.id] || ''}
                    onChange={(e) => handleFilterChange(column.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {getSelectOptions(column.id).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={inputType}
                    value={filters[column.id] || ''}
                    onChange={(e) => handleFilterChange(column.id, e.target.value)}
                    placeholder={`Filter by ${headerName.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    step={inputType === 'number' ? '0.01' : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>
      </ModalBody>
      <ModalFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <Button color="light" onClick={handleClearFilters}>
          Clear All
        </Button>
        <div className="flex gap-2">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

const StockReceiveTable = ({ onBack }) => {
  const [data, setData] = useState<StockReceiveItem[]>([]);
  const formatter = useEntityFormatter(); 
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState([]);
  
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<StockReceiveItem | null>(null);
  const [period, setPeriod] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filteredData, setFilteredData] = useState<StockReceiveItem[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({});

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const periodOptions = [...months];
  
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);

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

  // Parse stockPeriod from localStorage (format: dd-mm-yyyy)
  const parseStockPeriod = (stockPeriod: string | null): { month: number | null, year: number | null } => {
    if (!stockPeriod) return { month: null, year: null };
    
    try {
      const parts = stockPeriod.split('-');
      if (parts.length >= 2) {
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(month) && !isNaN(year)) {
          return { month, year };
        }
      }
    } catch (error) {
      setSessionExpired(true);
      console.error('Error parsing stockPeriod:', error);
    }
    
    return { month: null, year: null };
  };

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

  const isPeriodSelected = (index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  };

  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  // Initial fetch on component mount
  useEffect(() => {
    const stockPeriod = localStorage.getItem("stockPeriod");
    
    if (stockPeriod) {
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

  const handleViewClick = (rowData: StockReceiveItem) => {
    console.log('View clicked for GRN:', rowData.grnNo);
    
    if (!rowData) {
      console.error('No row data provided');
      toast.error('Cannot view: No data available');
      return;
    }
    
    setSelectedRow(rowData);
  };

  // Apply advanced filters to data
// Apply advanced filters to data - IMPROVED VERSION WITH FIELD MAPPING
const applyAdvancedFilters = useCallback((dataToFilter: StockReceiveItem[], filters: Record<string, string>) => {
  if (Object.keys(filters).length === 0) return dataToFilter;

  // Map column IDs to actual data fields
  const fieldMapping: Record<string, string | string[]> = {
    'supplierName': 'supplierName',
    'locId': 'locId',
    'grnPo': ['grnNo', 'poNumber'], // Composite field - search in both
    'delNote': 'delNote',
    'supplierInvDateStr': 'supplierInvDateStr',
    'totalGp': 'totalGp',
    'discAmount': 'discAmount',
    'netInvoice': 'netInvoice',
    'invoiceStatus': 'invStatusFk',
    'userId': 'userId',
    // Add more mappings as needed
  };

  return dataToFilter.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '') return true;

      // Get the actual data field(s) to search in
      const dataFields = fieldMapping[key] || key;
      
      // Handle composite fields (arrays)
      if (Array.isArray(dataFields)) {
        return dataFields.some(field => {
          const itemValue = item[field];
          if (itemValue === undefined || itemValue === null) return false;
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }

      // Handle single field
      const itemValue = item[dataFields];
      if (itemValue === undefined || itemValue === null) return false;

      // Handle numeric fields - support partial matching
      if (['totalGp', 'discAmount', 'netInvoice'].includes(dataFields)) {
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      }

      // Handle status fields - exact match
      if (dataFields === 'invStatusFk') {
        return String(itemValue) === value;
      }

      // Handle text fields - case insensitive partial match
      return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    });
  });
}, []);
  // Custom search function
// Custom search function - IMPROVED VERSION
const searchData = useCallback((searchTerm: string, dataToSearch: StockReceiveItem[]) => {
  if (!searchTerm.trim()) {
    return dataToSearch;
  }
  const searchLower = searchTerm.toLowerCase().trim();
  
  return dataToSearch.filter(item => {
    // Create a comprehensive list of all searchable fields
    const searchableFields = [
      item.grnNo,
      item.supplierId,
      item.supplierName,
      item.locId,
      item.locName,
      item.delNote,
      item.poNumber,
      item.userId,
      item.periodStr,
      item.supplierInvDateStr,
      item.grnDateStr,
      item.delNoteDateStr,
      String(item.discAmount || ''),
      String(item.netInvoice || ''),
      String(item.totalGp || ''),
      item.invStatusFk === 0 ? 'not received' : 
      item.invStatusFk === 1 ? 'received' : 'pending'
    ];
    
    return searchableFields.some(field =>
      field && field.toString().toLowerCase().includes(searchLower)
    );
  });
}, []);

const applyAllFilters = useCallback(() => {
  let results = [...data];
  results = applyAdvancedFilters(results, advancedFilters);
  results = searchData(globalFilter, results);
  setFilteredData(results);
  setCurrentPage(1);
  setGridCurrentPage(1);
}, [data, advancedFilters, globalFilter, applyAdvancedFilters, searchData]);

  // Update filtered data when filters change
  useEffect(() => {
    applyAllFilters();
  }, [advancedFilters, globalFilter, data, applyAllFilters]);

const handleApplyFilters = (filters: Record<string, string>) => {
  // Remove empty filters
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined)
  );
  setAdvancedFilters(cleanedFilters);
  setIsFilterModalOpen(false);
};

  const clearAdvancedFilters = () => {
    setAdvancedFilters({});
  };

  // Handle search input change
 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setGlobalFilter(value);
};
// ← Remove applyAllFilters from deps to avoid loop

  // Use useMemo for columns
  const columns = useMemo(() => [
    {
      id: 'serialNo',
      header: 'S.No',
      accessorFn: (_row, index) => index,
      cell: (info: any) => <span className="text-[11px]">{info.row.index + 1}</span>,
      size: 45,
      enableSorting: false
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
      accessorFn: (row) => row.supplierName,
      cell: (info: any) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium leading-tight text-black">{info.row.original.supplierId || 'N/A'}</div>
          <div className="text-[10px] text-  leading-tight break-words">{info.row.original.supplierName || 'N/A'}</div>
        </div>
      ),
      size: 130,
    },
    {
      id: 'locId',
     
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Location Id</span>
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
      accessorFn: (row) => row.locId,
      cell: (info: any) => (
        <div className="min-w-[90px]">
          <div className="text-[11px] font-medium leading-tight text-black">{info.row.original.locId || 'N/A'}</div>
          <div className="text-[10px]  leading-tight break-words">{info.row.original.locName || 'N/A'}</div>
        </div>
      ),
      size: 110,
    },
    {
      id: 'grnPo',
    
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">GRN/PO NO</span>
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
      accessorFn: (row) => row.grnNo,
      cell: (info: any) => (
        <div className="min-w-[90px]">
          <div className="text-[11px] font-medium text-black leading-tight break-words">{info.row.original.grnNo || 'N/A'}</div>
          <div className="text-[10px] leading-tight break-words">{info.row.original.poNumber || 'N/A'}</div>
        </div>
      ),
      size: 110,
    },
    {
      id: 'delNote',
   
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Del Note No</span>
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
      accessorFn: (row) => row.delNote,
      cell: (info: any) => (
        <span className="text-[11px] font-medium text-black break-words block max-w-[90px]">
          {info.row.original.delNote || 'N/A'}
        </span>
      ),
      size: 85,
    },
    // {
    //   id: 'supplierInvDateStr',
    
    //       header: ({ column }) => (
    //   <div
    //     className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
    //     onClick={column.getToggleSortingHandler()}
    //   >
    //     <span className="font-medium text-white text-[10px] uppercase">Supp.Del.Date</span>
    //     {column.getCanSort() && (
    //       <span className="text-[10px]">
    //         {{
    //           asc: ' 🔼',
    //           desc: ' 🔽',
    //         }[column.getIsSorted() as string] ?? ' ↕️'}
    //       </span>
    //     )}
    //   </div>
    // ),
    //   accessorFn: (row) => row.supplierInvDateStr,
    //   cell: (info: any) => (
    //     <span className="text-[11px] break-words text-black block max-w-[85px]">
    //       {info.row.original.supplierInvDateStr || 'N/A'}
    //     </span>
    //   ),
    //   size: 85,
    // },
      {
  id: 'supplierInvDateStr',
  size: 85,
  header: ({ column }) => (
    <div
      className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
      onClick={column.getToggleSortingHandler()}
    >
      <span className="font-medium text-white text-[10px] uppercase">Supp.Del.Date</span>
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
      id: 'totalGp',
     
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Total Gp</span>
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
      accessorFn: (row) => row.totalGp,
      cell: (info: any) => {
        const value = info.row.original.totalGp || 0;
        const num = Number.parseFloat(value);
        const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
      },
      size: 70,
    },
    {
      id: 'discAmount',
     
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
      accessorFn: (row) => row.discAmount,
      cell: (info: any) => {
        const value = info.row.original.discAmount || 0;
        const num = Number.parseFloat(value);
        const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
      },
      size: 65,
    },
    {
      id: 'netInvoice',
   
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
      accessorFn: (row) => row.netInvoice,
      cell: (info: any) => {
        const value = info.row.original.netInvoice || 0;
        const num = Number.parseFloat(value);
        const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
        return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
      },
      size: 75,
    },
    {
      id: 'invoiceStatus',
   
          header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Invoice Status</span>
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
      accessorFn: (row) => row.invStatusFk,
      cell: (info: any) => {
        const status = info.row.original.invStatusFk;
        let color = 'gray';
        let displayText = 'Pending';
        
        if (status === 0) {
          color = 'warning';
          displayText = 'Not Received';
        } else if (status === 1) {
          color = 'success';
          displayText = 'Received';
        }
        
        return (
          <Badge color={color} className="text-[10px] px-1.5 py-0.5 leading-tight whitespace-nowrap">
            {displayText}
          </Badge>
        );
      },
      size: 85,
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
      accessorFn: (row) => row.userId,
      cell: (info: any) => (
        <div className="min-w-[90px]">
          <div className="text-[11px] font-medium leading-tight  text-black break-all">{info.row.original.userId}</div>
          <div className="text-[9px] leading-tight break-words">{formatDateTime(info.row.original.createdDataTime)}</div>
        </div>
      ),
      size: 110,
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
  ], [formatter]);

  // Fetch data from API
  const fetchStockReceiveData = async (selectedPeriod: string) => {
    console.log('Fetching data for period:', selectedPeriod);
    setIsLoading(true);
    setError(null);
    setGlobalFilter('');
    setAdvancedFilters({});
    setFilteredData([]);
    
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/listReceiveItemFromSupplier/${selectedPeriod}`;
      
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        setFilteredData(result.data);
      } else {
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

    setExportLoading(true);

    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      const excelApiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/downloadReceiveItemFromSupplierExcel/${period}`;
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      
      const response = await fetch(excelApiUrl, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      
      if (responseText.includes('"success":false') || 
          responseText.includes('"error":') || 
          responseText.includes('"message":')) {
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.message || errorJson.error || 'Export failed');
        } catch {
          setSessionExpired(true);
        }
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReceiveItemFromSupplier`;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast.success(`Excel file downloaded for period: ${period}`, {
        duration: 2000,
        position: 'top-right',
      });
      
    } catch (err) {
      setSessionExpired(true);
      console.error('Export error details:', err);
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExportLoading(false);
    }
  };

  const [columnVisibility] = useState({});

  const table = useReactTable({
    data: filteredData,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    state: { 
      columnVisibility,
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  const handleAddClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // If selectedRow exists, return StockReceiveView
  if (selectedRow) {
    return (
      <StockReceiveView
        rowData={selectedRow}
        onBack={() => {
          setSelectedRow(null);
        }}
      />
    );
  }

  // Calculate pagination
  const totalRows = table.getRowModel().rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = table.getRowModel().rows.slice(startIndex, endIndex);

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

  const DashboardCards = () => {
    const receivedCount = data.filter(item => item.invStatusFk === 1).length;
    const notReceivedCount = data.filter(item => item.invStatusFk === 0).length;
    const totalCount = data.length;

    const SmallCard = [
      {
        icon: "mdi:clipboard-list-outline",
        num: totalCount,
        title: "Total No.of Lists",
        shape: shape3,
        bgcolor: "warning",
      },
      {
        icon: "mdi:check-circle-outline",
        num: receivedCount,
        title: "Received",
        shape: shape1,
        bgcolor: "error",
      },
      {
        icon: "mdi:clock-outline",
        num: notReceivedCount,
        title: "Not Received",
        shape: shape2,
        bgcolor: "secondary",
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
                  <h5 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{theme.num}</h5>
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

  // Grid View Component
  const StockReceiveGrid = () => {
    const getStatusBadge = (status: number | undefined) => {
      if (status === 0) {
        return { color: 'blue', text: 'Not Received' };
      } else if (status === 1) {
        return { color: 'warning', text: 'Received' };
      }
      return { color: 'gray', text: 'Pending' };
    };

    const totalGridRows = filteredData.length;
    const totalGridPages = Math.ceil(totalGridRows / gridRowsPerPage);
    const gridStartIndex = (gridCurrentPage - 1) * gridRowsPerPage;
    const gridEndIndex = gridStartIndex + gridRowsPerPage;
    const currentGridItems = filteredData.slice(gridStartIndex, gridEndIndex);

    const handleGridPageChange = (page: number) => {
      setGridCurrentPage(page);
    };

    return (
      <>
        <DashboardCards />
        
        <div className="relative grid-container-scroll max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
            {currentGridItems.map((item, index) => {
              const status = getStatusBadge(item.invStatusFk);
              
              return (
                <CardBox 
                  key={item.grnNo || index} 
                  className="hover:shadow-md transition-shadow duration-300 border border-gray-200 h-auto p-3 sm:p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.grnNo || 'N/A'}</h3>
                      <p className="text-xs text-black mt-0.5 truncate">{item.poNumber || 'No PO'}</p>
                      <p className="text-xs text-black mt-0.5 font-bold truncate">
                        <span className='text-blue-600'>Del Note No: </span>{item.delNote}
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
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:factory" className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate">Supplier</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">{item.supplierId || 'N/A'}</p>
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{item.supplierName || 'N/A'}</p>
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:map-marker" className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate">Location</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">{item.locId || 'N/A'}</p>
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{item.locName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    <div className="bg-blue-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:currency-inr" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-600">GP</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {formatter.formatAmount(Number(item.totalGp || 0))}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:percent" className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-600">Disc</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {formatter.formatAmount(Number(item.discAmount || 0))}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:file-document" className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        <span className="text-xs text-purple-600">Net</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        ₹{formatter.formatAmount(Number(item.netInvoice || 0))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-md mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black mb-0.5">Supp.Del.Date</p>
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
        
        <style>{`
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
  //   const handleCreationClick1 = () => {
  //   // Navigate to purchase order creation page
  //   // This could be a route or a function call
  //   window.location.href = 'ReceiveItemFromSupplier'; 

  // };
  return (
   
  <div className="w-full max-w-[1050px] mx-auto">
      {/* Header with Title and Toggle Button */}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
  <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-700 whitespace-nowrap">
    Receive Item From Supplier List
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
            
            {/* Filter Button */}
            <Tooltip content="Advanced Filters" className='z-50'>
              <Badge
                color="info"
                className={`h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-blue-700 text-xs sm:text-sm relative ${
                  Object.keys(advancedFilters).length > 0 ? 'bg-blue-600 text-white' : ''
                }`}
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="w-4 h-4" />
                {Object.keys(advancedFilters).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                    {Object.keys(advancedFilters).length}
                  </span>
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
          {/* Filter Row - Responsive */}
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
                <CalendarDays className="absolute right-112 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
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
            
            {/* Active Filters Indicator */}
            {Object.keys(advancedFilters).length > 0 && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <span className="bg-blue-50 px-2 py-1 rounded-md">
                  {Object.keys(advancedFilters).length} filter(s) active
                </span>
                <button
                  onClick={clearAdvancedFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-center py-4 sm:py-6 bg-red-50 rounded-md px-3 sm:px-4">
              <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-red-600 font-medium mb-1 sm:mb-2">Error loading data</p>
              <p className="text-xs sm:text-sm text-red-500 mb-3 sm:mb-4 break-words">{error}</p>
              <button 
                onClick={() => period && fetchStockReceiveData(period)}
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
                      <div className="min-w-[1050px] lg:min-w-full ">
                        <div className="overflow-auto max-h-[390px] relative ">
                          <table className="max-w-[1060px] divide-y divide-gray-200 table-fixed" style={{ tableLayout: 'fixed' }}>
                            <thead className='sticky top-0 z-10 h-8'>
                              {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-blue-600">
                                  {headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer hover:bg-blue-700 transition-colors"
                                      style={{ width: `${header.column.columnDef.size || 80}px`, backgroundColor: '#2563eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
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
                            <tbody className="bg- divide-y divide-gray-200">
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
                                  <td colSpan={columns.length} className="px-3 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                      <Icon icon="mdi:database-outline" className="w-6 h-6 text-gray-300 mb-1" />
                                      <p className="text-black text-xs font-medium">
                                        {globalFilter || Object.keys(advancedFilters).length > 0 ? 'No matching records found' : 'No records found'}
                                      </p>
                                      <p className="text-gray-400 text-[10px] mt-0.5">
                                        {globalFilter ? `No results for: "${globalFilter}"` : 
                                         Object.keys(advancedFilters).length > 0 ? 'Try adjusting your filters' : 
                                         `No data for period: ${period}`}
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
                        {Object.keys(advancedFilters).length > 0 && (
                          <span> with <span className="font-medium">{Object.keys(advancedFilters).length}</span> filter(s)</span>
                        )}
                        {!globalFilter && Object.keys(advancedFilters).length === 0 && (
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
                <StockReceiveGrid />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilters}
        currentFilters={advancedFilters}
        columns={columns}
      />
      
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

export default StockReceiveTable;