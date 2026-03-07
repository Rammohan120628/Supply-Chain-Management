import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Badge, Tooltip } from 'flowbite-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';
import { Icon } from '@iconify/react/dist/iconify.js';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import CardBox from 'src/components/shared/CardBox';
import shape1 from "/src/assets/images/shapes/danger-card-shape.png";
import shape2 from "/src/assets/images/shapes/secondary-card-shape.png";
import shape3 from "/src/assets/images/shapes/success-card-shape.png";
import SessionModal from '../SessionModal';
import { useEntityFormatter } from '../Entity/UseEntityFormater';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Define interfaces
export interface OCDData {
  ocdPk: number;
  pcvNo: string;
  accountId: string;
  accountName: string;
  pcvDate: string;
  pcvDescription: string;
  pcvType: string;
  amount: number;
  paymentAmount: number;
  receiptAmount: number;
  balance: number;
  createdBy: number;
  userId: string;
  lastActDate: string;
}

export interface OCDApiResponse {
  success: boolean;
  message: string;
  data: {
    ocdList: OCDData[];
    cashSummary?: {
      openingBalance: number;
    };
  };
}

export interface TableRowData {
  slNo: number;
  pcvNo: string;
  pcvDate: string;
  pcvDescription: string;
  accountName: string;
  receiptAmount: string;
  paymentAmount: string;
  balance: string;
  createdBy: string;
  accountId: string;
  lastActDate: string;
  pcvType: string;
  amount: number;
  originalData: OCDData;
}

