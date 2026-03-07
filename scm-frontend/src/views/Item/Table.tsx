import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Badge, Tooltip } from 'flowbite-react';
import { useState, useEffect, useMemo } from 'react';
import { HiPlus, HiPencil } from 'react-icons/hi';
import { FaBox, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { RiFileExcel2Fill  } from "react-icons/ri";
import { CircleCheckBig } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SessionModal from '../SessionModal';
import Toastify, { showToast } from '../Toastify';
import CardBox from 'src/components/shared/CardBox';
import shape1 from '/src/assets/images/shapes/danger-card-shape.png';
import shape2 from '/src/assets/images/shapes/secondary-card-shape.png';
import shape3 from '/src/assets/images/shapes/success-card-shape.png';
import { Icon } from '@iconify/react';

// ---------- Interfaces ----------
interface ItemData {
  id: number;
  itemCode: string;
  itemName: string;
  itemAltName: string;
  itemCategory: string;
  account: string;
  itemState: string;
  itemOrigin: string;
  itemQuality: string;
  purchaseId: string;
  packageId: string;
  issueUnit: string;
  status: string;
}

// ---------- Main Component ----------
const ItemCreationView = () => {
  const [data, setData] = useState<ItemData[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<string | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination state (table)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // Grid pagination
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);

  const navigate = useNavigate();

  // ---------- Reset Confirm Modal ----------
  const resetConfirm = () => {
    setShowConfirm(false);
    setConfirmType(null);
    setConfirmTitle('');
    setConfirmMessage('');
    setConfirmAction(null);
  };

  const getConfirmButtonLabel = (type: string | null): string => {
    switch (type) {
      case 'download':
        return 'Download';
      case 'status':
        return 'Update';
      default:
        return 'Confirm';
    }
  };

  // ---------- Column Definitions (same style as StockReceiveTable) ----------
  const columns = useMemo(
    () => [
      // Serial No (not sortable, no sort icon)
      {
        id: 'serialNo',
        header: 'S.No',
        accessorFn: (_row: any, index: number) => index,
        cell: (info: any) => <span className="text-[11px]">{info.row.index + 1}</span>,
        size: 45,
        enableSorting: false,
      },
      // ID column (sortable)
      {
        id: 'id',
        header: 'Item Id',
        accessorFn: (row: ItemData) => row.itemCode,
        cell: (info: any) => (
          <span className="text-[11px] break-words text-gray-900 dark:text-white block max-w-[60px]">
            {info.getValue()}
          </span>
        ),
        size: 60,
        enableSorting: true,
      },
      // Item column (sortable)
      {
        id: 'item',
        header: 'Item',
        accessorFn: (row: ItemData) => `${row.itemCode} ${row.itemName}`,
        cell: (info: any) => (
          <div className="min-w-[120px]">
            <div className="text-[10px] font-medium leading-tight break-words text-gray-600 dark:text-gray-400 leading-tight break-words">
              {info.row.original.itemName}
            </div>
            {info.row.original.itemAltName && (
              <div className="text-[9px] text-gray-500 dark:text-gray-500 leading-tight break-words">
                Alt: {info.row.original.itemAltName}
              </div>
            )}
          </div>
        ),
        size: 140,
        enableSorting: true,
      },
      // Category (sortable)
      {
        id: 'itemCategory',
        header: 'Category',
        accessorFn: (row: ItemData) => row.itemCategory,
        cell: (info: any) => (
          <span className="text-[11px] break-words text-gray-900 dark:text-white block max-w-[100px]">
            {info.getValue()}
          </span>
        ),
        size: 90,
        enableSorting: true,
      },
      // Account (sortable)
      {
        id: 'account',
        header: 'Account',
        accessorFn: (row: ItemData) => row.account,
        cell: (info: any) => (
          <span className="text-[11px] break-words text-gray-900 dark:text-white block max-w-[100px]">
            {info.getValue()}
          </span>
        ),
        size: 90,
        enableSorting: true,
      },
      // State/Origin merged (sortable)
      {
        id: 'stateOrigin',
        header: 'State/Origin',
        accessorFn: (row: ItemData) => `${row.itemState} / ${row.itemOrigin}`,
        cell: (info: any) => (
          <div className="min-w-[100px]">
            <div className="text-[11px] leading-tight break-words text-gray-900 dark:text-white">
              {info.row.original.itemState}
            </div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight break-words">
              {info.row.original.itemOrigin}
            </div>
          </div>
        ),
        size: 100,
        enableSorting: true,
      },
      // Quality (sortable)
      {
        id: 'itemQuality',
        header: 'Quality',
        accessorFn: (row: ItemData) => row.itemQuality,
        cell: (info: any) => (
          <span className="text-[11px] break-words text-gray-900 dark:text-white block max-w-[80px]">
            {info.getValue()}
          </span>
        ),
        size: 70,
        enableSorting: true,
      },
      // Purchase / Package (sortable)
      {
        id: 'purchasePackage',
        header: 'Purchase / Package',
        accessorFn: (row: ItemData) => `${row.purchaseId} ${row.packageId}`,
        cell: (info: any) => (
          <div className="min-w-[100px]">
            <div className="text-[11px] font-medium leading-tight break-words text-gray-900 dark:text-white">
              {info.row.original.purchaseId}
            </div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight break-words">
              {info.row.original.packageId}
            </div>
          </div>
        ),
        size: 100,
        enableSorting: true,
      },
      // UOM (sortable)
      {
        id: 'issueUnit',
        header: 'UOM',
        accessorFn: (row: ItemData) => row.issueUnit,
        cell: (info: any) => (
          <span className="text-[11px] break-words text-gray-900 dark:text-white block max-w-[60px]">
            {info.getValue()}
          </span>
        ),
        size: 60,
        enableSorting: true,
      },
      // Status column (renamed from actions, with toggle, not sortable)
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row: ItemData) => row.id, // dummy for consistency
        cell: (info: any) => {
          const row = info.row.original;
          const isActive = row.status === 'Active';
          return (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isActive}
                onChange={() => handleStatusChange(row.id, row.itemCode, row.status)}
              />
              <div
                className="
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
                "
              ></div>
            </label>
          );
        },
        size: 90,
        enableSorting: false,
      },
      // Hidden column for global search (never displayed)
      {
        id: 'global_search',
        accessorFn: (row: ItemData) =>
          [
            row.id.toString(),
            row.itemCode,
            row.itemName,
            row.itemAltName,
            row.itemCategory,
            row.account,
            row.itemState,
            row.itemOrigin,
            row.itemQuality,
            row.purchaseId,
            row.packageId,
            row.issueUnit,
            row.status,
          ].join(' '),
        header: '',
        cell: () => null,
        size: 0,
        enableSorting: false,
      },
    ],
    []
  );

  // ---------- API Handlers ----------
  const handleStatusChange = (id: number, code: string, currentStatus: string) => {
    const action = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setConfirmType('status');
    setConfirmTitle('Status Change');
    setConfirmMessage(`Are you sure you want to ${action} this item? Item Code: ${code}`);

    const statusAction = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const newStatus = currentStatus === 'Active' ? 'I' : 'A';
        const response = await fetch(
          'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/itemStatusUpdate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              itemPk: id,
              itemCode: code,
              status: newStatus,
            }),
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
        setShowSessionModal(true);
        showToast('An error occurred while updating status', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    setConfirmAction(() => statusAction);
    setShowConfirm(true);
  };

  const handleDownloadExcel = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    const url =
      'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/downloadItemCreationReport';
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
      a.download = 'Item_Creation_Report.xls';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlObj);
      document.body.removeChild(a);
      showToast('File downloaded successfully', 'success');
    } catch (error) {
      showToast('Failed to download file', 'error');
      setShowSessionModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/itemMasterList',
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 401) {
        setShowSessionModal(true);
        return;
      }
      const result = await response.json();
      if (result.success) {
        const mappedData = result.data.map((item: any) => ({
          id: item.itemPk,
          itemCode: item.itemCode,
          itemName: item.itemName,
          itemAltName: item.itemNickName,
          itemCategory: item.itemCategoryName,
          account: item.itemAccountName,
          itemState: item.itemStateName,
          itemOrigin: item.itemOriginName,
          itemQuality: item.itemQualityName,
          purchaseId: item.purchaseId,
          packageId: item.packageId,
          issueUnit: item.uom,
          status: item.status === 'A' ? 'Active' : item.status === 'I' ? 'Inactive' : item.status,
        }));
        setData(mappedData);
      } else {
        setData([]);
      }
    } catch (error) {
      setShowSessionModal(true);
      setData([]);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Table & Filtering ----------
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility: { global_search: false },
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  // FIXED: Use full row model (filter + sort) instead of only filteredRows
  // This is the exact pattern from the working StockReceiveTable component
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

  // ---------- Dashboard Cards ----------
  const DashboardCards = () => {
    const total = filteredData.length;
    const active = filteredData.filter((item) => item.status === 'Active').length;
    const inactive = filteredData.filter((item) => item.status !== 'Active').length;

    const cards = [
      {
        icon: 'mdi:clipboard-list-outline',
        num: total,
        title: 'Total Items',
        shape: shape3,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconBg: 'bg-yellow-500',
      },
      {
        icon: 'mdi:check-circle-outline',
        num: active,
        title: 'Active',
        shape: shape1,
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        iconBg: 'bg-green-500',
      },
      {
        icon: 'mdi:close-circle-outline',
        num: inactive,
        title: 'Inactive',
        shape: shape2,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        iconBg: 'bg-red-500',
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
        {cards.map((card, index) => (
          <div className="lg:col-span-2" key={index}>
            <CardBox
              className={`relative shadow-none rounded-lg overflow-hidden ${card.bgColor} h-14 sm:h-16 md:h-20`}
            >
              <div className="flex items-center justify-between p-1.5 sm:p-2 h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-0.5 truncate">
                    {card.title}
                  </p>
                  <h5 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 dark:text-white">
                    {card.num}
                  </h5>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <span
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white ${card.iconBg}`}
                  >
                    <Icon icon={card.icon} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </span>
                </div>
              </div>
              <img
                src={card.shape}
                alt="shape"
                className="absolute end-0 top-0 opacity-20 h-full w-auto"
              />
            </CardBox>
          </div>
        ))}
      </div>
    );
  };

  // ---------- Grid View Component (unchanged) ----------
  const ItemGrid = () => (
    <>
      <DashboardCards />
      <div className="relative grid-container-scroll max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
          {currentGridItems.map((item, index) => (
            <CardBox
              key={item.id || index}
              className="hover:shadow-md transition-shadow duration-300 border border-gray-200 dark:border-gray-700 h-auto p-3 sm:p-4 bg-white dark:bg-gray-800"
            >
              {/* Card Header - removed status Badge */}
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1">
                  <Tooltip content={item.itemCode} placement="top">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base truncate">
                      {item.itemCode}
                    </h3>
                  </Tooltip>
                  <Tooltip content={item.itemName} placement="top">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                      {item.itemName}
                    </p>
                  </Tooltip>
                  {item.itemAltName && (
                    <Tooltip content={item.itemAltName} placement="top">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                        Alt: {item.itemAltName}
                      </p>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Row 1: Category & Account */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Icon icon="mdi:tag" className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                      Category
                    </span>
                  </div>
                  <Tooltip content={item.itemCategory} placement="top">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white break-words truncate">
                      {item.itemCategory}
                    </p>
                  </Tooltip>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Icon icon="mdi:bank" className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                      Account
                    </span>
                  </div>
                  <Tooltip content={item.account} placement="top">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white break-words truncate">
                      {item.account}
                    </p>
                  </Tooltip>
                </div>
              </div>

              {/* Row 2: State, Origin (merged), Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 mb-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 sm:p-2 rounded">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Icon icon="mdi:map-marker" className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">State</span>
                  </div>
                  <Tooltip content={item.itemState} placement="top">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                      {item.itemState}
                    </p>
                  </Tooltip>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 sm:p-2 rounded">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Icon icon="mdi:earth" className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">Origin</span>
                  </div>
                  <Tooltip content={item.itemOrigin} placement="top">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                      {item.itemOrigin}
                    </p>
                  </Tooltip>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 sm:p-2 rounded">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Icon icon="mdi:star" className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">Quality</span>
                  </div>
                  <Tooltip content={item.itemQuality} placement="top">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white truncate">
                      {item.itemQuality}
                    </p>
                  </Tooltip>
                </div>
              </div>

              {/* Bottom Row: Purchase, Package, UOM */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-md mt-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Purchase ID</p>
                    <Tooltip content={item.purchaseId} placement="top">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate">
                        {item.purchaseId}
                      </p>
                    </Tooltip>
                  </div>
                  <div className="flex-1 min-w-0 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Package ID</p>
                    <Tooltip content={item.packageId} placement="top">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate">
                        {item.packageId}
                      </p>
                    </Tooltip>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">UOM</p>
                    <Tooltip content={item.issueUnit} placement="top">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white truncate">
                        {item.issueUnit}
                      </p>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Status Toggle (renamed section) */}
              <div className="flex justify-end mt-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={item.status === 'Active'}
                    onChange={() => handleStatusChange(item.id, item.itemCode, item.status)}
                  />
                  <div
                    className="
                      relative w-11 h-6 bg-gray-300 dark:bg-gray-600 
                      peer-focus:outline-none peer-focus:ring-4 
                      peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                      rounded-full transition-colors duration-300
                      peer-checked:bg-blue-500 peer-checked: dark:bg-blue-500
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
                    "
                  ></div>
                </label>
              </div>
            </CardBox>
          ))}
        </div>
      </div>

      {/* Grid Pagination */}
      {totalGridRows > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 px-1">
          <div className="text-xs text-gray-600 dark:text-gray-400 order-2 sm:order-1">
            Showing <span className="font-medium">{gridStartIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(gridEndIndex, totalGridRows)}</span> of{' '}
            <span className="font-medium">{totalGridRows}</span> items
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => handleGridPageChange(gridCurrentPage - 1)}
              disabled={gridCurrentPage === 1}
              className={`px-3 py-1.5 rounded border text-xs flex items-center gap-1 transition-colors ${
                gridCurrentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 border-gray-300 dark:border-gray-600'
              }`}
            >
              <FaChevronLeft className="w-3 h-3" />
              Prev
            </button>
            <span className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800 font-medium">
              {gridCurrentPage} of {totalGridPages}
            </span>
            <button
              onClick={() => handleGridPageChange(gridCurrentPage + 1)}
              disabled={gridCurrentPage === totalGridPages}
              className={`px-3 py-1.5 rounded border text-xs flex items-center gap-1 transition-colors ${
                gridCurrentPage === totalGridPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 border-gray-300 dark:border-gray-600'
              }`}
            >
              Next
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {filteredData.length === 0 && !loading && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
          <Icon
            icon="mdi:package-variant-closed"
            className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2 sm:mb-3"
          />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No records found</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
            Try adjusting your search
          </p>
        </div>
      )}
    </>
  );

  // ---------- Main Render ----------
  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-2">
      <Toastify />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-600 dark:text-indigo-400 whitespace-nowrap flex items-center gap-2">
          <FaBox className="h-5 w-5 text-indigo-700 dark:text-indigo-400" /> Item Creation List
        </h1>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-2 w-full sm:w-auto gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon icon="mdi:table" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Table</span>
            <span className="sm:hidden">Table</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon icon="mdi:view-grid" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid</span>
            <span className="sm:hidden">Grid</span>
          </button>
          <div className="flex gap-2 justify-end sm:justify-start">
            <Tooltip content="Add" className="z-50">
              <button
                onClick={() => navigate('/itemCreation')}
                className="w-10 bg-blue-600 hover:bg-blue-700 text-white h-10 p-0 rounded-full flex items-center justify-center"
              >
                <HiPlus className="text-sm sm:text-base" />
              </button>
            </Tooltip>
            <Tooltip content="Edit" className="z-50">
              <button
                onClick={() => navigate('/itemUpdate')}
                className="w-10 bg-yellow-600 hover:bg-yellow-700 text-white h-10 p-0 rounded-full flex items-center justify-center"
              >
                <HiPencil className="text-sm sm:text-base" />
              </button>
            </Tooltip>
            <Tooltip content="Excel" className="z-50">
              <button
                onClick={() => {
                  setConfirmType('download');
                  setConfirmTitle('Download');
                  setConfirmMessage('Are you sure you want to download the Item Creation Report?');
                  setConfirmAction(() => handleDownloadExcel);
                  setShowConfirm(true);
                }}
                className="w-10 bg-green-500 hover:bg-green-400 text-white h-10 p-0 rounded-full flex items-center justify-center"
              >
                <RiFileExcel2Fill  className="text-sm sm:text-base" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

       {/* Search Bar */}
        <div className="flex justify-end m-1">
  <div className="w-full sm:w-64 relative">
    
    {/* Search Icon */}
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <svg
        className="w-4 h-4 text-gray-400 dark:text-gray-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <input
      type="text"
      placeholder={`Search ${data.length} items...`}
      className="w-full h-9 pl-10 pr-3 py-1 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      value={globalFilter}
      onChange={(e) => setGlobalFilter(e.target.value)}
    />
    
  </div>
</div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md m-1 p-1 sm:p-1">
       

        {/* Table View */}
        {viewMode === 'table' && (
          <>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
              <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
                <div className="min-w-[1000px] lg:min-w-full">
                  <div className="overflow-auto max-h-[390px] relative">
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                      <thead className="sticky top-0 z-2 h-8">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id} className="bg-blue-600 dark:bg-blue-700">
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                                style={{ width: `${header.column.columnDef.size || 80}px` }}
                              >
                                <div className="flex items-center justify-between">
                                  <span>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                  </span>
                                  {/* Sorting indicator - only show if sortable */}
                                  {header.column.columnDef.enableSorting && (
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
                          currentRows.map((row) => (
                            <tr
                              key={row.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td
                                  key={cell.id}
                                  className="px-1.5 py-1 align-top"
                                  style={{ width: `${cell.column.columnDef.size || 80}px` }}
                                >
                                  <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
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
                                <Icon
                                  icon="mdi:database-outline"
                                  className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1"
                                />
                                <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                                  {globalFilter ? 'No matching records found' : 'No records found'}
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

            {/* Table Pagination */}
            {filteredData.length > 0 && (
              <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                <div>
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, totalRows)}</span> of{' '}
                  <span className="font-medium">{totalRows}</span> records
                  {globalFilter && (
                    <span>
                      {' '}
                      for search: <span className="font-medium">"{globalFilter}"</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px]">
                    {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <FaChevronLeft className="w-2.5 h-2.5 inline mr-0.5" />
                      Prev
                    </button>
                    <span className="px-2 py-0.5 text-[12px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      Next
                      <FaChevronRight className="w-2.5 h-2.5 inline ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && <ItemGrid />}
      </div>

      {/* Modals */}
      {showSessionModal && <SessionModal />}

      {/* Confirmation Modal */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
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
                  if (confirmAction && typeof confirmAction === 'function') {
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
                className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  confirmType === 'status'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900 focus:ring-red-500 dark:focus:ring-offset-gray-900'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
                }`}
              >
                {getConfirmButtonLabel(confirmType)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
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
    </div>
  );
};

export default ItemCreationView;