import { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { CalendarDays, ArrowDownToLine, X, ChevronLeft, ChevronRight, StickyNote } from "lucide-react";
import SessionModal from "src/views/SessionModal";
import CommonHeader from "../../CommonHeader";
import { Tooltip} from "flowbite-react";
export const showToast = (message: string, type: "success" | "error") => {
  if (type === "success") {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  } else {
    toast.error(message, {
      duration: 3000,
      position: 'top-right',
    });
  }
};

export default function IPASReportUI() {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showExpired, setShowExpired] = useState<boolean>(false);
  const [solomonOrOptimum, setSolomonOrOptimum] = useState(1);
  const [ipasOrReport, setIpasOrReport] = useState(0);
  const [invoiceORCreditNote, setInvoiceORCreditNote] = useState(0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const periodRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // --- Handle Click Outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Download handler ---
  const handleDownload = async () => {
    setLoading(true);
    const fromDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const token = localStorage.getItem('authToken');
    if (!token) {
      handleSessionExpired();
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://43.254.31.234:9070/api-gateway-scm/reports-service-scm/scmReportsController/ipassReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromDate,
          solomonOrOptimum,
          ipasOrReport,
          invoiceORCreditNote,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleSessionExpired();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        const jsonData = await response.json();
        if (!jsonData.success) {
          showToast('No data found for the selected criteria', 'error');
          setLoading(false);
          return;
        }
        // If success true but JSON, maybe unexpected, but proceed? Or error.
        // Assuming if JSON and success true, but probably API always returns file if success.
        // For safety, if JSON, and success false, error, else if success true but JSON, maybe error.
        throw new Error('Unexpected JSON response when expecting file');
      }

      const blob = await response.blob();
      
      // Check if the blob is empty
      if (blob.size === 0) {
        showToast('No data found for the selected criteria', 'error');
        setLoading(false);
        return;
      }

      const extension = ipasOrReport === 0 ? 'csv' : 'xlsx';
      const filename = `IPAS_Report_${fromDate.replace(/-/g, '_')}.${extension}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Report downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to Download', 'error');
      if (error.message.includes('401')) {
        handleSessionExpired();
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Handle session expiration ---
  const handleSessionExpired = () => {
    setShowExpired(true);
  };

  // --- Clear Form ---
  const handleClear = () => {
    setSelectedMonth(10);
    setSelectedYear(2025);
    setSolomonOrOptimum(1);
    setIpasOrReport(0);
    setInvoiceORCreditNote(0);
    showToast('Selections cleared', 'success');
  };

  const inputValue = `${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`;

  return (
    <div className="max-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col transition-all duration-300 p-2 sm:p-4">
      {/* Session Expired Modal */}
      {showExpired && (
        <SessionModal/>
      )}
      
      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                <ArrowDownToLine className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Download</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to download the IPAS Report for the selected criteria?
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

      {/* Header */}
      <CommonHeader
      title="IPAS Report"
              icon={<StickyNote className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />}
              />

      {/* Main Card */}
      <div className="bg-white max-h-[calc(100vh-12rem)] md:max-h-[calc(100vh-8rem)] dark:bg-gray-800 p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-md w-full max-w-6xl mx-auto overflow-y-auto">
        <div className="space-y-6 sm:space-y-8">
          {/* Period Picker */}
          <div className="w-full max-w-[300px] mx-auto">
            <div className="relative" ref={periodRef}>
              <input
                id="period"
                type="text"
                value={inputValue}
                readOnly
                onClick={() => setPeriodOpen(!periodOpen)}
                className="peer w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 
                  focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer bg-white dark:bg-gray-700
                  transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              />
              <label
                htmlFor="period"
                className="absolute left-3 top-2 text-gray-700 dark:text-gray-300 transition-all duration-200 pointer-events-none text-sm
                          peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:left-2 
                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-700 
                          peer-[:not(:placeholder-shown)]:px-1"
              >
                Period <span className="text-red-500">*</span>
              </label>
              <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />

              {periodOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-3">
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={() => setSelectedYear(selectedYear - 1)}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {selectedYear}
                    </span>
                    <button
                      onClick={() => setSelectedYear(selectedYear + 1)}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                      <div
                        key={month}
                        onClick={() => {
                          setSelectedMonth(index);
                          setPeriodOpen(false);
                        }}
                        className={`text-center py-2 rounded-md cursor-pointer text-xs sm:text-sm ${
                          selectedMonth === index
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Radio Cards in Single Row */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Solomon / Optimum Card */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 md:p-5 transition-all duration-300 hover:shadow-md">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                  System Selection
                </h3>
                <div className="space-y-2">
                  {['Solomon', 'Optimum'].map((name) => (
                    <label 
                      key={name} 
                      className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600/50 transition-colors duration-200"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="system"
                          checked={solomonOrOptimum === (name === 'Solomon' ? 0 : 1)}
                          onChange={() => setSolomonOrOptimum(name === 'Solomon' ? 0 : 1)}
                          className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 dark:border-gray-500"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Report Format Card */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 md:p-5 transition-all duration-300 hover:shadow-md">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                  Report Format
                </h3>
                <div className="space-y-2">
                  {['CSV Report', 'Excel Report'].map((name) => (
                    <label 
                      key={name} 
                      className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600/50 transition-colors duration-200"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="format"
                          checked={ipasOrReport === (name === 'CSV Report' ? 0 : 1)}
                          onChange={() => setIpasOrReport(name === 'CSV Report' ? 0 : 1)}
                          className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 dark:border-gray-500"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Document Type Card */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 md:p-5 transition-all duration-300 hover:shadow-md">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                  Document Type
                </h3>
                <div className="space-y-2">
                  {['Invoice', 'Credit Note'].map((name) => (
                    <label 
                      key={name} 
                      className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-600/50 transition-colors duration-200"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="type"
                          checked={invoiceORCreditNote === (name === 'Invoice' ? 0 : 1)}
                          onChange={() => setInvoiceORCreditNote(name === 'Invoice' ? 0 : 1)}
                          className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 dark:border-gray-500"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 gap-4 sm:gap-6">
           <Tooltip content='Download'> <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 
              text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95 "
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowDownToLine size={20} />
              )}
            </button></Tooltip>
            <Tooltip content='Clear'> <button
              type="button"
              onClick={handleClear}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
              text-white text-base sm:text-lg p-3 rounded-full shadow-lg transition-all duration-300 
              flex items-center justify-center hover:shadow-xl transform hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear selection"
            >
              <X size={20} />
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

          <Toaster
            position="top-right"
            toastOptions={{
              className: '',
              style: {
                background: '#363636',
                color: '#fff',
                zIndex: 999999,
              },
              duration: 4000,
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
            }}
          />
        </div>
      </div>
    </div>
  );
}