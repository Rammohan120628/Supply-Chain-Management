import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { uniqueId } from "lodash";
import {
  HiOutlineChevronRight,
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineInbox,
  HiOutlineShoppingCart,
  HiOutlineTruck,
  HiOutlineCube,
  HiOutlineCash,
  HiOutlineUsers,
  HiOutlineCubeTransparent,
  HiOutlineCog,
  HiOutlineFolder,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineAdjustments,
  HiOutlineRefresh,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineDuplicate,
  HiOutlineLocationMarker,
  HiOutlineUpload,
  HiOutlinePencil,
  HiOutlineDocumentDuplicate,
  HiOutlineCalculator,
  HiOutlineScale,
  HiOutlineSwitchHorizontal,
  HiOutlineStar,
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineBeaker,
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineChartBar,
  HiOutlineClipboard
} from "react-icons/hi";
import { useAuth } from "src/context/AuthContext/AuthContext";
import { usePermissions, PermissionsData } from "src/context/PermissionContext/PermissionContext";

/* ================= TYPES ================= */
interface SidebarItem {
  id: string;
  name: string;
  url?: string;
  children?: SidebarItem[];
}

interface MenuItem {
  id: string;
  heading: string;
  icon?: React.ReactNode;
  children: SidebarItem[];
}

