import { 
  Button, 
  Label, 
  Card,
  Tooltip,
  Spinner
} from "flowbite-react";
import { useState, useEffect ,useRef} from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
 
} from "@tanstack/react-table";
import { 
  HiRefresh, 
  HiViewList, 
  HiSearch,
  HiCalendar,
  HiInformationCircle,
  
} from 'react-icons/hi';
import { 
  FaSave, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaDatabase,
  FaTruck,
  FaFileInvoice,
  FaPercentage,
  FaMoneyBillWave,
  FaReceipt,
  FaMapPin,
  FaChevronDown,
  FaSearch,
  FaUser,
  FaCalendar
} from "react-icons/fa";
import StockReceiveTable from "./StockReceiveTable";
import React from "react";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import CalendarStockReceive from "./CalenderSrockReceive";
import {  Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react';
import SessionModal from "../SessionModal";
import { useEntityFormatter } from "../Entity/UseEntityFormater";
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
} 

export interface ItemDetail {
  poDetailPk: number;
  itemId: number;
  itemName: string;
  packageId: string;
  ordQty: number;
  prQty: number;
  recvdQty: number;
  invValue: number;
  poGp: number;
  adjValue?: number;
  totalGp: number;
  expDate: string;
  batchNo: string;
  binNo: string;
  // For editing received quantity
  editableRecvdQty?: number;
  // Validation limits
  maxAllowedQty?: number;
  minAllowedQty?: number;
  decimalPrecision?: number;
}

const columnHelper = createColumnHelper<ItemDetail>();

// Function to validate received quantity input
const validateRecvdQty = (
  value: number, 
  item: ItemDetail
): { isValid: boolean; error?: string; validatedValue?: number } => {
  
  // Check for negative values
  if (value < 0) {
    return { 
      isValid: false, 
      error: 'Negative values are not allowed' 
    };
  }
  
  // Check minimum allowed quantity (default 0)
  const minAllowed = item.minAllowedQty || 0;
  if (value < minAllowed) {
    return { 
      isValid: false, 
      error: `Value cannot be less than ${minAllowed}` 
    };
  }
  
  // Check maximum allowed quantity (if specified)
  if (item.maxAllowedQty !== undefined && value > item.maxAllowedQty) {
    return { 
      isValid: false, 
      error: `Value cannot exceed ${item.maxAllowedQty}` 
    };
  }
  
  // REMOVED: Decimal precision check
  
  return { isValid: true, validatedValue: value };
};

// Special validator for decimal precision scenarios


