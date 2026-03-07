import { Label, Button, Card, Tooltip, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { HiRefresh, HiSearch } from 'react-icons/hi';
import { FaInfoCircle, FaSave, FaSort, FaSortUp, FaSortDown, FaFileExcel, FaCopy, FaEraser, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import React from "react";
import { BsFilePdf } from "react-icons/bs";
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
  itemId?: number;
  itemName?: string;
  packageID?: string;
  physicalStock?: string;
  theoriticalStock?: number;
  adjust?: number;
  fReason?: string;
  remainingQty?: number;
  unitCP?: number;
  fPhysicalQty?: number;
  serialNo?: number;
  entityID?: any;
  lastuser?: number;
  saveType?: number;
  message?: any;
  financePk?: number;
  physicalStockEntryList?: any[];
  psPk?: number;
  period?: any;
}
const columnHelper = createColumnHelper<TableTypeDense>();
const PhysicalStock = () => {
  const formatter = useEntityFormatter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<boolean | null>(null);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [tableData, setTableData] = useState<TableTypeDense[]>([]);
  // Read stockClosing exactly as set in AuthLogin (entityEiis.stockClosing)
  const [stockClosing, setStockClosing] = useState(() => {
    const stored = localStorage.getItem("stockClosing");
    return stored && stored !== "" ? stored : "0";
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isFinalizeConfirm, setIsFinalizeConfirm] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  useEffect(() => {
    fetchApprovalData();
  }, []);
  // ====================== API FUNCTIONS ======================
  const stockPeriodString = localStorage.getItem("stockPeriod");
  const fetchApprovalData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    const stockPeriod = localStorage.getItem("stockPeriod");
    if (!stockPeriod) return;
    const [day, month, year] = stockPeriod.split('-').map(Number);
    const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/getStockClosingApprovalForPhysicalStock/${formattedDate}`,
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
        setApprovalStatus(response.data.data.status);
        setApprovalMessage(response.data.data.message);
        if (response.data.data.status) {
          await fetchTableData();
        }
      } else {
        toast.error(response.data.message || "Failed to fetch approval data.", { duration: 3000, position: 'top-right' });
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) setSessionExpired(true);
    } finally {
      setLoading(false);
    }
  };
  const fetchTableData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    const stockPeriod = localStorage.getItem("stockPeriod");
    if (!stockPeriod) {
      toast.error("Stock period not set. Please select a period first.", { duration: 3000, position: 'top-right' });
      return;
    }
    const [day, month, year] = stockPeriod.split('-').map(Number);
    const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/getPhysicalStockEntryData/${formattedDate}`,
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
        const data = response.data.data.map((item: any) => ({
          ...item,
          // 🟡 CHANGE: physicalStock defaults to empty string instead of "0"
          physicalStock: item.physicalStock ? item.physicalStock.toString() : '',
          adjust: parseFloat(item.physicalStock?.toString() || '0') - (item.theoriticalStock || 0),
          fReason: item.fReason || '',
        }));
        setTableData(data);
        // stockClosing is now only taken from localStorage on initial load
        // and from save API response (stockValue) afterwards.
      } else {
        toast.error(response.data.message || "Failed to fetch table data.", { duration: 3000, position: 'top-right' });
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) setSessionExpired(true);
      else toast.error("Error fetching table data. Please try again.", { duration: 3000, position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };
  // ========== Change Handlers ==========
  const handleReasonChange = useCallback((index: number, value: string) => {
    setTableData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], fReason: value };
      return newData;
    });
  }, []);
  // ========== Save / Finalize ==========
  const handleSave = async (isFinalize = false) => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    const stockPeriod = localStorage.getItem("stockPeriod");
    if (!token) {
      toast.error("No authentication token found. Please log in.", { duration: 3000, position: 'top-right' });
      return;
    }
    if (!userId) {
      toast.error("User ID not found. Please log in again.", { duration: 3000, position: 'top-right' });
      return;
    }
    const nonZeroAdjustItems = tableData.filter(item => item.adjust !== 0);
    for (const item of nonZeroAdjustItems) {
      if (!item.fReason || item.fReason.trim() === '') {
        toast.error(`Please enter a reason for Item ID: ${item.itemId} ${item.itemName}.`, {
          duration: 3000,
          position: 'top-right'
        });
        return;
      }
    }
    const allZero = tableData.every(item => item.adjust === 0);
    if (isFinalize && !allZero) {
      toast.error("All adjusts must be zero to finalize.", { duration: 3000, position: 'top-right' });
      return;
    }
    setIsFinalizeConfirm(isFinalize);
    setShowSaveConfirm(true);
  };
  const performSave = async () => {
    setShowSaveConfirm(false);
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    const stockPeriod = localStorage.getItem("stockPeriod");
    const isFinalize = isFinalizeConfirm;
    if (!token || !userId || !stockPeriod) {
      toast.error("Missing authentication or period data.");
      return;
    }
    const [day, month, year] = stockPeriod.split('-').map(Number);
    const periodISO = new Date(Date.UTC(year, month - 1, day)).toISOString();
    const periodStr = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    const saveType = isFinalize ? 1 : 0;
    const physicalStockEntryList = tableData.map(item => ({
      itemId: item.itemId ?? 0,
      itemName: item.itemName ?? "",
      packageID: item.packageID ?? "",
      physicalStock: parseFloat(item.physicalStock ?? '0'),
      theoriticalStock: item.theoriticalStock ?? 0,
      adjust: item.adjust ?? 0,
      getfReason: item.fReason ?? "",
      getfPhysicalQty: item.fPhysicalQty ?? 0,
      remainingQty: item.remainingQty ?? 0,
      unitCP: item.unitCP ?? 0,
      serialNo: item.serialNo ?? 0,
      entityID: item.entityID ?? "",
      financePk: item.financePk ?? 0,
      psPk: item.psPk ?? 0,
      physicalStockStr: item.physicalStock ?? '0',
      theoriticalStockStr: (item.theoriticalStock ?? 0).toString(),
      adjustStr: (item.adjust ?? 0).toString(),
    }));
    const payload = {
      period: periodISO,
      periodStr: periodStr,
      lastuser: parseInt(userId, 10),
      saveType: saveType,
      physicalStockEntryList: physicalStockEntryList,
    };
    setSaving(true);
    try {
      const url = `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/savePhysicalStockEntryData`;
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Save response:", response.data);
      if (response.data.success) {
        toast.success(isFinalize ? "Finalized successfully!" : "Saved successfully!");
        // === NEW LOGIC: stockClosing comes from API response.stockValue (never refetch table data) ===
        const apiStockValue = response.data.stockValue !== undefined ? String(response.data.stockValue) : (isFinalize ? "2" : "1");
        setStockClosing(apiStockValue);
        localStorage.setItem("stockClosing", apiStockValue);
        // DO NOT call fetchTableData() - keep user-entered / copied values in UI exactly as they are
        // (prevents resetting to zero or server values after successful save/finalize)
      } else {
        toast.error(response.data.message || `Failed to ${isFinalize ? 'finalize' : 'save'}.`);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Error ${isFinalize ? 'finalizing' : 'saving'}: ${errorMsg}`);
      if (err.response?.status === 401) setSessionExpired(true);
    } finally {
      setSaving(false);
    }
  };
  const handleRefresh = () => {
    fetchApprovalData();
  };
  const handleDownloadExcel = async (type: string) => {
    let stockPeriod = localStorage.getItem("stockPeriod");
    const [day, month, year] = stockPeriod.split('-').map(Number);
    const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No authentication token found. Please log in.", { duration: 3000, position: 'top-right' });
      return;
    }
    const downloadPayload = tableData.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      packageID: item.packageID,
      physicalStock: parseFloat(item.physicalStock ?? '0'),
      adjust: item.adjust,
      theoriticalStock: item.theoriticalStock,
      fReason: item.fReason
    }));
    const url = type === '1'
      ? `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/physicalStockExcel`
      : `http://43.254.31.234:9070/api-gateway-scm/stock-movement-analysis-scm/stockDeliveryController/physicalStockpdf`;
    try {
      const response = await axios.post(url, downloadPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob',
      });
      if (response.headers['content-type'].includes('application/json')) {
        const errorData = JSON.parse(await new Response(response.data).text());
        toast.error(errorData.message || "Failed to download file", { duration: 3000, position: 'top-right' });
        return;
      }
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const contentDisposition = response.headers['content-disposition'];
      let filename = `PhysicalStockReport${type}.${type === '1' ? 'xlsx' : 'pdf'}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`${type === '1' ? 'Excel' : 'PDF'} downloaded!`, { duration: 3000, position: 'top-right' });
    } catch (err: any) {
      console.error("Download error:", err);
      if (err.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.", { duration: 3000, position: 'top-right' });
        setSessionExpired(true);
      } else {
        toast.error("Error downloading file. Please try again.", { duration: 3000, position: 'top-right' });
      }
    }
  };
const handleCopyTheoretical = () => {
  setTableData(prev => prev.map(item => ({
    ...item,
    physicalStock: String(item.theoriticalStock ?? 0), // exact decimal, no rounding
    adjust: 0,
    fReason: ''
  })));
  toast.success("Copied theoretical stock to physical stock for all items!", { duration: 3000, position: 'top-right' });
};
  const handleClearPhysical = () => {
    setTableData(prev => prev.map(item => ({
      ...item,
      physicalStock: '0',
      adjust: -(item.theoriticalStock || 0),
      fReason: ''
    })));
    toast.success("Cleared physical stock for all items!", { duration: 3000, position: 'top-right' });
  };
  // ========== Table Filtering ==========
  const filteredTableData = useMemo(() => {
    if (!searchQuery.trim()) return tableData;
    const lowerQuery = searchQuery.toLowerCase();
    return tableData.filter(item =>
      (item.itemName?.toLowerCase() || '').includes(lowerQuery) ||
      (item.itemId?.toString() || '').includes(lowerQuery) ||
      (item.packageID?.toLowerCase() || '').includes(lowerQuery)
    );
  }, [tableData, searchQuery]);
  // ========== NEW: Compute pageCount ==========
  const pageCount = useMemo(() => Math.ceil(filteredTableData.length / pagination.pageSize), [filteredTableData, pagination.pageSize]);
  // ========== NEW: Input Refs and Navigation ==========
  const inputRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  const getInputKey = (serialNo: number, field: 'physicalStock' | 'fReason') => `${serialNo}-${field}`;
  const [focusAfterPageChange, setFocusAfterPageChange] = useState<'first' | 'last' | null>(null);
  const getSortedKeys = () => {
    return Array.from(inputRefs.current.keys()).sort((a, b) => {
      const [noA, fieldA] = a.split('-');
      const [noB, fieldB] = b.split('-');
      const numA = parseInt(noA), numB = parseInt(noB);
      if (numA !== numB) return numA - numB;
      const orderA = fieldA === 'physicalStock' ? 0 : 1;
      const orderB = fieldB === 'physicalStock' ? 0 : 1;
      return orderA - orderB;
    });
  };
  useEffect(() => {
    if (focusAfterPageChange) {
      const timer = setTimeout(() => {
        const allKeys = getSortedKeys();
        if (allKeys.length > 0) {
          const targetKey = focusAfterPageChange === 'first' ? allKeys[0] : allKeys[allKeys.length - 1];
          inputRefs.current.get(targetKey)?.focus();
        }
        setFocusAfterPageChange(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pagination.pageIndex, focusAfterPageChange]);
  // Handle tab navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, serialNo: number, field: 'physicalStock' | 'fReason') => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const currentKey = getInputKey(serialNo, field);
      const allKeys = getSortedKeys();
      const currentIndex = allKeys.indexOf(currentKey);
      if (currentIndex === -1) return;
      if (!e.shiftKey && currentIndex === allKeys.length - 1) {
        // Last input, tab forward to next page
        if (pagination.pageIndex < pageCount - 1) {
          setFocusAfterPageChange('first');
          setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
          return;
        }
      } else if (e.shiftKey && currentIndex === 0) {
        // First input, shift-tab to previous page
        if (pagination.pageIndex > 0) {
          setFocusAfterPageChange('last');
          setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
          return;
        }
      } else {
        // Normal tab within page
        const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex >= 0 && nextIndex < allKeys.length) {
          const nextKey = allKeys[nextIndex];
          inputRefs.current.get(nextKey)?.focus();
        }
      }
    },
    [pagination.pageIndex, pageCount]
  );
  // ========== NEW: Controlled input change with validation ==========
const handlePhysicalStockInputChange = useCallback((index: number, value: string) => {
    // Allow only numbers and a single decimal point
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
    // 🟡 CHANGE: allow up to 5 decimal places
    const decimalPlaces = 5;
    if (parts[1] && parts[1].length > decimalPlaces) {
      cleaned = parts[0] + "." + parts[1].slice(0, decimalPlaces);
    }
    // Update state with cleaned string
    setTableData(prev => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        physicalStock: cleaned,
        adjust: parseFloat(cleaned || '0') - (newData[index].theoriticalStock || 0),
      };
      return newData;
    });
  }, []);
  // For reason, no validation needed, but keep onChange
   const handleReasonInputChange = useCallback((index: number, value: string) => {
    setTableData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], fReason: value };
      return newData;
    });
  }, []);
  // ========== Column Definitions (ALWAYS show input fields - readonly when stockClosing === "2") ==========
  const defaultColumns = useMemo(() => [
    columnHelper.accessor("serialNo", {
      header: ({ column }) => (
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => column.toggleSorting()}>
          <span className="font-medium text-white text-[10px] uppercase">SI.No</span>
          {column.getIsSorted() === "asc" ? <FaSortUp className="w-2 h-2" /> : column.getIsSorted() === "desc" ? <FaSortDown className="w-2 h-2" /> : <FaSort className="w-2 h-2 text-gray-400" />}
        </div>
      ),
      cell: (info) => <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100">{info.getValue()}</p>,
      size: 60,
    }),
    columnHelper.display({
      id: "itemDetails",
      header: ({ column }) => (
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => column.toggleSorting()}>
          <span className="font-medium text-white text-[10px] uppercase">Item Details</span>
          {column.getIsSorted() === "asc" ? <FaSortUp className="w-2 h-2" /> : column.getIsSorted() === "desc" ? <FaSortDown className="w-2 h-2" /> : <FaSort className="w-2 h-2 text-gray-400" />}
        </div>
      ),
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-bold text-[11px] text-gray-900 dark:text-white">{row.original.itemId}</div>
          <div className="text-[11px] font-bold text-gray-600 dark:text-gray-300 max-w-[280px] line-clamp-1">{row.original.itemName}</div>
        </div>
      ),
      sortingFn: (rowA, rowB) => (rowA.original.itemId || 0) - (rowB.original.itemId || 0),
      size: 260,
    }),
    columnHelper.accessor("packageID", {
      header: ({ column }) => (
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => column.toggleSorting()}>
          <span className="font-medium text-white text-[10px] uppercase">Package ID</span>
          {column.getIsSorted() === "asc" ? <FaSortUp className="w-2 h-2" /> : column.getIsSorted() === "desc" ? <FaSortDown className="w-2 h-2" /> : <FaSort className="w-2 h-2 text-gray-400" />}
        </div>
      ),
      cell: (info) => <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100">{info.getValue()}</p>,
      size: 110,
    }),
    columnHelper.accessor("physicalStock", {
      header: ({ column }) => (
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => column.toggleSorting()}>
          <span className="font-medium text-white text-[10px]">Physical Stock</span>
          {column.getIsSorted() === "asc" ? <FaSortUp className="w-2 h-2" /> : column.getIsSorted() === "desc" ? <FaSortDown className="w-2 h-2" /> : <FaSort className="w-2 h-2 text-gray-400" />}
        </div>
      ),
      cell: (info) => {
        const value = info.getValue() || '';
        const originalIndex = tableData.findIndex(item => item.serialNo === info.row.original.serialNo);
        const serialNo = info.row.original.serialNo ?? 0;
        const isReadOnly = stockClosing === "2";
        return (
          <input
            type="text"
            value={value}
            onChange={isReadOnly ? undefined : (e) => handlePhysicalStockInputChange(originalIndex, e.target.value)}
            onKeyDown={isReadOnly ? undefined : (e) => handleKeyDown(e, serialNo, 'physicalStock')}
            ref={(el) => {
              if (el) inputRefs.current.set(getInputKey(serialNo, 'physicalStock'), el);
              else inputRefs.current.delete(getInputKey(serialNo, 'physicalStock'));
            }}
            readOnly={isReadOnly}
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
      sortingFn: (rowA, rowB) => parseFloat(rowA.original.physicalStock) - parseFloat(rowB.original.physicalStock),
      size: 110,
    }),
   columnHelper.accessor("theoriticalStock", {
  header: ({ column }) => (
    <div className="flex items-center gap-1 whitespace-break-spaces cursor-pointer" onClick={() => column.toggleSorting()}>
      <span className="font-medium text-white text-[10px]">Theoretical Stock</span>
      {column.getIsSorted() === "asc" ? <FaSortUp className="w-2 h-2" /> : column.getIsSorted() === "desc" ? <FaSortDown className="w-2 h-2" /> : <FaSort className="w-2 h-2 text-gray-400" />}
    </div>
  ),
  cell: (info) => {
    const value = info.getValue() ?? 0;
    // Display raw number without rounding or formatting
    return <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100 text-center">{value}</p>;
  },
  size: 120,
}),
    columnHelper.accessor("adjust", {
      header: ({ column }) => (
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => column.toggleSorting()}>
          <span className="font-medium text-white text-[10px]">Adjust</span>
          {column.getIsSorted() === "asc" ? <FaSortUp className="w-2 h-2" /> : column.getIsSorted() === "desc" ? <FaSortDown className="w-2 h-2" /> : <FaSort className="w-2 h-2 text-gray-400" />}
        </div>
      ),
      cell: (info) => {
        const value = info.getValue() ?? 0;
        const color = value !== 0 ? 'text-black dark:text-gray-400 font-bold' : 'text-green-600 dark:text-green-400';
        return <p className={`text-[11px] font-bold ${color} text-center`}>{formatter.formatQuantity(value)}</p>;
      },
      size: 90,
    }),
columnHelper.accessor("fReason", {
  header: () => <span className="font-medium text-white text-[10px]">Reason</span>,
  cell: (info) => {
    const value = info.getValue() || '';
    const originalIndex = tableData.findIndex(item => item.serialNo === info.row.original.serialNo);
    const serialNo = info.row.original.serialNo ?? 0;
    const isReadOnly = stockClosing === "2";
    const maxLength = 70;
    const remaining = maxLength - value.length;
    return (
      <div className="flex flex-col items-start">
        <textarea
          value={value}
          onChange={isReadOnly ? undefined : (e) => handleReasonInputChange(originalIndex, e.target.value)}
          onKeyDown={isReadOnly ? undefined : (e) => handleKeyDown(e, serialNo, 'fReason')}
          ref={(el) => {
            if (el) inputRefs.current.set(getInputKey(serialNo, 'fReason'), el);
            else inputRefs.current.delete(getInputKey(serialNo, 'fReason'));
          }}
          readOnly={isReadOnly}
          maxLength={maxLength}
          className="w-40 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-[11px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y h-10"
          placeholder="Enter reason..."
          onClick={(e) => e.stopPropagation()}
        />
        {!isReadOnly && (
          <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
            {remaining}/{maxLength}
          </span>
        )}
      </div>
    );
  },
  size: 160,
}),
  ], [stockClosing, handlePhysicalStockInputChange, handleReasonInputChange, handleKeyDown, formatter]);
  const table = useReactTable({
    data: filteredTableData,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility, sorting, pagination },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const hasData = tableData.length > 0;
  // ========== Render ==========
  return (
    <>
      {/* Loading Overlay */}
      {(loading || saving) && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {loading ? 'Loading...' : 'Saving...'}
            </span>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-indigo-400">
            Physical Stock Entry
          </h1>
        <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-md">
      <FaInfoCircle className="text-blue-500 dark:text-blue-400 text-xs" />
      <p className="text-[14px] text-black font-bold dark:text-gray-300">
       Please ensure you have completed the Receiving and Issuing before Starting the Physical Stock Entry
      </p>
    </div>
        </div>
        <div className="flex items-center gap-2">
       
          {/* === UPDATED BUTTON LOGIC === */}
          {stockClosing === "0" && (
            <Tooltip content="Save physical stock entries" className="z-50">
              <Button
                color="success"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center"
                onClick={() => handleSave(false)}
                disabled={loading || saving}
              >
                <FaSave className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
          {stockClosing === "1" && (
            <Tooltip content="Finalize physical stock" className="z-50">
              <Button
                color="blue"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center"
                onClick={() => handleSave(true)}
                disabled={loading || saving}
              >
                <FaArrowRight className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
             <Tooltip content="Refresh data" className="z-50">
            <Button
              color="warning"
              size="xs"
              className="w-8 h-8 p-0 rounded-full flex items-center justify-center"
              onClick={handleRefresh}
              disabled={loading || saving}
            >
              <HiRefresh className="w-4 h-4" />
            </Button>
          </Tooltip>
          {/* When stockClosing === "2" → only Refresh button is visible (as requested) */}
        </div>
      </div>
      {/* Info Cards */}
      <div className="space-y-3 mb-4">
      
        {!approvalStatus && approvalMessage && (
          <Card className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0 text-xs" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">WARN</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These are the GRN's and RET with no Invoice ID and Cr. Note No. {approvalMessage}
                </p>
              </div>
            </div>
          </Card>
        )}
        {approvalStatus && !hasData && !loading && (
          <Card className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3 mb-3">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0 text-xs" />
              <p className="text-xs text-gray-700 dark:text-gray-300">
                No physical stock data available for the selected period.
              </p>
            </div>
          </Card>
        )}
      </div>
      {/* Main Table */}
      {approvalStatus && hasData && (
        <Card className="border border-gray-200 dark:border-gray-700 p-0">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Physical Stock Entry</h3>
              <div className="flex items-center gap-2">
                {/* Copy & Clear */}
                <Tooltip content="Copy Theoretical to Physical" className="z-50">
                  <Button
                    size="xs"
                    className="px-3 py-1 text-xs font-bold bg-blue-500 hover:bg-blue-600"
                    onClick={handleCopyTheoretical}
                    disabled={stockClosing === "2" || loading || saving}
                  >
                    <FaCopy className="inline-block w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
                <Tooltip content="Clear Physical Stock" className="z-50">
                  <Button
                    size="xs"
                    className="px-3 py-1 text-xs font-bold bg-yellow-500 hover:bg-yellow-600"
                    onClick={handleClearPhysical}
                    disabled={stockClosing === "2" || loading || saving}
                  >
                    <FaEraser className="inline-block w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
                {/* Excel + PDF buttons with copy button */}
                <Tooltip content="Download Excel" className="z-50">
                  <Button
                    size="xs"
                    className="px-3 py-1 text-xs font-bold bg-green-500 hover:bg-green-600"
                    onClick={() => handleDownloadExcel('1')}
                  >
                    <FaFileExcel className="inline-block w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
                <Tooltip content="Download PDF" className="z-50">
                  <Button
                    size="xs"
                    className="px-3 py-1 text-xs font-bold bg-red-500 hover:bg-red-600"
                    onClick={() => handleDownloadExcel('2')}
                  >
                    <BsFilePdf className="inline-block w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder={`Search ${tableData.length} records...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto lg:max-h-[330px]">
            <table className="w-full text-[11px]">
              <thead className="bg-blue-600 dark:bg-blue-800 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-1.5 py-1 text-left font-medium text-white uppercase tracking-wider whitespace-nowrap"
                        style={{ width: `${header.column.columnDef.size || 80}px` }}
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-blue-50 dark:hover:bg-blue-900/50 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-1.5 py-1 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={defaultColumns.length} className="px-2 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Compact Pagination */}
          {filteredTableData.length > 0 && (
            <div className="mt-3 flex flex-row justify-between items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                Showing{' '}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    filteredTableData.length
                  )}
                </span>{' '}
                of <span className="font-medium">{filteredTableData.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-2 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[10px]"
                >
                  Prev
                </button>
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[10px]">
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-2 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[10px]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
      {/* Save Confirmation Modal */}
      <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="md">
        <ModalHeader className="border-b bg-indigo-50 dark:bg-indigo-900 p-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {isFinalizeConfirm ? 'Finalize Confirmation' : 'Save Confirmation'}
          </h3>
        </ModalHeader>
        <ModalBody className="p-3 bg-white dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-center text-3xl text-blue-500 mb-2">
              <FaSave />
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
              {isFinalizeConfirm
                ? 'Are you sure you want to finalize the physical stock? This action cannot be undone.'
                : 'Are you sure you want to save the physical stock entries?'}
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center p-2">
          <Button
            color="success"
            size="xs"
            onClick={performSave}
            disabled={saving}
            className="px-3 py-1 text-xs font-bold"
          >
            {saving ? 'Saving...' : 'Confirm'}
          </Button>
          <Button
            color="gray"
            size="xs"
            onClick={() => setShowSaveConfirm(false)}
            disabled={saving}
            className="px-3 py-1 text-xs font-bold"
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
            background: '#1f2937',
            color: '#fff',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
          },
          success: { style: { background: '#059669' } },
          error: { style: { background: '#dc2626' } },
        }}
      />
    </>
  );
};
export default PhysicalStock;