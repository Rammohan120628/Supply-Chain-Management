import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { SquarePen, Package, X, Edit, Search as LucideSearch } from 'lucide-react';
import { Button, Tooltip, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HiPlus,
  HiX,
  HiSearch,
  HiInformationCircle,
  HiChevronDown,
} from 'react-icons/hi';
import { FaChevronLeft, FaChevronRight, FaSave } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { showToast } from '../Toastify';
import SessionModal from 'src/views/SessionModal';

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

// ==================== FLOATING INPUT ====================
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
  showLock?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type = 'text', value, onChange, label,
  required = false, error, readOnly = false, maxLength, showLock = false
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
        {readOnly && showLock && (
          <Tooltip content="This field is auto-filled based on selected account" placement="top" className="ml-2 z-50">
            <div className="mt-2 text-gray-400 dark:text-gray-500 cursor-help">
              <FaSave className="w-4 h-4" />
            </div>
          </Tooltip>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ==================== CONFIRM MODAL (ONLY FOR STATUS CHANGE) ====================
interface ConfirmModalProps {
  isOpen: boolean;
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
              Are you sure you want to change the status of "{targetName || 'this item category'}"?
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

// ==================== TYPES ====================
interface ItemCategoryData {
  id: number;
  itemCategoryName: string;
  accountName: string;
  accountFk?: number;
  status: string;
  statusColor: string;
}

const ItemCategoryList: React.FC = () => {
  const [data, setData] = useState<ItemCategoryData[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemCategoryData | null>(null);
  const [editItemCategoryName, setEditItemCategoryName] = useState('');
  const [editItemAccountId, setEditItemAccountId] = useState('');
  const [editItemAccountName, setEditItemAccountName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editSearchTerm, setEditSearchTerm] = useState('');
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const editDropdownRef = useRef<HTMLDivElement>(null);
  const editSearchInputRef = useRef<HTMLInputElement>(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemCategoryName, setNewItemCategoryName] = useState('');
  const [newItemAccountId, setNewItemAccountId] = useState('');
  const [newItemAccountName, setNewItemAccountName] = useState('');
  const [newSearchTerm, setNewSearchTerm] = useState('');
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});
  const newDropdownRef = useRef<HTMLDivElement>(null);
  const newSearchInputRef = useRef<HTMLInputElement>(null);

  // Confirm Modal (only status)
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetItemName, setTargetItemName] = useState<string>('');

  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const columnHelper = createColumnHelper<ItemCategoryData>();

  const BASE_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController';
  const LIST_API_URL = `${BASE_URL}/listMstItemCategory`;
  const VIEW_API_URL = `${BASE_URL}/viewMstItemCategory`;
  const MODIFY_API_URL = `${BASE_URL}/modifyMstItemCategory`;
  const STATUS_UPDATE_API_URL = `${BASE_URL}/mstItemCategoryStatusUpdate`;
  const SAVE_API_URL = `${BASE_URL}/saveMstItemCategory`;
  const DROPDOWN_API_URL = `${BASE_URL}/dropDownAccountByPk`;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newDropdownRef.current && !newDropdownRef.current.contains(event.target as Node)) {
        setShowNewDropdown(false);
      }
      if (editDropdownRef.current && !editDropdownRef.current.contains(event.target as Node)) {
        setShowEditDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input
  useEffect(() => {
    if (showNewDropdown && newSearchInputRef.current) setTimeout(() => newSearchInputRef.current?.focus(), 100);
    if (showEditDropdown && editSearchInputRef.current) setTimeout(() => editSearchInputRef.current?.focus(), 100);
  }, [showNewDropdown, showEditDropdown]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { setShowSessionExpired(true); return; }
      const res = await fetch(DROPDOWN_API_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { setShowSessionExpired(true); return; }
      const json = await res.json();
      if (json.success) setAccounts(json.data || []);
    } catch (e) {
      showToast('Error fetching accounts', 'error');
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) { setShowSessionExpired(true); return; }
    setIsLoading(true);
    NProgress.start();
    try {
      const res = await fetch(LIST_API_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { setShowSessionExpired(true); return; }
      const json = await res.json();
      const mappedData = json.data.map((item: any) => ({
        id: item.itemCategoryPk,
        itemCategoryName: item.itemCategoryName,
        accountName: item.itemAccountName || 'N/A',
        accountFk: item.accountFk,
        status: item.status,
        statusColor: item.status === "Active" ? "success" : "failure",
      }));
      setData(mappedData);
    } catch (e) {
      setShowSessionExpired(true);
      showToast('Error fetching item categories', 'error');
    } finally {
      setIsLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchData();
  }, []);

  const filteredAccounts = accounts.filter(account =>
    account.code?.toLowerCase().includes((editSearchTerm || newSearchTerm).toLowerCase()) ||
    account.name?.toLowerCase().includes((editSearchTerm || newSearchTerm).toLowerCase())
  );

  // ==================== STATUS CHANGE (with confirm) ====================
  const handleStatusChange = (id: number, currentStatus: string, itemName: string) => {
    setTargetItemName(itemName);
    setConfirmAction(() => () => confirmStatusChange(id, currentStatus));
    setShowConfirm(true);
  };

  const confirmStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'In-Active' : 'Active';
    const token = localStorage.getItem('authToken');
    if (!token) { setShowSessionExpired(true); return; }

    NProgress.start();
    setTogglingId(id);

    try {
      const res = await fetch(STATUS_UPDATE_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCategoryPk: id, status: newStatus }),
      });
      if (res.status === 401) { setShowSessionExpired(true); return; }
      if (!res.ok) throw new Error();

      const newColor = newStatus === 'Active' ? 'success' : 'failure';
      setData(prev => prev.map(item =>
        item.id === id ? { ...item, status: newStatus, statusColor: newColor } : item
      ));

      if (showEditModal && selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status: newStatus, statusColor: newColor } : null);
        setEditStatus(newStatus);
      }

      showToast(`Status updated to ${newStatus} successfully`, 'success');
      setShowEditModal(false);
    } catch (e) {
      showToast('Error updating status', 'error');
    } finally {
      NProgress.done();
      setTogglingId(null);
    }
  };

  // ==================== EDIT (direct save - NO confirm) ====================
  const openEdit = async (item: ItemCategoryData) => {
    setSelectedItem(item);
    setEditItemCategoryName(item.itemCategoryName);
    setEditItemAccountId(item.accountFk?.toString() || '');
    setEditItemAccountName(item.accountName);
    setEditStatus(item.status);
    setErrors({});
    setEditSearchTerm('');
    setShowEditDropdown(false);

    const token = localStorage.getItem('authToken');
    if (token) {
      NProgress.start();
      try {
        const res = await fetch(`${VIEW_API_URL}/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.success) {
          setEditItemCategoryName(json.data.itemCategoryName || item.itemCategoryName);
          setEditItemAccountId(json.data.accountFk?.toString() || '');
          setEditItemAccountName(json.data.itemAccountName || item.accountName);
          setEditStatus(json.data.status || item.status);
        }
      } catch (e) {}
      NProgress.done();
    }
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setEditItemCategoryName('');
    setEditItemAccountId('');
    setEditItemAccountName('');
    setEditStatus('');
    setEditSearchTerm('');
    setShowEditDropdown(false);
    setErrors({});
  };

  const handleEditAccountChange = (pk: string) => {
    const selected = accounts.find(a => a.pk.toString() === pk);
    if (selected) {
      setEditItemAccountId(pk);
      setEditItemAccountName(selected.name);
    }
    setEditSearchTerm('');
    setShowEditDropdown(false);
  };

  const handleEditSave = async () => {
    const trimmed = editItemCategoryName.trim();
    if (!trimmed) { showToast('Item Category Name is required.', 'error'); setErrors({ itemCategoryName: 'Required' }); return; }
    if (trimmed.length < 3 || trimmed.length > 15) { showToast('Item Category Name must be 3-15 characters.', 'error'); return; }
    if (!editItemAccountId) { showToast('Account is required.', 'error'); return; }

    const token = localStorage.getItem('authToken');
    if (!token) { setShowSessionExpired(true); return; }

    NProgress.start();
    try {
      const body = {
        itemCategoryPk: selectedItem!.id,
        itemCategoryName: trimmed,
        accountFk: parseInt(editItemAccountId),
        status: editStatus,
        lastActBy: parseInt(localStorage.getItem('userId') || '0'),
        entityId: localStorage.getItem('entity'),
      };

      const res = await fetch(MODIFY_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 401) { setShowSessionExpired(true); return; }
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Update failed');

      setData(prev => prev.map(item =>
        item.id === selectedItem!.id
          ? {
              ...item,
              itemCategoryName: trimmed,
              accountName: editItemAccountName,
              status: editStatus,
              statusColor: editStatus === 'Active' ? 'success' : 'failure'
            }
          : item
      ));

      showToast('Item category updated successfully.', 'success');
      closeEdit();
    } catch (e) {
      showToast('Error updating item category.', 'error');
    } finally {
      NProgress.done();
    }
  };

  // ==================== CREATE (direct save - NO confirm) ====================
  const openCreateModal = () => {
    setNewItemCategoryName('');
    setNewItemAccountId('');
    setNewItemAccountName('');
    setNewSearchTerm('');
    setShowNewDropdown(false);
    setNewErrors({});
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewItemCategoryName('');
    setNewItemAccountId('');
    setNewItemAccountName('');
    setNewSearchTerm('');
    setShowNewDropdown(false);
    setNewErrors({});
  };

  const handleNewAccountChange = (pk: string) => {
    const selected = accounts.find(a => a.pk.toString() === pk);
    if (selected) {
      setNewItemAccountId(pk);
      setNewItemAccountName(selected.name);
    }
    setNewSearchTerm('');
    setShowNewDropdown(false);
  };

  const handleCreateSave = async () => {
    const trimmed = newItemCategoryName.trim();
    if (!trimmed) { showToast('Item Category Name is required.', 'error'); setNewErrors({ itemCategoryName: 'Required' }); return; }
    if (trimmed.length < 3 || trimmed.length > 15) { showToast('Item Category Name must be 3-15 characters.', 'error'); return; }
    if (!newItemAccountId) { showToast('Account is required.', 'error'); return; }

    const token = localStorage.getItem('authToken');
    if (!token) { setShowSessionExpired(true); return; }

    NProgress.start();
    try {
      const body = {
        itemCategoryName: trimmed,
        accountFk: parseInt(newItemAccountId),
        createdBy: parseInt(localStorage.getItem('userId') || '0'),
        lastActBy: parseInt(localStorage.getItem('userId') || '0'),
        entityId: localStorage.getItem('entity'),
      };

      const res = await fetch(SAVE_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 401) { setShowSessionExpired(true); return; }
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Save failed');

      showToast('Item category saved successfully.', 'success');
      closeCreateModal();
      fetchData();
    } catch (e) {
      showToast('Error saving item category.', 'error');
    } finally {
      NProgress.done();
    }
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    columnHelper.display({
      id: 'serialNo',
      header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
      cell: ({ row }) => <span className="text-[11px] text-gray-600 dark:text-gray-400">{row.index + 1}</span>,
      enableSorting: false,
      size: 50,
    }),
    columnHelper.accessor('itemCategoryName', {
      header: ({ column }) => (
        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200" onClick={column.getToggleSortingHandler()}>
          <span className="font-medium text-white text-[10px] uppercase">Item Category Name</span>
          {column.getCanSort() && <span className="text-white text-[10px]">{{
            asc: ' 🔼', desc: ' 🔽'
          }[column.getIsSorted() as string] ?? ' ↕️'}</span>}
        </div>
      ),
      cell: (info) => <p className="text-[11px] font-medium text-gray-900 dark:text-white">{info.getValue()}</p>,
      size: 280,
    }),
    columnHelper.accessor('accountName', {
      header: ({ column }) => (
        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200" onClick={column.getToggleSortingHandler()}>
          <span className="font-medium text-white text-[10px] uppercase">Account Name</span>
          {column.getCanSort() && <span className="text-white text-[10px]">{{
            asc: ' 🔼', desc: ' 🔽'
          }[column.getIsSorted() as string] ?? ' ↕️'}</span>}
        </div>
      ),
      cell: (info) => <p className="text-[11px] font-medium text-gray-900 dark:text-white">{info.getValue()}</p>,
      size: 280,
    }),
    columnHelper.accessor('status', {
      header: () => <span className="font-medium text-white text-[10px] uppercase">Status</span>,
      cell: (info) => {
        const isActive = info.getValue() === 'Active';
        return (
          <Badge color={isActive ? 'success' : 'failure'} className="text-[10px] px-2 py-0.5 font-medium">
            {info.getValue()}
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
              onChange={() => handleStatusChange(row.id, status, row.itemCategoryName)}
              disabled={isToggling}
            />
            <div className={`relative w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full transition-colors duration-300 peer-checked:bg-blue-500 after:absolute after:top-[2px] after:left-[2px] after:flex after:items-center after:justify-center after:text-[10px] after:font-bold after:text-gray-700 dark:after:text-gray-200 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-5 ${isToggling ? 'opacity-50 cursor-wait' : ''}`} />
          </label>
        );
      },
      enableSorting: false,
      size: 130,
    }),
    columnHelper.display({
      id: 'modify',
      header: () => <span className="font-medium text-white text-[10px] uppercase">Modify</span>,
      cell: ({ row }) => (
        <button
          onClick={() => openEdit(row.original)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
          title="Edit item category"
        >
          <SquarePen size={16} />
        </button>
      ),
      enableSorting: false,
      size: 80,
    }),
  ];

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

  // Skeleton Row
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6" /></td>
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40" /></td>
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40" /></td>
      <td className="px-1.5 py-1"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" /></td>
      <td className="px-1.5 py-1"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-11" /></td>
      <td className="px-1.5 py-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6" /></td>
    </tr>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-blue-400 flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                Item Category List
              </h1>
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Click + to add new item category</li>
                      <li>Fill name (3-15 chars) and select account</li>
                      <li>Toggle switch to change status</li>
                      <li>Click modify icon to edit</li>
                    </ol>
                  </div>
                }
                placement="bottom"
              >
                <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  <HiInformationCircle className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            <Tooltip content="Add new item category" placement="bottom">
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

        {/* Main Card */}
        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Search */}
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
                  <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
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
                          className="px-1.5 py-1 text-left text-[10px] font-semibold text-white uppercase tracking-wider"
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
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors duration-150">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-1.5 py-1 text-[11px]">
                            <div className="flex items-center min-h-[20px]">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-1.5 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 animate-bounce">
                            <Package className="w-8 h-8 text-blue-400 dark:text-blue-300" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                            {debouncedSearchTerm ? 'No matching records found' : 'No item categories yet'}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 text-center max-w-sm">
                            {debouncedSearchTerm ? 'Try a different search term or clear the filter.' : 'Get started by creating your first item category.'}
                          </p>
                          {!debouncedSearchTerm && (
                            <Button color="blue" size="xs" onClick={openCreateModal} className="flex items-center gap-1">
                              <HiPlus className="w-4 h-4" /> Add Item Category
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="mt-2 flex flex-col sm:flex-row justify-between items-center gap-1 px-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                <div>
                  Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of <span className="font-medium">{total}</span> records
                  {debouncedSearchTerm && <span> for search: "{debouncedSearchTerm}"</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handlePrevPage} disabled={pageIndex === 0} className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105">
                    <FaChevronLeft className="w-2 h-2" /> Prev
                  </button>
                  <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                    {pageIndex + 1} / {pageCount}
                  </span>
                  <button onClick={handleNextPage} disabled={pageIndex === pageCount - 1} className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105">
                    Next <FaChevronRight className="w-2 h-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ==================== CREATE MODAL (direct save) ==================== */}
        <Modal show={showCreateModal} onClose={closeCreateModal} size="md" dismissible>
          <ModalHeader className="rounded-lg border-b bg-white dark:bg-gray-800 text-white p-4">
            <div className="flex items-center gap-2">
              <HiPlus className="w-4 h-4" />
              <span className="text-sm font-bold">Add Item Category</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-6 bg-white dark:bg-gray-800">
            <div className="space-y-6">
              <FloatingInput
                id="newItemCategoryName"
                name="itemCategoryName"
                value={newItemCategoryName}
                onChange={(e) => { setNewItemCategoryName(e.target.value); setNewErrors(prev => { const ne = { ...prev }; delete ne.itemCategoryName; return ne; }); }}
                label="Category Name"
                required
                error={newErrors.itemCategoryName}
                maxLength={15}
              />

              {/* Account Dropdown */}
              <div ref={newDropdownRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNewDropdown(!showNewDropdown)}
                    className="peer h-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-transparent text-gray-900 dark:text-gray-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
                  >
                    <span className={`truncate ${!newItemAccountId ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                      {newItemAccountId ? `${accounts.find(a => a.pk.toString() === newItemAccountId)?.code} — ${newItemAccountName}` : ''}
                    </span>
                    <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showNewDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <span className={`absolute transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                    ${newItemAccountId || showNewDropdown ? '-top-3 left-2 text-xs bg-white dark:bg-gray-800 px-1 text-gray-600 dark:text-gray-300' : 'top-1/2 left-4 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-500'}`}>
                    {newItemAccountId || showNewDropdown ? <>Account Id <sup className="text-red-600 text-sm">*</sup></> : 'Please select Account Id'}
                  </span>

                  {showNewDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                          <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            ref={newSearchInputRef}
                            type="text"
                            placeholder="Search accounts..."
                            value={newSearchTerm}
                            onChange={(e) => setNewSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 max-h-48">
                        {filteredAccounts.length > 0 ? (
                          filteredAccounts.map((account) => (
                            <button
                              key={account.pk}
                              type="button"
                              onClick={() => handleNewAccountChange(account.pk.toString())}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${newItemAccountId === account.pk.toString() ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{account.code}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{account.name}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">No accounts found</div>
                        )}
                      </div>
                      {newItemAccountId && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => { setNewItemAccountId(''); setNewItemAccountName(''); setNewSearchTerm(''); }}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <FloatingInput
                id="newItemAccountName"
                name="accountName"
                value={newItemAccountName}
                onChange={() => {}}
                label="Account Name"
                readOnly
                showLock
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-end p-4 rounded-lg">
            <Button size="xs" onClick={closeCreateModal} className="text-xs bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:bg-red-500 transition-all duration-200 hover:scale-105">
              <X className="w-3 h-3 mr-2" /> Cancel
            </Button>
            <Button color="success" size="xs" onClick={handleCreateSave} className="text-xs dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105">
              <FaSave className="w-3 h-3 mr-2" /> Save
            </Button>
          </ModalFooter>
        </Modal>

        {/* ==================== EDIT MODAL (direct modify) ==================== */}
        <Modal show={showEditModal} onClose={closeEdit} size="md" dismissible>
          <ModalHeader className="rounded-lg border-b bg-white dark:bg-gray-800 text-white p-4">
            <div className="flex items-center gap-2">
              <SquarePen className="w-4 h-4" />
              <span className="text-sm font-bold">Edit Item Category</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-6 bg-white dark:bg-gray-800">
            <div className="space-y-6">
              {/* Status Toggle Button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => selectedItem && handleStatusChange(selectedItem.id, editStatus, editItemCategoryName || selectedItem.itemCategoryName)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    editStatus === 'Active'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {editStatus === 'Active' ? 'Set In-Active' : 'Set Active'}
                </button>
              </div>

              <FloatingInput
                id="editItemCategoryName"
                name="itemCategoryName"
                value={editItemCategoryName}
                onChange={(e) => { setEditItemCategoryName(e.target.value); setErrors(prev => { const ne = { ...prev }; delete ne.itemCategoryName; return ne; }); }}
                label="Category Name"
                required
                error={errors.itemCategoryName}
                maxLength={15}
              />

              {/* Account Dropdown (same as create) */}
              <div ref={editDropdownRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEditDropdown(!showEditDropdown)}
                    className="peer h-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-transparent text-gray-900 dark:text-gray-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
                  >
                    <span className={`truncate ${!editItemAccountId ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                      {editItemAccountId ? `${accounts.find(a => a.pk.toString() === editItemAccountId)?.code} — ${editItemAccountName}` : ''}
                    </span>
                    <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showEditDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <span className={`absolute transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                    ${editItemAccountId || showEditDropdown ? '-top-3 left-2 text-xs bg-white dark:bg-gray-800 px-1 text-gray-600 dark:text-gray-300' : 'top-1/2 left-4 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-500'}`}>
                    {editItemAccountId || showEditDropdown ? <>Account Id <sup className="text-red-600 text-sm">*</sup></> : 'Please select Account Id'}
                  </span>

                  {showEditDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                          <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            ref={editSearchInputRef}
                            type="text"
                            placeholder="Search accounts..."
                            value={editSearchTerm}
                            onChange={(e) => setEditSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 max-h-48">
                        {filteredAccounts.length > 0 ? (
                          filteredAccounts.map((account) => (
                            <button
                              key={account.pk}
                              type="button"
                              onClick={() => handleEditAccountChange(account.pk.toString())}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${editItemAccountId === account.pk.toString() ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{account.code}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{account.name}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">No accounts found</div>
                        )}
                      </div>
                      {editItemAccountId && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => { setEditItemAccountId(''); setEditItemAccountName(''); setEditSearchTerm(''); }}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Clear selection
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <FloatingInput
                id="editItemAccountName"
                name="accountName"
                value={editItemAccountName}
                onChange={() => {}}
                label="Account Name"
                readOnly
                showLock
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-end p-4 rounded-lg">
            <Button size="xs" onClick={closeEdit} className="text-xs bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:bg-red-500 transition-all duration-200 hover:scale-105">
              <X className="w-3 h-3 mr-2" /> Cancel
            </Button>
            <Button color="success" size="xs" onClick={handleEditSave} className="text-xs dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105">
              <Edit className="w-3 h-3 mr-2" /> Modify
            </Button>
          </ModalFooter>
        </Modal>

        {/* Confirm Modal - Only for Status Change */}
        <ConfirmModal
          isOpen={showConfirm}
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

        {showSessionExpired && <SessionModal />}
      </div>
    </>
  );
};

export default ItemCategoryList;