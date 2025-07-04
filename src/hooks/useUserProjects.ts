import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { setGlobalError } from '@/store/globalErrorStore';
import { ProjectSummary } from '@/types/project';

export const useUserProjects = () => {
  return useQuery<ProjectSummary[], Error>({
    queryKey: ['projects'],
    queryFn: async () => {
      const projects = await api.getUserProjects();
      return projects;
    },
    onError: (err: any) => {
      setGlobalError({
        message: err.message || 'Failed to fetch projects.',
        type: 'error',
        details: err.response?.data || null,
      });
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    refetchOnWindowFocus: false, // Prevents unnecessary refetches on window focus
  });
};
