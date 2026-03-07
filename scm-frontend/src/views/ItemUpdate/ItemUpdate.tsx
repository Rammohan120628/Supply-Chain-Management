import { Label, Button, Tooltip } from "flowbite-react";
import { useState, useEffect, useRef } from 'react';
import { HiRefresh, HiViewList, HiSearch } from 'react-icons/hi';
import { FaSave } from "react-icons/fa";
import { CircleCheckBig, Package, Tag, ShoppingCart, Box, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toastify, { showToast } from '../Toastify';
import SessionModal from "../SessionModal";
import { FaBox } from "react-icons/fa";
interface Item {
  pk: number;
  itemCode: string;
  itemName: string;
  itemCategoryName: string;
  itemStateName: string;
  itemQualityName: string;
  itemOriginName: string;
  purchaseId: string;
  packageId: string;
}

const ItemUpdate = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPk, setSelectedPk] = useState('');
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [originalItemName, setOriginalItemName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemCategoryName, setItemCategoryName] = useState('');
  const [itemStateName, setItemStateName] = useState('');
  const [itemQualityName, setItemQualityName] = useState('');
  const [itemOriginName, setItemOriginName] = useState('');
  const [purchaseIdStr, setPurchaseIdStr] = useState('');
  const [packageIdStr, setPackageIdStr] = useState('');
  const [purchaseBaseFactor, setPurchaseBaseFactor] = useState('');
  const [purchaseBaseUnit, setPurchaseBaseUnit] = useState('');
  const [purchaseSecondaryFactor, setPurchaseSecondaryFactor] = useState('');
  const [purchaseSecondaryUnit, setPurchaseSecondaryUnit] = useState('');
  const [packageBaseFactor, setPackageBaseFactor] = useState('');
  const [packageBaseUnit, setPackageBaseUnit] = useState('');
  const [packageSecondaryFactor, setPackageSecondaryFactor] = useState('');
  const [packageSecondaryUnit, setPackageSecondaryUnit] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUrl = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/loadItemDropdown';
  const updateUrl = 'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/itemModify';

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const fetchItems = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(loadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) setShowSessionExpired(true);
        else console.error('Error fetching items:', res.status);
        return;
      }
      const { data } = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setShowSessionExpired(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateItemName = (name: string) => {
    if (!name.trim()) return 'Item Name is required';
    if (name.trim().length < 3) return 'Item Name must be at least 3 characters long';
    return '';
  };

  const handleItemSelect = (code: string) => {
    const item = items.find(i => i.itemCode === code);
    if (item) {
      setSelectedPk(item.pk.toString());
      setSelectedItemCode(item.itemCode);
      setOriginalItemName(item.itemName || '');
      setItemCode(item.itemCode);
      setItemName(item.itemName || '');
      setItemCategoryName(item.itemCategoryName || '');
      setItemStateName(item.itemStateName || '');
      setItemQualityName(item.itemQualityName || '');
      setItemOriginName(item.itemOriginName || '');
      setPurchaseIdStr(item.purchaseId || '');
      setPackageIdStr(item.packageId || '');

      const purchaseMatch = item.purchaseId ? item.purchaseId.match(/(\d+(?:\.\d+)?)\s*(\w+)\s*x\s*(\d+(?:\.\d+)?)\s*(\w+)/i) : null;
      if (purchaseMatch) {
        setPurchaseBaseFactor(parseFloat(purchaseMatch[1]).toFixed(3));
        setPurchaseBaseUnit(purchaseMatch[2]);
        setPurchaseSecondaryFactor(parseFloat(purchaseMatch[3]).toFixed(3));
        setPurchaseSecondaryUnit(purchaseMatch[4]);
      } else {
        setPurchaseBaseFactor('');
        setPurchaseBaseUnit('');
        setPurchaseSecondaryFactor('');
        setPurchaseSecondaryUnit('');
      }

      const packageMatch = item.packageId ? item.packageId.match(/(\d+(?:\.\d+)?)\s*(\w+)\s*x\s*(\d+(?:\.\d+)?)\s*(\w+)/i) : null;
      if (packageMatch) {
        setPackageBaseFactor(parseFloat(packageMatch[1]).toFixed(3));
        setPackageBaseUnit(packageMatch[2]);
        setPackageSecondaryFactor(parseFloat(packageMatch[3]).toFixed(3));
        setPackageSecondaryUnit(packageMatch[4]);
      } else {
        setPackageBaseFactor('');
        setPackageBaseUnit('');
        setPackageSecondaryFactor('');
        setPackageSecondaryUnit('');
      }
      setDropdownOpen(false);
    }
  };

  const handleItemNameChange = (value: string) => {
    setItemName(value);
  };

  const handleSave = () => {
    if (!selectedPk) {
      showToast('Please select an item first.', 'error');
      return;
    }
    const error = validateItemName(itemName);
    if (error) {
      showToast(error, 'error');
      return;
    }
    setShowConfirm(true);
  };

  const handleRefresh = () => {
    resetAllFields();
    fetchItems();
    showToast('Form refreshed successfully.', 'success');
  };

  const handleList = () => {
    navigate('/ItemCreationList');
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    const error = validateItemName(itemName);
    if (error) {
      showToast(error, 'error');
      return;
    }
    confirmUpdate();
  };

  const resetAllFields = () => {
    setSelectedPk('');
    setSelectedItemCode('');
    setOriginalItemName('');
    setItemName('');
    setItemCode('');
    setItemCategoryName('');
    setItemStateName('');
    setItemQualityName('');
    setItemOriginName('');
    setPurchaseIdStr('');
    setPackageIdStr('');
    setPurchaseBaseFactor('');
    setPurchaseBaseUnit('');
    setPurchaseSecondaryFactor('');
    setPurchaseSecondaryUnit('');
    setPackageBaseFactor('');
    setPackageBaseUnit('');
    setPackageSecondaryFactor('');
    setPackageSecondaryUnit('');
  };

  const confirmUpdate = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionExpired(true);
      return;
    }
    setIsLoading(true);
    const body = {
      itemPk: parseInt(selectedPk),
      itemCode,
      itemName,
      purchaseBaseUnit,
      purchaseSecondaryUnit,
      purchaseBaseFactor: parseFloat(purchaseBaseFactor),
      purchaseSecondaryFactor: parseFloat(purchaseSecondaryFactor),
      packageSecondaryUnit,
      packageSecondaryFactor: parseFloat(packageSecondaryFactor),
      lastActBY: 1001
    };
    try {
      const res = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        if (res.status === 401) setShowSessionExpired(true);
        else showToast('Update failed.', 'error');
        return;
      }
      showToast('Item updated successfully.', 'success');
      resetAllFields();
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      showToast('Update failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) setSearchTerm('');
  };

  return (
    <>
      <Toastify />

      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl text-blue-600 flex items-center gap-2 dark:text-blue-600"><FaBox className="h-5 w-5"/>Item Master Update</h1>
        <div className="flex flex-wrap gap-3">
          <Tooltip content='Save'>
            <Button
              color="success"
              size="xs"
              className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
              onClick={handleSave}
            >
              <FaSave className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content='Refresh'>
            <Button
              color="warning"
              size="xs"
              className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
              onClick={handleRefresh}
            >
              <HiRefresh className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content='List'>
            <Button
              size="xs"
              className="w-10 h-10 p-0 rounded-full bg-blue-500 flex items-center justify-center"
              onClick={handleList}
            >
              <HiViewList className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-6 mb-3">
        {/* Item Particulars */}
        <fieldset className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow">
          <legend className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full border border-blue-200 dark:border-blue-800 -ml-1 mb-4">
            <Package className="w-5 h-5" />
            Item Particulars
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div ref={dropdownRef}>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Item Code <sup className="text-red-600">*</sup></Label>
              <div className="relative">
                <div
                  className="flex justify-between items-center w-full h-11 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  onClick={toggleDropdown}
                  tabIndex={0}
                  role="button"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className={selectedItemCode ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                    {selectedItemCode ? `${selectedItemCode} - ${originalItemName}` : 'Select Item Code'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ease-in-out ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {dropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search Item"
                          autoFocus
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {isLoading ? (
                        <div className="flex justify-center items-center p-4">
                          <svg aria-hidden="true" className="w-5 h-5 text-blue-500 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                          </svg>
                          <span className="ml-2 text-sm text-gray-500">Loading...</span>
                        </div>
                      ) : filteredItems.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                          No results found
                        </div>
                      ) : (
                        filteredItems.map((item) => (
                          <div
                            key={item.pk}
                            className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                              selectedItemCode === item.itemCode ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 dark:border-blue-400' : 'text-gray-900 dark:text-gray-100'
                            }`}
                            onClick={() => handleItemSelect(item.itemCode)}
                            role="option"
                            aria-selected={selectedItemCode === item.itemCode}
                          >
                            {item.itemCode} - {item.itemName}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Item Name <sup className="text-red-600">*</sup></Label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => handleItemNameChange(e.target.value)}
                className="w-full h-11 px-3 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Package ID <sup className="text-red-600">*</sup></Label>
              <input
                type="text"
                value={packageIdStr}
                readOnly
                className="w-full h-11 px-3 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                required
                placeholder="Auto-fill"
              />
            </div>

            <div>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Purchase ID <sup className="text-red-600">*</sup></Label>
              <input
                type="text"
                value={purchaseIdStr}
                readOnly
                className="w-full h-11 px-3 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                required
                placeholder="Auto-fill"
              />
            </div>
          </div>
        </fieldset>

        {/* Item Classification */}
        <fieldset className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow">
          <legend className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full border border-blue-200 dark:border-blue-800 -ml-1 mb-4">
            <Tag className="w-5 h-5" />
            Item Classification
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Item Category</Label>
              <input
                type="text"
                value={itemCategoryName}
                readOnly
                className="w-full h-11 px-3 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                placeholder="Auto-fill"
              />
            </div>

            <div>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Item State <sup className="text-red-600">*</sup></Label>
              <input
                type="text"
                value={itemStateName}
                readOnly
                className="w-full h-11 px-3 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                placeholder="Auto-fill"
              />
            </div>

            <div>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Item Quality <sup className="text-red-600">*</sup></Label>
              <input
                type="text"
                value={itemQualityName}
                readOnly
                className="w-full h-11 px-3 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                placeholder="Auto-fill"
              />
            </div>

            <div>
              <Label className="block text-xs text-black dark:text-gray-300 mb-1">Item Origin</Label>
              <input
                type="text"
                value={itemOriginName}
                readOnly
                className="w-full h-11 px-3 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                placeholder="Auto-fill"
              />
            </div>
          </div>
        </fieldset>

        {/* Purchase and Package Definition - side by side */}
        <div className="flex gap-6 mb-8">
          {/* Purchase Definition */}
          <fieldset className="flex-1 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow">
            <legend className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full border border-blue-200 dark:border-blue-800 -ml-1 mb-4">
              <ShoppingCart className="w-5 h-5" />
              Purchase Definition
            </legend>
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Quantity</Label>
                <input
                  type="text"
                  value={purchaseBaseFactor}
                  readOnly
                  className="w-16 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>

              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Base Unit</Label>
                <input
                  type="text"
                  value={purchaseBaseUnit}
                  readOnly
                  className="w-28 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>

              <span className="flex-shrink-0 w-6 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                X
              </span>

              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Quantity <sup className="text-red-600">*</sup></Label>
                <input
                  type="text"
                  value={purchaseSecondaryFactor}
                  readOnly
                  className="w-16 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>

              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Secondary Unit</Label>
                <input
                  type="text"
                  value={purchaseSecondaryUnit}
                  readOnly
                  className="w-28 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>
            </div>
          </fieldset>

          {/* Package Definition */}
          <fieldset className="flex-1 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow">
            <legend className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full border border-blue-200 dark:border-blue-800 -ml-1 mb-4">
              <Box className="w-5 h-5" />
              Package Definition
            </legend>
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Quantity</Label>
                <input
                  type="text"
                  value={packageBaseFactor}
                  readOnly
                  className="w-16 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>

              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Base Unit</Label>
                <input
                  type="text"
                  value={packageBaseUnit}
                  readOnly
                  className="w-28 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>

              <span className="flex-shrink-0 w-6 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                X
              </span>

              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Quantity <sup className="text-red-600">*</sup></Label>
                <input
                  type="text"
                  value={packageSecondaryFactor}
                  readOnly
                  className="w-16 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>

              <div className="flex-shrink-0">
                <Label className="block text-xs text-black dark:text-gray-300 mb-1">Secondary Unit</Label>
                <input
                  type="text"
                  value={packageSecondaryUnit}
                  readOnly
                  className="w-28 h-11 px-2 text-black dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed focus:outline-none"
                  placeholder="Auto"
                />
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      {/* Enhanced Confirm Modal (styled like ItemCreation) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                Confirm Update
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                Are you sure you want to update this item?
              </p>
              {selectedItemCode && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Details:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Code:</span> {itemCode}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Name:</span> {itemName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Category:</span> {itemCategoryName || 'Auto-fill'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">State:</span> {itemStateName || 'Auto-fill'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmYes}
                className="flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
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
    </>
  );
};

export default ItemUpdate;