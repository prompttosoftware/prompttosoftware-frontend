import { useQuery } from '@tanstack/react-query';
import { getExploreProjects } from '../services/projectsService';
import { ProjectSummary } from '../types/project';
import { useDebounce } from './useDebounce';

type SortByOption = 'createdAt' | 'name' | 'costToDate' | 'totalRuntime' | 'progress' | 'githubStars';
type SortOrder = 'asc' | 'desc';

interface UseExploreProjectsProps {
  searchQuery: string;
  sortBy: SortByOption;
  sortOrder: SortOrder;
}

export function useExploreProjects({ searchQuery, sortBy, sortOrder }: UseExploreProjectsProps) {
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading, isError, error } = useQuery<ProjectSummary[], Error>({
    queryKey: ['exploreProjects', debouncedSearchQuery, sortBy, sortOrder],
    queryFn: () => getExploreProjects(debouncedSearchQuery, sortBy, sortOrder),
    // The API is public and does not require JWT authentication.
    // This query can be refetched by default, but no specific staletime or cachetime
    // is mentioned, so we'll stick to react-query defaults for now.
  });

  return {
    projects: data || [], // Ensure projects is always an array
    isLoading,
    isError,
    error,
  };
}
