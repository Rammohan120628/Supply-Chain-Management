import React, { useState, useEffect } from 'react';
import {HiRefresh} from 'react-icons/hi';
import {
  CircleCheckBig,
  UserRoundPen,
  Search,
  ChevronDown
} from 'lucide-react';
import { RiFileExcel2Fill } from "react-icons/ri";
import { Tooltip } from 'flowbite-react';
import { FaSave, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import Toastify,{ showToast }  from '../Toastify';
import SessionModal from "src/views/SessionModal";

const BASE_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm';

const checkboxToApi: Record<string, string> = {
  'qr': 'renderQuotationRequest',
  'pqr': 'renderPrepareQuotation',
  'qreply': 'renderQuotationReply',
  'pcp': 'renderPriceComparisonPreview',
  'cssfi': 'renderChangeSysSelecSupp',
  'essfi': 'renderEditSysSelecSupp',
  'ftss': 'renderFinalizeTheSupplierSelection',
  'rifs': 'renderReceiveItemFromSuppl',
  'rifs-inv': 'renderReceiveInvoice',
  'rifl-inv': 'renderItemFromLocation',
  'ppc-stock': 'renderPurchasePeriodClosing',
  'dpc-stock': 'renderDuplicateSupplierSelection',
  'tpc-tender': 'renderTenderPeriodClosing',
  'dtsi-tender': 'renderDuplicateSupplierSelectionTender',
  'lrbu': 'renderLocationRequestBu',
  'elrbu': 'renderEditLocationRequest',
  'cdll': 'renderChangeDelievryLoc',
  'cdls': 'renderChangeDelievryLocSup',
  'agpo': 'renderAutoPo',
  'mpo': 'renderManualPoCreation',
  'pse': 'renderPhysicalStock',
  'ocd': 'renderOCD',
  'ditl': 'renderDeliveryItemToLocation',
  'dits': 'renderReturnItemToSupplier',
  'rcn': 'renderReturnCreditNote',
  'receive-cn': 'renderReceiveCreditNote',
  'sc': 'renderSupplierCreation',
  'iws': 'renderRelateItemWithSupplier',
  'sws': 'renderSystemWithSupplier',
  'irr': 'renderItemRelatedMaster',
  'cmr': 'renderCommonMaster',
  'are': 'renderAllReportsExcludingSaving',
  'sr': 'renderAllReportsIncludingSaving',
};

// Helper component for info tooltip
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2" >
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 cursor-help inline" />
  </Tooltip>
);

// Capsule toggle switch component
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
        ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300
          ${checked ? 'translate-x-6' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
};

