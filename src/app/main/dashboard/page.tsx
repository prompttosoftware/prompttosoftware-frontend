'use client';

import { useUserProjects } from '@/hooks/useUserProjects';
import { ProjectCard } from '../components/ProjectCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { useGlobalErrorStore } from '@/store/globalErrorStore'; // Corrected import
import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AddPaymentButton from '@/app/main/components/AddPaymentButton'; // Import AddPaymentButton
import ActiveProjectsSummary from './components/ActiveProjectsSummary'; // Import ActiveProjectsSummary

export default function DashboardPage() {
  const { projects, isLoading, error } = useUserProjects();
  const store = useGlobalErrorStore();
  const { setError } = store;

  useEffect(() => {
    if (error) {
      setError({ message: 'Failed to load projects.', description: error.message });
    }
  }, [error, setError]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Dashboard</h1>

        <div className="flex justify-center mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-left w-full">Account Usage & Payments</h2>
          <div className="w-full flex justify-between items-center mt-4">
            {/* Placeholder for usage information/spending graph */}
            <p className="text-gray-600">Your account usage details will appear here.</p>
            <AddPaymentButton />
          </div>
        </div>
        
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
