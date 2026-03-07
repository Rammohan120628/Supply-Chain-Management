// import 'flowbite';
// import { useState, useEffect, useContext, useMemo, memo } from 'react';
// import { Drawer, DrawerItems } from 'flowbite-react';
// import { Icon } from '@iconify/react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {  HiHome } from 'react-icons/hi';
// import Profile from "./Profile";
// import FullLogo from '../../shared/logo/FullLogo';
// import MobileHeaderItems from './MobileHeaderItems';
// import MobileSidebar from '../sidebar/MobileSidebar';
// import HorizontalMenu from '../../horizontal/header/HorizontalMenu';
// import { CustomizerContext } from 'src/context/CustomizerContext';
// import { DashboardContext } from 'src/context/DashboardContext/DashboardContext';
// import { Customizer } from '../../shared/customizer/Customizer';
// import { HiDocumentReport } from 'react-icons/hi';
// import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaBuilding, FaCoins, FaTag, FaBox, FaShoppingCart, FaWarehouse } from 'react-icons/fa';
// import { useNavigate } from 'react-router';

// interface HeaderPropsType {
//   layoutType: string;
// }

// // Move SlidePanel outside and memoize it to prevent re-renders
// const SlidePanel = memo(({ 
//   isOpen, 
//   onClose, 
//   themeColor, 
//   cwh, 
//    cwhName, 
//   tenderPeriod, 
//   purchasePeriod, 
//   stockPeriod, 
//   entity, 
//   currencyId, 
//   common 
// }: { 
//   isOpen: boolean; 
//   onClose: () => void; 
//   themeColor: string; 
//   cwh: string | null; 
//   cwhName: string | null;
//   tenderPeriod: string; 
//   purchasePeriod: string; 
//   stockPeriod: string; 
//   entity: string | null; 
//   currencyId: string | null; 
//   common: string | null; 
// }) => (
//   <Drawer
//     open={isOpen}
//     onClose={onClose}
//     position="right"
//     backdrop={true}
//     className="w-[380px] bg-white dark:bg-gray-900 shadow-2xl"
//   >
//     <DrawerItems className="p-0">
//       <div className="relative">
//         {/* Premium Header with Gradient and Pattern */}
//         <div className={`bg-gradient-to-br ${themeColor} relative overflow-hidden`}>
//           {/* Decorative Pattern */}
//           <div className="absolute inset-0 opacity-10">
//             <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
//               <defs>
//                 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
//                 </pattern>
//               </defs>
//               <rect width="100%" height="100%" fill="url(#grid)" />
//             </svg>
//           </div>
          
//           {/* Close Button */}
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white/80 hover:text-white transition-all duration-200"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
          
//           {/* Location Header */}
//           <div className="px-8 pt-12 pb-16 relative z-10">
//             <div className="flex items-center gap-4">
//               {/* Location Icon with Ring */}
//               <div className="relative">
//                 <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
//                 <div className="relative p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
//                   <FaMapMarkerAlt className="w-8 h-8 text-white" />
//                 </div>
//               </div>
              
//               {/* Location Text */}
//               <div>
//                 <p className="text-sm font-medium text-white/80 mb-1">CENTRAL WAREHOUSE</p>
//                 <h2 className="text-3xl font-bold text-white tracking-tight">{cwh || 'Not Specified'}</h2>
//               </div>
//             </div>
//           </div>
          
//           {/* Curved Bottom Edge */}
//           <div className="absolute bottom-0 left-0 right-0">
//             <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
//               <path 
//                 fill="white" 
//                 className="dark:fill-gray-900"
//                 fillOpacity="1" 
//                 d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
//               />
//             </svg>
//           </div>
//         </div>

//         {/* Content Section */}
//         <div className="px-6 pb-8 -mt-8 relative z-20">
//           {/* Stats Cards */}
//           <div className="space-y-4">
//             {/* Tender Period Card */}
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
//             >
//               <div className="p-5">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
//                       <FaTag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tender Period</span>
//                   </div>
//                 </div>
//                 <p className="text-xl font-bold text-gray-900 dark:text-white pl-11">{tenderPeriod}</p>
//               </div>
//               <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400"></div>
//             </motion.div>

