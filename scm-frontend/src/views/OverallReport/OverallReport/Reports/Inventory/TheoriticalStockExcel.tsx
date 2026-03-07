import React, { useState } from 'react';
import {
  StickyNote,
  ArrowDownToLine,
  
} from 'lucide-react';
import SessionModal from 'src/views/SessionModal';
import Toastify,{ showToast } from 'src/views/Toastify';
import CommonHeader from '../../CommonHeader';
import { Tooltip} from "flowbite-react";

const TheoriticalStockExcel: React.FC = () => {
  // --- State ---
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showExpired, setShowExpired] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  
  // --- Check authentication status ---
  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      console.log('Auth check failed', { hasToken: !!token, hasUserId: !!userId });
      return false;
    }
    return true;
  };

  // --- Handle session expiration ---
  const handleSessionExpired = () => {
    setShowExpired(true);
  };

 


  // --- Download Report ---
  const handleDownload = async () => {
    if (!checkAuth()) {
      handleSessionExpired();
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      handleSessionExpired();
      setLoading(false);
      return;
    }

    try {
      const apiUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/pythonReportController/theoreticalStockExcel`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      if (response.status === 500) {
        showToast('No records found for the selected criteria', 'error');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Check if response is Excel file
      const contentType = response.headers.get('content-type');
      if (contentType && (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || contentType.includes('application/vnd.ms-excel'))) {
        const blob = await response.blob();

        // Create and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Theoretical_Stock_Report.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Report downloaded successfully', 'success');
      } else {
        // Handle error response
        const errorText = await response.text();
        throw new Error(errorText || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      const errorMessage =  'Failed to Download';

      if (
        errorMessage.toLowerCase().includes('no record') ||
        errorMessage.toLowerCase().includes('no data') ||
        errorMessage.toLowerCase().includes('not found')
      ) {
        showToast('No records found for the selected criteria', 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 p-2 sm:p-4">
      {/* Toast Notifications */}
      <Toastify/>
      
      {/* Confirm Modal - Updated UI */}
      {showConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to download the Theoritical Stock Report?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleDownload();
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Downloading...
                  </div>
                ) : (
                  "Yes, Download"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Session Expired Modal */}
      {showExpired && (
      <SessionModal/>
      )}
      
      {/* Header */}
      <CommonHeader
      title="Theoritical Stock Report"
        icon={<StickyNote className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
        />
      
      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto">

        
        {/* Buttons */}
        <div className="flex justify-center mt-8 sm:mt-10 md:mt-12 gap-4 sm:gap-6">
         <Tooltip content='Download'> <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 
      dark:from-blue-700 dark:to-blue-800 
      hover:from-blue-700 hover:to-blue-800 
      dark:hover:from-blue-800 dark:hover:to-blue-900 
      text-white text-base sm:text-lg p-3 rounded-full 
      shadow-lg transition-all duration-300 
      flex items-center justify-center 
      hover:shadow-xl transform hover:scale-105 active:scale-95
      ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine size={20} />
            )}
          </button></Tooltip>

        </div>
        
        {/* Loading UI */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Loading...</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default TheoriticalStockExcel;