interface SidebaritemsProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/* ================= MENU DATA ================= */
const menuData: MenuItem[] = [
  {
    id: "tender",
    heading: "Tender Process",
    icon: <HiOutlineDocumentText className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Quotation Request", url: "/QuotationRequest" },
      { id: uniqueId(), name: "Quotation Bulk Upload", url: "/QuotationRequestBulkUpload" },
      { id: uniqueId(), name: "Edit Quotation", url: "/EditQuotationRequest" },
      { id: uniqueId(), name: "Quotation Consolidation", url: "/ConsolidationofQuotationRequest" },
      { id: uniqueId(), name: "Prepare Quotation", url: "/PrepareQuotation" },
      { id: uniqueId(), name: "Quotation Reply", url: "/QuotationReply" },
      { id: uniqueId(), name: "Price Computation", url: "/PriceComputation" },
      { id: uniqueId(), name: "Price Comparison", url: "/PriceComparisionPreview" },
      { id: uniqueId(), name: "Change System Selected Supplier", url: "/ChangeSystemSelectedSupllierForItems" },
      { id: uniqueId(), name: "Edit System Selected Supplier", url: "/EditSystemSelectedSupllierForItems" },
      { id: uniqueId(), name: "Finalize Supplier Selection", url: "/FinalizetheSupplierSelection" },
    ],
  },
  {
    id: "period",
    heading: "Period Closing",
    icon: <HiOutlineRefresh className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Puchase Period Closing", url: "/PuchasePeriodClosing" },
      { id: uniqueId(), name: "Duplicate Supplier Selection-Stock", url: "/DuplicateSupplierSelectionStock" },
      { id: uniqueId(), name: "Stock Period Closing", url: "/StockPeriodClosing" },
      { id: uniqueId(), name: "Duplicate Supplier Item-Tender", url: "/DuplicateSupplierItemTender" },
      { id: uniqueId(), name: "Tender Period Closing", url: "/TenderPeriodClosing" },
    ],
  },
  {
    id: "request",
    heading: "Request",
    icon: <HiOutlineInbox className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Location Request", url: "/LocationRequest" },
      { id: uniqueId(), name: "Location Request Bulk Upload", url: "/LocationRequestBulkUpload" },
      { id: uniqueId(), name: "Edit-Location Request", url: "/Edit-LocationRequest" },
      { id: uniqueId(), name: "Change the Delivery Location-Location", url: "/ChangetheDeliveryLocation" },
      { id: uniqueId(), name: "Change the Delivery Location-Supplier", url: "/ChangetheDeliveryLocation-Supplier" },
    ],
  },
  {
    id: "po",
    heading: "Purchase Order",
    icon: <HiOutlineShoppingCart className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Auto Generate PO", url: "/AutoGeneratePO" },
      { id: uniqueId(), name: "Purchase Order Creation", url: "/PurchaseOrderCreation" },
    ],
  },
  {
    id: "receive",
    heading: "Stock Receive",
    icon: <HiOutlineCube className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Receive Item From Supplier", url: "/ReceiveItemFromSupplier" },
      { id: uniqueId(), name: "Receive Invoice", url: "/StockReceiveInvoice" },
      { id: uniqueId(), name: "Stock Receive Item From Location", url: "/StockReceiveItemFromLocation" },
    ],
  },
  {
    id: "delivery",
    heading: "Stock Delivery",
    icon: <HiOutlineTruck className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Delivery Item To Location", url: "/DeliveryItemToLocation" },
      { id: uniqueId(), name: "Return Item To Supplier", url: "/ReturnItemToSupplier" },
      { id: uniqueId(), name: "Receive Credit Note", url: "/ReceiveCreditNote" },
    ],
  },
  {
    id: "stock",
    heading: "Stock",
    icon: <HiOutlineCubeTransparent className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Physical Stock", url: "/PysicalStock" },
    ],
  },
  {
    id: "cash",
    heading: "Cash",
    icon: <HiOutlineCash className="w-5 h-5" />,
    children: [
      { id: uniqueId(), name: "Other Cash Disbursement", url: "/OtherCashDisbursement" },
    ],
  },
  {
    id: "master",
    heading: "Master",
    icon: <HiOutlineCog className="w-5 h-5" />,
    children: [
      {
        id: uniqueId(),
        name: "Common Master",
        children: [
          { id: uniqueId(), name: "Profit Center", url: "/profitCenter" },
          { id: uniqueId(), name: "Entity", url: "/Entity" },
          { id: uniqueId(), name: "VAT Category", url: "/VATCategory" },
          { id: uniqueId(), name: "Approve Product Creation", url: "/ApproveProductCreation" },
          { id: uniqueId(), name: "Manager Creation", url: "/ManagerCreation" },
        ],
      },
      {
        id: "item",
        name: "Item",
        children: [
          { id: uniqueId(), name: "Item Creation", url: "/itemCreation" },
          { id: uniqueId(), name: "Item Update", url: "/itemUpdate" },
          { id: uniqueId(), name: "Item Cession Price", url: "/ItemCessionprice" },
          {
            id: uniqueId(),
            name: "Item Sub-Master",
            children: [
              { id: uniqueId(), name: "Items Unit", url: "/ItemUnit" },
              { id: uniqueId(), name: "Item State", url: "/itemSubMaster/ItemState" },
              { id: uniqueId(), name: "Items Account", url: "/itemSubMaster/ItemAccount" },
              { id: uniqueId(), name: "Consolidate Account", url: "/itemSubMaster/ConsolidateAccount" },
              { id: uniqueId(), name: "Items Origin", url: "/itemSubMaster/ItemOrigin" },
              { id: uniqueId(), name: "Items Quantity", url: "/itemSubMaster/ItemQuantity" },
              { id: uniqueId(), name: "Items Category", url: "/itemSubMaster/ItemCategory" },
            ],
          },
        ],
      },
      {
        id: uniqueId(),
        name: "Supplier",
        children: [
          { id: uniqueId(), name: "Supplier Creation", url: "/SupplierCreation" },
          { id: uniqueId(), name: "Relate Item With Supplier", url: "/RelateItemWithSupplier" },
        ],
      },
      {
        id: uniqueId(),
        name: "User",
        children: [
          { id: uniqueId(), name: "User Master", url: "/User/UserMaster" },
          { id: uniqueId(), name: "Screen Rights", url: "/User/ScreenRights" },
          { id: uniqueId(), name: "Location Config", url: "/User/LocationConfig" },
          { id: uniqueId(), name: "User Log", url: "/User/UserLog" },
          { id: uniqueId(), name: "Change Password", url: "/User/ChangePassword" },
        ],
      },
    ],
  },
];

