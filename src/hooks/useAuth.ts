import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useBalanceStore } from '@/store/balanceStore'; // Import the balance store

export const useAuth = () => {
    const queryClient = useQueryClient();
    const setBalance = useBalanceStore((state) => state.setBalance); // Get the setBalance action

    const { data, isLoading, isError } = useQuery(['auth', 'me'], () => api.get('/auth/me'), {
        retry: false,
        staleTime: Infinity,
        onError: (error) => {
            if (error?.response?.status === 401) {
                // Handle 401: clear local storage, redirect to login, etc.
                localStorage.removeItem('jwt');
                queryClient.cancelQueries(['auth', 'me']); // Cancel any ongoing queries
            }
        },
        onSuccess: (data) => { // Add onSuccess callback
            const user = data?.data;
            if (user && typeof user.balance === 'number') { // Check if user and balance exist and is a number
                setBalance(user.balance); // Update the global balance state
            }
        }
    });

    const user = data?.data; // Assuming the user data is in data.data
    const isAuthenticated = !!user;

    return { user, isAuthenticated, isLoading, isError };
};
