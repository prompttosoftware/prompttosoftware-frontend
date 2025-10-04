import { api } from '@/lib/api';
import { FAKE_ANALYSIS_ARRAY } from '@/lib/dev/fakeData';
import { Analysis } from '@/types/analysis';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Define the type for the options we can pass to useQuery
type AnalysisQueryOptions = Omit<
  UseQueryOptions<Analysis, Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Fetches a single analysis by its ID.
 * @param analysisId The ID of the analysis.
 * @param options - Additional react-query options like `initialData`.
 */
export const useAnalysis = (analysisId?: string, options?: AnalysisQueryOptions) => {
    const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';
   
    return useQuery<Analysis, Error>({
      queryKey: ['analysis', analysisId],
      queryFn: async () => {
        
        if (isDevFakeMode) {
          if (!analysisId) throw new Error('Analysis ID is required');
          const analysis = FAKE_ANALYSIS_ARRAY.find(p => p._id === analysisId);
          if (!analysis) throw new Error('Analysis not found');
          return analysis;
        }
        
        if (!analysisId) throw new Error('Analysis ID is required');
        
        try {
          const response = await api.getAnalysisById(analysisId);
          return response; 

        } catch (error) {
          console.error('API call failed:', error);
          throw error;
        }
      },
      enabled: !!analysisId,
      staleTime: 5 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      ...options,
    });
};
