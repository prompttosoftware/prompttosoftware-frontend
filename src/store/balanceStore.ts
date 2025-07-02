import { create } from 'zustand';

// Defines the structure of the balance state
interface BalanceState {
  balance: number;
  setBalance: (newBalance: number) => void;
}

/**
 * Zustand store for managing the global account balance.
 * Provides the current balance and a method to update it.
 */
export const useBalanceStore = create<BalanceState>((set) => ({
  balance: 0, // Initial balance, can be updated later from API
  setBalance: (newBalance: number) => set({ balance: newBalance }),
}));

/**
 * Custom hook to easily access and subscribe to the account balance.
 * Components using this hook will re-render automatically when the balance changes.
 * @returns The current account balance.
 */
export const useBalance = (): number => {
  return useBalanceStore((state) => state.balance);
};
