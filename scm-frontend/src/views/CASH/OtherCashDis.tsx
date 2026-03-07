import { Label, Radio, Textarea, Checkbox, Card, Select, Tooltip } from "flowbite-react";
import { useState, useEffect } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import {  HiRefresh, HiViewList, HiTrash, HiInformationCircle, HiPlus, HiSearch } from 'react-icons/hi';
import React from "react";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react';

// Define interfaces for the API response
export interface AccountData {
  itemAccountPk: number;
  accountId: string;
  accountName: string;
  accountType: string;
  availableCash: number;
  openingBalance: number;
  balance: number;
  status?: string;
  isSelected?: boolean;
}

export interface CashSummary {
  availableCash: number;
  openingBalance: number;
}

export interface AccountApiResponse {
  success: boolean;
  message: string;
  data: {
    accountList: AccountData[];
    cashSummary: CashSummary;
  };
}

export interface TableTypeDense {
  avatar?: any;
  name?: string;
  post?: string;
  pname?: string;
  teams: {
    id: string;
    color: string;
    text: string;
  }[];
  status?: string;
  statuscolor?: string;
  budget?: string;
  amount?: string;
}

import user1 from '/src/assets/images/profile/user-1.jpg';
import OtherCashTable from "./OtherCashTable";
import CalendarStockReceive from "../StockReceive/CalenderSrockReceive";
import { FaBoxOpen, FaBuilding, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaReceipt, FaSave, FaSearch, FaTruck, FaUser, FaWallet } from "react-icons/fa";
import SessionModal from "../SessionModal";

const columnHelper = createColumnHelper<TableTypeDense>();

const OtherCashDisbursement = () => {
  
  const [showTable, setShowTable] = useState(false);
  const [, setShowForm] = useState(true);
      const [sessionExpired, setSessionExpired] = useState(false);
      const [showSaveModal, setShowSaveModal] = useState(false);
  
  const [search, setSearch] = useState('');

  const [saving, setSaving] = useState(false);
  const [accountData, setAccountData] = useState<AccountData[]>([]);
  const [cashSummary, setCashSummary] = useState<CashSummary>({
    availableCash: 0,
    openingBalance: 0
  });
  const [calculatedBalance, setCalculatedBalance] = useState(0);
  const [pcvType, setPcvType] = useState<'payment' | 'receipt'>('payment');
  const [pcvDescription, setPcvDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
   
  
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [, setSelectedItems] = useState<AccountData[]>([]);
  const [, setLastAmount] = useState('');
  


  const stockPeriod = localStorage.getItem("stockPeriod");
  const token = localStorage.getItem("authToken");
    const formatPurchasePeriod = (periodString: string): string => {
    if (!periodString) return "No Period Set";

    try {
      const parts = periodString.split('-');
      if (parts.length !== 3) return periodString;

      const day = parts[0];
      const month = parts[1];
      const year = parts[2];

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const monthName = date.toLocaleString('default', { month: 'short' });
      return `${monthName} ${year}`;
    } catch (error) {
      setSessionExpired(true);
      console.error("Error formatting purchase period:", error);
      return periodString;
    }
  };
  const formatStockPeriod = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const [, month, year] = dateString.split('-');
      return `${month}-${year}`;
    } catch (error) {
      console.error('Error formatting stock period:', error);
      return dateString;
    }
  };

  const getFormattedPeriod = () => {
    if (!stockPeriod) return '';
    try {
      const [day, month, year] = stockPeriod.split('-');
      return `${day}-${month}-${year}`; // Return in DD-MM-YYYY format
    } catch (error) {
      console.error('Error formatting period:', error);
      return stockPeriod || '';
    }
  };
