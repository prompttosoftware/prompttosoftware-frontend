// src/hooks/useUserSavedCards.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { SavedCard } from '@/types/payments';
import { api } from '@/lib/api';
import { FAKE_CARDS } from '@/lib/dev/fakeData';

// Define the query options type, omitting keys managed by the hook
type UseUserSavedCardsOptions = Omit<
  UseQueryOptions<SavedCard[], Error>,
  'queryKey' | 'queryFn'
>;

/**
 * A custom hook to fetch the authenticated user's saved payment cards.
 */
export const useUserSavedCards = (options?: UseUserSavedCardsOptions) => {
  
    const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';
    
    if (isDevFakeMode) {
        return {
            data: FAKE_CARDS as SavedCard[],
            isLoading: false,
            isError: false,
            error: null,
            isSuccess: true,
            status: 'success' as const,
        };
    }

    return useQuery<SavedCard[], Error>({
    // A unique key for this query, used for caching and invalidation
    queryKey: ['savedCards'],
    // The function that will be called to fetch the data
    queryFn: api.listSavedCards,
    // Configuration for data freshness and refetching
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch just because the window gained focus
    ...options, // Allow overriding default options from the component
  });
};
