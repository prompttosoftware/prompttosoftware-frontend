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
import { ChevronDown } from 'lucide-react'; // A popular icon library, or use your own SVG

// Import the newly needed parts from Radix UI
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectIcon,
  SelectItemText,
} from '@radix-ui/react-select';

interface ExploreClientProps {
  initialData: PaginatedResponse<any>;
  initialParams: ExploreProjectsParams;
}

export default function ExploreClient({ initialData, initialParams }: ExploreClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<ExploreProjectsParams>(initialParams);

  const { data, isLoading, isError, error, isPlaceholderData } = useExploreProjects(filters, {
    initialData: initialData,
    placeholderData: keepPreviousData,
  });
  
  const projects = data?.data ?? [];

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    
    router.replace(`${pathname}?${params.toString()}`);
  }, [filters, pathname, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [ExploreProjectsParams['sortBy'], ExploreProjectsParams['sortOrder']];
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
          // Added h-10 for consistent height
          className="flex-grow p-3 h-10 border rounded-md bg-input focus:ring"
          id="explore-search-input"
          value={filters.query}
          onChange={handleSearchChange}
        />
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={handleSortChange}
        >
          {/* 
            - Added h-10 to match the input height.
            - Added flex and items-center for proper internal alignment.
          */}
          <SelectTrigger className="w-full sm:w-[200px] flex items-center justify-between p-3 h-10 border rounded-md bg-input focus:ring" id="explore-filters-group">
            <SelectValue placeholder="Sort by..." />
            <SelectIcon asChild>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectContent 
              position="popper" 
              sideOffset={5}
              className="w-[--radix-select-trigger-width] bg-popover text-popover-foreground border rounded-md shadow-lg py-1 z-50"
            >
              {/* Each item's text is now wrapped in SelectItemText to fix the blank trigger issue */}
              <SelectItem 
                value="createdAt-desc" 
                className="relative flex items-center px-4 py-2 text-sm cursor-pointer outline-none hover:bg-accent focus:bg-accent"
              >
                <SelectItemText>Most Recent</SelectItemText>
              </SelectItem>
              <SelectItem 
                value="stars-desc" 
                className="relative flex items-center px-4 py-2 text-sm cursor-pointer outline-none hover:bg-accent focus:bg-accent"
              >
                <SelectItemText>Most Stars</SelectItemText>
              </SelectItem>
              <SelectItem 
                value="createdAt-asc" 
                className="relative flex items-center px-4 py-2 text-sm cursor-pointer outline-none hover:bg-accent focus:bg-accent"
              >
                <SelectItemText>Oldest First</SelectItemText>
              </SelectItem>
            </SelectContent>
          </SelectPortal>
        </Select>
      </div>

      {isLoading && <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}
      {isError && <div className="text-center text-destructive">Error: {error?.message}</div>}

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
              <ExploreProjectCard key={project._id} project={project} />
            ))}
          </div>
          
          <div className="flex justify-center items-center mt-8 space-x-4">
            <Button onClick={() => handlePageChange((filters.page ?? 1) - 1)} disabled={filters.page === 1 || isPlaceholderData}>
              Previous
            </Button>
            <span>Page {data?.page} of {data?.totalPages}</span>
            <Button onClick={() => handlePageChange((filters.page ?? 1) + 1)} disabled={filters.page === data?.totalPages || isPlaceholderData}>
              Next
            </Button>
          </div>
        </>
      )}
    </>
  );
}
