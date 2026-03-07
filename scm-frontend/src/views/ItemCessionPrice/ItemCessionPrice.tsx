import React, { useState, useEffect } from 'react';
import { Tooltip } from 'flowbite-react';
import { HiRefresh } from 'react-icons/hi';
import { FaChevronLeft, FaChevronRight, FaSave, FaInfoCircle } from 'react-icons/fa';
import { RiFileExcel2Fill } from "react-icons/ri";
import {
  AlertCircle,
  Search,
  CircleCheckBig,
  Database,
} from 'lucide-react';
import Toastify, { showToast } from '../Toastify';
import { GiBanknote } from 'react-icons/gi';
import SessionModal from '../SessionModal';

// ================== InfoTooltip Component ==================
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-1">
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-help inline" />
  </Tooltip>
);

interface TableRow {
  itemPk: number;
  itemId: string;
  itemName: string | null;
  packageId: string | null;
  categoryCode: number;
  categoryName: string | null;
  accountId: string | null;
  cwh: number;
  packageBaseFactor: number;
}

const ItemCessionPrice: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<TableRow[]>([]);
  const [originalRows, setOriginalRows] = useState<TableRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<
    'itemName' | 'packageId' | 'categoryCode' | 'accountId' | 'cwh' | 'location'
  >('itemName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'save' | 'download' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const baseUrl =
    'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController';

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSessionExpired = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const checkAuthAndHandleError = async (response: Response, action: string) => {
    if (response.status === 401) {
      setShowSessionModal(true);
      return true;
    }
    showToast(`${action} failed`, 'error');
    return false;
  };

  const fetchData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionModal(true);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/itempriceshow`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (await checkAuthAndHandleError(response, 'Fetch data')) return;
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      if (result.success) {
        const data = result.data.map((item: any) => ({
          itemPk: item.itemPK,
          itemId: item.itemId || '',
          itemName: item.itemName,
          packageId: item.packageId,
          categoryCode: item.categoryCode,
          categoryName: item.categoryName,
          accountId: item.accountID,
          cwh: item.ip02 || 0,
          packageBaseFactor: item.packageBaseFactor || 1,
        }));
        setRows(data);
        setOriginalRows(data.map((r) => ({ ...r })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRows = rows.filter((row) =>
    (row.itemName || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const sortedRows = [...filteredRows].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    switch (sortBy) {
      case 'itemName':
        aVal = (a.itemName || '').toLowerCase();
        bVal = (b.itemName || '').toLowerCase();
        break;
      case 'location':
        aVal = a.cwh / a.packageBaseFactor;
        bVal = b.cwh / b.packageBaseFactor;
        break;
      case 'categoryCode':
        aVal = a.categoryCode;
        bVal = b.categoryCode;
        break;
      default:
        aVal = a[sortBy as keyof Omit<TableRow, 'location'>];
        bVal = b[sortBy as keyof Omit<TableRow, 'location'>];
        aVal ??= '';
        bVal ??= '';
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        break;
    }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedRows.length);
  const paginatedRows = sortedRows.slice(startIndex, endIndex);
  const startItem = startIndex + 1;
  const endItem = endIndex;

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleCwhChange = (itemPk: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 5) return;
    const numValue = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
    setRows((prev) =>
      prev.map((row) => (row.itemPk === itemPk ? { ...row, cwh: numValue } : row))
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return ' ↕️';
    return sortDirection === 'asc' ? ' 🔼' : ' 🔽';
  };

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionModal(true);
      return;
    }
    const entity = localStorage.getItem('entity');
    const userIdStr = localStorage.getItem('userId');
    if (!entity || !userIdStr) {
      showToast('Missing entity or user ID. Please log in again.', 'error');
      setShowSessionModal(true);
      return;
    }

    const editedRows = rows.filter((row) => {
      const original = originalRows.find((o) => o.itemPk === row.itemPk);
      return original && row.cwh !== original.cwh;
    });

    if (editedRows.length === 0) {
      showToast('No changes to save', 'success');
      return;
    }

    const itemList = editedRows.map((row) => ({
      itemPK: row.itemPk,
      itemId: parseInt(row.itemId),
      itemName: row.itemName,
      packageId: row.packageId,
      ip02: row.cwh,
      accountID: row.accountId,
    }));

    const userId = userIdStr;

    const body = {
      entityId: entity,
      lastUser: userId,
      itemList,
    };

    try {
      const response = await fetch(`${baseUrl}/saveItemCessionList`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (await checkAuthAndHandleError(response, 'Save')) return;
        throw new Error('Save failed');
      }

      const result = await response.json();

      if (result.success) {
        showToast(result.message || 'Saved successfully', 'success');
        setOriginalRows((prev) =>
          prev.map((orig) => {
            const edited = editedRows.find((e) => e.itemPk === orig.itemPk);
            return edited ? { ...orig, cwh: edited.cwh } : orig;
          })
        );
        await fetchData();
      } else {
        showToast(result.message || 'Save failed', 'error');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('Save failed. Please try again.', 'error');
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleDownload = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionModal(true);
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/downloadExcelByItemCession`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (await checkAuthAndHandleError(response, 'Download')) return;
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'item-cession-prices.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      showToast('Download started', 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      showToast('Download failed', 'error');
    }
  };

  const openConfirmModal = (type: 'save' | 'download') => {
    if (type === 'save') {
      const hasChanges = rows.some((row) => {
        const original = originalRows.find((o) => o.itemPk === row.itemPk);
        return original && row.cwh !== original.cwh;
      });
      if (!hasChanges) {
        showToast('No changes to save', 'success');
        return;
      }
      setConfirmAction(() => handleSave);
    } else if (type === 'download') {
      setConfirmAction(() => handleDownload);
    }
    setConfirmType(type);
    setShowConfirm(true);
  };

  const closeConfirmModal = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 relative p-2 sm:p-4">
      {/* Session Expired Modal (unchanged but responsive) */}
      {showSessionModal && (
        <SessionModal/>
      )}

      {/* Unified Confirmation Modal (responsive) */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md transform transition-all duration-300 border border-white/20 dark:border-gray-700/50">
            <div className="text-center mb-4 sm:mb-6">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Confirm {confirmType === 'save' ? 'Save' : 'Download'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {confirmType === 'save'
                  ? 'Are you sure you want to save the changes?'
                  : 'Are you sure you want to download the Excel file?'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeConfirmModal}
                className="w-full sm:flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-xs sm:text-sm order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction?.();
                  closeConfirmModal();
                }}
                className="w-full sm:flex-1 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-xs sm:text-sm order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section - Responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Title with icon */}
          <h1 className="text-lg sm:text-xl flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <GiBanknote className="text-indigo-700 h-6 w-6 sm:h-8 sm:w-8" />
            <span className="font-semibold">Item Cession Prices</span>
            <InfoTooltip content="Manage item cession prices: edit CWH (max 5 digits) and view calculated location price." />
          </h1>

          {/* Action buttons and search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
           

            {/* Action buttons */}
            <div className="flex gap-2 self-end sm:self-auto">
              <Tooltip content="Save">
                <button
                  onClick={() => openConfirmModal('save')}
                  className="bg-green-600 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-500 text-white p-2.5 sm:p-3 rounded-full shadow-md transition-colors"
                >
                  <FaSave size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </Tooltip>
              <Tooltip content="Refresh">
                <button
                  onClick={handleRefresh}
                  className="bg-yellow-300 hover:bg-yellow-400 dark:bg-red-600 dark:hover:bg-yellow-700 text-white p-2.5 sm:p-3 rounded-full shadow-md transition-colors"
                >
                  <HiRefresh size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </Tooltip>
              <Tooltip content="Excel">
                <button
                  onClick={() => openConfirmModal('download')}
                  className="bg-green-400 hover:bg-green-500 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white p-2.5 sm:p-3 rounded-full shadow-md transition-colors"
                >
                  <RiFileExcel2Fill size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Main table container - responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Table wrapper with horizontal scroll on mobile */}

        {/* Search bar wrapper */}
