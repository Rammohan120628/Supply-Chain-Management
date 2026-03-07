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
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
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
  FaChevronDown,
  FaBoxes,
  FaMapPin,
} from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import axios from "axios";
import _ from "lodash";
import toast, { Toaster } from "react-hot-toast";
import BulkUploadTable from "./BulkUploadTable";
import SessionModal from "../SessionModal";
import { Calendar, FilePlus, RefreshCcw, X } from "lucide-react";
import user1 from '/src/assets/images/profile/user-1.jpg';


export interface TableTypeDense {
  avatar?: any;
  name?: string;
  post?: string;
  pname?: string;
  teams: { id: string; color: string; text: string }[];
  status?: string;
  statuscolor?: string;
  budget?: string;
  originalData?: UploadedItem;
}
export interface UploadedItem {
  itemId: number;
  itemName: string;
  packageId: string;
  qty: number;
  requestDateStr: string;
  supplierId?: string;
}
const columnHelper = createColumnHelper<TableTypeDense>();
const LocationRequestBulkUpload = () => {
  const [locationName, setLocationName] = useState("");
  const [, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [mainCurrentPage, setMainCurrentPage] = useState(1);
  const mainPageSize = 10;
  const purchasePeriod = localStorage.getItem("purchasePeriod");
  const entity = localStorage.getItem("entity") || "";
  const getDecimalPlaces = (): number => {
    return parseInt(localStorage.getItem("decimalToQty") || "5");
  };
  const formatQuantity = (value: number | string): string => {
    const decimalPlaces = getDecimalPlaces();
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? "0.0" : numValue.toFixed(decimalPlaces);
  };
  const formatDateAccordingToSettings = (dateStr: string): string => {
    if (!dateStr || dateStr === "N/A") return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const dateFormat = localStorage.getItem("dateFormat") || 'yyyy-MM-dd';
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return dateFormat
        .replace(/dd/g, day)
        .replace(/MM/g, month)
        .replace(/yyyy/g, year);
    } catch {
      return dateStr;
    }
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
    } catch {
      return periodString;
    }
  };
  const [data, setData] = useState<TableTypeDense[]>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
        if (data.success) {
          setLocations(data.data);
        } else {
          toast.error(data.message || "Failed to fetch locations.");
        }
      } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);
  useEffect(() => {
    if (uploadedData.length > 0) {
      const newData = uploadedData.map((item, index) => ({
        avatar: user1,
        name: item.itemId.toString(),
        post: item.itemName,
        pname: item.requestDateStr || "N/A",
        teams: [
          {
            id: (index + 1).toString(),
            color: "primary",
            text: item.packageId || "N/A",
          },
        ],
        status: item.qty.toString(),
        statuscolor: "success",
        budget: "0.0",
        originalData: item,
      }));
      setData(newData);
    } else {
      setData([]);
    }
  }, [uploadedData]);
  const handleRefresh = () => {
    setSelectedLocation("");
    setLocationName("");
    setSearch("");
    setCurrentPage(1);
    setIsOpen(false);
    setSelectedFile(null);
    setUploadedData([]);
    setGlobalFilter("");
    const fileInput = document.getElementById("fileUpload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };
  const locationOptions = useMemo(() => {
    const selectOption = {
      locationId: "Select location",
      pk: "select-location",
    };
    return [selectOption, ...locations];
  }, [locations]);
  const filteredOptions = useMemo(
    () => locationOptions.filter((loc) =>
      loc.locationId.toLowerCase().includes(search.toLowerCase())
    ),
    [locationOptions, search]
  );
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) handleFileUpload(file);
  };
  const handleFileUpload = async (file: File) => {
    if (!selectedLocation) {
      toast.error("Please select a location first.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    setIsUploading(true);
    setIsLoading(true);
    try {
      const requestPeriod = formatDateToYMD(purchasePeriod || "");
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/uploadExcel/${requestPeriod}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (response.data.success) {
        setUploadedData(response.data.data || []);
        toast.success("File uploaded successfully!");
      } else {
        toast.error(response.data.message || "Upload failed.");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setSessionExpired(true);
      }
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };
  const handleBulkUploadClick = () => {
    if (!selectedLocation) {
      toast.error("Please select a location first.");
      return;
    }
    const fileInput = document.getElementById("fileUpload") as HTMLInputElement | null;
    fileInput?.click();
  };
  const fetchItems = async (locationId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/getItems?locationId=${locationId}`,
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
        console.log("Items fetched:", data.data);
      } else {
        toast.error(data.message || "Failed to fetch items.");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) setSessionExpired(true);
      console.error(err);
    }
  };
  const handleSelect = (loc: any) => {
    if (loc.pk === "select-location") {
      setSelectedLocation("");
      setLocationName("");
      setUploadedData([]);
      setData([]);
      setCurrentPage(1);
    } else {
      setSelectedLocation(loc.locationId);
      setLocationName(loc.locationName);
      setCurrentPage(1);
      fetchItems(loc.locationId);
    }
    setIsOpen(false);
    setSearch("");
  };
const handleQtyInputChange = (index: number, rawValue: string) => {
    // Allow only numbers and one decimal point
    let cleaned = rawValue.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit integer part to 5 digits
    const intPart = parts[0] || "";
    if (intPart.length > 5) {
      cleaned = intPart.slice(0, 5) + (parts[1] ? "." + parts[1] : "");
    }

    // Limit decimal places to configured value (max 5)
    const decimalLimit = Math.min(getDecimalPlaces(), 5);
    if (parts[1] && parts[1].length > decimalLimit) {
      cleaned = parts[0] + "." + parts[1].slice(0, decimalLimit);
    }

    setData(prevData => {
      const newData = [...prevData];
      if (newData[index]) {
        newData[index] = {
          ...newData[index],
          status: cleaned,
          originalData: {
            ...newData[index].originalData!,
            qty: parseFloat(cleaned) || 0
          }
        };
      }
      return newData;
    });
  };

  const handlePreSave = () => {
    if (!selectedLocation) {
      toast.error("Please select a location first.");
      return;
    }
    if (data.length === 0) {
      toast.error("No data to save. Please upload a file first.");
      return;
    }
    setShowSaveConfirm(true);
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
  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      setIsSaving(false);
      setIsLoading(false);
      return;
    }
    const userId = localStorage.getItem("userId");
    try {
      const period = formatDateToYMD(purchasePeriod || "");
      const subList = data.map(item => {
        const originalData = item.originalData!;
        return {
          itemId: originalData?.itemId || parseInt(item.name || "0"),
          packageId: originalData?.packageId || item.teams[0]?.text || "",
          supplierId: originalData?.supplierId || "SUP001",
          entOrder: 0,
          qty: parseInt(item.status || "0"),
          requestDate: purchasePeriod ? formatDateToYMD(purchasePeriod) : new Date().toISOString().split('T')[0],
        };
      });
      const saveData = {
        locationId: selectedLocation,
        entityId: "OM01",
        period: period,
        userFk: userId,
        subList: subList
      };
      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/saveLocationRequestProcessBulkUpload",
        saveData,
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
      if (response.data.success) {
        toast.success("Data saved successfully!");
        handleRefresh(); // optional: clear after save
      } else {
        toast.error(`Save failed: ${response.data.message || "Unknown error"}`);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setSessionExpired(true);
      }
      console.error("Save error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error saving data.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };
  const defaultColumns = React.useMemo(() => [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Item ID</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => (
        <p className="font-medium text-[11px] text-black dark:text-white">
          {info.getValue()}
        </p>
      ),
      sortingFn: "alphanumeric",
      size: 80,
    }),
    columnHelper.accessor("post", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Item Name</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => (
        <p className="font-medium text-[11px] text-black dark:text-white max-w-[200px]" title={info.getValue()}>
          {info.getValue()}
        </p>
      ),
      sortingFn: "alphanumeric",
      size: 200,
    }),
    columnHelper.accessor("pname", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Request Date</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => {
        const value = info.getValue() || '';
        const formattedDate = formatDateAccordingToSettings(value);
        return (
          <Badge color="blue" className="text-[10px] font-medium dark:bg-blue-900 dark:text-blue-100">
            {formattedDate}
          </Badge>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
      size: 100,
    }),
    columnHelper.accessor("teams", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Package Id</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => (
        <div className="flex">
          {info.getValue().map((team) => (
            <Badge key={team.id} color="purple" className="text-[10px] font-mono dark:bg-purple-900 dark:text-purple-100">
              {team.text}
            </Badge>
          ))}
        </div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const packageA = rowA.getValue(columnId)[0]?.text || '';
        const packageB = rowB.getValue(columnId)[0]?.text || '';
        return packageA.localeCompare(packageB);
      },
      size: 100,
    }),
columnHelper.accessor("status", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase">QTY</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5 dark:text-white" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => {
        const currentValue = info.row.original.status;
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleQtyInputChange(info.row.index, e.target.value)}
            className="w-20 px-1 py-0.5 ml-5 border text-right border-gray-300 dark:border-gray-600 rounded text-[10px] font-medium dark:bg-gray-700 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const qtyA = parseFloat(rowA.getValue(columnId)) || 0;
        const qtyB = parseFloat(rowB.getValue(columnId)) || 0;
        return qtyA - qtyB;
      },
      size: 80,
    }),
  ], []);
  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnVisibility,
      globalFilter,
      columnFilters,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
  });
  const totalQty = useMemo(() => {
    return data.reduce((sum, item) => sum + (parseFloat(item.status || "0")), 0);
  }, [data]);
  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
  };
  let content;
  if (showTable) {
    content = <BulkUploadTable onBack={() => setShowTable(false)} />;
  } else {
    content = (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
                Location Request Bulk Upload
              </h1>
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select a location from dropdown</li>
                      <li>Upload Excel file</li>
                      <li>Edit quantities if needed</li>
                      <li>Click save and confirm</li>
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
              <Tooltip
                content="View request list"
                placement="bottom"
                className="dark:bg-gray-800 dark:text-white z-50"
              >
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
          </div>
          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                      content="Purchase Period for bulk upload"
                      placement="top"
                      className="dark:bg-gray-800 dark:text-white z-50"
                    >
                      <HiInformationCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help ml-0.5" />
                    </Tooltip>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
                      className="gap-1 px-3 py-3 text-[10px] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-xs transition-all duration-200 hover:scale-105"
                      color="primary"
                      onClick={handleBulkUploadClick}
                      disabled={isUploading || !selectedLocation}
                    >
                      <FilePlus className="w-4 h-4" />
                    </Button>
                    <input
                      id="fileUpload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading || !selectedLocation}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <FaBoxOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Uploaded Items ({data.length} records)
                </h3>
                <div className="relative w-full lg:w-48">
                  <HiSearch className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-[10px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-150"
                  />
                </div>
              </div>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-[300px]">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="px-1.5 py-1 text-left text-[9px] font-semibold text-white uppercase tracking-wider"
                            style={{ width: `${header.column.columnDef.size}px` }}
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
                          {row.getVisibleCells().map(cell => (
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
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-0.5">No Data Available</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-[9px] max-w-md">
                              Upload a file to view and edit data.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {data.length > 0 && (
                <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-1 px-0.5 text-[9px] text-gray-600 dark:text-gray-400">
                  <div>
                    Showing{" "}
                    {Math.min(
                      (mainCurrentPage - 1) * mainPageSize + 1,
                      data.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      mainCurrentPage * mainPageSize,
                      data.length
                    )}{" "}
                    of {data.length} items
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() =>
                          setMainCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={mainCurrentPage === 1}
                        className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[9px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                      >
                        <FaChevronLeft className="w-2 h-2" /> Prev
                      </button>
                      <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[9px] font-medium">
                        {mainCurrentPage} / {Math.ceil(data.length / mainPageSize)}
                      </span>
                      <button
                        onClick={() =>
                          setMainCurrentPage((p) =>
                            Math.min(Math.ceil(data.length / mainPageSize), p + 1)
                          )
                        }
                        disabled={mainCurrentPage >= Math.ceil(data.length / mainPageSize)}
                        className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[9px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                      >
                        Next <FaChevronRight className="w-2 h-2" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
      </div>
    );
  }
  return (
    <>
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
      {content}
      {sessionExpired && <SessionModal />}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Loading...</span>
          </div>
        </div>
      )}
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
            onClick={handleConfirmSave}
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
export default LocationRequestBulkUpload;  