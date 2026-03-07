import { Card, Tooltip, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import { Badge } from 'flowbite-react';
import { HiRefresh, HiSearch, HiTrash, HiViewList ,HiInformationCircle } from 'react-icons/hi';
import { FaBoxOpen, FaCalendarAlt, FaChevronDown, FaMapMarkerAlt, FaMapPin, FaReceipt, FaSave, FaTruck, FaUser, FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaMoneyBillWave } from "react-icons/fa";
import React from "react";
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from 'flowbite-react';
import PurchaseTable from "./PurchaseTable";
import toast, { Toaster } from "react-hot-toast";
import CalendarDatePickerDate from "./CalenderDate";
import SessionModal from "../SessionModal";
import { useEntityFormatter } from "../Entity/UseEntityFormater";
import CalendarStockReceive from "../StockReceive/CalenderSrockReceive";

export interface TableTypeDense {
  avatar?: any;
  name?: string;
  post?: string;
  pname?: string;
  teams?: string;
  status?: string;
  statuscolor?: string;
  budget?: string;
  quotedGP?: string;
  actualGP?: string;
  gpDiff?: string;
  actualTotalGP?: string;
  totalGPDiff?: string;
  selected?: boolean;
  itemId?: number;
  packageId?: string;
  quantity?: number;
  originalActualGP?: number;
  originalActualGP1?: number;
  editableQuantity?: string;
  editableActualGP?: string;
  modalQuantity?: number;
}

interface Supplier {
  pk: number;
  code: string;
  name: string;
  discount: number;
}

interface Location {
  pk: number;
  code: string;
  name: string;
  deliveryType: number;
}

interface SupplierItemResponse {
  success: boolean;
  message: string;
  data: {
    periodSimple: any;
    poHeadPK: number;
    supplierFK: number;
    poHeadFK: number;
    locationFK: number;
    itemFK: number;
    userUniqueCode: string | null;
    poNumber: string | null;
    supplierName: string | null;
    consoId: string | null;
    period: string;
    podate: string | null;
    pOSupplier: string | null;
    poLocation: string | null;
    poLocationName: string | null;
    entityId: string | null;
    currencyId: string | null;
    currencyRate: number;
    discPer: number;
    lastUser: string | null;
    lastUpdate: string | null;
    deliveryType: number;
    poNum: string | null;
    pOperiod: string | null;
    entOrder: number;
    itemId: number;
    itemName: string | null;
    ip02: number;
    supplierId: string | null;
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
    userId: string | null;
    purchasePeriod: string | null;
    statusFk: number;
    statusName: string | null;
    paymentType: number;
    subList: any[];
    uploadedItem: UploadedItem[];
  };
}

interface UploadedItem {
  periodSimple: any;
  poHeadPK: number;
  supplierFK: number;
  poHeadFK: number;
  locationFK: number;
  itemFK: number;
  userUniqueCode: string | null;
  poNumber: string | null;
  supplierName: string;
  consoId: string | null;
  period: string;
  podate: string | null;
  pOSupplier: string | null;
  poLocation: string | null;
  poLocationName: string | null;
  entityId: string | null;
  currencyId: string | null;
  currencyRate: number;
  discPer: number;
  lastUser: string | null;
  lastUpdate: string | null;
  deliveryType: number;
  poNum: string | null;
  pOperiod: string | null;
  entOrder: number;
  itemId: number;
  itemName: string;
  ip02: number;
  supplierId: string | null;
  packageId: string;
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
  userId: string | null;
  purchasePeriod: string | null;
  statusFk: number;
  statusName: string | null;
  paymentType: number;
  subList: any[];
  uploadedItem: any[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

interface SaveRequest {
  period: string;
  podate: string;
  supplierId: string;
  poLocation: string;
  currencyId: string;
  currencyRate: number;
  discPer: number;
  entityId: string;
  userFk: number;
  subList: SubListItem[];
}

interface SubListItem {
  itemId: number;
  packageId: string;
  quantity: number;
  quotedGP: number;
  actualGP: number;
  actualGP1: number;
}

// ==================== TableRow component – memoized ====================
const TableRow = React.memo(({
  item,
  handleQuantityChange,
  handleActualGPChange,
  handleDelete,
  handleKeyDown,
  manuallyEditedItems,
  mainQuantityRefs,
  mainGPRefs,
}: {
  item: TableTypeDense;
  handleQuantityChange: (itemId: number, value: string) => void;
  handleActualGPChange: (itemId: number, value: string) => void;
  handleDelete: (itemId: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, itemId: number, field: 'quantity' | 'gp') => void;
  manuallyEditedItems: Set<number>;
  mainQuantityRefs: React.MutableRefObject<Record<number, HTMLInputElement | null>>;
  mainGPRefs: React.MutableRefObject<Record<number, HTMLInputElement | null>>;
}) => {
  const quantity = item.editableQuantity ?? '';
  const editableActualGP = item.editableActualGP ?? '';
  const hasError = parseFloat(quantity.toString()) === 0;
  const isManuallyEdited = manuallyEditedItems.has(item.itemId!);
  const isSystemValue = parseFloat(item.editableActualGP || '0') !== 0 && !isManuallyEdited;

  return (
    <tr className="hover:bg-blue-50 dark:hover:bg-gray-700 even:bg-gray-50 dark:even:bg-gray-800">
      {/* Item Code / Name - left aligned */}
      <td className="px-1.5 py-2 w-[180px]">
        <div className="flex items-center space-x-2 p-1 text-left">
          <div className="truncate max-w-32">
            <h6 className="text-xs font-bold text-black dark:text-white">{item.name}</h6>
            <p className="text-[11px] font-bold text-black dark:text-white">{item.pname}</p>
          </div>
        </div>
      </td>
      
      {/* Package Id - left aligned */}
      <td className="px-1.5 py-2">
        <p className="text-xs font-bold text-black dark:text-white text-left">{item.teams}</p>
      </td>
      
      {/* Quoted GP - right aligned */}
      <td className="px-1.5 py-2 text-right truncate" title={item.quotedGP}>
        <p className="text-xs font-bold text-black dark:text-white">{item.quotedGP}</p>
      </td>
      
      {/* QTY input - right aligned */}
    {/* QTY input - right aligned */}
{/* QTY input - right aligned */}
{/* QTY input - right aligned */}
<td className="px-1.5 py-2 w-[80px] text-right">
  <input
    type="text"
    value={item.editableQuantity || ''}
    ref={(el) => (mainQuantityRefs.current[item.itemId!] = el)}
    onChange={(e) => {
      const value = e.target.value;
      // Allow empty string or valid decimal numbers with up to 5 decimal places
      if (value === '' || /^\d*\.?\d{0,5}$/.test(value)) {
        handleQuantityChange(item.itemId!, value);
      }
    }}
    onKeyDown={(e) => handleKeyDown(e, item.itemId!, 'quantity')}
    className={`w-20 px-2 lg:ml-4 py-1.5 border rounded text-xs font-bold text-black dark:text-white text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`}
    placeholder="0"
  />
</td>
      {/* Actual GP input - right aligned */}
   {/* Actual GP input - right aligned */}
<td className="px-1.5 py-2 w-[90px] text-right">
  <input
    type="text"
    value={editableActualGP} // Remove the condition that hides zeros
    ref={(el) => (mainGPRefs.current[item.itemId!] = el)}
    onChange={(e) => handleActualGPChange(item.itemId!, e.target.value)}
    onKeyDown={(e) => handleKeyDown(e, item.itemId!, 'gp')}
    className="w-20 lg:ml-6 px-2 py-1.5 border border-gray-300 rounded text-xs font-bold text-black dark:text-white text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    disabled={isSystemValue}
    placeholder="0"
  />
</td>
      {/* GP Diff - right aligned */}
      <td className="px-1.5 py-2 w-[100px] text-right truncate" title={item.gpDiff}>
        <h6 className="text-xs font-bold text-black dark:text-white">{item.gpDiff}</h6>
      </td>
      
      {/* Actual TTL GP - right aligned */}
      <td className="px-1.5 py-2 w-[120px] text-right truncate" title={item.actualTotalGP}>
        <h6 className="text-xs font-bold text-black dark:text-white ml-5">{item.actualTotalGP}</h6>
      </td>
      
      {/* TTL GP Diff - right aligned */}
      <td className="px-1.5 py-2 w-[120px] text-right truncate" title={item.totalGPDiff}>
        <h6 className="text-xs font-bold text-black dark:text-white">{item.totalGPDiff}</h6>
      </td>
      
      {/* Delete button - center aligned */}
      <td className="px-1.5 py-2 w-[70px] text-center">
        <Button
          color="failure"
          size="xs"
          onClick={() => handleDelete(item.itemId!)}
          className="inline-flex items-center justify-center"
        >
          <HiTrash className="w-4 h-4 text-red-600" />
        </Button>
      </td>
    </tr>
  );
});

// ==================== Main Component ====================
const PurchaseOrderCreation = () => {
  const { formatDate, formatDateTime, formatAmount, parseDate } = useEntityFormatter();

  const formatter = useEntityFormatter(); 

  // ===== State =====
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchMainItems, setSearchMainItems] = useState('');
  const [addedItemIds, setAddedItemIds] = useState<Set<number>>(new Set());
  const [manuallyEditedItems, setManuallyEditedItems] = useState<Set<number>>(new Set());
  const location = useLocation();
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
  const [isOpenSupplier, setIsOpenSupplier] = useState(false);
  const [isOpenLocation, setIsOpenLocation] = useState(false);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [, setRefreshing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{success: boolean, message: string} | null>(null);
  const [saving, setSaving] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef1 = useRef<HTMLDivElement>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [supplierItems, setSupplierItems] = useState<UploadedItem[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [modalSelectedItems, setModalSelectedItems] = useState<Set<number>>(new Set());
  const [modalQuantities, setModalQuantities] = useState<Record<number, string>>({});
  const [currencyId, setCurrencyId] = useState(() => {
    return location.state?.currencyId || localStorage.getItem("currencyId") || "";
  });
  const [currencyRate, setCurrencyRate] = useState(() => "1.00");
  const [entityId, setEntityId] = useState(() => {
    return location.state?.entity || localStorage.getItem("entity") || "";
  });
const formatValue = (value) => {
  const num = Number.parseFloat(value);
  return isNaN(num) ? '0.00' : formatter.formatAmount(num);
};
const formatQuantity = (value, decimals = 5) => {
  const num = Number.parseFloat(value);
  return isNaN(num) ? '0.00' : formatter.formatQuantity(num, decimals);
};
  // Sorting state for main table
  const [mainSortConfig, setMainSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  // Sorting state for modal table
  const [modalSortConfig, setModalSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Pagination for main table
  const [mainPageIndex, setMainPageIndex] = useState(0);
  const [mainPageSize, setMainPageSize] = useState(10);

  // Pagination for modal table
  const [modalPagination, setModalPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Focus management after page change (main table)
  // Focus management after page change (modal table)
  const [focusAfterModalPageChange, setFocusAfterModalPageChange] = useState<'first' | 'last' | null>(null);

  const [focusAfterMainPageChange, setFocusAfterMainPageChange] = useState<{
  type: 'first' | 'last' | 'specific';
  rowIndex?: number;
  field?: 'quantity' | 'gp';
} | null>(null);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");
  const purchasePeriod = localStorage.getItem("purchasePeriod");
// ===== Handlers for modal quantity changes =====
const handleModalQuantityChange = (itemId: number, value: string) => {
  // Allow empty string or valid decimal numbers
  if (value === '') {
    setModalQuantities(prev => ({ ...prev, [itemId]: '' }));
    return;
  }
  
  // Remove any non-numeric characters except decimal point
  value = value.replace(/[^0-9.]/g, '');
  
  // Prevent multiple decimal points
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 5
  const [integer, decimal = ''] = value.split('.');
  if (integer.length > 8) return; // Limit integer part to 8 digits
  if (decimal.length > 5) {
    value = integer + '.' + decimal.slice(0, 5);
  }
  
  setModalQuantities(prev => ({ ...prev, [itemId]: value }));
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
    } catch (error) {setSessionExpired
       (true);
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };
  const SUPPLIER_API = "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/loadSuppliersDropdown";
  const LOCATION_API = "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/loadLocationDropdown";
  const SUPPLIER_ITEMS_API = "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/viewSuppliersItem";
  const SAVE_API = "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/purchaseOrderController/prepareSave";

const isGPFocusable = useCallback((item: TableTypeDense) => {
  // GP input is disabled if it's a non-zero system value (not manually edited)
  const gpValue = parseFloat(item.editableActualGP || item.actualGP || '0');
  const isSystemValue = gpValue !== 0 && !manuallyEditedItems.has(item.itemId!);
  return !isSystemValue;
}, [manuallyEditedItems]);

  // ===== Effects =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node) &&
        supplierDropdownRef1.current &&
        !supplierDropdownRef1.current.contains(event.target as Node)
      ) {
        setIsOpenLocation(false);
        setIsOpenSupplier(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset main page when filter or sort changes
  useEffect(() => {
    setMainPageIndex(0);
  }, [searchMainItems, mainSortConfig]);

    const filteredMainItems = useMemo(() =>
    selectedItems.filter((item) =>
      item.pname?.toLowerCase().includes(searchMainItems.toLowerCase()) ||
      item.itemId?.toString().includes(searchMainItems.toLowerCase()) ||
      item.teams?.toLowerCase().includes(searchMainItems.toLowerCase())
    ),
    [selectedItems, searchMainItems]
  );

    const sortedMainItems = useMemo(() => {
    if (!mainSortConfig || !filteredMainItems.length) return filteredMainItems;
    return [...filteredMainItems].sort((a, b) => {
      let aVal = a[mainSortConfig.key as keyof TableTypeDense];
      let bVal = b[mainSortConfig.key as keyof TableTypeDense];
      const aNum = parseFloat(aVal as string);
      const bNum = parseFloat(bVal as string);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        aVal = aNum;
        bVal = bNum;
      }
      if (aVal < bVal) return mainSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return mainSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMainItems, mainSortConfig]);


  // Focus after main page change
  useEffect(() => {
    if (focusAfterMainPageChange) {
      const timer = setTimeout(() => {
        const pageItems = sortedMainItems.slice(mainPageIndex * mainPageSize, (mainPageIndex + 1) * mainPageSize);
        if (pageItems.length > 0) {
          const targetItemId = focusAfterMainPageChange === 'first'
            ? pageItems[0].itemId!
            : pageItems[pageItems.length - 1].itemId!;
          const targetInput = mainQuantityRefs.current[targetItemId];
          targetInput?.focus();
        }
        setFocusAfterMainPageChange(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mainPageIndex, focusAfterMainPageChange, sortedMainItems]);

    const filteredItems = useMemo(() =>
    Array.isArray(supplierItems)
      ? supplierItems.filter((item) =>
          item.itemName?.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.itemId?.toString().includes(searchItem.toLowerCase())
        )
      : [],
    [supplierItems, searchItem]
  );

    const supplierItemsData = useMemo<TableTypeDense[]>(
    () =>
      filteredItems.map((item) => ({
        avatar: '',
        name: item.itemId.toString(),
        post: '',
        pname: item.itemName,
        actualGP: formatAmount(item.actualGP || 0, 2),
        teams: item.packageId,
        status: formatAmount(item.quotedGP || 0, 2),
        statuscolor: 'blue',
        budget: formatQuantity(item.quantity ),
        selected: modalSelectedItems.has(item.itemId),
        itemId: item.itemId,
        quantity: item.quantity,
        modalQuantity: item.quantity,
      })),
    [filteredItems, modalSelectedItems, formatAmount, formatQuantity]
  );


  const sortedModalItems = useMemo(() => {
    if (!modalSortConfig || !supplierItemsData.length) return supplierItemsData;
    return [...supplierItemsData].sort((a, b) => {
      let aVal = a[modalSortConfig.key as keyof TableTypeDense];
      let bVal = b[modalSortConfig.key as keyof TableTypeDense];
      const aNum = parseFloat(aVal as string);
      const bNum = parseFloat(bVal as string);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        aVal = aNum;
        bVal = bNum;
      }
      if (aVal < bVal) return modalSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return modalSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [supplierItemsData, modalSortConfig]);

  

  // Focus after modal page change
  useEffect(() => {
    if (focusAfterModalPageChange) {
      const timer = setTimeout(() => {
        const pageItems = sortedModalItems.slice(
          modalPagination.pageIndex * modalPagination.pageSize,
          (modalPagination.pageIndex + 1) * modalPagination.pageSize
        );
        if (pageItems.length > 0) {
          const targetItemId = focusAfterModalPageChange === 'first'
            ? pageItems[0].itemId!
            : pageItems[pageItems.length - 1].itemId!;
          quantityInputRefs.current[targetItemId]?.focus();
        }
        setFocusAfterModalPageChange(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [modalPagination.pageIndex, focusAfterModalPageChange, sortedModalItems]);

  // ===== Data Fetching =====
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      setSelectedSupplier(null);
      setSelectedLocation(null);
      setSelectedItems([]);
      setAddedItemIds(new Set());
      setManuallyEditedItems(new Set());
      setModalSelectedItems(new Set());
      setSupplierItems([]);
      setDiscountPercentage('');
      setSearchSupplier('');
      setSearchLocation('');
      setSearchItem('');
      setSaveStatus(null);
      setMainSortConfig(null);
      setModalSortConfig(null);
      const currentDate = new Date();
      const offset = currentDate.getTimezoneOffset();
      const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
      setToDate(localDate.toISOString().split('T')[0]);
      setOpenModal(false);
      setIsOpenSupplier(false);
      setIsOpenLocation(false);
      await Promise.all([
        fetchSuppliers(),
        fetchLocations()
      ]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveClick = () => {
    try {
      if (!token) {
        setSessionExpired(true);
        return;
      }
      if (!selectedSupplier) {
        toast.error("Please select a supplier");
        return;
      }
      if (!selectedLocation) {
        toast.error("Please select a delivery location");
        return;
      }
      if (selectedItems.length === 0) {
        toast.error("Please add the item");
        return;
      }
      if (!toDate) {
        toast.error("Please select a delivery date");
        return;
      }
      const itemsWithZeroQuantity = selectedItems.filter(item =>
        (parseFloat(item.editableQuantity || '0') || 0) === 0
      );
      if (itemsWithZeroQuantity.length > 0) {
        toast.error(`Cannot save: ${itemsWithZeroQuantity.length} item(s) have quantity 0`);
        return;
      }
      setShowSaveModal(true);
    } catch (error) {
      setSessionExpired(true);
      console.error("Error in validation:", error);
      toast.error("An error occurred during validation");
    }
  };

  const handleSave = async () => {
    setShowSaveModal(false);
    try {
      setIsLoading(true);
      setSaving(true);
      const formattedPeriod = formatDateForAPI(purchasePeriod || '');
      const formattedPoDate = toDate;
      const subList: SubListItem[] = selectedItems.map(item => ({
        itemId: item.itemId!,
        packageId: item.teams!,
        quantity: parseFloat(item.editableQuantity || '0'),
        quotedGP: parseFloat(item.quotedGP || '0'),
        actualGP: parseFloat(item.editableActualGP || item.actualGP || '0'),
        actualGP1: parseFloat(item.editableActualGP || item.actualGP || '0')
      }));
      const saveData: SaveRequest = {
        period: formattedPeriod,
        podate: formattedPoDate,
        supplierId: selectedSupplier!.code,
        poLocation: selectedLocation!.code,
        currencyId: currencyId,
        currencyRate: parseFloat(currencyRate),
        discPer: parseFloat(discountPercentage),
        entityId: entityId,
        userFk: parseInt(userId || "1001"),
        subList: subList
      };
      const response = await fetch(SAVE_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      const result = await response.json();
      if (result.success) {
        toast.success("Purchase order saved successfully!");
        handleRefresh();
      } else {
        throw new Error(result.message || "Failed to save purchase order");
      }
    } catch (error) {
      setSessionExpired(true);
      console.error('Error saving purchase order:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save purchase order");
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  const formatDateForAPI = (dateString: string): string => {
    try {
      let date: Date;
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      if (isNaN(date.getTime())) {
        date = new Date();
      }
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchLocations();
  }, [location.state]);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const response = await fetch(SUPPLIER_API, {
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
      const result: ApiResponse<Supplier> = await response.json();
      if (result.success) {
        setSuppliers(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setSessionExpired(true);
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      if (!token) {
        setSessionExpired(true);
        return;
      }
      setIsLoading(true);
      const response = await fetch(LOCATION_API, {
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
      const result: ApiResponse<Location> = await response.json();
      if (result.success) {
        setLocations(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setSessionExpired(true);
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupplierItems = async (supplierPk: number, purchasePeriod: string) => {
    try {
      setIsLoading(true);
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const formattedDate = purchasePeriod;
      const url = `${SUPPLIER_ITEMS_API}/${supplierPk}/${formattedDate}`;
      const response = await fetch(url, {
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
      const result: SupplierItemResponse = await response.json();
      if (result.success) {
        setSupplierItems(result.data.uploadedItem || []);
        if (!currencyId) setCurrencyId(result.data.currencyId || '');
        if (!entityId) setEntityId(result.data.entityId || '');
        setDiscountPercentage(result.data.discPer.toString());
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setSessionExpired(true);
      console.error('Error fetching supplier items:', error);
      setSupplierItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
    location.code.toLowerCase().includes(searchLocation.toLowerCase())
  );

  // Memoize filtered items for modal


  // Reset modal pagination when filter or data changes
  useEffect(() => {
    setModalPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [searchItem, supplierItems]);

  // ===== Helper functions =====
  const clearItemData = () => {
    setSelectedItems([]);
    setAddedItemIds(new Set());
    setManuallyEditedItems(new Set());
    setModalSelectedItems(new Set());
    setSupplierItems([]);
    setSearchItem('');
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    clearItemData();
    setSelectedSupplier(supplier);
    setDiscountPercentage(supplier.discount.toString());
    setIsOpenSupplier(false);
    setSearchSupplier('');
    setSaveStatus(null);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setIsOpenLocation(false);
    setSearchLocation('');
    setSaveStatus(null);
    updateActualGPBasedOnDeliveryType(location.deliveryType);
  };

  const updateActualGPBasedOnDeliveryType = (deliveryType: number) => {
    const updatedItems = selectedItems.map(item => {
      const supplierItem = supplierItems.find(si => si.itemId === item.itemId);
      if (supplierItem) {
        const actualGPValue = deliveryType === 0 ? supplierItem.actualGP : supplierItem.actualGP1;
        const quantity = parseFloat(item.editableQuantity || '0');
        const quotedGP = parseFloat(item.quotedGP || '0');
        const { gpDiff, actualTotalGP, totalGPDiff } = recalculateGPValues({ quantity, quotedGP, actualGP: actualGPValue });
        return {
          ...item,
          actualGP: formatAmount(actualGPValue, 2),
          editableActualGP: formatAmount(actualGPValue, 2),
          gpDiff: gpDiff,
          actualTotalGP: actualTotalGP,
          totalGPDiff: totalGPDiff,
          originalActualGP: supplierItem.actualGP,
          originalActualGP1: supplierItem.actualGP1
        };
      }
      return item;
    });
    setSelectedItems(updatedItems);
    setManuallyEditedItems(prev => {
      const newSet = new Set(prev);
      updatedItems.forEach(item => {
        if (item.itemId && parseFloat(item.editableActualGP || '0') !== 0) {
          newSet.delete(item.itemId);
        }
      });
      return newSet;
    });
  };

  const handleOpenModal = () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    setSearchItem('');
    const formattedRequestPeriod = purchasePeriod || '';
    fetchSupplierItems(selectedSupplier.pk, formattedRequestPeriod);
    setOpenModal(true);
    setModalSelectedItems(new Set());
    setModalSortConfig(null);
    setSaveStatus(null);
  };

  const handleItemSelect = (itemId: number) => {
    if (addedItemIds.has(itemId)) {
      return;
    }
    const newSelectedItems = new Set(modalSelectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setModalSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    if (modalSelectedItems.size === filteredItems.length - addedItemIds.size) {
      setModalSelectedItems(new Set());
    } else {
      const selectableItems = filteredItems.filter(item => !addedItemIds.has(item.itemId));
      const allSelectableItemIds = new Set(selectableItems.map(item => item.itemId));
      setModalSelectedItems(allSelectableItemIds);
    }
  };

const recalculateGPValues = ({ quantity, quotedGP, actualGP }: { quantity: number, quotedGP: number, actualGP: number }) => {
  const gpDiffNum = quotedGP - actualGP;
  const actualTotalGPNum = actualGP * quantity;
  const totalGPDiffNum = gpDiffNum * quantity;
  return {
    gpDiff: formatAmount(gpDiffNum, 5), // Use 5 decimal places
    actualTotalGP: formatAmount(actualTotalGPNum, 5), // Use 5 decimal places
    totalGPDiff: formatAmount(totalGPDiffNum, 5), // Use 5 decimal places
  };
};

const handleAddItems = () => {
  const selectedItemData = supplierItems.filter(item =>
    modalSelectedItems.has(item.itemId)
  ).map(item => {
    const defaultDeliveryType = 0;
    const actualGPValue = defaultDeliveryType === 0 ? item.actualGP : item.actualGP1;
    // Get quantity from modalQuantities or default to item.quantity
    const quantityStr = modalQuantities[item.itemId] || item.quantity.toString();
    const quantityNum = parseFloat(quantityStr) || 0;
    const quotedGP = item.quotedGP || 0;
    const { gpDiff, actualTotalGP, totalGPDiff } = recalculateGPValues({ quantity: quantityNum, quotedGP, actualGP: actualGPValue });
    return {
      avatar: "",
      name: item.itemId.toString(),
      post: "",
      pname: item.itemName,
      teams: item.packageId,
      status: formatValue(item.quotedGP ),
      statuscolor: "blue",
      budget: formatQuantity(quantityNum),
      quotedGP: formatValue(item.quotedGP ),
      actualGP: formatValue(actualGPValue),
      gpDiff: formatValue(gpDiff),
      actualTotalGP:formatValue (actualTotalGP),
      totalGPDiff: formatValue(totalGPDiff),
      itemId: item.itemId,
      packageId: item.packageId,
      quantity: quantityNum,
      originalActualGP: item.actualGP,
      originalActualGP1: item.actualGP1,
      editableQuantity: quantityStr, // Store the string value including decimals
      editableActualGP: formatAmount(actualGPValue, 2),
      isManuallyEdited: false
    };
  });

  // Filter out items that are already added
  const newItems = selectedItemData.filter(item => !addedItemIds.has(item.itemId!));
  
  if (newItems.length === 0 && selectedItemData.length > 0) {
    toast.error("Selected items are already added to the table");
    return;
  }

  // Add new items to the table
  const newAddedIds = new Set(addedItemIds);
  newItems.forEach(item => newAddedIds.add(item.itemId!));
  setAddedItemIds(newAddedIds);
  setSelectedItems(prev => [...prev, ...newItems]);
  
  // Close modal and reset selections
  setOpenModal(false);
  setModalSelectedItems(new Set());
  setModalQuantities({});
  setSaveStatus(null);
  
  if (newItems.length < selectedItemData.length) {
    toast.success(`${newItems.length} items added successfully. ${selectedItemData.length - newItems.length} items were already in the table.`);
  } else if (newItems.length > 0) {
    toast.success(`${newItems.length} items added successfully!`);
  }
};

  // ===== Handlers for quantity/GP changes (now using itemId) =====
 // ===== Handlers for quantity/GP changes (now using itemId) =====
const handleQuantityChange = (itemId: number, value: string) => {
  // Allow empty string
  if (value === '') {
    setSelectedItems(prev => prev.map(item => {
      if (item.itemId !== itemId) return item;
      const quantityNum = 0;
      const quotedGP = parseFloat(item.quotedGP || '0');
      const actualGP = parseFloat(item.editableActualGP || item.actualGP || '0');
      const recalculatedValues = recalculateGPValues({ quantity: quantityNum, quotedGP, actualGP });
      return {
        ...item,
        editableQuantity: '',
        budget: formatQuantity(quantityNum, 5), // Format with 5 decimal places
        gpDiff: recalculatedValues.gpDiff,
        actualTotalGP: recalculatedValues.actualTotalGP,
        totalGPDiff: recalculatedValues.totalGPDiff,
      };
    }));
    setSaveStatus(null);
    return;
  }
  
  // Remove any non-numeric characters except decimal point
  value = value.replace(/[^0-9.]/g, '');
  
  // Prevent multiple decimal points
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 5 for quantity
  const [integer, decimal = ''] = value.split('.');
  if (integer.length > 5) return; // Limit integer part to 5 digits
  if (decimal.length > 5) {
    value = integer + '.' + decimal.slice(0, 5);
  }

  setSelectedItems(prev => prev.map(item => {
    if (item.itemId !== itemId) return item;
    const quantityNum = parseFloat(value) || 0;
    const quotedGP = parseFloat(item.quotedGP || '0');
    const actualGP = parseFloat(item.editableActualGP || item.actualGP || '0');
    const recalculatedValues = recalculateGPValues({ quantity: quantityNum, quotedGP, actualGP });
    return {
      ...item,
      editableQuantity: value,
      budget: formatQuantity(quantityNum, 5), // Format with 5 decimal places
      gpDiff: recalculatedValues.gpDiff,
      actualTotalGP: recalculatedValues.actualTotalGP,
      totalGPDiff: recalculatedValues.totalGPDiff,
    };
  }));
  setSaveStatus(null);
};

  const handleActualGPChange = (itemId: number, value: string) => {
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    const [integer, decimal = ''] = value.split('.');
    if (integer.length > 5) return;
    if (decimal.length > 5) {
      value = integer + '.' + decimal.slice(0, 5);
    }

    setManuallyEditedItems(prev => new Set(prev).add(itemId));

    setSelectedItems(prev => prev.map(item => {
      if (item.itemId !== itemId) return item;
      const actualGPNum = parseFloat(value) || 0;
      const quantity = parseFloat(item.editableQuantity || '0');
      const quotedGP = parseFloat(item.quotedGP || '0');
      const recalculatedValues = recalculateGPValues({ quantity, quotedGP, actualGP: actualGPNum });
      return {
        ...item,
        editableActualGP: value,
        actualGP: formatAmount(actualGPNum, 5),
        gpDiff: recalculatedValues.gpDiff,
        actualTotalGP: recalculatedValues.actualTotalGP,
        totalGPDiff: recalculatedValues.totalGPDiff,
      };
    }));
    setSaveStatus(null);
  };

  const handleDelete = (itemId: number) => {
    if (itemId) {
      const newAddedIds = new Set(addedItemIds);
      newAddedIds.delete(itemId);
      setAddedItemIds(newAddedIds);
    }
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId));
    setSaveStatus(null);
  };

  // ===== Date state =====
  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);
  const [fromDate] = useState(() => {
    const offset = twoYearsAgo.getTimezoneOffset();
    const localDate = new Date(twoYearsAgo.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });

  const [openModal, setOpenModal] = useState(false);

  // ===== Memoized data for tables =====

  // Sorting for modal table

  const requestModalSort = (key: string) => {
    setModalSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
    setModalPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const quantityInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const mainQuantityRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const mainGPRefs = useRef<Record<number, HTMLInputElement | null>>({});



  // Sorting for main table

  const requestMainSort = (key: string) => {
    setMainSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  // Paginated main items
  const paginatedMainItems = useMemo(() => {
    const start = mainPageIndex * mainPageSize;
    return sortedMainItems.slice(start, start + mainPageSize);
  }, [sortedMainItems, mainPageIndex, mainPageSize]);

  const mainTotalPages = Math.ceil(sortedMainItems.length / mainPageSize);

  // ===== Keyboard navigation for main table =====
const handleMainTableKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  absoluteIndex: number,
  field: 'quantity' | 'gp'
) => {
  if (e.key !== 'Tab') return;

  const isShift = e.shiftKey;
  const totalItems = sortedMainItems.length;
  const totalSlots = totalItems * 2; // each row: quantity (slot 0), gp (slot 1)

  // Convert current position to slot index
  const currentSlot = absoluteIndex * 2 + (field === 'quantity' ? 0 : 1);

  // Determine direction
  const step = isShift ? -1 : 1;
  let nextSlot = currentSlot + step;

  // Scan for next focusable slot
  let foundSlot = -1;
  while (nextSlot >= 0 && nextSlot < totalSlots) {
    const rowIndex = Math.floor(nextSlot / 2);
    const targetField = nextSlot % 2 === 0 ? 'quantity' : 'gp';
    const item = sortedMainItems[rowIndex];
    if (targetField === 'quantity' || isGPFocusable(item)) {
      foundSlot = nextSlot;
      break;
    }
    nextSlot += step;
  }

  if (foundSlot === -1) {
    // No focusable input in the entire table → let browser handle tab
    return;
  }

  const targetRowIndex = Math.floor(foundSlot / 2);
  const targetField = foundSlot % 2 === 0 ? 'quantity' : 'gp';
  const targetItem = sortedMainItems[targetRowIndex];

  // Determine page of target
  const targetPage = Math.floor(targetRowIndex / mainPageSize);
  const currentPage = mainPageIndex;

  if (targetPage !== currentPage) {
    // Need to change page
    e.preventDefault();
    setFocusAfterMainPageChange({
      type: 'specific',
      rowIndex: targetRowIndex,
      field: targetField,
    });
    setMainPageIndex(targetPage);
  } else {
    // Same page: focus directly
    const targetInput =
      targetField === 'quantity'
        ? mainQuantityRefs.current[targetItem.itemId!]
        : mainGPRefs.current[targetItem.itemId!];
    if (targetInput) {
      e.preventDefault();
      targetInput.focus();
    }
  }
};

useEffect(() => {
  if (focusAfterMainPageChange) {
    const timer = setTimeout(() => {
      const pageItems = sortedMainItems.slice(
        mainPageIndex * mainPageSize,
        (mainPageIndex + 1) * mainPageSize
      );
      if (pageItems.length === 0) return;

      let targetItemId: number;
      let targetField: 'quantity' | 'gp' = 'quantity'; // default

      if (focusAfterMainPageChange.type === 'first') {
        targetItemId = pageItems[0].itemId!;
      } else if (focusAfterMainPageChange.type === 'last') {
        targetItemId = pageItems[pageItems.length - 1].itemId!;
      } else {
        // specific
        const relativeIndex =
          focusAfterMainPageChange.rowIndex! - mainPageIndex * mainPageSize;
        if (relativeIndex >= 0 && relativeIndex < pageItems.length) {
          targetItemId = pageItems[relativeIndex].itemId!;
          targetField = focusAfterMainPageChange.field!;
        } else {
          // fallback to first
          targetItemId = pageItems[0].itemId!;
        }
      }

      const targetInput =
        targetField === 'quantity'
          ? mainQuantityRefs.current[targetItemId]
          : mainGPRefs.current[targetItemId];
      targetInput?.focus();
      setFocusAfterMainPageChange(null);
    }, 0);
    return () => clearTimeout(timer);
  }
}, [mainPageIndex, focusAfterMainPageChange, sortedMainItems]);

  // ===== Keyboard navigation for modal quantity inputs =====
const handleModalQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: number) => {
  if (e.key !== 'Tab') return;

  const isShift = e.shiftKey;

  // Get current page items in order
  const currentPageItems = sortedModalItems.slice(
    modalPagination.pageIndex * modalPagination.pageSize,
    (modalPagination.pageIndex + 1) * modalPagination.pageSize
  );
  const currentIndex = currentPageItems.findIndex(i => i.itemId === itemId);
  if (currentIndex === -1) return;

  let nextIndex = isShift ? currentIndex - 1 : currentIndex + 1;

  // Check if we need to change page
  if (!isShift && nextIndex >= currentPageItems.length) {
    if (modalPagination.pageIndex < Math.ceil(sortedModalItems.length / modalPagination.pageSize) - 1) {
      e.preventDefault();
      setFocusAfterModalPageChange('first');
      setModalPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
    }
    return;
  }

  if (isShift && nextIndex < 0) {
    if (modalPagination.pageIndex > 0) {
      e.preventDefault();
      setFocusAfterModalPageChange('last');
      setModalPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
    }
    return;
  }

  // Within same page
  if (nextIndex >= 0 && nextIndex < currentPageItems.length) {
    const nextItemId = currentPageItems[nextIndex].itemId!;
    const nextInput = quantityInputRefs.current[nextItemId];
    if (nextInput) {
      e.preventDefault();
      nextInput.focus();
    }
  }
};

  // ===== UI helpers =====
  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
    handleRefresh();
  };
const totalActualGP = useMemo(() => {
  return selectedItems.reduce((sum, item) => {
    return sum + (parseFloat(item.actualTotalGP || '0') || 0);
  }, 0);
}, [selectedItems]);
const statsCards = [
  { title: "PO No", value: "# Auto", icon: FaReceipt, color: "purple" },
  { title: "Request Period", value: formatPurchasePeriod(purchasePeriod || ''), icon: FaCalendarAlt, color: "blue" },
  { 
    title: "Total Cost", 
    value: formatAmount(totalActualGP, 2),
    icon: FaMoneyBillWave, 
    color: "emerald",
    tooltip: "Total Actual GP (Sum of all items' Actual Total GP)" // Added tooltip text
  },
  { title: "Items", value: `${selectedItems.length} items`, icon: FaBoxOpen, color: "amber" },
];
  const renderMainHeader = (label: string, key: string, className: string) => (
    <th
      className={`px-1.5 py-1 text-xs font-semibold text-white uppercase whitespace-nowrap cursor-pointer select-none ${className}`}
      onClick={() => requestMainSort(key)}
    >
      {label}
      {mainSortConfig?.key === key && (
        <span className="ml-1 text-[8px]">
          {mainSortConfig.direction === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
  );

  // ===== Render =====
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: "",
          style: { background: "#363636", color: "#fff", zIndex: 999999 },
          success: { style: { background: "#10b981" } },
          error: { style: { background: "#ef4444" } },
          duration: 2000,
        }}
      />
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
  {showTable ? (
    <div className="flex flex-wrap gap-2 mt- w-full">{/* optional buttons */}</div>
  ) : (
    <>
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-2 mt-2 w-full ">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-xl text-indigo-700 whitespace-nowrap">
              Purchase Order Creation
            </h1>
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
          
          <div className="flex gap-2 sm:gap-3 ">
            <Tooltip content="Save" className="z-50" placement="bottom">
              <Button
                color="success"
                size="md"
                className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                onClick={handleSaveClick}
                disabled={saving}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <FaSave className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>
            </Tooltip>
            
            <Tooltip content="Refresh" className="z-50" placement="bottom">
              <Button
                color="warning"
                size="md"
                className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                onClick={handleRefresh}
              >
                <HiRefresh className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Tooltip>
            
            <Tooltip content="List" className="z-50" placement="bottom">
              <Button
                color="primary"
                size="md"
                className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                onClick={handleListClick}
              >
                <HiViewList className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>
    </>
  )}
</div>
      {showTable ? (
        <PurchaseTable onBack={handleAddClick} />
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 sm:p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
         {statsCards.map((stat, idx) => {
  const IconComponent = stat.icon;
  const colorMap: Record<string, string> = {
    purple: "purple-500",
    blue: "blue-500",
    emerald: "emerald-500",
    amber: "amber-500",
  };
  const borderColor = colorMap[stat.color] || "blue-500";
  const bgColor = colorMap[stat.color] || "blue-500";
  return (
    <Card key={idx} className={`border-l-8 border-${borderColor} shadow-sm p-2 h-9`}>
      <div className="flex items-center gap-2">
        <div className={`p-1.5 bg-${bgColor} rounded-lg`}>
          <IconComponent className="w-3 h-3 text-white" />
        </div>
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium text-black dark:text-white">
            {stat.title}: <span className="font-bold">{stat.value}</span>
          </p>
          {stat.tooltip && (
            <Tooltip content={stat.tooltip} className="z-50" placement="top">
              <div className="cursor-help">
                <HiInformationCircle className="w-3.5 h-3.5 text-blue-500 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
})}
          </div>

          <div className="h-1.5"></div>

          {/* Supplier & Location Cards */}
         
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
  {/* Supplier Card */}
  <Card className="border border-blue-300 relative pt-2 h-auto sm:h-32 md:h-32">
    {/* In the Supplier Card header */}
    <div className="absolute -top-2 left-1 sm:left-2 md:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-0.5 sm:gap-1">
        <div className="p-0.5 bg-blue-100 dark:bg-blue-900 rounded">
          <FaUser className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400">SUPPLIER</h3>
        <Tooltip content="Select the supplier for this purchase order" className="z-50" placement="top">
          <div className="cursor-help ml-0 sm:ml-0.5">
            <HiInformationCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300" />
          </div>
        </Tooltip>
      </div>
    </div>

    <div className="h-1 sm:h-2"></div>
    <div className="h-1 sm:h-2"></div>

    <div className="mt-0 sm:mt-">
      {/* Supplier Dropdown */}
      <div ref={supplierDropdownRef} className="relative flex-1 mb-2 sm:mb-3 mt-0 sm:mt-">
        <div className="relative group">
          {/* Main Input Button */}
          <button
            onClick={() => setIsOpenSupplier(!isOpenSupplier)}
            className={`w-full h-8 sm:h-9 md:h-10 px-2 sm:px-3 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-200 ${
              selectedSupplier
                ? 'border-blue-500 shadow-sm'
                : 'border-gray-400 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2 truncate">
              <div className={`p-0.5 sm:p-1 rounded-full ${selectedSupplier ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <FaUser className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${selectedSupplier ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-[10px] sm:text-xs md:text-sm font-medium truncate ${selectedSupplier ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {selectedSupplier ? `${selectedSupplier.code} - ${selectedSupplier.name}` : 'Choose supplier'}
                <span className="text-red-500 ml-0.5 sm:ml-1">*</span>
              </span>
            </div>
            <FaChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 transition-transform duration-200 ${isOpenSupplier ? 'rotate-180' : ''} text-gray-400`} />
          </button>

          {/* Dropdown Panel */}
          {isOpenSupplier && (
            <div className="absolute z-20 w-full mt-1 sm:mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Search Header */}
              <div className="p-2 sm:p-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="relative">
                  <HiSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                    className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 md:py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-40 sm:max-h-48 md:max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {/* Default Option */}
                <div
                  className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setIsOpenSupplier(false);
                    setSelectedSupplier(null);
                    setDiscountPercentage('');
                    clearItemData();
                  }}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500">📌</span>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Please Select a Supplier</span>
                  </div>
                </div>

                {/* Supplier Options */}
                {filteredSuppliers.map((supplier, index) => (
                  <div
                    key={supplier.pk}
                    className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                    onClick={() => handleSupplierSelect(supplier)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ${
                          selectedSupplier?.pk === supplier.pk
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                        }`}>
                          <span className="text-[8px] sm:text-[10px] md:text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                            {supplier.code} - {supplier.name}
                          </div>
                        </div>
                      </div>
                      {selectedSupplier?.pk === supplier.pk && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-[8px] sm:text-[10px] md:text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* No Results */}
                {filteredSuppliers.length === 0 && (
                  <div className="px-3 sm:px-4 py-4 sm:py-6 md:py-8 text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">🔍</div>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">No suppliers found</p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 mt-0.5 sm:mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-1 sm:p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[8px] sm:text-[10px] text-gray-500 text-center">
                  {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-1 sm:h-2"></div>

      {/* Calendar + Select Items Button in single horizontal row */}
      <div className="flex items-center w-full gap-1 sm:gap-2 px-0 sm:px-1">
        <div className="flex-1 relative min-w-0">
          <div className="flex-1">
            <p className="absolute -translate-y-2.5 sm:-translate-y-3 translate-x-1 sm:translate-x-2 bg-white px-0.5 sm:px-1 text-[8px] sm:text-[10px] md:text-xs text-black z-10 dark:bg-gray-800 dark:text-white">
              Delivery Date<span className="text-red-500 ml-0.5">*</span>
            </p>
            <Tooltip content="Select the expected delivery date for these items" className="z-50" placement="top">
              <div className="absolute -translate-y-2.5 sm:-translate-y-3 translate-x-14 sm:translate-x-16 md:translate-x-20 lg:translate-x-24 bg-white px-0.5 sm:px-1 z-10 cursor-help dark:bg-gray-800">
                <HiInformationCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-blue-500 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 dark:bg-gray-800" />
              </div>
            </Tooltip>
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
              className="text-[10px] sm:text-xs"
            />
          </div>
        </div>

        <Button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[8px] sm:text-[10px] md:text-xs py-1 sm:py-1.5 md:py-2 px-1 sm:px-2 whitespace-nowrap shrink-0 w-auto min-w-[60px] sm:min-w-[70px] md:min-w-[80px] lg:w-50"
          size="sm"
          disabled={!selectedSupplier || isLoading}
        >
          {isLoading ? "Loading..." : "Select Items"}
        </Button>
      </div>

      <div className="h-1 sm:h-2"></div>
    </div>
  </Card>

  {/* Location Card */}
  <Card className="border border-blue-300 relative pt-1 h-auto sm:h-32 md:h-32">
    {/* In the Location Card header */}
    <div className="absolute -top-2 left-1 sm:left-2 md:left-3 px-1 sm:px-1.5 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-0.5 sm:gap-1">
        <div className="p-0.5 rounded">
          <FaMapMarkerAlt className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400">LOCATION</h3>
        <Tooltip content="Select the delivery location for this purchase order" className="z-50" placement="top">
          <div className="cursor-help ml-0 sm:ml-0.5">
            <HiInformationCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300" />
          </div>
        </Tooltip>
      </div>
    </div>
    
    <div className="mt-4 sm:mt-5 md:mt-6">
      {/* Modern Dropdown Input */}
      <div className="relative flex-1 mb-2 sm:mb-3" ref={supplierDropdownRef1}>
        <div className="relative group">
          {/* Main Input Button */}
          <button
            onClick={() => setIsOpenLocation(!isOpenLocation)}
            className={`w-full h-8 sm:h-9 md:h-10 px-2 sm:px-3 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-200 ${
              selectedLocation 
                ? 'border-blue-500 shadow-sm' 
                : 'border-gray-400 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2 truncate">
              <div className={`p-0.5 sm:p-1 rounded-full ${selectedLocation ? 'bg-blue-300 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <FaMapPin className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${selectedLocation ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-[10px] sm:text-xs md:text-sm font-medium truncate ${selectedLocation ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {selectedLocation ? `${selectedLocation.code} - ${selectedLocation.name}` : 'Choose location'}
                <span className="text-red-500 ml-0.5 sm:ml-1">*</span>
              </span>
            </div>
            <FaChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 transition-transform duration-200 ${isOpenLocation ? 'rotate-180' : ''} text-gray-400`} />
          </button>

          {/* Dropdown Panel */}
          {isOpenLocation && (
            <div className="absolute z-20 w-full mt-1 sm:mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Search Header */}
              <div className="p-2 sm:p-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="relative">
                  <HiSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 md:py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-40 sm:max-h-48 md:max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {/* Default Option */}
                <div
                  className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedLocation(null);
                    setSearchLocation('');
                    setIsOpenLocation(false);
                  }}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500">📌</span>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Please select a Location</span>
                  </div>
                </div>

                {/* Location Options */}
                {filteredLocations.map((location, index) => (
                  <div
                    key={location.pk}
                    className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                    onClick={() => {
                      handleLocationSelect(location);
                      setSearchLocation('');
                      setIsOpenLocation(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ${
                          selectedLocation?.pk === location.pk 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                        }`}>
                          <span className="text-[8px] sm:text-[10px] md:text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                            {location.code} - {location.name}
                          </div>
                        </div>
                      </div>
                      {selectedLocation?.pk === location.pk && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-[8px] sm:text-[10px] md:text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* No Results */}
                {filteredLocations.length === 0 && (
                  <div className="px-3 sm:px-4 py-4 sm:py-6 md:py-8 text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">🔍</div>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">No locations found</p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 mt-0.5 sm:mt-1">Try adjusting your search</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-1 sm:p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[8px] sm:text-[10px] text-gray-500 text-center">
                  {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-1 sm:h-2"></div>
      
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
          <label className="block text-[7px] sm:text-[8px] md:text-[9px] text-right font-medium text-gray-500 dark:text-gray-400 mb-0 sm:mb-0.5 uppercase tracking-wider">Currency</label>
          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-right text-gray-900 dark:text-white">{currencyId || '—'}</div> 
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
          <label className="block text-[7px] sm:text-[8px] md:text-[9px] text-right font-medium text-gray-500 dark:text-gray-400 mb-0 sm:mb-0.5 uppercase tracking-wider">Rate</label>
          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-right text-blue-600 dark:text-blue-400">  {formatValue(currencyRate)}</div> 
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
          <label className="block text-[7px] sm:text-[8px] md:text-[9px] font-medium text-right text-gray-500 dark:text-gray-400 mb-0 sm:mb-0.5 uppercase tracking-wider">Disc%</label>
          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-green-600 text-right dark:text-green-400">    {formatValue(discountPercentage)}</div> 
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 sm:p-2">
          <label className="block text-[7px] sm:text-[8px] md:text-[9px] font-medium text-right text-gray-500 dark:text-gray-400 mb-0 sm:mb-0.5 uppercase tracking-wider">Entity</label>
          <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-pink-600 text-right dark:text-pink-400">{entityId || '—'}</div>
        </div>
      </div>
    </div>
  </Card>
</div>

          <div className="h-2"></div>

          {/* Search bar for main table */}
          <div className="relative w-full lg:w-62 lg:ml-170    mb-2">
            {/* <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" /> */}
            <input
              type="text"
              placeholder={`Search ${selectedItems.length} items...`}
              value={searchMainItems}
              onChange={(e) => setSearchMainItems(e.target.value)}
                  className="w-80 px-3 py-2  text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"

            />
              {/* <input
                  type="text"
              value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                  // placeholder={`Filter by ${headerName.toLowerCase()}...`}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />   */}
          </div>

          {/* Main Table */}
       {/* Main Table */}
      
<div className="overflow-x-auto ">
  {isLoading ? (
    <div className="flex justify-center items-center h-24">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Loading items...</span>
    </div>
  ) : (
    <div className="min-w-[1000px] lg:min-w-full">
      <div className="border border-gray-200 rounded-md overflow-hidden h-53">
        {/* Fixed header */}
        <table className="w-full table-">
          <thead className="bg-blue-600">
            <tr>
              {renderMainHeader("Item Code / Name", "name", "text-left w-[180px]")}
              {renderMainHeader("Package Id", "teams", "text-left w-[120px]")}
              {renderMainHeader("Quoted Gp", "quotedGP", "text-right w-[90px]")}
              {renderMainHeader("QTY", "quantity", "text-right w-[80px]")}
              {renderMainHeader("Actual GP", "actualGP", "text-right w-[90px]")}
              {renderMainHeader("GP Diff", "gpDiff", "text-right w-[100px]")}
              {renderMainHeader("Actual TTL GP", "actualTotalGP", "text-right w-[120px]")}
              {renderMainHeader("TTL GP Diff", "totalGPDiff", "text-right w-[120px]")}
              <th className="px-1.5 py-2 text-center text-xs font-bold text-white uppercase whitespace-nowrap w-[70px]">Delete</th>
            </tr>
          </thead>
        </table>
        
        {/* Scrollable body */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: "240px",
            minHeight: paginatedMainItems.length > 0 ? "160px" : "auto",
          }}
        >
          <table className="w-full table-fixed">
            <tbody className="divide-y divide-gray-200">
              {paginatedMainItems.length > 0 ? (
                paginatedMainItems.map((item, idxInPage) => {
                  const absoluteIdx = mainPageIndex * mainPageSize + idxInPage;
                  return (
                    <TableRow
                      key={item.itemId}
                      item={item}
                      handleQuantityChange={handleQuantityChange}
                      handleActualGPChange={handleActualGPChange}
                      handleDelete={handleDelete}
                      handleKeyDown={(e, itemId, field) =>
                        handleMainTableKeyDown(e, absoluteIdx, field)
                      }
                      manuallyEditedItems={manuallyEditedItems}
                      mainQuantityRefs={mainQuantityRefs}
                      mainGPRefs={mainGPRefs}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-1.5 bg-blue-100 rounded-lg mb-1.5">
                        <FaBoxOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                        No Items Added
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px] max-w-md">
                        Click "Select Items" to add items from the supplier.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls for main table */}
      {sortedMainItems.length > 0 && (
        <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-1 px-0.5 text-[10px] text-gray-600">
          <div>
            Showing {mainPageIndex * mainPageSize + 1} to{" "}
            {Math.min((mainPageIndex + 1) * mainPageSize, sortedMainItems.length)} of{" "}
            {sortedMainItems.length} items
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setMainPageIndex(p => Math.max(0, p - 1))}
                disabled={mainPageIndex === 0}
                className="px-1 py-0.5 text-[10px] border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                <FaChevronLeft className="w-2.5 h-2.5" /> Prev
              </button>
              <span className="px-1 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                {mainPageIndex + 1} / {Math.ceil(sortedMainItems.length / mainPageSize)}
              </span>
              <button
                onClick={() => setMainPageIndex(p => Math.min(Math.ceil(sortedMainItems.length / mainPageSize) - 1, p + 1))}
                disabled={mainPageIndex >= Math.ceil(sortedMainItems.length / mainPageSize) - 1}
                className="px-1 py-0.5 text-[10px] border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                Next <FaChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )}
</div>
       </div>
      )}

      {/* MODAL with sorting, pagination, and keyboard navigation */}
      <Modal show={openModal} onClose={() => setOpenModal(false)} size="5xl">
      <ModalHeader className="!p-2">
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-2">
      <span className="text-sm text-black dark:text-white font-bold">
        Item Details - {selectedSupplier?.name}
      </span>
      <span className="text-sm text-black dark:text-white font-bold">
        ({modalSelectedItems.size} selected, {addedItemIds.size} already added)
      </span>
    </div>
    
    <div className="flex items-center gap-2 lg:ml-88">
      <Tooltip content="Add selected items" className="z-50">
        <Button
          size="xs"
          onClick={handleAddItems}
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
          disabled={modalSelectedItems.size === 0}
        >
          <FaPlus className="w-3 h-3" />
   
        </Button>
      </Tooltip>
      
      <Tooltip content="Close" className="z-50">
        <Button
          size="xs"
          onClick={() => setOpenModal(false)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"
        >
          <FaTimes className="w-3 h-3" />
   
        </Button>
      </Tooltip>
    </div>
  </div>
</ModalHeader>
        
   <ModalBody className="!p-2">
  {/* Search and action buttons */}
  <div className="flex justify-end mb-1">
    <input
      type="text"
      placeholder={`Search ${supplierItems.length} records...`}
      value={searchItem}
      onChange={(e) => setSearchItem(e.target.value)}
      className="form-control-input w-full ml-2 max-w-xs p-1 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 focus:outline-none bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
      autoFocus
    />
  </div>

  <div className="border border-ld dark:border-gray-700 rounded-md overflow-hidden">
    <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="sticky top-0 z-10 bg-blue-600">
          <tr>
            <th className="text-sm text-white whitespace-nowrap font-semibold text-left border-b border-ld dark:border-gray-600 px-1 py-0.5 bg-blue-600 dark:bg-blue-800 w-[50px]">
              <input
                type="checkbox"
                checked={
                  modalSelectedItems.size ===
                    filteredItems.filter((item) => !addedItemIds.has(item.itemId)).length &&
                  filteredItems.length > addedItemIds.size
                }
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            <th
              className="text-sm text-white whitespace-nowrap font-semibold text-left border-b border-ld dark:border-gray-600 px-1 py-0.5 bg-blue-600 dark:bg-blue-800 w-[70px] cursor-pointer select-none"
              onClick={() => requestModalSort('name')}
            >
              Item Id
              {modalSortConfig?.key === 'name' && (
                <span className="ml-1 text-[8px]">
                  {modalSortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th
              className="text-sm text-white whitespace-nowrap font-semibold text-left border-b border-ld dark:border-gray-600 px-1 py-0.5 bg-blue-600 dark:bg-blue-800 w-[100px] cursor-pointer select-none"
              onClick={() => requestModalSort('teams')}
            >
              Package Id
              {modalSortConfig?.key === 'teams' && (
                <span className="ml-1 text-[8px]">
                  {modalSortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th
              className="text-sm text-white whitespace-nowrap font-semibold text-left border-b border-ld dark:border-gray-600 px-1 py-0.5 bg-blue-600 dark:bg-blue-800 w-[150px] cursor-pointer select-none"
              onClick={() => requestModalSort('pname')}
            >
              Item Name
              {modalSortConfig?.key === 'pname' && (
                <span className="ml-1 text-[8px]">
                  {modalSortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th
              className="text-sm text-white whitespace-nowrap font-semibold text-right border-b border-ld dark:border-gray-600 px-1 py-0.5 bg-blue-600 dark:bg-blue-800 w-[70px] cursor-pointer select-none"
              onClick={() => requestModalSort('actualGP')}
            >
              Actual Gp
              {modalSortConfig?.key === 'actualGP' && (
                <span className="ml-1 text-[8px]">
                  {modalSortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th
              className="text-sm text-white whitespace-nowrap font-semibold text-right border-b border-ld dark:border-gray-600 px-1 py-0.5 bg-blue-600 dark:bg-blue-800 w-[60px] cursor-pointer select-none"
              onClick={() => requestModalSort('budget')}
            >
              QTY
              {modalSortConfig?.key === 'budget' && (
                <span className="ml-1 text-[8px]">
                  {modalSortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-700">
          {sortedModalItems
            .slice(
              modalPagination.pageIndex * modalPagination.pageSize,
              (modalPagination.pageIndex + 1) * modalPagination.pageSize
            )
            .map((row) => {
              const itemId = row.itemId!;
              const isAlreadyAdded = addedItemIds.has(itemId);
              const supplierItem = supplierItems.find((item) => item.itemId === itemId);
              const quantity = supplierItem?.quantity || 0;
              const displayQuantity = modalQuantities[itemId] ?? quantity.toString();
              return (
                <tr
                  key={itemId}
                  className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    modalSelectedItems.has(itemId) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => {
                    if (!isAlreadyAdded && !(document.activeElement?.tagName === 'INPUT')) {
                      handleItemSelect(itemId);
                    }
                  }}
                >
                  <td className="whitespace-nowrap px-1 py-0.5 text-xs" onClick={(e) => e.stopPropagation()}>
                    {isAlreadyAdded ? (
                      <Icon icon="tabler:check" className="w-5 h-5 text-green-500" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={modalSelectedItems.has(itemId)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleItemSelect(itemId);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-1 py-0.5 text-[11px] font-medium">
                    {row.name}
                  </td>
                  <td className="whitespace-nowrap px-1 py-0.5 text-[11px] truncate">{row.teams}</td>
                  <td className="whitespace-nowrap px-1 py-0.5 text-[11px]">
                    <Badge color={`light${row.statuscolor}`} className="capitalize text-[10px] truncate max-w-[150px]">
                      {row.pname}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-1 py-0.5 text-[11px] font-bold text-blue-600 text-right">
                    {formatValue(row.actualGP)}
                  </td>
                  <td className="whitespace-nowrap px-1 py-0.5 text-xs text-right" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={formatQuantity(displayQuantity)}
                      ref={(el) => (quantityInputRefs.current[itemId] = el)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleModalQuantityChange(itemId, value);
                        }
                      }}
                      onKeyDown={(e) => handleModalQuantityKeyDown(e, itemId)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-[11px] text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {supplierItems.length === 0 && !isLoading && (
        <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">
          No items found for this supplier
        </div>
      )}
      {isLoading && (
        <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Loading items...
        </div>
      )}
    </div>
  </div>
</ModalBody>
        <ModalFooter className="!p-2 flex-col gap-1">
          {/* Pagination controls for modal */}
          {filteredItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-1">
              <div className="text-xs text-gray-600">
                {modalPagination.pageIndex * modalPagination.pageSize + 1}-
                {Math.min(
                  (modalPagination.pageIndex + 1) * modalPagination.pageSize,
                  filteredItems.length
                )}{' '}
                of {filteredItems.length} records
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={modalPagination.pageSize}
                  onChange={(e) =>
                    setModalPagination({
                      pageIndex: 0,
                      pageSize: Number(e.target.value),
                    })
                  }
                  className="text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-800"
                >
                  {[5, 10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setModalPagination((prev) => ({
                        ...prev,
                        pageIndex: Math.max(0, prev.pageIndex - 1),
                      }))
                    }
                    disabled={modalPagination.pageIndex === 0}
                    className="px-2 py-1 text-xs border rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    <FaChevronLeft className="w-3 h-3" /> Prev
                  </button>
                  <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border border-blue-200">
                    {modalPagination.pageIndex + 1} / {Math.ceil(filteredItems.length / modalPagination.pageSize)}
                  </span>
                  <button
                    onClick={() =>
                      setModalPagination((prev) => ({
                        ...prev,
                        pageIndex: Math.min(
                          Math.ceil(filteredItems.length / prev.pageSize) - 1,
                          prev.pageIndex + 1
                        ),
                      }))
                    }
                    disabled={modalPagination.pageIndex >= Math.ceil(filteredItems.length / modalPagination.pageSize) - 1}
                    className="px-2 py-1 text-xs border rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    Next <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </ModalFooter>
      </Modal>

      {/* Save confirmation modal */}
      {showSaveModal && (
        <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)} size="md">
          <ModalHeader>Confirm Save</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center justify-center text-6xl text-blue-500 mb-4">
                <FaSave />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                Are you sure you want to save this receive item from supplier record?
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button
              color="success"
              onClick={handleSave}
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

      {sessionExpired && <SessionModal />}

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseOrderCreation;