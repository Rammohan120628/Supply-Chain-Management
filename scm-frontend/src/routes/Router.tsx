// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { usePermissions } from '../context/PermissionContext/PermissionContext';
import RequirePermission from '../views/RequirePermission/RequirePermission';

// After login – common empty screen for all users
import EmptyScreen from 'src/views/EmptyScreen';

// ---------- All your original imports (unchanged) ----------
import ReceiveItemFromSupplier from 'src/views/StockReceive/ReceiveItemFromSupplier';
import StockReceiveInvoice from 'src/views/StockReceiveInvoice/ReceiveItemFromSupplier';
import Locationrequest from 'src/views/LocationRequest/locationRequest';
import LocationRequestBulkUpload from 'src/views/LocationRequestBulkUpload/LocationRequestBulkUpload';
import EditLocationrequest from 'src/views/EditLocationRequest/EditLocationReq';
import ChangetheDeliveryLocation from 'src/views/ChangetheDelivery-Loc/ChnangetheDelivery-Loc';
import ChangetheDeliveryLocationSupplier from 'src/views/ChangetheDelSupplier/ChangetheDelSupplier';

// reports (lazy loaded)
const EnteredQuatationRequest = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/QuotationRequest/EnteredQuatationRequest')),
);
const Consolidation = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/QuotationRequest/Consolidation')),
);
const QuotationRequestReport = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/QuotationRequest/QuotationRequestReport')),
);
const SupplierPriceConfirmation = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/QuotationRequest/SupplierPriceConfirmation')),
);
const SelectedSupplier = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/QuotationRequest/SelectedSupplier')),
);
const LocationRequest = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/LocationRequest/LocationRequest')),
);
const PurchaseOrderOverFall = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/DeliveryPlanandPO/PurchaseOrderOverFall')),
);
const SuppliersDeliveryDetailsByDelivery = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemReceiving/SuppliersDeliveryDetailsByDelivery')),
);
const SupplierInvoiceDetailsByInvoice = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemReceiving/SuppliersInvoceDetailsByInvoice')),
);
const SupplierInvoiceDetailsByInvoiceSummary = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemReceiving/SuppliersInvoiceDetailsByInvoiceSummary')),
);
const CwhDeliveryDetailsByLocation = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemDelivery/CwhDeliveryDetailsByLocation')),
);
const CwhDeliveryDetailsByInvoice = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemDelivery/CwhDeliveryDetailsByInvoice')),
);
const CWHDeliveryNoteInvoiceForLocation = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemDelivery/CWHDeliveryNoteInvoiceForLocation'))
);
const CwhSavingsReport = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemFullTransaction/CwhSavings')),
);
const SavingsByCWHInvoiceWithLocations = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemFullTransaction/SavingsByCWHInvoiceWithLocations')),
);
const SavingsByLocationItems = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemFullTransaction/SavingsByLocationItems')),
);
const ItemFullTransactions = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemFullTransaction/ItemFullTransactions')),
);
const EomInventoryReport = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemFullTransaction/EomInventoryReport')),
);
const CreditBookReport = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/ItemFullTransaction/CreditBookReport')),
);
const IPAS = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/SupplierRelated/IPAS')),
);
const PurchasePriceAnalysisReport = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/Inventory/PurchasePriceAnalysisReport'))
);
const TheoriticalStockExcel = Loadable(
  lazy(() => import('../views/OverallReport/OverallReport//Reports/Inventory/TheoriticalStockExcel'))
);

import OverAllReport from 'src/views/OverallReport/OverallReport/OverallReport';
import ItemReturnFromLocationsSummaryReport from 'src/views/OverallReport/OverallReport//Reports/ItemReceiving/itemRetfromLocSum';
import LocationParticularRequest from 'src/views/OverallReport/OverallReport//Reports/LocationRequest/LocParticularReq';
import LocationRequestRecap from 'src/views/OverallReport/OverallReport//Reports/LocationRequest/LocreqRecap';
// import CWHLoadingSheet from 'src/views/OverallReport/OverallReport//Reports/DeliveryPlanandPO/CWHloadingSheet';
import ItemDetails from 'src/views/OverallReport/OverallReport//Reports/Inventory/itemDetails';
import TheoriticalStockPdf from 'src/views/OverallReport/OverallReport//Reports/Inventory/TheoriticalStock';
import SavingsSummaryByLocation from 'src/views/OverallReport/OverallReport//Reports/ItemFullTransaction/SavingSumByLoc';
import CashAccountSummary from 'src/views/OverallReport/OverallReport//Reports/CashBook/CashAccSumm';
import SupplierStatementSummary from 'src/views/OverallReport/OverallReport//Reports/SupplierRelated/suppStatmentSum';
import ItemMovementRecap from 'src/views/OverallReport/OverallReport//Reports/ItemFullTransaction/ItemMovRecap';
import OpeningStock from 'src/views/OverallReport/OverallReport//Reports/Inventory/openingStock';
import CashMovementReport from 'src/views/OverallReport/OverallReport//Reports/CashBook/CashMovReport';
import SupplierStatement from 'src/views/OverallReport/OverallReport//Reports/SupplierRelated/SupplStatement';
import ItemReturnFromLocation from 'src/views/OverallReport/OverallReport//Reports/ItemReceiving/itemRetFromLocRep';

