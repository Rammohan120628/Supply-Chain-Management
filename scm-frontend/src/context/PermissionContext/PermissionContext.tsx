import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export interface PermissionsData {
  userFk: number;
  renderQuotationRequest: boolean;
  renderConslidation: boolean;
  renderPrepareQuotation: boolean;
  renderQuotationReply: boolean;
  renderPriceComputation: boolean;
  renderPriceComparisonPreview: boolean;
  renderChangeSysSelecSupp: boolean;
  renderEditSysSelecSupp: boolean;
  renderFinalizeTheSupplierSelection: boolean;
  renderPurchasePeriodClosing: boolean;
  renderDuplicateSupplierSelection: boolean;
  renderStockPeriodClosing: boolean;
  renderDuplicateSupplierSelectionTender: boolean;
  renderTenderPeriodClosing: boolean;
  renderLocationRequest: boolean;
  renderLocationRequestBu: boolean;
  renderEditLocationRequest: boolean;
  renderChangeDelievryLoc: boolean;
  renderChangeDelievryLocSup: boolean;
  renderAutoPo: boolean;
  renderManualPoCreation: boolean;
  renderReceiveItemFromSuppl: boolean;
  renderReceiveInvoice: boolean;
  renderItemFromLocation: boolean;
  renderDeliveryItemToLocation: boolean;
  renderReturnItemToSupplier: boolean;
  renderReceiveCreditNote: boolean;
  renderPhysicalStock: boolean;
  renderOCD: boolean;
  renderSupplierCreation: boolean;
  renderRelateItemWithSupplier: boolean;
  renderItemRelatedMaster: boolean;
  renderCommonMaster: boolean;
  renderAllReportsIncludingSaving: boolean;
  renderAllReportsExcludingSaving: boolean;
  headerTP: boolean;
  headerPC: boolean;
  headerRH: boolean;
  headerPO: boolean;
  headerSR: boolean;
  headerSD: boolean;
  headerS: boolean;
  headerC: boolean;
  headerSU: boolean;
  renderCommon: boolean;
  lastuserFk: number;
  stockClosingStatus: number;
}

interface PermissionsContextType {
  permissions: PermissionsData | null;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Helper to create a full‑access permissions object (for admin)
const createFullPermissions = (userId: string): PermissionsData => {
  const userFk = parseInt(userId, 10) || 0;
  return {
    userFk,
    renderQuotationRequest: true,
    renderConslidation: true,
    renderPrepareQuotation: true,
    renderQuotationReply: true,
    renderPriceComputation: true,
    renderPriceComparisonPreview: true,
    renderChangeSysSelecSupp: true,
    renderEditSysSelecSupp: true,
    renderFinalizeTheSupplierSelection: true,
    renderPurchasePeriodClosing: true,
    renderDuplicateSupplierSelection: true,
    renderStockPeriodClosing: true,
    renderDuplicateSupplierSelectionTender: true,
    renderTenderPeriodClosing: true,
    renderLocationRequest: true,
    renderLocationRequestBu: true,
    renderEditLocationRequest: true,
    renderChangeDelievryLoc: true,
    renderChangeDelievryLocSup: true,
    renderAutoPo: true,
    renderManualPoCreation: true,
    renderReceiveItemFromSuppl: true,
    renderReceiveInvoice: true,
    renderItemFromLocation: true,
    renderDeliveryItemToLocation: true,
    renderReturnItemToSupplier: true,
    renderReceiveCreditNote: true,
    renderPhysicalStock: true,
    renderOCD: true,
    renderSupplierCreation: true,
    renderRelateItemWithSupplier: true,
    renderItemRelatedMaster: true,
    renderCommonMaster: true,
    renderAllReportsIncludingSaving: true,
    renderAllReportsExcludingSaving: true,
    headerTP: true,
    headerPC: true,
    headerRH: true,
    headerPO: true,
    headerSR: true,
    headerSD: true,
    headerS: true,
    headerC: true,
    headerSU: true,
    renderCommon: true,
    lastuserFk: userFk,
    stockClosingStatus: 0,
  };
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');

    // If no userId → user is logged out
    if (!userId) {
      setPermissions(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Admin user – full access without API call
    if (userType === '0') {
      setPermissions(createFullPermissions(userId));
      setLoading(false);
      setError(null);
      return;
    }

    // Regular user – need token
    if (!token) {
      setError('No authentication token');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/masters-service-scm/userMasterController/getScreenListByUserFk/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setPermissions(res.data.data);
        setError(null);
      } else {
        setError('Failed to load permissions');
      }
    } catch (err) {
      setError('Error fetching permissions');
      console.error('Permissions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return (
    <PermissionsContext.Provider value={{ permissions, loading, error, refreshPermissions: fetchPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};