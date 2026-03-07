import { Badge, Label, Pagination, Tooltip } from "flowbite-react";
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { HiInformationCircle, HiPlus, HiRefresh, HiSearch, HiTrash, HiViewList } from 'react-icons/hi';
import React from "react";
import axios from "axios";
import { FaBoxOpen, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaReceipt, FaSave, FaSearch, FaTruck } from "react-icons/fa";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader ,Card} from 'flowbite-react';
import toast, { Toaster } from 'react-hot-toast';
   
// Define missing interfaces
export interface UploadedItem {
  itemId: number;
  itemName: string;
  packageId: any[]; // Adjust this type based on your actual data structure
  quotedGP?: number;
  actualGP?: number;
  actualGP1?: number;
  quantity?: number;
  // Add new fields from API
  receiveHeadPK?: number;
  receivedeltailPk?: number;
  traceItemPk?: number;
  supplierName?: string;
  supplierId?: string;
  stockGp?: number;
  stockCp?: number;
  gp?: number;
  cp?: number;
  ip02?: number;
  batchNo?: string;
  totalCost?: number;
  totalCostCp?: number;
  totalCostIp?: number;
  renderGp?:boolean;
  renderIp?:boolean;
  expiryDate?: string | null; // Added expiryDate from API
}

export interface LocationType {
  pk: number;
  code: string;
  name: string;
}

export interface TableTypeDense {
  avatar?: any;
  name?: string;
  post?: string;
  pname?: string;
  teams: {
    id: string;
    color: string;
    text: string;
  }[];
  status?: string;
  statuscolor?: string;
  budget?: string;
  itemId?: number;
  packageId?: any[];
  quotedGP?: string;
  actualGP?: string;
  gpDiff?: string;
  actualTotalGP?: string;
  totalGPDiff?: string;
  quantity?: number;
  editableQuantity?: number;
  editableActualGP?: string;
  isManuallyEdited?: boolean;
  originalActualGP?: number;
  originalActualGP1?: number;
  // New fields for the table
  gp?: string;
  cp?: string;
  ip?: string;
  ttlGrossPrice?: string;
  ttlCostPrice?: string;
  ttlIssuePrice?: string;
  renderGp?:boolean;
  renderIp?:boolean;
  // Additional fields for save API
  expiryDate?: string | null; // Added expiryDate
  supplierId?: string;
  itemName?: string;
  ip02?: string;
} 


import RecItemTable from "./RecItemTable";
import CalendarStockReceive from "../StockReceive/CalenderSrockReceive";
import SessionModal from "../SessionModal";
import { useEntityFormatter } from "../Entity/UseEntityFormater";
// import { s } from "node_modules/react-router/dist/development/context-DSyS5mLj.d.mts";

const basicTableData: TableTypeDense[] = [];

const columnHelper = createColumnHelper<TableTypeDense>();

