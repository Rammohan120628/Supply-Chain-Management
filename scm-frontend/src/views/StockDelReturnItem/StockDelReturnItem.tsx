import { Badge, Label, Pagination, Tooltip } from "flowbite-react";
import { useState, useEffect, useRef, useMemo, ReactNode,useCallback } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { HiInformationCircle, HiPlus, HiRefresh, HiSearch, HiTrash, HiViewList } from 'react-icons/hi';
import React from "react";
import axios from "axios";
import { FaBoxOpen, FaBuilding, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClipboard, FaMapMarkerAlt, FaReceipt, FaSave, FaSearch, FaTrashAlt, FaTruck, FaUser } from "react-icons/fa";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Card } from 'flowbite-react';
import toast, { Toaster } from 'react-hot-toast';
import ReturnItemTable from "./StockDelTable";
import CalendarStockReceive from "../StockReceive/CalenderSrockReceive";
import SessionModal from "../SessionModal";

// Define missing interfaces
export interface UploadedItem {
  itemId: string;
  itemName: string;
  packageId: string;
  supplierName: string;
  supplierId: string;
  stockGp: number;
  stockCp: number;
  grnId: ReactNode;
  period: string;
  ip02: number;
  batchNo: string;
  totalCost: number;
  totalCostCp: number;
  totalCostIp: number;
  renderGp: boolean;
  renderIp: boolean;
  reaminingQty: number;
  quotedGP: number;
  actualGP: number;
  actualGP1: number;
  expiryDate?: string;
  locationId?: string;
  returnDate?: string;
  locationName?: string;
  grossPrice?: number;
  unitPrice?: number;
  cp?: number;
  gp?: number;
  id?: string;
}

export interface SelectedItem {
  name: string;
  packageId: string;
  teams: { id: string; color: string; text: string }[];
  quantity: number;
  gp: number;
  cp: number;
  total: number;
  netTotal: number;
  reaminingQty: number;
  stockGp: number;
  grnId: string;
  period: string;
  itemId?: string;
  uniqueId?: string;
}

export interface SupplierType {
  pk: number;
  supplierId: string;
  supplierName: string;
}

export interface LocationType {
  code: string;
  name: string;
}

export interface TableTypeDense {
  avatar?: any;
  name?: string;
  post?: string;
  packageId?: string;
  teams: {
    id: string;
    color: string;
    text: string;
  }[];
  status?: string;
  statuscolor?: string;
  budget?: string;
  grnId?: ReactNode;
  reaminingQty?: number;
  itemId?: string;
  period?: string;
  total?: number;
  netTotal?: number;
  stockGp?: number;
  locationId?: string;
  quantity?: number;
  returnDate?: string;
  gp?: number;
  cp?: number;
  uniqueId: string;
}

const columnHelper = createColumnHelper<TableTypeDense>();

