import {
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
import axios from "axios";
import { FaSave, FaSort, FaSortUp, FaSortDown, FaBoxOpen, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaChevronLeft, FaChevronRight, FaChevronDown, FaMapPin } from "react-icons/fa";
import { HiRefresh, HiInformationCircle, HiSearch, HiArrowLeft, HiArrowRight } from "react-icons/hi";
import toast, { Toaster } from "react-hot-toast";
import SessionModal from "../SessionModal"; // adjust path as needed
import { Calendar } from "lucide-react";

export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  name?: string; // supplier name
  budget?: number; // netPp from supplier sublist
  isSelected?: boolean;
  subList?: any[];
  netPp?: number; // originally selected budget
  pname?: string; // packageId alias
}

// ──────────────────────────────────────────────────────────────
// Decimal formatting utilities (from localStorage)
// ──────────────────────────────────────────────────────────────
const getBudgetDecimalPlaces = () =>
  parseInt(localStorage.getItem("decimalToBudget") || "2", 10);
const formatBudget = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(getBudgetDecimalPlaces());
};

// ──────────────────────────────────────────────────────────────
// Column helper
// ──────────────────────────────────────────────────────────────
const columnHelper = createColumnHelper<TableTypeDense>();

const ChangeSystemSelectedSupplierForItems = () => {
  // ────────────────────── STATE ──────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [prevLocation, setPrevLocation] = useState("");
  const [consolidatedItems, setConsolidatedItems] = useState<TableTypeDense[]>([]);
  const [supplierData, setSupplierData] = useState<TableTypeDense[]>([]);
  const [itemsSearch, setItemsSearch] = useState("");
  const [suppliersSearch, setSuppliersSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<TableTypeDense | null>(null);
  const [lossBySelection, setLossBySelection] = useState("");
  const [reason, setReason] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const [originalSelectedId, setOriginalSelectedId] = useState("");
  const [reasons, setReasons] = useState<{ [key: number]: string }>({});
  const [selectedSuppliers, setSelectedSuppliers] = useState<{ [key: number]: string }>({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [sortingLeft, setSortingLeft] = useState<SortingState>([]);
  const [sortingRight, setSortingRight] = useState<SortingState>([]);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const [originalBudget, setOriginalBudget] = useState<number>(0);

  // ────────────────────── TENDER PERIOD ──────────────────────
  const tenderPeriodStr = localStorage.getItem("tenderPeriod");
  let requestPeriod = "";
  let periodYear = new Date().getFullYear();
  let periodMonth = new Date().getMonth() + 1;
  if (tenderPeriodStr) {
    const [day, month, year] = tenderPeriodStr.split("-").map(Number);
    const periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    periodYear = year;
    periodMonth = month;
  } else {
    requestPeriod = new Date().toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  }

  // ────────────────────── SESSION STORAGE ────────────────────
  useEffect(() => {
    const savedReasons = sessionStorage.getItem("reasons");
    if (savedReasons) setReasons(JSON.parse(savedReasons));
    const savedSelectedSuppliers = sessionStorage.getItem("selectedSuppliers");
    if (savedSelectedSuppliers) setSelectedSuppliers(JSON.parse(savedSelectedSuppliers));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("reasons", JSON.stringify(reasons));
  }, [reasons]);

  useEffect(() => {
    sessionStorage.setItem("selectedSuppliers", JSON.stringify(selectedSuppliers));
  }, [selectedSuppliers]);

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

  // ────────────────────── CLEAR DATA ON NEW LOCATION SELECTION ─────────
  // Immediately clear old data when a different consolidation is picked.
  useEffect(() => {
    if (selectedLocation && selectedLocation !== prevLocation) {
      setConsolidatedItems([]);
      setSupplierData([]);
      clearSelection();
    }
  }, [selectedLocation, prevLocation]);

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
        else toast.error(data.message || "Failed to fetch locations.");
      } catch (err: any) {
                setSessionExpired(true);

        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      }
    };
    fetchLocations();
  }, [tenderPeriodStr]);

  // ────────────────────── FETCH PRICE COMPARISON ────────────
  const handleFetch = useCallback(async () => {
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
    if (selectedLocation !== prevLocation) {
      sessionStorage.removeItem("reasons");
      sessionStorage.removeItem("selectedSuppliers");
      setReasons({});
      setSelectedSuppliers({});
    }
    setPrevLocation(selectedLocation);
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
      );  if (data.status === 401) {
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
              });
            });
          }
        });
        setConsolidatedItems(allItems);
      } else {
        toast.error(data.message || "Failed to fetch data.");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) setSessionExpired(true);
      else toast.error("Error fetching data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, tenderPeriodStr, prevLocation]);

  // ────────────────────── ITEM CLICK ─────────────────────────
const handleItemClick = useCallback(
  (item: TableTypeDense) => {
    if (selectedItem && hasChanged && !reason.trim()) {
      toast.error("Reason is required when supplier is changed", { duration: 3000 });
      return;
    }

    setSelectedItem(item);

    if (item.subList) {
      let suppliers: TableTypeDense[] = item.subList.map((sub: any) => ({
        isSelected: sub.stats === "S",
        supplierId: sub.supplierId,
        name: sub.supplierName,
        budget: sub.netPp,
      }));

      suppliers.sort((a, b) => (b.isSelected ? 1 : 0) - (a.isSelected ? 1 : 0));

      // ────── remember the ORIGINAL (system-selected) values ──────
      const originalSelected = suppliers.find((s) => s.isSelected);
      const origId = originalSelected?.supplierId || "";
      const origBudget = originalSelected?.budget;

      console.log("Original selected NetPP:", origBudget);

      setOriginalSelectedId(origId);
      setOriginalBudget(origBudget);

      const storedSelectedId = selectedSuppliers[item.itemId || 0];

      let calcLoss = "0.00";
      let currentHasChanged = false;

      if (storedSelectedId) {
        // user had previously changed this item → restore that change
        const newSupplierData = suppliers.map((s) => ({
          ...s,
          isSelected: s.supplierId === storedSelectedId,
        }));

        setSupplierData(newSupplierData);

        const newSelected = newSupplierData.find((s) => s.isSelected);
        calcLoss = ((origBudget) - (newSelected?.budget || 0)).toFixed(2);
        currentHasChanged = storedSelectedId !== origId;
      } else {
        // no stored change → show the original system selection
        setSupplierData(suppliers);
        calcLoss = "0.00";               // ← default supplier → always 0
      }

      setLossBySelection(formatBudget(calcLoss));
      setReason(reasons[item.itemId || 0] || "");
      setHasChanged(currentHasChanged);
    }
  },
  [selectedItem, hasChanged, reason, selectedSuppliers, reasons]
);

  // ────────────────────── SUPPLIER SELECT ────────────────────
const handleSupplierSelect = useCallback(
  (index: number) => {
    if (index < 0 || index >= supplierData.length) return;

    const newSupplierData = supplierData.map((sup, i) => ({
      ...sup,
      isSelected: i === index,
    }));

    setSupplierData(newSupplierData);

    const newSelected = supplierData[index];

   const loss = newSelected.supplierId === originalSelectedId
  ? 0
  : (selectedItem?.netPp || 0) - (newSelected.budget || 0);
setLossBySelection(formatBudget(loss));

    const itemId = selectedItem?.itemId || 0;
    setSelectedSuppliers((prev) => ({ ...prev, [itemId]: newSelected.supplierId || "" }));

    const changed = newSelected.supplierId !== originalSelectedId;
    setHasChanged(changed);

    if (changed && reasonRef.current) {
      reasonRef.current.scrollIntoView({ behavior: "smooth" });
      reasonRef.current.focus();
    }
  },
  [supplierData, selectedItem, originalSelectedId, originalBudget]
);

  // ────────────────────── REASON CHANGE ──────────────────────
  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setReason(e.target.value);
      const itemId = selectedItem?.itemId || 0;
      setReasons((prev) => ({ ...prev, [itemId]: e.target.value }));
    },
    [selectedItem]
  );

  // ────────────────────── SAVE VALIDATION & CONFIRM ─────────────────────
  const validateAndConfirmSave = () => {
    if (!selectedItem) {
      toast.error("No item selected.", { duration: 3000 });
      return;
    }
    if (!hasChanged) {
      toast.error("No changes to save.", { duration: 3000 });
      return;
    }
    const selectedSup = supplierData.find((sup) => sup.isSelected);
    if (!selectedSup) {
      toast.error("Please select a supplier.", { duration: 3000 });
      return;
    }
    if (hasChanged && !reason.trim()) {
      toast.error("Reason is required when supplier is changed", { duration: 3000 });
      return;
    }
    setShowSaveConfirm(true);
  };

  // ────────────────────── SAVE OPERATION ─────────────────────
  const performSave = async () => {
    setIsSaving(true);
    setShowSaveConfirm(false);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      if (!tenderPeriodStr) {
        toast.error("Tender period not found.", { duration: 3000 });
        return;
      }
      // Update subList stats
      selectedItem.subList?.forEach((sub: any) => {
        sub.stats = sub.supplierId === supplierData.find((sup) => sup.isSelected)?.supplierId ? "S" : "";
      });
      selectedItem.netPp = supplierData.find((sup) => sup.isSelected)?.budget;
      
      // ✅ FIXED: correctly parse DD-MM-YYYY into YYYY-MM-01
      const [day, month, year] = tenderPeriodStr.split("-").map(Number);
      const itemPeriod = `${year}-${String(month).padStart(2, "0")}-01`;

      const itemPayload = {
        itemId: selectedItem.itemId,
        period: itemPeriod,
        currencyId: reason,
        supplierId: supplierData.find((sup) => sup.isSelected)?.supplierId,
        subList: selectedItem.subList?.map((sub: any) => ({
          locationRequestDetailsPk: sub.locationRequestDetailsPk,
          supplierId: sub.supplierId,
          stats: sub.stats,
        })),
      };
      const payload = {
        consolidationId: selectedLocation,
        items: [itemPayload],
      };
      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/updateSelectedSupplier",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 401) {
        setSessionExpired(true);
        return;
      }
 
      const data = response.data;
      if (data.success) {
        toast.success(data.message || "Saved successfully.", { duration: 3000 });
        const itemId = selectedItem.itemId || 0;
        setReasons((prev) => {
          const newPrev = { ...prev };
          delete newPrev[itemId];
          return newPrev;
        });
        setSelectedSuppliers((prev) => {
          const newPrev = { ...prev };
          delete newPrev[itemId];
          return newPrev;
        });
        await handleFetch();
        clearSelection();
      } else {
        toast.error(data.message || "Failed to save.", { duration: 3000 });
      }
    } catch (err: any) {
      if (err?.response?.status === 401) setSessionExpired(true);
      else toast.error("Error saving data. Please try again.", { duration: 3000 });
      console.error(err);
    } finally {
      setIsSaving(false);
      refresh();
    }
  };

  // ────────────────────── REFRESH / CLEAR ────────────────────
