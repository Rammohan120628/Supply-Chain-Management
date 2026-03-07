// import { Button, Label } from "flowbite-react";
// import { useState, useEffect ,useRef} from 'react';
// import {
//   createColumnHelper,
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
// } from "@tanstack/react-table";

// import {  HiRefresh, HiViewList } from 'react-icons/hi';
// import StockReceiveTable from "./StockReceiveTable";
// import React from "react";
// import { FaSave } from "react-icons/fa";
// import CalendarStockReceive from "./CalenderSrockReceive";
// import toast, { Toaster } from 'react-hot-toast'; // Import toast
// export interface TableTypeDense {
//   avatar?: any;
//   name?: string;
//   post?: string;
//   pname?: string;
//   teams: {
//     id: string;
//     color: string;
//     text: string;
//   }[];
//   status?: string;
//   statuscolor?: string;
//   budget?: string;
// } 

// export interface ItemDetail {
//   poDetailPk: number;
//   itemId: number;
//   itemName: string;
//   packageId: string;
//   ordQty: number;
//   prQty: number;
//   recvdQty: number;
//   invValue: number;
//   poGp: number;
//   adjValue?: number;
//   totalGp: number;
//   expDate: string;
//   batchNo: string;
//   binNo: string;
//   // For editing received quantity
//   editableRecvdQty?: number;
//   // Validation limits
//   maxAllowedQty?: number;
//   minAllowedQty?: number;
//   decimalPrecision?: number;
// }

// const columnHelper = createColumnHelper<ItemDetail>();

// // Function to validate received quantity input
// const validateRecvdQty = (
//   value: number, 
//   item: ItemDetail
// ): { isValid: boolean; error?: string; validatedValue?: number } => {
  
//   // Check for negative values
//   if (value < 0) {
//     return { 
//       isValid: false, 
//       error: 'Negative values are not allowed' 
//     };
//   }
  
//   // Check minimum allowed quantity (default 0)
//   const minAllowed = item.minAllowedQty || 0;
//   if (value < minAllowed) {
//     return { 
//       isValid: false, 
//       error: `Value cannot be less than ${minAllowed}` 
//     };
//   }
  
//   // Check maximum allowed quantity (if specified)
//   if (item.maxAllowedQty !== undefined && value > item.maxAllowedQty) {
//     return { 
//       isValid: false, 
//       error: `Value cannot exceed ${item.maxAllowedQty}` 
//     };
//   }
  
//   // REMOVED: Decimal precision check
  
//   return { isValid: true, validatedValue: value };
// };

// // Special validator for decimal precision scenarios


// const ReceiveItemFromSupplier = () => {
//   const [supplierSearch, setSupplierSearch] = useState('');
//   const [poSearch, setPoSearch] = useState('');
//   const [showTable, setShowTable] = useState(false);
//   const [, setShowForm] = useState(true);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isOpenPo, setIsOpenPo] = useState(false);
//   const [, setDeliveryDate] = useState<Date | null>(null);
//     const [delNote, setDelNote] = useState('');
//   const [invoiceNo, setInvoiceNo] = useState('');
//   const [delNoteError, setDelNoteError] = useState('');
//   const [invoiceNoError, setInvoiceNoError] = useState('');
//   const [delNoteValidating, setDelNoteValidating] = useState(false);
//   const [invoiceNoValidating, setInvoiceNoValidating] = useState(false);
//   const [saving, setSaving] = useState(false);
//   // Add search state for item details table
//   const [itemSearchTerm, setItemSearchTerm] = useState('');

//   const stockPeriod = localStorage.getItem("stockPeriod");
  
//   // State for supplier data
//   const [suppliers, setSuppliers] = useState([]);
//   const [selectedSupplier, setSelectedSupplier] = useState({ id: '', name: '' });
  
//   // State for PO data
//   const [poList, setPoList] = useState([]);
//   // Update the selectedPo state type
//   const [selectedPo, setSelectedPo] = useState({ 
//     poNo: '', 
//     locationId: '', 
//     locationName: '', 
//     currencyRate: '', 
//     currencyName: '',
//     discount: '',  // Add discount field
//     totalCost: '',
//     netInvoice: '',
//     deliveryType:''
//   });
  
//   // State for form fields
//   const [supplierName, setSupplierName] = useState('');
//   const [locationId, setLocationId] = useState('');
//   const [locationName, setLocationName] = useState('');
//   const [currencyRate, setCurrencyRate] = useState('');
//   const [currencyName, setcurrencyName] = useState('');
  
//   // State for item details
//   const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [recvdQtyErrors, setRecvdQtyErrors] = useState<{[key: number]: string}>({});
  
//   // State for calculations
//   const [totalCost, setTotalCost] = useState(0);
//   const [discount, setDiscount] = useState(0);
//   const [netInvoice, setNetInvoice] = useState(0);
  
//   const token = localStorage.getItem("authToken");
// // Add refs for dropdowns
// const supplierDropdownRef = useRef<HTMLDivElement>(null);
// const poDropdownRef = useRef<HTMLDivElement>(null);

// // Update the useEffect for click outside
// useEffect(() => {
//   const handleClickOutside = (event: MouseEvent) => {
//     // Check if click is outside both dropdowns
//     if (
//       supplierDropdownRef.current && 
//       !supplierDropdownRef.current.contains(event.target as Node) &&
//       poDropdownRef.current && 
//       !poDropdownRef.current.contains(event.target as Node)
//     ) {
//       setIsOpen(false);
//       setIsOpenPo(false);
//     }
//   };

//   document.addEventListener('mousedown', handleClickOutside);
//   return () => {
//     document.removeEventListener('mousedown', handleClickOutside);
//   };
// }, []);
//   // Parse stock period date for minDate in calendar
//   const parseStockPeriodDate = () => {
//     if (!stockPeriod) return new Date(2000, 0, 1);
    
//     const parts = stockPeriod.split('-');
//     if (parts.length === 3) {
//       const day = parseInt(parts[0], 10);
//       const month = parseInt(parts[1], 10) - 1;
//       const year = parseInt(parts[2], 10);
//       return new Date(year, month, day);
//     }
//     return new Date(2000, 0, 1);
//   };

//    const handleRefresh = () => {
//     // Clear all form fields and state
//     setSupplierSearch('');
//     setPoSearch('');
//     setIsOpen(false);
//     setIsOpenPo(false);
//     setDeliveryDate(null);
//     setSelectedSupplier({ id: '', name: '' });
   
//     setPoList([]);
//     setSelectedPo({ 
//       poNo: '', 
//       locationId: '', 
//       locationName: '', 
//       currencyRate: '', 
//       currencyName: '',
//       totalCost: '',
//       discount: '',
//       netInvoice: '',
//       deliveryType:''
//     });
//     setSupplierName('');
//     setLocationId('');
//     setLocationName('');
//     setCurrencyRate('');
//     setcurrencyName('');
//     setItemDetails([]);
//     setRecvdQtyErrors({});
//     setTotalCost(0);
//     setDiscount(0);
//     setNetInvoice(0);
//     setItemSearchTerm('');
    
//     // Clear Del.Note and Invoice No fields
//     setDelNote('');
//     setInvoiceNo('');
//     setDelNoteError('');
//     setInvoiceNoError('');
//     setDelNoteValidating(false);
//     setInvoiceNoValidating(false);
//   };



// // Save function
// // Save function
// const handleSave = async () => {
//   // Validate required fields
//   if (!selectedSupplier.id) {
//     toast.error('Please select a supplier', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   if (!selectedPo.poNo) {
//     toast.error('Please select a PO', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   if (!delNote.trim()) {
//     toast.error('Please enter Del.Note', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   if (!invoiceNo.trim()) {
//     toast.error('Please enter Invoice No', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   if (itemDetails.length === 0) {
//     toast.error('No item details to save', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   // Check if there are any validation errors in received quantities
//   const hasErrors = Object.keys(recvdQtyErrors).length > 0;
//   if (hasErrors) {
//     toast.error('Please fix all validation errors before saving', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   // Validate Del.Note and Invoice No before proceeding
//   if (delNoteError) {
//     toast.error('Please fix Del.Note errors before saving', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   // IMPORTANT: Check if Invoice No has validation error
//   if (invoiceNoError) {
//     toast.error('Invoice No already exists', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   // If validation is still in progress, wait for it to complete
//   if (invoiceNoValidating) {
//     toast.error('Please wait for Invoice No validation to complete', {
//       duration: 2000,
//       position: 'top-right',
//     });
//     return;
//   }

//   // For safety, validate one more time before saving if Invoice No was entered
//   if (invoiceNo.trim() && !invoiceNoError && !invoiceNoValidating) {
//     try {
//       const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/checInvNo', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ supplierInvNo: invoiceNo })
//       });
      
//       const data = await response.json();
      
//       if (data.success === false) {
//         setInvoiceNoError('Invoice No already exists');
//         toast.error('Invoice No already exists', {
//           duration: 2000,
//           position: 'top-right',
//         });
//         return; // Stop saving
//       }
//     } catch (error) {
//       console.error("Error validating Invoice No:", error);
//       toast.error('Error validating Invoice No. Please try again.', {
//         duration: 2000,
//         position: 'top-right',
//       });
//       return;
//     }
//   }

//   setSaving(true);

//   try {
//     // Get user ID and entity from localStorage
//     const userId = localStorage.getItem("userId");
//     const entity = localStorage.getItem("entity") || "";

//     // Format the date for delivery note
//     const formatDateForAPI = (date: Date | string): string => {
//       if (typeof date === 'string') {
//         return date;
//       }
//       const d = new Date(date);
//       const year = d.getFullYear();
//       const month = String(d.getMonth() + 1).padStart(2, '0');
//       const day = String(d.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     };
    
//     const formatStockPeriod = (period: string): string => {
//       if (!period) return '';
      
//       const parts = period.split('-');
//       if (parts.length === 3) {
//         const [day, month, year] = parts;
//         return `${year}-${month}-${day}`;
//       }
//       return period;
//     };

