// src/app/(main)/components/MainUI.tsx
'use client';

import React, { useEffect, useState } from 'react';

import SideNavBar from '@/app/(main)/components/SideNavBar';
import { useAuth } from '@/hooks/useAuth';
import { StripeWrapper } from '@/components/StripeWrapper';
import useBannerStore from '@/store/bannerStore';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { toast, Toaster } from 'sonner';
import BannerDisplay from '@/app/(main)/components/BannerDisplay';
import ConfirmationDialog from '@/app/(main)/components/ConfirmationDialog';
import { PaymentModal } from '@/app/(main)/components/PaymentModal';
import SuccessToast from '@/app/(main)/components/SuccessToast';
import TutorialOverlay from '@/app/(main)/components/TutorialOverlay';
import { Banner } from '@/types/banner';
import AppHeader from '@/app/(main)/components/AppHeader';

interface MainUIProps {
  children: React.ReactNode;
}

export default function MainUI({ children }: MainUIProps) {
  // All state and hooks that were in the layout now live here.
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const { showTutorial, setShowTutorial } = useAuth();
  const initBanners = useBannerStore((state) => state.initBanners);
  const { error, clearError } = useGlobalErrorStore();
  
  useEffect(() => {
    if (error) {
      const { message } = error;

      toast.error(message);

      clearError(); // Clear right after showing
    }
  }, [error, clearError]);

  useEffect(() => {
    const initialBanners: Banner[] = [];
    initBanners(initialBanners);
  }, []); // Empty dependency array to run only once

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const navMarginClass = isNavExpanded ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20';

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <div className="flex min-h-screen bg-background text-foreground">
        <SideNavBar
          isExpanded={isNavExpanded}
          setIsExpanded={setIsNavExpanded}
          isMobileNavOpen={isMobileNavOpen}
          setIsMobileNavOpen={setIsMobileNavOpen}
        />

        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${navMarginClass}`}>
          <AppHeader onMobileNavOpen={() => setIsMobileNavOpen(true)} />

          <div className="p-4 flex-shrink-0">
            <BannerDisplay />
          </div>

          <main className="flex-1 p-8">{children}</main>
        </div>

        {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
        <ConfirmationDialog />
        <StripeWrapper>
          <PaymentModal />
        </StripeWrapper>
        <SuccessToast />
      </div>
    </>
  );
}