// Get icon for menu item based on name
const getItemIcon = (itemName: string) => {
  if (itemName.includes("Quotation")) return <HiOutlineDocumentDuplicate className="w-4 h-4" />;
  if (itemName.includes("Upload")) return <HiOutlineUpload className="w-4 h-4" />;
  if (itemName.includes("Edit")) return <HiOutlinePencil className="w-4 h-4" />;
  if (itemName.includes("Consolidation")) return <HiOutlineDuplicate className="w-4 h-4" />;
  if (itemName.includes("Price")) return <HiOutlineCalculator className="w-4 h-4" />;
  if (itemName.includes("Comparison")) return <HiOutlineScale className="w-4 h-4" />;
  if (itemName.includes("Supplier")) return <HiOutlineUsers className="w-4 h-4" />;
  if (itemName.includes("Location")) return <HiOutlineLocationMarker className="w-4 h-4" />;
  if (itemName.includes("Delivery")) return <HiOutlineTruck className="w-4 h-4" />;
  if (itemName.includes("Return")) return <HiOutlineRefresh className="w-4 h-4" />;
  if (itemName.includes("Credit")) return <HiOutlineCreditCard className="w-4 h-4" />;
  if (itemName.includes("Cash")) return <HiOutlineCurrencyDollar className="w-4 h-4" />;
  if (itemName.includes("Creation")) return <HiOutlineSparkles className="w-4 h-4" />;
  if (itemName.includes("Update")) return <HiOutlineRefresh className="w-4 h-4" />;
  if (itemName.includes("Approve")) return <HiOutlineCheckCircle className="w-4 h-4" />;
  if (itemName.includes("Manager")) return <HiOutlineStar className="w-4 h-4" />;
  if (itemName.includes("Category")) return <HiOutlineTag className="w-4 h-4" />;
  if (itemName.includes("Unit")) return <HiOutlineScale className="w-4 h-4" />;
  if (itemName.includes("Account")) return <HiOutlineOfficeBuilding className="w-4 h-4" />;
  if (itemName.includes("Rights")) return <HiOutlineShieldCheck className="w-4 h-4" />;
  if (itemName.includes("Password")) return <HiOutlineKey className="w-4 h-4" />;
  if (itemName.includes("Closing")) return <HiOutlineBan className="w-4 h-4" />;
  if (itemName.includes("Duplicate")) return <HiOutlineDuplicate className="w-4 h-4" />;
  if (itemName.includes("Physical")) return <HiOutlineCube className="w-4 h-4" />;
  if (itemName.includes("Disbursement")) return <HiOutlineCash className="w-4 h-4" />;
  if (itemName.includes("Relate")) return <HiOutlineSwitchHorizontal className="w-4 h-4" />;
  if (itemName.includes("Profit")) return <HiOutlineCurrencyDollar className="w-4 h-4" />;
  if (itemName.includes("Entity")) return <HiOutlineOfficeBuilding className="w-4 h-4" />;
  if (itemName.includes("VAT")) return <HiOutlineTag className="w-4 h-4" />;
  if (itemName.includes("Cession")) return <HiOutlineScale className="w-4 h-4" />;
  if (itemName.includes("Admin")) return <HiOutlineCog className="w-4 h-4" />;
  if (itemName.includes("Log")) return <HiOutlineClock className="w-4 h-4" />;
  if (itemName.includes("State")) return <HiOutlineClipboard className="w-4 h-4" />;
  if (itemName.includes("Origin")) return <HiOutlineHome className="w-4 h-4" />;
  if (itemName.includes("Quantity")) return <HiOutlineChartBar className="w-4 h-4" />;
  return <HiOutlineAdjustments className="w-4 h-4" />;
};

// Tooltip component for collapsed mode
const Tooltip: React.FC<{ children: React.ReactNode; content: string; position?: 'right' | 'left' }> = ({ 
  children, 
  content, 
  position = 'right' 
}) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div 
          className={`fixed z-50 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm whitespace-nowrap ${
            position === 'right' ? 'ml-2' : 'mr-2'
          }`}
          style={{ 
            left: position === 'right' ? '100%' : 'auto',
            right: position === 'left' ? '100%' : 'auto',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          {content}
          <div 
            className={`absolute top-1/2 -mt-1 ${
              position === 'right' ? '-left-1' : '-right-1'
            } w-2 h-2 bg-gray-900 transform rotate-45`}
          />
        </div>
      )}
    </div>
  );
};

