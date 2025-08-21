import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Transaction } from '@/types/transactions';
import { api } from '@/lib/api';

type UseUserTransactionsOptions = Omit<
  UseQueryOptions<Transaction[], Error>,
  'queryKey' | 'queryFn'
>;

export const useUserTransactions = (options?: UseUserTransactionsOptions) => {
  
  return useQuery<Transaction[], Error>({
    queryKey: ['userTransactions'],
    queryFn: api.listUserTransactions,
    staleTime: 1 * 60 * 1000, // Data is considered fresh for 1 minute
    refetchInterval: 2 * 60 * 1000, // Automatically refetch every 2 minutes
    refetchOnWindowFocus: true, // Refetch when the user returns to the tab
    ...options, // Spread options to allow passing initialData, etc.
  });
};
