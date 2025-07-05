'use client';

import { useState } from 'react';
import { useMemo } from 'react'; // Added useMemo
import { useExploreProjects } from '@/hooks/useExploreProjects';
import ExploreProjectCard from '@/app/(main)/explore/components/ExploreProjectCard';
import EmptyState from '@/app/main/components/EmptyState';
import LoadingSpinner from '@/app/main/components/LoadingSpinner';
import { ProjectSummary } from '@/types/project'; // Import ProjectSummary type

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'githubStars' | 'name'>('createdAt'); // Changed type for sortBy
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { projects, isLoading, isError, error } = useExploreProjects(); // Removed params

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Logic for combined sort-by and sort-order in one select
    const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Client-side filtering
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  // Client-side sorting
  const sortedProjects = useMemo(() => {
    if (!filteredProjects) return [];

    const sorted = [...filteredProjects].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortBy) {
        case 'createdAt':
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case 'githubStars':
          valA = a.githubStars || 0;
          valB = b.githubStars || 0;
          break;
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });
    return sorted;
  }, [filteredProjects, sortBy, sortOrder]);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Projects</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center"> {/* Added items-center for alignment */}
        <input
          type="text"
          placeholder="Search projects..."
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <select
          className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={`${sortBy}-${sortOrder}`} // Combine sort by and order for single select
          onChange={handleSortChange}
        >
          <option value="createdAt-desc">Recent</option> {/* Changed to Recent */}
          <option value="githubStars-desc">Trending</option> {/* Changed to Trending */}
          <option value="name-asc">Name (A-Z)</option> {/* Added Name (A-Z) */}
          <option value="name-desc">Name (Z-A)</option> {/* Added Name (Z-A) */}
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

      {!isLoading && !isError && sortedProjects.length === 0 && (
        <EmptyState
          title="No projects found"
          description="Adjust your search criteria or sorting options and try again."
        />
      )}

      {!isLoading && !isError && sortedProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <ExploreProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
