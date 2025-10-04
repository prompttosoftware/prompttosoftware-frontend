import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { FAKE_ANALYSIS_ARRAY } from '@/lib/dev/fakeData';
import { api } from '@/lib/api';
import { Analysis } from '@/types/analysis';

type UseUserAnalysisOptions = Omit<
  UseQueryOptions<Analysis[], Error>,
  'queryKey' | 'queryFn'
>;

export const useUserAnalysis = (options?: UseUserAnalysisOptions) => {
  const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';

  if (isDevFakeMode) {
    return {
      data: FAKE_ANALYSIS_ARRAY as Analysis[],
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      status: 'success' as const,
    };
  }
  
  return useQuery<Analysis[], Error>({
    queryKey: ['userAnalysis'],
    queryFn: api.listUserAnalysis,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 1 * 60 * 1000,
    ...options,
  });
};