const clearSelection = useCallback(() => {
  setSupplierData([]);
  setItemsSearch("");
  setSuppliersSearch("");
  setSelectedItem(null);
  setLossBySelection("");
  setReason("");
  setHasChanged(false);
  setOriginalSelectedId("");
  setOriginalBudget(0);           // ← added
}, []);

const refresh = useCallback(() => {
  sessionStorage.removeItem("reasons");
  sessionStorage.removeItem("selectedSuppliers");
  setReasons({});
  setSelectedSuppliers({});
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
  setOriginalBudget(0);           // ← added
  setPrevLocation("");
}, []);

  // ────────────────────── TABLE COLUMNS ──────────────────────
  const leftTableColumns = [
    columnHelper.display({
      id: "sno",
      header: () => (
        <span className="font-medium text-white text-[10px] uppercase">S.No</span>
      ),
      cell: ({ row }) => {
        return <span className="text-[11px] text-gray-600 dark:text-gray-400">{row.index + 1}</span>;
      },
      size: 40,
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
        const a = rowA.original.itemId || 0;
        const b = rowB.original.itemId || 0;
        return a - b;
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
        <p className="text-[11px] text-gray-700 text-right dark:text-gray-300">
          {info.getValue()}
        </p>
      ),
      sortingFn: "alphanumeric",
    }),
  ];

  const rightTableColumns = [
    columnHelper.display({
      id: "sno",
      header: () => (
        <span className="font-medium text-white text-[10px] uppercase">S.No</span>
      ),
      cell: ({ row }) => {
        return <span className="text-[11px] text-gray-600 dark:text-gray-400">{row.index + 1}</span>;
      },
      size: 40,
      enableSorting: false,
    }),
    columnHelper.display({
      id: "selection",
      header: "Select",
      cell: (info) => (
        <input
          type="radio"
          name="supplierSelect"
          checked={info.row.original.isSelected || false}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          onChange={() => handleSupplierSelect(info.row.index)}
          disabled={(info.row.original.budget ?? 0) <= 0}
        />
      ),
    }),
    columnHelper.accessor((row) => row, {
      id: "supplier",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
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
        const hasId = supplierId != null && supplierId !== "";
        const hasName = name != null && name !== "";
        if (!hasId && !hasName) {
          return <span className="text-[11px] text-gray-500">N/A</span>;
        }
        return (
          <div className="flex flex-col text-[11px]">
            {hasId && (
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {supplierId}
              </span>
            )}
            {hasName && (
              <span className="font-medium text-gray-900 dark:text-white text-[11px]  max-w-[220px]">
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
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase text-right">Budget (NNP)</span>
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
        <span className="text-gray-700 ml-8 text-right dark:text-gray-300 text-[11px]">
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

  // ────────────────────── RENDER ─────────────────────────────
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
        <div>
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">             <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
                Change the System Selected Supplier
              </h1>
              {/* User manual tooltip - updated styling */}
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select a consolidation from dropdown</li>
                      <li>Click "Fetch" to load items</li>
                      <li>Select an item from left table</li>
                      <li>Change supplier in right table if needed</li>
                      <li>Enter reason if changed</li>
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
                content="Save changes"
                placement="bottom"
                className="dark:bg-gray-800 dark:text-white z-50"
              >
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
            </div>
          </div>
          </div>

          {/* Main Card */}
          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">            
            {/* Top Section: Period and Consolidation Dropdown */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {requestPeriod}
                    </span>
                    {/* Period info tooltip - updated styling */}
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
                        <div className={`p-1 rounded-full ${selectedLocation ? 'bg-blue-100 dark:bg-blue-900' : 'bg-blue-100 dark:bg-blue-700'}`}>
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
                          {/* ────── FIRST OPTION: "Please select consolidation id" (exactly like PrepareQuotation) ────── */}
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

                          {/* Existing locations list */}
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
                      className="w-full pl-7 pr-2 py-1 text-[10px] border border-gray-700 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[200px]">
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
                          <td colSpan={3} className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-[10px]">
                            No items loaded. Select a consolidation and click Fetch.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Right: Suppliers */}
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
                      className="w-full pl-7 pr-2 py-1 text-[10px] border border-gray-700 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
                            onClick={() => {
                              if ((row.original.budget ?? 0) > 0) {
                                handleSupplierSelect(row.index);
                              }
                            }}
                            className={`${
                              (row.original.budget ?? 0) > 0
                                ? "cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/50"
                                : "cursor-not-allowed"
                            } ${
                              row.original.isSelected ? "bg-green-100 dark:bg-green-900/70" : ""
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
                          <td colSpan={4} className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-[10px]">
                            Select an item from the left to view suppliers.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Bottom: Loss & Reason */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                <label className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
  Loss by selection
  <Tooltip content="Calculated loss from selection change" placement="top" className="dark:bg-gray-800 dark:text-white z-50">
    <HiInformationCircle className="w-3 h-3 text-blue-400 dark:text-gray-500" />
  </Tooltip>
</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={lossBySelection}
                      readOnly
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 text-[10px]"
                    />
                
                  </div>
                </div>
             <div>
                <label className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
      Reason for selection {hasChanged && <span className="text-red-500">*</span>}
      <Tooltip content="Provide reason if supplier changed" placement="top" className="dark:bg-gray-800 dark:text-white z-50">
        <HiInformationCircle className="w-3 h-3 text-blue-400 dark:text-gray-500 inline ml-1" />
      </Tooltip>
    </label>
    <textarea
      ref={reasonRef}
      value={reason}
      onChange={handleReasonChange}
      rows={3}
      maxLength={50}
      placeholder="Enter reason for changing supplier..."
      className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-[10px] ${
        hasChanged && !reason.trim()
          ? "border-red-300 dark:border-red-600"
          : "border-gray-300 dark:border-gray-600"
      }`}
    />
    <div className="flex justify-end mt-1">
      <span className="text-[10px] text-black dark:text-gray-400">
        Characters Remaining {reason.length}/50
      </span>
    </div>
    {hasChanged && !reason.trim() && (
      <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
        Reason is required when supplier is changed.
      </p>
    )}
  </div>
              </div>
            </div>
          </Card>
      </div>
        </div>

      {/* ────────────────── MODALS ────────────────── */}
      {/* Save Confirmation Modal */}
      <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="md">
        <ModalBody className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div className="flex items-center justify-center text-4xl sm:text-6xl text-blue-500 mb-4">
              <FaSave />
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to save this supplier change?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center">
          <Button
            color="success"
            onClick={() => {
              performSave();
              refresh();

            }}
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

export default ChangeSystemSelectedSupplierForItems;