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
  import { FaBoxOpen, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClipboard, FaMapMarkerAlt, FaReceipt, FaSave, FaSearch, FaTrashAlt } from "react-icons/fa";
  import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Card } from 'flowbite-react';
  import toast, { Toaster } from 'react-hot-toast';
  import StockTable from "./stockTable";
  import { QtyCell } from "./qty";

  // Define missing interfaces
  export interface UploadedItem {
    itemId: number;
    itemName: string;
    packageId: any[];
    quotedGP?: number;
    actualGP?: number;
    actualGP1?: number;
    quantity?: number;
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
    renderGp?: boolean;
    renderIp?: boolean;
    expiryDate?: string | null;
    maxQuantity?: number;
    ip02C2c?: number;
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
    gp?: string;
    cp?: string;
    ip?: string;
    ttlGrossPrice?: string;
    ttlCostPrice?: string;
    ttlIssuePrice?: string;
    renderGp?: boolean;
    renderIp?: boolean;
    ip02?: number;
    expiryDate?: string | null;
    supplierId?: string;
    itemName?: string;
    maxQuantity?: number;
    ip02C2c?: number;
    traceItemPk?: number;
    batchNo?: string;
  }

  import CalendarStockReceive from "../StockReceive/CalenderSrockReceive";
  import SessionModal from "../SessionModal";

  const basicTableData: TableTypeDense[] = [];

  const columnHelper = createColumnHelper<TableTypeDense>();

  const DeliveryItemToLocation = () => {
      const [openModal, setOpenModal] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [, setShowForm] = useState(true);
    const [recvdQtyErrors, setRecvdQtyErrors] = useState<{ [key: number]: string }>({});
    const [sessionExpired, setSessionExpired] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedDates,] = useState<any[]>([]);
    const [addedItemIds, setAddedItemIds] = useState<Set<number>>(new Set());
    const [, setSaveStatus] = useState<{ success: boolean, message: string } | null>(null);
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
    const [modalValidationErrors, setModalValidationErrors] = useState<{
      [itemId: number]: string;
    }>({});
    const [locations, setLocations] = useState<LocationType[]>([]);
    const stockPeriod = localStorage.getItem("stockPeriod");

    // Pagination state for modal
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Refs for continuous typing
    const quantityTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
    const modalQuantityTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
    const gpTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
    const cpTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
    const ipTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

    // Ref to track previous input values
    const previousInputValueRef = useRef<Map<number, string>>(new Map());
    const modalPreviousInputValueRef = useRef<Map<number, string>>(new Map());
    const supplierDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          supplierDropdownRef.current &&
          !supplierDropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpenSupplier(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

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

    // Fetch locations from API on component mount
    useEffect(() => {
      fetchLocations();
    }, []);

    // Reset to first page when search changes or modal opens
    useEffect(() => {
      if (openModal) {
        setCurrentPage(1);
      }
    }, [searchItem, openModal]);

    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setIsLoadingLocations(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          setSessionExpired(true);
          return;
        }

        const response = await axios.get(
          "http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/loadDeliveryLocationDropdown",
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
      } finally {
        setIsLoadingLocations(false);
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

        const response = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/stockItemDetailList`,
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
          if (supplierCode === 'ALL') {
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
              expiryDate: item.expiryDate,
              maxQuantity: item.maxQuantity,
              ip02C2c: item.ip02C2c || 0,
              traceItemPk: item.traceItemPk || 0,
            }));
            setSupplierItems(allItems);
          } else {
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
                expiryDate: item.expiryDate,
                maxQuantity: item.maxQuantity,
                ip02C2c: item.ip02C2c || 0,
                traceItemPk: item.traceItemPk || 0,
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
                expiryDate: item.expiryDate,
                maxQuantity: item.maxQuantity,
                ip02C2c: item.ip02C2c || 0,
                traceItemPk: item.traceItemPk || 0,
              }));
              setSupplierItems(itemsData);
            }
          }
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
      setToDate(currentDate.toISOString().split('T')[0]);
      setSelectedItems([]);
      setAddedItemIds(new Set());
      setSelectedSupplier(null);
      setSupplierItems([]);
      setModalSelectedItems(new Set());
      setSaveStatus(null);
      setSearch('');
      setSearchItem('');
      setModalValidationErrors({});
      setDeliveryNote('');
      previousInputValueRef.current.clear();
      modalPreviousInputValueRef.current.clear();

      quantityTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      modalQuantityTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      gpTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      cpTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      ipTimeoutRef.current.forEach(timeout => clearTimeout(timeout));

      quantityTimeoutRef.current.clear();
      modalQuantityTimeoutRef.current.clear();
      gpTimeoutRef.current.clear();
      cpTimeoutRef.current.clear();
      ipTimeoutRef.current.clear();
    };

    const handleSelectAll = () => {
      if (modalSelectedItems.size === paginatedFilteredItems.length - addedItemIds.size) {
        setModalSelectedItems(new Set());
      } else {
        const selectableItems = paginatedFilteredItems.filter(item => !addedItemIds.has(item.itemId));
        const allSelectableItemIds = new Set(selectableItems.map(item => item.itemId));
        setModalSelectedItems(allSelectableItemIds);
      }
    };

    const handleItemSelect = (itemId: number) => {
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

    // Filter table rows based on search
    const filteredTableData = React.useMemo(() => {
      if (!search.trim()) return selectedItems;
      const lowerSearch = search.toLowerCase().trim();

      return selectedItems.filter(item => {
        if (item.name?.toLowerCase().includes(lowerSearch)) return true;
        if (item.pname?.toLowerCase().includes(lowerSearch)) return true;
        if (item.teams?.some(team => team.text.toLowerCase().includes(lowerSearch))) return true;
        if (item.itemId?.toString().includes(lowerSearch)) return true;
        return false;
      });
    }, [selectedItems, search]);

    const totals = React.useMemo(() => {
      return filteredTableData.reduce((acc, item) => {
        const totalPrice = parseFloat(item.ttlCostPrice || '0') || 0;
        return {
          totalPrice: acc.totalPrice + totalPrice,
        };
      }, { totalPrice: 0 });
    }, [filteredTableData]);

    const validateQuantity = (quantity: number, maxQuantity?: number): string => {
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
      if (maxQuantity !== undefined && quantity > maxQuantity) {
        return `Quantity cannot exceed Remaining Batch Qty (${maxQuantity})`;
      }
      return "";
    };

    const validateInputWhileTyping = (value: string, maxQuantity?: number): { isValid: boolean; error: string; numericValue: number } => {
      if (value === '') {
        return { isValid: true, error: '', numericValue: 0 };
      }

      const decimalRegex = /^-?\d*\.?\d{0,3}$/;
      if (!decimalRegex.test(value)) {
        return { isValid: false, error: 'Invalid number format', numericValue: 0 };
      }

      if ((value.match(/\./g) || []).length > 1) {
        return { isValid: false, error: 'Invalid decimal format', numericValue: 0 };
      }

      const numericValue = parseFloat(value);

      if (isNaN(numericValue)) {
        return { isValid: false, error: 'Invalid number', numericValue: 0 };
      }

      if (numericValue < 0) {
        return { isValid: false, error: 'Cannot be negative', numericValue: 0 };
      }

      if (maxQuantity !== undefined && numericValue > maxQuantity) {
        return { isValid: false, error: `Cannot exceed ${maxQuantity}`, numericValue };
      }

      return { isValid: true, error: '', numericValue };
    };

    // Handle quantity change with debouncing - with real-time validation
  const handleQuantityChange = (itemId: number, inputValue: string) => {
    // Find the original item to get maxQuantity
    const originalItem = supplierItems.find(item => item.itemId === itemId);
    const maxQuantity = originalItem?.maxQuantity || 0;
  
    // Validate the input while typing
    const validation = validateInputWhileTyping(inputValue, maxQuantity);
  
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [itemId]: validation.error
      }));
      return;
    }
  
    // Clear error if input is valid
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[itemId];
      return newErrors;
    });
  
    // Clear existing timeout for this item
    if (quantityTimeoutRef.current.has(itemId)) {
      clearTimeout(quantityTimeoutRef.current.get(itemId));
    }
  
    // Set new timeout to update the actual quantity
  
      const numericValue = validation.numericValue;
    
      // Final check: cannot exceed maxQuantity
      if (numericValue > maxQuantity) {
        setValidationErrors(prev => ({
          ...prev,
          [itemId]: `Cannot exceed Remaining Batch Qty: ${maxQuantity}`
        }));
        return;
      }
    
      setSelectedItems(prev => prev.map(item => {
        if (item.itemId === itemId) {
          const ip = parseFloat(item.ip || '0') || 0; // Get Issue Price
        
          return {
            ...item,
            quantity: numericValue,
            ttlCostPrice: (numericValue * ip).toFixed(3) // QTY × Issue Price = Total Price
          };
        }
        return item;
      }));
    const timeout = setTimeout(() => {
      // Additional final validation if needed
      quantityTimeoutRef.current.delete(itemId);
    }, 300);
  
  
    quantityTimeoutRef.current.set(itemId, timeout);
  };

    const handleModalQuantityChange = (itemId: number, inputValue: string) => {
      const originalItem = supplierItems.find(item => item.itemId === itemId);
      const maxQuantity = originalItem?.maxQuantity || 0;

      const validation = validateInputWhileTyping(inputValue, maxQuantity);

      if (!validation.isValid) {
        setModalValidationErrors(prev => ({
          ...prev,
          [itemId]: validation.error
        }));
        return;
      }

      setModalValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });

      if (modalQuantityTimeoutRef.current.has(itemId)) {
        clearTimeout(modalQuantityTimeoutRef.current.get(itemId));
      }

      const numericValue = validation.numericValue;

      if (numericValue > maxQuantity) {
        setModalValidationErrors(prev => ({
          ...prev,
          [itemId]: `Cannot exceed Remaining Batch Qty: ${maxQuantity}`
        }));
        return;
      }

      setSupplierItems(prev => prev.map(item => {
        if (item.itemId === itemId) {
          return { ...item, quantity: numericValue };
        }
        return item;
      }));

      const timeout = setTimeout(() => {
        modalQuantityTimeoutRef.current.delete(itemId);
      }, 300);

      modalQuantityTimeoutRef.current.set(itemId, timeout);
    };

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
        const cp = item.cp || 0;
        const ip = item.ip02 || 0;

        const totalPrice = (quantity * ip).toFixed(3);

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
          gp: gp.toFixed(3),
          cp: cp.toFixed(3),
          ip: ip.toFixed(3),
          ttlGrossPrice: (quantity * gp).toFixed(3),
          ttlCostPrice: totalPrice,
          ttlIssuePrice: (quantity * ip).toFixed(3),
          originalActualGP: item.actualGP,
          originalActualGP1: item.actualGP1,
          editableQuantity: quantity,
          editableActualGP: actualGPValue.toFixed(2),
          isManuallyEdited: false,
          renderGp: item.renderGp || false,
          renderIp: item.renderIp || false,
          supplierId: item.supplierId,
          itemName: item.itemName,
          expiryDate: item.expiryDate,
          maxQuantity: item.maxQuantity,
          ip02C2c: item.ip02C2c || 0,
          traceItemPk: item.traceItemPk || 0,
          batchNo: item.batchNo || ""
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
      setModalValidationErrors({});
      modalPreviousInputValueRef.current.clear();

      if (newItems.length < selectedItemData.length) {
        toast.success(`${selectedItemData.length - newItems.length} items were already in the table and were not added again.`);
      } else {
        toast.success(`${newItems.length} items added successfully`);
      }
    };

    const formatDateToYYYYMMDD = (dateString: string): string => {
      if (!dateString) return '';

      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }

        if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split('-');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.error("Invalid date format:", dateString);
          return dateString;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Error formatting date:", error, dateString);
        return dateString;
      }
    };

    const handleSaveClick = () => {
      try {
        if (!selectedSupplier) {
          toast.error("Please Select the Location Id");
          return;
        }

        if (!toDate) {
          toast.error("Please select a delivery date");
          return;
        }
        if (deliveryNote.trim() === "") {
          toast.error("Please Enter the Del. Note No");
          return;
        }

        if (selectedItems.length === 0) {
          toast.error("Please add the items");
          return;
        }

        const itemsWithoutQuantity = selectedItems.filter(item => {
          const quantity = item.quantity || 0;
          const maxQuantity = item.maxQuantity || 0;
          const error = validateQuantity(quantity, maxQuantity);
          return quantity <= 0 || error !== "";
        });

        if (itemsWithoutQuantity.length > 0) {
          toast.error(`Please enter quantity for all ${itemsWithoutQuantity.length} item(s)`);
          const errors: { [itemId: number]: string } = {};
          itemsWithoutQuantity.forEach(item => {
            const quantity = item.quantity || 0;
            if (quantity <= 0) {
              errors[item.itemId!] = "Quantity is required";
            } else {
              const maxQuantity = item.maxQuantity || 0;
              errors[item.itemId!] = validateQuantity(quantity, maxQuantity);
            }
          });
          setValidationErrors(errors);
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
        if (!token) {
          setSessionExpired(true);
          return;
        }

        if (!stockPeriod) {
          toast.error("Stock period not found in localStorage");
          return;
        }

        const formattedPeriod = formatDateToYYYYMMDD(stockPeriod);
        const formattedDeliveryDate = formatDateToYYYYMMDD(toDate);

        const uploadedItem = selectedItems
          .filter(item => {
            const originalItem = supplierItems.find(si => si.itemId === item.itemId);
            const maxQuantity = originalItem?.maxQuantity;
            const error = validateQuantity(item.quantity || 0, maxQuantity);
            return !error;
          })
          .map(item => {
            const packageId = item.teams && item.teams.length > 0 ? item.teams[0].text : '';
            const originalItem = supplierItems.find(si => si.itemId === item.itemId);

            let formattedExpiryDate = null;
            if (originalItem?.expiryDate) {
              formattedExpiryDate = formatDateToYYYYMMDD(originalItem.expiryDate);
            }

            return {
              itemId: item.itemId,
              itemName: item.pname || item.itemName || '',
              packageId: packageId,
              quantity: item.quantity || 0,
              ip02: item.ip ? parseFloat(item.ip) : 0,
              ip02C2c: originalItem?.ip02C2c || 0,
              stockGp: originalItem?.actualGP || 0,
              stockCp: originalItem?.stockCp || 0,
              batchNo: originalItem?.batchNo || '',
              expiryDate: formattedExpiryDate,
              expiryDateFormat: formattedExpiryDate || '',
              traceItemPk: originalItem?.traceItemPk || 0,
            };
          });

        if (uploadedItem.length === 0) {
          toast.error("Please Add the Quantity");
          setSaving(false);
          setIsLoading(false);
          return;
        }

        const saveData = {
          period: formattedPeriod,
          actualDeliveryDate: formattedDeliveryDate,
          locationId: selectedSupplier.code,
          locationName: selectedSupplier.name,
          deliveryNote: deliveryNote,
          entityId: entityId,
          userFk: userFk,
          uploadedItem: uploadedItem
        };

        const response = await axios.post(
          "http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/saveStockDeliveryItemToLocation",
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
          toast.success("Items saved successfully!");
          handleRefresh();
        } else {
          toast.error(`Save failed: ${response.data.message || 'Unknown error'}`);
        }
      } catch (error: any) {
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
      setSupplierItems([]);
      setModalSelectedItems(new Set());
      setModalValidationErrors({});
      modalPreviousInputValueRef.current.clear();
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

    const [deliveryNote, setDeliveryNote] = useState('');

    const [, setData] = React.useState(basicTableData);
    const [columnVisibility, setColumnVisibility] = React.useState({});


    useEffect(() => {
      setData(selectedItems);
    }, [selectedItems]);

  const defaultColumns = React.useMemo(() => [
    columnHelper.accessor("name", {
      cell: (info) => {
        const pname = info.row.original.pname || '';

        const splitIntoChunks = (text, chunkSize = 10) => {
          const chunks = [];
          for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.substring(i, i + chunkSize));
          }
          return chunks;
        };

        const chunks = splitIntoChunks(pname);

        return (
          <div className="flex items-center p-0.5">
            <div className="w-[70px]">
              <h6 className="text-[12px] font-medium truncate">{info.getValue()}</h6>
              <p className="text-[9px] break-words leading-tight">
                {chunks.map((chunk, index) => (
                  <span key={index}>
                    {chunk}
                    {index < chunks.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>
        );
      },
      header: () => (
        <div className="flex flex-col items-start w-[70px]">
          <span className="text-[10px] font-bold">Item Code</span>
          <span className="text-[9px] text-blue-100">ID</span>
        </div>
      ),
      id: 'itemCode',
    }),
    columnHelper.accessor("teams", {
      header: () => (
        <div className="flex flex-col items-start w-[60px]">
          <span className="text-[10px] font-bold">Package</span>
          <span className="text-[9px] text-blue-100">ID</span>
        </div>
      ),
      cell: (info) => (
        <div className="w-[60px]">
          {info.getValue().map((team) => (
            <div key={team.id}>
              <div className="text-[11px] text-black">
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
        header: () => <div className="text-right w-[60px] text-[10px] font-bold">{dateInfo.day}</div>,
        cell: () => (
          <div className="text-right w-[60px]">
            <input
              type="text"
              defaultValue="0.000"
              className="w-14 border border-gray-300 rounded px-1 py-0.5 text-[8px] text-right"
            />
          </div>
        ),
      })
    ),
    columnHelper.accessor("budget", {
    header: () => <span>QTY</span>,
    cell: (info) => (
      <QtyCell
        index={info.row.index}
        item={info.row.original}
        recvdQtyErrors={recvdQtyErrors}
        handleQuantityChange={handleQuantityChange}
        setRecvdQtyErrors={setRecvdQtyErrors}
      />
    ),
  }),
    columnHelper.display({
      id: 'gp',
      header: () => (
        <div className="flex flex-col items-end text-right w-[65px]">
          <span className="text-[10px] font-bold">Remaining</span>
          <span className="text-[10px] text-blue-100">Batch Qty</span>
        </div>
      ),
      cell: (info) => {
        const maxQuantity = info.row.original.maxQuantity || 0;
        return (
          <div className="w-[65px] text-right">
            <span className="inline-block px-1 py-0.5 text-[11px] bg-gray-100 text-black rounded">
              {maxQuantity.toFixed(0)}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'ip',
      header: () => (
        <div className="flex flex-col items-end text-right w-[50px]">
          <span className="text-[10px] font-bold">Issue</span>
          <span className="text-[10px] text-blue-100">Price</span>
        </div>
      ),
      cell: (info) => (
        <div className="text-right w-[50px]">
          <h6 className="text-[11px] font-medium">{parseFloat(info.row.original.ip || '0').toFixed(0)}</h6>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'ttlGrossPrice',
      header: () => (
        <div className="flex flex-col items-end text-right w-[50px]">
          <span className="text-[10px] font-bold">Exp</span>
          <span className="text-[10px] text-blue-100">Date</span>
        </div>
      ),
      cell: (info) => (
        <div className="text-right w-[50px]">
          <h6 className="text-[11px] font-medium truncate">{info.row.original.expiryDate ? info.row.original.expiryDate.split('-')[0] : 'N/A'}</h6>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'ttlCostPrice',
      header: () => (
        <div className="flex flex-col items-end text-right w-[55px]">
          <span className="text-[10px] font-bold">Total</span>
          <span className="text-[9px] text-blue-100">Price</span>
        </div>
      ),
      cell: (info) => {
        const quantity = info.row.original.quantity || 0;
        const ip = parseFloat(info.row.original.ip || '0') || 0;
        const totalPrice = (quantity * ip).toFixed(0);
        return (
          <div className="text-right w-[55px]">
            <h6 className="text-[11px] font-medium">{totalPrice}</h6>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'remove',
      header: () => (
        <div className="text-right w-[45px]">
          <span className="text-[12px] font-bold">Remove</span>
        </div>
      ),
      cell: (info) => (
        <div className="flex justify-end w-[45px]">
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
              previousInputValueRef.current.delete(itemId);
              toast.success("Item removed successfully");
            }}
            className="px-1 py-0.5"
          >
            <FaTrashAlt className="w-2.5 h-2.5 text-red-600" />
          </Button>
        </div>
      ),
    }),
  ], [selectedDates, validationErrors, recvdQtyErrors]);

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
        cell: (info) => <h6 className="text-[11px]">{info.row.original.itemId}</h6>,
      }),
      columnHelper1.display({
        id: 'itemName',
        header: () => <span>Item Name</span>,
        cell: (info) => (
          <div className="break-words max-w-[200px] min-w-[150px] text-[11px] text-black">
            {info.row.original.itemName}
          </div>
        ),
      }),
      columnHelper1.display({
        id: 'packageId',
        header: () => <span>Package Id</span>,
        cell: (info) => (
          <h6 className="text-[11px]">
            {info.row.original.packageId && info.row.original.packageId.length > 0
              ? info.row.original.packageId[0]
              : 'N/A'}
          </h6>
        ),
      }),
      columnHelper1.display({
        id: 'ip02',
        header: () => <span>IP 02</span>,
        cell: (info) => <h6 className="text-[11px] ml-2">{info.row.original.ip02 || 0}</h6>,
      }),
      columnHelper1.display({
        id: 'maxQuantity',
        header: () => <span>Remaining Batch Qty</span>,
        cell: (info) => {
          const maxQuantity = info.row.original.maxQuantity || 0;
          return <h6 className="text-[11px] ml-2">{maxQuantity.toFixed(3)}</h6>;
        },
      }),
    columnHelper1.accessor("budget", {
    header: () => <span>QTY</span>,
    cell: (info) => {
      const index = info.row.index;
      const item = info.row.original;
      const maxQuantity = item.maxQuantity || 0;
      const currentEditableValue = item.quantity || 0;
      const hasError = !!recvdQtyErrors[index];

      const formatWithThreeDecimals = (value: number | string): string => {
        if (typeof value === 'string') {
          const num = parseFloat(value);
          return isNaN(num) ? value : num.toFixed(3);
        }
        return value.toFixed(3);
      };

      const [inputValue, setInputValue] = useState(formatWithThreeDecimals(currentEditableValue));

      useEffect(() => {
        setInputValue(formatWithThreeDecimals(currentEditableValue));
      }, [currentEditableValue]);

      const isValidValue = (value: number): boolean => {
        return !isNaN(value) && value >= 0 && value <= maxQuantity;
      };

      return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={inputValue}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onChange={(e) => {
              const rawValue = e.target.value;

              if (rawValue === '') {
                setInputValue('');
                return;
              }

              if (!/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
                e.target.value = inputValue;
                return;
              }

              let processedValue = rawValue;
              if (rawValue === '.') {
                processedValue = '0.';
              } else if (rawValue.startsWith('.')) {
                processedValue = '0' + rawValue;
              }

              const numValue = parseFloat(processedValue);

              if (!isValidValue(numValue)) {
                setInputValue(maxQuantity.toString());
              } else {
                setInputValue(processedValue);
              }
            }}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey) return;

              const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Tab', 'Enter', 'Escape', 'Home', 'End'
              ];

              if (allowedKeys.includes(e.key)) {
                if (e.key === 'Enter') e.currentTarget.blur();
                return;
              }

              if (e.key === '.') {
                const currentValue = e.currentTarget.value;
                if (currentValue.includes('.')) e.preventDefault();
                return;
              }

              if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
                return;
              }

              const currentValue = e.currentTarget.value;
              const selectionStart = e.currentTarget.selectionStart || 0;
              const selectionEnd = e.currentTarget.selectionEnd || 0;

              let newValueStr;
              if (selectionStart === selectionEnd) {
                newValueStr = currentValue.slice(0, selectionStart) + e.key + currentValue.slice(selectionStart);
              } else {
                newValueStr = currentValue.slice(0, selectionStart) + e.key + currentValue.slice(selectionEnd);
              }

              if (newValueStr === '' || newValueStr === '.') return;

              const newValue = parseFloat(newValueStr);
              if (isNaN(newValue) || newValue > maxQuantity) e.preventDefault();
            }}
            onBlur={(e) => {
              const rawValue = e.target.value;

              if (rawValue === '' || rawValue === '.' || rawValue === '-') {
                handleModalQuantityChange(item.itemId!, '0');
                setInputValue('0.000');
                return;
              }

              const numValue = parseFloat(rawValue);

              if (!isNaN(numValue)) {
                if (numValue > maxQuantity) {
                  setRecvdQtyErrors(prev => ({
                    ...prev,
                    [index]: `Cannot exceed Remaining Batch Qty: ${maxQuantity.toFixed(3)}`
                  }));
                  handleModalQuantityChange(item.itemId!, maxQuantity.toString());
                  setInputValue(maxQuantity.toFixed(3));
                } else {
                  handleModalQuantityChange(item.itemId!, numValue.toString());
                  setInputValue(numValue.toFixed(3));
                }
              } else {
                handleModalQuantityChange(item.itemId!, currentEditableValue.toString());
                setInputValue(formatWithThreeDecimals(currentEditableValue));
              }
            }}
            className={`w-20 px-2 py-1 border rounded text-[11px] text-center ${
              hasError
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300'
            }`}
          />
          {hasError && (
            <div className="absolute z-10 mt-1 w-48 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg text-[10px] text-red-700">
              {recvdQtyErrors[index]}
            </div>
          )}
        </div>
      );
    },
  }),
      columnHelper1.display({
        id: 'expiryDate',
        header: () => <span>Exp Date</span>,
        cell: (info) => <h6 className="text-[11px]">{info.row.original.expiryDate || 'N/A'}</h6>,
      }),
    ], [modalSelectedItems, paginatedFilteredItems, addedItemIds, modalValidationErrors, recvdQtyErrors]);

    const table = useReactTable({
      data: filteredTableData,
      columns: defaultColumns,
      getCoreRowModel: getCoreRowModel(),
      state: { columnVisibility },
      onColumnVisibilityChange: setColumnVisibility,
    });

    const modalTableData = React.useMemo(() => {
      return paginatedFilteredItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        packageId: item.packageId,
        gp: (item.gp || 0).toString(),
        cp: (item.cp || 0).toString(),
        ip02: item.ip02,
        quantity: item.quantity || 0,
        supplierId: item.supplierId,
        expiryDate: item.expiryDate,
        maxQuantity: item.maxQuantity,
        teams: item.packageId ? item.packageId.map((pkg: string, index: number) => ({
          id: (index + 1).toString(),
          color: "primary",
          text: pkg
        })) : []
      }));
    }, [paginatedFilteredItems]);

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

  let content;
if (showTable) {
  content = <StockTable onBack={handleAddClick} />;
} else {
  content = (
    <div className="space-y-4 w-full max-w-[1050px] mx-auto px-2 sm:px-3 md:px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-3 sm:p-4 md:p-5">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-4 pb-2 dark:border-gray-700">
          {/* Period Card */}
          <Card className="bg-purple-50 border-l-8 border-purple-500 shadow-sm p-1.5 sm:p-2 md:p-3 h-8 sm:h-9 md:h-10 w-full sm:w-auto min-w-[120px] sm:min-w-[130px] md:w-70">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <div className="p-1 sm:p-1.5 md:p-2 bg-purple-500 rounded-lg">
                <FaReceipt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-sm font-medium text-black dark:text-white truncate">
                  Delivery ID: <span className="font-bold text-black dark:text-white"># Auto</span>
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
                <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-sm font-medium text-black dark:text-white truncate">
                  Period: <span className="font-bold text-black dark:text-white">
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

        <Card className="flex-1 h-auto sm:h-20 md:h-48 lg:h-18  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4 p-2 sm:p-3">
            <div className="p-1 sm:p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
              <FaMapMarkerAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400" />
            </div>

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
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transform transition-transform duration-200 ${isOpenSupplier ? 'rotate-180' : ''} text-gray-500 dark:text-gray-400 flex-shrink-0`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

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
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-medium ${selectedSupplier?.pk === supplier.pk
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
              <div className="w-full sm:w-[180px] md:w-[200px] flex-shrink-0">
                <div className="relative">
                  <FaClipboard className="absolute left-1.5 sm:left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 z-10" />
                  <input
                    id="deliveryNote"
                    type="text"
                    value={deliveryNote}
                    maxLength={50}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Delivery Note No"
                    className="w-full pl-6 sm:pl-8 pr-10 sm:pr-13 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2.5 text-[8px] sm:text-xs text-gray-400">
                    {deliveryNote.length}/50
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-[140px] md:w-[160px] flex-shrink-0">
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
            <div className="flex justify-end items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm">
              <span className="text-black font-medium dark:text-gray-200">Total Cost:</span>
              <span className="text-blue-800 dark:text-gray-200 font-bold">₹ {totals.totalPrice?.toFixed(3) || '0.000'}</span>
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

        <div className="p-2 pt-0">
          <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="max-h-[180px] sm:max-h-[200px] md:max-h-[220px] lg:max-h-[230px] overflow-y-auto">
              <div className="min-w-[600px] md:min-w-[700px] lg:min-w-[800px] xl:min-w-full">
                <table className="w-full table-fixed">
                  <thead className="bg-blue-600 dark:bg-blue-800 sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-0.5 sm:px-1 py-0.5 text-left font-semibold text-white uppercase text-[8px] sm:text-[9px] md:text-[10px]"
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
                            <td key={cell.id} className="px-0.5 sm:px-1 py-0.5 align-middle">
                              <div className="flex items-center min-h-[18px] sm:min-h-[20px]">
                                <span className="text-[8px] sm:text-[9px] md:text-[10px]">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={table.getAllColumns().length} className="px-2 py-2 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="p-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-0.5">
                              <FaBoxOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400 dark:text-blue-500" />
                            </div>
                            <h4 className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-gray-700 dark:text-gray-300">
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
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 dark:border-gray-700"></div>

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
                  Item Details - {selectedSupplier?.name || "Select Items"}
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

            <div className="border border-gray-200 dark:border-gray-700 overflow-hidden focus:outline-none" tabIndex={0}>
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
                                  header.id === "select" ? "28px" :
                                    header.id === "itemId" ? "60px" :
                                      header.id === "itemName" ? "150px" :
                                        header.id === "packageId" ? "80px" :
                                          header.id === "ip02" ? "50px" :
                                            header.id === "maxQuantity" ? "100px" :
                                              header.id === "budget" ? "70px" :
                                                "60px",
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
                                <td key={cell.id} className="px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-800 dark:text-gray-300">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={table1.getAllColumns().length} className="px-2 sm:px-3 py-3 sm:py-4 text-center text-gray-500 dark:text-gray-400 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 border rounded flex items-center gap-0.5 sm:gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[8px] sm:text-[9px] md:text-[10px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    >
                      <FaChevronLeft className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> Prev
                    </button>
                    <span className="px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[8px] sm:text-[9px] md:text-[10px] font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                <div className="flex items-center gap-1 sm:gap-2">
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-xl text-indigo-700 whitespace-nowrap">
                    Delivery Item To Location
                  </h1>
                  <Tooltip
                    content={
                      <div className="text-[10px] sm:text-xs max-w-xs w-32 sm:w-40">
                        <p className="font-semibold mb-0.5 sm:mb-1">Quick Steps:</p>
                        <ol className="list-decimal list-inside space-y-0.5 sm:space-y-1">
                          <li>Select location</li>
                          <li>Add items with quantities</li>
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
              Are you sure you want to save this Delivery Item To Location record?
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

    {sessionExpired && <SessionModal />}

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

  export default DeliveryItemToLocation;