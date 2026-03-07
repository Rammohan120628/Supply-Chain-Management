import { SquarePen, ChevronDown, Search, CircleCheckBig, X, Check, Edit, Package } from 'lucide-react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Badge, Button, Label, Tooltip } from "flowbite-react";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HiPlus,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import Toastify, { showToast } from '../Toastify';
import SessionModal from 'src/views/SessionModal';

// ---------- Confirm Modal (exact same design as VATCategory) ----------
interface ConfirmModalProps {
  isOpen: boolean;
  confirmType: 'add' | 'edit' | 'status' | 'download';
  targetId?: string;
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
        return `Are you sure you want to save this new item category?`;
      case 'edit':
        return `Are you sure you want to modify "${targetId || 'this item category'}"?`;
      case 'status':
        return `Are you sure you want to change the status of "${targetId || 'this item category'}"?`;
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
// ---------------------------------------------------------------------

// ---------- FloatingInput Component (same as VATCategory) ----------
interface FloatingInputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  required?: boolean;
  error?: string;
  suffix?: string;
  readOnly?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type = 'text', value, onChange, onBlur,
  label, required = false, error, suffix, readOnly = false
}) => {
  const baseInputClass = `peer w-full px-4 py-2 border border-gray-400 rounded-sm bg-transparent text-gray-900 dark:text-white focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${suffix ? 'pr-8' : ''} ${readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`;

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={readOnly}
        className={baseInputClass}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {suffix && <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none">{suffix}</span>}
    </div>
  );
};

interface ItemCategoryData {
  id: number;
  itemCategoryName: string;
  accountName: string;
  status: string;
  statusColor: string;
  renderModify: boolean;
  accountFk: number;
}

interface Account {
  pk: number;
  code: string;
  name: string;
}

interface ItemCategoryTableProps {
  onAddNew?: () => void;
}

