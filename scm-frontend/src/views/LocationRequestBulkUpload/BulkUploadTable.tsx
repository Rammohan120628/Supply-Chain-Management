import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  Tooltip,
  Tabs,
  TabItem,
} from 'flowbite-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Database,
  FilePlus,
  Package,
  Plus,
} from 'lucide-react';
import { HiSearch } from 'react-icons/hi';
import { useEntityFormatter } from "../Entity/UseEntityFormater";
import { FaBoxOpen } from 'react-icons/fa';
import { Icon } from '@iconify/react/dist/iconify.js';
import SessionModal from '../SessionModal';

export interface TableTypeDense {
  name?: string;               // reqTransactionNo / itemId
  post?: string;                // supplierId
  pname?: string;               // periodStr / requestDate
  locationId?: string;
  consolidationId?: string;
  locationRequestHeaderPk?: number;
  status?: string;  
  supplierName?: string;
  teams?: string;
  statuscolor?: string;
  budget?: string;
  gross?: string;
  net?: string;
}

const columnHelper = createColumnHelper<TableTypeDense>();

// Main table columns (base, without S.No)
const defaultColumns = (formatter: ReturnType<typeof useEntityFormatter>) => [
  columnHelper.accessor('name', {
    enableSorting: true,
    cell: (info) => (
      <div>
        <div className="flex flex-col gap-1">
          <h6 className="text-[11px] font-semibold text-gray-900 dark:text-white">
            {info.getValue()}
          </h6>
        </div>
      </div>
    ),
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">LocReq No</span>
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
  }),
  columnHelper.accessor('pname', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Period</span>
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
          <span className="text-[11px] font-bold text-black dark:text-white">{formattedDate}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor('locationId', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Location ID</span>
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
      <div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold dark:text-white">{info.getValue()}</span>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Delivery Mode</span>
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
      <p className="text-[11px] font-bold text-black dark:text-white capitalize dark:bg-opacity-20">
        {info.getValue()}
      </p>
    ),
  }),
];

const defaultColumnsPO = (formatter: ReturnType<typeof useEntityFormatter>) => {
  const cols = defaultColumns(formatter);
  return [
    ...cols.slice(0, 3),
    columnHelper.accessor('consolidationId', {
      enableSorting: true,
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Consolidation ID</span>
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
        <span className="text-[11px] font-mono dark:text-white">{info.getValue()}</span>
      ),
    }),
    cols[3],
  ];
};

// Modal columns (full)
const defaultColumns2Full = (formatter: ReturnType<typeof useEntityFormatter>) => [
  columnHelper.accessor('name', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Item ID</span>
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
      <div className="dark:bg-gray-800">
        <span className="text-[11px] dark:text-white">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('teams', {
    enableSorting: true,
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
    cell: (info) => (
      <div className="dark:bg-gray-800">
        <span className="text-[11px] dark:text-white">{info.getValue()}</span>
      </div>
    ),
  }),
columnHelper.accessor('pname', {
  enableSorting: true,
  header: ({ column }) => (
    <div
      className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
      onClick={column.getToggleSortingHandler()}
    >
      <span className="font-medium text-white text-[10px] uppercase">Request Date</span>
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
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        formattedDate = formatter.formatDate(date);
      }
    } catch {
      // fallback
    }
    return (
      <span className="text-[11px] max-w-[400px] font-medium text-gray-700 dark:text-white">
        {formattedDate}
      </span>
    );
  },
}),
  columnHelper.accessor('post', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Supplier ID</span>
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
      <div className="text-[11px] font-medium text-gray-700 dark:text-white dark:bg-gray-800">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('supplierName', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Supplier Name</span>
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
      <div className="dark:bg-gray-800">
        <span className="text-[11px] dark:text-white">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('budget', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Quantity</span>
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
      const value = info.getValue() || '0';
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatQuantity(num);
      return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
    },
  }),
  columnHelper.accessor('gross', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Gross Amount</span>
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
      const value = info.getValue() || '0';
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
    },
  }),
  columnHelper.accessor('net', {
    enableSorting: true,
    header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Net Amount</span>
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
      const value = info.getValue() || '0';
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium text-right w-full">{formatted}</span>;
    },
  }),
];
const defaultColumns2Reduced = (formatter: ReturnType<typeof useEntityFormatter>) => {
  const full = defaultColumns2Full(formatter);
  return [full[0], full[2], full[5]]; // Item ID, Request Date, Quantity
};

