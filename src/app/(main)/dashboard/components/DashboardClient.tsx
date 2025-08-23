'use client';

import React from 'react';
import { Project } from '@/types/project';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AccountUsageSection from '@/app/(main)/dashboard/components/AccountUsageSection';
import ActiveProjectsSummary from '@/app/(main)/dashboard/components/ActiveProjectsSummary';
import { Transaction } from '@/types/transactions';
import { useUserTransactions } from '@/hooks/useUserTransactions';
import { useAuth } from '@/hooks/useAuth';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { AccountUsageSectionSkeleton } from './AccountUsageSectionSkeleton';

type DashboardClientProps = {
  activeProjects: Project[];
  initialTransactions: Transaction[];
};

export default function DashboardClient({ activeProjects, initialTransactions }: DashboardClientProps) {
  
  const { data: transactions } = useUserTransactions({
    initialData: initialTransactions,
  });

  const { user, isLoading, isError } = useAuth();

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="w-full max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            We couldn't load your user information. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <div className="w-full max-w-lg mb-8 space-y-4">
            <SkeletonLoader height="h-10" width="w-3/4" className="mx-auto" />
            <SkeletonLoader height="h-10" width="w-1/2" className="mx-auto" />
          </div>
          <AccountUsageSectionSkeleton />
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <h3 className="text-4xl sm:text-5xl font-bold mb-4">Welcome, {user.name}</h3>
          <h3 className="text-2xl sm:text-3xl font-semibold mb-8 text-muted-foreground">Account Status: {user.accountStatus}</h3>
          
          <AccountUsageSection balance={user.balance} transactions={transactions || []} />
          
          <section className="w-full max-w-5xl mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-left">Active Projects</h2>
                <Link href="/projects" passHref>
                <Button variant="outline">View all</Button>
                </Link>
            </div>
            <ActiveProjectsSummary initialProjects={activeProjects} />
          </section>
      </main>
    </div>
  );
}
