'use client';

import { useUserProjects } from '@/hooks/useUserProjects';
import ProjectCard from '../components/ProjectCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useGlobalErrorStore } from '@/store/globalErrorStore'; // Corrected import
import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AddPaymentButton from '@/app/main/components/AddPaymentButton';
import { ActiveProjectsSummary } from './components';
import AccountUsageSection from './components/AccountUsageSection'; // Import AccountUsageSection
import { useUserProfileQuery } from '@/hooks/useUserProfileQuery'; // Import useUserProfileQuery

export default function DashboardPage() {
    const { data: projects, isLoading, error } = useUserProjects();
    const store = useGlobalErrorStore();
    const { setError } = store;

    useEffect(() => {
        if (error) {
            setError({ message: 'Failed to load projects.', description: error.message });
        }
    }, [error, setError]);

    const { user: usageDataFromProfile, isLoading: usageLoading, error: usageError } = useUserProfileQuery();
    const usageData = usageDataFromProfile?.usage || { currentMonthSpending: 0, previousMonthSpending: 0, totalBudget: 0, historicalSpending: [] };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
                <h1 className="text-4xl sm:text-5xl font-bold mb-8">Dashboard</h1>
                
                <div className="flex justify-center mb-8">
                    <AddPaymentButton />
                </div>
                
                <AccountUsageSection
                    usageData={usageData}
                    usageLoading={usageLoading}
                    usageError={usageError}
                />

                {/* Active Projects Section */}
                <section className="w-full max-w-5xl mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-semibold text-left">Active Projects</h2>
                        <Link href="/projects" passHref>
                            <Button variant="outline">View all</Button>
                        </Link>
                    </div>
                    <ActiveProjectsSummary />
                </section>
            </main>
        </div>
    );
}
