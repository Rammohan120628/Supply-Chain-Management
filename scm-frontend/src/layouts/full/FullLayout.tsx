// import { FC, useContext } from 'react';
// import { Outlet } from "react-router";
// // import { Customizer } from './shared/customizer/Customizer';
// import { CustomizerContext } from '../../context/CustomizerContext';
// import Sidebar from './vertical/sidebar/Sidebar';
// import Header from './vertical/header/Header';
// import ScrollToTop from 'src/components/shared/ScrollToTop';
// import PartialTransitioning from 'src/components/headless-ui/Transition/PartialTransitioning';



// const FullLayout: FC = () => {
//   const { activeLayout, isLayout } = useContext(CustomizerContext);

//   return (
//       <>
//     <div className="flex w-full min-h-screen dark:bg-darkgray ">
//       <div className="page-wrapper flex w-full  ">
//         {/* Header/sidebar */}

//         {activeLayout == "vertical" ? <Sidebar /> : null}
//         <div className="page-wrapper-sub flex flex-col w-full dark:bg-dark bg-lightgray">
//           {/* Top Header  */}
//           {activeLayout == "horizontal" ? (
//             <Header layoutType="horizontal" />
//           ) : (
//             <Header layoutType="vertical" />
//           )}

//           <div
//             className={`bg-lightgray dark:bg-dark  h-full ${
//               activeLayout != "horizontal" ? "rounded-bb" : "rounded-none"
//             } `}
//           >
//             {/* Body Content  */}
//             <div
//               className={` ${
//                 isLayout == "full"
//                   ? "w-full py-30 md:px-30 px-5"
//                   : "container mx-auto  py-0"
//               } ${activeLayout == "horizontal" ? "xl:mt-3" : ""}
//               `}
//             >
//               <ScrollToTop>
//               <Outlet/>
//               </ScrollToTop>
//             </div>
//             {/* <Customizer /> */}
//             <PartialTransitioning/>
//           </div>
//         </div>
//       </div>
//     </div>
//       </>
//   );
// };

// export default FullLayout;
// import { FC, useContext } from 'react';
// import { Outlet } from "react-router";
// import { CustomizerContext } from '../../context/CustomizerContext';
// import Sidebar from './vertical/sidebar/Sidebar';
// import Header from './vertical/header/Header';
// import ScrollToTop from 'src/components/shared/ScrollToTop';
// import PartialTransitioning from 'src/components/headless-ui/Transition/PartialTransitioning';

// const FullLayout: FC = () => {
//   const { activeLayout, isLayout } = useContext(CustomizerContext);

//   return (
//     <>
//       <div className="flex w-full h-screen overflow-hidden dark:bg-darkgray">
//         <div className="page-wrapper flex w-full">
          
//           {/* Sidebar - fixed, never scrolls */}
//           {activeLayout === "vertical" ? <Sidebar /> : null}

//           {/* Right column - header fixed on top, only content scrolls */}
//           <div className="page-wrapper-sub flex flex-col w-full h-screen dark:bg-dark bg-lightgray overflow-hidden">
            
//             {/* Header - stays fixed at top, content scrolls UNDER it */}
//             <div className="flex-shrink-0 z-50 relative">
//               {activeLayout === "horizontal" ? (
//                 <Header layoutType="horizontal" />
//               ) : (
//                 <Header layoutType="vertical" />
//               )}
//             </div>

//             {/* Scrollable content area only */}
//             <div className="flex-1 overflow-y-auto bg-lightgray dark:bg-dark">
//               <div
//                 className={`h-full ${
//                   activeLayout !== "horizontal" ? "rounded-bb" : "rounded-none"
//                 }`}
//               >
//                 <div
//                   className={`${
//                     isLayout === "full"
//                       ? "w-full py-30 md:px-30 px-5"
//                       : "container mx-auto py-0"
//                   } ${activeLayout === "horizontal" ? "xl:mt-3" : ""}`}
//                 >
//                   <ScrollToTop>
//                     <Outlet />
//                   </ScrollToTop>
//                 </div>
//                 <PartialTransitioning />
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FullLayout;


import { FC, useContext, useRef, useEffect } from 'react';
import { Outlet, useLocation } from "react-router";
import { CustomizerContext } from '../../context/CustomizerContext';
import Sidebar from './vertical/sidebar/Sidebar';
import Header from './vertical/header/Header';
import ScrollToTop from 'src/components/shared/ScrollToTop';
import PartialTransitioning from 'src/components/headless-ui/Transition/PartialTransitioning';

const FullLayout: FC = () => {
  const { activeLayout, isLayout } = useContext(CustomizerContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Reset scroll to top on every route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <>
      <div className="flex w-full h-screen overflow-hidden dark:bg-darkgray">
        <div className="page-wrapper flex w-full">

          {/* Sidebar - fixed, never scrolls */}
          {activeLayout === "vertical" ? <Sidebar /> : null}

          {/* Right column */}
          <div className="page-wrapper-sub flex flex-col w-full h-screen dark:bg-dark bg-lightgray overflow-hidden">

            {/* Header - stays fixed at top */}
            <div className="flex-shrink-0 z-50 relative">
              {activeLayout === "horizontal" ? (
                <Header layoutType="horizontal" />
              ) : (
                <Header layoutType="vertical" />
              )}
            </div>

            {/* Scrollable content area — ref attached here */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto bg-lightgray dark:bg-dark"
            >
              <div
                className={`h-full ${
                  activeLayout !== "horizontal" ? "rounded-bb" : "rounded-none"
                }`}
              >
                <div
                  className={`${
                    isLayout === "full"
                      ? "w-full py-30 md:px-30 px-5"
                      : "container mx-auto py-0"
                  } ${activeLayout === "horizontal" ? "xl:mt-3" : ""}`}
                >
                  <Outlet />
                </div>
                <PartialTransitioning />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default FullLayout;