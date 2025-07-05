'use client';

import React from 'react';
import { useUserProjects } from '@/hooks/useUserProjects';
import ProjectCard from '@/app/main/components/ProjectCard';
import EmptyState from '@/app/main/components/EmptyState'; // Ensure this is the default export
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SkeletonLoader from '@/app/main/components/SkeletonLoader'; // Ensure this is the default export

const ProjectsPage = () => {
  const { data: projects, isLoading, isError } = useUserProjects(); // Destructure data as 'projects' for clarity

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Projects</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader count={6} /> {/* Display 6 skeleton loaders to fill space */}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Projects</h1>
        <EmptyState
          title="Error loading projects"
          description="There was an error fetching your projects. Please try again."
        />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Projects</h1>
        <EmptyState
          title="You have no projects"
          description="Get started by creating your first project."
        >
          <Link href="/new-project" passHref>
            <Button className="mt-4">Create a new project</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" data-tutorialid="projects-page-container">
      <h1 className="text-2xl font-bold mb-4">Your Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
