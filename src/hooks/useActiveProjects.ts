import { useQuery } from '@tanstack/react-query';
import { ProjectSummary } from '../types/project';
import { httpClient } from '../lib/httpClient'; // Assuming httpClient is available here

interface UseActiveProjectsResult {
  data: ProjectSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchActiveProjects = async (): Promise<ProjectSummary[]> => {
  const response = await httpClient.get('/projects');
  // Filter projects to include only those with status 'active'
  return response.data.filter((project: ProjectSummary) => project.status === 'active');
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
