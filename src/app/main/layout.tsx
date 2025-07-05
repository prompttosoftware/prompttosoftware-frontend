'use client';

import React, { useState, useEffect, useContext } from 'react'; // Added useEffect
import SideNavBar from './components/SideNavBar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import ErrorModal from './components/ErrorModal';
import ProfileButton from './components/ProfileButton';
import AddPaymentButton from './components/AddPaymentButton';
import BalanceDisplay from './components/BalanceDisplay';
import WatchAdButton from './components/WatchAdButton';
import { PaymentModal } from './components/PaymentModal';
import useBannerStore from '@/store/bannerStore'; // Corrected import
import { StripeWrapper } from '@/components/StripeWrapper';
import ConfirmationDialog from './components/ConfirmationDialog';
import { AuthProvider } from '@/lib/AuthContext';
import BannerDisplay from './components/BannerDisplay';
import { Banner } from '@/types/banner';
import SuccessToast from './components/SuccessToast';
import TutorialOverlay from './components/TutorialOverlay'; // Import TutorialOverlay
import usePaymentModalStore from '@/store/paymentModalStore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false); // State to control tutorial visibility

  const initBanners = useBannerStore((state) => state.initBanners);

  useEffect(() => {
    // Check if tutorial has been completed before
    const tutorialCompleted = localStorage.getItem('prompt2code_tutorial_completed');
    if (!tutorialCompleted) {
      setShowTutorial(true); // Show tutorial if not completed
    }
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const initialBanners: Omit<Banner, 'id'>[] = [
      { message: "This website was created from a single prompt!", type: 'info', dismissible: false },
      { message: "Welcome to our new feature! Check it out.", type: 'success', dismissible: true },
      { message: "Heads up! Some services might be temporarily unavailable.", type: 'warning', dismissible: true },
      { message: "Just an informative message for you.", type: 'info', dismissible: true },
    ];
    initBanners(initialBanners);
  }, [initBanners]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // Additional logic can go here if needed after tutorial finishes
  };

  const navMarginClass = isNavExpanded ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20';

  return (
    <AuthProvider>
      {showTutorial && <TutorialOverlay onTutorialComplete={handleTutorialComplete} />} {/* Render tutorial overlay */}
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
              <div className="text-2xl font-semibold text-gray-800">Page Title</div>
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
        <SuccessToast />

      </div>
    </AuthProvider>
  );
}