//     // Prepare item list
//     const itemList = itemDetails.map(item => ({
//       poDetailPk: item.poDetailPk,
//       itemId: item.itemId,
//       itemName: item.itemName,
//       packageId: item.packageId,
//       recvdQty: item.editableRecvdQty !== undefined ? item.editableRecvdQty : item.recvdQty,
//       poGp: item.poGp,
//       batchNo: item.batchNo || '',
//       binNo: item.binNo || '',
//       expDate: item.expDate ? formatDateForAPI(item.expDate) : ''
//     }));

//     // Prepare the request body
//     const requestBody = {
//       period: formatStockPeriod(stockPeriod || ''),
//       supplierId: selectedSupplier.id,
//       grnDate: formatDateForAPI(new Date()), // Use current date or selected date
//       supplierName: selectedSupplier.name,
//       poNumber: selectedPo.poNo,
//       delNote: delNote,
//       delNoteDate: formatDateForAPI(new Date()), // Use current date or selected date
//       locId: locationId,
//       currencyId: currencyName,
//       currencyValue: parseFloat(currencyRate) || 0,
//       discAmount: discount,
//       entity: entity,
//       userFk: userId ? parseInt(userId) : 0,
//       supplierInvNo: invoiceNo,
//       delType: selectedPo.deliveryType || '',
//       itemList: itemList
//     };

//     console.log('Saving with data:', requestBody);

//     // Make the API call
//     const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/saveReceiveItemFromSupplier', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestBody)
//     });

//     const data = await response.json();

//     if (data.success) {
//       toast.success('Data saved successfully!', {
//         duration: 2000,
//         position: 'top-right',
//       });
      
//       // Optionally refresh the form after successful save
//       setTimeout(() => {
//         handleRefresh();
//       }, 2000);
//     } else {
//       toast.error(data.message || 'Failed to save data', {
//         duration: 2000,
//         position: 'top-right',
//       });
//     }
//   } catch (error) {
//     console.error("Error saving data:", error);
//     toast.error('Error saving data. Please try again.', {
//       duration: 2000,
//       position: 'top-right',
//     });
//   } finally {
//     setSaving(false);
//   }
// };

//   const validateDelNote = async (note: string) => {
//     if (!note.trim()) {
//       setDelNoteError('');
//       return;
//     }

//     setDelNoteValidating(true);
//     try {
//       const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/checkDelNoteNo', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ delNote: note })
//       });
      
//       const data = await response.json();
      
//       if (data.success === false) {
//         // Del Note already exists
//         // setDelNoteError(data.message || 'Del Note No already exists');
//         toast.error(data.message || 'Del Note No already exists', {
//           duration: 2000,
//           position: 'top-right',
//         });
//       } else {
//         // Del Note is new/available
//         setDelNoteError('');
//         toast.success('Del Note No is available', {
//           duration: 3000,
//           position: 'top-right',
//         });
//       }
//     } catch (error) {
//       console.error("Error validating Del Note:", error);
//       setDelNoteError('Error validating Del Note');
//       toast.error('Error validating Del Note', {
//         duration: 2000,
//         position: 'top-right',
//       });
//     } finally {
//       setDelNoteValidating(false);
//     }
//   };

//   // Function to validate Invoice No via API
// // Function to validate Invoice No via API
// const validateInvoiceNo = async (invoice: string) => {
//   if (!invoice.trim()) {
//     setInvoiceNoError('');
//     return;
//   }

//   setInvoiceNoValidating(true);
//   try {
//     const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/checInvNo', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ supplierInvNo: invoice })
//     });
    
//     const data = await response.json();
    
//     if (data.success === false) {
//       // Invoice No already exists
//         toast.error(data.message || 'Invoice No already exists', {
//           duration: 2000,
//           position: 'top-right',
//         });
//       } else {
//       setInvoiceNoError(''); // MAKE SURE THIS IS SET
//       toast.success('Invoice No is available', {
//         duration: 2000,
//         position: 'top-right',
//       });
//     }
//   } catch (error) {
//     console.error("Error validating Invoice No:", error);
//     setInvoiceNoError('Error validating Invoice No');
//   } finally {
//     setInvoiceNoValidating(false);
//   }
// };

//   // Handle Del.Note input change
//   const handleDelNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setDelNote(value);
//     // Clear error when user starts typing
//     if (delNoteError) {
//       setDelNoteError('');
//     }
//   };

//   // Handle Del.Note blur (when field loses focus)
//   const handleDelNoteBlur = () => {
//     validateDelNote(delNote);
//   };

//   // Handle Invoice No input change
//   const handleInvoiceNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setInvoiceNo(value);
//     // Clear error when user starts typing
//     if (invoiceNoError) {
//       setInvoiceNoError('');
//     }
//   };

//   // Handle Invoice No blur (when field loses focus)
//   const handleInvoiceNoBlur = () => {
//     validateInvoiceNo(invoiceNo);
//   };

//   // Fetch suppliers from API
//   useEffect(() => {
//     const fetchSuppliers = async () => {
//       try {
//         const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropDownSupplier',  {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//         const data = await response.json();
//         if (data.success) {
//           setSuppliers(data.data || []);
//         }
//       } catch (error) {
//         console.error("Error fetching suppliers:", error);
//       }
//     };
    
//     fetchSuppliers();
//   }, []);

//   // Fetch PO list when supplier is selected
//   useEffect(() => {
//     if (selectedSupplier.id && stockPeriod) {
//       const fetchPoList = async () => {
//         try {
//           const response = await fetch(`http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropdownPo/${stockPeriod}/${selectedSupplier.id}`,  {
//             method: 'GET',
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           });
//           const data = await response.json();
//           if (data.success) {
//             setPoList(data.data || []);
//             // Reset PO selection if new supplier has no POs or different POs
//             setSelectedPo({ poNo: '', locationId: '', locationName: '', currencyRate: '', currencyName: '',totalCost: '', discount: '',netInvoice: '',deliveryType:''   });
//             setLocationId('');
//             setLocationName('');
//             setCurrencyRate('');
//             setcurrencyName('');
//             setItemDetails([]); // Clear item details
//           }
//         } catch (error) {
//           console.error("Error fetching PO list:", error);
//           setPoList([]);
//         }
//       };
      
//       fetchPoList();
//     } else {
//       // Clear PO list when no supplier is selected
//       setPoList([]);
//       setSelectedPo({ poNo: '', locationId: '', locationName: '', currencyRate: '', currencyName: '',totalCost:'', discount: '',netInvoice: '' ,deliveryType:''  });
//       setLocationId('');
//       setLocationName('');
//       setCurrencyRate('');
//       setcurrencyName('');
//       setItemDetails([]);
//     }
//   }, [selectedSupplier.id, stockPeriod]);

//   // Fetch item details when PO is selected
//   const fetchItemDetails = async (poNumber: string) => {
//     if (!poNumber) return;
    
//     setLoading(true);
//     try {
//       // First, get discount from dropdownPo API
//       const dropdownResponse = await fetch(`http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropdownPo/${stockPeriod}/${selectedSupplier.id}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const dropdownData = await dropdownResponse.json();
//       let poDiscount = 0;
      
//       if (dropdownData.success && dropdownData.data) {
//         // Find the selected PO and extract discount
//         const selectedPoData = dropdownData.data.find((po: any) => po.name === poNumber);
//         if (selectedPoData) {
//           poDiscount = selectedPoData.discount || 0;
          
//           // Update selectedPo with discount
//           setSelectedPo(prev => ({
//             ...prev,

//             discount: poDiscount.toString()

//           }));
//         }
//       }
      
//       // Then fetch item details
//       const itemResponse = await fetch(`http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/loadItemDetailsForReceiveFromSupplier/${poNumber}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const itemData = await itemResponse.json();
//       if (itemData.success && itemData.data) {
//         const items: ItemDetail[] = itemData.data.map((item: any) => ({
//           poDetailPk: item.poDetailPk,
//           itemId: item.itemId,
//           itemName: item.itemName,
//           packageId: item.packageId,
//           ordQty: item.ordQty,
//           prQty: item.prQty,
//           recvdQty: item.recvdQty,
//           invValue: item.invValue,
//           poGp: item.poGp,
//           adjValue: item.adjValue,
//           totalGp: item.totalGp,
//           expDate: item.expDate,
//           batchNo: item.batchNo,
//           binNo: item.binNo,
//           maxAllowedQty: item.ordQty,
//           minAllowedQty: 0,
//           decimalPrecision: 3,
//         }));
//         setItemDetails(items);
        
//         // Clear any previous errors
//         setRecvdQtyErrors({});
        
//         // Recalculate totals with the discount from API
//         updateCalculations(poDiscount);
//       } else {
//         setItemDetails([]);
//       }
//     } catch (error) {
//       console.error("Error fetching item details:", error);
//       setItemDetails([]);
//     } finally {
//       setLoading(false);
//     }
//   };

 

//   // Update all calculations
//  // Update all calculations
// const updateCalculations = (discountPercentage?: number) => {
//   const discountToUse = discountPercentage !== undefined ? discountPercentage : Number(selectedPo.discount) || 0;
  
//   // Calculate total cost using the item's totalGp (which is already Rcvd. Qty * PO GP)
//   let calculatedTotalCost = 0;
//   for (const item of itemDetails) {
//     // Total GP already calculated as Rcvd. Qty * PO GP
//     calculatedTotalCost += item.totalGp || 0;
//   }
  
//   setTotalCost(calculatedTotalCost);
  
//   // Calculate discount amount (discount % of total cost)
//   const calculatedDiscountAmount = calculatedTotalCost * (discountToUse / 100);
//   setDiscount(calculatedDiscountAmount);
  
//   // Calculate net invoice (total cost minus discount)
//   const calculatedNetInvoice = calculatedTotalCost - calculatedDiscountAmount;
//   setNetInvoice(calculatedNetInvoice);
// };

//   // Function to calculate total cost


//   // Function to filter item details based on search term
//   const getFilteredItems = (): ItemDetail[] => {
//     if (!itemSearchTerm.trim()) {
//       return itemDetails;
//     }
    
//     const searchTerm = itemSearchTerm.toLowerCase();
    