<div className="flex justify-end items-end mb-2 mt-1 px-3 sm:px-6">
  <div className="w-full sm:w-64">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        type="text"
        placeholder={`Search ${filteredRows.length} records...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>
  </div>
</div>
         
        <div className="overflow-y-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                  <tr>
                    {/* S.No */}
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
                      style={{ minWidth: '60px' }}
                    >
                      <div className="flex items-center gap-1">S.No</div>
                    </th>
                    {/* Item */}
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      style={{ minWidth: '180px' }}
                      onClick={() => handleSort('itemName')}
                    >
                      <div className="flex items-center gap-1">
                        Item
                        <span>{getSortIcon('itemName')}</span>
                      </div>
                    </th>
                    {/* Package ID */}
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      style={{ minWidth: '120px' }}
                      onClick={() => handleSort('packageId')}
                    >
                      <div className="flex items-center gap-1">
                        Package ID
                        <span>{getSortIcon('packageId')}</span>
                      </div>
                    </th>
                    {/* Category */}
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      style={{ minWidth: '160px' }}
                      onClick={() => handleSort('categoryCode')}
                    >
                      <div className="flex items-center gap-1">
                        Category
                        <span>{getSortIcon('categoryCode')}</span>
                      </div>
                    </th>
                    {/* Account ID */}
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      style={{ minWidth: '120px' }}
                      onClick={() => handleSort('accountId')}
                    >
                      <div className="flex items-center gap-1">
                        Account ID
                        <span>{getSortIcon('accountId')}</span>
                      </div>
                    </th>
                    {/* CWH */}
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      style={{ minWidth: '100px' }}
                      onClick={() => handleSort('cwh')}
                    >
                      <div className="flex items-center gap-1">
                        CWH
                        <InfoTooltip content="Cash & Wholesale price (max 5 digits, integer only)." />
                        <span>{getSortIcon('cwh')}</span>
                      </div>
                    </th>
                    {/* Location */}
                    <th
                      scope="col"
                      className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      style={{ minWidth: '100px' }}
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center gap-1">
                        Location
                        <InfoTooltip content="Location price = CWH / Package Base Factor (calculated)." />
                        <span>{getSortIcon('location')}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => {
                      const sno = startIndex + index + 1;
                      const locationValue = (row.cwh / row.packageBaseFactor).toFixed(3);
                      return (
                        <tr
                          key={row.itemPk}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                        >
                          <td className="px-2 sm:px-3 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap">
                            {sno}
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-xs text-gray-900 dark:text-white">
                            <div className="flex flex-col">
                              <span className="font-medium">{row.itemName || 'N/A'}</span>
                              <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                                {row.itemId || ''}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap">
                            {row.packageId || 'N/A'}
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-xs text-gray-900 dark:text-white">
                            <div className="flex flex-col">
                              <span className="font-medium">{row.categoryName || 'N/A'}</span>
                              <span className="text-gray-500 dark:text-gray-400 text-[10px]">
                                {row.categoryCode || ''}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap">
                            {row.accountId || 'N/A'}
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="99999"
                              value={row.cwh}
                              onChange={(e) => handleCwhChange(row.itemPk, e.target.value)}
                              className="w-16 sm:w-20 text-right border border-gray-300 dark:border-gray-600 rounded-md px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-textfield [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap">
                            {locationValue}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center">
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

        {/* Pagination - responsive */}
        {sortedRows.length > 0 && !loading && (
          <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                Showing{' '}
                <span className="font-semibold">{startItem}</span> to{' '}
                <span className="font-semibold">{endItem}</span> of{' '}
                <span className="font-semibold">{sortedRows.length}</span> results
                {searchTerm && (
                  <span className="hidden sm:inline">
                    {' '}for search: <span className="font-medium">"{searchTerm}"</span>
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {startItem}-{endItem} of {sortedRows.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded border text-xs transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <FaChevronLeft className="w-3 h-3 inline mr-1" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <span className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded border text-xs transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <FaChevronRight className="w-3 h-3 inline ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toastify />
    </div>
  );
};

export default ItemCessionPrice;