//             {/* Purchase Period Card */}
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
//             >
//               <div className="p-5">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
//                       <FaShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Period</span>
//                   </div>
//                 </div>
//                 <p className="text-xl font-bold text-gray-900 dark:text-white pl-11">{purchasePeriod}</p>
//               </div>
//               <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-400"></div>
//             </motion.div>

//             {/* Stock Period Card */}
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
//             >
//               <div className="p-5">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
//                       <FaBox className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Period</span>
//                   </div>
//                 </div>
//                 <p className="text-xl font-bold text-gray-900 dark:text-white pl-11">{stockPeriod}</p>
//               </div>
//               <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-400"></div>
//             </motion.div>

//             {/* Entity & Currency Section */}
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="mt-6 grid grid-cols-2 gap-4"
//             >
//               {/* Entity Card */}
//               <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
//                 <div className="flex items-center gap-2 mb-2">
//                   <FaBuilding className="w-4 h-4 text-amber-500" />
//                   <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Entity</span>
//                 </div>
//                 <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
//                   {entity || '—'}
//                 </p>
//               </div>

//               {/* Currency Card */}
//               <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
//                 <div className="flex items-center gap-2 mb-2">
//                   <FaCoins className="w-4 h-4 text-emerald-500" />
//                   <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Currency</span>
//                 </div>
//                 <p className="text-lg font-semibold text-gray-900 dark:text-white">
//                   {currencyId || '—'}
//                 </p>
//               </div>
//             </motion.div>
//           </div>

//           {/* Additional Info (if common exists) */}
//           {common && (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="mt-6 text-center"
//             >
//               <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">
//                 <FaWarehouse className="w-3 h-3" />
//                 {common}
//               </span>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </DrawerItems>
//   </Drawer>
// ));

// const Header = ({ layoutType }: HeaderPropsType) => {
//   const [isSticky, setIsSticky] = useState(false);
//   const [currentDateTime, setCurrentDateTime] = useState(new Date());
//   const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
//   const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

//   // Get data from localStorage
//   const tenderPeriodStr = localStorage.getItem("tenderPeriod");
//   const purchasePeriodStr = localStorage.getItem("purchasePeriod");
//   const stockPeriodStr = localStorage.getItem("stockPeriod");
//   const entity = localStorage.getItem("entity");
//   const currencyId = localStorage.getItem("currencyId") ;
//   const common = localStorage.getItem("common");
//   const cwh = localStorage.getItem("cwh") ; 

//   // Format period from DD-MM-YYYY to Month YYYY
//   const formatPeriod = (periodStr: string | null): string => {
//     if (!periodStr) return "Not Set";
//     const [day, month, year] = periodStr.split("-").map(Number);
//     const date = new Date(year, month - 1, day);
//     return date.toLocaleString("default", { month: "short", year: "numeric" });
//   };

//   const tenderPeriod = formatPeriod(tenderPeriodStr);
//   const purchasePeriod = formatPeriod(purchasePeriodStr);
//   const stockPeriod = formatPeriod(stockPeriodStr);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsSticky(window.scrollY > 30);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Optimize date time updates - update every minute instead of every second
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentDateTime(new Date()), 60000); // Update every minute
//     return () => clearInterval(timer);
//   }, []);

//   const { setIsCollapse, isCollapse, isLayout, setActiveMode, activeMode, activeTheme } = useContext(CustomizerContext);
//   const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useContext(DashboardContext);
//   const [mobileMenu, setMobileMenu] = useState('');
//   const navigate = useNavigate();

