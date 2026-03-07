// import { useEffect, ReactElement } from 'react';
// import { useLocation } from 'react-router';

// export default function ScrollToTop({ children }: { children: ReactElement | null }) {
//   const { pathname } = useLocation();

//   useEffect(() => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: 'smooth',
//     });
//   }, [pathname]);

//   return children || null;
// }
import { useEffect, ReactElement } from 'react';
import { useLocation } from 'react-router';

export default function ScrollToTop({ children }: { children: ReactElement | null }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Target the actual scrollable div in FullLayout
    const scrollContainer = document.querySelector('.layout-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      // Fallback for window scroll
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return children || null;
}