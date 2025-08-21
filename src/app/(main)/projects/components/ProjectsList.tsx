// app/(main)/projects/components/ProjectList.tsx
'use client';

import React from 'react';
import { useUserProjects } from '@/hooks/useUserProjects';
import { Project } from '@/types/project';
import ProjectCard from '@/app/(main)/components/ProjectCard';
import EmptyState from '@/app/(main)/components/EmptyState';
import SkeletonLoader from '../../components/SkeletonLoader';

interface ProjectListProps {
  initialProjects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ initialProjects }) => {
  const { data: projects, isLoading, isError } = useUserProjects({
    initialData: initialProjects,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLoader key={index} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  // Client-side error state
  if (isError) {
    return (
      <EmptyState
        title="Error Loading Projects"
        description="We couldn't load your projects at this time. Please try again later."
      />
    );
  }

  // Empty state if no projects are found
  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        title="No Projects Yet"
        description="Get started by creating your first project."
      />
    );
  }

  // Success state: render the project cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: Project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList;
