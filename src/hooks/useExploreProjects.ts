import { useQuery } from '@tanstack/react-query';
import { getExploreProjects } from '../services/projectsService';
import { ProjectSummary } from '../types/project';
import { useDebounce } from './useDebounce';
// Removed useMemo as client-side filtering/sorting is removed

interface UseExploreProjectsOptions {
  searchQuery?: string;
  sortOption?: string; // Changed from 'trending' | 'recent' to string
}

export function useExploreProjects({ searchQuery, sortOption }: UseExploreProjectsOptions) {
  const debouncedSearchQuery = useDebounce(searchQuery || '', 500);

  const { data: projects, ...queryResult } = useQuery<ProjectSummary[], Error>({
    queryKey: ['exploreProjects', debouncedSearchQuery, sortOption],
    queryFn: () => getExploreProjects(debouncedSearchQuery, sortOption),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });

  return { data: projects, ...queryResult };
}