//     return itemDetails.filter(item => {
//       // Search across all fields
//       return (
//         item.itemId.toString().toLowerCase().includes(searchTerm) ||
//         item.itemName.toLowerCase().includes(searchTerm) ||
//         item.packageId.toLowerCase().includes(searchTerm) ||
//         item.ordQty.toString().toLowerCase().includes(searchTerm) ||
//         item.prQty.toString().toLowerCase().includes(searchTerm) ||
//         item.recvdQty.toString().toLowerCase().includes(searchTerm) ||
//         item.invValue.toString().toLowerCase().includes(searchTerm) ||
//         item.poGp.toString().toLowerCase().includes(searchTerm) ||
//         (item.adjValue?.toString().toLowerCase() || '').includes(searchTerm) ||
//         item.totalGp.toString().toLowerCase().includes(searchTerm) ||
//         item.expDate.toLowerCase().includes(searchTerm) ||
//         item.batchNo.toLowerCase().includes(searchTerm) ||
//         item.binNo.toLowerCase().includes(searchTerm)
//       );
//     });
//   };

//   // Handle PO GP change
//   const handlePoGpChange = (index: number, value: number) => {
//     setItemDetails(prev => prev.map((item, i) => {
//       if (i === index) {
//         // Calculate Total GP = Rcvd. Qty * PO GP
//         const recvdQty = item.editableRecvdQty !== undefined ? item.editableRecvdQty : item.recvdQty;
//         const totalGp = recvdQty * value;
        
//         return {
//           ...item,
//           poGp: value,
//           totalGp: totalGp // Update Total GP when PO GP changes
//         };
//       }
//       return item;
//     }));
    
//     // Recalculate totals after update
//     setTimeout(() => {
//       updateCalculations();
//     }, 0);
//   };

//   // Handle received quantity change with validation
// // Handle received quantity change with validation
// // Handle received quantity change with validation
// const handleRecvdQtyChange = (index: number, value: number, originalRecvdQty?: number) => {
//   const currentItem = itemDetails[index];
  
//   // Get original received quantity if not provided
//   const originalQty = originalRecvdQty !== undefined ? originalRecvdQty : currentItem.recvdQty;
  
//   // First check: cannot exceed original received quantity
//   if (value > originalQty) {
//     setRecvdQtyErrors(prev => ({
//       ...prev,
//       [index]: `Cannot exceed original received quantity: ${originalQty}`
//     }));
//     return;
//   }
  
//   // Validate the input (removed decimal precision validation)
//   const validation = validateRecvdQty(value, currentItem);
  
//   if (!validation.isValid) {
//     // Show error
//     setRecvdQtyErrors(prev => ({
//       ...prev,
//       [index]: validation.error || 'Invalid value'
//     }));
//     return;
//   }
  
//   // Clear any existing error
//   setRecvdQtyErrors(prev => {
//     const newErrors = { ...prev };
//     delete newErrors[index];
//     return newErrors;
//   });
  
//   // Update the item with validated value
//   const validatedValue = validation.validatedValue || value;
  
//   setItemDetails(prev => prev.map((item, i) => {
//     if (i === index) {
//       // Calculate Total GP = Rcvd. Qty * PO GP
//       const recvdQty = validatedValue;
//       const poGp = item.poGp;
//       const totalGp = recvdQty * poGp;
      
//       return {
//         ...item,
//         editableRecvdQty: validatedValue,
//         totalGp: totalGp // Update Total GP when received quantity changes
//       };
//     }
//     return item;
//   }));
  
//   // Recalculate totals after update
//   setTimeout(() => {
//     updateCalculations();
//   }, 0);
// };

//   // Update calculations whenever itemDetails or discount changes
//   useEffect(() => {
//     updateCalculations();
//   }, [itemDetails, discount]);

//   // Define columns
//   const columns = React.useMemo(() => [
//     columnHelper.accessor("itemId", {
//       cell: (info) => <p className="text-black">{info.getValue()}</p>,
//       header: () => <span>Item Id</span>,
//     }),
//     columnHelper.accessor("itemName", {
//       header: () => <span>Item Name</span>,
//       cell: (info) => <p className="text-black">{info.getValue()}</p>,
//     }),
//     columnHelper.accessor("packageId", {
//       header: () => <span>Package Id</span>,
//       cell: (info) => <p className="text-black">{info.getValue()}</p>,
//     }),
//     columnHelper.accessor("ordQty", {
//       header: () => <span>Ord. Qty</span>,
//       cell: (info) => <p className="text-black">{info.getValue().toFixed(2)}</p>,
//     }),
//     columnHelper.accessor("invValue", {
//       header: () => <span>Ord. Inv. Value</span>,
//       cell: (info) => <h6 className="text-black">{info.getValue().toFixed(2)}</h6>,
//     }),
//     columnHelper.accessor("prQty", {
//       header: () => <span>PR. Qty</span>,
//       cell: (info) => <h6 className="text-black">{info.getValue().toFixed(2)}</h6>,
//     }),

// columnHelper.accessor("recvdQty", {
//   header: () => <span>Rcvd. Qty</span>,
//   cell: (info) => {
//     const index = info.row.index;
//     const item = info.row.original;
    
//     // Get the ORIGINAL received quantity from the API (the value shown in table)
//     const originalRecvdQty = info.getValue(); // This is the value from API data
    
//     // Use editableRecvdQty if exists, otherwise use the original value
//     const currentEditableValue = item.editableRecvdQty !== undefined 
//       ? item.editableRecvdQty 
//       : originalRecvdQty;
    
//     const hasError = !!recvdQtyErrors[index];
    
//     // State to track input value for real-time validation
//     const [inputValue, setInputValue] = useState(currentEditableValue.toString());
    
//     // Update input value when the prop changes
//     useEffect(() => {
//       setInputValue(currentEditableValue.toString());
//     }, [currentEditableValue]);
    
//     return (
//       <div className="relative">
//         <input
//           type="text"
//           value={inputValue}
//           onChange={(e) => {
//             const rawValue = e.target.value;
            
//             // Handle empty input
//             if (rawValue === '') {
//               setInputValue('');
//               return;
//             }
            
//             // Allow numbers, decimal point, and negative sign
//             if (!/^-?[0-9]*\.?[0-9]*$/.test(rawValue)) {
//               // Revert to previous value
//               e.target.value = inputValue;
//               return;
//             }
            
//             // If it's just a decimal point or starts with decimal, prepend 0
//             let processedValue = rawValue;
//             if (rawValue === '.') {
//               processedValue = '0.';
//             } else if (rawValue.startsWith('.')) {
//               processedValue = '0' + rawValue;
//             } else if (rawValue === '-.') {
//               processedValue = '-0.';
//             } else if (rawValue.startsWith('-.') && rawValue.length > 2) {
//               processedValue = '-0.' + rawValue.substring(2);
//             }
            
//             // Parse the number
//             const numValue = parseFloat(processedValue);
            
//             // Check if value exceeds original received quantity
//             if (!isNaN(numValue) && numValue > originalRecvdQty) {
//               // Don't allow values greater than original
//               setInputValue(originalRecvdQty.toString());
//             } else {
//               // Allow the change (no decimal restrictions)
//               setInputValue(processedValue);
//             }
//           }}
//           onKeyDown={(e) => {
//             // Allow all control keys
//             if (e.ctrlKey || e.metaKey) {
//               return;
//             }
            
//             // Allow navigation and editing keys
//             const allowedKeys = [
//               'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
//               'Tab', 'Enter', 'Escape', 'Home', 'End'
//             ];
            
//             if (allowedKeys.includes(e.key)) {
//               if (e.key === 'Enter') {
//                 e.currentTarget.blur();
//               }
//               return;
//             }
            
//             // Allow decimal point only once
//             if (e.key === '.') {
//               const currentValue = e.currentTarget.value;
//               if (currentValue.includes('.')) {
//                 e.preventDefault(); // Prevent second decimal point
//               }
//               return;
//             }
            
//             // Allow digits 0-9, minus sign (only at beginning)
//             if (e.key === '-') {
//               const currentValue = e.currentTarget.value;
//               const selectionStart = (e.target as HTMLInputElement).selectionStart;
//               if (currentValue.includes('-') || selectionStart !== 0) {
//                 e.preventDefault();
//               }
//               return;
//             }
            
//             // Allow only digits 0-9
//             if (!/^[0-9]$/.test(e.key)) {
//               e.preventDefault();
//             }
//           }}
//           onBlur={(e) => {
//             const rawValue = e.target.value;
            
//             // Handle empty input or invalid
//             if (rawValue === '' || rawValue === '.' || rawValue === '-' || rawValue === '-.') {
//               handleRecvdQtyChange(index, 0, originalRecvdQty);
//               return;
//             }
            
//             const numValue = parseFloat(rawValue);
//             if (!isNaN(numValue)) {
//               // Final validation: cannot exceed original received quantity
//               if (numValue > originalRecvdQty) {
//                 // Show error
//                 setRecvdQtyErrors(prev => ({
//                   ...prev,
//                   [index]: `Cannot exceed original received quantity: ${originalRecvdQty}`
//                 }));
                
//                 // Reset to original value
//                 handleRecvdQtyChange(index, originalRecvdQty, originalRecvdQty);
//                 setInputValue(originalRecvdQty.toString());
//               } else {
//                 // Allow the value (0 to originalRecvdQty)
//                 handleRecvdQtyChange(index, numValue, originalRecvdQty);
//               }
//             } else {
//               // Invalid number, reset to current value
//               handleRecvdQtyChange(index, currentEditableValue, originalRecvdQty);
//               setInputValue(currentEditableValue.toString());
//             }
//           }}
//           className={`w-24 px-2 py-1 border rounded text-black text-center ${
//             hasError 
//               ? 'border-red-500 bg-red-50 text-red-700' 
//               : 'border-gray-300'
//           }`}
//         />
//         {hasError && (
//           <div className="absolute z-10 mt-1 w-48 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg text-xs text-red-700">
//             {recvdQtyErrors[index]}
//           </div>
//         )}
//       </div>
//     );
//   },
// }),
//    columnHelper.accessor("poGp", {
//   header: () => <span>PO GP</span>,
//   cell: (info) => {
//     const index = info.row.index;
//     const item = info.row.original;
//     const poGpValue = item.poGp || 0;
    
