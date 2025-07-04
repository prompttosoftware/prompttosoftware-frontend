import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from "@/lib/logger";

/**
 * Defines the structure of the balance state, including methods for
 * setting, fetching, updating, and clearing the balance, along with
 * a timestamp for the last fetch.
 */
interface BalanceState {
  balance: number;
  lastFetched: number | null;
  setBalance: (newBalance: number) => void;
  fetchBalance: (userId: string) => Promise<void>;
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
      fetchBalance: async (userId: string) => {
        // This is a placeholder. In a real application, you would fetch
        // the user's balance from your backend API here.
        logger.info(`Fetching balance for user ${userId}...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        const fetchedBalance = Math.floor(Math.random() * 10000); // Random balance for demo
        set({ balance: fetchedBalance, lastFetched: Date.now() });
        logger.info(`Balance fetched and set to: ${fetchedBalance}`);
      },
      updateBalance: (amount: number) => {
        set((state) => {
          const newBalance = state.balance + amount;
          logger.info(`Updating balance from ${state.balance} to ${newBalance}`);
          return { balance: newBalance, lastFetched: Date.now() };
        });
      },
      clearBalance: () => set({ balance: 0, lastFetched: null }),
    }),
    {
      name: 'balance-storage', // The name for the item in storage (e.g., localStorage key)
      storage: createJSONStorage(() => localStorage), // Use localStorage as the storage medium
    }
  )
);

/**
 * Custom hook to easily access and subscribe to the account balance.
 * Components using this hook will re-render automatically when the balance changes.
 * @returns The current account balance.
 */
export const useBalance = (): number => {
  return useBalanceStore((state) => state.balance);
};
