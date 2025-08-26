// src/hooks/useUserProjects.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query'; // Import UseQueryOptions
import { Project } from '@/types/project';
import { FAKE_PROJECTS } from '@/lib/dev/fakeData';
import { api } from '@/lib/api';

// Define a more flexible options type. It accepts any `useQuery` option
// except for `queryKey` and `queryFn`, which we define inside the hook.
type UseUserProjectsOptions = Omit<
  UseQueryOptions<Project[], Error>,
  'queryKey' | 'queryFn'
>;

export const useUserProjects = (options?: UseUserProjectsOptions) => {
  const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';

  if (isDevFakeMode) {
    return {
      data: FAKE_PROJECTS as Project[],
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      status: 'success' as const,
    };
  }
  
  // Now, we spread the incoming options object into useQuery.
  // This allows us to pass `initialData`, `enabled`, etc., from the component.
  return useQuery<Project[], Error>({
    queryKey: ['userProjects'],
    queryFn: api.listUserProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 1 * 60 * 1000,
    ...options, // Spread the options here
  });
};