//     const [inputValue, setInputValue] = useState(poGpValue.toString());
    
//     useEffect(() => {
//       setInputValue(poGpValue.toString());
//     }, [poGpValue]);
    
//     return (
//       <input
//         type="text"
//         value={inputValue}
//         onChange={(e) => {
//           const rawValue = e.target.value;
          
//           // Handle empty input
//           if (rawValue === '') {
//             setInputValue('');
//             return;
//           }
          
//           // Allow numbers and decimal point
//           if (!/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
//             // Revert to previous value
//             e.target.value = inputValue;
//             return;
//           }
          
//           // If it's just a decimal point or starts with decimal, prepend 0
//           let processedValue = rawValue;
//           if (rawValue === '.') {
//             processedValue = '0.';
//           } else if (rawValue.startsWith('.')) {
//             processedValue = '0' + rawValue;
//           }
          
//           setInputValue(processedValue);
//         }}
//         onBlur={(e) => {
//           const rawValue = e.target.value;
          
//           if (rawValue === '' || rawValue === '.' || rawValue === '-') {
//             handlePoGpChange(index, 0);
//             return;
//           }
          
//           const numValue = parseFloat(rawValue);
//           if (!isNaN(numValue)) {
//             handlePoGpChange(index, numValue);
//           } else {
//             // Reset to original value
//             setInputValue(poGpValue.toString());
//           }
//         }}
//         className="w-20 px-2 py-1 border border-gray-300 rounded text-black text-center"
//       />
//     );
//   },
// }),
//     columnHelper.accessor("adjValue", {
//       header: () => <span>Adjust</span>,
//       cell: (info) => <h6 className="text-black">{info.getValue() ? info.getValue().toFixed(2) : '0.00'}</h6>,
//     }),
//    columnHelper.accessor("totalGp", {
//   header: () => <span>Total GP</span>,
//   cell: (info) => {
//     const item = info.row.original;
//     // Calculate Total GP = Rcvd. Qty * PO GP
//     const recvdQty = item.editableRecvdQty !== undefined ? item.editableRecvdQty : item.recvdQty;
//     const poGp = item.poGp || 0;
//     const calculatedTotalGp = recvdQty * poGp;
    
//     return <h6 className="text-black">{calculatedTotalGp.toFixed(2)}</h6>;
//   },
// }),
//     columnHelper.accessor("expDate", {
//       header: () => <span>ExpDate</span>,
//       cell: (info) => {
//         const dateString = info.getValue();
//         if (!dateString) return <h6 className="text-black">-</h6>;
        
//         try {
//           const datePart = dateString.split('T')[0];
//           const [year, month, day] = datePart.split('-');
//           return <h6 className="text-black">{`${day}-${month}-${year}`}</h6>;
//         } catch (error) {
//           console.error("Error formatting date:", error, dateString);
//           return <h6 className="text-black">-</h6>;
//         }
//       },
//     }),
//     columnHelper.accessor("batchNo", {
//       header: () => <span>BatchNo</span>,
//       cell: (info) => {
//         const [value, setValue] = useState(info.getValue());
        
//         // Sync with external changes if needed
//         useEffect(() => {
//           setValue(info.getValue());
//         }, [info.getValue()]);

//         const handleChange = (e) => {
//           const newValue = e.target.value;
//           setValue(newValue);
//           // Call parent onChange handler if provided
//           // onBatchNoChange?.(info.row.id, newValue);
//         };

//         return (
//           <div className="flex gap-2">
//             <input
//               value={value}
//               onChange={handleChange}
//               className="w-20 h-10 border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         );
//       }
//     }),
//     columnHelper.accessor("binNo", {
//       header: () => <span>BinNo</span>,
//       cell: (info) => {
//         const [value, setValue] = useState(info.getValue());
        
//         // Sync with external changes if needed
//         useEffect(() => {
//           setValue(info.getValue());
//         }, [info.getValue()]);

//         const handleChange = (e) => {
//           const newValue = e.target.value;
//           setValue(newValue);
//           // Call parent onChange handler if provided
//           // onBatchNoChange?.(info.row.id, newValue);
//         };

//         return (
//           <div className="flex gap-2">
//             <input
//               value={value}
//               onChange={handleChange}
//               className="w-20 h-10 border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         );
//       }
//     }),
//   ], [recvdQtyErrors, itemDetails]);

//   const filteredSuppliers = suppliers.filter((supplier: any) =>
//     supplier.supplierId?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
//     supplier.supplierName?.toLowerCase().includes(supplierSearch.toLowerCase())
//   );

//   const filteredPoList = poList.filter((po: any) =>
//     po.name?.toLowerCase().includes(poSearch.toLowerCase())
//   );

//   const formatPurchasePeriod = (periodString: string): string => {
//     if (!periodString) return "No Period Set";
    
//     try {
//       const parts = periodString.split('-');
//       if (parts.length !== 3) return periodString;
      
//       const day = parts[0];
//       const month = parts[1];
//       const year = parts[2];
      
//       const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//       const monthName = date.toLocaleString('default', { month: 'short' });
//       return `${monthName} ${year}`;
//     } catch (error) {
//       console.error("Error formatting purchase period:", error);
//       return periodString;
//     }
//   };

//   const currentDate = new Date();
//   const twoYearsAgo = new Date();
//   twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);

//   const [, setToDate] = useState(() => {
//     const offset = currentDate.getTimezoneOffset();
//     const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
//     return localDate.toISOString().split('T')[0];
//   });
  
//   const [columnVisibility, setColumnVisibility] = React.useState({});

//   // Get filtered items based on search term
//   const filteredItems = getFilteredItems();

//   const table = useReactTable({
//     data: filteredItems,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     state: {
//       columnVisibility,
//     },
//     onColumnVisibilityChange: setColumnVisibility,
//   });
  
//   const handleSupplierSelect = (supplier: any) => {
//     setSelectedSupplier({
//       id: supplier.supplierId,
//       name: supplier.supplierName
//     });
//     setSupplierName(supplier.supplierName);
//     setIsOpen(false);
//     setSupplierSearch('');
    
//     // Clear PO and location fields when supplier changes
//     setPoList([]);
//     setSelectedPo({ poNo: '', locationId: '', locationName: '', currencyRate: '', currencyName: '' , totalCost: '', discount: '', netInvoice: '', deliveryType:''  });
//     setLocationId('');
//     setLocationName('');
//     setCurrencyRate('');
//     setcurrencyName('');
//     setItemDetails([]);
//     setRecvdQtyErrors({});
//     setItemSearchTerm(''); // Clear search term
    
//     // Close PO dropdown if open
//     setIsOpenPo(false);
//   };

//   const handlePoSelect = (po: any) => {
//     setSelectedPo({
//       poNo: po.name,
//       locationId: po.locationId,
//       locationName: po.locationName,
//       currencyRate: po.currencyRate || '',
//       currencyName: po.currencyName || '',
//       discount: po.discount || 0  // Add discount from API
//       , totalCost: po.totalCost || '',
//       netInvoice: po.netInvoice || '',
//        deliveryType: po.deliveryType || ''
//     });
    
//     // Update location fields
//     setLocationId(po.locationId || '');
//     setLocationName(po.locationName || '');
//     setCurrencyRate(po.currencyRate || '');
//     setcurrencyName(po.currencyName || '');
    
//     setIsOpenPo(false);
//     setPoSearch('');
//     setItemSearchTerm(''); // Clear search term when PO changes
    
//     // Fetch item details for the selected PO
//     fetchItemDetails(po.name);
//   };

//   const handleListClick = () => {
//     setShowTable(true);
//     setShowForm(false);
//   };

//   const handleAddClick = () => {
//     setShowForm(true);
//     setShowTable(false);
//   };

//   let content;
//   if (showTable) {
//     content = <StockReceiveTable onBack={handleAddClick} />;
//   } else {
//    content = (
//   <div className="space-y-4">
//     <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
//       <div className="flex flex-row gap-4">
//         <h1 className="ml-30 text-gray-900 dark:text-gray-200">GRN No : Auto#</h1>
//         <div className="lg:col-span-6 col-span-12">
//           <div className="relative mt-2 ml-40">
//             <input
//               id="companyname"
//               type="text"
//               value={formatPurchasePeriod(stockPeriod || '')}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
//               required
//               readOnly
//             />
//             <label 
//               htmlFor="companyname"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Request Period
//             </label>
//           </div>
//         </div>
//         <div className="relative mt-2 ml-40">
//           <input
//             id="companyname"
//             type="text"
//             value={selectedPo.poNo ? 
//               `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}` 
//               : stockPeriod}
//             placeholder=" "
//             className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
//             required
//             readOnly
//           />
//           <label 
//             htmlFor="companyname"
//             className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                       peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                       peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                       peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                       peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//           >
//             Delivery Date
//           </label>
//         </div>
//       </div>
  
//       <Label className="text-blue-600 dark:text-blue-400 text-lg font-semibold mb-4" htmlFor="dropdown">
//         Supplier Details :
//       </Label>
//       <div className="grid grid-cols-20 gap-6">
//         <div className="lg:col-span-6 col-span-12 " ref={supplierDropdownRef}>
//           <div className="lg:col-span-4 col-span-12" >
//             <div className="flex-1 relative mt-2 " >
//               <div
//                 className="border border-gray-300 dark:border-gray-600 rounded-md h-10 flex items-center justify-between px-2 cursor-pointer select-md bg-white dark:bg-gray-700"
//                 onClick={() => setIsOpen(!isOpen)} 
//               >
//                 <span className={`${selectedSupplier.id ? 'text-black dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
//                   {selectedSupplier.id ? selectedSupplier.id : 'Please select'}
//                 </span>
//                 <svg
//                   className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${selectedSupplier.id ? 'text-black dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                 </svg>
//               </div>

//               {isOpen && (
//                 <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md w-full mt-1 shadow-lg">
//                   <input
//                     type="text"
//                     placeholder="Search suppliers..."
//                     value={supplierSearch}
//                     onChange={(e) => setSupplierSearch(e.target.value)}
//                     className="form-control-input w-full p-2 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
//                     autoFocus
//                   />
                  
