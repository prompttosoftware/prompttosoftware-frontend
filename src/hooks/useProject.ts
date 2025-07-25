import { api } from '@/lib/api';
import { FAKE_PROJECTS } from '@/lib/dev/fakeData';
import { Project } from '@/types/project';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Define the type for the options we can pass to useQuery
type ProjectQueryOptions = Omit<
  UseQueryOptions<Project, Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Fetches a single project by its ID.
 * @param projectId The ID of the project.
 * @param options - Additional react-query options like `initialData`.
 */
export const useProject = (projectId?: string, options?: ProjectQueryOptions) => {
    const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';
    
    if (isDevFakeMode) {
      const project = FAKE_PROJECTS.find(p => p.id === projectId) || null;
      return {
        data: project,
        isLoading: false,
        isError: !project,
        error: project ? null : new Error('Project not found'),
      };
    }

    return useQuery<Project, Error>({
      queryKey: ['project', projectId],
      queryFn: () => api.getProjectById(projectId!),
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Spread any additional options like `initialData`
      ...options,
    });
};