const BulkUploadTable = ({ onBack }: { onBack?: () => void }) => {
  const currentDate = new Date();
  // Month picker states
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const periodRef = useRef<HTMLDivElement>(null);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const periodOptions = [...months];
  // Formatter hook
  const formatter = useEntityFormatter();
  // Format date for API (01-MM-YYYY)
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };
  // Format date for display (Month-Year)
  const formatDateForDisplay = (month: number, year: number): string => {
    return `${months[month]}-${year}`;
  };
  const isPeriodSelected = (index: number): boolean => index === selectedMonth;
  const displayValue = formatDateForDisplay(selectedMonth, selectedYear);
  const [createListData, setCreateListData] = useState<TableTypeDense[]>([]);
  const [poGenerateListData, setPoGenerateListData] = useState<TableTypeDense[]>([]);
  const [itemDetailsData, setItemDetailsData] = useState<TableTypeDense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewSourceTab, setViewSourceTab] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [modalSorting, setModalSorting] = useState<SortingState>([]);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // Modal pagination
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);

  const getToken = () => localStorage.getItem('authToken') || '';

  const mapApiDataToTable = (apiData: any[], isPoGenerated: boolean): TableTypeDense[] => {
    return apiData.map((item) => ({
      name: item.reqTransactionNo || 'Unknown',
      post: item.locationId || 'N/A',
      pname: item.periodStr || 'N/A',
      locationId: item.locationId || 'N/A',
      consolidationId: item.consolidationId || 'N/A',
      status: item.deliveryMode || 'Unknown',
      locationRequestHeaderPk: item.locationRequestHeaderPk,
      statuscolor: isPoGenerated ? 'success' : 'warning',
      budget: item.grandTotal ? `${item.grandTotal.toFixed(1)}` : '0',
    }));
  };

  const mapItemDetailsToTable = (apiData: any[]): TableTypeDense[] => {
    return apiData.map((item) => ({
      name: item.itemId ? item.itemId.toString() : 'N/A',
      post: item.supplierId || 'N/A',
      pname: item.requestDateStr || item.requestDate || 'N/A',
      teams: item.itemName || 'N/A',
      supplierName: item.supplierName || 'N/A',
      budget: item.qty || '0',
      gross: item.gross || '0',
      net: item.net || '0',
    }));
  };

  // Initialize with purchasePeriod from localStorage
  useEffect(() => {
    let defaultMonth: number;
    let defaultYear: number;
    const purchasePeriodStr = localStorage.getItem('purchasePeriod');
    if (purchasePeriodStr) {
      const [day, month, year] = purchasePeriodStr.split('-').map(Number);
      const periodDate = new Date(year, month - 1, day);
      if (!isNaN(periodDate.getTime())) {
        defaultMonth = periodDate.getMonth();
        defaultYear = periodDate.getFullYear();
      } else {
        defaultMonth = currentDate.getMonth();
        defaultYear = currentDate.getFullYear();
      }
    } else {
      defaultMonth = currentDate.getMonth();
      defaultYear = currentDate.getFullYear();
    }
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
    const initialPeriod = formatDateForApi(defaultMonth, defaultYear);
    fetchData(initialPeriod);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
    const newPeriod = formatDateForApi(index, selectedYear);
    fetchData(newPeriod);
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    const newPeriod = formatDateForApi(selectedMonth, newYear);
    fetchData(newPeriod);
  };

  // Refresh button handler
  const handleRefreshClick = () => {
    let defaultMonth: number;
    let defaultYear: number;
    const purchasePeriodStr = localStorage.getItem('purchasePeriod');
    if (purchasePeriodStr) {
      const [day, month, year] = purchasePeriodStr.split('-').map(Number);
      const periodDate = new Date(year, month - 1, day);
      if (!isNaN(periodDate.getTime())) {
        defaultMonth = periodDate.getMonth();
        defaultYear = periodDate.getFullYear();
      } else {
        defaultMonth = currentDate.getMonth();
        defaultYear = currentDate.getFullYear();
      }
    } else {
      defaultMonth = currentDate.getMonth();
      defaultYear = currentDate.getFullYear();
    }
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
    setGlobalSearch('');
    setModalSearch('');
    setSorting([]);
    setModalSorting([]);
    setOpenModal(false);
    setViewSourceTab(null);
    setCurrentPage(1);
    const defaultPeriod = formatDateForApi(defaultMonth, defaultYear);
    fetchData(defaultPeriod);
  };

  const fetchData = async (period?: string) => {
    setIsLoading(true);
    setCreateListData([]);
    setPoGenerateListData([]);
    setSessionExpired(false);
    try {
      const token = getToken();
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const finalPeriod = period || formatDateForApi(selectedMonth, selectedYear);
      const response = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/locationRequestDetailListProcess?period=${finalPeriod}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setCreateListData(mapApiDataToTable(result.data.createList || [], false));
        setPoGenerateListData(mapApiDataToTable(result.data.poGenerateList || [], true));
      } else {
        console.error('API error:', result.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setSessionExpired(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemDetails = async (reqNo: string) => {
    setIsModalLoading(true);
    setItemDetailsData([]);
    setModalCurrentPage(1);
    try {
      const token = getToken();
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const response = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/itemDetailsByLocRequest/${reqNo}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setItemDetailsData(mapItemDetailsToTable(result.data || []));
      } else {
        console.error('API error:', result.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setSessionExpired(true);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleViewClick = (rowData: TableTypeDense, sourceTab: number) => {
    if (rowData.name) {
      setViewSourceTab(sourceTab);
      fetchItemDetails(rowData.name);
      setOpenModal(true);
    }
  };

  // Filtered data for main search
  const filteredCreateList = useMemo(
    () =>
      createListData.filter((row) =>
        Object.values(row).some((val) => val?.toString().toLowerCase().includes(globalSearch.toLowerCase()))
      ),
    [createListData, globalSearch]
  );
  const filteredPoGenerateList = useMemo(
    () =>
      poGenerateListData.filter((row) =>
        Object.values(row).some((val) => val?.toString().toLowerCase().includes(globalSearch.toLowerCase()))
      ),
    [poGenerateListData, globalSearch]
  );

  // Filtered data for modal search (with pagination)
  const filteredModalData = useMemo(
    () =>
      itemDetailsData.filter((row) =>
        Object.values(row).some((val) => val?.toString().toLowerCase().includes(modalSearch.toLowerCase()))
      ),
    [itemDetailsData, modalSearch]
  );

  const paginatedModalData = useMemo(() => {
    const start = (modalCurrentPage - 1) * modalPageSize;
    return filteredModalData.slice(start, start + modalPageSize);
  }, [filteredModalData, modalCurrentPage, modalPageSize]);

  const totalModalPages = Math.ceil(filteredModalData.length / modalPageSize);

  // Pagination indices for main table
  const startIndex = (currentPage - 1) * rowsPerPage;
  // For modal serial number
  const modalStartIndex = (modalCurrentPage - 1) * modalPageSize;

  // Main table columns with S.No and view button
  const columns = useMemo(
    () => {
      const base = defaultColumns(formatter);
      const withView = [
        ...base,
        columnHelper.display({
          id: 'view',
          enableSorting: false,
          header: () => <span className="font-medium text-white text-[10px] uppercase">Actions</span>,
          cell: ({ row }) => (
            <Tooltip content="View item details" className="dark:bg-gray-800 dark:text-white">
              <button
                className="text-blue-600 hover:text-blue-800 text-[11px] px-1 py-0.5 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                onClick={() => handleViewClick(row.original, 0)}
                title="View Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          ),
        }),
      ];
      return [
        columnHelper.display({
          id: 'sno',
          header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
          cell: ({ row }) => <span className="text-[11px]">{modalStartIndex + row.index + 1}</span>,
          size: 40,
          enableSorting: false,
        }),
        ...withView,
      ];
    },
    [formatter, startIndex]
  );

  const columnsPO = useMemo(
    () => {
      const base = defaultColumnsPO(formatter);
      const withView = [
        ...base,
        columnHelper.display({
          id: 'view',
          enableSorting: false,
          header: () => <span className="font-medium text-white text-[10px] uppercase">Actions</span>,
          cell: ({ row }) => (
            <Tooltip content="View item details" className="dark:bg-gray-800 dark:text-white">
              <button
                className="text-blue-600 hover:text-blue-800 text-[11px] px-1 py-0.5 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                onClick={() => handleViewClick(row.original, 1)}
                title="View Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          ),
        }),
      ];
      return [
        columnHelper.display({
          id: 'sno',
          header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
          cell: ({ row }) => <span className="text-[11px]">{modalStartIndex + row.index + 1}</span>,
          size: 40,
          enableSorting: false,
        }),
        ...withView,
      ];
    },
    [formatter, startIndex]
  );

  // Determine which data to show based on active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 0:
        return filteredCreateList;
      case 1:
        return filteredPoGenerateList;
      default:
        return [];
    }
  };

  const getActiveColumns = () => {
    switch (activeTab) {
      case 0:
        return columns;
      case 1:
        return columnsPO;
      default:
        return columns;
    }
  };

  // All headers now use the same background color (blue-600)
  const getHeaderBgColor = () => 'bg-blue-600';

  const activeData = getActiveData();
  const activeColumns = getActiveColumns();

  const table = useReactTable({
    data: activeData,
    columns: activeColumns,
    state: { sorting, globalFilter: globalSearch },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Pagination
  const totalRows = table.getRowModel().rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const endIndex = startIndex + rowsPerPage;
  const currentRows = table.getRowModel().rows.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, globalSearch]);

  // Determine which columns to show in modal based on source tab
  const getModalColumns = () => {
    const base = viewSourceTab === 1 ? defaultColumns2Full(formatter) : defaultColumns2Reduced(formatter);
    return [
      columnHelper.display({
        id: 'sno',
        header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
       cell: ({ row }) => <span className="text-[11px]">{modalStartIndex + row.index + 1}</span>,
        size: 40,
        enableSorting: false,
      }),
      ...base,
    ];
  };

  const modalTable = useReactTable({
    data: paginatedModalData,
    columns: getModalColumns(),
    state: { sorting: modalSorting, globalFilter: modalSearch },
    onSortingChange: setModalSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleAddClick = () => {
    if (onBack) {
      onBack();
    }
  };

  const getModalTitle = () => {
    switch (viewSourceTab) {
      case 0:
        return 'Item Details - Created';
      case 1:
        return 'Item Details - PO Generated';
      default:
        return 'Item Details';
    }
  };

  return (
    <div className="w-[1050px]">
      {/* Header with Title and Action Buttons */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-3 text-sm p-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-700 whitespace-nowrap">
            Bulk Location Request List
          </h1>
          <div className="flex gap-2 justify-end sm:justify-start">
            <Tooltip content="Add" className="z-50">
              <Badge
                color="primary"
                className="h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-blue-700 text-xs sm:text-sm"
                onClick={handleAddClick}
              >
                <Plus className="w-4 h-4" />
              </Badge>
            </Tooltip>
            <Tooltip content="Refresh" className="z-50">
              <Badge
                color="warning"
                className="h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-yellow-600 text-xs sm:text-sm"
                onClick={handleRefreshClick}
              >
                <RefreshCw className="w-4 h-4" />
              </Badge>
            </Tooltip>
          </div>
        </div>
      </div>
    
      {/* Period Picker and Search Row */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 sm:p-4">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
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
                  Purchase Period <sup className="text-red-600">*</sup>
                </label>
                <CalendarDays className="absolute right-112 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              </div>
              {periodOpen && (
                <div className="absolute w-80 top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 p-2 sm:p-3">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <button
                      onClick={() => handleYearChange('prev')}
                      className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                      {selectedYear}
                    </span>
                    <button
                      onClick={() => handleYearChange('next')}
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
                            ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg transform scale-105'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Search Input - with ml-3 for spacing */}
            <div className="w-full sm:max-w-xs">
              <div className="relative text-gray-400 focus-within:text-gray-600">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="ml-3 form-control-input w-74 pl-8 px-3 py-2 sm:py-2.5 border rounded-md text-sm"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Tabs */}
          <Tabs
            aria-label="Bulk location request tabs"
            variant="underline"
            onActiveTabChange={(tab) => setActiveTab(tab)}
          >
            <TabItem
              active={activeTab === 0}
              className="!px-2 !py-1 text-xs"
              title={
                <div className="flex items-center gap-1">
                  <FilePlus className="w-3.5 h-3.5" />
                  <span className="dark:text-white">Created</span>
                  <Badge className="bg-blue-500 text-[10px] dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5">
                    {filteredCreateList.length}
                  </Badge>
                </div>
              }
            >
              {renderTableContent()}
            </TabItem>
            <TabItem
              active={activeTab === 1}
              className="!px-2 !py-1 text-xs"
              title={
                <div className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  <span className="dark:text-white">PO Generated</span>
                  <Badge className="bg-purple-500 text-[10px] dark:bg-purple-900 dark:text-purple-100 px-1.5 py-0.5">
                    {filteredPoGenerateList.length}
                  </Badge>
                </div>
              }
            >
              {renderTableContent()}
            </TabItem>
          </Tabs>
        </div>
      </div>

      {/* Item Details Modal */}
         <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 rounded-md">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 text-xs">
              <FaBoxOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{getModalTitle()}</h3>
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                Total: {filteredModalData.length}
              </span>
            </div>
            {/* Modal search input with ml-70 */}
            <div className="relative w-56 p-1 lg:ml-140">
              <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-700 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search items..."
                value={modalSearch}
                onChange={(e) => {
                  setModalSearch(e.target.value);
                  setModalCurrentPage(1);
                }}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="p-3 bg-white dark:bg-gray-800 rounded-md">
          <div className="border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="min-w-full table-fixed">
                <thead className="bg-blue-600 dark:bg-gray-900">
                  {modalTable.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider"
                          style={{
                            minWidth:
                              header.id === 'sno'
                                ? '40px'
                                : header.id === 'itemDetails'
                                ? '200px'
                                : header.id === 'pname'
                                ? '90px'
                                : header.id === 'post'
                                ? '90px'
                                : header.id === 'supplierName'
                                ? '150px'
                                : header.id === 'budget'
                                ? '80px'
                                : header.id === 'gross'
                                ? '90px'
                                : header.id === 'net'
                                ? '90px'
                                : '80px',
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {modalTable.getRowModel().rows.length > 0 ? (
                    modalTable.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300 pr-14 ${
                              ['budget', 'gross', 'net'].includes(cell.column.id) ? 'text-right' : ''
                            }`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={modalTable.getAllColumns().length}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {isModalLoading ? (
                          <div className="inline-flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Loading items...</span>
                          </div>
                        ) : (
                          'No items found for this request'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modal Pagination */}
          {filteredModalData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 text-xs">
              <div className="text-gray-600 dark:text-gray-300">
                Showing {(modalCurrentPage - 1) * modalPageSize + 1} to{' '}
                {Math.min(modalCurrentPage * modalPageSize, filteredModalData.length)} of{' '}
                {filteredModalData.length} items
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setModalCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={modalCurrentPage === 1}
                    className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
                  >
                    <ChevronLeft className="w-3 h-3" /> Prev
                  </button>
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-xs">
                    {modalCurrentPage} / {totalModalPages}
                  </span>
                  <button
                    onClick={() => setModalCurrentPage((p) => Math.min(totalModalPages, p + 1))}
                    disabled={modalCurrentPage >= totalModalPages}
                    className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
                  >
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Session Expired Modal */}
      {sessionExpired && <SessionModal />}

      {/* Loading Overlay */}
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

  // Helper function to render the table content (avoids code duplication)
function renderTableContent() {
  const headerBg = getHeaderBgColor();
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading requests...</p>
      </div>
    );
  }
  if (activeData.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No Data Available</h4>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          No records found for {displayValue}
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm dark:shadow-gray-800">
        <div className="overflow-x-auto overflow-y-auto max-h-[300px] sm:max-h-[300px] lg:max-h-[300px]">
          <div className="min-w-[1050px] lg:min-w-full">
            <div className="overflow-auto max-h-[300px] relative">
              <table className="w-full table-fixed" style={{ tableLayout: 'fixed' }}>
                <thead className="sticky top-0 h-8">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className={headerBg}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-1.5 py-1 text-left font-medium text-white dark:text-gray-100 uppercase text-[10px] leading-tight cursor-pointer hover:opacity-90 transition-colors"
                          style={{
                            width: `${header.column.columnDef.size || 80}px`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 50,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRows.length > 0 ? (
                    currentRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 even:bg-gray-50/50 dark:even:bg-gray-700/50">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-1.5 py-1 align-top"
                            style={{ width: `${cell.column.columnDef.size || 80}px` }}
                          >
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] dark:text-gray-100">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeColumns.length} className="px-3 py-4 text-center dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <Icon icon="mdi:database-outline" className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                          <p className="text-black dark:text-white text-xs font-medium">No records found</p>
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
      {/* Pagination */}
      {totalRows > 0 && (
        <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
          <div>
            Showing <span className="font-medium">{activeData.length}</span> of{' '}
            <span className="font-medium">
              {activeTab === 0
                ? createListData.length
                : poGenerateListData.length}
            </span>{' '}
            records
            {globalSearch && (
              <span>
                {' '}
                for search: <span className="font-medium">"{globalSearch}"</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-600 dark:text-gray-400">
              {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-1.5 py-0.5 rounded border text-[12px] ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <ChevronLeft className="w-2.5 h-2.5 inline mr-0.5" />
                Prev
              </button>
              <span className="px-2 py-0.5 text-[12px] bg-blue-50 text-blue-600 rounded border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-1.5 py-0.5 rounded border text-[12px] ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
                }`}
              >
                Next
                <ChevronRight className="w-2.5 h-2.5 inline ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
};

export default BulkUploadTable;