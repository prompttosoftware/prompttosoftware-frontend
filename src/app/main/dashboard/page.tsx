'use client';

import { useUserProjects } from '@/hooks/useUserProjects';
import { ProjectCard } from '../components/ProjectCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { useGlobalError } from '@/store/globalErrorStore';
import React, { useEffect } from 'react';

export default function DashboardPage() {
  const { projects, isLoading, error } = useUserProjects();
  const { showError } = useGlobalError();

  useEffect(() => {
    if (error) {
      showError('Failed to load projects.', error.message);
    }
  }, [error, showError]);

  const activeProjects = projects?.filter(project => project.status === 'active');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Dashboard</h1>

        {/* Active Projects Section */}
        <section className="w-full max-w-5xl mb-12">
          <h2 className="text-3xl font-semibold text-left mb-6">Active Projects</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader className="h-48 w-80" />
              <SkeletonLoader className="h-48 w-80" />
              <SkeletonLoader className="h-48 w-80" />
            </div>
          ) : activeProjects && activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  costToDate={project.costToDate || 0}
                  totalRuntime={project.totalRuntime || 0}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Active Projects"
              description="You have no active projects. Start a new project to see it here!"
              hideButton={true}
            />
          )}
        </section>

        {/* Other Dashboard sections can go here */}
      </main>
    </div>
  );
}
