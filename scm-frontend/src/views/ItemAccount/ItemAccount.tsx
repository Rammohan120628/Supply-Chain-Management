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
import { FaChevronLeft, FaChevronRight, FaLock, FaSave, FaCheckCircle } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import Toastify, { showToast } from '../Toastify';
import SessionModal from 'src/views/SessionModal';

// Configure NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

// ================== Shake Animation Styles ==================
const shakeAnimationStyle = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}
.animate-shake {
  animation: shake 0.5s ease-in-out;
}
`;

// ================== InfoTooltip Component ==================
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2">
    <HiInformationCircle className="w-3.5 h-3.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-help" />
  </Tooltip>
);

// ================== NormalInput (label above, optional error, right element) ==================
interface NormalInputProps {
  id: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  maxLength?: number;
  info?: string;
  showLock?: boolean;
  rightElement?: React.ReactNode;
  shake?: boolean;
  hideErrorMessage?: boolean;
}

const NormalInput: React.FC<NormalInputProps> = ({
  id, name, value, onChange, label,
  required = false, error, readOnly = false, maxLength,
  info, showLock = false, rightElement, shake = false, hideErrorMessage = false
}) => {
  return (
    <div>
      <div className="flex items-center mb-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {info && <InfoTooltip content={info} />}
        {showLock && (
          <Tooltip content="This field cannot be edited" placement="top" className="ml-2">
            <FaLock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          </Tooltip>
        )}
      </div>
      <div className={`relative ${shake ? 'animate-shake' : ''}`}>
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          } ${readOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''} ${rightElement ? 'pr-20' : ''}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightElement}
          </div>
        )}
      </div>
      {error && !hideErrorMessage && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      {maxLength && !readOnly && (
        <div className="text-right mt-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

// ================== SelectInput (normal label) ==================
interface SelectInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  error?: string;
  info?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  id, name, value, onChange, label, required, options, error, info
}) => {
  return (
    <div>
      <div className="flex items-center mb-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {info && <InfoTooltip content={info} />}
      </div>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
        }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ================== Confirm Modal (only for status changes) ==================
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
              Are you sure you want to change the status of "{targetName || 'this item account'}"?
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

// ================== Types ==================
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

// Field info texts (for tooltips)
const fieldInfo: Record<string, string> = {
  accountId: 'Unique ID for item account. Alphanumeric, 4-15 characters.',
  accountName: 'Name of the item account.',
  accountType: 'Select the account type (E, I, or A).',
  consAccount: 'Select the consolidated account.',
};

const typeOptions = [
  { value: '', label: 'Please select' },
  { value: 'E', label: 'Type-1 E' },
  { value: 'I', label: 'Type-1 I' },
  { value: 'A', label: 'Type-1 A' },
];

const getTypeLabel = (value: string) => {
  const opt = typeOptions.find(o => o.value === value);
  return opt ? opt.label : value;
};

// ================== Main Component ==================
const ItemAccount: React.FC = () => {
  const [data, setData] = useState<ItemAccountData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemAccountData | null>(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountType, setEditAccountType] = useState('');
  const [editConsAccountName, setEditConsAccountName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editInputValue, setEditInputValue] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newConsAccount, setNewConsAccount] = useState('');
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});
  const [accountIdValid, setAccountIdValid] = useState(false);
  const [accountIdShake, setAccountIdShake] = useState(false);

  const [consOptions, setConsOptions] = useState<any[]>([]);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Confirm modal state (only for status change)
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetItemName, setTargetItemName] = useState<string>('');

  const columnHelper = createColumnHelper<ItemAccountData>();

  // ----- API endpoints -----
  const BASE_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController';
  const token = localStorage.getItem('authToken');

  // ----- Validation helpers -----
  const validateId = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.length > 0 && (trimmed.length < 4 || trimmed.length > 15)) {
      return 'Account ID must be between 4 and 15 characters.';
    }
    return '';
  };

  const validateName = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.length > 0 && trimmed.length < 4) {
      return 'Account Name must be at least 4 characters.';
    }
    return '';
  };

  // ----- Fetch dropdown for consolidate accounts -----
  const fetchConsolidateDropdown = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/loadConsolidateDropdown`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch dropdown');
      const response = await res.json();
      if (response.success) {
        setConsOptions([
          { value: '', label: 'Please Select' },
          ...response.data.map((item: any) => ({
            value: item.pk,
            label: `${item.code} - ${item.name}`,
            code: item.code,
          })),
        ]);
      } else {
        showToast('Failed to load dropdown data.', 'error');
      }
    } catch (e) {
      setShowSessionExpired(true);
      showToast('Error loading dropdown.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Fetch list data -----
  const fetchData = async () => {
    if (!token) {
      setShowSessionExpired(true);
      return;
    }
    setIsLoading(true);
    NProgress.start();
    try {
      const res = await fetch(`${BASE_URL}/listMstItemAccount`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionExpired(true);
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
      setShowSessionExpired(true);
      showToast('Error fetching data.', 'error');
    } finally {
      setIsLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    fetchConsolidateDropdown();
    fetchData();
  }, []);

  // ----- Check Account ID -----
  const handleCheckId = async () => {
    const id = newAccountId.trim();
    if (!id) {
      setNewErrors(prev => ({ ...prev, accountId: 'Account ID is required' }));
      setAccountIdShake(true);
      setTimeout(() => setAccountIdShake(false), 500);
      showToast('Account ID is required', 'error');
      return;
    }
    const idError = validateId(id);
    if (idError) {
      setNewErrors(prev => ({ ...prev, accountId: idError }));
      setAccountIdShake(true);
      setTimeout(() => setAccountIdShake(false), 500);
      showToast(idError, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/accountId`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountId: id }),
      });
      if (res.status === 401) {
        setShowSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error('Validation failed');
      const data = await res.json();
      if (data.success === false && data.message.includes('exists')) {
        setNewErrors(prev => ({ ...prev, accountId: 'Account ID already exists' }));
        setAccountIdValid(false);
        setAccountIdShake(true);
        setTimeout(() => setAccountIdShake(false), 500);
        showToast('Account ID already exists.', 'error');
      } else if (data.success === true && data.message.includes('available')) {
        setNewErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.accountId;
          return newErrors;
        });
        setAccountIdValid(true);
        showToast('Account ID is available.', 'success');
      }
    } catch (e) {
      showToast('Error validating Account ID.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Create modal -----
  const openCreateModal = () => {
    setNewAccountId('');
    setNewAccountName('');
    setNewAccountType('');
    setNewConsAccount('');
    setNewErrors({});
    setAccountIdValid(false);
    setAccountIdShake(false);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const validateCreateFields = (): boolean => {
    if (!newAccountId.trim()) {
      showToast('Account ID is required.', 'error');
      setNewErrors(prev => ({ ...prev, accountId: 'Account ID is required.' }));
      return false;
    }
    if (!accountIdValid) {
      showToast('Please verify Account ID with Check button.', 'error');
      return false;
    }
    if (!newAccountName.trim()) {
      showToast('Account Name is required.', 'error');
      setNewErrors(prev => ({ ...prev, accountName: 'Account Name is required.' }));
      return false;
    }
    const nameError = validateName(newAccountName);
    if (nameError) {
      showToast(nameError, 'error');
      setNewErrors(prev => ({ ...prev, accountName: nameError }));
      return false;
    }
    if (!newAccountType) {
      showToast('Account Type is required.', 'error');
      setNewErrors(prev => ({ ...prev, accountType: 'Account Type is required.' }));
      return false;
    }
    if (!newConsAccount) {
      showToast('Cons Account is required.', 'error');
      setNewErrors(prev => ({ ...prev, consAccount: 'Cons Account is required.' }));
      return false;
    }
    return true;
  };

  const handleCreateSave = async () => {
    if (!validateCreateFields()) return;

    const userId = localStorage.getItem('userId');
    const entityId = localStorage.getItem('entity');
    if (!token || !userId || !entityId) {
      showToast('Authentication or entity information missing.', 'error');
      return;
    }

    setIsLoading(true);
    NProgress.start();

    const requestBody = {
      accountId: newAccountId.trim(),
      accountName: newAccountName.trim(),
      accountType: newAccountType,
      consAccFk: parseInt(newConsAccount),
      createdBy: userId,
      lastActBy: userId,
      entityId: entityId,
    };

    try {
      const res = await fetch(`${BASE_URL}/saveMstItemAccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (res.status === 401) {
        setShowSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error('Save failed');
      const response = await res.json();
      if (response.success) {
        showToast('Item account saved successfully.', 'success');
        closeCreateModal();
        fetchData();
      } else {
        showToast(response.message || 'Save failed.', 'error');
      }
    } catch (e) {
      showToast('Error saving item account.', 'error');
    } finally {
      setIsLoading(false);
      NProgress.done();
    }
  };

  // ----- Edit modal -----
  const openEdit = async (item: ItemAccountData) => {
    setSelectedItem(item);
    setIsLoading(true);
    NProgress.start();
    try {
      const res = await fetch(`${BASE_URL}/viewMstItemAccount/${item.itemAccountPk}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionExpired(true);
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
        setEditErrors({});
        setShowEditModal(true);
      } else {
        showToast('Failed to load edit data.', 'error');
      }
    } catch (e) {
      showToast('Error loading edit data.', 'error');
    } finally {
      setIsLoading(false);
      NProgress.done();
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
    setEditErrors({});
  };

  const validateEditFields = (): boolean => {
    if (!editAccountName.trim()) {
      showToast('Account Name is required.', 'error');
      setEditErrors(prev => ({ ...prev, accountName: 'Account Name is required.' }));
      return false;
    }
    const nameError = validateName(editAccountName);
    if (nameError) {
      showToast(nameError, 'error');
      setEditErrors(prev => ({ ...prev, accountName: nameError }));
      return false;
    }
    if (!editAccountType) {
      showToast('Account Type is required.', 'error');
      setEditErrors(prev => ({ ...prev, accountType: 'Account Type is required.' }));
      return false;
    }
    if (!editConsAccountName) {
      showToast('Cons Account is required.', 'error');
      setEditErrors(prev => ({ ...prev, consAccount: 'Cons Account is required.' }));
      return false;
    }
    return true;
  };

  const handleEditSave = async () => {
    if (!validateEditFields() || !selectedItem) return;

    const userId = localStorage.getItem('userId');
    const lastActDate = new Date().toISOString();
    if (!token || !userId) {
      showToast('Authentication required.', 'error');
      return;
    }

    setIsLoading(true);
    NProgress.start();

    const updateBody = {
      itemAccountPk: selectedItem.itemAccountPk,
      accountName: editAccountName.trim(),
      accountType: editAccountType,
      consAccFk: parseInt(editConsAccountName),
      lastActBy: parseInt(userId),
      lastActDate: lastActDate,
    };

    try {
      const res = await fetch(`${BASE_URL}/modifyMstItemAccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateBody),
      });
      if (res.status === 401) {
        setShowSessionExpired(true);
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
        setData(prev =>
          prev.map(item =>
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
      setIsLoading(false);
      NProgress.done();
    }
  };

  // ----- Status change -----
  const requestToggleStatus = (item: ItemAccountData) => {
    setTargetItemName(item.accountId);
    setConfirmAction(() => () => performToggleStatus(item));
    setShowConfirm(true);
  };

  const performToggleStatus = async (item: ItemAccountData) => {
    setShowConfirm(false);
    setConfirmAction(null);
    setTargetItemName('');

    const newStatus = item.status === 'Active' ? 'In-Active' : 'Active';
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      showToast('Authentication required.', 'error');
      return;
    }

    setIsLoading(true);
    setTogglingId(item.itemAccountPk);
    NProgress.start();

    try {
      const body = { itemAccountPk: item.itemAccountPk, status: newStatus };
      const res = await fetch(`${BASE_URL}/mstItemAccountStatusUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setShowSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error('Status update failed');
      const response = await res.json();
      if (response.success) {
        setData(prev =>
          prev.map(i =>
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
      setIsLoading(false);
      setTogglingId(null);
      NProgress.done();
    }
  };

  // ----- Table columns -----
  const columns = [
    columnHelper.display({
      id: 'serialNo',
      header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
      cell: ({ row }) => (
        <span className="text-[11px] text-gray-600 dark:text-gray-400">
          {pagination.pageIndex * pagination.pageSize + row.index + 1}
        </span>
      ),
      enableSorting: false,
      size: 40,
    }),
    columnHelper.display({
      id: 'account',
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Account</span>
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
      cell: ({ row }) => (
        <span className="text-[11px]">
          {row.original.accountId || 'NA'} - {row.original.accountName || 'NA'}
        </span>
      ),
      sortingFn: (rowA, rowB) => {
        const a = `${rowA.original.accountId} - ${rowA.original.accountName}`;
        const b = `${rowB.original.accountId} - ${rowB.original.accountName}`;
        return a.localeCompare(b);
      },
      size: 200,
    }),
    columnHelper.accessor('accountType', {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Account Type</span>
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
      cell: info => <span className="text-[11px]">{getTypeLabel(info.getValue() || '') || 'NA'}</span>,
      size: 120,
    }),
    columnHelper.accessor('consAccountId', {
      header: () => <span className="font-medium text-white text-[10px] uppercase">Cons Account Id</span>,
      cell: info => <span className="text-[11px]">{info.getValue() || 'NA'}</span>,
      size: 120,
    }),
    columnHelper.accessor('consAccountName', {
      header: () => <span className="font-medium text-white text-[10px] uppercase">Cons Account Name</span>,
      cell: info => <span className="text-[11px]">{info.getValue() || 'NA'}</span>,
      size: 180,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
          onClick={column.getToggleSortingHandler()}
        >
          <span className="font-medium text-white text-[10px] uppercase">Status</span>
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
      cell: info => {
        const status = info.getValue();
        return (
          <span
            className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
              status === 'Active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {status}
          </span>
        );
      },
      size: 100,
    }),
    columnHelper.display({
      id: 'changeStatus',
      header: () => <span className="font-medium text-white text-[10px] uppercase">Change Status</span>,
      cell: ({ row }) => {
        const item = row.original;
        const isActive = item.status === 'Active';
        const isToggling = togglingId === item.itemAccountPk;
        return (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isActive}
              onChange={() => requestToggleStatus(item)}
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
            ></div>
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
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
          onClick={() => openEdit(row.original)}
          aria-label={`Edit ${row.original.accountName}`}
        >
          <SquarePen size={16} />
        </button>
      ),
      enableSorting: false,
      size: 80,
    }),
  ];

  // ----- Table filtering and pagination -----
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
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

  // Skeleton row component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div></td>
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
      <td className="px-1.5 py-1"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
      <td className="px-1.5 py-1"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
      <td className="px-1.5 py-1"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10"></div></td>
      <td className="px-1.5 py-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
    </tr>
  );

  // Helper for sorting emoji
  const getSortEmoji = (column: any) => {
    if (column.getIsSorted() === 'asc') return ' 🔼';
    if (column.getIsSorted() === 'desc') return ' 🔽';
    return ' ↕️';
  };

  // Column widths
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

  return (
    <>
      <style>{shakeAnimationStyle}</style>
      <Toastify />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <Package className="h-6 w-6 text-indigo-600" />
                Item Account
              </h1>
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Click the "+" button to add a new item account</li>
                      <li>Enter Account ID and click Check to verify uniqueness</li>
                      <li>Fill in the remaining fields</li>
                      <li>Use the modify icon to edit an existing account</li>
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
              <Tooltip content="Add new item account" placement="bottom">
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
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                      {headerGroup.headers.map((header) => {
                        const width = columnWidths[header.id] || 'auto';
                        return (
                          <th
                            key={header.id}
                            className="px-1.5 py-1 text-left text-[9px] font-semibold text-white uppercase tracking-wider"
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
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors duration-150"
                      >
                        {row.getVisibleCells().map((cell) => {
                          const width = columnWidths[cell.column.id] || 'auto';
                          return (
                            <td key={cell.id} className="px-1.5 py-1 text-[9px]" style={{ width }}>
                              <div className="flex items-center min-h-[20px]">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-1.5 py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 animate-bounce">
                            <Package className="w-8 h-8 text-blue-400 dark:text-blue-300" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                            {debouncedSearchTerm ? 'No matching records found' : 'No item accounts yet'}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 text-center max-w-sm">
                            {debouncedSearchTerm
                              ? 'Try a different search term or clear the filter.'
                              : 'Get started by creating your first item account.'}
                          </p>
                          {!debouncedSearchTerm && (
                            <Button
                              color="blue"
                              size="xs"
                              onClick={openCreateModal}
                              className="flex items-center gap-1"
                            >
                              <HiPlus className="w-4 h-4" /> Add Account
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
                <div className="flex items-center gap-2">
                  <span>
                    Showing <span className="font-medium">{start}</span> to{' '}
                    <span className="font-medium">{end}</span> of{' '}
                    <span className="font-medium">{total}</span> records
                    {debouncedSearchTerm && (
                      <span>
                        {' '}for search: <span className="font-medium">"{debouncedSearchTerm}"</span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={pageIndex === 0}
                    className="px-1.5 py-0.5 border rounded flex items-center gap-0.5 disabled:opacity-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 hover:scale-105"
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
                  >
                    Next <FaChevronRight className="w-2 h-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Create Modal */}
        <Modal show={showCreateModal} onClose={closeCreateModal} size="lg" dismissible>
          <ModalHeader className="rounded-lg border-b bg-white dark:from-blue-700 dark:to-blue-600 text-white p-4">
            <div className="flex items-center gap-2">
              <HiPlus className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              <span className="text-sm text-indigo-700 dark:text-indigo-400 font-bold">Add Item Account</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-4 bg-white dark:bg-gray-800">
            <div className="space-y-4">
              <NormalInput
                id="newAccountId"
                name="accountId"
                value={newAccountId}
                onChange={(e) => {
                  setNewAccountId(e.target.value);
                  setNewErrors(prev => { const newErrors = { ...prev }; delete newErrors.accountId; return newErrors; });
                  setAccountIdValid(false);
                }}
                label="Account ID"
                required
                error={newErrors.accountId}
                maxLength={15}
                info={fieldInfo.accountId}
                shake={accountIdShake}
                hideErrorMessage={true}
                rightElement={
                  <div className="flex items-center gap-1">
                    {accountIdValid && <FaCheckCircle className="w-4 h-4 text-green-500" />}
                    <button
                      type="button"
                      onClick={handleCheckId}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Check
                    </button>
                    
                  </div>
                }
              />
              <NormalInput
                id="newAccountName"
                name="accountName"
                value={newAccountName}
                onChange={(e) => {
                  setNewAccountName(e.target.value);
                  setNewErrors(prev => { const newErrors = { ...prev }; delete newErrors.accountName; return newErrors; });
                }}
                label="Account Name"
                required
                error={newErrors.accountName}
                maxLength={50}
                info={fieldInfo.accountName}
              />
              <SelectInput
                id="newAccountType"
                name="accountType"
                value={newAccountType}
                onChange={(e) => {
                  setNewAccountType(e.target.value);
                  setNewErrors(prev => { const newErrors = { ...prev }; delete newErrors.accountType; return newErrors; });
                }}
                label="Account Type"
                required
                options={typeOptions}
                error={newErrors.accountType}
                info={fieldInfo.accountType}
              />
              <SelectInput
                id="newConsAccount"
                name="consAccount"
                value={newConsAccount}
                onChange={(e) => {
                  setNewConsAccount(e.target.value);
                  setNewErrors(prev => { const newErrors = { ...prev }; delete newErrors.consAccount; return newErrors; });
                }}
                label="Cons Account"
                required
                options={consOptions}
                error={newErrors.consAccount}
                info={fieldInfo.consAccount}
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
        <Modal show={showEditModal} onClose={closeEdit} size="lg" dismissible>
          <ModalHeader className="border-b rounded-lg bg-white dark:from-blue-700 dark:to-blue-600 text-white p-4">
            <div className="flex items-center gap-2">
              <SquarePen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Edit Item Account</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-4 bg-white dark:bg-gray-800">
            <div className="space-y-4">
              <NormalInput
                id="editAccountId"
                name="accountId"
                value={selectedItem?.accountId || ''}
                label="Account ID"
                readOnly
                showLock
                maxLength={15}
              />
              <NormalInput
                id="editAccountName"
                name="accountName"
                value={editAccountName}
                onChange={(e) => {
                  setEditAccountName(e.target.value);
                  setEditErrors(prev => { const newErrors = { ...prev }; delete newErrors.accountName; return newErrors; });
                }}
                label="Account Name"
                required
                error={editErrors.accountName}
                maxLength={50}
              />
              <SelectInput
                id="editAccountType"
                name="accountType"
                value={editAccountType}
                onChange={(e) => {
                  setEditAccountType(e.target.value);
                  setEditErrors(prev => { const newErrors = { ...prev }; delete newErrors.accountType; return newErrors; });
                }}
                label="Account Type"
                required
                options={typeOptions}
                error={editErrors.accountType}
              />
              <SelectInput
                id="editConsAccount"
                name="consAccount"
                value={editConsAccountName}
                onChange={(e) => {
                  const pk = e.target.value;
                  const acc = consOptions.find((o: any) => o.value.toString() === pk);
                  if (acc) setEditInputValue(acc.label);
                  setEditConsAccountName(pk);
                  setEditErrors(prev => { const newErrors = { ...prev }; delete newErrors.consAccount; return newErrors; });
                }}
                label="Cons Account"
                required
                options={consOptions}
                error={editErrors.consAccount}
              />
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <span className="text-blue-600 text-sm font-semibold mb-2 dark:text-blue-400 block">
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
          </ModalBody>
          <ModalFooter className="border-t rounded-lg bg-gray-50 dark:bg-gray-700 justify-end p-4">
            <Button
              size="xs"
              onClick={closeEdit}
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

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ItemAccount; 