// ProfitCenterTable.tsx
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Badge, Tooltip } from 'flowbite-react';
import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Edit, Eye, RefreshCw } from 'lucide-react';
import { FaRegEdit } from 'react-icons/fa';
import { Icon } from '@iconify/react';
import SessionModal from '../SessionModal';
import { showToast } from '../Toastify';
import CardBox from 'src/components/shared/CardBox';
import shape1 from '/src/assets/images/shapes/danger-card-shape.png';
import shape2 from '/src/assets/images/shapes/secondary-card-shape.png';
import shape3 from '/src/assets/images/shapes/success-card-shape.png';

// ---------- Interfaces ----------
interface ProfitCenterData {
  id: number;
  locationID: string;
  locationName: string;
  contractName: string;
  paymentType: string;
  segmentName: string;
  status: string;
  statusColor: string;
  streetAddress1: string;
  streetAddress2: string;
  telPhoneNo: string;
  locationManagerID: string | null;
  operationManagerID: string | null;
  projectManagerID: string | null;
  contractStartDt: string;
  contractEndDt: string;
  typeOfPayemnt: number;
  contractFk: number;
  entityId?: number;
}

// ---------- Main Component ----------
interface ProfitCenterTableProps {
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onAddNew?: () => void;
  onShowConfirm: (type: 'status' | 'edit', title: string, message: string, action: () => Promise<void>) => void;
  onView: (id: number) => void;
  onEdit: (item: ProfitCenterData) => void;
}

