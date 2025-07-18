// src/app/(main)/components/MainUI.tsx
'use client';

import React, { useEffect, useContext, useState } from 'react';

import SideNavBar from './SideNavBar';
import { useAuth } from '@/hooks/useAuth';
import { StripeWrapper } from '@/components/StripeWrapper';
import { AuthContext } from '@/lib/AuthContext';
import useBannerStore from '@/store/bannerStore';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import BannerDisplay from './BannerDisplay';
import ConfirmationDialog from './ConfirmationDialog';
import { PaymentModal } from './PaymentModal';
import SuccessToast from './SuccessToast';
import TutorialOverlay from './TutorialOverlay';
import WelcomeModal from './WelcomeModal';
import { Banner } from '@/types/banner';
import AppHeader from './AppHeader';

export default function MainUI({ children }: { children: React.ReactNode }) {
  // All state and hooks that were in the layout now live here.
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // All useEffects and logic that were in the layout now live here.
  const { showTutorial, setShowTutorial } = useContext(AuthContext);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
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
    const initialBanners: Banner[] = [
      {
        id: 'site-created-from-prompt',
        message: 'This website was created from a single prompt!',
        type: 'info',
        dismissible: true,
      },
      {
        id: 'new-feature-welcome',
        message: 'Welcome to our new feature! Check it out.',
        type: 'success',
        dismissible: true,
      },
      {
        id: 'service-unavailability-warning',
        message: 'Heads up! Some services might be temporarily unavailable.',
        type: 'warning',
        dismissible: true,
      },
      {
        id: 'just-info-message',
        message: 'Just an informative message for you.',
        type: 'info',
        dismissible: true,
      },
    ];
    initBanners(initialBanners);
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (!isAuthenticated && !sessionStorage.getItem('welcome_dismissed')) {
      setShowWelcome(true);
    }
  }, [isAuthenticated]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const navMarginClass = isNavExpanded ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20';

  return (
    <>
      <Toaster position="top-center" richColors />
      {showWelcome && (
        <WelcomeModal 
          onClose={() => {
            setShowWelcome(false);
            sessionStorage.setItem('welcome_dismissed', 'true');
          }}
          onLogin={() => {
            setShowWelcome(false);
            router.push('/login');
          }}
        />
      )}
      
      <div className="flex min-h-screen bg-gray-100">
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
