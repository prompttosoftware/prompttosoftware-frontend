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
   
    return useQuery<Project, Error>({
      queryKey: ['project', projectId],
      queryFn: async () => {
        console.log('useProject queryFn called for ID:', projectId);
        
        if (isDevFakeMode) {
          if (!projectId) throw new Error('Project ID is required');
          const project = FAKE_PROJECTS.find(p => p._id === projectId);
          if (!project) throw new Error('Project not found');
          console.log('Fake project found:', project);
          return project;
        }
        
        if (!projectId) throw new Error('Project ID is required');
        
        console.log('Calling api.getProjectById...');
        try {
          const result = await api.getProjectById(projectId);
          console.log('API call successful:', result);
          return result;
        } catch (error) {
          console.error('API call failed:', error);
          throw error;
        }
      },
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000,
      ...options,
    });
};
