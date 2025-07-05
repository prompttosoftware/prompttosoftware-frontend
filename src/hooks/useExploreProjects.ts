import { useQuery } from '@tanstack/react-query';
import { getExploreProjects } from '../services/projectsService';
import { ProjectSummary } from '../types/project';
import { useDebounce } from './useDebounce';

export function useExploreProjects() {
  const { data, isLoading, isError, error } = useQuery<ProjectSummary[], Error>({
    queryKey: ['exploreProjects'],
    queryFn: () => getExploreProjects(),
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
