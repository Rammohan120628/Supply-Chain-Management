import {
  Badge,
  Button,
  Tooltip,
  Card,
  Modal,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { HiRefresh, HiSearch, HiInformationCircle } from 'react-icons/hi';
import { FaSave, FaSort, FaSortUp, FaSortDown, FaCalendarAlt, FaBoxOpen, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import SessionModal from "../SessionModal";
import { Calendar } from "lucide-react";

export interface TableTypeDense {
  locationRequestHeaderPk: string;
  locationId: string;
  locationName: string;
  supplierId: string;
  supplierName: string;
  reqTransactionNo: string;
  directDelivery: boolean;
  deliveryModeHeader: number;
}

const columnHelper = createColumnHelper<TableTypeDense>();

const ChangetheDeliveryLocation = () => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<TableTypeDense[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Get current date and format for display and API
  const currentDate = new Date();
  const purchasePeriodString = localStorage.getItem("purchasePeriod");

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

  const parsePurchasePeriod = (periodString: string | null): Date => {
    if (!periodString) return new Date();
    try {
      const parts = periodString.split('-');
      if (parts.length !== 3) return new Date();
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } catch (error) {
      return new Date();
    }
  };

  const purchasePeriod = parsePurchasePeriod(purchasePeriodString);
  const requestPeriodAPI = `${purchasePeriod.getFullYear()}-${(purchasePeriod.getMonth() + 1).toString().padStart(2, '0')}-01`;
  const formattedPeriod = useMemo(() => {
    return formatPurchasePeriod(purchasePeriodString || '');
  }, [purchasePeriodString]);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSessionExpired(true);
        return;
      }
      const apiDate = `01-${(purchasePeriod.getMonth() + 1).toString().padStart(2, '0')}-${purchasePeriod.getFullYear()}`;

      const response = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/viewPeriodBasedLocationRequestProcess2/${apiDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();

      if (result.success && result.data) {
        const transformedData = result.data.map((item: any) => ({
          locationRequestHeaderPk: item.locationRequestHeaderPk || '',
          locationId: item.locationId || '',
          locationName: item.locationName || '',
          supplierId: item.supplierId || '',
          supplierName: item.supplierName || '',
          reqTransactionNo: item.reqTransactionNo || '',
          directDelivery: item.checkBox || false,
          deliveryModeHeader: item.deliveryModeHeader || 0
        }));

        setData(transformedData);
      } else {
        toast.error(result.message || 'Failed to load data');
      }
    } catch (error) {
      setSessionExpired(true);
    } finally {
      setLoading(false);
    }
  };

  // Save data to API
  const performSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSessionExpired(true);
        setSaving(false);
        return;
      }
      const savePayload = {
        period: formatPurchasePeriod(purchasePeriodString || ''),
        subList: data.map(item => ({
          headerId: item.locationRequestHeaderPk,
          locationId: item.locationId,
          locationName: item.locationName,
          deliveryModeHeader: item.directDelivery ? 1 : 0
        }))
      };
      const response = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/updateDeliveryLocationProcess2',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(savePayload),
        }
      );
      const result = await response.json();
      if (result.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (result.success) {
        toast.success('Data saved successfully!');
        fetchData(); // refresh the table
      } else {
        toast.error(result.message || 'Failed to save data.');
      }
    } catch (error: any) {
      setSessionExpired(true);
      toast.error(error?.message || 'Error saving data.');
    } finally {
      setSaving(false);
      setShowSaveConfirm(false);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (pk: string, checked: boolean) => {
    setData(prevData =>
      prevData.map(item =>
        item.locationRequestHeaderPk === pk
          ? { ...item, directDelivery: checked, deliveryModeHeader: checked ? 1 : 0 }
          : item
      )
    );
  };

  const handleRefresh = () => {
    setSearch('');
    fetchData();
  };

  const handleSave = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    if (data.length === 0) {
      toast.error("No items available.", { duration: 2000, position: 'top-right' });
      return;
    }
    setShowSaveConfirm(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search query - with null safety
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;

    const searchLower = search.toLowerCase();
    return data.filter(item => {
      const locationId = item.locationId ? item.locationId.toLowerCase() : '';
      const locationName = item.locationName ? item.locationName.toLowerCase() : '';
      const supplierId = item.supplierId ? item.supplierId.toLowerCase() : '';
      const supplierName = item.supplierName ? item.supplierName.toLowerCase() : '';
      const reqTransactionNo = item.reqTransactionNo ? item.reqTransactionNo.toLowerCase() : '';

      return (
        locationId.includes(searchLower) ||
        locationName.includes(searchLower) ||
        supplierId.includes(searchLower) ||
        supplierName.includes(searchLower) ||
        reqTransactionNo.includes(searchLower)
      );
    });
  }, [data, search]);

  // Reset to first page when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  const defaultColumns = useMemo(() => [
    columnHelper.display({
      id: "sno",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase tracking-wider">S.No</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center justify-center">
          <Badge
            color="gray"
            className="font-medium text-[10px] min-w-[28px] flex items-center justify-center"
          >
            {info.row.index + 1}
          </Badge>
        </div>
      ),
      sortingFn: 'alphanumeric',
    }),
    columnHelper.accessor("locationId", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase tracking-wider">Location Id</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => <p className="text-[10px] font-bold text-black dark:text-gray-400">{info.getValue() || '-'}</p>,
      sortingFn: 'alphanumeric',
    }),
    columnHelper.accessor("locationName", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase tracking-wider">Location Name</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => <p className="text-[10px] text-black font-bold dark:text-gray-400 truncate max-w-[180px]">{info.getValue() || '-'}</p>,
      sortingFn: 'alphanumeric',
    }),
    columnHelper.accessor("directDelivery", {
      header: ({ column }) => (
        <div
          className="flex items-center justify-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-medium text-white text-[10px] uppercase tracking-wider">Direct Delivery</span>
          {column.getIsSorted() === "asc" ? (
            <FaSortUp className="w-2 h-2 ml-0.5" />
          ) : column.getIsSorted() === "desc" ? (
            <FaSortDown className="w-2 h-2 ml-0.5" />
          ) : (
            <FaSort className="w-2 h-2 ml-0.5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center justify-center ml-9">
          <input
            type="checkbox"
            checked={info.getValue()}
            onChange={(e) => handleCheckboxChange(info.row.original.locationRequestHeaderPk, e.target.checked)}
            className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) ? 1 : 0;
        const b = rowB.getValue(columnId) ? 1 : 0;
        return a - b;
      },
    }),
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnVisibility,
      sorting,
      pagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const content = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
              Change Delivery Location-Location
            </h1>
            <Tooltip
              content={
                <div className="text-xs max-w-xs">
                  <p className="font-semibold mb-1">Quick Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Review locations for the period</li>
                    <li>Toggle Direct Delivery checkboxes</li>
                    <li>Click Save to confirm changes</li>
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
                onClick={handleSave}
                disabled={loading || saving}
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
                onClick={handleRefresh}
              >
                <HiRefresh className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Period Banner */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {formattedPeriod}
                </span>
                <Tooltip
                  content="Purchase period for which locations are managed"
                  placement="top"
                  className="dark:bg-gray-800 dark:text-white z-50"
                >
                  <HiInformationCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help ml-0.5" />
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                <FaBoxOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Fetched Locations
                {data.length > 0 && (
                  <Badge color="primary" className="ml-1 text-[9px] px-2 py-0.5">
                    {data.length}
                  </Badge>
                )}
              </h3>
              <div className="relative w-full lg:w-72">
                <HiSearch className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder={`Search ${data.length} records...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-[10px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-150"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700">
              <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-1.5 py-1 text-left text-[9px] font-semibold text-white uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors duration-150"
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-1.5 py-1 text-[10px]">
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
                            No locations fetched yet.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Compact Pagination - styled exactly like the reference */}
            {filteredData.length > 0 && (
              <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-1 px-0.5 text-[9px] text-gray-600 dark:text-gray-400">
                <div>
                  Showing{" "}
                  <span className="font-medium">
                    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      filteredData.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredData.length}</span> results
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[9px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                  >
                    <FaChevronLeft className="w-2 h-2" /> Prev
                  </button>
                  <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[9px] font-medium">
                    {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
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
    </div>
  );

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Loading...</span>
          </div>
        </div>
      )}

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

      <Modal show={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} size="sm">
        <ModalBody className="p-3 bg-white dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-center text-4xl text-blue-500 mb-3">
              <FaSave />
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to save these changes?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center p-1">
          <Button
            color="success"
            onClick={performSave}
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
    </>
  );
};

export default ChangetheDeliveryLocation;