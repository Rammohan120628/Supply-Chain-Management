import {
  Badge,
  Button,
  Tooltip,
  Card,
  Modal,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import { useState, useEffect, useMemo } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import axios from "axios";
import { FaSave, FaSort, FaSortUp, FaSortDown, FaCalendarAlt, FaBoxOpen, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiRefresh, HiViewList, HiSearch, HiInformationCircle } from "react-icons/hi";
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from 'src/context/AuthContext/AuthContext';
import SessionModal from "../SessionModal";
import ConsolidateQuotationReqTable from "./ConsildateTable";
import { useEntityFormatter } from "../Entity/UseEntityFormater";
import { Calendar } from "lucide-react";

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
  grandTotal?: number;
}

const columnHelper = createColumnHelper<TableTypeDense>();

const ConsolidationofQuotationRequest = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [showTable, setShowTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { ipAddress } = useAuth();
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [itemsSearch, setItemsSearch] = useState("");

  // Pagination for main table
  const [mainCurrentPage, setMainCurrentPage] = useState(1);
  const [mainPageSize, setMainPageSize] = useState(10);

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  const tenderPeriod = localStorage.getItem('tenderPeriod');

  const formatter = useEntityFormatter();

  const formattedPeriod = useMemo(() => {
    if (!tenderPeriod) return '';
    const [day, month, year] = tenderPeriod.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [tenderPeriod]);

  /* ────────────────────── FILTERS & PAGINATION ────────────────────── */
  const filteredSelectedItems = useMemo(
    () =>
      selectedItems.filter(
        (item) =>
          (item.itemName ?? "").toLowerCase().includes(itemsSearch.toLowerCase()) ||
          (item.itemId ?? "").toString().includes(itemsSearch) ||
          (item.packageId ?? "").toLowerCase().includes(itemsSearch.toLowerCase())
      ),
    [selectedItems, itemsSearch]
  );

  // Reset to first page when search changes
  useEffect(() => {
    setMainCurrentPage(1);
  }, [itemsSearch]);

  const paginatedItems = useMemo(() => {
    const start = (mainCurrentPage - 1) * mainPageSize;
    return filteredSelectedItems.slice(start, start + mainPageSize);
  }, [filteredSelectedItems, mainCurrentPage, mainPageSize]);

  const totalPages = Math.ceil(filteredSelectedItems.length / mainPageSize);

  const totalGrandTotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.grandTotal || 0), 0);
  }, [selectedItems]);

  /* ────────────────────── API CALLS ────────────────────── */
  const fetchData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/retrieveConsolidationOfLocationRequest/${tenderPeriod}`,
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
        const mappedItems = data.data.map((item: any) => ({
          itemId: item.itemId,
          itemName: item.itemName === "N/a" ? "N/A" : item.itemName,
          pname: item.itemName === "N/a" ? "N/A" : item.itemName,
          packageId: item.packageId,
          supplierId: item.supplierId || "N/A",
          grandTotal: item.grandTotal || 0,
        }));
        setSelectedItems(mappedItems);
        setMainCurrentPage(1); // reset pagination on new data
      } else {
      }
    } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ipAddress, tenderPeriod]);

  /* ────────────────────── HANDLERS ────────────────────── */
  const performSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!token) {
      setSessionExpired(true);
      setIsSaving(false);
      return;
    }
    if (!userId) {
      toast.error("User ID not found. Please log in again.", { duration: 2000, position: 'top-right' });
      setIsSaving(false);
      return;
    }
    if (!tenderPeriod || tenderPeriod.trim() === '') {
      setSessionExpired(true);
      setIsSaving(false);
      return;
    }
    const period = tenderPeriod 
      ? `${tenderPeriod.split('-')[2]}-${tenderPeriod.split('-')[1]}-${tenderPeriod.split('-')[0]}` as const
      : '' as const;

    const payload = {
      period,
      userFk: Number(userId),
      items: selectedItems
        .map((it) => ({
          itemId: it.itemId!,
          packageId: it.packageId!,
          grandTotal: Number(it.grandTotal!)
        })),
    };
    try {
      const { data } = await axios.post(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/saveConsolidationLocationRequest`,
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
        toast.success(data.message || "Saved successfully!", { duration: 2000, position: 'top-right' });
        setSelectedItems([]);
        setShowSaveConfirm(false);
        setMainCurrentPage(1);
      } else {
        toast.error(data.message || "Failed to save.", { duration: 2000, position: 'top-right' });
        setShowSaveConfirm(false);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setSessionExpired(true);
      } else if (err.response?.data?.message?.includes('rest exception')) {
        toast.error('Save operation failed due to invalid data. Please check the items and try again.', { duration: 2000, position: 'top-right' });
      } else {
        toast.error("Error saving data. Please try again.", { duration: 2000, position: 'top-right' });
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    if (!userId) {
      toast.error("User ID not found. Please log in again.", { duration: 2000, position: 'top-right' });
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("No items to save.", { duration: 2000, position: 'top-right' });
      return;
    }
    setShowSaveConfirm(true);
  };

  const refresh = () => {
    setSelectedItems([]);
    setItemsSearch("");
    setMainCurrentPage(1);
    fetchData();
  };

  const handleListClick = () => {
    setShowTable(true);
  };

  const handleBackFromTable = () => {
    setShowTable(false);
  };

  /* ────────────────────── TABLE DEFINITIONS (memoized) ────────────────────── */
  const defaultColumns = useMemo(
    () => [
    
      columnHelper.accessor("itemId", {
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
          <span className="font-bold text-black text-[10px] dark:text-white">
            {info.getValue()}
          </span>
        ),
        sortingFn: 'alphanumeric',
        size: 70,
      }),
      columnHelper.accessor("pname", {
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
          <span className="text-[10px] font-bold text-black dark:text-gray-300 max-w-[250px] block">
            {info.getValue()}
          </span>
        ),
        sortingFn: 'alphanumeric',
        size: 150,
      }),
      columnHelper.accessor("packageId", {
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
          <p
            className="font-bold text-black text-[10px] px-1.5 py-0.5 dark:bg-purple-700 dark:text-white"
          >
            {info.getValue()}
          </p>
        ),
        sortingFn: 'alphanumeric',
        size: 90,
      }),
      columnHelper.accessor("grandTotal", {
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
            onClick={() => column.toggleSorting()}
          >
            <span className="font-medium text-white text-[10px] uppercase">Grand Total</span>
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
          const value = info.getValue() || '0';
          const num = Number.parseFloat(value.toString());
          const formatted = isNaN(num) ? '0.00' : formatter.formatAmount(num);
          return (
            <div className="flex items-center justify-end text-right">
              <p
                className="font-bold text-black ml-10 text-[10px] py-0.5 dark:bg-green-700 dark:text-white"
              >
                {formatted}
              </p>
            </div>
          );
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = (rowA.getValue(columnId) as number) || 0;
          const b = (rowB.getValue(columnId) as number) || 0;
          return a - b;
        },
        size: 90,
      }),
    ],
    [mainCurrentPage, mainPageSize, formatter]
  );

  const table = useReactTable({
    data: paginatedItems,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => row.itemId?.toString() ?? "",
  });

  /* ────────────────────── RENDER ────────────────────── */
  if (showTable) {
    return <ConsolidateQuotationReqTable onBack={handleBackFromTable} />;
  }

  return (
    <>
      {/* Global loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Loading...</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3"> 
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
                Consolidation Of Location Request
              </h1>
              {/* User manual tooltip - updated styling */}
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
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
                  <HiInformationCircle className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Tooltip
                content="Save consolidation"
                placement="bottom"
                className="dark:bg-gray-800 dark:text-white z-50"
              >
                <Button
                  color="success"
                  size="xs"
                  className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-110"
                  onClick={handleSave}
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
                content="Refresh data"
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
                content="View consolidation list"
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

          {/* Main Card */}
          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Top Section: Period */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {formattedPeriod}
                    </span>
                    {/* Period info tooltip - updated styling */}
                    <Tooltip
                      content="Tender Period for which the consolidation request is being created"
                      placement="top"
                      className="dark:bg-gray-800 dark:text-white z-50"
                    >
                      <HiInformationCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help ml-0.5" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Items Table Section */}
            <div className="p-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <FaBoxOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Items
                  {selectedItems.length > 0 && (
                    <p color="primary" className="ml-1 text-[9px] px-3 py-1">
                      {selectedItems.length}
                    </p>
                  )}
                </h3>
                <div className="relative w-full lg:w-48">
                  <HiSearch className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemsSearch}
                    onChange={(e) => setItemsSearch(e.target.value)}
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
                              No items fetched yet.
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
                      {mainCurrentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setMainCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={mainCurrentPage >= totalPages}
                      className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[9px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    >
                      Next <FaChevronRight className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

        {/* Save Confirmation Modal */}
        <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="sm">
          <ModalBody className="p-3 bg-white dark:bg-gray-800">
            <div className="space-y-3">
              <div className="flex items-center justify-center text-4xl text-blue-500 mb-3">
                <FaSave />
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
                Are you sure you want to save this consolidation?
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center p-1">
            <Button
              color="success"
              onClick={performSave}
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

        {/* Toast Container */}
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

export default ConsolidationofQuotationRequest;