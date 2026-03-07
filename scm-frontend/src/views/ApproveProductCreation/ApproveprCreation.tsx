import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Loader, Plus, Trash2, Search, X, ChevronDown, Box, Database, Package
} from 'lucide-react';
import { CircleCheckBig } from 'lucide-react';
import { FaSave, FaChevronLeft, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import { HiPlus } from 'react-icons/hi';
import { HiRefresh } from 'react-icons/hi';
import { Button, Tooltip } from "flowbite-react";
import SessionModal from '../SessionModal';
import Toastify, { showToast } from '../Toastify';

// InfoTooltip component (copied from the provided example)
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2">
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-help inline" />
  </Tooltip>
);

interface Location {
  pk: number;
  code: string;
  name: string;
}

interface Product {
  id?: number;
  itemId: number;
  package: string;
  name: string;
}

const initialProducts: Product[] = [];
const baseUrl = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController';

// Fixed records per page for main table
const RECORDS_PER_PAGE = 5;

// Helper for sort emojis (reused for both main table and modal)
const getSortEmoji = (key: keyof Product, sortConfig: { key: keyof Product; direction: 'asc' | 'desc' } | null) => {
  if (!sortConfig || sortConfig.key !== key) return ' ↕️';
  return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
};

const ApproveProductsCreation: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationCode, setSelectedLocationCode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationDropdownSearch, setLocationDropdownSearch] = useState('');
  const locationRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [availableItems, setAvailableItems] = useState<Product[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const activeRequests = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAvailable, setSelectedAvailable] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modal-specific states
  const [availableSortConfig, setAvailableSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(5); // default 5, can be changed

  const startGlobalLoading = () => {
    activeRequests.current += 1;
    setGlobalLoading(true);
  };
  const stopGlobalLoading = () => {
    activeRequests.current -= 1;
    if (activeRequests.current === 0) {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
        setLocationDropdownSearch('');
      }
    };
    if (showLocationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLocationDropdown]);

  const filteredLocations = useMemo(() =>
    locations.filter(loc =>
      (loc.code || '').toLowerCase().includes(locationDropdownSearch.toLowerCase()) ||
      (loc.name || '').toLowerCase().includes(locationDropdownSearch.toLowerCase())
    ), [locations, locationDropdownSearch]
  );

  const displayLocations = useMemo(() => {
    const placeholder: Location = { pk: 0, code: '', name: ' Select Location ' };
    return [placeholder, ...filteredLocations];
  }, [filteredLocations]);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return null;
    }
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (response.status === 401) {
      setShowSessionExpired(true);
      return null;
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  };

  const saveProducts = async (): Promise<boolean> => {
    startGlobalLoading();
    try {
      const entityStr = localStorage.getItem('entity');
      const userIdStr = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      if (!entityStr || !userIdStr) {
        setShowSessionExpired(true);
        showToast('Missing entity or user ID', 'error');
        return false;
      }

      const entityId = entityStr;
      const lastUser = parseInt(userIdStr);
      console.log(`entity : ${entityId} , lastUser : ${lastUser}`);

      if (!selectedLocationCode) {
        showToast('No location selected', 'error');
        return false;
      }
      const uploadedItem = products.map((p: Product) => ({
        itemId: p.itemId,
        packageId: p.package
      }));
      const requestBody = {
        locationId: selectedLocationCode,
        entityId,
        lastUser,
        uploadedItem
      };
      console.log('save api request body :', requestBody);
      const response = await fetchWithAuth(`${baseUrl}/saveApprovalProductList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });
      console.log("save api response : ", response);
      if (!response) return false;
      const data = await response.json();
      if (data.success) {
        handleRefresh();
      }
      return data.success;
    } catch (error) {
      console.error('Error saving products:', error);
      showToast('Error saving products', 'error');
      return false;
    } finally {
      stopGlobalLoading();
    }
  };

  const fetchLocations = async () => {
    startGlobalLoading();
    try {
      const response = await fetchWithAuth(`${baseUrl}/dropDownLocation`);
      if (response) {
        const data = await response.json();
        if (data.success) {
          setLocations(data.data);
        } else {
          showToast('Failed to fetch locations', 'error');
        }
      }
    } catch (error) {
      console.log(error);
      setShowSessionExpired(true);
      showToast('Error fetching locations', 'error');
    } finally {
      stopGlobalLoading();
    }
  };

  const fetchProducts = async (locId: string) => {
    startGlobalLoading();
    setIsLoadingProducts(true);
    try {
      setProducts([]);
      const response = await fetchWithAuth(`${baseUrl}/viewApprovalProductList/${locId}`);
      if (response) {
        const data = await response.json();
        if (data.success) {
          const mappedProducts = data.data.uploadedItem.map((item: any) => ({
            id: item.itemId,
            itemId: item.itemId,
            package: item.packageId,
            name: item.itemName || 'N/A',
          }));
          setProducts(mappedProducts);
          setLocationName(data.data.locationName);
        } else {
          setProducts([]);
          setLocationName('');
        }
      } else {
        setProducts([]);
        setLocationName('');
      }
    } catch (error) {
      console.log(error);
      setShowSessionExpired(true);
      showToast('Error fetching products', 'error');
      setProducts([]);
      setLocationName('');
    } finally {
      setIsLoadingProducts(false);
      stopGlobalLoading();
    }
    setCurrentPage(1);
  };

  const fetchAvailableItems = async () => {
    setIsLoadingAvailable(true);
    try {
      setAvailableItems([]);
      const response = await fetchWithAuth(`${baseUrl}/itemList`);
      if (response) {
        const data = await response.json();
        if (data.success) {
          const mapped = data.data.map((item: any) => ({
            id: item.itemId,
            itemId: item.itemId,
            package: item.packageId,
            name: item.itemName || 'N/A',
          })).filter((item: Product) => !products.some((p: Product) => p.itemId === item.itemId));
          setAvailableItems(mapped);
        } else {
          showToast('Failed to fetch available items', 'error');
        }
      }
    } catch (error) {
      console.log(error);
      setShowSessionExpired(true);
      showToast('Error fetching available items', 'error');
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const handleLocationSelect = (loc: Location) => {
    setSearchTerm('');
    setCurrentPage(1);

    if (loc.code === '') {
      setSelectedLocationCode('');
      setLocationName('');
      setProducts([]);
    } else {
      setSelectedLocationCode(loc.code);
      setLocationName(loc.name);
      fetchProducts(loc.code);
    }
    setShowLocationDropdown(false);
    setLocationDropdownSearch('');
  };

  const handleLocationInputClick = () => {
    setShowLocationDropdown(!showLocationDropdown);
    if (!showLocationDropdown) {
      setLocationDropdownSearch('');
    }
  };

  const handleDelete = (id: number) => {
    const prevProducts = [...products];
    const newList = prevProducts.filter((p) => p.id !== id);
    const totalPagesAfter = Math.ceil(newList.length / RECORDS_PER_PAGE);
    setProducts(newList);
    if (currentPage > totalPagesAfter) {
      setCurrentPage(totalPagesAfter || 1);
    }
    showToast('Item deleted successfully', 'success');
  };

  const handleRefresh = () => {
    if (selectedLocationCode) {
      startGlobalLoading();
      setSelectedLocationCode('');
      setLocationName('');
      setProducts([]);
      setCurrentPage(1);
      setSearchTerm('');
      stopGlobalLoading();
    } else {
      showToast('No location selected', 'error');
    }
  };

  const handleSave = () => {
    if (!selectedLocationCode) {
      showToast('Please select a location', 'error');
      return;
    }

    if (products.length === 0) {
      showToast('No products to save. Please add some items.', 'error');
      return;
    }

    setConfirmAction(() => async () => {
      const saveSuccess = await saveProducts();
      if (saveSuccess) {
        showToast('Changes saved successfully', 'success');
      } else {
        showToast('Failed to save changes', 'error');
      }
      setShowConfirmModal(false);
      setConfirmAction(null);
    });
    setShowConfirmModal(true);
  };

  const handleSort = (key: keyof Product) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
    setCurrentPage(1);
  };

  // Modal sort handler
  const handleAvailableSort = (key: keyof Product) => {
    setAvailableSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
    setModalCurrentPage(1);
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      result = result.filter((p) =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.itemId.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = (aVal || '').toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [products, searchTerm, sortConfig]);

  const totalRows = sortedAndFilteredProducts.length;
  const totalPages = Math.ceil(totalRows / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, totalRows);
  const currentRows = sortedAndFilteredProducts.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Reset main page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig?.key, sortConfig?.direction]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Modal data with filtering and sorting
  const filteredAvailableItems = useMemo(() => {
    let filtered = availableItems.filter((p) =>
      (p.name || '').toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      p.itemId.toString().toLowerCase().includes(modalSearchTerm.toLowerCase())
    );

    if (availableSortConfig) {
      filtered.sort((a, b) => {
        let aVal = a[availableSortConfig.key];
        let bVal = b[availableSortConfig.key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = (aVal || '').toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }
        if (aVal < bVal) return availableSortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return availableSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [availableItems, modalSearchTerm, availableSortConfig]);

  const modalTotalRows = filteredAvailableItems.length;
  const modalTotalPages = Math.ceil(modalTotalRows / modalPageSize);
  const modalStartIndex = (modalCurrentPage - 1) * modalPageSize;
  const modalEndIndex = Math.min(modalStartIndex + modalPageSize, modalTotalRows);
  const modalCurrentRows = filteredAvailableItems.slice(modalStartIndex, modalEndIndex);

  const handleModalPreviousPage = () => {
    setModalCurrentPage(prev => Math.max(1, prev - 1));
  };
  const handleModalNextPage = () => {
    setModalCurrentPage(prev => Math.min(modalTotalPages, prev + 1));
  };

  // Reset modal page when search or sort changes
  useEffect(() => {
    setModalCurrentPage(1);
  }, [modalSearchTerm, availableSortConfig?.key, availableSortConfig?.direction, modalPageSize]);

  useEffect(() => {
    if (modalCurrentPage > modalTotalPages && modalTotalPages >= 1) {
      setModalCurrentPage(modalTotalPages);
    }
  }, [modalTotalPages, modalCurrentPage]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedAvailable(new Set(filteredAvailableItems.map((p) => p.id)));
    } else {
      setSelectedAvailable(new Set());
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    const newSet = new Set(selectedAvailable);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedAvailable(newSet);
    setSelectAll(newSet.size === filteredAvailableItems.length && filteredAvailableItems.length > 0);
  };

  const handleSelectItems = async () => {
    if (!selectedLocationCode) {
      showToast('Please select a location', 'error');
      return;
    }
    await fetchAvailableItems();
    setModalCurrentPage(1);
    setModalPageSize(5); // reset to default
    setShowSelectModal(true);
    setModalSearchTerm('');
    setSelectedAvailable(new Set());
    setSelectAll(false);
    setAvailableSortConfig(null);
  };

  const handleAddSelected = () => {
    const selectedItems = availableItems.filter((p) => selectedAvailable.has(p.id));
    if (selectedItems.length === 0) {
      showToast('No items selected', 'error');
      return;
    }

    setProducts((prev) => [...prev, ...selectedItems]);
    setAvailableItems((prev) => prev.filter((p) => !selectedItems.some((added) => added.itemId === p.itemId)));
    setCurrentPage(1);
    setShowSelectModal(false);
    showToast(`Successfully added ${selectedItems.length} items`, 'success');
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-1 md:p-1">
{/* Header */}
<div className="bg-white w-full dark:bg-gray-800 rounded-lg shadow-sm px-3 py-3 sm:h-14 sm:flex sm:items-center mb-2">
  
  <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    
    {/* Title */}
    <h1 className="text-lg sm:text-xl flex items-center gap-2 text-indigo-700">
      <Box className="h-5 w-5" />
      Approve Product List
      <InfoTooltip content="Manage and approve product creation for a selected location." />
    </h1>

    {/* Buttons */}
    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
      <Tooltip content="Save">
        <button
          className="w-10 h-10 p-0 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center"
          onClick={handleSave}
          disabled={globalLoading}
        >
          <FaSave className="w-4 h-4 text-white" />
        </button>
      </Tooltip>

      <Tooltip content="Refresh">
        <Button
          color="warning"
          size="xs"
          onClick={handleRefresh}
          className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
          disabled={globalLoading}
        >
          <HiRefresh className="w-4 h-4" />
        </Button>
      </Tooltip>
    </div>

  </div>
</div>

      {/* Controls Row */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-2 md:p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2 relative" ref={locationRef}>
            <div className="relative">
              <input
                type="text"
                placeholder=" "
                value={selectedLocationCode}
                readOnly
                onClick={handleLocationInputClick}
                className="peer w-full px-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                required
              />
              <label
                htmlFor="locationSearch"
                className="absolute left-4 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none text-sm
                           peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:px-1 peer-focus:text-blue-600
                           peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2
                           peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 peer-[:not(:placeholder-shown)]:px-1"
              >
                Location Code <sup className='text-red-600'>*</sup>
              </label>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              {showLocationDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={locationDropdownSearch}
                    onChange={(e) => setLocationDropdownSearch(e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-600 focus:outline-none rounded focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {displayLocations.length > 0 ? (
                      displayLocations.map((loc) => (
                        <button
                          key={loc.pk}
                          onClick={() => handleLocationSelect(loc)}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-b border-gray-100 dark:border-gray-600 last:border-b-0 font-medium transition-colors text-gray-900 dark:text-white ${
                            loc.code === '' ? 'italic text-gray-500' : ''
                          }`}
                        >
                          {loc.code ? `${loc.code} - ${loc.name}` : loc.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm text-center">
                        No locations found.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative mt-2">
              <input
                id="LocationName"
                type="text"
                placeholder=" "
                value={locationName}
                readOnly
                className="peer w-full px-3 py-2 border border-gray-300
                dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600
                focus:outline-none focus:border-blue-500 transition-all"
                required
              />
              <label
                htmlFor="LocationName"
                className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all
                 duration-200 pointer-events-none
                          peer-focus:-top-2 -translate-y-0.5 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white
                          dark:peer-focus:bg-gray-700
                           peer-focus:px-1 peer-focus:text-blue-600
                          peer-[:not(:placeholder-shown)]:-top-2 -translate-y-0.5 peer-[:not(:placeholder-shown)]:left-2
                          peer-[:not(:placeholder-shown)]:text-xs
                           peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700
                          peer-[:not(:placeholder-shown)]:px-1"
              >
                Location Name
              </label>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Search by Item ID or Name...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors"
            />
          </div>
          {selectedLocationCode && (
            <div>
              <button
                onClick={handleSelectItems}
                disabled={globalLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Select Items
              </button>
            </div>
          )}
        </div>


         {/* Uniform Main Table */}
      <div className="border border-gray-300 mt-2 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
          <div className="min-w-[800px] lg:min-w-full">
            <div className="overflow-auto max-h-[390px] relative">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                <thead className="sticky top-0 z-2 h-8 bg-blue-600 dark:bg-blue-700">
                  <tr>
                    {/* S.No */}
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                      style={{ width: '60px' }}
                    >
                      <div className="flex items-center gap-1">S.No</div>
                    </th>
                    {/* Item ID */}
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                      style={{ width: '140px' }}
                      onClick={() => handleSort('itemId')}
                    >
                      <div className="flex items-center gap-1">
                        Item ID {getSortEmoji('itemId', sortConfig)}
                      </div>
                    </th>
                    {/* Package */}
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                      style={{ width: '240px' }}
                      onClick={() => handleSort('package')}
                    >
                      <div className="flex items-center gap-1">
                        Package {getSortEmoji('package', sortConfig)}
                      </div>
                    </th>
                    {/* Item Name */}
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                      style={{ width: '240px' }}
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Item Name {getSortEmoji('name', sortConfig)}
                      </div>
                    </th>
                    {/* Actions */}
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                      style={{ width: '90px' }}
                    >
                      <div className="flex items-center gap-1">Actions</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoadingProducts ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <Loader size={24} className="animate-spin text-blue-600 mr-2" />
                          <span className="text-gray-500 dark:text-gray-400">Loading products...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentRows.length > 0 ? (
                    currentRows.map((product, index) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                      >
                        <td className="px-1.5 py-1 align-top" style={{ width: '60px' }}>
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                            {startIndex + index + 1}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top" style={{ width: '140px' }}>
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white font-mono">
                            {product.itemId}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top" style={{ width: '140px' }}>
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                            {product.package}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top" style={{ width: 'auto' }}>
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white truncate">
                            {product.name}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top" style={{ width: '90px' }}>
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                            <button
                              onClick={() => handleDelete(product.id!)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete Item"
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

      {/* Main Table Pagination */}
      {totalRows > 0 && !isLoadingProducts && (
        <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
          <div>
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{totalRows}</span> results
            {searchTerm && (
              <span>
                {' '}for search: <span className="font-medium">"{searchTerm}"</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px]">
              {startIndex + 1}-{endIndex} of {totalRows}
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
      </div>

     

      {/* SELECT ITEMS MODAL - Redesigned to match the target UI */}
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
                <Tooltip content="Add selected items">
                  <button
                    onClick={handleAddSelected}
                    disabled={selectedAvailable.size === 0 || isLoadingAvailable}
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
                      setModalSearchTerm('');
                      setModalCurrentPage(1);
                    }}
                    className="p-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors"
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
                    value={modalSearchTerm}
                    onChange={(e) => {
                      setModalSearchTerm(e.target.value);
                      setModalCurrentPage(1);
                    }}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-1">
                <div className="overflow-x-auto h-full">
                  <table className="min-w-full table-fixed">
                    <thead className="bg-blue-600 dark:bg-blue-700">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider w-10">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 accent-blue-600"
                          />
                        </th>
                        <th
                          className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer w-24"
                          onClick={() => handleAvailableSort('itemId')}
                        >
                          Item ID
                          <span>{getSortEmoji('itemId', availableSortConfig)}</span>
                        </th>
                        <th
                          className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer w-48"
                          onClick={() => handleAvailableSort('package')}
                        >
                          Package
                          <span>{getSortEmoji('package', availableSortConfig)}</span>
                        </th>
                        <th
                          className="w-48 px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
                          onClick={() => handleAvailableSort('name')}
                        >
                          Item Name
                          <span>{getSortEmoji('name', availableSortConfig)}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {isLoadingAvailable ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center">
                            <div className="flex justify-center items-center">
                              <Loader size={24} className="animate-spin text-blue-600 mr-2" />
                              <span className="text-gray-500 dark:text-gray-400">Loading available items...</span>
                            </div>
                          </td>
                        </tr>
                      ) : modalCurrentRows.length > 0 ? (
                        modalCurrentRows.map((product) => (
                          <tr
                            key={product.id}
                            onClick={() => handleSelectItem(product.id, !selectedAvailable.has(product.id))}
                            className={`
                              bg-white dark:bg-gray-800 
                              hover:bg-gray-50 dark:hover:bg-gray-700 
                              cursor-pointer text-xs
                              ${selectedAvailable.has(product.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                              transition-colors
                            `}
                          >
                            <td className="px-2 py-1.5 text-xs" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedAvailable.has(product.id)}
                                onChange={(e) => handleSelectItem(product.id, e.target.checked)}
                                className="rounded border-gray-300 accent-blue-600"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                              {product.itemId}
                            </td>
                            <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                              {product.package}
                            </td>
                            <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                              {product.name}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                            <div className="flex flex-col items-center">
                              <Database className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                              <p>{modalSearchTerm ? 'No matching records found' : 'No items found'}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Pagination with page size dropdown */}
              {modalTotalRows > 0 && !isLoadingAvailable && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 text-xs">
                  <div className="text-gray-600 dark:text-gray-300">
                    Showing {modalStartIndex + 1} to {Math.min(modalEndIndex, modalTotalRows)} of{' '}
                    {modalTotalRows} items
                    {modalSearchTerm && (
                      <span> for search: "{modalSearchTerm}"</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={modalPageSize}
                      onChange={(e) => {
                        setModalPageSize(Number(e.target.value));
                        setModalCurrentPage(1);
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
                        onClick={handleModalPreviousPage}
                        disabled={modalCurrentPage === 1}
                        className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
                      >
                        <FaChevronLeft className="w-3 h-3" /> Prev
                      </button>
                      <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-xs">
                        {modalCurrentPage} / {modalTotalPages}
                      </span>
                      <button
                        onClick={handleModalNextPage}
                        disabled={modalCurrentPage >= modalTotalPages}
                        className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs"
                      >
                        Next <FaChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CircleCheckBig className="text-green-600 animate-pulse dark:text-green-400 w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Confirm Save
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Are you sure you want to save the product list?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200 font-medium text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction?.()}
                className="flex-1 px-6 py-3 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      {showSessionExpired && <SessionModal />}

      <Toastify />
    </div>
  );
};

export default ApproveProductsCreation;