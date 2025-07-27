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
      const project = FAKE_PROJECTS.find(p => p._id === projectId) || null;
      return {
        data: project,
        isLoading: false,
        isError: !project,
        error: project ? null : new Error('Project not found'),
      };
    }
    
    return useQuery<Project, Error>({
      queryKey: ['project', projectId],
      queryFn: () => {
        // Add proper validation before calling the API
        if (!projectId) {
          throw new Error('Project ID is required');
        }
        return api.getProjectById(projectId);
      },
      enabled: !!projectId, // This should prevent the query from running if projectId is undefined
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Spread any additional options like `initialData`
      ...options,
    });
};
