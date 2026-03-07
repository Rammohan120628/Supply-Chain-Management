import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Badge, Button, Label } from 'flowbite-react';
import React, { useState, useEffect, useMemo } from 'react';
import { HiPlus, HiX } from 'react-icons/hi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SquarePen, CircleCheckBig, Search, Package } from 'lucide-react';
import Toastify, { showToast } from 'src/views/Toastify';
import SessionModal from 'src/views/SessionModal';
import { Tooltip } from 'flowbite-react';
// ---------- Floating Input Component (unchanged) ----------
interface FloatingInputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  label: React.ReactNode;
  required?: boolean;
  error?: string;
  suffix?: string;
  options?: { value: string; label: string }[];
  readOnly?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type = 'text', value, onChange = () => {}, onBlur,
  label, required = false, error, suffix, options, readOnly = false
}) => {
  const baseInputClass = `peer w-full px-4 py-2 border rounded-sm bg-transparent text-gray-900 dark:text-white focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${suffix ? 'pr-8' : ''} ${readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''} ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`;

  if (type === 'select' && options) {
    return (
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={readOnly}
          className={baseInputClass}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label
          htmlFor={id}
          className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none text-xs bg-white dark:bg-gray-700 px-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    );
  }

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
        onWheel={(e) => e.currentTarget.blur()}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {suffix && <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none">{suffix}</span>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ---------- Confirm Modal (exact same as VATCategory) ----------
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
        return 'Are you sure you want to save this new Consolidate Account?';
      case 'edit':
        return `Are you sure you want to modify this Consolidate Account?${targetId ? ` (ID: ${targetId})` : ''}`;
      case 'status':
        return `Are you sure you want to change the status of ${targetId || 'this Consolidate Account'}? This action cannot be undone.`;
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

// ---------- ConsolidateAccountList Component ----------
interface ConsolidateAccountData {
  consPk: number;
  consId: string;
  consName: string;
  status: 'Active' | 'In-Active';
  createdBy: number;
  createdDate: string;
  lastActBY: number;
  lastActDate: string;
  renderActive: boolean;
  renderInActive: boolean;
  renderModify: boolean;
}

interface ConsolidateAccountTableProps {
  onAddNew?: () => void;
}

const ConsolidateAccountList: React.FC<ConsolidateAccountTableProps> = ({ onAddNew }) => {
  const [data, setData] = useState<ConsolidateAccountData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConsolidateAccountData | null>(null);
  const [editAccountId, setEditAccountId] = useState('');
  const [editAccountName, setEditAccountName] = useState('');
  const [editStatus, setEditStatus] = useState<ConsolidateAccountData['status']>('Active');
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Unified confirm modal states
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | 'download' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetItemName, setTargetItemName] = useState<string>('');

  const columnHelper = createColumnHelper<ConsolidateAccountData>();

  const getToken = () => localStorage.getItem('authToken') || '';

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const defaultOptions: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      if (response.status === 401) {
        setShowSessionExpired(true);
        throw new Error('Session expired');
      }
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      setShowSessionExpired(true);
      if (error instanceof Error && error.message === 'Session expired') {
        throw error;
      }
      console.error('API call error:', error);
      throw new Error('Failed to fetch data');
    }
  };

  // Status change via toggle (new)
  const handleStatusToggle = (consPk: number, currentStatus: ConsolidateAccountData['status'], consId: string) => {
    setTargetItemName(consId);
    setConfirmType('status');
    setConfirmAction(() => () => confirmStatusChange(consPk, currentStatus));
    setShowConfirm(true);
  };

  const confirmStatusChange = async (consPk: number, currentStatus: ConsolidateAccountData['status']) => {
    setIsGlobalLoading(true);
    try {
      const newStatus = currentStatus === 'Active' ? 'I' : 'A';
      await apiCall(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/consolidateStatusUpdate',
        {
          method: 'POST',
          body: JSON.stringify({ consPk, status: newStatus }),
        }
      );

      const newStatusText = newStatus === 'A' ? 'Active' : 'In-Active';
      setData((prev) =>
        prev.map((it) => (it.consPk === consPk ? { ...it, status: newStatusText } : it))
      );

      // If the edited item is currently open, update its status there as well
      if (selectedItem && selectedItem.consPk === consPk) {
        setSelectedItem((prev) => (prev ? { ...prev, status: newStatusText } : prev));
        setEditStatus(newStatusText);
      }

      showToast(`Status updated to ${newStatusText} successfully`, 'success');
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  // Open edit modal
  const openEdit = async (item: ConsolidateAccountData) => {
    setIsGlobalLoading(true);
    try {
      const response = await apiCall(
        `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/viewConsolidateAcc/${item.consPk}`
      );
      if (response.success && response.data) {
        setSelectedItem(response.data);
        setEditAccountId(response.data.consId);
        setEditAccountName(response.data.consName);
        setEditStatus(response.data.status);
        setShowEditModal(true);
      } else {
        showToast('Failed to fetch account details', 'error');
      }
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error fetching account details:', error);
      if (error instanceof Error && error.message === 'Session expired') {
        return;
      }
      showToast('Failed to fetch account details', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setEditAccountId('');
    setEditAccountName('');
    setEditStatus('Active');
  };

  // Modify confirmation
  const requestUpdate = () => {
    if (!editAccountName.trim()) {
      showToast('Consolidated Name is required.', 'error');
      return;
    }
    if (!selectedItem) return;
    setTargetItemName(selectedItem.consId);
    setConfirmType('edit');
    setConfirmAction(() => handleConfirmModify);
    setShowConfirm(true);
  };

  const handleConfirmModify = async () => {
    if (!selectedItem) return;
    setIsGlobalLoading(true);
    try {
      await apiCall(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/modifyConsolidateAcco',
        {
          method: 'POST',
          body: JSON.stringify({
            consPk: selectedItem.consPk,
            consName: editAccountName.trim().toString(),
          }),
        }
      );

      setData((prev) =>
        prev.map((it) =>
          it.consPk === selectedItem.consPk
            ? { ...it, consName: editAccountName.trim(), status: editStatus }
            : it
        )
      );

      showToast('Consolidate account updated successfully.', 'success');
      closeEdit();
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error updating account:', error);
      if (error instanceof Error && error.message === 'Session expired') {
        return;
      }
      showToast('Failed to update account', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const fetchData = async () => {
    setIsGlobalLoading(true);
    try {
      const response = await apiCall(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/listConsolidateAcc'
      );
      if (response.success && response.data) {
        setData(response.data);
      } else {
        showToast('Failed to fetch data', 'error');
      }
    } catch (error) {
      setShowSessionExpired(true);
      console.error('Error fetching data:', error);
      if (error instanceof Error && error.message === 'Session expired') {
        return;
      }
      showToast('Failed to fetch data', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Updated column definitions
  const columns = [
    columnHelper.display({
      id: 'serialNo',
      header: () => <span>S.No</span>,
      cell: ({ row }) => {
        const { pageIndex, pageSize } = pagination;
        return <span className="text-xs">{pageIndex * pageSize + row.index + 1}</span>;
      },
      enableSorting: false,
    }),
    columnHelper.accessor('consId', {
      header: () => <span>Consolidated Id</span>,
      cell: (info) => <p className="text-xs">{info.getValue()}</p>,
    }),
    columnHelper.accessor('consName', {
      header: () => <span>Consolidated Name</span>,
      cell: (info) => <p className="text-xs">{info.getValue()}</p>,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: (info) => {
        const status = info.getValue() as ConsolidateAccountData['status'];
        return (
          <Badge color={status === 'Active' ? 'success' : 'failure'} className="capitalize text-xs">
            {status}
          </Badge>
        );
      },
    }),
    // NEW COLUMN: Change Status toggle
    columnHelper.display({
      id: 'changeStatus',
      header: () => <span>Change Status</span>,
      cell: ({ row }) => {
        const { consPk, status, consId } = row.original;
        const isActive = status === 'Active';
        return (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isActive}
              onChange={() => handleStatusToggle(consPk, status, consId)}
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
        );
      },
      enableSorting: false,
    }),
    columnHelper.display({
      id: 'modify',
      header: () => <span>Modify</span>,
      cell: ({ row }) => (
        <button
          disabled={!row.original.renderModify}
          onClick={() => openEdit(row.original)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-150 
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="Modify"
        >
          <SquarePen
            className={`w-4 h-4 ${
              row.original.renderModify
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        </button>
      ),
      enableSorting: false,
    }),
  ];

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
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

  // Helper for sorting emoji
  const getSortEmoji = (column: any) => {
    if (column.getIsSorted() === 'asc') return ' 🔼';
    if (column.getIsSorted() === 'desc') return ' 🔽';
    return ' ↕️';
  };

  // Column widths (updated for new column)
  const columnWidths: Record<string, string> = {
    serialNo: '50px',
    consId: '120px',
    consName: '200px',
    status: '100px',
    changeStatus: '120px',
    modify: '80px',
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
    setTargetItemName('');
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
    setTargetItemName('');
  };

  return (
    <>
      <Toastify />

      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <div className="max-h-screen w-full mx-auto p-4 sm:p-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Header: Title and Add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-4">
          <h1 className="text-xl text-indigo-700 dark:text-indigo-400 mb-4 sm:mb-0 flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-700" /> Consolidate Account List
          </h1>
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <Tooltip content='Add'>
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

        {/* Search row (below header, aligned right) */}
        <div className="flex justify-end mb-2">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={`Search ${total} records...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                {header.id !== 'serialNo' && header.id !== 'changeStatus' && header.id !== 'modify' && (
                                  <span>{getSortEmoji(header.column)}</span>
                                )}
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
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-screen overflow-y-auto shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-600 dark:text-white">Edit Consolidate Account</h2>
                  <button
                    onClick={closeEdit}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-150"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Only Modify button remains */}
                <div className="flex justify-end gap-3 mb-6 items-center">
                  <Button
                    color="blue"
                    onClick={requestUpdate}
                    className="px-4 py-2 rounded-lg transition-colors duration-200 hover:shadow-md"
                  >
                    Modify
                  </Button>
                </div>

                <div className="space-y-4">
                  <FloatingInput
                    id="consolidateAccountIdModal"
                    name="consolidateAccountIdModal"
                    value={editAccountId}
                    label="Consolidated Id"
                    readOnly
                  />

                  <FloatingInput
                    id="consolidateAccountNameModal"
                    name="consolidateAccountNameModal"
                    value={editAccountName}
                    onChange={(e) => setEditAccountName(e.target.value)}
                    label="Consolidated Name"
                    required
                  />

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <Label className="text-blue-600 text-lg font-semibold mb-2 dark:text-blue-400 block">
                      Current Status
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge color={editStatus === 'Active' ? 'success' : 'failure'} className="capitalize text-xs">
                        {editStatus}
                      </Badge>
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        This is the current status of the account.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unified Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirm}
          confirmType={confirmType || 'edit'}
          targetId={targetItemName}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />

        {/* Session Expired Modal */}
        {showSessionExpired && <SessionModal />}
      </div>
    </>
  );
};

export default ConsolidateAccountList;