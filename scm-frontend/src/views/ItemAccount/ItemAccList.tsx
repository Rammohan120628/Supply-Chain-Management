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
import { SquarePen, CircleCheckBig, Search, Database } from 'lucide-react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Toastify, { showToast } from 'src/views/Toastify';
import SessionModal from 'src/views/SessionModal';
import { Package } from 'lucide-react';

// ---------- Floating Input Component (unchanged) ----------
interface FloatingInputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  label: React.ReactNode;
  required?: boolean;
  error?: string;
  options?: { value: string; label: string }[];
  readOnly?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, name, type = 'text', value, onChange, onBlur,
  label, required = false, error, options, readOnly = false
}) => {
  const baseClass = `peer w-full px-4 py-2 border rounded-sm bg-transparent text-gray-900 dark:text-white focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
    readOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
  } ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`;

  const floatingLabelClass = `absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none text-xs bg-white dark:bg-gray-700 px-1 peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1`;

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
          className={`${baseClass} peer`}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label htmlFor={id} className={floatingLabelClass}>
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
        className={baseClass}
        onWheel={(e) => e.currentTarget.blur()}
      />
      <label htmlFor={id} className={floatingLabelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ---------- ItemAccountData Type ----------
interface ItemAccountData {
  itemAccountPk: number;
  accountId: string;
  accountName: string;
  accountType: string;
  status: string;
  consAccountId: string;
  consAccountName: string;
  statusColor: string;
}

interface ItemAccountTableProps {
  onAddNew?: () => void;
}

const ItemAccountList: React.FC<ItemAccountTableProps> = ({ onAddNew }) => {
  const [data, setData] = useState<ItemAccountData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemAccountData | null>(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountType, setEditAccountType] = useState('');
  const [editConsAccountName, setEditConsAccountName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editInputValue, setEditInputValue] = useState('');
  const [, setFilteredEditAccounts] = useState<any[]>([]);
  const [consOptions, setConsOptions] = useState<any[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Unified confirm modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | 'download' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetSupplierId, setTargetSupplierId] = useState<string | null>(null);

  const columnHelper = createColumnHelper<ItemAccountData>();
  const token = localStorage.getItem('authToken');
  const baseUrl =
    'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController';
  const listUrl = `${baseUrl}/listMstItemAccount`;
  const dropdownUrl = `${baseUrl}/loadConsolidateDropdown`;
  const viewUrl = (pk: number) => `${baseUrl}/viewMstItemAccount/${pk}`;
  const modifyUrl = `${baseUrl}/modifyMstItemAccount`;
  const statusUrl = `${baseUrl}/mstItemAccountStatusUpdate`;

  const typeOptions = [
    { value: 'E', label: 'Type-1 E' },
    { value: 'I', label: 'Type-1 I' },
    { value: 'A', label: 'Type-1 A' },
  ];

  const getTypeLabel = (value: string) => {
    const opt = typeOptions.find((o) => o.value === value);
    return opt ? opt.label : value;
  };

  // ---------- API Functions (unchanged, but using global loading) ----------
  const fetchConsolidateDropdown = async () => {
    if (!token) return;
    setIsGlobalLoading(true);
    try {
      const res = await fetch(dropdownUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch dropdown');
      const response = await res.json();
      if (response.success) {
        setConsOptions(
          response.data.map((item: any) => ({
            value: item.pk,
            label: `${item.code} - ${item.name}`,
            code: item.code,
          }))
        );
      } else {
        showToast('Failed to load dropdown data.', 'error');
      }
    } catch (e) {
      setShowSessionModal(true);
      showToast('Error loading dropdown.', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const fetchData = async () => {
    setIsGlobalLoading(true);
    if (!token) {
      setIsGlobalLoading(false);
      return;
    }
    try {
      const res = await fetch(listUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch list');
      const response = await res.json();
      if (response.success) {
        setData(
          response.data.map((item: any) => ({
            ...item,
            statusColor: item.status === 'Active' ? 'success' : 'failure',
          }))
        );
      } else {
        showToast('Failed to load data.', 'error');
      }
    } catch (e) {
      setShowSessionModal(true);
      showToast('Error fetching data.', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchConsolidateDropdown();
    fetchData();
  }, []);

  const openEdit = async (item: ItemAccountData) => {
    setSelectedItem(item);
    if (!token) return;
    setIsGlobalLoading(true);
    try {
      const res = await fetch(viewUrl(item.itemAccountPk), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch view data');
      const response = await res.json();
      if (response.success) {
        const viewData = response.data;
        setEditAccountName(viewData.accountName || '');
        setEditAccountType(viewData.accountType || '');
        setEditInputValue(viewData.consAccountName || '');
        setEditConsAccountName(viewData.consAccFk?.toString() || '');
        setEditStatus(viewData.status || '');
        setShowEditModal(true);
      } else {
        showToast('Failed to load edit data.', 'error');
      }
    } catch (e) {
      showToast('Error loading edit data.', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setEditAccountName('');
    setEditAccountType('');
    setEditConsAccountName('');
    setEditStatus('');
    setEditInputValue('');
  };

  const requestToggleStatus = (item: ItemAccountData) => {
    setTargetSupplierId(item.accountId);
    setConfirmType('status');
    setConfirmAction(() => () => performToggleStatus(item));
    setShowConfirm(true);
  };

  const performToggleStatus = async (item: ItemAccountData) => {
    setShowConfirm(false);
    setConfirmType(null);
    setConfirmAction(null);
    setTargetSupplierId(null);

    const newStatus = item.status === 'Active' ? 'In-Active' : 'Active';
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      showToast('Authentication required.', 'error');
      return;
    }

    setIsGlobalLoading(true);
    try {
      const body = { itemAccountPk: item.itemAccountPk, status: newStatus };
      const res = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!res.ok) throw new Error('Status update failed');
      const response = await res.json();
      if (response.success) {
        setData((prev) =>
          prev.map((i) =>
            i.itemAccountPk === item.itemAccountPk
              ? { ...i, status: newStatus, statusColor: newStatus === 'Active' ? 'success' : 'failure' }
              : i
          )
        );
        const action = newStatus === 'Active' ? 'Active' : 'In-Active';
        showToast(`Status ${action} successfully.`, 'success');
        closeEdit();
      } else {
        showToast(response.message || 'Status update failed.', 'error');
      }
    } catch (e) {
      showToast('Error updating status.', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const requestUpdate = () => {
    if (!editAccountName.trim()) {
      showToast('Account Name is required.', 'error');
      return;
    }
    if (!editAccountType) {
      showToast('Account Type is required.', 'error');
      return;
    }
    if (!editConsAccountName) {
      showToast('Cons Account Name is required.', 'error');
      return;
    }

    setTargetSupplierId(selectedItem?.accountId || null);
    setConfirmType('edit');
    setConfirmAction(() => performUpdate);
    setShowConfirm(true);
  };

  const performUpdate = async () => {
    setShowConfirm(false);
    setConfirmType(null);
    setConfirmAction(null);
    setTargetSupplierId(null);

    if (!selectedItem) return;
    const userId = localStorage.getItem('userId');
    const lastActDate = new Date().toISOString();
    if (!token || !userId) {
      showToast('Authentication required.', 'error');
      return;
    }

    setIsGlobalLoading(true);
    try {
      const body = {
        itemAccountPk: selectedItem.itemAccountPk,
        accountName: editAccountName.trim(),
        accountType: editAccountType,
        consAccFk: parseInt(editConsAccountName),
        lastActBy: parseInt(userId),
        lastActDate: lastActDate,
      };
      const res = await fetch(modifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!res.ok) throw new Error('Update failed');
      const response = await res.json();
      if (response.success) {
        const selectedCons = consOptions.find(
          (o: any) => o.value.toString() === editConsAccountName
        );
        const newConsId = selectedCons ? selectedCons.code : '';
        const newConsName = selectedCons ? selectedCons.label : editInputValue;
        setData((prevData) =>
          prevData.map((item) =>
            item.itemAccountPk === selectedItem.itemAccountPk
              ? {
                  ...item,
                  accountName: editAccountName.trim(),
                  accountType: editAccountType,
                  consAccountId: newConsId,
                  consAccountName: newConsName,
                }
              : item
          )
        );
        showToast('Item account updated successfully.', 'success');
        closeEdit();
      } else {
        showToast(response.message || 'Update failed.', 'error');
      }
    } catch (e) {
      showToast('Error updating item account.', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const total = filteredData.length;

  useEffect(() => {
    const filtered = consOptions.filter((opt: any) =>
      opt.label.toLowerCase().includes(editInputValue.toLowerCase())
    );
    setFilteredEditAccounts(filtered);
  }, [editInputValue, consOptions]);

  // ---------- Column Definitions (updated with S.No) ----------
  const columns = [
    // S.No Column
    columnHelper.display({
      id: 'serialNo',
      header: () => <span>S.No</span>,
      cell: ({ row }) => {
        const { pageIndex, pageSize } = pagination;
        return <span>{pageIndex * pageSize + row.index + 1}</span>;
      },
      enableSorting: false,
    }),
    // Combined Account column (ID + Name)
    columnHelper.display({
      id: 'account',
      header: () => <span>Account</span>,
      cell: ({ row }) => (
        <span>
          {row.original.accountId || 'NA'} - {row.original.accountName || 'NA'}
        </span>
      ),
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = `${rowA.original.accountId} - ${rowA.original.accountName}`;
        const b = `${rowB.original.accountId} - ${rowB.original.accountName}`;
        return a.localeCompare(b);
      },
    }),
    columnHelper.accessor('accountType', {
      header: () => <span>Account Type</span>,
      cell: (info) => <span>{getTypeLabel(info.getValue() || '') || 'NA'}</span>,
    }),
    columnHelper.accessor('consAccountId', {
      header: () => <span>Cons Account Id</span>,
      cell: (info) => <span>{info.getValue() || 'NA'}</span>,
    }),
    columnHelper.accessor('consAccountName', {
      header: () => <span>Cons Account Name</span>,
      cell: (info) => <span>{info.getValue() || 'NA'}</span>,
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
        const item = row.original;
        const isActive = item.status === 'Active';
        const buttonText = isActive ? 'In-Active' : 'Active';
        return (
          <label className="inline-flex items-center cursor-pointer">
  <input
    type="checkbox"
    className="sr-only peer"
    checked={isActive}
    onChange={() => requestToggleStatus(item)}
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
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
          onClick={() => openEdit(row.original)}
          aria-label={`Edit ${row.original.accountName}`}
        >
          <SquarePen size={16} />
        </button>
      ),
      enableSorting: false,
    }),
  ];

  // ---------- TanStack Table ----------
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
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);
  const pageCount = table.getPageCount();

  const handlePrevPage = () => pageIndex > 0 && table.setPageIndex(pageIndex - 1);
  const handleNextPage = () => pageIndex < pageCount - 1 && table.setPageIndex(pageIndex + 1);

  // Updated column widths (added serialNo)
  const columnWidths: Record<string, string> = {
    serialNo: '50px',
    account: '200px',
    accountType: '120px',
    consAccountId: '120px',
    consAccountName: '180px',
    status: '100px',
    changeStatus: '130px',
    modify: '80px',
  };

  // Helper for sorting emoji (always present)
  const getSortEmoji = (column: any) => {
    if (column.getIsSorted() === 'asc') return ' 🔼';
    if (column.getIsSorted() === 'desc') return ' 🔽';
    return ' ↕️';
  };

  // ---------- Main Render ----------
  return (
    <>
      <Toastify />

      {/* Global Loading Overlay – used for all API calls */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-h-screen w-full mx-auto p-4 sm:p-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-4">
          <h1 className="text-xl text-indigo-700 dark:text-indigo-400 mb-4 sm:mb-0 flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-700" /> Item Account List
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

        <div className="w-full flex items-end justify-end mb-2">
          <div className="relative">
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
                        <td colSpan={columns.length} className="px-3 py-4 text-center">
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

        {/* Edit Modal (unchanged) */}
        {showEditModal && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-600">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-600 dark:text-white">Edit Item Account</h2>
                  <button
                    onClick={closeEdit}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-150"
                    aria-label="Close edit modal"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex justify-end gap-3 mb-6 items-center">
                  <Button color="blue" onClick={requestUpdate} className="px-4 py-2 rounded-lg transition-colors duration-200 hover:shadow-md">
                    Modify
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FloatingInput
                      id="editAccountId"
                      name="editAccountId"
                      value={selectedItem?.accountId || ''}
                      onChange={() => {}}
                      label="Account ID"
                      readOnly
                    />
                    <FloatingInput
                      id="editAccountName"
                      name="editAccountName"
                      value={editAccountName}
                      onChange={(e) => setEditAccountName(e.target.value)}
                      label="Account Name"
                      required
                    />
                    <FloatingInput
                      id="editAccountType"
                      name="editAccountType"
                      type="select"
                      value={editAccountType}
                      onChange={(e) => setEditAccountType(e.target.value)}
                      label="Account Type"
                      required
                      options={typeOptions}
                    />
                    <FloatingInput
                      id="editConsAccount"
                      name="editConsAccount"
                      type="select"
                      value={editConsAccountName}
                      onChange={(e) => {
                        const pk = e.target.value;
                        const acc = consOptions.find((o: any) => o.value.toString() === pk);
                        if (acc) setEditInputValue(acc.label);
                        setEditConsAccountName(pk);
                      }}
                      label="Cons Account"
                      required
                      options={consOptions}
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg col-span-full">
                    <span className="text-blue-600 text-lg font-semibold mb-2 dark:text-blue-400 block">
                      Current Status
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge color={editStatus === 'Active' ? 'success' : 'failure'} className="capitalize text-xs">
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
          </div>
        )}

        {/* Unified Confirm Modal (unchanged) */}
        {showConfirm && confirmType && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
              <div className="text-center mb-6">
                <div
                  className={`mx-auto w-16 h-16 bg-gradient-to-br ${
                    confirmType === 'status' && targetSupplierId && data.find(i => i.accountId === targetSupplierId)?.status === 'Active'
                      ? 'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 ring-red-200/50 dark:ring-red-900/30'
                      : 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 ring-green-200/50 dark:ring-green-900/30'
                  } rounded-full flex items-center justify-center mb-4 ring-4 shadow-lg`}
                >
                  <CircleCheckBig
                    className={`w-8 h-8 animate-pulse ${
                      confirmType === 'status' && targetSupplierId && data.find(i => i.accountId === targetSupplierId)?.status === 'Active'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                  {confirmType === 'edit'
                    ? 'Confirm Modify'
                    : confirmType === 'status'
                    ? (targetSupplierId && data.find(i => i.accountId === targetSupplierId)?.status === 'Active'
                        ? 'Confirm In-Active'
                        : 'Confirm Active')
                    : 'Confirm Action'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                  {confirmType === 'edit'
                    ? `Are you sure you want to modify this Item account (${targetSupplierId || ''})?`
                    : confirmType === 'status'
                    ? `Are you sure you want to ${
                        targetSupplierId && data.find(i => i.accountId === targetSupplierId)?.status === 'Active'
                          ? 'In-Active'
                          : 'Active'
                      } this Item account (${targetSupplierId || ''})? This action cannot be undone.`
                    : 'Are you sure?'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmType(null);
                    setConfirmAction(null);
                    setTargetSupplierId(null);
                  }}
                  className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction?.()}
                  className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    confirmType === 'status' && targetSupplierId && data.find(i => i.accountId === targetSupplierId)?.status === 'Active'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900 focus:ring-red-500 dark:focus:ring-offset-gray-900'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Expired Modal */}
        {showSessionModal && <SessionModal />}
      </div>
    </>
  );
};

export default ItemAccountList;