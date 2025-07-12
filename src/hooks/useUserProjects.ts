// src/hooks/useUserProjects.ts

import { useQuery } from '@tanstack/react-query';
import { setGlobalError } from '@/store/globalErrorStore';
import { Project, ProjectSummary } from '@/types/project';
import { FAKE_PROJECTS } from '@/lib/dev/fakeData';
import { api } from '@/lib/api';

interface UseUserProjectsOptions {
  enabled?: boolean;
}

export const useUserProjects = ({ enabled = true }: UseUserProjectsOptions = {}) => {
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

  return useQuery<ProjectSummary[], Error>({
    // Query key identifies this specific data fetch
    queryKey: ['userProjects'],
    // The query function now calls our specific, typed service function
    queryFn: api.listUserProjects,
    onError: (err: any) => {
      setGlobalError({
        message: err.message || 'Failed to fetch your projects.',
        type: 'error',
        description: err.response?.data?.message || null,
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // It's often good to refetch user data on focus
    enabled,
  });
};
