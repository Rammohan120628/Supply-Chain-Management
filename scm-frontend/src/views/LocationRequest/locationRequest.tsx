import {
  Label,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Card,
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
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaBoxes,
  FaMapPin,
} from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { Calendar } from "lucide-react";
import axios from "axios";
import _ from "lodash";
import LocReqTable from "./LocationReqTable";
import toast, { Toaster } from "react-hot-toast";
import SessionModal from "../SessionModal";

export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  status?: string;
  statuscolor?: string;
  budget?: string;
  name?: string;
  post?: string;
  pname?: string;
  isSelected?: boolean;
  totalQty?: string;
  quantities?: { [key: string]: string };
}

const columnHelper = createColumnHelper<TableTypeDense>();

// Helper for decimal places (from localStorage)
const getQuantityDecimalPlaces = () =>
  parseInt(localStorage.getItem("decimalToQty") || "2", 10);

const formatQuantity = (value: number | string): string => {
  const decimalPlaces = getQuantityDecimalPlaces();
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(numValue) ? "0.0" : numValue.toFixed(decimalPlaces);
};

const parseQuantityInput = (value: string): number => {
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};

// Calendar Component (unchanged - exact same as target UI)
const CalendarPicker = ({
  selectedDates,
  onDateToggle,
  onSelectAll,
  onDeselectAll,
  year,
  month,
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
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${String(d).padStart(2, "0")}-${String(month).padStart(
      2,
      "0"
    )}-${year}`;
    const isSelected = selectedDates.some((sd) => sd.date === dateStr);
    days.push({ day: d, date: dateStr, isSelected });
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700 w-full max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
            {new Date(year, month - 1).toLocaleString("default", {
              month: "short",
              year: "numeric",
            })}
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Select dates for allocation
          </p>
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
        {weekdays.map((day) => (
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
              ${day ? "cursor-pointer" : ""}
              ${
                day?.isSelected
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : day
                  ? "bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900"
                  : ""
              }
              transition-all duration-150
            `}
            onClick={() => day && onDateToggle(day.date, day.day)}
            title={day ? `Day ${day.day}` : ""}
          >
            {day && (
              <span
                className={`font-medium ${
                  day.isSelected ? "text-white" : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {day.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Locationrequest = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [showTable, setShowTable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [selectedDates, setSelectedDates] = useState<
    { date: string; day: number }[]
  >([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [itemData, setItemData] = useState<TableTypeDense[]>([]);
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsSearch, setItemsSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortingModal, setSortingModal] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [mainCurrentPage, setMainCurrentPage] = useState(1);
  const mainPageSize = 10;
  const [modalPageSize, setModalPageSize] = useState(10);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const quantityInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const getInputKey = (itemId: number, date: string) => `${itemId}-${date}`;
  const [focusAfterPageChange, setFocusAfterPageChange] = useState<'first' | 'last' | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive year & month from purchasePeriod (exact same as original)
  const purchasePeriod = localStorage.getItem("purchasePeriod");
  let periodYear = new Date().getFullYear();
  let periodMonth = new Date().getMonth() + 1;
  if (purchasePeriod) {
    const parts = purchasePeriod.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        periodYear = year;
        periodMonth = month;
      }
    }
  }

  const formatPurchasePeriod = (periodString: string): string => {
    if (!periodString) return "No Period Set";
    try {
      const parts = periodString.split("-");
      if (parts.length !== 3) return periodString;
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthName = date.toLocaleString("default", { month: "short" });
      return `${monthName} ${year}`;
    } catch (error) {
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };

  /* ────────────────────── TOAST HELPERS ────────────────────── */
  const showToast = (message: string, type: "success" | "error" | "info" = "error") => {
    const toastConfig = {
      duration: 3000,
      position: "top-right" as const,
    };
    switch (type) {
      case "success":
        toast.success(message, toastConfig);
        break;
      case "error":
        toast.error(message, toastConfig);
        break;
      case "info":
        toast(message, {
          ...toastConfig,
          style: { background: "#3b82f6", color: "#fff" },
        });
        break;
    }
  };

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

  useEffect(() => {
    setMainCurrentPage(1);
  }, [globalFilter]);

  const paginatedSelectedItems = useMemo(() => {
    const start = (mainCurrentPage - 1) * mainPageSize;
    return filteredSelectedItems.slice(start, start + mainPageSize);
  }, [filteredSelectedItems, mainCurrentPage]);

  const mainTotalPages = Math.ceil(filteredSelectedItems.length / mainPageSize);

  const locationOptions = useMemo(() => {
    const selectOption = {
      locationId: "Select location",
      pk: "select-location",
      locationName: "",
    };
    return [selectOption, ...locations];
  }, [locations]);

  const filteredOptions = useMemo(
    () =>
      locationOptions.filter((loc) =>
        loc.locationId.toLowerCase().includes(search.toLowerCase())
      ),
    [locationOptions, search]
  );

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
    () =>
      filteredItemData.length > 0 &&
      filteredItemData.every((item) => item.isSelected),
    [filteredItemData]
  );

  const selectedCount = useMemo(
    () => filteredItemData.filter((i) => i.isSelected).length,
    [filteredItemData]
  );

  const totalPages = Math.ceil(filteredItemData.length / modalPageSize);

  /* ────────────────────── API CALLS ────────────────────── */
  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      try {
        const { data } = await axios.get(
          "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/dropDownLocation",
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
        else showToast(data.message || "Failed to fetch locations.", "error");
      } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  const fetchItems = async (locationId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/loadAPLForLocationRequestProcess/${locationId}/${purchasePeriod}`,
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
      } else showToast(data.message || "Failed to fetch items.", "error");
    } catch (err: any) {
      console.error("Fetch items error:", err);
      if (err.response?.status === 401) {
        setSessionExpired(true);
      } else {
        const errorMessage = err.response?.data?.message || "Error fetching items. Please try again.";
        showToast(errorMessage, "error");
      }
      setItemData([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ────────────────────── HANDLERS ────────────────────── */
  const handleSelect = (loc: any) => {
    if (!loc.locationId || loc.locationId === "Select location") {
      setSelectedLocation("");
      setLocationName("");
      setItemData([]);
      setSelectedItems([]);
      setSelectedDates([]);
      setModalSearch("");
      setCurrentPage(1);
    } else {
      setSelectedLocation(loc.locationId);
      setLocationName(loc.locationName);
      setSelectedItems([]);
      setSelectedDates([]);
      setModalSearch("");
      setCurrentPage(1);
      fetchItems(loc.locationId);
    }
    setIsOpen(false);
    setSearch("");
  };

  const handleDateToggle = (dateStr: string, day: number) => {
    setSelectedDates((prev) => {
      const exists = prev.find((d) => d.date === dateStr);
      if (exists) {
        const newDates = prev.filter((d) => d.date !== dateStr);
        setSelectedItems((items) =>
          items.map((it) => {
            const qty = { ...it.quantities };
            delete qty[dateStr];
            return {
              ...it,
              quantities: qty,
              totalQty: formatQuantity(
                Object.values(qty).reduce(
                  (s, v) => s + parseQuantityInput(v || "0"),
                  0
                )
              ),
            };
          })
        );
        return newDates;
      }
      return [...prev, { date: dateStr, day }].sort((a, b) => a.day - b.day);
    });
  };

  const handleSelectAllDates = () => {
    const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();
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

  const handleItemCheckbox = useCallback(
    _.debounce((itemId: number) => {
      setItemData((prev) =>
        prev.map((i) =>
          i.itemId === itemId ? { ...i, isSelected: !i.isSelected } : i
        )
      );
    }, 100),
    []
  );

  const handleQuantityInputChange = useCallback(
    (itemId: number, date: string, value: string) => {
      let cleaned = value.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
      }
      const intPart = parts[0] || "";
      if (intPart.length > 5) {
        cleaned = intPart.slice(0, 5) + (parts[1] ? "." + parts[1] : "");
      }
      const decimalPlaces = getQuantityDecimalPlaces();
      if (parts[1] && parts[1].length > decimalPlaces) {
        cleaned = parts[0] + "." + parts[1].slice(0, decimalPlaces);
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
                  }).reduce((s, v) => s + parseFloat(v || "0"), 0)
                ),
              }
            : item
        )
      );
    },
    []
  );

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

  const handleOpenItemsModal = () => {
    setOpenCalendar(false);
    setShowSaveConfirm(false);
    setOpenModal(true);
    setFocusedRowIndex(-1);
  };

  const handleAddItems = () => {
    const newly = filteredItemData.filter((i) => i.isSelected);
    const duplicates = newly.filter((n) =>
      selectedItems.some((e) => e.itemId === n.itemId)
    );
    if (duplicates.length > 0) {
      const dupNames = duplicates.map((d) => d.itemName).join(", ");
      showToast(`Duplicate items not added: ${dupNames}`, "error");
    }
    const unique = newly.filter(
      (n) => !selectedItems.some((e) => e.itemId === n.itemId)
    );
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
    setSelectedItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const validateSave = (): boolean => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      showToast("Authentication required.", "error");
      return false;
    }
    if (!selectedLocation) {
      showToast("Please select a location.", "error");
      return false;
    }
    if (selectedItems.length === 0) {
      showToast("No items selected.", "error");
      return false;
    }
    if (selectedDates.length === 0) {
      showToast("Please select at least one date.", "error");
      return false;
    }
    const hasNonZeroQuantity = selectedItems.some((item) =>
      selectedDates.some(
        (dateObj) => parseQuantityInput(item.quantities?.[dateObj.date] || "0.0") > 0
      )
    );
    if (!hasNonZeroQuantity) {
      showToast("At least one item must have a quantity greater than 0.", "error");
      return false;
    }
    return true;
  };

  const handlePreSave = () => {
    if (validateSave()) {
      setShowSaveConfirm(true);
    }
  };

  const formatDateToYMD = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const handleSave = async () => {
    setShowSaveConfirm(false);
    setSaving(true);
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    const entityId = localStorage.getItem("entity") || "";
    if (!token || !userId) {
      showToast("Authentication required.", "error");
      setSaving(false);
      return;
    }
    const qtyTemplate: Record<string, number> = {};
    const renderedTemplate: Record<string, boolean> = {};
    for (let d = 1; d <= 31; d++) {
      qtyTemplate[`qty${d}`] = 0;
      renderedTemplate[`qtyRendered${d}`] = false;
    }
    const payload = {
      locationId: selectedLocation,
      entityId: entityId,
      userFk: Number(userId),
      period: formatDateToYMD(purchasePeriod || ""),
      subList: selectedItems.map((it) => {
        const qty = { ...qtyTemplate };
        const rend = { ...renderedTemplate };
        for (const d of selectedDates) {
          const day = Number.parseInt(d.date.split("-")[0], 10);
          const val = parseQuantityInput(it.quantities?.[d.date] || "0.0");
          qty[`qty${day}`] = val;
          rend[`qtyRendered${day}`] = val > 0;
        }
        return {
          itemId: it.itemId,
          packageId: it.packageId,
          entOrder: 1,
          supplierId: it.supplierId || "N/A",
          ...qty,
          ...rend,
        };
      }),
    };
    try {
      const { data } = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/saveLocationRequestProcess",
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
        showToast("Saved successfully!", "success");
        setSelectedItems([]);
        setSelectedDates([]);
        setSelectedLocation("");
        setLocationName("");
      } else {
        showToast(data.message || "Failed to save.", "error");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      if (err.response?.status === 401) {
        setSessionExpired(true);
      } else {
        const errorMessage = err.response?.data?.message || "Error saving data. Please try again.";
        showToast(errorMessage, "error");
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
    setCurrentPage(1);
    setSelectedLocation("");
    setGlobalFilter("");
    setLocationName("");
    setItemData([]);
    setModalSearch("");
    showToast("Form refreshed successfully.", "success");
  };

  const handleListClick = () => {
    setShowTable(true);
  };

  const handleAddClick = () => {
    setShowTable(false);
  };

  /* ────────────────────── TABLE DEFINITIONS (UI EXACTLY MATCHING TARGET) ────────────────────── */
  const defaultColumns = useMemo(
    () => [
      // S.No column (exact same)
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
      // Item Id column (exact structure from target UI)
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
          <p className="font-medium text-[11px] text-black dark:text-white">
            {info.getValue()}
          </p>
        ),
        sortingFn: "alphanumeric",
        size: 70,
      }),
      // Item Name column (exact structure + truncate from target UI)
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
          <p className="font-medium text-[11px] text-black dark:text-white max-w-[150px]" title={info.getValue()}>
            {info.getValue()}
          </p>
        ),
        sortingFn: "alphanumeric",
        size: 120,
      }),
      // Package ID column (plain text - exact from target main table UI)
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
          <p className="font-medium text-[11px] text-black dark:text-white">
            {info.getValue()}
          </p>
        ),
        sortingFn: "alphanumeric",
        size: 70,
      }),
      // Date columns (exact input UI from original + target)
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
                  onChange={(e) =>
                    handleQuantityInputChange(itemId, d.date, e.target.value)
                  }
                  onKeyDown={(e) => handleQuantityKeyDown(e, itemId, d.date)}
                  ref={(el) => {
                    if (el)
                      quantityInputRefs.current.set(
                        getInputKey(itemId, d.date),
                        el
                      );
                    else
                      quantityInputRefs.current.delete(
                        getInputKey(itemId, d.date)
                      );
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
      // Total QTY (exact from target UI)
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
            {formatQuantity(info.getValue() || "0.0")}
          </div>
        ),
        sortingFn: (rowA, rowB, columnId) => {
          const a = parseFloat(rowA.getValue(columnId) || "0");
          const b = parseFloat(rowB.getValue(columnId) || "0");
          return a - b;
        },
        size: 60,
      }),
      // Delete column (exact same)
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

  // Modal columns (exact structure + styling from target UI)
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

  /* ────────────────────── RENDER (UI EXACTLY MATCHING TARGET) ────────────────────── */
  if (showTable) {
    return <LocReqTable onBack={handleAddClick} />;
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">
              Loading...
            </span>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header with title, action buttons, and user manual info icon (exact layout) */}
        <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
                Location Request Creation
              </h1>
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select a location from dropdown</li>
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
                  disabled={saving || isLoading}
                >
                  {saving ? (
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
                  onClick={refresh}
                >
                  <HiRefresh className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip
                content="View location request list"
                placement="bottom"
                className="dark:bg-gray-800 dark:text-white z-50"
              >
                <Button
                  color="primary"
                  size="xs"
                  className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-110"
                  onClick={() => {
                    setShowTable(true);
                    refresh();
                  }}
                >
                  <HiViewList className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
</div>
          {/* Main Card (exact class matching target UI) */}
          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Top Section: Period and Location (exact UI) */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {formatPurchasePeriod(purchasePeriod || '')}
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
                  {/* Modern Location Dropdown (exact styling from target) */}
                  <div ref={supplierDropdownRef} className="relative w-full sm:w-72">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className={`w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                        selectedLocation
                          ? 'border-blue-500 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`p-1 rounded-full ${selectedLocation ? 'bg-red-100 dark:bg-red-900' : 'bg-red-100 dark:bg-red-700'}`}>
                          <FaMapMarkerAlt className={`w-3.5 h-3.5 ${selectedLocation ? 'text-red-600' : 'text-red-500'}`} />
                        </div>
                        <div className="truncate text-left">
                          <span className={`text-xs font-medium truncate ${selectedLocation ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {selectedLocation || "Select location"}
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
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          autoFocus
        />
      </div>
    </div>
    <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
      {(() => {
        let realLocationIndex = 0;
        return filteredOptions.map((loc, index) => {
          const isSelectOption = loc.pk === "select-location";
          const displayNumber = isSelectOption ? null : ++realLocationIndex;
          return (
            <div
              key={loc.pk || loc.locationId}
              className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
              onClick={() => handleSelect(loc)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedLocation === loc.locationId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                    }`}
                  >
                    {isSelectOption ? (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>                     ) : (
                      <span className="text-xs">{displayNumber}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {loc.locationId || "—"}
                    </div>
                    {loc.locationName && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {loc.locationName}
                      </div>
                    )}
                  </div>
                </div>
                {selectedLocation === loc.locationId && (
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
          <p className="text-sm text-gray-500 dark:text-gray-400">No locations found</p>
        </div>
      )}
    </div>
    <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <p className="text-[10px] text-gray-500 text-center">
        {filteredOptions.length} location{filteredOptions.length !== 1 ? 's' : ''} available
      </p>
    </div>
  </div>
)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={handleOpenItemsModal}
                      disabled={!selectedLocation}
                      size="xs"
                      className="gap-1 px-2 py-1 text-[9px] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-xs transition-all duration-200 hover:scale-105"
                    >
                      <FaBoxes className="w-2.5 h-2.5" />
                      Select Items
                    </Button>
                    <Button
                      onClick={() => setOpenCalendar(true)}
                      disabled={!selectedLocation}
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

            {/* Selected Items Table Section (exact UI) */}
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
                            style={{ width: `${header.column.columnDef.size}px` }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={table.getAllColumns().length}
                          className="px-1.5 py-6 text-center"
                        >
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
              {/* Pagination Controls for main table (exact) */}
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

        {/* Calendar Modal (exact) */}
        <Modal show={openCalendar} onClose={() => setOpenCalendar(false)} size="sm">
          <ModalHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white p-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <HiCalendar className="w-3 h-3" />
                <div>
                  <h3 className="text-xs font-bold">Select Dates</h3>
                  <p className="text-blue-100 text-[10px]">
                    Choose dates for quantity allocation
                  </p>
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
                Okay
              </Button>
            </div>
          </ModalFooter>
        </Modal>

        {/* Items Modal (exact table + pagination UI) */}
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
              <div className="flex space-x-2 lg:ml-130">
                <Button
                  size="xs"
                  onClick={handleAddItems}
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
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Selected Items:
                </span>
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
                        const absoluteIndex = (currentPage - 1) * modalPageSize + idx;
                        const isFocused = focusedRowIndex === absoluteIndex;
                        return (
                          <tr
                            key={row.id}
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (
                                target.type !== "checkbox" &&
                                !target.closest("a")
                              ) {
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
                              <td
                                key={cell.id}
                                className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300"
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
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs"
                        >
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
              disabled={saving}
              className="min-w-[60px] text-[10px] dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105"
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
              className="min-w-[60px] text-[10px] dark:bg-gray-600 dark:hover:bg-gray-500 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

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
    </>
  );
};

export default Locationrequest;