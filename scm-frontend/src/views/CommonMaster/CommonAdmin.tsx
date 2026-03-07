// Updated ProjectSettingsConfiguration.tsx without API integrations
import React, { useState, useEffect } from 'react';
import { Calendar, Settings, Hash, Clock, RefreshCw, Image, ToggleRight } from 'lucide-react';
import { useAuth } from 'src/context/AuthContext/AuthContext';

interface ProjectSettings {
  dateFormat: string;
  dateTimeFormat: string;
  timeFormat: string;
  decimalPlaces: number;
  costDecimalPlaces: number;
  quantityDecimalPlaces: number;
  currency: string;
  currencyFk: number;
  currencySymbol?: string;
  useCommaSeparator: boolean;
  screenLogo?: string;
  reportLogo?: string;
  screenLogoFile?: File | null;
  reportLogoFile?: File | null;
  recipeModify?: number;
}

const ProjectSettingsConfiguration: React.FC = () => {
  const { credentials, saveProjectSettings, updateProjectSettings } = useAuth();
  const [localSettings, setLocalSettings] = useState<ProjectSettings>(() => ({
    dateFormat: localStorage.getItem("dateFormat") || 'yyyy-MM-dd',
    dateTimeFormat: localStorage.getItem("dateTimeFormat") || 'dd-MM-yyyy ss:mm:HH',
    timeFormat: 'HH:mm:ss',
    decimalPlaces: parseInt(localStorage.getItem("decimalToValue") || '5'),
    costDecimalPlaces: parseInt(localStorage.getItem("decimalToValue") || '5'),
    quantityDecimalPlaces: parseInt(localStorage.getItem("decimalToQty") || '5'),
    currency: localStorage.getItem("currencyId") || 'OMR',
    currencyFk: credentials?.currencyFk || 22,
    useCommaSeparator: localStorage.getItem("useCommaSeparator") === 'true',
    screenLogo: localStorage.getItem("screenLogo"),
    reportLogo: localStorage.getItem("reportLogo"),
    screenLogoFile: null,
    reportLogoFile: null,
    recipeModify: 0,
  }));
  const [originalSettings, setOriginalSettings] = useState<ProjectSettings | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<ProjectSettings>>({});
  const [imageVersion, setImageVersion] = useState(0);

  useEffect(() => {
    setOriginalSettings({ ...localSettings });
  }, []);

  // Date format options - Updated to use MM for month
  const dateFormatOptions = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
    { value: 'yyyy/MM/dd', label: 'YYYY/MM/DD' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'MM-dd-yyyy', label: 'MM-DD-YYYY' },
  ];

  const dateTimeFormatOptions = [
    { value: 'dd/MM/yyyy HH:mm:ss', label: 'DD/MM/YYYY HH:MM:SS' },
    { value: 'dd-MM-yyyy HH:mm:ss', label: 'DD-MM-YYYY HH:MM:SS' },
    { value: 'yyyy/MM/dd HH:mm:ss', label: 'YYYY/MM/DD HH:MM:SS' },
    { value: 'yyyy-MM-dd HH:mm:ss', label: 'YYYY-MM-DD HH:MM:SS' },
    { value: 'MM/dd/yyyy hh:mm:ss a', label: 'MM/DD/YYYY HH:MM:SS AM/PM' },
    { value: 'MM-dd-yyyy hh:mm:ss a', label: 'MM-DD-YYYY HH:MM:SS AM/PM' },
    { value: 'dd-MM-yyyy ss:mm:HH', label: 'DD-MM-YYYY HH:MM:SS' }, // Added with adjusted label for user-friendliness
  ];

  const decimalOptions = [
    { value: 1, label: '1 decimal place' },
    { value: 2, label: '2 decimal places' },
    { value: 3, label: '3 decimal places' },
    { value: 4, label: '4 decimal places' },
    { value: 5, label: '5 decimal places' }
  ];

  const commaSeparatorOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  // Local formatting functions for immediate preview
  const formatDateExample = (date: Date, formatStr: string): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return formatStr
      .replace(/dd/g, day)
      .replace(/MM/g, month)
      .replace(/yyyy/g, year);
  };

  const formatDateTimeExample = (date: Date, formatStr: string): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    let hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    const hours12 = (date.getHours() % 12 || 12).toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    // Check if the format is the special case with reversed time placeholders
    const isReversedTime = formatStr.includes('ss:mm:HH');

    if (isReversedTime) {
      // Swap hours and seconds for replacement to display correctly
      const temp = hours;
      hours = seconds;
      seconds = temp;
    }

    return formatStr
      .replace(/dd/g, day)
      .replace(/MM/g, month)
      .replace(/yyyy/g, year)
      .replace(/HH/g, hours)
      .replace(/hh/g, hours12)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds)
      .replace(/a/g, ampm);
  };

  const formatAmountExample = (value: number): string => {
    const decimals = localSettings.costDecimalPlaces;
    if (localSettings.useCommaSeparator) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } else {
      return value.toFixed(decimals);
    }
  };

  const formatQuantityExample = (value: number): string => {
    const decimals = localSettings.quantityDecimalPlaces;
    if (localSettings.useCommaSeparator) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } else {
      return value.toFixed(decimals);
    }
  };

  // Validation
  const validateSettings = (): boolean => {
    const errors: Partial<ProjectSettings> = {};

    if (!localSettings.dateFormat) {
      errors.dateFormat = 'Date format is required';
    }

    if (!localSettings.dateTimeFormat) {
      errors.dateTimeFormat = 'Date time format is required';
    }

    if (!localSettings.currency) {
      errors.currency = 'Currency is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save settings (local only)
  const handleSaveSettings = () => {
    if (!validateSettings()) return;

    const clearedFiles = {
      ...localSettings,
      screenLogoFile: null,
      reportLogoFile: null,
    };
    setLocalSettings(clearedFiles);
    setOriginalSettings(clearedFiles);
    saveProjectSettings(clearedFiles);
    setImageVersion(prev => prev + 1);
  };

  // Reset to original settings
  const handleResetSettings = () => {
    if (originalSettings) {
      const resetWithClearedFiles = { ...originalSettings, screenLogoFile: null, reportLogoFile: null };
      setLocalSettings(resetWithClearedFiles);
      updateProjectSettings(originalSettings);
      setValidationErrors({});
    }
  };

  // File change handlers
  const handleScreenLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLocalSettings({ ...localSettings, screenLogoFile: e.target.files[0] });
    }
  };

  const handleReportLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLocalSettings({ ...localSettings, reportLogoFile: e.target.files[0] });
    }
  };

  // Recipe Modify toggle handler
  const handleRecipeModifyChange = (checked: boolean) => {
    const value = checked ? 1 : 0;
    const updatedSettings = { ...localSettings, recipeModify: value };
    setLocalSettings(updatedSettings);
    updateProjectSettings({ recipeModify: value });
  };

  // Change handlers - Update both local and global for immediate effect
  const handleDateFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLocalSettings({ ...localSettings, dateFormat: value });
    updateProjectSettings({ dateFormat: value });
  };

  const handleDateTimeFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLocalSettings({ ...localSettings, dateTimeFormat: value });
    updateProjectSettings({ dateTimeFormat: value });
  };

  const handleCostDecimalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    const updatedSettings = { 
      ...localSettings, 
      costDecimalPlaces: value,
      decimalPlaces: value 
    };
    setLocalSettings(updatedSettings);
    updateProjectSettings({ 
      costDecimalPlaces: value,
      decimalPlaces: value 
    });
  };

  const handleQuantityDecimalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    const updatedSettings = { ...localSettings, quantityDecimalPlaces: value };
    setLocalSettings(updatedSettings);
    updateProjectSettings({ quantityDecimalPlaces: value });
  };

  const handleCommaSeparatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'true';
    setLocalSettings({ ...localSettings, useCommaSeparator: value });
    updateProjectSettings({ useCommaSeparator: value });
  };

  const handleCurrencyChange = (selectedCurrencyCode: string) => {
    const updatedSettings = {
      ...localSettings,
      currency: selectedCurrencyCode,
    };
    setLocalSettings(updatedSettings);
    updateProjectSettings({
      currency: selectedCurrencyCode,
    });
  };

  const now = new Date();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Project Settings Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure common settings that will be applied across your entire project.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Format Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Date Format</h2>
          </div>
        
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date Format <span className="text-red-500">*</span>
            </label>
            <select
              value={localSettings.dateFormat}
              onChange={handleDateFormatChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                validationErrors.dateFormat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {dateFormatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {validationErrors.dateFormat && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.dateFormat}</p>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Preview: {formatDateExample(now, localSettings.dateFormat)}
            </div>
          </div>
        </div>
        {/* Date Time Format Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Date Time Format</h2>
          </div>
        
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date Time Format <span className="text-red-500">*</span>
            </label>
            <select
              value={localSettings.dateTimeFormat}
              onChange={handleDateTimeFormatChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                validationErrors.dateTimeFormat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {dateTimeFormatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {validationErrors.dateTimeFormat && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.dateTimeFormat}</p>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Preview: {formatDateTimeExample(now, localSettings.dateTimeFormat)}
            </div>
          </div>
        </div>
        {/* Quantity Decimal Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quantity Decimal</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantity Decimal Places
            </label>
            <select
              value={localSettings.quantityDecimalPlaces}
              onChange={handleQuantityDecimalChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {decimalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Preview: {formatQuantityExample(45.6789)}
            </p>
          </div>
        </div>

        {/* Cost Decimal Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cost Decimal</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cost Decimal Places
            </label>
            <select
              value={localSettings.costDecimalPlaces}
              onChange={handleCostDecimalChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {decimalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Preview: {formatAmountExample(45.6789)}
            </p>
          </div>
        </div>



        {/* Screen Logo Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Screen Logo</h2>
          </div>
        
          <div className="space-y-2">
            {localSettings.screenLogo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Logo</label>
                <img 
                  src={`${localSettings.screenLogo}?v=${imageVersion}`} 
                  alt="Current Screen Logo" 
                  className="w-32 h-32 object-cover rounded border" 
                />
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload New Screen Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenLogoChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {localSettings.screenLogoFile && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Preview:</p>
                <img src={URL.createObjectURL(localSettings.screenLogoFile)} alt="Preview Screen Logo" className="w-32 h-32 object-cover rounded border mt-1" />
              </div>
            )}
          </div>
        </div>
        {/* Report Logo Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report Logo</h2>
          </div>
        
          <div className="space-y-2">
            {localSettings.reportLogo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Logo</label>
                <img 
                  src={`${localSettings.reportLogo}?v=${imageVersion}`} 
                  alt="Current Report Logo" 
                  className="w-32 h-32 object-cover rounded border" 
                />
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload New Report Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleReportLogoChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {localSettings.reportLogoFile && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Preview:</p>
                <img src={URL.createObjectURL(localSettings.reportLogoFile)} alt="Preview Report Logo" className="w-32 h-32 object-cover rounded border mt-1" />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Settings Preview */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Current Settings Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Date Format:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {formatDateExample(now, localSettings.dateFormat)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Date Time Format:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {formatDateTimeExample(now, localSettings.dateTimeFormat)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Time Format:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {formatDateTimeExample(now, localSettings.timeFormat)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Currency:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{localSettings.currency}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Cost Format:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {formatAmountExample(123.456789)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Quantity Format:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {formatQuantityExample(45.6789)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">General Decimals:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {localSettings.decimalPlaces} places
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Comma Separator:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {localSettings.useCommaSeparator ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Recipe Modify:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {localSettings.recipeModify === 1 ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
      {/* Save and Reset Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={handleResetSettings}
          className="px-6 py-2 rounded-lg font-medium transition-colors bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Settings className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default ProjectSettingsConfiguration;