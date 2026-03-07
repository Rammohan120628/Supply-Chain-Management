import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ChevronDown as ChevronDownIcon,
  CircleCheckBig,
  Package,
  PlusCircle,
  Database,
  X,
} from 'lucide-react';
import { FaInfoCircle } from "react-icons/fa";
import { HiRefresh } from 'react-icons/hi';
import { FaSave, FaChevronLeft as FaChevronLeftIcon, FaChevronRight as FaChevronRightIcon } from 'react-icons/fa';
import { HiPlus } from 'react-icons/hi';
import Toastify, { showToast } from '../Toastify';
import SessionModal from '../SessionModal';
import { Button, Tooltip } from 'flowbite-react';

// InfoTooltip component (copied from previous code)
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2">
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 cursor-help inline" />
  </Tooltip>
);

interface UploadedItem {
  id?: string;
  itemId: number;
  packageId: string;
  itemName: string;
  price?: number;
}

interface Supplier {
  value: string;
  label: string;
}

// Helper for sort emojis
const getSortEmoji = (key: string, sortConfig: { key: string; direction: 'asc' | 'desc' } | null) => {
  if (!sortConfig || sortConfig.key !== key) return ' ↕️';
  return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
};

const RelateItemWithSupplier: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([{ value: '', label: 'Select Supplier' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<UploadedItem[]>([]);

  // Global loading state
  const [loadingCount, setLoadingCount] = useState(0);
  const isLoading = loadingCount > 0;

  const startLoading = () => setLoadingCount((prev) => prev + 1);
  const stopLoading = () => setLoadingCount((prev) => prev - 1);

  const [sortConfig, setSortConfig] = useState<{
    key: 'itemId' | 'packageId' | 'itemName';
    direction: 'asc' | 'desc';
  } | null>(null);

  // Pagination - main table
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  // Modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'save' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const [showSelectModal, setShowSelectModal] = useState(false);
  const [availableItems, setAvailableItems] = useState<UploadedItem[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<Set<number>>(new Set());
  const [availableSearchTerm, setAvailableSearchTerm] = useState('');
  const [availableSortConfig, setAvailableSortConfig] = useState<{
    key: 'itemId' | 'packageId' | 'itemName';
    direction: 'asc' | 'desc';
  } | null>(null);
  // Modal pagination state (with page size dropdown)
  const [availableCurrentPage, setAvailableCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);

  const [showSession, setShowSession] = useState(false);

  const periodRef = useRef<HTMLDivElement>(null);
  const supplierRef = useRef<HTMLDivElement>(null);
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
      if (supplierRef.current && !supplierRef.current.contains(event.target as Node)) {
        setSupplierDropdownOpen(false);
        setSupplierSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSupplierLabel = useMemo(() => {
    return selectedSupplier ? suppliers.find((s) => s.value === selectedSupplier)?.label || '' : '';
  }, [selectedSupplier, suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) =>
      sup.label.toLowerCase().includes(supplierSearchTerm.toLowerCase()),
    );
  }, [suppliers, supplierSearchTerm]);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      startLoading();
      const token = localStorage.getItem('authToken');
      if (!token) {
        setShowSession(true);
        stopLoading();
        return;
      }

      try {
        const res = await fetch(
          'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/supplierMasterController/dropDownSupplier',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        if (res.status === 401) {
          setShowSession(true);
          return;
        }
        const data = await res.json();
        if (data && data.success) {
          const fetchedSuppliers: Supplier[] = [
            { value: '', label: 'Select Supplier' },
            ...data.data.map((s: any) => ({
              value: s.pk.toString(),
              label: `${s.code} ${s.name}`,
            })),
          ];
          setSuppliers(fetchedSuppliers);
        }
      } catch (err) {
        setShowSession(true);
        console.error('Error fetching suppliers:', err);
      } finally {
        stopLoading();
      }
    };

    fetchSuppliers();
  }, []);

  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  const periodStr = selectedMonth !== null ? formatDateForApi(selectedMonth, selectedYear) : '';

  const savePeriodStr =
    selectedMonth !== null
      ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
      : '';

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!selectedSupplier || selectedMonth === null) {
        setData([]);
        setCurrentPage(1);
        return;
      }

      startLoading();
      const token = localStorage.getItem('authToken');
      if (!token) {
        stopLoading();
        return;
      }

      const url = `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/supplierMasterController/viewSupplierItem/${selectedSupplier}/${periodStr}`;

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.status === 401) {
          setShowSession(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const apiData = await res.json();
        if (apiData && apiData.success) {
          const uploadedItems = apiData.data?.uploadedItem || [];
          if (Array.isArray(uploadedItems)) {
            const mappedData = uploadedItems.map(
              (item: any) =>
                ({
                  id: item.itemId?.toString() || `${Date.now()}-${Math.random()}`,
                  itemId: item.itemId || 0,
                  packageId: item.packageId || '',
                  itemName: item.itemName || '',
                  price: item.price || 0,
                }) as UploadedItem,
            );
            setData(mappedData);
            setCurrentPage(1);
          } else {
            setData([]);
          }
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching existing items:', err);
        setData([]);
        showToast('Failed to fetch existing items', 'error');
      } finally {
        stopLoading();
      }
    };

    loadExistingData();
  }, [selectedSupplier, selectedMonth, selectedYear]);

  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear((prev) => (direction === 'prev' ? prev - 1 : prev + 1));
  };

  const handleSupplierSelect = (sup: Supplier) => {
    setSelectedSupplier(sup.value);
    const labelParts = sup.label.split(' ');
    const name = labelParts.slice(1).join(' ');
    setSupplierName(name);
    setSupplierDropdownOpen(false);
    setSupplierSearchTerm('');
  };

  const handleSelectItems = async () => {
    if (!selectedSupplier || selectedMonth === null) {
      showToast('Please select supplier and period', 'error');
      return;
    }

    startLoading();
    const token = localStorage.getItem('authToken');
    if (!token) {
      stopLoading();
      return;
    }

    try {
      const res = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/itemList',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (res.status === 401) {
        setShowSession(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch items');
      const apiResponse = await res.json();
      if (apiResponse.success) {
        const allItems = (apiResponse.data || []).map(
          (item: any) =>
            ({
              itemId: item.itemId,
              packageId: item.packageId || '',
              itemName: item.itemName || '',
              price: 0,
            }) as UploadedItem,
        );
        const filteredItems = allItems.filter(
          (item) => !data.some((existing) => existing.itemId === item.itemId),
        );
        setAvailableItems(filteredItems);
        setSelectedAvailable(new Set());
        setAvailableSearchTerm('');
        setAvailableCurrentPage(1);
        setModalPageSize(10); // reset page size
        setShowSelectModal(true);
        showToast('Items loaded successfully', 'success');
      } else {
        showToast('Failed to load items', 'error');
      }
    } catch (err) {
      setShowSession(true);
      console.error('Error fetching available items:', err);
      showToast('Failed to load items', 'error');
    } finally {
      stopLoading();
    }
  };

  const toggleAllAvailable = (checked: boolean) => {
    if (checked) {
      setSelectedAvailable(new Set(filteredAvailableItems.map((i) => i.itemId)));
    } else {
      setSelectedAvailable(new Set());
    }
  };

  const toggleAvailableItem = (id: number) => {
    const newSet = new Set(selectedAvailable);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAvailable(newSet);
  };

  const handleAvailableRowClick = (id: number) => {
    toggleAvailableItem(id);
  };

  const handleAddSelected = () => {
    const toAdd = availableItems
      .filter((item) => selectedAvailable.has(item.itemId))
      .map(
        (item) =>
          ({
            id: `${Date.now()}-${Math.random()}`,
            itemId: item.itemId,
            packageId: item.packageId,
            itemName: item.itemName,
            price: 0,
          }) as UploadedItem,
      );

    const newItems = toAdd.filter(
      (newItem) => !data.some((existing) => existing.itemId === newItem.itemId),
    );

    if (newItems.length > 0) {
      setData((prev) => [...prev, ...newItems]);
      setAvailableItems((prev) => prev.filter((item) => !selectedAvailable.has(item.itemId)));
      setSelectedAvailable(new Set());
      showToast(`Added ${newItems.length} items`, 'success');
    } else {
      showToast('No new items to add', 'error');
    }

    setShowSelectModal(false);
  };

  // Filter and sort available items
  const filteredAvailableItems = useMemo(() => {
    let filtered = availableItems.filter(
      (item) =>
        availableSearchTerm === '' ||
        item.itemId.toString().toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
        item.packageId.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(availableSearchTerm.toLowerCase()),
    );

    if (availableSortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[availableSortConfig.key];
        let bVal = b[availableSortConfig.key];
        if (availableSortConfig.key === 'itemId') {
          return availableSortConfig.direction === 'asc'
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number);
        } else {
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          if (aStr < bStr) return availableSortConfig.direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return availableSortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    return filtered;
  }, [availableItems, availableSearchTerm, availableSortConfig]);

  const allAvailableSelected =
    filteredAvailableItems.length > 0 &&
    filteredAvailableItems.every((i) => selectedAvailable.has(i.itemId));

  const handleAvailableSort = useCallback((key: 'itemId' | 'packageId' | 'itemName') => {
    setAvailableSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setAvailableCurrentPage(1);
  }, []);

  const handleMainSort = useCallback((key: 'itemId' | 'packageId' | 'itemName') => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  }, []);

  const filteredSortedData = useMemo(() => {
    let filtered = data.filter(
      (item) =>
        searchTerm === '' ||
        item.itemId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.packageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'itemId') {
          return sortConfig.direction === 'asc'
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number);
        } else {
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  // Main table pagination
  const totalRows = filteredSortedData.length;
  const totalPages = Math.ceil(totalRows / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRows = filteredSortedData.slice(startIndex, endIndex);

  // Modal pagination (with dynamic page size)
  const availableTotalRows = filteredAvailableItems.length;
  const availableTotalPages = Math.ceil(availableTotalRows / modalPageSize);
  const availableStartIndex = (availableCurrentPage - 1) * modalPageSize;
  const availableEndIndex = availableStartIndex + modalPageSize;
  const availableCurrentRows = filteredAvailableItems.slice(availableStartIndex, availableEndIndex);

  // Reset modal page when search/sort/page size changes
  useEffect(() => {
    setAvailableCurrentPage(1);
  }, [availableSearchTerm, availableSortConfig, modalPageSize]);

  // Clamp modal current page
  useEffect(() => {
    if (availableCurrentPage > availableTotalPages && availableTotalPages >= 1) {
      setAvailableCurrentPage(availableTotalPages);
    }
  }, [availableTotalPages, availableCurrentPage]);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleAvailablePrevPage = () => setAvailableCurrentPage((p) => Math.max(1, p - 1));
  const handleAvailableNextPage = () => setAvailableCurrentPage((p) => Math.min(availableTotalPages, p + 1));

  const openConfirm = (type: 'save', action: () => void) => {
    setConfirmType(type);
    setConfirmAction(() => () => {
      action();
      setShowConfirm(false);
      setConfirmType(null);
      setConfirmAction(null);
    });
    setShowConfirm(true);
  };

  const handleSave = () => {
    if (!selectedSupplier || selectedMonth === null) {
      showToast('Select period and supplier', 'error');
      return;
    }
    openConfirm('save', async () => {
      startLoading();
      const token = localStorage.getItem('authToken');
      if (!token) {
        setShowSession(true);
        stopLoading();
        return;
      }

      const body = {
        supplierFk: parseInt(selectedSupplier),
        entityId: localStorage.getItem('entity') || '',
        lastUser: parseInt(localStorage.getItem('userId') || '0'),
        period: savePeriodStr,
        uploadedItem: data.map((item) => ({
          itemId: item.itemId,
          packageId: item.packageId,
          price: item.price || 0,
        })),
      };

      try {
        const res = await fetch(
          'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/supplierMasterController/saveSupplierItemDetails',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        );
        if (res.status === 401) {
          setShowSession(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to save');
        const responseData = await res.json();
        if (responseData && responseData.success) {
          showToast('Saved successfully', 'success');
          handleRefresh();
        } else {
          throw new Error(responseData?.message || 'Save failed');
        }
      } catch (err) {
        console.error('Error saving:', err);
        showToast('Save failed', 'error');
      } finally {
        stopLoading();
      }
    });
  };

  const handleRefresh = () => {
    setSelectedMonth(null);
    setSelectedYear(new Date().getFullYear());
    setSelectedSupplier('');
    setSupplierName('');
    setSearchTerm('');
    setData([]);
    setSortConfig(null);
    setCurrentPage(1);
    setAvailableSearchTerm('');
    setAvailableItems([]);
    setSelectedAvailable(new Set());
    setAvailableCurrentPage(1);
    setAvailableSortConfig(null);
    
  };

  const handleDelete = (item: UploadedItem) => {
    setData((prev) => prev.filter((d) => d.id !== item.id));
    showToast(`Deleted item ${item.itemId}`, 'success');
  };

  const isPeriodSelected = (index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  };

  const displayValue = selectedMonth === null ? 'Select Period' : `${selectedMonth + 1}/${selectedYear}`;
  const isSelectItemsEnabled = !!selectedSupplier && selectedMonth !== null;

  return (
    <div className="max-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Toastify />

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <div className="w-full mx-1 py-1 px-1 my-1 dark:bg-gray-800 p-2 transition-all flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-white dark:bg-gray-700 flex justify-between items-center mb-2 text-white p-2 rounded-lg">
          <h1 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <Package className="w-6 h-6" /> Relate Item With Supplier
            <InfoTooltip content="Allows you to relate items to a supplier for a specific period." />
          </h1>
          <div className="flex space-x-2">
            <Tooltip content="Save">
              <button
                color="success"
              
                className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white p-0 rounded-full flex items-center justify-center"
                onClick={handleSave}
                disabled={isLoading}
              >
                <FaSave className="w-4 h-4 text-white" />
              </button>
            </Tooltip>

            <Tooltip content="Refresh">
              <Button
                color="warning"
                size="xs"
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-10 h-10 font-bold p-0 rounded-full flex items-center justify-center"
              >
                <HiRefresh className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-3">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Period */}
            <div className="flex-1 relative" ref={periodRef}>
              <div className="relative">
                <input
                  type="text"
                  value={displayValue}
                  readOnly
                  onClick={() => setPeriodOpen(!periodOpen)}
                  placeholder=" "
                  className="peer w-full px-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                />
                <label className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1">
                  Period <sup className="text-red-600">*</sup>
                </label>
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {periodOpen && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 p-3">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => handleYearChange('prev')}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                      {selectedYear}
                    </span>
                    <button
                      onClick={() => handleYearChange('next')}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((option, index) => (
                      <button
                        key={option}
                        onClick={() => handlePeriodSelect(index)}
                        className={`text-center py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-xs ${
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

            {/* Suppliers Dropdown */}
            <div className="flex-1 relative" ref={supplierRef}>
              <div className="relative">
                <input
                  type="text"
                  value={selectedSupplierLabel}
                  readOnly
                  onClick={() => setSupplierDropdownOpen(!supplierDropdownOpen)}
                  placeholder=" "
                  className="peer w-full px-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                />
                <label className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1">
                  Suppliers <sup className="text-red-600">*</sup>
                </label>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {supplierDropdownOpen && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 max-h-80 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={supplierSearchTerm}
                    onChange={(e) => setSupplierSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredSuppliers.length === 0 ? (
                      <p className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        No suppliers found.
                      </p>
                    ) : (
                      filteredSuppliers.map((sup) => (
                        <button
                          key={sup.value}
                          onClick={() => handleSupplierSelect(sup)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium transition-colors"
                        >
                          {sup.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Supplier Name + Select Items */}
            <div className="flex-1 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="w-full sm:flex-1 relative">
                  <input
                    type="text"
                    value={supplierName}
                    readOnly
                    placeholder=" "
                    className="peer w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none cursor-not-allowed opacity-75"
                  />
                  <label className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1">
                    Supplier Name
                  </label>
                </div>
                {isSelectItemsEnabled && (
                  <button
                    onClick={handleSelectItems}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={18} /> Select Items
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex justify-end mb-2">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by ID, Package or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>


           {/* MAIN TABLE */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <div className="min-w-[820px] lg:min-w-full">
              <div className="overflow-auto max-h-full relative">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                  <thead className="sticky top-0 z-2 h-8">
                    <tr className="bg-blue-600 dark:bg-blue-700">
                      <th className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none" style={{ width: '60px' }}>
                        <div className="flex items-center gap-1">S.No</div>
                      </th>
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                        style={{ width: '130px' }}
                        onClick={() => handleMainSort('itemId')}
                      >
                        <div className="flex items-center gap-1">
                          Item ID
                          <span>{getSortEmoji('itemId', sortConfig)}</span>
                        </div>
                      </th>
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                        style={{ width: '160px' }}
                        onClick={() => handleMainSort('packageId')}
                      >
                        <div className="flex items-center gap-1">
                          Package
                          <span>{getSortEmoji('packageId', sortConfig)}</span>
                        </div>
                      </th>
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                        style={{ width: '380px' }}
                        onClick={() => handleMainSort('itemName')}
                      >
                        <div className="flex items-center gap-1">
                          Item Name
                          <span>{getSortEmoji('itemName', sortConfig)}</span>
                        </div>
                      </th>
                      <th className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none" style={{ width: '90px' }}>
                        <div className="flex items-center gap-1">Delete</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentRows.length > 0 ? (
                      currentRows.map((item, index) => (
                        <tr
                          key={item.id || item.itemId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                        >
                          <td className="px-1.5 py-1 align-top" style={{ width: '60px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              {startIndex + index + 1}
                            </div>
                          </td>
                          <td className="px-1.5 py-1 align-top" style={{ width: '130px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              {item.itemId}
                            </div>
                          </td>
                          <td className="px-1.5 py-1 align-top" style={{ width: '160px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              {item.packageId}
                            </div>
                          </td>
                          <td className="px-1.5 py-1 align-top" style={{ width: '380px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              {item.itemName}
                            </div>
                          </td>
                          <td className="px-1.5 py-1 align-top" style={{ width: '90px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              <button
                                onClick={() => handleDelete(item)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <Database className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                            <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">
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
          </div>
        </div>

        {/* MAIN TABLE PAGINATION */}
        {totalRows > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
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
              <span className="text-[12px]">
                {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <FaChevronLeftIcon className="w-2.5 h-2.5 inline mr-0.5" />
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
                  <FaChevronRightIcon className="w-2.5 h-2.5 inline ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

       
      </div>

      {/* Confirm Save Modal */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                Confirm Save
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                Are you sure you want to save the relations?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmType(null);
                }}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction?.()}
                className="flex-1 px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELECT ITEMS MODAL - Redesigned to match provided UI */}
      {showSelectModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 text-xs">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Select Items</h3>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-bold">
                  Total: {availableItems.length}
                </span>
              </div>
              <div className="flex space-x-2">
                
                <Tooltip content="Add">
                  <button
                    onClick={handleAddSelected}
                    disabled={selectedAvailable.size === 0 || isLoading}
                    className="p-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Add selected items"
                  >
                    <HiPlus className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Close">
                  <button
                    onClick={() => {
                      setShowSelectModal(false);
                      setSelectedAvailable(new Set());
                      setAvailableSearchTerm('');
                      setAvailableCurrentPage(1);
                    }}
                    className="p-2.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5 text-white dark:text-white" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              {/* Top bar: selected count + search */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Selected Items:</span>
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-md font-bold">
                    {selectedAvailable.size}
                  </span>
                </div>
                <div className="relative w-56">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={availableSearchTerm}
                    onChange={(e) => {
                      setAvailableSearchTerm(e.target.value);
                      setAvailableCurrentPage(1);
                    }}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Table with scroll */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1">
                <div className="overflow-auto h-full max-h-[300px]">
                  <table className="min-w-full">
                    <thead className="bg-blue-600 dark:bg-blue-700 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider w-10">
                          <input
                            type="checkbox"
                            checked={allAvailableSelected}
                            onChange={(e) => toggleAllAvailable(e.target.checked)}
                            className="rounded border-gray-300 accent-blue-600"
                          />
                        </th>
                        <th
                          className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer w-34"
                          onClick={() => handleAvailableSort('itemId')}
                        >
                          Item ID
                          <span>{getSortEmoji('itemId', availableSortConfig)}</span>
                        </th>
                        <th
                          className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer w-48"
                          onClick={() => handleAvailableSort('packageId')}
                        >
                          Package
                          <span>{getSortEmoji('packageId', availableSortConfig)}</span>
                        </th>
                        <th
                          className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer w-48"
                          onClick={() => handleAvailableSort('itemName')}
                        >
                          Item Name
                          <span>{getSortEmoji('itemName', availableSortConfig)}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {availableCurrentRows.length > 0 ? (
                        availableCurrentRows.map((item) => (
                          <tr
                            key={item.itemId}
                            onClick={() => handleAvailableRowClick(item.itemId)}
                            className={`
                              bg-white dark:bg-gray-800 
                              hover:bg-gray-50 dark:hover:bg-gray-700 
                              cursor-pointer text-xs
                              ${selectedAvailable.has(item.itemId) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                              transition-colors
                            `}
                          >
                            <td className="px-2 py-1.5 text-xs" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedAvailable.has(item.itemId)}
                                onChange={() => toggleAvailableItem(item.itemId)}
                                className="rounded border-gray-300 accent-blue-600"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                              {item.itemId}
                            </td>
                            <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                              {item.packageId}
                            </td>
                            <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                              {item.itemName}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                            <div className="flex flex-col items-center">
                              <Database className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                              <p>{availableSearchTerm ? 'No matching records found' : 'No items found'}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination - compact with page size dropdown */}
              {availableTotalRows > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 text-xs">
                  <div className="text-gray-600 dark:text-gray-300">
                    Showing {availableStartIndex + 1} to {Math.min(availableEndIndex, availableTotalRows)} of{' '}
                    {availableTotalRows} items
                    {availableSearchTerm && (
                      <span> for search: "{availableSearchTerm}"</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={modalPageSize}
                      onChange={(e) => {
                        setModalPageSize(Number(e.target.value));
                        setAvailableCurrentPage(1);
                      }}
                      className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    >
                      {[5, 10, 20, 30, 50].map((size) => (
                        <option key={size} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleAvailablePrevPage}
                        disabled={availableCurrentPage === 1}
                        className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
                      >
                        <FaChevronLeftIcon className="w-3 h-3" /> Prev
                      </button>
                      <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-xs">
                        {availableCurrentPage} / {availableTotalPages}
                      </span>
                      <button
                        onClick={handleAvailableNextPage}
                        disabled={availableCurrentPage >= availableTotalPages}
                        className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
                      >
                        Next <FaChevronRightIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSession && <SessionModal />}
    </div>
  );
};

export default RelateItemWithSupplier;