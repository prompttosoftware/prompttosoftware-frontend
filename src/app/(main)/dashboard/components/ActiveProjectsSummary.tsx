'use client';

import React from 'react';
import EmptyState from '@/app/(main)/components/EmptyState';
import ProjectSummaryCard from './ProjectSummaryCard';
import { Project } from '@/types/project';

interface ActiveProjectsSummaryProps {
  initialProjects: Project[]; // Receive the pre-filtered projects as a prop
}

const ActiveProjectsSummary: React.FC<ActiveProjectsSummaryProps> = ({ initialProjects }) => {
  // The component no longer needs to fetch, filter, or handle loading/error states.
  // The parent server component has already done all the work.

  if (initialProjects.length === 0) {
    return (
      <EmptyState
        title="No Active Projects"
        description="Projects that are running or starting will appear here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {initialProjects.map((project: Project) => (
        <ProjectSummaryCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ActiveProjectsSummary;