const OtherCashTable = ({ onBack }) => {
  const formatter = useEntityFormatter();
  
  // State declarations
  const [data, setData] = useState<OCDData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [screenView, setScreenView] = useState(false);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);
  
  // Use memoized token to prevent unnecessary re-renders
  const token = useMemo(() => localStorage.getItem("authToken"), []);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle grid page changes
  const handleGridPageChange = (page: number) => {
    setGridCurrentPage(page);
    const gridContainer = document.querySelector('.grid-container-scroll');
    if (gridContainer) {
      gridContainer.scrollTop = 0;
    }
  };

  // Create column helper for table
  const columnHelper = createColumnHelper<TableRowData>();
  
  // Sort indicator component

  // Responsive columns for table view - REDESIGNED with compact styling
  const columns = useMemo(() => {
    // For mobile, show fewer columns
    if (isMobile) {
      return [
        columnHelper.accessor('slNo', {
          header: () => <span className="text-white font-semibold text-[10px]">#</span>,
          cell: (info) => <span className="text-[11px] text-center w-full block">{info.getValue()}</span>,
          enableSorting: true,
          size: 35,
        }),
        columnHelper.accessor('pcvNo', {
          header: () => <span className="text-white font-semibold text-[10px]">PCV No</span>,
          cell: (info) => <span className="text-[11px] text-black">{info.getValue()}</span>,
          enableSorting: true,
          size: 80,
        }),
        columnHelper.accessor('pcvDate', {
          header: () => <span className="text-white font-semibold text-[10px]">Date</span>,
          cell: (info) => <span className="text-[11px] text-black">{info.getValue()}</span>,
          enableSorting: true,
          size: 70,
        }),
        columnHelper.accessor('receiptAmount', {
          header: () => <span className="text-white font-semibold text-[10px]">Rec</span>,
          cell: (info) => {
            const value = parseFloat(info.getValue()) || 0;
            const formatted = formatter.formatAmount(value);
            return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
          },
          enableSorting: true,
          size: 60,
        }),
        columnHelper.accessor('paymentAmount', {
          header: () => <span className="text-white font-semibold text-[10px]">Pay</span>,
          cell: (info) => {
            const value = parseFloat(info.getValue()) || 0;
            const formatted = formatter.formatAmount(value);
            return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
          },
          enableSorting: true,
          size: 60,
        }),
        columnHelper.accessor('balance', {
          header: () => <span className="text-white font-semibold text-[10px]">Bal</span>,
          cell: (info) => {
            const value = parseFloat(info.getValue()) || 0;
            const formatted = formatter.formatAmount(value);
            return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
          },
          enableSorting: true,
          size: 60,
        }),
      ];
    }
    
    // For tablet, show more columns but still compact
    if (window.innerWidth < 1024) {
      return [
        columnHelper.accessor('slNo', {
          header: () => <span className="text-white font-semibold text-[10px]">S.No</span>,
          cell: (info) => <span className="text-[11px] text-center w-full block">{info.getValue()}</span>,
          enableSorting: true,
          size: 40,
        }),
        columnHelper.accessor('pcvNo', {
          // header: () => <span className="text-white font-semibold text-[10px]">PCV NO</span>,
              header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">PCV NO</span>
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
          size: 85,
        }),
        columnHelper.accessor('pcvDate', {
          header: () => <span className="text-white font-semibold text-[10px]">Date</span>,
          cell: (info) => <span className="text-[11px] text-black">{info.getValue()}</span>,
          enableSorting: true,
          size: 70,
        }),
        columnHelper.accessor('accountName', {
          header: () => <span className="text-white font-semibold text-[10px]">Account</span>,
          cell: (info) => {
            const rowData = info.row.original;
            const accountId = rowData.accountId || '';
            const accountName = info.getValue() || '';
            
            return (
              <div className="min-w-[100px]">
                <div className="text-[11px] font-medium leading-tight break-all">{accountId}</div>
                <div className="text-[10px] text-black leading-tight break-all">{accountName}</div>
              </div>
            );
          },
          enableSorting: true,
          size: 90,
        }),
        columnHelper.accessor('receiptAmount', {
          header: () => <span className="text-white font-semibold text-[10px]">Receipt</span>,
          cell: (info) => {
            const value = parseFloat(info.getValue()) || 0;
            const formatted = formatter.formatAmount(value);
            return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
          },
          enableSorting: true,
          size: 70,
        }),
        columnHelper.accessor('paymentAmount', {
          header: () => <span className="text-white font-semibold text-[10px]">Payment</span>,
          cell: (info) => {
            const value = parseFloat(info.getValue()) || 0;
            const formatted = formatter.formatAmount(value);
            return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
          },
          enableSorting: true,
          size: 70,
        }),
        columnHelper.accessor('balance', {
          header: () => <span className="text-white font-semibold text-[10px]">Balance</span>,
          cell: (info) => {
            const value = parseFloat(info.getValue()) || 0;
            const formatted = formatter.formatAmount(value);
            return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
          },
          enableSorting: true,
          size: 70,
        }),
      ];
    }
    
    // Desktop view - full columns
    return [
      columnHelper.accessor('slNo', {
        header: () => <span className="text-white font-semibold text-[10px]">S.No</span>,
        cell: (info) => <span className="text-[11px] text-left w-full block">{info.getValue()}</span>,
        enableSorting: true,
        size: 50,
      }),
      columnHelper.accessor('pcvNo', {
        // header: () => <span className="text-white font-semibold text-[10px]">PCV NO</span>,
             header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">PCV NO</span>
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
        size: 85,
      }),
      columnHelper.accessor('pcvDate', {
        // header: () => <span className="text-white font-semibold text-[10px]">PCV Date</span>,
             header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">PCV Date</span>
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
        // cell: (info) => <span className="text-[11px] text-black">{info.getValue()}</span>,y
       cell: (info) => {
  const value = info.getValue() || '';
  let formattedDate = value;
  
  try {
    // Check if it's an ISO date string (from API)
    if (value.includes('T') || value.includes('-') && value.split('-')[0].length === 4) {
      // It's likely an ISO date (YYYY-MM-DD)
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        formattedDate = formatter.formatDate(date);
      }
    } else {
      // Try parsing as dd-MM-yyyy
      const parts = value.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          formattedDate = formatter.formatDate(date);
        }
      } else {
        // Try parsing as dd/mm/yyyy (from toLocaleDateString)
        const slashParts = value.split('/');
        if (slashParts.length === 3) {
          const day = parseInt(slashParts[0], 10);
          const month = parseInt(slashParts[1], 10) - 1;
          const year = parseInt(slashParts[2], 10);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            formattedDate = formatter.formatDate(date);
          }
        }
      }
    }
  } catch (error) {
    console.error('Date formatting error:', error);
  }
  
  return (
    <div>
      <span className="text-[11px] text-black dark:text-white">{formattedDate}</span>
    </div>
  );
},
        enableSorting: true,
        size: 70,
      }),
      columnHelper.accessor('pcvDescription', {
        // header: () => <span className="text-white font-semibold text-[10px]">Description</span>,
             header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Description</span>
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
          <span className="text-[11px] text-black break-words block max-w-[200px]">
            {info.getValue()}
          </span>
        ),
        enableSorting: true,
        size: 150,
      }),
      columnHelper.accessor('accountName', {
        // header: () => <span className="text-white font-semibold text-[10px]">Account</span>,
              header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Account</span>
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
          const rowData = info.row.original;
          const accountId = rowData.accountId || '';
          const accountName = info.getValue() || '';
          
          return (
            <div className="min-w-[120px]">
              <div className="text-[11px] font-medium leading-tight  text-black break-all">{accountId}</div>
              <div className="text-[10px] text- leading-tight break-all">{accountName}</div>
            </div>
          );
        },
        enableSorting: true,
        size: 90,
      }),
      columnHelper.accessor('receiptAmount', {
        // header: () => <span className="text-white font-semibold text-[10px]">Receipt</span>,
               header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Receipt</span>
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
          const value = parseFloat(info.getValue()) || 0;
          const formatted = formatter.formatAmount(value);
          return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
        },
        enableSorting: true,
        size: 70,
      }),
      columnHelper.accessor('paymentAmount', {
        // header: () => <span className="text-white font-semibold text-[10px]">Payment</span>,
              header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Payment</span>
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
          const value = parseFloat(info.getValue()) || 0;
          const formatted = formatter.formatAmount(value);
          return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
        },
        enableSorting: true,
        size: 70,
      }),
      columnHelper.accessor('balance', {
        // header: () => <span className="text-white font-semibold text-[10px]">Balance</span>,
                header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Balance</span>
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
          const value = parseFloat(info.getValue()) || 0;
          const formatted = formatter.formatAmount(value);
          return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
        },
        enableSorting: true,
        size: 75,
      }),
      columnHelper.accessor('createdBy', {
        // header: () => <span className="text-white font-semibold text-[10px]">Created By</span>,
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
        cell: (info) => {
          const rowData = info.row.original;
          const createdBy = info.getValue() || '';
          const lastActDate = rowData.lastActDate || '';
          
          return (
            <div className="min-w-[100px]">
              <div className="text-[11px] font-medium leading-tight text-black break-all">{createdBy}</div>
              <div className="text-[9px] text- leading-tight break-all">
                {lastActDate ? new Date(lastActDate).toLocaleDateString('en-GB') : ''}
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 110,
      }),
    ];
  }, [isMobile, formatter]);

  // Close dropdown when clicking outside - optimized
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to format date for API
  const formatDateForApi = useCallback((month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  }, []);

  // Function to format date for display
  const formatDateForDisplay = useCallback((month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  }, []);

  // Parse stockPeriod from localStorage
  const parseStockPeriod = useCallback((stockPeriod: string | null): { month: number | null, year: number | null } => {
    if (!stockPeriod) return { month: null, year: null };

    try {
      const parts = stockPeriod.split('-');
      if (parts.length >= 3) {
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        if (!isNaN(month) && !isNaN(year)) {
          return { month, year };
        }
      }
    } catch (error) {
      console.error('Error parsing stockPeriod:', error);
    }

    return { month: null, year: null };
  }, []);

  // Fetch OCD data from API
  const fetchOCDData = useCallback(async (periodParam: string) => {
    if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get<OCDApiResponse>(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/otherCashDisbursementController/ocdList/${periodParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      if (response.data.success) {
        setData(response.data.data.ocdList);
        
        // Set opening balance from cashSummary
        if (response.data.data.cashSummary) {
          const openingBalanceFromApi = response.data.data.cashSummary.openingBalance || 0;
          setOpeningBalance(openingBalanceFromApi);
        } else {
          // Fallback to old calculation if cashSummary doesn't exist
          if (response.data.data.ocdList.length > 0) {
            let calculatedOpeningBalance = 0;
            const sortedList = [...response.data.data.ocdList].sort((a, b) => 
              new Date(a.pcvDate).getTime() - new Date(b.pcvDate).getTime()
            );
            
            if (sortedList.length > 0) {
              const firstRecord = sortedList[0];
              calculatedOpeningBalance = firstRecord.balance || 0;
              setOpeningBalance(calculatedOpeningBalance);
            }
          }
        }
      } else {
        toast.error(response.data.message || 'Failed to load OCD data');
      }
    } catch (error) {
      setSessionExpired(true);
      console.error('Error fetching OCD data:', error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error('Error loading OCD data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Memoized handler functions
  const handlePeriodSelect = useCallback((index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
    setMobileMenuOpen(false);
    const newPeriod = formatDateForApi(index, selectedYear);
    setPeriod(newPeriod);
    fetchOCDData(newPeriod);
    setCurrentPage(1);
    setGridCurrentPage(1);
  }, [selectedYear, formatDateForApi, fetchOCDData]);

  const handleYearChange = useCallback((direction: "prev" | "next") => {
    setSelectedYear(prev => {
      const newYear = direction === "prev" ? prev - 1 : prev + 1;
      
      if (selectedMonth !== null) {
        const newPeriod = formatDateForApi(selectedMonth, newYear);
        setPeriod(newPeriod);
        fetchOCDData(newPeriod);
        setCurrentPage(1);
        setGridCurrentPage(1);
      }
      
      return newYear;
    });
  }, [selectedMonth, formatDateForApi, fetchOCDData]);

  const isPeriodSelected = useCallback((index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  }, [selectedMonth]);

  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  // Debounced search handler
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearch(value);
      setCurrentPage(1);
      setGridCurrentPage(1);
    }, 300),
    []
  );

  // Filter data based on search - memoized
  const filteredData = useMemo(() => {
    if (!search) return data;
    
    return data.filter(item =>
      item.pcvNo?.toLowerCase().includes(search.toLowerCase()) ||
      item.accountName?.toLowerCase().includes(search.toLowerCase()) ||
      item.pcvDescription?.toLowerCase().includes(search.toLowerCase()) ||
      item.userId?.toLowerCase().includes(search.toLowerCase()) ||
      item.accountId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // Convert OCDData to TableRowData for the table - memoized
  const tableData = useMemo(() => {
    return filteredData.map((item, index) => ({
      slNo: index + 1,
      pcvNo: item.pcvNo || 'N/A',
       pcvDate: item.pcvDate || '',
      pcvDescription: item.pcvDescription || 'N/A',
      accountId: item.accountId || 'N/A',
      accountName: item.accountName || 'N/A',
      receiptAmount: item.pcvType === 'Receipt' ? item.amount?.toFixed(2) : '0.00',
      paymentAmount: item.pcvType === 'Payment' ? item.amount?.toFixed(2) : '0.00',
      balance: item.balance?.toFixed(2) || '0.00',
      createdBy: item.userId || 'N/A',
      lastActDate: item.lastActDate || '',
      pcvType: item.pcvType || '',
      amount: item.amount || 0,
      originalData: item
    }));
  }, [filteredData]);

  // Initial fetch on component mount
  useEffect(() => {
    const initData = async () => {
      const stockPeriod = localStorage.getItem("stockPeriod");
      let monthToSet = null;
      let yearToSet = selectedYear;

      if (stockPeriod) {
        const { month, year } = parseStockPeriod(stockPeriod);
        if (month !== null && year !== null) {
          monthToSet = month;
          yearToSet = year;
        }
      }

      if (monthToSet === null) {
        const currentDate = new Date();
        monthToSet = currentDate.getMonth();
        yearToSet = currentDate.getFullYear();
      }

      setSelectedMonth(monthToSet);
      setSelectedYear(yearToSet);
      
      const initialPeriod = formatDateForApi(monthToSet, yearToSet);
      setPeriod(initialPeriod);
      await fetchOCDData(initialPeriod);
    };

    initData();
  }, []);

  const handleBackFromView = () => {
    setScreenView(false);
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSorting: true,
  });

  // Calculate pagination for table
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

  // Dashboard Cards Component - REDESIGNED
  const DashboardCards = () => {
    // Calculate counts from data
    const totalCount = data.length;
    const receiptCount = data.filter(item => item.pcvType === 'Receipt').length;
    const paymentCount = data.filter(item => item.pcvType === 'Payment').length;

    const SmallCard = [
      {
        icon: "mdi:clipboard-list-outline",
        num: totalCount,
        title: "Total Transactions",
        shape: shape3,
        bgcolor: "warning",
        colorClass: "warning",
        desc: "Total Transaction Count",
      },
      {
        icon: "mdi:arrow-down-circle-outline",
        num: receiptCount,
        title: "Receipts",
        shape: shape1,
        bgcolor: "error",
        colorClass: "error",
        desc: "Total Receipt Count",
      },
      {
        icon: "mdi:arrow-up-circle-outline",
        num: paymentCount,
        title: "Payments",
        shape: shape2,
        bgcolor: "secondary",
        colorClass: "secondary",
        desc: "Total Payment Count",
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
  const OCDGrid = () => {
    const getTypeBadge = (type: string) => {
      if (type === 'Receipt') {
        return { color: 'success', text: 'Receipt', icon: 'mdi:arrow-down-circle' };
      } else if (type === 'Payment') {
        return { color: 'failure', text: 'Payment', icon: 'mdi:arrow-up-circle' };
      }
      return { color: 'gray', text: 'Other', icon: 'mdi:circle-outline' };
    };

    // Calculate pagination for grid
    const totalGridRows = tableData.length;
    const totalGridPages = Math.ceil(totalGridRows / gridRowsPerPage);
    const gridStartIndex = (gridCurrentPage - 1) * gridRowsPerPage;
    const gridEndIndex = gridStartIndex + gridRowsPerPage;
    const currentGridItems = tableData.slice(gridStartIndex, gridEndIndex);

    // Reset to first page when search changes
    useEffect(() => {
      setGridCurrentPage(1);
    }, [search]);

    return (
      <>
        <DashboardCards />
        
        <div className="relative grid-container-scroll max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {currentGridItems.map((item, index) => {
              const type = getTypeBadge(item.pcvType);
              
              return (
                <CardBox 
                  key={item.pcvNo || index} 
                  className="hover:shadow-md transition-shadow duration-300 border border-gray-200 h-auto p-3 sm:p-4"
                >
                  {/* Card Header with Type badge */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.pcvNo || 'N/A'}</h3>
                      <p className="text-xs text-black mt-0.5 truncate">{item.pcvDate}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge color={type.color} className="text-xs py-0.5 px-1.5 sm:px-2 whitespace-nowrap">
                        <Icon icon={type.icon} className="w-3 h-3 mr-1 inline" />
                        <span className="hidden xs:inline">{type.text}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Account Info */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon icon="mdi:account" className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-600 truncate">Account</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 break-words">{item.accountId || 'N/A'}</p>
                    <p className="text-xs text-gray-600 break-words line-clamp-2">{item.accountName || 'N/A'}</p>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon icon="mdi:text" className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-600 truncate">Description</span>
                    </div>
                    <p className="text-xs text-gray-700 break-words line-clamp-2">{item.pcvDescription || 'N/A'}</p>
                  </div>
                  
                  {/* Financial Info */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    <div className={`p-1.5 sm:p-2 rounded ${
                      item.pcvType === 'Receipt' ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon 
                          icon="mdi:arrow-down-circle" 
                          className={`w-3 h-3 ${
                            item.pcvType === 'Receipt' ? 'text-green-600' : 'text-gray-400'
                          } flex-shrink-0`} 
                        />
                        <span className={`text-xs ${
                          item.pcvType === 'Receipt' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          Receipt
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {item.receiptAmount === '0.00' ? '0' : formatter.formatAmount(parseFloat(item.receiptAmount))}
                      </p>
                    </div>
                    
                    <div className={`p-1.5 sm:p-2 rounded ${
                      item.pcvType === 'Payment' ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon 
                          icon="mdi:arrow-up-circle" 
                          className={`w-3 h-3 ${
                            item.pcvType === 'Payment' ? 'text-red-600' : 'text-gray-400'
                          } flex-shrink-0`} 
                        />
                        <span className={`text-xs ${
                          item.pcvType === 'Payment' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          Payment
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {item.paymentAmount === '0.00' ? '0' : formatter.formatAmount(parseFloat(item.paymentAmount))}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:scale-balance" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-600">Balance</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {formatter.formatAmount(parseFloat(item.balance))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom Info Row */}
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-md mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black mb-0.5">Created By</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{item.createdBy || 'N/A'}</p>
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
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Opening Balance: <span className="font-bold text-green-600">₹{formatter.formatAmount(openingBalance)}</span>
                </p>
              </div>
              {search && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Filtered by: <span className="font-bold text-gray-800">"{search}"</span>
                  </p>
                </div>
              )}
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

  const handleAddClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // Period dropdown component - Responsive
  const PeriodDropdown = () => (
    <div className="relative w-full sm:w-64" ref={periodRef}>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          readOnly
          onClick={() => setPeriodOpen(!periodOpen)}
          className="peer w-full px-3 sm:px-4 pr-8 sm:pr-10 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          aria-label="Select period"
        />
        <label className="absolute left-3 sm:left-4 top-1.5 sm:top-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1">
          Period <sup className='text-red-600'>*</sup>
        </label>
        <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
      </div>

      {periodOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 p-2 w-full sm:w-80">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <button
              onClick={() => handleYearChange("prev")}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Previous year"
            >
              <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
            </button>
            <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">{selectedYear}</span>
            <button
              onClick={() => handleYearChange("next")}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Next year"
            >
              <ChevronRight size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {months.map((option, index) => (
              <button
                key={option}
                onClick={() => handlePeriodSelect(index)}
                className={`text-center py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-xs ${
                  isPeriodSelected(index)
                    ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg transform scale-105"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
                }`}
                aria-label={`Select ${option}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-2 bg-white  dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm">
      
      {/* Header with Title and Toggle Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-700 whitespace-normal break-words">
          Other Cash Disbursement List
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
            <Tooltip content="Add" className='z-50'>
              <Badge
                color="primary"
                className="h-8 w-8 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-blue-700 ml-auto sm:ml-0"
                onClick={handleAddClick}
              >
                <Icon icon="mingcute:add-line" className="text-sm sm:text-base" />
              </Badge>
            </Tooltip>
        </div>
        
      </div>

      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 sm:p-y-1">
        <div className="w-full max-w-full mx-auto">
          {/* Header controls - Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg">
            <PeriodDropdown />

            {/* Opening Balance */}
            <div className="text-xs sm:text-sm whitespace-nowrap font-medium text-gray-700 dark:text-gray-300">
              Opening Cash Balance:
              <span className="font-bold text-green-600 dark:text-green-400 ml-1">₹{formatter.formatAmount(openingBalance)}</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-44 lg:w-74 lg:ml-34">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search records..."
                  defaultValue={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  aria-label="Search records"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setGlobalFilter('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon="mdi:close" className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Add Button */}
           
          </div>
 
          {isLoading && (
            <div className="text-center py-4 sm:py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm">Loading data for period: {period}...</div>
            </div>
          )}

          {!isLoading && data.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Icon icon="mdi:database-outline" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No data found for period: {period}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Try selecting a different period</p>
            </div>
          )}

          {!isLoading && data.length > 0 && (
            <>
              {viewMode === 'table' ? (
                <>
                  <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
                      <div className="min-w-[1000px] lg:min-w-full">
                        <div className="overflow-auto max-h-[350px] relative">
                          <table className="w-full divide-y divide-gray-200 table-fixed" style={{ tableLayout: 'fixed' }}>
                            <thead className='sticky top-0 z-10 h-8'>
                              {table.getHeaderGroups().map((headerGroup) => (
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
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
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
                        Showing <span className="font-medium">{table.getRowModel().rows.length}</span> of <span className="font-medium">{data.length}</span> records
                        {search && (
                          <span> for search: <span className="font-medium">"{search}"</span></span>
                        )}
                        {!search && (
                          <span> for period: <span className="font-medium">{period}</span></span>
                        )}
                        <span className="ml-2 text-green-600">
                          Opening Bal: ₹{formatter.formatAmount(openingBalance)}
                        </span>
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
                <OCDGrid />
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

export default OtherCashTable;