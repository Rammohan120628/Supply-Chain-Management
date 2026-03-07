import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { SquarePen, Package, X, Edit } from 'lucide-react';
import { Button, Tooltip, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react';
import React, { useState, useEffect, useMemo } from 'react';
import {
  HiPlus,
  HiX,
  HiSearch,
  HiInformationCircle,
} from 'react-icons/hi';
import { FaChevronLeft, FaChevronRight, FaLock, FaSave } from 'react-icons/fa';
import { Database } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import Toastify, { showToast } from '../Toastify';
import SessionModal from 'src/views/SessionModal';

// Configure NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

// ---------- Floating Input Component with info tooltip and character counter ----------
// ---------- Floating Input Component with info tooltip and inline character counter ----------
interface FloatingInputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  maxLength?: number;
  info?: string;
  showLock?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type = 'text', value, onChange, label,
  required = false, error, readOnly = false, maxLength,
  info, showLock = false
}) => {
  const showCounter = maxLength && !readOnly;

  return (
    <div>
      <div className="relative flex items-start">
        <div className="relative flex-1">
          <input
            id={id}
            name={name}
            type={type}
            placeholder=" "
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            maxLength={maxLength}
            className={`peer w-full px-4 py-2 border rounded-md bg-transparent text-gray-900 dark:text-white focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
              readOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''
            } ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${
              showCounter ? 'pr-8 sm:pr-10' : ''
            }`}
          />
          {showCounter && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs">
              {value.length}/{maxLength}
            </span>
          )}
          <label
            htmlFor={id}
            className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
        {/* Info icon with tooltip */}
        {info && !readOnly && (
          <Tooltip content={info} placement="top" className="ml-2 z-50">
            <div className="mt-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 cursor-help transition-colors">
              <HiInformationCircle className="w-5 h-5" />
            </div>
          </Tooltip>
        )}
        {/* Lock icon for readonly fields */}
        {readOnly && showLock && (
          <Tooltip content="This field cannot be edited" placement="top" className="ml-2 z-50">
            <div className="mt-2 text-gray-400 dark:text-gray-500 cursor-help">
              <FaSave className="w-4 h-4" />
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

// ---------- Confirm Modal (only for status changes) ----------
interface ConfirmModalProps {
  isOpen: boolean;
  confirmType: 'status';
  onConfirm: () => void;
  onCancel: () => void;
  targetName?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  targetName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10 animate-scaleIn">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 shadow-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 ring-red-200/50 dark:ring-red-900/30">
              <Package className="w-8 h-8 animate-pulse text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
              Confirm Status Change
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              Are you sure you want to change the status of "{targetName || 'this item unit'}"?
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
              className="flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Types ----------
interface ItemUnitData {
  id: number;
  itemCode: string;
  itemName: string;
  status: 'Active' | 'Inactive' | string;
  statusColor: string;
}

interface ItemUnitTableProps {
  onAddNew?: () => void;
}

// ---------- Skeleton Row Component ----------
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
    <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
    <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div></td>
    <td className="px-1.5 py-1"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
    <td className="px-1.5 py-1"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10"></div></td>
    <td className="px-1.5 py-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
  </tr>
);

const ItemUnitList: React.FC<ItemUnitTableProps> = ({ onAddNew }) => {
  const [data, setData] = useState<ItemUnitData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemUnitData | null>(null);
  const [editItemCode, setEditItemCode] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editCreatedBy, setEditCreatedBy] = useState(0);
  const [editCreatedDate, setEditCreatedDate] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});

  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false); // for initial data fetch

  // Confirm modal state (only for status change)
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetItemName, setTargetItemName] = useState<string>('');

  const columnHelper = createColumnHelper<ItemUnitData>();

  // ----- API endpoints -----
  const BASE_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController';

  // ----- Status Change -----
  const handleStatusChange = (id: number, currentStatus: string, itemName: string) => {
    setTargetItemName(itemName);
    setConfirmAction(() => () => confirmStatusChange(id, currentStatus));
    setShowConfirm(true);
  };

  const confirmStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'In-Active' : 'Active';
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }

    NProgress.start();
    setTogglingId(id);

    const body = {
      itemUnitPk: id,
      status: newStatus,
    };

    try {
      const response = await fetch(`${BASE_URL}/itemUnitStatusUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newStatusColor = newStatus === 'Active' ? 'success' : 'failure';
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id
            ? { ...item, status: newStatus, statusColor: newStatusColor }
            : item
        )
      );

      if (showEditModal && selectedItem?.id === id) {
        setSelectedItem((prev) =>
          prev ? { ...prev, status: newStatus, statusColor: newStatusColor } : null
        );
      }

      showToast(`Status updated to ${newStatus} successfully`, 'success');
      setShowEditModal(false);
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error updating status:', error);
      showToast('Error updating status.', 'error');
    } finally {
      NProgress.done();
      setTogglingId(null);
    }
    setTargetItemName('');
  };

  // ----- Edit Modal -----
  const openEdit = async (item: ItemUnitData) => {
    setSelectedItem(item);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }

    NProgress.start();

    try {
      const response = await fetch(`${BASE_URL}/viewItemUnit/${item.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      const fullItem = res.data;
      setEditItemCode(fullItem.itemUnitCode || item.itemCode);
      setEditItemName(fullItem.itemUnitName || item.itemName);
      setEditCreatedBy(fullItem.createdBy || parseInt(localStorage.getItem('userId') || '0'));
      setEditCreatedDate(
        fullItem.createdDate || new Date().toISOString().split('T')[0] + 'T10:00:00'
      );
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error fetching item unit details:', error);
      showToast('Error fetching item unit details.', 'error');
      setEditItemCode(item.itemCode);
      setEditItemName(item.itemName);
      setEditCreatedBy(parseInt(localStorage.getItem('userId') || '0'));
      setEditCreatedDate(new Date().toISOString().split('T')[0] + 'T10:00:00');
    } finally {
      NProgress.done();
    }

    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setEditItemCode('');
    setEditItemName('');
    setEditCreatedBy(0);
    setEditCreatedDate('');
    setErrors({});
  };

  // ----- Edit Save (direct, no confirm) -----
  const handleEditSave = async () => {
    if (!editItemName.trim()) {
      showToast('Item Name is required.', 'error');
      setErrors({ itemUnitName: 'Item Name is required.' });
      return;
    }
    if (!selectedItem) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }

    NProgress.start();

    const statusCode = selectedItem.status === 'Active' ? 'A' : 'I';
    const entityId = localStorage.getItem('entity');
    const userId = localStorage.getItem('userId');

    const updateBody = {
      itemUnitPk: selectedItem.id,
      itemUnitName: editItemName.trim(),
      itemUnitCode: editItemCode,
      status: statusCode,
      createdBy: editCreatedBy,
      createdDate: editCreatedDate,
      lastActBy: userId,
      entityId: entityId,
    };

    try {
      const response = await fetch(`${BASE_URL}/modifyItemUnit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newStatusColor = selectedItem.status === 'Active' ? 'success' : 'failure';
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedItem.id
            ? { ...item, itemName: editItemName.trim(), status: selectedItem.status, statusColor: newStatusColor }
            : item
        )
      );
      showToast('Item unit updated successfully.', 'success');
      closeEdit();
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error updating item unit:', error);
      showToast('Error updating item unit.', 'error');
    } finally {
      NProgress.done();
    }
  };

  // ----- Create Modal -----
  const openCreateModal = () => {
    setNewItemCode('');
    setNewItemName('');
    setNewErrors({});
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewItemCode('');
    setNewItemName('');
    setNewErrors({});
  };

  const validateCreateFields = (): boolean => {
    if (!newItemCode.trim()) {
      showToast('Item Unit Code is required.', 'error');
      setNewErrors({ itemUnitCode: 'Item Unit Code is required.' });
      return false;
    }
    if (!newItemName.trim()) {
      showToast('Item Unit Name is required.', 'error');
      setNewErrors({ itemUnitName: 'Item Unit Name is required.' });
      return false;
    }
    return true;
  };

  // ----- Create Save (direct, no confirm) -----
  const handleCreateSave = async () => {
    if (!validateCreateFields()) return;

    const token = localStorage.getItem('authToken');
    const entityId = localStorage.getItem('entity');
    const userId = localStorage.getItem('userId');

    if (!token) {
      setShowSessionExpired(true);
      return;
    }

    NProgress.start();

    const requestBody = {
      itemUnitName: newItemName.trim(),
      itemUnitCode: newItemCode.trim(),
      createdBy: userId,
      lastActBy: userId,
      entityId: entityId,
    };

    try {
      const response = await fetch(`${BASE_URL}/saveItemUnit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        showToast(data.message || `HTTP error! status: ${response.status}`, 'error');
        return;
      }

      if (data.success === false) {
        if (data.message?.toLowerCase().includes('duplicate')) {
          showToast('Unit code already exists', 'error');
        } else {
          showToast(data.message || 'Error saving item unit.', 'error');
        }
        return;
      }

      showToast('Item unit saved successfully.', 'success');
      closeCreateModal();
      fetchData(); // refresh the list
    } catch (error) {
      console.error('Error saving item unit:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to save item unit.',
        'error',
      );
    } finally {
      NProgress.done();
    }
  };

  // ----- Fetch Data -----
  const fetchData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }

    setIsLoading(true);
    NProgress.start();

    try {
      const response = await fetch(`${BASE_URL}/listItemUnit`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      const mappedData = res.data.map((item: any) => ({
        id: item.itemUnitPk,
        itemCode: item.itemUnitCode,
        itemName: item.itemUnitName,
        status: item.status === 'Active' ? 'Active' : 'Inactive',
        statusColor: item.status === 'Active' ? 'success' : 'failure',
      }));
      setData(mappedData);
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error fetching item units:', error);
      showToast('Error fetching item units.', 'error');
    } finally {
      setIsLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ----- Table Columns -----
  const defaultColumns = [
    columnHelper.display({
      id: 'serialNo',
      header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
      cell: ({ row }) => (
        <span className="text-[11px] text-gray-600 dark:text-gray-400">{row.index + 1}</span>
      ),
      enableSorting: false,
      size: 40,
    }),
    columnHelper.accessor('itemCode', {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Unit Code</span>
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
      cell: (info) => <p className="text-[11px] font-medium text-gray-900 dark:text-white">{info.getValue()}</p>,
      size: 140,
    }),
    columnHelper.accessor('itemName', {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Unit Name</span>
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
      cell: (info) => <p className="text-[11px] font-medium text-gray-900 dark:text-white">{info.getValue()}</p>,
      size: 300,
    }),
    columnHelper.accessor('status', {
      header: () => <span className="font-medium text-white text-[10px] uppercase">Status</span>,
      cell: (info) => {
        const status = info.getValue();
        const isActive = status === 'Active';
        return (
          <Badge
            color={isActive ? 'success' : 'failure'}
            className="text-[10px] px-2 py-0.5 font-medium"
          >
            {status}
          </Badge>
        );
      },
      size: 100,
    }),
    columnHelper.accessor('status', {
      id: 'statusToggle',
      header: () => <span className="font-medium text-white text-[10px] uppercase">Change Status</span>,
      cell: (info) => {
        const status = info.getValue();
        const isActive = status === 'Active';
        const row = info.row.original;
        const isToggling = togglingId === row.id;
        return (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isActive}
              onChange={() => handleStatusChange(row.id, status, row.itemName)}
              disabled={isToggling}
            />
            <div
              className={`
                relative w-11 h-6 bg-gray-300 dark:bg-gray-600 
                peer-focus:outline-none peer-focus:ring-4 
                peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                rounded-full transition-colors duration-300
                peer-checked:bg-blue-500
                after:absolute after:top-[2px] after:left-[2px]
                after:flex after:items-center after:justify-center
                after:text-[10px] after:font-bold
                after:text-gray-700 dark:after:text-gray-200
                after:bg-white after:rounded-full
                after:h-5 after:w-5
                after:transition-all after:duration-300
                peer-checked:after:translate-x-5
                ${isToggling ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              {/* Optional: you can add content inside the thumb if needed */}
            </div>
          </label>
        );
      },
      enableSorting: false,
      size: 120,
    }),
    columnHelper.display({
      id: 'modify',
      header: () => <span className="font-medium text-white text-[10px] uppercase">Modify</span>,
      cell: ({ row }) => (
        <button
          onClick={() => openEdit(row.original)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
          title="Edit item unit"
          aria-label={`Edit ${row.original.itemName}`}
        >
          <SquarePen size={16} />
        </button>
      ),
      enableSorting: false,
      size: 80,
    }),
  ];

  const [columns] = React.useState(() => [...defaultColumns]);

  // ----- Table Filtering & Pagination -----
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [data, debouncedSearchTerm]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
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

  const handlePrevPage = () => {
    if (pageIndex > 0) table.setPageIndex(pageIndex - 1);
  };

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) table.setPageIndex(pageIndex + 1);
  };

  return (
    <>
      <Toastify />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header with title, action buttons, and info tooltip */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400 flex items-center gap-2">
                <Package className="h-6 w-6 text-indigo-600" />
                Item Unit List
              </h1>
              {/* Info tooltip with quick steps */}
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Click the "+" button to add a new item unit</li>
                      <li>Fill in the code and name (max 40 characters)</li>
                      <li>Use the modify icon to edit an existing unit</li>
                      <li>Toggle the switch to change status</li>
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
              <Tooltip content="Add new item unit" placement="bottom">
                <Button
                  color="blue"
                  size="xs"
                  className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-110"
                  onClick={openCreateModal}
                >
                  <HiPlus className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Search with clear button */}
          <div className="p-1 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="flex justify-end">
              <div className="relative w-full sm:w-64">
                <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${total} records...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Clear search"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-1">
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-[400px]">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
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
                  {isLoading ? (
                    // Skeleton rows while loading
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors duration-150"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-1.5 py-1 text-[9px]">
                            <div className="flex items-center min-h-[20px]">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    // Rich empty state
                    <tr>
                      <td colSpan={columns.length} className="px-1.5 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 animate-bounce">
                            <Package className="w-8 h-8 text-blue-400 dark:text-blue-300" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                            {debouncedSearchTerm ? 'No matching records found' : 'No item units yet'}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 text-center max-w-sm">
                            {debouncedSearchTerm
                              ? 'Try a different search term or clear the filter.'
                              : 'Get started by creating your first item unit.'}
                          </p>
                          {!debouncedSearchTerm && (
                            <Button
                              color="blue"
                              size="xs"
                              onClick={openCreateModal}
                              className="flex items-center gap-1"
                            >
                              <HiPlus className="w-4 h-4" /> Add Item Unit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination with page size selector */}
            {total > 0 && (
              <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-1 px-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span>
                    Showing <span className="font-medium">{start}</span> to{' '}
                    <span className="font-medium">{end}</span> of{' '}
                    <span className="font-medium">{total}</span> records
                    {debouncedSearchTerm && (
                      <span>
                        {' '}
                        for search: <span className="font-medium">"{debouncedSearchTerm}"</span>
                      </span>
                    )}
                  </span>
               
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={pageIndex === 0}
                    className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    aria-label="Previous page"
                  >
                    <FaChevronLeft className="w-2 h-2" /> Prev
                  </button>
                  <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    {pageIndex + 1} / {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pageIndex === pageCount - 1}
                    className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
                    aria-label="Next page"
                  >
                    Next <FaChevronRight className="w-2 h-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Create Modal */}
        <Modal show={showCreateModal} onClose={closeCreateModal} size="md" dismissible>
          <ModalHeader className="rounded-lg border-b bg-white dark:bg-gray-800 text-white p-4">
            <div className="flex items-center gap-2">
              <HiPlus className="w-4 h-4" />
              <span className="text-sm font-bold">Add Item Unit</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-4 bg-white dark:bg-gray-800">
            <div className="space-y-4">
              <FloatingInput
                id="newItemUnitCode"
                name="itemUnitCode"
                value={newItemCode}
                onChange={(e) => {
                  setNewItemCode(e.target.value);
                  setNewErrors(prev => { const newErrors = { ...prev }; delete newErrors.itemUnitCode; return newErrors; });
                }}
                label="Item Unit Code"
                required
                error={newErrors.itemUnitCode}
                maxLength={40}
              />
              <FloatingInput
                id="newItemUnitName"
                name="itemUnitName"
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  setNewErrors(prev => { const newErrors = { ...prev }; delete newErrors.itemUnitName; return newErrors; });
                }}
                label="Item Unit Name"
                required
                error={newErrors.itemUnitName}
                maxLength={40}
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-end p-4 rounded-lg">
            <Button
              size="xs"
              onClick={closeCreateModal}
              className="text-xs bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:bg-red-500 transition-all duration-200 hover:scale-105"
            >
                                          <X className="w-3 h-3 mr-2" />

              Cancel
            </Button>
            <Button
              color="success"
              size="xs"
              onClick={handleCreateSave}
              className="text-xs dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105"
            >
                            <FaSave className="w-3 h-3 mr-2" />

              Save
            </Button>
          </ModalFooter>
        </Modal>

        {/* Edit Modal */}
        <Modal show={showEditModal} onClose={closeEdit} size="md" dismissible>
          <ModalHeader className="rounded-lg border-b bg-white dark:bg-gray-800 text-white p-4">
            <div className="flex items-center gap-2">
              <SquarePen className="w-4 h-4" />
              <span className="text-sm font-bold">Edit Item Unit</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-4 bg-white dark:bg-gray-800">
            <div className="space-y-4">
              <FloatingInput
                id="editItemUnitCode"
                name="itemUnitCode"
                value={editItemCode}
                label="Item Unit Code"
                readOnly
                maxLength={40}
                showLock
              />
              <FloatingInput
                id="editItemUnitName"
                name="itemUnitName"
                value={editItemName}
                onChange={(e) => {
                  setEditItemName(e.target.value);
                  setErrors(prev => { const newErrors = { ...prev }; delete newErrors.itemUnitName; return newErrors; });
                }}
                label="Item Unit Name"
                required
                error={errors.itemUnitName}
                maxLength={40}
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t rounded-lg bg-gray-50 dark:bg-gray-700 justify-end p-4">
               <Button
              size="xs"
              onClick={closeCreateModal}
              className="text-xs bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:bg-red-500 transition-all duration-200 hover:scale-105"
            >
                                          <X className="w-3 h-3 mr-2" />

              Cancel
            </Button>
            <Button
              color="success"
              size="xs"
              onClick={handleEditSave}
              className="text-xs dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105"
            >
                            <Edit className="w-3 h-3 mr-2" />

              Modify
            </Button>
          </ModalFooter>
        </Modal>

        {/* Confirm Modal (only for status changes) */}
        <ConfirmModal
          isOpen={showConfirm}
          confirmType="status"
          onConfirm={() => {
            confirmAction?.();
            setShowConfirm(false);
            setConfirmAction(null);
            setTargetItemName('');
          }}
          onCancel={() => {
            setShowConfirm(false);
            setConfirmAction(null);
            setTargetItemName('');
          }}
          targetName={targetItemName}
        />

        {/* Session Expired Modal */}
        {showSessionExpired && <SessionModal />}
      </div>
    </>
  );
};

export default ItemUnitList;