// src/app/(main)/components/AppHeader.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import ProfileButton from '@/app/(main)/components/ProfileButton';
import AddPaymentButton from '@/app/(main)/components/AddPaymentButton';
import BalanceDisplay from '@/app/(main)/components/BalanceDisplay';
import LinkJiraButton from '@/app/(main)/components/LinkJiraButton';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import JiraCallbackHandler from '@/app/(main)/components/JiraCallbackHandler';

const formatPathToTitle = (path: string) => {
    if (path === '/') return 'Dashboard';

    // Get the last non-empty segment from the path
    const lastSegment = path.split('/').filter(Boolean).pop() || '';

    // Replace dashes with spaces and capitalize each word
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

export default function AppHeader({ onMobileNavOpen }: { onMobileNavOpen: () => void; }) {
  const pathname = usePathname();
  const pageTitle = formatPathToTitle(pathname);
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 h-16 bg-white shadow-md flex items-center justify-between px-4 md:px-8 z-30 flex-shrink-0">
      <div className="flex items-center">
        <button
          className="md:hidden p-2 mr-2"
          onClick={onMobileNavOpen}
          aria-label="Open navigation"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
        <div className="text-2xl font-semibold text-gray-800">{pageTitle}</div>
      </div>
      <div className="flex flex-wrap items-center justify-end space-x-2 md:space-x-4">
        {isAuthenticated && (
          <>
            <Suspense fallback={null}>
              <JiraCallbackHandler />
            </Suspense>
            <LinkJiraButton />
            <AddPaymentButton />
            <BalanceDisplay />
          </>
        )}
        <ProfileButton />
      </div>
    </header>
  );
}
