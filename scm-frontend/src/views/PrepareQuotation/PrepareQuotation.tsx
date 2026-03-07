import {
  Badge,
  Button,
  Tooltip,
  Card,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import axios from "axios";
import { FaSave } from "react-icons/fa";
import { HiRefresh, HiInformationCircle, HiSearch, HiTrash, HiCalendar } from "react-icons/hi";
import { FaBoxOpen, FaChevronDown, FaMapPin, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Calendar as CalendarIcon } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import SessionModal from "../SessionModal";
import { useEntityFormatter } from "../Entity/UseEntityFormater";
import { useAuth } from "src/context/AuthContext/AuthContext";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  pname?: string;
  quantities?: { [key: string]: string };
  totalQty?: string;
  isOriginal?: boolean;
  gp?: number | string;
  gpOld?: number;
  grandTotal?: number;
}

// Helper functions for decimal handling (exact from EditQuotationrequest)
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


const columnHelper = createColumnHelper<TableTypeDense>();

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const PrepareQuotation = () => {
  const formatter = useEntityFormatter();
  const { ipAddress } = useAuth();

  /* ────────────────────── STATE ────────────────────── */
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);          // location dropdown
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false); // date picker modal
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedDates, setSelectedDates] = useState<{ date: string; day: number }[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Pagination
  const [mainCurrentPage, setMainCurrentPage] = useState(1);
  const mainPageSize = 10;
  const [focusAfterPageChange, setFocusAfterPageChange] = useState<'first' | 'last' | null>(null);

  // Refs for quantity inputs (tab navigation)
  const quantityInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const getInputKey = (itemId: number, date: string) => `${itemId}-${date}`;

  // Tender period from localStorage
  const tenderPeriodStr = localStorage.getItem("tenderPeriod");
  const entity = localStorage.getItem("entity") || "";

  let periodDate: Date;
  let requestPeriod: string;
  let periodYear: number;
  let periodMonth: number;
  let daysInMonth: number;

  if (tenderPeriodStr) {
    const [day, month, year] = tenderPeriodStr.split('-').map(Number);
    periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", { month: "short", year: "numeric" });
    periodYear = year;
    periodMonth = month;
    daysInMonth = new Date(year, month, 0).getDate();
  } else {
    periodDate = new Date();
    requestPeriod = periodDate.toLocaleString("default", { month: "short", year: "numeric" });
    periodYear = periodDate.getFullYear();
    periodMonth = periodDate.getMonth() + 1;
    daysInMonth = new Date(periodYear, periodMonth, 0).getDate();
  }

  const apiPeriod = `${String(1).padStart(2, "0")}-${String(periodMonth).padStart(2, "0")}-${periodYear}`;

  /* ────────────────────── EFFECTS ────────────────────── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!tenderPeriodStr) {
      toast.error("Tender period not found in localStorage.", { duration: 3000, position: 'top-right' });
    }
  }, [tenderPeriodStr]);

  useEffect(() => {
    if (selectedLocation) fetchItems();
  }, [selectedLocation]);

  useEffect(() => {
    setMainCurrentPage(1);
  }, [globalFilter]);

  // Focus after page change (tab navigation)
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

  /* ────────────────────── MEMOIZED FILTERS ────────────────────── */
  const filteredSelectedItems = useMemo(
    () =>
      selectedItems.filter(
        (item) =>
          (item.itemName ?? "").toLowerCase().includes(globalFilter.toLowerCase()) ||
          (item.itemId ?? "").toString().includes(globalFilter) ||
          (item.packageId ?? "").toLowerCase().includes(globalFilter.toLowerCase())
      ),
    [selectedItems, globalFilter]
  );

  const paginatedSelectedItems = useMemo(() => {
    const start = (mainCurrentPage - 1) * mainPageSize;
    return filteredSelectedItems.slice(start, start + mainPageSize);
  }, [filteredSelectedItems, mainCurrentPage]);

  const mainTotalPages = Math.ceil(filteredSelectedItems.length / mainPageSize);

  const filteredOptions = useMemo(
    () =>
      locations.filter((loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase())
      ),
    [locations, search]
  );

  /* ────────────────────── API CALLS ────────────────────── */
  const handleApiError = (error: any) => {
    if (error.response?.status === 401) {
      setSessionExpired(true);
      return true;
    }
    return false;
  };

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadConsolidationLocReq/${apiPeriod}`,
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
        if (data.success) setLocations(data.data);
      } catch (err) {
        setSessionExpired(true);
        if (!handleApiError(err)) {
          console.error(err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, [ipAddress, apiPeriod]);

  // Fetch items for selected location
  const fetchItems = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !selectedLocation) return;
    setIsFetching(true);
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/viewConsolidationLocationRequest/${selectedLocation}`,
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
        const daysSet = new Set<number>();
        const mapped: TableTypeDense[] = data.data.map((item: any) => {
          const quantities: { [key: string]: string } = {};
          let total = 0;
          for (let day = 1; day <= daysInMonth; day++) {
            const qty = item[`qty${day}`] || 0.0;
            const fmt = `${String(day).padStart(2, "0")}-${String(periodMonth).padStart(2, "0")}-${periodYear}`;
            quantities[fmt] = formatQuantity(qty);
            total += qty;
            if (item[`qtyRendered${day}`] || qty > 0) {
              daysSet.add(day);
            }
          }
          return {
            itemId: item.itemId,
            itemName: item.itemName,
            pname: item.itemName,
            packageId: item.packageId,
            supplierId: item.supplierId || "N/A",
            quantities,
            totalQty: formatter.formatQuantity(total),
            gp: item.gp || 0,
            gpOld: item.gpOld || 0,
            grandTotal: item.grandTotal || 0,
            isOriginal: item.isOriginal || false,
          };
        });
        setSelectedItems(mapped);
        const sortedDays = Array.from(daysSet).sort((a, b) => a - b);
        setSelectedDates(
          sortedDays.map((day) => ({
            date: `${String(day).padStart(2, "0")}-${String(periodMonth).padStart(2, "0")}-${periodYear}`,
            day,
          }))
        );
        toast.success(`Fetched ${mapped.length} items for ${selectedLocationName}`, { duration: 2000, position: 'top-right' });
      } else {
        toast.error(data.message || "Failed to fetch items.", { duration: 3000, position: 'top-right' });
        setSelectedItems([]);
        setSelectedDates([]);
      }
    } catch (err) {
      setSessionExpired(true);
      if (!handleApiError(err)) {
        console.error(err);
      }
      setSelectedItems([]);
      setSelectedDates([]);
    } finally {
      setIsFetching(false);
    }
  };

  /* ────────────────────── HANDLERS ────────────────────── */
  const handleSelectLocation = (loc: any) => {
    setSelectedLocation(loc.name);
    setSelectedLocationName(loc.name);
    setIsOpen(false);
    setSearch("");
  };

  // Date selection handlers
  const handleDateToggle = (dateStr: string, day: number) => {
    const exists = selectedDates.find((d) => d.date === dateStr);
    if (exists) {
      setSelectedDates((prev) => prev.filter((d) => d.date !== dateStr));
      // Remove quantities for that date from all items
      setSelectedItems((items) =>
        items.map((it) => {
          const qty = { ...it.quantities };
          delete qty[dateStr];
          return {
            ...it,
            quantities: qty,
            totalQty: formatter.formatQuantity(
              Object.values(qty).reduce((s, v) => s + parseFloat(v || "0"), 0)
            ),
          };
        })
      );
    } else {
      setSelectedDates((prev) =>
        [...prev, { date: dateStr, day }].sort((a, b) => a.day - b.day)
      );
    }
  };

  const handleSelectAllDates = () => {
    const newDates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      newDates.push({
        date: `${String(d).padStart(2, "0")}-${String(periodMonth).padStart(2, "0")}-${periodYear}`,
        day: d,
      });
    }
    setSelectedDates(newDates);
  };

  const handleDeselectAllDates = () => {
    setSelectedDates([]);
    setSelectedItems((items) =>
      items.map((it) => ({
        ...it,
        quantities: {},
        totalQty: "0.0",
      }))
    );
  };

  // Quantity input handler (same as EditQuotationrequest)
  const handleQuantityInputChange = useCallback(
    (itemId: number, date: string, value: string) => {
      // Clean input: only digits and one decimal
      let cleaned = value.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
      }
      // Limit integer part to 5 digits
      const intPart = parts[0] || "";
      if (intPart.length > 5) {
        cleaned = intPart.slice(0, 5) + (parts[1] ? "." + parts[1] : "");
      }
      // Limit decimal places based on localStorage setting (max 5)
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
                totalQty: formatter.formatQuantity(
                  Object.values({
                    ...item.quantities,
                    [date]: cleaned,
                  }).reduce((s, v) => s + parseFloat(v || "0"), 0)
                ),
              }
            : item
        )
      );
    },
    [formatter]
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
        // Last input, tab forward → next page
        if (mainCurrentPage < mainTotalPages) {
          setFocusAfterPageChange('first');
          setMainCurrentPage(p => p + 1);
        }
      } else if (e.shiftKey && currentIndex === 0) {
        // First input, shift+tab → previous page
        if (mainCurrentPage > 1) {
          setFocusAfterPageChange('last');
          setMainCurrentPage(p => p - 1);
        }
      } else {
        // Normal tab within page
        const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex >= 0 && nextIndex < allKeys.length) {
          const nextKey = allKeys[nextIndex];
          quantityInputRefs.current.get(nextKey)?.focus();
        }
      }
    },
    [mainCurrentPage, mainTotalPages]
  );

  // Gross Price input handler (improved with cursor preservation)
  const handleGpChange = useCallback((itemId: number, value: string) => {
    // Allow only digits and one decimal point
    let cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    // Limit integer part to 8 digits
    const intPart = parts[0] || "";
    if (intPart.length > 8) {
      cleaned = intPart.slice(0, 8) + (parts[1] ? "." + parts[1] : "");
    }
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + "." + parts[1].slice(0, 2);
    }

    setSelectedItems((prev) =>
      prev.map((it) =>
        it.itemId === itemId ? { ...it, gp: cleaned } : it
      )
    );
  }, []);

  const handleDeleteItem = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((it) => it.itemId !== itemId));
  };

  const validateSave = (): boolean => {
 
    const missing: string[] = [];
    for (const it of selectedItems) {
      for (const d of selectedDates) {
        const q = parseFloat(it.quantities?.[d.date] || "0");
        if (q <= 0) missing.push(`Item "${it.itemName}" needs quantity on ${d.date}`);
      }
    }
    if (missing.length) {
      const show = missing.slice(0, 3).join("; ");
      const more = missing.length > 3 ? ` and ${missing.length - 3} more` : "";
      toast.error(`Missing quantities: ${show}${more}.`, { duration: 5000, position: 'top-right' });
      return false;
    }
    return true;
  };

  const handlePreSave = () => {
    if (validateSave()) {
      setShowSaveConfirm(true);
    }
  };

  const performSave = async () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId || !selectedLocation) return;
    setSaving(true);
    try {
      const payload = {
        deliveryLocationId: selectedLocation,
        entityId: entity,
        userFk: Number(userId),
        period: `${periodYear}-${String(periodMonth).padStart(2, "0")}-${String(1).padStart(2, "0")}`,
        // Include daily quantities? The API may expect qty1..qtyN in sublist.
        // This depends on your backend – adjust as needed.
      };
      const { data } = await axios.post(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/savePrepareQuotation`,
        payload,
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
        toast.success("Saved successfully!", { duration: 3000, position: 'top-right' });
        setSelectedItems([]);
        setSelectedDates([]);
        setSelectedLocation("");
        setSelectedLocationName("");
        setGlobalFilter("");
        setMainCurrentPage(1);
        setShowSaveConfirm(false);
      } else {
        toast.error(data.message || "Failed to save.", { duration: 3000, position: 'top-right' });
      }
    } catch (err) {
      setSessionExpired(true);
      if (!handleApiError(err)) {
        toast.error("Error saving data. Please try again.", { duration: 3000, position: 'top-right' });
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const refresh = () => {
    setSelectedItems([]);
    setSelectedDates([]);
    setIsOpen(false);
    setSearch("");
    setSelectedLocation("");
    setSelectedLocationName("");
    setGlobalFilter("");
    setMainCurrentPage(1);
    toast.success("Page refreshed successfully", { duration: 2000, position: 'top-right' });
  };

  /* ────────────────────── TABLE DEFINITIONS ────────────────────── */
  const [sorting, setSorting] = useState<SortingState>([]);

  const defaultColumns = useMemo(
    () => [
      // S.No
      columnHelper.display({
        id: "sno",
        header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
        cell: ({ row }) => {
          const index = (mainCurrentPage - 1) * mainPageSize + row.index;
          return <span className="text-[11px] text-gray-600 dark:text-gray-400">{index + 1}</span>;
        },
        size: 40,
        enableSorting: false,
      }),
      // Item ID
      columnHelper.accessor("itemId", {
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200" onClick={column.getToggleSortingHandler()}>
            <span className="font-medium text-white text-[10px] uppercase">Item Id</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{ asc: " 🔼", desc: " 🔽" }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-medium text-[11px] text-black dark:text-white">{info.getValue()}</p>,
        size: 70,
      }),
      // Item Name
      columnHelper.accessor("pname", {
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200" onClick={column.getToggleSortingHandler()}>
            <span className="font-medium text-white text-[10px] uppercase">Item Name</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{ asc: " 🔼", desc: " 🔽" }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <p className="font-medium text-[11px] text-black dark:text-white max-w-[150px]" title={info.getValue()}>
            {info.getValue()}
          </p>
        ),
        size: 150,
      }),
      // Package ID
      columnHelper.accessor("packageId", {
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200" onClick={column.getToggleSortingHandler()}>
            <span className="font-medium text-white text-[10px] uppercase">Package Id</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{ asc: " 🔼", desc: " 🔽" }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-medium text-[11px] text-black dark:text-white">{info.getValue()}</p>,
        size: 80,
      }),

      // Total GP (read-only)
      columnHelper.accessor("grandTotal", {
        header: ({ column }) => (
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200" onClick={column.getToggleSortingHandler()}>
            <span className="font-medium text-white text-[10px] uppercase">Grand Total</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{ asc: " 🔼", desc: " 🔽" }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <p className="font-medium text-[11px] ml-8 text-black dark:text-white text-right">
            {formatter.formatAmount(info.getValue() || 0)}
          </p>
        ),
        size: 80,
      }),
      // Delete Action

    ],
    [selectedDates, handleQuantityInputChange, handleQuantityKeyDown, handleGpChange, formatter, mainCurrentPage, mainPageSize]
  );

  const table = useReactTable({
    data: paginatedSelectedItems,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <>
      {/* Global loader overlay */}
      {(isLoading || isFetching || saving) && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400" />
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Loading...</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header with title and action buttons */}
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
              Prepare Quotation
            </h1>
            <Tooltip
              content={
                <div className="text-xs max-w-xs">
                  <p className="font-semibold mb-1">Quick Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Select Consolidated Id to load items</li>
                    <li>Enter Gross Price values (Tab to navigate)</li>
                    <li>Click Save</li>
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
            <Tooltip content="Save quotation" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
              <Button
                color="success"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-110"
                onClick={handlePreSave}
                disabled={saving || isFetching || selectedItems.length === 0}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaSave className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content="Refresh page" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
              <Button
                color="warning"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all duration-200 hover:scale-110"
                onClick={refresh}
              >
                <HiRefresh className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
        </div>

        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Top Section: Period + Consolidated Id dropdown + Date picker */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{requestPeriod}</span>
                  <Tooltip content="Tender Period for which the quotation is being prepared" placement="top" className="dark:bg-gray-800 dark:text-white z-50">
                    <HiInformationCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help ml-0.5" />
                  </Tooltip>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* Consolidated Id Dropdown */}
                <div ref={locationDropdownRef} className="relative w-full sm:w-80">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                      selectedLocation ? "border-blue-500 shadow-sm" : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`p-1 rounded-full ${selectedLocation ? "bg-blue-100 dark:bg-blue-300" : "bg-blue-100 dark:bg-blue-300"}`}>
                        <FaBoxOpen className={`w-3.5 h-3.5 ${selectedLocation ? "text-blue-600" : "text-blue-500"}`} />
                      </div>
                      <div className="truncate text-left">
                        <span className={`text-xs font-medium truncate ${selectedLocation ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                          {selectedLocation || "Select Consolidated Id"}
                        </span>
                      </div>
                    </div>
                    <FaChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="relative">
                          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search consolidated IDs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                        <div
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedLocation("");
                            setSelectedLocationName("");
                            setIsOpen(false);
                            setSearch("");
                            setSelectedItems([]);
                            setSelectedDates([]);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>                  
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">Please select a Consolidated Id</div>
                            </div>
                          </div>
                        </div>
                        {filteredOptions.map((loc, index) => (
                          <div
                            key={loc.name}
                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                            onClick={() => handleSelectLocation(loc)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedLocation === loc.name ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"}`}>
                                  <span className="text-xs">{index + 1}</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{loc.name}</div>
                              </div>
                              {selectedLocation === loc.name && (
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

        
              </div>
            </div>
          </div>

          {/* Selected Items Table Section */}
          <div className="p-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                <FaBoxOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Quotation Items
                {selectedItems.length > 0 && <Badge color="primary" className="ml-1 text-[9px] px-3 py-1">{selectedItems.length}</Badge>}
              </h3>
              <div className="relative w-full lg:w-72">
                <HiSearch className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-[10px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-150"
                  disabled={selectedItems.length === 0}
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-[420px]">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-1.5 py-1 text-left text-[9px] font-semibold text-white uppercase tracking-wider"
                          style={{ width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : "auto" }}
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
                      <td colSpan={table.getAllColumns().length} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                            <FaBoxOpen className="w-8 h-8 text-blue-400 dark:text-blue-300" />
                          </div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">No Data Available</h4>
                          <p className="text-gray-500 dark:text-gray-400 text-[10px]">
                            {selectedLocation ? (isFetching ? "Loading items..." : "No items found for this consolidation ID.") : "Please select a consolidation ID to load items"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  of <span className="font-medium">{filteredSelectedItems.length}</span> items
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

  

      {/* Save Confirmation Modal */}
      <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="sm">
        <ModalBody className="p-3 bg-white dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-center text-4xl text-blue-500 mb-3">
              <FaSave />
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to save this quotation?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center p-1">
          <Button
            color="success"
            onClick={performSave}
            disabled={saving}
            className="min-w-[60px] text-[10px] dark:bg-green-700 dark:hover:bg-green-800"
          >
            {saving ? (
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
            disabled={saving}
            className="min-w-[60px] text-[10px] dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "8px",
            padding: "8px",
            fontSize: "12px",
          },
          success: { style: { background: "#059669" } },
          error: { style: { background: "#dc2626" } },
        }}
      />

      {sessionExpired && <SessionModal />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default PrepareQuotation;