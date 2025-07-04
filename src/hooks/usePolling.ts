import { useQuery } from '@tanstack/react-query';
import { ProjectStatus } from '@/types/project';
import { httpClient } from '@/lib/httpClient';

interface UsePollingOptions {
  refetchInterval?: number; // in milliseconds
}

// Generic polling hook for any data type and URL
export const useGenericPolling = <TData>(url: string, options?: UsePollingOptions) => {
  const defaultRefetchInterval = 60 * 1000; // Default to 1 minute

  return useQuery<TData, Error>({
    queryKey: [url],
    queryFn: async () => {
      const response = await httpClient.get<TData>(url);
      return response.data;
    },
    refetchInterval: options?.refetchInterval ?? defaultRefetchInterval,
    // React Query's default behavior includes refetchOnWindowFocus and refetchOnReconnect
    // which handles pausing/resuming polling when the tab/window is not in focus.
    staleTime: Infinity, // Data is always considered stale on refetchInterval
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff retry delay
  });
};

// Specific hook for polling ProjectStatus
interface UseProjectStatusPollingOptions extends UsePollingOptions {
  // Add any specific options for project status polling if needed
}

export const usePolling = (projectId: string, options?: UseProjectStatusPollingOptions) => {
  const url = `/projects/${projectId}/status`;
  const defaultRefetchInterval = 60 * 1000; // 1 minute in milliseconds

  return useQuery<ProjectStatus, Error>({
    queryKey: ['projectStatus', projectId], // Unique query key for project status
    queryFn: async () => {
      const response = await httpClient.get<ProjectStatus>(url);
      return response.data;
    },
    refetchInterval: options?.refetchInterval ?? defaultRefetchInterval,
    // Refetch when window regains focus or network reconnects (React Query default)
    staleTime: Infinity, // Data is always considered stale on refetchInterval
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff retry delay
    enabled: !!projectId, // Only run the query if projectId is provided
  });
};
