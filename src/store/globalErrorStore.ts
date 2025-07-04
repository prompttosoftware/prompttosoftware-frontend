import { create } from 'zustand';

interface GlobalErrorState {
  error: GlobalError | null;
  setError: (error: GlobalError | null) => void;
  clearError: () => void;
}

export const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export const setGlobalError = useGlobalErrorStore.getState().setError;