//                   <div className="max-h-40 overflow-y-auto">
//                     {/* "Please select" option */}
//                     <div
//                       key="please-select"
//                       className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700"
//                       onClick={() => {
//                         handleSupplierSelect({ supplierId: '', supplierName: '' });
//                         setIsOpen(false);
//                         setSupplierSearch('');
//                       }}
//                     >
//                       <div className="font-medium text-black dark:text-gray-300">Please select a supplier</div>
//                     </div>
                    
//                     {filteredSuppliers.length > 0 ? (
//                       filteredSuppliers.map((supplier: any) => (
//                         <div
//                           key={supplier.pk}
//                           className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-400"
//                           onClick={() => {
//                             handleSupplierSelect(supplier);
//                             setIsOpen(false);
//                             setSupplierSearch('');
//                           }}
//                         >
//                           <div className="font-medium text-black dark:text-gray-300">{supplier.supplierId}</div>
//                           <div className="text-sm">{supplier.supplierName}</div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="p-2 text-gray-500 dark:text-gray-400">No suppliers found</div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="lg:col-span-10 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="supplierName"
//               type="text"
//               value={supplierName}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               required
//               readOnly
//             />
//             <label 
//               htmlFor="supplierName"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Supplier Name
//             </label>
//           </div>
//         </div>
        
//         <div className="lg:col-span-4 col-span-12" ref={poDropdownRef}>
//           <div className="flex-1 relative mt-2">
//             <div
//               className={`border border-gray-300 dark:border-gray-600 rounded-md h-10 flex items-center justify-between px-2 cursor-pointer select-md bg-white dark:bg-gray-700 ${!selectedSupplier.id || poList.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
//               onClick={() => {
//                 if (selectedSupplier.id && poList.length > 0) {
//                   setIsOpenPo(!isOpenPo);
//                 }
//               }}
//             >
//               <span className={`${!selectedSupplier.id || poList.length === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-gray-200'}`}>
//                 {selectedPo.poNo || (poList.length === 0 && selectedSupplier.id ? 'No POs Available' : 'PO NO')}
//               </span>
//               <svg
//                 className={`w-5 h-5 transform transition-transform duration-200 ${isOpenPo ? 'rotate-180' : ''} ${!selectedSupplier.id || poList.length === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-gray-400'}`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//               </svg>
//             </div>

//             {isOpenPo && poList.length > 0 && (
//               <div className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md w-full mt-1 shadow-lg">
//                 <input
//                   type="text"
//                   placeholder="Search PO..."
//                   value={poSearch}
//                   onChange={(e) => setPoSearch(e.target.value)}
//                   className="form-control-input w-full p-2 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   autoFocus
//                 />
//                 <div
//                   key="please-select"
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-gray-400 border-b border-gray-100 dark:border-gray-700"
//                   onClick={() => {
//                     handlePoSelect({ locationId: '', locationName: '' });
//                     fetchItemDetails(''); // Clear item details
//                     setItemDetails([]);
//                     setIsOpen(false);
//                     setSupplierSearch('');
//                   }}
//                 >
//                   <div className="font-medium text-black dark:text-gray-300">Please select a PO</div>
//                 </div>
//                 <div className="max-h-40 overflow-y-auto">
//                   {filteredPoList.length > 0 ? (
//                     filteredPoList.map((po: any) => (
//                       <div
//                         key={po.pk}
//                         className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-500 dark:text-gray-400"
//                         onClick={() => handlePoSelect(po)}
//                       >
//                         <div className="font-medium text-black dark:text-gray-300">{po.name}</div>
//                         <div className="text-sm">{po.locationName}</div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="p-2 text-gray-500 dark:text-gray-400">No PO found</div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div className="lg:col-span-6 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="delNote"
//               type="text"
//               value={delNote}
//               onChange={handleDelNoteChange}
//               onBlur={handleDelNoteBlur}
//               placeholder=" "
//               className={`form-control peer w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-black dark:text-gray-200 ${
//                 delNoteError ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
//               } bg-white dark:bg-gray-700`}
//               required
//               disabled={delNoteValidating}
//             />
//             <label 
//               htmlFor="delNote"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Del.Note
//             </label>
//             {delNoteValidating && (
//               <div className="absolute right-3 top-3">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
//               </div>
//             )}
//             {delNoteError && (
//               <div className="text-xs text-red-600 dark:text-red-400 mt-1">{delNoteError}</div>
//             )}
//           </div>
//         </div>

//         <div className="lg:col-span-5 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="invoiceNo"
//               type="text"
//               value={invoiceNo}
//               onChange={handleInvoiceNoChange}
//               onBlur={handleInvoiceNoBlur}
//               placeholder=" "
//               className={`form-control peer w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-black dark:text-gray-200 ${
//                 invoiceNoError ? 'border-blue-500 dark:border-blue-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
//               } bg-white dark:bg-gray-700`}
//               required
//               disabled={invoiceNoValidating}
//             />
//             <label 
//               htmlFor="invoiceNo"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Invoice No
//             </label>
//             {invoiceNoValidating && (
//               <div className="absolute right-3 top-3">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
//               </div>
//             )}
//             {/* {invoiceNoError && (
//               <div className="text-xs text-red-600 dark:text-red-400 mt-1">{invoiceNoError}</div>
//             )} */}
//           </div>
//         </div>
        
//         <div className="relative bg-white dark:bg-gray-800 lg:col-span-5">
//           <CalendarStockReceive
//             id="toDate"
//             label="Dt Of Dn"
//             required={true}
//             selected={selectedPo.poNo ? currentDate : parseStockPeriodDate()} // Changed condition
//             onChange={(date) => {
//               if (date) {
//                 const offset = date.getTimezoneOffset();
//                 const localDate = new Date(date.getTime() - offset * 60 * 1000);
//                 setToDate(localDate.toISOString().split('T')[0]);
//               } else {
//                 setToDate('');
//               }
//             }}
//             placeholderText="dd-mm-yyyy"
//           />
//         </div>
//       </div>
      
//       <br/>
//       <Label className="text-blue-600 dark:text-blue-400 text-lg font-semibold" htmlFor="dropdown">
//         Location Details :
//       </Label>
//       <div className="grid grid-cols-28 gap-6">
//         <div className="lg:col-span-6 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="locationId"
//               type="text"
//               value={locationId}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               required
//               readOnly
//             />
//             <label 
//               htmlFor="locationId"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Location Id
//             </label>
//           </div>
//         </div>
        
//         <div className="lg:col-span-19 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="locationName"
//               type="text"
//               value={locationName}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               required
//               readOnly
//             />
//             <label 
//               htmlFor="locationName"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Location Name
//             </label>
//           </div>
//         </div>
        
//         <div className="lg:col-span-6 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="currencyName"
//               type="text"
//               value={currencyName}
//               placeholder=" "
//               className="form-control peer w-full px-1 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               required
//             />
//             <label 
//               htmlFor="currencyName"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Currency Id 
//             </label>
//           </div>
//         </div>
        
//         <div className="lg:col-span-4 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="currencyRate"
//               type="text"
//               value={currencyRate}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               required
//               readOnly
//             />
//             <label 
//               htmlFor="currencyRate"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Currency Rate
//             </label>
//           </div>
//         </div>
        
//         {/* Total Cost Field */}
//         <div className="lg:col-span-5 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="totalCost"
//               type="text"
//               value={totalCost.toFixed(2)}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               required
//               readOnly
//             />
//             <label 
//               htmlFor="totalCost"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Total Cost
//             </label>
//           </div>
//         </div>

//         {/* Discount Field */}
//         <div className="lg:col-span-5 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="discountAmount"
//               type="text"
//               value={discount.toFixed(2)}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               readOnly
//             />
//             <label 
//               htmlFor="discountAmount"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Discount Amount
//             </label>
//           </div>
//         </div>

//         {/* Net Invoice Field */}
//         <div className="lg:col-span-5 col-span-12">
//           <div className="relative mt-2">
//             <input
//               id="netInvoice"
//               type="text"
//               value={netInvoice.toFixed(2)}
//               placeholder=" "
//               className="form-control peer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200"
//               required
//               readOnly
//             />
//             <label 
//               htmlFor="netInvoice"
//               className="absolute left-3 top-2 text-black dark:text-gray-300 transition-all duration-200 pointer-events-none
//                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
//                         peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
//                         peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
//                         peer-[:not(:placeholder-shown)]:dark:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
//             >
//               Net Invoice
//             </label>
//           </div>
//         </div>
//       </div>
//     </div>

//     <div className="w-[1050px]">
//       <div className="flex items-center justify-between mb-4">
//         <Label className="text-blue-600 dark:text-blue-400 text-lg font-semibold whitespace-nowrap" htmlFor="dropdown">
//           Receive Supplier Delivery Details :
//         </Label>
//         <input
//           type="text"
//           placeholder={`Search ${itemDetails.length} records...`}
//           value={itemSearchTerm}
//           onChange={(e) => setItemSearchTerm(e.target.value)}
//           className="form-control-input max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-black dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
//         />
//       </div>
//       <div className="pb-4"></div>
//       <div className="border border-ld dark:border-gray-700 rounded-md overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-32 bg-white dark:bg-gray-800">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
//             <span className="ml-2 text-gray-600 dark:text-gray-400">Loading item details...</span>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <tr key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <th
//                         key={header.id}
//                         className="text-white dark:text-gray-100 whitespace-nowrap font-semibold text-left border-b border-ld dark:border-gray-600 p-2 bg-blue-600 dark:bg-blue-800"
//                       >
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                       </th>
//                     ))}
//                   </tr>
//                 ))}
//               </thead>
//               <tbody className="divide-y divide-border dark:divide-gray-700">
//                 {table.getRowModel().rows.map((row) => (
//                   <tr key={row.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
//                     {row.getVisibleCells().map((cell) => (
//                       <td
//                         key={cell.id}
//                         className="whitespace-nowrap p-2 text-sm text-gray-800 dark:text-gray-300"
//                       >
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//                 {filteredItems.length === 0 && !loading && (
//                   <tr>
//                     <td colSpan={columns.length} className="text-center py-4 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
//                       {itemSearchTerm 
//                         ? `No items found matching "${itemSearchTerm}"` 
//                         : 'No Records Found.'}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//             {itemSearchTerm && filteredItems.length > 0 && (
//               <div className="p-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//                 Found {filteredItems.length} of {itemDetails.length} records matching "{itemSearchTerm}"
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// );
//   }

