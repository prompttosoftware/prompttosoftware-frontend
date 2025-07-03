import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react'; // Import useEffect
import axios from 'axios'; // Import axios
import { fetchUserProfile } from '@/lib/api'; // Import fetchUserProfile
import { UserProfile } from '@/types/auth'; // Import UserProfile for explicit typing
import { useBalanceStore } from '@/store/balanceStore'; // Import the balance store

// Temporary basic logger. In a real app, use a dedicated logging solution.
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
};

export const useUserProfileQuery = () => {
  const queryClient = useQueryClient();
  const setBalance = useBalanceStore((state) => state.setBalance); // Get the setBalance action

  const { data, isLoading, isError, isSuccess, error } = useQuery<UserProfile, Error>({
    queryKey: ['auth', 'me'],
    queryFn: fetchUserProfile, // Use the new fetchUserProfile function
    retry: false,
    staleTime: Infinity,
  });

  // Handle side effects with useEffect, particularly for 401s after global interceptor acts
  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // The global interceptor in api.ts handles clearing the token and redirecting.
        // Here, we just need to ensure the query cache is invalidated to reflect the unauthenticated state.
        logger.warn(
          '401 Unauthorized response detected in useUserProfileQuery. Invalidating user profile query.',
        );
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    }
  }, [isError, error, queryClient]);

  useEffect(() => {
    if (isSuccess && data) {
      if (data && typeof data.balance === 'number') {
        setBalance(data.balance);
      }
    }
  }, [isSuccess, data, setBalance]);

  // The user data and loading/error states are returned.
  // Authentication status will be derived by the consumer (e.g., AuthProvider)
  return { user: data, isLoading, isError, error };
};