//   const getThemeColor = () => {
//     const colors = {
//       BLUE_THEME: 'from-blue-950 to-blue-950',
//       AQUA_THEME: 'from-[#0074BA] to-[#005A92]',
//       PURPLE_THEME: 'from-[#763EBD] to-[#5D2F9E]',
//       GREEN_THEME: 'from-[#0A7EA4] to-[#086485]',
//       CYAN_THEME: 'from-[#01C0C8] to-[#019AA1]',
//       ORANGE_THEME: 'from-[#FA896B] to-[#F86A46]',
//       RED_THEME: 'from-[#FF4B4B] to-[#FF2A2A]',
//       AMBER_THEME: 'from-[#FF9500] to-[#E67E00]',
//       INDIGO_THEME: 'from-[#7857FF] to-[#5E3CFF]',
//       PINK_THEME: 'from-[#FF2E63] to-[#E61A4F]',
//       MINT_THEME: 'from-[#43CC7A] to-[#33B367]',
//       DEEP_PURPLE_THEME: 'from-[#5E35B1] to-[#4C2A8F]',
//       ROSE_THEME: 'from-[#E91E63] to-[#D81B60]',
//       DARK_BLUE_THEME: 'from-[#3949AB] to-[#2F3D8F]',
//       MAGENTA_THEME: 'from-[#D81B60] to-[#B7154F]',
//       TEAL_THEME: 'from-[#009688] to-[#007D70]',
//       DEEP_ORANGE_THEME: 'from-[#FF6D00] to-[#E65C00]',
//       LIME_THEME: 'from-[#7CB342] to-[#689F38]',
//       VIOLET_THEME: 'from-[#8E24AA] to-[#7B1FA2]',
//       EMERALD_THEME: 'from-[#009688] to-[#00897B]',
//       CORAL_THEME: 'from-[#FF7043] to-[#F4511E]',
//       GOLD_THEME: 'from-[#FFB300] to-[#FFA000]',
//       SAPPHIRE_THEME: 'from-[#2962FF] to-[#1A53FF]',
//       RUBY_THEME: 'from-[#E53935] to-[#D32F2F]',
//       FOREST_THEME: 'from-[#43A047] to-[#388E3C]',
//       LAVENDER_THEME: 'from-[#9C27B0] to-[#8E24AA]',
//       SKY_THEME: 'from-[#03A9F4] to-[#039BE5]',
//       MARINE_THEME: 'from-[#00BCD4] to-[#00ACC1]',
//       SUNSET_THEME: 'from-[#FF9800] to-[#F57C00]',
//     };
//     return colors[activeTheme] || colors.BLUE_THEME;
//   };

//   const toggleMode = () => setActiveMode(activeMode === 'light' ? 'dark' : 'light');
//   const handleClose = () => setIsMobileSidebarOpen(false);
//   const handleSlidePanelClose = () => setIsSlidePanelOpen(false);

//   // Memoize the formatted date time to prevent recalculation on every render
//   const formatDateTime = (date: Date) => {
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = date.toLocaleString('en-US', { month: 'short' });
//     const year = date.getFullYear();
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     // Remove seconds to reduce visual changes
//     return `${day}-${month}-${year} ${hours}:${minutes} IST`;
//   };

//   const formattedDateTime = formatDateTime(currentDateTime);
//  const handleHomeClick = () => {
//     // Navigate to dashboard/home
//     window.location.href = 'quotationRequest'; // Adjust this path as needed
//   };
//   return (
//     <>
//       <header className={`sticky top-0 z-[5] ${isSticky ? 'shadow-md' : ''}`}>
//         <div className={`bg-gradient-to-r ${getThemeColor()} text-white shadow-sm`}>
//           <div
//             className={`${
//               layoutType === 'horizontal' ? 'container mx-auto px-4' : 'px-4 sm:px-6'
//             } ${isLayout === 'full' ? '!max-w-full' : ''} py-3`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <span
//                   onClick={() => setIsMobileSidebarOpen(true)}
//                   className="h-8 w-8 flex xl:hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
//                 >
//                   <Icon
//                     icon="solar:hamburger-menu-bold"
//                     height={20}
//                     className="font-bold"
//                   />
//                 </span>

//                 {layoutType === 'horizontal' ? (
//                   <div className="text-white scale-90">
//                     <FullLogo />
//                   </div>
//                 ) : (
//                   <span
//                     onClick={() =>
//                       setIsCollapse(isCollapse === 'full-sidebar' ? 'mini-sidebar' : 'full-sidebar')
//                     }
//                     className="h-8 w-8 xl:flex hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
//                   >
//                     <Icon
//                       icon="solar:hamburger-menu-bold"
//                       height={20}
//                       className="font-bold"
//                     />
//                   </span>
//                 )}
//               </div>
//                <div
//                                           onClick={(e) => {
//                                             e.preventDefault();
//                                             handleHomeClick();
//                                           }}
//                                           className="flex items-center gap-2 text-white cursor-pointer hover:text-white/80 transition-all duration-200"
//                                         >
//                                           <HiHome className="w-5 h-5 lg:ml-5" />
                                          
