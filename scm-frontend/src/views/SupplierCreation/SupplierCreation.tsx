import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Plus,
  Edit,
  Search,
  Phone,
  Users,
  Lock,
  Briefcase,
  Database,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RiFileExcel2Fill } from "react-icons/ri";
import { CircleCheckBig } from 'lucide-react';
import { FaSave, FaChevronLeft, FaChevronRight, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { HiRefresh, HiViewList } from 'react-icons/hi';
import { Button, Tooltip } from "flowbite-react";
import Toastify, { showToast } from '../Toastify';
import SessionModal from '../SessionModal';
import { FaBoxes } from "react-icons/fa";
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
// ================== Types ==================
interface SupplierFormData {
  supplierId: string;
  supplierName: string;
  originSupplier: string;
  noOfDays: string;
  enableDiscount: boolean;
  discountPercentage: string;
  isRegistered: boolean;
  vatRegisteredNo: string;
  address1: string;
  address2: string;
  telephone: string;
  pager: string;
  mobile: string;
  fax: string;
  emailId: string;
  website: string;
  contactName: string;
  contactTelephone: string;
  contactMobile: string;
  contactEmail: string;
  contactName2: string;
  contactTelephone2: string;
  contactMobile2: string;
  contactEmail2: string;
  userId: string;
  password: string;
}
interface SupplierData {
  supplierPk: number;
  supplierId: string;
  supplierName: string;
  status: 'Active' | 'Inactive';
}
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  let paddingRight = 'pr-3';
  if (rightElement) {
    paddingRight = 'pr-16';
  } else if (isPassword) {
    paddingRight = 'pr-10';
  }
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {info && <InfoTooltip content={info} />}
      </div>
      <div className={`relative ${shake ? 'animate-shake' : ''}`}>
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          step={step}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none transition duration-150 ease-in-out disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${paddingRight} ${
            // Base border (thin, gray)
            !error ? 'border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' :
            // Error border (red, thin by default)
            error && !shake ? 'border border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' :
            // Error + Shake: thicker red border + red glow for emphasis
            error && shake ? 'border-2 border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 ring-2 ring-red-200/50 dark:ring-red-900/30 shadow-sm shadow-red-200/50 dark:shadow-red-900/30' : ''
          }`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightElement}
          </div>
        )}
        {isPassword && !rightElement && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
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
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  name: string;
  rows?: number;
  info?: string;
  maxLength?: number;
}) => {
  const remaining = maxLength !== undefined ? maxLength - value.length : null;
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
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
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out resize-none"
      />
      {maxLength !== undefined && (
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
          {remaining} characters remaining
        </div>
      )}
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
  options: string[];
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
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
// ================== Constants ==================
const initialFormData: SupplierFormData = {
  supplierId: '',
  supplierName: '',
  originSupplier: '',
  noOfDays: '',
  enableDiscount: false,
  discountPercentage: '',
  isRegistered: false,
  vatRegisteredNo: '',
  address1: '',
  address2: '',
  telephone: '',
  pager: '',
  mobile: '',
  fax: '',
  emailId: '',
  website: '',
  contactName: '',
  contactTelephone: '',
  contactMobile: '',
  contactEmail: '',
  contactName2: '',
  contactTelephone2: '',
  contactMobile2: '',
  contactEmail2: '',
  userId: '',
  password: '',
};
const originSupplierOptions = ['Local', 'GOC'];
const noOfDaysOptions = ['15', '30', '60', '90'];
const baseUrl =
  'http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/supplierMasterController';
const fieldInfo: Record<string, string> = {
  supplierId: 'Unique ID for supplier. Must be 1-15 characters.',
  supplierName: 'Full legal name of the supplier company.',
  originSupplier: 'Select whether the supplier is local or GOC.',
  noOfDays: 'Payment terms in days.',
  enableDiscount: 'Check if the supplier offers a discount on invoice.',
  discountPercentage: 'Discount percentage (0-100).',
  isRegistered: 'Check if the supplier is VAT registered.',
  vatRegisteredNo: 'VAT registration number (required if registered).',
  address1: 'Primary address line.',
  address2: 'Secondary address line (optional).',
  telephone: 'Main telephone number (10 digits).',
  pager: 'Pager number (alphanumeric).',
  mobile: 'Mobile number (10 digits).',
  fax: 'Fax number (alphanumeric, max 20 chars).',
  emailId: 'Primary email address.',
  website: 'Supplier website URL.',
  contactName: 'Name of primary contact person.',
  contactTelephone: 'Telephone number of primary contact (10 digits).',
  contactMobile: 'Mobile number of primary contact (10 digits).',
  contactEmail: 'Email address of primary contact.',
  contactName2: 'Name of secondary contact person.',
  contactTelephone2: 'Telephone number of secondary contact (10 digits).',
  contactMobile2: 'Mobile number of secondary contact (10 digits).',
  contactEmail2: 'Email address of secondary contact.',
  userId: 'Username for supplier portal access.',
  password: 'Password for supplier portal access.',
};
// ================== SupplierCreationForm Component ==================
interface SupplierCreationFormProps {
  formData: SupplierFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupplierFormData>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleReset: () => void;
  handleListClick: () => void;
  supplierIdError: string;
  supplierIdValid: boolean;
  handleSupplierIdCheck: () => void;
  supplierIdShake: boolean;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  isLoading?: boolean;
}
const tabs = [
  { title: 'Supplier Details', icon: Briefcase, tooltip: 'Enter supplier info including ID, name, origin, and payment terms.' },
  { title: 'Official Contact', icon: Phone, tooltip: 'Provide official address, phone numbers, email, and website.' },
  { title: 'Contact Persons', icon: Users, tooltip: 'Add up to two contact persons with their phone and email.' },
  { title: 'Supplier Login', icon: Lock, tooltip: 'Set login credentials for the supplier portal.' },
];
const SupplierCreationForm: React.FC<SupplierCreationFormProps> = ({
  formData,
  setFormData,
  handleInputChange,
  handleSubmit,
  handleReset,
  handleListClick,
  supplierIdError,
  supplierIdValid,
  handleSupplierIdCheck,
  supplierIdShake,
  activeTab,
  setActiveTab,
}) => {
  const getFieldError = (field: string, form: SupplierFormData): string | null => {
    switch (field) {
      case 'supplierId':
        if (!form.supplierId.trim()) return 'Supplier ID is required';
        if (form.supplierId.length < 1 || form.supplierId.length > 15) return 'Supplier ID must be 1-15 characters';
        return null;
      case 'supplierName':
        if (!form.supplierName.trim()) return 'Supplier Name is required';
        return null;
      case 'originSupplier':
        if (!form.originSupplier) return 'Origin Supplier is required';
        return null;
      case 'noOfDays':
        if (!form.noOfDays) return 'No of Days is required';
        return null;
      case 'emailId':
        if (!form.emailId.trim()) return 'Email ID is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId)) return 'Invalid Email ID format';
        return null;
      case 'vatRegisteredNo':
        if (form.isRegistered && !form.vatRegisteredNo.trim()) return 'VAT Register No is required when Is Registered is checked';
        return null;
      case 'discountPercentage':
        if (form.enableDiscount && form.discountPercentage.trim()) {
          const discountNum = parseFloat(form.discountPercentage);
          if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) return 'Discount % must be a number between 0 and 100';
        }
        return null;
      case 'telephone':
        if (form.telephone && !/^\d*$/.test(form.telephone)) return 'Telephone should contain only numbers';
        if (form.telephone && form.telephone.length !== 10) return 'Telephone must be exactly 10 digits';
        return null;
      case 'mobile':
        if (form.mobile && !/^\d*$/.test(form.mobile)) return 'Mobile should contain only numbers';
        if (form.mobile && form.mobile.length !== 10) return 'Mobile must be exactly 10 digits';
        return null;
      case 'contactTelephone':
        if (form.contactTelephone && !/^\d*$/.test(form.contactTelephone)) return 'Contact Telephone 1 should contain only numbers';
        if (form.contactTelephone && form.contactTelephone.length !== 10) return 'Contact Telephone 1 must be exactly 10 digits';
        return null;
      case 'contactMobile':
        if (form.contactMobile && !/^\d*$/.test(form.contactMobile)) return 'Contact Mobile 1 should contain only numbers';
        if (form.contactMobile && form.contactMobile.length !== 10) return 'Contact Mobile 1 must be exactly 10 digits';
        return null;
      case 'contactTelephone2':
        if (form.contactTelephone2 && !/^\d*$/.test(form.contactTelephone2)) return 'Contact Telephone 2 should contain only numbers';
        if (form.contactTelephone2 && form.contactTelephone2.length !== 10) return 'Contact Telephone 2 must be exactly 10 digits';
        return null;
      case 'contactMobile2':
        if (form.contactMobile2 && !/^\d*$/.test(form.contactMobile2)) return 'Contact Mobile 2 should contain only numbers';
        if (form.contactMobile2 && form.contactMobile2.length !== 10) return 'Contact Mobile 2 must be exactly 10 digits';
        return null;
      case 'pager':
        if (form.pager && !/^[a-zA-Z0-9]*$/.test(form.pager)) return 'Pager should contain only letters and numbers';
        return null;
      case 'contactEmail':
        if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) return 'Contact Email 1 is invalid';
        return null;
      case 'contactEmail2':
        if (form.contactEmail2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail2)) return 'Contact Email 2 is invalid';
        return null;
      default:
        return null;
    }
  };
  const isTabComplete = (tabIndex: number, form: SupplierFormData): boolean => {
    const fieldsByTab = [
      ['supplierId', 'supplierName', 'originSupplier', 'noOfDays', 'enableDiscount', 'discountPercentage', 'isRegistered', 'vatRegisteredNo'],
      ['address1', 'address2', 'telephone', 'pager', 'mobile', 'fax', 'emailId', 'website'],
      ['contactName', 'contactTelephone', 'contactMobile', 'contactEmail', 'contactName2', 'contactTelephone2', 'contactMobile2', 'contactEmail2'],
      ['userId', 'password']
    ];
    return fieldsByTab[tabIndex].every(field => getFieldError(field, form) === null);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <NormalInput
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleInputChange}
                label="Supplier Id"
                required
                info={fieldInfo.supplierId}
                error={supplierIdError}
                maxLength={15}
                shake={supplierIdShake}
                rightElement={
                  <div className="flex items-center gap-1">
                    {supplierIdValid && <FaCheckCircle className="w-4 h-4 text-green-500" />}
                    <button
                      type="button"
                      onClick={handleSupplierIdCheck}
                      className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Check
                    </button>
                  </div>
                }
              />
              <NormalInput
                id="supplierName"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                label="Supplier Name"
                required
                info={fieldInfo.supplierName}
              />
              <SelectField
                id="originSupplier"
                name="originSupplier"
                value={formData.originSupplier}
                onChange={handleInputChange}
                label="Origin Suppliers"
                options={originSupplierOptions}
                required
                info={fieldInfo.originSupplier}
              />
              <SelectField
                id="noOfDays"
                name="noOfDays"
                value={formData.noOfDays}
                onChange={handleInputChange}
                label="No Of Days"
                options={noOfDaysOptions}
                required
                info={fieldInfo.noOfDays}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableDiscount"
                      checked={formData.enableDiscount}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Discount On Invoice</span>
                  </label>
                  {fieldInfo.enableDiscount && <InfoTooltip content={fieldInfo.enableDiscount} />}
                </div>
                {formData.enableDiscount && (
                  <div className="w-full sm:w-48">
                    <NormalInput
                      id="discountPercentage"
                      name="discountPercentage"
                      type="text"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      label="Discount %"
                      info={fieldInfo.discountPercentage}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRegistered"
                      checked={formData.isRegistered}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Is Registered</span>
                  </label>
                  {fieldInfo.isRegistered && <InfoTooltip content={fieldInfo.isRegistered} />}
                </div>
                {formData.isRegistered && (
                  <div className="w-full sm:w-64">
                    <NormalInput
                      id="vatRegisteredNo"
                      name="vatRegisteredNo"
                      value={formData.vatRegisteredNo}
                      onChange={handleInputChange}
                      label="Vat Register No"
                      info={fieldInfo.vatRegisteredNo}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <NormalTextarea
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                label="Address1"
                info={fieldInfo.address1}
                maxLength={250}
              />
              <NormalTextarea
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                label="Address2"
                info={fieldInfo.address2}
                maxLength={250}
              />
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <NormalInput
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  label="Telephone"
                  info={fieldInfo.telephone}
                />
                <NormalInput
                  id="pager"
                  name="pager"
                  type="tel"
                  value={formData.pager}
                  onChange={handleInputChange}
                  label="Pager"
                  info={fieldInfo.pager}
                />
                <NormalInput
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  label="Mobile"
                  info={fieldInfo.mobile}
                />
                <NormalInput
                  id="fax"
                  name="fax"
                  type="tel"
                  value={formData.fax}
                  onChange={handleInputChange}
                  label="Fax"
                  info={fieldInfo.fax}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <NormalInput
                  id="emailId"
                  name="emailId"
                  type="email"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  label="Email ID"
                  required
                  info={fieldInfo.emailId}
                />
                <NormalInput
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  label="Website"
                  info={fieldInfo.website}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <NormalInput
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                label="Contact Person 1 Name"
                info={fieldInfo.contactName}
              />
              <NormalInput
                id="contactTelephone"
                name="contactTelephone"
                type="tel"
                value={formData.contactTelephone}
                onChange={handleInputChange}
                label="Telephone 1"
                info={fieldInfo.contactTelephone}
              />
              <NormalInput
                id="contactMobile"
                name="contactMobile"
                type="tel"
                value={formData.contactMobile}
                onChange={handleInputChange}
                label="Mobile 1"
                info={fieldInfo.contactMobile}
              />
              <NormalInput
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                label="Email 1"
                info={fieldInfo.contactEmail}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <NormalInput
                id="contactName2"
                name="contactName2"
                value={formData.contactName2}
                onChange={handleInputChange}
                label="Contact Person 2 Name"
                info={fieldInfo.contactName2}
              />
              <NormalInput
                id="contactTelephone2"
                name="contactTelephone2"
                type="tel"
                value={formData.contactTelephone2}
                onChange={handleInputChange}
                label="Telephone 2"
                info={fieldInfo.contactTelephone2}
              />
              <NormalInput
                id="contactMobile2"
                name="contactMobile2"
                type="tel"
                value={formData.contactMobile2}
                onChange={handleInputChange}
                label="Mobile 2"
                info={fieldInfo.contactMobile2}
              />
              <NormalInput
                id="contactEmail2"
                name="contactEmail2"
                type="email"
                value={formData.contactEmail2}
                onChange={handleInputChange}
                label="Email 2"
                info={fieldInfo.contactEmail2}
              />
            </div>
          </>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NormalInput
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              label="User ID"
              info={fieldInfo.userId}
            />
            <NormalInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              label="Password"
              info={fieldInfo.password}
            />
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 flex-1 min-h-0 w-full flex flex-col">
      {/* Tab bar - responsive */}
      <div className="flex mb-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isComplete = isTabComplete(index, formData);
          return (
            <button
              key={index}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === index
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{tab.title}</span>
              {isComplete && <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 ml-0.5 sm:ml-1 flex-shrink-0" />}
              <Tooltip content={tab.tooltip} placement="top">
                <FaInfoCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 ml-0.5 sm:ml-1 cursor-help flex-shrink-0" />
              </Tooltip>
            </button>
          );
        })}
      </div>
      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-1">
        <form id="supplierForm" onSubmit={handleSubmit} noValidate className="h-full">
          {renderTabContent()}
        </form>
      </div>
    </div>
  );
};
// ================== SupplierListView Component ==================
interface SupplierListViewProps {
  data: SupplierData[];
  onEditClick: (row: SupplierData) => void;
  onStatusChange: (row: SupplierData) => void;
  onExport: () => void;
  onAddClick: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}
const SupplierListView: React.FC<SupplierListViewProps> = ({
  data,
  onEditClick,
  onStatusChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pick<SupplierData, 'supplierId' | 'supplierName' | 'status'>;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;
  const handleSort = (key: 'supplierId' | 'supplierName' | 'status') => {
    setSortConfig((prev) => {
      if (prev && prev.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };
  const getSortEmoji = (key: 'supplierId' | 'supplierName' | 'status') => {
    if (!sortConfig || sortConfig.key !== key) return ' ↕️';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };
  const filteredSortedData = useMemo(() => {
    let filtered = data.filter(
      (row) =>
        searchTerm === '' ||
        row.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const key = sortConfig.key;
        let aVal = a[key];
        let bVal = b[key];
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);
  const totalRows = filteredSortedData.length;
  const totalPages = Math.ceil(totalRows / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRows = filteredSortedData.slice(startIndex, endIndex);
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig?.key, sortConfig?.direction]);
  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  return (
    <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 flex-1 min-h-0 w-full flex flex-col">
      <div className="flex-none flex items-end w-full justify-end mb-2">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-300" />
          </div>
          <input
            type="text"
            placeholder={`Search ${totalRows} records...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto h-full">
          <div className="min-w-[1000px] lg:min-w-full">
            <div className="overflow-auto max-h-full relative">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-600 dark:bg-blue-700">
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs select-none" style={{ width: '60px' }}>
                      S.No
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '140px' }} onClick={() => handleSort('supplierId')}>
                      <div className="flex items-center gap-1">
                        Supplier ID{getSortEmoji('supplierId')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '300px' }} onClick={() => handleSort('supplierName')}>
                      <div className="flex items-center gap-1">
                        Supplier Name{getSortEmoji('supplierName')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs cursor-pointer select-none" style={{ width: '120px' }} onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status{getSortEmoji('status')}
                      </div>
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs select-none" style={{ width: '160px' }}>
                      Change Status
                    </th>
                    <th className="px-1.5 py-2 text-left font-medium text-white uppercase text-xs select-none" style={{ width: '90px' }}>
                      Modify
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRows.length > 0 ? (
                    currentRows.map((row, index) => (
                      <tr key={row.supplierPk} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/20">
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white">
                          {row.supplierId}
                        </td>
                        <td className="px-1.5 py-2 align-top text-xs text-gray-900 dark:text-white break-words">
                          {row.supplierName}
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.status === 'Active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <Tooltip content="Toggle status">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={row.status === 'Active'}
                                onChange={() => onStatusChange(row)}
                              />
                              <div
                                className="
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
                                "
                              ></div>
                            </label>
                          </Tooltip>
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <Tooltip content="Edit supplier">
                            <button
                              onClick={() => onEditClick(row)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center">
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
      </div>
      {totalRows > 0 && (
        <div className="flex-none mt-3 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, totalRows)}</span> of{' '}
            <span className="font-medium">{totalRows}</span> records
            {searchTerm && (
              <span> for search: <span className="font-medium">"{searchTerm}"</span></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">
              {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded border text-xs transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                <FaChevronLeft className="w-2.5 h-2.5 inline mr-1" />
                Prev
              </button>
              <span className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded border text-xs transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                Next
                <FaChevronRight className="w-2.5 h-2.5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ================== Main SupplierCreation Component ==================
const SupplierCreation: React.FC = () => {
  const [viewMode, setViewMode] = useState<'form' | 'list'>('form');
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData);
  const [supplierIdError, setSupplierIdError] = useState('');
  const [supplierIdValid, setSupplierIdValid] = useState(false);
  const [supplierIdShake, setSupplierIdShake] = useState(false);
  const [data, setData] = useState<SupplierData[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<SupplierFormData>(initialFormData);
  const [editSupplierIdError, setEditSupplierIdError] = useState('');
  const [editSupplierIdValid, setEditSupplierIdValid] = useState(true);
  const [editSupplierIdShake, setEditSupplierIdShake] = useState(false);
  const [originalSupplierId, setOriginalSupplierId] = useState<string | undefined>(undefined);
  const [originalSupplierPk, setOriginalSupplierPk] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'add' | 'edit' | 'status' | 'export' | null>(null);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [targetSupplierId, setTargetSupplierId] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editActiveTab, setEditActiveTab] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowSessionModal(true);
      return false;
    }
    return true;
  }, []);
  const fetchSupplierList = useCallback(async () => {
    if (!checkAuth()) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/supplierList`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      const result = await res.json();
      if (result.success) {
        const mapped = result.data.map((item: any) => ({
          supplierPk: item.supplierPk,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          status: item.supplierStatus,
        })) as SupplierData[];
        setData(mapped);
      } else {
        showToast(result.message || 'Failed to fetch suppliers', 'error');
      }
    } catch (e) {
      showToast('Network error fetching suppliers', 'error');
      console.log(e);
      setShowSessionModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);
  const fetchView = useCallback(
    async (pk: number): Promise<SupplierFormData | null> => {
      if (!checkAuth()) return null;
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      setIsLoading(true);
      try {
        const res = await fetch(`${baseUrl}/supplierView/${pk}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setShowSessionModal(true);
          return null;
        }
        if (!res.ok) throw new Error('Failed to fetch supplier details');
        const result = await res.json();
        if (result.success) {
          const d = result.data;
          const discountNum = d.discountPer ? parseFloat(d.discountPer.toString()) : 0;
          const hasDiscount = !isNaN(discountNum) && discountNum > 0;
          return {
            supplierId: d.supplierId || '',
            supplierName: d.supplierName || '',
            originSupplier:
              d.originSuppliers === 'LOCAL' ? 'Local' : d.originSuppliers === 'GOC' ? 'GOC' : '',
            noOfDays: d.noOfDays?.toString() || '',
            enableDiscount: hasDiscount,
            discountPercentage: hasDiscount ? discountNum.toString() : '',
            isRegistered: !!d.registered,
            vatRegisteredNo: d.vatRegisteredNo || '',
            address1: d.address1 || '',
            address2: d.address2 || '',
            telephone: d.telePhoneNo || '',
            pager: d.pager || '',
            mobile: d.mobileNo || '',
            fax: d.faxNo || '',
            emailId: d.emailId || '',
            website: d.website || '',
            contactName: d.contactPerson1 || '',
            contactTelephone: d.contact1Telno || '',
            contactMobile: d.contact1Mobno || '',
            contactEmail: d.contact1Emailno || '',
            contactName2: d.contactPerson2 || '',
            contactTelephone2: d.contact2Telno || '',
            contactMobile2: d.contact2Mobno || '',
            contactEmail2: d.contact2Emailno || '',
            userId: d.userId || '',
            password: '',
          } as SupplierFormData;
        }
        return null;
      } catch (e) {
        setShowSessionModal(true);
        showToast('Network error fetching supplier details', 'error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [checkAuth]
  );
  const handleExportExcel = useCallback(async () => {
    if (!checkAuth()) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      showToast('Authentication token missing.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/download-supplier-report`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setShowSessionModal(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to download report');
      const blob = await res.blob();
      if (blob.type === 'text/csv' || blob.type === 'application/vnd.ms-excel') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'supplier-list-report.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Supplier report downloaded successfully.', 'success');
      } else {
        const text = await blob.text();
        if (text.includes('error') || text.includes('fail')) {
          throw new Error('Server returned an error');
        } else {
          const url = window.URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
          const a = document.createElement('a');
          a.href = url;
          a.download = 'supplier-list-report.csv';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          showToast('Supplier report downloaded successfully.', 'success');
        }
      }
    } catch (e) {
      setShowSessionModal(true);
      showToast('Failed to download report. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setConfirmAction(null);
      setConfirmType(null);
    }
  }, [checkAuth]);
  const showExportConfirmation = useCallback(() => {
    setConfirmType('export');
    setConfirmAction(() => handleExportExcel);
    setShowConfirm(true);
  }, [handleExportExcel]);
  const triggerShake = (isEdit = false) => {
    if (isEdit) {
      setEditSupplierIdShake(true);
      setTimeout(() => setEditSupplierIdShake(false), 500);
    } else {
      setSupplierIdShake(true);
      setTimeout(() => setSupplierIdShake(false), 500);
    }
  };
  const validateSupplierId = useCallback(
    async (id: string, isEdit = false, originalId?: string | null): Promise<boolean> => {
      if (!id.trim()) {
        const errorMsg = 'Supplier ID is required';
        if (isEdit) {
          setEditSupplierIdError(errorMsg);
          setEditSupplierIdValid(false);
          if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
          editTimeoutRef.current = setTimeout(() => {
            setEditSupplierIdError('');
            setEditSupplierIdValid(false);
          }, 2000);
        } else {
          setSupplierIdError(errorMsg);
          setSupplierIdValid(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setSupplierIdError('');
            setSupplierIdValid(false);
          }, 2000);
        }
        showToast(errorMsg, 'error');
        triggerShake(isEdit);
        return false;
      }
      if (id.length < 1 || id.length > 15) {
        const errorMsg = 'Supplier ID must be 1-15 characters.';
        if (isEdit) {
          setEditSupplierIdError(errorMsg);
          setEditSupplierIdValid(false);
          if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
          editTimeoutRef.current = setTimeout(() => {
            setEditSupplierIdError('');
            setEditSupplierIdValid(false);
          }, 2000);
        } else {
          setSupplierIdError(errorMsg);
          setSupplierIdValid(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setSupplierIdError('');
            setSupplierIdValid(false);
          }, 2000);
        }
        showToast(errorMsg, 'error');
        triggerShake(isEdit);
        return false;
      }
      if (isEdit && id === originalId) {
        setEditSupplierIdError('');
        setEditSupplierIdValid(true);
        return true;
      }
      if (!checkAuth()) return false;
      const token = localStorage.getItem('authToken');
      setIsLoading(true);
      try {
        const res = await fetch(`${baseUrl}/supplierId`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ supplierId: id }),
        });
        if (res.status === 401) {
          setShowSessionModal(true);
          showToast('Session expired. Please login again.', 'error');
          return false;
        }
        const result = await res.json();
        if (result.success) {
          if (isEdit) {
            setEditSupplierIdError('');
            setEditSupplierIdValid(true);
          } else {
            setSupplierIdError('');
            setSupplierIdValid(true);
          }
          showToast('Supplier ID is valid and available.', 'success');
          return true;
        } else {
          const errorMsg = result.message || 'Supplier ID already exists.';
          if (isEdit) {
            setEditSupplierIdError(errorMsg);
            setEditSupplierIdValid(false);
            if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
            editTimeoutRef.current = setTimeout(() => {
              setEditSupplierIdError('');
              setEditSupplierIdValid(false);
            }, 2000);
          } else {
            setSupplierIdError(errorMsg);
            setSupplierIdValid(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              setSupplierIdError('');
              setSupplierIdValid(false);
            }, 2000);
          }
          showToast(errorMsg, 'error');
          triggerShake(isEdit);
          return false;
        }
      } catch (e) {
        setShowSessionModal(true);
        const errorMessage = 'Network error validating Supplier ID. Please try again.';
        if (isEdit) {
          setEditSupplierIdError(errorMessage);
          setEditSupplierIdValid(false);
          if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
          editTimeoutRef.current = setTimeout(() => {
            setEditSupplierIdError('');
            setEditSupplierIdValid(false);
          }, 2000);
        } else {
          setSupplierIdError(errorMessage);
          setSupplierIdValid(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setSupplierIdError('');
            setSupplierIdValid(false);
          }, 2000);
        }
        showToast(errorMessage, 'error');
        triggerShake(isEdit);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [checkAuth]
  );
  const handleSupplierIdCheck = useCallback(async () => {
    if (formData.supplierId.trim()) {
      await validateSupplierId(formData.supplierId, false);
    } else {
      showToast('Please enter a Supplier ID', 'error');
      triggerShake(false);
    }
  }, [formData.supplierId, validateSupplierId]);
  const handleEditSupplierIdCheck = useCallback(async () => {
    if (editFormData.supplierId.trim()) {
      await validateSupplierId(editFormData.supplierId, true, originalSupplierId);
    } else {
      showToast('Please enter a Supplier ID', 'error');
      triggerShake(true);
    }
  }, [editFormData.supplierId, originalSupplierId, validateSupplierId]);
  const fieldOrder = [
    'supplierId',
    'supplierName',
    'originSupplier',
    'noOfDays',
    'emailId',
    'vatRegisteredNo',
    'discountPercentage',
    'telephone',
    'mobile',
    'contactTelephone',
    'contactMobile',
    'contactTelephone2',
    'contactMobile2',
    'pager',
    'contactEmail',
    'contactEmail2'
  ] as const;
  const getFieldError = (field: string, form: SupplierFormData): string | null => {
    switch (field) {
      case 'supplierId':
        if (!form.supplierId.trim()) return 'Supplier ID is required';
        if (form.supplierId.length < 1 || form.supplierId.length > 15) return 'Supplier ID must be 1-15 characters';
        return null;
      case 'supplierName':
        if (!form.supplierName.trim()) return 'Supplier Name is required';
        return null;
      case 'originSupplier':
        if (!form.originSupplier) return 'Origin Supplier is required';
        return null;
      case 'noOfDays':
        if (!form.noOfDays) return 'No of Days is required';
        return null;
      case 'emailId':
        if (!form.emailId.trim()) return 'Email ID is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId)) return 'Invalid Email ID format';
        return null;
      case 'vatRegisteredNo':
        if (form.isRegistered && !form.vatRegisteredNo.trim()) return 'VAT Register No is required when Is Registered is checked';
        return null;
      case 'discountPercentage':
        if (form.enableDiscount && form.discountPercentage.trim()) {
          const discountNum = parseFloat(form.discountPercentage);
          if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) return 'Discount % must be a number between 0 and 100';
        }
        return null;
      case 'telephone':
        if (form.telephone && !/^\d*$/.test(form.telephone)) return 'Telephone should contain only numbers';
        if (form.telephone && form.telephone.length !== 10) return 'Telephone must be exactly 10 digits';
        return null;
      case 'mobile':
        if (form.mobile && !/^\d*$/.test(form.mobile)) return 'Mobile should contain only numbers';
        if (form.mobile && form.mobile.length !== 10) return 'Mobile must be exactly 10 digits';
        return null;
      case 'contactTelephone':
        if (form.contactTelephone && !/^\d*$/.test(form.contactTelephone)) return 'Contact Telephone 1 should contain only numbers';
        if (form.contactTelephone && form.contactTelephone.length !== 10) return 'Contact Telephone 1 must be exactly 10 digits';
        return null;
      case 'contactMobile':
        if (form.contactMobile && !/^\d*$/.test(form.contactMobile)) return 'Contact Mobile 1 should contain only numbers';
        if (form.contactMobile && form.contactMobile.length !== 10) return 'Contact Mobile 1 must be exactly 10 digits';
        return null;
      case 'contactTelephone2':
        if (form.contactTelephone2 && !/^\d*$/.test(form.contactTelephone2)) return 'Contact Telephone 2 should contain only numbers';
        if (form.contactTelephone2 && form.contactTelephone2.length !== 10) return 'Contact Telephone 2 must be exactly 10 digits';
        return null;
      case 'contactMobile2':
        if (form.contactMobile2 && !/^\d*$/.test(form.contactMobile2)) return 'Contact Mobile 2 should contain only numbers';
        if (form.contactMobile2 && form.contactMobile2.length !== 10) return 'Contact Mobile 2 must be exactly 10 digits';
        return null;
      case 'pager':
        if (form.pager && !/^[a-zA-Z0-9]*$/.test(form.pager)) return 'Pager should contain only letters and numbers';
        return null;
      case 'contactEmail':
        if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) return 'Contact Email 1 is invalid';
        return null;
      case 'contactEmail2':
        if (form.contactEmail2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail2)) return 'Contact Email 2 is invalid';
        return null;
      default:
        return null;
    }
  };
  const validateFormSequential = (form: SupplierFormData): boolean => {
    for (const field of fieldOrder) {
      const error = getFieldError(field, form);
      if (error) {
        showToast(error, 'error');
        return false;
      }
    }
    return true;
  };
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type, checked } = e.target as any;
      let newValue = value;
      const numericFields = [
        'telephone',
        'mobile',
        'contactTelephone',
        'contactMobile',
        'contactTelephone2',
        'contactMobile2'
      ];
      if (numericFields.includes(name) && type !== 'checkbox') {
        newValue = value.replace(/\D/g, '');
        newValue = newValue.slice(0, 10);
      }
      if (name === 'fax' && type !== 'checkbox') {
        newValue = value.replace(/[^a-zA-Z0-9]/g, '');
        newValue = newValue.slice(0, 20);
      }
      if (name === 'pager' && type !== 'checkbox') {
        newValue = value.replace(/[^a-zA-Z0-9]/g, '');
      }
      if (name === 'discountPercentage' && type !== 'checkbox') {
        newValue = value.replace(/[^0-9.]/g, '');
        const parts = newValue.split('.');
        if (parts.length > 2) {
          newValue = parts[0] + '.' + parts.slice(1).join('');
        }
        if (newValue.length > 5) {
          newValue = newValue.slice(0, 5);
        }
      }
      if (name === 'supplierId' && type !== 'checkbox') {
        newValue = value.slice(0, 15);
      }
      if (type === 'checkbox') {
        if (name === 'enableDiscount') {
          setFormData((prev) => ({
            ...prev,
            enableDiscount: checked,
            ...(checked ? {} : { discountPercentage: '' }),
          }));
        } else if (name === 'isRegistered') {
          setFormData((prev) => ({
            ...prev,
            isRegistered: checked,
            ...(checked ? {} : { vatRegisteredNo: '' }),
          }));
        } else {
          setFormData((prev) => ({ ...prev, [name]: checked }));
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: newValue }));
      }
    },
    []
  );
  const handleEditInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type, checked } = e.target as any;
      let newValue = value;
      const numericFields = [
        'telephone',
        'mobile',
        'contactTelephone',
        'contactMobile',
        'contactTelephone2',
        'contactMobile2',
      ];
      if (numericFields.includes(name) && type !== 'checkbox') {
        newValue = value.replace(/\D/g, '');
        newValue = newValue.slice(0, 10);
      }
      if (name === 'fax' && type !== 'checkbox') {
        newValue = value.replace(/[^a-zA-Z0-9]/g, '');
        newValue = newValue.slice(0, 20);
      }
      if (name === 'pager' && type !== 'checkbox') {
        newValue = value.replace(/[^a-zA-Z0-9]/g, '');
      }
      if (name === 'discountPercentage' && type !== 'checkbox') {
        newValue = value.replace(/[^0-9.]/g, '');
        const parts = newValue.split('.');
        if (parts.length > 2) {
          newValue = parts[0] + '.' + parts.slice(1).join('');
        }
        if (newValue.length > 5) {
          newValue = newValue.slice(0, 5);
        }
      }
      if (name === 'supplierId' && type !== 'checkbox') {
        newValue = value.slice(0, 15);
      }
      if (type === 'checkbox') {
        if (name === 'enableDiscount') {
          setEditFormData((prev) => ({
            ...prev,
            enableDiscount: checked,
            ...(checked ? {} : { discountPercentage: '' }),
          }));
        } else if (name === 'isRegistered') {
          setEditFormData((prev) => ({
            ...prev,
            isRegistered: checked,
            ...(checked ? {} : { vatRegisteredNo: '' }),
          }));
        } else {
          setEditFormData((prev) => ({ ...prev, [name]: checked }));
        }
      } else {
        setEditFormData((prev) => ({ ...prev, [name]: newValue }));
      }
    },
    []
  );
  const handleSave = useCallback(
    async (form: SupplierFormData, isEdit = false) => {
      if (!checkAuth()) return;
      const discountNum = parseFloat(form.discountPercentage) || 0;
      const hasDiscount = discountNum > 0;
      const payload: any = {
        supplierId: form.supplierId,
        supplierName: form.supplierName,
        originSuppliers: form.originSupplier.toUpperCase(),
        noOfDays: parseInt(form.noOfDays) || 0,
        registered: form.isRegistered ? 1 : 0,
        vatRegisteredNo: form.isRegistered ? form.vatRegisteredNo : '',
        discountOnInvoice: hasDiscount ? 'Yes' : 'No',
        discountPer: hasDiscount ? discountNum : 0.0,
        address1: form.address1,
        address2: form.address2,
        telePhoneNo: form.telephone,
        faxNo: form.fax,
        mobileNo: form.mobile,
        pager: form.pager,
        emailId: form.emailId,
        website: form.website,
        contactPerson1: form.contactName,
        contact1Telno: form.contactTelephone,
        contact1Mobno: form.contactMobile,
        contact1Emailno: form.contactEmail,
        contactPerson2: form.contactName2,
        contact2Telno: form.contactTelephone2,
        contact2Mobno: form.contactMobile2,
        contact2Emailno: form.contactEmail2,
        userId: form.userId,
        password: form.password,
        currencyId: 'OMR',
        entityId: localStorage.getItem('entity') || 'ENT01',
        ct01: 0.0,
        ct02: 0.0,
        ct03: 0.0,
        ct04: 0.0,
        lastUser: parseInt(localStorage.getItem('userId') || '1'),
      };
      if (isEdit) {
        payload.disViewIcon = hasDiscount;
        if (originalSupplierPk) {
          payload.supplierPk = originalSupplierPk;
        }
      }
      const token = localStorage.getItem('authToken');
      const endpoint = isEdit ? '/supplierDataModify' : '/saveSupplierDetails';
      setIsLoading(true);
      try {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          setShowSessionModal(true);
          return;
        }
        const result = await res.json();
        if (result.success !== false) {
          showToast(`Supplier ${isEdit ? 'updated' : 'created'} successfully.`, 'success');
          if (viewMode === 'list') {
            fetchSupplierList();
          }
          if (!isEdit) {
            setFormData(initialFormData);
            setSupplierIdValid(false);
          } else {
            setShowEditModal(false);
            setOriginalSupplierId(undefined);
            setOriginalSupplierPk(null);
            setEditSupplierIdValid(true);
          }
        } else {
          const errorMessage = result.message || 'Save failed.';
          showToast(errorMessage, 'error');
        }
      } catch (e) {
        const errorMessage = 'Network error saving supplier.';
        showToast(errorMessage, 'error');
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
        setConfirmAction(null);
        setConfirmType(null);
      }
    },
    [viewMode, fetchSupplierList, originalSupplierPk, checkAuth]
  );
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supplierIdValid) {
        showToast('Please check and validate Supplier ID', 'error');
        return;
      }
      if (!validateFormSequential(formData)) {
        return;
      }
      setConfirmType('add');
      setConfirmAction(() => () => handleSave(formData, false));
      setShowConfirm(true);
    },
    [formData, handleSave, supplierIdValid]
  );
  const handleEditSave = useCallback(async () => {
    if (!editSupplierIdValid) {
      showToast('Please check and validate Supplier ID', 'error');
      return;
    }
    if (!validateFormSequential(editFormData)) {
      return;
    }
    setConfirmType('edit');
    setConfirmAction(() => () => handleSave(editFormData, true));
    setShowConfirm(true);
  }, [editFormData, handleSave, editSupplierIdValid]);
  const handleStatusChange = useCallback(
    (row: SupplierData) => {
      const pk = row.supplierPk;
      const newStatus = row.status === 'Active' ? 'I' : 'A';
      setTargetSupplierId(row.supplierId);
      setConfirmType('status');
      setConfirmAction(() => async () => {
        if (!checkAuth()) return;
        const token = localStorage.getItem('authToken');
        if (!token) {
          showToast('Authentication token missing.', 'error');
          return;
        }
        setIsLoading(true);
        try {
          const res = await fetch(`${baseUrl}/supplierStatusUpdate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ supplierPk: pk, supplierStatus: newStatus }),
          });
          if (res.status === 401) {
            setShowSessionModal(true);
            return;
          }
          const result = await res.json();
          if (result.success !== false) {
            showToast(result.message || 'Status updated successfully.', 'success');
            await fetchSupplierList();
            setShowEditModal(false);
          } else {
            showToast(result.message || 'Failed to update status', 'error');
          }
        } catch (e) {
          showToast('Network error updating status', 'error');
        } finally {
          setIsLoading(false);
          setShowConfirm(false);
          setConfirmAction(null);
          setConfirmType(null);
          setTargetSupplierId(null);
        }
      });
      setShowConfirm(true);
    },
    [fetchSupplierList, checkAuth]
  );
  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setSupplierIdError('');
    setSupplierIdValid(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  const handleListClick = useCallback(() => {
    setViewMode('list');
    if (data.length === 0) {
      fetchSupplierList();
    }
  }, [data.length, fetchSupplierList]);
  const handleAddClick = useCallback(() => {
    setViewMode('form');
    setFormData(initialFormData);
    setSupplierIdError('');
    setSupplierIdValid(false);
    setActiveTab(0);
  }, []);
  const handleEditClick = useCallback(
    async (row: SupplierData) => {
      setOriginalSupplierPk(row.supplierPk);
      setOriginalSupplierId(row.supplierId);
      const editData = await fetchView(row.supplierPk);
      if (editData) {
        setEditFormData(editData);
        setEditSupplierIdError('');
        setEditSupplierIdValid(true);
        setShowEditModal(true);
        setEditActiveTab(0);
      }
    },
    [fetchView]
  );
  const handleEditTabChange = useCallback((index: number) => {
    setEditActiveTab(index);
  }, []);
  useEffect(() => {
    if (viewMode === 'list' && data.length === 0) {
      fetchSupplierList();
    }
  }, [viewMode, data.length, fetchSupplierList]);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
    };
  }, []);
  const getConfirmButtonLabel = (type: 'add' | 'edit' | 'status' | 'export'): string => {
    switch (type) {
      case 'add': return 'Save';
      case 'edit': return 'Update';
      case 'status': return 'Update';
      case 'export': return 'Download';
      default: return 'Confirm';
    }
  };
  const editTabs = [
    { title: 'Supplier Details', icon: Briefcase, tooltip: 'Modify supplier basic information.' },
    { title: 'Official Contact', icon: Phone, tooltip: 'Update official contact details.' },
    { title: 'Contact Persons', icon: Users, tooltip: 'Edit contact persons information.' },
    { title: 'Supplier Login', icon: Lock, tooltip: 'Change login credentials.' },
  ];
  const isEditTabComplete = (tabIndex: number, form: SupplierFormData): boolean => {
    const fieldsByTab = [
      ['supplierId', 'supplierName', 'originSupplier', 'noOfDays', 'enableDiscount', 'discountPercentage', 'isRegistered', 'vatRegisteredNo'],
      ['address1', 'address2', 'telephone', 'pager', 'mobile', 'fax', 'emailId', 'website'],
      ['contactName', 'contactTelephone', 'contactMobile', 'contactEmail', 'contactName2', 'contactTelephone2', 'contactMobile2', 'contactEmail2'],
      ['userId', 'password']
    ];
    return fieldsByTab[tabIndex].every(field => getFieldError(field, form) === null);
  };
  const renderEditTabContent = () => {
    switch (editActiveTab) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <NormalInput
                id="edit-supplierId"
                name="supplierId"
                value={editFormData.supplierId}
                onChange={handleEditInputChange}
                label="Supplier Id"
                required
                disabled={true}
                info={fieldInfo.supplierId}
                error={editSupplierIdError}
                maxLength={15}
                shake={editSupplierIdShake}
                rightElement={
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleEditSupplierIdCheck}
                      className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Check
                    </button>
                    {editSupplierIdValid && <FaCheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                }
              />
              <NormalInput
                id="edit-supplierName"
                name="supplierName"
                value={editFormData.supplierName}
                onChange={handleEditInputChange}
                label="Supplier Name"
                required
                info={fieldInfo.supplierName}
              />
              <SelectField
                id="edit-originSupplier"
                name="originSupplier"
                value={editFormData.originSupplier}
                onChange={handleEditInputChange}
                label="Origin Suppliers"
                options={originSupplierOptions}
                required
                info={fieldInfo.originSupplier}
              />
              <SelectField
                id="edit-noOfDays"
                name="noOfDays"
                value={editFormData.noOfDays}
                onChange={handleEditInputChange}
                label="No Of Days"
                options={noOfDaysOptions}
                required
                info={fieldInfo.noOfDays}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableDiscount"
                      checked={editFormData.enableDiscount}
                      onChange={handleEditInputChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Discount On Invoice</span>
                  </label>
                  {fieldInfo.enableDiscount && <InfoTooltip content={fieldInfo.enableDiscount} />}
                </div>
                {editFormData.enableDiscount && (
                  <div className="w-full sm:w-48">
                    <NormalInput
                      id="edit-discountPercentage"
                      name="discountPercentage"
                      type="text"
                      value={editFormData.discountPercentage}
                      onChange={handleEditInputChange}
                      label="Discount %"
                      info={fieldInfo.discountPercentage}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRegistered"
                      checked={editFormData.isRegistered}
                      onChange={handleEditInputChange}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Is Registered</span>
                  </label>
                  {fieldInfo.isRegistered && <InfoTooltip content={fieldInfo.isRegistered} />}
                </div>
                {editFormData.isRegistered && (
                  <div className="w-full sm:w-64">
                    <NormalInput
                      id="edit-vatRegisteredNo"
                      name="vatRegisteredNo"
                      value={editFormData.vatRegisteredNo}
                      onChange={handleEditInputChange}
                      label="Vat Register No"
                      info={fieldInfo.vatRegisteredNo}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <NormalTextarea
                id="edit-address1"
                name="address1"
                value={editFormData.address1}
                onChange={handleEditInputChange}
                label="Address1"
                info={fieldInfo.address1}
                maxLength={250}
              />
              <NormalTextarea
                id="edit-address2"
                name="address2"
                value={editFormData.address2}
                onChange={handleEditInputChange}
                label="Address2"
                info={fieldInfo.address2}
                maxLength={250}
              />
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <NormalInput
                  id="edit-telephone"
                  name="telephone"
                  type="tel"
                  value={editFormData.telephone}
                  onChange={handleEditInputChange}
                  label="Telephone"
                  info={fieldInfo.telephone}
                />
                <NormalInput
                  id="edit-pager"
                  name="pager"
                  type="tel"
                  value={editFormData.pager}
                  onChange={handleEditInputChange}
                  label="Pager"
                  info={fieldInfo.pager}
                />
                <NormalInput
                  id="edit-mobile"
                  name="mobile"
                  type="tel"
                  value={editFormData.mobile}
                  onChange={handleEditInputChange}
                  label="Mobile"
                  info={fieldInfo.mobile}
                />
                <NormalInput
                  id="edit-fax"
                  name="fax"
                  type="tel"
                  value={editFormData.fax}
                  onChange={handleEditInputChange}
                  label="Fax"
                  info={fieldInfo.fax}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <NormalInput
                  id="edit-emailId"
                  name="emailId"
                  type="email"
                  value={editFormData.emailId}
                  onChange={handleEditInputChange}
                  label="Email ID"
                  required
                  info={fieldInfo.emailId}
                />
                <NormalInput
                  id="edit-website"
                  name="website"
                  type="url"
                  value={editFormData.website}
                  onChange={handleEditInputChange}
                  label="Website"
                  info={fieldInfo.website}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <NormalInput
                id="edit-contactName"
                name="contactName"
                value={editFormData.contactName}
                onChange={handleEditInputChange}
                label="Contact Person 1 Name"
                info={fieldInfo.contactName}
              />
              <NormalInput
                id="edit-contactTelephone"
                name="contactTelephone"
                type="tel"
                value={editFormData.contactTelephone}
                onChange={handleEditInputChange}
                label="Telephone 1"
                info={fieldInfo.contactTelephone}
              />
              <NormalInput
                id="edit-contactMobile"
                name="contactMobile"
                type="tel"
                value={editFormData.contactMobile}
                onChange={handleEditInputChange}
                label="Mobile 1"
                info={fieldInfo.contactMobile}
              />
              <NormalInput
                id="edit-contactEmail"
                name="contactEmail"
                type="email"
                value={editFormData.contactEmail}
                onChange={handleEditInputChange}
                label="Email 1"
                info={fieldInfo.contactEmail}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <NormalInput
                id="edit-contactName2"
                name="contactName2"
                value={editFormData.contactName2}
                onChange={handleEditInputChange}
                label="Contact Person 2 Name"
                info={fieldInfo.contactName2}
              />
              <NormalInput
                id="edit-contactTelephone2"
                name="contactTelephone2"
                type="tel"
                value={editFormData.contactTelephone2}
                onChange={handleEditInputChange}
                label="Telephone 2"
                info={fieldInfo.contactTelephone2}
              />
              <NormalInput
                id="edit-contactMobile2"
                name="contactMobile2"
                type="tel"
                value={editFormData.contactMobile2}
                onChange={handleEditInputChange}
                label="Mobile 2"
                info={fieldInfo.contactMobile2}
              />
              <NormalInput
                id="edit-contactEmail2"
                name="contactEmail2"
                type="email"
                value={editFormData.contactEmail2}
                onChange={handleEditInputChange}
                label="Email 2"
                info={fieldInfo.contactEmail2}
              />
            </div>
          </>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NormalInput
              id="edit-userId"
              name="userId"
              value={editFormData.userId}
              onChange={handleEditInputChange}
              label="User ID"
              info={fieldInfo.userId}
            />
            <NormalInput
              id="edit-password"
              name="password"
              type="password"
              value={editFormData.password}
              onChange={handleEditInputChange}
              label="Password"
              info={fieldInfo.password}
            />
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="max-h-screen w-full px-2 py-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-1 sm:p-1 transition-colors duration-300 flex flex-col">
      <style>{shakeAnimationStyle}</style>
      {showSessionModal && <SessionModal />}
      {/* Header based on view mode */}
      <div className="max-w-7xl mx-p-2 px-1 mb-2 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3">
          {viewMode === "form" ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <FaBoxes className="h-5 w-5" />
                Supplier Master
                <InfoTooltip content="Allows to create and manage the suppliers." />
              </h1>
              <div className="flex items-center gap-3">
                <Tooltip content="Save">
                  <Button
                    type="submit"
                    form="supplierForm"
                    className="w-10 h-10 p-0 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition"
                  >
                    <FaSave size={18} />
                  </Button>
                </Tooltip>
                <Tooltip content="Refresh">
                  <Button
                    color="warning"
                    size="xs"
                    onClick={handleReset}
                    className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition"
                  >
                    <HiRefresh className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="List">
                  <Button
                    color="primary"
                    size="xs"
                    onClick={handleListClick}
                    className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition"
                  >
                    <HiViewList className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-lg sm:text-xl font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <FaBoxes className="h-5 w-5" />
                Supplier List
                <InfoTooltip content="Displays the list of all suppliers and allows editing or status changes." />
              </h1>
              <div className="flex items-center gap-3">
                <Tooltip content="Add">
                  <button
                    onClick={handleAddClick}
                    className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-md hover:shadow-lg transition"
                  >
                    <Plus size={18} />
                  </button>
                </Tooltip>
                <Tooltip content="Excel">
                  <button
                    onClick={showExportConfirmation}
                    className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 rounded-full text-white shadow-md hover:shadow-lg transition"
                  >
                    <RiFileExcel2Fill size={18} />
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Main content */}
      {viewMode === 'form' ? (
        <SupplierCreationForm
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleReset={handleReset}
          handleListClick={handleListClick}
          supplierIdError={supplierIdError}
          supplierIdValid={supplierIdValid}
          handleSupplierIdCheck={handleSupplierIdCheck}
          supplierIdShake={supplierIdShake}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <SupplierListView
          data={data}
          onEditClick={handleEditClick}
          onStatusChange={handleStatusChange}
          onExport={showExportConfirmation}
          onAddClick={handleAddClick}
          onRefresh={fetchSupplierList}
        />
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl mx-auto max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-none p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  Modify Supplier
                </h2>
                <div className="flex space-x-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setOriginalSupplierId(undefined);
                      setOriginalSupplierPk(null);
                      setEditSupplierIdError('');
                      setEditSupplierIdValid(true);
                      if (editTimeoutRef.current) {
                        clearTimeout(editTimeoutRef.current);
                        editTimeoutRef.current = null;
                      }
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 transition-all shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="editForm"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <form
                id="editForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSave();
                }}
                noValidate
                className="h-full flex flex-col"
              >
                {/* Edit modal tabs - responsive */}
                <div className="flex mb-4 overflow-x-auto pb-1 px-4 sm:px-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {editTabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isComplete = isEditTabComplete(index, editFormData);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEditTabChange(index)}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                          editActiveTab === index
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{tab.title}</span>
                        {isComplete && <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 ml-0.5 sm:ml-1 flex-shrink-0" />}
                        <Tooltip content={tab.tooltip} placement="top">
                          <FaInfoCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 ml-0.5 sm:ml-1 cursor-help flex-shrink-0" />
                        </Tooltip>
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {renderEditTabContent()}
                </div>
              </form>
            </div>
          </div>
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
                Confirm {confirmType === 'add' ? 'Save' : confirmType === 'edit' ? 'Modify' : confirmType === 'status' ? 'Change Status' : 'Download'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                {confirmType === 'add'
                  ? 'Are you sure you want to save this new supplier?'
                  : confirmType === 'edit'
                  ? 'Are you sure you want to modify this supplier?'
                  : confirmType === 'status'
                  ? `Are you sure you want to change the status of ${targetSupplierId || 'this supplier'}?`
                  : 'Are you sure you want to download the supplier report?'}
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
                onClick={() => confirmAction?.()}
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
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}
      <Toastify />
    </div>
  );
};
export default SupplierCreation;