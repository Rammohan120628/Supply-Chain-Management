import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ClipboardCheck,
  ScrollText,
  MapPin,
  ClipboardList,
  PackageCheck,
  Truck,
  RefreshCw,
  Users,
  Package,
  Wallet,
  Bot,
  Search,
  X,
} from 'lucide-react';
import CommonHeader from './CommonHeader';
import { usePermissions } from '../../../context/PermissionContext/PermissionContext';
interface Section {
  heading: string;
  subtitles: string[];
}

interface SampleData {
  sections: Section[];
}

const OverAllReport: React.FC = () => {
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubtitleClick = (subtitle: string) => {
    // All navigation paths remain unchanged
    if (subtitle === 'Location Request Recap') navigate('/LocationRequestRecap');
    if (subtitle === 'Location Request Particular Request') navigate('/LocationParticularRequest');
    if (subtitle === 'Item Return from Location') navigate('/ItemsReturnFromLocationReport');
    if (subtitle === 'Item Return from Location summary')
      navigate('/ItemReturnFromLocationsSummaryReport');
    if (subtitle === 'CWH Loading Sheet') navigate('/CWHLoadingSheet');
    if (subtitle === 'Item Details') navigate('/ItemDetails');
    if (subtitle === 'Theoretical Stock - PDF') navigate('/TheoriticalStockPdf');
    if (subtitle === 'Savings Summary by Location') navigate('/SavingsSummaryByLocation');
    if (subtitle === 'Cash Account Summary') navigate('/CashAccountSummary');
    if (subtitle === 'Supplier Statement') navigate('/SupplierStatement');
    if (subtitle === 'Supplier Statement Summary') navigate('/SupplierStatementSummary');
    if (subtitle === 'Item Movement Recap') navigate('/ItemMovementRecap');
    if (subtitle === 'Opening Stock') navigate('/OpeningStockReport');
    if (subtitle === 'Cash Movement Report') navigate('/CashMovementReport');
    if (subtitle === 'Entered quotation request') navigate('/EnteredQuatationRequest');
    if (subtitle === 'Consolidation') navigate('/Consolidation');
    if (subtitle === 'Quotation Request') navigate('/QuotationRequestReport');
    if (subtitle === 'Supplier price confirmation') navigate('/SupplierPriceConfirmation');
    if (subtitle === 'Selected Supplier') navigate('/SelectedSupplier');
    if (subtitle === 'Location Request') navigate('/LocationRequestReport');
    if (subtitle === 'Purchase order - overfall') navigate('/PurchaseOrderOverFall');
    if (subtitle === 'Suppliers Delivery Details by Delivery')
      navigate('/SuppliersDeliveryDetailsByDelivery');
    if (subtitle === 'CWH Delivery Details by Location') navigate('/CWHDeliveryDetailsbyLocation');
    if (subtitle === 'CWH Delivery Details by Invoice') navigate('/CwhDeliveryDetailsByInvoice');
    if (subtitle === 'CWH Savings') navigate('/CwhSavingsReport');
    if (subtitle === 'Savings by CWH Invoice with Location')
      navigate('/SavingsByCWHInvoiceWithLocations');
    if (subtitle === 'Savings by Location by Item') navigate('/SavingsByLocationItems');
    if (subtitle === 'Item Full Transaction') navigate('/ItemFullTransactions');
    if (subtitle === 'EOM Inventory Report') navigate('/EomInventoryReport');
    if (subtitle === 'Credit Book Report') navigate('/CreditBookReport');
    if (subtitle === 'IPAS') navigate('/IPASReport');
    if (subtitle === 'Suppliers Invoice Details by Invoice')
      navigate('/SuppliersInvoiceDetailsByInvoice');
    if (subtitle === 'Suppliers Invoice Details by Invoice Summary')
      navigate('/SuppliersInvoiceDetailsByInvoiceSummary');
    if (subtitle === 'CWH Delivery Note /  Invoice Filter Both')
      navigate('/CWHDeliveryNoteInvoiceFilterBoth');
    if (subtitle === 'Purchase Price Analysis - Excel') navigate('/PurchasePriceAnalysisReport');
    if (subtitle === 'Theoretical Stock - Excel') navigate('/TheoriticalStockExcel');
  };

  // Python API Integration completed reports (unchanged)
  const pythonCompletedReports = new Set([
    'Entered quotation request',
    'Consolidation',
    'Quotation Request',
    'Supplier price confirmation',
    'Selected Supplier',
    'Location Request',
    'Purchase order - overfall',
    'Suppliers Delivery Details by Delivery',
    'CWH Delivery Details by Location',
    'CWH Delivery Details by Invoice',
    'CWH Delivery Note /  Invoice Filter Both',
    'CWH Savings',
    'Savings by CWH Invoice with Location',
    'Savings by Location by Item',
    'Item Full Transaction',
    'EOM Inventory Report',
    'Credit Book Report',
    'IPAS',
    'Theoretical Stock - Excel',
    'Purchase Price Analysis - Excel',
    'Suppliers Invoice Details by Invoice',
    'Suppliers Invoice Details by Invoice Summary',
  ]);

  // Define which reports are savings-related (to be hidden if excluding savings)
  const savingsReports = new Set([
    'CWH Savings',
    'Savings by CWH Invoice with Location',
    'Savings Summary by Location',
    'Savings by Location by Item',
  ]);

  const OverAllData: SampleData = {
    sections: [
      {
        heading: 'Quotation Request',
        subtitles: [
          'Entered quotation request',
          'Consolidation',
          'Quotation Request',
          'Supplier price confirmation',
          'Selected Supplier',
        ],
      },
      {
        heading: 'Location Request',
        subtitles: [
          'Location Request',
          'Location Request Recap',
          'Location Request Particular Request',
        ],
      },
      {
        heading: 'Delivery Plan & PO',
        subtitles: ['CWH Loading Sheet', 'Purchase order - overfall'],
      },
      {
        heading: 'Item Receiving',
        subtitles: [
          'Suppliers Delivery Details by Delivery',
          'Suppliers Invoice Details by Invoice',
          'Suppliers Invoice Details by Invoice Summary',
          'Item Return from Location',
          'Item Return from Location summary',
        ],
      },
      {
        heading: 'Item Delivery',
        subtitles: [
          'CWH Delivery Details by Location',
          'CWH Delivery Details by Invoice',
          'CWH Delivery Note /  Invoice Filter Both',
        ],
      },
      {
        heading: 'Item Full Transaction',
        subtitles: [
          'CWH Savings',
          'Savings by CWH Invoice with Location',
          'Savings Summary by Location',
          'Savings by Location by Item',
          'Item Full Transaction',
          'Item Movement Recap',
          'EOM Inventory Report',
          'Credit Book Report',
        ],
      },
      {
        heading: 'Supplier Related',
        subtitles: ['Supplier Statement Summary', 'Supplier Statement', 'IPAS'],
      },
      {
        heading: 'Inventory',
        subtitles: [
          'Item Details',
          'Theoretical Stock - Excel',
          'Theoretical Stock - PDF',
          'Opening Stock',
          'Purchase Price Analysis - Excel',
        ],
      },
      {
        heading: 'Cash Book',
        subtitles: ['Cash Account Summary', 'Cash Movement Report'],
      },
      {
        heading: 'Chatbot',
        subtitles: [
          'Purchase Price Analysis - Over All',
          'Purchase Price Analysis - Cash Purchase',
          'Purchase Price Analysis - Out of Catalogue',
        ],
      },
    ],
  };

  // Map section headings to icons
  const headingIcons: Record<string, React.ReactNode> = {
    'Quotation Request': <ScrollText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    'Location Request': <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    'Delivery Plan & PO': <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    'Item Receiving': <PackageCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    'Item Delivery': <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    'Item Full Transaction': <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    'Supplier Related': <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    Inventory: <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    'Cash Book': <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    Chatbot: <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  };

  // Apply permission filtering
  const filteredByPermissions = useMemo(() => {
    if (!permissions) return [];

    const { renderAllReportsIncludingSaving, renderAllReportsExcludingSaving } = permissions;

    // If neither flag is true, user has no report access
    if (!renderAllReportsIncludingSaving && !renderAllReportsExcludingSaving) {
      return [];
    }

    // Start with all sections and filter subtitles
    let filtered = OverAllData.sections.map((section) => ({
      ...section,
      subtitles: section.subtitles.filter((subtitle) => {
        // If including savings, show everything
        if (renderAllReportsIncludingSaving) return true;
        // If excluding savings, hide savings reports
        if (renderAllReportsExcludingSaving && savingsReports.has(subtitle)) {
          return false;
        }
        // Otherwise show (non-savings)
        return true;
      }),
    }));

    // Remove sections that become empty
    filtered = filtered.filter((section) => section.subtitles.length > 0);
    return filtered;
  }, [permissions]);

  // Apply search filter on top of permission filter
  const finalSections = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return filteredByPermissions;

    const lowerSearch = trimmed.toLowerCase();
    return filteredByPermissions
      .map((section) => ({
        ...section,
        subtitles: section.subtitles.filter((sub) =>
          sub.toLowerCase().includes(lowerSearch)
        ),
      }))
      .filter((section) => section.subtitles.length > 0);
  }, [searchTerm, filteredByPermissions]);

  const clearSearch = () => setSearchTerm('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <CommonHeader
        icon={<ClipboardCheck className="w-6 h-6 text-white" />}
        title="Over All Reports"
      />

      {/* Search bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-2 py-2 flex justify-end">
        <div className="w-full sm:w-[350px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports by name..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow duration-200 hover:shadow-md"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchTerm && finalSections.length === 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
              No reports found matching "{searchTerm}"
            </p>
          )}
          {searchTerm && finalSections.length > 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
              Found {finalSections.reduce((acc, sec) => acc + sec.subtitles.length, 0)} reports
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-2 px-2 sm:px-6 lg:px-4 py-2">
        {finalSections.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            No reports available based on your permissions.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {finalSections.map((section, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl dark:shadow-gray-900/30 dark:hover:shadow-gray-900/50 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {/* Card header with subtle gradient */}
                <div className="flex items-center gap-3 px-2 py-2 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 border-b border-gray-100 dark:border-gray-700">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {headingIcons[section.heading]}
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-300 truncate">
                    {section.heading}
                  </h2>
                </div>

                {/* Scrollable list with custom scrollbar */}
                <ul className="space-y-2 p-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {section.subtitles.map((subtitle, subIndex) => (
                    <li
                      key={subIndex}
                      onClick={() => handleSubtitleClick(subtitle)}
                      title={subtitle}
                      className="cursor-pointer text-xs sm:text-sm px-4 py-2.5 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:pl-6 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    >
                      <span className="block">
                        {subtitle}

                        {pythonCompletedReports.has(subtitle) && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Python
                          </span>
                        )}

                        {!pythonCompletedReports.has(subtitle) &&
                          !(
                            subtitle === 'Purchase Price Analysis - Over All' ||
                            subtitle === 'Purchase Price Analysis - Cash Purchase' ||
                            subtitle === 'Purchase Price Analysis - Out of Catalogue'
                          ) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              JAVA
                            </span>
                          )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverAllReport;