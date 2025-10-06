// src/hooks/useAnalysisActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Analysis, AnalysisFormData } from '@/types/analysis';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

// Suggestion for API response type for rerun
interface RerunResponse {
  data: Analysis;
}

export const useAnalysisActions = (analysisId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const analysisQueryKey = ['analysis', analysisId];
  const userAnalysesQueryKey = ['userAnalysis'];

  const invalidateAnalysisQueries = () => {
    // Invalidate both the specific analysis and the list
    queryClient.invalidateQueries({ queryKey: analysisQueryKey });
    queryClient.invalidateQueries({ queryKey: userAnalysesQueryKey });
  };

  // --- DELETE MUTATION ---
  const deleteAnalysis = useMutation({
    mutationFn: () => api.deleteAnalysis(analysisId),
    onSuccess: () => {
      toast.success('Analysis deleted successfully.');
      
      // Remove this specific analysis from the cache to prevent stale data
      queryClient.removeQueries({ queryKey: analysisQueryKey });
      
      // Optionally, we can proactively remove it from the list cache as well
      queryClient.setQueryData(userAnalysesQueryKey, (oldData: Analysis[] | undefined) =>
        oldData ? oldData.filter(a => a._id !== analysisId) : []
      );

      router.push('/analysis');
    },
    onError: (error) => {
      logger.error('Failed to delete analysis:', error);
      toast.error('Failed to delete analysis. Please try again.');
    },
  });

  // --- RERUN MUTATION ---
  const rerunAnalysis = useMutation({
    // Assuming API returns the new analysis object or its ID
    mutationFn: (payload?: AnalysisFormData) => api.rerunAnalysis(analysisId, payload),
    onSuccess: (newAnalysis) => { // 'newAnalysis' is the data returned from the API call
      toast.success(`New analysis for "${newAnalysis.repository}" has started.`);
      
      // Invalidate the list to show the new analysis
      queryClient.invalidateQueries({ queryKey: userAnalysesQueryKey });

      // Navigate to the new analysis page
      router.push(`/analysis/${newAnalysis._id}`);
    },
    onError: (error) => {
      logger.error('Failed to rerun analysis:', error);
      toast.error('Failed to start a new analysis. Please try again.');
    },
  });

  // --- STOP MUTATION (with Optimistic Update) ---
  const stopAnalysis = useMutation({
    mutationFn: () => api.stopAnalysis(analysisId),
    
    // 1. Optimistic Update Logic
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: analysisQueryKey });

      // Snapshot the previous value
      const previousAnalysis = queryClient.getQueryData<Analysis>(analysisQueryKey);

      // Optimistically update to the new value
      if (previousAnalysis) {
        queryClient.setQueryData(analysisQueryKey, {
          ...previousAnalysis,
          status: 'stopping',
        });
      }
      
      // Return a context object with the snapshotted value
      return { previousAnalysis };
    },

    // 2. On success of the API call
    onSuccess: () => {
      toast.info('Stop request sent. The analysis is now stopping.');
      // The status will be updated to 'stopped' automatically by the polling `useAnalysis` hook later.
      // We can trigger a refetch to speed it up.
      invalidateAnalysisQueries();
    },

    // 3. If the mutation fails, use the context we returned from onMutate to roll back
    onError: (err, variables, context) => {
      logger.error('Failed to stop analysis:', err);
      toast.error('Failed to send stop request. Please try again.');
      
      // Rollback to the previous state on error
      if (context?.previousAnalysis) {
        queryClient.setQueryData(analysisQueryKey, context.previousAnalysis);
      }
    },

    // 4. Always refetch after the mutation is settled (either success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: analysisQueryKey });
    },
  });

  // Create mutation is not used on this page, but keeping it is fine.
  const createAnalysis = useMutation({
    mutationFn: (payload: AnalysisFormData) => api.createAnalysis(payload),
    onSuccess: () => {
        invalidateAnalysisQueries();
        toast.success("Analysis created successfully!");
    },
    onError: (error) => {
        logger.error('Failed to create analysis:', error);
        toast.error("Failed to create analysis.");
    }
  });


  return {
    deleteAnalysis,
    rerunAnalysis,
    createAnalysis,
    stopAnalysis,
  };
};