//                                         </div>

//               <div className="flex-1 flex justify-center px-4">
//                 <h1 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
//                   Supply Chain Management
//                 </h1>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="hidden md:flex items-center gap-3 text-white text-sm font-bold">
//                   <div className="text-right">
//                     <div className="text-xs text-white leading-tight font-bold">
//                       {/* Comment out if not needed */}
//                       {formattedDateTime}
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="flex gap-3 items-end">
//                   {/* Your existing content */}
//                 </div>
                
//                 <div className="hidden xl:flex items-center gap-1">
//                   {/* Theme Toggle */}
//                   <div
//                     className="h-10 w-10 hover:text-primary hover:bg-lightprimary dark:hover:bg-darkminisidebar  
//                     dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center 
//                     cursor-pointer text-darklink dark:text-white"
//                     onClick={()=>navigate('/overAllReport')}
//                   >
//                     <span className="flex items-center">
//                       <HiDocumentReport className='w-20 h-7 text-white'/>
//                     </span>
//                   </div>
                  
//                   <div
//                     className="h-8 w-8 hover:bg-white/20 rounded-md flex justify-center items-center cursor-pointer text-white hover:text-white transition-all duration-200"
//                     onClick={toggleMode}
//                     title={`Switch to ${activeMode === 'light' ? 'dark' : 'light'} mode`}
//                   >
//                     <Icon
//                       icon={
//                         activeMode === 'light'
//                           ? 'solar:moon-bold'
//                           : 'solar:sun-bold'
//                       }
//                       width="20"
//                       className="font-bold"
//                     />
//                   </div>

//                   <Customizer />
//                   <Profile/>
                  
//                   {/* Arrow Icon Button - Moved after Profile */}
//                   <button
//                     onClick={() => setIsSlidePanelOpen(true)}
//                     className="h-8 w-11 hover:bg-white/20 rounded-md flex justify-center items-center cursor-pointer text-white hover:text-white transition-all duration-200 ml-1"
//                     title="View Period details"
//                   >
//                     <FaArrowLeft className="w-4 h-4 font-bold" />
//                   </button>
//                 </div>

//                 <span
//                   className="h-8 w-8 flex xl:hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
//                   onClick={() => setMobileMenu(mobileMenu === 'active' ? '' : 'active')}
//                 >
//                   <Icon
//                     icon="tabler:dots-vertical"
//                     height={20}
//                     className="font-bold"
//                   />
//                 </span>
//               </div>
//             </div>

//             <div className="md:hidden mt-2 pt-2 border-t border-white/20">
//               <div className="flex justify-between items-center font-bold text-white text-xs">
//                 <span className="font-bold">{formattedDateTime}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={`w-full xl:hidden block mobile-header-menu ${mobileMenu}`}>
//           <MobileHeaderItems />
//         </div>

//         {layoutType === 'horizontal' && (
//           <div className="border-b border-gray-200 dark:border-gray-700">
//             <div className={`${isLayout === 'full' ? 'w-full px-6' : 'container px-5'}`}>
//               <HorizontalMenu />
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Mobile Sidebar Drawer */}
//       <Drawer open={isMobileSidebarOpen} onClose={handleClose} className="w-[130px]">
//         <DrawerItems>
//           <MobileSidebar />
//         </DrawerItems>
//       </Drawer>

//       {/* Improved Slide Panel - Memoized to prevent re-renders */}
//       <SlidePanel 
//         isOpen={isSlidePanelOpen}
//         onClose={handleSlidePanelClose}
//         themeColor={getThemeColor()}
//         cwh={cwh}
//         tenderPeriod={tenderPeriod}
//         purchasePeriod={purchasePeriod}
//         stockPeriod={stockPeriod}
//         entity={entity}
//         currencyId={currencyId}
//         common={common}
//       />
//     </>
//   );
// };

// export default Header;

import 'flowbite';
import { useState, useEffect, useContext, useCallback, memo } from 'react';
import { Drawer, DrawerItems } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

