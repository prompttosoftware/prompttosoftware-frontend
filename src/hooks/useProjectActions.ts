// src/hooks/useProjectActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { UserMessagePayload, SensitiveDataResponsePayload } from '@/types/project';
import { useRouter } from 'next/navigation';

// This hook is designed to be used on a page where you already know the projectId
export const useProjectActions = (projectId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // A helper function to invalidate queries and force a refetch of project data
  const invalidateProjectQueries = () => {
    // Refetch the detailed data for this specific project
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    // Refetch the list of all user projects (in case status or name changed)
    queryClient.invalidateQueries({ queryKey: ['userProjects'] });
  };

  const startProjectMutation = useMutation({
    mutationFn: () => api.startProject(projectId),
    onSuccess: () => {
      // When the mutation is successful, refetch the project data
      invalidateProjectQueries();
      // You can also show a success notification here
    },
    // You can add onError for specific error handling
  });

  const stopProjectMutation = useMutation({
    mutationFn: () => api.stopProject(projectId),
    onSuccess: invalidateProjectQueries, // Shorthand for () => invalidateProjectQueries()
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => api.deleteProject(projectId),
    onSuccess: () => {
      // After deleting, invalidate the list to remove it
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      // And redirect the user away from the deleted project's page
      router.push('/dashboard');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (payload: UserMessagePayload) => api.handleUserMessage(projectId, payload),
    onSuccess: invalidateProjectQueries,
  });
  
  const respondToSensitiveDataMutation = useMutation({
    mutationFn: (payload: SensitiveDataResponsePayload) => api.handleSensitiveDataResponse(projectId, payload),
    onSuccess: invalidateProjectQueries,
  });

  return {
    startProject: startProjectMutation,
    stopProject: stopProjectMutation,
    deleteProject: deleteProjectMutation,
    sendMessage: sendMessageMutation,
    respondToSensitiveData: respondToSensitiveDataMutation,
  };
};
