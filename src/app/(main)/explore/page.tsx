'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExploreProjects } from '@/services/projectsService';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import { useGlobalError } from '@/hooks/useGlobalError';
import { projectKeys } from '@/services/projectKeys';
import ProjectCard from './components/ProjectCard'; // Import ProjectCard
import { ProjectSummary } from '@/types/project'; // Import ProjectSummary

const ExplorePage = () => {
  const { showError } = useGlobalError();

  const { data, isLoading, isError, error } = useQuery<ProjectSummary[]>({
    // Specify ProjectSummary[] type
    queryKey: projectKeys.explore(),
    queryFn: getExploreProjects,
  });

  useEffect(() => {
    if (isError) {
      showError('Failed to load projects. Please try again later.', error?.message);
    }
  }, [isError, error, showError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {' '}
        {/* Use h-screen for full height */}
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return null; // Error is handled by global error modal
  }

  const projects = data || [];
  const isEmpty = projects.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        {' '}
        {/* Use h-screen for full height */}
        <p className="text-2xl font-semibold text-gray-700 mb-4">No projects found.</p>
        <p className="text-gray-500 text-center">
          It looks like there are no public projects available right now. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {' '}
        {/* Responsive grid */}
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
