// ProfitCenter.tsx
import { Button, Tooltip } from 'flowbite-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import ProfitCenterTable from './ProfitCenterTable';
import { HiRefresh, HiViewList, HiPlus } from 'react-icons/hi';
import { FaSave } from "react-icons/fa";
import SessionModal from '../SessionModal';
import Toastify, { showToast } from '../Toastify';
import { MapPin, Users, Home, CircleCheckBig, Eye } from 'lucide-react';
import { AiOutlineStock } from "react-icons/ai";
import { FaInfoCircle, FaCheckCircle, FaRegEdit } from 'react-icons/fa';
import { RiFileExcel2Fill } from "react-icons/ri";
import { Edit } from 'lucide-react';
import { HiOutlineOfficeBuilding, HiIdentification, HiDocumentText, HiLocationMarker, HiUserGroup, HiCog, HiX } from 'react-icons/hi';
import { Badge } from 'flowbite-react';

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

// ================== Helper Components ==================
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2">
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 cursor-help inline" />
  </Tooltip>
);

const NormalInput = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  type = "text",
  name,
  step,
  error,
  disabled,
  info,
  maxLength,
  rightElement,
  shake = false,
  min,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  required?: boolean;
  type?: string;
  name: string;
  step?: string;
  error?: string;
  disabled?: boolean;
  info?: string;
  maxLength?: number;
  rightElement?: React.ReactNode;
  shake?: boolean;
  min?: string;
}) => {
  let paddingRight = 'pr-3';
  if (rightElement) paddingRight = 'pr-20';

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
          step={step}
          min={min}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border ${
            error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
          } transition duration-150 ease-in-out ${paddingRight}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const NormalTextarea = ({
  id,
  label,
  value,
  onChange,
  required,
  name,
  rows = 2,
  info,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  name: string;
  rows?: number;
  info?: string;
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {info && <InfoTooltip content={info} />}
      </div>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out resize-none"
      />
    </div>
  );
};

const SelectField = ({
  id,
  name,
  value,
  onChange,
  label,
  options,
  required = false,
  info,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  info?: string;
}) => (
  <div className="flex flex-col">
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
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition duration-150 ease-in-out"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// ================== Field Info ==================
const fieldInfo: Record<string, string> = {
  locationId: 'Unique ID for locations. Must be 5-16 characters',
  locationName: 'Full name of the profit center location.',
  segment: 'Select the business segment.',
  contract: 'Select the associated contract.',
  fromDate: 'Contract start date.',
  toDate: 'Contract end date (must be after start date).',
  paymentType: 'Type of payment (IP or COST TO COST).',
  entityId: 'Entity ID (auto-filled).',
  locationManagerId: 'Select the location manager.',
  operationManagerId: 'Select the operation manager.',
  projectManagerId: 'Select the project manager.',
  address1: 'Primary address line.',
  address2: 'Secondary address line (optional).',
  mobileNo: 'Mobile number (10 digits).',
};

// ================== Types for Modals ==================
interface ProfitCenterData {
  id: number;
  locationID: string;
  locationName: string;
  contractName: string;
  paymentType: string;
  segmentName: string;
  status: string;
  statusColor: string;
  streetAddress1: string;
  streetAddress2: string;
  telPhoneNo: string;
  locationManagerID: string | null;
  operationManagerID: string | null;
  projectManagerID: string | null;
  contractStartDt: string;
  contractEndDt: string;
  typeOfPayemnt: number;
  contractFk: number;
  entityId?: number;
}

interface ProfitCenterDetail extends ProfitCenterData {
  countryID?: string;
  lastUpdate?: string;
  region?: string;
  lastUser?: number;
  locationStatus?: string;
  segment?: number;
  isCwh?: number;
  cwh1?: boolean;
  locationPk?: number;
  iSActive?: number;
  typeOfPaymentStr?: string;
}

// ================== Main Component ==================
const ProfitCenter = () => {
  // ----- Existing state -----
  const [locationId, setLocationId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [segment, setSegment] = useState('0');
  const [contract, setContract] = useState('0');
  const [paymentType, setPaymentType] = useState('0');
  const [entityId] = useState(() => localStorage.getItem('entity'));
  const [locationManagerId, setLocationManagerId] = useState('');
  const [operationManagerId, setOperationManagerId] = useState('');
  const [projectManagerId, setProjectManagerId] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [contracts, setContracts] = useState([]);
  const [segments, setSegments] = useState([]);
  const [, setManagers] = useState([]);
  const [lmManagers, setLmManagers] = useState([]);
  const [omManagers, setOmManagers] = useState([]);
  const [pmManagers, setPmManagers] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // ----- Location ID validation state -----
  const [locationIdError, setLocationIdError] = useState('');
  const [locationIdValid, setLocationIdValid] = useState(false);
  const [locationIdShake, setLocationIdShake] = useState(false);

  // ----- Unified Confirm Modal state (using ref for action) -----
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'save' | 'status' | 'download' | 'edit' | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const confirmActionRef = useRef<(() => Promise<void>) | null>(null);  // 🔁 Store action in ref

  // ----- View Modal state -----
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState<ProfitCenterDetail | null>(null);

  // ----- Edit Modal state -----
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<ProfitCenterData | null>(null);
  const [editFromDate, setEditFromDate] = useState('');
  const [editToDate, setEditToDate] = useState('');
  const [editLocationManagerId, setEditLocationManagerId] = useState('');
  const [editOperationManagerId, setEditOperationManagerId] = useState('');
  const [editProjectManagerId, setEditProjectManagerId] = useState('');
  const [editAddress1, setEditAddress1] = useState('');
  const [editAddress2, setEditAddress2] = useState('');
  const [editMobileNo, setEditMobileNo] = useState('');
  const [editContract, setEditContract] = useState('0');
  const [editActiveTab, setEditActiveTab] = useState(0);

  // Table ref for download
  const tableRef = useRef<any>(null);

  // ----- Date validation effect -----
  useEffect(() => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      setToDate(fromDate);
      showToast('End date adjusted to start date.', 'error');
    }
  }, [fromDate, toDate]);

  // ----- API call wrapper -----
  const apiCall = async (url: string, options: any, onSuccess: any, onError?: any) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }
    try {
      setIsGlobalLoading(true);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
      if (response.status === 401) {
        setShowSessionExpired(true);
        localStorage.removeItem('authToken');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
      } else {
        const errorText = await response.text();
        onError?.(errorText);
        showToast(`Request failed: ${response.status}`, 'error');
      }
    } catch (e) {
      console.error('API call error:', e);
      showToast('Network error', 'error');
      onError?.(e);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  // ----- Fetch dropdowns -----
  const fetchContracts = async () => {
    const url = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/loadContractDropdown';
    await apiCall(url, { method: 'GET' }, (data: any) => {
      if (data.success) setContracts(data.data || []);
      else showToast(data.message || 'Failed to fetch contracts', 'error');
    });
  };

  const fetchSegments = async () => {
    const url = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/loadSegmentDropdown';
    await apiCall(url, { method: 'GET' }, (data: any) => {
      if (data.success) setSegments(data.data || []);
      else showToast(data.message || 'Failed to fetch segments', 'error');
    });
  };

  const fetchManagers = async () => {
    const url = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/loadManagerDropdown';
    await apiCall(url, { method: 'GET' }, (data: any) => {
      if (data.success) {
        setManagers(data.data || []);
        setLmManagers(data.data.filter((m: any) => m.nameOne === 'LM'));
        setOmManagers(data.data.filter((m: any) => m.nameOne === 'OM'));
        setPmManagers(data.data.filter((m: any) => m.nameOne === 'PM'));
      } else showToast(data.message || 'Failed to fetch managers', 'error');
    });
  };

  useEffect(() => {
    fetchContracts();
    fetchSegments();
    fetchManagers();
  }, []);

  // ----- Handlers for form/list toggle -----
  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
  };

  // ----- Location ID validation (with shake) -----
  const validateLocationId = async (id: string) => {
    if (!id.trim()) {
      showToast('Please enter location id', 'error');
      setLocationIdShake(true);
      setTimeout(() => setLocationIdShake(false), 500);
      return;
    }
    const url = `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/locationId`;
    await apiCall(
      url,
      {
        method: 'POST',
        body: JSON.stringify({ locationID: id.trim() }),
      },
      (data: any) => {
        const isAvailable = data.success && data.message === 'Location ID is available';
        if (!isAvailable) {
          setLocationId('');
          setLocationIdError('Location ID already exists');
          setLocationIdValid(false);
          setLocationIdShake(true);
          setTimeout(() => setLocationIdShake(false), 500);
          showToast('Location ID already exists', 'error');
        } else {
          setLocationIdError('');
          setLocationIdValid(true);
          showToast('Location ID is available', 'success');
        }
      },
      () => {
        setLocationIdShake(true);
        setTimeout(() => setLocationIdShake(false), 500);
      }
    );
  };

  const handleLocationIdCheck = () => {
    validateLocationId(locationId);
  };

  // ----- Form validation and save -----
  const validateForm = () => {
    const mandatoryFields = [
      { key: 'locationId', value: locationId.trim(), label: 'Location ID' },
      { key: 'locationName', value: locationName.trim(), label: 'Location Name' },
      { key: 'segment', value: segment, label: 'Segment' },
      { key: 'contract', value: contract, label: 'Contract' },
      { key: 'fromDate', value: fromDate, label: 'Contract Start Date' },
      { key: 'toDate', value: toDate, label: 'Contract End Date' },
      { key: 'paymentType', value: paymentType, label: 'Payment Type' },
      { key: 'mobileNo', value: mobileNo.trim(), label: 'Mobile No' },
    ];
    for (const field of mandatoryFields) {
      if (!field.value) {
        showToast(`${field.label} is required.`, 'error');
        return false;
      }
    }
    if (mobileNo.length < 10) {
      showToast('Mobile number should contain exactly 10 digits', 'error');
      return false;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      showToast('Contract End Date must be after Contract Start Date.', 'error');
      return false;
    }
    return true;
  };

  const performSave = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }
    const userId = localStorage.getItem('userId');
    const countryId = localStorage.getItem('currencyId');
    const cwh = localStorage.getItem('cwh');
    const saveUrl = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/saveProfitCenterCreationData';

    const body = {
      locationID: locationId.trim(),
      locationName: locationName.trim(),
      typeOfPayemnt: parseInt(paymentType),
      streetAddress1: address1.trim(),
      streetAddress2: address2.trim(),
      telPhoneNo: `+91-${mobileNo.trim()}`,
      locationManagerID: locationManagerId || null,
      operationManagerID: operationManagerId || null,
      projectManagerID: projectManagerId || null,
      entityId,
      isCwh: parseInt(cwh || '0'),
      countryID: countryId,
      lastUser: parseInt(userId || '0') || null,
      contractStartDt: `${fromDate}T00:00:00`,
      contractEndDt: `${toDate}T00:00:00`,
      contractFk: parseInt(contract),
      segment: parseInt(segment),
    };

    await apiCall(
      saveUrl,
      { method: 'POST', body: JSON.stringify(body) },
      (data: any) => {
        if (data.success) {
          showToast(data.message || 'Profit center saved successfully.', 'success');
          resetAllFields();
        } else {
          showToast(data.message || 'Failed to save profit center.', 'error');
        }
      },
      () => {}
    );
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setConfirmType('save');
    setConfirmTitle('Save Profit Center');
    setConfirmMessage('Are you sure you want to save this profit center?');
    confirmActionRef.current = performSave;   // ✅ store in ref
    setShowConfirm(true);
  };

  const resetAllFields = () => {
    setLocationId('');
    setLocationName('');
    setSegment('');
    setContract('0');
    setPaymentType('0');
    setLocationManagerId('');
    setOperationManagerId('');
    setProjectManagerId('');
    setAddress1('');
    setAddress2('');
    setMobileNo('');
    setFromDate('');
    setToDate('');
    setLocationIdError('');
    setLocationIdValid(false);
  };

  const handleRefresh = () => {
    resetAllFields();
  };

  // ----- Mobile input handler -----
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNo(value);
  };

  // ----- Excel download handler (with confirm, using ref) -----
  const handleExcelClick = () => {
    setConfirmType('download');
    setConfirmTitle('Download Report');
    setConfirmMessage('Are you sure you want to download the profit center report?');
    confirmActionRef.current = async () => {   // ✅ store in ref
      setIsGlobalLoading(true);
      try {
        if (tableRef.current && tableRef.current.handleDownloadExcel) {
          await tableRef.current.handleDownloadExcel();
        }
      } finally {
        setIsGlobalLoading(false);
      }
    };
    setShowConfirm(true);
  };

  // ----- Callback for table to trigger confirm modal (status changes) -----
  const showConfirmModal = (type: 'status' | 'edit', title: string, message: string, action: () => Promise<void>) => {
    setConfirmType(type);
    setConfirmTitle(title);
    setConfirmMessage(message);
    confirmActionRef.current = action;   // ✅ store in ref
    setShowConfirm(true);
  };

  // ----- View Modal Handlers -----
  const handleView = async (id: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) { setShowSessionExpired(true); return; }
    setIsGlobalLoading(true);
    try {
      const response = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/viewDataByLocationId/${id}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 401) { setShowSessionExpired(true); return; }
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setViewData(result.data as ProfitCenterDetail);
          setShowViewModal(true);
        } else showToast(result.message || 'Failed to fetch details', 'error');
      } else showToast('Failed to fetch profit center details', 'error');
    } catch (error) {
      console.error('Error fetching details:', error);
      setShowSessionExpired(true);
      showToast('An error occurred while fetching details', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const closeView = () => {
    setShowViewModal(false);
    setViewData(null);
  };

  // ----- Edit Modal Handlers -----
  const handleEdit = async (item: ProfitCenterData) => {
    const token = localStorage.getItem('authToken');
    if (!token) { setShowSessionExpired(true); return; }
    setIsGlobalLoading(true);
    try {
      const response = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/viewDataByLocationId/${item.id}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 401) { setShowSessionExpired(true); return; }
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const details = result.data;
          const mappedDetails: ProfitCenterData = {
            ...details,
            id: details.locationPk,
            status: details.iSActive === 1 ? 'Active' : 'Inactive',
            statusColor: details.iSActive === 1 ? 'success' : 'failure',
            paymentType: details.typeOfPaymentStr || '',
            typeOfPayemnt: details.typeOfPayemnt || 0,
            contractFk: details.contractFk || 0,
          };
          setEditItem(mappedDetails);
          setEditFromDate(details.contractStartDt || '');
          setEditToDate(details.contractEndDt || '');
          setEditLocationManagerId(details.locationManagerID || '');
          setEditOperationManagerId(details.operationManagerID || '');
          setEditProjectManagerId(details.projectManagerID || '');
          setEditAddress1(details.streetAddress1 || '');
          setEditAddress2(details.streetAddress2 || '');
          setEditMobileNo(details.telPhoneNo ? details.telPhoneNo.replace(/^\+91-/, '') : '');
          setEditContract(details.contractFk?.toString() || '0');
          setShowEditModal(true);
        } else showToast(result.message || 'Failed to fetch details', 'error');
      } else showToast('Failed to fetch profit center details', 'error');
    } catch (error) {
      console.error('Error fetching details:', error);
      setShowSessionExpired(true);
      showToast('An error occurred while fetching details', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditItem(null);
    setEditActiveTab(0);
  };

  // ----- Update Profit Center (triggered from edit modal) -----
  const requestUpdate = () => {
    const mandatoryFields = [
      { value: editFromDate, label: 'Contract Start Date' },
      { value: editToDate, label: 'Contract End Date' },
    ];
    for (const field of mandatoryFields) {
      if (!field.value) {
        showToast(`${field.label} is required.`, 'error');
        return;
      }
    }
    if (!editMobileNo.trim()) {
      showToast('Mobile No is required.', 'error');
      return;
    }
    if (editMobileNo.length !== 10) {
      showToast('Mobile number must be exactly 10 digits.', 'error');
      return;
    }
    if (new Date(editToDate) < new Date(editFromDate)) {
      showToast('Contract End Date must be after Contract Start Date.', 'error');
      return;
    }

    showConfirmModal(
      'edit',
      'Update Profit Center',
      'Are you sure you want to save these changes?',
      async () => {
        setIsGlobalLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) { setShowSessionExpired(true); return; }

        const body = {
          locationPk: editItem!.id,
          locationID: editItem!.locationID,
          locationName: editItem!.locationName,
          streetAddress1: editAddress1.trim(),
          streetAddress2: editAddress2.trim(),
          telPhoneNo: `+91-${editMobileNo}`,
          locationManagerID: editLocationManagerId || null,
          operationManagerID: editOperationManagerId || null,
          projectManagerID: editProjectManagerId || null,
          contractStartDt: editFromDate,
          contractEndDt: editToDate,
          typeOfPayemnt: editItem!.typeOfPayemnt,
          contractFk: parseInt(editContract),
        };

        try {
          const response = await fetch(
            'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/updateProfitCenter',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(body),
            }
          );
          if (response.status === 401) { setShowSessionExpired(true); return; }
          const result = await response.json();
          if (response.ok && result.success) {
            showToast(result.message || 'Profit center updated successfully.', 'success');
            closeEdit();
            if (tableRef.current && tableRef.current.refreshData) {
              await tableRef.current.refreshData();
            }
          } else {
            showToast(result.message || 'Failed to update profit center.', 'error');
          }
        } catch (error) {
          console.error('Error updating profit center:', error);
          showToast('An error occurred while updating profit center', 'error');
        } finally {
          setIsGlobalLoading(false);
        }
      }
    );
  };

  // ----- Edit modal helper for mobile -----
  const handleEditMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setEditMobileNo(value);
  };

  useEffect(() => {
    if (editToDate && new Date(editToDate) < new Date(editFromDate)) {
      setEditToDate(editFromDate);
    }
  }, [editFromDate, editToDate]);

  // ----- Tabs for form -----
  const tabs = [
    { title: 'Location Details', icon: MapPin, tooltip: 'Enter profit center location details.' },
    { title: 'Manager Details', icon: Users, tooltip: 'Assign managers to the profit center.' },
    { title: 'Address Details', icon: Home, tooltip: 'Provide address and contact information.' },
  ];

  const isTabComplete = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0:
        return !!(locationId.trim() && locationName.trim() && segment && contract && fromDate && toDate && paymentType);
      case 1:
        return true;
      case 2:
        return !!mobileNo;
      default:
        return false;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NormalInput
              id="locationId"
              name="locationId"
              value={locationId}
              onChange={(e) => {
                let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setLocationId(val);
              }}
              label="Location ID"
              required
              info={fieldInfo.locationId}
              error={locationIdError}
              maxLength={16}
              shake={locationIdShake}
              rightElement={
                <div className="flex items-center gap-1">
                  {locationIdValid && <FaCheckCircle className="w-4 h-4 text-green-500" />}
                  <button
                    type="button"
                    onClick={handleLocationIdCheck}
                    className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Check
                  </button>
                </div>
              }
            />
            <NormalInput
              id="locationName"
              name="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              label="Location Name"
              required
              info={fieldInfo.locationName}
            />
            <SelectField
              id="segment"
              name="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              label="Segment"
              options={[
                { value: '0', label: 'OTHERS' },
                ...segments.map((item: any) => ({ value: item.pk.toString(), label: item.name }))
              ]}
              required
              info={fieldInfo.segment}
            />
            <SelectField
              id="contract"
              name="contract"
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              label="Contract"
              options={[
                { value: '0', label: 'OTHERS' },
                ...contracts.map((item: any) => ({ value: item.pk.toString(), label: item.name }))
              ]}
              required
              info={fieldInfo.contract}
            />
            <NormalInput
              id="fromDate"
              name="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              label="Contract Start Date"
              required
              info={fieldInfo.fromDate}
            />
            <NormalInput
              id="toDate"
              name="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              label="Contract End Date"
              required
              info={fieldInfo.toDate}
            />
            <SelectField
              id="paymentType"
              name="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              label="Payment Type"
              options={[
                { value: '0', label: 'IP' },
                { value: '1', label: 'COST TO COST' }
              ]}
              required
              info={fieldInfo.paymentType}
            />
            <NormalInput
              id="entityId"
              name="entityId"
              value={entityId || ''}
              onChange={() => {}}
              label="Entity ID"
              disabled
              info={fieldInfo.entityId}
            />
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              id="locationManagerId"
              name="locationManagerId"
              value={locationManagerId}
              onChange={(e) => setLocationManagerId(e.target.value)}
              label="Location Manager"
              options={lmManagers.map((item: any) => ({ value: item.code, label: item.name }))}
              info={fieldInfo.locationManagerId}
            />
            <SelectField
              id="operationManagerId"
              name="operationManagerId"
              value={operationManagerId}
              onChange={(e) => setOperationManagerId(e.target.value)}
              label="Operation Manager"
              options={omManagers.map((item: any) => ({ value: item.code, label: item.name }))}
              info={fieldInfo.operationManagerId}
            />
            <SelectField
              id="projectManagerId"
              name="projectManagerId"
              value={projectManagerId}
              onChange={(e) => setProjectManagerId(e.target.value)}
              label="Project Manager"
              options={pmManagers.map((item: any) => ({ value: item.code, label: item.name }))}
              info={fieldInfo.projectManagerId}
            />
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NormalTextarea
              id="address1"
              name="address1"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              label="Address 1"
              info={fieldInfo.address1}
              rows={4}
            />
            <NormalTextarea
              id="address2"
              name="address2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              label="Address 2"
              info={fieldInfo.address2}
              rows={4}
            />
            <NormalInput
              id="mobileNo"
              name="mobileNo"
              type="tel"
              value={mobileNo}
              onChange={handleMobileChange}
              label="Mobile No"
              required
              info={fieldInfo.mobileNo}
              maxLength={10}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // ----- Edit Modal Tabs -----
  const editTabs = [
    { title: 'Location Details', icon: HiIdentification, tooltip: 'Edit profit center location details.' },
    { title: 'Manager Details', icon: HiUserGroup, tooltip: 'Change assigned managers.' },
    { title: 'Address Details', icon: HiLocationMarker, tooltip: 'Update address and contact information.' },
  ];

  const isEditTabComplete = (tabIndex: number): boolean => {
    if (!editItem) return false;
    switch (tabIndex) {
      case 0:
        return !!(editItem.locationID && editItem.locationName && editItem.segmentName && editItem.paymentType && editFromDate && editToDate);
      case 1:
        return true;
      case 2:
        return !!editMobileNo;
      default:
        return false;
    }
  };

  const renderEditTabContent = () => {
    if (!editItem) return null;
    switch (editActiveTab) {
      case 0:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NormalInput id="edit-locationId" name="locationId" value={editItem.locationID} onChange={() => {}} label="Location ID" disabled info={fieldInfo.locationId} />
            <NormalInput id="edit-locationName" name="locationName" value={editItem.locationName} onChange={() => {}} label="Location Name" disabled info={fieldInfo.locationName} />
            <NormalInput id="edit-segment" name="segment" value={editItem.segmentName} onChange={() => {}} label="Segment" disabled info={fieldInfo.segment} />
            <NormalInput id="edit-paymentType" name="paymentType" value={editItem.paymentType} onChange={() => {}} label="Payment Type" disabled info={fieldInfo.paymentType} />
            <SelectField
              id="edit-contract"
              name="contract"
              value={editContract}
              onChange={(e) => setEditContract(e.target.value)}
              label="Contract"
              options={[{ value: '0', label: 'OTHERS' }, ...contracts.map((item: any) => ({ value: item.pk.toString(), label: item.name }))]}
              required
              info={fieldInfo.contract}
            />
            <NormalInput id="edit-fromDate" name="fromDate" type="date" value={editFromDate} onChange={(e) => setEditFromDate(e.target.value)} label="Contract Start Date" required info={fieldInfo.fromDate} />
            <NormalInput id="edit-toDate" name="toDate" type="date" value={editToDate} onChange={(e) => setEditToDate(e.target.value)} label="Contract End Date" required info={fieldInfo.toDate} min={editFromDate} />
            <NormalInput id="edit-entityId" name="entityId" value={editItem.entityId?.toString() || 'OM01'} onChange={() => {}} label="Entity ID" disabled info={fieldInfo.entityId} />
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField id="edit-locationManagerId" name="locationManagerId" value={editLocationManagerId} onChange={(e) => setEditLocationManagerId(e.target.value)} label="Location Manager" options={lmManagers.map((item: any) => ({ value: item.code, label: item.name }))} info={fieldInfo.locationManagerId} />
            <SelectField id="edit-operationManagerId" name="operationManagerId" value={editOperationManagerId} onChange={(e) => setEditOperationManagerId(e.target.value)} label="Operation Manager" options={omManagers.map((item: any) => ({ value: item.code, label: item.name }))} info={fieldInfo.operationManagerId} />
            <SelectField id="edit-projectManagerId" name="projectManagerId" value={editProjectManagerId} onChange={(e) => setEditProjectManagerId(e.target.value)} label="Project Manager" options={pmManagers.map((item: any) => ({ value: item.code, label: item.name }))} info={fieldInfo.projectManagerId} />
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NormalTextarea id="edit-address1" name="address1" value={editAddress1} onChange={(e) => setEditAddress1(e.target.value)} label="Address 1" info={fieldInfo.address1} rows={4} />
            <NormalTextarea id="edit-address2" name="address2" value={editAddress2} onChange={(e) => setEditAddress2(e.target.value)} label="Address 2" info={fieldInfo.address2} rows={4} />
            <NormalInput id="edit-mobileNo" name="mobileNo" type="tel" value={editMobileNo} onChange={handleEditMobileChange} label="Mobile No" required info={fieldInfo.mobileNo} maxLength={10} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-h-auto w-full px-1 py-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-1 sm:p-1 transition-colors duration-300 flex flex-col">
      <style>{shakeAnimationStyle}</style>
      <Toastify />
      {showSessionExpired && <SessionModal />}

      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl w-full mx-2 px-1 mb-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-3 py-3 sm:h-14 sm:flex sm:items-center">
          {showForm ? (
            <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-lg sm:text-xl text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <AiOutlineStock className="h-5 w-5" />
                Profit Center Creation
                <InfoTooltip content="Create and manage profit centers." />
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Tooltip content="Save">
                  <button
                    className="w-10 h-10 p-0 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg"
                    onClick={handleSave}
                  >
                    <FaSave size={18} />
                  </button>
                </Tooltip>
                <Tooltip content="Refresh">
                  <Button
                    color="warning"
                    size="xs"
                    className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg"
                    onClick={handleRefresh}
                  >
                    <HiRefresh className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="List">
                  <Button
                    color="primary"
                    size="xs"
                    className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg"
                    onClick={handleListClick}
                  >
                    <HiViewList className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-lg sm:text-xl text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <AiOutlineStock className="h-5 w-5" />
                Profit Center List
                <InfoTooltip content="View and manage profit centers." />
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition-all ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <span className="hidden sm:inline">Table</span>
                    <span className="sm:hidden">T</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <span className="hidden sm:inline">Grid</span>
                    <span className="sm:hidden">G</span>
                  </button>
                </div>
                <Tooltip content="Add">
                  <button
                    onClick={handleAddClick}
                    className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-md"
                  >
                    <HiPlus className="text-sm" />
                  </button>
                </Tooltip>
                <Tooltip content="Excel">
                  <button
                    onClick={handleExcelClick}
                    className="h-9 w-9 rounded-full bg-green-500 hover:bg-green-400 text-white flex items-center justify-center transition-colors shadow-md"
                  >
                    <RiFileExcel2Fill className="text-sm" />
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      {showForm ? (
        <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 flex-1 min-h-0 w-full flex flex-col">
          {/* Tab bar */}
          <div className="flex mb-4 overflow-x-auto pb-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const complete = isTabComplete(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === index
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.title}</span>
                  {complete && <FaCheckCircle className="w-4 h-4 text-green-500 ml-1" />}
                  <Tooltip content={tab.tooltip} placement="top">
                    <FaInfoCircle className="w-3 h-3 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 ml-1 cursor-help" />
                  </Tooltip>
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-1">{renderTabContent()}</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 flex-1 min-h-0 w-full">
          <ProfitCenterTable
            ref={tableRef}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddNew={handleAddClick}
            onShowConfirm={showConfirmModal}
            onView={handleView}
            onEdit={handleEdit}
          />
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
                Confirm {confirmTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                {confirmMessage}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirm(false);
                  // 🔁 Call the action stored in ref
                  if (confirmActionRef.current) {
                    await confirmActionRef.current();
                  }
                }}
                className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  confirmType === 'status'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900 focus:ring-red-500 dark:focus:ring-offset-gray-900'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
                }`}
              >
                {confirmType === 'save' && 'Save'}
                {confirmType === 'status' && 'Update'}
                {confirmType === 'download' && 'Download'}
                {confirmType === 'edit' && 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <HiOutlineOfficeBuilding className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-indigo-700 dark:text-white">Profit Center Details</h2>
                <span className="px-2.5 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
                  ID: {viewData.locationID}
                </span>
              </div>
              <button onClick={closeView} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Close modal">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <section className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HiIdentification className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Location ID</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.locationID}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Location Name</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.locationName}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Entity ID</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.entityId || 'OM01'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Country</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.countryID || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Region</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.region || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p><Badge color={viewData.iSActive === 1 ? 'success' : 'failure'} className="px-3 py-1 text-xs font-medium rounded-full">{viewData.iSActive === 1 ? 'Active' : 'Inactive'}</Badge></div>
                </div>
              </section>

              {/* Contract Details */}
              <section className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HiDocumentText className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Contract Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Contract Name</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.contractName || 'N/A'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Contract Start</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.contractStartDt || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Contract End</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.contractEndDt || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Payment Type</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.typeOfPaymentStr || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Segment</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.segmentName || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">isCWH</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.isCwh ? 'Yes' : 'No'}</p></div>
                </div>
              </section>

              {/* Address */}
              <section className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HiLocationMarker className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Address</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Street Address 1</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.streetAddress1 || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Street Address 2</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.streetAddress2 || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Telephone</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.telPhoneNo || '—'}</p></div>
                </div>
              </section>

              {/* Managers */}
              <section className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HiUserGroup className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Managers</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Location Manager ID</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.locationManagerID || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Operation Manager ID</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.operationManagerID || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Project Manager ID</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.projectManagerID || '—'}</p></div>
                </div>
              </section>

              {/* System Information */}
              <section className="bg-gray-50/80 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HiCog className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">System Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Location PK</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.locationPk}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Last Update</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.lastUpdate ? new Date(viewData.lastUpdate).toLocaleString() : '—'}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Last User</p><p className="text-sm font-medium text-gray-900 dark:text-white">{viewData.lastUser || '—'}</p></div>
                </div>
              </section>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button onClick={closeView} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Tabbed) */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl mx-auto max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-none p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  Modify Profit Center
                </h2>
                <div className="flex space-x-2 self-end sm:self-auto">
                  <button type="button" onClick={closeEdit} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 transition-all shadow-md hover:shadow-lg">Cancel</button>
                  <button type="button" onClick={requestUpdate} className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg">Save Changes</button>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {/* Tabs */}
              <div className="flex mb-4 overflow-x-auto pb-1 px-4 sm:px-6">
                {editTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isComplete = isEditTabComplete(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditActiveTab(index)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        editActiveTab === index
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.title}</span>
                      {isComplete && <FaCheckCircle className="w-4 h-4 text-green-500 ml-1" />}
                      <Tooltip content={tab.tooltip} placement="top">
                        <FaInfoCircle className="w-3 h-3 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 ml-1 cursor-help" />
                      </Tooltip>
                    </button>
                  );
                })}
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">{renderEditTabContent()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitCenter;