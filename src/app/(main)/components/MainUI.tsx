// src/app/(main)/components/MainUI.tsx
'use client';

import React, { useEffect, useState } from 'react';

import SideNavBar from '@/app/(main)/components/SideNavBar';
import { useAuth } from '@/hooks/useAuth';
import { StripeWrapper } from '@/components/StripeWrapper';
import useBannerStore from '@/store/bannerStore';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import BannerDisplay from '@/app/(main)/components/BannerDisplay';
import ConfirmationDialog from '@/app/(main)/components/ConfirmationDialog';
import { PaymentModal } from '@/app/(main)/components/PaymentModal';
import SuccessToast from '@/app/(main)/components/SuccessToast';
import TutorialOverlay from '@/app/(main)/components/TutorialOverlay';
import WelcomeModal from '@/app/(main)/components/WelcomeModal';
import { Banner } from '@/types/banner';
import AppHeader from '@/app/(main)/components/AppHeader';
import { UserProfile } from '@/types/auth';
import { AuthProvider } from '@/lib/AuthContext';

interface MainUIProps {
  user: UserProfile | null;
  children: React.ReactNode;
}

export default function MainUI({ user, children }: MainUIProps) {
  // All state and hooks that were in the layout now live here.
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const { isAuthenticated, isLoading, showTutorial, setShowTutorial } = useAuth();
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
    if (!isAuthenticated && !isLoading && !sessionStorage.getItem('welcome_dismissed')) {
      setShowWelcome(true);
    }
  }, [isAuthenticated, isLoading]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const navMarginClass = isNavExpanded ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20';

  return (
    <AuthProvider initialData={user}>
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
    </AuthProvider>
  );
}
