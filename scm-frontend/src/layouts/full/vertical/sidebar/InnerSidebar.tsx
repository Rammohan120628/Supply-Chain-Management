

// import React, { useContext, useEffect } from "react";
// import { SidebarItemGroup, SidebarItems } from "flowbite-react";
// import SidebarContent from "./Sidebaritems";
// import NavItems from "./NavItems";
// import NavCollapse from "./NavCollapse";
// // @ts-ignore
// import SimpleBar from "simplebar-react";
// import { CustomizerContext } from "src/context/CustomizerContext";
// import { useLocation } from "react-router";
// import { Icon } from "@iconify/react/dist/iconify.js";

// const InnerSidebar = () => {
//   const { setSelectedIconId } = useContext(CustomizerContext) || {};


//    const location = useLocation();
//   const pathname = location.pathname;

//   function findActiveUrl(narray: any, targetUrl: any) {
//     for (const item of narray) {
//       // Check if the `items` array exists in the top-level object
//       if (item.items) {
//         // Iterate through each item in the `items` array
//         for (const section of item.items) {
//           // Check if `children` array exists and search through it
//           if (section.children) {
//             for (const child of section.children) {
//               if (child.url === targetUrl) {
//                 return item.id; // Return the ID of the first-level object
//               }
//             }
//           }
//         }
//       }
//     }
//     return null; // URL not found
//   }

//   useEffect(() => {
//     const result = findActiveUrl(SidebarContent, pathname);
//     if (result) {
//       setSelectedIconId(result);
//     }
//   }, [pathname, setSelectedIconId]);

//   return (
//     <>
//             <SimpleBar className="">
//               <SidebarItems className="rtl:pe-0 rtl:ps-3 px-4 mt-2">
//                 <SidebarItemGroup className="sidebar-nav">
//                   {SidebarContent.map((item, index) => (
//                     <React.Fragment key={index}>
//                       <h5 className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs  pb-2 uppercase border-t border-border dark:!border-darkborder">
//                         <span className="hide-menu">{item.heading}</span>
//                       </h5>
//                       <Icon
//                         icon="solar:menu-dots-bold"
//                         className="text-ld block mx-auto mt-6 leading-6 dark:text-opacity-60 hide-icon"
//                         height={18}
//                       />

//                       {item.children?.map((child, index) => (
//                         <React.Fragment key={child.id && index}>
//                           {child.children ? (
//                             <div className="collpase-items">
//                               <NavCollapse item={child} />
//                             </div>
//                           ) : (
//                             <NavItems item={child} />
//                           )}
//                         </React.Fragment>

//                       ))}
//                     </React.Fragment>
//                   ))}
//                 </SidebarItemGroup>
                
//               </SidebarItems>
//             </SimpleBar>
//     </>
//   );
// };

// export default InnerSidebar;
// import Sidebaritems1 from "./sidebaritem";
// import Sidebaritems from "./Sidebaritems";
 
// const InnerSidebar = () => {
//   return (
//     <>
//       <Sidebaritems1 />
//     </>
//   );
// };
 
// export default InnerSidebar;

import React, { useState, useCallback, useEffect, useRef } from "react";
import Sidebaritems from "./Sidebaritem";
import FullLogo from '../../shared/logo/FullLogo';

const InnerSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Determine if sidebar should be expanded based on collapsed state and hover
  const isExpanded = !isCollapsed || isHovered;
  
  // Use useCallback to memoize the toggle function
  const toggleSidebarCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
    // Reset hover state when toggling
    setIsHovered(false);
  }, []);

  // Handle mouse enter - expand with delay
  const handleMouseEnter = useCallback(() => {
    if (isCollapsed) {
      // Clear any pending timeout to hide
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsHovered(true);
    }
  }, [isCollapsed]);

  // Handle mouse leave - collapse with delay
  const handleMouseLeave = useCallback(() => {
    if (isCollapsed) {
      // Add small delay before collapsing to prevent flickering
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 300); // 300ms delay
    }
  }, [isCollapsed]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Expose the toggle function to parent components via custom event
  useEffect(() => {
    const handleToggleFromHeader = () => {
      toggleSidebarCollapse();
    };

    window.addEventListener('toggle-sidebar', handleToggleFromHeader);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleFromHeader);
    };
  }, [toggleSidebarCollapse]);

  return (
    <div 
      ref={sidebarRef}
      className={`fixed left-0 top-0 h-screen bg-white text-gray-900 flex flex-col shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-[258px]' : 'w-[80px]'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        // Add a slight shadow when expanded from hover
        boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02)' : undefined
      }}
    >
      {/* Logo Section - Always at the top */}
      <div className={`flex-shrink-0 ${isExpanded ? 'px-3 py-3' : 'px-2 py-3'} border-b border-gray-200`}>
        <FullLogo />
      </div>
      
      {/* Sidebar Items - Takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <Sidebaritems 
          isCollapsed={!isExpanded} 
          onToggleCollapse={toggleSidebarCollapse} 
        />
      </div>
    </div>
  );
};

export default InnerSidebar;