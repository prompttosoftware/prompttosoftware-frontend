'use client';

import React, { useMemo } from 'react';
import { Project } from '@/types/project';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactions';
import { useUserTransactions } from '@/hooks/useUserTransactions';
import { useAuth } from '@/hooks/useAuth';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import ActiveProjectsSummary from '@/app/(main)/dashboard/components/ActiveProjectsSummary';
import { startOfMonth } from 'date-fns';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import SpendingHistoryChart from './SpendingHistoryChart';

type DashboardClientProps = {
  activeProjects: Project[];
  initialTransactions: Transaction[];
};

// Helper function to calculate spending
const calculateSpending = (transactions: Transaction[], startDate: Date, endDate: Date): number => {
  return transactions
    .filter(tx => {
      const txDate = new Date(tx.createdAt);
      return tx.type === 'debit' && tx.status === 'succeeded' && txDate >= startDate && txDate <= endDate;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
};

export default function DashboardClient({ activeProjects, initialTransactions }: DashboardClientProps) {
  const { data: transactions } = useUserTransactions({
    initialData: initialTransactions,
  });
  const { user, isLoading, isError } = useAuth();

  const currentMonthSpending = useMemo(() => {
    if (!transactions) return 0;
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    return calculateSpending(transactions, startOfCurrentMonth, now);
  }, [transactions]);

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
    // A more fitting skeleton for the new layout
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <SkeletonLoader height="h-8" width="w-48" />
                    <SkeletonLoader height="h-4" width="w-64" className="mt-2" />
                </div>
                <SkeletonLoader height="h-10" width="w-40" />
            </div>
        </div>
        <div className="w-full max-w-7xl mx-auto grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SkeletonLoader height="h-32" />
            <SkeletonLoader height="h-32" />
            <SkeletonLoader height="h-32" />
            <SkeletonLoader height="h-32" />
        </div>
        <div className="w-full max-w-7xl mx-auto">
            <SkeletonLoader height="h-64" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      <DashboardHeader userName={user.name} />

      <DashboardStats 
        balance={user.balance}
        currentMonthSpending={currentMonthSpending}
        activeProjectsCount={activeProjects.length}
        accountStatus={user.accountStatus}
      />
      
      <section className="w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Projects</h2>
            <Link href="/projects" passHref>
              <Button variant="outline">View All</Button>
            </Link>
        </div>
        <ActiveProjectsSummary initialProjects={activeProjects} />
      </section>

      <section className="w-full max-w-7xl mx-auto">
        <SpendingHistoryChart transactions={transactions || []} />
      </section>

    </div>
  );
}
