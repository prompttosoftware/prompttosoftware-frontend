import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useStarProject = () => {
  const queryClient = useQueryClient();

  const starMutation = useMutation({
    mutationFn: (projectId: string) => api.starProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exploreProjects'] });
    },
  });

  const unstarMutation = useMutation({
    mutationFn: (projectId: string) => api.unstarProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exploreProjects'] });
    },
  });

  const toggleStar = (projectId: string, isCurrentlyStarred: boolean) => {
    if (isCurrentlyStarred) {
      unstarMutation.mutate(projectId);
    } else {
      starMutation.mutate(projectId);
    }
  };

  return {
    starProject: starMutation.mutate,
    unstarProject: unstarMutation.mutate,
    toggleStar,
    isLoading: starMutation.isPending || unstarMutation.isPending,
  };
};
