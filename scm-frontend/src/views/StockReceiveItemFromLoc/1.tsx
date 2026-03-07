import { Badge, Label } from "flowbite-react";
import { useState, useEffect, useRef } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { HiRefresh, HiSearch, HiViewList } from 'react-icons/hi';
import React from "react";
import axios from "axios";
import { FaBoxOpen, FaCalendarAlt, FaMapMarkerAlt, FaReceipt, FaSave, FaSearch, FaTruck } from "react-icons/fa";
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
// import { s } from "node_modules/react-router/dist/development/context-DSyS5mLj.d.mts";

const basicTableData: TableTypeDense[] = [];

const columnHelper = createColumnHelper<TableTypeDense>();

const StockReceiveItemFromLocation = () => {
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
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
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
  // Fetch locations from API on component mount
 useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
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
      setLoadingLocations(false);
    }
  };

  // Fetch items from API when supplier is selected
  const fetchSupplierItems = async (supplierCode: string) => {
    try {
      setLoading(true);
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
      setLoading(false);
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
    quantityTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    gpTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    cpTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    ipTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    
    quantityTimeoutRef.current.clear();
    gpTimeoutRef.current.clear();
    cpTimeoutRef.current.clear();
    ipTimeoutRef.current.clear();
    
    // toast.success("Form refreshed successfully");
  };

  const handleSelectAll = () => {
    if (modalSelectedItems.size === supplierItems.length - addedItemIds.size) {
      setModalSelectedItems(new Set());
    } else {
      // Only select items that aren't already added to the main table
      const selectableItems = supplierItems.filter(item => !addedItemIds.has(item.itemId));
      const allSelectableItemIds = new Set(selectableItems.map(item => item.itemId));
      setModalSelectedItems(allSelectableItemIds);
    }
  };

  // Handle individual item selection in modal
  const handleItemSelect = (itemId: number) => {
    const newSelected = new Set(modalSelectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setModalSelectedItems(newSelected);
  };

  // Filter items based on search
  const filteredItems = supplierItems.filter(item => 
    item.itemName?.toLowerCase().includes(searchItem.toLowerCase()) ||
    item.itemId?.toString().includes(searchItem)
  );

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


  // Handle quantity change with debouncing
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

  // Clear existing timeout for this item
  if (quantityTimeoutRef.current.has(itemId)) {
    clearTimeout(quantityTimeoutRef.current.get(itemId));
  }
  
  // Set new timeout
  const timeout = setTimeout(() => {
    setSelectedItems(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const gp = parseFloat(item.gp || '0') || 0;
        const cp = parseFloat(item.cp || '0') || 0;
        const ip = parseFloat(item.ip || '0') || 0;
        
        // Calculate totals - if quantity is 0, totals should be 0
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
    quantityTimeoutRef.current.delete(itemId);
  }, 0); // 300ms debounce
  
  quantityTimeoutRef.current.set(itemId, timeout);
};

// 2. Update handleGPChange function:
const handleGPChange = (itemId: number, newGP: number) => {
  if (gpTimeoutRef.current.has(itemId)) {
    clearTimeout(gpTimeoutRef.current.get(itemId));
  }
  
  const timeout = setTimeout(() => {
    setSelectedItems(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const quantity = item.quantity || 0;
        const cp = parseFloat(item.cp || '0') || 0;
        const ip = parseFloat(item.ip || '0') || 0;
        
        // Calculate totals
        const ttlGrossPrice = quantity * newGP;
        const ttlCostPrice = quantity * cp;
        const ttlIssuePrice = quantity * ip;
        
        return {
          ...item,
          gp: newGP.toFixed(3),
          ttlGrossPrice: ttlGrossPrice.toFixed(3),
          ttlCostPrice: ttlCostPrice.toFixed(3),
          ttlIssuePrice: ttlIssuePrice.toFixed(3)
        };
      }
      return item;
    }));
    gpTimeoutRef.current.delete(itemId);
  }, 0);
  
  gpTimeoutRef.current.set(itemId, timeout);
};

