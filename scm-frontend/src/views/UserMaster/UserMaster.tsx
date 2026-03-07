import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  HiViewList,
  HiPlus,
  HiLockClosed,
  HiDocumentDuplicate,
  HiX,
  HiRefresh,
  HiSearch,
  HiEye,
  HiEyeOff,
  HiKey,
  HiUser,
  HiMail,
} from 'react-icons/hi';
import { Tooltip } from 'flowbite-react';
import { UserRoundPen, SquarePen, CircleCheckBig, Database } from 'lucide-react';
import { FaChevronLeft, FaChevronRight, FaInfoCircle, FaCheckCircle, FaSave } from 'react-icons/fa';
import Toastify, { showToast } from '../Toastify';
import SessionModal from 'src/views/SessionModal';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  flexRender,
} from '@tanstack/react-table';

// ================== Helper Components ==================
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-2">
    <FaInfoCircle className="w-3.5 h-3.5 text-blue-500 mx-2 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-help inline" />
  </Tooltip>
);

interface PasswordInputProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showStrength?: boolean;
  strength?: StrengthCriteria;
  info?: string;
}

interface StrengthCriteria {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
}

type PasswordStrengthLevel = 'Weak' | 'Medium' | 'Strong';

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  required,
  error,
  showStrength,
  strength,
  info,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthLevel = (criteria: StrengthCriteria): PasswordStrengthLevel => {
    const metCount = Object.values(criteria).filter(Boolean).length;
    if (metCount <= 2) return 'Weak';
    if (metCount <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = (level: PasswordStrengthLevel): string => {
    switch (level) {
      case 'Weak': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Strong': return 'bg-green-500';
    }
  };

  const getStrengthTextColor = (level: PasswordStrengthLevel): string => {
    switch (level) {
      case 'Weak': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Strong': return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <div>
      <label
        htmlFor={id || name}
        className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center"
      >
        {label} {required && <span className="text-red-600">*</span>}
        {info && <InfoTooltip content={info} />}
      </label>
      <div className="relative">
        <input
          id={id || name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md bg-white dark:bg-gray-700 pr-10`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
        >
          {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {showStrength && value && strength && (
        <div className="mt-2">
          {(() => {
            const level = getStrengthLevel(strength);
            const colorClass = getStrengthColor(level);
            const textColorClass = getStrengthTextColor(level);
            const metCount = Object.values(strength).filter(Boolean).length;
            const percentage = (metCount / 5) * 100;
            return (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-medium ${textColorClass}`}>Strength: {level}</span>
                  <span className="text-gray-500 dark:text-gray-400">{metCount}/5</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorClass} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

interface MobileInputProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  info?: string;
}

const MobileInput: React.FC<MobileInputProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  required,
  error,
  info,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);
    const modifiedEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: digitsOnly,
      },
    };
    onChange(modifiedEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div>
      <label
        htmlFor={id || name}
        className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center"
      >
        {label} {required && <span className="text-red-600">*</span>}
        {info && <InfoTooltip content={info} />}
      </label>
      <input
        id={id || name}
        name={name}
        type="tel"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={10}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } rounded-md bg-white dark:bg-gray-700`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ---------- Types ----------
interface User {
  userPK: number;
  firstName: string;
  lastName: string;
  userName: string;
  mobile: string;
  mailID: string;
  roleFK: number;
  status: 'Active' | 'Inactive';
}

interface UserFormData {
  firstName: string;
  lastName: string;
  userName: string;
  userType: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
}

interface UserDetailsView {
  userPK: number;
  firstName: string;
  lastName: string;
  userName: string;
  mobile: string;
  mailID: string;
  password?: string;
  roleFK: number;
  status: string;
}

// ---------- Constants ----------
const roleToType: Record<number, string> = {
  1: 'Admin',
  2: 'Purchasing Staff',
  3: 'Super Admin',
};

const userTypes = [
  { value: 'Admin', label: 'Admin', roleFK: 1 },
  { value: 'Purchasing Staff', label: 'Purchasing User', roleFK: 2 },
  { value: 'Super Admin', label: 'Super Admin', roleFK: 3 },
];

const fieldInfo: Record<string, string> = {
  firstName: 'First name of the user (3-15 characters).',
  lastName: 'Last name of the user.',
  userName: 'Unique username (3-15 characters).',
  userType: 'Select the user role type.',
  email: 'Valid email address (must contain @ and .).',
  mobile: 'Mobile number – exactly 10 digits.',
  password:
    'Password must be 6-9 characters with uppercase, lowercase, number, and special character.',
  confirmPassword: 'Re-enter the password to confirm.',
};

const initialFormData: UserFormData = {
  firstName: '',
  lastName: '',
  userName: '',
  userType: '',
  email: '',
  password: '',
  confirmPassword: '',
  mobile: '',
};

// ---------- Main Component ----------
const UserMaster: React.FC = () => {
  // ---------- State ----------
  const [view, setView] = useState<'form' | 'list'>('form');
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPass, setSelectedUserForPass] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passErrors, setPassErrors] = useState({ password: '', confirmPassword: '' });

  // Confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmType, setConfirmType] = useState<'save' | 'update' | 'status' | 'refresh' | null>(null);

  // Session expired
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<StrengthCriteria>({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const editFormRef = useRef<HTMLFormElement>(null);

  // ---------- Helper Functions (defined first to avoid TDZ) ----------
  const normalizeStatus = useCallback((status: any): 'Active' | 'Inactive' => {
    const s = String(status || '').toUpperCase().trim();
    return s === 'A' || s === 'ACTIVE' ? 'Active' : 'Inactive';
  }, []);

  const getApiStatusCode = useCallback((displayStatus: 'Active' | 'Inactive'): 'A' | 'I' => {
    return displayStatus === 'Active' ? 'A' : 'I';
  }, []);

  const validateName = useCallback((name: string): boolean => name.length >= 3 && name.length <= 15, []);
  const validateMobile = useCallback((mobile: string): boolean => /^\d{10}$/.test(mobile), []);
  const validateEmail = useCallback((email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), []);
  const validatePasswordStrength = useCallback((pass: string): StrengthCriteria => ({
    length: pass.length >= 6 && pass.length <= 9,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass),
  }), []);

  // ---------- Derived Data ----------
  const isFormValid = useMemo(() => {
    const { firstName, lastName, userName, userType, email, mobile, password, confirmPassword } = formData;
    return (
      firstName.trim().length >= 3 &&
      lastName.trim() !== '' &&
      userName.trim().length >= 3 &&
      userType !== '' &&
      mobile.length === 10 &&
      email.includes('@') &&
      email.includes('.') &&
      password.length >= 6 &&
      confirmPassword === password
    );
  }, [formData]);

  // ---------- API Helpers ----------
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  const handleApiError = useCallback((error: any) => {
    if (error.name === 'AbortError') {
      showToast('Request timeout – please try again', 'error');
    } else if (error.status === 401 || error.message?.includes('token') || error.message?.includes('session')) {
      setShowSessionExpired(true);
    } else {
      showToast(error.message || 'An error occurred', 'error');
    }
  }, []);

  // ---------- Fetch Users ----------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithTimeout(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/userDetailsShow',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        if (response.status === 401) setShowSessionExpired(true);
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const mapped: User[] = result.data.map((item: any) => ({
          userPK: item.userPK,
          firstName: item.firstName,
          lastName: item.lastName || '',
          userName: item.userName,
          mobile: item.mobile,
          mailID: item.mailID,
          roleFK: item.roleFK,
          status: normalizeStatus(item.status), // now safe
        }));
        setUsers(mapped);
      } else {
        showToast('Failed to load users', 'error');
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [handleApiError, normalizeStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ---------- Fetch Single User Details ----------
  const fetchUserDetails = useCallback(
    async (userPK: number): Promise<UserDetailsView | null> => {
      setGlobalLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetchWithTimeout(
          `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/userDetailsView/${userPK}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          if (response.status === 401) setShowSessionExpired(true);
          throw new Error('Failed to fetch user details');
        }

        const result = await response.json();
        if (result.success && result.data) {
          return result.data as UserDetailsView;
        }
        showToast(result.message || 'Failed to load user details', 'error');
        return null;
      } catch (error: any) {
        handleApiError(error);
        return null;
      } finally {
        setGlobalLoading(false);
      }
    },
    [handleApiError]
  );

  // ---------- Password strength effect ----------
  useEffect(() => {
    setPasswordStrength(validatePasswordStrength(formData.password));
  }, [formData.password, validatePasswordStrength]);

  // ---------- Form Handlers ----------
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    },
    []
  );

  const validateForm = useCallback(
    (isAdd: boolean): boolean => {
      const errors: Partial<Record<keyof UserFormData, string>> = {};

      // Common validations
      if (!formData.firstName.trim()) {
        errors.firstName = 'First Name is required';
      } else if (!validateName(formData.firstName)) {
        errors.firstName = 'First Name must be 3-15 characters';
      }

      if (!formData.lastName.trim()) {
        errors.lastName = 'Last Name is required';
      }

      if (!formData.userName.trim()) {
        errors.userName = 'User Name is required';
      } else if (!validateName(formData.userName)) {
        errors.userName = 'User Name must be 3-15 characters';
      }

      if (!formData.userType) {
        errors.userType = 'User Type is required';
      }

      if (!formData.mobile.trim()) {
        errors.mobile = 'Mobile is required';
      } else if (!validateMobile(formData.mobile)) {
        errors.mobile = 'Mobile must be exactly 10 digits';
      }

      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Enter a valid email';
      }

      if (isAdd) {
        // Password required for new user
        if (!formData.password.trim()) {
          errors.password = 'Password is required';
        } else if (!Object.values(validatePasswordStrength(formData.password)).every(Boolean)) {
          errors.password = 'Password must meet all strength criteria';
        }

        if (!formData.confirmPassword.trim()) {
          errors.confirmPassword = 'Confirm Password is required';
        } else if (formData.confirmPassword !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        }
      } else {
        // Edit: password optional, but if provided must meet criteria
        if (formData.password.trim() || formData.confirmPassword.trim()) {
          if (!formData.password.trim()) {
            errors.password = 'Password is required if changing';
          } else if (!Object.values(validatePasswordStrength(formData.password)).every(Boolean)) {
            errors.password = 'Password must meet all strength criteria';
          }

          if (!formData.confirmPassword.trim()) {
            errors.confirmPassword = 'Confirm Password is required';
          } else if (formData.confirmPassword !== formData.password) {
            errors.confirmPassword = 'Passwords do not match';
          }
        }
      }

      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        showToast(Object.values(errors)[0]!, 'error');
        return false;
      }
      return true;
    },
    [formData, validateName, validateMobile, validateEmail, validatePasswordStrength]
  );

  // ---------- API Calls (with error handling for success:false) ----------
  const saveUserToAPI = useCallback(
    async (data: UserFormData, isAdd: boolean) => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setShowSessionExpired(true);
        throw new Error('User ID not found');
      }

      const token = localStorage.getItem('authToken');
      const userType = userTypes.find((ut) => ut.value === data.userType);
      if (!userType) throw new Error('Invalid user type');

      const apiPayload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        mailID: data.email,
        mobile: data.mobile,
        roleFK: userType.roleFK,
        lastActBy: parseInt(userId),
        userName: data.userName,
      };
      if (isAdd) apiPayload.password = data.password;
      else if (data.password) apiPayload.password = data.password;

      const response = await fetchWithTimeout(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/saveUserDetails',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Save failed');
      }
      return result;
    },
    []
  );

  const updateUserAPI = useCallback(
    async (data: UserFormData) => {
      const token = localStorage.getItem('authToken');
      const userType = userTypes.find((ut) => ut.value === data.userType);
      if (!userType) throw new Error('Invalid user type');

      const payload = {
        userPK: selectedUserId,
        userName: data.userName,
        firstName: data.firstName,
        lastName: data.lastName,
        roleFK: userType.roleFK,
      };

      const response = await fetchWithTimeout(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/userMasterModify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Update failed');
      }
      return result;
    },
    [selectedUserId]
  );

  const updateUserStatusAPI = useCallback(
    async (userPK: number, newStatus: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetchWithTimeout(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/userStatusUpdate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userPK, statusNew: newStatus }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Status update failed');
      }
      return result;
    },
    []
  );

  const updatePasswordAPI = useCallback(
    async (userPK: number, password: string) => {
      const token = localStorage.getItem('authToken');
      const lastActBy = localStorage.getItem('userId');
      if (!lastActBy) {
        setShowSessionExpired(true);
        throw new Error('User ID not found');
      }

      const response = await fetchWithTimeout(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/userPasswordUpdateByAdmin',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userPK, password, lastActBy: parseInt(lastActBy) }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Password update failed');
      }
      return result;
    },
    []
  );

  // ---------- Action Handlers ----------
  const resetConfirm = useCallback(() => {
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
    setConfirmTitle('');
    setConfirmMessage('');
  }, []);

  const getConfirmButtonLabel = useCallback((type: 'save' | 'update' | 'status' | 'refresh'): string => {
    switch (type) {
      case 'save': return 'Save';
      case 'update': return 'Update';
      case 'status': return 'Update';
      case 'refresh': return 'Refresh';
      default: return 'Confirm';
    }
  }, []);

  const confirmActionHandler = useCallback(
    (
      action: () => Promise<void>,
      message: string,
      title: string,
      type: 'save' | 'update' | 'status' | 'refresh'
    ) => {
      setConfirmMessage(message);
      setConfirmTitle(title);
      setConfirmAction(() => action);
      setConfirmType(type);
      setShowConfirm(true);
    },
    []
  );

  const handleAddSubmit = useCallback(async () => {
    if (!validateForm(true)) return;

    const action = async () => {
      setGlobalLoading(true);
      try {
        await saveUserToAPI(formData, true);
        await fetchUsers();
        setFormData(initialFormData);
        setView('list');
        showToast('User added successfully', 'success');
      } catch (error: any) {
        handleApiError(error);
      } finally {
        setGlobalLoading(false);
      }
    };

    confirmActionHandler(action, 'Are you sure you want to save this user?', 'Save', 'save');
  }, [validateForm, saveUserToAPI, formData, fetchUsers, confirmActionHandler, handleApiError]);

  const handleEditSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!validateForm(false)) return;

      const action = async () => {
        setGlobalLoading(true);
        try {
          await updateUserAPI(formData);
          await fetchUsers();
          setShowEditModal(false);
          setFormData(initialFormData);
          showToast('User updated successfully', 'success');
        } catch (error: any) {
          handleApiError(error);
        } finally {
          setGlobalLoading(false);
        }
      };

      confirmActionHandler(action, 'Are you sure you want to update this user?', 'Update', 'update');
    },
    [validateForm, updateUserAPI, formData, fetchUsers, confirmActionHandler, handleApiError]
  );

  const handleStatusToggle = useCallback(
    async (userPK: number) => {
      const user = users.find((u) => u.userPK === userPK);
      if (!user) return;

      const isCurrentlyActive = user.status === 'Active';
      const newDisplayStatus = isCurrentlyActive ? 'Inactive' : 'Active';
      const newApiStatus = getApiStatusCode(newDisplayStatus);

      const action = async () => {
        setGlobalLoading(true);
        try {
          await updateUserStatusAPI(userPK, newApiStatus);
          await fetchUsers();
          showToast(`User status updated to ${newDisplayStatus}`, 'success');
        } catch (error: any) {
          handleApiError(error);
        } finally {
          setGlobalLoading(false);
        }
      };

      confirmActionHandler(
        action,
        `Are you sure you want to change status of ${user.userName} to ${newDisplayStatus}?`,
        'Change Status',
        'status'
      );
    },
    [users, getApiStatusCode, updateUserStatusAPI, fetchUsers, confirmActionHandler, handleApiError]
  );

  const handleRefreshConfirm = useCallback(() => {
    const action = async () => {
      setFormData(initialFormData);
      showToast('Form refreshed', 'success');
    };

    confirmActionHandler(action, 'Are you sure you want to refresh the form?', 'Refresh', 'refresh');
  }, [confirmActionHandler]);

  const handleAdd = useCallback(() => {
    setFormData(initialFormData);
    setView('form');
  }, []);

  const handleEdit = useCallback(
    async (user: User) => {
      const details = await fetchUserDetails(user.userPK);
      if (!details) return;

      setFormData({
        firstName: details.firstName,
        lastName: details.lastName || '',
        userName: details.userName,
        userType: roleToType[details.roleFK] || '',
        email: details.mailID,
        password: '',
        confirmPassword: '',
        mobile: details.mobile,
      });
      setSelectedUserId(details.userPK);
      setShowEditModal(true);
    },
    [fetchUserDetails]
  );

  const handlePasswordUpdate = useCallback((user: User) => {
    setSelectedUserForPass(user);
    setNewPassword('');
    setConfirmPassword('');
    setPassErrors({ password: '', confirmPassword: '' });
    setShowPasswordModal(true);
  }, []);

  const handleCopyPassword = useCallback(
    async (user: User) => {
      setGlobalLoading(true);
      try {
        const details = await fetchUserDetails(user.userPK);
        if (!details) {
          showToast('Could not fetch user details', 'error');
          return;
        }
        const password = details.password;
        if (!password) {
          showToast('No password available for this user', 'error');
          return;
        }
        await navigator.clipboard.writeText(password);
        showToast('Password copied to clipboard', 'success');
      } catch (error: any) {
        handleApiError(error);
      } finally {
        setGlobalLoading(false);
      }
    },
    [fetchUserDetails, handleApiError]
  );

  const handlePassInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setNewPassword(value);
      setPassErrors((prev) => ({ ...prev, password: '' }));
    } else {
      setConfirmPassword(value);
      setPassErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  }, []);

  const handleUpdatePass = useCallback(async () => {
    let valid = true;
    const newErrors = { password: '', confirmPassword: '' };
    const strengthCriteria = validatePasswordStrength(newPassword);

    if (!newPassword.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (!Object.values(strengthCriteria).every(Boolean)) {
      newErrors.password = 'Password must meet all strength criteria';
      valid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm Password is required';
      valid = false;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setPassErrors(newErrors);

    if (valid && selectedUserForPass) {
      setGlobalLoading(true);
      try {
        const result = await updatePasswordAPI(selectedUserForPass.userPK, newPassword);
        showToast('Password updated successfully', 'success');
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        handleApiError(error);
      } finally {
        setGlobalLoading(false);
      }
    } else {
      const firstError = newErrors.password || newErrors.confirmPassword;
      if (firstError) showToast(firstError, 'error');
    }
  }, [newPassword, confirmPassword, selectedUserForPass, validatePasswordStrength, updatePasswordAPI, handleApiError]);

  // ---------- Sorting & Pagination ----------
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mailID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (roleToType[user.roleFK] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    if (sorting.length === 0) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const sort = sorting[0];
      const key = sort.id as keyof User;
      let aVal = a[key];
      let bVal = b[key];

      if (key === 'roleFK') {
        aVal = roleToType[a.roleFK] || '';
        bVal = roleToType[b.roleFK] || '';
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sort.desc ? 1 : -1;
      if (aVal > bVal) return sort.desc ? -1 : 1;
      return 0;
    });
  }, [filteredUsers, sorting]);

  const totalRows = sortedUsers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = sortedUsers.slice(startIndex, endIndex);

  const handlePreviousPage = useCallback(() => setCurrentPage((prev) => Math.max(1, prev - 1)), []);
  const handleNextPage = useCallback(() => setCurrentPage((prev) => Math.min(totalPages, prev + 1)), [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sorting]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // ---------- Table Configuration ----------
  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'sno',
        header: 'S.No',
        cell: ({ row }) => (
          <span className="text-sm">{row.index + 1 + (currentPage - 1) * rowsPerPage}</span>
        ),
        size: 60,
        enableSorting: false,
      }),
      columnHelper.accessor('userName', {
        header: 'User Name',
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 150,
        enableSorting: true,
      }),
      columnHelper.accessor('mailID', {
        header: 'Mail ID',
        cell: (info) => {
          const email = info.getValue() || '';
          const atIndex = email.indexOf('@');
          if (atIndex === -1) {
            return <span className="text-sm break-words">{email}</span>;
          }
          const localPart = email.substring(0, atIndex);
          const domainPart = email.substring(atIndex);
          return (
            <div className="text-sm leading-tight break-words">
              <div>{localPart}</div>
              <div className="text-gray-500 dark:text-gray-400 text-[10px]">{domainPart}</div>
            </div>
          );
        },
        size: 220,
        enableSorting: true,
      }),
      columnHelper.accessor('roleFK', {
        header: 'User Type',
        cell: (info) => <span className="text-sm">{roleToType[info.getValue()] || 'Unknown'}</span>,
        size: 150,
        enableSorting: true,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="leading-tight min-h-[24px] flex items-start text-[11px]">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={info.getValue() === 'Active'}
                  onChange={() => handleStatusToggle(user.userPK)}
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
                />
              </label>
            </div>
          );
        },
        size: 120,
        enableSorting: true,
      }),
      columnHelper.display({
        id: 'modify',
        header: 'Modify',
        cell: ({ row }) => (
          <button
            onClick={() => handleEdit(row.original)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
            title="Edit User"
          >
            <SquarePen size={16} />
          </button>
        ),
        size: 80,
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'updatePassword',
        header: 'Update Password',
        cell: ({ row }) => (
          <button
            onClick={() => handlePasswordUpdate(row.original)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
            title="Update Password"
          >
            <HiLockClosed size={16} />
          </button>
        ),
        size: 120,
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'copyPassword',
        header: 'Copy Password',
        cell: ({ row }) => (
          <button
            onClick={() => handleCopyPassword(row.original)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
            title="Copy Password"
          >
            <HiDocumentDuplicate size={16} />
          </button>
        ),
        size: 100,
        enableSorting: false,
      }),
      columnHelper.accessor(
        (row) => `${row.userName} ${row.mailID} ${roleToType[row.roleFK] || ''} ${row.status}`,
        {
          id: 'global_search',
          header: '',
          cell: () => null,
          size: 0,
          enableSorting: false,
        }
      ),
    ];
  }, [currentPage, handleStatusToggle, handleEdit, handlePasswordUpdate, handleCopyPassword]);

  const table = useReactTable({
    data: currentRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: searchTerm,
      columnVisibility: { global_search: false },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
  });

  const getSortEmoji = (columnId: string) => {
    const sort = sorting.find((s) => s.id === columnId);
    if (!sort) return ' ↕️';
    return sort.desc ? ' 🔽' : ' 🔼';
  };

  // ---------- Render ----------
  return (
    <>
      <Toastify />

      {/* Global Loading Overlay */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {view === 'form' ? (
        // ========== CREATION FORM ==========
        <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 py-1 px-1">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 flex flex-col sm:flex-row items-start sm:items-center shadow-md justify-between p-2 rounded-lg mb-4 gap-4">
            <h1 className="text-xl text-blue-600 dark:text-white flex items-center gap-2">
              <UserRoundPen className="h-5 w-5" /> User Master
              <InfoTooltip content="Create and manage users with roles, contacts, and secure passwords." />
            </h1>
            <div className="flex space-x-2 w-full sm:w-auto">
              <Tooltip content="Save" placement="bottom">
                <button
                  onClick={handleAddSubmit}
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-green-400 hover:bg-green-500 text-white transition-all"
                >
                  <FaSave className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip content="Refresh" placement="bottom">
                <button
                  onClick={handleRefreshConfirm}
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-yellow-300 hover:bg-yellow-500 text-white transition-all"
                >
                  <HiRefresh className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip content="List" placement="bottom">
                <button
                  onClick={() => setView('list')}
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-all"
                >
                  <HiViewList className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 w-full mb-4">
            <div className="flex mb-4 overflow-x-auto pb-1">
              <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600 dark:text-blue-400">
                <UserRoundPen className="w-4 h-4" />
                <span>User Details</span>
                {isFormValid && <FaCheckCircle className="w-4 h-4 text-green-500 ml-1" />}
                <InfoTooltip content="Enter user details including name, role, contact, and secure password." />
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    First Name <span className="text-red-600">*</span>
                    <InfoTooltip content={fieldInfo.firstName} />
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="First name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    Last Name <span className="text-red-600">*</span>
                    <InfoTooltip content={fieldInfo.lastName} />
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="Last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    User Name <span className="text-red-600">*</span>
                    <InfoTooltip content={fieldInfo.userName} />
                  </label>
                  <input
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="User name"
                  />
                  {formErrors.userName && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.userName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    User Type <span className="text-red-600">*</span>
                    <InfoTooltip content={fieldInfo.userType} />
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  >
                    <option value="">Select User Type</option>
                    {userTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.userType && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.userType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    Email <span className="text-red-600">*</span>
                    <InfoTooltip content={fieldInfo.email} />
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="Email address"
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                </div>

                <MobileInput
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  label="Mobile"
                  placeholder="Enter 10 digit mobile number"
                  required
                  error={formErrors.mobile}
                  info={fieldInfo.mobile}
                />

                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  label="Password"
                  placeholder="Password"
                  required
                  error={formErrors.password}
                  showStrength
                  strength={passwordStrength}
                  info={fieldInfo.password}
                />

                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  label="Confirm Password"
                  placeholder="Confirm password"
                  required
                  error={formErrors.confirmPassword}
                  info={fieldInfo.confirmPassword}
                />
              </div>
            </form>
          </div>
        </div>
      ) : (
        // ========== LIST VIEW (FIXED LAYOUT) ==========
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 py-1 px-1">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-3 rounded-lg flex-shrink-0">
            <h1 className="text-xl flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <UserRoundPen className="h-6 w-6" /> User Master List
              <InfoTooltip content="List of all users. You can search, sort, edit, update password, or change status." />
            </h1>
            <div className="flex gap-2">
              <Tooltip content="Add" placement="bottom">
                <button
                  onClick={handleAdd}
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <HiPlus size={18} />
                </button>
              </Tooltip>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white max-h-[390px] dark:bg-gray-800 rounded-md shadow-sm p-2 flex-1 flex flex-col min-h-0">
              {/* Search */}
              <div className="mb-3 flex justify-end flex-shrink-0">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder={`Search ${totalRows} records...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  />
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-800 flex-1 flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                  <div className="min-w-[1000px] lg:min-w-full">
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                      <thead className="sticky top-0 z-10 h-8">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id} className="bg-blue-600 dark:bg-blue-700">
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-1.5 py-1 text-left font-medium text-white uppercase text-[10px] leading-tight select-none"
                                style={{ width: header.column.columnDef.size }}
                              >
                                <div
                                  className={`flex items-center gap-1 cursor-pointer ${header.column.getCanSort() ? '' : 'cursor-default'}`}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  <span>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                  </span>
                                  {header.column.getCanSort() && (
                                    <span className="ml-1 text-white text-xs">
                                      {getSortEmoji(header.column.id)}
                                    </span>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {table.getRowModel().rows.length > 0 ? (
                          table.getRowModel().rows.map((row) => (
                            <tr
                              key={row.original.userPK}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td
                                  key={cell.id}
                                  className="px-1.5 py-1 align-top"
                                  style={{ width: cell.column.columnDef.size }}
                                >
                                  <div className="leading-tight min-h-[24px] flex items-start text-[11px] text-gray-900 dark:text-white break-words">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </div>
                                </td>
                              ))}
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

              {/* Pagination */}
              {totalRows > 0 && (
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                  <div>
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, totalRows)}</span> of{' '}
                    <span className="font-medium">{totalRows}</span> records
                    {searchTerm && (
                      <span>
                        {' '}
                        for search: <span className="font-medium">"{searchTerm}"</span>
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
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold text-blue-600 dark:text-white flex items-center gap-2">
                <UserRoundPen className="h-4 w-4" /> Edit User
                <InfoTooltip content="Modify user details. Password changes are optional." />
              </h2>
              <div className="flex items-center gap-3">
                <Tooltip content="Update" placement="bottom">
                  <button
                    type="button"
                    onClick={() => editFormRef.current?.requestSubmit()}
                    className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
                  >
                    <FaSave className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Close" placement="bottom">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HiX size={20} />
                  </button>
                </Tooltip>
              </div>
            </div>
            <form ref={editFormRef} onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    First Name <span className="text-red-600">*</span>
                    <InfoTooltip content={fieldInfo.firstName} />
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="First name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    Last Name <span className="text-red-600">*</span>
                    <InfoTooltip content={fieldInfo.lastName} />
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    placeholder="Last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  User Name <span className="text-red-600">*</span>
                  <InfoTooltip content={fieldInfo.userName} />
                </label>
                <input
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  placeholder="User name"
                />
                {formErrors.userName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.userName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  User Type <span className="text-red-600">*</span>
                  <InfoTooltip content={fieldInfo.userType} />
                </label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  <option value="">Select User Type</option>
                  {userTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formErrors.userType && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.userType}</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-indigo-700 dark:text-white flex items-center gap-2">
                <HiKey className="text-indigo-600" />
                Password Update
              </h2>
              <Tooltip content="Close" placement="bottom">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <HiX size={22} />
                </button>
              </Tooltip>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <HiUser className="text-gray-500" />
                  User Name
                  <InfoTooltip content="The username of the selected user." />
                </label>
                <input
                  value={selectedUserForPass?.userName || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <HiMail className="text-gray-500" />
                  Email
                  <InfoTooltip content="The email ID of the selected user." />
                </label>
                <input
                  value={selectedUserForPass?.mailID || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput
                  name="password"
                  value={newPassword}
                  onChange={handlePassInputChange}
                  label="New Password"
                  placeholder="New password"
                  required
                  error={passErrors.password}
                  showStrength
                  strength={validatePasswordStrength(newPassword)}
                  info={fieldInfo.password}
                />
                <PasswordInput
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handlePassInputChange}
                  label="Confirm Password"
                  placeholder="Confirm password"
                  required
                  error={passErrors.confirmPassword}
                  info={fieldInfo.confirmPassword}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>

                <Tooltip content="Update" placement="bottom">
                  <button
                    type="button"
                    onClick={handleUpdatePass}
                    className="w-10 h-10 p-0 rounded-full flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    <FaSave className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
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
                onClick={resetConfirm}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction) {
                    try {
                      await confirmAction();
                    } catch (error) {
                      console.error('Action failed:', error);
                    } finally {
                      resetConfirm();
                    }
                  } else {
                    resetConfirm();
                  }
                }}
                className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  confirmType === 'status'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900 focus:ring-red-500 dark:focus:ring-offset-gray-900'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
                }`}
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

export default UserMaster;