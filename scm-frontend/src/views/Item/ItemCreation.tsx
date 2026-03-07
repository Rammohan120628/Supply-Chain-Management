import { Label, Button, Tooltip } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import ItemCreationTable from './Table.tsx';
import { HiPlus, HiPencil, HiRefresh, HiViewList, HiSearch } from 'react-icons/hi';
import { FaSave, FaInfoCircle } from 'react-icons/fa';
import { CircleCheckBig, Tag, FileText, ShoppingCart, Package } from 'lucide-react';
import SessionModal from '../SessionModal.tsx';
import Toastify, { showToast } from '../Toastify.tsx';
import { useAuth } from '../../context/AuthContext/AuthContext.tsx';
import { FaBox } from "react-icons/fa";

// -------------------- InfoTooltip Component --------------------
const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip content={content} placement="top" className="ml-1">
    <FaInfoCircle className="w-3.5 h-3.5 mx-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-help inline" />
  </Tooltip>
);

// -------------------- Field Info Descriptions --------------------
const fieldInfo: Record<string, string> = {
  // Classification
  category: 'Select the item category (e.g., Raw Material, Finished Good).',
  itemState: 'Select the current state of the item (e.g., Active, Obsolete).',
  itemOrigin: 'Select the origin of the item (e.g., Domestic, Imported).',
  itemQuality: 'Select the quality grade of the item.',
  itemNumber: 'Enter a 3-digit number that will be part of the generated item code.',

  // Particulars
  itemCode: 'Auto‑generated unique code based on classification and item number.',
  itemName: 'Enter the full name of the item.',
  itemAltName: 'Enter an alternative name or alias for the item.',
  issueUnit: 'Automatically set from the purchase secondary unit.',

  // Purchase Definition
  purchaseBaseQty: 'Fixed quantity (1.000) – base unit conversion factor.',
  purchaseBaseUnit: 'Select the base unit for purchasing (e.g., KG, L).',
  purchaseSecondaryQty: 'Enter the multiplier to convert base unit to secondary unit.',
  purchaseSecondaryUnit: 'Select the secondary unit for purchasing (e.g., BAG, BOX).',

  // Package Definition
  packageBaseQty: 'Copied from purchase secondary quantity – base unit conversion factor.',
  packageBaseUnit: 'Select the base unit for packaging (defaults to purchase secondary unit).',
  packageSecondaryQty: 'Enter the multiplier for package secondary unit.',
  packageSecondaryUnit: 'Select the secondary unit for packaging.',

  // Modify mode fields
  categoryName: 'Category name (read‑only, from selected item).',
  stateName: 'State name (read‑only, from selected item).',
  originName: 'Origin name (read‑only, from selected item).',
  qualityName: 'Quality name (read‑only, from selected item).',
  packageId: 'Package ID (read‑only, auto‑generated).',
  purchaseId: 'Purchase ID (read‑only, auto‑generated).',
};

// -------------------- Custom Dropdown Component (unchanged) --------------------
type DropdownItem = { pk: number; name: string; code?: string };
type SearchFilterKey =
  | 'category'
  | 'itemState'
  | 'itemOrigin'
  | 'itemQuality'
  | 'purchaseBaseUnit'
  | 'purchaseSecondaryUnit'
  | 'packageBaseUnit'
  | 'packageSecondaryUnit';

interface CustomDropdownWithSearchProps {
  data: DropdownItem[];
  type: SearchFilterKey;
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
  loadingKey?: 'categories' | 'itemStates' | 'itemOrigins' | 'itemQualities' | 'itemUnits';
  showPk?: boolean;
  opensUp?: boolean;
  isOpen: boolean;
  readOnly?: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  error?: string | null;
  dropdownWidth?: string;
}

