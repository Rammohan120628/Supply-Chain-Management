import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Badge, Button, Tooltip } from 'flowbite-react';
import React, { useState, useEffect, useMemo } from 'react';
import {
  HiPlus,
  HiX,
} from 'react-icons/hi';
import { SquarePen, CircleCheckBig, Search, Database, Package } from 'lucide-react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Toastify, { showToast } from '../Toastify';
import SessionModal from 'src/views/SessionModal';

// ---------- Floating Input Component (with error display) ----------
interface FloatingInputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type = 'text', value, onChange, onBlur,
  label, required = false, error, readOnly = false
}) => {
  return (
    <div className="relative mt-2">
      <input
        id={id}
        name={name}
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={readOnly}
        className={`peer w-full px-3 py-2 border rounded-md 
                   dark:bg-gray-700 dark:text-white
                   focus:outline-none focus:border-blue-500
                   ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                   ${readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
        required={required}
        minLength={4}
        maxLength={15}
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-2 text-gray-600 dark:text-gray-300 
                   transition-all duration-200 pointer-events-none
                   peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs 
                   peer-focus:bg-white dark:peer-focus:bg-gray-700
                   peer-focus:px-1 peer-focus:text-blue-600
                   peer-[:not(:placeholder-shown)]:-top-2 
                   peer-[:not(:placeholder-shown)]:left-2
                   peer-[:not(:placeholder-shown)]:text-xs
                   peer-[:not(:placeholder-shown)]:bg-white 
                   dark:peer-[:not(:placeholder-shown)]:bg-gray-700
                   peer-[:not(:placeholder-shown)]:px-1"
      >
        {label} {required && <sup className="text-red-500 text-sm">*</sup>}
      </label>
    </div>
  );
};

// ---------- Confirm Modal (exact design from VATCategory) ----------
interface ConfirmModalProps {
  isOpen: boolean;
  confirmType: 'add' | 'edit' | 'status' | 'download';
  targetId?: string | number | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  confirmType,
  targetId,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (confirmType) {
      case 'add': return 'Confirm Save';
      case 'edit': return 'Confirm Modify';
      case 'status': return 'Confirm Change Status';
      case 'download': return 'Confirm Download';
      default: return 'Confirm Action';
    }
  };

  const getMessage = () => {
    switch (confirmType) {
      case 'add':
        return 'Are you sure you want to save this new item origin?';
      case 'edit':
        return `Are you sure you want to modify this item origin?${targetId ? ` (ID: ${targetId})` : ''}`;
      case 'status':
        return `Are you sure you want to change the status of ${targetId ? `item #${targetId}` : 'this item'}?`;
      case 'download':
        return 'Are you sure you want to download the report?';
      default:
        return 'Are you sure you want to perform this action?';
    }
  };

  const isStatus = confirmType === 'status';
  const gradient = isStatus
    ? 'from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900'
    : 'from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900';

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
            <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
            {getTitle()}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            {getMessage()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r ${gradient} focus:ring-blue-500 dark:focus:ring-offset-gray-900`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
interface ItemOriginData {
  id: number;
  itemOriginPk: number;
  itemOriginName: string;
  status: 'Active' | 'In-Active';
  statusColor: 'success' | 'failure' | string;
  createdBy?: number;
  createdDate?: string;
  lastActBy?: number;
  lastActDate?: string;
  entityId?: string;
}

interface ItemOriginTableProps {
  onAddNew?: () => void;
}

const ItemOriginList: React.FC<ItemOriginTableProps> = ({ onAddNew }) => {
  const [data, setData] = useState<ItemOriginData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<ItemOriginData | null>(null);
  const [editOriginName, setEditOriginName] = useState('');
  const [editStatus, setEditStatus] = useState<ItemOriginData['status']>('Active');
  const [editError, setEditError] = useState('');
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Confirm modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [targetName, setTargetName] = useState<string>('');

  const baseUrl =
    'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController';
  const columnHelper = createColumnHelper<ItemOriginData>();

  // ========== API Calls ==========
  const fetchData = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowSessionExpired(true);
      setIsGlobalLoading(false);
      return;
    }
    setIsGlobalLoading(true);
    try {
      const response = await fetch(`${baseUrl}/listMstItemOrigin`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error('Failed to fetch item origins');
      }
      const result = await response.json();
      if (result.success) {
        const mappedData = result.data.map((item: any) => ({
          ...item,
          id: item.itemOriginPk,
          statusColor: item.status === 'Active' ? 'success' : 'failure',
        }));
        setData(mappedData);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      showToast((error as Error).message, 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ========== Open Edit Modal ==========
  const openEdit = async (item: ItemOriginData) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowSessionExpired(true);
      return;
    }
    setIsGlobalLoading(true);
    try {
      const response = await fetch(`${baseUrl}/viewMstItemOrigin/${item.itemOriginPk}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error('Failed to fetch item details');
      }
      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to fetch item details');
      }
      const fetchedItem = responseData.data;
      setEditItem(fetchedItem);
      setEditOriginName(fetchedItem.itemOriginName || '');
      setEditStatus(fetchedItem.status || 'Active');
      setEditError('');
      setShowEditModal(true);
    } catch (error) {
      showToast((error as Error).message, 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditItem(null);
    setEditOriginName('');
    setEditStatus('Active');
    setEditError('');
  };

  const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditOriginName(value);
    const trimmed = value.trim();
    if (trimmed) {
      if (trimmed.length < 4 || trimmed.length > 15) {
        setEditError('Item origin Name must be between 4 and 15 characters.');
      } else {
        setEditError('');
      }
    } else {
      setEditError('');
    }
  };

  // ========== Status Change from Table Toggle ==========
  const handleStatusToggle = (item: ItemOriginData) => {
    setTargetId(item.itemOriginPk);
    setTargetName(item.itemOriginName);
    setConfirmType('status');
    setConfirmAction(() => () => toggleItemStatus(item.itemOriginPk, item.status === 'Active' ? 'In-Active' : 'Active'));
    setShowConfirm(true);
  };

  const toggleItemStatus = async (id: number, newStatus: string) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowSessionExpired(true);
      return;
    }
    setIsGlobalLoading(true);
    const body = {
      itemOriginPk: id,
      status: newStatus,
    };
    try {
      const response = await fetch(`${baseUrl}/mstItemOriginStatusUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error(result.message || 'Failed to update status');
      }
      const newColor = newStatus === 'Active' ? 'success' : 'failure';
      setData((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, status: newStatus as 'Active' | 'In-Active', statusColor: newColor }
            : it
        )
      );
      // If the edited item is currently open, update its status there as well
      if (editItem && editItem.itemOriginPk === id) {
        setEditItem((prev) => prev ? { ...prev, status: newStatus as 'Active' | 'In-Active' } : prev);
        setEditStatus(newStatus as 'Active' | 'In-Active');
      }
      showToast(`Status updated to ${newStatus} successfully`, 'success');
    } catch (error) {
      showToast((error as Error).message, 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  // ========== Modify Confirmation ==========
  const handleModifyClick = () => {
    const trimmedName = editOriginName.trim();
    if (!trimmedName || trimmedName.length < 4 || trimmedName.length > 15) {
      showToast('Item origin Name must be between 4 and 15 characters.', 'error');
      return;
    }
    if (!editItem) return;
    setConfirmType('edit');
    setTargetId(editItem.itemOriginPk);
    setConfirmAction(() => performUpdate);
    setShowConfirm(true);
  };

  const performUpdate = async () => {
    const trimmedName = editOriginName.trim();
    if (!editItem) return;
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const entity = localStorage.getItem('entity');
    if (!authToken || !userId || !entity) {
      setShowSessionExpired(true);
      return;
    }
    setIsGlobalLoading(true);
    const body = {
      ...editItem,
      itemOriginName: trimmedName,
      status: editStatus,
      lastActBy: parseInt(userId),
      entityId: entity,
    };
    try {
      const response = await fetch(`${baseUrl}/modifyMstItemOrigin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error(result.message || 'Failed to update item origin');
      }
      const newColor = editStatus === 'Active' ? 'success' : 'failure';
      setData((prev) =>
        prev.map((it) =>
          it.id === editItem.itemOriginPk
            ? { ...it, itemOriginName: trimmedName, status: editStatus, statusColor: newColor }
            : it
        )
      );
      showToast('Item origin updated successfully.', 'success');
      closeEdit();
    } catch (error) {
      showToast((error as Error).message, 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  // ========== Table Filtering & Pagination ==========
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Column definitions (with S.No, Name, Status, Change Status, Modify)
  const columns = [
    columnHelper.display({
      id: 'serialNo',
      header: () => <span>S.No</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
      enableSorting: false,
    }),
    columnHelper.accessor('itemOriginName', {
      header: () => <span>Item Origin Name</span>,
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: (info) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            info.getValue() === 'Active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'changeStatus',
      header: () => <span>Change Status</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        const isActive = status === 'Active';
        return (
          <div className="flex justify-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isActive}
                onChange={() => handleStatusToggle(row.original)}
              />
              <div
                className="
                  relative w-11 h-6 bg-gray-300 dark:bg-gray-600 
                  peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                  rounded-full transition-colors duration-300
                  peer-checked:bg-blue-500
                  after:content-['✕']
                  peer-checked:after:content-['✓']
                  after:absolute after:top-[2px] after:left-[2px]
                  after:flex after:items-center after:justify-center
                  after:text-[10px] after:font-bold
                  after:text-gray-700 dark:after:text-gray-200
                  after:bg-white after:rounded-full
                  after:h-5 after:w-5
                  after:transition-all after:duration-300
                  peer-checked:after:translate-x-5
                "
              ></div>
            </label>
          </div>
        );
      },
      enableSorting: false,
    }),
    columnHelper.display({
      id: 'modify',
      header: () => <span>Modify</span>,
      cell: ({ row }) => (
        <button
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
          onClick={() => openEdit(row.original)}
        >
          <SquarePen size={16} />
        </button>
      ),
      enableSorting: false,
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
    manualPagination: false,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filteredData.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);
  const pageCount = table.getPageCount();

  const handlePrevPage = () => pageIndex > 0 && table.setPageIndex(pageIndex - 1);
  const handleNextPage = () => pageIndex < pageCount - 1 && table.setPageIndex(pageIndex + 1);

  // Column widths for uniform table
  const columnWidths: Record<string, string> = {
    serialNo: '60px',
    itemOriginName: '300px',
    status: '120px',
    changeStatus: '120px',
    modify: '90px',
  };

  return (
    <>
      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-h-screen w-full mx-auto p-4 sm:p-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Header with title and add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-2">
          <h1 className="text-xl flex items-center gap-2 text-indigo-700 dark:text-indigo-400 sm:mb-0">
            <Package className="h-6 w-6 text-indigo-700 dark:text-indigo-400" /> Item Origin List
          </h1>
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <Tooltip content="Add">
              <button
                onClick={onAddNew}
                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition shadow-md hover:shadow-lg"
              >
                <HiPlus size={18} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Search bar below header */}
        <div className="flex w-full mb-2 items-end justify-end">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={`Search ${total} records...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Uniform Table UI */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
            <div className="min-w-[1000px] lg:min-w-full">
              <div className="overflow-auto max-h-[390px] relative">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                  <thead className="sticky top-0 z-2 h-8">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="bg-blue-600 dark:bg-blue-700">
                        {headerGroup.headers.map((header) => {
                          const width = columnWidths[header.id] || 'auto';
                          return (
                            <th
                              key={header.id}
                              className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                              style={{ width }}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className="flex items-center gap-1">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <span>
                                  {header.column.getIsSorted() === 'asc'
                                    ? ' 🔼'
                                    : header.column.getIsSorted() === 'desc'
                                    ? ' 🔽'
                                    : ' ↕️'}
                                </span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                        >
                          {row.getVisibleCells().map((cell) => {
                            const width = columnWidths[cell.column.id] || 'auto';
                            return (
                              <td
                                key={cell.id}
                                className="px-1.5 py-1 align-top"
                                style={{ width }}
                              >
                                <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <Database className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                            <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                              {searchTerm ? 'No matching records found' : 'No records found'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Pagination */}
        {total > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
            <div>
              Showing <span className="font-medium">{start}</span> to{' '}
              <span className="font-medium">{end}</span> of{' '}
              <span className="font-medium">{total}</span> records
              {searchTerm && (
                <span>
                  {' '}for search: <span className="font-medium">"{searchTerm}"</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px]">
                {start}-{end} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={pageIndex === 0}
                  className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors ${
                    pageIndex === 0
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <FaChevronLeft className="w-2.5 h-2.5 inline mr-0.5" />
                  Prev
                </button>
                <span className="px-2 py-0.5 text-[12px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                  {pageIndex + 1}/{pageCount}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageIndex === pageCount - 1}
                  className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors ${
                    pageIndex === pageCount - 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Next
                  <FaChevronRight className="w-2.5 h-2.5 inline ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal (status toggle button removed) */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center backdrop-blur-sm justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <SquarePen className="text-blue-600" size={25} />
                  Edit Item Origin
                </h2>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Only Modify button remains */}
                <div className="flex justify-end gap-3 items-center">
                  <Button
                    color="blue"
                    onClick={handleModifyClick}
                    className="px-4 py-2 rounded-lg transition-colors duration-200 hover:shadow-md"
                  >
                    Modify
                  </Button>
                </div>

                {/* Floating Inputs */}
                <div className="grid grid-cols-1 gap-4">
                  <FloatingInput
                    id="editItemOriginName"
                    name="editItemOriginName"
                    value={editOriginName}
                    onChange={handleEditNameChange}
                    label="Item Origin Name"
                    required
                    error={editError}
                  />
                </div>

                {/* Current Status Display */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="text-blue-600 text-lg font-semibold mb-2 dark:text-blue-400 block">
                    Current Status
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge
                      color={editStatus === 'Active' ? 'success' : 'failure'}
                      className="capitalize text-xs"
                    >
                      {editStatus}
                    </Badge>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      This is the current status of the item.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unified Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirm}
          confirmType={confirmType || 'add'}
          targetId={targetId || targetName}
          onConfirm={() => {
            confirmAction?.();
            setShowConfirm(false);
            setConfirmAction(null);
            setConfirmType(null);
            setTargetId(null);
            setTargetName('');
          }}
          onCancel={() => {
            setShowConfirm(false);
            setConfirmAction(null);
            setConfirmType(null);
            setTargetId(null);
            setTargetName('');
          }}
        />

        {/* Session Expired Modal */}
        {showSessionExpired && <SessionModal />}

        <Toastify />
      </div>
    </>
  );
};

export default ItemOriginList;