import AutoGeneratePO from 'src/views/AutoGenPO/AutoGenPO';
import PurchaseOrderCreation from 'src/views/PurchaseOrdCreation/PurchaseOrdCreation';
import ItemCreation from 'src/views/Item/ItemCreation';
import ItemUpdate from 'src/views/ItemUpdate/ItemUpdate';
import ItemCreationView from 'src/views/Item/Table';
import EntityCreation from 'src/views/Entity/Entity';
import ProfitCenter from 'src/views/ProfitCenter/ProfitCenter';
import StockReceiveItemFromLocation from 'src/views/StockReceiveItemFromLoc/ReceiveItemFromLoc';
// import OtherCashDisbursement from 'src/views/CASH/OtherCashDis';
// import PysicalStock from 'src/views/STOCK/PysicalStock';
import VATCategory from 'src/views/VatCategory/VatCategory';
import SupplierCreation from 'src/views/SupplierCreation/SupplierCreation';
import ItemUnit from 'src/views/ItemUnit/ItemUnit';
import ItemState from 'src/views/ItemState/ItemState';
import ItemAccount from 'src/views/ItemAccount/ItemAccount';
import ConsolidateAccount from 'src/views/ConsolidateAccount/ConsolidateAcc';
import ItemOrigin from 'src/views/ItemOrigin/ItemOrigin';
import ItemQuantity from 'src/views/ItemQuantity/ItemQuantity';
import ItemCategory from 'src/views/ItemCategory/ItemCategory';
import RelateItemWithSupplier from 'src/views/RelateItemWithSupplier/RelateItemWithSupplier';
import ItemCessionPrice from 'src/views/ItemCessionPrice/ItemCessionPrice';
import ManagersCreations from 'src/views/ManagerCreation/ManagerCreation';
import ApproveProductsCreation from 'src/views/ApproveProductCreation/ApproveprCreation';
import Quotationrequest from 'src/views/Quotationrequest/quotationpreq';
import QuotationRequestBulkUpload from 'src/views/QuotationReqBulkUpload/QuotationReqBulkUpload';
import EditQuotationrequest from 'src/views/EditQuotationRequest/EditQuotationRequest';
import ConsolidationofQuotationRequest from 'src/views/ConsolidationofQuotationRequest/ConsolidationofQuotationRequest';
import PrepareQuotation from 'src/views/PrepareQuotation/PrepareQuotation';
import QuotationReply from 'src/views/QuotationReply/QuotationReply';
import PriceComputation from 'src/views/PriceComputation/PriceComputation';
import PriceComparisionPreview from 'src/views/PriceComparisionPreview/PriceComparisionPreview';
import ChangeSystemSelectedSupllierForItems from 'src/views/ChangeSystemSelectedSupllierForItems/ChangeSystemSelectedSupllierForItems';
import EditSystemSelectedSupllierForItems from 'src/views/EditSystemSelectedSupllierForItems/EditSystemSelectedSupllierForItems';
import FinalizetheSupplierSelection from 'src/views/FinalizetheSupplierSelection/FinalizetheSupplierSelection';
import PuchasePeriodClosing from 'src/views/PuchasePeriodClosing/PuchasePeriodClosing';

import DuplicateSupplierItemTender from 'src/views/DuplicateSupplierItemTender/DuplicateSupplierItemTender';
import TenderPeriodClosing from 'src/views/TenderPeriodClosing/TenderPeriodClosing';
import DuplicateSupplierSelectionStock from 'src/views/DuplicateSupplierSelectionStock/DuplicateSupplierSelectionStock';
import StockPeriodClosing from 'src/views/StockPeriodClosing/StockPeriodClosing';
import DeliveryItemToLocation from 'src/views/StockDelivery/StockDelivery';
import ReturnItemToSupplier from 'src/views/StockDelReturnItem/StockDelReturnItem';
import ReceiveCreditNote from 'src/views/StockDelCreditNote/StockDelCreditNote';
import OtherCashDisbursement from 'src/views/CASH/OtherCashDis';
import PhysicalStock from 'src/views/STOCK/PysicalStock';
import ProjectSettingsConfiguration from 'src/views/CommonMaster/CommonAdmin';
import CWHLoadingSheet from 'src/views/OverallReport/OverallReport//Reports/DeliveryPlanandPO/CWHloadingSheet';
import UserMaster from 'src/views/UserMaster/usermaster';
import ScreenRights from 'src/views/UserMaster/ScreenRights';
import UserLog from 'src/views/UserMaster/UserLog';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const FrontendPageLayout = Loadable(lazy(() => import('../layouts/blank/FrontendLayout')));

// Dashboards
const EcommerceDashboard = Loadable(lazy(() => import('../views/dashboards/Ecommerce')));
const Analytics = Loadable(lazy(() => import('../views/dashboards/Analytics')));
const Crm = Loadable(lazy(() => import('../views/dashboards/Crm')));

/* ****Apps***** */
const Contact = Loadable(lazy(() => import('../views/apps/contact/Contact')));
const Ecommerce = Loadable(lazy(() => import('../views/apps/eCommerce/Ecommerce')));
const EcommerceDetail = Loadable(lazy(() => import('../views/apps/eCommerce/EcommerceDetail')));
const EcommerceAddProduct = Loadable(
  lazy(() => import('../views/apps/eCommerce/EcommerceAddProduct')),
);
const EcommerceEditProduct = Loadable(
  lazy(() => import('../views/apps/eCommerce/EcommerceEditProduct')),
);
const EcomProductList = Loadable(lazy(() => import('../views/apps/eCommerce/EcomProductList')));
const EcomProductCheckout = Loadable(
  lazy(() => import('../views/apps/eCommerce/EcommerceCheckout')),
);
const Blog = Loadable(lazy(() => import('../views/apps/blog/Blog')));
const BlogDetail = Loadable(lazy(() => import('../views/apps/blog/BlogDetail')));
const Chats = Loadable(lazy(() => import('../views/apps/chat/Chats')));
const UserProfile = Loadable(lazy(() => import('../views/apps/user-profile/UserProfile')));
const Followers = Loadable(lazy(() => import('../views/apps/user-profile/Followers')));
const Friends = Loadable(lazy(() => import('../views/apps/user-profile/Friends')));
const Gallery = Loadable(lazy(() => import('../views/apps/user-profile/Gallery')));
const InvoiceList = Loadable(lazy(() => import('../views/apps/invoice/List')));
const InvoiceCreate = Loadable(lazy(() => import('../views/apps/invoice/Create')));
const InvoiceDetail = Loadable(lazy(() => import('../views/apps/invoice/Detail')));
const InvoiceEdit = Loadable(lazy(() => import('../views/apps/invoice/Edit')));
const Notes = Loadable(lazy(() => import('../views/apps/notes/Notes')));
const Calendar = Loadable(lazy(() => import('../views/apps/calendar/BigCalendar')));
const Email = Loadable(lazy(() => import('../views/apps/email/Email')));
const Tickets = Loadable(lazy(() => import('../views/apps/tickets/Tickets')));
const CreateTickets = Loadable(lazy(() => import('../views/apps/tickets/CreateTickets')));
const Kanban = Loadable(lazy(() => import('../views/apps/kanban/Kanban')));

// theme pages
const RollbaseCASL = Loadable(lazy(() => import('../views/pages/rollbaseCASL/RollbaseCASL')));
const Faq = Loadable(lazy(() => import('../views/pages/faq/Faq')));
const Pricing = Loadable(lazy(() => import('../views/pages/pricing/Pricing')));
const AccountSetting = Loadable(
  lazy(() => import('../views/pages/account-setting/AccountSetting')),
);

