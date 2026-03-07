import React from 'react'
import { HiExclamationCircle } from 'react-icons/hi';

const SessionModal: React.FC = () => {
  
  const handleSessionExpired = (): void => {
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md 
                      transform transition-all duration-300 scale-95 hover:scale-100 
                      border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full 
                          flex items-center justify-center mb-4">
            <HiExclamationCircle className="text-red-600 dark:text-red-400 w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Session Expired
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Your session has ended. Please log in again to continue.
          </p>
        </div>

        {/* Body */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span>Your authentication token has expired</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>You'll be redirected to the login page</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSessionExpired}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                       dark:from-blue-700 dark:to-blue-800 text-white rounded-lg 
                       hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 
                       dark:hover:to-blue-900 transition-all duration-200 font-medium 
                       shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Go to Login
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Don’t worry, your selections will be saved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
