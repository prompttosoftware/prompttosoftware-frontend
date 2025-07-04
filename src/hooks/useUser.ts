import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react'; // Import useEffect
import axios from 'axios'; // Import axios
import api from '@/lib/api';
import { useBalanceStore } from '@/store/balanceStore'; // Import the balance store

// Temporary basic logger. In a real app, use a dedicated logging solution.
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const setBalance = useBalanceStore((state) => state.setBalance); // Get the setBalance action

  const { data, isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/auth/me'),
    retry: false,
    staleTime: Infinity,
  }); // Removed onError and onSuccess from options

  // Handle side effects with useEffect
  useEffect(() => {
    if (isError) {
      // Check if it's an Axios error and has a 401 status
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logger.warn('401 Unauthorized response detected in useAuth. Clearing JWT.');
        try {
          localStorage.removeItem('jwt'); // Clear the invalid or expired JWT
          logger.warn('JWT token cleared from localStorage.');
        } catch (clearErr) {
          logger.error('Failed to clear JWT token from localStorage:', clearErr);
        }
        // Cancel ongoing queries related to auth
        queryClient.cancelQueries({ queryKey: ['auth', 'me'] });
        // Optional: router.push('/login?sessionExpired=true'); if this hook is always used in a component that has access to a router.
        // For now, let's assume the global interceptor or a higher-level component handles redirect.
      }
    }
  }, [isError, error, queryClient]);

  useEffect(() => {
    if (isSuccess && data?.data) {
      const user = data.data;
      if (user && typeof user.balance === 'number') {
        setBalance(user.balance);
      }
    }
  }, [isSuccess, data, setBalance]);

  const user = data?.data; // Assuming the user data is in data.data
  const isAuthenticated = !!user;

  return { user, isAuthenticated, isLoading, isError };
};
