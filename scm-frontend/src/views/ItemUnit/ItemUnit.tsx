import { useState } from 'react';
import { Button, Tooltip } from 'flowbite-react';
import { HiRefresh, HiViewList } from 'react-icons/hi';
import { FaSave } from 'react-icons/fa';
import { CircleCheckBig, Package, Tag } from 'lucide-react';
import Toastify, { showToast } from 'src/views/Toastify';
import ItemUnitList from './ItemUnitList';
import SessionModal from 'src/views/SessionModal';

interface FloatingInputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  label: React.ReactNode;
  required?: boolean;
  error?: string; // Still used for border styling
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  label,
  required = false,
  error,
}) => {
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
        className={`peer w-full px-4 py-2 border rounded-sm bg-transparent text-gray-900 dark:text-white focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-gray-600 dark:text-gray-300 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-1 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {/* Error message paragraph removed as requested – now only toast is used */}
    </div>
  );
};

// ── Confirm Modal ────────────────────────────────────────────────
interface ConfirmModalProps {
  isOpen: boolean;
  confirmType: 'add' | 'edit' | 'status';
  onConfirm: () => void;
  onCancel: () => void;
  targetName?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  confirmType,
  onConfirm,
  onCancel,
  targetName,
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (confirmType) {
      case 'add':
        return 'Confirm Save';
      case 'edit':
        return 'Confirm Modify';
      case 'status':
        return 'Confirm Change Status';
      default:
        return 'Confirm Action';
    }
  };

  const getMessage = () => {
    switch (confirmType) {
      case 'add':
        return 'Are you sure you want to save this item unit?';
      case 'edit':
        return 'Are you sure you want to modify this item unit?';
      case 'status':
        return `Are you sure you want to change the status of "${targetName || 'this item unit'}"?`;
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
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 shadow-lg ${
              isStatus
                ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 ring-red-200/50 dark:ring-red-900/30'
                : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 ring-green-200/50 dark:ring-green-900/30'
            }`}
          >
            <CircleCheckBig
              className={`w-8 h-8 animate-pulse ${
                isStatus ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}
            />
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

// ── Main Component ───────────────────────────────────────────────────
const ItemUnit = () => {
  const [itemUnitCode, setItemUnitCode] = useState('');
  const [itemUnitName, setItemUnitName] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Confirm modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

  const resetAllFields = () => {
    setItemUnitCode('');
    setItemUnitName('');
    setErrors({});
  };

  const handleListClick = () => {
    resetAllFields();
    setShowTable(true);
    setShowForm(false);
  };

  const handleAddClick = () => {
    resetAllFields();
    setShowForm(true);
    setShowTable(false);
  };

  // ── Validation ─────────────────────────────────────────────────────
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'itemUnitCode':
        return value.trim() ? null : 'Item Unit Code is required.';
      case 'itemUnitName':
        return value.trim() ? null : 'Item Unit Name is required.';
      default:
        return null;
    }
  };

  const validateFormSequential = (): boolean => {
    const fields = [
      { name: 'itemUnitCode', value: itemUnitCode },
      { name: 'itemUnitName', value: itemUnitName },
    ];

    for (const field of fields) {
      const error = validateField(field.name, field.value);
      if (error) {
        showToast(error, 'error');
        setErrors((prev) => ({ ...prev, [field.name]: error }));
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateFormSequential()) return;
    setConfirmType('add');
    setConfirmAction(() => performSave);
    setShowConfirm(true);
  };

  const handleRefresh = () => {
    resetAllFields();
    showToast('Fields refreshed successfully.', 'success');
  };

  const performSave = async () => {
    if (!itemUnitCode.trim() || !itemUnitName.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    const token = localStorage.getItem('authToken');
    const entityId = localStorage.getItem('entity');
    const userId = localStorage.getItem('userId');

    if (!token) {
      setShowSessionExpired(true);
      return;
    }

    setIsGlobalLoading(true);

    const apiUrl =
      'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/itemSubMasterController/saveItemUnit';

    const requestBody = {
      itemUnitName: itemUnitName.trim(),
      itemUnitCode: itemUnitCode.trim(),
      createdBy: userId,
      lastActBy: userId,
      entityId: entityId,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('save item unit :', data);

      if (!response.ok) {
        if (response.status === 401) {
          setShowSessionExpired(true);
          return;
        }
        showToast(data.message || `HTTP error! status: ${response.status}`, 'error');
        return;
      }

      if (data.success === false) {
        if (data.message?.toLowerCase().includes('duplicate')) {
          showToast('Unit code already exists', 'error');
        } else {
          showToast(data.message || 'Error saving item unit.', 'error');
        }
        return;
      }

      showToast('Item unit saved successfully.', 'success');
      resetAllFields();
    } catch (error) {
      console.error('Error saving item unit:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to save item unit.',
        'error',
      );
    } finally {
      setIsGlobalLoading(false);
    }
  };

  return (
    <>
      {/* ── Toast container must stay mounted ── */}
      <Toastify />

      {showTable && !showForm ? (
        <ItemUnitList onAddNew={handleAddClick} />
      ) : (
        <>
          {/* Header & Action Buttons */}
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              Item Unit
            </h1>
            <div className="flex gap-2 items-center">
              <Tooltip content="Save">
                <Button
                  color="success"
                  size="xs"
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                  onClick={handleSave}
                >
                  <FaSave className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Refresh">
                <Button
                  color="warning"
                  size="xs"
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                  onClick={handleRefresh}
                >
                  <HiRefresh className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="List">
                <Button
                  color="primary"
                  size="xs"
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                  onClick={handleListClick}
                >
                  <HiViewList className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            <fieldset className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow">
              <legend className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full border border-blue-200 dark:border-blue-800 -ml-1 mb-4">
                <Tag className="w-5 h-5" />
                Item Unit Details
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  id="itemUnitCode"
                  name="itemUnitCode"
                  value={itemUnitCode}
                  onChange={(e) => {
                    setItemUnitCode(e.target.value);
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.itemUnitCode;
                      return newErrors;
                    });
                  }}
                  onBlur={() => {
                    const error = validateField('itemUnitCode', itemUnitCode);
                    setErrors((prev) =>
                      error ? { ...prev, itemUnitCode: error } : { ...prev, itemUnitCode: undefined },
                    );
                  }}
                  label="Item Unit Code"
                  required
                  error={errors.itemUnitCode}
                />

                <FloatingInput
                  id="itemUnitName"
                  name="itemUnitName"
                  value={itemUnitName}
                  onChange={(e) => {
                    setItemUnitName(e.target.value);
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.itemUnitName;
                      return newErrors;
                    });
                  }}
                  onBlur={() => {
                    const error = validateField('itemUnitName', itemUnitName);
                    setErrors((prev) =>
                      error ? { ...prev, itemUnitName: error } : { ...prev, itemUnitName: undefined },
                    );
                  }}
                  label="Item Unit Name"
                  required
                  error={errors.itemUnitName}
                />
              </div>
            </fieldset>
          </div>
        </>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        confirmType={confirmType || 'add'}
        onConfirm={async () => {
          if (confirmAction) await confirmAction();
          setShowConfirm(false);
          setConfirmAction(null);
          setConfirmType(null);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setConfirmAction(null);
          setConfirmType(null);
        }}
      />

      {/* Session Expired */}
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
    </>
  );
};

export default ItemUnit;