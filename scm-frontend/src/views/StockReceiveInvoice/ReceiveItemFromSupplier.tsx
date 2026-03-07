import { Label, Button, Card, Tooltip } from "flowbite-react";
import { useState, useEffect, useRef } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { HiInformationCircle, HiRefresh, HiViewList } from 'react-icons/hi';

import React from "react";
import { 
  FaBoxOpen, 
  FaReceipt, 
  FaSave, 
  FaTruck,
  FaSearch,
  FaClipboard,
  FaFileInvoice,
  FaCalendarAlt,
  FaListAlt
} from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react';

export interface TableTypeDense {
  vatId?: string;
  accountId?: string;
  gross?: number;
  discAmount?: number;
  vatPerc?: number;
  vatAdjValue?: number;
  vatAmountInside?: number;
  net?: number;
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

import StockReceiveInvoiceTable from "./StockReceiveInvoiceTable";
import SessionModal from "../SessionModal";
import { useEntityFormatter } from "../Entity/UseEntityFormater";

const columnHelper = createColumnHelper<TableTypeDense>();
 



interface DeliveryNote {
  pk: number;
  name: string;
  nameTwo: string;
  nameThree: string;
  gross: number;
  netInvoice: number;
  discount: number;
  vatAmount?: number;
  supplierInvNo?: string;
  count?: number;
  vatId?: string;
  accountId?: string;
  vatPerc?: number;
  vatAdjValue?: number;
  vatAmountInside?: number;
}

interface Supplier {
  pk: number;
  supplierId: string;
  supplierName: string;
}

const StockReceiveInvoice = () => {
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [supplierName, setSupplierName] = useState('');
  const [, setIsOpenPo] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
 
  const [selectedOptions, setSelectedOptions] = useState<DeliveryNote[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [deliverySearch, setDeliverySearch] = useState('');
  
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [invoiceValue, setInvoiceValue] = useState<number>(0);
  const [netInvoiceValue, setNetInvoiceValue] = useState<number>(0);
  const [supplierInvNo, setSupplierInvNo] = useState<string>('');
  const [vatAdjValue, setVatAdjValue] = useState<number>(0);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const deliveryDropdownRef = useRef<HTMLDivElement>(null);
    const formatter = useEntityFormatter(); 
  const [tableData, setTableData] = useState<TableTypeDense[]>([{
    vatId: '',
    accountId: '',
    gross: 0,
    discAmount: 0,
    vatPerc: 0,
    vatAdjValue: 0,
    vatAmountInside: 0,
    net: 0,
    teams: []
  }]);
  const defaultColumns = [
  columnHelper.accessor("vatId", {
    cell: () => <p className="text-xs">{''}</p>,
    header: () => <span>Vat Id</span>,
  }),
  columnHelper.accessor("accountId", {
    header: () => <span>Account Id</span>,
    cell: () => <p className="text-xs">{''}</p>,
  }),
 // For Gross column
columnHelper.accessor("gross", {
  header: () => <div className="text-right w-full pr-3">Gross</div>,
  // cell: (info) => <div className="text-xs text-black text-right w-full pr-3">{info.getValue()?.toFixed(2) || '0.00'}</div>,
      cell: (info: any) => { 
         const value = info.getValue() || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
  size: 80,
}),

// For Dis Amount column
columnHelper.accessor("discAmount", {
  header: () => <div className="text-right w-full pr-3">Dis Amount</div>,
  // cell: (info) => <div className="text-xs text-black text-right w-full pr-3">{info.getValue()?.toFixed(2) || '0.00'}</div>,
  cell: (info: any) => { 
        const value = info.getValue() || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
  size: 90,
}),

// For VAT% column
columnHelper.accessor("vatPerc", {
  header: () => <div className="text-right w-full pr-3">VAT%</div>,
  // cell: (info) => <div className="text-xs text-black text-right w-full pr-3">{info.getValue()?.toFixed(2) || '0.00'}%</div>,
   cell: (info: any) => { 
       const value = info.getValue() || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
  size: 70,
}),

// For Vat Adj Val column
columnHelper.accessor("vatAdjValue", {
  header: () => <div className="text-right w-full pr-3">Vat Adj Val</div>,
  // cell: (info) => <div className="text-xs text-black text-right w-full pr-3">{info.getValue()?.toFixed(2) || '0.00'}</div>,
    cell: (info: any) => { 
          const value = info.getValue() || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
  size: 90,
}),

// For Vat Amount column
columnHelper.accessor("vatAmountInside", {
  header: () => <div className="text-right w-full pr-3">Vat Amount</div>,
  // cell: (info) => <div className="text-xs text-black text-right w-full pr-3">{info.getValue()?.toFixed(2) || '0.00'}</div>,
   cell: (info: any) => { 
        const value = info.getValue() || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
  size: 90,
}),

// For Net column
columnHelper.accessor("net", {
  header: () => <div className="text-right w-full pr-3">Net</div>,
  // cell: (info) => <div className="text-xs text-black text-right w-full pr-3">{info.getValue()?.toFixed(2) || '0.00'}</div>,
    cell: (info: any) => { 
      const value = info.getValue() || 0;
      const num = Number.parseFloat(value);
      const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
      return <span className="text-[11px] text-blue-600 font-medium 	text-right w-full">{formatted}</span>;
    },
  size: 80,
}),
];
  
  const [globalFilter, setGlobalFilter] = useState('');
  
  const filteredSuppliers = suppliers.filter((supplier: Supplier) =>
    supplier.supplierId?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.supplierName?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredDeliveryNotes = deliveryNotes.filter(note => 
    note.name?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    note.nameTwo?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    note.nameThree?.toLowerCase().includes(deliverySearch.toLowerCase())
  );
const formatValue = (value) => {
  const num = Number.parseFloat(value);
  return isNaN(num) ? '0.00' : formatter.formatAmount(num);
};
  const calculateTableTotals = () => {
    return {
      gross: selectedOptions.reduce((sum, note) => sum + (note.gross || 0), 0),
      discAmount: selectedOptions.reduce((sum, note) => sum + (note.discount || 0), 0),
      vatPerc: selectedOptions.length > 0 
        ? selectedOptions.reduce((sum, note) => sum + (note.vatPerc || 0), 0) / selectedOptions.length 
        : 0,
      vatAdjValue: selectedOptions.reduce((sum, note) => sum + (note.vatAdjValue || 0), 0),
      vatAmountInside: selectedOptions.reduce((sum, note) => sum + (note.vatAmountInside || 0), 0),
      net: selectedOptions.reduce((sum, note) => sum + (note.netInvoice || 0), 0)
    };
  };

  const handleRefresh = () => {
    setSelectedSupplier({ id: '', name: '' });
    setSupplierName('');
    setIsOpen(false);
    setSupplierSearch('');
    clearAllDeliveryNotes();
    setDeliveryNotes([]);
    setGlobalFilter('');
  };

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // Close supplier dropdown if open and click is outside its container
    if (isOpen && supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
    // Close delivery dropdown if open and click is outside its container
    if (isDeliveryOpen && deliveryDropdownRef.current && !deliveryDropdownRef.current.contains(event.target as Node)) {
      setIsDeliveryOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, isDeliveryOpen]); // Re-run when dropdown states change
  const handleSupplierSelect = async (supplier: Supplier) => {
    setSelectedSupplier({
      id: supplier.supplierId,
      name: supplier.supplierName
    });
    setSupplierName(supplier.supplierName);
    setIsOpen(false);
    setSupplierSearch('');
    
    setSelectedOptions([]);
    setDeliveryNotes([]);
    
    resetFormValues();
    resetTableData();
    
    if (supplier.supplierId && stockPeriod) {
      await fetchDeliveryNotes(supplier.supplierId);
    }
    
    setIsOpenPo(false);
  };

  const resetFormValues = () => {
    setVatAmount(0);
    setDiscount(0);
    setInvoiceValue(0);
    setNetInvoiceValue(0);
    setSupplierInvNo('');
  };

  const resetTableData = () => {
    setTableData([{
      vatId: '',
      accountId: '',
      gross: 0,
      discAmount: 0,
      vatPerc: 0,
      vatAdjValue: 0,
      vatAmountInside: 0,
      net: 0,
      teams: []
    }]);
  };

  const fetchDeliveryNotes = async (supplierId: string) => {
    if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/dropDownDeliveryNote/${stockPeriod}/${supplierId}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setDeliveryNotes(data.data || []);
      } else {
        setDeliveryNotes([]);
      }
    } catch (error) {
      setSessionExpired(true);
      console.error("Error fetching delivery notes:", error);
      setDeliveryNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = (notes: DeliveryNote[]) => {
    let totalDiscount = 0;
    let totalNet = 0;
    let totalGross = 0;
    let itemCount = 0;
    
    let totalVatPerc = 0;
    let totalVatAdjValue = 0;
    let totalVatAmountInside = 0;

    notes.forEach(note => {
      totalNet += note.netInvoice || 0;
      totalDiscount += note.discount || 0;
      totalGross += note.gross || 0;
      itemCount += note.count || 0;
      
      totalVatPerc += note.vatPerc || 0;
      totalVatAdjValue += note.vatAdjValue || 0;
      totalVatAmountInside += note.vatAmountInside || 0;
    });

    const avgVatPerc = notes.length > 0 ? totalVatPerc / notes.length : 0;

    return {
      supplierInvNo: '',
      vatAmount: totalVatAmountInside,
      discount: totalDiscount,
      invoiceValue: totalGross,
      netInvoiceValue: totalNet,
      itemCount,
      gross: totalGross,
      discAmount: totalDiscount,
      vatPerc: avgVatPerc,
      vatAdjValue: totalVatAdjValue,
      vatAmountInside: totalVatAmountInside,
      net: totalNet
    };
  };

  const updateTableData = (totals: any) => {
    const newTableData = [{
      vatId: selectedOptions.length > 0 ? '' : '',
      accountId: selectedOptions.length > 0 ? '' : '',
      gross: totals.gross || 0,
      discAmount: totals.discAmount || 0,
      vatPerc: totals.vatPerc || 0,
      vatAdjValue: totals.vatAdjValue || 0,
      vatAmountInside: totals.vatAmountInside || 0,
      net: totals.net || 0,
      teams: []
    }];
    
    setTableData(newTableData);
  };

  const handleDeliverySelect = (note: DeliveryNote) => {
    let newSelectedOptions: DeliveryNote[];
    
    if (selectedOptions.some(n => n.pk === note.pk)) {
      newSelectedOptions = selectedOptions.filter(n => n.pk !== note.pk);
    } else {
      newSelectedOptions = [...selectedOptions, note];
    }
    
    setSelectedOptions(newSelectedOptions);
    
    const totals = calculateTotals(newSelectedOptions);
    
    setVatAmount(totals.vatAmount);
    setDiscount(totals.discount);
    setInvoiceValue(totals.invoiceValue);
    setNetInvoiceValue(totals.netInvoiceValue);
    setVatAdjValue(totals.vatAdjValue);
    
    updateTableData(totals);
  };

  const clearAllDeliveryNotes = () => {
    setSelectedOptions([]);
    resetFormValues();
    resetTableData();
  };

  const handleSaveClick = () => {
    if (!token) {
      setSessionExpired(true);
      return;
    }
    
    if (!selectedSupplier.id) {
      toast.error('Please select a supplier', { duration: 2000, position: 'top-right' });
      return;
    }
    
    if (selectedOptions.length === 0) {
      toast.error('Please Add the Delivery Notes', { duration: 2000, position: 'top-right' });
      return;
    }
    
    if (!supplierInvNo.trim()) {
      toast.error('Please enter Supplier Invoice No', { duration: 2000, position: 'top-right' });
      return;
    }
    
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveModal(false);
    
    if (!token) {
      setSessionExpired(true);
      return;
    }
    
    const userId = localStorage.getItem("userId");
    const entity = localStorage.getItem("entity") || "";
    
    if (!userId) {
      toast.error('User ID not found. Please login again.', { duration: 2000, position: 'top-right' });
      return;
    }
    
    const formattedPeriod = stockPeriod 
      ? stockPeriod.split('-').reverse().join('-')
      : new Date().toISOString().split('T')[0];
    
    const invoiceDate = stockPeriod 
      ? stockPeriod.split('-').reverse().join('-')
      : new Date().toISOString().split('T')[0];
    
    const requestData = {
      period: formattedPeriod,
      entity: entity,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      supplierInvNo: supplierInvNo.trim(),
      supplierInvDate: invoiceDate,
      accountId: "",
      itemCount: calculateTotals(selectedOptions).itemCount,
      gross: invoiceValue,
      vatAdjValue: vatAdjValue,
      discAmount: discount,
      netInvValue: netInvoiceValue,
      userFk: parseInt(userId),
      selectedOptions: selectedOptions.map(note => note.pk.toString())
    };
    
    console.log("Saving data:", requestData);
    
    try {
      setSaving(true);
      setIsLoading(true);
      const response = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockReceiveController/saveReceiveInvoice',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        }
      );
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      const data = await response.json();
      
      if (data.success) {
        toast.success('Invoice saved successfully!', { duration: 3000, position: 'top-right' });
        handleRefresh();
      } else {
        toast.error(`Save failed: ${data.message || 'Unknown error'}`, { duration: 3000, position: 'top-right' });
      }
    } catch (error) {
      setSessionExpired(true);
      console.error("Error saving invoice:", error);
      toast.error('Failed to save invoice. Please try again.', { duration: 3000, position: 'top-right' });
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);
  
  const [saving, setSaving] = useState(false);
  
  const [columns] = React.useState(() => [...defaultColumns]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const token = localStorage.getItem("authToken");
  const stockPeriod = localStorage.getItem("stockPeriod");

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility,
      globalFilter,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
  });
  
  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
    handleRefresh();
  };

  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
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
    const fetchSuppliers = async () => {
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuppliers();
  }, []);

  let content;
  if (showTable) {
    content = <StockReceiveInvoiceTable onBack={handleAddClick} />;
  } else {
   content = (
  <div className="space-y-4 w-full max-w-[1150px] mx-auto px-2 sm:px-3 md:px-4">
    {/* Title and Buttons Header */}
    <div className="bg-white rounded-lg shadow-sm p-2 mb-2 mt-2 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base sm:text-lg md:text-xl text-indigo-700 whitespace-nowrap">Stock Receive Invoice</h1>
        
        <div className="relative inline-block order-last sm:order-none">
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
              <HiInformationCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </Tooltip>
        </div>
        
        <div className="flex gap-1 sm:gap-2 ml-auto">
          <Tooltip content="Save" className="z-50" placement="bottom">
            <Button
              color="success"
              size="xs"
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 bg-green-600 rounded-full flex items-center justify-center"
              onClick={handleSaveClick}
              disabled={saving || isLoading}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
              ) : (
                <FaSave className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              )}
            </Button>
          </Tooltip>
          
          <Tooltip content="Refresh" className="z-50" placement="bottom">
            <Button
              color="warning"
              size="xs"
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full bg-amber-500 flex items-center justify-center"
              onClick={handleRefresh}
            >
              <HiRefresh className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            </Button>
          </Tooltip>
          
          <Tooltip content="List" className="z-50" placement="bottom">
            <Button
              color="primary"
              size="xs"
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex bg-blue-600 items-center justify-center"
              onClick={handleListClick}
            >
              <HiViewList className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-3 md:p-4 mb-2 mt-2">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Invoice No Card */}
        <Card className="bg-purple-50 border-l-8 border-purple-500 shadow-sm p-2 sm:p-3 h-10 sm:h-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
              <FaReceipt className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-black dark:text-white ">
                Invoice No : <span className="font-bold text-black dark:text-white"># Auto</span>
              </p>
            </div>
          </div>
        </Card>
        
        {/* Stock Period Card */}
        <Card className="bg-blue-50 border-l-8 border-blue-500 shadow-sm p-2 sm:p-3 h-10 sm:h-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
              <FaCalendarAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-black dark:text-white ">
                Stock Period: <span className="font-bold text-black dark:text-white">
                  {formatPurchasePeriod(stockPeriod || '')}
                </span>
              </p>
            </div>
          </div>
        </Card>
        
        {/* Placeholder for remaining 2 cards if needed */}
     
      </div>

      {/* Main Card */}
      <Card className="border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Left column (Supplier & Delivery Notes) */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            {/* Supplier dropdown */}
            <div ref={supplierDropdownRef} className="relative">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1 mb-1">
                <FaTruck className="text-blue-500 w-3 h-3 sm:w-4 sm:h-4" /> Supplier <span className="text-red-500">*</span>
                <Tooltip content="Select the Supplier for this Stock Receive Invoice" className="z-50" placement="top">
                  <div className="cursor-help ml-0.5">
                    <HiInformationCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300" />
                  </div>
                </Tooltip>
              </Label>
              
              <div
                className={`border rounded-md h-8 sm:h-9 dark:bg-gray-800 rounded-md flex items-center justify-between px-2 sm:px-3 cursor-pointer text-[10px] sm:text-xs font-bold ${
                  selectedSupplier.id ? 'border-blue-300 bg--50' : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className={`truncate ${selectedSupplier.id ? 'text-black' : 'text-black'}`}>
                  {selectedSupplier.id ? `${selectedSupplier.id} - ${selectedSupplier.name}` : 'Select supplier'}
                </span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''} text-black`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isOpen && (
                <div className="absolute dark:bg-gray-800 z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-200 bg-gray-50">
                    <div className="relative dark:bg-gray-800">
                      <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search supplier..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-[10px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {/* Please Select a Supplier */}
                    <div
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedSupplier({ id: '', name: '' });
                        setIsOpen(false);
                        setSupplierSearch('');
                        handleRefresh();
                      }}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-[9px] sm:text-xs text-black">📌</span>
                        </div>
                        <span className="text-[10px] sm:text-sm font-medium text-gray-600">Please Select a Supplier</span>
                      </div>
                    </div>

                    {/* Supplier Options */}
                    {filteredSuppliers.map((supplier, index) => (
                      <div
                        key={supplier.pk}
                        className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                        onClick={() => handleSupplierSelect(supplier)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                              selectedSupplier?.pk === supplier.pk
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 group-hover:bg-blue-100'
                            }`}>
                              <span className="text-[9px] sm:text-xs">{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-[10px] sm:text-sm font-semibold text-gray-900">
                                {supplier.supplierId}
                              </div>
                              <div className="text-[9px] sm:text-xs text-gray-600 truncate">
                                {supplier.supplierName}
                              </div>
                            </div>
                          </div>
                          {selectedSupplier?.pk === supplier.pk && (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-[8px] sm:text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* No Results */}
                    {filteredSuppliers.length === 0 && (
                      <div className="px-3 sm:px-4 py-4 sm:py-8 text-center">
                        <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🔍</div>
                        <p className="text-[10px] sm:text-sm text-black">No suppliers found</p>
                        <p className="text-[8px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Try adjusting your search</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-1 sm:p-2 border-t border-gray-100 bg-gray-50">
                    <p className="text-[8px] sm:text-[10px] text-black text-center">
                      {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Delivery Notes dropdown */}
            <div ref={deliveryDropdownRef} className="relative">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1 mb-1">
                <FaClipboard className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" /> Delivery Notes
                <Tooltip content="Select the Delivery Notes for this Stock Receive Invoice" className="z-50" placement="top">
                  <div className="cursor-help ml-0.5">
                    <HiInformationCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300" />
                  </div>
                </Tooltip>
              </Label>
              
              <div
                className={`border dark:bg-gray-800 rounded-md h-8 sm:h-9 flex items-center justify-between px-2 sm:px-3 cursor-pointer text-[10px] sm:text-xs font-bold ${
                  selectedOptions.length > 0 ? 'border-emerald-300 bg--50' : 'border-gray-300 bg-white hover:border-emerald-400'
                }`}
                onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
              >
                <span className="truncate text-black">
                  {selectedOptions.length > 0 
                    ? `${selectedOptions.length} note(s) selected` 
                    : 'Select delivery notes'}
                </span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform ${isDeliveryOpen ? 'rotate-180' : ''} text-black`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isDeliveryOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-black" />
                      <input
                        type="text"
                        placeholder="Search notes..."
                        value={deliverySearch}
                        onChange={(e) => setDeliverySearch(e.target.value)}
                        className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-[10px] sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto">
                    {filteredDeliveryNotes.length > 0 ? (
                      filteredDeliveryNotes.map((note) => (
                        <div
                          key={note.pk}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex items-start gap-2 border-b last:border-b-0"
                          onClick={() => handleDeliverySelect(note)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOptions.some(n => n.pk === note.pk)}
                            onChange={() => {}}
                            className="mt-1 w-3 h-3 sm:w-4 sm:h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[10px] sm:text-sm truncate">{note.name} {note.nameTwo}</div>
                            <div className="text-[8px] sm:text-xs text-black truncate">
                              Gross: {note.gross?.toFixed(2)} | Net: {note.netInvoice?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 sm:p-3 text-center text-[10px] sm:text-sm text-black">
                        {selectedSupplier.id ? 'No delivery notes' : 'Select supplier first'}
                      </div>
                    )}
                  </div>
                  
                  {selectedOptions.length > 0 && (
                    <div className="p-2 border-t flex justify-between items-center bg-gray-50">
                      <button
                        onClick={clearAllDeliveryNotes}
                        className="text-[8px] sm:text-xs text-red-600 hover:text-red-800"
                      >
                        Clear all
                      </button>
                      <button
                        onClick={() => setIsDeliveryOpen(false)}
                        className="text-[8px] sm:text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 py-1 rounded"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Invoice Details */}
          <div className="lg:col-span-7 border-l border-gray-200 dark:border-gray-700 pl-3 sm:pl-4">
            <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1 mb-2">
              <FaFileInvoice className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" /> Invoice Details
              <Tooltip content="Invoice Details for this Stock Receive Invoice" className="z-50" placement="top">
                <div className="cursor-help ml-0.5">
                  <HiInformationCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300" />
                </div>
              </Tooltip>
            </Label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {/* Supplier Inv No - Input */}
              <div className="relative col-span-1">
                <input
                  id="supplierInvNo"
                  type="text"
                  maxLength={50}
                  value={supplierInvNo}
                  onChange={(e) => setSupplierInvNo(e.target.value)}
                  placeholder=" "
                  className="peer w-full text-black px-1.5 sm:px-2 py-1 sm:py-1.5 pr-8 sm:pr-10 text-[9px] sm:text-xs border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 h-7 sm:h-8"
                />
                <span className="absolute right-1 sm:right-2 top-1.5 sm:top-2 text-[7px] sm:text-xs text-gray-400">
                  {supplierInvNo.length}/50
                </span>
                <label
                  htmlFor="supplierInvNo"
                  className="absolute left-1.5 sm:left-2 -top-1.5 dark:bg-gray-800 dark:text-white text-[7px] sm:text-[10px] bg-white text-black px-0.5 peer-placeholder-shown:top-1 sm:peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-[8px] sm:peer-placeholder-shown:text-xs peer-focus:-top-1.5 peer-focus:text-[7px] sm:peer-focus:text-[10px] peer-focus:text-blue-600 transition-all"
                >
                  Inv No <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Inv Date - Card style */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
                <label className="block text-[7px] sm:text-[8px] md:text-[9px] font-medium text-black dark:text-gray-400 mb-0.5 uppercase tracking-wider text-right whitespace-nowrap">Inv Date</label>
                <div className="text-[9px] sm:text-[10px] md:text-sm font-semibold text-right text-gray-700 dark:text-gray-300">{stockPeriod || '-'}</div>
              </div>

              {/* Vat Amount - Card style */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
                <label className="block text-[7px] sm:text-[8px] md:text-[9px] font-medium text-right text-black dark:text-gray-400 mb-0.5 uppercase tracking-wider whitespace-nowrap">VAT Amount</label>
                <div className="text-[9px] sm:text-[10px] md:text-sm font-semibold text-right text-blue-600 dark:text-blue-400">{formatValue(vatAmount)|| '0.00'}</div>
              </div>

              {/* Discount - Card style */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
                <label className="block text-[7px] sm:text-[8px] md:text-[9px] font-medium text-black dark:text-gray-400 mb-0.5 text-right uppercase tracking-wider whitespace-nowrap">Discount Amount</label>
                <div className="text-[9px] sm:text-[10px] md:text-sm font-semibold text-right text-green-600 dark:text-green-400">{formatValue(discount) || '0.00'}</div>
              </div>

              {/* Invoice Value - Card style */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
                <label className="block text-[7px] sm:text-[8px] md:text-[9px] font-medium text-black dark:text-gray-400 mb-0.5 text-right uppercase tracking-wider whitespace-nowrap">Invoice Value</label>
                <div className="text-[9px] sm:text-[10px] md:text-sm font-semibold text-right text-purple-600 dark:text-purple-400">{formatValue(invoiceValue)|| '0.00'}</div>
              </div>

              {/* Net Invoice Value - Card style */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
                <label className="block text-[7px] sm:text-[8px] md:text-[9px] font-medium text-black dark:text-gray-400 mb-0.5 text-right uppercase tracking-wider whitespace-nowrap">Net Invoice Value</label>
                <div className="text-[9px] sm:text-[10px] md:text-sm font-semibold text-right text-pink-600 dark:text-pink-400">{formatValue(netInvoiceValue) || '0.00'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Delivery Note Values Table */}
        <div className="mt-3 sm:mt-4 border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3">
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <div className="min-w-[800px] lg:min-w-full">
              <table className="w-full text-[9px] sm:text-xs">
                <thead className="bg-blue-600 text-white">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-1 sm:px-1.5 py-1 text-right text-[8px] sm:text-[9px] font-semibold text-white uppercase whitespace-nowrap"
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
                <tbody className="divide-y divide-gray-200">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-50 even:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-1 sm:px-1.5 py-1 text-right">
                            <div className="flex items-center min-h-[20px] sm:min-h-[24px] justify-end">
                              <span className="text-[8px] sm:text-[9px] text-gray-800 dark:text-gray-300">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={defaultColumns.length} className="px-2 py-2 sm:py-3 text-center text-[9px] sm:text-xs text-black">
                        No delivery notes selected
                      </td>
                    </tr>
                  )}
                </tbody>
                {selectedOptions.length > 0 && (
                  <tfoot className="bg-gray-100 font-semibold border-t border-gray-300">
                    <tr>
                      <td className="px-1 sm:px-2 py-1"></td>
                      <td className="px-1 sm:px-2 py-1 text-[8px] sm:text-[9px]">TOTAL</td>
                      <td className="px-1 sm:px-2 py-1 text-[8px] sm:text-[9px]">{calculateTableTotals().gross.toFixed(2)}</td>
                      <td className="px-1 sm:px-2 py-1 text-[8px] sm:text-[9px]">{calculateTableTotals().discAmount.toFixed(2)}</td>
                      <td className="px-1 sm:px-2 py-1 text-[8px] sm:text-[9px]">{calculateTableTotals().vatPerc.toFixed(2)}</td>
                      <td className="px-1 sm:px-2 py-1 text-[8px] sm:text-[9px]">{calculateTableTotals().vatAdjValue.toFixed(2)}</td>
                      <td className="px-1 sm:px-2 py-1 text-[8px] sm:text-[9px]">{calculateTableTotals().vatAmountInside.toFixed(2)}</td>
                      <td className="px-1 sm:px-2 py-1 text-[8px] sm:text-[9px]">{calculateTableTotals().net.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </Card>
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
      
      <div className="flex flex-col mt-2 px-2">
        {content}
      </div>

      {/* Save confirmation modal */}
      {showSaveModal && (
        <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)} size="md">
          <ModalHeader>Confirm Save</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center justify-center text-4xl text-blue-500 mb-4">
                <FaSave />
              </div>
              <p className="text-sm text-black dark:text-black text-center">
                Save this invoice?
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button color="success" onClick={handleConfirmSave} disabled={saving} size="sm">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button color="gray" onClick={() => setShowSaveModal(false)} disabled={saving} size="sm">
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
      
      {sessionExpired && <SessionModal />}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default StockReceiveInvoice;