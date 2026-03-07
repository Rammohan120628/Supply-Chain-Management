import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { HiRefresh } from 'react-icons/hi';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { saveAs } from 'file-saver';
import Toastify,{ showToast }  from '../Toastify';
import { Tooltip } from 'flowbite-react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { UserRoundPen, CircleCheckBig, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaChevronLeft, FaChevronRight, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import SessionModal from 'src/views/SessionModal';
import { useEntityFormatter } from '../Entity/UseEntityFormater';

// ---------- Types ----------
type Period = 'day' | 'week' | 'month' | 'year';

interface UserLogEntry {
  renderAdmin: boolean;
  renderSuperAdmin: boolean;
  renderLocationBasedAdmin: boolean;
  retrieveType: number;
  userFk: number;
  userType: number;
  userName: string;
  userEmailId: string;
  userTypeWord: string;
  loginStr: string;
  logoutStr: string;
  login: string;
  logout: string;
  ipAddress: string;
  macId: string;
  browser: string;
  osDetail: string;
  day: string;
  yearInt: number;
}

// ---------- Helper Components ----------
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2">
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 cursor-help inline" />
  </Tooltip>
);

// ---------- Main Component ----------
const UserLog: React.FC = () => {
  const formatter = useEntityFormatter(); // ✅ get entity formatter

  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('day');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth); // for month picker
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<UserLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');

  const userId = localStorage.getItem('userId');

  // Ref for month picker to detect outside clicks
  const monthPickerRef = useRef<HTMLDivElement>(null);

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate year options (last 5 years up to current year only)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  // Months for picker
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Build request body for retrieve API
  const buildRequestBody = (period: Period, dateStr: string, yearNum?: number) => {
    const date = new Date(dateStr);
    let year = yearNum || date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let dayNum = String(date.getDate()).padStart(2, '0');

    let selectedDayStr = `${year}-${month}-${dayNum}`;
    const firstDayOfMonth = `${year}-${month}-01`;

    switch (period) {
      case 'day':
        return { retrieveType: 1, day: selectedDayStr };
      case 'week':
        return { retrieveType: 2, day: selectedDayStr };
      case 'month':
        return { retrieveType: 3, day: firstDayOfMonth };
      case 'year':
        return { retrieveType: 4, yearInt: year };
      default:
        return { retrieveType: 1, day: selectedDayStr };
    }
  };

  // Build request body for download API (same as retrieve but includes userFk)
  const buildDownloadBody = (period: Period, dateStr: string, yearNum?: number) => {
    const base = buildRequestBody(period, dateStr, yearNum);
    return {
      userFk: parseInt(userId || '0'),
      ...base,
    };
  };

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const body = selectedPeriod === 'year'
        ? buildRequestBody(selectedPeriod, selectedDate, selectedYear)
        : buildRequestBody(selectedPeriod, selectedDate);

      console.log('Request Body:', body);
      const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/retreiveUserLog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (response.status === 401) {
        setShowSessionModal(true);
        showToast('Session expired. Please login again.', 'error');
        return;
      }

      if (!response.ok) {
        showToast(result.message || 'Failed to fetch logs', 'error');
        setData([]);
        return;
      }

      if (response.status === 500) {
        showToast('No Data for selected period', 'error');
      }

      if (result.success) {
        setData(result.data || []);
        if (result.data?.length === 0) {
          showToast('No logs found for the selected period', 'error');
        } else {
          showToast('Logs loaded successfully', 'success');
        }
      } else {
        showToast(result.message || 'Failed to fetch logs', 'error');
        setData([]);
      }
    } catch (error) {
      setShowSessionModal(true);
      showToast('Session Expired', 'error');
      console.error(error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [selectedPeriod, selectedDate, selectedYear]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Load when period, date, or year changes
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Initialize selectedMonth/year when period changes to week or month
  useEffect(() => {
    if (selectedPeriod === 'week' && selectedDate) {
      const date = new Date(selectedDate);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
    }
    if (selectedPeriod === 'month' && selectedDate) {
      const date = new Date(selectedDate);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
    }
  }, [selectedPeriod, selectedDate]);

  // When entering month period, ensure selectedDate is first day of month
  useEffect(() => {
    if (selectedPeriod === 'month') {
      const date = new Date(selectedDate);
      const firstDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      if (selectedDate !== firstDay) {
        setSelectedDate(firstDay);
      }
    }
  }, [selectedPeriod, selectedDate]);

  // Adjust selectedMonth when selectedYear changes (for month picker)
  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      // If current year and month is future, adjust to current month
      setSelectedMonth(currentMonth);
      const newDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      setSelectedDate(newDate);
    } else if (selectedYear < currentYear) {
      // For past years, ensure selectedDate reflects the selected month
      const newDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      setSelectedDate(newDate);
    }
  }, [selectedYear, currentYear, currentMonth, selectedMonth]);

  // Download Excel from API
  const downloadExcel = useCallback(async () => {
    if (!userId) {
      showToast('User ID not found', 'error');
      return;
    }

    setGlobalLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/downloadUserLogExcel/${userId}`;

      const body = selectedPeriod === 'year'
        ? buildDownloadBody(selectedPeriod, selectedDate, selectedYear)
        : buildDownloadBody(selectedPeriod, selectedDate);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        setShowSessionModal(true);
        showToast('Session expired. Please login again.', 'error');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        showToast(errorText || 'Failed to download Excel', 'error');
        return;
      }
      if (response.status === 500) {
        showToast('No Data for selected period', 'error');
      }

      const blob = await response.blob();
      const fileName = `UserLogs_${selectedPeriod}_${selectedPeriod === 'year' ? selectedYear : selectedDate}.xls`;
      saveAs(blob, fileName);
      showToast('Excel downloaded successfully', 'success');
    } catch (error) {
      setShowSessionModal(true);
      showToast('Session Expired', 'error');
      console.error('Download error:', error);
    } finally {
      setGlobalLoading(false);
    }
  }, [userId, selectedPeriod, selectedDate, selectedYear]);

  // Confirmation handler for download
  const handleDownloadClick = () => {
    setConfirmTitle('Download Excel');
    setConfirmMessage('Are you sure you want to download the Excel report?');
    setConfirmAction(() => downloadExcel);
    setShowConfirm(true);
  };

  // Reset confirmation
  const resetConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmTitle('');
    setConfirmMessage('');
  };

  // Month picker handlers
  const handleYearChange = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    if (newYear > currentYear) return; // cannot go beyond current year
    setSelectedYear(newYear);
    if (newYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
      const newDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      setSelectedDate(newDate);
    } else {
      const monthToUse = newYear === currentYear && selectedMonth > currentMonth ? currentMonth : selectedMonth;
      const newDate = `${newYear}-${String(monthToUse + 1).padStart(2, '0')}-01`;
      setSelectedDate(newDate);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    if (selectedYear === currentYear && monthIndex > currentMonth) {
      showToast('Cannot select future months', 'error');
      return;
    }
    setSelectedMonth(monthIndex);
    const newDate = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    setSelectedDate(newDate);
    setShowMonthPicker(false);
  };

  // ---------- Table Configuration ----------
  const columnHelper = createColumnHelper<UserLogEntry>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'sno',
        header: 'S.No',
        cell: ({ row }) => <span className="text-xs sm:text-sm">{row.index + 1 + (currentPage - 1) * rowsPerPage}</span>,
        size: 60,
        enableSorting: false,
      }),
      columnHelper.accessor('userName', {
        header: 'User Detail',
        cell: (info) => {
          const entry = info.row.original;
          return (
            <div>
              <div className="font-medium text-xs sm:text-sm">{entry.userName}</div>
              <div className="text-blue-600 dark:text-blue-400 text-xs">{entry.userEmailId}</div>
            </div>
          );
        },
        size: 180,
        enableSorting: true,
      }),
      columnHelper.accessor('userTypeWord', {
        header: 'User Type',
        cell: (info) => <span className="text-xs sm:text-sm">{info.getValue()}</span>,
        size: 100,
        enableSorting: true,
      }),
      columnHelper.accessor(row => new Date(row.login), {
        id: 'login',
        header: 'Login In',
        cell: (info) => {
          const date = new Date(info.row.original.login);
          return <span className="text-xs sm:text-sm">{formatter.formatDateTime(date)}</span>;
        },
        size: 150,
        enableSorting: true,
      }),
      columnHelper.accessor(row => (row.logout ? new Date(row.logout) : null), {
        id: 'logout',
        header: 'Log Out',
        cell: (info) => {
          const val = info.row.original.logout;
          return val ? (
            <span className="text-xs sm:text-sm">{formatter.formatDateTime(new Date(val))}</span>
          ) : (
            <span className="text-xs sm:text-sm">—</span>
          );
        },
        size: 150,
        enableSorting: true,
      }),
      columnHelper.accessor(
        row => {
          return [
            row.userName,
            row.userEmailId,
            row.userTypeWord,
            row.login,
            row.logout,
            row.ipAddress,
            row.macId,
            row.browser,
            row.osDetail,
          ].join(' ');
        },
        {
          id: 'globalSearch',
          header: '',
          cell: () => null,
          size: 0,
          enableSorting: false,
        }
      ),
    ],
    [currentPage, formatter]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: searchTerm,
      columnVisibility: { globalSearch: false },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
  });

  const tableRows = table.getRowModel().rows;
  const totalRows = tableRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = tableRows.slice(startIndex, endIndex);

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sorting]);

  const getSortEmoji = (columnId: string) => {
    const sort = sorting.find((s) => s.id === columnId);
    if (!sort) return ' ↕️';
    return sort.desc ? ' 🔽' : ' 🔼';
  };

  return (
    <>
      <Toastify />

      {/* Global Loading Overlay */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <div className="max-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-3 flex flex-col gap-3 overflow-hidden">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <UserRoundPen className="h-5 w-5" />
              User Log
              <InfoTooltip content="View user login/logout history with filters by day, week, month, or year." />
            </h1>
            <div className="flex items-center gap-3">
              <Tooltip content="Refresh" placement="bottom">
                <button
                  onClick={handleRefresh}
                  className="w-10 h-10 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 rounded-full text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                  disabled={loading}
                >
                  <HiRefresh size={18} className={loading ? 'animate-spin' : ''} />
                </button>
              </Tooltip>
              <Tooltip content="Excel" placement="bottom">
                <button
                  onClick={handleDownloadClick}
                  className="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-700 rounded-full text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                  disabled={loading}
                >
                  <RiFileExcel2Fill size={18} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center space-x-4">
                {(['day', 'week', 'month', 'year'] as Period[]).map((period) => (
                  <label key={period} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={period}
                      checked={selectedPeriod === period}
                      onChange={() => setSelectedPeriod(period)}
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300 capitalize">
                      {period}
                    </span>
                  </label>
                ))}
              </div>

              {selectedPeriod === 'day' || selectedPeriod === 'week' ? (
                <div className="flex items-center gap-2">
                  <label htmlFor="datePicker" className="text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap">
                    Select Date:
                  </label>
                  <input
                    id="datePicker"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={todayStr}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : selectedPeriod === 'month' ? (
                <div className="relative" ref={monthPickerRef}>
                  <button
                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                  >
                    <FaCalendarAlt className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span>{months[selectedMonth]} {selectedYear}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-90' : ''}`} />
                  </button>

                  {showMonthPicker && (
                    <div className="absolute top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-20 p-4">
                      {/* Year navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => handleYearChange('prev')}
                          disabled={selectedYear <= currentYear - 5}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                          {selectedYear}
                        </span>
                        <button
                          onClick={() => handleYearChange('next')}
                          disabled={selectedYear >= currentYear}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>

                      {/* Month grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {months.map((month, index) => {
                          const isFuture = selectedYear === currentYear && index > currentMonth;
                          const isSelected = selectedMonth === index;
                          return (
                            <button
                              key={month}
                              onClick={() => !isFuture && handleMonthSelect(index)}
                              disabled={isFuture}
                              className={`
                                text-center py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isFuture 
                                  ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                                  : isSelected
                                  ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md scale-105'
                                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:shadow'
                                }
                              `}
                            >
                              {month}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <label htmlFor="yearDropdown" className="text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap">
                    Select Year:
                  </label>
                  <select
                    id="yearDropdown"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-6 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 max-h-[300px] border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <div className="min-w-[1000px] lg:min-w-full">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                  <thead className="sticky top-0 z-2">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="bg-blue-600 dark:bg-blue-700">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider select-none"
                            style={{ width: header.column.columnDef.size }}
                          >
                            <div 
                              className={`flex items-center gap-1 cursor-pointer select-none`}
                              onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                            >
                              <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                              {header.column.getCanSort() && (
                                <span className="ml-1 text-white text-xs">{getSortEmoji(header.column.id)}</span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentRows.length > 0 ? (
                      currentRows.map((row) => (
                        <tr
                          key={`${row.original.userFk}-${row.original.login}`}
                          className="hover:bg-blue-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-2 py-1.5 align-top" style={{ width: cell.column.columnDef.size }}>
                              <div className="leading-tight min-h-[20px] flex items-start text-gray-900 dark:text-white break-words">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length - 1} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center">
                            <Database className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                              {searchTerm ? 'No matching records found' : 'No records found'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalRows > 0 && (
              <div className="flex-none mt-2 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600 dark:text-gray-400 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, totalRows)}</span> of{' '}
                  <span className="font-medium">{totalRows}</span> records
                  {searchTerm && (
                    <span>
                      {' '}for search: <span className="font-medium">"{searchTerm}"</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 rounded border text-xs transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <FaChevronLeft className="w-2.5 h-2.5 inline mr-1" />
                      Prev
                    </button>
                    <span className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 rounded border text-xs transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      Next
                      <FaChevronRight className="w-2.5 h-2.5 inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Excel Download */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                Confirm {confirmTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                {confirmMessage}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetConfirm}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction) {
                    try {
                      await confirmAction();
                    } catch (error) {
                      console.error('Action failed:', error);
                    } finally {
                      resetConfirm();
                    }
                  } else {
                    resetConfirm();
                  }
                }}
                className="flex-1 px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {showSessionModal && <SessionModal />}
    </>
  );
};

export default UserLog;