const ScreenRights: React.FC = () => {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [fullRights, setFullRights] = useState<Record<string, any>>({});
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmType, setConfirmType] = useState<"save" | "refresh" | null>(null);
  const [confirmTitle, setConfirmTitle] = useState("");

  // Sections definition (unchanged)
  const sections = {
    left: [
      {
        title: 'Tender Process',
        checkboxes: [
          { id: 'qr', label: 'Quotation Request' },
          { id: 'pqr', label: 'Preparation of Quotation Request' },
          { id: 'qreply', label: 'Quotation Reply' },
          { id: 'pcp', label: 'Price Comparison Preview' },
          { id: 'cssfi', label: 'Change System Selected Supplier For Items' },
          { id: 'essfi', label: 'Edit System Selected Supplier for Item' },
          { id: 'ftss', label: 'Finalize the Supplier Selection' },
        ],
      },
      {
        title: 'Stock Receive',
        checkboxes: [
          { id: 'rifs', label: 'Receive Item From Supplier' },
          { id: 'rifs-inv', label: 'Receive Invoice From Supplier' },
          { id: 'rifl-inv', label: 'Receive Invoice From Location' },
        ],
      },
    ],
    middle: [
      {
        title: 'Period Closing',
        checkboxes: [
          { id: 'ppc-stock', label: 'Purchase Period Closing - Stock' },
          { id: 'dpc-stock', label: 'Duplicate Period Closing - Stock' },
          { id: 'tpc-tender', label: 'Tender Period Closing - Tender' },
          { id: 'dtsi-tender', label: 'Duplicate the Supplier Item - Tender' },
        ],
      },
      {
        title: 'Location Request',
        checkboxes: [
          { id: 'lrbu', label: 'Location Request Bulk Upload' },
          { id: 'elrbu', label: 'Edit Location Request Bulk Upload' },
          { id: 'cdll', label: 'Change the Delivery Location - Location' },
          { id: 'cdls', label: 'Change the Delivery Location - Supplier' },
        ],
      },
      {
        title: 'Purchase Order',
        checkboxes: [
          { id: 'agpo', label: 'Auto Generate PO' },
          { id: 'mpo', label: 'Manual PO' },
        ],
      },
      {
        title: 'Stock',
        checkboxes: [
          { id: 'pse', label: 'Physical Stock Entry' },
        ],
      },
      {
        title: 'Cash',
        checkboxes: [
          { id: 'ocd', label: 'Other Cash Disbursement' },
        ],
      },
    ],
    right: [
      {
        title: 'Stock Delivery',
        checkboxes: [
          { id: 'ditl', label: 'Delivery Item To Location' },
          { id: 'dits', label: 'Delivery Item To Supplier' },
          { id: 'rcn', label: 'Return Credit Note' },
          { id: 'receive-cn', label: 'Receive Credit Note' },
        ],
      },
      {
        title: 'Supplier',
        checkboxes: [
          { id: 'sc', label: 'Supplier Creation' },
          { id: 'iws', label: 'Item With Supplier' },
          { id: 'sws', label: 'System With Supplier' },
        ],
      },
      {
        title: 'Master',
        checkboxes: [
          { id: 'irr', label: 'Item Related Report' },
          { id: 'cmr', label: 'Common Master Report' },
        ],
      },
      {
        title: 'Reports',
        checkboxes: [
          { id: 'are', label: 'All Reports (Except Savings)' },
          { id: 'sr', label: 'Savings Report' },
        ],
      },
    ],
  };

  useEffect(() => {
    const loadUsers = async () => {
      setIsGlobalLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setShowSessionExpired(true);
          return;
        }
        const res = await axios.get(`${BASE_URL}/userMasterController/loadUserDropdown`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const userOptions = res.data.data.map((user: any) => ({
            value: user.pk.toString(),
            label: `${user.code} - ${user.name}`,
          }));
          setUsers([{ value: '', label: 'Select User' }, ...userOptions]);
        } else {
          showToast("Failed to load users", "error");
        }
      } catch (err: any) {
        if (err.response?.status === 401) setShowSessionExpired(true);
        else showToast("Error loading users", "error");
      }
      setIsGlobalLoading(false);
    };
    loadUsers();
  }, []);

  const loadRights = async (userId: string) => {
    if (!userId) {
      setCheckedItems({});
      setFullRights({});
      return;
    }
    setIsGlobalLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setShowSessionExpired(true);
        return;
      }
      const res = await axios.get(`${BASE_URL}/userMasterController/getScreenListByUserFk/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const data = res.data.data;
        setFullRights(data);
        const newChecked: Record<string, boolean> = {};
        for (const [id, apiField] of Object.entries(checkboxToApi)) {
          newChecked[id] = data[apiField] ?? false;
        }
        setCheckedItems(newChecked);
      } else {
        showToast("Failed to load rights", "error");
      }
    } catch (err: any) {
      if (err.response?.status === 401) setShowSessionExpired(true);
      else showToast("Error loading rights", "error");
    }
    setIsGlobalLoading(false);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUserType(val);
    loadRights(val);
  };

  const handleCheckboxChange = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter checkboxes based on search term
  const filterCheckboxes = (checkboxes: { id: string; label: string }[]) => {
    if (!searchTerm) return checkboxes;
    return checkboxes.filter(cb =>
      cb.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const resetConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
    setConfirmTitle("");
    setConfirmMessage("");
  };

  const getConfirmButtonLabel = (type: "save" | "refresh"): string => {
    switch (type) {
      case "save": return "Save";
      case "refresh": return "Refresh";
      default: return "Confirm";
    }
  };

  const confirmActionHandler = (action: () => Promise<void>, message: string, title: string, type: "save" | "refresh") => {
    setConfirmMessage(message);
    setConfirmTitle(title);
    setConfirmAction(() => action);
    setConfirmType(type);
    setShowConfirm(true);
  };

  const handleSave = async () => {
    if (!selectedUserType) {
      showToast('No user selected', "error");
      return;
    }
    const action = async () => {
      setIsGlobalLoading(true);
      const lastUserFk = parseInt(localStorage.getItem("userId") || "0");
      const body = {
        ...fullRights,
        userFk: parseInt(selectedUserType),
        lastuserFk: lastUserFk,
        stockClosingStatus: 0,
      };
      for (const [id, apiField] of Object.entries(checkboxToApi)) {
        body[apiField] = checkedItems[id] ?? false;
      }
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setShowSessionExpired(true);
          return;
        }
        const res = await axios.post(`${BASE_URL}/userMasterController/saveUserScreenRights`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          showToast("Rights saved successfully", "success");
        } else {
          showToast("Failed to save rights", "error");
        }
      } catch (err: any) {
        if (err.response?.status === 401) setShowSessionExpired(true);
        else showToast("Error saving rights", "error");
      }
      setIsGlobalLoading(false);
    };
    confirmActionHandler(action, "Are you sure you want to save these screen rights?", "Save Rights", "save");
  };

  const handleDownload = async () => {
    setIsGlobalLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setShowSessionExpired(true);
        return;
      }
      const res = await axios.get(`${BASE_URL}/userMasterController/downloadUserRightsExcelReport`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_rights.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Report downloaded successfully", "success");
    } catch (err: any) {
      if (err.response?.status === 401) setShowSessionExpired(true);
      else showToast("Error downloading report", "error");
    }
    setIsGlobalLoading(false);
  };

  const handleRefresh = () => {
    const action = async () => {
      setCheckedItems({});
      if (selectedUserType) {
        await loadRights(selectedUserType);
      }
      showToast("Rights refreshed", "success");
    };
    confirmActionHandler(action, "Are you sure you want to refresh the rights?", "Refresh", "refresh");
  };

  return (
    <>
      <Toastify />

      {/* Global loading overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Main container */}
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 flex flex-col gap-3">

        {/* Header Card with Title and Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <UserRoundPen className="h-5 w-5" />
              Screen Rights - User
              <InfoTooltip content="Configure screen access rights for each user type. Changes take effect immediately after saving." />
            </h1>
            <div className="flex items-center gap-3">
              <Tooltip content="Save" placement='bottom'>
                <button
                  onClick={handleSave}
                  className="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-500 rounded-full text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                  disabled={isGlobalLoading}
                >
                  <FaSave size={18} />
                </button>
              </Tooltip>
              <Tooltip content="Refresh" placement='bottom'>
                <button
                  onClick={handleRefresh}
                  className="w-10 h-10 flex items-center justify-center bg-yellow-300 hover:bg-yellow-400 rounded-full text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                  disabled={isGlobalLoading}
                >
                  <HiRefresh size={16} />
                </button>
              </Tooltip>
              <Tooltip content="Excel" placement='bottom'>
                <button
                  onClick={handleDownload}
                  className="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-500 rounded-full text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                  disabled={isGlobalLoading}
                >
                  <RiFileExcel2Fill size={18} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* User Selection and Search Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* User Dropdown - Prominent */}
            <div className="flex-1">
              <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                Select User
                <InfoTooltip content="Choose a user to view and edit their screen rights." />
              </label>
              <div className="relative">
                <select
                  id="userSelect"
                  value={selectedUserType}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 appearance-none border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  disabled={isGlobalLoading}
                >
                  {users.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                Search Screens
                <InfoTooltip content="Filter screens by name." />
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="e.g. Quotation Request"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - only visible when a user is selected */}
        {selectedUserType ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {sections.left.map((section) => {
                  const filtered = filterCheckboxes(section.checkboxes);
                  if (filtered.length === 0) return null;
                  return (
                    <Section
                      key={section.title}
                      title={section.title}
                      checkboxes={filtered}
                      checkedItems={checkedItems}
                      onChange={handleCheckboxChange}
                    />
                  );
                })}
              </div>

              {/* Middle Column */}
              <div className="space-y-6">
                {sections.middle.map((section) => {
                  const filtered = filterCheckboxes(section.checkboxes);
                  if (filtered.length === 0) return null;
                  return (
                    <Section
                      key={section.title}
                      title={section.title}
                      checkboxes={filtered}
                      checkedItems={checkedItems}
                      onChange={handleCheckboxChange}
                    />
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {sections.right.map((section) => {
                  const filtered = filterCheckboxes(section.checkboxes);
                  if (filtered.length === 0) return null;
                  return (
                    <Section
                      key={section.title}
                      title={section.title}
                      checkboxes={filtered}
                      checkedItems={checkedItems}
                      onChange={handleCheckboxChange}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // Placeholder when no user is selected
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 flex-1 flex flex-col items-center justify-center text-center">
            <UserRoundPen className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No User Selected</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Please select a user from the dropdown above to view and configure their screen rights.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 border border-white/20 dark:border-gray-700/50">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Confirm {confirmTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {confirmMessage}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetConfirm}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction) {
                    try {
                      await confirmAction();
                    } catch (error) {
                      console.error("Action failed:", error);
                    } finally {
                      resetConfirm();
                    }
                  } else {
                    resetConfirm();
                  }
                }}
                className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900`}
              >
                {getConfirmButtonLabel(confirmType)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      {showSessionExpired && <SessionModal />}
    </>
  );
};

// Section component with capsule toggle switches
const Section: React.FC<{
  title: string;
  checkboxes: { id: string; label: string }[];
  checkedItems: Record<string, boolean>;
  onChange: (id: string) => void;
}> = ({ title, checkboxes, checkedItems, onChange }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">
        {title}
      </h3>
      <div className="space-y-3">
        {checkboxes.map(({ id, label }) => {
          const checked = checkedItems[id] || false;
          return (
            <div key={id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              <Toggle checked={checked} onChange={() => onChange(id)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScreenRights;