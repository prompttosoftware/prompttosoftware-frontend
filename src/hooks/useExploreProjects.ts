import { useQuery, UseQueryOptions, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { FAKE_EXPLORE_PROJECTS } from '@/lib/dev/fakeData';
import { ProjectSummary, PaginatedResponse, ExploreProjectsParams } from '../types/project';
import { api } from '@/lib/api';

// Define the type for the options we can pass to useQuery
type ExploreProjectsQueryOptions = Omit<
  UseQueryOptions<PaginatedResponse<ProjectSummary>, Error>,
  'queryKey' | 'queryFn'
>;

// The hook now accepts the params and additional react-query options
export function useExploreProjects(
  params: ExploreProjectsParams,
  options?: ExploreProjectsQueryOptions
) {
  const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';
  const debouncedQuery = useDebounce(params.query || '', 500);
  const queryParams: ExploreProjectsParams = {
    ...params,
    query: debouncedQuery,
  };

  if (isDevFakeMode) {
    const filteredFakeProjects = FAKE_EXPLORE_PROJECTS.filter(p =>
      p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
    // NOTE: The fake mode doesn't support `isPlaceholderData` as it bypasses useQuery.
    // This is an acceptable trade-off for a development-only feature.
    return {
      data: {
        data: filteredFakeProjects,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(filteredFakeProjects.length / 10),
        total: filteredFakeProjects.length,
      } as PaginatedResponse<ProjectSummary>,
      isLoading: false,
      isError: false,
      error: null,
      isPlaceholderData: false, // Updated from isPreviousData
      isSuccess: true,
      status: 'success' as const,
    };
  }

  const queryKey = ['exploreProjects', queryParams];
  return useQuery<PaginatedResponse<ProjectSummary>, Error>({
    queryKey,
    queryFn: () => api.searchExploreProjects(queryParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Spread any additional options like `initialData` or `placeholderData`
    ...options,
  });
}
