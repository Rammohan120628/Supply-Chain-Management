// StockReceiveGrid.jsx

import { Icon } from '@iconify/react';
import { Badge } from 'flowbite-react';

import CardBox from 'src/components/shared/CardBox';

const StockReceiveGrid = ({ 
  data, 
  loading, 
  error, 
  onViewClick, 
  exportToExcel, 
  exportLoading, 
  period 
}) => {
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateTimeStr;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 0) {
      return { color: 'blue', text: 'Not Received' };
    } else if (status === 1) {
      return { color: 'warning', text: 'Received' };
    }
    return { color: 'gray', text: 'Pending' };
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading grid data for period: {period}...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-8 bg-red-50 rounded-lg">
          <Icon icon="mdi:alert-circle-outline" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error loading grid data</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
        </div>
      )}
      
      {!loading && !error && data.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((item, index) => {
              const status = getStatusBadge(item.invStatusFk);
              
              return (
                <CardBox
                  key={item.grnNo || index} 
                  className="hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{item.grnNo || 'N/A'}</h3>
                      <p className="text-sm text-gray-500">{item.poNumber || 'No PO'}</p>
                    </div>
                    <Badge color={status.color} className="text-xs">
                      {status.text}
                    </Badge>
                  </div>
                  
                  {/* Supplier Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="mdi:factory" className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-700">Supplier:</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.supplierId || 'N/A'}</p>
                    <p className="text-sm text-gray-600 truncate">{item.supplierName || 'N/A'}</p>
                  </div>
                  
                  {/* Location Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="mdi:map-marker" className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">Location:</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.locId || 'N/A'}</p>
                    <p className="text-sm text-gray-600 truncate">{item.locName || 'N/A'}</p>
                  </div>
                  
                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:currency-inr" className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Total GP</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">
                        {Number(item.totalGp || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:percent" className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Discount</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">
                        {Number(item.discAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Net Invoice */}
                  <div className="bg-purple-50 p-3 rounded-lg mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:file-document" className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Net Invoice</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        ₹{Number(item.netInvoice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                      <p className="text-sm font-medium text-gray-800">
                        {item.supplierInvDateStr || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDateTime(item.createdDataTime)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Created by: <span className="font-medium">{item.userId || 'N/A'}</span>
                    </div>
                    <button
                      onClick={() => onViewClick(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Icon icon="mdi:eye-outline" className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </CardBox>
              );
            })}
          </div>
          
          {/* Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-800">{data.length}</span> items for period: 
                  <span className="font-bold text-blue-600 ml-1">{period}</span>
                </p>
              </div>
              <Badge
                color="success"
                className={`h-12 px-4 flex items-center gap-2 cursor-pointer hover:bg-green-700 transition-colors ${
                  exportLoading || !period ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={exportLoading || !period ? undefined : exportToExcel}
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="file-icons:microsoft-excel" className="w-5 h-5" />
                    <span>Export Excel</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
        </>
      )}
      
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-16">
          <Icon icon="mdi:package-variant-remove" className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Stock Receive Items Found</h3>
          <p className="text-gray-500">
            No data available for period: <span className="font-medium">{period}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default StockReceiveGrid;