import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../lib/httpClient';
import { AuthMeResponse } from '../types/usage';

const fetchAccountUsageData = async (): Promise<AuthMeResponse> => {
  const { data } = await httpClient.get<AuthMeResponse>('/auth/me');
  return data;
};

export const useAccountUsageData = () => {
  return useQuery<AuthMeResponse, Error>({
    queryKey: ['accountUsage'],
    queryFn: fetchAccountUsageData,
    // Optional: Add refetchOnWindowFocus: false if you don't want to refetch every time window regains focus
    // refetchOnWindowFocus: false,
    // Optional: caching time, etc.
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });
};