const ReceiveItemFromSupplier = () => {
  const [supplierSearch, setSupplierSearch] = useState('');
  const [poSearch, setPoSearch] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenPo, setIsOpenPo] = useState(false);
  const [, setDeliveryDate] = useState<Date | null>(null);
    const [delNote, setDelNote] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [delNoteError, setDelNoteError] = useState('');
  const [invoiceNoError, setInvoiceNoError] = useState('');
  const [delNoteValidating, setDelNoteValidating] = useState(false);
  const [invoiceNoValidating, setInvoiceNoValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  // Add search state for item details table
  const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [sessionExpired, setSessionExpired] = useState(false);
const [showSaveModal, setShowSaveModal] = useState(false);
  const stockPeriod = localStorage.getItem("stockPeriod");
  const [isLoading, setIsLoading] = useState(false);
  // Add this with your other state declarations (useState hooks)
const [showCalendar, setShowCalendar] = useState(false);
  // State for supplier data
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState({ id: '', name: '' });
  
  // State for PO data
  const [poList, setPoList] = useState([]);
  // Update the selectedPo state type
  const [selectedPo, setSelectedPo] = useState({ 
    poNo: '', 
    locationId: '', 
    locationName: '', 
    currencyRate: '', 
    currencyName: '',
    discount: '',  // Add discount field
    totalCost: '',
    netInvoice: '',
    deliveryType:''
  });
  
  // State for form fields
  const [supplierName, setSupplierName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [currencyRate, setCurrencyRate] = useState('');
  const [currencyName, setcurrencyName] = useState('');
  
  // State for item details
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);

  const [recvdQtyErrors, setRecvdQtyErrors] = useState<{[key: number]: string}>({});
  
  // State for calculations
  const [totalCost, setTotalCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netInvoice, setNetInvoice] = useState(0);
  
  const token = localStorage.getItem("authToken");
// Add refs for dropdowns
const supplierDropdownRef = useRef<HTMLDivElement>(null);
const poDropdownRef = useRef<HTMLDivElement>(null);
  const formatter = useEntityFormatter(); 
  const formatValue = (value) => {
  const num = Number.parseFloat(value);
  return isNaN(num) ? '0.00' : formatter.formatAmount(num);
};
const handleSaveClick = () => {
    const token = localStorage.getItem('authToken');

  // First, validate all fields
  if (!token) {
    setSessionExpired(true);
    return;
  }

  if (!selectedSupplier.id) {
    toast.error('Please select a supplier', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  if (!selectedPo.poNo) {
    toast.error('Please select a PO', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  if (!delNote.trim()) {
    toast.error('Please enter Del.Note', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  if (itemDetails.length === 0) {
    toast.error('No item details to save', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  // Check if there are any validation errors in received quantities
  const hasErrors = Object.keys(recvdQtyErrors).length > 0;
  if (hasErrors) {
    toast.error('Please fix all validation errors before saving', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  // Validate Del.Note and Invoice No before proceeding
  if (delNoteError) {
    toast.error('Please fix Del.Note errors before saving', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  // IMPORTANT: Check if Invoice No has validation error
  if (invoiceNoError) {
    toast.error('Invoice No already exists', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  // If validation is still in progress, wait for it to complete
  if (invoiceNoValidating) {
    toast.error('Please wait for Invoice No validation to complete', {
      duration: 2000,
      position: 'top-right',
    });
    return;
  }

  // Show success message for validation passed


  // ALL VALIDATIONS PASSED - Now show the modal
  setShowSaveModal(true);
};
// Update the useEffect for click outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // Check if click is outside both dropdowns
    if (
      supplierDropdownRef.current && 
      !supplierDropdownRef.current.contains(event.target as Node) &&
      poDropdownRef.current && 
      !poDropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setIsOpenPo(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);
  // Parse stock period date for minDate in calendar
  const parseStockPeriodDate = () => {
    if (!stockPeriod) return new Date(2000, 0, 1);
    
    const parts = stockPeriod.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(2000, 0, 1);
  };

   const handleRefresh = () => {
    // Clear all form fields and state
    setSupplierSearch('');
    setPoSearch('');
    setIsOpen(false);
    setIsOpenPo(false);
    setDeliveryDate(null);
    setSelectedSupplier({ id: '', name: '' });
   
    setPoList([]);
    setSelectedPo({ 
      poNo: '', 
      locationId: '', 
      locationName: '', 
      currencyRate: '', 
      currencyName: '',
      totalCost: '',
      discount: '',
      netInvoice: '',
      deliveryType:''
    });
    setSupplierName('');
    setLocationId('');
    setLocationName('');
    setCurrencyRate('');
    setcurrencyName('');
    setItemDetails([]);
    setRecvdQtyErrors({});
    setTotalCost(0);
    setDiscount(0);
    setNetInvoice(0);
    setItemSearchTerm('');
      const currentDate = new Date();
  const offset = currentDate.getTimezoneOffset();
  const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
  setToDate(localDate.toISOString().split('T')[0]);
    // Clear Del.Note and Invoice No fields
    setDelNote('');
    setInvoiceNo('');
    setDelNoteError('');
    setInvoiceNoError('');
    setDelNoteValidating(false);
    setInvoiceNoValidating(false);
  };



// Save function
// Save function
const handleConfirmSave = async () => {
  // Close modal first
  setShowSaveModal(false);
    const token = localStorage.getItem('authToken');
  
  if (!token) {
    setSessionExpired(true);
    return;
  }

  setSaving(true);

  try {
    // Get user ID and entity from localStorage
    const userId = localStorage.getItem("userId");
    const entity = localStorage.getItem("entity") || "";

    // Format the date for delivery note
    const formatDateForAPI = (date: Date | string): string => {
      if (typeof date === 'string') {
        return date;
      }
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const formatStockPeriod = (period: string): string => {
      if (!period) return '';
      
      const parts = period.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
      }
      return period;
    };

    // Prepare item list
    const itemList = itemDetails.map(item => ({
      poDetailPk: item.poDetailPk,
      itemId: item.itemId,
      itemName: item.itemName,
      packageId: item.packageId,
      recvdQty: item.editableRecvdQty !== undefined ? item.editableRecvdQty : item.recvdQty,
      poGp: item.poGp,
      batchNo: item.batchNo || '',
      binNo: item.binNo || '',
      expDate: item.expDate ? formatDateForAPI(item.expDate) : ''
    }));

    // Prepare the request body
    const requestBody = {
      period: formatStockPeriod(stockPeriod || ''),
      supplierId: selectedSupplier.id,
      grnDate: formatDateForAPI(new Date()), // Use current date or selected date
      supplierName: selectedSupplier.name,
      poNumber: selectedPo.poNo,
      delNote: delNote,
      delNoteDate: formatDateForAPI(new Date()), // Use current date or selected date
      locId: locationId,
      currencyId: currencyName,
      currencyValue: parseFloat(currencyRate) || 0,
      discAmount: discount,
      entity: entity,
      userFk: userId ? parseInt(userId) : 0,
      supplierInvNo: invoiceNo,
      delType: selectedPo.deliveryType || '',
      itemList: itemList
    };

    console.log('Saving with data:', requestBody);

    // Make the API call
    const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/saveReceiveItemFromSupplier', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
     if (response.status === 401 ) {
        setSessionExpired(true);
        return;
      }

    const data = await response.json();

    if (data.success) {
      toast.success('Data saved successfully!', {
        duration: 2000,
        position: 'top-right',
      });
      
      // Optionally refresh the form after successful save
      setTimeout(() => {
        handleRefresh();
      }, 2000);
    } else {
      toast.error(data.message || 'Failed to save data', {
        duration: 2000,
        position: 'top-right',
      });
    }
  } catch (error) {
      setSessionExpired(true);

    console.error("Error saving data:", error);
    toast.error('Error saving data. Please try again.', {
      duration: 2000,
      position: 'top-right',
    });
  } finally {
    setSaving(false);
  }
};


  const validateDelNote = async (note: string) => {
     const token = localStorage.getItem('authToken');

      if (!token) {
      setSessionExpired(true);
      return;
    }
    if (!note.trim()) {
      setDelNoteError('');
      return;
    }
   

    setDelNoteValidating(true);
    try {
      const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/checkDelNoteNo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delNote: note })
      });
        if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      const data = await response.json();
      
      if (data.success === false) {
        // Del Note already exists
        // setDelNoteError(data.message || 'Del Note No already exists');
        toast.error(data.message || 'Del Note No already exists', {
          duration: 2000,
          position: 'top-right',  
          
        });
        setDelNote("")
      } else {
        // Del Note is new/available
        setDelNoteError('');
        toast.success('Del Note No is available', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      setSessionExpired(true);
      console.error("Error validating Del Note:", error);
      setDelNoteError('Error validating Del Note');
      toast.error('Error validating Del Note', {
        duration: 2000,
        position: 'top-right',
      });
    } finally {
      setDelNoteValidating(false);
    }
  };

  // Function to validate Invoice No via API
// Function to validate Invoice No via API
const validateInvoiceNo = async (invoice: string) => {
    const token = localStorage.getItem('authToken');

  if (!token) {
      setSessionExpired(true);
      return;
    }
  if (!invoice.trim()) {
    setInvoiceNoError('');
    return;
  }
   
  setInvoiceNoValidating(true);
  try {
    const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/checInvNo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ supplierInvNo: invoice })
    });
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

    const data = await response.json();
    
    if (data.success === false) {
      // Invoice No already exists
        toast.error(data.message || 'Invoice No already exists', {
          duration: 2000,
          position: 'top-right',
        });
      } else {
      setInvoiceNoError(''); // MAKE SURE THIS IS SET
      toast.success('Invoice No is available', {
        duration: 2000,
        position: 'top-right',
      });
    }
  } catch (error) {
     setSessionExpired(true);
    console.error("Error validating Invoice No:", error);
    setInvoiceNoError('Error validating Invoice No');
  } finally {
    setInvoiceNoValidating(false);
  }
};

  // Handle Del.Note input change
  const handleDelNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDelNote(value);
    // Clear error when user starts typing
    if (delNoteError) {
      setDelNoteError('');
    }
  };

  // Handle Del.Note blur (when field loses focus)
  const handleDelNoteBlur = () => {
    validateDelNote(delNote);
  };

  // Handle Invoice No input change
  const handleInvoiceNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInvoiceNo(value);
    // Clear error when user starts typing
    if (invoiceNoError) {
      setInvoiceNoError('');
    }
  };

  // Handle Invoice No blur (when field loses focus)
  const handleInvoiceNoBlur = () => {
    
    validateInvoiceNo(invoiceNo);
  };
  
   

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
    const token = localStorage.getItem('authToken');

       if (!token) {
      setSessionExpired(true);
      return;
    }
      try {
          setIsLoading(true);

        const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropDownSupplier',  {
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
      }
      finally{
    setIsLoading(false);

      }
    };
    
    fetchSuppliers();
  }, []);

  // Fetch PO list when supplier is selected
  useEffect(() => {
    if (selectedSupplier.id && stockPeriod) 
      
     {
      const fetchPoList = async () => {
    const token = localStorage.getItem('authToken');

          if (!token) {
      setSessionExpired(true);
      return;
    }
    setIsLoading(true);
    
        try {
          const response = await fetch(`http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropdownPo/${stockPeriod}/${selectedSupplier.id}`,  {
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
            setPoList(data.data || []);
            // Reset PO selection if new supplier has no POs or different POs
            setSelectedPo({ poNo: '', locationId: '', locationName: '', currencyRate: '', currencyName: '',totalCost: '', discount: '',netInvoice: '',deliveryType:''   });
            setLocationId('');
            setLocationName('');
            setCurrencyRate('');
            setcurrencyName('');
            setItemDetails([]); // Clear item details
          }
        } catch (error) {
           setSessionExpired(true);
          console.error("Error fetching PO list:", error);
          setPoList([]);
        }
        finally{
    setIsLoading(false);

        }
      };
      
      fetchPoList();
    } else {
      // Clear PO list when no supplier is selected
      setPoList([]);
      setSelectedPo({ poNo: '', locationId: '', locationName: '', currencyRate: '', currencyName: '',totalCost:'', discount: '',netInvoice: '' ,deliveryType:''  });
      setLocationId('');
      setLocationName('');
      setCurrencyRate('');
      setcurrencyName('');
      setItemDetails([]);
    }
  }, [selectedSupplier.id, stockPeriod]);

  // Fetch item details when PO is selected
  const fetchItemDetails = async (poNumber: string) => {
    if (!poNumber) return;

    const token = localStorage.getItem('authToken');
      if (!token) {   
      setSessionExpired(true);
      return;
    }

    setIsLoading(true);
    try {
      // First, get discount from dropdownPo API
      const dropdownResponse = await fetch(`http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropdownPo/${stockPeriod}/${selectedSupplier.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const dropdownData = await dropdownResponse.json();
      let poDiscount = 0;
      
      if (dropdownData.success && dropdownData.data) {
        // Find the selected PO and extract discount
        const selectedPoData = dropdownData.data.find((po: any) => po.name === poNumber);
        if (selectedPoData) {
          poDiscount = selectedPoData.discount || 0;
          
          // Update selectedPo with discount
          setSelectedPo(prev => ({
            ...prev,

            discount: poDiscount.toString()

          }));
        }
        
      }
      
      // Then fetch item details
      const itemResponse = await fetch(`http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/loadItemDetailsForReceiveFromSupplier/${poNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const itemData = await itemResponse.json();
      if (itemData.success && itemData.data) {
        const items: ItemDetail[] = itemData.data.map((item: any) => ({
          poDetailPk: item.poDetailPk,
          itemId: item.itemId,
          itemName: item.itemName,
          packageId: item.packageId,
          ordQty: item.ordQty,
          prQty: item.prQty,
          recvdQty: item.recvdQty,
          invValue: item.invValue,
          poGp: item.poGp,
          adjValue: item.adjValue,
          totalGp: item.totalGp,
          expDate: item.expDate,
          batchNo: item.batchNo,
          binNo: item.binNo,
          maxAllowedQty: item.ordQty,
          minAllowedQty: 0,
          decimalPrecision: 3,
        }));
        setItemDetails(items);
        
        // Clear any previous errors
        setRecvdQtyErrors({});
        
        // Recalculate totals with the discount from API
        updateCalculations(poDiscount);
      } else {
        setItemDetails([]);
      }
    } catch (error) {
       setSessionExpired(true);
      console.error("Error fetching item details:", error);
      setItemDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

 

  // Update all calculations
 // Update all calculations
const updateCalculations = (discountPercentage?: number) => {
  const discountToUse = discountPercentage !== undefined ? discountPercentage : Number(selectedPo.discount) || 0;
  
  // Calculate total cost using the item's totalGp (which is already Rcvd. Qty * PO GP)
  let calculatedTotalCost = 0;
  for (const item of itemDetails) {
    // Total GP already calculated as Rcvd. Qty * PO GP
    calculatedTotalCost += item.totalGp || 0;
  }
  
  setTotalCost(calculatedTotalCost);
  
  // Calculate discount amount (discount % of total cost)
  const calculatedDiscountAmount = calculatedTotalCost * (discountToUse / 100);
  setDiscount(calculatedDiscountAmount);
  
  // Calculate net invoice (total cost minus discount)
  const calculatedNetInvoice = calculatedTotalCost - calculatedDiscountAmount;
  setNetInvoice(calculatedNetInvoice);
};

  // Function to calculate total cost


  // Function to filter item details based on search term
  const getFilteredItems = (): ItemDetail[] => {
    if (!itemSearchTerm.trim()) {
      return itemDetails;
    }
    
    const searchTerm = itemSearchTerm.toLowerCase();
    
    return itemDetails.filter(item => {
      // Search across all fields
      return (
        item.itemId.toString().toLowerCase().includes(searchTerm) ||
        item.itemName.toLowerCase().includes(searchTerm) ||
        item.packageId.toLowerCase().includes(searchTerm) ||
        item.ordQty.toString().toLowerCase().includes(searchTerm) ||
        item.prQty.toString().toLowerCase().includes(searchTerm) ||
        item.recvdQty.toString().toLowerCase().includes(searchTerm) ||
        item.invValue.toString().toLowerCase().includes(searchTerm) ||
        item.poGp.toString().toLowerCase().includes(searchTerm) ||
        (item.adjValue?.toString().toLowerCase() || '').includes(searchTerm) ||
        item.totalGp.toString().toLowerCase().includes(searchTerm) ||
        item.expDate.toLowerCase().includes(searchTerm) ||
        item.batchNo.toLowerCase().includes(searchTerm) ||
        item.binNo.toLowerCase().includes(searchTerm)
      );
    });
  };

  // Handle PO GP change
  const handlePoGpChange = (index: number, value: number) => {
    setItemDetails(prev => prev.map((item, i) => {
      if (i === index) {
        // Calculate Total GP = Rcvd. Qty * PO GP
        const recvdQty = item.editableRecvdQty !== undefined ? item.editableRecvdQty : item.recvdQty;
        const totalGp = recvdQty * value;
        
        return {
          ...item,
          poGp: value,
          totalGp: totalGp // Update Total GP when PO GP changes
        };
      }
      return item;
    }));
    
    // Recalculate totals after update
    setTimeout(() => {
      updateCalculations();
    }, 0);
  };

  // Handle received quantity change with validation
// Handle received quantity change with validation
// Handle received quantity change with validation
const handleRecvdQtyChange = (index: number, value: number, originalRecvdQty?: number) => {
  const currentItem = itemDetails[index];
  
  // Get original received quantity if not provided
  const originalQty = originalRecvdQty !== undefined ? originalRecvdQty : currentItem.recvdQty;
  
  // First check: cannot exceed original received quantity
  if (value > originalQty) {
    setRecvdQtyErrors(prev => ({
      ...prev,
      [index]: `Cannot exceed original received quantity: ${originalQty}`
    }));
    return;
  }
  
  // Validate the input (removed decimal precision validation)
  const validation = validateRecvdQty(value, currentItem);
  
  if (!validation.isValid) {
    // Show error
    setRecvdQtyErrors(prev => ({
      ...prev,
      [index]: validation.error || 'Invalid value'
    }));
    return;
  }
  
  // Clear any existing error
  setRecvdQtyErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[index];
    return newErrors;
  });
  
  // Update the item with validated value
  const validatedValue = validation.validatedValue || value;
  
  setItemDetails(prev => prev.map((item, i) => {
    if (i === index) {
      // Calculate Total GP = Rcvd. Qty * PO GP
      const recvdQty = validatedValue;
      const poGp = item.poGp;
      const totalGp = recvdQty * poGp;
      
      return {
        ...item,
        editableRecvdQty: validatedValue,
        totalGp: totalGp // Update Total GP when received quantity changes
      };
    }
    return item;
  }));
  
  // Recalculate totals after update

};

  // Update calculations whenever itemDetails or discount changes
  useEffect(() => {
    updateCalculations();
  }, [itemDetails, discount]);

  // Define columns
  const columns = React.useMemo(() => [
    columnHelper.accessor("itemId", {
    cell: (info) => <p className="text-[11px]  text-left w-full text-black">{info.getValue()}</p>,
      header: () => <span className="text-[12px]">Item Id</span>,
    }),
    columnHelper.accessor("itemName", {
      header: () => <span className="text-[12px]">Item Name</span>,
 cell: (info) => <p className=" text-[11px] whitespace- text-left w-full text-black">{info.getValue()}</p>,
    }),
    columnHelper.accessor("packageId", {
      header: () => <span className="text-[12px]">Package Id</span>,
     cell: (info) => <p className="text-[11px] whitespace-nowrap  text-black">{info.getValue()}</p>,
    }),
    columnHelper.accessor("ordQty", {
      header: () => <span className="text-[12px]">Ord. Qty</span>,
      
      // cell: (info) => <p className="text-black text-[11px] text-right w-full">{info.getValue().toFixed(2)}</p>,
       cell: (info: any) => { 
      const value = info.row.original.ordQty || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
    }),
    columnHelper.accessor("invValue", {
      header: () => <span className="text-[12px]">Ord. Inv. Value</span>,
      // cell: (info) => <h6 className="text-black text-[11px] text-right w-full ">{info.getValue().toFixed(2)}</h6>,
        cell: (info: any) => { 
      const value = info.row.original.invValue || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
    }),
    columnHelper.accessor("prQty", {
      header: () => <span className="text-[12px]">PR. Qty</span>,
      // cell: (info) => <h6 className="text-black text-[11px] text-right w-full ">{info.getValue().toFixed(2)}</h6>,
        cell: (info: any) => { 
      const value = info.row.original.prQty || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
    }),
columnHelper.accessor("recvdQty", {
  header: () => <span className="text-[12px]">Rcvd. Qty</span>,
  cell: (info) => {
    const index = info.row.index;
    const item = info.row.original;
    const tabIndex = info.tabIndex; // Get tabIndex from context
    
    // Get the ORIGINAL received quantity from the API (the value shown in table)
    const originalRecvdQty = info.getValue(); // This is the value from API data
    
    // Use editableRecvdQty if exists, otherwise use the original value
    const currentEditableValue = item.editableRecvdQty !== undefined 
      ? item.editableRecvdQty 
      : originalRecvdQty;
    
    const hasError = !!recvdQtyErrors[index];
    
    // State to track input value for real-time validation
    const [inputValue, setInputValue] = useState(currentEditableValue.toString());
    
    // Update input value when the prop changes
    useEffect(() => {
      setInputValue(currentEditableValue.toString());
    }, [currentEditableValue]);
    
    // Function to find next input in tab order
    const findNextInput = (currentElement: HTMLInputElement, direction: 'next' | 'prev' = 'next') => {
      const allInputs = Array.from(document.querySelectorAll('input:not([disabled])'));
      const currentIndex = allInputs.indexOf(currentElement);
      
      if (direction === 'next') {
        return allInputs[currentIndex + 1];
      } else {
        return allInputs[currentIndex - 1];
      }
    };
    
    return (
      <div className="relative">
        <input
          type="text"
         
          value={inputValue}
          tabIndex={tabIndex}
          onChange={(e) => {
            const rawValue = e.target.value;
            
            // Handle empty input
            if (rawValue === '') {
              setInputValue('');
              return;
            }
            
            // Allow numbers, decimal point, and negative sign
            if (!/^-?[0-9]*\.?[0-9]*$/.test(rawValue)) {
              // Revert to previous value
              e.target.value = inputValue;
              return;
            }
            
            // If it's just a decimal point or starts with decimal, prepend 0
            let processedValue = rawValue;
            if (rawValue === '.') {
              processedValue = '0.';
            } else if (rawValue.startsWith('.')) {
              processedValue = '0' + rawValue;
            } else if (rawValue === '-.') {
              processedValue = '-0.';
            } else if (rawValue.startsWith('-.') && rawValue.length > 2) {
              processedValue = '-0.' + rawValue.substring(2);
            }
            
            // Parse the number
            const numValue = parseFloat(processedValue);
            
            // Check if value exceeds original received quantity
            if (!isNaN(numValue) && numValue > originalRecvdQty) {
              // Don't allow values greater than original
              setInputValue(originalRecvdQty.toString());
            } else {
              // Allow the change (no decimal restrictions)
              setInputValue(processedValue);
            }
          }}
          onKeyDown={(e) => {
            // Handle Tab key navigation
            if (e.key === 'Tab') {
              e.preventDefault(); // Prevent default tab behavior
              
              const currentInput = e.currentTarget;
              const shiftKey = e.shiftKey;
              
              // Find next or previous input
              const nextInput = findNextInput(currentInput, shiftKey ? 'prev' : 'next');
              
              if (nextInput) {
                nextInput.focus();
              }
              return;
            }
            
            // Allow all control keys
            if (e.ctrlKey || e.metaKey) {
              return;
            }
            
            // Allow navigation and editing keys
            const allowedKeys = [
              'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Enter', 'Escape', 'Home', 'End'
            ];
            
            if (allowedKeys.includes(e.key)) {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
              return;
            }
            
            // Allow decimal point only once
            if (e.key === '.') {
              const currentValue = e.currentTarget.value;
              if (currentValue.includes('.')) {
                e.preventDefault(); // Prevent second decimal point
              }
              return;
            }
            
            // Allow digits 0-9, minus sign (only at beginning)
            if (e.key === '-') {
              const currentValue = e.currentTarget.value;
              const selectionStart = (e.target as HTMLInputElement).selectionStart;
              if (currentValue.includes('-') || selectionStart !== 0) {
                e.preventDefault();
              }
              return;
            }
            
            // Allow only digits 0-9
            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onBlur={(e) => {
            const rawValue = e.target.value;
            
            // Handle empty input or invalid
            if (rawValue === '' || rawValue === '.' || rawValue === '-' || rawValue === '-.') {
              handleRecvdQtyChange(index, 0, originalRecvdQty);
              return;
            }
            
            const numValue = parseFloat(rawValue);
            if (!isNaN(numValue)) {
              // Final validation: cannot exceed original received quantity
              if (numValue > originalRecvdQty) {
                // Show error
                setRecvdQtyErrors(prev => ({
                  ...prev,
                  [index]: `Cannot exceed original received quantity: ${originalRecvdQty}`
                }));
                
                // Reset to original value
                handleRecvdQtyChange(index, originalRecvdQty, originalRecvdQty);
                setInputValue(originalRecvdQty.toString());
              } else {
                // Allow the value (0 to originalRecvdQty)
                handleRecvdQtyChange(index, numValue, originalRecvdQty);
              }
            } else {
              // Invalid number, reset to current value
              handleRecvdQtyChange(index, currentEditableValue, originalRecvdQty);
              setInputValue(currentEditableValue.toString());
            }
          }}
          className={`  w-24 px-2 text-[11px] py-1 border rounded text-black text-center ${
            hasError 
              ? 'border-red-500 bg-red-50 text-red-700' 
              : 'border-blue-500'
          }`}
        />
        {hasError && (
          <div className="absolute z-10 mt-1 w-48 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg text-sm text-red-700">
            {recvdQtyErrors[index]}
          </div>
        )}
      </div>
    );
  },
}),
   columnHelper.accessor("poGp", {
  header: () => <span className="text-[12px]">PO GP</span>,
    //  cell: (info) => <h6 className=" text-[11px]  text-black text-right w-full">{info.getValue()}</h6>,
     cell: (info: any) => { 
      const value = info.row.original.poGp || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
    }),

    columnHelper.accessor("adjValue", {
      header: () => <span className="text-[12px]">Adjust</span>,
      // cell: (info) => <h6 className=" text-[11px]  text-black text-right w-full">{info.getValue() ? info.getValue().toFixed(2) : '0.00'}</h6>,
       cell: (info: any) => { 
      const value = info.row.original.adjValue || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
    }),
   columnHelper.accessor("totalGp", {
  header: () => <span className="text-[12px]">Total GP</span>,
  cell: (info) => {
    const item = info.row.original;
    // Calculate Total GP = Rcvd. Qty * PO GP
    const recvdQty = item.editableRecvdQty !== undefined ? item.editableRecvdQty : item.recvdQty;
    const poGp = item.poGp || 0;
    const calculatedTotalGp = recvdQty * poGp;
    
    return <h6 className="text-[11px]  text-black text-right w-full">{calculatedTotalGp.toFixed(2)}</h6>;
  },
}),
    columnHelper.accessor("expDate", {
      header: () => <span  className="text-[12px]">ExpDate</span>,
      cell: (info) => {
        const dateString = info.getValue();
        if (!dateString) return <h6 className=" text-[11px] whitespace-nowrap  text-center w-full text-black">-</h6>;
        
        try {
          const datePart = dateString.split('T')[0];
          const [year, month, day] = datePart.split('-');
          return <h6 className=" text-[11px] whitespace-nowrap  text-black">{`${day}-${month}-${year}`}</h6>;
        } catch (error) {
           setSessionExpired(true);
          console.error("Error formatting date:", error, dateString);
          return <h6 className="text-[11px]  text-black">-</h6>;
        }
      },
    }),
   // Update batchNo column
columnHelper.accessor("batchNo", {
  header: () => <span  className="text-[12px]">BatchNo</span>,
  cell: (info) => {
    const [value, setValue] = useState(info.getValue());
    const tabIndex = info.tabIndex;
    
    useEffect(() => {
      setValue(info.getValue());
    }, [info.getValue()]);

    const findNextInput = (currentElement: HTMLInputElement, direction: 'next' | 'prev' = 'next') => {
      const allInputs = Array.from(document.querySelectorAll('input:not([disabled])'));
      const currentIndex = allInputs.indexOf(currentElement);
      
      if (direction === 'next') {
        return allInputs[currentIndex + 1];
      } else {
        return allInputs[currentIndex - 1];
      }
    };

    const handleChange = (e) => {
      const newValue = e.target.value;
      setValue(newValue);
    };

    return (
      <div className="flex gap-2">
        <input
          value={value}
          onChange={handleChange}
          tabIndex={tabIndex + 1}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const currentInput = e.currentTarget;
              const shiftKey = e.shiftKey;
              const nextInput = findNextInput(currentInput, shiftKey ? 'prev' : 'next');
              
              if (nextInput) {
                nextInput.focus();
              }
            }
          }}
          className="w-20 text-[11px] h-8 border border-blue-500 rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }
}),

// Update binNo column
columnHelper.accessor("binNo", {
  header: () => <span  className="text-[12px]">BinNo</span>,
  cell: (info) => {
    const [value, setValue] = useState(info.getValue());
    const tabIndex = info.tabIndex;
    
    useEffect(() => {
      setValue(info.getValue());
    }, [info.getValue()]);

    const findNextInput = (currentElement: HTMLInputElement, direction: 'next' | 'prev' = 'next') => {
      const allInputs = Array.from(document.querySelectorAll('input:not([disabled])'));
      const currentIndex = allInputs.indexOf(currentElement);
      
      if (direction === 'next') {
        return allInputs[currentIndex + 1];
      } else {
        return allInputs[currentIndex - 1];
      }
    };

    const handleChange = (e) => {
      const newValue = e.target.value;
      setValue(newValue);
    };

    return (
      <div className="flex gap-2">
        <input
          value={value}
          onChange={handleChange}
          tabIndex={tabIndex + 2}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const currentInput = e.currentTarget;
              const shiftKey = e.shiftKey;
              const nextInput = findNextInput(currentInput, shiftKey ? 'prev' : 'next');
              
              if (nextInput) {
                nextInput.focus();
              }
            }
          }}
          className="w-20 text-[11px] h-8 border r border-blue-500 rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }
}),
  ], [recvdQtyErrors, itemDetails]);

  const filteredSuppliers = suppliers.filter((supplier: any) =>
    supplier.supplierId?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.supplierName?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredPoList = poList.filter((po: any) =>
    po.name?.toLowerCase().includes(poSearch.toLowerCase())
  );

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
    } catch (error) {setSessionExpired
       (true);
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };

  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);

  const [toDate, setToDate] = useState(() => {
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });
  
  const [columnVisibility, setColumnVisibility] = React.useState({});

  // Get filtered items based on search term
  const filteredItems = getFilteredItems();

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });
  
  const handleSupplierSelect = (supplier: any) => {
    setSelectedSupplier({
      id: supplier.supplierId,
      name: supplier.supplierName
    });
    setSupplierName(supplier.supplierName);
    setIsOpen(false);
    setSupplierSearch('');
    
    // Clear PO and location fields when supplier changes
    setPoList([]);
    setSelectedPo({ poNo: '', locationId: '', locationName: '', currencyRate: '', currencyName: '' , totalCost: '', discount: '', netInvoice: '', deliveryType:''  });
    setLocationId('');
    setLocationName('');
    setCurrencyRate('');
    setcurrencyName('');
    setItemDetails([]);
    setRecvdQtyErrors({});
    setItemSearchTerm(''); // Clear search term
    
    // Close PO dropdown if open
    setIsOpenPo(false);
  };

  const handlePoSelect = (po: any) => {
    setSelectedPo({
      poNo: po.name,
      locationId: po.locationId,
      locationName: po.locationName,
      currencyRate: po.currencyRate || '',
      currencyName: po.currencyName || '',
      discount: po.discount || 0  // Add discount from API
      , totalCost: po.totalCost || '',
      netInvoice: po.netInvoice || '',
       deliveryType: po.deliveryType || ''
    });
    
    // Update location fields
    setLocationId(po.locationId || '');
    setLocationName(po.locationName || '');
    setCurrencyRate(po.currencyRate || '');
    setcurrencyName(po.currencyName || '');
    
    setIsOpenPo(false);
    setPoSearch('');
    setItemSearchTerm(''); // Clear search term when PO changes
    
    // Fetch item details for the selected PO
    fetchItemDetails(po.name);
  };

  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
    handleRefresh();
  };

  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
  };
  const [fromDate,] = useState(() => {
    const offset = twoYearsAgo.getTimezoneOffset();
    const localDate = new Date(twoYearsAgo.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });

  let content;
if (showTable) {
  content = <StockReceiveTable onBack={handleAddClick} />;
} else {
  content = (
  
  // <div className="space-y-4 w-full max-w-[1050px] mx-auto px-2 sm:px-4">
    
    <div className="bg-white max-w-[1050px] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 sm:p-4">
    
        {/* Stats Cards - Responsive Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
  {/* GRN Card */}
  <Card className="border-l-8 border-purple-500 shadow-sm p-2 h-9">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-purple-500 rounded-lg">
        <FaReceipt className="w-3 h-3 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-black dark:text-white">
          GRN: <span className="font-bold">#Auto</span>
        </p>
      </div>
    </div>
  </Card>

  {/* Period Card */}
  <Card className="border-l-8 border-blue-500 shadow-sm p-2 h-9">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-blue-500 rounded-lg">
        <FaCalendarAlt className="w-3 h-3 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-black dark:text-white">
          Period: <span className="font-bold">{formatPurchasePeriod(stockPeriod || '')}</span>
        </p>
      </div>
    </div>
  </Card>

  {/* Delivery Card */}
  <Card className="border-l-8 border-emerald-500 shadow-sm p-2 h-9">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-emerald-500 rounded-lg">
        <FaTruck className="w-3 h-3 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-black dark:text-white">
          Delivery: <span className="font-bold">{(stockPeriod || '')}</span>
        </p>
      </div>
    </div>
  </Card>

  {/* Items Card */}
  <Card className="border-l-8 border-amber-500 shadow-sm p-2 h-9">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-amber-500 rounded-lg">
        <FaBoxOpen className="w-3 h-3 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-black dark:text-white">
          Items: <span className="font-bold">{itemDetails.length}</span>
        </p>
      </div>
    </div>
  </Card>
</div>

<div className="h-1.5"></div>

{/* Supplier & Location Details */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
  {/* Supplier Card */}
 <Card className="border border-blue-300 relative pt-2 h-45">
    <div className="absolute -top-2 left-3 px-1.5 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-1">
        <div className="p-0.5 bg-blue-100 rounded dark:bg-gray-800">
          <FaTruck className="w-3 h-3 text-blue-600 dark:bg-gray-800" />
        </div>
        <h3 className="text-xs font-semibold text-blue-600 dark:bg-gray-800">SUPPLIER</h3>
          <Tooltip content="Select the supplier for this Receive Item From Supplier" className="z-50 w-40" placement="top">
              <div className="cursor-help ml-0.5">
                <HiInformationCircle className="w-3.5 h-3.5 text-blue-500 dark:text-blue-500 dark:hover:text-blue-300" />
              </div>
            </Tooltip>
      </div>
    </div>

    <div className="h-2"></div>

    <div className="mt-3">
      {/* Supplier & PO with Supplier Name */}
      <div className="flex items-s gap-2">
        <div ref={supplierDropdownRef} className="relative flex-1 border border-gray-400 bg--100 p-0.5 dark:bg--900 rounded-md">
          <div
            className={`h-9 flex items-center justify-between px-2 cursor-pointer text-xs 
              ${selectedSupplier.id ? 'text-black bg--200' : 'hover:bg-gray-50'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-1.5 truncate">
              <FaUser className={`w-3 h-3 ${selectedSupplier.id ? 'text-blue-500' : 'text-black'}`} />
              <div className="truncate">
                <span className="font-medium text-black">
                  {selectedSupplier.id || 'Select supplier'}<span className="text-red-500 ml-0.5">*</span>
                </span>
                {/* Supplier Name - appears below ID when selected */}
                {selectedSupplier.id && selectedSupplier.name && (
                  <span className="block text-[10px] truncate leading-tight text-blue-700">
                    {selectedSupplier.name}
                  </span>
                )}
              </div>
            </div>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden min-w-[350px]">
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                {/* Please Select a Supplier */}
                <div
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    handleSupplierSelect({ supplierId: '', supplierName: '' });
                    setIsOpen(false);
                    setSupplierSearch('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs text-gray-500">📌</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Please Select a Supplier</span>
                  </div>
                </div>

                {/* Supplier Options */}
                {filteredSuppliers.map((supplier: any, index: number) => (
                  <div
                    key={supplier.pk}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                    onClick={() => {
                      handleSupplierSelect(supplier);
                      setIsOpen(false);
                      setSupplierSearch('');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedSupplier?.pk === supplier.pk
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}>
                          <span className="text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {supplier.supplierId} - {supplier.supplierName}
                          </div>
                        </div>
                      </div>
                      {selectedSupplier?.pk === supplier.pk && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* No Results */}
                {filteredSuppliers.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-sm text-gray-500">No suppliers found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-500 text-center">
                  {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          )}
        </div>

        <div ref={poDropdownRef} className="relative flex-1 border border-gray-300 bg--200 p-0.5 dark:bg--900 rounded-md border-gray-400">
          <div
            className={`h-9 flex items-center justify-between px-2 cursor-pointer text-xs
              ${selectedPo.poNo ? 'text-black bg--200' : ''}
              ${!selectedSupplier.id || poList.length === 0 ? 'opacity-50' : ''}`}
            onClick={() => selectedSupplier.id && poList.length > 0 && setIsOpenPo(!isOpenPo)}
          >
            <div className="flex items-center gap-1.5 truncate">
              <div className={`p-1 rounded-full ${selectedPo.poNo ? 'bg-green-100' : 'bg-gray-100'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2-10H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <span className="truncate font-medium">
                {selectedPo.poNo || (poList.length === 0 && selectedSupplier.id ? 'No POs' : 'Select PO')}
                <span className="text-red-500 ml-0.5">*</span>
              </span>
            </div>
            <svg className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isOpenPo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isOpenPo && poList.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg overflow-hidden min-w-[300px]">
              {/* Search Header */}
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search PO..."
                    value={poSearch}
                    onChange={(e) => setPoSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Options List */}
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                {/* Please Select a PO */}
                <div
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    handlePoSelect({ locationId: '', locationName: '' });
                    fetchItemDetails('');
                    setItemDetails([]);
                    setIsOpenPo(false);
                    setPoSearch('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-500">📌</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Please Select a PO</span>
                  </div>
                </div>

                {/* PO Options */}
                {filteredPoList.map((po: any, index: number) => (
                  <div
                    key={po.pk}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                    onClick={() => {
                      handlePoSelect(po);
                      setIsOpenPo(false);
                      setPoSearch('');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedPo?.pk === po.pk
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 group-hover:bg-blue-100'
                        }`}>
                          <span className="text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{po.name}</div>
                          <div className="text-xs text-gray-600">{po.locationName}</div>
                        </div>
                      </div>
                      {selectedPo?.pk === po.pk && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* No Results */}
                {filteredPoList.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-sm text-gray-500">No POs found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-500 text-center">
                  {filteredPoList.length} PO{filteredPoList.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-2"></div>
      <div className="h-2"></div>

      {/* Del.Note & Invoice */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={delNote}
            onChange={handleDelNoteChange}
            onBlur={handleDelNoteBlur}
            placeholder="Del.Note *"
            maxLength={50}
            className={`w-full h-10 px-2 text-xs border rounded-md focus:outline-none focus:border-blue-500 text-black pr-16
              ${delNoteError ? 'border-red-500 bg-red-50' : 'border-gray-400'}`}
            disabled={delNoteValidating}
          />
          {delNoteValidating && <Spinner className="absolute right-2 top-2.5 h-4 w-4" />}
          {!delNoteValidating && delNote && (
            <span className="absolute right-2 top-2.5 text-xs text-gray-400">
              {delNote.length}/50
            </span>
          )}
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={invoiceNo}
            onChange={handleInvoiceNoChange}
            onBlur={handleInvoiceNoBlur}
            placeholder="Invoice No"
            maxLength={50}
            className={`w-full h-10 px-2 text-xs border pr-16 rounded-md focus:outline-none focus:border-blue-500 text-black
              ${invoiceNoError ? 'border-red-500 bg-red-50' : 'border-gray-400'}`}
            disabled={invoiceNoValidating}
          />
          {!invoiceNoValidating && invoiceNo && (
            <span className="absolute right-2 top-2.5 text-xs text-gray-400">
              {invoiceNo.length}/50
            </span>
          )}
        </div>
      </div>
     
      <div className="h-2"></div>
      
      <div className="relative px-1.5 bg- mt-3">
        <p className="absolute -translate-y-3 translate-x-2 bg-white dark:text-white px-1 text-black z-10 dark:bg-gray-800">
          Dt.Of.Dn<span className="text-red-500 ml-0.5">*</span>
        </p>
        <CalendarStockReceive
          id="actualDelDate"
          label=""
          placeholder="hd"
          required={true}
          selected={toDate ? new Date(toDate) : currentDate}
          onChange={(date: Date | null) => {
            if (date) {
              const offset = date.getTimezoneOffset();
              const localDate = new Date(date.getTime() - offset * 60 * 1000);
              setToDate(localDate.toISOString().split('T')[0]);
            }
            setShowCalendar(false);
          }}
          minDate={fromDate ? new Date(fromDate) : twoYearsAgo}
          maxDate={currentDate}
        />
      </div>
    </div>
  </Card>

  {/* Location Card */}
  <Card className="border border-blue-300 relative pt-1 h-45">
    <div className="absolute -top-2 left-3 px-1.5 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-1">
        <div className="p-0.5 rounded">
          <FaMapMarkerAlt className="w-3 h-3 text-red-600" />
        </div>
        <h3 className="text-xs font-semibold text-blue-600">LOCATION</h3>
          <Tooltip content=" location for this Receive Item From Supplier" className="z-50 w-40" placement="top">
              <div className="cursor-help ml-0.5">
                <HiInformationCircle className="w-3.5 h-3.5 text-blue-500 dark:text-blue-500 dark:hover:text-blue-300" />
              </div>
            </Tooltip>
      </div>
    </div>

    <div className="mt-3">
      {/* Location Selector */}
      <div className="border border-gray-400 rounded-md mb-2">
        <div className="h-9 flex items-center px-2">
          <FaMapPin className="w-3 h-3 text-red-600 mr-1.5" />
          <span className="text-xs truncate text-black">
            {locationId ? `${locationId} - ${locationName}` : 'Select location'}
          </span>
        </div>
      </div>
      <div className="h-2"></div>

      {/* Currency & Totals */}
      <div className="flex gap-1.5">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <label className="block text-[9px] font-medium text-gray-500 text-right dark:text-gray-400 mb-0.5 uppercase tracking-wider whitespace-nowrap">Currency ID/Rate</label>
            <div className="text-sm font-semibold text-right text-gray-900 dark:text-white">{currencyName ? `${currencyName} - ${currencyRate}` : ''}</div> 
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <label className="block text-[9px] font-medium text-gray-500 text-right dark:text-gray-400 mb-0.5 uppercase tracking-wider whitespace-nowrap">Total Cost</label>
            <div className="text-sm font-semibold text-right text-blue-600 dark:text-blue-400">{formatValue(totalCost)}</div> 
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <label className="block text-[9px] font-medium text-gray-500 text-right dark:text-gray-400 mb-0.5 uppercase tracking-wider whitespace-nowrap">Discount Amount</label>
            <div className="text-sm font-semibold text-right text-green-600 dark:text-green-400">{formatValue(discount)}</div> 
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5 text-right uppercase tracking-wider whitespace-nowrap">Net Invoice</label>
            <div className="text-sm font-semibold text-right text-pink-600 dark:text-pink-400">{formatValue(netInvoice)}</div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</div>

<div className="h-2"></div>

<div className="relative w-full lg:w-64 lg:ml-170">
  <input
    type="text"
    placeholder={`Search ${itemDetails.length} items...`}
    value={itemSearchTerm}
    onChange={e => setItemSearchTerm(e.target.value)}
    className="w-80 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  />
</div>

<div className="h-2"></div>
 
<div className="overflow-x-auto">
  {isLoading ? (
    <div className="flex justify-center items-center h-24">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-xs text-black">Loading item details...</span>
    </div>
  ) : (
    <>
      <div className="min-w-[1000px] lg:min-w-full">
        {/* Single Table Container */}
        <div className="border border-gray-200 rounded-md overflow-hidden h-60">
          <div className="overflow-auto h-full">
            <table className="w-full border-collapse">
              <thead className="bg-blue-600 sticky top-0 z-10">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className="px-1.5 py-1 text-left text-[9px] font-semibold text-white uppercase whitespace-nowrap"
                        style={{ width: header.getSize() }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              
              {/* Scrollable Body */}
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-blue-50 even:bg-gray-50"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id} 
                          className="px-1.5 py-1"
                          style={{ width: cell.column.getSize() }}
                        >
                          <div className="flex items-center min-h-[24px]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={table.getAllColumns().length} className="px-3 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-1.5 bg-blue-100 rounded-lg mb-1.5">
                          <FaBoxOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <h4 className="text-xs font-semibold text-black mb-0.5">No Items Loaded</h4>
                        <p className="text-black text-[11px] max-w-md">
                          Select a supplier and PO number to load item details.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Row count indicator with scroll message */}
        {table.getRowModel().rows.length > 0 && (
          <div className="mt-1 text-[10px] text-gray-500 flex justify-between">
            <span>
              Showing {Math.min(5, table.getRowModel().rows.length)} of {table.getRowModel().rows.length} items
            </span>
            {table.getRowModel().rows.length > 5 && (
              <span className="text-blue-600">(Scroll for more)</span>
            )}
          </div>
        )}
      </div>
      
      {itemSearchTerm && filteredItems.length > 0 && (
        <div className="p-1.5 text-[9px] text-black border-t border-gray-200 bg-gray-50">
          Found {filteredItems.length} of {itemDetails.length} records matching "{itemSearchTerm}"
        </div>
      )}
    </>
  )}
</div>

    </div>
  );
}

return (
  <>
    <Toaster 
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
      }}
    />
    
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
      {showTable ? (
        <div className="flex flex-wrap gap-2 mt- w-full">
          {/* Add buttons for table view if needed */}
        </div>
      ) : (
        <>
<Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-2 mt-2 w-full">
  <div className="flex flex-wrap items-center justify-between gap-2">
    {/* Left section with title and tooltip */}
    <div className="flex items-center gap-2">
      <h1 className="text-base sm:text-lg md:text-xl lg:text-xl text-indigo-700 whitespace-nowrap">
        Receive Item From Supplier
      </h1>
      
      <div className="relative inline-block">
        <Tooltip
          content={
            <div className="text-xs max-w-xs w-40">
              <p className="font-semibold mb-1">Quick Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Review items</li>
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
    </div>

    {/* Right section with buttons */}
    <div className="flex gap-2 justify-end items-center ml-auto">
      <div className="flex gap-3">
        <Tooltip content="Save" className="z-50" placement="bottom">
          <Button
            color="success"
            size="md"
            className="w-9 h-9 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            onClick={handleSaveClick}
            disabled={saving || isLoading}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FaSave className="w-4 h-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Refresh" className="z-50" placement="bottom">
          <Button
            color="warning"
            size="md"
            className="w-9 h-9 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            onClick={handleRefresh}
          >
            <HiRefresh className="w-5 h-5" />
          </Button>
        </Tooltip>

        <Tooltip content="list" className="z-50" placement="bottom">
          <Button
            color="primary"
            size="md"
            className="w-9 h-9 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={handleListClick}
          >
            <HiViewList className="w-5 h-5" />
          </Button>
        </Tooltip>
      </div>
    </div>
  </div>
</Card>
        </>
      )}
    </div>
    
    {content}
    
    {showSaveModal && (
      <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)} size="md">
        <ModalHeader>Confirm Save</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-center justify-center text-6xl text-blue-500 mb-4">
              <FaSave />
            </div>
            <p className="text-black dark:text-black text-center">
              Are you sure you want to save this receive item from supplier record?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            color="success"
            onClick={handleConfirmSave}
            disabled={saving}
            className="min-w-[100px]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowSaveModal(false)}
            disabled={saving}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    )}
    
    {sessionExpired && <SessionModal/>}

    {isLoading && (
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="text-black dark:text-black font-medium">Loading...</span>
        </div>
      </div>
    )}
  </>
);
};

export default ReceiveItemFromSupplier;