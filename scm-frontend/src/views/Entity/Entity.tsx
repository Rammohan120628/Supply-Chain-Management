import React, { useState, useEffect, useContext } from 'react';
import { HiRefresh } from 'react-icons/hi';
import { FaSave } from 'react-icons/fa';
import { CircleCheckBig } from 'lucide-react';
import { Button, Tooltip } from "flowbite-react";
import SessionModal from '../SessionModal';
import Toastify, { showToast } from '../Toastify';
import { EntityContext } from './EntityContext'; 
import { MdOutlinePermIdentity } from "react-icons/md";

const floatingInputBase = `block w-full px-4 pt-4 pb-2 rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 appearance-none peer placeholder-transparent`;
const editableFloatingInputClass = `${floatingInputBase}`;

const dateFormatOptions = [
  { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
  { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  { value: 'MM-dd-yyyy', label: 'MM-DD-YYYY' },
  { value: 'MM-dd-yyyy', label: 'MM-DD-YYYY' },
];

const dateTimeFormatOptions = [
  { value: 'dd-MM-yyyy HH:mm:ss', label: 'DD-MM-YYYY HH:MM:SS' },
  { value: 'dd-MM-yyyy HH:mm:ss', label: 'DD-MM-YYYY HH:MM:SS' },
  { value: 'yyyy-MM-dd HH:mm:ss', label: 'YYYY-MM-DD HH:MM:SS' },
  { value: 'yyyy-MM-dd HH:mm:ss', label: 'YYYY-MM-DD HH:MM:SS' },
  { value: 'MM-dd-yyyy hh:mm:ss a', label: 'MM-DD-YYYY HH:MM:SS AM/PM' },
  { value: 'MM-dd-yyyy hh:mm:ss a', label: 'MM-DD-YYYY HH:MM:SS AM/PM' },
  { value: 'dd-MM-yyyy ss:mm:HH', label: 'DD-MM-YYYY HH:MM:SS' },
];

const EntityCreation: React.FC = () => {
  const { setEntity } = useContext(EntityContext);
  console.log('setEntity 1 -->', setEntity);
  const [cwhOptions, setCwhOptions] = useState<{ value: string; label: string; itemCode: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'additional'>('main'); // Tab state

  // ---------- Common Confirm Modal States ----------
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetSupplierId, setTargetSupplierId] = useState<string | null>(null);
  // ------------------------------------------------

  // Extended form data to match full API response
  const [formData, setFormData] = useState({
    entityId: '',
    entityName: '',
    manager: '',
    cwh: '',
    tenderFrom: '',
    purchaseFrom: '',
    stockFrom: '',
    country: '',
    currency: '',
    interestRate: '',
    decimalValue: '',
    decimalQuantity: '',
    cashBalance: '',
    // New fields from response
    stockClosing: 0,
    process: 2,
    dateFormat: '',
    dateTimeFormat: '',
    language: '',
    timeZone: '',
    numberFormat: '',
  });

  // helper to compute label "floated" state for inputs
  const getFloatingLabelClass = (floated: boolean) =>
    `absolute left-3 top-3 z-10 text-sm text-gray-500 dark:text-gray-400
   duration-300 transform origin-[0] peer-focus:px-2 peer-focus:bg-white
    dark:peer-focus:bg-gray-900 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 ${
      floated ? 'scale-75 -translate-y-3 bg-white dark:bg-gray-900 px-2' : 'scale-100 translate-y-0'
    }`;

  const convertDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm}-${dd}`;
  };

  const reverseConvertDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  };

  const loadEntity = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowModal(true);
      showToast('Authentication required. Please log in.', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const request = await fetch(
        `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/viewEntities/1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('view api status:', request.status);

      if (!request.ok) {
        if (request.status === 401) {
          setShowModal(true);
          showToast('Session expired. Redirecting to login.', 'error');
        } else {
          showToast('Failed to load entity data. Please try again.', 'error');
        }
        return;
      }

      const response = await request.json();
      console.log('view api response:', response);

      if (response.success) {
        const d = response.data;

        setFormData({
          entityId: d.entity || '',
          entityName: d.entityName || '',
          manager: d.manager || '',
          cwh: '',
          tenderFrom: convertDate(d.tenderPeriodStr),
          purchaseFrom: convertDate(d.purchasePeriodStr),
          stockFrom: convertDate(d.stockPeriodStr),
          country: d.country || '',
          currency: d.currencyId || '',
          interestRate: d.intrestRate?.toString() || '',
          decimalValue: d.decimalToValue?.toString() || '',
          decimalQuantity: d.decimalToQty?.toString() || '',
          cashBalance: d.cashOpBalance?.toString() || '',
          // New fields
          stockClosing: d.stockClosing || 0,
          process: d.process || 2,
          dateFormat: d.dateFormat || '',
          dateTimeFormat: d.dateTimeFormat || '',
          language: d.language || '',
          timeZone: d.timeZone || '',
          numberFormat: d.numberFormat || '',
        });

        // Store in context (including new fields)
        setEntity(d);
        console.log('setEntity 2 -->', d);

        // Load CWH Dropdown
        const dropdownReq = await fetch(
          `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/loadCwhDropdown`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }
        );
        console.log('dropdown api response --->', dropdownReq);

        if (!dropdownReq.ok) {
          showToast('Failed to load CWH options. Please try again.', 'error');
          return;
        }

        const dropdownResp = await dropdownReq.json();

        if (dropdownResp.success) {
          setCwhOptions(
            dropdownResp.data.map((item: any) => ({
              value: item.pk.toString(),
              itemCode: item.code,
              label: `${item.code} - ${item.name}`,
            }))
          );

          // Auto-select based on pk
          if (d.cwhPk) {
            setFormData((prev) => ({
              ...prev,
              cwh: d.cwhPk.toString(),
            }));
          }
        } else {
          showToast('Failed to load CWH options. Please try again.', 'error');
        }
      } else {
        showToast('Failed to load entity data. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      setShowModal(true);
      showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntity();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowModal(true);
      showToast('Authentication required. Please log in.', 'error');
      return;
    }

    const selectedCwh = cwhOptions.find((opt) => opt.value === formData.cwh);
    // Build full payload matching the API response
    const body = {
      pk: 1,
      cwhPk: parseInt(formData.cwh) || 0,
      cwh: selectedCwh?.itemCode || '',
      tenderPeriodStr: reverseConvertDate(formData.tenderFrom),
      purchasePeriodStr: reverseConvertDate(formData.purchaseFrom),
      stockPeriodStr: reverseConvertDate(formData.stockFrom),
      entity: formData.entityId,
      currencyId: formData.currency,
      intrestRate: parseFloat(formData.interestRate) || 0,
      decimalToValue: parseInt(formData.decimalValue) || 0,
      decimalToQty: parseInt(formData.decimalQuantity) || 0,
      cashOpBalance: parseFloat(formData.cashBalance) || 0,
      manager: formData.manager,
      entityName: formData.entityName,
      country: formData.country,
      // New fields
      stockClosing: formData.stockClosing,
      process: formData.process,
      dateFormat: formData.dateFormat,
      dateTimeFormat: formData.dateTimeFormat,
      language: formData.language,
      timeZone: formData.timeZone,
      numberFormat: formData.numberFormat,
    };

    console.log('save body --->', body);
    try {
      setIsSaving(true);
      const request = await fetch(
        'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/scmMasterController/modifyEntities',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      console.log('save api response:', request);

      if (!request.ok) {
        if (request.status === 401) {
          setShowModal(true);
          showToast('Session expired. Redirecting to login.', 'error');
        } else {
          showToast('Failed to save entity. Please try again.', 'error');
        }
        console.error('Save failed');
        return;
      }

      const response = await request.json();
      if (response.success) {
        showToast('Entity saved successfully!', 'success');
        console.log('Entity saved successfully');
        await loadEntity(); // reload after save
      } else {
        showToast('Failed to save entity. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error saving entity:', err);
      showToast('Network error while saving entity. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadEntity();
    showToast('Entity data reset to defaults.', 'success');
  };

  // ---------- Confirm Modal Handler ----------
  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmType(null);
    setTargetSupplierId(null);
  };
  // --------------------------------------------

  if (showModal) {
    return <SessionModal />;
  }

  const loading = isLoading || isSaving;

  // Sample numbers for preview
  const sampleAmount = 12345.6789;
  const sampleQuantity = 5.6789;

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-1 px-2">
      {/* Toast Notify */}
      <Toastify />

      {/* Global Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-2 backdrop-blur-sm rounded-2xl mb-4">
          <h1 className="text-xl flex items-center gap-2 text-blue-600">
            <MdOutlinePermIdentity className='h-5 w-5'/> Entity Creation
          </h1>
          <div className="flex gap-3">
            <Tooltip content="Save">
              <button
                className="w-10 h-10 p-0 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setConfirmType('edit');
                  setConfirmAction(() => handleSave);
                  setTargetSupplierId(formData.entityId || null);
                  setShowConfirm(true);
                }}
                disabled={loading}
              >
                <FaSave className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip content="Refresh">
              <Button
                color="warning"
                size="xs"
                onClick={handleReset}
                className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <HiRefresh className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 pt-2">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'main'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('main')}
            >
              Main Settings
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'additional'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('additional')}
            >
              Additional Settings
            </button>
          </div>

          <div className="p-4 md:p-6">
            {!loading && (
              <>
                {/* Main Settings Tab */}
                {activeTab === 'main' && (
                  <div className="space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Entity ID - disabled */}
                      <div>
                        <div className="relative">
                          <input
                            id="entityId"
                            name="entityId"
                            type="text"
                            value={formData.entityId}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            placeholder=" "
                            disabled
                          />
                          <label htmlFor="entityId" className={getFloatingLabelClass(formData.entityId !== '')}>
                            Entity ID
                          </label>
                        </div>
                      </div>

                      {/* Entity Name */}
                      <div>
                        <div className="relative">
                          <input
                            id="entityName"
                            name="entityName"
                            type="text"
                            value={formData.entityName}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            required
                            placeholder=" "
                          />
                          <label htmlFor="entityName" className={getFloatingLabelClass(formData.entityName !== '')}>
                            Entity Name <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      {/* Manager */}
                      <div>
                        <div className="relative">
                          <input
                            id="manager"
                            name="manager"
                            type="text"
                            value={formData.manager}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            required
                            placeholder=" "
                          />
                          <label htmlFor="manager" className={getFloatingLabelClass(formData.manager !== '')}>
                            Manager <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      {/* CWH Dropdown */}
                      <div>
                        <div className="relative">
                          <select
                            id="cwh"
                            name="cwh"
                            value={formData.cwh}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            required
                          >
                            <option value="">Select CWH</option>
                            {cwhOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="cwh" className={getFloatingLabelClass(formData.cwh !== '')}>
                            CWH <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Tender Period - disabled */}
                      <div>
                        <div className="relative">
                          <input
                            type="date"
                            id="tenderFrom"
                            name="tenderFrom"
                            value={formData.tenderFrom}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            placeholder=" "
                            disabled
                          />
                          <label htmlFor="tenderFrom" className={getFloatingLabelClass(formData.tenderFrom !== '')}>
                            Tender Period <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      {/* Purchase Period - disabled */}
                      <div>
                        <div className="relative">
                          <input
                            type="date"
                            id="purchaseFrom"
                            name="purchaseFrom"
                            value={formData.purchaseFrom}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            placeholder=" "
                            disabled
                          />
                          <label htmlFor="purchaseFrom" className={getFloatingLabelClass(formData.purchaseFrom !== '')}>
                            Purchase Period <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      {/* Stock Period - disabled */}
                      <div>
                        <div className="relative">
                          <input
                            type="date"
                            id="stockFrom"
                            name="stockFrom"
                            value={formData.stockFrom}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            placeholder=" "
                            disabled
                          />
                          <label htmlFor="stockFrom" className={getFloatingLabelClass(formData.stockFrom !== '')}>
                            Stock Period <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      {/* Country */}
                      <div>
                        <div className="relative">
                          <input
                            id="country"
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            placeholder=" "
                          />
                          <label htmlFor="country" className={getFloatingLabelClass(formData.country !== '')}>
                            Country <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Currency */}
                      <div>
                        <div className="relative">
                          <input
                            id="currency"
                            name="currency"
                            type="text"
                            value={formData.currency}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            placeholder=" "
                          />
                          <label htmlFor="currency" className={getFloatingLabelClass(formData.currency !== '')}>
                            Currency <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      {/* Interest Rate */}
                      <div>
                        <div className="relative">
                          <input
                            id="interestRate"
                            name="interestRate"
                            type="number"
                            step="0.1"
                            value={formData.interestRate}
                            onChange={handleChange}
                            placeholder=" "
                            className={`${editableFloatingInputClass} pr-24 appearance-textfield [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                          />
                          <label htmlFor="interestRate" className={getFloatingLabelClass(formData.interestRate !== '')}>
                            Interest Rate <span className="text-red-500">*</span>
                          </label>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-3 py-1 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
                            {formData.currency}
                          </span>
                        </div>
                      </div>

                      {/* Decimal To Value */}
                      <div>
                        <div className="relative">
                          <input
                            type="number"
                            id="decimalValue"
                            name="decimalValue"
                            value={formData.decimalValue}
                            onChange={handleChange}
                            className={`${editableFloatingInputClass} appearance-textfield [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            placeholder=" "
                            min="0"
                            step="1"
                          />
                          <label htmlFor="decimalValue" className={getFloatingLabelClass(formData.decimalValue !== '')}>
                            Decimal To Value <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Preview: {sampleAmount} →{' '}
                          {formData.decimalValue
                            ? sampleAmount.toFixed(parseInt(formData.decimalValue) || 0)
                            : '...'}
                        </div>
                      </div>

                      {/* Decimal To Quantity */}
                      <div>
                        <div className="relative">
                          <input
                            type="number"
                            id="decimalQuantity"
                            name="decimalQuantity"
                            value={formData.decimalQuantity}
                            onChange={handleChange}
                            className={`${editableFloatingInputClass} appearance-textfield [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            placeholder=" "
                            min="0"
                            step="1"
                          />
                          <label htmlFor="decimalQuantity" className={getFloatingLabelClass(formData.decimalQuantity !== '')}>
                            Decimal To Quantity <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Preview: {sampleQuantity} →{' '}
                          {formData.decimalQuantity
                            ? sampleQuantity.toFixed(parseInt(formData.decimalQuantity) || 0)
                            : '...'}
                        </div>
                      </div>
                    </div>

                    {/* Row 4 - Cash Balance (disabled) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="relative">
                          <input
                            type="number"
                            id="cashBalance"
                            name="cashBalance"
                            value={formData.cashBalance}
                            onChange={handleChange}
                            className={`${editableFloatingInputClass} appearance-textfield [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            placeholder=" "
                            disabled
                          />
                          <label htmlFor="cashBalance" className={getFloatingLabelClass(formData.cashBalance !== '')}>
                            Cash Balance <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Row 5 - Date Format & Date Time Format */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                      {/* Date Format Dropdown */}
                      <div>
                        <div className="relative">
                          <select
                            id="dateFormat"
                            name="dateFormat"
                            value={formData.dateFormat}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            required
                          >
                            <option value="">Select Date Format</option>
                            {dateFormatOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="dateFormat" className={getFloatingLabelClass(formData.dateFormat !== '')}>
                            Date Format <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>

                      {/* Date Time Format Dropdown */}
                      <div>
                        <div className="relative">
                          <select
                            id="dateTimeFormat"
                            name="dateTimeFormat"
                            value={formData.dateTimeFormat}
                            onChange={handleChange}
                            className={editableFloatingInputClass}
                            required
                          >
                            <option value="">Select Date Time Format</option>
                            {dateTimeFormatOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="dateTimeFormat" className={getFloatingLabelClass(formData.dateTimeFormat !== '')}>
                            Date Time Format <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Settings Tab */}
                {activeTab === 'additional' && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Additional Settings</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 block">Stock Closing</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.stockClosing}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 block">Process</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.process}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 block">Language</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.language || '—'}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 block">Time Zone</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.timeZone || '—'}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 block">Number Format</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.numberFormat || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Common Confirm Modal (unchanged) ---------- */}
      {showConfirm && confirmType && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50 ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-200/50 dark:ring-green-900/30 shadow-lg">
                <CircleCheckBig className="text-green-600 dark:text-green-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
                Confirm{' '}
                {confirmType === 'add'
                  ? 'Save'
                  : confirmType === 'edit'
                  ? 'Modify'
                  : confirmType === 'status'
                  ? 'Change Status'
                  : 'Download'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                {confirmType === 'add' ? (
                  'Are you sure you want to save this new entity?'
                ) : confirmType === 'edit' ? (
                  <>
                    Are you sure you want to modify this entity?
                    {targetSupplierId && (
                      <span className="block mt-1 font-medium">ID: {targetSupplierId}</span>
                    )}
                  </>
                ) : confirmType === 'status' ? (
                  `Are you sure you want to change the status of ${targetSupplierId || 'this entity'}?`
                ) : (
                  'Are you sure you want to download the entity report?'
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmType(null);
                  setTargetSupplierId(null);
                }}
                className="flex-1 px-3 py-3 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm sm:text-base order-2 sm:order-1 backdrop-blur-sm hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-3 py-3 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-2xl text-sm sm:text-base order-1 sm:order-2 transform hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  confirmType === 'status'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900 focus:ring-red-500 dark:focus:ring-offset-gray-900'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityCreation;