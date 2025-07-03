import { create } from 'zustand';

interface PaymentModalState {
  isOpen: boolean;
  amount: string; // Amount as a string, e.g., from input
  description: string;
  clientSecret: string | null; // For Stripe Payment Intent client secret
  openModal: (amount?: string, description?: string) => void;
  closeModal: () => void;
  setClientSecret: (secret: string | null) => void;
  clearState: () => void; // To clear states after a successful payment or modal close
}

export const usePaymentModalStore = create<PaymentModalState>((set) => ({
  isOpen: false,
  amount: '',
  description: '',
  clientSecret: null,
  openModal: (amount, description = '') => set({ isOpen: true, amount, description }),
  closeModal: () => set({ isOpen: false, amount: '', description: '', clientSecret: null }), // Clear on close
  setClientSecret: (secret) => set({ clientSecret: secret }),
  clearState: () => set({ amount: '', description: '', clientSecret: null }),
}));