// widget
const WidgetCards = Loadable(lazy(() => import('../views/widgets/cards/WidgetCards')));
const WidgetBanners = Loadable(lazy(() => import('../views/widgets/banners/WidgetBanners')));
const WidgetCharts = Loadable(lazy(() => import('../views/widgets/charts/WidgetCharts')));

// icons
const SolarIcon = Loadable(lazy(() => import('../views/icons/SolarIcon')));
const TablerIcon = Loadable(lazy(() => import('../views/icons/TablerIcon')));

// ui components
const FlowbiteAccordion = Loadable(lazy(() => import('../views/ui-components/FlowbiteAccordion')));
const FlowbiteAlert = Loadable(lazy(() => import('../views/ui-components/FlowbiteAlert')));
const FlowbiteAvatar = Loadable(lazy(() => import('../views/ui-components/FlowbiteAvatar')));
const FlowbiteBadge = Loadable(lazy(() => import('../views/ui-components/FlowbiteBadge')));
const FlowbiteBanner = Loadable(lazy(() => import('../views/ui-components/FlowbiteBanner')));
const FlowbiteBreadcrumb = Loadable(lazy(() => import('../views/ui-components/FlowbiteBreadcrumb')));
const FlowbiteButtonGroup = Loadable(lazy(() => import('../views/ui-components/FlowbiteButtonGroup')));
const FlowbiteButtons = Loadable(lazy(() => import('../views/ui-components/FlowbiteButtons')));
const FlowbiteCard = Loadable(lazy(() => import('../views/ui-components/FlowbiteCard')));
const FlowbiteCarousel = Loadable(lazy(() => import('../views/ui-components/FlowbiteCarousel')));
const FlowbiteDatePicker = Loadable(lazy(() => import('../views/ui-components/FlowbiteDatePicker')));
const FlowbiteDrawer = Loadable(lazy(() => import('../views/ui-components/FlowbiteDrawer')));
const FlowbiteDropdown = Loadable(lazy(() => import('../views/ui-components/FlowbiteDropdown')));
const FlowbiteFooter = Loadable(lazy(() => import('../views/ui-components/FlowbiteFooter')));
const FlowbiteKbd = Loadable(lazy(() => import('../views/ui-components/FlowbiteKbd')));
const FlowbiteListgroup = Loadable(lazy(() => import('../views/ui-components/FlowbiteListgroup')));
const FlowbiteMegamenu = Loadable(lazy(() => import('../views/ui-components/FlowbiteMegamenu')));
const FlowbiteModals = Loadable(lazy(() => import('../views/ui-components/FlowbiteModals')));
const FlowbiteNavbar = Loadable(lazy(() => import('../views/ui-components/FlowbiteNavbar')));
const FlowbitePagination = Loadable(lazy(() => import('../views/ui-components/FlowbitePagination')));
const FlowbitePopover = Loadable(lazy(() => import('../views/ui-components/FlowbitePopover')));
const FlowbiteProgressbar = Loadable(lazy(() => import('../views/ui-components/FlowbiteProgressbar')));
const FlowbiteRating = Loadable(lazy(() => import('../views/ui-components/FlowbiteRating')));
const FlowbiteSidebar = Loadable(lazy(() => import('../views/ui-components/FlowbiteSidebar')));
const FlowbiteSpinner = Loadable(lazy(() => import('../views/ui-components/FlowbiteSpinner')));
const FlowbiteTab = Loadable(lazy(() => import('../views/ui-components/FlowbiteTab')));
const FlowbiteTables = Loadable(lazy(() => import('../views/ui-components/FlowbiteTables')));
const FlowbiteTimeline = Loadable(lazy(() => import('../views/ui-components/FlowbiteTimeline')));
const FlowbiteToast = Loadable(lazy(() => import('../views/ui-components/FlowbiteToast')));
const FlowbiteTooltip = Loadable(lazy(() => import('../views/ui-components/FlowbiteTooltip')));
const FlowbiteTypography = Loadable(lazy(() => import('../views/ui-components/FlowbiteTypography')));

// tables
const BasicTable = Loadable(lazy(() => import('../views/tables/BasicTable')));
const CheckboxTable = Loadable(lazy(() => import('../views/tables/CheckboxTables')));
const HoverTable = Loadable(lazy(() => import('../views/tables/HoverTable')));
const StrippedTable = Loadable(lazy(() => import('../views/tables/StrippedTable')));

//react tables
const ReactBasicTable = Loadable(lazy(() => import('../views/react-tables/basic/page')));
const ReactColumnVisibilityTable = Loadable(
  lazy(() => import('../views/react-tables/columnvisibility/page')),
);
const ReactDenseTable = Loadable(lazy(() => import('../views/react-tables/dense/page')));
const ReactDragDropTable = Loadable(lazy(() => import('../views/react-tables/drag-drop/page')));
const ReactEditableTable = Loadable(lazy(() => import('../views/react-tables/editable/page')));
const ReactEmptyTable = Loadable(lazy(() => import('../views/react-tables/empty/page')));
const ReactExpandingTable = Loadable(lazy(() => import('../views/react-tables/expanding/page')));
const ReactFilterTable = Loadable(lazy(() => import('../views/react-tables/filtering/page')));
const ReactPaginationTable = Loadable(lazy(() => import('../views/react-tables/pagination/page')));
const ReactRowSelectionTable = Loadable(
  lazy(() => import('../views/react-tables/row-selection/page')),
);
const ReactSortingTable = Loadable(lazy(() => import('../views/react-tables/sorting/page')));
const ReactStickyTable = Loadable(lazy(() => import('../views/react-tables/sticky/page')));

// charts
const AreaChart = Loadable(lazy(() => import('../views/charts/AreaChart')));
const CandlestickChart = Loadable(lazy(() => import('../views/charts/CandlestickChart')));
const ColumnChart = Loadable(lazy(() => import('../views/charts/ColumnChart')));
const DoughnutChart = Loadable(lazy(() => import('../views/charts/DoughnutChart')));
const GredientChart = Loadable(lazy(() => import('../views/charts/GredientChart')));
const RadialbarChart = Loadable(lazy(() => import('../views/charts/RadialbarChart')));
const LineChart = Loadable(lazy(() => import('../views/charts/LineChart')));

