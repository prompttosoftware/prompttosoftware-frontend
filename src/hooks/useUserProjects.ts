import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/lib/api';
import { setGlobalError } from '@/store/globalErrorStore';
import { ProjectSummary } from '@/types/project';

export const useUserProjects = () => {
  return useQuery<ProjectSummary[], Error>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetchProjects();
      // Assuming fetchProjects returns { data: ProjectSummary[] }
      // Adjust if fetchProjects directly returns ProjectSummary[]
      return response.data;
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
