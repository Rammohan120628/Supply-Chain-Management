import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Plus, Edit, Search, X, ChevronLeft, ChevronRight,
  CircleCheckBig, Tag, Database, Percent
} from 'lucide-react';
import { FaSave, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { HiRefresh, HiViewList } from 'react-icons/hi';
import { Button, Tooltip } from "flowbite-react";
import Toastify, { showToast } from '../Toastify';
import SessionModal from '../SessionModal';

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

// ================== Types ==================
interface VATCategoryFormData {
  vatCategoryPk?: number;
  vatId: string;
  vatCategoryDescription: string;
  rate: string;
  accountForNet: string;
  accountForGross: string;
  vatCategoryCode: string;
}

type VATCategoryData = VATCategoryFormData;

// ================== Helper Components ==================
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2">
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 cursor-help inline" />
  </Tooltip>
);

interface NormalInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  required?: boolean;
  type?: string;
  name: string;
  disabled?: boolean;
  info?: string;
  maxLength?: number;
  shake?: boolean;
  suffix?: string;
}

const NormalInput: React.FC<NormalInputProps> = ({
  id, label, value, onChange, onBlur, required = false, type = "text",
  name, disabled, info, maxLength, shake = false, suffix
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {info && <InfoTooltip content={info} />}
      </div>
      <div className={`relative ${shake ? 'animate-shake' : ''}`}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed pr-${suffix ? '8' : '3'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

// ================== Constants ==================
const initialFormData: VATCategoryFormData = {
  vatId: '',
  vatCategoryDescription: '',
  rate: '',
  accountForNet: '',
  accountForGross: '',
  vatCategoryCode: '',
};

const baseUrl = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController';

const fieldInfo: Record<string, string> = {
  vatId: 'Unique VAT ID. Alphanumeric, 4-15 characters.',
  vatCategoryDescription: 'Description of the VAT category.',
  rate: 'VAT rate percentage.',
  accountForNet: 'Net account code.',
  accountForGross: 'Gross account code.',
  vatCategoryCode: 'Category code.',
};

// ================== VATCategoryForm Component ==================
interface VATCategoryFormProps {
  formData: VATCategoryFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleReset: () => void;
  handleListClick: () => void;
  isFormValid: boolean; // true when all required fields are filled and valid
}

const VATCategoryForm: React.FC<VATCategoryFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  handleReset,
  handleListClick,
  isFormValid,
}) => {
  // Single tab definition
  const tab = {
    title: 'VAT Category Details',
    icon: Tag,
    tooltip: 'Enter VAT category details including ID, description, rate, and accounts.',
  };

  return (
    <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 w-full flex flex-col">
      {/* Tab bar - only one tab */}
      <div className="flex mb-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600 dark:text-blue-400">
          <tab.icon className="w-4 h-4" />
          <span>{tab.title}</span>
          {isFormValid && <FaCheckCircle className="w-4 h-4 text-green-500 ml-1" />}
          <Tooltip content={tab.tooltip} placement="top">
            <FaInfoCircle className="w-3 h-3 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-1 cursor-help" />
          </Tooltip>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 p-1">
        <form id="vatForm" onSubmit={handleSubmit} noValidate className="h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <NormalInput
              id="vatId"
              name="vatId"
              label="VAT ID"
              value={formData.vatId}
              onChange={handleInputChange}
              required
              info={fieldInfo.vatId}
              maxLength={15}
            />
            <NormalInput
              id="vatCategoryDescription"
              name="vatCategoryDescription"
              label="VAT Category Description"
              value={formData.vatCategoryDescription}
              onChange={handleInputChange}
              required
              info={fieldInfo.vatCategoryDescription}
            />
            <NormalInput
              id="rate"
              name="rate"
              label="Rate"
              type="text"
              value={formData.rate}
              onChange={handleInputChange}
              required
              info={fieldInfo.rate}
              suffix="%"
            />
            <NormalInput
              id="accountForNet"
              name="accountForNet"
              label="Account for Net"
              value={formData.accountForNet}
              onChange={handleInputChange}
              required
              info={fieldInfo.accountForNet}
            />
            <NormalInput
              id="accountForGross"
              name="accountForGross"
              label="Account for Gross"
              value={formData.accountForGross}
              onChange={handleInputChange}
              required
              info={fieldInfo.accountForGross}
            />
            <NormalInput
              id="vatCategoryCode"
              name="vatCategoryCode"
              label="VAT Category Code"
              value={formData.vatCategoryCode}
              onChange={handleInputChange}
              required
              info={fieldInfo.vatCategoryCode}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

// ================== VATCategoryListView Component ==================
interface VATCategoryListViewProps {
  data: VATCategoryData[];
  onEditClick: (row: VATCategoryData) => void;
  onAddClick: () => void;
}

const VATCategoryListView: React.FC<VATCategoryListViewProps> = ({
  data,
  onEditClick,
  onAddClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof VATCategoryData;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  const handleSort = (key: keyof VATCategoryData) => {
    setSortConfig(prev => {
      if (prev && prev.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const getSortEmoji = (key: keyof VATCategoryData) => {
    if (!sortConfig || sortConfig.key !== key) return ' ↕️';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  const filteredSortedData = useMemo(() => {
    let filtered = data.filter(row =>
      searchTerm === '' ||
      Object.values(row).some(val => val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const key = sortConfig.key;
        let aVal = a[key] as string | number;
        let bVal = b[key] as string | number;
        if (key === 'rate') {
          aVal = parseFloat(aVal as string) || 0;
          bVal = parseFloat(bVal as string) || 0;
        } else {
          aVal = (aVal as string).toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);

  const totalRows = filteredSortedData.length;
  const totalPages = Math.ceil(totalRows / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRows = filteredSortedData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  return (
    <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 w-full flex flex-col">
      {/* Search bar */}
      <div className="flex-none flex items-end w-full justify-end mb-2">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-300" />
          </div>
          <input
            type="text"
            placeholder={`Search ${totalRows} records...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto h-full">
          <div className="min-w-[1000px] lg:min-w-full">
            <div className="overflow-auto max-h-full relative">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-600 dark:bg-blue-700">
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs select-none" style={{ width: '60px' }}>
                      S.No
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '140px' }} onClick={() => handleSort('vatId')}>
                      <div className="flex items-center gap-1">
                        VAT ID{getSortEmoji('vatId')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '200px' }} onClick={() => handleSort('vatCategoryDescription')}>
                      <div className="flex items-center gap-1">
                        VAT Category Description{getSortEmoji('vatCategoryDescription')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '140px' }} onClick={() => handleSort('vatCategoryCode')}>
                      <div className="flex items-center gap-1">
                        VAT Category Code{getSortEmoji('vatCategoryCode')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '140px' }} onClick={() => handleSort('accountForNet')}>
                      <div className="flex items-center gap-1">
                        Account for Net{getSortEmoji('accountForNet')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '140px' }} onClick={() => handleSort('accountForGross')}>
                      <div className="flex items-center gap-1">
                        Account for Gross{getSortEmoji('accountForGross')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '80px' }} onClick={() => handleSort('rate')}>
                      <div className="flex items-center gap-1">
                        Rate{getSortEmoji('rate')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs select-none" style={{ width: '90px' }}>
                      Modify
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRows.length > 0 ? (
                    currentRows.map((row, index) => (
                      <tr key={row.vatCategoryPk || row.vatId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20">
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {row.vatId}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white break-words">
                          {row.vatCategoryDescription}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {row.vatCategoryCode}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {row.accountForNet}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {row.accountForGross}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {row.rate}
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <Tooltip content="Edit VAT category">
                            <button
                              onClick={() => onEditClick(row)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <Database className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
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
      {totalRows > 0 && (
        <div className="flex-none mt-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, totalRows)}</span> of{' '}
            <span className="font-medium">{totalRows}</span> records
            {searchTerm && (
              <span> for search: <span className="font-medium">"{searchTerm}"</span></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">
              {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded border text-xs transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                <ChevronLeft className="w-2.5 h-2.5 inline mr-1" />
                Prev
              </button>
              <span className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded border text-xs transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                Next
                <ChevronRight className="w-2.5 h-2.5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================== Main VATCategory Component ==================
const VATCategory: React.FC = () => {
  const [viewMode, setViewMode] = useState<'form' | 'list'>('form');
  const [formData, setFormData] = useState<VATCategoryFormData>(initialFormData);
  const [data, setData] = useState<VATCategoryData[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<VATCategoryFormData>(initialFormData);
  const [originalPk, setOriginalPk] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [targetId, setTargetId] = useState<string | undefined>();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ========== Auth / Session ==========
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionModal(true);
      return false;
    }
    return true;
  }, []);

  // ========== API Calls ==========
  const fetchList = useCallback(async () => {
    if (!checkAuth()) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/listVatCategory`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const mapped = result.data.map((item: any) => ({
          vatCategoryPk: item.vatCategoryPk,
          vatId: item.vatId,
          vatCategoryDescription: item.vatCategoryDescription,
          vatCategoryCode: item.vatCategoryCode,
          accountForNet: item.accountForNet,
          accountForGross: item.accountForGross,
          rate: item.rate.toString(),
        }));
        setData(mapped);
      } else {
        showToast(result.message || 'Failed to fetch VAT categories', 'error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      showToast(`Error fetching VAT categories: ${message}`, 'error');
      setShowSessionModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  const fetchView = useCallback(async (pk: number): Promise<VATCategoryFormData | null> => {
    if (!checkAuth()) return null;
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/viewVatCategory/${pk}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        setShowSessionModal(true);
        return null;
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        const d = result.data;
        return {
          vatCategoryPk: d.vatCategoryPk,
          vatId: d.vatId,
          vatCategoryDescription: d.vatCategoryDescription,
          vatCategoryCode: d.vatCategoryCode,
          accountForNet: d.accountForNet,
          accountForGross: d.accountForGross,
          rate: d.rate.toString(),
        };
      } else {
        showToast(result.message || 'Failed to fetch VAT category details', 'error');
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      showToast(`Error fetching VAT category details: ${message}`, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  const saveVAT = useCallback(async (formDataToSave: VATCategoryFormData, isEdit: boolean = false): Promise<void> => {
    if (!checkAuth()) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const endpoint = isEdit ? 'modifyVatCategory' : 'saveVatCategory';
    const payload: any = {
      ...formDataToSave,
      rate: parseFloat(formDataToSave.rate),
      entity: localStorage.getItem('entity') || null,
      lastUser: parseInt(localStorage.getItem('userId') || '0'),
    };
    if (isEdit && formDataToSave.vatCategoryPk) {
      payload.vatCategoryPk = formDataToSave.vatCategoryPk;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      showToast(isEdit ? 'VAT Category updated successfully' : 'VAT Category saved successfully', 'success');
    } catch (error) {
      setShowSessionModal(true);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      showToast(`Error saving VAT Category: ${message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  // ========== Validation (toast only) ==========
  const validateField = (name: keyof VATCategoryFormData, value: string): string | null => {
    switch (name) {
      case 'vatId':
        if (!value.trim()) return 'VAT ID is required';
        if (!/^[A-Za-z0-9]{4,15}$/.test(value)) return 'VAT ID must be alphanumeric with 4-15 characters';
        return null;
      case 'vatCategoryDescription':
        if (!value.trim()) return 'VAT Category Description is required';
        return null;
      case 'rate':
        if (!value.trim()) return 'Rate is required';
        if (!/^-?\d*\.?\d*$/.test(value)) return 'Rate must be a valid number';
        if (parseFloat(value) < 0) return 'Rate must be greater than or equal to 0';
        return null;
      case 'accountForNet':
        if (!value.trim()) return 'Account for Net is required';
        return null;
      case 'accountForGross':
        if (!value.trim()) return 'Account for Gross is required';
        return null;
      case 'vatCategoryCode':
        if (!value.trim()) return 'VAT Category Code is required';
        return null;
      default:
        return null;
    }
  };

  const validateFormSequential = (form: VATCategoryFormData): boolean => {
    const fieldOrder: (keyof VATCategoryFormData)[] = [
      'vatId', 'vatCategoryDescription', 'rate', 'accountForNet', 'accountForGross', 'vatCategoryCode'
    ];
    for (const field of fieldOrder) {
      const value = form[field] as string;
      const error = validateField(field, value);
      if (error) {
        showToast(error, 'error');
        return false;
      }
    }
    return true;
  };

  // Compute whether the form is valid (for tab completion check)
  const isFormValid = useMemo(() => {
    return (
      formData.vatId.trim() !== '' &&
      formData.vatCategoryDescription.trim() !== '' &&
      formData.rate.trim() !== '' &&
      formData.accountForNet.trim() !== '' &&
      formData.accountForGross.trim() !== '' &&
      formData.vatCategoryCode.trim() !== '' &&
      /^[A-Za-z0-9]{4,15}$/.test(formData.vatId) &&
      /^-?\d*\.?\d*$/.test(formData.rate) &&
      parseFloat(formData.rate) >= 0
    );
  }, [formData]);

  const isEditFormValid = useMemo(() => {
    return (
      editFormData.rate.trim() !== '' &&
      editFormData.accountForNet.trim() !== '' &&
      editFormData.accountForGross.trim() !== '' &&
      editFormData.vatCategoryCode.trim() !== '' &&
      /^-?\d*\.?\d*$/.test(editFormData.rate) &&
      parseFloat(editFormData.rate) >= 0
    );
  }, [editFormData]);

  // ========== Input Handlers ==========
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'vatId') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
    } else if (name === 'rate') {
      value = value.replace(/[^-0-9.]/g, '');
      const decimalCount = (value.match(/\./g) || []).length;
      if (decimalCount > 1) {
        const parts = value.split('.');
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      const negativeCount = (value.match(/-/g) || []).length;
      if (negativeCount > 1) {
        value = value.replace(/-/g, '');
        value = '-' + value;
      } else if (negativeCount === 1 && value.indexOf('-') !== 0) {
        value = '-' + value.replace(/-/g, '');
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'rate') {
      value = value.replace(/[^-0-9.]/g, '');
      const decimalCount = (value.match(/\./g) || []).length;
      if (decimalCount > 1) {
        const parts = value.split('.');
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      const negativeCount = (value.match(/-/g) || []).length;
      if (negativeCount > 1) {
        value = value.replace(/-/g, '');
        value = '-' + value;
      } else if (negativeCount === 1 && value.indexOf('-') !== 0) {
        value = '-' + value.replace(/-/g, '');
      }
    }
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // ========== Confirmation Handlers ==========
  const showConfirmation = (type: 'add' | 'edit', action: () => Promise<void>, id?: string) => {
    setConfirmType(type);
    setConfirmAction(() => action);
    setTargetId(id);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction().finally(() => {
        setShowConfirm(false);
        setConfirmAction(null);
        setTargetId(undefined);
      });
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setTargetId(undefined);
  };

  // ========== Form Actions ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormSequential(formData)) return;
    showConfirmation('add', async () => {
      await saveVAT(formData, false);
      await fetchList();
      setFormData(initialFormData);
    }, formData.vatId);
  };

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const handleListClick = () => {
    setViewMode('list');
    if (data.length === 0) fetchList();
  };

  const handleAddClick = () => {
    setViewMode('form');
    setFormData(initialFormData);
  };

  const handleEditClick = async (row: VATCategoryData) => {
    if (!row.vatCategoryPk) {
      showToast('Invalid VAT category', 'error');
      return;
    }
    const fetched = await fetchView(row.vatCategoryPk);
    if (fetched) {
      setOriginalPk(row.vatCategoryPk);
      setEditFormData(fetched);
      setShowEditModal(true);
    }
  };

  const handleEditSave = async () => {
    if (!validateFormSequential(editFormData)) return;
    showConfirmation('edit', async () => {
      await saveVAT(editFormData, true);
      await fetchList();
      setShowEditModal(false);
      setEditFormData(initialFormData);
      setOriginalPk(null);
    }, editFormData.vatId);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditFormData(initialFormData);
    setOriginalPk(null);
  };

  useEffect(() => {
    if (viewMode === 'list' && data.length === 0) fetchList();
  }, [viewMode, data.length, fetchList]);

  return (
    <div className="max-h-screen w-full px-2 py-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      <style>{shakeAnimationStyle}</style>
      {showSessionModal && <SessionModal />}

     {/* Header */}
<div className="max-w-7xl mx-1 mb-2 px-1 flex-none">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-3 py-3 sm:h-14 sm:flex sm:items-center">
    
    {viewMode === 'form' ? (
      <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        {/* Title */}
        <h1 className="text-lg sm:text-xl text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
          <Percent className="h-5 w-5" />
          VAT Category
          <InfoTooltip content="Create and manage VAT categories." />
        </h1>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Tooltip content="Save">
            <Button
              type="submit"
              form="vatForm"
              className="w-10 h-10 p-0 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FaSave size={18} />
            </Button>
          </Tooltip>

          <Tooltip content="Refresh">
            <Button
              color="warning"
              size="xs"
              onClick={handleReset}
              className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
            >
              <HiRefresh className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="List">
            <Button
              color="primary"
              size="xs"
              className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              onClick={handleListClick}
            >
              <HiViewList className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>

      </div>
    ) : (
      <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        {/* Title */}
        <h1 className="text-lg sm:text-xl text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
          <Percent className="h-5 w-5" />
          VAT Category List
          <InfoTooltip content="List of all VAT categories." />
        </h1>

        {/* Add Button */}
        <div className="flex items-center gap-2 sm:justify-end">
          <Tooltip content="Add">
            <button
              onClick={handleAddClick}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-all shadow-md hover:shadow-lg transform"
            >
              <Plus size={18} />
            </button>
          </Tooltip>
        </div>

      </div>
    )}

  </div>
</div>

      {/* Main content */}
      {viewMode === 'form' ? (
        <VATCategoryForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleReset={handleReset}
          handleListClick={handleListClick}
          isFormValid={isFormValid}
        />
      ) : (
        <VATCategoryListView
          data={data}
          onEditClick={handleEditClick}
          onAddClick={handleAddClick}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-none p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  Modify VAT Category
                </h2>
                <div className="flex space-x-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 transition-all shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="editForm"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="editForm" onSubmit={(e) => { e.preventDefault(); handleEditSave(); }} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <NormalInput
                    id="edit-vatId"
                    name="vatId"
                    label="VAT ID"
                    value={editFormData.vatId}
                    onChange={handleEditInputChange}
                    required
                    disabled
                    info={fieldInfo.vatId}
                  />
                  <NormalInput
                    id="edit-vatCategoryDescription"
                    name="vatCategoryDescription"
                    label="VAT Category Description"
                    value={editFormData.vatCategoryDescription}
                    onChange={handleEditInputChange}
                    required
                    disabled
                    info={fieldInfo.vatCategoryDescription}
                  />
                  <NormalInput
                    id="edit-rate"
                    name="rate"
                    label="Rate"
                    type="text"
                    value={editFormData.rate}
                    onChange={handleEditInputChange}
                    required
                    info={fieldInfo.rate}
                    suffix="%"
                  />
                  <NormalInput
                    id="edit-accountForNet"
                    name="accountForNet"
                    label="Account for Net"
                    value={editFormData.accountForNet}
                    onChange={handleEditInputChange}
                    required
                    info={fieldInfo.accountForNet}
                  />
                  <NormalInput
                    id="edit-accountForGross"
                    name="accountForGross"
                    label="Account for Gross"
                    value={editFormData.accountForGross}
                    onChange={handleEditInputChange}
                    required
                    info={fieldInfo.accountForGross}
                  />
                  <NormalInput
                    id="edit-vatCategoryCode"
                    name="vatCategoryCode"
                    label="VAT Category Code"
                    value={editFormData.vatCategoryCode}
                    onChange={handleEditInputChange}
                    required
                    info={fieldInfo.vatCategoryCode}
                  />
                </div>
                {/* Optional completion indicator for edit modal (single tab) */}
                <div className="mt-4 flex items-center">
                  {isEditFormValid && (
                    <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                      <FaCheckCircle className="mr-1" /> All fields valid
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Unified Confirmation Modal */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                Confirm {confirmType === 'add' ? 'Save' : 'Modify'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                {confirmType === 'add'
                  ? 'Are you sure you want to save this new VAT category?'
                  : `Are you sure you want to modify this VAT category?${targetId ? ` (ID: ${targetId})` : ''}`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900`}
              >
                {confirmType === 'add' ? 'Save' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <Toastify />
    </div>
  );
};

export default VATCategory;