// forms
const FormLayouts = Loadable(lazy(() => import('../views/forms/FormLayouts')));
const FormCustom = Loadable(lazy(() => import('../views/forms/FormCustom')));
const FormHorizontal = Loadable(lazy(() => import('../views/forms/FormHorizontal')));
const FormVertical = Loadable(lazy(() => import('../views/forms/FormVertical')));
const FormValidation = Loadable(lazy(() => import('../views/forms/FormValidation')));
const FormElements = Loadable(lazy(() => import('../views/forms/FormElements')));

// headless-ui
const Dialog = Loadable(lazy(() => import('../views/headless-ui/Dialog')));
const Disclosure = Loadable(lazy(() => import('../views/headless-ui/Disclosure')));
const Dropdown = Loadable(lazy(() => import('../views/headless-ui/Dropdown')));
const Popover = Loadable(lazy(() => import('../views/headless-ui/Popover')));
const Tabs = Loadable(lazy(() => import('../views/headless-ui/Tabs')));
const Transition = Loadable(lazy(() => import('../views/headless-ui/Transition')));

// headless-ui
const HeadlessButtons = Loadable(lazy(() => import('../views/headless-form/HeadlessButtons')));
const HeadlessCheckbox = Loadable(lazy(() => import('../views/headless-form/HeadlessCheckbox')));
const HeadlessComboBox = Loadable(lazy(() => import('../views/headless-form/HeadlessComboBox')));
const HeadlessFieldset = Loadable(lazy(() => import('../views/headless-form/HeadlessFieldset')));
const HeadlessInput = Loadable(lazy(() => import('../views/headless-form/HeadlessInput')));
const HeadlessListbox = Loadable(lazy(() => import('../views/headless-form/HeadlessListbox')));
const HeadlessRadioGroup = Loadable(lazy(() => import('../views/headless-form/HeadlessRadioGroup')));
const HeadlessSelect = Loadable(lazy(() => import('../views/headless-form/HeadlessSelect')));
const HeadlessSwitch = Loadable(lazy(() => import('../views/headless-form/HeadlessSwitch')));
const HeadlessTextarea = Loadable(lazy(() => import('../views/headless-form/HeadlessTextarea')));

// Shadcn-ui
const ShadcnButton = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnButton')));
const ShadcnBadge = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnBadge')));
const ShadcnDropdown = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnDropdown')));
const ShadcnDialog = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnDialog')));
const ShadcnAlert = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnAlert')));
const ShadcnBreadcrumb = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnBreadcrumb')));
const ShadcnCurosel = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnCurosel')));
const ShadcnCard = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnCard')));
const ShadcnDatepicker = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnDatepicker')));
const ShadcnCombobox = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnCombobox')));
const ShadcnCollapsible = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnCollapsible')));
const ShadcnCommand = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnCommand')));
const ShadcnSkeleton = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnSkeleton')));
const ShadcnAvatar = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnAvatar')));
const ShadcnTooltip = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnTooltip')));
const ShadcnAccordion = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnAccordion')));
const ShadcnTab = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnTab')));
const ShadcnProgress = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnProgress')));
const ShadcnDrawer = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnDrawer')));
const ShadcnToast = Loadable(lazy(() => import('../views/shadcn-ui/ShadcnToast')));

// Shadcn Form
const ShadcnInput = Loadable(lazy(() => import('../views/shadcn-form/ShadcnInput')));
const ShadcnSelect = Loadable(lazy(() => import('../views/shadcn-form/ShadcnSelect')));
const ShadcnCheckbox = Loadable(lazy(() => import('../views/shadcn-form/ShadcnCheckbox')));
const ShadcnRadio = Loadable(lazy(() => import('../views/shadcn-form/ShadcnRadio')));

// Shadcn Table
const ShadcnBasicTable = Loadable(lazy(() => import('../views/shadcn-tables/BasicTable')));