// Format date from DD-MM-YYYY to YYYY-MM-DD

  // Fetch account data when modal opens
  const fetchAccountData = async () => {
    const period = getFormattedPeriod();
    if (!period) {
      toast.error('No period found in local storage');
      return;
    }

   if (!token) {
      setSessionExpired(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get<AccountApiResponse>(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/otherCashDisbursementController/accountMasterList/${period}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
        if (response.status === 401) {
        setSessionExpired(true);
        return;
      }

      if (response.data.success) {
        const accounts = response.data.data.accountList.map(account => ({
          ...account,
          isSelected: false
        }));
        setAccountData(accounts);
        setCashSummary(response.data.data.cashSummary);
        setCalculatedBalance(response.data.data.cashSummary.availableCash);
        // toast.success('Account data loaded successfully');
      } else {
        toast.error(response.data.message || 'Failed to load account data');
      }
    } catch (error) {
      setSessionExpired(true);

      console.error('Error fetching account data:', error);
      toast.error('Error isLoading account data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  
  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);
  
  const [fromDate] = useState(() => {
    const offset = twoYearsAgo.getTimezoneOffset();
    const localDate = new Date(twoYearsAgo.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  });
  
  const [data, setData] = React.useState<TableTypeDense[]>([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});

  // Handle checkbox selection in modal
  const handleAccountSelect = (account: AccountData) => {
    // If already selected, deselect it
    if (account.isSelected) {
      const updatedAccounts = accountData.map(acc => 
        acc.itemAccountPk === account.itemAccountPk 
          ? { ...acc, isSelected: false }
          : acc
      );
      setAccountData(updatedAccounts);
      setSelectedAccount(null);
      setSelectedItems([]);
    } else {
      // Check if another account is already selected
      const alreadySelected = accountData.find(acc => acc.isSelected);
      if (alreadySelected) {
        toast.error('Only one account can be selected at a time');
        return;
      }
      
      // Select the new account
      const updatedAccounts = accountData.map(acc => 
        acc.itemAccountPk === account.itemAccountPk 
          ? { ...acc, isSelected: true }
          : { ...acc, isSelected: false }
      );
      setAccountData(updatedAccounts);
      setSelectedAccount(account);
      setSelectedItems([account]);
    }
  };

  // Calculate balance based on amount and PCV type - FIXED: Always use original API value
  const calculateBalance = (amount: string) => {
    const amountNum = parseFloat(amount) || 0;
    if (pcvType === 'payment') {
      // ALWAYS subtract from original available cash (from API)
      return cashSummary.availableCash - amountNum;
    } else {
      // ALWAYS add to original available cash (from API)
      return cashSummary.availableCash + amountNum;
    }
  };

  // Handle amount input change with continuous typing
 

  // Handle PCV type change - FIXED: Always recalculate from original API value
  const handlePcvTypeChange = (type: 'payment' | 'receipt') => {
    setPcvType(type);
    
    // Recalculate balance with current amount using original API value
    if (data.length > 0 && data[0].amount) {
      const currentAmount = data[0].amount;
      const newBalance = type === 'payment' 
        ? cashSummary.availableCash - parseFloat(currentAmount)
        : cashSummary.availableCash + parseFloat(currentAmount);
      setCalculatedBalance(newBalance);
    } else {
      // Reset to original available cash if no amount entered
      setCalculatedBalance(cashSummary.availableCash);
    }
  };

  // Handle PCV description change with character limit
  const handlePcvDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 250) {
      setPcvDescription(value);
    } else {
      toast.error('Maximum 250 characters allowed');
    }
  };

  // Add selected account to main table
  const handleAddAccount = () => {
    if (!selectedAccount) {
      toast.error('Please select an account');
      return;
    }

    // Update main table data
    const newRow: TableTypeDense = {
      avatar: user1,
      name: selectedAccount.accountId,
      post: selectedAccount.accountType,
      pname: selectedAccount.accountName,
      teams: [],
      status: "Delete",
      statuscolor: "danger",
      budget: selectedAccount.availableCash.toFixed(2),
      amount: ""
    };

    setData([newRow]);
    setOpenModal(false);
    toast.success('Account added successfully');
  };

  // Handle delete account from table
  const handleDeleteAccount = () => {
    setData([]);
    setSelectedAccount(null);
    setCalculatedBalance(cashSummary.availableCash);
    setPcvDescription('');
    setLastAmount('');
    
    // Deselect account in modal data
    const updatedAccounts = accountData.map(acc => ({
      ...acc,
      isSelected: false
    }));
    setAccountData(updatedAccounts);
    
    toast.success('Account removed');
  };

  // Filter accounts based on search
  const filteredAccounts = accountData.filter(account =>
    account.accountId.toLowerCase().includes(search.toLowerCase()) ||
    account.accountName.toLowerCase().includes(search.toLowerCase())
  );

  const defaultColumns = React.useMemo(() => [
    columnHelper.accessor("avatar", {
      cell: (info) => (
        <div className="flex items-center space-x-2 p-1">
        
          <div className="truncate max-w-32">
            <h6 className="text-sm font-medium">{info.row.original.name}</h6>
            {/* <p className="text-xs">{info.row.original.post}</p> */}
          </div>
        </div>
      ),
      header: () => <span>Account Id</span>,
    }),
    columnHelper.accessor("pname", {
      header: () => <span>Account Name</span>,
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
  columnHelper.display({
  id: 'amount',
  header: () => (
    <div className="text-center">
      <div>Amount</div>
    </div>
  ),
  cell: (info) => {
    // Create a local state for the input value
    const [inputValue, setInputValue] = React.useState(data[info.row.index]?.amount || '');
    
    // Update local state when data changes
    React.useEffect(() => {
      setInputValue(data[info.row.index]?.amount || '');
    }, [data, info.row.index]);
    
    const handleChange = (value: string) => {
      setInputValue(value);
      
      // Update the main data
      const updatedData = [...data];
      updatedData[info.row.index] = {
        ...updatedData[info.row.index],
        amount: value
      };
      setData(updatedData);
      
      // Calculate balance
      const newBalance = calculateBalance(value);
      setCalculatedBalance(newBalance);
    };
    
    return (
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0.000"
          className="w-24 px-2 py-1 border border-gray-300 rounded text-black text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          autoFocus={info.row.index === 0}
          onMouseEnter={(e) => {
            // Focus on hover
            e.currentTarget.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Optional: move to next field or submit
            }
          }}
        />
      </div>
    );
  },
}),
    columnHelper.accessor("status", {
      header: () => <span>Delete</span>,
      cell: () => (
        <Button 
          color="failure" 
          size="xs"
          onClick={handleDeleteAccount}
          className="flex items-center justify-center gap-1"
        >
      <HiTrash className="w-4 h-4 text-red-600" />
        
        </Button>
      ),
    }),
  ], [data, cashSummary.availableCash, accountData]);

  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleListClick = () => {
    setShowTable(true);
    setShowForm(false);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setShowTable(false);
    handleRefresh()
  };

  // Save function
 // Save function with API integration
// Save function with API integration
const handleSaveClick = () => {
  try {
    // Validate required fields
  if (!selectedAccount) {
    toast.error('Please select an account');
    return;
  }
    if (!token) {
      setSessionExpired(true);
      return;
    }

  if (!data[0]?.amount || parseFloat(data[0].amount) === 0) {
    toast.error('Please enter a valid amount');
    return;
  }

  if (pcvDescription.trim().length === 0) {
    toast.error('Please enter PCV description');
    return;
  }

  // Validate PCV Date
  if (!toDate) {
    toast.error('Please select a PCV Date');
    return;
  }

  // Get entityId and userFk from localStorage
  const entityId = localStorage.getItem('entity') || '';
  const userFk = parseInt(localStorage.getItem('userId') || '0');

  if (!entityId) {
    toast.error('Entity ID not found in localStorage');
    return;
  }

  if (!userFk || userFk === 0) {
    toast.error('User ID not found in localStorage');
    return;
  }


    // Show success message for validation passed


    // ALL VALIDATIONS PASSED - Now show the modal
    setShowSaveModal(true);
  } catch (error) {
      setSessionExpired(true);

    console.error("Error in validation:", error);
    toast.error("An error occurred during validation");
  }
};
const handleSave = async () => {

    setShowSaveModal(false);
  setSaving(true);
  // Validate PCV Date
 

  // Get entityId and userFk from localStorage


 

  setSaving(true);
    const entityId = localStorage.getItem('entity') || '';
  const userFk = parseInt(localStorage.getItem('userId') || '0');

  // Format date from DD-MM-YYYY to YYYY-MM-DD
  const formatDateForSave = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // If date is already in YYYY-MM-DD format, return as is
      if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
        return dateString;
      }
      
      // Convert from DD-MM-YYYY to YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        
        // Ensure year is 4 digits
        let fullYear = year;
        if (year.length === 2) {
          fullYear = `20${year}`; // Assuming 21st century
        }
        
        return `${fullYear}-${month}-${day}`;
      }
      
      return dateString;
    } catch (error) {
      setSessionExpired(true);

      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get period in YYYY-MM-01 format from stockPeriod
  const getPeriodFromStockPeriod = () => {
    const stockPeriod = localStorage.getItem("stockPeriod");
    if (!stockPeriod) {
      // Default to current month if stockPeriod not found
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}-01`;
    }
    
    try {
      const [, month, year] = stockPeriod.split('-');
      // Ensure year is 4 digits
      let fullYear = year;
      if (year.length === 2) {
        fullYear = `20${year}`;
      }
      return `${fullYear}-${month}-01`;
    } catch (error) {
      console.error('Error parsing stockPeriod:', error);
      // Fallback to current month
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}-01`;
    }
  };

  // Prepare data for API
  const amountValue = parseFloat(data[0].amount);
  
  const saveData = {
    pcvDate: formatDateForSave(toDate),
    period: getPeriodFromStockPeriod(),
    pcvDescription: pcvDescription.trim(),
    entityId: entityId,
    userFk: userFk,
   payment: pcvType === 'payment' ? 'Payment' : '',
receipt: pcvType === 'receipt' ? 'Receipt' : '',
    pcvType: pcvType === 'payment' ? 'Payment' : 'Receipt',
    subList: [
      {
        amount: amountValue,
        accountId: selectedAccount.itemAccountPk, // Use itemAccountPk as accountId
        accountName: selectedAccount.accountName
      }
    ]
  };

  console.log('Saving data:', saveData);

  try {
    // Make API call
          setIsLoading(true);

    const response = await axios.post(
      'http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/otherCashDisbursementController/pCVSave',
      saveData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

      if (response.status === 401 ) {
        setSessionExpired(true);
        return;
        
      }

    if (response.data.success) {
      toast.success(response.data.message || 'Saved successfully');
      
      // Reset form after successful save
      setData([]);
      setSelectedAccount(null);
      setPcvDescription('');
      setCalculatedBalance(cashSummary.availableCash);
      
      // Deselect account in modal data
      const updatedAccounts = accountData.map(acc => ({
        ...acc,
        isSelected: false
      }));
      setAccountData(updatedAccounts);
      
      // Optionally refresh account data
      await fetchAccountData();
    } else {
      toast.error(response.data.message || 'Failed to save');
    }
  } catch (error) {
      setSessionExpired(true);

    console.error('Error saving data:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data?.message || `Error: ${error.response.status}`);
      } else if (error.request) {
        // No response received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Request setup error
        toast.error('Error setting up request');
      }
    } else {
      toast.error('Error saving data');
    }
  } finally {
    setSaving(false);
          setIsLoading(false);

  }
};

  // Refresh function
 // Refresh function - clears all form fields
const handleRefresh = () => {
  // Clear main table data
  setData([]);
  
  // Clear selected account
  setSelectedAccount(null);
  
  // Clear PCV description
  setPcvDescription('');
  
  // Clear last amount
  setLastAmount('');
  
  // Reset balance to original available cash
  setCalculatedBalance(cashSummary.availableCash);
  
  // Reset PCV type to default 'payment'
  setPcvType('payment');
  
  // Reset PCV Date to current date
  const currentDate = new Date();
  const offset = currentDate.getTimezoneOffset();
  const localDate = new Date(currentDate.getTime() - offset * 60 * 1000);
  setToDate(localDate.toISOString().split('T')[0]);
  
  // Clear search
  setSearch('');
  
  // Deselect all accounts in modal
  const updatedAccounts = accountData.map(acc => ({
    ...acc,
    isSelected: false
  }));
  setAccountData(updatedAccounts);
  
  toast.success('Form refreshed');
};

 let content;

if (showTable) {
  content = <OtherCashTable onBack={handleAddClick} />;
} else {
  
  content = (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full mx-auto px-2 sm:px-3 md:px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-3 mb-2 mt-2">
        {/* Info Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
          {/* PCV No Card */}
          <Card className="bg-blue-50 border-l-8 border-blue-500 shadow-sm p-2 sm:p-3 h-auto min-h-[40px] sm:h-10 w-full">
            <div className="flex items-center h-full">
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg flex-shrink-0 mr-2 sm:mr-3">
                <FaReceipt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] font-medium text-black dark:text-white leading-tight">PCV No:</p>
                <div className="h-2"></div>
                <span className="text-[9px] sm:text-[11px] font-bold text-black dark:text-white leading-tight -mt-0.5 truncate"># Auto</span>
              </div>
            </div>
          </Card>

          {/* Period Card */}
          <Card className="bg-emerald-50 border-l-8 border-emerald-500 shadow-sm p-2 sm:p-3 h-auto min-h-[40px] sm:h-10 w-full">
            <div className="flex items-center h-full">
              <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-lg flex-shrink-0 mr-2 sm:mr-3">
                <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] font-medium text-black dark:text-white leading-tight">Period:</p>
                <div className="h-2"></div>
                <span className="text-[9px] sm:text-[11px] font-bold text-black dark:text-white leading-tight -mt-0.5 truncate">
                  {formatPurchasePeriod(stockPeriod || '')}
                </span>
              </div>
            </div>
          </Card>

          {/* Opening Cash Balance Card */}
          <Card className="bg-purple-50 border-l-8 border-purple-500 shadow-sm p-2 sm:p-3 h-auto min-h-[40px] sm:h-10 w-full">
            <div className="flex items-center h-full">
              <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg flex-shrink-0 mr-2 sm:mr-3">
                <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] font-medium text-black dark:text-white leading-tight">Opening Balance:</p>
                <div className="h-2"></div>
                <span className="text-[9px] sm:text-[11px] font-bold text-green-500 leading-tight -mt-0.5 truncate">
                  {cashSummary.openingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Available Cash Balance Card */}
          <Card className="border-l-8 border-amber-500 shadow-sm p-2 sm:p-3 h-auto min-h-[40px] sm:h-10 w-full">
            <div className="flex items-center h-full">
              <div className="p-1.5 bg-amber-500 rounded-lg flex-shrink-0 mr-2">
                <FaBuilding className="w-3 h-3 text-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[8px] sm:text-[10px] font-medium text-black dark:text-white leading-tight">Available Balance:</p>
                <div className="h-2"></div>
                <span className="text-[9px] sm:text-[11px] font-bold text-green-500 leading-tight -mt-0.5 truncate">
                  {calculatedBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 border border-gray-200">
          {/* PCV Type, Date, Account Button Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 flex-wrap lg:flex-nowrap">
            
            {/* PCV Type Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-white whitespace-nowrap">PCV Type <span className="text-red-500">*</span></label>
              <Select
                value={pcvType}
                onChange={(e) => handlePcvTypeChange(e.target.value)}
                className="w-28 sm:w-32"
              >
                <option value="payment">Payment</option>
                <option value="receipt">Receipt</option>
              </Select>
            </div>

            {/* PCV Date */}
            <div className="w-full sm:w-auto">
              <CalendarStockReceive
                id="toDate"
                label="PCV Date"
                required={true}
                selected={toDate ? new Date(toDate) : currentDate}
                onChange={(date) => {
                  if (date) {
                    const offset = date.getTimezoneOffset();
                    const localDate = new Date(date.getTime() - offset * 60 * 1000);
                    setToDate(localDate.toISOString().split('T')[0]);
                  } else {
                    setToDate('');
                  }
                }}
                placeholderText="dd-mm-yyyy"
                minDate={fromDate ? new Date(fromDate) : twoYearsAgo}
                maxDate={currentDate}
                className="w-full sm:w-48 md:w-56"
              />
            </div>

            {/* Select Account Button */}
            <div className="w-full sm:w-auto">
              <Button 
                onClick={() => setOpenModal(true)} 
                className="w-full sm:w-auto px-4 sm:px-6 whitespace-nowrap text-sm" 
                color="primary"
              >
                Select Account
              </Button>
            </div>

            {/* PCV Description */}
            <div className="flex-1 w-full lg:w-auto min-w-[200px] lg:min-w-[200px]">
              <div className="relative">
                <Textarea
                  id="message"
                  value={pcvDescription}
                  onChange={handlePcvDescriptionChange}
                  placeholder=" "
                  required
                  className="form-control-textarea rounded-md w-full pt-6 text-sm"
                  rows={1}
                />
                
                <label 
                  htmlFor="message" 
                  className={`absolute left-3 transition-all duration-200 pointer-events-none
                    ${pcvDescription ? 'text-[10px] sm:text-xs top-1' : 'text-sm sm:text-base top-3 text-gray-400'}`}
                >
                  PCV Description
                  <span className="text-red-500 ml-1">*</span>
                </label>
                
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-right absolute right-0 -bottom-5">
                  {pcvDescription.length}/250
                </div>
              </div>
            </div>
          </div>

          {/* Modal - EXACTLY AS PROVIDED - NO CHANGES */}
          <Modal
            show={openModal}
            onClose={() => {
              setSearch("");
              setOpenModal(false);
            }}
            size="6xl"
            className=""
          >
            <ModalHeader className="border-b border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 text-xs">
                  <FaBoxOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Account Details List
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-black dark:text-blue-300 rounded-full text-sm font-bold">
                    Total: {filteredAccounts.length}
                  </span>
                </div>
                <div className="flex space-x-2 lg:ml-120">
                  <Button
                    size="xs"
                    onClick={handleAddAccount}
                    disabled={!selectedAccount}
                    className="p-2.5 lg:ml-70 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
                    title="Add selected account"
                  >
                    <HiPlus className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-3 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Selected Account:
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-md font-bold">
                    {selectedAccount ? 1 : 0}
                  </span>
                </div>
                <div className="relative w-56">
                  <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150"
                    autoFocus
                  />
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 overflow-hidden focus:outline-none" tabIndex={0}>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] lg:min-w-full">
                    <table className="min-w-full table-fixed">
                      <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
                        <tr>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider w-16">
                            Select
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider w-24">
                            Account ID
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider w-48">
                            Account Name
                          </th>
                          <th className="px-2 py-1.5 text-left text-xs font-semibold text-white uppercase tracking-wider w-32">
                            Account Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span>Loading accounts...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredAccounts.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                              No accounts found
                            </td>
                          </tr>
                        ) : (
                          filteredAccounts.map((account, idx) => {
                            const isSelected = selectedAccount?.itemAccountPk === account.itemAccountPk;

                            return (
                              <tr
                                key={account.itemAccountPk}
                                onClick={() => handleAccountSelect(account)}
                                className={`
                                  bg-white dark:bg-gray-800
                                  hover:bg-gray-50 dark:hover:bg-gray-700
                                  cursor-pointer text-xs
                                  ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                                  ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-700/30"}
                                  transition-colors duration-150
                                `}
                              >
                                <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleAccountSelect(account)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                                  {account.accountId}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300 truncate">
                                  {account.accountName}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-gray-800 dark:text-gray-300">
                                  {account.accountType}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {filteredAccounts.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 text-xs">
                  <div className="text-gray-600 dark:text-gray-300">
                    Showing 1 to {filteredAccounts.length} of {filteredAccounts.length} accounts
                  </div>
                </div>
              )}
            </ModalBody>
          </Modal>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto mt-4">
          <div className="min-w-[800px] lg:min-w-full">
            <table className="w-full">
              <thead className="bg-blue-600 dark:bg-blue-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th 
                        key={header.id} 
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm font-semibold text-white uppercase whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-blue-50 dark:hover:bg-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50 bg-white dark:bg-gray-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td 
                          key={cell.id} 
                          className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                        >
                          <div className="flex items-center min-h-[30px] sm:min-h-[40px]">
                            <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={table.getAllColumns().length} className="px-3 py-4 sm:py-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-1 sm:mb-2">
                          <FaUser className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 dark:text-blue-500" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
                          {table.getRowModel().rows.length === 0 ? 'No Accounts Added' : 'No Matching Records'}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 max-w-md px-2">
                          {table.getRowModel().rows.length === 0 
                            ? 'Click "Select Account" button to add accounts to the list.' 
                            : `No accounts found matching "${search}"`}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              
              {table.getRowModel().rows.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-700 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                      Total:
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                      {table.getRowModel().rows.length} Accounts
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"></td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          
          {search && table.getRowModel().rows.length > 0 && (
            <div className="p-1.5 sm:p-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              Found {table.getRowModel().rows.length} of {data.length} records matching "{search}"
            </div>
          )}
          
          {data.length > 0 && table.getRowModel().rows.length === 0 && search && (
            <div className="p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center">
                <FaSearch className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400 dark:text-gray-500 mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm">No accounts found matching "{search}"</p>
                <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">Try adjusting your search term</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

return (
  <>
    <Toaster 
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: '',
        style: {
          background: '#363636',
          color: '#fff',
          zIndex: 999999,
        },
        success: {
          style: {
            background: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
        },
        duration: 3000,
      }}
    />
    
    <div className="w-full max-w-full mx-auto px-2 sm:px-3 md:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex justify-end gap-2 sm:gap-3 mb-1 sm:mb-2 w-full">
          {showTable ? (
            <div className="flex flex-wrap gap-2 mt-2"></div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-3 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Title Section with Info Icon */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <h1 className="text-base sm:text-lg md:text-xl font-semibold text-indigo-700 whitespace-normal break-words">
                    Other Cash Disbursement
                  </h1>
                  <Tooltip
                    content={
                      <div className="text-[10px] sm:text-xs max-w-xs">
                        <p className="font-semibold mb-1">Other Cash Disbursement</p>
                        <p>Record and manage cash payments for various expenses including:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li>Operating expenses</li>
                          <li>Petty cash transactions</li>
                          <li>Miscellaneous payments</li>
                          <li>Emergency disbursements</li>
                        </ul>
                      </div>
                    }
                    placement="bottom"
                    className="z-50"
                  >
                    <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none">
                      <HiInformationCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </button>
                  </Tooltip>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 justify-end">
                  <Tooltip content="Save" className="z-50" placement="bottom">
                    <Button
                      color="success"
                      size="sm"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      onClick={handleSaveClick}
                      disabled={saving || isLoading}
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      ) : (
                        <FaSave className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      )}
                    </Button>
                  </Tooltip>
                 
                  <Tooltip content="Refresh" className="z-50" placement="bottom">
                    <Button
                      color="warning"
                      size="sm"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                      onClick={handleRefresh}
                    >
                      <HiRefresh className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </Button>
                  </Tooltip>
                 
                  <Tooltip content="List" className="z-50" placement="bottom">
                    <Button
                      color="primary"
                      size="sm"
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-0 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      onClick={handleListClick}
                    >
                      <HiViewList className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {content}
      
      {/* Save confirmation modal - EXACTLY AS PROVIDED - NO CHANGES */}
      {showSaveModal && (
        <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)} size="md">
          <ModalHeader>Confirm Save</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center justify-center text-6xl text-blue-500 mb-4">
                <FaSave />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                Are you sure you want to save this Other Cash Disbursement record?
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button
              color="success"
              onClick={handleSave}
              disabled={saving}
              className="min-w-[100px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button
              color="gray"
              onClick={() => setShowSaveModal(false)}
              disabled={saving}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
      
      {sessionExpired && <SessionModal/>}

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg shadow-xl flex items-center gap-2 sm:gap-3 mx-3">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  </>
);
};

export default OtherCashDisbursement;