'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useExploreProjects } from '@/hooks/useExploreProjects';
import ExploreProjectCard from './ExploreProjectCard';
import EmptyState from '@/app/(main)/components/EmptyState';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import { PaginatedResponse, ExploreProjectsParams } from '@/types/project';
import { Button } from '@/components/ui/button';
import { keepPreviousData } from '@tanstack/react-query';

interface ExploreClientProps {
  initialData: PaginatedResponse<any>;
  initialParams: ExploreProjectsParams;
}

/**
 * This Client Component manages all interactive parts of the Explore page.
 * 1. It's initialized with data fetched from the server (`initialData`).
 * 2. It uses the `useExploreProjects` hook for any client-side refetching (when filters change).
 * 3. It syncs its filter state back to the URL for shareable links and browser history.
 */
export default function ExploreClient({ initialData, initialParams }: ExploreClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // State for filters is initialized from the props passed by the server component.
  const [filters, setFilters] = useState<ExploreProjectsParams>(initialParams);

  // The `useExploreProjects` hook is now seeded with the initial data.
  // `react-query` is smart enough not to refetch on mount if initialData is provided.
  // It will only refetch when the `filters` dependency changes.
  const { data, isLoading, isError, error, isPlaceholderData } = useExploreProjects(filters, {
    initialData: initialData,
    placeholderData: keepPreviousData, // Smoother UX for pagination
  });
  
  const projects = data?.data ?? [];

  // This effect syncs the component's state with the URL's query string.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    
    // Use `replace` to avoid polluting browser history for every filter change.
    router.replace(`${pathname}?${params.toString()}`);
  }, [filters, pathname, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [ExploreProjectsParams['sortBy'], ExploreProjectsParams['sortOrder']];
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (data?.totalPages ?? 1)) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search projects by name..."
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.query}
          onChange={handleSearchChange}
        />
        <select
          className="p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={handleSortChange}
        >
          <option value="createdAt-desc">Most Recent</option>
          <option value="stars-desc">Most Stars</option>
          <option value="createdAt-asc">Oldest First</option>
        </select>
      </div>

      {isLoading && <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}
      {isError && <div className="text-center text-red-500">Error: {error?.message}</div>}

      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          title="No Projects Found"
          description="Try adjusting your search or filter criteria."
        />
      )}
      
      {projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ExploreProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          <div className="flex justify-center items-center mt-8 space-x-4">
            <Button onClick={() => handlePageChange(filters.page ?? 1 - 1)} disabled={filters.page === 1 || isPlaceholderData}>
              Previous
            </Button>
            <span>Page {data?.page} of {data?.totalPages}</span>
            <Button onClick={() => handlePageChange(filters.page ?? 1 + 1)} disabled={filters.page === data?.totalPages || isPlaceholderData}>
              Next
            </Button>
          </div>
        </>
      )}
    </>
  );
}