//   return (
//     <>
//       <Toaster 
//         toastOptions={{
//           className: '',
//           style: {
//             background: '#363636',
//             color: '#fff',
//             zIndex: 999999,
//           },
//           success: {
//             style: {
//               background: '#10b981',
//             },
//           },
//           error: {
//             style: {
//               background: '#ef4444',
//             },
//           },
//         }}
//       />
//       <div className="flex items-center gap-3  ">
//         {/* <h1 className="text-2xl mr-145 text-indigo-700 whitespace-nowrap">Receive Item From Supplier</h1> */}
//         <div className="flex justify-end gap-3 mb-2">
//           {showTable ? (
//             <div className="flex flex-wrap gap-2 mt-2">
//         {/* <h1 className="text-2xl mr-145 text-indigo-700 whitespace-nowrap">Receive Item From Supplier List</h1> */}
//               {/* Add buttons for table view if needed */}
//             </div>
//           ) : (
//             <>
//         <h1 className="text-2xl mr-147 text-indigo-700 whitespace-nowrap">Receive Item From Supplier</h1>

//             <div className="flex f gap-2 mt- justify-center items-center">
//             <Button
//   color="success"
//   size="xs"
//   className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
//   onClick={handleSave}
//   disabled={saving}
// >
//   {saving ? (
//     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//   ) : (
//     <FaSave className="w-4 h-4" />
//   )}
// </Button>
           
//               <Button
//                 color="warning"
//                 size="xs"
//                 className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
//                  onClick={handleRefresh}
//               >
//                 <HiRefresh className="w-4 h-4" />
//               </Button>
           
//               <Button
//                 color="primary"
//                 size="xs"
//                 className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
//                 onClick={handleListClick}
//               >
//                 <HiViewList className="w-4 h-4" />
//               </Button>
//             </div>
//         </>  )}
          
//         </div>
//       </div>
//       {content}
//     </>
//   );
// };

// export default ReceiveItemFromSupplier;

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Badge, Tooltip } from 'flowbite-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import StockReceiveView from './StockReceiveView';
import { Icon } from '@iconify/react/dist/iconify.js';
import toast from 'react-hot-toast';
import CardBox from 'src/components/shared/CardBox';
import shape1 from "/src/assets/images/shapes/danger-card-shape.png";
import shape2 from "/src/assets/images/shapes/secondary-card-shape.png";
import shape3 from "/src/assets/images/shapes/success-card-shape.png";
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import SessionModal from '../SessionModal';
import { useEntityFormatter } from '../Entity/UseEntityFormater';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// API Response Interface - Based on your sample data
export interface StockReceiveItem {
  period: string | null;
  periodStr: string;
  grnNo: string;
  grnDate: string | null;
  grnDateStr: string;
  supplierId: string;
  supplierName: string;
  delNote: string;
  delNoteDate: string | null;
  delNoteDateStr: string;
  poNumber: string;
  locId: string;
  locName: string;
  discAmount: number;
  netInvoice: number;
  totalGp: number;
  supplierInvDateStr: string;
  userId: string;
  createdDataTime: string;
  // Optional fields that might be in API response
  invStatusFk?: number;
  [key: string]: any;
}

const StockReceiveTable = ({ onBack }) => {
  const [data, setData] = useState<StockReceiveItem[]>([]);
   const formatter = useEntityFormatter(); 
    const [isLoading, setIsLoading] = useState(false);
  
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<StockReceiveItem | null>(null);
  const [period, setPeriod] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filteredData, setFilteredData] = useState<StockReceiveItem[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [sessionExpired, setSessionExpired] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const periodRef = useRef<HTMLDivElement>(null);
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage] = useState(10); // Set 10 rows per page

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const periodOptions = [...months];
  
const [gridCurrentPage, setGridCurrentPage] = useState(1);
const [gridRowsPerPage] = useState(6); // Show 6 cards per page (2 rows of 3 cards)

// Add this function to handle grid page changes
const handleGridPageChange = (page: number) => {
  setGridCurrentPage(page);
  // Scroll to top of grid when changing page
  const gridContainer = document.querySelector('.grid-container-scroll');
  if (gridContainer) {
    gridContainer.scrollTop = 0;
  }
};
  // Close dropdown when clicking outside (useEffect)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to format date for API (01-MM-YYYY with dashes)
  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };

  // Function to format date for display (MM/YYYY)
  const formatDateForDisplay = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };

  // Parse stockPeriod from localStorage (format: dd-mm-yyyy)
  const parseStockPeriod = (stockPeriod: string | null): { month: number | null, year: number | null } => {
    if (!stockPeriod) return { month: null, year: null };
    
    try {
      // Parse dd-mm-yyyy format
      const parts = stockPeriod.split('-');
      if (parts.length >= 2) {
        const month = parseInt(parts[1], 10) - 1; // Convert to 0-based month
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(month) && !isNaN(year)) {
          return { month, year };
        }
      }
    } catch (error) {
         setSessionExpired(true);
      console.error('Error parsing stockPeriod:', error);
    }
    
    return { month: null, year: null };
  };

  // const periodStr = selectedMonth !== null ? formatDateForApi(selectedMonth, selectedYear) : '';

  // Handler functions
  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
    const newPeriod = formatDateForApi(index, selectedYear);
    setPeriod(newPeriod);
    fetchStockReceiveData(newPeriod);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    
    // If month is selected, fetch data for new year
    if (selectedMonth !== null) {
      const newPeriod = formatDateForApi(selectedMonth, newYear);
      setPeriod(newPeriod);
      fetchStockReceiveData(newPeriod);
    }
  };

  const isPeriodSelected = (index: number): boolean => {
    return selectedMonth !== null && index === selectedMonth;
  };

  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  // Initial fetch on component mount - UPDATED with stockPeriod
  useEffect(() => {
    // Get stockPeriod from localStorage
    const stockPeriod = localStorage.getItem("stockPeriod");
    
    if (stockPeriod) {
      const { month, year } = parseStockPeriod(stockPeriod);
      
      if (month !== null && year !== null) {
        setSelectedMonth(month);
        setSelectedYear(year);
        const initialPeriod = formatDateForApi(month, year);
        setPeriod(initialPeriod);
        fetchStockReceiveData(initialPeriod);
        return;
      }
    }
    
    // Fallback to current month if stockPeriod is not available or invalid
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    const initialPeriod = formatDateForApi(currentMonth, currentYear);
    setPeriod(initialPeriod);
    fetchStockReceiveData(initialPeriod);
  }, []);
  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return 'N/A';
    
    try {
      // Try parsing ISO format
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        // Try parsing other formats
        return dateTimeStr;
      }
      
      // Format as dd-mm-yyyy hh:mm:ss
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
         setSessionExpired(true);
      console.error('Error formatting date:', error);
      return dateTimeStr;
    }
  };

  // Define handleViewClick BEFORE using it in columns
// Make sure this function is defined before the columns
const handleViewClick = (rowData: StockReceiveItem) => {
  console.log('View clicked for GRN:', rowData.grnNo);
  console.log('Full row data:', rowData);
  
  // Check if rowData exists
  if (!rowData) {
    console.error('No row data provided');
    toast.error('Cannot view: No data available');
    return;
  }
  
  // Check if required fields exist
  if (!rowData.grnNo) {
    console.warn('GRN number is missing');
    // Still proceed but show warning
  }
  
  setSelectedRow(rowData);
};

  // Use useMemo for columns to avoid recreating them on every render
// Update the columns with balanced reduction - all data visible
const columns = useMemo(() => [
  {
    id: 'serialNo',
    header: 'Sl. No',
    accessorFn: (row, index) => index,
    cell: (info: any) => <span className="text-[11px] text-gray-600">{info.row.index + 1}</span>,
    size: 40,
    enableSorting: false,
  },
  {
    id: 'supplierName',
    header: 'Supplier',
    accessorFn: (row) => row.supplierName,
    cell: (info: any) => (
      <div className="min-w-[100px]">
        <div className="text-[11px] font-medium leading-tight">{info.row.original.supplierId || 'N/A'}</div>
        <div className="text-[10px] text-black leading-tight break-words">{info.row.original.supplierName || 'N/A'}</div>
      </div>
    ),
    size: 130,
  },
  {
    id: 'locId',
    header: 'Location Id',
    accessorFn: (row) => row.locId,
    cell: (info: any) => (
      <div className="min-w-[90px]">
        <div className="text-[11px] font-medium leading-tight">{info.row.original.locId || 'N/A'}</div>
        <div className="text-[10px] text-black leading-tight break-words">{info.row.original.locName || 'N/A'}</div>
      </div>
    ),
    size: 110,
  },
  {
    id: 'grnPo',
    header: 'GRN/PO No',
    accessorFn: (row) => row.grnNo,
    cell: (info: any) => (
      <div className="min-w-[100px]">
        <div className="text-[11px] font-medium text-black leading-tight break-words">{info.row.original.grnNo || 'N/A'}</div>
        <div className="text-[10px] leading-tight break-words">{info.row.original.poNumber || 'N/A'}</div>
      </div>
    ),
    size: 110,
  },
  {
    id: 'delNote',
    header: 'Del Note No',
    accessorFn: (row) => row.delNote,
    cell: (info: any) => (
      <span className="text-[11px] font-medium text-black break-words block max-w-[90px]">
        {info.row.original.delNote || 'N/A'}
      </span>
    ),
    size: 85,
  },
  {
    id: 'supplierInvDateStr',
    header: 'Supp.Del.Date',
    accessorFn: (row) => row.supplierInvDateStr,
    cell: (info: any) => (
      <span className="text-[11px] break-words text-black block max-w-[85px]">
        {info.row.original.supplierInvDateStr || 'N/A'}
      </span>
    ),
    size: 85,
  },
  {
    id: 'totalGp',
    header: 'Total Gp',
    accessorFn: (row) => row.totalGp,
    cell: (info: any) => {
      const value = info.row.original.totalGp || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
    },
    size: 70,
  },
  {
    id: 'discAmount',
    header: 'Discount',
    accessorFn: (row) => row.discAmount,
    cell: (info: any) => {
      const value = info.row.original.discAmount || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
    },
    size: 65,
  },
  {
    id: 'netInvoice',
    header: 'Net Invoice',
    accessorFn: (row) => row.netInvoice,
    cell: (info: any) => {
      const value = info.row.original.netInvoice || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium text-right w-full block">{formatted}</span>;
    },
    size: 75,
  },
  {
    id: 'invoiceStatus',
    header: 'Invoice Status',
    accessorFn: (row) => row.invStatusFk,
    cell: (info: any) => {
      const status = info.row.original.invStatusFk;
      let color = 'gray';
      let displayText = 'Pending';
      
      if (status === 0) {
        color = 'warning';
        displayText = 'Not Received';
      } else if (status === 1) {
        color = 'success';
        displayText = 'Received';
      }
      
      return (
        <Badge color={color} className="text-[10px] px-1.5 py-0.5 leading-tight whitespace-nowrap">
          {displayText}
        </Badge>
      );
    },
    size: 85,
  },
  {
    id: 'userId',
    header: 'Created By',
    accessorFn: (row) => row.userId,
    cell: (info: any) => (
      <div className="min-w-[100px]">
        <div className="text-[11px] font-medium leading-tight break-words">{info.row.original.userId}</div>
        <div className="text-[9px] text-black leading-tight break-words">{formatDateTime(info.row.original.createdDataTime)}</div>
      </div>
    ),
    size: 110,
  },
  {
    id: 'view',
    header: 'View',
    cell: (info: any) => (
      <button
        className="text-blue-600 hover:text-blue-800 text-[11px] px-1 py-0.5 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
        onClick={() => handleViewClick(info.row.original)}
        title="View Details"
      >
        <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
      </button>
    ),
    size: 60,
    enableSorting: false,
  },
], [formatter]);

  // Format date to dd-mm-yyyy
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Parse date from dd-mm-yyyy string
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  // Custom search function to search across all fields
  // Custom search function to search across all fields
