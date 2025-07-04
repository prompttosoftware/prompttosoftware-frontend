import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from '@/lib/logger';
import { httpClient } from '@/lib/httpClient'; // Use named import for httpClient

/**
 * Defines the structure of the balance state, including methods for
 * setting, fetching, updating, and clearing the balance, along with
 * a timestamp for the last fetch.
 */
interface BalanceState {
  balance: number;
  lastFetched: number | null;
  setBalance: (newBalance: number) => void;
  fetchBalance: () => Promise<void>;
  updateBalance: (amount: number) => void;
  clearBalance: () => void;
}

/**
 * Zustand store for managing the global account balance.
 * Uses `persist` middleware to store the state in localStorage.
 */
export const useBalanceStore = create<BalanceState>()(
  persist(
    (set) => ({
      balance: 0,
      lastFetched: null,
      setBalance: (newBalance: number) => set({ balance: newBalance }),
      fetchBalance: async () => {
        try {
          // Fetch the user's profile from the backend
          const response = await httpClient.get('/auth/me');
          const user = response.data.user;

          if (user && typeof user.balance === 'number') {
            set({ balance: user.balance, lastFetched: Date.now() });
            logger.info(`Balance fetched and set to: ${user.balance}`);
          } else {
            logger.error(
              'Failed to fetch balance: Balance not found in user profile or invalid type.',
            );
            set({ balance: 0, lastFetched: null }); // Reset or show default on error
          }
        } catch (error: any) {
          logger.error(`Error fetching balance: ${error.message || error}`);
          set({ balance: 0, lastFetched: null }); // Reset or show default on error
        }
      },
      updateBalance: (amount: number) => {
        set((state) => {
          const newBalance = state.balance + amount;
          logger.info(`Updating balance from ${state.balance} to ${newBalance}`);
          return { balance: newBalance };
        });
      },
      clearBalance: () => set({ balance: 0, lastFetched: null }),
    }),
    {
      name: 'balance-storage', // The name for the item in storage (e.g., localStorage key)
      storage: createJSONStorage(() => localStorage), // Use localStorage as the storage medium
    },
  ),
);

/**
 * Custom hook to easily access and subscribe to the account balance.
 * Components using this hook will re-render automatically when the balance changes.
 * @returns The current account balance.
 */
export const useBalance = (): number => {
  return useBalanceStore((state) => state.balance);
};
