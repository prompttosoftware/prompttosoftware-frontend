'use client';

import React, { useState } from 'react';
import SideNavBar from './components/SideNavBar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import ErrorModal from './components/ErrorModal';
import ProfileButton from './components/ProfileButton';
import AddPaymentButton from './components/AddPaymentButton';
import BalanceDisplay from './components/BalanceDisplay';
import WatchAdButton from './components/WatchAdButton';
import BannerDisplay from './components/BannerDisplay';
import { PaymentModal } from './components/PaymentModal';
import { useBannerStore } from '@/store/bannerStore';
import { StripeWrapper } from '@/components/StripeWrapper';
import ConfirmationDialog from './components/ConfirmationDialog';
import { AuthProvider } from '@/lib/AuthContext';
import TutorialOverlay from '@/components/TutorialOverlay';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const initializeBanners = useBannerStore((state) => state.initializeBanners);

  React.useEffect(() => {
    initializeBanners();
  }, [initializeBanners]);

  const navMarginClass = isNavExpanded ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20';

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-gray-100">
        <SideNavBar
          isExpanded={isNavExpanded}
          setIsExpanded={setIsNavExpanded}
          isMobileNavOpen={isMobileNavOpen}
          setIsMobileNavOpen={setIsMobileNavOpen}
        />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${navMarginClass}`}
        >
          <header
            className={`sticky top-0 h-16 bg-white shadow-md flex items-center justify-between px-4 md:px-8 z-30 flex-shrink-0`}
          >
            <div className="flex items-center">
              <button
                className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Bars3Icon className="h-6 w-6 text-gray-700" />
              </button>
              <div className="text-2xl font-semibold text-gray-800">
                Page Title
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end space-x-2 md:space-x-4">
              <AddPaymentButton />
              <ProfileButton />
              <BalanceDisplay />
              <WatchAdButton />
            </div>
          </header>

          <div className="p-4 flex-shrink-0">
            <BannerDisplay />
          </div>

          <main className="flex-1 p-8">{children}</main>
        </div>

        <ErrorModal />
        <ConfirmationDialog />
        <StripeWrapper>
          <PaymentModal />
        </StripeWrapper>
        <TutorialOverlay />
      </div>
    </AuthProvider>
  );
}