const ReturnItemToSupplier = () => {
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalSelectedItems, setModalSelectedItems] = useState<Set<string>>(new Set());
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [supplierItems, setSupplierItems] = useState<UploadedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchItem, setSearchItem] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [, setValidationErrors] = useState<Record<number, string>>({});
  const [addedUniqueIds, setAddedUniqueIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [recvdQtyErrors, setRecvdQtyErrors] = useState<Record<number, string>>({});

  // Pagination state for modal
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const token = localStorage.getItem("authToken");
  const cwh = localStorage.getItem("cwh");
  const stockPeriod = localStorage.getItem("stockPeriod");

  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);

  const [fromDate,] = useState(() => {
    const offset = twoYearsAgo.getTimezoneOffset();
    const localDate = new Date(twoYearsAgo.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });

  const [columnVisibility, setColumnVisibility] = React.useState({});
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  // Refs for continuous typing
  const quantityTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const previousInputValueRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSupplierOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset to first page when search changes or modal opens
  useEffect(() => {
    if (openModal) {
      setCurrentPage(1);
    }
  }, [searchItem, openModal]);

  const handleRefresh = () => {
    setSelectedItems([]);
    setSelectedSupplier(null);
    setSupplierItems([]);
    setAddedUniqueIds(new Set());
    setModalSelectedItems(new Set());
    setSearch('');
    setSearchItem('');
    setValidationErrors({});
    setRecvdQtyErrors({});
    setToDate(currentDate.toISOString().split('T')[0]);

    // Clear all timeouts
    quantityTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    quantityTimeoutRef.current.clear();
    previousInputValueRef.current.clear();
  };

  const formatStockPeriod = (dateString: string) => {
    if (!dateString) return '';

    try {
      const [, month, year] = dateString.split('-');
      return `${month}-${year}`;
    } catch (error) {
      setSessionExpired(true);
      console.error('Error formatting stock period:', error);
      return dateString;
    }
  };

  const formatPurchasePeriod = (periodString: string): string => {
    if (!periodString) return "No Period Set";

    try {
      const parts = periodString.split('-');
      if (parts.length !== 3) return periodString;

      const day = parts[0];
      const month = parts[1];
      const year = parts[2];

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthName = date.toLocaleString('default', { month: 'short' });
      return `${monthName} ${year}`;
    } catch (error) {
      setSessionExpired(true);
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };

  // Generate unique ID for each item to handle same GRN IDs
  const filteredItems = useMemo(() => {
    return supplierItems.map(item => ({
      ...item,
      id: `${item.itemId}-${item.grnId}-${item.packageId || ''}-${Math.random().toString(36).substr(2, 9)}`
    }));
  }, [supplierItems]);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplierId?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.supplierName?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredTableData = useMemo(() => {
    if (!search.trim()) return selectedItems;
    const lowerSearch = search.toLowerCase().trim();

    return selectedItems.filter(item => {
      if (item.name?.toLowerCase().includes(lowerSearch)) return true;
      if (item.packageId?.toLowerCase().includes(lowerSearch)) return true;
      if (item.itemId?.toString().includes(lowerSearch)) return true;
      if (item.teams?.some(team => team.text.toLowerCase().includes(lowerSearch))) return true;
      if (item.grnId?.toString().includes(lowerSearch)) return true;
      return false;
    });
  }, [selectedItems, search]);

  const totals = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const total = item.total || 0;
      const netTotal = item.netTotal || 0;

      return {
        total: acc.total + total,
        netTotal: acc.netTotal + netTotal,
      };
    }, { total: 0, netTotal: 0 });
  }, [selectedItems]);

  // Filter items for modal
  const filteredModalItems = useMemo(() => {
    return filteredItems.filter(item =>
      item.itemName?.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.itemId?.toString().includes(searchItem) ||
      item.packageId?.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.grnId?.toString().toLowerCase().includes(searchItem.toLowerCase())
    );
  }, [filteredItems, searchItem]);

  // Calculate paginated items for modal
  const paginatedFilteredItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredModalItems.slice(startIndex, startIndex + pageSize);
  }, [filteredModalItems, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredModalItems.length / pageSize);

  const modalTableData = useMemo(() => {
    return paginatedFilteredItems.map(item => ({
      grnId: item.grnId,
      name: item.itemName,
      itemId: item.itemId,
      packageId: item.packageId,
      teams: item.packageId ? [{
        id: '1',
        color: "primary",
        text: item.packageId
      }] : [],
      period: item.period,
      locationId: item.locationId,
      returnDate: item.returnDate,
      locationName: item.locationName,
      reaminingQty: item.reaminingQty,
      stockGp: item.stockGp,
      supplierId: item.supplierId,
      expiryDate: item.expiryDate,
      grossPrice: item.grossPrice || item.unitPrice || 0,
      cp: item.cp || item.stockCp || 0,
      gp: item.gp || item.stockGp || 0,
      uniqueId: item.id
    }));
  }, [paginatedFilteredItems]);

  const handleSaveClick = () => {
    try {
      if (!selectedSupplier) {
        toast.error("Please select a supplier");
        return;
      }

      if (!selectedLocation) {
        toast.error("Please select a location");
        return;
      }

      if (selectedItems.length === 0) {
        toast.error("Please add items");
        return;
      }

      const itemsWithInvalidQuantity = selectedItems.filter(item => {
        const quantity = item.quantity || 0;
        return quantity < 0.001;
      });

      if (itemsWithInvalidQuantity.length > 0) {
        toast.error(`Please add the QTY`);
        return;
      }

      setShowSaveModal(true);
    } catch (error) {
      setSessionExpired(true);
      console.error("Error in validation:", error);
      toast.error("An error occurred during validation");
    }
  };

  const handleConfirmSave = async () => {
    setShowSaveModal(false);

    try {
      setSaving(true);
      setIsLoading(true);

      const token = localStorage.getItem("authToken");
      const entityId = localStorage.getItem('entity') || '';
      const userFk = parseInt(localStorage.getItem('userId') || '0');
      const stockPeriod = localStorage.getItem("stockPeriod");
      const currencyId = localStorage.getItem("currencyId") || "INR";

      if (!token) {
        setSessionExpired(true);
        return;
      }
      if (!stockPeriod) {
        toast.error("Stock period not found");
        return;
      }

      const formatReturnDateForBackend = (dateString: string): string => {
        if (!dateString) return '';

        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
          }

          if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
            return dateString;
          }

          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          }

          return dateString;
        } catch (error) {
          console.error("Error formatting return date:", error, dateString);
          return dateString;
        }
      };

      const formattedPeriod = stockPeriod;
      const formattedReturnDate = formatReturnDateForBackend(toDate);

      if (!/^\d{2}-\d{2}-\d{4}$/.test(formattedReturnDate)) {
        toast.error("Invalid return date format. Please select a valid date.");
        return;
      }

      const itemSubList = selectedItems
        .map((item) => {
          const originalItem = supplierItems.find(si => si.grnId === item.grnId);

          let formattedExpiryDate = null;
          if (originalItem?.expiryDate) {
            formattedExpiryDate = formatReturnDateForBackend(originalItem.expiryDate);
          }

          return {
            itemId: item.itemId,
            itemName: item.name || '',
            packageId: item.packageId || '',
            qty: item.quantity || 0,
            stockGp: item.gp || item.stockGp || 0,
            stockCp: item.cp || 0,
            ip: originalItem?.ip02 || item.gp || 0,
            expiryDate: formattedExpiryDate,
            grossPrice: item.gp || 0,
            unitPrice: item.gp || 0,
            cp: item.cp || 0,
            grnId: item.grnId || '',
            reaminingQty: item.reaminingQty || 0
          };
        });

      const total = selectedItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const netTotal = selectedItems.reduce((sum, item) => sum + (item.netTotal || 0), 0);

      const saveData = {
        period: formattedPeriod,
        returnDate: formattedReturnDate,
        locationId: selectedLocation.code,
        locationName: selectedLocation.name,
        supplierId: selectedSupplier.supplierId,
        supplierName: selectedSupplier.supplierName,
        currencyId: currencyId,
        currencyRate: 1.0,
        entity: entityId ? parseInt(entityId) : 1,
        lastUser: userFk,
        total: parseFloat(total.toFixed(3)),
        netTotal: parseFloat(netTotal.toFixed(3)),
        itemSubList: itemSubList
      };

      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/saveReturnItemsToSupplier",
        saveData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      if (response.data.success) {
        toast.success("Return items saved successfully!");
        handleRefresh();
      } else {
        toast.error(`Save failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Error saving return items:", error);

      if (error.response) {
        toast.error(`Save failed: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error(`Save failed: ${error.message}`);
      }
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  const handleSelectAll = useCallback(() => {
    const selectableItems = paginatedFilteredItems.filter(item => !addedUniqueIds.has(item.uniqueId!));

    if (modalSelectedItems.size === selectableItems.length) {
      setModalSelectedItems(new Set());
    } else {
      const newSelected = new Set<string>();
      selectableItems.forEach(item => {
        newSelected.add(item.uniqueId!);
      });
      setModalSelectedItems(newSelected);
    }
  }, [paginatedFilteredItems, addedUniqueIds, modalSelectedItems]);

  const handleItemSelect = useCallback((uniqueId: string) => {
    const newSelected = new Set(modalSelectedItems);

    const clickedItem = filteredItems.find(item => item.id === uniqueId);
    if (!clickedItem) return;

    const isItemInTable = selectedItems.some(item => item.uniqueId === uniqueId);

    if (isItemInTable) {
      toast.error(`This item is already in the table`);
      return;
    }

    if (newSelected.has(uniqueId)) {
      newSelected.delete(uniqueId);
    } else {
      newSelected.add(uniqueId);
    }

    setModalSelectedItems(newSelected);
  }, [modalSelectedItems, filteredItems, selectedItems]);

  const handleQuantityChange = useCallback((uniqueId: string, quantity: string) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.uniqueId === uniqueId) {
        const qty = parseFloat(quantity) || 0;
        const total = (item.gp || 0) * qty;
        const netTotal = (item.cp || 0) * qty;
        return {
          ...item,
          quantity: qty,
          total: parseFloat(total.toFixed(3)),
          netTotal: parseFloat(netTotal.toFixed(3))
        };
      }
      return item;
    }));
  }, []);

  const handleDeleteItem = useCallback((uniqueId: string) => {
    setSelectedItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    setAddedUniqueIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(uniqueId);
      return newSet;
    });
  }, []);

  const handleAddItems = useCallback(() => {
    if (modalSelectedItems.size === 0) {
      toast.error("Please select at least one item");
      return;
    }

    const newItems: SelectedItem[] = [];
    const itemsToAdd: string[] = [];

    modalSelectedItems.forEach(uniqueId => {
      const item = filteredItems.find(si => si.id === uniqueId);
      if (item && !addedUniqueIds.has(uniqueId)) {
        const isAlreadyInTable = selectedItems.some(selected =>
          selected.uniqueId === uniqueId
        );

        if (isAlreadyInTable) {
          toast.error(`Item ${item.itemId} is already in the table`);
          return;
        }

        const quantity = 0;
        const gp = item.gp || item.stockGp || item.grossPrice || item.unitPrice || 0;
        const cp = item.cp || item.stockCp || 0;
        const total = gp * quantity;
        const netTotal = cp * quantity;

        newItems.push({
          grnId: item.grnId,
          name: item.itemName,
          itemId: item.itemId,
          packageId: item.packageId,
          teams: item.packageId ? [{
            id: '1',
            color: "primary",
            text: item.packageId
          }] : [],
          quantity: quantity,
          gp: gp,
          cp: cp,
          total: parseFloat(total.toFixed(3)),
          netTotal: parseFloat(netTotal.toFixed(3)),
          reaminingQty: item.reaminingQty,
          stockGp: item.stockGp,
          period: item.period,
          uniqueId: item.id
        });

        itemsToAdd.push(uniqueId);
      }
    });

    if (newItems.length === 0) {
      toast.error("No valid items to add");
      return;
    }

    setSelectedItems(prev => [...prev, ...newItems]);
    setAddedUniqueIds(prev => {
      const newSet = new Set(prev);
      itemsToAdd.forEach(id => newSet.add(id));
      return newSet;
    });
    setModalSelectedItems(new Set());
    setOpenModal(false);
    setCurrentPage(1);

    toast.success(`Added ${newItems.length} item(s) to the table`);
  }, [modalSelectedItems, filteredItems, addedUniqueIds, selectedItems]);

  // Custom hook for QTY input with validation
  const useQuantityInput = (item: SelectedItem) => {
    const [inputValue, setInputValue] = useState('');
    const [localError, setLocalError] = useState<string>('');

    useEffect(() => {
      if (inputValue === '' || parseFloat(inputValue) !== item.quantity) {
        setInputValue(item.quantity === 0 ? '' : item.quantity.toFixed(3));
      }
    }, [item.quantity]);

    const maxQuantity = item.reaminingQty || 0;
    const hasError = !!recvdQtyErrors[parseInt(item.grnId)] || !!localError;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      if (rawValue === '') {
        setInputValue('');
        setLocalError('');
        handleQuantityChange(item.uniqueId!, '0');
        return;
      }

      if (!/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
        return;
      }

      if ((rawValue.match(/\./g) || []).length > 1) {
        return;
      }

      const parts = rawValue.split('.');
      if (parts.length === 2 && parts[1].length > 3) {
        return;
      }

      setInputValue(rawValue);
      setLocalError('');

      const numValue = parseFloat(rawValue);

      if (isNaN(numValue)) {
        handleQuantityChange(item.uniqueId!, '0');
      } else {
        handleQuantityChange(item.uniqueId!, rawValue);

        if (recvdQtyErrors[parseInt(item.grnId)]) {
          setRecvdQtyErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[parseInt(item.grnId)];
            return newErrors;
          });
        }
      }
    };

    const handleBlur = () => {
      if (inputValue === '' || inputValue === '.' || inputValue === '-') {
        handleQuantityChange(item.uniqueId!, '0');
        setInputValue('0.000');
        if (recvdQtyErrors[parseInt(item.grnId)]) {
          setRecvdQtyErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[parseInt(item.grnId)];
            return newErrors;
          });
        }
        setLocalError('');
        return;
      }

      const numValue = parseFloat(inputValue);

      if (!isNaN(numValue)) {
        const formattedValue = numValue.toFixed(3);
        const formattedMax = maxQuantity.toFixed(3);

        if (numValue < 0) {
          handleQuantityChange(item.uniqueId!, '0');
          setInputValue('0.000');
          setLocalError('Quantity cannot be negative');
        } else if (numValue > maxQuantity) {
          if (formattedValue === formattedMax) {
            handleQuantityChange(item.uniqueId!, formattedValue);
            setInputValue(formattedValue);
            if (recvdQtyErrors[parseInt(item.grnId)]) {
              setRecvdQtyErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[parseInt(item.grnId)];
                return newErrors;
              });
            }
          } else {
            setRecvdQtyErrors(prev => ({
              ...prev,
              [parseInt(item.grnId)]: `Cannot exceed Stock Qty: ${formattedMax}`
            }));
            handleQuantityChange(item.uniqueId!, formattedMax);
            setInputValue(formattedMax);
          }
        } else {
          handleQuantityChange(item.uniqueId!, formattedValue);
          setInputValue(formattedValue);
          if (recvdQtyErrors[parseInt(item.grnId)]) {
            setRecvdQtyErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[parseInt(item.grnId)];
              return newErrors;
            });
          }
        }
      }
      setLocalError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'Tab' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        return;
      }

      if (!/^[0-9.]$/.test(e.key)) {
        e.preventDefault();
      }

      if (e.key === '.') {
        if (inputValue.includes('.')) {
          e.preventDefault();
        }
      }
    };

    return {
      inputValue,
      hasError,
      errorMessage: localError || recvdQtyErrors[parseInt(item.grnId)],
      handleInputChange,
      handleBlur,
      handleKeyDown
    };
  };

  // Table Columns for modal
  const columnHelper1 = createColumnHelper<typeof modalTableData[0]>();

  const defaultColumns1 = React.useMemo(() => [
    columnHelper1.display({
      id: 'select',
      header: () => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={
              modalTableData.length > 0 &&
              modalTableData.filter(item => !addedUniqueIds.has(item.uniqueId!)).length > 0 &&
              modalTableData.every(item =>
                addedUniqueIds.has(item.uniqueId!) || modalSelectedItems.has(item.uniqueId!)
              )
            }
            onChange={handleSelectAll}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      ),
      cell: (info) => {
        const uniqueId = info.row.original.uniqueId!;
        const isAlreadyAdded = addedUniqueIds.has(uniqueId);

        return (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            {isAlreadyAdded ? (
              <span className="text-green-500 text-sm">✓</span>
            ) : (
              <input
                type="checkbox"
                checked={modalSelectedItems.has(uniqueId)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleItemSelect(uniqueId);
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isAlreadyAdded}
              />
            )}
          </div>
        );
      },
      size: 50,
    }),
    columnHelper1.display({
      id: 'itemId',
      header: () => <span>Item Id</span>,
      cell: (info) =>
        <div>
          <h6 className="text-[11px]">{info.row.original.itemId}</h6>
          <p className="text-[9px] break-words">{info.row.original.name}</p>
        </div>,
    }),
    columnHelper1.accessor("packageId", {
      header: () => <span>Package Id</span>,
      cell: (info) => <h6 className="text-[11px]">{info.getValue()}</h6>,
    }),
    columnHelper1.accessor("grnId", {
      header: () => <span>GRN Id</span>,
      cell: (info) => <h6 className="text-[11px]">{info.getValue()}</h6>,
    }),
    columnHelper1.accessor("period", {
      header: () => <span>Period</span>,
      cell: (info) => <h6 className="text-[11px]">{info.getValue()}</h6>,
    }),
    columnHelper1.accessor("locationId", {
      header: () => <span>Location</span>,
      cell: (info: any) => (
        <div className="min-w-[40px]">
          <h6 className="text-[11px]">{info.row.original.locationId || ''}</h6>
          <p className="text-[9px] text-gray-500 leading-tight break-all">{info.row.original.locationName || ''}</p>
        </div>
      ),
    }),
    columnHelper1.accessor("reaminingQty", {
      header: () => <span>Stock Qty</span>,
      cell: (info) => <h6 className="text-[11px]">{info.getValue()?.toFixed(3)}</h6>,
    }),
    columnHelper1.accessor("gp", {
      header: () => <span>Unit Price</span>,
      cell: (info) => <h6 className="text-[11px]">{info.getValue()?.toFixed(3)}</h6>,
    }),
  ], [modalSelectedItems, modalTableData, addedUniqueIds, handleItemSelect, handleSelectAll]);

  // Table Columns for main table
  const defaultColumns = React.useMemo(() => [
    columnHelper.display({
      id: 'grnId',
      header: () => <span>Item Code</span>,
      cell: (info) => {
        const item = info.row.original as SelectedItem;
        return (
          <div className="flex items-center space-x-2 p-0.5">
            <div className="w-[70px]">
              <p className="text-[11px] font-medium">{item.itemId}</p>
              <p className="text-[9px] break-words leading-tight">
                {(() => {
                  const name = item.name || '';
                  const chunks = name.match(/.{1,14}/g) || [];
                  return chunks.map((chunk, index) => (
                    <span key={index}>
                      {chunk}
                      {index < chunks.length - 1 && <br />}
                    </span>
                  ));
                })()}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("packageId", {
      header: () => <span>Package Id</span>,
      cell: (info) => <p className="text-[11px]">{info.getValue()}</p>,
    }),
    columnHelper.accessor("reaminingQty", {
      header: () => <span>Stock Qty</span>,
      cell: (info) => <h6 className="text-[11px]">{info.getValue()?.toFixed(3)}</h6>,
    }),
    columnHelper.display({
      id: 'quantity',
      header: () => (
        <div className="text-center">
          <div className="text-[11px]">QTY</div>
        </div>
      ),
      cell: (info) => {
        const item = info.row.original as SelectedItem;
        const {
          inputValue,
          hasError,
          handleInputChange,
          handleBlur,
          handleKeyDown
        } = useQuantityInput(item);

        return (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="0.000"
              className={`w-20 px-1 py-0.5 border rounded text-[11px] text-center ${
                hasError
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300'
              }`}
            />
          </div>
        );
      },
    }),
    columnHelper.accessor("gp", {
      header: () => <span>GP</span>,
      cell: (info) => <h6 className="text-[11px] text-right">{info.getValue()?.toFixed(3)}</h6>,
    }),
    columnHelper.accessor("cp", {
      header: () => <span>CP</span>,
      cell: (info) => <h6 className="text-[11px] text-right">{info.getValue()?.toFixed(3)}</h6>,
    }),
    columnHelper.accessor("total", {
      header: () => <span>Total</span>,
      cell: (info) => <h6 className="text-[11px] text-right">{info.getValue()?.toFixed(3)}</h6>,
    }),
    columnHelper.accessor("netTotal", {
      header: () => <span>Net Total</span>,
      cell: (info) => <h6 className="text-[11px] text-right">{info.getValue()?.toFixed(3)}</h6>,
    }),
    columnHelper.accessor("grnId", {
      header: () => <span>GRN</span>,
      cell: (info) => <h6 className="text-[11px]">{(info.row.original as SelectedItem).grnId}</h6>,
    }),
    columnHelper.display({
      id: 'delete',
      header: () => <span className="text-[11px]">Delete</span>,
      cell: (info) => {
        const item = info.row.original as SelectedItem;
        return (
          <Button
            size="xs"
            color="failure"
            className="w-6 h-6 p-0 rounded-full flex items-center justify-center"
            onClick={() => handleDeleteItem(item.uniqueId!)}
          >
            <FaTrashAlt className="w-3 h-3 text-red-600" />
          </Button>
        );
      },
    }),
  ], [recvdQtyErrors, handleQuantityChange, handleDeleteItem]);

  const table = useReactTable({
    data: filteredTableData as TableTypeDense[],
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const table1 = useReactTable({
    data: modalTableData,
    columns: defaultColumns1,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
    handleRefresh();
  };

  const handleSupplierSelect = (supplier: SupplierType) => {
    setSelectedSupplier(supplier);
    setIsSupplierOpen(false);
    setSupplierSearch('');
    if (supplier.supplierId) {
      fetchSupplierItems(supplier.supplierId);
    }
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!token) {
        setSessionExpired(true);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropDownSupplier', {
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
        const data = await response.json();
        if (data.success) {
          setSuppliers(data.data || []);
        }
      } catch (error) {
        setSessionExpired(true);
        console.error("Error fetching suppliers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [token]);

  const fetchSupplierItems = async (supplierId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      const stockPeriod = localStorage.getItem("stockPeriod");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      if (!stockPeriod || !supplierId) {
        console.error("Stock period or supplier ID not found");
        toast.error("Please select a supplier and ensure stock period is set");
        setSupplierItems([]);
        return;
      }

      let formattedDate = stockPeriod;
      const yyyyMMddRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = stockPeriod.match(yyyyMMddRegex);

      if (match) {
        const [, year, month, day] = match;
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        formattedDate = `${dayNum}-${monthNum}-${year}`;
      }

      const response = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/itemListBySupplierIdNewLatest/${supplierId}/${formattedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      if (response.data.success && response.data.data) {
        const itemsData = response.data.data.map((item: any) => ({
          grnId: item.grnId,
          itemName: item.itemName,
          itemId: item.itemId,
          packageId: item.packageId,
          supplierName: item.supplierName,
          supplierId: item.supplierId,
          stockGp: item.stockGp,
          stockCp: item.stockCp,
          period: item.period,
          ip02: item.ip02,
          batchNo: item.batchNo,
          totalCost: item.totalCost,
          totalCostCp: item.totalCostCp,
          totalCostIp: item.totalCostIp,
          renderGp: item.renderGp || false,
          renderIp: item.renderIp || false,
          reaminingQty: item.reaminingQty || 0,
          quotedGP: item.gp,
          actualGP: item.stockGp,
          actualGP1: item.ip02,
          expiryDate: item.expiryDate,
          locationId: item.locationId,
          returnDate: item.returnDate,
          locationName: item.locationName,
          grossPrice: item.grossPrice,
          unitPrice: item.unitPrice,
          cp: item.cp,
          gp: item.gp
        }));
        setSupplierItems(itemsData);
        toast.success(`Found ${itemsData.length} items`);
      } else {
        setSupplierItems([]);
        toast.error("No items found for this supplier");
      }
    } catch (error) {
      setSessionExpired(true);
      console.error("Error fetching supplier items:", error);
      setSupplierItems([]);
      toast.error("Error fetching items from server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLocationForCWH = async () => {
      if (!cwh || cwh === 'undefined' || cwh === 'null') {
        console.log("No CWH value found in localStorage");
        return;
      }

      setIsLoadingLocation(true);
      try {
        const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/loadDeliveryLocationDropdown', {
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

        const data = await response.json();
        if (data.success && data.data) {
          const matchedLocation = data.data.find((location: any) =>
            location.code === cwh
          );

          if (matchedLocation) {
            setSelectedLocation({
              code: matchedLocation.code,
              name: matchedLocation.name
            });
          } else {
            setSelectedLocation(null);
          }
        }
      } catch (error) {
        setSessionExpired(true);
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocationForCWH();
  }, [token, cwh]);

let content;
if (showTable) {
  content = <ReturnItemTable onBack={handleAddClick} />;
} else {
  content = (
    <div className="space-y-4 w-full max-w-[1040px] mx-auto px-2 sm:px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5">
        {/* Header Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 pb-2 dark:border-gray-700">
          {/* Return ID Card */}
          <Card className="bg-blue-50 border-l-8 border-blue-500 shadow-sm p-2 sm:p-3 h-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <FaReceipt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-sm font-medium text-black dark:text-white truncate">
                  Return ID: <span className="text-[11px] sm:text-sm font-bold text-black dark:text-white"># Auto</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Period Card */}
          <Card className="bg-emerald-50 border-l-8 border-emerald-500 shadow-sm p-2 sm:p-3 h-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-lg flex-shrink-0">
                <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-sm font-medium text-black dark:text-white truncate">
                  Period: <span className="text-[11px] sm:text-sm font-bold text-black dark:text-white">
                    {formatPurchasePeriod(stockPeriod || '')}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Location Code Card */}
          <Card className="bg-purple-50 border-l-8 border-purple-500 shadow-sm p-2 sm:p-3 h-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg flex-shrink-0">
                <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-sm font-medium text-black dark:text-white ">
                  Location Code: <span className="text-[11px] sm:text-sm font-bold text-black dark:text-white">
                    {selectedLocation ? selectedLocation.code : (isLoadingLocation ? 'Loading...' : '-')}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Location Name Card */}
          <Card className="bg-amber-50 border-l-8 border-amber-500 shadow-sm p-2 sm:p-3 h-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-amber-500 rounded-lg flex-shrink-0">
                <FaBuilding className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px]  font-medium text-black dark:text-white ">
                  Location Name: <span className="text-[11px] sm:text-sm font-bold text-black dark:text-white">
                    {selectedLocation ? selectedLocation.name : (isLoadingLocation ? 'Loading...' : '-')}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Supplier Selection Section - Responsive */}
       <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm sm:h-20 md:h-60 lg:h-20">
  <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-3 sm:p-4 h-full">
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
        <FaTruck className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Supplier:</span>
    </div>

    <div ref={supplierDropdownRef} className="relative flex-1 min-w-[200px] lg:min-w-[250px]">
      <div
        className={`border rounded-md h-9 flex items-center justify-between px-3 cursor-pointer transition-all duration-200 text-sm
          ${selectedSupplier
            ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        onClick={() => setIsSupplierOpen(!isSupplierOpen)}
      >
        <span className={`text-sm font-medium truncate pr-2 ${
          selectedSupplier
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {selectedSupplier
            ? `${selectedSupplier.supplierId} - ${selectedSupplier.supplierName}`
            : 'Select supplier'}
        </span>
        <svg
          className={`w-3.5 h-3.5 transform transition-transform duration-200 flex-shrink-0 ${isSupplierOpen ? 'rotate-180' : ''} text-gray-500 dark:text-gray-400`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isSupplierOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Supplier dropdown content - same as before */}
          <div className="p-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="relative">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${suppliers.length} suppliers...`}
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            <div
              className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => {
                setIsSupplierOpen(false);
                setSelectedSupplier(null);
                setSupplierSearch('');
                setSupplierItems([]);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Clear Selection</span>
              </div>
            </div>

            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier, index) => (
                <div
                  key={supplier.pk}
                  className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                  onClick={() => handleSupplierSelect(supplier)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${selectedSupplier?.pk === supplier.pk
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 text-gray-700 dark:text-gray-300'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {supplier.supplierId}
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                        {supplier.supplierName}
                      </div>
                    </div>
                    {selectedSupplier?.pk === supplier.pk && (
                      <span className="text-blue-500 dark:text-blue-400 text-xs flex-shrink-0">✓</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <div className="text-xl mb-1">🔍</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">No suppliers found</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Try adjusting your search</p>
              </div>
            )}
          </div>

          {filteredSuppliers.length > 0 && (
            <div className="p-1.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center">
                {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} available
              </p>
            </div>
          )}
        </div>
      )}
    </div>

    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 lg:mt-0">
      {/* Return Date Picker */}
      <div className="w-full sm:w-[160px]">
        <CalendarStockReceive
          id="toDate"
          label=""
          required={true}
          selected={toDate ? new Date(toDate) : currentDate}
          onChange={(date: Date | null) => {
            if (date) {
              const offset = date.getTimezoneOffset();
              const localDate = new Date(date.getTime() - offset * 60 * 1000);
              setToDate(localDate.toISOString().split('T')[0]);
            } else {
              setToDate('');
            }
          }}
          placeholderText="dd-mm-yyyy"
          minDate={fromDate ? new Date(fromDate) : twoYearsAgo}
          maxDate={currentDate}
        />
      </div>

      {/* Select Items Button */}
      <Button
        onClick={() => {
          if (!selectedSupplier?.supplierId) {
            toast.error("Please select a supplier");
            return;
          }
          setOpenModal(true);
          setSearchItem('');
        }}
        className={`
          whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium shadow-sm
          transition-all duration-200 transform active:scale-95 w-full sm:w-auto
          ${selectedSupplier
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }
        `}
        color="primary"
        disabled={!selectedSupplier || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <FaBoxOpen className="w-4 h-4 flex-shrink-0" />
            <span>Select Items</span>
            {selectedSupplier && supplierItems.length > 0 && (
              <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {supplierItems.length}
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  </div>
</Card>

        {/* Selected Items Header - Responsive */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-[12px] w-full sm:w-auto">
              <span className="text-black font-medium dark:text-gray-200">Total GP:</span>
              <span className="text-blue-800 dark:text-gray-200 font-bold">₹ {totals.total?.toFixed(3) || '0.000'}</span>
              <span className="text-black font-medium dark:text-gray-200 ml-2">Total CP:</span>
              <span className="text-blue-800 dark:text-gray-200 font-bold">₹ {totals.netTotal?.toFixed(3) || '0.000'}</span>
            </div>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder={`Search ${selectedItems.length} items...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Selected Items Table - Responsive */}
        <div className="p-2 pt-0">
          <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="max-h-[230px] overflow-y-auto">
              <table className="w-full table-auto min-w-[800px] lg:min-w-full">
                <thead className="bg-blue-600 dark:bg-blue-800 sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-1 py-1 text-left font-semibold text-white uppercase text-[10px] sm:text-xs"
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
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-blue-50 dark:hover:bg-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50 bg-white dark:bg-gray-800"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-1 py-1 align-middle text-xs">
                            <div className="flex items-center min-h-[20px]">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={table.getAllColumns().length} className="px-2 py-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-1">
                            <FaBoxOpen className="w-4 h-4 text-blue-400 dark:text-blue-500" />
                          </div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {selectedItems.length === 0 ? 'No Items Added' : 'No Matching Records'}
                          </h4>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal for selecting items - Responsive */}
        <Modal
          show={openModal}
          onClose={() => {
            setSearchItem("");
            setCurrentPage(1);
            setOpenModal(false);
          }}
          size="full sm:max-w-6xl"
          className="sm:rounded-lg"
        >
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <FaBoxOpen className="w-4 h-4 text-red-600 dark:text-blue-400 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  Item Details - {selectedSupplier?.supplierName || "Select Items"}
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-black dark:text-blue-300 rounded-full text-xs font-bold flex-shrink-0">
                  Total: {filteredModalItems.length}
                </span>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleAddItems}
                  disabled={modalSelectedItems.size === 0}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 px-3 py-1.5"
                  title="Add selected items"
                >
                  <HiPlus className="w-4 h-4 mr-1" />
                  <span className="text-xs">Add Selected ({modalSelectedItems.size})</span>
                </Button>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="p-3 bg-white dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Selected:
                </span>
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-bold">
                  {modalSelectedItems.size}
                </span>
                {addedUniqueIds.size > 0 && (
                  <>
                    <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">|</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Already Added: <span className="font-bold text-amber-600 dark:text-amber-400">{addedUniqueIds.size}</span>
                    </span>
                  </>
                )}
              </div>
              <div className="relative w-full sm:w-64">
                <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchItem}
                  onChange={(e) => {
                    setSearchItem(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 overflow-hidden focus:outline-none rounded-lg" tabIndex={0}>
              <div className="overflow-x-auto">
                <div className="min-w-[800px] lg:min-w-full">
                  <table className="w-full table-auto">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                      {table1.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
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
                      {table1.getRowModel().rows.length > 0 ? (
                        table1.getRowModel().rows.map((row, idx) => {
                          const absoluteIndex = (currentPage - 1) * pageSize + idx;
                          const uniqueId = row.original.uniqueId;
                          const isAlreadyAdded = addedUniqueIds.has(uniqueId);

                          return (
                            <tr
                              key={row.id}
                              onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (
                                  target.type !== "checkbox" &&
                                  !target.closest("button") &&
                                  !isAlreadyAdded
                                ) {
                                  handleItemSelect(uniqueId);
                                }
                              }}
                              className={`
                                bg-white dark:bg-gray-800
                                hover:bg-gray-50 dark:hover:bg-gray-700
                                cursor-pointer text-xs
                                ${row.original.isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                                ${isAlreadyAdded ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700/50" : ""}
                                ${absoluteIndex % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-700/30"}
                                transition-colors duration-150
                              `}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300 whitespace-nowrap">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={table1.getAllColumns().length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                            {isLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span>Loading items...</span>
                              </div>
                            ) : (
                              "No items found"
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {filteredModalItems.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 text-xs">
                <div className="text-gray-600 dark:text-gray-300 order-2 sm:order-1">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredModalItems.length)} of{" "}
                  {filteredModalItems.length} items
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    >
                      <FaChevronLeft className="w-3 h-3" /> Prev
                    </button>
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-xs font-medium min-w-[60px] text-center">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    >
                      Next <FaChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
}

return (
  <>
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: '',
        style: {
          background: '#363636',
          color: '#fff',
          zIndex: 999999,
        },
        success: {
          style: {
            background: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
        },
        duration: 3000,
      }}
    />

    <div className="flex flex-col mt-2 sm:mt-4 px-2 sm:px-4">
      <div className="flex w-full justify-end sm:justify-start">
        {!showTable && (
          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-2 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <h1 className="text-base sm:text-lg lg:text-xl text-indigo-700 whitespace-nowrap">
                  Return Items To Supplier
                </h1>
                <Tooltip
                  content={
                    <div className="text-xs max-w-xs">
                      <p className="font-semibold mb-1">Quick Steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select supplier</li>
                        <li>Select location (auto-filled)</li>
                        <li>Add items with quantities</li>
                        <li>Click save and confirm</li>
                      </ol>
                    </div>
                  }
                  placement="bottom"
                  className="dark:bg-gray-800 dark:text-white z-50"
                >
                  <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    <HiInformationCircle className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>

              <div className="flex gap-2 items-center ml-auto">
                <Tooltip content="Save" placement="bottom">
                  <Button
                    color="success"
                    size="sm"
                    className="w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    onClick={handleSaveClick}
                    disabled={saving || isLoading}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    ) : (
                      <FaSave className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </Tooltip>

                <Tooltip content="Refresh" placement="bottom">
                  <Button
                    color="warning"
                    size="sm"
                    className="w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                    onClick={handleRefresh}
                  >
                    <HiRefresh className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Tooltip>

                <Tooltip content="List" placement="bottom">
                  <Button
                    color="primary"
                    size="sm"
                    className="w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    onClick={handleListClick}
                  >
                    <HiViewList className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>

    {content}

    {showSaveModal && (
      <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)} size="sm sm:md">
        <ModalHeader className="text-sm sm:text-base">Confirm Save</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-center justify-center text-4xl sm:text-6xl text-blue-500 mb-4">
              <FaSave />
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to save this Return Items To Supplier record?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center gap-2">
          <Button
            color="success"
            onClick={handleConfirmSave}
            disabled={saving}
            className="min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1"></div>
                <span className="text-xs">Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowSaveModal(false)}
            disabled={saving}
            className="min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    )}

    {sessionExpired && <SessionModal />}

    {isLoading && (
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-xl flex items-center gap-2 sm:gap-3 mx-3">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
        </div>
      </div>
    )}
  </>
);
};

export default ReturnItemToSupplier;