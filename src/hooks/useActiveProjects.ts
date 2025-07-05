import { useQuery } from '@tanstack/react-query';
import { ProjectSummary, Project } from '../types/project';
import { httpClient } from '../lib/httpClient'; // Assuming httpClient is available here

interface UseActiveProjectsResult {
  data: ProjectSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

import { logger } from '../utils/logger'; // Import logger

const fetchActiveProjects = async (): Promise<ProjectSummary[]> => {
  try {
    const response = await httpClient.get<Project[]>('/projects'); // Specify Project[] as the response type
    // Filter projects to include only those with status 'active' and map to ProjectSummary
    return response.data
      .filter(project => project.status === 'active')
      .map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status as 'active' | 'stopped' | 'completed' | 'failed', // Cast to ProjectSummary status types
        repositoryUrl: project.repositoryUrl,
        costToDate: project.cost,
        totalRuntime: project.elapsedTime,
        progress: project.progress,
      }));
  } catch (error) {
    logger.error('Failed to fetch active projects:', error);
    throw error; // Re-throw to be caught by React Query's error handling
  }
};

export const useActiveProjects = (): UseActiveProjectsResult => {
  const { data, isLoading, isError, error } = useQuery<ProjectSummary[], Error>({
    queryKey: ['activeProjects'],
    queryFn: fetchActiveProjects,
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};
