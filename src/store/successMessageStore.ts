import { create } from 'zustand';

interface SuccessMessageState {
  message: string | null;
  setMessage: (message: string | null) => void;
  clearMessage: () => void;
}

export const useSuccessMessageStore = create<SuccessMessageState>((set) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
}));