// 3. Update handleCPChange function:
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
        
        // Calculate totals
        const ttlGrossPrice = quantity * gp;
        const ttlCostPrice = quantity * newCP;
        const ttlIssuePrice = quantity * ip;
        
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

// 4. Update handleIPChange function:
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
        
        // Calculate totals
        const ttlGrossPrice = quantity * gp;
        const ttlCostPrice = quantity * cp;
        const ttlIssuePrice = quantity * newIP;
        
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

// 5. Update the calculation in handleAddItems function:
const handleAddItems = () => {
  // Get selected items from ALL supplier items, not just filtered ones
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
    const cp = item.cp || 0;
    const ip = item.ip02 || 0;
    
    // Calculate totals - if quantity is 0, totals should be 0
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
      cp: cp.toFixed(3),
      ip: ip.toFixed(3),
      ttlGrossPrice: ttlGrossPrice.toFixed(3), // Use calculated value
      ttlCostPrice: ttlCostPrice.toFixed(3),   // Use calculated value
      ttlIssuePrice: ttlIssuePrice.toFixed(3), // Use calculated value
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
      expiryDate: item.expiryDate // Include expiryDate from API
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
    if (quantity <= 0) {
      errors[item.itemId] = "Qty must be greater than 0";
      isValid = false;
      return; // Skip further validation for this item if quantity is invalid
    }

    // Validate Gross Price - only if not renderGp
    if (!item.renderGp) {
      const gp = parseFloat(item.gp || '0') || 0;
      const gpError = validatePrice(gp, "Gross Price");
      if (gpError) {
        errors[item.itemId] = gpError;
        isValid = false;
      }
    }

    // Validate Cost Price - only if not renderGp
    if (!item.renderGp) {
      const cp = parseFloat(item.cp || '0') || 0;
      const cpError = validatePrice(cp, "Cost Price");
      if (cpError) {
        errors[item.itemId] = cpError;
        isValid = false;
      }
    }

    // Validate Issue Price - only if not renderIp
    if (!item.renderIp) {
      const ip = parseFloat(item.ip || '0') || 0;
      const ipError = validatePrice(ip, "Issue Price");
      if (ipError) {
        errors[item.itemId] = ipError;
        isValid = false;
      }
    }
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
        if (item.itemId) {
          errorMap[item.itemId] = "Qty must be greater than 0";
        }
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
        if (item.itemId) {
          if (!item.renderGp && (parseFloat(item.gp || '0') || 0) <= 0) {
            errorMap[item.itemId] = "Gross Price must be greater than 0";
          } else if (!item.renderGp && (parseFloat(item.cp || '0') || 0) <= 0) {
            errorMap[item.itemId] = "Cost Price must be greater than 0";
          } else if (!item.renderIp && (parseFloat(item.ip || '0') || 0) <= 0) {
            errorMap[item.itemId] = "Issue Price must be greater than 0";
          }
        }
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
      toast.warning(`${selectedItems.length - subList.length} item(s) were skipped due to invalid Qty or price values (must be > 0)`);
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

  // Update data when selectedItems changes
  useEffect(() => {
    setData(selectedItems);
  }, [selectedItems]);

  // FIXED: Updated the columns to remove onBlur and onKeyDown handlers
  const defaultColumns = React.useMemo(() => [
    columnHelper.accessor("name", {
      cell: (info) => (
        <div className="flex items-center space-x-2 p-1">
          <div className="truncate max-w-32">
            <h6 className="text-sm font-medium">{info.getValue()}</h6>
            <p className="text-xs">{info.row.original.pname}</p>
          </div>
        </div>
      ),
      header: () => <span>Item Code</span>,
      id: 'itemCode',
    }),
   
    columnHelper.accessor("teams", {
      header: () => <span>Package Id</span>,
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
        header: () => <span>{dateInfo.day}</span>,
        // FIXED: Removed onBlur and onKeyDown
        cell: () => (
          <input
            type="text"
            defaultValue="0.000"
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
          />
        ),
      })
    ),
   columnHelper.display({
      id: 'quantity',
      header: () => <span>QTY</span>,
      cell: (info) => {
        const quantity = info.row.original.quantity || 0;
        const itemId = info.row.original.itemId!;
        const hasError = validationErrors[itemId];
        
        return (
          <div className="flex flex-col">
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value) || 0;
                handleQuantityChange(itemId, newValue);
              }}
              className={`w-20 px-2 py-1 border rounded text-sm text-right focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                hasError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              min="0"
              max="999999"
              step="0.001"
            />
          
          </div>
        );
      },
    }),
    // FIXED: Updated the GP column - removed onBlur and onKeyDown
    columnHelper.display({
      id: 'gp',
      header: () => <span>Gross Price</span>,
      cell: (info) => {
        const renderGp = info.row.original.renderGp || false;
        const gpValue = parseFloat(info.row.original.gp || '0') || 0;
        const itemId = info.row.original.itemId!;
        
        if (renderGp) {
          return (
            <div className="w-20 px-2 py-1 text-sm text-right bg-gray-100 text-gray-500">
              {gpValue.toFixed(3)}
            </div>
          );
        }
        
        return (
          <input
            type="number"
            value={gpValue}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              handleGPChange(itemId, newValue);
            }}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="999999"
            step="0.001"
          />
        );
      },
    }),

    // FIXED: Updated the CP column - removed onBlur and onKeyDown
    columnHelper.display({
      id: 'cp',
      header: () => <span>Cost Price</span>,
      cell: (info) => {
        const renderGp = info.row.original.renderGp || false;
        const cpValue = parseFloat(info.row.original.cp || '0') || 0;
        const itemId = info.row.original.itemId!;
        
        if (renderGp) {
          return (
            <div className="w-20 px-2 py-1 text-sm text-right bg-gray-100 text-gray-500">
              {cpValue.toFixed(3)}
            </div>
          );
        }
        
        return (
          <input
            type="number"
            value={cpValue}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              handleCPChange(itemId, newValue);
            }}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="999999"
            step="0.001"
          />
        );
      },
    }),

    // FIXED: Updated the IP column - removed onBlur and onKeyDown
    columnHelper.display({
      id: 'ip',
      header: () => <span>Issue Price</span>,
      cell: (info) => {
        const renderIp = info.row.original.renderIp || false;
        const ipValue = parseFloat(info.row.original.ip || '0') || 0;
        const itemId = info.row.original.itemId!;
        
        if (renderIp) {
          return (
            <div className="w-20 px-2 py-1 text-sm text-right bg-gray-100 text-gray-500">
              {ipValue.toFixed(3)}
            </div>
          );
        }
        
        return (
          <input
            type="number"
            value={ipValue}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              handleIPChange(itemId, newValue);
            }}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="999999"
            step="0.001"
          />
        );
      },
    }),
    columnHelper.display({
      id: 'ttlGrossPrice',
      header: () => <span>Ttl Gross Price</span>,
      cell: (info) => (
        <h6 className="text-sm font-medium">{info.row.original.ttlGrossPrice}</h6>
      ),
    }),
    columnHelper.display({
      id: 'ttlCostPrice',
      header: () => <span>Ttl Cost Price</span>,
      cell: (info) => (
        <h6 className="text-sm font-medium">{info.row.original.ttlCostPrice}</h6>
      ),
    }),
    columnHelper.display({
      id: 'ttlIssuePrice',
      header: () => <span>Ttl Issue Price</span>,
      cell: (info) => (
        <h6 className="text-sm font-medium">{info.row.original.ttlIssuePrice}</h6>
      ),
    }),
    columnHelper.display({
      id: 'remove',
      header: () => <span>Remove</span>,
      cell: (info) => (
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
          Remove
        </Button>
      ),
    }),
  ], [selectedDates]);

  const columnHelper1 = createColumnHelper<typeof modalTableData[0]>();

  const defaultColumns1 = React.useMemo(() => [
    columnHelper1.display({
      id: 'select',
      header: () => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={modalSelectedItems.size === (filteredItems.length - addedItemIds.size) && filteredItems.length > 0}
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
              <span className="text-green-500">✓</span>
            ) : (
              <input
                type="checkbox"
                checked={modalSelectedItems.has(itemId)}
                onChange={() => handleItemSelect(itemId)}
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
      cell: (info) => <h6 className="text-sm sm:text-base">{info.row.original.itemId}</h6>,
    }),
    
    columnHelper1.display({
      id: 'itemName',
      header: () => <span>Item Name</span>,
      cell: (info) => <h6 className="text-sm sm:text-base">{info.row.original.itemName}</h6>,
    }),
    
    columnHelper1.display({
      id: 'packageId',
      header: () => <span>Package Id</span>,
      cell: (info) => (
        <h6 className="text-sm sm:text-base">
          {info.row.original.packageId && info.row.original.packageId.length > 0 
            ? info.row.original.packageId[0] 
            : 'N/A'}
        </h6>
      ),
    }),
    
    columnHelper1.display({
      id: 'gp',
      header: () => <span>GP</span>,
      cell: (info) => <h6 className="text-sm sm:text-base">{info.row.original.gp || 0}</h6>,
    }),
     
    columnHelper1.display({
      id: 'cp',
      header: () => <span>CP</span>,
      cell: (info) => <h6 className="text-sm sm:text-base">{info.row.original.cp || 0}</h6>,
    }),
     
    columnHelper1.display({
      id: 'ip',
      header: () => <span>IP</span>,
      cell: (info) => <h6 className="text-sm sm:text-base">{info.row.original.ip02 || 0}</h6>,
    }),
    
    columnHelper1.display({
      id: 'quantity',
      header: () => <span>Quantity</span>,
      cell: (info) => <h6 className="text-sm sm:text-base">{info.row.original.quantity || 0}</h6>,
    }),
    
    columnHelper1.display({
      id: 'supplierId',
      header: () => <span>Supplier ID</span>,
      cell: (info) => <h6 className="text-sm sm:text-base">{info.row.original.supplierId || 'N/A'}</h6>,
    }),
  ], [modalSelectedItems, filteredItems, addedItemIds]);
  
  const table = useReactTable({
    data: filteredTableData, // Use filtered data here
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });
  
  // Create table data for modal from filteredItems
   const modalTableData = React.useMemo(() => {
    return filteredItems.map(item => ({
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
  }, [filteredItems]);


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
  };

  let content;
  if (showTable) {
    content = <RecItemTable onBack={handleAddClick} />;
  } else {
   content = (
 <div className="space-y-4 w-full max-w-[1050px] mx-auto px-2 sm:px-4">
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5">
    {/* Header Title */}
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <FaReceipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
        Stock Receive Information
      </h2>
    </div>
    
    {/* First Row - Period, Return Id, Location Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Period Card */}
      <Card className="bg-gradient-to-br h-25 from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 p-1">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
            <FaCalendarAlt className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Period</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
               {(stockPeriod || '')}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Return Id Card */}
      <Card className="bg-gradient-to-br h-25 from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 p-1">
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
            <FaReceipt className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Return ID</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1">
              {/* <span className="text-purple-600 dark:text-purple-400"></span>  */}
              <span> # Auto </span>
            </p>
          </div>
        </div>
      </Card>
      
      {/* Location Information Card - Spans 2 columns on desktop */}
      <div className="lg:col-span-2">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <FaMapMarkerAlt className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200" htmlFor="dropdown">
                Location Information
              </Label>
            
            </div>
            
            <div ref={supplierDropdownRef} className="relative flex-1">
              <div
                className={`border rounded-lg h-11 flex items-center justify-between px-4 cursor-pointer transition-all duration-200
                  ${selectedSupplier 
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                onClick={() => setIsOpenSupplier(!isOpenSupplier)}
              >
                <div className="flex items-center flex-1 min-w-0 gap-3">
                  <FaMapMarkerAlt className={`w-4 h-4 flex-shrink-0 ${
                    selectedSupplier ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium truncate ${
                    selectedSupplier 
                      ? 'text-gray-900 dark:text-gray-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {selectedSupplier 
                      ? `${selectedSupplier.code} - ${selectedSupplier.name}` 
                      : 'Please select a location'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${
                      isOpenSupplier ? 'rotate-180' : ''
                    } text-gray-500 dark:text-gray-400 flex-shrink-0`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isOpenSupplier && (
                <div className="absolute z-20 w-full mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search ${locations.length} locations...`}
                        value={searchSupplier}
                        onChange={(e) => setSearchSupplier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    <div
                      className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setIsOpenSupplier(false);
                        setSelectedSupplier(null);
                        setSearchSupplier('');
                      }}
                    >
                      <div className="flex items-center gap-2">
                       
                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">Please Select The Location</div>
                          {/* <div className="text-xs text-gray-500 dark:text-gray-400">Remove current location</div> */}
                        </div>
                      </div>
                    </div>
                    {loadingLocations ? (
                      <div className="px-4 py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading locations...</p>
                      </div>
                    ) : filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <div
                          key={supplier.pk}
                          className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                          onClick={() => handleSupplierSelect(supplier)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <FaMapMarkerAlt className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                  {supplier.code}
                                </span>
                              
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                {supplier.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                          <FaSearch className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No locations found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>

    {/* Second Row - Date and Button */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <FaCalendarAlt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Return Schedule</span>
      </div>
      
      <div className="flex flex-col  sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <div className="relative">
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
        
        </div>
        
        <Button 
          onClick={() => {
            if (!selectedSupplier) {
              toast.error("Please select a location ");
              return;
            }
            setOpenModal(true);
          }} 
          className={`
            w-full sm:w-auto whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm
            transition-all duration-200 transform active:scale-95
            ${selectedSupplier 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200 dark:shadow-blue-900/30' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
          color="primary" 
          disabled={!selectedSupplier || loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FaBoxOpen className="w-4 h-4" />
              <span>Select Items</span>
              {selectedSupplier && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {supplierItems.length}
                </span>
              )}
            </div>
          )}
        </Button>
    
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="5xl" className="w-[95vw] sm:w-full">
          <ModalHeader className="rounded-t-md pb-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm sm:text-base">
            Item Details - {selectedSupplier?.name}
            <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              ({modalSelectedItems.size} selected, {addedItemIds.size} already added) - Showing {filteredItems.length} of {supplierItems.length} items
            </span>
          </ModalHeader>
                  
          <ModalBody className="bg-white dark:bg-gray-800 p-3 sm:p-4">
            <input
              type="text"
              placeholder={`Search ${supplierItems.length} records...`}
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="form-control-input w-full p-2 mb-2 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none max-w-xs bg-white dark:bg-gray-700 text-sm"
              autoFocus
            />
                      
            <div className="border border-ld dark:border-gray-700 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[800px] lg:min-w-full">
                  <table className="min-w-full">
                    <thead>
                      {table1.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="text-xs sm:text-sm text-white dark:text-gray-100 whitespace-nowrap font-semibold text-left border-b border-ld dark:border-gray-600 p-1.5 sm:p-2 bg-blue-600 dark:bg-blue-800"
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
                    <tbody className="divide-y divide-border dark:divide-gray-700">
                      {table1.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="whitespace-nowrap p-1.5 sm:p-2 text-xs sm:text-sm text-gray-800 dark:text-gray-300"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredItems.length === 0 && !loading && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 text-sm">
                    No items found for this supplier/location
                  </div>
                )}
                {loading && (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 text-sm">
                    Loading items...
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="bg-white dark:bg-gray-800">
            <Button 
              onClick={handleAddItems} 
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              disabled={modalSelectedItems.size === 0}
            >
              ADD ({modalSelectedItems.size})
            </Button>
            <Button color="gray" onClick={() => setOpenModal(false)} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  </div>

  {/* Items Details Card - Responsive */}
  <Card className="border border-gray-200 dark:border-gray-700 w-full max-w-[1040px] overflow-hidden">
    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
            <FaBoxOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            Items Details
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5">
            {selectedItems.length} item(s) selected
          </p>
        </div>
        <div className="relative w-full lg:w-72">
          <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder={`Search ${selectedItems.length} records...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <div className="min-w-[1000px] lg:min-w-full">
        <table className="w-full">
          <thead className="bg-blue-600 dark:bg-blue-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-semibold text-white uppercase whitespace-nowrap"
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
                    <td key={cell.id} className="px-2 sm:px-3 py-1.5 sm:py-2">
                      <div className="flex items-center min-h-[30px] sm:min-h-[40px]">
                        <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length} className="px-3 py-4 sm:py-6 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-1.5 sm:mb-2">
                      <FaBoxOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 dark:text-blue-500" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
                      {selectedItems.length === 0 ? 'No Items Added' : 'No Matching Records'}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs max-w-md">
                      {selectedItems.length === 0 
                        ? 'Click "Select Items" button to add items to the list.' 
                        : `No items found matching "${search}"`}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          
          {filteredTableData.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-700 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                {/* Skip first column (Item Code) */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
                
                {/* Skip Package Id column */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
                
                {/* Skip Date columns */}
                {selectedDates.map((_, index: number) => (
                  <td key={`date-footer-${index}`} className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
                ))}
                
                {/* Skip QTY column */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
                
                {/* Skip Gross Price column */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
                
                {/* Skip Cost Price column */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
                
                {/* Skip Issue Price column */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
                
                {/* Total Cost label */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Total Cost:
                </td>
                
                {/* Ttl Gross Price Total */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 text-right">
                  {totals.ttlGrossPrice?.toFixed(3) || '0.000'}
                </td>
                
                {/* Ttl Cost Price Total */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 text-right">
                  {totals.ttlCostPrice?.toFixed(3) || '0.000'}
                </td>
                
                {/* Ttl Issue Price Total */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 text-right">
                  {totals.ttlIssuePrice?.toFixed(3) || '0.000'}
                </td>
                
                {/* Skip Remove column */}
                <td className="px-2 sm:px-3 py-1.5 sm:py-2"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      {search && table.getRowModel().rows.length > 0 && (
        <div className="p-1.5 sm:p-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          Found {table.getRowModel().rows.length} of {selectedItems.length} records matching "{search}"
        </div>
      )}
    </div>
  </Card>
    
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
      
     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-2 sm:px-4">
  <div className="flex w-full sm:w-auto justify-end sm:justify-start gap-3 mb-2">
    {showTable ? (
      <div className="flex flex-wrap gap-2 mt-2"></div>
    ) : (
      <div className="flex flex-col sm:flex-row w-full items-start sm:items-center gap-3">
        <h1 className="text-lg sm:text-xl lg:text-2xl mr-144 text-indigo-700 whitespace-nowrap">Receive Item From Location</h1>
        <div className="flex gap-2 justify-end sm:justify-center items-center w-full sm:w-auto">
          <Button
            color="success"
            size="xs"
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full flex items-center justify-center"
            onClick={handleSaveClick}
            disabled={saving}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
            ) : (
              <FaSave className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>
          
          <Button
            color="warning"
            size="xs"
            onClick={handleRefresh}
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full flex items-center justify-center"
          >
            <HiRefresh className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          
          <Button
            color="primary"
            size="xs"
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full flex items-center justify-center"
            onClick={handleListClick}
          >
            <HiViewList className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    )}
  </div>
</div>

{content}

{showSaveModal && (
  <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)} size="md">
    <ModalHeader className="text-sm sm:text-base">Confirm Save</ModalHeader>
    <ModalBody>
      <div className="space-y-4">
        <div className="flex items-center justify-center text-4xl sm:text-6xl text-blue-500 mb-4">
          <FaSave />
        </div>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
          Are you sure you want to save this receive item from supplier record?
        </p>
      </div>
    </ModalBody>
    <ModalFooter className="justify-center">
      <Button
        color="success"
        onClick={handleConfirmSave}
        disabled={saving}
        className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm">Saving...</span>
          </>
        ) : (
          'Save'
        )}
      </Button>
      <Button
        color="gray"
        onClick={() => setShowSaveModal(false)}
        disabled={saving}
        className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm"
      >
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
)}

{sessionExpired && <SessionModal/>}
      
    </>
  );
};

export default StockReceiveItemFromLocation;