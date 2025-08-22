'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import ProfileButton from '@/app/(main)/components/ProfileButton';
import AddPaymentButton from '@/app/(main)/components/AddPaymentButton';
import BalanceDisplay from '@/app/(main)/components/BalanceDisplay';
import LinkJiraButton from '@/app/(main)/components/LinkJiraButton';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import JiraCallbackHandler from '@/app/(main)/components/JiraCallbackHandler';
import SkeletonLoader from './SkeletonLoader';

export default function AppHeader({ onMobileNavOpen }: { onMobileNavOpen: () => void; }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 h-16 bg-background border flex items-center justify-between px-4 md:px-8 z-30 flex-shrink-0">
      <div className="flex items-center">
        <button
          className="md:hidden p-2 mr-2"
          onClick={onMobileNavOpen}
          aria-label="Open navigation"
        >
          <Bars3Icon className="h-6 w-6 text-primary" />
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-end space-x-2 md:space-x-4">
        <Suspense fallback={null}>
          <JiraCallbackHandler />
        </Suspense>

        {isLoading ? (
          <div className="flex items-center space-x-2 md:space-x-4">
            <SkeletonLoader width="w-28" height="h-10" />
            <SkeletonLoader width="w-40" height="h-10" className="rounded-lg" />
          </div>
        ) : (
          isAuthenticated && (
            <>
              {user?.integrations.jira.isLinked === false && <LinkJiraButton />}
              
              <div className="flex items-center border rounded-lg overflow-hidden hover:shadow-sm">
                <BalanceDisplay balance={user?.balance} />
                <div className="h-6 border-l border-border" /> {/* Vertical Divider */}
                <AddPaymentButton />
              </div>

            </>
          )
        )}
        
        <ProfileButton />
      </div>
    </header>
  );
}
