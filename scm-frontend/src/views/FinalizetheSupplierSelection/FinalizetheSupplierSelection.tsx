import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { Modal, ModalBody, ModalFooter, Card, Tooltip, Badge } from "flowbite-react";
import { FaSave, FaMapPin, FaChevronDown, FaCalendarAlt, FaMapMarkerAlt, FaBoxOpen } from "react-icons/fa";
import { HiArrowRight, HiInformationCircle, HiRefresh, HiSearch } from "react-icons/hi";
import { Calendar } from "lucide-react";
import SessionModal from "../SessionModal";

export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  status?: string;
  statuscolor?: string;
  budget?: string;
  name?: string;
  post?: string;
  pname?: string;
  isSelected?: boolean;
  totalQty?: string;
  quantities?: { [key: string]: string };
}

const FinalizetheSupplierSelection = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get tender period from localStorage
  const tenderPeriodStr = localStorage.getItem("tenderPeriod");
  let periodDate: Date;
  let requestPeriod: string;
  let periodYear: number;
  let periodMonth: number;
  if (tenderPeriodStr) {
    const [day, month, year] = tenderPeriodStr.split('-').map(Number);
    periodDate = new Date(year, month - 1, day);
    requestPeriod = periodDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    periodYear = year;
    periodMonth = month;
  } else {
    periodDate = new Date();
    requestPeriod = periodDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    periodYear = periodDate.getFullYear();
    periodMonth = periodDate.getMonth() + 1;
  }

  useEffect(() => {
    if (!tenderPeriodStr) {
      toast.error("Tender period not found in localStorage.", { duration: 3000, position: 'top-right' });
    }
  }, [tenderPeriodStr]);

  /* ────────────────────── MEMOIZED FILTERS ────────────────────── */
  // Add placeholder option at the top
  const locationOptions = useMemo(() => {
    const placeholder = {
      name: "Select location",
      pk: "select-location",
      locationId: "",
    };
    return [placeholder, ...locations];
  }, [locations]);

  const filteredOptions = useMemo(
    () =>
      locationOptions.filter((loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase())
      ),
    [locationOptions, search]
  );

  /* ────────────────────── API CALLS ────────────────────── */
  const fetchLocations = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setSessionExpired(true);
      return;
    }
    if (!tenderPeriodStr) {
      return;
    }
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadConsolidationLocReqForNp/${tenderPeriodStr}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (data.success) setLocations(data.data);
      else toast.error(data.message || "Failed to fetch locations.", { duration: 3000, position: 'top-right' });
    } catch (err) {
      setSessionExpired(true);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  /* ────────────────────── HANDLERS ────────────────────── */
  const handleSelect = (loc: any) => {
    if (loc.pk === "select-location") {
      setSelectedLocation("");
      setSelectedLocationName("");
    } else {
      setSelectedLocation(loc.name);        // assuming consolidationId is the name
      setSelectedLocationName(loc.name);    // store for display
    }
    setIsOpen(false);
    setSearch("");
  };

  const handleFinalizeButton = () => {
    if (!selectedLocation) {
      toast.error("Please select a location.", { duration: 3000, position: 'top-right' });
      return;
    }
    setShowConfirm(true);
  };

  const performFinalize = async () => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token) {
      setSessionExpired(true);
      return;
    }
    if (!userId) {
      toast.error("User ID not found. Please log in again.", { duration: 3000, position: 'top-right' });
      setIsLoading(false);
      setShowConfirm(false);
      return;
    }

    const payload = {
      consolidationId: selectedLocation,
      period: `${periodYear}-${String(periodMonth).padStart(2, "0")}-01`,
      lastActBy: Number(userId),
    };

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/finalizeTheSupplierSelection",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.status === 401) {
        setSessionExpired(true);
        return;
      }
      if (data.success) {
        toast.success(data.message, { duration: 3000, position: 'top-right' });
        refresh();
        await fetchLocations();
      } else {
        toast.error(data.message || "Failed to save.", { duration: 3000, position: 'top-right' });
      }
    } catch (err) {
      setSessionExpired(true);
      toast.error("Error saving data. Please try again.", { duration: 3000, position: 'top-right' });
      console.error(err);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const refresh = () => {
    setIsOpen(false);
    setSearch("");
    setSelectedLocation("");
    setSelectedLocationName("");
  };

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-3">
        {/* Header with title and quick tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-indigo-400">
                Finalize the Supplier Selection
              </h1>
              <Tooltip
                content={
                  <div className="text-xs max-w-xs">
                    <p className="font-semibold mb-1">Quick Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select a consolidation ID from the dropdown</li>
                      <li>Click the arrow button to finalize</li>
                      <li>Confirm the action in the dialog</li>
                    </ol>
                  </div>
                }
                placement="bottom"
                className="dark:bg-gray-800 dark:text-white z-50"
              >
                <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  <HiInformationCircle className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Tooltip content="Refresh page" placement="bottom" className="dark:bg-gray-800 dark:text-white">
                <button
                  onClick={refresh}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 transition-all duration-200 hover:scale-110"
                >
                  <HiRefresh className="w-4 h-4 text-white" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Period and Dropdown Section */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Period Display with Calendar Icon */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-xs border border-gray-200 dark:border-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Period:</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {requestPeriod}
                  </span>
                  <Tooltip
                    content="Tender period derived from your selection"
                    placement="top"
                    className="dark:bg-gray-800 dark:text-white z-50"
                  >
                    <HiInformationCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help ml-0.5" />
                  </Tooltip>
                </div>
              </div>

              {/* Enhanced Location Dropdown */}
              <div ref={supplierDropdownRef} className="relative w-full sm:w-72">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-full px-2 py-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                    selectedLocation
                      ? 'border-blue-500 shadow-sm'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`p-1 rounded-full ${selectedLocation ? 'bg-blue-100 dark:bg-blue-900' : 'bg-blue-100 dark:bg-blue-700'}`}>
                      <FaBoxOpen className={`w-3.5 h-3.5 ${selectedLocation ? 'text-blue-600' : 'text-blue-500'}`} />
                    </div>
                    <div className="truncate text-left">
                      <span className={`text-xs font-medium truncate ${selectedLocation ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {selectedLocationName || "Select consolidation ID"}
                      </span>
                    </div>
                  </div>
                  <FaChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search locations..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {(() => {
                        let realIndex = 0;
                        return filteredOptions.map((loc) => {
                          const isPlaceholder = loc.pk === "select-location";
                          const displayNumber = isPlaceholder ? null : ++realIndex;
                          return (
                            <div
                              key={loc.pk || loc.name}
                              className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                              onClick={() => handleSelect(loc)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      selectedLocation === loc.name
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"
                                    }`}
                                  >
                                    {isPlaceholder ? (
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>
                                    ) : (
                                      <span className="text-xs">{displayNumber}</span>
                                    )}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {loc.name}
                                  </div>
                                </div>
                                {selectedLocation === loc.name && (
                                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                      {filteredOptions.length === 0 && (
                        <div className="px-4 py-8 text-center">
                          <div className="text-4xl mb-2">🔍</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">No locations found</p>
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-500 text-center">
                        {filteredOptions.length} location{filteredOptions.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Finalize Button */}
              <button
                className={`h-10 w-10 rounded-lg flex justify-center items-center bg-green-500 dark:bg-green-600 text-white transition-all duration-200 ${
                  isLoading || !selectedLocation ? 'opacity-50 cursor-not-allowed dark:opacity-60' : 'hover:bg-green-600 dark:hover:bg-green-700 hover:scale-110'
                }`}
                disabled={isLoading || !selectedLocation}
                onClick={handleFinalizeButton}
              >
                <HiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional info area – could display selected location summary */}
          {selectedLocationName && (
            <div className="p-2 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Badge color="info" className="px-2 py-0.5">
                Selected: {selectedLocationName}
              </Badge>
            </div>
          )}
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onClose={() => setShowConfirm(false)} size="md">
        <ModalBody className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div className="flex items-center justify-center text-4xl sm:text-6xl text-blue-500 mb-4">
              <FaSave />
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
              Are you sure you want to finalize this?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 dark:bg-gray-700 justify-center">
          <button
            className={`px-4 py-2 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={performFinalize}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1 inline-block"></div>
                <span className="text-xs">Processing...</span>
              </>
            ) : (
              "Process"
            )}
          </button>
          <button
            className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-all duration-200 hover:scale-105"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
        </ModalFooter>
      </Modal>

      {/* Session Expired Modal */}
      {sessionExpired && <SessionModal />}

      {/* Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "8px",
            padding: "8px",
            fontSize: "12px"
          },
          success: {
            style: { background: "#059669" },
          },
          error: {
            style: { background: "#dc2626" },
          },
        }}
      />

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default FinalizetheSupplierSelection;