'use client';

// import React, { useEffect } from 'react';
// import { useBannerStore } from '@/store/bannerStore';
// import { Banner } from '@/types/banner';

// const BannerDisplay: React.FC = () => {
//   const { activeBanner, dismissCurrentBanner } = useBannerStore();

//   // Handle auto-dismissal
//   useEffect(() => {
//     if (activeBanner && !activeBanner.dismissible && activeBanner.autoDismiss) {
//       const timer = setTimeout(() => {
//         dismissCurrentBanner();
//       }, activeBanner.autoDismiss);

//       return () => clearTimeout(timer);
//     }
//   }, [activeBanner, dismissCurrentBanner]);

//   if (!activeBanner) {
//     return null;
//   }

//   const getBannerStyles = (type: Banner['type']) => {
//     switch (type) {
//       case 'info':
//         return 'bg-blue-500 text-white';
//       case 'success':
//         return 'bg-green-500 text-white';
//       case 'warning':
//         return 'bg-yellow-400 text-black';
//       default:
//         return 'bg-gray-500 text-white';
//     }
//   };

//   const bannerStyle = getBannerStyles(activeBanner.type);

//   return (
//     <div className={`p-4 rounded-md shadow-md flex items-center justify-between ${bannerStyle}`}>
//       <p className="font-semibold">{activeBanner.message}</p>
//       {activeBanner.dismissible && (
//         <button
//           onClick={dismissCurrentBanner}
//           className="ml-4 p-1 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
//           aria-label="Dismiss banner"
//         >
//           <svg
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M6 18L18 6M6 6l12 12"
//             ></path>
//           </svg>
//         </button>
//       )}
//     </div>
//   );
// };

const BannerDisplay: React.FC = () => {
  return null; // Temporarily disable BannerDisplay due to bannerStore issues
};

export default BannerDisplay;
