'use client';

import React from 'react';
import { UserProfile } from '@/types/auth';
import { Project } from '@/types/project';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthProvider } from '@/lib/AuthContext';
import AccountUsageSection from '@/app/(main)/dashboard/components/AccountUsageSection';
import ActiveProjectsSummary from '@/app/(main)/dashboard/components/ActiveProjectsSummary';

type DashboardClientProps = {
  user: UserProfile;
  activeProjects: Project[];
};

export default function DashboardClient({ user, activeProjects }: DashboardClientProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8">Welcome, {user.name}!</h1>
          <AuthProvider initialData={user}>
      
          <AccountUsageSection initialUser={user} />
          
          <section className="w-full max-w-5xl mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-left">Active Projects</h2>
                <Link href="/projects" passHref>
                <Button variant="outline">View all</Button>
                </Link>
            </div>
            <ActiveProjectsSummary initialProjects={activeProjects} />
          </section>
        </AuthProvider>
      </main>
    </div>
  );
}
