'use client';

import { useState } from 'react';
import { useExploreProjects } from '@/hooks/useExploreProjects';
import ExploreProjectCard from '@/app/(main)/explore/components/ExploreProjectCard';
import EmptyState from '@/app/main/components/EmptyState';
import LoadingSpinner from '@/app/main/components/LoadingSpinner';
import { ProjectSummary } from '@/types/project';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('createdAt-desc'); // Combines sortBy and sortOrder

  // Pass an object with searchQuery and sortOption to the useExploreProjects hook
  const { data: projects, isLoading, isError, error } = useExploreProjects({ searchQuery, sortOption });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Projects</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search projects..."
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <select
          className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortOption}
          onChange={handleSortChange}
        >
          <option value="createdAt-desc">Recent (newest first)</option>
          <option value="githubStars-desc">Trending (most stars)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <p className="ml-2 text-gray-600">Loading projects...</p>
        </div>
      )}

      {isError && (
        <div className="flex justify-center items-center h-64 text-red-600">
          <p>Error: {error?.message || 'Failed to load projects.'} Please try again later.</p>
        </div>
      )}

      {!isLoading && !isError && Array.isArray(projects) && projects.length === 0 && (
        <EmptyState
          title="No projects found"
          description="Adjust your search criteria or sorting options and try again."
        />
      )}
      
      {!isLoading && !isError && Array.isArray(projects) && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ExploreProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