const ItemCategoryList: React.FC<ItemCategoryTableProps> = ({ onAddNew }) => {
  const [data, setData] = useState<ItemCategoryData[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemCategoryData | null>(null);
  const [editItemCategoryName, setEditItemCategoryName] = useState("");
  const [editItemAccountId, setEditItemAccountId] = useState("");
  const [editItemAccountName, setEditItemAccountName] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Unified confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | 'download' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [targetItemName, setTargetItemName] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const columnHelper = createColumnHelper<ItemCategoryData>();

  const LIST_API_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/listMstItemCategory';
  const VIEW_API_BASE = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/viewMstItemCategory/';
  const MODIFY_API_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/modifyMstItemCategory';
  const STATUS_UPDATE_API_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/mstItemCategoryStatusUpdate';
  const DROPDOWN_API_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/dropDownAccountByPk';

  const showSession = () => setShowSessionModal(true);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEditDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showSession();
        return;
      }
      const res = await fetch(DROPDOWN_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        showSession();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
      } else {
        showToast('Failed to fetch accounts', 'error');
      }
    } catch (e) {
      showToast('Error fetching accounts', 'error');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setIsGlobalLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showSession();
        return;
      }
      const res = await fetch(LIST_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        showSession();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch item categories');
      const response = await res.json();
      if (response.success) {
        const mappedData = response.data.map((item: any) => ({
          id: item.itemCategoryPk,
          itemCategoryName: item.itemCategoryName,
          accountName: item.itemAccountName || 'N/A',
          status: item.status,
          statusColor: item.status === "Active" ? "success" : "failure",
          renderModify: item.renderModify,
          accountFk: item.accountFk,
        }));
        setData(mappedData);
      } else {
        showToast('Failed to fetch item categories', 'error');
      }
    } catch (e) {
      showSession();
      showToast('Error fetching item categories', 'error');
    } finally {
      setLoading(false);
      setIsGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchData();
  }, []);

  const filteredEditAccounts = accounts.filter(account =>
    account.code.toLowerCase().includes(editSearchTerm.toLowerCase()) ||
    account.name.toLowerCase().includes(editSearchTerm.toLowerCase())
  );

  const handleEditAccountChange = (pk: string) => {
    const selected = accounts.find(a => a.pk.toString() === pk);
    if (selected) {
      setEditItemAccountId(pk);
      setEditItemAccountName(selected.name);
    }
    setEditSearchTerm('');
    setShowEditDropdown(false);
  };

  const handleEditSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditSearchTerm(e.target.value);
  const toggleEditDropdown = () => setShowEditDropdown(!showEditDropdown);

  const getDisplayValue = () => {
    if (editItemAccountId) {
      const selected = accounts.find(a => a.pk.toString() === editItemAccountId);
      return selected ? `${selected.code} — ${selected.name}` : '';
    }
    return '';
  };

  const isEditValueSelected = !!editItemAccountId;

  // New status toggle handler (replaces old handleStatusChange)
  const handleStatusToggle = (id: number, currentStatus: string, itemName: string) => {
    setTargetItemName(itemName);
    setConfirmType('status');
    const newStatus = currentStatus === "Active" ? "In-Active" : "Active";
    setConfirmAction(() => async () => {
      setIsGlobalLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          showSession();
          return;
        }
        const body = { itemCategoryPk: id, status: newStatus };
        const res = await fetch(STATUS_UPDATE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        if (res.status === 401) {
          showSession();
          return;
        }
        if (!res.ok) throw new Error(await res.text());
        const response = await res.json();
        if (response.success) {
          // Update local data
          setData(prev =>
            prev.map(item =>
              item.id === id
                ? { ...item, status: newStatus, statusColor: newStatus === 'Active' ? 'success' : 'failure' }
                : item
            )
          );
          // If the edited item is currently open, update it too
          if (selectedItem && selectedItem.id === id) {
            setSelectedItem(prev => prev ? { ...prev, status: newStatus, statusColor: newStatus === 'Active' ? 'success' : 'failure' } : prev);
            setEditStatus(newStatus);
          }
          showToast(`Status updated to ${newStatus} successfully`, "success");
        } else {
          showToast(response.message || 'Status update failed', 'error');
        }
      } catch (e) {
        showToast('Error updating status', 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    });
    setShowConfirm(true);
  };

  const openEdit = async (item: ItemCategoryData) => {
    setSelectedItem(item);
    setIsGlobalLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showSession();
        return;
      }
      const viewUrl = `${VIEW_API_BASE}${item.id}`;
      const res = await fetch(viewUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        showSession();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch item category details');
      const response = await res.json();
      if (response.success) {
        const viewData = response.data;
        setEditItemCategoryName(viewData.itemCategoryName || '');
        setEditItemAccountId(viewData.accountFk?.toString() || '');
        let accountName = viewData.itemAccountName || '';
        if (!accountName && viewData.accountFk) {
          const selectedAccount = accounts.find(a => a.pk === viewData.accountFk);
          if (selectedAccount) accountName = selectedAccount.name;
        }
        setEditItemAccountName(accountName);
        setEditStatus(viewData.status || '');
      } else {
        showToast('Failed to fetch item category details', 'error');
      }
    } catch (e) {
      showSession();
      showToast('Error fetching item category details', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setEditItemCategoryName("");
    setEditItemAccountId("");
    setEditItemAccountName("");
    setEditStatus("");
    setEditSearchTerm('');
    setShowEditDropdown(false);
  };

  // Validate edit form – returns true if valid
  const validateEditForm = () => {
    if (!editItemCategoryName.trim()) {
      showToast("Item Category Name is required.", "error");
      return false;
    }
    if (!editItemAccountId.trim()) {
      showToast("Account ID is required.", "error");
      return false;
    }
    if (!editItemAccountName.trim()) {
      showToast("Account Name is required.", "error");
      return false;
    }
    return true;
  };

  // Called when user clicks Modify button – validate first, then open confirm
  const handleModifyClick = () => {
    if (!validateEditForm()) return;
    setTargetItemName(selectedItem?.itemCategoryName || '');
    setConfirmType('edit');
    setConfirmAction(() => performUpdate);
    setShowConfirm(true);
  };

  const performUpdate = async () => {
    if (!selectedItem) return;

    const userId = localStorage.getItem('userId');
    const entity = localStorage.getItem('entity');
    if (!userId || !entity) {
      showToast('Missing user data', 'error');
      return;
    }

    setIsGlobalLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showSession();
        return;
      }
      const body = {
        itemCategoryPk: selectedItem.id,
        itemCategoryName: editItemCategoryName.trim(),
        accountFk: parseInt(editItemAccountId),
        status: editStatus,
        createdBy: parseInt(userId),
        lastActBy: parseInt(userId),
        entityId: entity
      };
      const res = await fetch(MODIFY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.status === 401) {
        showSession();
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const response = await res.json();
      if (response.success) {
        await fetchData();
        showToast("Item category updated successfully.", "success");
        closeEdit();
        setShowEditModal(false)
      } else {
        showToast(response.message || 'Update failed', 'error');
      }
    } catch (e) {
      showToast('Error updating item category', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  // Column definitions including the new Change Status column
  const columns = [
    columnHelper.display({
      id: "serialNo",
      header: () => <span className="text-left block w-full">S.No</span>,
      cell: ({ row }) => <span className="text-xs text-left block w-full">{row.index + 1}</span>,
      enableSorting: false,
    }),
    columnHelper.accessor("itemCategoryName", {
      header: () => <span>Item Category Name</span>,
      cell: (info) => <p className="text-xs">{info.getValue()}</p>,
    }),
    columnHelper.accessor("accountName", {
      header: () => <span>Account Name</span>,
      cell: (info) => <p className="text-xs">{info.getValue()}</p>,
    }),
    columnHelper.accessor("status", {
      header: () => <span className="text-center block w-full">Status</span>,
      cell: (info) => (
        <div className="flex justify-center">
          <Badge color={info.row.original.statusColor} className="capitalize text-xs">
            {info.getValue()}
          </Badge>
        </div>
      ),
    }),
    // NEW: Change Status toggle column
    columnHelper.display({
      id: "changeStatus",
      header: () => <span className="text-center block w-full">Change Status</span>,
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
                onChange={() => handleStatusToggle(row.original.id, status, row.original.itemCategoryName)}
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
      id: "modify",
      header: () => <span className="text-center block w-full">Modify</span>,
      cell: ({ row }) => (
        row.original.renderModify ? (
          <div className="flex justify-center">
            <Tooltip content="Modify">
              <button
                onClick={() => openEdit(row.original)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-150"
              >
                <SquarePen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
            </Tooltip>
          </div>
        ) : null
      ),
      enableSorting: false,
    }),
  ];

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

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

  // Helper for sorting indicator
  const getSortIcon = (columnId: string) => {
    const sort = sorting.find(s => s.id === columnId);
    if (!sort) return null;
    return sort.desc ? <HiChevronDown className="w-3 h-3" /> : <HiChevronUp className="w-3 h-3" />;
  };

  // Confirmation handlers
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
    setTargetItemName(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
    setTargetItemName(null);
  };

  return (
    <>
      <div className="w-full max-h-screen mx-auto p-4 sm:p-0 relative">
        {/* Global Loading Overlay */}
        {isGlobalLoading && (
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
            </div>
          </div>
        )}

        {/* Header row with title and Add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-2">
          <h1 className="text-xl text-indigo-700 flex items-center gap-2 dark:text-indigo-300 mb-4 sm:mb-0">
            <Package className='h-6 text-indigo-700 w-6'/> Item Category List
          </h1>
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <Tooltip content="Add">
              <Button
                color="blue"
                size="xs"
                className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                onClick={onAddNew}
              >
                <HiPlus className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Search bar row - below header, aligned right */}
        <div className="flex w-full mb-2 items-end justify-end">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={`Search ${total} records...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table with fixed widths and new column */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
            <div className="min-w-[1000px] lg:min-w-full">
              <div className="overflow-auto max-h-[390px] relative">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                  <thead className="sticky top-0 z-2 h-8">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="bg-blue-600 dark:bg-blue-700">
                        {headerGroup.headers.map((header) => {
                          let width = 'auto';
                          if (header.column.id === 'serialNo') width = '60px';
                          else if (header.column.id === 'itemCategoryName') width = '250px';
                          else if (header.column.id === 'accountName') width = '200px';
                          else if (header.column.id === 'status') width = '100px';
                          else if (header.column.id === 'changeStatus') width = '120px';
                          else if (header.column.id === 'modify') width = '90px';
                          return (
                            <th
                              key={header.id}
                              className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                              style={{ width }}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className="flex items-center gap-1">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {getSortIcon(header.column.id)}
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
                            let width = 'auto';
                            if (cell.column.id === 'serialNo') width = '60px';
                            else if (cell.column.id === 'itemCategoryName') width = '250px';
                            else if (cell.column.id === 'accountName') width = '200px';
                            else if (cell.column.id === 'status') width = '100px';
                            else if (cell.column.id === 'changeStatus') width = '120px';
                            else if (cell.column.id === 'modify') width = '90px';

                            // Status cell uses badge
                            if (cell.column.id === 'status') {
                              return (
                                <td
                                  key={cell.id}
                                  className="px-1.5 py-1 align-top"
                                  style={{ width }}
                                >
                                  <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        row.original.status === 'Active'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}
                                    >
                                      {row.original.status}
                                    </span>
                                  </div>
                                </td>
                              );
                            }

                            // Change Status cell with toggle
                            if (cell.column.id === 'changeStatus') {
                              return (
                                <td
                                  key={cell.id}
                                  className="px-1.5 py-1 align-top"
                                  style={{ width }}
                                >
                                  <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                                    <label className="inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={row.original.status === 'Active'}
                                        onChange={() => handleStatusToggle(row.original.id, row.original.status, row.original.itemCategoryName)}
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
                                </td>
                              );
                            }

                            // Modify cell
                            if (cell.column.id === 'modify') {
                              return (
                                <td
                                  key={cell.id}
                                  className="px-1.5 py-1 align-top"
                                  style={{ width }}
                                >
                                  <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                                    {row.original.renderModify && (
                                      <button
                                        onClick={() => openEdit(row.original)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                                      >
                                        <SquarePen size={16} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              );
                            }

                            // Default cell rendering for other columns
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
                        <td colSpan={6} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <Package className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
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

        {/* Pagination */}
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
      </div>

      {/* Edit Modal - status toggle button removed */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center backdrop-blur-sm justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Edit className="text-blue-600" size={25} />
                Edit Item Category
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status toggle button block removed */}

            <form onSubmit={(e) => { e.preventDefault(); handleModifyClick(); }} className="p-6 space-y-6">
              {/* Item Category Name */}
              <FloatingInput
                id="editItemCategoryName"
                name="itemCategoryName"
                value={editItemCategoryName}
                onChange={(e) => setEditItemCategoryName(e.target.value)}
                label="Category Name"
                required
              />

              {/* Account ID Searchable Dropdown */}
              <div ref={dropdownRef}>
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={toggleEditDropdown}
                    className="peer h-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm 
                               bg-transparent text-gray-900 dark:text-gray-100
                               flex items-center justify-between
                               focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400"
                  >
                    <span className={`truncate ${!editItemAccountId ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                      {isEditValueSelected ? getDisplayValue() : ''}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showEditDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Label */}
                  <span className={`absolute transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 dark:peer-focus:text-blue-400
                    ${isEditValueSelected || showEditDropdown ? '-top-3 left-2 text-xs bg-white dark:bg-gray-800 px-1 text-gray-600 dark:text-gray-300' : 'top-1/2 left-4 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-500'}`}>
                    {isEditValueSelected || showEditDropdown ? (
                      <>Account Id <sup className="text-red-600 text-sm">*</sup></>
                    ) : (
                      'Please select Account Id'
                    )}
                  </span>

                  {showEditDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search accounts..."
                            value={editSearchTerm}
                            onChange={handleEditSearchChange}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 max-h-48">
                        {filteredEditAccounts.length > 0 ? (
                          filteredEditAccounts.map((account) => (
                            <button
                              key={account.pk}
                              type="button"
                              onClick={() => handleEditAccountChange(account.pk.toString())}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 
                                         ${editItemAccountId === account.pk.toString() 
                                           ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' 
                                           : ''}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {account.code}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {account.name}
                                </span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No accounts found
                          </div>
                        )}
                      </div>
                      {editItemAccountId && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => {
                              setEditItemAccountId('');
                              setEditItemAccountName('');
                              setEditSearchTerm('');
                            }}
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

              {/* Account Name - Read Only */}
              <FloatingInput
                id="editItemAccountName"
                name="accountName"
                value={editItemAccountName}
                onChange={() => {}}
                label="Account Name"
                readOnly
              />

              {/* Current Status */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <Label className="text-blue-600 text-lg font-semibold mb-2 dark:text-blue-400 block">Current Status</Label>
                <div className="flex items-center gap-2">
                  <Badge color={editStatus === "Active" ? "success" : "failure"} className="capitalize text-xs">
                    {editStatus}
                  </Badge>
                  <span className="text-xs text-gray-600 dark:text-gray-300">This is the current status of the item.</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Tooltip content="Cancel">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </Tooltip>
                <Tooltip content="Save Changes">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </Tooltip>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        confirmType={confirmType || 'add'}
        targetId={targetItemName || undefined}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />

      {/* Session Expired Modal */}
      {showSessionModal && <SessionModal />}

      {/* Toastify */}
      <Toastify />
    </>
  );
};

export default ItemCategoryList;