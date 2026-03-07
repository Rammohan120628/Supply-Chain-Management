import {
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
  HiTrash,
  HiViewList,
  HiRefresh,
  HiInformationCircle,
  HiSearch,
  HiPlus,
  HiCalendar,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import {
  FaSave,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaBoxOpen,
  FaChevronDown,
} from "react-icons/fa";
import { Filter, Calendar, X } from "lucide-react";
import axios from "axios";
import _ from "lodash";
import toast, { Toaster } from "react-hot-toast";
import QuotationReplyTable from "./QuotaTable";
import SessionModal from "../SessionModal";
import { useEntityFormatter } from "../Entity/UseEntityFormater";
export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  pname?: string;
  packageId?: string;
  supplierId?: string;
  supplierName?: string;
  status?: string;
  statuscolor?: string;
  budget?: string;
  name?: string;
  post?: string;
  isSelected?: boolean;
  quantities?: { [key: string]: string };
  gp?: string;
  gpOld?: string;
  totalCost?: string;
  isOriginal?: boolean;
  qty?: string;
  quotationProcessDetailPk?: number;
}
const columnHelper = createColumnHelper<TableTypeDense>();
// Helper functions for decimal handling
const getQuantityDecimalPlaces = () => 5;
const formatQuantity = (value: number | string): string => {
  const decimalPlaces = getQuantityDecimalPlaces();
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? "" : numValue.toFixed(decimalPlaces);
};
const parseQuantityInput = (value: string): number => {
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};
const QuotationReply = () => {
  const formatter = useEntityFormatter();
  /* ────────────────────── STATE ────────────────────── */
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isReqNoOpen, setIsReqNoOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [selectedDates, setSelectedDates] = useState<{ date: string; day: number }[]>([]);
  const [reqNoOptions, setReqNoOptions] = useState<any[]>([]);
  const [selectedReqNo, setSelectedReqNo] = useState("");
  const [quotationOptions, setQuotationOptions] = useState<any[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [itemData, setItemData] = useState<TableTypeDense[]>([]);
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);
  const [itemsSearch, setItemsSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortingModal, setSortingModal] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [mainCurrentPage, setMainCurrentPage] = useState(1);
  const mainPageSize = 10;
  // Refs for dropdowns and keyboard navigation
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef1 = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const getInputKey = (itemId: number, field: string) => `${itemId}-${field}`;
  const [focusAfterPageChange, setFocusAfterPageChange] = useState<'first' | 'last' | null>(null);
  // Get tender period from localStorage
  const tenderPeriodStr = localStorage.getItem("tenderPeriod");
  const entityId = localStorage.getItem("entity") || "";
  const userId = localStorage.getItem("userId") || "";
  let periodDate: Date;
  let requestPeriod: string;
  let periodYear: number;
  let periodMonth: number;
  let formattedPeriod: string;
  if (tenderPeriodStr) {
    const [day, month, year] = tenderPeriodStr.split("-").map(Number);
    periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", { month: "short", year: "numeric" });
    periodYear = year;
    periodMonth = month;
    formattedPeriod = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  } else {
    periodDate = new Date();
    requestPeriod = periodDate.toLocaleString("default", { month: "short", year: "numeric" });
    periodYear = periodDate.getFullYear();
    periodMonth = periodDate.getMonth() + 1;
    formattedPeriod = `${periodYear}-${periodMonth.toString().padStart(2, "0")}-${periodDate.getDate().toString().padStart(2, "0")}`;
  }
  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node) &&
        supplierDropdownRef1.current &&
        !supplierDropdownRef1.current.contains(event.target as Node)
      ) {
        setIsReqNoOpen(false);
        setIsQuotationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (!tenderPeriodStr) {
      toast.error("Tender period not found in localStorage.", { duration: 3000, position: "top-right" });
    }
  }, [tenderPeriodStr]);
  // Clear data on quotation change
  useEffect(() => {
    setSupplierId("");
    setSupplierName("");
    setSelectedItems([]);
    setItemData([]);
  }, [selectedQuotation]);
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
  const filteredReqNoOptions = useMemo(
    () => reqNoOptions.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase())),
    [reqNoOptions, search]
  );
  const filteredQuotationOptions = useMemo(
    () =>
      quotationOptions.filter((opt) =>
        `${opt.tranNo}-(${opt.code}-${opt.name})`.toLowerCase().includes(search.toLowerCase())
      ),
    [quotationOptions, search]
  );
  const filteredItemData = useMemo(
    () =>
      itemData.filter(
        (item) =>
          !selectedItems.some((si) => si.itemId === item.itemId) &&
          ((item.itemName ?? "").toLowerCase().includes(modalSearch.toLowerCase()) ||
            (item.itemId ?? "").toString().includes(modalSearch) ||
            (item.packageId ?? "").toLowerCase().includes(modalSearch.toLowerCase()))
      ),
    [itemData, modalSearch, selectedItems]
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
  const gpSummary = useMemo(() => {
    const totalGp = selectedItems.reduce((sum, item) => sum + (parseFloat(item.totalCost || "0")), 0);
    const originalTotal = selectedItems
      .filter((item) => item.isOriginal)
      .reduce((sum, item) => sum + (parseFloat(item.totalCost || "0")), 0);
    const newTotal = selectedItems
      .filter((item) => !item.isOriginal)
      .reduce((sum, item) => sum + (parseFloat(item.totalCost || "0")), 0);
    return { totalGp, originalTotal, newTotal };
  }, [selectedItems]);
  /* ────────────────────── API CALLS (with exact session expiry handling from reference) ────────────────────── */
  useEffect(() => {
    const fetchReqNo = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      if (!token || !tenderPeriodStr) return;
      try {
        const { data } = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadConsolidationLocReqForNp/${tenderPeriodStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (data.success) setReqNoOptions(data.data);
        else toast.error(data.message || "Failed to fetch reqNo options.", { duration: 3000, position: "top-right" });
      } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      }
    };
    fetchReqNo();
  }, [tenderPeriodStr]);
  useEffect(() => {
    const fetchQuotations = async () => {
      if (!selectedReqNo) return;
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      try {
        const { data } = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/dropDownQuotation/${selectedReqNo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (data.success) setQuotationOptions(data.data);
        else toast.error(data.message || "Failed to fetch quotations.", { duration: 3000, position: "top-right" });
      } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        toast.error("Error fetching quotations. Please try again.", { duration: 3000, position: "top-right" });
        console.error(err);
      }
    };
    fetchQuotations();
  }, [selectedReqNo]);
  const fetchDetails = async () => {
    if (!selectedReqNo || !selectedQuotation) {
      toast.error("Please select both Consolidated Id and Quotation.", { duration: 3000, position: "top-right" });
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/quotationReqNoDetail/${selectedQuotation}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (data.success) {
        const detail = data.data;
        setSupplierId(detail.supplierId);
        setSupplierName(detail.supplierName);
  const originalItems = detail.items.map((sub: any) => ({
  itemId: sub.itemId,
  itemName: sub.itemName,
  pname: sub.itemName,
  packageId: sub.packageId,
  qty: formatQuantity(sub.qty || 0),
  gp: sub.gp && parseFloat(sub.gp) !== 0 ? formatQuantity(sub.gp) : "",   // ← fixed
  gpOld: formatQuantity(sub.gpOld || 0),
  totalCost: formatQuantity(sub.totalCost || 0),
  isOriginal: true,
  quantities: {},
  quotationProcessDetailPk: sub.quotationProcessDetailPk || 0,
}));
        setSelectedItems(originalItems);
        setItemData(
          detail.subList.map((it: any) => ({
            itemId: it.itemId,
            itemName: it.itemName,
            packageId: it.packageId,
            gp: formatQuantity(it.gp || 0),
            qty: formatQuantity(it.qty || 0),
            isSelected: false,
            quotationProcessDetailPk: it.quotationProcessDetailPk || 0,
            totalCost: formatQuantity(it.totalCost || 0),
            gpOld: formatQuantity(it.gpOld || 0),
          }))
        );
      } else {
        toast.error(data.message || "Failed to fetch details.", { duration: 3000, position: "top-right" });
      }
    } catch (err: any) {
      setSessionExpired(true);
      if (err?.response?.status === 401) setSessionExpired(true);
      toast.error("Error fetching details. Please try again.", { duration: 3000, position: "top-right" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  /* ────────────────────── HANDLERS (unchanged) ────────────────────── */
  const handleReqNoSelect = (opt: any) => {
    setSelectedReqNo(opt.name);
    setIsReqNoOpen(false);
    setSearch("");
    setQuotationOptions([]);
    setSelectedQuotation("");
    setSupplierId("");
    setSupplierName("");
    setSelectedItems([]);
    setItemData([]);
  };
  const handleQuotationSelect = (opt: any) => {
    setSelectedQuotation(opt.tranNo);
    setIsQuotationOpen(false);
    setSearch("");
  };
  const handleItemCheckbox = useCallback(
    _.debounce((itemId: number) => {
      setItemData((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((i) => i.itemId === itemId);
        if (idx > -1) copy[idx].isSelected = !copy[idx].isSelected;
        return copy;
      });
    }, 100),
    []
  );
  const handleQuantityInputChange = useCallback((itemId: number, date: string, value: string) => {
    let cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    const intPart = parts[0] || "";
    if (intPart.length > 5) {
      cleaned = intPart.slice(0, 5) + (parts[1] ? "." + parts[1] : "");
    }
    const maxDecimal = getQuantityDecimalPlaces();
    if (parts[1] && parts[1].length > maxDecimal) {
      cleaned = parts[0] + "." + parts[1].slice(0, maxDecimal);
    }
    setSelectedItems((prev) =>
      prev.map((it) => {
        if (it.itemId === itemId) {
          const newQuantities = { ...it.quantities };
          if (cleaned === "") {
            delete newQuantities[date];
          } else {
            newQuantities[date] = cleaned;
          }
          const newQty = Object.values(newQuantities).reduce((s, v) => s + parseFloat(v || "0"), 0);
          const newTotalCost = newQty * parseFloat(it.gp || "0");
          return {
            ...it,
            quantities: newQuantities,
            qty: formatQuantity(newQty),
            totalCost: formatQuantity(newTotalCost)
          };
        }
        return it;
      })
    );
  }, []);
  const handleGpInputChange = useCallback((itemId: number, value: string) => {
    let cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    const intPart = parts[0] || "";
    if (intPart.length > 5) {
      cleaned = intPart.slice(0, 5) + (parts[1] ? "." + parts[1] : "");
    }
    const maxDecimal = getQuantityDecimalPlaces();
    if (parts[1] && parts[1].length > maxDecimal) {
      cleaned = parts[0] + "." + parts[1].slice(0, maxDecimal);
    }
    const val = parseFloat(cleaned) || 0;
    if (val < 0) {
      toast.error("Gross Price cannot be negative.", { duration: 2000, position: "top-right" });
      return;
    }
    setSelectedItems((prev) =>
      prev.map((it) => {
        if (it.itemId === itemId) {
          const newGp = cleaned === "" ? "" : cleaned;
          const newTotalCost = parseFloat(it.qty || "0") * val;
          return { 
            ...it, 
            gp: newGp, 
            totalCost: formatQuantity(newTotalCost) 
          };
        }
        return it;
      })
    );
  }, []);
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, itemId: number, field: string) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      const currentKey = getInputKey(itemId, field);
      const allKeys = Array.from(inputRefs.current.keys()).sort();
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
          inputRefs.current.get(nextKey)?.focus();
        }
      }
    },
    [mainCurrentPage, mainTotalPages]
  );
  useEffect(() => {
    if (focusAfterPageChange) {
      const timer = setTimeout(() => {
        const allKeys = Array.from(inputRefs.current.keys()).sort();
        if (allKeys.length > 0) {
          const targetKey = focusAfterPageChange === 'first' ? allKeys[0] : allKeys[allKeys.length - 1];
          inputRefs.current.get(targetKey)?.focus();
        }
        setFocusAfterPageChange(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mainCurrentPage, focusAfterPageChange]);
  const handleAddItems = () => {
    const newly = filteredItemData.filter((i) => i.isSelected);
    const unique = newly.filter((n) => !selectedItems.some((e) => e.itemId === n.itemId));
    if (unique.length < newly.length) {
      toast.error("Duplicate items not added.", { duration: 3000, position: "top-right" });
    }
    setSelectedItems((prev) => [
      ...prev,
      ...unique.map((i) => ({
        ...i,
        pname: i.itemName,
        quantities: {},
        qty: "",
        gp: "",
        totalCost: "",
        gpOld: formatQuantity(i.gpOld || 0),
        isOriginal: false,
      })),
    ]);
    setOpenModal(false);
    setItemData((prev) => prev.map((i) => ({ ...i, isSelected: false })));
    setModalSearch("");
    setCurrentPage(1);
    setFocusedRowIndex(-1);
  };
  const handleDeleteItem = useCallback((itemId: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }, []);
  const handleListClick = () => {
    setShowTable(true);
    refresh();
  };
  const handleAddClick = () => {
    setShowTable(false);
  };
  const refresh = () => {
    setSelectedReqNo("");
    setSelectedQuotation("");
    setSupplierId("");
    setSupplierName("");
    setSelectedItems([]);
    setItemData([]);
    setSelectedDates([]);
    setSearch("");
    setModalSearch("");
    setItemsSearch("");
    setCurrentPage(1);
    setMainCurrentPage(1);
    setGlobalFilter("");
  };
  const handlePreSave = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No token found. Please log in.", { duration: 3000, position: "top-right" });
      return;
    }
    if (!userId) {
      toast.error("User ID not found. Please log in again.", { duration: 3000, position: "top-right" });
      return;
    }
    if (!selectedQuotation) {
      toast.error("Please select a quotation.", { duration: 3000, position: "top-right" });
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("No items selected.", { duration: 3000, position: "top-right" });
      return;
    }
    const originalItems = selectedItems.filter((i) => i.isOriginal);
    const invalidGpItems = originalItems.filter(
      (item) => !item.gp || parseFloat(item.gp) < 0
    );
  
    setShowSaveConfirm(true);
  };
  const performSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No token found. Please log in.", { duration: 3000, position: "top-right" });
      return;
    }
    setIsSaving(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const originalItems = selectedItems.filter((i) => i.isOriginal);
      if (originalItems.length > 0) {
        const updatePayload = {
          locationRequestHeaderPk: 0,
          reqHeadFK: 0,
          locationRequestDetailsPk: 0,
          subList: [],
          dateBasedItem: [],
          quotationTransNo: selectedQuotation,
          items: originalItems.map((i) => ({
            locationRequestHeaderPk: 0,
            quotationProcessDetailPk: i.quotationProcessDetailPk,
            itemId: i.itemId,
            gp: parseFloat(i.gp || "0"),
            qty: parseFloat(i.qty || "0"),
          })),
        };
        const { data: updateData } = await axios.post(
          "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/updateQuotationReply",
          updatePayload,
          { headers }
        );
        if (updateData.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (!updateData.success) {
          throw new Error(updateData.message || "Failed to update quotation reply.");
        }
      }
      const newItems = selectedItems.filter((i) => !i.isOriginal);
      if (newItems.length > 0) {
        const supplierPayload = {
          supplierId: supplierId,
          lastUser: parseInt(userId),
          period: formattedPeriod,
          uploadedItem: newItems.map((i) => ({
            itemId: i.itemId,
            packageId: i.packageId,
            qty: parseFloat(i.qty || "0"),
          })),
        };
        const { data: supplierData } = await axios.post(
          "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/saveSupplierItemDetails",
          supplierPayload,
          { headers }
        );
        if (supplierData.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (!supplierData.success) {
          throw new Error(supplierData.message || "Failed to save supplier item details.");
        }
        const additionalPayload = {
          quotationTransNo: selectedQuotation,
          entityId: entityId,
          dateWiseQty: newItems.map((i) => ({
            itemId: i.itemId,
            packageId: i.packageId,
            qty: parseFloat(i.qty || "0"),
          })),
        };
        const { data: additionalData } = await axios.post(
          "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/addAdditionalQuotation",
          additionalPayload,
          { headers }
        );
        if (additionalData.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (!additionalData.success) {
          throw new Error(additionalData.message || "Failed to add additional quotation.");
        }
      }
      toast.success("Saved successfully!", { duration: 3000, position: "top-right" });
      setShowSaveConfirm(false);
      refresh();
    } catch (err: any) {
      setSessionExpired(true);
      console.error("Save error:", err);
      toast.error(err.message || "Error saving data. Please try again.", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsSaving(false);
    }
  };
  // Keyboard navigation for modal (unchanged)
  const handleTableKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
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
    },
    [filteredItemData, focusedRowIndex, handleItemCheckbox]
  );
  /* ────────────────────── TABLE COLUMNS (UI styling + formatter exactly like reference) ────────────────────── */
  const defaultColumns = useMemo(
    () => [
      // ✅ S.No column added
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
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-bold text-[11px] text-black dark:text-white">{info.getValue()}</p>,
      }),
      columnHelper.accessor("pname", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Item Name</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-bold text-[11px] text-black dark:text-white truncate">{info.getValue()}</p>,
      }),
      columnHelper.accessor("packageId", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Package Id</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-bold text-[11px] text-black dark:text-white">{info.getValue()}</p>,
      }),
      ...selectedDates.map((d) =>
        columnHelper.display({
          id: d.date,
          header: () => (
            <div className="flex items-center gap-1 cursor-default">
              <span className="font-medium text-white text-[10px] uppercase whitespace-nowrap">{d.date}</span>
            </div>
          ),
          cell: ({ row }) => (
            <div className="relative group">
              <input
                type="text"
                value={row.original.quantities?.[d.date] ?? ""}
                onChange={(e) => handleQuantityInputChange(row.original.itemId!, d.date, e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, row.original.itemId!, d.date)}
                ref={(el) => {
                  const key = getInputKey(row.original.itemId!, d.date);
                  if (el) inputRefs.current.set(key, el);
                  else inputRefs.current.delete(key);
                }}
                className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 dark:bg-gray-700 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Day {d.day} - {d.date}
              </div>
            </div>
          ),
        })
      ),
      columnHelper.accessor("qty", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Total QTY</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <div className="flex items-center justify-center">
            <p className="font-bold text-[11px] text-black dark:text-white">
              {info.getValue() ? formatter.formatQuantity(parseFloat(info.getValue() || "0")) : ""}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("gp", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Gross Price</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: ({ row }) => (
          <div className="relative">
            <input
              type="text"
              value={row.original.gp || ""}
              onChange={(e) => handleGpInputChange(row.original.itemId!, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e, row.original.itemId!, 'gp')}
              ref={(el) => {
                const key = getInputKey(row.original.itemId!, 'gp');
                if (el) inputRefs.current.set(key, el);
                else inputRefs.current.delete(key);
              }}
              className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            {row.original.isOriginal && (
              <Tooltip content="Original item - GP will be updated">
                <span className="absolute -top-1 -right-1 cursor-help">
                  <HiInformationCircle className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                </span>
              </Tooltip>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("gpOld", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Last GP</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <p className="font-bold text-[11px] ml-7 text-black dark:text-white">{formatter.formatAmount(parseFloat(info.getValue() || "0"))}</p>
        ),
      }),
      columnHelper.accessor("totalCost", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">TTL GP</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => (
          <p className="font-bold text-[11px] ml-7Enter quantities and GP text-black dark:text-white">
            {info.getValue() ? formatter.formatAmount(parseFloat(info.getValue() || "0")) : ""}
          </p>
        ),
      }),
      columnHelper.display({
        id: "delete",
        header: () => <span className="font-medium text-white text-[10px] uppercase">Actions</span>,
        cell: ({ row }) =>
          !row.original.isOriginal && (
            <Tooltip content="Delete item">
              <Button
                color="failure"
                size="xs"
                className="hover:scale-105 transition-transform dark:bg-red-700 dark:text-white p-0.5"
                onClick={() => handleDeleteItem(row.original.itemId!)}
              >
                <HiTrash className="h-2.5 w-2.5" />
              </Button>
            </Tooltip>
          ),
      }),
    ],
    [selectedDates, handleQuantityInputChange, handleGpInputChange, handleInputKeyDown, handleDeleteItem, formatter, mainCurrentPage, mainPageSize]
  );

  const modalColumns = useMemo(
    () => [
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
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-bold text-[11px] text-black dark:text-white">{info.getValue()}</p>,
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
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-bold text-[11px] text-black dark:text-white truncate">{info.getValue()}</p>,
      }),
      columnHelper.accessor("packageId", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={column.getToggleSortingHandler()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Package Id</span>
            {column.getCanSort() && (
              <span className="text-white text-[10px]">
                {{
                  asc: " 🔼",
                  desc: " 🔽",
                }[column.getIsSorted() as string] ?? " ↕️"}
              </span>
            )}
          </div>
        ),
        cell: (info) => <p className="font-bold text-[11px] text-black dark:text-white">{info.getValue()}</p>,
      }),
    ],
    [allFilteredSelected, handleItemCheckbox, filteredItemData]
  );
  const table = useReactTable({
    data: paginatedSelectedItems,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });
  const table1 = useReactTable({
    data: paginatedItemData,
    columns: modalColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting: sortingModal },
    onSortingChange: setSortingModal,
    getSortedRowModel: getSortedRowModel(),
  });
  /* ────────────────────── RENDER (UI exactly matching reference Quotationrequest) ────────────────────── */
  if (showTable) {
    return <QuotationReplyTable onBack={handleAddClick} />;
  }
  return (
    <>
      {/* Global loader overlay */}
      {(isLoading || isSaving) && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Loading...</span>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header with title and action buttons (styled exactly like reference) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400">Quotation Reply</h1>
            <Tooltip
              content={
                <div className="text-xs max-w-xs">
                  <p className="font-semibold mb-1">Quick Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Select Consolidated Id</li>
                    <li>Select Quotation</li>
                    <li>Fetch details</li>
                    <li>Add items if needed</li>
                    <li>Enter and modify a GP Value</li>
                    <li>Save</li>
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
            <Tooltip content="Save quotation reply" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
              <Button
                color="success"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-110"
                onClick={handlePreSave}
                disabled={isSaving}
              >
                {isSaving ? (
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
            <Tooltip content="View list" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
              <Button
                color="primary"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-110"
                onClick={handleListClick}
              >
                <HiViewList className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
        {/* Main Card (styled exactly like reference) */}
        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Top Section: Period + Consolidated / Quotation dropdowns + Fetch + Supplier info + Add Items */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Period */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{requestPeriod}</span>
                </div>
              </div>
              {/* Consolidated Id & Quotation dropdowns + Fetch (modern styling) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                {/* Consolidated Id Dropdown (exact styling from reference) */}
                <div ref={supplierDropdownRef} className="relative w-full sm:w-72">
                  <button
                    onClick={() => setIsReqNoOpen(!isReqNoOpen)}
                    className={`w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                      selectedReqNo
                        ? "border-blue-500 shadow-sm"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`p-1 rounded-full ${
                          selectedReqNo ? "bg-blue-100 dark:bg-blue-900" : "bg-blue-100 dark:bg-blue-700"
                        }`}
                      >
                        <FaBoxOpen
                          className={`w-3.5 h-3.5 ${selectedReqNo ? "text-blue-600" : "text-blue-500"}`}
                        />
                      </div>
                      <div className="truncate text-left">
                        <span
                          className={`text-xs font-medium truncate ${
                            selectedReqNo ? "text-gray-900 dark:text-white" : "text-gray-500"
                          }`}
                        >
                          {selectedReqNo || "Select Consolidated Id"}
                        </span>
                      </div>
                    </div>
                    <FaChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        isReqNoOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isReqNoOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="relative">
                          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                        {/* Clear option */}
                        <div
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedReqNo("");
                            setIsReqNoOpen(false);
                            setSearch("");
                            setQuotationOptions([]);
                            setSelectedQuotation("");
                            setSupplierId("");
                            setSupplierName("");
                            setSelectedItems([]);
                            setItemData([]);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>                  
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">Please select</div>
                            </div>
                          </div>
                        </div>
                        {filteredReqNoOptions.map((opt, index) => (
                          <div
                            key={opt.name}
                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                            onClick={() => handleReqNoSelect(opt)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    selectedReqNo === opt.name
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"
                                  }`}
                                >
                                  <span className="text-xs">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {opt.name}
                                  </div>
                                </div>
                              </div>
                              {selectedReqNo === opt.name && (
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredReqNoOptions.length === 0 && (
                          <div className="px-4 py-8 text-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">No options found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Quotation Dropdown (exact styling from reference) */}
                <div ref={supplierDropdownRef1} className="relative w-full sm:w-72">
                  <button
                    onClick={() => setIsQuotationOpen(!isQuotationOpen)}
                    className={`w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                      selectedQuotation
                        ? "border-blue-500 shadow-sm"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`p-1 rounded-full ${
                          selectedQuotation ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <HiViewList
                          className={`w-3.5 h-3.5 ${selectedQuotation ? "text-blue-600" : "text-gray-500"}`}
                        />
                      </div>
                      <div className="truncate text-left">
                        <span
                          className={`text-xs font-medium truncate ${
                            selectedQuotation ? "text-gray-900 dark:text-white" : "text-gray-500"
                          }`}
                        >
                          {selectedQuotation || "Select Quotation"}
                        </span>
                      </div>
                    </div>
                    <FaChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                        isQuotationOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isQuotationOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="relative">
                          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                        {/* Clear option */}
                        <div
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedQuotation("");
                            setIsQuotationOpen(false);
                            setSearch("");
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>                  
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">Please select</div>
                            </div>
                          </div>
                        </div>
                        {filteredQuotationOptions.map((opt, index) => (
                          <div
                            key={opt.tranNo}
                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                            onClick={() => handleQuotationSelect(opt)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    selectedQuotation === opt.tranNo
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"
                                  }`}
                                >
                                  <span className="text-xs">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {opt.tranNo} - ({opt.code}-{opt.name})
                                  </div>
                                </div>
                              </div>
                              {selectedQuotation === opt.tranNo && (
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredQuotationOptions.length === 0 && (
                          <div className="px-4 py-8 text-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">No options found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Fetch Button */}
                <Tooltip content="Fetch Data" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
                  <Button
                    className={`w-9 h-9 p-0 rounded-full text-white flex items-center justify-center transition-all duration-200 ${
                      !selectedReqNo || !selectedQuotation
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    }`}
                    disabled={isLoading || !selectedReqNo || !selectedQuotation}
                    onClick={fetchDetails}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Filter className="w-3 h-3" />
                    )}
                  </Button>
                </Tooltip>
              </div>
            </div>
            {/* Supplier ID / Name + Add Items (kept from original but styled cleanly) */}
       
          </div>
          {/* Selected Items Table Section (exact styling from reference) */}
           <div className="p-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mt-1">
              <div className="lg:col-span-4">
                <div className="relative">
                  <input
                    id="supplierId"
                    type="text"
                    value={supplierId}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs"
                  />
                  <label
                    htmlFor="supplierId"
                    className="absolute left-3 -top-2 text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-1"
                  >
                    Supplier ID
                  </label>
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="relative">
                  <input
                    id="supplierName"
                    type="text"
                    value={supplierName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs"
                  />
                  <label
                    htmlFor="supplierName"
                    className="absolute left-3 -top-2 text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-1"
                  >
                    Supplier Name
                  </label>
                </div>
              </div>
              <div className="lg:col-span-2 flex items-end">
                    <Tooltip content="Add Items" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">

                   <Button
                size="xs"
                onClick={() => setOpenModal(true)}
                  disabled={!selectedQuotation}
                className="p-2 w-8 h-8 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </Button>
                                          </Tooltip>

              </div>
            </div>
              <div className="relative w-full lg:w-56">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
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
                          className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase tracking-wider"
                          style={{ width: header.column.columnDef.size || "auto" }}
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
                          <td key={cell.id} className="px-3 py-2 text-xs">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={table.getAllColumns().length}
                        className="px-4 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                            <FaBoxOpen className="w-8 h-8 text-blue-400 dark:text-blue-300" />
                          </div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                            No Items Selected
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-[10px]">
                            Click "Select Items" to add items to your quotation reply.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for main table (styled like reference) */}
            {filteredSelectedItems.length > 0 && (
              <div className="mt-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMainCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={mainCurrentPage === 1}
                    className="px-3 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <FaChevronLeft className="w-3 h-3" /> Prev
                  </button>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-xs font-medium">
                    {mainCurrentPage} / {mainTotalPages}
                  </span>
                  <button
                    onClick={() => setMainCurrentPage((p) => Math.min(mainTotalPages, p + 1))}
                    disabled={mainCurrentPage >= mainTotalPages}
                    className="px-3 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Next <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      {/* Items Modal (exact UI from reference) */}
      <Modal show={openModal} onClose={() => setOpenModal(false)} size="4xl">
        <ModalHeader className="border-b border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 text-xs">
              <FaBoxOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Select Items</h3>
              <span className="px-2 py-0.5 dark:bg-blue-900 text-black dark:text-blue-300 rounded-full text-xs font-bold">
                Total: {filteredItemData.length}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="xs"
                onClick={handleAddItems}
                disabled={selectedCount === 0}
                className="p-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-gray-700 dark:text-gray-300">Selected Items:</span>
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md font-bold">
                {selectedCount}
              </span>
            </div>
            <div className="relative w-56">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={modalSearch}
                onChange={(e) => {
                  setModalSearch(e.target.value);
                  setCurrentPage(1);
                  setFocusedRowIndex(-1);
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                autoFocus
              />
            </div>
          </div>
          <div
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus:outline-none"
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
                          className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {table1.getRowModel().rows.length > 0 ? (
                    table1.getRowModel().rows.map((row, idx) => {
                      const absoluteIndex = (currentPage - 1) * modalPageSize + idx;
                      const isFocused = focusedRowIndex === absoluteIndex;
                      return (
                        <tr
                          key={row.id}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.type !== "checkbox") {
                              handleItemCheckbox(row.original.itemId!);
                            }
                          }}
                          className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-xs transition-colors ${
                            row.original.isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          } ${isFocused ? "bg-blue-100 dark:bg-blue-800/40 border-l-4 border-blue-500" : ""}`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 py-2 text-xs text-gray-800 dark:text-gray-300">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-xs">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination for modal (styled like reference + original page-size selector preserved) */}
          {filteredItemData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-xs">
              <div className="text-gray-600 dark:text-gray-300">
                Showing {(currentPage - 1) * modalPageSize + 1} to{" "}
                {Math.min(currentPage * modalPageSize, filteredItemData.length)} of {filteredItemData.length} items
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={modalPageSize}
                  onChange={(e) => {
                    setModalPageSize(Number(e.target.value));
                    setCurrentPage(1);
                    setFocusedRowIndex(-1);
                  }}
                  className="text-xs border rounded px-3 py-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  {[5, 10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      setFocusedRowIndex(-1);
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <FaChevronLeft className="w-3 h-3" /> Prev
                  </button>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-xs font-medium">
                    {currentPage} / {Math.ceil(filteredItemData.length / modalPageSize)}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(Math.ceil(filteredItemData.length / modalPageSize), p + 1));
                      setFocusedRowIndex(-1);
                    }}
                    disabled={currentPage >= Math.ceil(filteredItemData.length / modalPageSize)}
                    className="px-3 py-1 border rounded flex items-center gap-1 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Next <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
      {/* Save Confirmation Modal (exact match) */}
      <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="sm">
        <ModalBody className="p-3 bg-white dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-center text-4xl text-blue-500 mb-3">
              <FaSave />
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to save this quotation reply?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center p-1">
          <Button
            color="success"
            onClick={performSave}
            disabled={isSaving}
            className="min-w-[60px] text-[10px] dark:bg-green-700 dark:hover:bg-green-800"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
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
    </>
  );
};
export default QuotationReply;