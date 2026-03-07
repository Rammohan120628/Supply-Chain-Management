import {
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Card
} from "flowbite-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  HiRefresh,
  HiTrash,
  HiViewList,
  HiInformationCircle,
  HiSearch,
  HiCalendar,
  HiCheckCircle,
  HiXCircle,
  HiPlus,
} from "react-icons/hi";
import {
  FaSave,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaTruck,
  FaChevronDown,
  FaBoxes,
  FaList,
  FaClipboardList,
  FaHashtag,
  FaMapPin,
} from "react-icons/fa";
import { MdDateRange, MdLocationOn } from "react-icons/md";
import axios from "axios";
import _ from "lodash";
import toast, { Toaster } from 'react-hot-toast';
import SessionModal from "../SessionModal";

export interface TableTypeDense {
  avatar?: any;
  name?: string;
  post?: string;
  pname?: string;
  teams?: {
    id: string;
    color: string;
    text: string;
  }[];
  status?: string;
  statuscolor?: string;
  budget?: string;
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  [key: string]: any;
  isSelected?: boolean;
  totalQty?: string;
  quantities?: { [key: string]: string };
}

const columnHelper = createColumnHelper<TableTypeDense>();

// Helper functions for decimal handling (original)
const getQuantityDecimalPlaces = () => parseInt(localStorage.getItem("decimalToQty") || "3");

const formatQuantity = (value: number | string): string => {
  const decimalPlaces = getQuantityDecimalPlaces();
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? "0.0" : numValue.toFixed(decimalPlaces);
};

const parseQuantityInput = (value: string): number => {
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};