const StockReceiveItemFromLocation = () => {
  const formatter = useEntityFormatter();
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
      const [sessionExpired, setSessionExpired] = useState(false);
const [showSaveModal, setShowSaveModal] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedDates,] = useState<any[]>([]);
  const [addedItemIds, setAddedItemIds] = useState<Set<number>>(new Set());
  const [, setSaveStatus] = useState<{success: boolean, message: string} | null>(null);
  const [supplierItems, setSupplierItems] = useState<UploadedItem[]>([]);
  const [isOpenSupplier, setIsOpenSupplier] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<LocationType | null>(null);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
   
  
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [modalSelectedItems, setModalSelectedItems] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [itemId: number]: string;
  }>({});
  // State for locations from API
  const [locations, setLocations] = useState<LocationType[]>([]);
  const stockPeriod = localStorage.getItem("stockPeriod");
      const supplierDropdownRef = useRef<HTMLDivElement>(null);
  
  // Refs for continuous typing
  const quantityTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const gpTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const cpTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const ipTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  
  // Pagination state for modal
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // Number of items per page

  const formatValue = (value: any) => {
    if (value === undefined || value === null || value === '') return '0.00';
    const num = Number.parseFloat(value);
    return isNaN(num) ? '0.00' : formatter.formatAmount(num);
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
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // Check if click is outside both dropdowns
        if (
          supplierDropdownRef.current && 
          !supplierDropdownRef.current.contains(event.target as Node) 
        ) {
          setIsOpenSupplier(false);

          // setIsOpenPo(false);
        }
      };
   
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
  // Reset to first page when search changes or modal opens

  
  // Fetch locations from API on component mount
 useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
    setSaving(true);
    setIsLoading(true);

      setIsLoadingLocations(true);
      const token = localStorage.getItem("authToken");
        if (!token) {
      setSessionExpired(true);
      return;
    }
      
      const response = await axios.get(
        "http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/loadDeliveryLocationDropdown",
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
        // Map API data to LocationType format
        const locationData = response.data.data.map((item: any) => ({
          pk: item.pk,
          code: item.code,
          name: item.name
        }));
        setLocations(locationData);
      }
    } catch (error) {
      setSessionExpired(true);

      console.error("Error fetching locations:", error);
      // Fallback to mock data if API fails
    
    } finally {
      setIsLoadingLocations(false);
    setSaving(false);
    setIsLoading(false);


    }
  };

  // Fetch items from API when supplier is selected
  const fetchSupplierItems = async (supplierCode: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      const stockPeriod = localStorage.getItem("stockPeriod");
        if (!token) {
      setSessionExpired(true);
      return;
    }
      if (!stockPeriod) {
        console.error("Stock period not found in localStorage");
        toast.error("Please set stock period first");
        setSupplierItems([]);
        return;
      }

      // Format the date from yyyy-mm-dd to dd-mm-yyyy
      let formattedDate = stockPeriod;
      
      // Check if it's in yyyy-mm-dd format
      const yyyyMMddRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = stockPeriod.match(yyyyMMddRegex);
      
      if (match) {
        const [, year, month, day] = match;
        // Remove leading zeros and format as d-m-yyyy
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        formattedDate = `${dayNum}-${monthNum}-${year}`;
   
      }
      
      const response = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/traceItemDetailListNew/${formattedDate}`,
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
        // Filter items by supplier code
        const filteredItems = response.data.data.filter((item: any) => {
          return item.supplierId === supplierCode || 
                 item.locationId === supplierCode ||
                 (item.supplierId && item.supplierId.includes(supplierCode));
        });
        
        if (filteredItems.length === 0) {
          const allItems = response.data.data.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            packageId: item.packageId ? [item.packageId] : [],
            supplierName: item.supplierName,
            supplierId: item.supplierId,
            stockGp: item.stockGp,
            stockCp: item.stockCp,
            gp: item.gp,
            cp: item.cp,
            ip02: item.ip02,
            batchNo: item.batchNo,
            totalCost: item.totalCost,
            totalCostCp: item.totalCostCp,
            totalCostIp: item.totalCostIp,
            renderGp: item.renderGp || false,
            renderIp: item.renderIp || false,
            quantity: item.quantity,
            quotedGP: item.gp,
            actualGP: item.stockGp,
            actualGP1: item.ip02,
            expiryDate: item.expiryDate // Get expiryDate from API
          }));
          setSupplierItems(allItems);
        } else {
          const itemsData = filteredItems.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            packageId: item.packageId ? [item.packageId] : [],
            supplierName: item.supplierName,
            supplierId: item.supplierId,
            stockGp: item.stockGp,
            stockCp: item.stockCp,
            gp: item.gp,
            cp: item.cp,
            ip02: item.ip02,
            batchNo: item.batchNo,
            totalCost: item.totalCost,
            totalCostCp: item.totalCostCp,
            totalCostIp: item.totalCostIp,
            renderGp: item.renderGp || false,
            renderIp: item.renderIp || false,
            quantity: item.quantity,
            quotedGP: item.gp,
            actualGP: item.stockGp,
            actualGP1: item.ip02,
            expiryDate: item.expiryDate // Get expiryDate from API
          }));
          setSupplierItems(itemsData);
        }
      } else {
        setSupplierItems([]);
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

  // Handle refresh button click
  const handleRefresh = () => {
    // Clear all data
    setSelectedItems([]);
    setAddedItemIds(new Set());
    setSelectedSupplier(null);
    setSupplierItems([]);
    setModalSelectedItems(new Set());
    setSaveStatus(null);
    setSearch('');
    setSearchItem('');
    setSearchSupplier('');
    setToDate(() => {
      const currentDate = new Date();
      const offset = currentDate.getTimezoneOffset();
      const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
      return localDate.toISOString().split('T')[0];
    });
    
    // Also clear any timeouts
 
    
    // toast.success("Form refreshed successfully");
  };

  const handleSelectAll = () => {
    if (modalSelectedItems.size === paginatedFilteredItems.length) {
      setModalSelectedItems(new Set());
    } else {
      // Only select items that aren't already added to the main table and are on current page
      const selectableItems = paginatedFilteredItems.filter(item => !addedItemIds.has(item.itemId));
      const allSelectableItemIds = new Set(selectableItems.map(item => item.itemId));
      setModalSelectedItems(allSelectableItemIds);
    }
  };

  // Handle individual item selection in modal
  const handleItemSelect = (itemId: number) => {
    // Use functional update to avoid closure issues
    setModalSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Filter items based on search
  const filteredItems = supplierItems.filter(item => 
    item.itemName?.toLowerCase().includes(searchItem.toLowerCase()) ||
    item.itemId?.toString().includes(searchItem)
  );

  // Calculate paginated items
  const paginatedFilteredItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const filteredSuppliers = locations.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  // Filter table rows based on search - FIXED VERSION
  const filteredTableData = React.useMemo(() => {
    if (!search.trim()) return selectedItems;
    const lowerSearch = search.toLowerCase().trim();
    
    return selectedItems.filter(item => {
      // Search in item code (name)
      if (item.name?.toLowerCase().includes(lowerSearch)) return true;
      
      // Search in item name (pname)
      if (item.pname?.toLowerCase().includes(lowerSearch)) return true;
      
      // Search in package IDs (teams text)
      if (item.teams?.some(team => team.text.toLowerCase().includes(lowerSearch))) return true;
      
      // Search in itemId as string
      if (item.itemId?.toString().includes(lowerSearch)) return true;
      
      return false;
    });
  }, [selectedItems, search]);

  // Calculate totals - use filteredTableData for accurate totals
  const totals = React.useMemo(() => {
    return filteredTableData.reduce((acc, item) => {
      const ttlGrossPrice = parseFloat(item.ttlGrossPrice || '0') || 0;
      const ttlCostPrice = parseFloat(item.ttlCostPrice || '0') || 0;
      const ttlIssuePrice = parseFloat(item.ttlIssuePrice || '0') || 0;
      
      return {
        ttlGrossPrice: acc.ttlGrossPrice + ttlGrossPrice,
        ttlCostPrice: acc.ttlCostPrice + ttlCostPrice,
        ttlIssuePrice: acc.ttlIssuePrice + ttlIssuePrice,
      };
    }, { ttlGrossPrice: 0, ttlCostPrice: 0, ttlIssuePrice: 0 });
  }, [filteredTableData]);


 const validateQuantity = ( quantity: number): string => {
    if (quantity < 0) {
      return "Quantity cannot be negative";
    }
    if (quantity === 0) {
      return "Quantity cannot be zero";
    }
    if (quantity > 999999) {
      return "Quantity cannot exceed 999,999";
    }
    if (!Number.isFinite(quantity)) {
      return "Quantity must be a valid number";
    }
    return "";
  };


  const PRICE_VALIDATION = {
  ZERO: 0,
  MIN: 0.001,
  MAX: 999999
};

// Replace handleGPChange with this updated version
const handleGPChange = (itemId: number, newGP: number) => {
  if (gpTimeoutRef.current.has(itemId)) {
    clearTimeout(gpTimeoutRef.current.get(itemId));
  }
  
  const timeout = setTimeout(() => {
    setSelectedItems(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const quantity = item.quantity || 0;
        const ip = parseFloat(item.ip || '0') || 0;
        
        // When GP changes, set CP to the same value
        const cpValue = newGP;
        
        // Calculate totals
        const ttlGrossPrice = quantity * newGP;
        const ttlCostPrice = quantity * cpValue;
        const ttlIssuePrice = quantity * ip;
        
        // Show toast when GP is entered
        if (newGP > 0) {
          toast.success(`Gross Price updated to ${newGP.toFixed(3)}`, {
            icon: '💰',
            duration: 2000
          });
        }
        
        return {
          ...item,
          gp: newGP.toFixed(3),
          cp: cpValue.toFixed(3), // Set CP to same value as GP
          ttlGrossPrice: ttlGrossPrice.toFixed(3),
          ttlCostPrice: ttlCostPrice.toFixed(3),
          ttlIssuePrice: ttlIssuePrice.toFixed(3)
        };
      }
      return item;
    }));
    gpTimeoutRef.current.delete(itemId);
  }, 0); // 300ms debounce
  
  gpTimeoutRef.current.set(itemId, timeout);
};

// Replace handleCPChange with this updated version
const handleCPChange = (itemId: number, newCP: number) => {
  if (cpTimeoutRef.current.has(itemId)) {
    clearTimeout(cpTimeoutRef.current.get(itemId));
  }
  
  const timeout = setTimeout(() => {
    setSelectedItems(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const quantity = item.quantity || 0;
        const gp = parseFloat(item.gp || '0') || 0;
        const ip = parseFloat(item.ip || '0') || 0;
        
        // Check if GP is zero or not set
        const isGpZero = gp <= 0;
        
        // If GP is zero, show toast and set CP to zero
        if (isGpZero && newCP > 0) {
          toast.error('Cannot set Cost Price. Please enter Gross Price first.', {
            icon: '⚠️',
            duration: 3000
          });
          
          // Set CP to zero
          const ttlGrossPrice = quantity * gp;
          const ttlCostPrice = quantity * 0;
          const ttlIssuePrice = quantity * ip;
          
          return {
            ...item,
            cp: (0).toFixed(3),
            ttlGrossPrice: ttlGrossPrice.toFixed(3),
            ttlCostPrice: ttlCostPrice.toFixed(3),
            ttlIssuePrice: ttlIssuePrice.toFixed(3)
          };
        }
        
        // If GP exists, allow CP to be set independently
        const ttlGrossPrice = quantity * gp;
        const ttlCostPrice = quantity * newCP;
        const ttlIssuePrice = quantity * ip;
        
        // Show success toast when CP is entered with valid GP
        if (newCP > 0 && gp > 0) {
          toast.success(`Cost Price updated to ${newCP.toFixed(3)}`, {
            icon: '💵',
            duration: 2000
          });
        }
        
        return {
          ...item,
          cp: newCP.toFixed(3),
          ttlGrossPrice: ttlGrossPrice.toFixed(3),
          ttlCostPrice: ttlCostPrice.toFixed(3),
          ttlIssuePrice: ttlIssuePrice.toFixed(3)
        };
      }
      return item;
    }));
    cpTimeoutRef.current.delete(itemId);
  }, 0);
  
  cpTimeoutRef.current.set(itemId, timeout);
};

// Replace handleIPChange with this updated version (independent field)
const handleIPChange = (itemId: number, newIP: number) => {
  if (ipTimeoutRef.current.has(itemId)) {
    clearTimeout(ipTimeoutRef.current.get(itemId));
  }
  
  const timeout = setTimeout(() => {
    setSelectedItems(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const quantity = item.quantity || 0;
        const gp = parseFloat(item.gp || '0') || 0;
        const cp = parseFloat(item.cp || '0') || 0;
        
        // Calculate totals - IP is independent
        const ttlGrossPrice = quantity * gp;
        const ttlCostPrice = quantity * cp;
        const ttlIssuePrice = quantity * newIP;
        
        // Show toast when IP is entered
        if (newIP > 0) {
          toast.success(`Issue Price updated to ${newIP.toFixed(3)}`, {
            icon: '🏷️',
            duration: 2000
          });
        }
        
        return {
          ...item,
          ip: newIP.toFixed(3),
          ttlGrossPrice: ttlGrossPrice.toFixed(3),
          ttlCostPrice: ttlCostPrice.toFixed(3),
          ttlIssuePrice: ttlIssuePrice.toFixed(3)
        };
      }
      return item;
    }));
    ipTimeoutRef.current.delete(itemId);
  }, 0);
  
  ipTimeoutRef.current.set(itemId, timeout);
};

// Replace handleQuantityChange with this updated version
 // Replace your existing handleQuantityChange with this simpler version
const handleQuantityChange = (itemId: number, newQuantity: number) => {
  // Validate quantity
  const error = validateQuantity(newQuantity);
  
  // Update validation errors
  setValidationErrors(prev => {
    const newErrors = { ...prev };
    if (error) {
      newErrors[itemId] = error;
    } else {
      delete newErrors[itemId];
    }
    return newErrors;
  });

  // Update selected items immediately
  setSelectedItems(prev => prev.map(item => {
    if (item.itemId === itemId) {
      const gp = parseFloat(item.gp || '0') || 0;
      const cp = parseFloat(item.cp || '0') || 0;
      const ip = parseFloat(item.ip || '0') || 0;
      
      // Calculate totals
      const newQty = newQuantity || 0;
      const ttlGrossPrice = newQty * gp;
      const ttlCostPrice = newQty * cp;
      const ttlIssuePrice = newQty * ip;
      
      return {
        ...item,
        quantity: newQty,
        ttlGrossPrice: ttlGrossPrice.toFixed(3),
        ttlCostPrice: ttlCostPrice.toFixed(3),
        ttlIssuePrice: ttlIssuePrice.toFixed(3)
      };
    }
    return item;
  }));
};
// 5. Update the calculation in handleAddItems function:
const handleAddItems = () => {
  const selectedItemData = supplierItems.filter(item => 
    modalSelectedItems.has(item.itemId)
  ).map(item => {
    const defaultDeliveryType = 0;
    const actualGPValue = defaultDeliveryType === 0 ? (item.actualGP || 0) : (item.actualGP1 || 0);
    const quantity = item.quantity || 0;
    const quotedGP = item.quotedGP || 0;
    
    const gpDiff = (quotedGP - actualGPValue).toFixed(2);
    const actualTotalGP = (actualGPValue * quantity).toFixed(2);
    const totalGPDiff = (parseFloat(gpDiff) * quantity).toFixed(2);
    
    const gp = item.gp || 0;
    const cp = gp; // Set CP equal to GP when adding items
    const ip = item.ip02 || 0;
    
    // Calculate totals
    const ttlGrossPrice = quantity * gp;
    const ttlCostPrice = quantity * cp;
    const ttlIssuePrice = quantity * ip;
    
    return {
      avatar: "",
      name: item.itemId.toString(),
      post: "",
      pname: item.itemName,
      teams: item.packageId ? item.packageId.map((pkg: string, index: number) => ({
        id: (index + 1).toString(),
        color: "primary",
        text: pkg
      })) : [],
      status: item.quotedGP?.toString() || "0",
      statuscolor: "blue",
      budget: quantity.toString(),
      quotedGP: item.quotedGP?.toString() || "0",
      actualGP: actualGPValue.toFixed(2),
      gpDiff: gpDiff,
      actualTotalGP: actualTotalGP,
      totalGPDiff: totalGPDiff,
      itemId: item.itemId,
      packageId: item.packageId,
      quantity: quantity,
      // New fields
      gp: gp.toFixed(3),
      cp: cp.toFixed(3), // Set CP equal to GP
      ip: ip.toFixed(3),
      ttlGrossPrice: ttlGrossPrice.toFixed(3),
      ttlCostPrice: ttlCostPrice.toFixed(3),
      ttlIssuePrice: ttlIssuePrice.toFixed(3),
      // Original values
      originalActualGP: item.actualGP,
      originalActualGP1: item.actualGP1,
      editableQuantity: quantity,
      editableActualGP: actualGPValue.toFixed(2),
      isManuallyEdited: false,
      // Add render flags
      renderGp: item.renderGp || false,
      renderIp: item.renderIp || false,
      // Additional fields for save
      supplierId: item.supplierId,
      itemName: item.itemName,
      expiryDate: item.expiryDate
    };
 
  });
    const newItems = selectedItemData.filter(item => !addedItemIds.has(item.itemId!));
    
    if (newItems.length === 0 && selectedItemData.length > 0) {
      toast.error("Selected items are already added to the table");
      return;
    }
    
    const newAddedIds = new Set(addedItemIds);
    newItems.forEach(item => newAddedIds.add(item.itemId!));
    setAddedItemIds(newAddedIds);
    
    setSelectedItems(prev => [...prev, ...newItems]);
    setOpenModal(false);
    setModalSelectedItems(new Set());
    setSaveStatus(null);
    
    if (newItems.length < selectedItemData.length) {
      toast.success(`${selectedItemData.length - newItems.length} items were already in the table and were not added again.`);
    } else {
      toast.success(`${newItems.length} items added successfully`);
    }
  };

  // Format date to yyyy-mm-dd
  const formatDateToYYYYMMDD = (dateString: string): string => {
    if (!dateString) return '';
    
    // If already in yyyy-mm-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse different date formats
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if can't parse
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };
 const validatePrice = (price: number, fieldName: string): string => {
  if (price <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  if (price > 999999) {
    return `${fieldName} cannot exceed 999,999`;
  }
  if (!Number.isFinite(price)) {
    return `${fieldName} must be a valid number`;
  }
  return "";
};

// Update validateAllItems to check all required fields
const validateAllItems = (): { isValid: boolean; errors: { [itemId: number]: string } } => {
  const errors: { [itemId: number]: string } = {};
  let isValid = true;

  selectedItems.forEach(item => {
    if (!item.itemId) return;

    // Validate Quantity
    const quantity = item.quantity || 0;
    // if (quantity <= 0) {
    //   errors[item.itemId] = "Qty must be greater than 0";
    //   isValid = false;
    // }

    // Validate Gross Price - always required if not renderGp
    if (!item.renderGp) {
      const gp = parseFloat(item.gp || '0') || 0;
      // if (gp <= 0) {
      //   errors[item.itemId] = "Gross Price must be greater than 0";
      //   isValid = false;
      // }
    }

    // Validate Issue Price - always required if not renderIp
    if (!item.renderIp) {
      const ip = parseFloat(item.ip || '0') || 0;
      if (ip <= 0) {
        errors[item.itemId] = "Issue Price must be greater than 0";
        isValid = false;
      }
    }

    // Note: Cost Price is optional when Gross Price is set
    // If Cost Price is 0, that's acceptable
  });

  return { isValid, errors };
};

// Update handleSaveClick function
const handleSaveClick = () => {
  try {
    // Validate required fields
    if (!selectedSupplier) {
      toast.error("Please select a location");
      return;
    }

    if (!toDate) {
      toast.error("Please select a return date");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please add the items");
      return;
    }

    // Check if all items have quantity entered and quantity > 0
    const itemsWithoutQuantity = selectedItems.filter(item => {
      const quantity = item.quantity;
      return quantity === undefined || quantity === null || quantity <= 0;
    });

    if (itemsWithoutQuantity.length > 0) {
      toast.error(`Please add Qty greater than 0`);
      const errorMap: { [itemId: number]: string } = {};
      itemsWithoutQuantity.forEach(item => {
        // if (item.itemId) {
        //   errorMap[item.itemId] = "Qty must be greater than 0";
        // }
      });
      setValidationErrors(errorMap);
      return;
    }

    // Check if all price fields have values greater than 0
    const itemsWithZeroPrice = selectedItems.filter(item => {
      // Skip validation for renderGp/renderIp fields as they are read-only
      const hasInvalidGp = !item.renderGp && (parseFloat(item.gp || '0') || 0) <= 0;
      const hasInvalidCp = !item.renderGp && (parseFloat(item.cp || '0') || 0) <= 0;
      const hasInvalidIp = !item.renderIp && (parseFloat(item.ip || '0') || 0) <= 0;
      
      return hasInvalidGp || hasInvalidCp || hasInvalidIp;
    });

    if (itemsWithZeroPrice.length > 0) {
      const errorMap: { [itemId: number]: string } = {};
      itemsWithZeroPrice.forEach(item => {
        // if (item.itemId) {
        //   if (!item.renderGp && (parseFloat(item.gp || '0') || 0) <= 0) {
        //     errorMap[item.itemId] = "Gross Price must be greater than 0";
        //   } else if (!item.renderGp && (parseFloat(item.cp || '0') || 0) <= 0) {
        //     errorMap[item.itemId] = "Cost Price must be greater than 0";
        //   } else if (!item.renderIp && (parseFloat(item.ip || '0') || 0) <= 0) {
        //     errorMap[item.itemId] = "Issue Price must be greater than 0";
        //   }
        // }
      });
      setValidationErrors(errorMap);
      toast.error("Please Enter the Value");
      return;
    }

    // Validate all items with comprehensive validation
    const { isValid, errors } = validateAllItems();
    setValidationErrors(errors);
    
    if (!isValid) {
      toast.error("Please check all fields - values must be greater than 0");
      return;
    }

    // ALL VALIDATIONS PASSED - Show the modal
    setShowSaveModal(true);
  } catch (error) {
    setSessionExpired(true);
    console.error("Error in validation:", error);
    toast.error("An error occurred during validation");
  }
};

// Update handleConfirmSave to filter out invalid items before saving
const handleConfirmSave = async () => {
  // Close modal first
  setShowSaveModal(false);
  
  try {
    setSaving(true);
    setIsLoading(true);
      
    const token = localStorage.getItem("authToken");
    const entityId = localStorage.getItem('entity') || '';
    const userFk = parseInt(localStorage.getItem('userId') || '0');
    const stockPeriod = localStorage.getItem("stockPeriod");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }
    if (!stockPeriod) {
      toast.error("Stock period not found in localStorage");
      return;
    }

    // Format dates to yyyy-mm-dd
    const formattedPeriod = formatDateToYYYYMMDD(stockPeriod);
    const formattedReturnDate = formatDateToYYYYMMDD(toDate);

    // Validate each item and only include those with valid quantity and prices
    const subList = selectedItems
      .filter(item => {
        const quantity = item.quantity || 0;
        const gp = parseFloat(item.gp || '0') || 0;
        const cp = parseFloat(item.cp || '0') || 0;
        const ip = parseFloat(item.ip || '0') || 0;
        
        // Skip validation for renderGp/renderIp fields as they are read-only
        const isValidGp = item.renderGp || gp > 0;
        const isValidCp = item.renderGp || cp > 0;
        const isValidIp = item.renderIp || ip > 0;
        
        return quantity > 0 && isValidGp && isValidCp && isValidIp;
      })
      .map(item => {
        const packageId = item.teams && item.teams.length > 0 ? item.teams[0].text : '';
        
        // Find the original supplier item to get supplierId and expiryDate
        const originalItem = supplierItems.find(si => si.itemId === item.itemId);
        
        // Format expiryDate if available
        let formattedExpiryDate = null;
        if (originalItem?.expiryDate) {
          formattedExpiryDate = formatDateToYYYYMMDD(originalItem.expiryDate);
        }
        
        return {
          itemId: item.itemId,
          itemName: item.pname || item.itemName || '',
          packageId: packageId,
          quantity: item.quantity,
          gp: parseFloat(item.gp) || 0,
          cp: parseFloat(item.cp) || 0,
          ip02: parseFloat(item.ip) || 0,
          expiryDate: formattedExpiryDate,
          supplierId: originalItem?.supplierId || ''
        };
      });

    // Check if any items are valid for saving
    if (subList.length === 0) {
      toast.error("No valid items to save. Please ensure all items have Qty > 0, Gross Price > 0, Cost Price > 0, and Issue Price > 0.");
      setSaving(false);
      return;
    }

    // Check if all items passed validation
    if (subList.length < selectedItems.length) {
      toast.error(`${selectedItems.length - subList.length} item(s) were skipped due to invalid Qty or price values (must be > 0)`);
    }

    const saveData = {
      period: formattedPeriod,
      locationId: selectedSupplier.code,
      locationName: selectedSupplier.name,
      retrunDate: formattedReturnDate,
      entityId: entityId,
      userFk: userFk,
      subList: subList
    };

    console.log("Saving data:", JSON.stringify(saveData, null, 2));

    const response = await axios.post(
      "http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/saveReceiveItemToLocation",
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
      toast.success(`Items saved successfully! ${subList.length} item(s) saved.`);
      // Clear the form after successful save
      handleRefresh();
    } else {
      toast.error(`Save failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    setSessionExpired(true);
    console.error("Error saving items:", error);
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


  const handleSupplierSelect = (supplier: LocationType) => {
    setSelectedSupplier(supplier);
    setIsOpenSupplier(false);
    setSearchSupplier('');
    
    // Clear previous items and fetch new ones
    setSupplierItems([]);
    setModalSelectedItems(new Set());
    fetchSupplierItems(supplier.code);
  };

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
  
  const [, setData] = React.useState(basicTableData);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [openModal, setOpenModal] = useState(false);
    useEffect(() => {
    if (openModal) {
      setCurrentPage(1);
    }
  }, [searchItem, openModal]);

  // Update data when selectedItems changes
  useEffect(() => {
    setData(selectedItems);
  }, [selectedItems]);

  // FIXED: Updated the columns to remove onBlur and onKeyDown handlers
// Replace the defaultColumns definition with this updated version
// Replace the defaultColumns definition with this updated version
const defaultColumns = React.useMemo(() => [
  columnHelper.accessor("name", {
    cell: (info) => (
      <div className="flex items-center space-x-2 p-1">
        <div className="max-w-32">
          <h6 className="text-[11px] font-medium">{info.getValue()}</h6>
          <p className="text-[10px] break-words block">{info.row.original.pname}</p>
        </div>
      </div>
    ),
    header: () => (
      <div className="flex flex-col items-start">
        <span className="text-[12px] font-bold">Item Code</span>
        <span className="text-[9px] text-blue-100">ID</span>
      </div>
    ),
    id: 'itemCode',
  }),
  
  columnHelper.accessor("teams", {
    header: () => (
      <div className="flex flex-col items-start">
        <span className="text-[12px] font-bold">Package</span>
        <span className="text-[9px] text-blue-100">ID</span>
      </div>
    ),
    cell: (info) => (
      <div className="flex">
        {info.getValue().map((team) => (
          <div className="-ms-2" key={team.id}>
            <div>
              {team.text}
            </div>
          </div>
        ))}
      </div>
    ),
    id: 'teams',
  }),
  ...selectedDates.map((dateInfo: any) =>
    columnHelper.display({
      id: `date-${dateInfo.date}`,
      header: () => <div className="text-right">{dateInfo.day}</div>,
      cell: () => (
        <div className="text-right">
          <input
            type="text"
            defaultValue="0.000"
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
          />
        </div>
      ),
    })
  ),
  columnHelper.display({
    id: 'quantity',
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="text-[12px] font-bold">QTY</span>
      
      </div>
    ),
    cell: (info) => {
      const itemId = info.row.original.itemId!;
      const hasError = validationErrors[itemId];
      
      const currentQuantity = info.row.original.quantity || 0;
      
      const [localQuantity, setLocalQuantity] = useState(currentQuantity);
      const [isTyping, setIsTyping] = useState(false);
      
      useEffect(() => {
        if (!isTyping) {
          setLocalQuantity(currentQuantity);
        }
      }, [currentQuantity, isTyping]);
      
      return (
        <div className="flex justify-end">
          <input
            type="number"
            value={formatValue(localQuantity)}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              setLocalQuantity(newValue);
              setIsTyping(true);
              
              if (quantityTimeoutRef.current.has(itemId)) {
                clearTimeout(quantityTimeoutRef.current.get(itemId));
              }
              
              const timeout = setTimeout(() => {
                handleQuantityChange(itemId, newValue);
                setIsTyping(false);
              }, 300);
              
              quantityTimeoutRef.current.set(itemId, timeout);
            }}
            onBlur={() => {
              setIsTyping(false);
              if (quantityTimeoutRef.current.has(itemId)) {
                clearTimeout(quantityTimeoutRef.current.get(itemId));
              }
              handleQuantityChange(itemId, localQuantity);
            }}
            className={`w-20 px-2 py-1 border rounded text-sm text-right focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              hasError 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-blue-600 focus:border-blue-500 focus:ring-blue-500'
            }`}
            min="0"
            max="999999"
            step="0.001"
          />
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'gp',
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="text-[12px] font-bold">Gross</span>
        <span className="text-[9px] text-blue-100">Price</span>
      </div>
    ),
    cell: (info) => {
      const renderGp = info.row.original.renderGp || false;
      const gpValue = parseFloat(info.row.original.gp || '0') || 0;
      const itemId = info.row.original.itemId!;
      
      if (renderGp) {
        return (
          <div className="flex justify-end">
            <div className="w-20 px-2 text-[12px] py-1 text-sm text-right bg-gray-100 text-gray-500 rounded">
            {formatValue(gpValue)}
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex justify-end">
          <input
            type="number"
            value={formatValue(gpValue)}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              handleGPChange(itemId, newValue);
            }}
            className="w-20 px-2 py-1 border border-blue-600 rounded text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:border-blue-400"
            min="0"
            max="999999"
            step="0.001"
            placeholder="Enter GP"
            title="Enter Gross Price - Cost Price will auto-update"
          />
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'cp',
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="text-[12px] font-bold">Cost</span>
        <span className="text-[9px] text-blue-100">Price</span>
      </div>
    ),
    cell: (info) => {
      const renderGp = info.row.original.renderGp || false;
      const cpValue = parseFloat(info.row.original.cp || '0') || 0;
      const gpValue = parseFloat(info.row.original.gp || '0') || 0;
      const itemId = info.row.original.itemId!;
      
      if (renderGp) {
        return (
          <div className="flex justify-end">
            <div className="w-20 px-2 text-[12px] py-1 text-sm text-right bg-gray-100 text-gray-500 rounded">
                 {formatValue(cpValue)}
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex justify-end">
          <input
            type="number"
            value={formatValue(cpValue)}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              handleCPChange(itemId, newValue);
            }}
            className={`w-20 px-2 py-1 border rounded text-sm text-right focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              gpValue <= 0 && cpValue > 0
                ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50'
                : 'border-blue-600 focus:border-blue-500 focus:ring-blue-500'
            } hover:border-blue-400`}
            min="0"
            max="999999"
            step="0.001"
            placeholder={gpValue <= 0 ? "Enter GP first" : "Enter CP"}
            disabled={gpValue <= 0}
            title={gpValue <= 0 ? "Please enter Gross Price first" : "Enter Cost Price"}
            readOnly 
          />
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'ip',
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="text-[12px] font-bold">Issue</span>
        <span className="text-[9px] text-blue-100">Price</span>
      </div>
    ),
    cell: (info) => {
      const renderIp = info.row.original.renderIp || false;
      const ipValue = parseFloat(info.row.original.ip || '0') || 0;
      const itemId = info.row.original.itemId!;
      
      if (renderIp) {
        return (
          <div className="flex justify-end">
            <div className="w-20 px-2 text-[12px] py-1 text-sm text-right bg-gray-100 text-gray-500 rounded">
              {formatValue(ipValue)}
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex justify-end">
          <input
            type="number"
            value={formatValue(ipValue)}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              handleIPChange(itemId, newValue);
            }}
            className="w-20 px-2 py-1 border  border-blue-600 rounded text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:border-blue-400"
            min="0"
            max="999999"
            step="0.001"
            placeholder="Enter IP"
            title="Enter Issue Price - Independent field"
          />
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'ttlGrossPrice',
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="text-[12px] font-bold">Ttl Gross</span>
        <span className="text-[9px] text-blue-100">Price</span>
      </div>
    ),
    cell: (info) => (
      <div className="text-right">
         <h6 className="text-sm font- text-[12px] ml-12">{formatValue(info.row.original.ttlGrossPrice)}</h6>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'ttlCostPrice',
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="text-[12px] font-bold">Ttl Cost</span>
        <span className="text-[9px] text-blue-100">Price</span>
      </div>
    ),
    cell: (info) => (
      <div className="text-right">
           <h6 className="text-sm font- text-[12px] ml-12">{formatValue(info.row.original.ttlCostPrice)}</h6>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'ttlIssuePrice',
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="text-[12px] font-bold">Ttl Issue</span>
        <span className="text-[9px] text-blue-100">Price</span>
      </div>
    ),
    cell: (info) => (
      <div className="text-right">
     <h6 className="text-sm font- text-[12px] ml-12">{formatValue(info.row.original.ttlIssuePrice)}</h6>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'remove',
    header: () => (
      <div className="text-right">
        <span className="text-[12px] font-bold">Remove</span>
      </div>
    ),
    cell: (info) => (
      <div className="flex justify-end">
        <Button
          size="xs"
          color="failure"
          onClick={() => {
            const itemId = info.row.original.itemId!;
            setSelectedItems(prev => prev.filter(item => item.itemId !== itemId));
            setAddedItemIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(itemId);
              return newSet;
            });
            toast.success("Item removed successfully");
          }}
          className="px-2 py-1 text-xs sm:text-sm"
        >
          <HiTrash className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    ),
  }),
], [selectedDates, validationErrors]);

  const columnHelper1 = createColumnHelper<typeof modalTableData[0]>();

 const defaultColumns1 = React.useMemo(() => [
  columnHelper1.display({
    id: 'select',
    header: () => (
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={modalSelectedItems.size === paginatedFilteredItems.filter(item => !addedItemIds.has(item.itemId)).length && paginatedFilteredItems.length > 0}
          onChange={handleSelectAll}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>
    ),
    cell: (info) => {
      const itemId = info.row.original.itemId!;
      const isAlreadyAdded = addedItemIds.has(itemId);
      
      return (
        <div className="flex items-center">
          {isAlreadyAdded ? (
            <span className="text-green-500 text-sm">✓</span>
          ) : (
            <input
              type="checkbox"
              checked={modalSelectedItems.has(itemId)}
              onChange={() => handleItemSelect(itemId)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
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
    cell: (info) => <h6 className="text-sm sm:text-">{info.row.original.itemId}</h6>,
  }),
  
  columnHelper1.display({
    id: 'itemName',
    header: () => <span>Item Name</span>,
    cell: (info) => <h6 className="text-sm sm:text-">{info.row.original.itemName}</h6>,
  }),
  
  columnHelper1.display({
    id: 'packageId',
    header: () => <span>Package Id</span>,
    cell: (info) => (
      <h6 className="text-sm sm:text-">
        {info.row.original.packageId && info.row.original.packageId.length > 0 
          ? info.row.original.packageId[0] 
          : 'N/A'}
      </h6>
    ),
  }),
  
  columnHelper1.display({
    id: 'gp',
    header: () => <span>GP</span>,
    cell: (info) => <h6 className="text-sm sm:text- ml-4">{formatValue(info.row.original.gp || 0)}</h6>,
  }),
   
  columnHelper1.display({
    id: 'cp',
    header: () => <span>CP</span>,
    cell: (info) => <h6 className="text-sm sm:text- ml-4">{formatValue(info.row.original.cp || 0)}</h6>,
  }),
   
  columnHelper1.display({
    id: 'ip',
    header: () => <span>IP</span>,
    cell: (info) => <h6 className="text-sm sm:text- ml-4">{formatValue(info.row.original.ip02 || 0)}</h6>,
  }),
  
  columnHelper1.display({
    id: 'quantity',
    header: () => <span>Quantity</span>,
    cell: (info) => <h6 className="text-sm sm:text- ml-4">{formatValue(info.row.original.quantity || 0)}</h6>,
  }),
  
  columnHelper1.display({
    id: 'supplierId',
    header: () => <span>Supplier ID</span>,
    cell: (info) => <h6 className="text-sm sm:text-">{info.row.original.supplierId || 'N/A'}</h6>,
  }),
], [modalSelectedItems, paginatedFilteredItems, addedItemIds, formatValue]);
  
  const table = useReactTable({
    data: filteredTableData, // Use filtered data here
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });
  
  // Create table data for modal from paginatedFilteredItems
   const modalTableData = React.useMemo(() => {
    return paginatedFilteredItems.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      packageId: item.packageId,
      teams: item.packageId ? item.packageId.map((pkg: string, index: number) => ({
        id: (index + 1).toString(),
        color: "primary",
        text: pkg
      })) : [],
      gp: item.gp,
      cp: item.cp,
      ip02: item.ip02,
      quantity: item.quantity,
      supplierId: item.supplierId,
      expiryDate: item.expiryDate // Include expiryDate in modal data
    }));
  }, [paginatedFilteredItems]);


  const table1 = useReactTable({
    data: modalTableData,
    columns: defaultColumns1,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
    handleRefresh()
  };

let content;
if (showTable) {
  content = <RecItemTable onBack={handleAddClick} />;
} else {
  content = (
    <div className="space-y-4 w-full max-w-[1050px] mx-auto px-2 sm:px-3 md:px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-3 sm:p-4 md:p-5">
        {/* Header Title */}
   <div className="flex flex-col sm:flex-row  items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-4 pb-2 dark:border-gray-700">
  {/* Period Card */}
  <Card className="bg-purple-50 border-l-8 border-purple-500 shadow-sm p-1.5 sm:p-2 md:p-3 h-8 sm:h-9 md:h-10 w-full sm:w-auto min-w-[120px] sm:min-w-[130px] md:w-70">
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
      <div className="p-1 sm:p-1.5 md:p-2 bg-purple-500 rounded-lg">
        <FaReceipt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-sm font-medium text-black truncate dark:text-white">
          Return ID: <span className="font-bold text-black mt-0.5 truncate dark:text-white"># Auto</span>
        </p>
      </div>
    </div>
  </Card>
  
  {/* Period Card */}
  <Card className="bg-blue-50 border-l-8 border-blue-500 shadow-sm p-1.5 sm:p-2 md:p-3 h-8 sm:h-9 md:h-10 w-full sm:w-auto min-w-[120px] sm:min-w-[130px] md:w-70">
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
      <div className="p-1 sm:p-1.5 md:p-2 bg-blue-500 rounded-lg">
        <FaCalendarAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-sm font-medium text-black truncate dark:text-white">
          Period: <span className="font-bold text-black mt-0.5 truncate dark:text-white">
            {formatPurchasePeriod(stockPeriod || '')}
          </span>
        </p>
      </div>
    </div>
  </Card>

  <Card className="border-l-8 border-amber-500 shadow-sm p-1.5 sm:p-2 h-8 sm:h-9 w-full sm:w-auto min-w-[80px] sm:min-w-[100px] md:w-70">
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="p-1 sm:p-1.5 bg-amber-500 rounded-lg">
        <FaBoxOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
      </div>
      <div>
        <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white">
          Items: <span className="font-bold dark:text-white">{selectedItems.length}</span>
        </p>
      </div>
    </div>
  </Card>
</div>
        <Card className="flex-1 h-auto sm:h-20 md:h-48 lg:h-18 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4 p-2 sm:p-3">
            {/* Location Icon */}
            <div className="p-1 sm:p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
              <FaMapMarkerAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400" />
            </div>
            
            {/* Location Dropdown - Expanded */}
            <div ref={supplierDropdownRef} className="relative flex-1 w-full lg:w-auto min-w-[200px] sm:min-w-[250px]">
              <div
                className={`border rounded-md h-8 sm:h-9 flex items-center justify-between px-2 sm:px-3 cursor-pointer transition-all duration-200 text-xs sm:text-sm
                  ${selectedSupplier 
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                onClick={() => setIsOpenSupplier(!isOpenSupplier)}
              >
                <span className={`text-xs sm:text-sm font-medium truncate ${
                  selectedSupplier 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {selectedSupplier 
                    ? `${selectedSupplier.code} - ${selectedSupplier.name}` 
                    : 'Please select a location'}
                </span>
                <svg
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transform transition-transform duration-200 ${
                    isOpenSupplier ? 'rotate-180' : ''
                  } text-gray-500 dark:text-gray-400 flex-shrink-0`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {isOpenSupplier && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-1 sm:p-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="relative">
                      <FaSearch className="absolute left-1.5 sm:left-2 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search ${locations.length} locations...`}
                        value={searchSupplier}
                        onChange={(e) => setSearchSupplier(e.target.value)}
                        className="w-full pl-6 sm:pl-7 pr-1.5 sm:pr-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-40 sm:max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {/* Please Select The Location */}
                    <div
                      className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setIsOpenSupplier(false);
                        setSelectedSupplier(null);
                        setSearchSupplier('');
                      }}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">📌</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300">Please Select The Location</span>
                      </div>
                    </div>

                    {/* Location Options */}
                    {isLoadingLocations ? (
                      <div className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-xs text-gray-500">Loading...</div>
                    ) : filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier, index) => (
                        <div
                          key={supplier.pk}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                          onClick={() => handleSupplierSelect(supplier)}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-medium ${
                              selectedSupplier?.pk === supplier.pk
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 text-gray-700 dark:text-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] sm:text-xs font-semibold text-gray-900 dark:text-gray-100">
                                {supplier.code}
                              </div>
                              <div className="text-[8px] sm:text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                {supplier.name}
                              </div>
                            </div>
                            {selectedSupplier?.pk === supplier.pk && (
                              <span className="text-blue-500 dark:text-blue-400 text-[10px] sm:text-xs">✓</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                        <div className="text-lg sm:text-xl mb-1">🔍</div>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">No locations found</p>
                        <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Try adjusting your search</p>
                      </div>
                    )}
                  </div>

                  {/* Footer with count */}
                  {filteredSuppliers.length > 0 && (
                    <div className="p-1 sm:p-1.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 text-center">
                        {filteredSuppliers.length} location{filteredSuppliers.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Return Date Calendar */}
              <div className="w-full sm:w-[220px] md:w-[250px] lg:w-[280px] flex-shrink-0">
                <CalendarStockReceive
                  id="toDate"
                  label="Return Date"
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
                  if (!selectedSupplier) {
                    toast.error("Please select a location");
                    return;
                  }
                  setOpenModal(true);
                }} 
                className={`
                  whitespace-nowrap rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium shadow-sm flex-shrink-0 w-full sm:w-auto
                  transition-all duration-200 transform active:scale-95
                  ${selectedSupplier 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }
                `}
                color="primary" 
                disabled={!selectedSupplier || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span className="text-[10px] sm:text-xs">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FaBoxOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs">Select Items</span>
                    {selectedSupplier && (
                      <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 bg-white/20 rounded-full text-[8px] sm:text-xs">
                        {supplierItems.length}
                      </span>
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Card>
        
        <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3">
       <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm">
  <span className="text-black font-medium dark:text-gray-200">Total Cost:</span>
  <span className="text-blue-800 dark:text-gray-200 font-bold">G: {formatValue(totals.ttlGrossPrice)}</span>
  <span className="text-green-800 dark:text-gray-200 font-bold">C: {formatValue(totals.ttlCostPrice)}</span>
  <span className="text-pink-800 dark:text-gray-200 font-bold">I: {formatValue(totals.ttlIssuePrice)}</span>
</div>
            
            <div className="relative w-full lg:w-64 xl:w-72">
              <input
                type="text"
                placeholder={`Search ${selectedItems.length} items...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-3 pt-0">
          <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[180px] sm:max-h-[200px] md:max-h-[220px] lg:max-h-[230px] overflow-y-auto">
                <div className="min-w-[600px] md:min-w-[700px] lg:min-w-[800px] xl:min-w-full">
                  <table className="w-full">
                    <thead className="bg-blue-600 dark:bg-blue-800 sticky top-0 z-10">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-1 sm:px-1.5 py-1 text-left text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-white uppercase whitespace-nowrap"
                              style={{ width: header.getSize() ? `${header.getSize()}px` : 'auto' }}
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
                              <td key={cell.id} className="px-1 sm:px-1.5 py-1">
                                <div className="flex items-center min-h-[20px] sm:min-h-[24px]">
                                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-800 dark:text-gray-300">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </span>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={table.getAllColumns().length} className="px-2 py-2 sm:py-3 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="p-0.5 sm:p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-0.5 sm:mb-1">
                                <FaBoxOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 dark:text-blue-500" />
                              </div>
                              <h4 className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                                {selectedItems.length === 0 ? 'No Items Added' : 'No Matching Records'}
                              </h4>
                              <p className="text-gray-500 dark:text-gray-400 text-[7px] sm:text-[8px] md:text-[10px] max-w-md">
                                {selectedItems.length === 0
                                  ? 'Click "Select Items" button to add items to the list.'
                                  : `No items found matching "${search}"`}
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
        </div>

        {/* Modal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 dark:border-gray-700">
          <Modal
            show={openModal}
            onClose={() => {
              setSearchItem("");
              setCurrentPage(1);
              setOpenModal(false);
            }}
            size="6xl"
          >
            <ModalHeader className="border-b border-gray-200 dark:border-gray-700 p-1.5 sm:p-2 bg-white dark:bg-gray-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-[10px] sm:text-xs">
                  <FaMapMarkerAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-[11px] sm:text-xs md:text-sm">
                    {selectedSupplier?.name || "Select Items"}
                  </h3>
                  <span className="px-1 sm:px-1.5 md:px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-black dark:text-blue-300 rounded-full text-[10px] sm:text-xs md:text-sm font-bold">
                    Total: {filteredItems.length}
                  </span>
                </div>
                <div className="flex space-x-1.5 sm:space-x-2 w-full sm:w-auto justify-end">
                  <Button
                    size="xs"
                    onClick={handleAddItems}
                    disabled={modalSelectedItems.size === 0}
                    className="p-1.5 sm:p-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
                    title="Add selected items"
                  >
                    <HiPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </ModalHeader>
            
            <ModalBody className="p-2 sm:p-3 bg-white dark:bg-gray-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Selected Items:
                  </span>
                  <span className="px-1 sm:px-1.5 md:px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs rounded-md font-bold">
                    {modalSelectedItems.size}
                  </span>
                  {addedItemIds.size > 0 && (
                    <>
                      <span className="text-gray-400 dark:text-gray-500">|</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Already Added: <span className="font-bold text-amber-600 dark:text-amber-400">{addedItemIds.size}</span>
                      </span>
                    </>
                  )}
                </div>
                <div className="relative w-full sm:w-48 md:w-56">
                  <HiSearch className="absolute left-1.5 sm:left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchItem}
                    onChange={(e) => {
                      setSearchItem(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-6 sm:pl-7 pr-1.5 sm:pr-2 py-1 sm:py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-[10px] sm:text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150"
                    autoFocus
                  />
                </div>
              </div>
              
              <div
                className="border border-gray-200 dark:border-gray-700 overflow-hidden focus:outline-none"
                tabIndex={0}
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[700px] md:min-w-[800px] lg:min-w-full">
                    <table className="min-w-full table-fixed">
                      <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                        {table1.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-semibold text-white uppercase tracking-wider"
                                style={{
                                  minWidth:
                                    header.id === "select"
                                      ? "28px"
                                      : header.id === "itemId"
                                      ? "60px"
                                      : header.id === "itemName"
                                      ? "150px"
                                      : header.id === "packageId"
                                      ? "80px"
                                      : header.id === "gp" || header.id === "cp" || header.id === "ip"
                                      ? "50px"
                                      : header.id === "quantity"
                                      ? "60px"
                                      : "60px",
                                }}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {table1.getRowModel().rows.length > 0 ? (
                          table1.getRowModel().rows.map((row, idx) => {
                            const absoluteIndex = (currentPage - 1) * pageSize + idx;
                            const itemId = row.original.itemId;
                            const isAlreadyAdded = addedItemIds.has(itemId);
                            
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
                                    handleItemSelect(itemId);
                                  }
                                }}
                                className={`
                                  bg-white dark:bg-gray-800
                                  hover:bg-gray-50 dark:hover:bg-gray-700
                                  cursor-pointer text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs
                                  ${row.original.isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                                  ${isAlreadyAdded ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700/50" : ""}
                                  ${absoluteIndex % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-700/30"}
                                  transition-colors duration-150
                                `}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <td
                                    key={cell.id}
                                    className="px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-800 dark:text-gray-300"
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                ))}
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={table1.getAllColumns().length}
                              className="px-2 sm:px-3 py-3 sm:py-4 text-center text-gray-500 dark:text-gray-400 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs"
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
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
              
              {filteredItems.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 sm:mt-3 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
                  <div className="text-gray-600 dark:text-gray-300">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredItems.length)} of{" "}
                    {filteredItems.length} items
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        disabled={currentPage === 1}
                        className="px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 border rounded flex items-center gap-0.5 sm:gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[8px] sm:text-[9px] md:text-[10px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                      >
                        <FaChevronLeft className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> Prev
                      </button>
                      <span className="px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[8px] sm:text-[9px] md:text-[10px] font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        disabled={currentPage >= totalPages}
                        className="px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 border rounded flex items-center gap-0.5 sm:gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[8px] sm:text-[9px] md:text-[10px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                      >
                        Next <FaChevronRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
          </Modal>
        </div>
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
    
    <div className="flex flex-col mt-2 sm:mt-3 md:mt-4 w-full px-2 sm:px-3 md:px-4">
      <div className="flex w-full justify-end sm:justify-start gap-2 sm:gap-3 mb-2">
        {showTable ? (
          <div className="flex flex-wrap gap-2 mt-2"></div>
        ) : (
          <div className="flex flex-col w-full items-start gap-2 sm:gap-3">
            <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-2 mt-2 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Left side - Heading and Tooltip */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-xl text-indigo-700 whitespace-nowrap">
                    Receive Item From Location
                  </h1>
                  <Tooltip
                    content={
                      <div className="text-[10px] sm:text-xs max-w-xs w-32 sm:w-40">
                        <p className="font-semibold mb-0.5 sm:mb-1">Quick Steps:</p>
                        <ol className="list-decimal list-inside space-y-0.5 sm:space-y-1">
                          <li>Review items</li>
                          <li>Click save and confirm</li>
                        </ol>
                      </div>
                    }
                    placement="bottom"
                    className="dark:bg-gray-800 dark:text-white z-50"
                  >
                    <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      <HiInformationCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </Tooltip>
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex gap-1 sm:gap-2 items-center ml-auto">
                  <Tooltip content="Save" placement="bottom">
                    <Button
                      color="success"
                      size="md"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      onClick={handleSaveClick}
                      disabled={saving || isLoading}
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                      ) : (
                        <FaSave className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      )}
                    </Button>
                  </Tooltip>

                  <Tooltip content="Refresh" placement="bottom">
                    <Button
                      color="warning"
                      size="md"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                      onClick={handleRefresh}
                    >
                      <HiRefresh className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Tooltip>

                  <Tooltip content="List" placement="bottom">
                    <Button
                      color="primary"
                      size="md"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      onClick={handleListClick}
                    >
                      <HiViewList className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Card>    
          </div>
        )}
      </div>
    </div>

    {content}

    {showSaveModal && (
      <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)} size="md">
        <ModalHeader className="text-xs sm:text-sm md:text-base">Confirm Save</ModalHeader>
        <ModalBody>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-500 mb-2 sm:mb-3 md:mb-4">
              <FaSave />
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to save this Receive Item From Location record?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            color="success"
            onClick={handleConfirmSave}
            disabled={saving}
            className="min-w-[70px] sm:min-w-[80px] md:min-w-[100px] text-[9px] sm:text-[10px] md:text-xs lg:text-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 border-b-2 border-white mr-0.5 sm:mr-1 md:mr-2"></div>
                <span className="text-[9px] sm:text-[10px] md:text-xs">Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowSaveModal(false)}
            disabled={saving}
            className="min-w-[70px] sm:min-w-[80px] md:min-w-[100px] text-[9px] sm:text-[10px] md:text-xs lg:text-sm"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    )}

    {sessionExpired && <SessionModal/>}

    {isLoading && (
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg shadow-xl flex items-center gap-2 sm:gap-3">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm md:text-base font-medium">Loading...</span>
        </div>
      </div>
    )}
  </>
);
};

export default StockReceiveItemFromLocation;