const ProfitCenterTable = forwardRef<any, ProfitCenterTableProps>(({
  viewMode,
  onShowConfirm,
  onView,
  onEdit,
}, ref) => {
  const [data, setData] = useState<ProfitCenterData[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Grid pagination
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);

  // Per‑row loading for status toggle
  const [isTogglingStatus, setIsTogglingStatus] = useState<Record<number, boolean>>({});

  const columnHelper = createColumnHelper<ProfitCenterData>();

  // ---------- API Handlers ----------
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { setShowSessionModal(true); return; }
      const response = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/locationListData',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 401) { setShowSessionModal(true); return; }
      const result = await response.json();
      if (result.success) {
        const mappedData = result.data.map((item: any) => {
          const isActive = item.iSActive === 1;
          return {
            id: item.locationPk,
            locationID: item.locationID,
            locationName: item.locationName,
            contractName: item.contractName || 'N/A',
            paymentType: item.typeOfPaymentStr || '',
            segmentName: item.segmentName || '',
            status: isActive ? 'Active' : 'Inactive',
            statusColor: isActive ? 'success' : 'failure',
            streetAddress1: item.streetAddress1 || '',
            streetAddress2: item.streetAddress2 || '',
            telPhoneNo: item.telPhoneNo || '',
            locationManagerID: item.locationManagerID || null,
            operationManagerID: item.operationManagerID || null,
            projectManagerID: item.projectManagerID || null,
            contractStartDt: item.contractStartDt || '',
            contractEndDt: item.contractEndDt || '',
            typeOfPayemnt: item.typeOfPayemnt || 0,
            contractFk: item.contractFk || 0,
          };
        });
        setData(mappedData);
      } else {
        setData([]);
        showToast(result.message || 'Failed to load data', 'error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setShowSessionModal(true);
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh to parent (no local loading)
  useImperativeHandle(ref, () => ({
    refreshData: fetchData,
    handleDownloadExcel: handleDownloadExcel, // Ensure this is only called via ref, not directly
  }));

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Status Change (uses parent confirm) ----------
  const handleStatusChange = (item: ProfitCenterData) => {
    const { id, status } = item;
    const action = status === 'Active' ? 'In‑active' : 'Active';
    onShowConfirm(
      'status',
      'Status Change',
      `Are you sure you want to ${action} this profit center?`,
      async () => {
        setIsTogglingStatus(prev => ({ ...prev, [id]: true }));
        try {
          const token = localStorage.getItem('authToken');
          if (!token) { setShowSessionModal(true); return; }
          const newStatus = status === 'Active' ? 'I' : 'A';
          const response = await fetch(
            'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/profitCenterStatusUpdate',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ locationPk: id, locationStatus: newStatus }),
            }
          );
          const result = await response.json();
          if (response.ok && result.success) {
            showToast(result.message || 'Status updated successfully', 'success');
            await fetchData();
          } else {
            showToast(result.message || 'Failed to update status', 'error');
          }
        } catch (error) {
          console.error('Status update error:', error);
          setShowSessionModal(true);
          showToast('An error occurred while updating status', 'error');
        } finally {
          setIsTogglingStatus(prev => ({ ...prev, [id]: false }));
        }
      }
    );
  };

  // ---------- Download Excel (no local loading, parent handles it; ensure no direct invocation) ----------
  const handleDownloadExcel = async () => {
    // This function is only called via ref from parent's confirm action
    const token = localStorage.getItem('authToken');
    if (!token) { 
      setShowSessionModal(true); 
      return; 
    }
    const url = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/downloadExcelByProfitCenter';
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { 
        setShowSessionModal(true); 
        return; 
      }
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = 'Profit_Center_Report.xls';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlObj);
      document.body.removeChild(a);
      showToast('File downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to download file', 'error');
      setShowSessionModal(true);
    }
  };

  // ---------- Table Columns ----------
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'sno',
        header: 'S.No.',
        cell: ({ row }) => {
          const absoluteIndex = (currentPage - 1) * rowsPerPage + row.index + 1;
          return <span className="text-[11px] text-gray-900 dark:text-white">{absoluteIndex}</span>;
        },
        size: 30,
        enableSorting: false,
      }),
      columnHelper.accessor('locationID', {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <div className="min-w-[120px]">
            <div className="text-[11px] font-medium leading-tight break-words text-gray-900 dark:text-white">
              {row.original.locationID}
            </div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight break-words">
              {row.original.locationName}
            </div>
          </div>
        ),
        size: 140,
        enableSorting: true,
      }),
      columnHelper.accessor('paymentType', {
        header: 'Payment Type',
        cell: (info) => (
          <span className="text-[11px] break-words text-gray-900 dark:text-white block max-w-[90px]">
            {info.getValue()}
          </span>
        ),
        size: 100,
        enableSorting: true,
      }),
      columnHelper.accessor('segmentName', {
        header: 'Segment',
        cell: (info) => (
          <span className="text-[11px] break-words text-gray-900 dark:text-white block max-w-[80px]">
            {info.getValue()}
          </span>
        ),
        size: 90,
        enableSorting: true,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const isActive = info.getValue() === 'Active';
          return (
            <Badge
              color={isActive ? 'success' : 'failure'}
              className="text-[10px] px-1.5 py-0.5 leading-tight whitespace-nowrap"
            >
              {info.getValue()}
            </Badge>
          );
        },
        size: 80,
        enableSorting: true,
      }),
      columnHelper.display({
        id: 'changeStatus',
        header: 'Change Status',
        cell: ({ row }) => {
          const item = row.original;
          const isLoading = isTogglingStatus[item.id];
          const isActive = item.status === 'Active';
          return (
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isActive}
                  disabled={isLoading}
                  onChange={() => handleStatusChange(item)}
                />
                <div
                  className={`
                    relative w-11 h-6 bg-gray-300 dark:bg-gray-600 
                    peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                    rounded-full transition-colors duration-300
                    peer-checked:bg-blue-500 peer-checked:dark:bg-blue-500
                    after:content-['✕']
                    peer-checked:after:content-['✓']
                    after:absolute after:top-[2px] after:left-[2px]
                    after:flex after:items-center after:justify-center
                    after:text-[10px] after:font-bold
                    after:text-gray-700 dark:after:text-gray-700
                    after:bg-white after:rounded-full
                    after:h-5 after:w-5
                    after:transition-all after:duration-300
                    peer-checked:after:translate-x-5
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                ></div>
              </label>
              {isLoading && <RefreshCw size={12} className="animate-spin text-gray-500" />}
            </div>
          );
        },
        size: 120,
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'view',
        header: 'View',
        cell: ({ row }) => (
          <div className="flex justify-start">
            <button
              onClick={() => onView(row.original.id)}
              className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
          </div>
        ),
        size: 70,
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'modify',
        header: 'Modify',
        cell: ({ row }) => (
          <div className="flex justify-start">
            <button
              onClick={() => onEdit(row.original)}
              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
          </div>
        ),
        size: 80,
        enableSorting: false,
      }),
      columnHelper.accessor(
        (row) => [row.locationID, row.locationName, row.paymentType, row.segmentName, row.status].join(' '),
        { id: 'global_search', header: '', cell: () => null, enableSorting: false }
      ),
    ],
    [currentPage, rowsPerPage, isTogglingStatus]
  );

  // ---------- Table Instance ----------
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnVisibility: { global_search: false }, sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const tableRows = table.getRowModel().rows;
  const filteredData = tableRows.map((row) => row.original);

  // Table pagination
  const totalRows = tableRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = tableRows.slice(startIndex, endIndex);

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Grid pagination
  const totalGridRows = filteredData.length;
  const totalGridPages = Math.ceil(totalGridRows / gridRowsPerPage);
  const gridStartIndex = (gridCurrentPage - 1) * gridRowsPerPage;
  const gridEndIndex = gridStartIndex + gridRowsPerPage;
  const currentGridItems = filteredData.slice(gridStartIndex, gridEndIndex);

  const handleGridPageChange = (page: number) => {
    setGridCurrentPage(page);
    const container = document.querySelector('.grid-container-scroll');
    if (container) container.scrollTop = 0;
  };

  useEffect(() => {
    setGridCurrentPage(1);
    setCurrentPage(1);
  }, [globalFilter]);

  // ---------- Dashboard Cards (reduced space: tighter padding) ----------
  const DashboardCards = () => {
    const total = filteredData.length;
    const active = filteredData.filter((item) => item.status === 'Active').length;
    const inactive = filteredData.filter((item) => item.status !== 'Active').length;

    const cards = [
      {
        icon: 'mdi:clipboard-list-outline',
        num: total,
        title: 'Total',
        shape: shape3,
        bgColor: 'bg-amber-100 dark:bg-amber-900/20',
        iconBg: 'bg-amber-200 dark:bg-amber-800/40',
        textColor: 'text-amber-700 dark:text-amber-300',
        iconColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        icon: 'mdi:check-circle-outline',
        num: active,
        title: 'Active',
        shape: shape1,
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconBg: 'bg-green-200 dark:bg-green-800/40',
        textColor: 'text-green-700 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400',
      },
      {
        icon: 'mdi:close-circle-outline',
        num: inactive,
        title: 'Inactive',
        shape: shape2,
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        iconBg: 'bg-red-200 dark:bg-red-800/40',
        textColor: 'text-red-700 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400',
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {cards.map((card, index) => (
          <CardBox
            key={index}
            className={`h-15 relative shadow-sm rounded-lg overflow-hidden ${card.bgColor} border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between p-1.5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 truncate">{card.title}</p>
                <h5 className="text-lg font-bold text-gray-800 dark:text-white truncate">{card.num}</h5>
              </div>
              <div className={`p-1.5 rounded-full ${card.iconBg} flex-shrink-0`}>
                <Icon icon={card.icon} className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <img src={card.shape} alt="shape" className="absolute right-0 bottom-0 opacity-10 h-10 w-auto" />
          </CardBox>
        ))}
      </div>
    );
  };

  // ---------- Grid View (with enhanced cards) ----------
  const ProfitCenterGrid = () => (
    <div className="flex flex-col h-full">
      <DashboardCards />
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar grid-container-scroll">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
          {currentGridItems.map((item, index) => {
            const isLoading = isTogglingStatus[item.id];
            const isActive = item.status === 'Active';
            return (
              <CardBox
                key={item.id || index}
                className="hover:shadow-md transition-shadow duration-300 border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1">
                    <Tooltip content={item.locationID} placement="top">
                      <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                        {item.locationID}
                      </h3>
                    </Tooltip>
                    <Tooltip content={item.locationName} placement="top">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {item.locationName}
                      </p>
                    </Tooltip>
                  </div>
                  <Badge
                    color={item.status === 'Active' ? 'success' : 'failure'}
                    className="text-[10px] py-0.5 px-1.5 whitespace-nowrap"
                  >
                    {item.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Payment</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.paymentType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Segment</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.segmentName}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
                  Start: {item.contractStartDt || '—'}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onView(item.id)}
                      className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded"
                      title="Edit"
                    >
                      <FaRegEdit size={14} />
                    </button>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleStatusChange(item)}
                      disabled={isLoading}
                      className="sr-only peer"
                    />
                    <div
                      className={`
                        relative w-10 h-5 rounded-full transition-colors duration-300
                        ${isActive ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}
                        ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
                      `}
                    >
                      <div
                        className={`
                          absolute top-[2px] left-[2px]
                          h-4 w-4 bg-white rounded-full
                          flex items-center justify-center
                          text-[8px] font-bold
                          transition-all duration-300
                          ${isActive ? "translate-x-5 text-blue-500" : "text-gray-500"}
                        `}
                      >
                        {isLoading ? (
                          <RefreshCw size={8} className="animate-spin" />
                        ) : isActive ? (
                          "✓"
                        ) : (
                          "✕"
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </CardBox>
            );
          })}
        </div>
      </div>

      {/* Grid Pagination */}
      {totalGridRows > 0 && (
        <div className="mt-3 flex flex-col sm:flex-row justify-between items-center gap-2 px-1 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            Showing {gridStartIndex + 1}-{Math.min(gridEndIndex, totalGridRows)} of {totalGridRows}
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => handleGridPageChange(gridCurrentPage - 1)}
              disabled={gridCurrentPage === 1}
              className="px-2 py-1 rounded border text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <HiChevronLeft className="w-3 h-3 inline" />
            </button>
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
              {gridCurrentPage}/{totalGridPages}
            </span>
            <button
              onClick={() => handleGridPageChange(gridCurrentPage + 1)}
              disabled={gridCurrentPage === totalGridPages}
              className="px-2 py-1 rounded border text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <HiChevronRight className="w-3 h-3 inline" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-h-screen flex flex-col">
      {/* Search Bar */}
      <div className="flex justify-end mb-3 flex-shrink-0">
        <div className="relative w-full sm:w-56">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Icon icon="mdi:magnify" className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={`Search ${totalRows} records`}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm flex-1 max-h-screen flex flex-col">
            <div className="overflow-y-auto max-h-[300px] flex-1 min-h-0 custom-scrollbar">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-blue-600 dark:bg-blue-700 text-white sticky top-0 z-10">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 align-top"
                          style={{ width: `${header.column.columnDef.size}px` }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {/* Sorting indicator - emoji style - only show if column is sortable */}
                            {header.column.getCanSort() && (
                              <span className="ml-1 flex-shrink-0 text-[10px]">
                                {{
                                  asc: ' 🔼',
                                  desc: ' 🔽',
                                }[header.column.getIsSorted() as string] ?? ' ↕️'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRows.length > 0 ? (
                    currentRows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {row.getVisibleCells().map(cell => (
                          <td 
                            key={cell.id} 
                            className="px-3 py-2 text-xs text-gray-900 dark:text-white align-top" 
                            style={{ width: `${cell.column.columnDef.size}px` }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-3 py-4 text-center text-sm text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-3 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
              <div>
                Showing {startIndex + 1} to {Math.min(endIndex, totalRows)} of {totalRows}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Prev
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <ProfitCenterGrid />
      )}

      {/* Session Modal */}
      {showSessionModal && <SessionModal />}
    </div>
  );
});

export default ProfitCenterTable;