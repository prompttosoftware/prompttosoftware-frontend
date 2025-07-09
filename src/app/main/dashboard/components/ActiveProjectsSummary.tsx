'use client';

import React, { useEffect } from 'react';
import { useActiveProjects } from '@/hooks/useActiveProjects';
import SkeletonLoader from '@/app/main/components/SkeletonLoader';
import EmptyState from '@/app/main/components/EmptyState';
import ProjectSummaryCard from './ProjectSummaryCard';
import { useGlobalErrorStore } from '@/store/globalErrorStore';

const ActiveProjectsSummary: React.FC = () => {
  const { data: activeProjects, isLoading, isError, error } = useActiveProjects();
  const { setError } = useGlobalErrorStore();

  useEffect(() => {
    if (isError && error) {
      setError({
        message: 'Failed to load active projects.',
        description: error.message,
      });
    }
  }, [isError, error, setError]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonLoader key={i} height="h-64" className="rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    // Error is handled by global error store via useEffect
    return (
      <div className="py-8 text-center text-red-600">
        <p>An error occurred while loading projects. Please try again later.</p>
      </div>
    );
  }

  if (!activeProjects || activeProjects.length === 0) {
    return (
      <EmptyState
        title="No Active Projects"
        description="You have no active projects. Start a new one to see it here!"
        buttonText="Start a New Project"
        buttonLink="/new-project"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {activeProjects.map((project) => (
        <ProjectSummaryCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ActiveProjectsSummary;
