import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Tooltip,
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
import axios from "axios";
import { 
  FaSave, FaSort, FaSortUp, FaSortDown, FaBoxOpen, 
  FaUserFriends, FaChevronDown, FaMapPin, FaCalendarAlt 
} from "react-icons/fa";
import { HiRefresh, HiInformationCircle, HiSearch, HiArrowRight } from "react-icons/hi";
import toast, { Toaster } from "react-hot-toast";
import SessionModal from "../SessionModal"; // adjust path as needed
import { Calendar } from "lucide-react";

export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  name?: string;
  budget?: number;
  status?: string;
  statuscolor?: string;
  pname?: string;
  isSelected?: boolean;
  totalQty?: string;
  quantities?: { [key: string]: string };
  subList?: any[];
  netPp?: number;
  checkBox?: boolean;
}

// Decimal formatting utilities
const getBudgetDecimalPlaces = () =>
  parseInt(localStorage.getItem("decimalToBudget") || "2", 10);
const formatBudget = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(getBudgetDecimalPlaces());
};

const columnHelper = createColumnHelper<TableTypeDense>();

const EditSystemSelectedSupllierForItems = () => {
  // ────────────────────── STATE ──────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [consolidatedItems, setConsolidatedItems] = useState<TableTypeDense[]>([]);
  const [supplierData, setSupplierData] = useState<TableTypeDense[]>([]);
  const [itemsSearch, setItemsSearch] = useState("");
  const [suppliersSearch, setSuppliersSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState<TableTypeDense | null>(null);
  const [lossBySelection, setLossBySelection] = useState("");
  const [reason, setReason] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const [originalSelectedId, setOriginalSelectedId] = useState("");

  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const [sortingLeft, setSortingLeft] = useState<SortingState>([]);
  const [sortingRight, setSortingRight] = useState<SortingState>([]);

  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  // ────────────────────── TENDER PERIOD ──────────────────────
  const tenderPeriodStr = localStorage.getItem("tenderPeriod");
  let requestPeriod = "";
  if (tenderPeriodStr) {
    const [day, month, year] = tenderPeriodStr.split("-").map(Number);
    const periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  } else {
    requestPeriod = new Date().toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  }

  // ────────────────────── CLICK OUTSIDE ──────────────────────
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

  // ────────────────────── MEMOIZED FILTERS ───────────────────
  const filteredConsolidatedItems = useMemo(
    () =>
      consolidatedItems.filter(
        (item) =>
          (item.itemName ?? "").toLowerCase().includes(itemsSearch.toLowerCase()) ||
          (item.itemId ?? "").toString().includes(itemsSearch) ||
          (item.packageId ?? "").toLowerCase().includes(itemsSearch.toLowerCase())
      ),
    [consolidatedItems, itemsSearch]
  );

  const filteredSupplierData = useMemo(
    () =>
      supplierData.filter(
        (item) =>
          (item.name ?? "").toLowerCase().includes(suppliersSearch.toLowerCase()) ||
          (item.supplierId ?? "").toString().includes(suppliersSearch)
      ),
    [supplierData, suppliersSearch]
  );

  // ────────────────────── API CALLS ──────────────────────────
  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      if (!tenderPeriodStr) {
        toast.error("Tender period not found.", { duration: 3000 });
        return;
      }
      try {
        const { data } = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadConsolidationLocReqForSc/${tenderPeriodStr}`,
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
        else toast.error(data.message || "Failed to fetch locations.", { duration: 3000 });
      } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      }
    };
    fetchLocations();
  }, [tenderPeriodStr]);

  const handleFetch = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      setIsLoading(false);
      return;
    }
    if (!selectedLocation) {
      toast.error("Please select a consolidation Id.", { duration: 3000 });
      setIsLoading(false);
      return;
    }
    if (!tenderPeriodStr) {
      toast.error("Tender period not found.", { duration: 3000 });
      setIsLoading(false);
      return;
    }
    try {
      const [day, month, year] = tenderPeriodStr.split("-").map(Number);
      const period = `${year}-${String(month).padStart(2, "0")}-01`;
      const payload = { period, consolidationId: selectedLocation, itemId: 0 };
      const { data } = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/showPriceComparison",
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
        const allItems: TableTypeDense[] = [];
        data.data.forEach((group: any) => {
          if (group.items && Array.isArray(group.items)) {
            group.items.forEach((item: any) => {
              allItems.push({
                itemId: item.itemId,
                itemName: item.itemName,
                pname: item.packageId,
                subList: item.subList,
                netPp: item.netPp,
                checkBox: item.checkBox,
              });
            });
          }
        });
        setConsolidatedItems(allItems);
      } else {
        toast.error(data.message || "Failed to fetch data.", { duration: 3000 });
      }
    } catch (err: any) {
      setSessionExpired(true);
      if (err?.response?.status === 401) setSessionExpired(true);
      else toast.error("Error fetching data.", { duration: 3000 });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ────────────────────── ITEM CLICK ─────────────────────────
  const handleItemClick = (item: TableTypeDense) => {
    setSelectedItem(item);
    if (item.subList) {
      let suppliers: TableTypeDense[] = item.subList.map((sub: any) => ({
        isSelected: sub.stats === "S",
        supplierId: sub.supplierId,
        name: sub.supplierName,
        budget: sub.netPp,
      }));
      suppliers.sort((a, b) => (b.isSelected ? 1 : 0) - (a.isSelected ? 1 : 0));
      setSupplierData(suppliers);
      const originalSelected = suppliers.find((s) => s.isSelected);
      setOriginalSelectedId(originalSelected?.supplierId || "");
      const loss = originalSelected ? (item.netPp || 0) - (originalSelected.budget || 0) : 0;
      setLossBySelection(formatBudget(loss));
    }
  };

  // ────────────────────── SAVE VALIDATION & CONFIRM ──────────
  const validateAndConfirmSave = () => {
    if (!hasChanged) {
      toast.error("No changes to save.", { duration: 3000 });
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setShowSaveConfirm(false);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      if (!selectedLocation) {
        toast.error("No consolidation Id selected.", { duration: 3000 });
        return;
      }
      if (!tenderPeriodStr) {
        toast.error("Tender period not found.", { duration: 3000 });
        return;
      }
      const [day, month, year] = tenderPeriodStr.split("-").map(Number);
      const period = `${year}-${String(month).padStart(2, "0")}-01`;

      const payload = {
        consolidationId: selectedLocation,
        period,
        items: consolidatedItems.map((item) => ({
          itemId: item.itemId,
          checkBox: item.checkBox ?? false,
        })),
      };

      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/updateEditSelectedSupplier",
        payload,
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
      const data = response.data;
      if (data.success) {
        toast.success(data.message || "Saved successfully.", { duration: 3000 });
        refresh();
      } else {
        toast.error(data.message || "Failed to save.", { duration: 3000 });
      }
    } catch (err: any) {
      setSessionExpired(true);
      if (err?.response?.status === 401) setSessionExpired(true);
      else toast.error("Error saving data. Please try again.", { duration: 3000 });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const refresh = () => {
    setConsolidatedItems([]);
    setSupplierData([]);
    setIsOpen(false);
    setSearch("");
    setSelectedLocation("");
    setItemsSearch("");
    setSuppliersSearch("");
    setSelectedItem(null);
    setLossBySelection("");
    setReason("");
    setHasChanged(false);
    setOriginalSelectedId("");
  };

  const clearSelection = () => {
    setSupplierData([]);
    setItemsSearch("");
    setSuppliersSearch("");
    setSelectedItem(null);
    setLossBySelection("");
    setReason("");
    setHasChanged(false);
    setOriginalSelectedId("");
  };

  // ────────────────────── TABLE COLUMNS ─────────────────────
  // Left table columns (Items)
  const leftTableColumns = [
    columnHelper.display({
      id: "sno",
      header: () => (
        <span className="font-medium text-white text-[10px] uppercase">S.No</span>
      ),
      cell: ({ row }) => (
        <span className="text-[11px] text-gray-600 dark:text-gray-400">
          {row.index + 1}
        </span>
      ),
      size: 40,
      enableSorting: false,
    }),
    columnHelper.accessor("checkBox", {
      header: () => (
        <span className="font-medium text-white text-[10px] uppercase">Select</span>
      ),
      cell: (info) => (
        <input
          type="checkbox"
          checked={info.getValue() ?? false}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          onChange={(e) => {
            const checked = e.target.checked;
            setConsolidatedItems((prev) =>
              prev.map((it) =>
                it.itemId === info.row.original.itemId ? { ...it, checkBox: checked } : it
              )
            );
            setHasChanged(true);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
    }),
    columnHelper.accessor((row) => row, {
      id: "item",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Item</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2.5 h-2.5 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => {
        const { itemId, itemName } = info.getValue();
        return (
          <div className="flex flex-col text-[11px]">
            <span className="font-mono text-gray-700 dark:text-gray-300">
              {itemId}
            </span>
            <span className="font-medium text-gray-900 dark:text-white max-w-[250px]" title={itemName}>
              {itemName || "N/A"}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.itemId || "";
        const b = rowB.original.itemId || "";
        return String(a).localeCompare(String(b));
      },
    }),
    columnHelper.accessor("pname", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Package ID</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2.5 h-2.5 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => (
        <Badge color="purple" className="dark:bg-purple-700 text-[10px]">
          {info.getValue()}
        </Badge>
      ),
      sortingFn: "alphanumeric",
    }),
  ];

  // Right table columns (Suppliers) – readonly
  const rightTableColumns = [
    columnHelper.display({
      id: "sno",
      header: () => (
        <span className="font-medium text-white text-[10px] uppercase">S.No</span>
      ),
      cell: ({ row }) => (
        <span className="text-[11px] text-gray-600 dark:text-gray-400">
          {row.index + 1}
        </span>
      ),
      size: 40,
      enableSorting: false,
    }),
    columnHelper.display({
      id: "selection",
      header: () => (
        <span className="font-medium text-white text-[10px] uppercase">Select</span>
      ),
      cell: (info) => (
        <input
          type="radio"
          name="supplierSelection"
          checked={info.row.original.isSelected || false}
          disabled={true}
          className="h-4 w-4 text-green-600 dark:bg-gray-700 dark:border-gray-600"
        />
      ),
      enableSorting: false,
    }),
    columnHelper.accessor((row) => row, {
      id: "supplier",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-green-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Supplier</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2.5 h-2.5 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => {
        const { supplierId, name } = info.getValue();
        return (
          <div className="flex flex-col text-[11px]">
            {supplierId && (
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {supplierId}
              </span>
            )}
            {name && (
              <span className="font-medium text-gray-900 dark:text-white max-w-[220px]">
                {name}
              </span>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.supplierId || "";
        const b = rowB.original.supplierId || "";
        return a.localeCompare(b);
      },
    }),
    columnHelper.accessor("budget", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-green-200 justify-end"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">NNP</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2.5 h-2.5 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2.5 h-2.5 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => (
        <span className="text-gray-700 text-right dark:text-gray-300 text-[11px] block">
          {formatBudget(info.getValue())}
        </span>
      ),
      sortingFn: "alphanumeric",
    }),
  ];

  const leftTable = useReactTable({
    data: filteredConsolidatedItems,
    columns: leftTableColumns,
    state: { sorting: sortingLeft },
    onSortingChange: setSortingLeft,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rightTable = useReactTable({
    data: filteredSupplierData,
    columns: rightTableColumns,
    state: { sorting: sortingRight },
    onSortingChange: setSortingRight,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ────────────────────── RENDER ────────────────────────────
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
        {/* Header */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-black dark:text-indigo-400 flex items-center gap-2">
              Edit the System Selected Supplier
            </h1>
            <Tooltip
              content={
                <div className="text-xs max-w-xs">
                  <p className="font-semibold mb-1">Quick Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Select a consolidation from dropdown</li>
                    <li>Click "Fetch" to load items</li>
                    <li>Select items using checkboxes</li>
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
            <Tooltip content="Save changes" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
              <Button
                color="success"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-110"
                onClick={validateAndConfirmSave}
                disabled={isLoading || isSaving}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaSave className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content="Reset all" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
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

        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
          {/* Request Period & Consolidation Dropdown */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {requestPeriod}
                  </span>
                  <Tooltip
                    content="Tender Period for which the quotation request is being created"
                    placement="top"
                    className="dark:bg-gray-800 dark:text-white z-50"
                  >
                    <HiInformationCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help ml-0.5" />
                  </Tooltip>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* Modern Location Dropdown */}
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
                      <div className={`p-1 rounded-full ${selectedLocation ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <FaBoxOpen className={`w-3.5 h-3.5 ${selectedLocation ? 'text-blue-600' : 'text-blue-500'}`} />
                      </div>
                      <div className="truncate text-left">
                        <span className={`text-xs font-medium truncate ${selectedLocation ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                          {selectedLocation || "Select consolidation Id"}
                        </span>
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
                            placeholder="Search consolidations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                        {/* ────── FIRST OPTION: "Please select consolidation id" ────── */}
                        <div
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedLocation("");
                            setIsOpen(false);
                            setSearch("");
                            setConsolidatedItems([]);
                            setSupplierData([]);
                            clearSelection();
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>                  
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                Please select consolidation id
                              </div>
                            </div>
                          </div>
                        </div>

                        {locations
                          .filter((loc) => loc.name.toLowerCase().includes(search.toLowerCase()))
                          .map((loc, index) => (
                            <div
                              key={loc.name}
                              className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                              onClick={() => {
                                setSelectedLocation(loc.name);
                                setIsOpen(false);
                                setSearch("");
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    selectedLocation === loc.name
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                                  }`}>
                                    <span className="text-xs">{index + 1}</span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {loc.name || "—"}
                                    </div>
                                  </div>
                                </div>
                                {selectedLocation === loc.name && (
                                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        {locations.filter((loc) => loc.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                          <div className="px-4 py-8 text-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">No consolidations found</p>
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-[10px] text-gray-500 text-center">
                          {locations.filter((loc) => loc.name.toLowerCase().includes(search.toLowerCase())).length} consolidation{locations.filter((loc) => loc.name.toLowerCase().includes(search.toLowerCase())).length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  <Tooltip content="Fetch data" placement="bottom" className="dark:bg-gray-800 dark:text-white z-50">
                    <Button
                      onClick={handleFetch}
                      disabled={isLoading || !selectedLocation}
                      size="xs"
                      className="gap-1 px-3 py-1.5 text-[9px] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-xs transition-all duration-200 hover:scale-105"
                    >
                      <HiArrowRight className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column table layout */}
          <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Items */}
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 text-xs">
                  <FaBoxOpen className="w-3.5 h-3.5" />
                  Items List
                  <Tooltip content="List of consolidated items" placement="top" className="dark:bg-gray-800 dark:text-white z-50">
                    <HiInformationCircle className="w-3 h-3 text-blue-400 dark:text-gray-500" />
                  </Tooltip>
                </h3>
                <div className="relative w-48">
                  <HiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemsSearch}
                    onChange={(e) => setItemsSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="overflow-x-auto max-h-[350px]">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 dark:bg-blue-800 sticky top-0">
                    {leftTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-2 py-1 text-left text-[9px] font-semibold text-white uppercase">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {leftTable.getRowModel().rows.length ? (
                      leftTable.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => handleItemClick(row.original)}
                          className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/50 ${
                            selectedItem?.itemId === row.original.itemId
                              ? "bg-blue-100 dark:bg-blue-900/70"
                              : ""
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-2 py-1 whitespace-nowrap text-[10px]">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={leftTableColumns.length} className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-[10px]">
                          No items loaded. Select a consolidation and click Fetch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Suppliers - READONLY */}
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2 text-xs">
                  <FaUserFriends className="w-3.5 h-3.5" />
                  Suppliers for Selected Item
                  <Tooltip content="List of suppliers for the selected item" placement="top" className="dark:bg-gray-800 dark:text-white z-50">
                    <HiInformationCircle className="w-3 h-3 text-blue-400 dark:text-gray-500" />
                  </Tooltip>
                </h3>
                <div className="relative w-48">
                  <HiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={suppliersSearch}
                    onChange={(e) => setSuppliersSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="overflow-x-auto max-h-[200px]">
                <table className="w-full text-sm">
                  <thead className="bg-green-600 dark:bg-green-800 sticky top-0">
                    {rightTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-2 py-1 text-left text-[9px] font-semibold text-white uppercase">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {rightTable.getRowModel().rows.length ? (
                      rightTable.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className={`${
                            (row.original.budget ?? 0) <= 0 ? "opacity-60" : ""
                          } ${
                            row.original.isSelected
                              ? "bg-green-100 dark:bg-green-900/70"
                              : ""
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-2 py-1 whitespace-nowrap text-[10px]">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={rightTableColumns.length} className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-[10px]">
                          Select an item from the left to view suppliers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="md">
        <ModalBody className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div className="flex items-center justify-center text-4xl sm:text-6xl text-blue-500 mb-4">
              <FaSave />
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to save the changes?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center">
          <Button
            color="success"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm dark:bg-green-700 dark:hover:bg-green-800"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                <span className="text-xs sm:text-sm">Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowSaveConfirm(false)}
            disabled={isSaving}
            className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Session Expiry Modal */}
      {sessionExpired && <SessionModal onClose={() => setSessionExpired(false)} />}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px",
          },
          success: { style: { background: "#059669" } },
          error: { style: { background: "#dc2626" } },
        }}
      />
    </>
  );
};

export default EditSystemSelectedSupllierForItems;