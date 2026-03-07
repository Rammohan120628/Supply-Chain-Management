import React, { useState, useMemo, useEffect } from "react";
import { Tooltip, Badge, Button } from "flowbite-react";
import {
  SquarePen,
  CircleCheckBig,
  Search,
  Plus,
  X,
  Check,
  Package,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Toastify, { showToast } from "../Toastify";
import SessionModal from "src/views/SessionModal";

// ---------- Confirm Modal ----------
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
        return `Are you sure you want to save "${targetId || 'this item'}"?`;
      case 'edit':
        return `Are you sure you want to modify "${targetId || 'this item'}"?`;
      case 'status':
        return `Are you sure you want to change the status of "${targetId || 'this item'}"?`;
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
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 shadow-lg ${
            isStatus
              ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 ring-red-200/50 dark:ring-red-900/30'
              : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 ring-green-200/50 dark:ring-green-900/30'
          }`}>
            <CircleCheckBig className={`w-8 h-8 animate-pulse ${
              isStatus ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`} />
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

// ---------- FloatingInput ----------
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

interface ItemQuantityData {
  id: number;
  itemQuantityPk: number;
  itemQuantityName: string;
  status: "Active" | "In-Active";
  statusColor: "success" | "failure" | string;
  createdBy?: number;
  createdDate?: string;
  lastActBy?: number;
  lastActDate?: string;
  entityId?: string;
}

interface ItemQuantityTableProps {
  onAddNew?: () => void;
}

const ItemQuantityList: React.FC<ItemQuantityTableProps> = ({ onAddNew }) => {
  const [data, setData] = useState<ItemQuantityData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: 'itemQuantityName' | 'status'; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<ItemQuantityData | null>(null);
  const [editQuantityName, setEditQuantityName] = useState("");
  const [editStatus, setEditStatus] = useState<ItemQuantityData["status"]>("Active");
  const [editError, setEditError] = useState("");
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | 'download'>('add');
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [targetItemName, setTargetItemName] = useState('');

  const recordsPerPage = 10;
  const baseUrl = "http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController";

  const fetchData = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowSessionExpired(true);
      return;
    }
    setIsGlobalLoading(true);
    try {
      const response = await fetch(`${baseUrl}/listMstItemQuantity`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        throw new Error('Failed to fetch item quantities');
      }
      const result = await response.json();
      if (result.success) {
        const mappedData = result.data.map((item: any) => ({
          ...item,
          id: item.itemQuantityPk,
          statusColor: item.status === "Active" ? "success" : "failure"
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

  // Emoji sorting indicator
  const getSortEmoji = (key: 'itemQuantityName' | 'status') => {
    if (!sortConfig || sortConfig.key !== key) return ' ↕️';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  // Manual sort + filter
  const filteredSortedData = useMemo(() => {
    let filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const key = sortConfig.key;
        let aVal = (a[key] ?? '').toString().toLowerCase();
        let bVal = (b[key] ?? '').toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);

  const totalRows = filteredSortedData.length;
  const totalPages = Math.ceil(totalRows / recordsPerPage) || 1;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRows);
  const currentRows = filteredSortedData.slice(startIndex, endIndex);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  // Clamp page if data shrinks
  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSort = (key: 'itemQuantityName' | 'status') => {
    setSortConfig((prev) => {
      if (prev && prev.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const openEdit = async (item: ItemQuantityData) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowSessionExpired(true);
      return;
    }
    setIsGlobalLoading(true);
    try {
      const response = await fetch(`${baseUrl}/viewMstItemQuantity/${item.itemQuantityPk}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
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
      setEditQuantityName(fetchedItem.itemQuantityName || '');
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
    setEditQuantityName("");
    setEditStatus("Active");
    setEditError('');
  };

  const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditQuantityName(value);
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setEditError('Item quantity Name is required.');
    } else if (trimmed.length < 4 || trimmed.length > 15) {
      setEditError('Item quantity Name must be between 4 and 15 characters.');
    } else {
      setEditError('');
    }
  };

  // ----- New function for status toggle from table -----
  const updateItemQuantityStatus = async (itemQuantityPk: number, newStatus: string) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowSessionExpired(true);
      return;
    }

    const body = { itemQuantityPk, status: newStatus };
    const response = await fetch(`${baseUrl}/mstItemQuantityStatusUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      if (response.status === 401) {
        setShowSessionExpired(true);
        return;
      }
      throw new Error(result.message || 'Failed to update status');
    }

    const newColor = newStatus === "Active" ? "success" : "failure";
    setData((prev) =>
      prev.map((item) =>
        item.itemQuantityPk === itemQuantityPk
          ? { ...item, status: newStatus as ItemQuantityData["status"], statusColor: newColor }
          : item
      )
    );

    // If the item is currently open in edit modal, update its status there too
    if (editItem && editItem.itemQuantityPk === itemQuantityPk) {
      setEditItem((prev) => prev ? { ...prev, status: newStatus as ItemQuantityData["status"] } : prev);
      setEditStatus(newStatus as ItemQuantityData["status"]);
    }
  };

  // Handler for toggle click
  const handleStatusToggle = (id: number, currentStatus: string, itemName: string) => {
    setTargetItemName(itemName);
    setConfirmType('status');
    const newStatus = currentStatus === "Active" ? "In-Active" : "Active";
    setConfirmAction(() => async () => {
      setIsGlobalLoading(true);
      try {
        await updateItemQuantityStatus(id, newStatus);
        showToast(`Status changed to ${newStatus} successfully`, "success");
      } catch (error: any) {
        showToast(error.message, 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    });
    setShowConfirm(true);
  };

  // ----- Modify (name update only) -----
  const updateItemQuantity = async (trimmedName: string) => {
    if (!editItem) return;
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const entity = localStorage.getItem('entity');
    if (!authToken) {
      setShowSessionExpired(true);
      return;
    }
    if (!userId || !entity || trimmedName.length < 4 || trimmedName.length > 15) {
      return;
    }
    const body = {
      itemQuantityPk: editItem.itemQuantityPk,
      itemQuantityName: trimmedName,
      status: editStatus,
      createdBy: editItem.createdBy,
      lastActBy: parseInt(userId),
      entityId: entity
    };
    const response = await fetch(`${baseUrl}/modifyMstItemQuantity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      if (response.status === 401) {
        setShowSessionExpired(true);
        return;
      }
      throw new Error(result.message || 'Failed to update item quantity');
    }

    setData((prev) =>
      prev.map((it) =>
        it.id === editItem.itemQuantityPk
          ? { ...it, itemQuantityName: trimmedName }
          : it
      )
    );
    showToast("Item quantity updated successfully.", "success");
    closeEdit();
  };

  const performUpdate = () => {
    const trimmedName = editQuantityName.trim();
    if (trimmedName.length === 0) {
      showToast('Item quantity name is required.', 'error');
      return;
    }
    if (trimmedName.length < 4 || trimmedName.length > 15) {
      showToast('Item quantity Name must be between 4 and 15 characters.', 'error');
      return;
    }
    const action = async () => {
      setIsGlobalLoading(true);
      try {
        await updateItemQuantity(trimmedName);
      } catch (error: any) {
        showToast(error.message, 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    };
    setConfirmType('edit');
    setConfirmAction(() => action);
    setTargetItemName(trimmedName);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
    setTargetItemName('');
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setTargetItemName('');
  };

  return (
    <div className="max-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-1 sm:p-1 transition-colors duration-300 overflow-hidden">
      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4">
        {/* Header with title and Add button only */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2">
          <h1 className="text-xl text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <Package className="h-8 w-8" /> Item Quantity List
          </h1>
          <Tooltip content="Add">
            <Button
              color="blue"
              size="xs"
              className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
              onClick={onAddNew}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>

        {/* Search bar moved below header, aligned to the right */}
        <div className="flex justify-end mb-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={`Search ${totalRows} records...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Uniform Table UI with overflow-y */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
            <div className="min-w-[800px] lg:min-w-full">
              <div className="overflow-auto max-h-[390px] relative">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                  <thead className="sticky top-0 z-2 h-8 bg-blue-600 dark:bg-blue-700">
                    <tr>
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                        style={{ width: '60px' }}
                      >
                        S.No
                      </th>
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                        style={{ width: '350px' }}
                        onClick={() => handleSort('itemQuantityName')}
                      >
                        <div className="flex items-center gap-1">
                          Item Quantity Name
                          <span className="text-xs">{getSortEmoji('itemQuantityName')}</span>
                        </div>
                      </th>
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none"
                        style={{ width: '100px' }}
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          <span className="text-xs">{getSortEmoji('status')}</span>
                        </div>
                      </th>
                      {/* New Change Status column */}
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                        style={{ width: '120px' }}
                      >
                        <div className="flex items-center gap-1">Change Status</div>
                      </th>
                      <th
                        className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                        style={{ width: '90px' }}
                      >
                        Modify
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentRows.length > 0 ? (
                      currentRows.map((row, index) => (
                        <tr
                          key={row.itemQuantityPk}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                        >
                          <td className="px-1.5 py-1 align-top" style={{ width: '60px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              {startIndex + index + 1}
                            </div>
                          </td>
                          <td className="px-1.5 py-1 align-top" style={{ width: '350px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              {row.itemQuantityName}
                            </div>
                          </td>
                          <td className="px-1.5 py-1 align-top" style={{ width: '100px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                  row.status === "Active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {row.status}
                              </span>
                            </div>
                          </td>
                          {/* Toggle switch for status change */}
                          <td className="px-1.5 py-1 align-top" style={{ width: '120px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={row.status === 'Active'}
                                  onChange={() => handleStatusToggle(row.itemQuantityPk, row.status, row.itemQuantityName)}
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
                          <td className="px-1.5 py-1 align-top" style={{ width: '90px' }}>
                            <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                              <button
                                onClick={() => openEdit(row)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                              >
                                <SquarePen size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center">
                            <Database className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                              {searchTerm ? "No matching records found" : "No records found"}
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
        {totalRows > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
            <div>
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalRows)}</span> of{' '}
              <span className="font-medium">{totalRows}</span> records
              {searchTerm && (
                <span>
                  {' '}for search: <span className="font-medium">"{searchTerm}"</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px]">
                {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors flex items-center gap-0.5 ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <ChevronLeft className="w-2.5 h-2.5" />
                  Prev
                </button>
                <span className="px-2 py-0.5 text-[12px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors flex items-center gap-0.5 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Next
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal – status toggle button removed */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center backdrop-blur-sm justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <SquarePen className="text-blue-600" size={25} />
                Edit Item Quantity
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); performUpdate(); }} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FloatingInput
                  id="itemQuantityNameModal"
                  name="itemQuantityName"
                  value={editQuantityName}
                  onChange={handleEditNameChange}
                  label="Item Quantity Name"
                  required
                  error={editError}
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <label className="text-blue-600 text-lg font-semibold mb-2 dark:text-blue-400 block">Current Status</label>
                <div className="flex items-center gap-2">
                  <Badge color={editStatus === "Active" ? "success" : "failure"} className="capitalize text-xs">
                    {editStatus}
                  </Badge>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Current status of the item.</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        confirmType={confirmType}
        targetId={targetItemName}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />

      {/* Session Expired Modal */}
      {showSessionExpired && <SessionModal />}

      {/* Toastify */}
      <Toastify />
    </div>
  );
};

export default ItemQuantityList;