// Calendar Component (copied from EditQuotationrequest with exact styling)
const CalendarPicker = ({
  selectedDates,
  onDateToggle,
  onSelectAll,
  onDeselectAll,
  year,
  month
}: {
  selectedDates: { date: string; day: number }[];
  onDateToggle: (date: string, day: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  year: number;
  month: number;
}) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${String(d).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
    const isSelected = selectedDates.some(sd => sd.date === dateStr);
    days.push({ day: d, date: dateStr, isSelected });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700 w-full max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
            {new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Select dates for allocation</p>
        </div>
        <div className="flex gap-1">
          <Button
            size="xs"
            color="success"
            onClick={onSelectAll}
            className="gap-1 px-1 py-0.5 text-[10px] dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105"
          >
            <HiCheckCircle className="w-2.5 h-2.5" />
            All
          </Button>
          <Button
            size="xs"
            color="failure"
            onClick={onDeselectAll}
            className="gap-1 px-1 py-0.5 text-[10px] dark:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 hover:scale-105"
          >
            <HiXCircle className="w-2.5 h-2.5" />
            None
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map(day => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-0.5"
          >
            {day.substring(0, 1)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center rounded text-[10px]
              ${day ? 'cursor-pointer' : ''}
              ${
                day?.isSelected
                  ? 'bg-blue-500 text-white dark:bg-blue-600'
                  : day
                  ? 'bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900'
                  : ''
              }
              transition-all duration-150
            `}
            onClick={() => day && onDateToggle(day.date, day.day)}
            title={day ? `Day ${day.day}` : ''}
          >
            {day && (
              <span className={`font-medium ${day.isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                {day.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EditLocationrequest = () => {
  /* ────────────────────── STATE (original + UI additions) ────────────────────── */
  const [itemsSearch, setItemsSearch] = useState("");
  const [showTable] = useState(false);
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [itemData, setItemData] = useState<TableTypeDense[]>([]);
  const [modalSearch, setModalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // modal pagination
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [locationId, setLocationId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [selectedDates, setSelectedDates] = useState<{date: string, day: number}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortingModal, setSortingModal] = useState<SortingState>([]);
  const [requisitionOptions, setRequisitionOptions] = useState<Array<{ label: string; value: string; pk: number; locationId: string }>>([]);
  const [selectedRequisition, setSelectedRequisition] = useState<{ label: string; value: string; pk: number; locationId: string } | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // UI additions from EditQuotationrequest
  const [globalFilter, setGlobalFilter] = useState("");
  const [mainCurrentPage, setMainCurrentPage] = useState(1);
  const mainPageSize = 10;
  const [modalPageSize, setModalPageSize] = useState(10);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const quantityInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [focusAfterPageChange, setFocusAfterPageChange] = useState<'first' | 'last' | null>(null);

  const getInputKey = (itemId: number, date: string) => `${itemId}-${date}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get purchase period (original)
  const purchasePeriodStr = localStorage.getItem("purchasePeriod");
  const entity = localStorage.getItem("entity") || "";

  let requestPeriod = "";
  let periodYear = new Date().getFullYear();
  let periodMonth = new Date().getMonth() + 1;

  if (purchasePeriodStr) {
    const [day, month, year] = purchasePeriodStr.split('-').map(Number);
    const periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", { month: "short", year: "numeric" });
    periodYear = year;
    periodMonth = month;
  } else {
    requestPeriod = new Date().toLocaleString("default", { month: "short", year: "numeric" });
  }

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
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };

  useEffect(() => {
    if (!purchasePeriodStr) {
      toast.error("Purchase period not found in localStorage.", { duration: 3000, position: 'top-right' });
    }
  }, [purchasePeriodStr]);

  /* ────────────────────── MEMOIZED FILTERS ────────────────────── */
  const filteredItemData = useMemo(
    () =>
      itemData.filter(
        (item) =>
          (item.itemName ?? "").toLowerCase().includes(modalSearch.toLowerCase()) ||
          (item.itemId ?? "").toString().includes(modalSearch) ||
          (item.packageId ?? "").toLowerCase().includes(modalSearch.toLowerCase()) ||
          (item.supplierId ?? "").toLowerCase().includes(modalSearch.toLowerCase())
      ),
    [itemData, modalSearch]
  );

  const paginatedItemData = useMemo(() => {
    const start = (currentPage - 1) * modalPageSize;
    return filteredItemData.slice(start, start + modalPageSize);
  }, [filteredItemData, currentPage, modalPageSize]);

  const allFilteredSelected = useMemo(
    () => filteredItemData.length > 0 && filteredItemData.every((item) => item.isSelected),
    [filteredItemData]
  );

  const selectedCount = useMemo(
    () => filteredItemData.filter((i) => i.isSelected).length,
    [filteredItemData]
  );

  const totalPages = Math.ceil(filteredItemData.length / modalPageSize);

  // Main table filtering and pagination
  const filteredSelectedItems = useMemo(
    () =>
      selectedItems.filter(
        (item) =>
          (item.itemName ?? "").toLowerCase().includes(globalFilter.toLowerCase()) ||
          (item.itemId ?? "").toString().includes(globalFilter) ||
          (item.packageId ?? "").toLowerCase().includes(globalFilter.toLowerCase()) ||
          (item.supplierId ?? "").toLowerCase().includes(globalFilter.toLowerCase())
      ),
    [selectedItems, globalFilter]
  );

  useEffect(() => {
    setMainCurrentPage(1);
  }, [globalFilter]);

  const paginatedSelectedItems = useMemo(() => {
    const start = (mainCurrentPage - 1) * mainPageSize;
    return filteredSelectedItems.slice(start, start + mainPageSize);
  }, [filteredSelectedItems, mainCurrentPage]);

  const mainTotalPages = Math.ceil(filteredSelectedItems.length / mainPageSize);

  // Requisition dropdown options with "Select requisition" placeholder
  const reqOptions = useMemo(() => {
    const selectOption = {
      label: "Select requisition",
      value: "select-requisition",
      pk: -1,
      locationId: "",
    };
    return [selectOption, ...requisitionOptions];
  }, [requisitionOptions]);

  const filteredOptions = useMemo(
    () =>
      reqOptions.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      ),
    [reqOptions, search]
  );

  /* ────────────────────── HANDLERS (original + UI enhancements) ────────────────────── */
  const handleSelect = (option: any) => {
    if (option.pk === -1) { // "Select requisition"
      setSelectedRequisition(null);
      setSelectedItems([]);
      setSelectedDates([]);
      setLocationId("");
      setLocationName("");
      setItemData([]);
      setModalSearch("");
      setCurrentPage(1);
    } else {
      setSelectedRequisition(option);
      setSelectedItems([]);
      setSelectedDates([]);
      setCurrentPage(1);
      setModalSearch("");
      setLocationId(option.locationId);
      setLocationName("");
      fetchRequestDetails(option.pk, option.locationId);
    }
    setIsOpen(false);
    setSearch("");
  };

  const handleDateToggle = (dateStr: string, day: number) => {
    const exists = selectedDates.find(d => d.date === dateStr);
    if (exists) {
      setSelectedDates(prev => prev.filter(d => d.date !== dateStr));
      setSelectedItems(items => items.map(it => {
        const qty = { ...it.quantities };
        delete qty[dateStr];
        return {
          ...it,
          quantities: qty,
          totalQty: formatQuantity(Object.values(qty).reduce((s, v) => s + parseQuantityInput(v || "0"), 0)),
        };
      }));
    } else {
      setSelectedDates(prev => [...prev, { date: dateStr, day }].sort((a, b) => a.day - b.day));
    }
  };

  const handleSelectAllDates = () => {
    const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();
    const newDates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      newDates.push({
        date: `${String(d).padStart(2, "0")}-${String(periodMonth).padStart(2, "0")}-${periodYear}`,
        day: d
      });
    }
    setSelectedDates(newDates);
  };

  const handleDeselectAllDates = () => {
    setSelectedDates([]);
    setSelectedItems(items => items.map(it => ({
      ...it,
      quantities: {},
      totalQty: "0.0",
    })));
  };

  const formatDateForAPI = (dateStr: string) => {
    if (dateStr.includes('-')) {
      const [day, month, year] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    const [monthName, year] = dateStr.split(' ');
    const monthMap: { [key: string]: string } = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    if (!monthName || !monthMap[monthName]) {
      const now = new Date();
      return `01-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    }
    return `01-${monthMap[monthName]}-${year}`;
  };

  const calculateTotalQuantity = (item: TableTypeDense) => {
    let total = 0;
    selectedDates.forEach(dateInfo => {
      const qtyValue = parseQuantityInput(item.quantities?.[dateInfo.date] || "0.0");
      total += qtyValue;
    });
    return formatQuantity(total);
  };

  // Enhanced quantity input with validation (max 5 digits before decimal, decimal capped at min(user setting,5))
  const handleQuantityInputChange = useCallback(
    (itemId: number, date: string, value: string) => {
      // Allow only numbers and a single decimal point
      let cleaned = value.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
      }
      // Limit integer part length to 5 digits
      const intPart = parts[0] || "";
      if (intPart.length > 5) {
        cleaned = intPart.slice(0, 5) + (parts[1] ? "." + parts[1] : "");
      }
      // Limit decimal places to min(user setting, 5)
      const decimalSetting = getQuantityDecimalPlaces();
      const maxDecimal = Math.min(decimalSetting, 5);
      if (parts[1] && parts[1].length > maxDecimal) {
        cleaned = parts[0] + "." + parts[1].slice(0, maxDecimal);
      }

      setSelectedItems((prev) =>
        prev.map((item) =>
          item.itemId === itemId
            ? {
                ...item,
                quantities: {
                  ...item.quantities,
                  [date]: cleaned,
                },
                totalQty: formatQuantity(
                  Object.values({
                    ...item.quantities,
                    [date]: cleaned,
                  }).reduce((s, v) => s + parseQuantityInput(v || "0"), 0)
                ),
              }
            : item
        )
      );
    },
    []
  );

  // Tab navigation for quantity inputs
  const handleQuantityKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, itemId: number, date: string) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      const currentKey = getInputKey(itemId, date);
      const allKeys = Array.from(quantityInputRefs.current.keys());
      const currentIndex = allKeys.indexOf(currentKey);
      if (currentIndex === -1) return;

      if (!e.shiftKey && currentIndex === allKeys.length - 1) {
        if (mainCurrentPage < mainTotalPages) {
          setFocusAfterPageChange('first');
          setMainCurrentPage(p => p + 1);
          return;
        }
      } else if (e.shiftKey && currentIndex === 0) {
        if (mainCurrentPage > 1) {
          setFocusAfterPageChange('last');
          setMainCurrentPage(p => p - 1);
          return;
        }
      } else {
        const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex >= 0 && nextIndex < allKeys.length) {
          const nextKey = allKeys[nextIndex];
          quantityInputRefs.current.get(nextKey)?.focus();
        }
      }
    },
    [mainCurrentPage, mainTotalPages]
  );

  useEffect(() => {
    if (focusAfterPageChange) {
      const timer = setTimeout(() => {
        const allKeys = Array.from(quantityInputRefs.current.keys());
        if (allKeys.length > 0) {
          const targetKey = focusAfterPageChange === 'first' ? allKeys[0] : allKeys[allKeys.length - 1];
          quantityInputRefs.current.get(targetKey)?.focus();
        }
        setFocusAfterPageChange(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mainCurrentPage, focusAfterPageChange]);

  const handleItemCheckbox = useCallback(
    _.debounce((itemId: number) => {
      setItemData((prev) =>
        prev.map((i) => (i.itemId === itemId ? { ...i, isSelected: !i.isSelected } : i))
      );
    }, 100),
    []
  );

  const handleAddSelectedItems = () => {
    const newly = filteredItemData.filter((i) => i.isSelected);
    const duplicates = newly.filter((n) => selectedItems.some((e) => e.itemId === n.itemId));
    if (duplicates.length > 0) {
      const dupNames = duplicates.map((d) => d.itemName).join(", ");
      toast.error(`Duplicate items not added: ${dupNames}`);
    }
    const unique = newly.filter((n) => !selectedItems.some((e) => e.itemId === n.itemId));

    setSelectedItems((prev) => [
      ...prev,
      ...unique.map((i) => ({
        ...i,
        name: i.itemName,
        post: "Item",
        pname: i.itemName,
        quantities: {},
        totalQty: "0.0",
      })),
    ]);

    setOpenModal(false);
    setItemData((prev) => prev.map((i) => ({ ...i, isSelected: false })));
    setModalSearch("");
    setCurrentPage(1);
  };

  const handleDeleteItem = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const validateSave = (): boolean => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("Authentication required.");
      return false;
    }
    if (!locationId || locationId.trim() === '') {
      toast.error("Please enter Location ID.");
      return false;
    }
    if (!selectedRequisition) {
      toast.error("Please select a requisition.");
      return false;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item.");
      return false;
    }
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date.");
      return false;
    }
    const hasNonZeroQuantity = selectedItems.some((item) =>
      selectedDates.some(
        (dateObj) => parseQuantityInput(item.quantities?.[dateObj.date] || "0.0") > 0
      )
    );
    if (!hasNonZeroQuantity) {
      toast.error("At least one item must have a quantity greater than 0.");
      return false;
    }
    const itemsWithAllZeroQuantities = selectedItems.filter((item) =>
      selectedDates.every(
        (dateObj) => parseQuantityInput(item.quantities?.[dateObj.date] || "0.0") === 0
      )
    );
    if (itemsWithAllZeroQuantities.length > 0) {
      const itemNames = itemsWithAllZeroQuantities
        .map((item) => item.itemName || `Item ${item.itemId}`)
        .join(", ");
      toast.error(`These items have all zero quantities: ${itemNames}`);
      return false;
    }
    return true;
  };

  const handlePreSave = () => {
    if (validateSave()) {
      setShowSaveConfirm(true);
    }
  };

  const handleSave = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);

    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("Authentication required.");
      setIsSaving(false);
      return;
    }

    try {
      const qtyRendered: Record<string, boolean> = {};
      for (let d = 1; d <= 31; d++) {
        qtyRendered[`qtyRendered${d}`] = false;
      }
      const selectedDays = selectedDates.map(d => d.day);
      for (const day of selectedDays) {
        qtyRendered[`qtyRendered${day}`] = true;
      }

      const requestBody = {
        locationId: locationId,
        reqTransactionNo: selectedRequisition!.value,
        entityId: "OM01",
        ...qtyRendered,
        subList: selectedItems.map((item, index) => {
          const itemData: any = {
            itemId: item.itemId,
            packageId: item.packageId,
            supplierId: item.supplierId || "N/A",
            entOrder: index + 1,
            deliveryMode: "DD"
          };
          selectedDates.forEach(dateInfo => {
            const qtyKey = `qty${dateInfo.day}`;
            const qtyValue = parseQuantityInput(item.quantities?.[dateInfo.date] || "0.0");
            itemData[qtyKey] = qtyValue;
          });
          return itemData;
        })
      };

      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/updateLocationRequestProcess",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (response.data.success) {
        toast.success("Data saved successfully!", { duration: 3000, position: 'top-right' });
        handleRefresh();
      } else {
        toast.error(response.data.message || "Failed to save data.", { duration: 3000, position: 'top-right' });
      }
    } catch (err: any) {
      setSessionExpired(true);
      console.error("Save error:", err);
      const errorMessage = err.response?.data?.message || "Error saving data. Please try again.";
      toast.error(errorMessage, { duration: 3000, position: 'top-right' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    setSelectedItems([]);
    setSelectedDates([]);
    setLocationId("");
    setLocationName("");
    setSelectedRequisition(null);
    setRequestDetails(null);
    setItemsSearch("");
    setModalSearch("");
    setItemData([]);
    setSearch('');
    setIsOpen(false);
    setGlobalFilter("");
    setMainCurrentPage(1);
  };

  const fetchItems = async (locationId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    if (!locationId || locationId.trim() === '') {
      toast.error("Please enter a Location ID first.", { duration: 3000, position: 'top-right' });
      return;
    }
    setIsLoading(true);

    const apiPeriod = formatDateForAPI(requestPeriod);

    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/loadAPLForLocationRequestProcess/${locationId}/${apiPeriod}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (data.success) {
        const mapped: TableTypeDense[] = data.data.map((i: any) => ({
          itemId: i.itemId,
          itemName: i.itemName,
          packageId: i.packageId,
          supplierId: i.supplierId || i.supplierID || i.supId || "N/A",
          status: "Active",
          statuscolor: "success",
          budget: i.grandTotal?.toString() || "0.0",
          isSelected: false,
          totalQty: "0.0",
          quantities: {},
        }));
        setItemData(mapped);
        if (mapped.length === 0) {
          toast.success("No items available for this location.", { duration: 3000, position: 'top-right' });
        }
      } else {
        toast.error(data.message || "Failed to fetch items.", { duration: 3000, position: 'top-right' });
        setItemData([]);
      }
    } catch (err: any) {
      setSessionExpired(true);
      const errorMessage = err.response?.data?.message || "Error fetching items. Please try again.";
      toast.error(errorMessage, { duration: 3000, position: 'top-right' });
      console.error("Fetch items error:", err);
      setItemData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRequisitions = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }

      const apiDate = formatDateForAPI(requestPeriod);
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/dropDownReqNo/${purchasePeriodStr}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (data.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (data.success && Array.isArray(data.data)) {
          const options = data.data.map((item: any) => ({
            label: `${item.reqNo} - ${item.locationId}`,
            value: item.reqNo,
            pk: item.pk,
            locationId: item.locationId
          }));
          setRequisitionOptions(options);
        } else {
          setRequisitionOptions([]);
          toast.error(data.message || "No requisition data found.", { duration: 3000, position: 'top-right' });
        }
      } catch (err) {
        setSessionExpired(true);
        console.error("Error fetching requisitions:", err);
        setRequisitionOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequisitions();
  }, [requestPeriod]);

  const fetchRequestDetails = async (pk: number, locationId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/getRequestDetails/${pk}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (data.success) {
        setRequestDetails(data.data);

        if (data.data.overallList) {
          const overall = data.data.overallList;
          setLocationId(overall.locationId || '');
          setLocationName(overall.locationName || '');

          const newSelectedDates = [];
          const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();

          for (let day = 1; day <= daysInMonth; day++) {
            const qtyRenderedKey = `qtyRendered${day}`;
            if (overall[qtyRenderedKey] === true) {
              const dateStr = `${String(day).padStart(2, "0")}-${String(periodMonth).padStart(2, "0")}-${periodYear}`;
              newSelectedDates.push({ date: dateStr, day: day });
            }
          }
          setSelectedDates(newSelectedDates);
        }

        if (data.data.reqDetailList && Array.isArray(data.data.reqDetailList)) {
          const items = data.data.reqDetailList.map((item: any) => {
            const quantities: { [key: string]: string } = {};
            let total = 0;
            const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
              const qtyKey = `qty${day}`;
              if (item[qtyKey] !== undefined) {
                const value = parseQuantityInput(item[qtyKey]);
                const dateStr = `${String(day).padStart(2, '0')}-${String(periodMonth).padStart(2, '0')}-${periodYear}`;
                quantities[dateStr] = formatQuantity(value);
                total += value;
              }
            }

            return {
              itemId: item.itemId,
              itemName: item.itemName,
              packageId: item.packageId,
              supplierId: item.supplierId,
              quantities,
              totalQty: formatQuantity(total)
            };
          });
          setSelectedItems(items);
        }
        fetchItems(locationId);
      } else {
        toast.error(data.message || "Failed to fetch request details.", { duration: 3000, position: 'top-right' });
      }
    } catch (err) {
      setSessionExpired(true);
      console.error("Error fetching request details:", err);
      toast.error("Failed to load request details.", { duration: 3000, position: 'top-right' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenItemsModal = () => {
    setOpenCalendar(false);
    setShowSaveConfirm(false);
    setOpenModal(true);
    setFocusedRowIndex(-1);
  };

  const handleTableKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filteredItemData.length) return;
    const totalRows = filteredItemData.length;
    const key = e.key;

    if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter") {
      e.preventDefault();
    }

    if (key === "ArrowDown") {
      setFocusedRowIndex((prev) => {
        const next = prev + 1;
        return next >= totalRows ? 0 : next;
      });
    } else if (key === "ArrowUp") {
      setFocusedRowIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? totalRows - 1 : next;
      });
    } else if (key === "Enter" && focusedRowIndex >= 0) {
      const item = filteredItemData[focusedRowIndex];
      if (item) {
        handleItemCheckbox(item.itemId!);
      }
    }
  }, [filteredItemData, focusedRowIndex, handleItemCheckbox]);

  /* ────────────────────── TABLE COLUMNS (styled like EditQuotationrequest) ────────────────────── */
  const defaultColumns = useMemo(
    () => [
      columnHelper.display({
        id: "sno",
        header: () => (
          <span className="font-medium text-white text-[10px] uppercase">S.No</span>
        ),
        cell: ({ row }) => {
          const index = (mainCurrentPage - 1) * mainPageSize + row.index;
          return <span className="text-[11px] text-gray-600 dark:text-gray-400">{index + 1}</span>;
        },
        size: 40,
        enableSorting: false,
      }),
      columnHelper.accessor("itemId", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Item Id</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: ' 🔼',
                  desc: ' 🔽',
                }[column.getIsSorted() as string] ?? ' ↕️'}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <p className="font-medium text-[11px] text-black dark:text-white">{info.getValue()}</p>
        ),
        sortingFn: "alphanumeric",
        size: 70,
      }),
      columnHelper.accessor("itemName", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Item Name</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: ' 🔼',
                  desc: ' 🔽',
                }[column.getIsSorted() as string] ?? ' ↕️'}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <p className="font-medium text-[11px] text-black dark:text-white truncate max-w-[120px]" title={info.getValue()}>
            {info.getValue()}
          </p>
        ),
        sortingFn: "alphanumeric",
        size: 120,
      }),
      columnHelper.accessor("packageId", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Package ID</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: ' 🔼',
                  desc: ' 🔽',
                }[column.getIsSorted() as string] ?? ' ↕️'}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <p className="font-medium text-[11px] text-black dark:text-white">{info.getValue()}</p>
        ),
        sortingFn: "alphanumeric",
        size: 70,
      }),
      ...selectedDates.map((d) =>
        columnHelper.display({
          id: d.date,
          header: () => (
            <div className="flex items-center gap-1 cursor-default">
              <span className="font-medium text-white text-[9px] uppercase whitespace-nowrap">
                {d.date}
              </span>
            </div>
          ),
          cell: ({ row }) => {
            const itemId = row.original.itemId!;
            const value = row.original.quantities?.[d.date] || "";
            return (
              <div className="relative group">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleQuantityInputChange(itemId, d.date, e.target.value)}
                  onKeyDown={(e) => handleQuantityKeyDown(e, itemId, d.date)}
                  ref={(el) => {
                    if (el) quantityInputRefs.current.set(getInputKey(itemId, d.date), el);
                    else quantityInputRefs.current.delete(getInputKey(itemId, d.date));
                  }}
                  className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all duration-150"
                  min="0"
                  inputMode="decimal"
                  placeholder="0.0"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 dark:bg-gray-700 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Day {d.day} - {d.date}
                </div>
              </div>
            );
          },
          size: 70,
          enableSorting: false,
        })
      ),
      columnHelper.accessor("totalQty", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Total QTY</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: ' 🔼',
                  desc: ' 🔽',
                }[column.getIsSorted() as string] ?? ' ↕️'}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <div className="text-right font-medium text-[11px] dark:text-white ml-10">
            {formatQuantity(parseFloat(info.getValue() || "0.0"))}
          </div>
        ),
        sortingFn: (rowA, rowB, columnId) => {
          const a = parseFloat(rowA.getValue(columnId) || "0");
          const b = parseFloat(rowB.getValue(columnId) || "0");
          return a - b;
        },
        size: 60,
      }),
      columnHelper.display({
        id: "delete",
        header: () => (
          <span className="font-medium text-white text-[10px] uppercase">Actions</span>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center text-red-500 text-right">
            <Button
              color="failure"
              size="xs"
              className="hover:scale-105 transition-transform dark:bg-red-700 dark:hover:bg-red-800 p-0.5"
              onClick={() => handleDeleteItem(row.original.itemId!)}
            >
              <HiTrash className="h-2.5 w-2.5" />
            </Button>
          </div>
        ),
        size: 50,
        enableSorting: false,
      }),
    ],
    [selectedDates, handleQuantityInputChange, handleQuantityKeyDown, mainCurrentPage, mainPageSize]
  );

  const modalColumns = [
    columnHelper.display({
      id: "checkbox",
      header: () => (
        <input
          type="checkbox"
          checked={allFilteredSelected}
          onChange={(e) => {
            const isChecked = e.target.checked;
            setItemData((prev) =>
              prev.map((item) => {
                if (filteredItemData.some((fi) => fi.itemId === item.itemId)) {
                  return { ...item, isSelected: isChecked };
                }
                return item;
              })
            );
          }}
          className="w-3.5 h-3.5 cursor-pointer text-blue-600 rounded focus:ring-blue-500 dark:bg-white"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.isSelected || false}
          onChange={() => handleItemCheckbox(row.original.itemId!)}
          className="w-3.5 h-3.5 cursor-pointer text-blue-600 rounded focus:ring-blue-500 dark:bg-white"
        />
      ),
      enableSorting: false,
    }),
    columnHelper.accessor("itemId", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Item ID</span>
          {column.getCanSort() && (
            <span className="text-white text-[10px]">
              {{
                asc: ' 🔼',
                desc: ' 🔽',
              }[column.getIsSorted() as string] ?? ' ↕️'}
            </span>
          )}
        </div>
      ),
      cell: (info) => (
        <p className="font-medium text-[11px] dark:text-white">{info.getValue()}</p>
      ),
      sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("itemName", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Item Name</span>
          {column.getCanSort() && (
            <span className="text-white text-[10px]">
              {{
                asc: ' 🔼',
                desc: ' 🔽',
              }[column.getIsSorted() as string] ?? ' ↕️'}
            </span>
          )}
        </div>
      ),
      cell: (info) => (
        <p className="font-medium text-[11px] dark:text-white truncate max-w-[150px]" title={info.getValue()}>
          {info.getValue()}
        </p>
      ),
      sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("packageId", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Package ID</span>
          {column.getCanSort() && (
            <span className="text-white text-[10px]">
              {{
                asc: ' 🔼',
                desc: ' 🔽',
              }[column.getIsSorted() as string] ?? ' ↕️'}
            </span>
          )}
        </div>
      ),
      cell: (info) => (
        <Badge
          color="indigo"
          className="font-medium text-[11px] dark:bg-indigo-700 dark:text-white"
        >
          {info.getValue()}
        </Badge>
      ),
      sortingFn: "alphanumeric",
    }),
  ];

  /* ────────────────────── TABLES ────────────────────── */
  const table = useReactTable({
    data: paginatedSelectedItems,
    columns: defaultColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.itemId?.toString() ?? "",
  });

  const table1 = useReactTable({
    data: paginatedItemData,
    columns: modalColumns,
    state: { sorting: sortingModal },
    onSortingChange: setSortingModal,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.itemId?.toString() ?? "",
  });

  /* ────────────────────── RENDER ────────────────────── */
  let content;

  if (showTable) {
    // content = <LocReqTable onBack={handleAddClick} />;
  } else {
    content = (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header with title, action buttons, and user manual info icon */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
                Edit Location Request
              </h1>
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select a requisition from dropdown</li>
                      <li>Click "Select Items" and choose items</li>
                      <li>Click "Select Dates" and pick dates</li>
                      <li>Enter quantities for each date</li>
                      <li>Click save button and confirm</li>
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
            <div className="flex gap-2">
              <Tooltip
                content="Save location request"
                placement="bottom"
                className="dark:bg-gray-800 dark:text-white z-50"
              >
                <Button
                  color="success"
                  size="xs"
                  className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-110"
                  onClick={handlePreSave}
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaSave className="w-4 h-4" />
                  )}
                </Button>
              </Tooltip>
              <Tooltip
                content="Refresh page"
                placement="bottom"
                className="dark:bg-gray-800 dark:text-white z-50"
              >
                <Button
                  color="warning"
                  size="xs"
                  className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all duration-200 hover:scale-110"
                  onClick={handleRefresh}
                >
                  <HiRefresh className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
          {/* Main Card */}
          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Top Section: Period and Location */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                    <FaCalendarAlt className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {formatPurchasePeriod(purchasePeriodStr || '')}
                    </span>
                    <Tooltip
                      content="Purchase Period for which the location request is being created"
                      placement="top"
                      className="dark:bg-gray-800 dark:text-white z-50"
                    >
                      <HiInformationCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help ml-0.5" />
                    </Tooltip>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  {/* Modern Requisition Dropdown */}
                  <div ref={supplierDropdownRef} className="relative w-full sm:w-72">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className={`
                        w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200
                        ${selectedRequisition
                          ? 'border-blue-500 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mr-2">
                        <div className={`p-1 rounded-full ${selectedRequisition ? 'bg-blue-100 dark:bg-blue-300' : 'bg-blue-100 dark:bg-blue-300'}`}>
                          <FaBoxOpen className={`w-3.5 h-3.5 ${selectedRequisition ? 'text-blue-600' : 'text-blue-500'}`} />
                        </div>
                        <div className="truncate text-left">
                          <span className={`text-xs font-medium truncate ${selectedRequisition ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {selectedRequisition?.label || "Select requisition"}
                          </span>
                          {locationName && (
                            <span className="block text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {locationName}
                            </span>
                          )}
                        </div>
                      </div>
                      <FaChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                   {isOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                          <div className="relative">
                            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search requisitions..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                          {(() => {
                            let realIndex = 0;
                            return filteredOptions.map((option) => {
                              const isPlaceholder = option.pk === "select-requisition";
                              const displayNumber = isPlaceholder ? null : ++realIndex;
                              return (
                                <div
                                  key={option.pk || option.label}
                                  className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                                  onClick={() => handleSelect(option)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                          selectedRequisition?.label === option.label
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                                        }`}
                                      >
                                        {isPlaceholder ? (
                                          <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>
                                        ) : (
                                          <span className="text-xs">{displayNumber}</span>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {option.label || "—"}
                                        </div>
                                        {option.locationId && (
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {option.locationId}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {selectedRequisition?.label === option.label && (
                                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                          {filteredOptions.length === 0 && (
                            <div className="px-4 py-8 text-center">
                              <div className="text-4xl mb-2">🔍</div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">No requisitions found</p>
                            </div>
                          )}
                        </div>
                        <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <p className="text-[10px] text-gray-500 text-center">
                            {filteredOptions.length} requisition{filteredOptions.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={handleOpenItemsModal}
                      disabled={!selectedRequisition}
                      size="xs"
                      className="gap-1 px-2 py-1 text-[9px] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-xs transition-all duration-200 hover:scale-105"
                    >
                      <FaBoxes className="w-2.5 h-2.5" />
                      Select Items
                    </Button>
                    <Button
                      onClick={() => setOpenCalendar(true)}
                      disabled={!selectedRequisition}
                      size="xs"
                      className="gap-1 px-2 py-1 text-[9px] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-xs transition-all duration-200 hover:scale-105"
                    >
                      <MdDateRange className="w-2.5 h-2.5" />
                      Select Dates
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Selected Items Table Section */}
            <div className="p-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <FaBoxOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Selected Items
                  {selectedItems.length > 0 && (
                    <Badge color="primary" className="ml-1 text-[9px] px-3 py-1">
                      {selectedItems.length}
                    </Badge>
                  )}
                </h3>
                <div className="relative w-full lg:w-48">
                  <HiSearch className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-[10px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-150"
                  />
                </div>
              </div>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-[300px]">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-1.5 py-1 text-left text-[9px] font-semibold text-white uppercase tracking-wider"
                            style={{ width: header.column.columnDef.size }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors duration-150"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-1.5 py-1 text-[9px]">
                              <div className="flex items-center min-h-[20px]">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={table.getAllColumns().length} className="px-1.5 py-6 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-1">
                              <FaBoxOpen className="w-5 h-5 text-blue-400 dark:text-blue-300" />
                            </div>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-0.5">
                              No Items Selected
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 text-[9px] max-w-md">
                              Click "Select Items" to add items to your location request.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls for main table */}
              {filteredSelectedItems.length > 0 && (
                <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-1 px-0.5 text-[9px] text-gray-600 dark:text-gray-400">
                  <div>
                    Showing{" "}
                    <span className="font-medium">
                      {Math.min((mainCurrentPage - 1) * mainPageSize + 1, filteredSelectedItems.length)}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(mainCurrentPage * mainPageSize, filteredSelectedItems.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredSelectedItems.length}</span> items
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMainCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={mainCurrentPage === 1}
                      className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[9px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    >
                      <FaChevronLeft className="w-2 h-2" /> Prev
                    </button>
                    <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[9px] font-medium">
                      {mainCurrentPage} / {mainTotalPages}
                    </span>
                    <button
                      onClick={() => setMainCurrentPage((p) => Math.min(mainTotalPages, p + 1))}
                      disabled={mainCurrentPage >= mainTotalPages}
                      className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[9px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    >
                      Next <FaChevronRight className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
        {/* Calendar Modal */}
        <Modal show={openCalendar} onClose={() => setOpenCalendar(false)} size="sm">
          <ModalHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white p-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <HiCalendar className="w-3 h-3" />
                <div>
                  <h3 className="text-xs font-bold">Select Dates</h3>
                  <p className="text-blue-100 text-[10px]">Choose dates for quantity allocation</p>
                </div>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-2 bg-white dark:bg-gray-800">
            <div className="flex justify-center">
              <CalendarPicker
                selectedDates={selectedDates}
                onDateToggle={handleDateToggle}
                onSelectAll={handleSelectAllDates}
                onDeselectAll={handleDeselectAllDates}
                year={periodYear}
                month={periodMonth}
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 p-1">
            <div className="flex items-center justify-between w-full">
              <div className="text-[10px] text-gray-600 dark:text-gray-300">
                <span className="font-semibold">{selectedDates.length}</span> days selected
              </div>
              <Button
                color="light"
                onClick={() => setOpenCalendar(false)}
                className="text-[10px] px-1 py-0.5 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition-all duration-200 hover:scale-105"
              >
                Close
              </Button>
            </div>
          </ModalFooter>
        </Modal>
        {/* Enhanced Items Modal with keyboard navigation */}
        <Modal
          show={openModal}
          onClose={() => {
            setModalSearch("");
            setCurrentPage(1);
            setOpenModal(false);
          }}
          size="4xl"
        >
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 text-xs">
                <FaMapMarkerAlt className="w-4 h-4 text-red-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {locationName || "Select Items"}
                </h3>
                <span className="px-2 py-0.5 dark:bg-blue-900 text-black dark:text-blue-300 rounded-full text-sm font-bold">
                  Total: {filteredItemData.length}
                </span>
              </div>
              <div className="flex space-x-2 lg:ml-100">
                <Button
                  size="xs"
                  onClick={handleAddSelectedItems}
                  disabled={selectedCount === 0}
                  className="p-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
                  title="Add selected items"
                >
                  <HiPlus className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-3 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">Selected Items:</span>
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-md font-bold">
                  {selectedCount}
                </span>
              </div>
              <div className="relative w-56">
                <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={modalSearch}
                  onChange={(e) => {
                    setModalSearch(e.target.value);
                    setCurrentPage(1);
                    setFocusedRowIndex(-1);
                  }}
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150"
                  autoFocus
                />
              </div>
            </div>
            <div
              className="border border-gray-200 dark:border-gray-700 overflow-hidden focus:outline-none"
              tabIndex={0}
              onKeyDown={handleTableKeyDown}
              ref={tableContainerRef}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                    {table1.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider"
                            style={{
                              minWidth:
                                header.id === "itemDetails"
                                  ? "180px"
                                  : header.id === "checkbox"
                                  ? "32px"
                                  : header.id === "packageId"
                                  ? "90px"
                                  : "70px",
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
                        const absoluteIndex = (currentPage - 1) * modalPageSize + idx;
                        const isFocused = focusedRowIndex === absoluteIndex;
                        return (
                          <tr
                            key={row.id}
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.type !== "checkbox" && !target.closest("a")) {
                                handleItemCheckbox(row.original.itemId!);
                              }
                            }}
                            className={`
                              bg-white dark:bg-gray-800
                              hover:bg-gray-50 dark:hover:bg-gray-700
                              cursor-pointer text-xs
                              ${row.original.isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                              ${isFocused ? "bg-blue-100 dark:bg-blue-800/40 border-l-4 border-blue-500" : ""}
                              transition-colors duration-150
                            `}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {filteredItemData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 text-xs">
                <div className="text-gray-600 dark:text-gray-300">
                  Showing {(currentPage - 1) * modalPageSize + 1} to{" "}
                  {Math.min(currentPage * modalPageSize, filteredItemData.length)} of{" "}
                  {filteredItemData.length} items
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        setFocusedRowIndex(-1);
                      }}
                      disabled={currentPage === 1}
                      className="px-2 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    >
                      <FaChevronLeft className="w-3 h-3" /> Prev
                    </button>
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-xs font-medium">
                      {currentPage} / {Math.ceil(filteredItemData.length / modalPageSize)}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentPage((p) =>
                          Math.min(Math.ceil(filteredItemData.length / modalPageSize), p + 1)
                        );
                        setFocusedRowIndex(-1);
                      }}
                      disabled={currentPage >= Math.ceil(filteredItemData.length / modalPageSize)}
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
        {/* Save Confirmation Modal */}
        <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="sm">
          <ModalBody className="p-3 bg-white dark:bg-gray-800">
            <div className="space-y-3">
              <div className="flex items-center justify-center text-4xl text-blue-500 mb-3">
                <FaSave />
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
                Are you sure you want to save this location request?
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center p-1">
            <Button
              color="success"
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[60px] text-[10px] dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  <span className="text-[10px]">Saving...</span>
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button
              color="gray"
              onClick={() => setShowSaveConfirm(false)}
              disabled={isSaving}
              className="min-w-[60px] text-[10px] dark:bg-gray-600 dark:hover:bg-gray-500 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
        {/* Session Expired Modal */}
        {sessionExpired && <SessionModal />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px",
              fontSize: "12px"
            },
            success: {
              style: { background: "#059669" },
            },
            error: {
              style: { background: "#dc2626" },
            },
          }}
        />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Loading...</span>
          </div>
        </div>
      )}
      {content}
      {errorModal && (
        <Modal show={errorModal !== null} onClose={() => setErrorModal(null)} size="md">
          <ModalHeader>Notification</ModalHeader>
          <ModalBody>
            <p>{errorModal}</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setErrorModal(null)}>OK</Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default EditLocationrequest;

<style>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slideDown {
    animation: slideDown 0.2s ease-out;
  }
`}</style>