// Recursive component to render nested menu items
const renderNestedItems = (
  items: SidebarItem[],
  level: number = 0,
  location: any,
  expandedSubMenus: Record<string, boolean>,
  toggleSubMenu: (id: string) => void,
  isCollapsed: boolean = false
): React.ReactNode => {
  return items.map((item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSubMenus[item.id];
    const active = location.pathname === item.url;

    if (hasChildren) {
      if (isCollapsed) {
        return (
          <div key={item.id} className="relative">
            <Tooltip content={item.name}>
              <button
                onClick={() => toggleSubMenu(item.id)}
                className={`
                  w-full flex items-center justify-center px-2 py-3 rounded-md
                  transition-all duration-200
                  ${isExpanded 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-gray-400 hover:text-gray-600">
                  {getItemIcon(item.name)}
                </span>
              </button>
            </Tooltip>
          </div>
        );
      }

      return (
        <div key={item.id} className="relative">
          <button
            onClick={() => toggleSubMenu(item.id)}
            className={`
              w-full flex items-start justify-between px-3 py-2 rounded-md
              text-sm transition-all duration-200 group text-left
              ${isExpanded 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <span className="text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-0.5">
                {getItemIcon(item.name)}
              </span>
              <span className="font-semibold break-words whitespace-normal leading-relaxed">
                {item.name}
              </span>
            </div>
            <HiOutlineChevronRight
              className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>

          {isExpanded && (
            <div className="mt-1 space-y-1">
              {renderNestedItems(item.children!, level + 1, location, expandedSubMenus, toggleSubMenu, isCollapsed)}
            </div>
          )}
        </div>
      );
    }

    if (isCollapsed) {
      return (
        <div key={item.id} className="relative">
          <Tooltip content={item.name}>
            <Link
              to={item.url || "#"}
              className={`
                flex items-center justify-center px-2 py-3 rounded-md transition-all
                ${active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <span className={active ? 'text-indigo-600' : 'text-gray-400'}>
                {getItemIcon(item.name)}
              </span>
            </Link>
          </Tooltip>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.url || "#"}
        className={`
          flex items-start gap-2 px-3 py-2 rounded-md text-sm transition-all
          ${active
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-50'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <span className={`flex-shrink-0 mt-0.5 ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
          {getItemIcon(item.name)}
        </span>
        <span className="flex-1 font-semibold break-words whitespace-normal leading-relaxed">
          {item.name}
        </span>
      </Link>
    );
  });
};

/* ================= PERMISSION FILTERING ================= */
// Helper to get the permission key for a leaf item based on its url/name
const getPermissionKeyForItem = (item: SidebarItem): keyof PermissionsData | null => {
  const url = item.url || "";
  const name = item.name;

  // Tender Process
  if (url === "/QuotationRequest") return "renderQuotationRequest";
  if (url === "/QuotationRequestBulkUpload") return "renderQuotationRequest";
  if (url === "/EditQuotationRequest") return "renderQuotationRequest";
  if (url === "/ConsolidationofQuotationRequest") return "renderConslidation";
  if (url === "/PrepareQuotation") return "renderPrepareQuotation";
  if (url === "/QuotationReply") return "renderQuotationReply";
  if (url === "/PriceComputation") return "renderPriceComputation";
  if (url === "/PriceComparisionPreview") return "renderPriceComparisonPreview";
  if (url === "/ChangeSystemSelectedSupllierForItems") return "renderChangeSysSelecSupp";
  if (url === "/EditSystemSelectedSupllierForItems") return "renderEditSysSelecSupp";
  if (url === "/FinalizetheSupplierSelection") return "renderFinalizeTheSupplierSelection";

  // Period Closing
  if (url === "/PuchasePeriodClosing") return "renderPurchasePeriodClosing";
  if (url === "/DuplicateSupplierSelectionStock") return "renderDuplicateSupplierSelection";
  if (url === "/StockPeriodClosing") return "renderStockPeriodClosing";
  if (url === "/DuplicateSupplierItemTender") return "renderDuplicateSupplierSelectionTender";
  if (url === "/TenderPeriodClosing") return "renderTenderPeriodClosing";

  // Request
  if (url === "/LocationRequest") return "renderLocationRequest";
  if (url === "/LocationRequestBulkUpload") return "renderLocationRequestBu";
  if (url === "/Edit-LocationRequest") return "renderEditLocationRequest";
  if (url === "/ChangetheDeliveryLocation") return "renderChangeDelievryLoc";
  if (url === "/ChangetheDeliveryLocation-Supplier") return "renderChangeDelievryLocSup";

  // Purchase Order
  if (url === "/AutoGeneratePO") return "renderAutoPo";
  if (url === "/PurchaseOrderCreation") return "renderManualPoCreation";

  // Stock Receive
  if (url === "/ReceiveItemFromSupplier") return "renderReceiveItemFromSuppl";
  if (url === "/StockReceiveInvoice") return "renderReceiveInvoice";
  if (url === "/StockReceiveItemFromLocation") return "renderItemFromLocation";

  // Stock Delivery
  if (url === "/DeliveryItemToLocation") return "renderDeliveryItemToLocation";
  if (url === "/ReturnItemToSupplier") return "renderReturnItemToSupplier";
  if (url === "/ReceiveCreditNote") return "renderReceiveCreditNote";

  // Stock
  if (url === "/PysicalStock") return "renderPhysicalStock";

  // Cash
  if (url === "/OtherCashDisbursement") return "renderOCD";

  // Master – Common Master
  if (url === "/profitCenter") return "renderItemRelatedMaster";
  if (url === "/Entity") return "renderItemRelatedMaster";
  if (url === "/VATCategory") return "renderItemRelatedMaster";
  if (url === "/ApproveProductCreation") return "renderCommonMaster";
  if (url === "/ManagerCreation") return "renderCommonMaster";

  // Master – Item
  if (url === "/itemCreation") return "renderItemRelatedMaster";
  if (url === "/itemUpdate") return "renderItemRelatedMaster";
  if (url === "/ItemCessionprice") return "renderItemRelatedMaster";
  if (url === "/ItemUnit") return "renderItemRelatedMaster";
  if (url === "/itemSubMaster/ItemState") return "renderItemRelatedMaster";
  if (url === "/itemSubMaster/ItemAccount") return "renderItemRelatedMaster";
  if (url === "/itemSubMaster/ConsolidateAccount") return "renderItemRelatedMaster";
  if (url === "/itemSubMaster/ItemOrigin") return "renderItemRelatedMaster";
  if (url === "/itemSubMaster/ItemQuantity") return "renderItemRelatedMaster";
  if (url === "/itemSubMaster/ItemCategory") return "renderItemRelatedMaster";

  // Master – Supplier
  if (url === "/SupplierCreation") return "renderSupplierCreation";
  if (url === "/RelateItemWithSupplier") return "renderRelateItemWithSupplier";

  // Master – User
  if (url === "/User/UserMaster") return "renderCommonMaster";
  if (url === "/User/ScreenRights") return "renderCommonMaster";
  if (url === "/User/LocationConfig") return "renderCommonMaster";
  if (url === "/User/UserLog") return "renderCommonMaster";
  if (url === "/User/ChangePassword") return "renderCommonMaster";

  return null;
};

// Recursively filter sidebar items based on permissions
const filterSidebarItems = (
  items: SidebarItem[],
  permissions: PermissionsData | null
): SidebarItem[] => {
  if (!permissions) return [];

  return items.reduce<SidebarItem[]>((acc, item) => {
    // If it has children, filter them recursively
    if (item.children && item.children.length > 0) {
      const filteredChildren = filterSidebarItems(item.children, permissions);
      if (filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren,
        });
      }
      return acc;
    }

    // Leaf item: check permission
    const permKey = getPermissionKeyForItem(item);
    if (permKey && permissions[permKey] === true) {
      acc.push(item);
    }
    return acc;
  }, []);
};

// Filter main menu sections – header permissions are IGNORED.
// Only child permissions and stockClosing matter.
const filterMenuByPermissions = (
  menu: MenuItem[],
  permissions: PermissionsData | null,
  stockClosing: number
): MenuItem[] => {
  if (!permissions) return [];

  return menu.reduce<MenuItem[]>((acc, section) => {
    // Special case: "Stock Receive" and "Stock Delivery" are hidden when stockClosing !== 0
    if ((section.id === "receive" || section.id === "delivery") && stockClosing !== 0) {
      return acc;
    }

    // Filter children based on permissions
    const filteredChildren = filterSidebarItems(section.children, permissions);
    if (filteredChildren.length > 0) {
      acc.push({
        ...section,
        children: filteredChildren,
      });
    }
    return acc;
  }, []);
};

/* ================= COMPONENT ================= */
const Sidebaritems: React.FC<SidebaritemsProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const { setCursorOnSideBar } = useAuth();
  const { permissions, loading } = usePermissions();
  console.log("Permissions in Sidebar:", permissions);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [expandedSubMenus, setExpandedSubMenus] = useState<Record<string, boolean>>({});
  const [userName, setUserName] = useState<string>('Admin User');
  const [userEmail, setUserEmail] = useState<string>('admin@scm.com');
  const [stockClosing, setStockClosing] = useState<number>(0);

  // Load user data and stockClosing from localStorage on component mount
  React.useEffect(() => {
    try {
      const name = localStorage.getItem('userName');
      const email = localStorage.getItem('emailId');
      
      if (name) setUserName(name);
      if (email) setUserEmail(email);
      
      if (!name || !email) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.userName) setUserName(user.userName);
          if (user.name && !user.userName) setUserName(user.name);
          if (user.emailId) setUserEmail(user.emailId);
          if (user.email && !user.emailId) setUserEmail(user.email);
        }
      }

      const stockClosingValue = localStorage.getItem('stockClosing');
      if (stockClosingValue !== null) {
        const parsed = parseInt(stockClosingValue, 10);
        setStockClosing(isNaN(parsed) ? 0 : parsed);
      } else {
        setStockClosing(0);
      }
    } catch (error) {
      console.error('Error parsing data from localStorage:', error);
      setStockClosing(0);
    }
  }, []);

  // Filter menu based on permissions and stockClosing
  const filteredMenuData = React.useMemo(() => {
    if (loading || !permissions) return []; // Wait for permissions
    return filterMenuByPermissions(menuData, permissions, stockClosing);
  }, [permissions, loading, stockClosing]);

  const toggleSubMenu = (id: string) => {
    setExpandedSubMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  React.useEffect(() => {
    if (isCollapsed) {
      setActiveMenu(null);
    }
  }, [isCollapsed]);

  // Show loading while permissions are being fetched
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading menu...</div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col" 
      onMouseEnter={() => setCursorOnSideBar(true)}
      onMouseLeave={() => setCursorOnSideBar(false)}
    >
      {/* Fixed Header Area - Only shown in drill-down view and not collapsed */}
      {activeMenu && !isCollapsed && (
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3 px-1 py-1">
            <button
              onClick={() => setActiveMenu(null)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-white/80">{activeMenu.icon}</span>
              <h2 className="text-base font-bold text-white truncate">{activeMenu.heading}</h2>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Menu Area - Takes remaining space */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'} py-1`}>
        {/* ================= NORMAL MENU VIEW ================= */}
        {!activeMenu && (
          <div className={isCollapsed ? 'space-y-1' : 'space-y-1'}>
            {filteredMenuData.map(menu => {
              if (isCollapsed) {
                return (
                  <div key={menu.id} className="relative">
                    <Tooltip content={menu.heading}>
                      <button
                        onClick={() => setActiveMenu(menu)}
                        className="w-full flex items-center justify-center px-2 py-3 rounded-lg hover:bg-gray-50 transition-all group"
                      >
                        <span className="text-gray-500 group-hover:text-indigo-600 transition-colors">
                          {menu.icon}
                        </span>
                      </button>
                    </Tooltip>
                  </div>
                );
              }
              
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-gray-500 group-hover:text-indigo-600 transition-colors">
                      {menu.icon}
                    </span>
                    <span className="text-sm font-bold text-left text-gray-700 break-words whitespace-normal leading-relaxed">
                      {menu.heading}
                    </span>
                  </div>
                  <HiOutlineChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                </button>
              );
            })}
          </div>
        )}

        {/* ================= DRILL DOWN VIEW ================= */}
        {activeMenu && !isCollapsed && (
          <div>
            {renderNestedItems(activeMenu.children, 0, location, expandedSubMenus, toggleSubMenu, isCollapsed)}
          </div>
        )}
      </div>

      {/* User Profile Footer - Fixed at bottom, always visible */}
      <div className="flex-shrink-0 border-t border-gray-200 p-1 bg-white">
        {isCollapsed ? (
          <div className="relative">
            <Tooltip content={userName}>
              <div className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{userName}</p>
              <p className="text-xs font-semibold text-gray-500 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebaritems;
