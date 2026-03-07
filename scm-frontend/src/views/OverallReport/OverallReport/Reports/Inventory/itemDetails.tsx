import React, { useState, useRef, useEffect } from "react";
import { FileText, ArrowDownToLine, X, Search } from "lucide-react";
import Toastify,{ showToast } from "src/views/Toastify";
import SessionModal from "src/views/SessionModal";
import CommonHeader from "../../CommonHeader";
import { Tooltip} from "flowbite-react";
interface Family {
  pk: number;
  familyId: string; 
  familyName: string; 
}

const ItemDetails: React.FC = () => {
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [familyName, setFamilyName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState<boolean>(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);

  const familyRef = useRef<HTMLDivElement>(null);

  // Fetch families from API
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoadingFamilies(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        if (isTokenExpired(token)) {
          handleSessionExpired();  
          throw new Error('Session expired');
        }

        const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController/dropDownFamilyIdByTheoreticalStockReport', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.statusText=='Unauthorized') {
          handleSessionExpired();
          throw new Error('Session expired - Unauthorized');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Map response data to Family interface
          showToast('Families Dropdown loaded','success')
          const mappedFamilies: Family[] = result.data.map((item: any) => ({
            pk: item.pk,
            familyId: item.itemCode || '',
            familyName: item.name || ''
          })).filter((family: Family) => family.familyId && family.familyName); // Filter valid entries
          setFamilies(mappedFamilies);
        } else {
          throw new Error(result.message || 'Failed to fetch families');
        }
      } catch (err) {
        console.error('Error fetching families:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load families';
        showToast(errorMessage, 'error');
        handleSessionExpired();
      } finally {
        setLoadingFamilies(false);
      }
    };

    fetchFamilies();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (familyRef.current && !familyRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered dropdown options based on search term
  const filteredFamilies = families.filter((family) =>
    `${family.familyId} ${family.familyName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format family for display (FamilyID + FamilyName)
  const formatFamilyDisplay = (family: Family): string => {
    return `${family.familyId} ${family.familyName}`;
  };

  // Function to extract family ID from selected family string
  const extractFamilyId = (familyDisplay: string): string => {
    const match = familyDisplay.match(/^[A-Z0-9]+/);
    return match ? match[0] : "";
  };

  // Function to get family ID from selected family
  const getSelectedFamilyId = (): string => {
    if (!selectedFamily) return "";
    
    // Find the actual family object to get the correct familyId
    const selectedFamilyObj = families.find(family => 
      formatFamilyDisplay(family) === selectedFamily
    );
    
    return selectedFamilyObj ? selectedFamilyObj.familyId : extractFamilyId(selectedFamily);
  };

  // Function to get selected family name
  const getSelectedFamilyName = (): string => {
    if (!selectedFamily) return "";
    
    const selectedFamilyObj = families.find(family => 
      formatFamilyDisplay(family) === selectedFamily
    );
    
    return selectedFamilyObj ? selectedFamilyObj.familyName : familyName;
  };

  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Function to handle session expiration
  const handleSessionExpired = () => {
    setShowSessionExpiredModal(true);
  };



  // Function to download the file (UPDATED: Include family name in filename)
  const downloadFile = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!token) {
        handleSessionExpired();
        throw new Error('Authentication token not found');
      }

      if (isTokenExpired(token)) {
        handleSessionExpired();
        throw new Error('Session expired');
      }

      if (!userId) {
        throw new Error('User ID not found');
      }

      let apiUrl: string;

      // Determine which API to use based on family selection
      if (selectedFamily) {
        const familyId = getSelectedFamilyId();
        if (!familyId) {
          throw new Error('Invalid family format');
        }
        apiUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController/listOfItemDetailsReportByFamilyIdBased/${familyId}/${userId}`;
      } else {
        apiUrl = `http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController/listOfItemDetailsReport/${userId}`;
      }

      console.log('Fetching from:', apiUrl); 
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleSessionExpired();
        throw new Error('Session expired - Unauthorized');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Check content-type to handle JSON vs. file responses
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        // Parse as JSON (handles "no records found" cases)
        const result = await response.json();
        if (!result.success && result.message) {
          // Specific handling for no data - show friendly toast, no file download
          const noDataMessage = result.message.includes('no record') || result.message.includes('No records') 
            ? 'No records found for the selected family.' 
            : result.message;
          showToast(noDataMessage, 'error');
          return; // Exit early, no download
        } else {
          throw new Error(result.message || 'Unexpected JSON response');
        }
      }

      // If not JSON, treat as file blob
      const blob = await response.blob();
      
      console.log('Blob size:', blob.size, 'Blob type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('No file content received - empty file');
      }

      // Determine the file extension (default to PDF)
      let fileExtension = '.pdf';
      if (contentType) {
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
          fileExtension = '.xlsx';
        } else if (contentType.includes('pdf')) {
          fileExtension = '.pdf';
        } else if (contentType.includes('csv')) {
          fileExtension = '.csv';
        }
      }

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Get filename from response headers or use default (UPDATED: Include family name)
      const contentDisposition = response.headers.get('content-disposition');
      let filename = selectedFamily 
        ? `ItemDetails-${getSelectedFamilyId()}-${getSelectedFamilyName().replace(/[^a-zA-Z0-9]/g, '_')}${fileExtension}`
        : `ItemDetails-AllFamilies${fileExtension}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);

      console.log('File download initiated:', filename);
      showToast('File downloaded successfully!', 'success');

    } catch (err) {
      console.error('Download error:', err);
      const errorMessage ='Failed to download';
      if (!errorMessage.includes('Session expired') && !errorMessage.includes('Unauthorized')) {
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setSelectedFamily("");
    setSearchTerm("");
    setFamilyName("");
    setError("");
    console.log('All selections cleared');
  };

  // Function to handle download confirmation
  const handleDownloadConfirm = () => {
    setShowConfirmModal(false);
    downloadFile();
  };

  // Function to handle download cancellation
  const handleDownloadCancel = () => {
    setShowConfirmModal(false);
  };

  // Function to get modal message based on selection
  const getModalMessage = () => {
    if (selectedFamily && familyName) {
      return `Are you sure you want to download the Item Details report for ${familyName}?`;
    } else {
      return `Are you sure you want to download the Item Details report for all families?`;
    }
  };

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-4 transition-all duration-300">
      {/* Toastify */}
      <Toastify/>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              {getModalMessage()}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={handleDownloadCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadConfirm}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base order-1 sm:order-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Downloading...
                  </div>
                ) : (
                  'Yes, Download'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Session Expired Modal */}
      {showSessionExpiredModal && (
              <SessionModal/>
            )}

      {/* Header */}
      
      <CommonHeader
      title="Item Details Report"
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
              />

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto flex-1">
       

        {/* Form Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4 sm:gap-6 mb-8">
          {/* Family Dropdown with Search - Swapped to first position */}
          <div className="flex flex-col w-full lg:w-1/3 relative" ref={familyRef}>
            <input
              id="family"
              type="text"
              value={selectedFamily}
              placeholder={selectedFamily}
              readOnly
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={loadingFamilies}
              className="peer w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-700 dark:text-gray-300 
                focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="family"
              className="absolute left-4 top-3 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                        peer-[:not(:placeholder-shown)]:px-1"
            >
              Family ID <sup className="text-red-500">*</sup>
            </label>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none transform transition-transform duration-200">▾</span>

            {dropdownOpen && !loadingFamilies && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input
                      type="text"
                      
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-500 rounded-lg px-3 pl-10 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
                <ul className="max-h-38 sm:max-h-60 overflow-y-auto">
                  {filteredFamilies.length > 0 ? (
                    filteredFamilies.map((family) => (
                      <li
                        key={family.pk}
                        onClick={() => {
                          setSelectedFamily(formatFamilyDisplay(family));
                          setFamilyName(family.familyName); // Auto-fill family name
                          setDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors duration-200"
                      >
                        <div className="font-medium text-gray-500 dark:text-gray-200 text-sm sm:text-base">{family.familyId} - {family.familyName}</div>
            
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-gray-500 dark:text-gray-400 text-sm text-center">
                      No families found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Family Name Input Box - Replaced period picker */}
          <div className="flex flex-col w-full lg:w-1/3 relative">
            <input
              id="familyName"
              type="text"
              value={familyName}
    
              onChange={(e) => setFamilyName(e.target.value)}
              className="peer w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-700 dark:text-gray-300 
                focus:ring-2 focus:ring-blue-400 outline-none 
                transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500
                bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <label
              htmlFor="familyName"
              className="absolute left-4 top-3 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                        peer-[:not(:placeholder-shown)]:px-1"
            >
              Family Name
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 md:gap-6 pt-4">
          <Tooltip content='Download'><button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading || loadingFamilies}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
              text-white text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 
              ${loading || loadingFamilies ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Download report"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine size={20} />
            )}
          </button></Tooltip>

          <Tooltip content='Clear'><button
            type="button"
            onClick={handleClearAll}
            disabled={loading || loadingFamilies}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
              text-white text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear selection"
          >
            <X size={20} />
          </button></Tooltip>
        </div>

        {/* Loading indicator */}
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

export default ItemDetails;