const searchData = (searchTerm: string) => {
  if (!searchTerm.trim()) {
    return data;
  }

  const searchLower = searchTerm.toLowerCase().trim();
  
  return data.filter(item => {
    // Search in all relevant fields
    const fieldsToSearch = [
      item.grnNo,
      item.supplierId,
      item.supplierName,
      item.locId,
      item.locName,
      item.delNote,
      item.poNumber,
      item.userId,
      item.periodStr,
      // Convert numeric fields to string for search
      item.discAmount?.toString(),
      item.netInvoice?.toString(),
      item.totalGp?.toString(),
      // Date fields
      item.supplierInvDateStr,
      item.grnDateStr,
      item.delNoteDateStr,
    ];

    // Check if any field contains the search term
    return fieldsToSearch.some(field => 
      field && field.toString().toLowerCase().includes(searchLower)
    );
  });
};

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setGlobalFilter(searchValue);
    
    if (searchValue.trim()) {
      const results = searchData(searchValue);
      setFilteredData(results);
    } else {
      setFilteredData(data); // Reset to all data when search is cleared
    }
    
    // Reset to first page when search changes
    setCurrentPage(1);
  };

  // Get initial date from localStorage
  const getInitialDate = (): Date => {
    const stockPeriod = localStorage.getItem("stockPeriod");
    if (stockPeriod) {
      const parsed = parseDate(stockPeriod);
      if (parsed) return parsed;
    }
    // Default to current date
    return new Date();
  };

  // Fetch data from API
  const fetchStockReceiveData = async (selectedPeriod: string) => {
    console.log('Fetching data for period:', selectedPeriod);
    setIsLoading(true);
    setError(null);
    setGlobalFilter(''); // Clear search when fetching new data
    setFilteredData([]); // Clear filtered data
    
    // Get token from localStorage
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      setSessionExpired(true);
      return;
    }

    
    try {
          setIsLoading(true);

      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/listReceiveItemFromSupplier/${selectedPeriod}`;
      
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
       if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      console.log('Response status:', response.status);
      
  
      
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success && Array.isArray(result.data)) {
        // Use the data directly without transformation
        setData(result.data);
        setFilteredData(result.data); // Initialize filtered data with all data
        console.log('Data set to state:', result.data.length, 'items');
        // Log first item to check structure
        if (result.data.length > 0) {
          console.log('First item structure:', result.data[0]);
          console.log('GRN No of first item:', result.data[0].grnNo);
        }
      } else {
        console.warn('API returned empty or invalid data:', result);
        setData([]);
        setFilteredData([]);
        if (!result.success) {
          setError(result.message || 'API returned unsuccessful response');
        }
      }
    } catch (err) {
         setSessionExpired(true);
      console.error('Error fetching stock receive data:', err);
      if (err instanceof Error) {
        if (err.message.includes('Unauthorized') || err.message.includes('Forbidden')) {
          setError(`${err.message}. Please check your authentication and try again.`);
        } else {
          setError(err.message);
        }
      } else {
        setError('Unknown error occurred while fetching data');
      }
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Excel function
  const exportToExcel = async () => {
    if (!period) {
      alert('Please select a period first');
      return;
    }

    console.log('Exporting to Excel for period:', period);
    setExportLoading(true);

    const token = localStorage.getItem("authToken");
    
   if (!token) {
      setSessionExpired(true);
      return;
    }


    try {
        

      const excelApiUrl = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/downloadReceiveItemFromSupplierExcel/${period}`;
      
      console.log('Trying Excel API URL:', excelApiUrl);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      
      const response = await fetch(excelApiUrl, {
        method: 'GET',
        headers: headers,
      });
       if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      
      console.log('Response status:', response.status);
      
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      
      console.log('Response preview (first 500 chars):', responseText.substring(0, 500));
      
      if (responseText.includes('"success":false') || 
          responseText.includes('"error":') || 
          responseText.includes('"message":')) {
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.message || errorJson.error || 'Export failed');
        } catch {
             setSessionExpired(true);
          // Not valid JSON, continue
        }
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      console.log('Content-Type:', contentType);
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      console.log('Blob type:', blob.type, 'Size:', blob.size);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReceiveItemFromSupplier`;
      
      if (blob.type.includes('json') || blob.type === 'application/json') {
        const text = await blob.text();
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || 'Server returned JSON error');
          } catch {
               setSessionExpired(true);
            throw new Error('Invalid response format');
          }
        }
      }
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('Download initiated');
      toast.success(`Excel file downloaded for period: ${period}`,{
            duration: 2000,
            position: 'top-right',
          });
      
    } catch (err) {
         setSessionExpired(true);
      console.error('Export error details:', err);
      
      if (err instanceof Error) {
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
    } finally {
      setExportLoading(false);
          // setIsLoading(false);

    }
  };

  // Initial fetch on component mount
  // useEffect(() => {
  //   const initialDate = getInitialDate();
  //   setSelectedDate(initialDate);
  //   const initialPeriod = formatDate(initialDate);
  //   setPeriod(initialPeriod);
  //   fetchStockReceiveData(initialPeriod);
  // }, []);

  

  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data: filteredData, // Use filtered data instead of original data
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    state: { 
      columnVisibility,
      globalFilter,
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleAddClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // If selectedRow exists, return StockReceiveView
  if (selectedRow) {
    console.log('Rendering StockReceiveView for GRN:', selectedRow.grnNo);
    console.log('Selected row data:', selectedRow);
    return (
      <StockReceiveView
        rowData={selectedRow}
        onBack={() => {
          console.log('Going back from view');
          setSelectedRow(null);
        }}
      />
    );
  }

// Calculate pagination
const totalRows = table.getRowModel().rows.length;
const totalPages = Math.ceil(totalRows / rowsPerPage);
const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;
const currentRows = table.getRowModel().rows.slice(startIndex, endIndex);

// Handle page changes
const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

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

// Generate page numbers to display
const getPageNumbers = () => {
  const pageNumbers = [];
  const maxVisiblePages = 5; // Show 5 page numbers at a time
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
  }
  
  return pageNumbers;
};
const DashboardCards = () => {
    // Calculate counts from data
    const receivedCount = data.filter(item => item.invStatusFk === 1).length;
    const notReceivedCount = data.filter(item => item.invStatusFk === 0).length;
    const totalCount = data.length;

  const SmallCard = [
  {
    icon: "mdi:clipboard-list-outline",
    num: totalCount,
    title: "Total No.of Lists",
    shape: shape3,
    bgcolor: "warning",
    colorClass: "warning",
    // desc: "Total List Count",
  },
  {
    icon: "mdi:check-circle-outline",
    num: receivedCount,
    title: "Received",
    shape: shape1,
    bgcolor: "error",
    colorClass: "error",
    // desc: "Total Received Count",
  },
  {
    icon: "mdi:clock-outline",
    num: notReceivedCount,
    title: "Not Received",
    shape: shape2,
    bgcolor: "secondary",
    colorClass: "secondary",
    // desc: "Total Not Received Count",
  },
];

    return (
   <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
  {SmallCard.map((theme, index) => (
    <div className="lg:col-span-2" key={index}>
      <CardBox
        className={`relative shadow-none! rounded-lg overflow-hidden bg-light${theme.bgcolor} dark:bg-dark${theme.bgcolor} h-14 sm:h-16 md:h-20`}
      >
        <div className="flex items-center justify-between p-1.5 sm:p-2 h-full">
          {/* Left side - Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5 truncate">{theme.title}</p>
            <div className="flex items-center gap-2">
              <h5 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">{theme.num}</h5>
            </div>
            <p className="text-xs text-black mt-0.5 truncate hidden sm:block">
              {theme.desc}
            </p>
          </div>
          
          {/* Right side - Icon with background */}
          <div className="flex-shrink-0 ml-2">
            <span
              className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white bg-${theme.bgcolor}`}
            >
              <Icon icon={theme.icon} height={12} className="sm:h-[16px] md:h-[20px]" />
            </span>
          </div>
        </div>
        
        {/* Background shape image */}
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
const StockReceiveGrid = () => {
  const [gridCurrentPage, setGridCurrentPage] = useState(1);
const [gridRowsPerPage] = useState(6); // Show 6 cards per page (2 rows of 3 cards)

// Add this function to handle grid page changes
const handleGridPageChange = (page: number) => {
  setGridCurrentPage(page);
  // Scroll to top of grid when changing page
  const gridContainer = document.querySelector('.grid-container-scroll');
  if (gridContainer) {
    gridContainer.scrollTop = 0;
  }
};
    const getStatusBadge = (status: number | undefined) => {
      if (status === 0) {
        return { color: 'blue', text: 'Not Received' };
      } else if (status === 1) {
        return { color: 'warning', text: 'Received' };
      }
      return { color: 'gray', text: 'Pending' };
    };

    // Calculate pagination for grid
    const totalGridRows = filteredData.length;
    const totalGridPages = Math.ceil(totalGridRows / gridRowsPerPage);
    const gridStartIndex = (gridCurrentPage - 1) * gridRowsPerPage;
    const gridEndIndex = gridStartIndex + gridRowsPerPage;
    const currentGridItems = filteredData.slice(gridStartIndex, gridEndIndex);

    // Reset to first page when search changes
    useEffect(() => {
      setGridCurrentPage(1);
    }, [globalFilter]);

    return (
      <>
        <DashboardCards />
        
        {/* Scrollable Cards Container with max height and vertical scroll */}
        <div className="relative grid-container-scroll max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
            {currentGridItems.map((item, index) => {
              const status = getStatusBadge(item.invStatusFk);
              
              return (
                <CardBox 
                  key={item.grnNo || index} 
                  className="hover:shadow-md transition-shadow duration-300 border border-gray-200 h-auto p-3 sm:p-4"
                >
                  {/* Card Header with View button integrated */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.grnNo || 'N/A'}</h3>
                      <p className="text-xs text-black mt-0.5 truncate">{item.poNumber || 'No PO'}</p>
                      <p className="text-xs text-black mt-0.5 font-bold truncate">
                        <span className='text-blue-600'>Del Note No: </span>{item.delNote}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Badge color={status.color} className="text-xs py-0.5 px-1.5 sm:px-2 whitespace-nowrap">
                        {status.text}
                      </Badge>
                      <button
                        onClick={() => handleViewClick(item)}
                        className="p-1 sm:p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Supplier & Location in single row with word break */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                    {/* Supplier */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:factory" className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate">Supplier</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">{item.supplierId || 'N/A'}</p>
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{item.supplierName || 'N/A'}</p>
                    </div>
                    
                    {/* Location */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:map-marker" className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600 truncate">Location</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">{item.locId || 'N/A'}</p>
                      <p className="text-xs text-gray-600 break-words line-clamp-2">{item.locName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Financial Info - Compact */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    <div className="bg-blue-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:currency-inr" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-600">GP</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {Number(item.totalGp || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:percent" className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-600">Disc</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        {Number(item.discAmount || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-1.5 sm:p-2 rounded">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Icon icon="mdi:file-document" className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        <span className="text-xs text-purple-600">Net</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                        ₹{Number(item.netInvoice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom Info Row with fully merged light blue background */}
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-md mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black mb-0.5">Supp.Del.Date</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {item.supplierInvDateStr || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="flex-1 min-w-100px text-right">
                        <p className="text-xs text-black mb-0.5">Created By</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 break-all">{item.userId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardBox>
              );
            })}
          </div>
        </div>
        
        {/* Grid Pagination - Simplified with only total pages indicator */}
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
              
              {/* Simple page indicator - shows only total pages */}
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
        
        {/* Stats */}
        {filteredData.length === 0 && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg text-center">
            <Icon icon="mdi:package-variant-closed" className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-gray-600">No records found for this period</p>
            <p className="text-xs sm:text-sm text-black mt-1">Try selecting a different period</p>
          </div>
        )}
        
        {filteredData.length > 0 && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-800">{filteredData.length}</span> items for period: 
                  <span className="font-bold text-blue-600 ml-1">{period}</span>
                  {globalFilter && (
                    <span className="ml-2 text-gray-500">
                      (Filtered by: <span className="font-medium">"{globalFilter}"</span>)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add CSS for custom scrollbar */}
        <style jsx>{`
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
  
  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-2">
      {/* Header with Title and Toggle Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-">
         <h1 className="text-lg sm:text-xl lg:text-xl text-indigo-700 whitespace-nowrap">Receive Item From Supplier List</h1>
        
        {/* View Mode Toggle Button */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto mt-1 gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
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
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon icon="mdi:view-grid" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid </span>
            <span className="sm:hidden">Grid</span>
          </button>
            <div className="flex gap-2 justify-end sm:justify-start mt-1">
                  <Tooltip content="  Excel" className='z-50'>
            <Badge
              color="success"
              className={`h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-green-700 text-xs sm:text-sm ${(exportLoading || !period) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={exportLoading || !period ? undefined : exportToExcel}
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Icon icon="file-icons:microsoft-excel" className="text-sm sm:text-base" />
              )}
            </Badge>
            </Tooltip>
                <Tooltip content="Add" className='z-50'>
            <Badge
              color="primary"
              className="h-9 w-9 sm:h-9 sm:w-9 flex justify-center items-center cursor-pointer hover:bg-blue-700 text-xs sm:text-sm"
              onClick={handleAddClick}
            >
              <Icon icon="mingcute:add-line" className="text-sm sm:text-base" />
            </Badge>
            </Tooltip>
          </div>
        </div>
         
      </div>
      <div className="bg-white  dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 sm:p-4">

      <div className="w-full">
        {/* Filter Row - Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Period Picker */}
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
                Period <sup className='text-red-600'>*</sup>
              </label>
              <CalendarDays className="absolute right-108 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            </div>
            
            {periodOpen && (
              <div className="absolute w-80 top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 mt-1 p-2 sm:p-3">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <button
                    onClick={() => handleYearChange("prev")}
                    className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange("next")}
                    className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
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
                          ? "bg-blue-500 dark:bg-blue-600 text-white shadow-lg transform scale-105"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Search Input */}
          <div className="w-full sm:max-w-xs">
            <input
              type="text"
              placeholder={`Search ${data.length} records...`}
              className="form-control-input w-74 px-3 py-2 sm:py-2.5 border rounded-md text-sm"
              value={globalFilter}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Action Buttons */}
        
        </div>
        
        <div className="pb- sm:pb-"></div>
        
        {/* {isLoading && (
          <div className="text-center py-6 sm:py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">Loading data for period: {period}...</p>
          </div>
        )} */}
        
        {error && (
          <div className="text-center py-4 sm:py-6 bg-red-50 rounded-md px-3 sm:px-4">
            <Icon icon="mdi:alert-circle-outline" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-red-600 font-medium mb-1 sm:mb-2">Error isLoading data</p>
            <p className="text-xs sm:text-sm text-red-500 mb-3 sm:mb-4 break-words">{error}</p>
            <button 
              onClick={() => selectedDate && fetchStockReceiveData(formatDate(selectedDate))}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm"
            >
              Try Again
            </button>
          </div>
        )}
        
        {!isLoading && !error && (
          <>
            {viewMode === 'table' ? (
              <>
                <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                  <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
                <div className="min-w-[1000px] lg:min-w-full">
  {/* Table Container */}
  {/* <div className="border border-gray-200 rounded- overflow-hidden">
    <table className="w-full divide-y divide-gray-200 overflow-auto table-fixed" style={{ tableLayout: 'fixed' }}> */}
       <div className="overflow-auto max-h-[390px] relative">
    <table className="w-full divide-y divide-gray-200 table-fixed" style={{ tableLayout: 'fixed' }}>
      <thead className='sticky top-0 z-10 h-8'>
        
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="bg-blue-600">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer hover:bg-blue-700 transition-colors"
                style={{ width: `${header.column.columnDef.size || 80}px` }}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </span>
                  <span className="ml-1 flex-shrink-0 text-[10px]">
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? ' ↕️'}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {currentRows.length > 0 ? (
          currentRows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50/50">
              {row.getVisibleCells().map((cell) => (
                <td 
                  key={cell.id} 
                  className="px-1.5 py-1 align-top"
                  style={{ width: `${cell.column.columnDef.size || 80}px` }}
                >
                  <div className="leading-tight min-h-[24px] flex items-start text-[11px]">
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
                <Icon icon="mdi:database-outline" className="w-6 h-6 text-gray-300 mb-1" />
                <p className="text-black text-xs font-medium">
                  {globalFilter ? 'No matching records found' : 'No records found'}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5">
                  {globalFilter ? `No results for: "${globalFilter}"` : `No data for period: ${period}`}
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination Controls */}
 
</div>
                  </div>
                </div>
                
             {data.length > 0 && (
  <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600">
    {/* Left side - Showing records info */}
    <div>
      Showing <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">{data.length}</span> records
      {globalFilter && (
        <span> for search: <span className="font-medium">"{globalFilter}"</span></span>
      )}
      {!globalFilter && (
        <span> for period: <span className="font-medium">{period}</span></span>
      )}
    </div>
    
    {/* Right side - Pagination controls */}
    {totalRows > 0 && (
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-gray-600">
          {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-1.5 py-0.5 rounded border text-[12px] ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaChevronLeft className="w-2.5 h-2.5 inline mr-0.5" />
            Prev
          </button>
          <span className="px-2 py-0.5 text-[12px] bg-blue-50 text-blue-600 rounded border border-blue-200">
            {currentPage}/{totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-1.5 py-0.5 rounded border text-[12px] ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
            <FaChevronRight className="w-2.5 h-2.5 inline ml-0.5" />
          </button>
        </div>
      </div>
    )}
  </div>
)}
                
              </>
            ) : (
              <StockReceiveGrid />
            )}
          </>
        )}
      </div>
       </div>
      {sessionExpired && <SessionModal/>}
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

export default StockReceiveTable;