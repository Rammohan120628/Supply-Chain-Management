import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Badge, Tooltip, Modal, Button, Breadcrumb } from 'flowbite-react';
import { HiDownload } from 'react-icons/hi';
import { CalendarDays, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import toast from 'react-hot-toast';
import PurchaseViewScreen from './PurchaseViewScreen';
import SessionModal from '../SessionModal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useEntityFormatter } from "../Entity/UseEntityFormater";
import CardBox from 'src/components/shared/CardBox';
import shape1 from "/src/assets/images/shapes/danger-card-shape.png";
import shape2 from "/src/assets/images/shapes/secondary-card-shape.png";
import shape3 from "/src/assets/images/shapes/success-card-shape.png";
import { ModalHeader ,ModalBody,ModalFooter} from 'flowbite-react';
import { MdKeyboardArrowRight } from 'react-icons/md';
import {  HiHome } from 'react-icons/hi';

export interface PurchaseOrderData {
  periodSimple: string;
  itemName: string;
  poHeadPK: number;
  supplierFK: number;
  poHeadFK: number;
  locationFK: number;
  itemFK: number;
  userUniqueCode: string | null;
  poNumber: string;
  supplierName: string;
  consoId: string;
  period: string;
  podateStr: string;
  pOSupplier: string | null;
  poLocation: string;
  poLocationName: string;
  entityId: string;
  currencyId: string;
  currencyRate: number;
  discPer: number;
  lastUser: string | null;
  lastUpdate: string;
  deliveryType: number;
  poNum: string | null;
  pOperiod: string | null;
  entOrder: number;
  itemId: number;
  ip02: number;
  supplierId: string;
  packageId: string | null;
  quantity: number;
  totalCost: number;
  totalCost1: number;
  quotedGP: number;
  actualGP: number;
  actualGP1: number;
  priceChReason: string | null;
  rcvdQty: number;
  poEntityID: string | null;
  userFk: number;
  userId: string;
  statusFk: number;
  statusName: string;
  paymentType: number;
  subList: any[];
  uploadedItem: any[];
}

interface PurchaseTableProps {
  onBack: () => void;
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
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined)
    );
    onApplyFilter(cleanedFilters);
    onClose();
  };

  const getHeaderName = (column: any): string => {
    if (typeof column.header === 'string') return column.header;
    if (column.id === 'supplier') return 'Supplier';
    if (column.id === 'location') return 'Location';
    if (column.id === 'itemName') return 'Type';
    if (column.id === 'periodSimple') return 'Delivery Period';
    if (column.id === 'statusName') return 'Status';
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
            if (column.id === 'sno' || column.id === 'download' || column.id === 'view') return null;
            
            const headerName = getHeaderName(column);
            
            return (
              <div key={column.id} className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  {headerName}
                </label>
                <input
                  type="text"
                  value={filters[column.id] || ''}
                  onChange={(e) => handleFilterChange(column.id, e.target.value)}
                  placeholder={`Filter by ${headerName.toLowerCase()}...`}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
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

const PurchaseTable = ({ onBack }: PurchaseTableProps) => {
  const { formatDate, formatDateTime, formatAmount, formatQuantity } = useEntityFormatter();

  const currentDate = new Date();
  const [selectedPoNumber, setSelectedPoNumber] = useState('');
  const [data, setData] = useState<PurchaseOrderData[]>([]);
  const [screenView, setScreenView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [downisLoading, setDownisLoading] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<PurchaseOrderData[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const formatter = useEntityFormatter(); 

  // Pagination for table
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  
  // Pagination for grid
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
  const [gridRowsPerPage] = useState(6);

  // Month picker
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const periodRef = useRef<HTMLDivElement>(null);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const periodOptions = months;

  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };
  
  const formatDateForDisplay = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };
  
  const isPeriodSelected = (index: number) => selectedMonth !== null && index === selectedMonth;
  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  const token = localStorage.getItem("authToken");

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

  // Initial load
  useEffect(() => {
    const purchasePeriod = localStorage.getItem("purchasePeriod");
    if (purchasePeriod) {
      const parts = purchasePeriod.split('-');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (!isNaN(month) && !isNaN(year)) {
          setSelectedMonth(month - 1);
          setSelectedYear(year);
          fetchPurchaseOrders(`01-${String(month).padStart(2,'0')}-${year}`);
          return;
        }
      }
    }
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    fetchPurchaseOrders(formatDateForApi(currentMonth, currentYear));
  }, []);

  const fetchPurchaseOrders = async (period?: string) => {
    setIsLoading(true);
    setError(null);
    setGlobalFilter('');
    setAdvancedFilters({});
    setFilteredData([]);
    
    try {
      let formattedDate = period;
      if (!formattedDate && selectedMonth !== null) {
        formattedDate = formatDateForApi(selectedMonth, selectedYear);
      }
      if (!formattedDate) throw new Error('No period selected');
      if (!token) {
        setSessionExpired(true);
        return;
      }

      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/prepareList/${formattedDate}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
        setFilteredData(result.data || []);
        setCurrentPage(1);
        setGridCurrentPage(1);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply advanced filters to data
  const applyAdvancedFilters = useCallback((dataToFilter: PurchaseOrderData[], filters: Record<string, string>) => {
    if (Object.keys(filters).length === 0) return dataToFilter;

    return dataToFilter.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;

        let itemValue: any;
        switch (key) {
          case 'supplier':
            itemValue = `${item.supplierId} ${item.supplierName}`.toLowerCase();
            break;
          case 'location':
            itemValue = `${item.poLocation} ${item.poLocationName}`.toLowerCase();
            break;
          case 'userId':
            itemValue = `${item.userId} ${item.lastUpdate}`.toLowerCase();
            break;
          case 'poNumber':
          case 'podateStr':
          case 'itemName':
          case 'periodSimple':
          case 'statusName':
            itemValue = String(item[key as keyof PurchaseOrderData] || '').toLowerCase();
            break;
          default:
            itemValue = String(item[key as keyof PurchaseOrderData] || '').toLowerCase();
        }
        
        return itemValue.includes(String(value).toLowerCase());
      });
    });
  }, []);

  // Custom search function
  const searchData = useCallback((searchTerm: string, dataToSearch: PurchaseOrderData[]) => {
    if (!searchTerm.trim()) {
      return dataToSearch;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    
    return dataToSearch.filter(item => {
      const searchableFields = [
        item.poNumber,
        item.supplierId,
        item.supplierName,
        item.poLocation,
        item.poLocationName,
        item.itemName,
        item.periodSimple,
        item.statusName,
        item.userId,
        item.podateStr,
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

  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
    fetchPurchaseOrders(formatDateForApi(index, selectedYear));
  };
  
  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    if (selectedMonth !== null) {
      fetchPurchaseOrders(formatDateForApi(selectedMonth, newYear));
    }
  };

  const handleViewClick = (poNumber: string) => {
    setSelectedPoNumber(poNumber);
    setScreenView(true);
  };
  
  const handleBackFromView = () => {
    setScreenView(false);
    setSelectedPoNumber('');
  };

  const handleDownloadOverall = async () => {
    try {
      if (!token) {
        setSessionExpired(true);
        return;
      }
      setIsLoading(true);
      setDownisLoading('overall');
      let formattedDate = '';
      if (selectedMonth !== null) {
        formattedDate = formatDateForApi(selectedMonth, selectedYear);
      } else {
        formattedDate = formatDateForApi(currentDate.getMonth(), currentDate.getFullYear());
      }
      const downloadUrl = `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/downloadOverallPO/${formattedDate}`;
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overall_po_${formattedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download overall PO');
    } finally {
      setDownisLoading(null);
      setIsLoading(false);
    }
  };

  const handleDownloadParticular = async (poNumber: string) => {
    try {
      if (!token) {
        setSessionExpired(true);
        return;
      }
      setIsLoading(true);
      setDownisLoading(poNumber);
      const downloadUrl = `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/downloadParticularPO?po=${poNumber}`;
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `po_${poNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download PO');
    } finally {
      setDownisLoading(null);
      setIsLoading(false);
    }
  };

  const handleApplyFilters = (filters: Record<string, string>) => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined)
    );
    setAdvancedFilters(cleanedFilters);
    setIsFilterModalOpen(false);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({});
  };

  // Dashboard Cards Component
  const DashboardCards = () => {
    const pendingCount = data.filter(item => item.statusName?.toLowerCase().includes('pending')).length;
    const completedCount = data.filter(item => item.statusName?.toLowerCase().includes('complete')).length;
    const cancelledCount = data.filter(item => item.statusName?.toLowerCase().includes('cancel')).length;
    const totalCount = data.length;

    const SmallCard = [
      {
        icon: "mdi:clipboard-list-outline",
        num: totalCount,
        title: " Purchase Orders",
        shape: shape3,
        bgcolor: "warning",
      },
      {
        icon: "mdi:check-circle-outline",
        num: completedCount,
        title: "Completed",
        shape: shape1,
        bgcolor: "success",
      },
      {
        icon: "mdi:clock-outline",
        num: pendingCount,
        title: "Pending",
        shape: shape2,
        bgcolor: "warning",
      },
      {
        icon: "mdi:cancel",
        num: cancelledCount,
        title: "Cancelled",
        shape: shape1,
        bgcolor: "error",
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {SmallCard.map((theme, index) => (
          <div className="lg:col-span-1" key={index}>
            <CardBox
              className={`relative shadow-none! rounded-lg overflow-hidden bg-light${theme.bgcolor} dark:bg-dark${theme.bgcolor} h-14 sm:h-16 md:h-20`}
            >
              <div className="flex items-center justify-between p-1.5 sm:p-2 h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 ">{theme.title}</p>
                  <h5 className="text-base sm:text-lg lg:text-xl font-bold text-black">{theme.num}</h5>
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
  const PurchaseGrid = () => {
    const getStatusBadge = (statusName: string) => {
      if (statusName?.toLowerCase().includes('pending')) {
        return { color: 'warning', text: 'Pending' };
      } else if (statusName?.toLowerCase().includes('complete')) {
        return { color: 'success', text: 'Completed' };
      } else if (statusName?.toLowerCase().includes('cancel')) {
        return { color: 'failure', text: 'Cancelled' };
      }
      return { color: 'gray', text: statusName || 'Unknown' };
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
              const status = getStatusBadge(item.statusName);
              
              return (
                <CardBox 
                  key={item.poNumber || index} 
                  className="hover:shadow-md transition-shadow duration-300 border border-gray-200 h-auto p-3 sm:p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-black text-sm sm:text-base ">{item.poNumber || 'N/A'}</h3>
                      <p className="text-xs text-black mt-0.5 "> {item.podateStr || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Badge color={status.color} className="text-xs py-0.5 px-1.5 sm:px-2 whitespace-nowrap">
                        {status.text}
                      </Badge>
                      <button
                        onClick={() => handleViewClick(item.poNumber)}
                        className="p-1 sm:p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadParticular(item.poNumber)}
                        disabled={downisLoading === item.poNumber}
                        className="p-1 sm:p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Download PO"
                      >
                        {downisLoading === item.poNumber ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-green-600"></div>
                        ) : (
                          <HiDownload size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:factory" className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate">Supplier</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-black break-words">{item.supplierId || 'N/A'}</p>
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{item.supplierName || 'N/A'}</p>
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:map-marker" className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate">Location</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-black break-words">{item.poLocation || 'N/A'}</p>
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{item.poLocationName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    <div className="bg-blue-50 p-1.5 sm:p-2  ">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:package-variant" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-600">Type</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-black whitespace-normal ">
                        {item.itemName || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:calendar" className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-600">Delivery</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-black  ">
                        {item.periodSimple || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:currency-inr" className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        <span className="text-xs text-purple-600">Total</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-black truncate">
                        {formatAmount(item.totalCost || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-md mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black mb-0.5">Created By</p>
                        <p className="text-xs sm:text-sm font-medium text-black break-all ">{item.userId || 'N/A'}</p>
                      </div>
                      
                      {/* <div className="flex-1 min-w-100px text-right">
                        <p className="text-xs text-black mb-0.5">Last Update</p>
                        <p className="text-xs sm:text-sm font-medium text-black truncate">
                          {item.lastUpdate ? formatDateTime(new Date(item.lastUpdate)) : 'N/A'}
                        </p>
                      </div> */}
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

  // Column definitions
  const columns = useMemo(() => [
    { 
      id: 'sno', 
      header: 'S.No', 
      accessorFn: (_row: PurchaseOrderData, index: number) => index,
      cell: (info: any) => <span className="text-[11px] text-black">{info.row.index + 1}</span>,
      
      size: 35,
      enableSorting: false 
    },
    { 
      id: 'poNumber', 
     header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Po Number</span>
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
      accessorFn: (row: PurchaseOrderData) => row.poNumber,
      cell: (info: any) => <span className="text-[11px] text-black break-words block">{info.getValue()}</span>,
      size: 85,
      enableSorting: true 
    },
   { 
  id: 'podateStr', 
size: 85,
     header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">PO Date</span>
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
  accessorFn: (row: PurchaseOrderData) => row.podateStr,
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
      id: 'supplier', 
     
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
      accessorFn: (row: PurchaseOrderData) => `${row.supplierId} ${row.supplierName}`,
      cell: (info: any) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium leading-tight text-black break-words" title={info.row.original.supplierId}>
            {info.row.original.supplierId}
          </div>
          {info.row.original.supplierName && (
            <div className="text-[10px] text-gray-500 leading-tight break-words" title={info.row.original.supplierName}>
              {info.row.original.supplierName}
            </div>
          )}
        </div>
      ),
      size: 85,
      enableSorting: true 
    },
    { 
      id: 'location', 
     
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
      accessorFn: (row: PurchaseOrderData) => `${row.poLocation} ${row.poLocationName}`,
      cell: (info: any) => (
        <div className="min-w-[100px]">
          <div className="text-[11px] font-medium leading-tight break-words text-black" title={info.row.original.poLocation}>
            {info.row.original.poLocation}
          </div>
          {info.row.original.poLocationName && (
            <div className="text-[10px] text-gray-500 leading-tight break-words" title={info.row.original.poLocationName}>
              {info.row.original.poLocationName}
            </div>
          )}
        </div>
      ),
      size: 80,
      enableSorting: true 
    },
    { 
      id: 'itemName', 
    
        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Type</span>
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
      accessorFn: (row: PurchaseOrderData) => row.itemName,
      cell: (info: any) => (
        <span className="text-[11px] text-black break-words block max-w-[100px]">
          {info.getValue()}
        </span>
      ),
      size: 70,
      enableSorting: true 
    },
    { 
      id: 'periodSimple', 
    
        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Delivery</span>
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
      accessorFn: (row: PurchaseOrderData) => row.periodSimple,
      cell: (info: any) => (
        <span className="text-[11px] text-blue-600 font-medium">{info.getValue()}</span>
      ),
      size: 65,
      enableSorting: true 
    },
    { 
      id: 'statusName', 

        header: ({ column }) => (
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={column.getToggleSortingHandler()}
      >
        <span className="font-medium text-white text-[10px] uppercase">Status</span>
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
      accessorFn: (row: PurchaseOrderData) => row.statusName,
      cell: (info: any) => {
        const value = info.getValue();
        let color = 'gray';
        if (value?.toLowerCase().includes('pending')) color = 'warning';
        if (value?.toLowerCase().includes('complete')) color = 'success';
        if (value?.toLowerCase().includes('cancel')) color = 'failure';
        
        return (
          <Badge color={color} className="text-[10px] px-1.5 py-0.5 leading-tight whitespace-nowrap">
            {value}
          </Badge>
        );
      },
      size: 80,
      enableSorting: true 
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
      accessorFn: (row: PurchaseOrderData) => `${row.userId} ${row.lastUpdate}`,
      cell: (info: any) => {
        const email = info.row.original.userId;
        const lastUpdate = info.row.original.lastUpdate;
        const parts = email?.split('@') || [];
        const date = lastUpdate ? new Date(lastUpdate) : null;
        const tooltipParts = [];
        if (email) tooltipParts.push(`Email: ${email}`);
        if (date) tooltipParts.push(`Last update: ${formatDateTime(date)}`);
        const tooltip = tooltipParts.join(' — ') || 'No data';
        return (
          <div className="min-w-[100px]">
            {email && (
              <div className="text-[11px] font-medium text-black leading-tight break-all" title={tooltip}>
                {parts[0] || email}
                {parts.length > 1 && <span className="ml-1">@{parts[1]}</span>}
              </div>
            )}
            {date && (
              <div className="text-[9px] text-gray-500 leading-tight break-all truncate">
                {formatDateTime(date)}
              </div>
            )}
          </div>
        );
      },
      size: 100,
      enableSorting: true 
    },
    { 
      id: 'download', 
      header: 'Dwn', 
      accessorFn: (row: PurchaseOrderData) => row.poNumber,
      cell: (info: any) => {
        const poNumber = info.getValue();
        return (
          <button
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 p-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            onClick={() => handleDownloadParticular(poNumber)}
            disabled={downisLoading === poNumber}
            title="Download PO"
          >
            {downisLoading === poNumber ? (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <HiDownload size={14} />
            )}
          </button>
        );
      },
      size: 40,
      enableSorting: false 
    },
    { 
      id: 'view', 
      header: 'View', 
      accessorFn: (row: PurchaseOrderData) => row.poNumber,
      cell: (info: any) => {
        const poNumber = info.getValue();
        return (
          <button 
            className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors" 
            onClick={() => handleViewClick(poNumber)}
            title="View Details"
          >
            <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
          </button>
        );
      },
      size: 35,
      enableSorting: false 
    }
  ], [downisLoading, handleDownloadParticular, handleViewClick, formatDateTime,formatDate]);

  const table = useReactTable({
    data: filteredData,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
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

  if (screenView) {
    return <PurchaseViewScreen key={selectedPoNumber} onBack={handleBackFromView} poNumber={selectedPoNumber} />;
  }



  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-2">
     
      {/* Header with Title and Toggle Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 mt-2">
        
        <h1 className="text-lg sm:text-xl lg:text-xl lg:mr-82 text-indigo-700 whitespace-normal break-words">
          Purchase Orders
        </h1>
        
        {/* View Mode Toggle Button */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-black'
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
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Icon icon="mdi:view-grid" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid </span>
            <span className="sm:hidden">Grid</span>
          </button>
          
          <div className="flex gap-2 ml-2">
            <Tooltip content="Excel" className='z-50'>
              <Badge
                color="success"
                className="h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-green-700 text-xs sm:text-sm"
                onClick={handleDownloadOverall}
              >
                {downisLoading === 'overall' ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
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
                onClick={onBack}
              >
                <Icon icon="mingcute:add-line" className="text-sm sm:text-base" />
              </Badge>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 sm:p-4">
        <div className="w-full">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
            
            {/* Period picker */}
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
                  Period <sup className="text-red-600">*</sup>
                </label>
                <CalendarDays className="absolute right-48 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              </div>
              {periodOpen && (
                <div className="absolute w-80 top-full left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 p-2 sm:p-3">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <button onClick={() => handleYearChange('prev')} className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    <span className="font-semibold text-sm sm:text-base text-black dark:text-gray-200">{selectedYear}</span>
                    <button onClick={() => handleYearChange('next')} className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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

            {/* Search */}
            <div className="relative w-full sm:flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${data.length} records...`}
                  className="form-control-input w-80 lg:ml-60 px-3 py-2 text-xs sm:text-sm pr-8 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon="mdi:close" className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
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

          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-xs">{error}</div>}

          {/* Conditional Rendering - Table or Grid View */}
          {!isLoading && !error && (
            <>
              {viewMode === 'table' ? (
                <>
                  {/* Table View */}
                  <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
                      <div className="min-w-[1000px] lg:min-w-full">
                        <div className="overflow-auto max-h-[390px] relative ">
                          <table className="w-full divide-y divide-gray-200 table-fixed" style={{ tableLayout: 'fixed' }}>
                            <thead className="sticky top-0 z-10 h-8">
                              {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-blue-600">
                                  {headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      onClick={header.column.getToggleSortingHandler()}
                                      className={`px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight ${
                                        header.column.getCanSort() ? 'cursor-pointer hover:bg-blue-700' : ''
                                      }`}
                                      style={{ width: `${header.column.columnDef.size || 80}px` }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="truncate">
                                          {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                        </span>
                                        {/* {header.column.getCanSort() && (
                                          <span className="ml-1 flex-shrink-0 text-[10px]">
                                            {{
                                              asc: ' 🔼',
                                              desc: ' 🔽',
                                            }[header.column.getIsSorted() as string] ?? ' ↕️'}
                                          </span>
                                        )} */}
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 ">
                              {isLoading && filteredData.length === 0 ? (
                                <tr>
                                  <td colSpan={columns.length} className="text-center p-3 text-xs text-gray-500">
                                    <div className="flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                      Loading...
                                    </div>
                                  </td>
                                </tr>
                              ) : filteredData.length === 0 ? (
                                <tr>
                                  <td colSpan={columns.length} className="text-center p-4 text-xs text-gray-500">
                                    <div className="flex flex-col items-center">
                                      <Icon icon="mdi:database-outline" className="w-6 h-6 text-gray-300 mb-1" />
                                      <p className="text-black text-xs font-medium">
                                        {globalFilter || Object.keys(advancedFilters).length > 0 ? 'No matching records found' : 'No purchase orders found'}
                                      </p>
                                      {globalFilter && (
                                        <p className="text-gray-400 text-[10px] mt-0.5">
                                          No results for: "{globalFilter}"
                                        </p>
                                      )}
                                      {Object.keys(advancedFilters).length > 0 && (
                                        <p className="text-gray-400 text-[10px] mt-0.5">
                                          Try adjusting your filters
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                currentRows.map((row) => (
                                  <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50/50">
                                    {row.getVisibleCells().map((cell) => (
                                      <td 
                                        key={cell.id} 
                                        className="px-1 py-1 align-top"
                                        style={{ width: `${cell.column.columnDef.size || 80}px` }}
                                      >
                                        <div className="leading-tight min-h-[24px] flex items-start text-[11px]">
                                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table Pagination */}
                  {data.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-1 px-2">
                      <div className="text-xs text-gray-600 order-2 sm:order-1">
                        Showing <span className="font-medium">{filteredData.length}</span> of{' '}
                        <span className="font-medium">{data.length}</span> records
                        {globalFilter && (
                          <span> for search: <span className="font-medium">"{globalFilter}"</span></span>
                        )}
                        {Object.keys(advancedFilters).length > 0 && (
                          <span> with <span className="font-medium">{Object.keys(advancedFilters).length}</span> filter(s)</span>
                        )}
                        {!globalFilter && Object.keys(advancedFilters).length === 0 && (
                          <span> for period: <span className="font-medium">{displayValue}</span></span>
                        )}
                      </div>
                      
                      {totalRows > 0 && (
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                              className={`px-2 py-1 text-xs border rounded flex items-center gap-1 ${
                                currentPage === 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <FaChevronLeft className="w-3 h-3" /> Prev
                            </button>
                            <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border border-blue-200">
                              {currentPage}/{totalPages}
                            </span>
                            <button
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                              className={`px-2 py-1 text-xs border rounded flex items-center gap-1 ${
                                currentPage === totalPages
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Next <FaChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Grid View */
                <PurchaseGrid />
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

export default PurchaseTable; 