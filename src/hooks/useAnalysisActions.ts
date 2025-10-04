// src/hooks/useAnalysisActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Analysis, AnalysisFormData } from '@/types/analysis';

// This hook is designed to be used on a page where you already know the analysisId
export const useAnalysisActions = (analysisId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const invalidateAnalysisQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['analysis', analysisId] });
    queryClient.invalidateQueries({ queryKey: ['userAnalysis'] });
  };

  const deleteAnalysisMutation = useMutation({
    mutationFn: () => api.deleteAnalysis(analysisId),
    onSuccess: () => {
      queryClient.setQueryData(['userAnalysis'], (oldData: Analysis[] | undefined) => {
        if (!oldData) {
          return oldData;
        }
        return oldData.filter(analysis => analysis._id !== analysisId);
      });

      queryClient.removeQueries({ queryKey: ['analysis', analysisId] });
      
      router.push('/analysis');
    },
  });

  const createAnalysisMutation = useMutation({
    mutationFn: (payload: AnalysisFormData) => api.createAnalysis(payload),
    onSuccess: invalidateAnalysisQueries,
  });

  const rerunAnalysisMutation = useMutation({
    mutationFn: (payload?: AnalysisFormData) => api.rerunAnalysis(analysisId, payload),
    onSuccess: invalidateAnalysisQueries,
  });

  return {
    deleteAnalysis: deleteAnalysisMutation,
    rerunAnalysis: rerunAnalysisMutation,
    createAnalysis: createAnalysisMutation
  };
};
