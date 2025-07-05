'use client';

import { useState } from 'react';
import { useExploreProjects } from '@/hooks/useExploreProjects';
import ExploreProjectCard from '@/app/main/explore/components/ExploreProjectCard';
import EmptyState from '@/app/main/components/EmptyState';
import LoadingSpinner from '@/app/main/components/LoadingSpinner';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { projects, isLoading, isError, error } = useExploreProjects({
    searchQuery,
    sortBy,
    sortOrder,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Projects</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <select
          className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortBy}
          onChange={handleSortByChange}
        >
          <option value="createdAt">Most Recent</option>
          <option value="githubStars">Most Stars</option>
          <option value="name">Name</option>
        </select>

        <select
          className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortOrder}
          onChange={handleSortOrderChange}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
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

      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          title="No projects found"
          description="Adjust your search criteria or sorting options and try again."
        />
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ExploreProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