import Profile from "./Profile";
import FullLogo from '../../shared/logo/FullLogo';
import MobileHeaderItems from './MobileHeaderItems';
import MobileSidebar from '../sidebar/MobileSidebar';
import HorizontalMenu from '../../horizontal/header/HorizontalMenu';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { DashboardContext } from 'src/context/DashboardContext/DashboardContext';
import { Customizer } from '../../shared/customizer/Customizer';
import { HiDocumentReport, HiHome } from 'react-icons/hi';
import { FaArrowLeft, FaMapMarkerAlt, FaBuilding, FaCoins, FaTag, FaBox, FaShoppingCart, FaWarehouse } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { useAuth } from 'src/context/AuthContext/AuthContext';

interface HeaderPropsType {
  layoutType: string;
}

// ==================== SlidePanel (unchanged) ====================
const SlidePanel = memo(({ 
  isOpen, 
  onClose, 
  themeColor, 
  cwh, 
  cwhName, 
  tenderPeriod, 
  purchasePeriod, 
  stockPeriod, 
  entity, 
  currencyId, 
  common 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  themeColor: string; 
  cwh: string | null; 
  cwhName: string | null;
  tenderPeriod: string; 
  purchasePeriod: string; 
  stockPeriod: string; 
  entity: string | null; 
  currencyId: string | null; 
  common: string | null; 
}) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      position="right"
      backdrop={true}
      className="w-[280px] bg-white dark:bg-gray-900 shadow-2xl"
    >
      <DrawerItems className="p-3">
        <div className="relative">
          <div className={`bg-gradient-to-br ${themeColor} relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="90%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white/80 hover:text-white transition-all duration-200"
              aria-label="Close panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="px-8 pt-12 pb-16 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
                  <div className="relative p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                    <FaMapMarkerAlt className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">CENTRAL WAREHOUSE</p>
                  <h2 className="text-1xl font-bold text-white tracking-tight">{cwh || 'Not Specified'}</h2>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
                <path 
                  fill="white" 
                  className="dark:fill-gray-900"
                  fillOpacity="1" 
                  d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                />
              </svg>
            </div>
          </div>

          <div className="px-6 pb-8 -mt-8 relative z-20">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <FaTag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tender Period</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white pl-11">{tenderPeriod}</p>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400"></div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <FaShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Period</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white pl-11">{purchasePeriod}</p>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-400"></div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <FaBox className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Period</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white pl-11">{stockPeriod}</p>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-400"></div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 grid grid-cols-2 gap-4"
              >
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBuilding className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Entity</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {entity || '—'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCoins className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Currency</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currencyId || '—'}
                  </p>
                </div>
              </motion.div>
            </div>

            {common && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">
                  <FaWarehouse className="w-3 h-3" />
                  {common}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </DrawerItems>
    </Drawer>
  );
});

// ==================== Main Header ====================
const Header = ({ layoutType }: HeaderPropsType) => {
  const [isSticky, setIsSticky] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState('');

  const { cursorOnSideBar } = useAuth();
  const { setIsCollapse, isCollapse, isLayout, setActiveMode, activeMode, activeTheme } = useContext(CustomizerContext);
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useContext(DashboardContext);

  const navigate = useNavigate();

  // LocalStorage data
  const tenderPeriodStr = localStorage.getItem("tenderPeriod");
  const purchasePeriodStr = localStorage.getItem("purchasePeriod");
  const stockPeriodStr = localStorage.getItem("stockPeriod");
  const entity = localStorage.getItem("entity");
  const currencyId = localStorage.getItem("currencyId");
  const common = localStorage.getItem("common");
  const cwh = localStorage.getItem("cwh"); 
  const cwhName = localStorage.getItem("cwhName"); 
const handleHomeClick = () => {
    // Navigate to dashboard/home
    window.location.href = 'quotationRequest'; // Adjust this path as needed
  };
  const formatPeriod = (periodStr: string | null): string => {
    if (!periodStr) return "Not Set";
    const [day, month, year] = periodStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  const tenderPeriod = formatPeriod(tenderPeriodStr);
  const purchasePeriod = formatPeriod(purchasePeriodStr);
  const stockPeriod = formatPeriod(stockPeriodStr);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  
  // 🔥 Corrected: Full header moves perfectly (hover + permanent open)
  const isSidebarExpanded = isCollapse === 'full-sidebar' || cursorOnSideBar;
  const headerLeftMargin = '';

  // Tight padding when sidebar is open → removes empty gap
  const innerPadding = layoutType === 'horizontal'
    ? 'container mx-auto px-4'
    : isSidebarExpanded
      ? 'pl-6 pr-6'           // Clean & tight
      : 'pl-4 pr-4 sm:pr-6';

  const getThemeColor = () => {
    const colors = {
      BLUE_THEME: 'from-blue-950 to-blue-950',
      AQUA_THEME: 'from-[#0074BA] to-[#005A92]',
      PURPLE_THEME: 'from-[#763EBD] to-[#5D2F9E]',
      GREEN_THEME: 'from-[#0A7EA4] to-[#086485]',
      CYAN_THEME: 'from-[#01C0C8] to-[#019AA1]',
      ORANGE_THEME: 'from-[#FA896B] to-[#F86A46]',
      RED_THEME: 'from-[#FF4B4B] to-[#FF2A2A]',
      AMBER_THEME: 'from-[#FF9500] to-[#E67E00]',
      INDIGO_THEME: 'from-[#7857FF] to-[#5E3CFF]',
      PINK_THEME: 'from-[#FF2E63] to-[#E61A4F]',
      MINT_THEME: 'from-[#43CC7A] to-[#33B367]',
      DEEP_PURPLE_THEME: 'from-[#5E35B1] to-[#4C2A8F]',
      ROSE_THEME: 'from-[#E91E63] to-[#D81B60]',
      DARK_BLUE_THEME: 'from-[#3949AB] to-[#2F3D8F]',
      MAGENTA_THEME: 'from-[#D81B60] to-[#B7154F]',
      TEAL_THEME: 'from-[#009688] to-[#007D70]',
      DEEP_ORANGE_THEME: 'from-[#FF6D00] to-[#E65C00]',
      LIME_THEME: 'from-[#7CB342] to-[#689F38]',
      VIOLET_THEME: 'from-[#8E24AA] to-[#7B1FA2]',
      EMERALD_THEME: 'from-[#009688] to-[#00897B]',
      CORAL_THEME: 'from-[#FF7043] to-[#F4511E]',
      GOLD_THEME: 'from-[#FFB300] to-[#FFA000]',
      SAPPHIRE_THEME: 'from-[#2962FF] to-[#1A53FF]',
      RUBY_THEME: 'from-[#E53935] to-[#D32F2F]',
      FOREST_THEME: 'from-[#43A047] to-[#388E3C]',
      LAVENDER_THEME: 'from-[#9C27B0] to-[#8E24AA]',
      SKY_THEME: 'from-[#03A9F4] to-[#039BE5]',
      MARINE_THEME: 'from-[#00BCD4] to-[#00ACC1]',
      SUNSET_THEME: 'from-[#FF9800] to-[#F57C00]',
    };
    return colors[activeTheme] || colors.BLUE_THEME;
  };

  const toggleMode = () => setActiveMode(activeMode === 'light' ? 'dark' : 'light');
  const handleClose = () => setIsMobileSidebarOpen(false);

  const handleSlidePanelOpen = useCallback(() => setIsSlidePanelOpen(true), []);
  const handleSlidePanelClose = useCallback(() => setIsSlidePanelOpen(false), []);

  const formatDateTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes} IST`;
  };

  const formattedDateTime = formatDateTime(currentDateTime);

  const handleBurgerMenuClick = useCallback((isDesktop: boolean) => {
    if (isDesktop) {
      setIsCollapse(isCollapse === 'full-sidebar' ? 'mini-sidebar' : 'full-sidebar');
      window.dispatchEvent(new CustomEvent('toggle-sidebar'));
    } else {
      setIsMobileSidebarOpen(true);
    }
  }, [isCollapse, setIsCollapse, setIsMobileSidebarOpen]);

  return (
    <>
      <header 
        className={`sticky top-0 z-[5] transition-all duration-300 ${isSticky ? 'shadow-md' : ''}`}
      >
        <div className={`bg-gradient-to-r ${getThemeColor()} text-white shadow-sm`}>
          <div className={`${innerPadding} ${isLayout === 'full' ? '!max-w-full' : ''} py-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Mobile Burger */}
                <span
                  onClick={() => handleBurgerMenuClick(false)}
                  className="h-8 w-2 flex xl:hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
                >
                  <Icon icon="solar:hamburger-menu-bold" height={20} className="font-bold" />
                </span>

                {/* Desktop Burger + Logo */}
                {layoutType === 'horizontal' ? (
                  <div className="text-white scale-90">
                    <FullLogo />
                  </div>
                ) : (
                  <span
                    onClick={() => handleBurgerMenuClick(true)}
                    className="h-8 w-6 xl:flex hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
                  >
                    <Icon icon="solar:hamburger-menu-bold" height={20} className="font-bold" />
                  </span>
                )}
              </div>
 <div
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleHomeClick();
                                          }}
                                          className="flex items-center gap-2 text-white cursor-pointer hover:text-white/80 transition-all duration-200"
                                        >
                                          <HiHome className="w-5 h-5 lg:ml-5" />
                                          
                                        </div>
              <div className="flex-1 flex justify-center px-4">
                <h1 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
                  Supply Chain Management
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-3 text-white text-sm font-bold">
                  <div className="text-right">
                    <div className="text-xs text-white leading-tight font-bold">
                      {formattedDateTime}
                    </div>
                  </div>
                </div>
                
                <div className="hidden xl:flex items-center gap-1">
                  <div
                    className="h-10 w-10 hover:text-primary hover:bg-lightprimary dark:hover:bg-darkminisidebar dark:hover:text-primary focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-darklink dark:text-white"
                    onClick={() => navigate('/overAllReport')}
                  >
                    <HiDocumentReport className="w-7 h-7 text-white" />
                  </div>
                  
                  <div
                    className="h-8 w-8 hover:bg-white/20 rounded-md flex justify-center items-center cursor-pointer text-white hover:text-white transition-all duration-200"
                    onClick={toggleMode}
                    title={`Switch to ${activeMode === 'light' ? 'dark' : 'light'} mode`}
                  >
                    <Icon
                      icon={activeMode === 'light' ? 'solar:moon-bold' : 'solar:sun-bold'}
                      width="20"
                      className="font-bold"
                    />
                  </div>

                  <Customizer />
                  <Profile />
                  
                  <button
                    onClick={handleSlidePanelOpen}
                    type="button"
                    className="h-8 w-11 hover:bg-white/20 rounded-md flex justify-center items-center cursor-pointer text-white hover:text-white transition-all duration-200 ml-1"
                    title="View Period details"
                  >
                    <FaArrowLeft className="w-4 h-4 font-bold" />
                  </button>
                </div>

                <span
                  className="h-8 w-8 flex xl:hidden text-white hover:text-white hover:bg-white/20 rounded-md justify-center items-center cursor-pointer transition-all duration-200 font-bold"
                  onClick={() => setMobileMenu(mobileMenu === 'active' ? '' : 'active')}
                >
                  <Icon icon="tabler:dots-vertical" height={20} className="font-bold" />
                </span>
              </div>
            </div>

            <div className="md:hidden mt-2 pt-2 border-t border-white/20">
              <div className="flex justify-between items-center font-bold text-white text-xs">
                <span className="font-bold">{formattedDateTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`w-full xl:hidden block mobile-header-menu ${mobileMenu}`}>
          <MobileHeaderItems />
        </div>

        {layoutType === 'horizontal' && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className={`${isLayout === 'full' ? 'w-full px-6' : 'container px-5'}`}>
              <HorizontalMenu />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sidebar Drawer */}
      <Drawer 
        open={isMobileSidebarOpen} 
        onClose={handleClose} 
        className="w-[130px]"
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      >
        <DrawerItems>
          <MobileSidebar />
        </DrawerItems>
      </Drawer>

      <SlidePanel 
        isOpen={isSlidePanelOpen}
        onClose={handleSlidePanelClose}
        themeColor={getThemeColor()}
        cwh={cwh}
        cwhName={cwhName}
        tenderPeriod={tenderPeriod}
        purchasePeriod={purchasePeriod}
        stockPeriod={stockPeriod}
        entity={entity}
        currencyId={currencyId}
        common={common}
      />
    </>
  );
};

export default Header;