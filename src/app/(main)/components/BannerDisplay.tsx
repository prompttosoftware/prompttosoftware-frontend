'use client';

import React from 'react';
import useBannerStore from '@/store/bannerStore';

const BannerDisplay: React.FC = () => {
  const { activeBanner, dismissCurrentBanner } = useBannerStore();

  if (!activeBanner) {
    return null; // Don't render if no active banner
  }

  return (
    <div className={`p-3 rounded-sm flex items-center justify-between bg-background text-muted-foreground border`}>
      <p className="font-small">{activeBanner.message}</p>
      
      <button
        onClick={dismissCurrentBanner} // Calls the dismissCurrentBanner function from the store
        className="ml-4 p-1 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring"
        aria-label="Dismiss banner"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default BannerDisplay;
