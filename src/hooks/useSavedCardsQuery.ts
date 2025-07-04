import { useQuery } from '@tanstack/react-query';
import { SavedCard, GetSavedCardsResponse } from '../types/payments';
import { httpClient } from '../lib/httpClient';
import { useAuth } from './useAuth';
import { useGlobalError } from './useGlobalError';

export const useSavedCardsQuery = () => {
  const { token } = useAuth();
  const { showError } = useGlobalError();

  return useQuery<SavedCard[], Error>({
    queryKey: ['savedCards', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication token not available.');
      }
      try {
        const response = await httpClient.get<GetSavedCardsResponse>('/payments/cards', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.cards;
      } catch (error) {
        // Pass the error to the global error handling system
        showError(error);
        throw error; // Re-throw to let react-query handle the error state
      }
    },
    enabled: !!token, // Only run the query if a token is available
    onError: (error) => {
      // react-query also provides an onError callback, but our showError already handles display.
      // This is here mainly for debugging or additional side effects if needed.
      console.error("Failed to fetch saved cards:", error);
    },
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
  });
};