// authentication
const Login = Loadable(lazy(() => import('../views/authentication/auth1/Login')));
const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register = Loadable(lazy(() => import('../views/authentication/auth1/Register')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/auth1/ForgotPassword')));
const ForgotPassword2 = Loadable(
  lazy(() => import('../views/authentication/auth2/ForgotPassword')),
);
const TwoSteps = Loadable(lazy(() => import('../views/authentication/auth1/TwoSteps')));
const TwoSteps2 = Loadable(lazy(() => import('../views/authentication/auth2/TwoSteps')));
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// landingpage
const Landingpage = Loadable(lazy(() => import('../views/pages/landingpages/LandingPages')));

// front end pages
const Homepage = Loadable(lazy(() => import('../views/pages/frontend-pages/Homepage')));
const About = Loadable(lazy(() => import('../views/pages/frontend-pages/About')));
const ContactPage = Loadable(lazy(() => import('../views/pages/frontend-pages/Contact')));
const Portfolio = Loadable(lazy(() => import('../views/pages/frontend-pages/Portfolio')));
const PagePricing = Loadable(lazy(() => import('../views/pages/frontend-pages/Pricing')));
const BlogPage = Loadable(lazy(() => import('../views/pages/frontend-pages/Blog')));
const BlogPost = Loadable(lazy(() => import('../views/pages/frontend-pages/BlogPost')));

// Simple Unauthorized component
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-2xl font-bold text-red-600">403 - Unauthorized</h1>
    <p className="text-gray-600 mt-2">You do not have permission to access this page.</p>
  </div>
);

// Main routes component – used inside BrowserRouter
const AppRoutes = () => {
  const { permissions } = usePermissions();

  return (
    <Routes>
      {/* Public route – moved from "/" to "/login" to avoid conflict */}
      <Route path="/login" element={<Login />} />

      {/* Protected layout – all routes under this require authentication */}
      <Route path="/" element={<FullLayout />}>
        {/* Index route: after login, all users see the empty screen */}
        <Route index element={<EmptyScreen />} />

        {/* All protected routes with permission checks (unchanged) */}
        <Route
          path="itemCreation"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemCreation />
            </RequirePermission>
          }
        />
        <Route
          path="ItemCreationList"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemCreationView />
            </RequirePermission>
          }
        />
        <Route
          path="itemUpdate"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemUpdate />
            </RequirePermission>
          }
        />
        <Route
          path="profitCenter"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ProfitCenter />
            </RequirePermission>
          }
        />
        <Route
          path="Entity"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <EntityCreation />
            </RequirePermission>
          }
        />
        <Route
          path="VATCategory"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <VATCategory />
            </RequirePermission>
          }
        />
        <Route
          path="ItemUnit"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemUnit />
            </RequirePermission>
          }
        />
        <Route
          path="itemSubMaster/ItemState"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemState />
            </RequirePermission>
          }
        />
        <Route
          path="itemSubMaster/ItemAccount"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemAccount />
            </RequirePermission>
          }
        />
        <Route
          path="itemSubMaster/ConsolidateAccount"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ConsolidateAccount />
            </RequirePermission>
          }
        />
        <Route
          path="itemSubMaster/ItemOrigin"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemOrigin />
            </RequirePermission>
          }
        />
        <Route
          path="itemSubMaster/ItemQuantity"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemQuantity />
            </RequirePermission>
          }
        />
        <Route
          path="itemSubMaster/ItemCategory"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemCategory />
            </RequirePermission>
          }
        />
        <Route
          path="QuotationRequest"
          element={
            <RequirePermission permissionKey="renderQuotationRequest">
              <Quotationrequest />
            </RequirePermission>
          }
        />
        <Route
          path="QuotationRequestBulkUpload"
          element={
            <RequirePermission permissionKey="renderQuotationRequest">
              <QuotationRequestBulkUpload />
            </RequirePermission>
          }
        />
        <Route
          path="EditQuotationRequest"
          element={
            <RequirePermission permissionKey="renderQuotationRequest">
              <EditQuotationrequest />
            </RequirePermission>
          }
        />
        <Route
          path="ConsolidationofQuotationRequest"
          element={
            <RequirePermission permissionKey="renderConslidation">
              <ConsolidationofQuotationRequest />
            </RequirePermission>
          }
        />
        <Route
          path="PrepareQuotation"
          element={
            <RequirePermission permissionKey="renderPrepareQuotation">
              <PrepareQuotation />
            </RequirePermission>
          }
        />
        <Route
          path="QuotationReply"
          element={
            <RequirePermission permissionKey="renderQuotationReply">
              <QuotationReply />
            </RequirePermission>
          }
        />
        <Route
          path="PriceComputation"
          element={
            <RequirePermission permissionKey="renderPriceComputation">
              <PriceComputation />
            </RequirePermission>
          }
        />
        <Route
          path="PriceComparisionPreview"
          element={
            <RequirePermission permissionKey="renderPriceComparisonPreview">
              <PriceComparisionPreview />
            </RequirePermission>
          }
        />
        <Route
          path="ChangeSystemSelectedSupllierForItems"
          element={
            <RequirePermission permissionKey="renderChangeSysSelecSupp">
              <ChangeSystemSelectedSupllierForItems />
            </RequirePermission>
          }
        />
        <Route
          path="EditSystemSelectedSupllierForItems"
          element={
            <RequirePermission permissionKey="renderEditSysSelecSupp">
              <EditSystemSelectedSupllierForItems />
            </RequirePermission>
          }
        />
        <Route
          path="FinalizetheSupplierSelection"
          element={
            <RequirePermission permissionKey="renderFinalizeTheSupplierSelection">
              <FinalizetheSupplierSelection />
            </RequirePermission>
          }
        />
        <Route
          path="PuchasePeriodClosing"
          element={
            <RequirePermission permissionKey="renderPurchasePeriodClosing">
              <PuchasePeriodClosing />
            </RequirePermission>
          }
        />
        <Route
          path="DuplicateSupplierSelectionStock"
          element={
            <RequirePermission permissionKey="renderDuplicateSupplierSelection">
              <DuplicateSupplierSelectionStock />
            </RequirePermission>
          }
        />
        <Route
          path="StockPeriodClosing"
          element={
            <RequirePermission permissionKey="renderStockPeriodClosing">
              <StockPeriodClosing />
            </RequirePermission>
          }
        />
        <Route
          path="DuplicateSupplierItemTender"
          element={
            <RequirePermission permissionKey="renderDuplicateSupplierSelectionTender">
              <DuplicateSupplierItemTender />
            </RequirePermission>
          }
        />
        <Route
          path="TenderPeriodClosing"
          element={
            <RequirePermission permissionKey="renderTenderPeriodClosing">
              <TenderPeriodClosing />
            </RequirePermission>
          }
        />
        <Route
          path="ReceiveItemFromSupplier"
          element={
            <RequirePermission permissionKey="renderReceiveItemFromSuppl">
              <ReceiveItemFromSupplier />
            </RequirePermission>
          }
        />
        <Route
          path="StockReceiveInvoice"
          element={
            <RequirePermission permissionKey="renderReceiveInvoice">
              <StockReceiveInvoice />
            </RequirePermission>
          }
        />
        <Route
          path="LocationRequest"
          element={
            <RequirePermission permissionKey="renderLocationRequest">
              <Locationrequest />
            </RequirePermission>
          }
        />
        <Route
          path="LocationRequestBulkUpload"
          element={
            <RequirePermission permissionKey="renderLocationRequestBu">
              <LocationRequestBulkUpload />
            </RequirePermission>
          }
        />
        <Route
          path="Edit-LocationRequest"
          element={
            <RequirePermission permissionKey="renderEditLocationRequest">
              <EditLocationrequest />
            </RequirePermission>
          }
        />
        <Route
          path="ChangetheDeliveryLocation"
          element={
            <RequirePermission permissionKey="renderChangeDelievryLoc">
              <ChangetheDeliveryLocation />
            </RequirePermission>
          }
        />
        <Route
          path="ChangetheDeliveryLocation-Supplier"
          element={
            <RequirePermission permissionKey="renderChangeDelievryLocSup">
              <ChangetheDeliveryLocationSupplier />
            </RequirePermission>
          }
        />
        <Route
          path="AutoGeneratePO"
          element={
            <RequirePermission permissionKey="renderAutoPo">
              <AutoGeneratePO />
            </RequirePermission>
          }
        />
        <Route
          path="PurchaseOrderCreation"
          element={
            <RequirePermission permissionKey="renderManualPoCreation">
              <PurchaseOrderCreation />
            </RequirePermission>
          }
        />
        <Route
          path="StockReceiveItemFromLocation"
          element={
            <RequirePermission permissionKey="renderItemFromLocation">
              <StockReceiveItemFromLocation />
            </RequirePermission>
          }
        />
        <Route
          path="DeliveryItemToLocation"
          element={
            <RequirePermission permissionKey="renderDeliveryItemToLocation">
              <DeliveryItemToLocation />
            </RequirePermission>
          }
        />
        <Route
          path="ReturnItemToSupplier"
          element={
            <RequirePermission permissionKey="renderReturnItemToSupplier">
              <ReturnItemToSupplier />
            </RequirePermission>
          }
        />
        <Route
          path="ReceiveCreditNote"
          element={
            <RequirePermission permissionKey="renderReceiveCreditNote">
              <ReceiveCreditNote />
            </RequirePermission>
          }
        />
        <Route
          path="PysicalStock"
          element={
            <RequirePermission permissionKey="renderPhysicalStock">
              <PhysicalStock />
            </RequirePermission>
          }
        />
        <Route
          path="OtherCashDisbursement"
          element={
            <RequirePermission permissionKey="renderOCD">
              <OtherCashDisbursement />
            </RequirePermission>
          }
        />
        <Route
          path="SupplierCreation"
          element={
            <RequirePermission permissionKey="renderSupplierCreation">
              <SupplierCreation />
            </RequirePermission>
          }
        />
        <Route
          path="RelateItemWithSupplier"
          element={
            <RequirePermission permissionKey="renderRelateItemWithSupplier">
              <RelateItemWithSupplier />
            </RequirePermission>
          }
        />
        <Route
          path="ItemCessionprice"
          element={
            <RequirePermission permissionKey="renderItemRelatedMaster">
              <ItemCessionPrice />
            </RequirePermission>
          }
        />
        <Route
          path="ManagerCreation"
          element={
            <RequirePermission permissionKey="renderCommonMaster">
              <ManagersCreations />
            </RequirePermission>
          }
        />
        <Route
          path="ApproveProductCreation"
          element={
            <RequirePermission permissionKey="renderCommonMaster">
              <ApproveProductsCreation />
            </RequirePermission>
          }
        />
        <Route
          path="User/UserMaster"
          element={
            <RequirePermission permissionKey="renderCommonMaster">
              <UserMaster />
            </RequirePermission>
          }
        />
        <Route
          path="User/ScreenRights"
          element={
            <RequirePermission permissionKey="renderCommonMaster">
              <ScreenRights />
            </RequirePermission>
          }
        />
        <Route
          path="User/UserLog"
          element={
            <RequirePermission permissionKey="renderCommonMaster">
              <UserLog />
            </RequirePermission>
          }
        />
        <Route
          path="overAllReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <OverAllReport />
            </RequirePermission>
          }
        />
        {/* Individual report routes (protected) */}
        <Route
          path="ItemReturnFromLocationsSummaryReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <ItemReturnFromLocationsSummaryReport />
            </RequirePermission>
          }
        />
        <Route
          path="ItemsReturnFromLocationReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <ItemReturnFromLocation />
            </RequirePermission>
          }
        />
        <Route
          path="LocationParticularRequest"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <LocationParticularRequest />
            </RequirePermission>
          }
        />
        <Route
          path="LocationRequestRecap"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <LocationRequestRecap />
            </RequirePermission>
          }
        />
        <Route
          path="CWHLoadingSheet"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CWHLoadingSheet />
            </RequirePermission>
          }
        />
        <Route
          path="ItemDetails"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <ItemDetails />
            </RequirePermission>
          }
        />
        <Route
          path="TheoriticalStockPdf"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <TheoriticalStockPdf />
            </RequirePermission>
          }
        />
        <Route
          path="SavingsSummaryByLocation"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SavingsSummaryByLocation />
            </RequirePermission>
          }
        />
        <Route
          path="CashAccountSummary"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CashAccountSummary />
            </RequirePermission>
          }
        />
        <Route
          path="SupplierStatement"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SupplierStatement />
            </RequirePermission>
          }
        />
        <Route
          path="SupplierStatementSummary"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SupplierStatementSummary />
            </RequirePermission>
          }
        />
        <Route
          path="ItemMovementRecap"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <ItemMovementRecap />
            </RequirePermission>
          }
        />
        <Route
          path="OpeningStockReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <OpeningStock />
            </RequirePermission>
          }
        />
        <Route
          path="CashMovementReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CashMovementReport />
            </RequirePermission>
          }
        />
        <Route
          path="/EnteredQuatationRequest"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <EnteredQuatationRequest />
            </RequirePermission>
          }
        />
        <Route
          path="/Consolidation"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <Consolidation />
            </RequirePermission>
          }
        />
        <Route
          path="/QuotationRequestReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <QuotationRequestReport />
            </RequirePermission>
          }
        />
        <Route
          path="/SupplierPriceConfirmation"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SupplierPriceConfirmation />
            </RequirePermission>
          }
        />
        <Route
          path="/SelectedSupplier"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SelectedSupplier />
            </RequirePermission>
          }
        />
        <Route
          path="/LocationRequestReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <LocationRequest />
            </RequirePermission>
          }
        />
        <Route
          path="/PurchaseOrderOverFall"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <PurchaseOrderOverFall />
            </RequirePermission>
          }
        />
        <Route
          path="/SuppliersDeliveryDetailsByDelivery"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SuppliersDeliveryDetailsByDelivery />
            </RequirePermission>
          }
        />
        <Route
          path="/SuppliersInvoiceDetailsByInvoice"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SupplierInvoiceDetailsByInvoice />
            </RequirePermission>
          }
        />
        <Route
          path="/SuppliersInvoiceDetailsByInvoiceSummary"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SupplierInvoiceDetailsByInvoiceSummary />
            </RequirePermission>
          }
        />
        <Route
          path="/CwhDeliveryDetailsByLocation"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CwhDeliveryDetailsByLocation />
            </RequirePermission>
          }
        />
        <Route
          path="/CwhDeliveryDetailsByInvoice"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CwhDeliveryDetailsByInvoice />
            </RequirePermission>
          }
        />
        <Route
          path="/CWHDeliveryNoteInvoiceFilterBoth"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CWHDeliveryNoteInvoiceForLocation />
            </RequirePermission>
          }
        />
        <Route
          path="/CwhSavingsReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CwhSavingsReport />
            </RequirePermission>
          }
        />
        <Route
          path="/SavingsByCWHInvoiceWithLocations"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SavingsByCWHInvoiceWithLocations />
            </RequirePermission>
          }
        />
        <Route
          path="/SavingsByLocationItems"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <SavingsByLocationItems />
            </RequirePermission>
          }
        />
        <Route
          path="/ItemFullTransactions"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <ItemFullTransactions />
            </RequirePermission>
          }
        />
        <Route
          path="/EomInventoryReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <EomInventoryReport />
            </RequirePermission>
          }
        />
        <Route
          path="/CreditBookReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <CreditBookReport />
            </RequirePermission>
          }
        />
        <Route
          path="/IPASReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <IPAS />
            </RequirePermission>
          }
        />
        <Route
          path="/PurchasePriceAnalysisReport"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <PurchasePriceAnalysisReport />
            </RequirePermission>
          }
        />
        <Route
          path="/TheoriticalStockExcel"
          element={
            <RequirePermission
              permissionKey={
                permissions?.renderAllReportsIncludingSaving
                  ? 'renderAllReportsIncludingSaving'
                  : 'renderAllReportsExcludingSaving'
              }
            >
              <TheoriticalStockExcel />
            </RequirePermission>
          }
        />

        {/* Original demo routes (public within authenticated layout) */}
        <Route path="/x" element={<EcommerceDashboard />} />
        <Route path="/dashboards/analytics" element={<Analytics />} />
        <Route path="/dashboards/crm" element={<Crm />} />
        <Route path="/apps/contacts" element={<Contact />} />
        <Route path="/apps/ecommerce/shop" element={<Ecommerce />} />
        <Route path="/apps/ecommerce/list" element={<EcomProductList />} />
        <Route path="/apps/ecommerce/checkout" element={<EcomProductCheckout />} />
        <Route path="/apps/ecommerce/addproduct" element={<EcommerceAddProduct />} />
        <Route path="/apps/ecommerce/editproduct" element={<EcommerceEditProduct />} />
        <Route path="/apps/ecommerce/detail/:id" element={<EcommerceDetail />} />
        <Route path="/apps/blog/post" element={<Blog />} />
        <Route path="/apps/blog/detail/:id" element={<BlogDetail />} />
        <Route path="/apps/chats" element={<Chats />} />
        <Route path="/apps/user-profile/profile" element={<UserProfile />} />
        <Route path="/apps/user-profile/followers" element={<Followers />} />
        <Route path="/apps/user-profile/friends" element={<Friends />} />
        <Route path="/apps/user-profile/gallery" element={<Gallery />} />
        <Route path="/apps/invoice/list" element={<InvoiceList />} />
        <Route path="/apps/invoice/create" element={<InvoiceCreate />} />
        <Route path="/apps/invoice/detail/:id" element={<InvoiceDetail />} />
        <Route path="/apps/invoice/edit/:id" element={<InvoiceEdit />} />
        <Route path="/apps/notes" element={<Notes />} />
        <Route path="/apps/calendar" element={<Calendar />} />
        <Route path="/apps/email" element={<Email />} />
        <Route path="/apps/tickets" element={<Tickets />} />
        <Route path="/apps/tickets/create" element={<CreateTickets />} />
        <Route path="/apps/kanban" element={<Kanban />} />
        <Route path="/theme-pages/casl" element={<RollbaseCASL />} />
        <Route path="/theme-pages/pricing" element={<Pricing />} />
        <Route path="/theme-pages/faq" element={<Faq />} />
        <Route path="/theme-pages/account-settings" element={<AccountSetting />} />
        <Route path="/widgets/cards" element={<WidgetCards />} />
        <Route path="/widgets/banners" element={<WidgetBanners />} />
        <Route path="/widgets/charts" element={<WidgetCharts />} />
        <Route path="/icons/solar" element={<SolarIcon />} />
        <Route path="/icons/tabler" element={<TablerIcon />} />
        <Route path="/ui-components/accordion" element={<FlowbiteAccordion />} />
        <Route path="/ui-components/alert" element={<FlowbiteAlert />} />
        <Route path="/ui-components/avatar" element={<FlowbiteAvatar />} />
        <Route path="/ui-components/badge" element={<FlowbiteBadge />} />
        <Route path="/ui-components/banner" element={<FlowbiteBanner />} />
        <Route path="/ui-components/breadcrumb" element={<FlowbiteBreadcrumb />} />
        <Route path="/ui-components/button-group" element={<FlowbiteButtonGroup />} />
        <Route path="/ui-components/buttons" element={<FlowbiteButtons />} />
        <Route path="/ui-components/card" element={<FlowbiteCard />} />
        <Route path="/ui-components/carousel" element={<FlowbiteCarousel />} />
        <Route path="/ui-components/datepicker" element={<FlowbiteDatePicker />} />
        <Route path="/ui-components/drawer" element={<FlowbiteDrawer />} />
        <Route path="/ui-components/dropdown" element={<FlowbiteDropdown />} />
        <Route path="/ui-components/footer" element={<FlowbiteFooter />} />
        <Route path="/ui-components/kbd" element={<FlowbiteKbd />} />
        <Route path="/ui-components/listgroup" element={<FlowbiteListgroup />} />
        <Route path="/ui-components/megamenu" element={<FlowbiteMegamenu />} />
        <Route path="/ui-components/modals" element={<FlowbiteModals />} />
        <Route path="/ui-components/navbar" element={<FlowbiteNavbar />} />
        <Route path="/ui-components/pagination" element={<FlowbitePagination />} />
        <Route path="/ui-components/popover" element={<FlowbitePopover />} />
        <Route path="/ui-components/progressbar" element={<FlowbiteProgressbar />} />
        <Route path="/ui-components/rating" element={<FlowbiteRating />} />
        <Route path="/ui-components/sidebar" element={<FlowbiteSidebar />} />
        <Route path="/ui-components/spinner" element={<FlowbiteSpinner />} />
        <Route path="/ui-components/tab" element={<FlowbiteTab />} />
        <Route path="/ui-components/tables" element={<FlowbiteTables />} />
        <Route path="/ui-components/timeline" element={<FlowbiteTimeline />} />
        <Route path="/ui-components/toast" element={<FlowbiteToast />} />
        <Route path="/ui-components/tooltip" element={<FlowbiteTooltip />} />
        <Route path="/ui-components/typography" element={<FlowbiteTypography />} />
        <Route path="/charts/area" element={<AreaChart />} />
        <Route path="/charts/line" element={<LineChart />} />
        <Route path="/charts/gradient" element={<GredientChart />} />
        <Route path="/charts/candlestick" element={<CandlestickChart />} />
        <Route path="/charts/column" element={<ColumnChart />} />
        <Route path="/charts/doughnut" element={<DoughnutChart />} />
        <Route path="/charts/radialbar" element={<RadialbarChart />} />
        <Route path="/tables/basic" element={<BasicTable />} />
        <Route path="/tables/striped-row" element={<StrippedTable />} />
        <Route path="/tables/hover-table" element={<HoverTable />} />
        <Route path="/tables/checkbox-table" element={<CheckboxTable />} />
        <Route path="/react-tables/basic" element={<ReactBasicTable />} />
        <Route path="/react-tables/column-visibility" element={<ReactColumnVisibilityTable />} />
        <Route path="/react-tables/drag-drop" element={<ReactDragDropTable />} />
        <Route path="/react-tables/dense" element={<ReactDenseTable />} />
        <Route path="/react-tables/editable" element={<ReactEditableTable />} />
        <Route path="/react-tables/empty" element={<ReactEmptyTable />} />
        <Route path="/react-tables/expanding" element={<ReactExpandingTable />} />
        <Route path="/react-tables/filtering" element={<ReactFilterTable />} />
        <Route path="/react-tables/pagination" element={<ReactPaginationTable />} />
        <Route path="/react-tables/row-selection" element={<ReactRowSelectionTable />} />
        <Route path="/react-tables/sorting" element={<ReactSortingTable />} />
        <Route path="/react-tables/sticky" element={<ReactStickyTable />} />
        <Route path="/forms/form-elements" element={<FormElements />} />
        <Route path="/forms/form-validation" element={<FormValidation />} />
        <Route path="/forms/form-horizontal" element={<FormHorizontal />} />
        <Route path="/forms/form-vertical" element={<FormVertical />} />
        <Route path="/forms/form-layouts" element={<FormLayouts />} />
        <Route path="/forms/form-custom" element={<FormCustom />} />
        <Route path="/headless-ui/dialog" element={<Dialog />} />
        <Route path="/headless-ui/disclosure" element={<Disclosure />} />
        <Route path="/headless-ui/dropdown" element={<Dropdown />} />
        <Route path="/headless-ui/popover" element={<Popover />} />
        <Route path="/headless-ui/tabs" element={<Tabs />} />
        <Route path="/headless-ui/transition" element={<Transition />} />
        <Route path="/headless-form/buttons" element={<HeadlessButtons />} />
        <Route path="/headless-form/checkbox" element={<HeadlessCheckbox />} />
        <Route path="/headless-form/combobox" element={<HeadlessComboBox />} />
        <Route path="/headless-form/fieldset" element={<HeadlessFieldset />} />
        <Route path="/headless-form/input" element={<HeadlessInput />} />
        <Route path="/headless-form/listbox" element={<HeadlessListbox />} />
        <Route path="/headless-form/radiogroup" element={<HeadlessRadioGroup />} />
        <Route path="/headless-form/select" element={<HeadlessSelect />} />
        <Route path="/headless-form/switch" element={<HeadlessSwitch />} />
        <Route path="/headless-form/textarea" element={<HeadlessTextarea />} />
        <Route path="/shadcn-ui/buttons" element={<ShadcnButton />} />
        <Route path="/shadcn-ui/badge" element={<ShadcnBadge />} />
        <Route path="/shadcn-ui/dropdown" element={<ShadcnDropdown />} />
        <Route path="/shadcn-ui/dialogs" element={<ShadcnDialog />} />
        <Route path="/shadcn-ui/alert" element={<ShadcnAlert />} />
        <Route path="/shadcn-ui/toast" element={<ShadcnToast />} />
        <Route path="/shadcn-ui/breadcrumb" element={<ShadcnBreadcrumb />} />
        <Route path="/shadcn-ui/carousel" element={<ShadcnCurosel />} />
        <Route path="/shadcn-ui/card" element={<ShadcnCard />} />
        <Route path="/shadcn-ui/datepicker" element={<ShadcnDatepicker />} />
        <Route path="/shadcn-ui/combobox" element={<ShadcnCombobox />} />
        <Route path="/shadcn-ui/collapsible" element={<ShadcnCollapsible />} />
        <Route path="/shadcn-ui/command" element={<ShadcnCommand />} />
        <Route path="/shadcn-ui/skeleton" element={<ShadcnSkeleton />} />
        <Route path="/shadcn-ui/avatar" element={<ShadcnAvatar />} />
        <Route path="/shadcn-ui/tooltip" element={<ShadcnTooltip />} />
        <Route path="/shadcn-ui/accordion" element={<ShadcnAccordion />} />
        <Route path="/shadcn-ui/tab" element={<ShadcnTab />} />
        <Route path="/shadcn-ui/progressbar" element={<ShadcnProgress />} />
        <Route path="/shadcn-ui/drawer" element={<ShadcnDrawer />} />
        <Route path="/shadcn-form/input" element={<ShadcnInput />} />
        <Route path="/shadcn-form/select" element={<ShadcnSelect />} />
        <Route path="/shadcn-form/checkbox" element={<ShadcnCheckbox />} />
        <Route path="/shadcn-form/radio" element={<ShadcnRadio />} />
        <Route path="/shadcn-tables/basic" element={<ShadcnBasicTable />} />
        <Route path="/sample-page" element={<SamplePage />} />
        <Route path="*" element={<Navigate to="/auth/404" />} />
      </Route>

      {/* Routes with BlankLayout */}
      <Route path="/" element={<BlankLayout />}>
        <Route path="/frontend-pages" element={<FrontendPageLayout />}>
          <Route path="homepage" element={<Homepage />} />
          <Route path="aboutus" element={<About />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="pricing" element={<PagePricing />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/detail/:id" element={<BlogPost />} />
        </Route>
        <Route path="/landingpage" element={<Landingpage />} />
        <Route path="/auth/auth1/login" element={<Login />} />
        <Route path="/auth/auth2/login" element={<Login2 />} />
        <Route path="/auth/auth1/register" element={<Register />} />
        <Route path="/auth/auth2/register" element={<Register2 />} />
        <Route path="/auth/auth1/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/auth2/forgot-password" element={<ForgotPassword2 />} />
        <Route path="/auth/auth1/two-steps" element={<TwoSteps />} />
        <Route path="/auth/auth2/two-steps" element={<TwoSteps2 />} />
        <Route path="/auth/maintenance" element={<Maintainance />} />
        <Route path="404" element={<Error />} />
        <Route path="/auth/404" element={<Error />} />
        <Route path="CommonAdmin" element={<ProjectSettingsConfiguration />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/auth/404" />} />
      </Route>
    </Routes>
  );
};

const Router = () => {
  return <AppRoutes />;
};

export default Router;