const CustomDropdownWithSearch = ({
  data,
  type,
  value,
  onChange,
  className = '',
  loadingKey,
  showPk = false,
  opensUp = false,
  isOpen,
  onToggle,
  isLoading = false,
  error = null,
  dropdownWidth = 'w-64',
}: CustomDropdownWithSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const getSelectedName = () => {
    if (value == null) return 'Please select';
    const selectedItem = data.find((item) => item.pk === value);
    return selectedItem ? (showPk ? `${selectedItem.pk} - ${selectedItem.name}` : selectedItem.name) : 'Please select';
  };

  const getPleaseSelectText = () => {
    switch (type) {
      case 'category': return 'Please select Category';
      case 'itemState': return 'Please select Item State';
      case 'itemOrigin': return 'Please select Item Origin';
      case 'itemQuality': return 'Please select Item Quality';
      case 'purchaseBaseUnit': return 'Please select Purchase Base Unit';
      case 'purchaseSecondaryUnit': return 'Please select Purchase Secondary Unit';
      case 'packageBaseUnit': return 'Please select Package Base Unit';
      case 'packageSecondaryUnit': return 'Please select Package Secondary Unit';
      default: return 'Please select';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`flex justify-between items-center w-full h-11 px-4 text-sm border border-gray-300 dark:border-gray-600 
                   rounded-md bg-white dark:bg-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
        onClick={onToggle}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={value != null ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
          {getSelectedName()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div
          className={`absolute ${opensUp ? 'bottom-full mb-1' : 'top-full mt-1'} z-50 ${dropdownWidth} max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl max-h-60 overflow-hidden`}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 
                         rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            )}
            {error && !isLoading && (
              <div className="px-3 py-3 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                Error loading data
              </div>
            )}
            {!isLoading && !error && (!data || data.length === 0) && (
              <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                No data available
              </div>
            )}
            {!isLoading && !error && data && data.length > 0 && (
              <>
                {filteredData.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    No results found
                  </div>
                ) : (
                  <>
                    <div
                      key="-1"
                      className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${value == null
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500 dark:border-indigo-400'
                          : 'text-gray-900 dark:text-gray-100'
                        }`}
                      onClick={() => {
                        onChange(null);
                        onToggle();
                      }}
                      role="option"
                      aria-selected={value == null}
                    >
                      {getPleaseSelectText()}
                    </div>
                    {filteredData.map((item) => {
                      const displayText = showPk ? `${item.pk} - ${item.name}` : item.name;
                      return (
                        <div
                          key={item.pk}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${value === item.pk
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500 dark:border-indigo-400'
                              : 'text-gray-900 dark:text-gray-100'
                            }`}
                          onClick={() => {
                            onChange(item.pk);
                            onToggle();
                          }}
                          role="option"
                          aria-selected={value === item.pk}
                        >
                          {displayText}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
// ------------------------------------------------------------------------------------

const ItemCreation = () => {
  const navigate = useNavigate();

  const [addFormData, setAddFormData] = useState({
    itemCode: '0000000',
    itemName: '',
    itemAltName: '',
    issueUnit: 'UOM',
  });
  const [modifyFormData, setModifyFormData] = useState({
    itemCode: '',
    itemName: '',
    itemAltName: '',
    packageId: '',
    purchaseId: '',
    categoryName: '',
    stateName: '',
    qualityName: '',
    originName: '',
    issueUnit: 'UOM',
  });
  const [itemNumber, setItemNumber] = useState('');
  const [purchaseManualSecondaryQty, setPurchaseManualSecondaryQty] = useState('1');
  const [purchaseAutoBaseQty, setPurchaseAutoBaseQty] = useState('1.000');
  const [packageManualSecondaryQty, setPackageManualSecondaryQty] = useState('1');
  const [packageAutoBaseQty, setPackageAutoBaseQty] = useState('1.000');

  const [showTable, setShowTable] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [modifyShow, setModifyShow] = useState(false);

  type DropdownItem = { pk: number; name: string; code?: string };

  const [categories, setCategories] = useState<DropdownItem[]>([]);
  const [itemStates, setItemStates] = useState<DropdownItem[]>([]);
  const [itemOrigins, setItemOrigins] = useState<DropdownItem[]>([]);
  const [itemQualities, setItemQualities] = useState<DropdownItem[]>([]);
  const [itemUnits, setItemUnits] = useState<DropdownItem[]>([]);

  const [loading, setLoading] = useState({
    categories: false,
    itemStates: false,
    itemOrigins: false,
    itemQualities: false,
    itemUnits: false,
  });

  const [errors, setErrors] = useState<
    Record<'categories' | 'itemStates' | 'itemOrigins' | 'itemQualities' | 'itemUnits', string | null>
  >({
    categories: null,
    itemStates: null,
    itemOrigins: null,
    itemQualities: null,
    itemUnits: null,
  });

  type SearchFilterKey =
    | 'category'
    | 'itemState'
    | 'itemOrigin'
    | 'itemQuality'
    | 'purchaseBaseUnit'
    | 'purchaseSecondaryUnit'
    | 'packageBaseUnit'
    | 'packageSecondaryUnit';

  const [dropdownOpen, setDropdownOpen] = useState<Record<SearchFilterKey, boolean>>({
    category: false,
    itemState: false,
    itemOrigin: false,
    itemQuality: false,
    purchaseBaseUnit: false,
    purchaseSecondaryUnit: false,
    packageBaseUnit: false,
    packageSecondaryUnit: false,
  });

  const [selectedValues, setSelectedValues] = useState({
    category: null as number | null,
    itemState: null as number | null,
    itemOrigin: null as number | null,
    itemQuality: null as number | null,
    purchase: {
      baseUnit: null as number | null,
      secondaryUnit: null as number | null,
    },
    package: {
      baseUnit: null as number | null,
      secondaryUnit: null as number | null,
    },
  });

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const { ipAddress } = useAuth();

  const API_URLS = {
    categories: `${ipAddress}/masters-service-scm/scmMasterController/loadItemCategoryDropdown`,
    itemStates: `${ipAddress}/masters-service-scm/scmMasterController/loadItemStateDropdown`,
    itemOrigins: `${ipAddress}/masters-service-scm/scmMasterController/loadItemOriginDropdown`,
    itemQualities: `${ipAddress}/masters-service-scm/scmMasterController/loadItemQualityDropdown`,
    itemUnits: `${ipAddress}/masters-service-scm/scmMasterController/loadItemUnitDropdown`,
    saveItemMaster: `${ipAddress}/masters-service-scm/scmMasterController/saveItemMaster`,
  };

  const handleListClick = () => navigate('/itemCreationList');
  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
    setModifyShow(false);
  };
  const handleModifyClick = () => {
    setModifyShow(true);
    setShowTable(false);
    setShowForm(false);
  };

  const toggleDropdown = (type: SearchFilterKey) => {
    setDropdownOpen(prev => {
      const newState = {} as Record<SearchFilterKey, boolean>;
      Object.keys(prev).forEach(key => {
        newState[key as SearchFilterKey] = false;
      });
      newState[type] = !prev[type];
      return newState;
    });
  };

  // Validation (unchanged)
  const validateForm = (): boolean => {
    if (showForm) {
      if (selectedValues.category == null) { showToast('Item Category is required', 'error'); return false; }
      if (selectedValues.itemState == null) { showToast('Item State is required', 'error'); return false; }
      if (selectedValues.itemOrigin == null) { showToast('Item Origin is required', 'error'); return false; }
      if (selectedValues.itemQuality == null) { showToast('Item Quality is required', 'error'); return false; }
      if (!itemNumber.trim()) { showToast('Item Number is required', 'error'); return false; }
      if (!addFormData.itemName.trim()) { showToast('Item Name is required', 'error'); return false; }
      if (!addFormData.itemAltName.trim()) { showToast('Item Alt Name is required', 'error'); return false; }
      if (selectedValues.purchase.baseUnit == null) { showToast('Purchase Base Unit is required', 'error'); return false; }
      if (!purchaseManualSecondaryQty.trim()) { showToast('Purchase Secondary Quantity is required', 'error'); return false; }
      const purchaseQty = parseFloat(purchaseManualSecondaryQty);
      if (isNaN(purchaseQty) || purchaseQty <= 0) { showToast('Purchase Secondary Quantity must be a positive number', 'error'); return false; }
      if (selectedValues.purchase.secondaryUnit == null) { showToast('Purchase Secondary Unit is required', 'error'); return false; }
      if (selectedValues.package.baseUnit == null) { showToast('Package Base Unit is required', 'error'); return false; }
      if (!packageManualSecondaryQty.trim()) { showToast('Package Secondary Quantity is required', 'error'); return false; }
      const packageQty = parseFloat(packageManualSecondaryQty);
      if (isNaN(packageQty) || packageQty <= 0) { showToast('Package Secondary Quantity must be a positive number', 'error'); return false; }
      if (selectedValues.package.secondaryUnit == null) { showToast('Package Secondary Unit is required', 'error'); return false; }
    } else if (modifyShow) {
      if (!modifyFormData.itemCode.trim()) { showToast('Item Code is required', 'error'); return false; }
      if (!modifyFormData.itemName.trim()) { showToast('Item Name is required', 'error'); return false; }
      if (!modifyFormData.itemAltName.trim()) { showToast('Item Alt Name is required', 'error'); return false; }
      if (!modifyFormData.packageId.trim()) { showToast('Package ID is required', 'error'); return false; }
      if (!modifyFormData.purchaseId.trim()) { showToast('Purchase ID is required', 'error'); return false; }
      if (!modifyFormData.categoryName.trim()) { showToast('Category Name is required', 'error'); return false; }
      if (!modifyFormData.stateName.trim()) { showToast('State Name is required', 'error'); return false; }
      if (!modifyFormData.qualityName.trim()) { showToast('Quality Name is required', 'error'); return false; }
      if (!modifyFormData.originName.trim()) { showToast('Origin Name is required', 'error'); return false; }
      if (selectedValues.purchase.baseUnit == null) { showToast('Purchase Base Unit is required', 'error'); return false; }
      if (!purchaseManualSecondaryQty.trim()) { showToast('Purchase Secondary Quantity is required', 'error'); return false; }
      const purchaseQty = parseFloat(purchaseManualSecondaryQty);
      if (isNaN(purchaseQty) || purchaseQty <= 0) { showToast('Purchase Secondary Quantity must be a positive number', 'error'); return false; }
      if (selectedValues.purchase.secondaryUnit == null) { showToast('Purchase Secondary Unit is required', 'error'); return false; }
      if (selectedValues.package.baseUnit == null) { showToast('Package Base Unit is required', 'error'); return false; }
      if (!packageManualSecondaryQty.trim()) { showToast('Package Secondary Quantity is required', 'error'); return false; }
      const packageQty = parseFloat(packageManualSecondaryQty);
      if (isNaN(packageQty) || packageQty <= 0) { showToast('Package Secondary Quantity must be a positive number', 'error'); return false; }
      if (selectedValues.package.secondaryUnit == null) { showToast('Package Secondary Unit is required', 'error'); return false; }
    }
    return true;
  };

  // API call handler with session check and global loading
  const apiCall = async (
    url: string,
    type: 'categories' | 'itemStates' | 'itemOrigins' | 'itemQualities' | 'itemUnits',
  ) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionModal(true);
      return null;
    }

    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      setIsGlobalLoading(true);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setShowSessionModal(true);
        localStorage.removeItem('authToken');
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error(`Error in fetching ${type}: `, error);
      setErrors((prev) => ({ ...prev, [type]: (error as Error).message }));
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
      setIsGlobalLoading(false);
    }
  };

  interface SaveItemMasterData {
    itemCode: string;
    itemName: string;
    itemNickName: string;
    itemCenterNumber: string;
    itemStateFk: number;
    itemQualityFk: number;
    itemOriginFk: number;
    itemCategoryFk: number;
    purchaseBaseUnit: string;
    purchaseSecondaryUnit: string;
    purchaseBaseFactor: number;
    purchaseSecondaryFactor: number;
    packageSecondaryUnit: string;
    packageSecondaryFactor: number;
    createdBy: string;
    lastActBy: string;
  }

  interface SaveItemMasterResponse {
    success: boolean;
    message: string;
  }

  const saveItemMaster = async (data: SaveItemMasterData): Promise<void> => {
    console.log('Saving Item Master with data: ', data);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionModal(true);
      return;
    }

    try {
      setIsGlobalLoading(true);
      const response = await fetch(API_URLS.saveItemMaster, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        setShowSessionModal(true);
        localStorage.removeItem('authToken');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SaveItemMasterResponse = await response.json();

      if (result.success) {
        showToast(result.message || 'Saved Successfully', 'success');
        refreshAllData();
      } else {
        showToast(result.message || 'Save failed', 'error');
      }
    } catch (error) {
      console.error('Error saving item master: ', error);
      showToast('Error saving item master', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const fetchCategories = async () => {
    const data = await apiCall(API_URLS.categories, 'categories');
    if (data) setCategories(data);
  };

  const fetchItemStates = async () => {
    const data = await apiCall(API_URLS.itemStates, 'itemStates');
    if (data) setItemStates(data);
  };

  const fetchItemOrigins = async () => {
    const data = await apiCall(API_URLS.itemOrigins, 'itemOrigins');
    if (data) setItemOrigins(data);
  };

  const fetchItemQualities = async () => {
    const data = await apiCall(API_URLS.itemQualities, 'itemQualities');
    if (data) setItemQualities(data);
  };

  const fetchItemUnits = async () => {
    const data = await apiCall(API_URLS.itemUnits, 'itemUnits');
    if (data) setItemUnits(data);
  };

  useEffect(() => {
    fetchCategories();
    fetchItemStates();
    fetchItemOrigins();
    fetchItemQualities();
    fetchItemUnits();
  }, []);

  useEffect(() => {
    const num = parseFloat(purchaseManualSecondaryQty) || 1;
    setPackageAutoBaseQty(num.toFixed(3));
  }, [purchaseManualSecondaryQty]);

  useEffect(() => {
    setSelectedValues((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        baseUnit: selectedValues.purchase.secondaryUnit,
      },
    }));
  }, [selectedValues.purchase.secondaryUnit]);

  useEffect(() => {
    if (showForm) {
      let generatedCode = '';
      generatedCode += selectedValues.category != null ? String(selectedValues.category) : '0';
      generatedCode += selectedValues.itemState != null ? String(selectedValues.itemState) : '0';
      generatedCode += itemNumber ? itemNumber.toString().padStart(3, '0') : '000';
      generatedCode += selectedValues.itemOrigin != null ? String(selectedValues.itemOrigin) : '0';
      generatedCode += selectedValues.itemQuality != null ? String(selectedValues.itemQuality) : '0';
      setAddFormData((prev) => ({ ...prev, itemCode: generatedCode }));
    }
  }, [
    selectedValues.category,
    selectedValues.itemState,
    itemNumber,
    selectedValues.itemOrigin,
    selectedValues.itemQuality,
    showForm,
  ]);

  useEffect(() => {
    if (showForm && selectedValues.purchase.secondaryUnit != null) {
      const unit = itemUnits.find((u) => u.pk === selectedValues.purchase.secondaryUnit);
      if (unit) setAddFormData((prev) => ({ ...prev, issueUnit: unit.name || 'UOM' }));
    }
  }, [selectedValues.purchase.secondaryUnit, itemUnits, showForm]);

  useEffect(() => {
    if (modifyShow && selectedValues.purchase.secondaryUnit != null) {
      const unit = itemUnits.find((u) => u.pk === selectedValues.purchase.secondaryUnit);
      if (unit) setModifyFormData((prev) => ({ ...prev, issueUnit: unit.name || 'UOM' }));
    }
  }, [selectedValues.purchase.secondaryUnit, itemUnits, modifyShow]);

  const handleItemNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,3}$/.test(value)) setItemNumber(value);
  };

  const handleSaveClick = () => {
    if (!validateForm()) return;
    setConfirmType(showForm ? 'add' : 'edit');
    setConfirmAction(() => handleSaveConfirm);
    setShowConfirm(true);
  };

  const handleRefreshClick = () => {
    refreshAllData();
  };

  const handleSaveConfirm = () => {
    const userId = localStorage.getItem('userId');

    let categoryFk = Number(selectedValues.category) || 1;
    let stateFk = Number(selectedValues.itemState) || 1;
    let originFk = Number(selectedValues.itemOrigin) || 1;
    let qualityFk = Number(selectedValues.itemQuality) || 1;
    let centerNumber = itemNumber || '0';

    if (modifyShow) {
      categoryFk = Number(categories.find((c) => c.name === modifyFormData.categoryName)?.pk || 1);
      stateFk = Number(itemStates.find((s) => s.name === modifyFormData.stateName)?.pk || 1);
      originFk = Number(itemOrigins.find((o) => o.name === modifyFormData.originName)?.pk || 1);
      qualityFk = Number(itemQualities.find((q) => q.name === modifyFormData.qualityName)?.pk || 1);
      const ic = modifyFormData.itemCode;
      if (ic && ic.length >= 5) centerNumber = ic.substring(2, 5);
    }

    const saveData = {
      itemCode: showForm ? addFormData.itemCode : modifyFormData.itemCode,
      itemName: showForm ? addFormData.itemName : modifyFormData.itemName,
      itemNickName: showForm ? addFormData.itemAltName : modifyFormData.itemAltName,
      itemCenterNumber: centerNumber,
      itemStateFk: stateFk,
      itemQualityFk: qualityFk,
      itemOriginFk: originFk,
      itemCategoryFk: categoryFk,
      purchaseBaseUnit: getUnitCodeByPk(selectedValues.purchase.baseUnit, itemUnits),
      purchaseSecondaryUnit: getUnitCodeByPk(selectedValues.purchase.secondaryUnit, itemUnits),
      purchaseBaseFactor: 1,
      purchaseSecondaryFactor: parseFloat(purchaseManualSecondaryQty) || 1,
      packageSecondaryUnit: getUnitCodeByPk(selectedValues.package.secondaryUnit, itemUnits),
      packageSecondaryFactor: parseFloat(packageManualSecondaryQty) || 1,
      createdBy: userId,
      lastActBy: userId,
    };
    saveItemMaster(saveData);
  };

  const refreshAllData = () => {
    fetchCategories();
    fetchItemStates();
    fetchItemOrigins();
    fetchItemQualities();
    fetchItemUnits();
    setRefreshCounter(prev => prev + 1);
    setSelectedValues({
      category: null,
      itemState: null,
      itemOrigin: null,
      itemQuality: null,
      purchase: { baseUnit: null, secondaryUnit: null },
      package: { baseUnit: null, secondaryUnit: null },
    });
    setItemNumber('');
    setAddFormData({ itemCode: '0000000', itemName: '', itemAltName: '', issueUnit: 'UOM' });
    setModifyFormData({
      itemCode: '',
      itemName: '',
      itemAltName: '',
      packageId: '',
      purchaseId: '',
      categoryName: '',
      stateName: '',
      qualityName: '',
      originName: '',
      issueUnit: 'UOM',
    });
    setPurchaseManualSecondaryQty('1');
    setPackageManualSecondaryQty('1');
    setPurchaseAutoBaseQty('1.000');
    setPackageAutoBaseQty('1.000');
  };

  const getUnitCodeByPk = (pk: number | null, units: DropdownItem[]): string => {
    if (pk == null) return '';
    const unit = units.find((u) => u.pk === pk);
    return unit ? unit.code || '' : '';
  };

  return (
    <>
      <Toastify />
      {showSessionModal && <SessionModal />}

      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                {confirmType === 'add' ? 'Confirm Save' : 'Confirm Modify'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                {confirmType === 'add'
                  ? 'Are you sure you want to save this new item?'
                  : 'Are you sure you want to modify this item?'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmType(null);
                }}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction?.();
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmType(null);
                }}
                className="flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-800 dark:hover:to-indigo-900 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container with max height and scroll */}
      <div className="max-h-screen px-1 mb-2">
        {/* Header with info icon */}
        <div className="bg-white dark:bg-gray-800 sticky top-0 rounded-lg shadow-sm px-3 py-3 mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            
            {/* Title with InfoTooltip */}
            <h1 className="text-lg sm:text-xl flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <FaBox className="h-5 w-5" />
              Item Creation Master
              <InfoTooltip content="Create and manage item masters. Define classification, particulars, purchase, and package details." />
            </h1>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              
              <Tooltip content="Save">
                <button
                  className="w-10 h-10 p-0 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center"
                  onClick={handleSaveClick}
                >
                  <FaSave className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip content="Refresh">
                <Button
                  color="warning"
                  size="xs"
                  className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                  onClick={handleRefreshClick}
                >
                  <HiRefresh className="w-4 h-4" />
                </Button>
              </Tooltip>

              <Tooltip content="List">
                <Button
                  size="xs"
                  className="w-10 h-10 p-0 rounded-full bg-indigo-500 flex items-center justify-center"
                  onClick={handleListClick}
                >
                  <HiViewList className="w-4 h-4" />
                </Button>
              </Tooltip>

            </div>
          </div>
        </div>

        {/* Conditional rendering */}
        {showTable && !showForm && !modifyShow ? (
          <ItemCreationTable />
        ) : modifyShow ? (
          // -------------------- MODIFY MODE (two‑row, two‑column layout) --------------------
          <div className="flex flex-col gap-4">
            {/* Row 1: Classification & Particulars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Item Classification - read‑only */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Item Classification
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Category Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.categoryName} />
                    </div>
                    <input type="text" value={modifyFormData.categoryName} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">State Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.stateName} />
                    </div>
                    <input type="text" value={modifyFormData.stateName} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Origin Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.originName} />
                    </div>
                    <input type="text" value={modifyFormData.originName} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Quality Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.qualityName} />
                    </div>
                    <input type="text" value={modifyFormData.qualityName} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Number</Label>
                      <InfoTooltip content={fieldInfo.itemNumber} />
                    </div>
                    <input type="text" value={itemNumber} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Item Particulars */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Item Particulars
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Code <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemCode} />
                    </div>
                    <input type="text" value={modifyFormData.itemCode} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemName} />
                    </div>
                    <input type="text" value={modifyFormData.itemName} onChange={(e) => setModifyFormData((prev) => ({ ...prev, itemName: e.target.value }))} className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Alt Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemAltName} />
                    </div>
                    <input type="text" value={modifyFormData.itemAltName} onChange={(e) => setModifyFormData((prev) => ({ ...prev, itemAltName: e.target.value }))} className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Issue Unit</Label>
                      <InfoTooltip content={fieldInfo.issueUnit} />
                    </div>
                    <input type="text" value={modifyFormData.issueUnit} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Package ID <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.packageId} />
                    </div>
                    <input type="text" value={modifyFormData.packageId} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Purchase ID <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.purchaseId} />
                    </div>
                    <input type="text" value={modifyFormData.purchaseId} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Purchase & Package Definition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Purchase Definition */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Purchase Definition
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-end gap-3">
                  <div className="relative flex-1 min-w-[80px] w-full sm:w-auto">
                    <input type="text" value={purchaseAutoBaseQty} readOnly className="peer w-full h-11 px-3 pt-4 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                    <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:-top-2 -translate-y-0.5 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:-top-2 -translate-y-0.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                      Quantity
                    </label>
                    <InfoTooltip content={fieldInfo.purchaseBaseQty} />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Base Unit</Label>
                      <InfoTooltip content={fieldInfo.purchaseBaseUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`purchaseBaseUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="purchaseBaseUnit"
                      value={selectedValues.purchase.baseUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, purchase: { ...prev.purchase, baseUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.purchaseBaseUnit}
                      onToggle={() => toggleDropdown('purchaseBaseUnit')}
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-700 dark:text-gray-300 flex-shrink-0 px-1 hidden sm:inline">×</span>
                  <div className="relative flex-1 min-w-[80px] w-full sm:w-auto">
                    <input type="text" value={purchaseManualSecondaryQty} onChange={(e) => setPurchaseManualSecondaryQty(e.target.value)} className="peer w-full h-11 px-3 pt-4 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500" required />
                    <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:-top-2 -translate-y-0.5 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:-top-2 -translate-y-0.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                      Quantity *
                    </label>
                    <InfoTooltip content={fieldInfo.purchaseSecondaryQty} />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Secondary Unit</Label>
                      <InfoTooltip content={fieldInfo.purchaseSecondaryUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`purchaseSecondaryUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="purchaseSecondaryUnit"
                      value={selectedValues.purchase.secondaryUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, purchase: { ...prev.purchase, secondaryUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.purchaseSecondaryUnit}
                      onToggle={() => toggleDropdown('purchaseSecondaryUnit')}
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Package Definition */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Package Definition
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-end gap-3">
                  <div className="relative flex-1 min-w-[80px] w-full sm:w-auto">
                    <input type="text" value={packageAutoBaseQty} readOnly className="peer w-full h-11 px-3 pt-4 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                    <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:-top-2 -translate-y-0.5 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:-top-2 -translate-y-0.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                      Quantity
                    </label>
                    <InfoTooltip content={fieldInfo.packageBaseQty} />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Base Unit</Label>
                      <InfoTooltip content={fieldInfo.packageBaseUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`packageBaseUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="packageBaseUnit"
                      value={selectedValues.package.baseUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, package: { ...prev.package, baseUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.packageBaseUnit}
                      onToggle={() => toggleDropdown('packageBaseUnit')}
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-700 dark:text-gray-300 flex-shrink-0 px-1 hidden sm:inline">×</span>
                  <div className="relative flex-1 min-w-[80px] w-full sm:w-auto">
                    <input type="text" value={packageManualSecondaryQty} onChange={(e) => setPackageManualSecondaryQty(e.target.value)} className="peer w-full h-11 px-3 pt-4 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500" required />
                    <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200 pointer-events-none peer-focus:-top-2 -translate-y-0.5 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:-top-2 -translate-y-0.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                      Quantity *
                    </label>
                    <InfoTooltip content={fieldInfo.packageSecondaryQty} />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Secondary Unit</Label>
                      <InfoTooltip content={fieldInfo.packageSecondaryUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`packageSecondaryUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="packageSecondaryUnit"
                      value={selectedValues.package.secondaryUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, package: { ...prev.package, secondaryUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.packageSecondaryUnit}
                      onToggle={() => toggleDropdown('packageSecondaryUnit')}
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-64"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // -------------------- ADD MODE (two‑row, two‑column layout) --------------------
          <div className="flex flex-col gap-4">
            {/* Row 1: Classification & Particulars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Item Classification */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Item Classification
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Category <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.category} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`category-${refreshCounter}`}
                      data={categories}
                      type="category"
                      value={selectedValues.category}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, category: value }))}
                      showPk={true}
                      className="w-full"
                      loadingKey="categories"
                      isLoading={loading.categories}
                      error={errors.categories}
                      isOpen={dropdownOpen.category}
                      onToggle={() => toggleDropdown('category')}
                      opensUp={true}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item State <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemState} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`itemState-${refreshCounter}`}
                      data={itemStates}
                      type="itemState"
                      value={selectedValues.itemState}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, itemState: value }))}
                      showPk={true}
                      className="w-full"
                      loadingKey="itemStates"
                      isLoading={loading.itemStates}
                      error={errors.itemStates}
                      isOpen={dropdownOpen.itemState}
                      onToggle={() => toggleDropdown('itemState')}
                      opensUp={true}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Origin <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemOrigin} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`itemOrigin-${refreshCounter}`}
                      data={itemOrigins}
                      type="itemOrigin"
                      value={selectedValues.itemOrigin}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, itemOrigin: value }))}
                      showPk={true}
                      className="w-full"
                      loadingKey="itemOrigins"
                      isLoading={loading.itemOrigins}
                      error={errors.itemOrigins}
                      isOpen={dropdownOpen.itemOrigin}
                      onToggle={() => toggleDropdown('itemOrigin')}
                      opensUp={true}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Quality <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemQuality} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`itemQuality-${refreshCounter}`}
                      data={itemQualities}
                      type="itemQuality"
                      value={selectedValues.itemQuality}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, itemQuality: value }))}
                      showPk={true}
                      className="w-full"
                      loadingKey="itemQualities"
                      isLoading={loading.itemQualities}
                      error={errors.itemQualities}
                      isOpen={dropdownOpen.itemQuality}
                      onToggle={() => toggleDropdown('itemQuality')}
                      opensUp={true}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Number <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemNumber} />
                    </div>
                    <input
                      type="text"
                      value={itemNumber}
                      onChange={handleItemNumberChange}
                      maxLength={3}
                      className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Item Particulars */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Item Particulars
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Code</Label>
                      <InfoTooltip content={fieldInfo.itemCode} />
                    </div>
                    <input type="text" value={addFormData.itemCode} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemName} />
                    </div>
                    <input type="text" value={addFormData.itemName} onChange={(e) => setAddFormData((prev) => ({ ...prev, itemName: e.target.value }))} className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Item Alt Name <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.itemAltName} />
                    </div>
                    <input type="text" value={addFormData.itemAltName} onChange={(e) => setAddFormData((prev) => ({ ...prev, itemAltName: e.target.value }))} className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Issue Unit</Label>
                      <InfoTooltip content={fieldInfo.issueUnit} />
                    </div>
                    <input type="text" value={addFormData.issueUnit} readOnly className="w-full h-11 px-3 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Purchase & Package Definition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Purchase Definition */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Purchase Definition
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-end gap-3">
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Quantity</Label>
                      <InfoTooltip content={fieldInfo.purchaseBaseQty} />
                    </div>
                    <input type="text" value={purchaseAutoBaseQty} readOnly className="w-full sm:w-16 h-11 px-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Base Unit <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.purchaseBaseUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`purchaseBaseUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="purchaseBaseUnit"
                      value={selectedValues.purchase.baseUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, purchase: { ...prev.purchase, baseUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.purchaseBaseUnit}
                      onToggle={() => toggleDropdown('purchaseBaseUnit')}
                      className="w-full"
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-600 dark:text-gray-300 flex-shrink-0 px-1 self-center mb-1 hidden sm:inline">X</span>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Quantity <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.purchaseSecondaryQty} />
                    </div>
                    <input type="text" value={purchaseManualSecondaryQty} onChange={(e) => setPurchaseManualSecondaryQty(e.target.value)} className="w-full sm:w-16 h-11 px-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Secondary Unit <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.purchaseSecondaryUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`purchaseSecondaryUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="purchaseSecondaryUnit"
                      value={selectedValues.purchase.secondaryUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, purchase: { ...prev.purchase, secondaryUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.purchaseSecondaryUnit}
                      onToggle={() => toggleDropdown('purchaseSecondaryUnit')}
                      className="w-full"
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Package Definition */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400">
                    Package Definition
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-end gap-3">
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Quantity</Label>
                      <InfoTooltip content={fieldInfo.packageBaseQty} />
                    </div>
                    <input type="text" value={packageAutoBaseQty} readOnly className="w-full sm:w-16 h-11 px-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none" />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Base Unit</Label>
                      <InfoTooltip content={fieldInfo.packageBaseUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`packageBaseUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="packageBaseUnit"
                      value={selectedValues.package.baseUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, package: { ...prev.package, baseUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.packageBaseUnit}
                      onToggle={() => toggleDropdown('packageBaseUnit')}
                      className="w-full"
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-64"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-600 dark:text-gray-300 flex-shrink-0 px-1 self-center mb-1 hidden sm:inline">X</span>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Quantity <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.packageSecondaryQty} />
                    </div>
                    <input type="text" value={packageManualSecondaryQty} onChange={(e) => setPackageManualSecondaryQty(e.target.value)} className="w-full sm:w-16 h-11 px-2 text-gray-900 dark:text-gray-100 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-[120px] w-full sm:w-auto">
                    <div className="flex items-center mb-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Secondary Unit <sup className="text-red-600">*</sup></Label>
                      <InfoTooltip content={fieldInfo.packageSecondaryUnit} />
                    </div>
                    <CustomDropdownWithSearch
                      key={`packageSecondaryUnit-${refreshCounter}`}
                      data={itemUnits}
                      type="packageSecondaryUnit"
                      value={selectedValues.package.secondaryUnit}
                      onChange={(value) => setSelectedValues((prev) => ({ ...prev, package: { ...prev.package, secondaryUnit: value } }))}
                      loadingKey="itemUnits"
                      isLoading={loading.itemUnits}
                      error={errors.itemUnits}
                      isOpen={dropdownOpen.packageSecondaryUnit}
                      onToggle={() => toggleDropdown('packageSecondaryUnit')}
                      className="w-full"
                      opensUp={true}
                      showPk={false}
                      dropdownWidth="w-44"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ItemCreation;