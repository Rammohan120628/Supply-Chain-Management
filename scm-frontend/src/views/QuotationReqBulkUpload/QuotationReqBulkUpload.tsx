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
import QuotationReqBulkTable from "./QuotationReqBulkTable";
import SessionModal from "../SessionModal";
import { Calendar, FilePlus, RefreshCcw, X } from "lucide-react";

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
  originalData?: UploadedItem; // Store original uploaded data
}

// Interface for API response data
export interface UploadedItem {
  itemId: number;
  itemName: string;
  packageId: string;
  qty: number;
  requestDateStr: string;
  supplierId?: string; // Add supplierId from API
  // Add other fields you want to display
}

import user1 from '/src/assets/images/profile/user-1.jpg';
import { useEntityFormatter } from "../Entity/UseEntityFormater";

const columnHelper = createColumnHelper<TableTypeDense>();

const QuotataionRequestBulkkUpload = () => {
  const formatter = useEntityFormatter(); // ✅ get formatter
  const [locationName, setLocationName] = useState("");
  const [, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [, setSelectedFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [mainCurrentPage, setMainCurrentPage] = useState(1);
  const mainPageSize = 10;

  const tenderPeriodStr = localStorage.getItem("tenderPeriod");
  const entity = localStorage.getItem("entity") || "";
  let periodDate: Date;
  let requestPeriod: string;
  let periodYear: number;
  let periodMonth: number;
  let periodDay: number;
  if (tenderPeriodStr) {
    const [day, month, year] = tenderPeriodStr.split('-').map(Number);
    periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    periodYear = year;
    periodMonth = month;
    periodDay = day;
  } else {
    const currentDate = new Date();
    periodDate = currentDate;
    requestPeriod = currentDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    periodYear = currentDate.getFullYear();
    periodMonth = currentDate.getMonth() + 1;
    periodDay = 1;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!tenderPeriodStr) {
      toast.error("Tender period not found in localStorage.");
    }
  }, [tenderPeriodStr]);

  const handleRefresh = () => {
    setSelectedLocation("");
    setLocationName("");
    setSearch("");
    setCurrentPage(1);
    setIsOpen(false);
    setSelectedFile(null);
    setUploadedData([]);
    const fileInput = document.getElementById("fileUpload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Add "Select location" option at the top of dropdown
  const locationOptions = useMemo(() => {
    const selectOption = {
      locationId: "Select location",
      pk: "select-location",
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    console.log("Selected file:", file);

    // Auto-upload when file is selected
    if (file) {
      handleFileUpload(file);
    }
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
      // Format date as YYYY-MM-DD based on tenderPeriodStr or current
      let apiPeriod: string;
      if (tenderPeriodStr) {
        apiPeriod = `${periodYear}-${String(periodMonth).padStart(2, '0')}-${String(periodDay).padStart(2, '0')}`;
      } else {
        apiPeriod = new Date().toISOString().split('T')[0];
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/uploadExcelByQuotationRequest/${apiPeriod}`,
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
        console.log("Upload successful:", response.data);
        setUploadedData(response.data.data || []);
      } else {
        toast.error(response.data.message || "Upload failed.");
      }
    } catch (err: any) {
    if (err?.response?.status === 401) {
        setSessionExpired(true);
    } else {
        toast.error(err.response?.data?.message || "Error uploading file. Please try again.");
    }
    console.error(err);
} finally {
    setIsUploading(false);
    setIsLoading(false);
}
  };

  // Trigger file input click programmatically
  const handleBulkUploadClick = () => {
    if (!selectedLocation) {
      toast.error("Please select a location first.");
      return;
    }
    const fileInput = document.getElementById("fileUpload") as HTMLInputElement | null;
    fileInput?.click();
  };

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

      const dateFormat = localStorage.getItem("dateFormat") || 'dd-MM-yyyy';
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

  const fetchItems = async (locationId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/getItems?locationId=${locationId}`,
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
      }
  } catch (err: any) {
    if (err?.response?.status === 401) {
        setSessionExpired(true);
    } else {
    }
    console.error(err);
} finally {
    setIsLoading(false);
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

  const [data, setData] = useState<TableTypeDense[]>([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setSessionExpired(true);
        return;
      }
      try {
        const { data } = await axios.get(
          "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/dropDownLocation",
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
  }, []);

  // Update table data when uploadedData changes
  useEffect(() => {
    if (uploadedData.length > 0) {
      const newData = uploadedData.map((item, index) => ({
        avatar: user1,
        name: item.itemId.toString(),
        post: item.itemName, // Use actual item name
        pname: item.requestDateStr || "N/A",
        teams: [
          {
            id: (index + 1).toString(),
            color: "primary",
            text: item.packageId || "N/A", // Use actual package ID
          },
        ],
        status: item.qty.toString(),
        statuscolor: "success",
        budget: "0.0",
        originalData: item, // Store original data for saving
      }));
      setData(newData);
    } else {
      setData([]);
    }
  }, [uploadedData]);

  // Handle QTY input change with validation (max 5 digits before decimal, max 5 decimal places)
  const handleQtyInputChange = (index: number, rawValue: string) => {
    // Allow only numbers and decimal point
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
    // Limit decimal places to configured max (from localStorage, capped at 5)
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

  // Calculate total quantity
  const totalQty = useMemo(() => {
    return data.reduce((sum, item) => sum + (parseFloat(item.status || "0")), 0);
  }, [data]);

  // Save functionality
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
      const subList: any[] = [];
      let commonYear: number | null = null;
      let commonMonth: number | null = null;

      data.forEach((item, index) => {
        const original = item.originalData!;
        const dateStr = original.requestDateStr;

        if (!dateStr || dateStr === "N/A") {
          throw new Error(`Missing or invalid requestDateStr for item ${original.itemName}`);
        }

        const parts = dateStr.split('-');
        if (parts.length !== 3) {
          throw new Error(`Invalid date format: ${dateStr}`);
        }

        const d = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        const y = parseInt(parts[2]);

        if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 31) {
          throw new Error(`Invalid date: ${dateStr}`);
        }

        if (commonYear === null) {
          commonYear = y;
          commonMonth = m;
        } else if (y !== commonYear || m !== commonMonth) {
          throw new Error("All request dates must be in the same month and year.");
        }

        if (y !== periodYear || m !== periodMonth) {
          throw new Error("Request date not in tender period.");
        }

        const qty = parseFloat(item.status || "0");
        const requestDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        subList.push({
          itemId: original.itemId,
          packageId: original.packageId,
          entOrder: index + 1,
          supplierId: original.supplierId || "N/A",
          requestDate: requestDate,
          qty: qty
        });
      });

      if (commonYear === null || commonMonth === null) {
        throw new Error("No valid items to save.");
      }

      const period = `${commonYear}-${String(commonMonth).padStart(2, '0')}-01`;

      const saveData = {
        locationId: selectedLocation,
        entityId: entity,
        userFk: Number(userId),
        period: period,
        subList: subList
      };

      console.log("Saving data:", JSON.stringify(saveData, null, 2));

      const response = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/saveQuotationRequestBulUpload",
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
        console.log("Save successful:", response.data);
        toast.success('Data saved successfully!', {
          duration: 2000,
          position: 'top-right',
        });
        setTimeout(() => {
          handleRefresh();
        }, 2000);
      } else {
        const errorMsg = response.data.message || "Save failed.";
        toast.error(`Save failed: ${errorMsg}`, {
          duration: 2000,
          position: 'top-right',
        });
      }
    } catch (error: any) {
    console.error("Save error:", error);
    if (error.response?.status === 401) {
        setSessionExpired(true);
    } else {
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.error ||
                             error.message ||
                             "Error saving data. Please try again.";
        toast.error(`Error: ${errorMessage}`);
    }
} finally {
    setIsSaving(false);
    setIsLoading(false);
}
  };

  const defaultColumns = useMemo(() => [
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
        <p className="font-medium text-[11px] text-black dark:text-white truncate max-w-[120px]" title={info.getValue()}>
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
          <span className="font-medium text-white text-[10px] uppercase">Package ID</span>
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
            <div key={team.id}>
              <Badge color="purple" className="text-[10px] font-mono dark:bg-purple-900 dark:text-purple-100">
                {team.text}
              </Badge>
            </div>
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
        const currentValue = info.row.original.status || "0";
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
    data: data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
  };

  let content;
  if (showTable) {
    content = <QuotationReqBulkTable />;
  } else {
    content = (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header */}
          
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">   
                     <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
                Quotation Request Bulk Upload
              </h1>
              {/* User manual tooltip - updated styling */}
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
                content="Save quotation request"
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
                content="View quotation list"
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

          {/* Location Selector */}
<Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
                      content="Tender Period for bulk upload"
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
                        <div className={`p-1 rounded-full ${selectedLocation ? 'bg-red-100 dark:bg-red-300' : 'bg-red-100 dark:bg-red-300'}`}>
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
            {/* Uploaded Items Table */}
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
                              No Data Available
                            </h4>
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
              {/* Pagination Controls */}
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
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">
              Loading...
            </span>
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
              Are you sure you want to save this bulk quotation request?
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
      {/* Custom animations */}
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

export default QuotataionRequestBulkkUpload;