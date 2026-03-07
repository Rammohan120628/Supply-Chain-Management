import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Edit, Search, Database
} from 'lucide-react';
import { CircleCheckBig } from 'lucide-react';
import { FaChevronLeft, FaChevronRight, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { HiRefresh, HiViewList } from 'react-icons/hi';
import { Button, Tooltip } from "flowbite-react";
import { FaSave } from "react-icons/fa";
import { LuUser } from "react-icons/lu";
import Toastify, { showToast } from '../Toastify';
import SessionModal from '../SessionModal';
import CardBox from 'src/components/shared/CardBox';

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
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-help inline" />
  </Tooltip>
);

// ================== NormalInput Component (with optional error message) ==================
const NormalInput = ({
  id,
  name,
  value,
  onChange,
  label,
  required,
  info,
  error,
  maxLength,
  shake,
  rightElement,
  hideErrorMessage = false,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  info?: string;
  error?: string;
  maxLength?: number;
  shake?: boolean;
  rightElement?: React.ReactNode;
  hideErrorMessage?: boolean;
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
          type="text"
          value={value}
          onChange={onChange}
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
      {/* Only show error message if not hidden */}
      {error && !hideErrorMessage && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

interface ManagerFormData {
  managerPk?: number;
  managerId: string;
  managerName: string;
  capacity: string;
  address1: string;
  address2: string;
  telPhoneNo: string;
  mobileNo: string;
  pagerNo: string;
  email: string;
  isActive?: number;
}

interface Manager {
  managerPk: number;
  managerId: string;
  managerName: string;
  capacityName: string;
  email: string;
  status: string;
}

const BASE_URL = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController';

const capacityOptions = [
  { value: 'LM', label: 'Location Manager' },
  { value: 'PM', label: 'Project Manager' },
  { value: 'OM', label: 'Operation Manager' },
];

// Field info texts
const fieldInfo: Record<string, string> = {
  managerId: 'Unique ID for manager. Alphanumeric, 4-15 characters.',
  managerName: 'Full name of the manager.',
  capacity: 'Select the manager type (Location, Project, or Operation Manager).',
  address1: 'Primary address line (max 500 characters).',
  address2: 'Secondary address line (max 500 characters).',
  telPhoneNo: 'Telephone number – exactly 10 digits.',
  mobileNo: 'Mobile number – exactly 10 digits.',
  pagerNo: 'Pager number (alphanumeric, optional).',
  email: 'Valid email address (must contain @ and .).',
};

// Fixed records per page
const RECORDS_PER_PAGE = 10;

// ----------------- Confirm Modal (unchanged) -----------------
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
        return 'Are you sure you want to save this new manager?';
      case 'edit':
        return 'Are you sure you want to modify this manager?';
      case 'status':
        return `Are you sure you want to change the status of ${targetId || 'this manager'}?`;
      case 'download':
        return 'Are you sure you want to download the manager report?';
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

// -----------------------------------------------------------------------------

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function apiCall(url: string, options: RequestInit = {}): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    throw new Error('Session expired');
  }
  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `HTTP error! status: ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return response.json();
}

async function fetchManagers() {
  const { data } = await apiCall(`${BASE_URL}/listManagersCreation`);
  console.log('Fetched Managers:', data);
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data.map((d: any) => ({
    managerPk: d.managerPk,
    managerId: d.managerId,
    managerName: d.managerName,
    capacityName: d.capacityName,
    email: d.emailNo,
    status: d.status,
  })) as Manager[];
}

async function fetchManager(pk: number) {
  const { data } = await apiCall(`${BASE_URL}/viewManagersCreation/${pk}`);
  return data;
}

async function saveManager(formData: ManagerFormData) {
  const payload = {
    managerId: formData.managerId,
    managerName: formData.managerName,
    capacity: formData.capacity,
    stAddress1: formData.address1,
    stAddress2: formData.address2,
    telPhoneNo: formData.telPhoneNo,
    emailNo: formData.email,
    pagerNo: formData.pagerNo,
    mobNo: formData.mobileNo,
    entityId: localStorage.getItem('entity'),
    lastUser: parseInt(localStorage.getItem('userId') || '0'),
  };
  const res = await apiCall(`${BASE_URL}/saveManagersCreation`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res;
}

async function modifyManager(formData: ManagerFormData) {
  const payload = {
    managerPk: formData.managerPk,
    managerId: formData.managerId,
    managerName: formData.managerName,
    capacity: formData.capacity,
    stAddress1: formData.address1,
    stAddress2: formData.address2,
    telPhoneNo: formData.telPhoneNo,
    mobNo: formData.mobileNo,
    pagerNo: formData.pagerNo,
    emailNo: formData.email,
    isActive: formData.isActive || 0,
    entityId: localStorage.getItem('entity'),
    lastUser: parseInt(localStorage.getItem('userId') || '0'),
  };
  const res = await apiCall(`${BASE_URL}/modifyManagersCreation`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res;
}

async function updateStatus(pk: number, isActive: number) {
  const payload = { managerPk: pk, isActive };
  const res = await apiCall(`${BASE_URL}/managerStatusUpdate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res;
}

async function validateManagerId(id: string) {
  const payload = { managerId: id };
  const res = await apiCall(`${BASE_URL}/managerId`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res;
}

interface ManagersCreationFormProps {
  onSwitchToList: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  setShowSessionModal: (show: boolean) => void;
}

const ManagersCreationForm: React.FC<ManagersCreationFormProps> = ({
  onSwitchToList,
  addToast,
  setShowSessionModal,
}) => {
  const initialFormData: ManagerFormData = {
    managerId: '',
    managerName: '',
    capacity: '',
    address1: '',
    address2: '',
    telPhoneNo: '',
    mobileNo: '',
    pagerNo: '',
    email: '',
  };
  const [formData, setFormData] = useState<ManagerFormData>(initialFormData);
  const [address1Chars, setAddress1Chars] = useState(500);
  const [address2Chars, setAddress2Chars] = useState(500);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | 'download'>('add');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Manager ID validation states
  const [managerIdError, setManagerIdError] = useState('');
  const [managerIdValid, setManagerIdValid] = useState(false);
  const [managerIdShake, setManagerIdShake] = useState(false);

  // Determine if the form is complete (for tab completion checkmark)
  const isFormValid = useMemo(() => {
    const { managerId, managerName, capacity, address1, address2, telPhoneNo, mobileNo, email } = formData;
    return (
      managerId.trim().length >= 4 &&
      managerId.trim().length <= 15 &&
      managerName.trim() !== '' &&
      capacity !== '' &&
      address1.trim() !== '' &&
      address2.trim() !== '' &&
      telPhoneNo.length === 10 &&
      mobileNo.length === 10 &&
      email.includes('@') &&
      email.includes('.')
    );
  }, [formData]);

  const validateForm = (): boolean => {
    const requiredFields = [
      { field: formData.managerId, name: 'Manager ID', min: 4, max: 15 },
      { field: formData.managerName, name: 'Manager Name' },
      { field: formData.capacity, name: 'Capacity' },
      { field: formData.address1, name: 'Address1' },
      { field: formData.address2, name: 'Address2' },
      { field: formData.telPhoneNo, name: 'Tel Phone No', length: 10 },
      { field: formData.mobileNo, name: 'Mobile No', length: 10 },
      { field: formData.email, name: 'Email' },
    ];

    for (const { field, name, length } of requiredFields) {
      if (!field.trim()) {
        addToast(`${name} is required`, 'error');
        return false;
      }
      if (length !== undefined && field.length !== length) {
        addToast(`${name} must be exactly ${length} digits`, 'error');
        return false;
      }
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      addToast('Email must contain @ and .', 'error');
      return false;
    }

    return true;
  };

  const showConfirmation = (type: 'add' | 'edit' | 'status', action: () => void) => {
    setConfirmType(type);
    setConfirmAction(() => action);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    if ((name === 'mobileNo' || name === 'telPhoneNo') && value.length > 10) {
      value = value.slice(0, 10);
    }
    if (name === 'mobileNo' || name === 'telPhoneNo') {
      value = value.replace(/\D/g, '');
    }
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset validation when managerId changes
    if (name === 'managerId') {
      setManagerIdError('');
      setManagerIdValid(false);
    }

    if (name === 'address1') {
      setAddress1Chars(500 - value.length);
    } else if (name === 'address2') {
      setAddress2Chars(500 - value.length);
    }
  };

  // Check button handler
  const handleManagerIdCheck = async () => {
    const id = formData.managerId.trim();
    if (!id) {
      setManagerIdError('Manager ID is required');
      setManagerIdShake(true);
      setTimeout(() => setManagerIdShake(false), 500);
      addToast('Manager ID is required', 'error');
      return;
    }
    if (id.length < 4 || id.length > 15) {
      setManagerIdError('Manager ID must be 4-15 characters');
      setManagerIdShake(true);
      setTimeout(() => setManagerIdShake(false), 500);
      addToast('Manager ID must be 4-15 characters', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await validateManagerId(id);
      if (res.success) {
        setManagerIdError('');
        setManagerIdValid(true);
        addToast(res.message, 'success');
      } else {
        setManagerIdError(res.message || 'Manager ID already exists');
        setManagerIdValid(false);
        setManagerIdShake(true);
        setTimeout(() => setManagerIdShake(false), 500);
        addToast(res.message || 'Manager ID already exists', 'error');
      }
    } catch (err: any) {
      if (err.message === 'Session expired') {
        setShowSessionModal(true);
      } else {
        setManagerIdError(err.message || 'Validation error');
        setManagerIdShake(true);
        setTimeout(() => setManagerIdShake(false), 500);
        addToast(err.message || 'Validation error', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const performSave = async () => {
    setIsLoading(true);
    try {
      const res = await saveManager(formData);
      if (res.success) {
        addToast(res.message, 'success');
        setFormData(initialFormData);
        setAddress1Chars(500);
        setAddress2Chars(500);
        setManagerIdError('');
        setManagerIdValid(false);
      } else {
        addToast(res.message || 'Failed to save manager', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to save manager', 'error');
      if (err.message === 'Session expired') {
        setShowSessionModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      showConfirmation('add', performSave);
    }
  };

  const performCancel = () => {
    setFormData(initialFormData);
    setAddress1Chars(500);
    setAddress2Chars(500);
    setManagerIdError('');
    setManagerIdValid(false);
  };

  const handleCancel = () => {
    performCancel();
  };

  const handleClose = () => {
    onSwitchToList();
  };

  // Single tab definition
  const tab = {
    title: 'Manager Details',
    icon: LuUser,
    tooltip: 'Enter manager details including ID, name, capacity, addresses, contact numbers, and email.',
  };

  return (
    <>
      <style>{shakeAnimationStyle}</style>
      <div className="max-h-screen w-full dark:bg-gray-900 p-2 md:p-3 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header with info tooltip */}
          <div className="bg-white dark:bg-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-lg mb-4 gap-4">
            <h1 className="text-xl text-indigo-700 flex items-center gap-2">
              <LuUser className='h-5 w-5 text-indigo-700' />
              Managers Creation
              <InfoTooltip content="Create and manage managers." />
            </h1>
            <div className="flex space-x-3 w-full sm:w-auto">
              <Tooltip content="Save">
                <Button
                  color="success"
                  size="xs"
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  <FaSave className="w-4 h-4" />
                </Button>
              </Tooltip>

              <Tooltip content="Refresh">
                <Button
                  color="warning"
                  size="xs"
                  onClick={handleCancel}
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                  disabled={isLoading}
                >
                  <HiRefresh className="w-4 h-4" />
                </Button>
              </Tooltip>

              <Tooltip content="List">
                <Button
                  color="primary"
                  size="xs"
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <HiViewList className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Tabbed form container */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 w-full">
            {/* Single tab */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <NormalInput
                    id="managerId"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    label="Manager ID"
                    required
                    info={fieldInfo.managerId}
                    error={managerIdError}
                    maxLength={15}
                    shake={managerIdShake}
                    hideErrorMessage={true} // Hide inline error, only show toast
                    rightElement={
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleManagerIdCheck}
                          disabled={isLoading}
                          className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          Check
                        </button>
                        {managerIdValid && <FaCheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    }
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="managerName" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager Name <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.managerName} />
                  </label>
                  <input
                    type="text"
                    id="managerName"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="capacity" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager Type <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.capacity} />
                  </label>
                  <select
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none bg-no-repeat bg-clip-padding bg-origin-padding cursor-pointer"
                  >
                    <option value="">Please select</option>
                    {capacityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-1">
                  <label htmlFor="address1" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address1 <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.address1} />
                  </label>
                  <textarea
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    maxLength={250}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{address1Chars} characters remaining.</p>
                </div>

                <div className="lg:col-span-1">
                  <label htmlFor="address2" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address2 <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.address2} />
                  </label>
                  <textarea
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    maxLength={250}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{address2Chars} characters remaining.</p>
                </div>

                <div className="lg:col-span-1 flex flex-col space-y-2">
                  <div>
                    <label htmlFor="mobileNo" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile No <span className="text-red-500">*</span>
                      <InfoTooltip content={fieldInfo.mobileNo} />
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="mobileNo"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleInputChange}
                      required
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="pagerNo" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pager No
                      <InfoTooltip content={fieldInfo.pagerNo} />
                    </label>
                    <input
                      type="text"
                      id="pagerNo"
                      name="pagerNo"
                      value={formData.pagerNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telPhoneNo" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tel Phone No <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.telPhoneNo} />
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="telPhoneNo"
                    name="telPhoneNo"
                    value={formData.telPhoneNo}
                    onChange={handleInputChange}
                    required
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.email} />
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <ConfirmModal
          isOpen={showConfirm}
          confirmType={confirmType}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
        {isLoading && (
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
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

interface ManagersListProps {
  onSwitchToCreate: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  setShowSessionModal: (show: boolean) => void;
}

const ManagersList: React.FC<ManagersListProps> = ({
  onSwitchToCreate,
  addToast,
  setShowSessionModal,
}) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Manager; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalFormData, setModalFormData] = useState<ManagerFormData | null>(null);
  const [, setOriginalManagerId] = useState('');
  const [address1ModalChars, setAddress1ModalChars] = useState(500);
  const [address2ModalChars, setAddress2ModalChars] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | 'download'>('add');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetManagerId, setTargetManagerId] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  const validateForm = (): boolean => {
    if (!modalFormData) return false;
    const requiredFields = [
      { field: modalFormData.managerId, name: 'Manager ID', min: 4, max: 15 },
      { field: modalFormData.managerName, name: 'Manager Name' },
      { field: modalFormData.capacity, name: 'Capacity' },
      { field: modalFormData.address1, name: 'Address1' },
      { field: modalFormData.address2, name: 'Address2' },
      { field: modalFormData.telPhoneNo, name: 'Tel Phone No', length: 10 },
      { field: modalFormData.mobileNo, name: 'Mobile No', length: 10 },
      { field: modalFormData.email, name: 'Email' },
    ];

    for (const { field, name, min, max, length } of requiredFields) {
      if (!field.trim()) {
        addToast(`${name} is required`, 'error');
        return false;
      }
      if (min !== undefined && (field.length < min || field.length > max)) {
        addToast(`${name} must be between ${min} and ${max} characters`, 'error');
        return false;
      }
      if (length !== undefined && field.length !== length) {
        addToast(`${name} must be exactly ${length} digits`, 'error');
        return false;
      }
    }

    if (!modalFormData.email.includes('@') || !modalFormData.email.includes('.')) {
      addToast('Email must contain @ and .', 'error');
      return false;
    }

    return true;
  };

  const showConfirmation = (
    type: 'add' | 'edit' | 'status',
    action: () => void,
    targetId?: string
  ) => {
    setConfirmType(type);
    setConfirmAction(() => action);
    setTargetManagerId(targetId);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
    setTargetManagerId(undefined);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setTargetManagerId(undefined);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchManagers()
      .then(setManagers)
      .catch((err: any) => {
        if (err.message === 'Session expired') {
          setShowSessionModal(true);
        } else {
          addToast(err.message || 'Failed to fetch managers', 'error');
        }
      })
      .finally(() => setIsLoading(false));
  }, [addToast, setShowSessionModal]);

  const handleSort = (key: keyof Manager) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const sortedManagers = useMemo(() => {
    let sortable = [...managers];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key] ?? '';
        let bVal = b[sortConfig.key] ?? '';
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortable;
  }, [managers, sortConfig]);

  const filteredManagers = useMemo(() => {
    return sortedManagers.filter(
      (manager) =>
        manager.managerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.capacityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (manager.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedManagers, searchTerm]);

  const totalRows = filteredManagers.length;
  const totalPages = Math.ceil(totalRows / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, totalRows);
  const currentRows = filteredManagers.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig?.key, sortConfig?.direction]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleEdit = async (manager: Manager) => {
    setIsLoading(true);
    try {
      const data = await fetchManager(manager.managerPk);
      const formData: ManagerFormData = {
        managerPk: data.managerPk,
        managerId: data.managerId,
        managerName: data.managerName,
        capacity: data.capacity,
        address1: data.stAddress1 || '',
        address2: data.stAddress2 || '',
        telPhoneNo: data.telPhoneNo || '',
        mobileNo: data.mobNo || '',
        pagerNo: data.pagerNo || '',
        email: data.emailNo || '',
        isActive: data.isActive,
      };
      setModalFormData(formData);
      setOriginalManagerId(data.managerId);
      setAddress1ModalChars(500 - (data.stAddress1 || '').length);
      setAddress2ModalChars(500 - (data.stAddress2 || '').length);
      setShowEditModal(true);
    } catch (err: any) {
      if (err.message === 'Session expired') {
        setShowSessionModal(true);
      } else {
        addToast(err.message || 'Failed to load manager details', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    if ((name === 'mobileNo' || name === 'telPhoneNo') && value.length > 10) {
      value = value.slice(0, 10);
    }
    if (name === 'mobileNo' || name === 'telPhoneNo') {
      value = value.replace(/\D/g, '');
    }
    setModalFormData((prev) => ({ ...prev!, [name]: value } as ManagerFormData));

    if (name === 'address1') {
      setAddress1ModalChars(500 - value.length);
    } else if (name === 'address2') {
      setAddress2ModalChars(500 - value.length);
    }
  };

  const performUpdate = async () => {
    if (!modalFormData) return;
    setIsLoading(true);
    try {
      const res = await modifyManager(modalFormData);
      if (res.success) {
        addToast(res.message, 'success');
        setShowEditModal(false);
        setModalFormData(null);
        const updatedList = await fetchManagers();
        setManagers(updatedList);
      } else {
        addToast(res.message || 'Failed to update manager', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update manager', 'error');
      if (err.message === 'Session expired') {
        setShowSessionModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      showConfirmation('edit', performUpdate);
    }
  };

  const performStatusUpdate = async (pk: number, newIsActive: number) => {
    setIsLoading(true);
    try {
      const res = await updateStatus(pk, newIsActive);
      if (res.success) {
        addToast(res.message || `Manager ${newIsActive === 1 ? 'Active' : 'In-active'} successfully`, 'success');
        const updatedList = await fetchManagers();
        setManagers(updatedList);
      } else {
        addToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update status', 'error');
      if (err.message === 'Session expired') {
        setShowSessionModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = (manager: Manager) => {
    const newIsActive = manager.status === 'Active' ? 0 : 1;
    showConfirmation(
      'status',
      () => performStatusUpdate(manager.managerPk, newIsActive),
      manager.managerId
    );
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setModalFormData(null);
  };

  // Emoji sorting indicator
  const getSortIcon = (key: keyof Manager) => {
    if (!sortConfig || sortConfig.key !== key) {
      return ' ↕️';
    }
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="max-h-screen w-full dark:bg-gray-900 p-2 sm:p-3 md:p-4">
      <div className="max-w-7xl mx-2">
        {/* Header with info tooltip */}
        <div className="bg-white dark:bg-gray-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <LuUser className='h-5 w-5 text-indigo-600' />
            <h1 className="text-xl flex gap-2 items-center text-indigo-600">
              Managers Creation List
              <InfoTooltip content="List of all managers. You can search, sort, edit, or change status." />
            </h1>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Tooltip content="Add">
              <button
                onClick={onSwitchToCreate}
                className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors shadow-sm"
              >
                <Plus size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="w-full bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
          {/* Search bar */}
          <div className="flex items-end justify-end p-1">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder={`Search ${totalRows} records...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Table Container - scrollable on small screens */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
            <div className="overflow-x-auto max-h-[400px] sm:max-h-[450px] lg:max-h-[390px]">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                <thead className="sticky top-0 z-2 h-8 bg-blue-600 dark:bg-blue-700">
                  <tr>
                    <th className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none w-[5%]">
                      S.No
                    </th>
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none w-[13%]"
                      onClick={() => handleSort('managerId')}
                    >
                      <div className="flex items-center gap-1">
                        Manager Id <span className="text-white">{getSortIcon('managerId')}</span>
                      </div>
                    </th>
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none w-[19%]"
                      onClick={() => handleSort('managerName')}
                    >
                      <div className="flex items-center gap-1">
                        Manager Name <span className="text-white">{getSortIcon('managerName')}</span>
                      </div>
                    </th>
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none w-[14%]"
                      onClick={() => handleSort('capacityName')}
                    >
                      <div className="flex items-center gap-1">
                        Capacity Name <span className="text-white">{getSortIcon('capacityName')}</span>
                      </div>
                    </th>
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none w-[19%]"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1">
                        Email Id <span className="text-white">{getSortIcon('email')}</span>
                      </div>
                    </th>
                    <th
                      className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight cursor-pointer select-none w-[10%]"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status <span className="text-white">{getSortIcon('status')}</span>
                      </div>
                    </th>
                    <th className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none w-[12%]">
                      <div className="flex items-center gap-1">Change Status</div>
                    </th>
                    <th className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none w-[8%]">
                      <div className="flex items-center gap-1">Modify</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRows.length > 0 ? (
                    currentRows.map((manager, index) => (
                      <tr
                        key={manager.managerPk}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                      >
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                            {startIndex + index + 1}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                            {manager.managerId}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                            {manager.managerName}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white">
                            {manager.capacityName}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white truncate">
                            {manager.email}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px]">
                            <span
                              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                                manager.status === 'Active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {manager.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px]">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={manager.status === 'Active'}
                                onChange={() => handleStatusUpdate(manager)}
                              />
                              <div
                                className={`
                                  relative w-11 h-6 bg-gray-300 dark:bg-gray-600 
                                  peer-focus:outline-none peer-focus:ring-4 
                                  peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                                  rounded-full transition-colors duration-300
                                  peer-checked:bg-blue-500 peer-checked:dark:bg-blue-600
                                  after:content-['✕']
                                  peer-checked:after:content-['✓']
                                  after:absolute after:top-[2px] after:left-[2px]
                                  after:flex after:items-center after:justify-center
                                  after:text-[10px] after:font-bold
                                  after:text-gray-700 dark:after:text-gray-700
                                  after:bg-white after:rounded-full
                                  after:h-5 after:w-5
                                  after:transition-all after:duration-300
                                  peer-checked:after:translate-x-5
                                `}
                              ></div>
                            </label>
                          </div>
                        </td>
                        <td className="px-1.5 py-1 align-top whitespace-nowrap">
                          <div className="leading-tight min-h-[24px] flex items-start text-[11px]">
                            <button
                              onClick={() => handleEdit(manager)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center">
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

          {/* Uniform Pagination Footer */}
          {totalRows > 0 && (
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              <div>
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalRows}</span> records
                {searchTerm && (
                  <span>
                    {' '}for search: <span className="font-medium">"{searchTerm}"</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px]">
                  {startIndex + 1}-{endIndex} of {totalRows}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <FaChevronLeft className="w-2.5 h-2.5 inline mr-0.5" />
                    Prev
                  </button>
                  <span className="px-2 py-0.5 text-[12px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-1.5 py-0.5 rounded border text-[12px] transition-colors ${
                      currentPage === totalPages
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
      </div>

      {/* Edit Modal with info tooltips */}
      {showEditModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-2 gap-2">
              <h2 className="text-xl font-bold text-blue-600 flex items-center">
                <LuUser className="w-5 h-5 inline mr-2 font-bold" />
                Manager details
              </h2>
              <div className="flex justify-end space-x-2 w-full sm:w-auto">
                {modalFormData && (
                  <>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="edit-form"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <form id="edit-form" onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label htmlFor="managerId" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager ID <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.managerId} />
                  </label>
                  <input
                    type="text"
                    id="managerId"
                    name="managerId"
                    value={modalFormData?.managerId || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="managerName" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager Name <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.managerName} />
                  </label>
                  <input
                    type="text"
                    id="managerName"
                    name="managerName"
                    value={modalFormData?.managerName || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="capacity" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manager Type <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.capacity} />
                  </label>
                  <select
                    id="capacity"
                    name="capacity"
                    value={modalFormData?.capacity || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                  >
                    <option value="">Please select</option>
                    {capacityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-1">
                  <label htmlFor="address1" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address1 <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.address1} />
                  </label>
                  <textarea
                    id="address1"
                    name="address1"
                    value={modalFormData?.address1 || ''}
                    onChange={handleModalInputChange}
                    required
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{address1ModalChars} characters remaining.</p>
                </div>

                <div className="lg:col-span-1">
                  <label htmlFor="address2" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address2 <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.address2} />
                  </label>
                  <textarea
                    id="address2"
                    name="address2"
                    value={modalFormData?.address2 || ''}
                    onChange={handleModalInputChange}
                    required
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{address2ModalChars} characters remaining.</p>
                </div>

                <div className="lg:col-span-1 flex flex-col space-y-2">
                  <div>
                    <label htmlFor="mobileNo" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mobile No <span className="text-red-500">*</span>
                      <InfoTooltip content={fieldInfo.mobileNo} />
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="mobileNo"
                      name="mobileNo"
                      value={modalFormData?.mobileNo || ''}
                      onChange={handleModalInputChange}
                      required
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="pagerNo" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pager No
                      <InfoTooltip content={fieldInfo.pagerNo} />
                    </label>
                    <input
                      type="text"
                      id="pagerNo"
                      name="pagerNo"
                      value={modalFormData?.pagerNo || ''}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telPhoneNo" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tel Phone No <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.telPhoneNo} />
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="telPhoneNo"
                    name="telPhoneNo"
                    value={modalFormData?.telPhoneNo || ''}
                    onChange={handleModalInputChange}
                    required
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                    <InfoTooltip content={fieldInfo.email} />
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={modalFormData?.email || ''}
                    onChange={handleModalInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        confirmType={confirmType}
        targetId={targetManagerId}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ManagersCreations: React.FC = () => {
  const [view, setView] = useState<'create' | 'list'>('create');
  const [showSessionModal, setShowSessionModal] = useState(false);

  const addToast = (message: string, type: 'success' | 'error') => {
    showToast(message, type);
  };

  const renderSessionModal = () => <SessionModal />;

  const handleSwitchToList = () => setView('list');
  const handleSwitchToCreate = () => setView('create');

  return (
    <>
      {view === 'create' ? (
        <ManagersCreationForm
          onSwitchToList={handleSwitchToList}
          addToast={addToast}
          setShowSessionModal={setShowSessionModal}
        />
      ) : (
        <ManagersList
          onSwitchToCreate={handleSwitchToCreate}
          addToast={addToast}
          setShowSessionModal={setShowSessionModal}
        />
      )}
      {showSessionModal && renderSessionModal()}
      <Toastify />
    </>
  );
};

export default ManagersCreations;