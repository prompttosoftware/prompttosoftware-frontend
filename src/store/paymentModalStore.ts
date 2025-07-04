import { create } from 'zustand';

interface PaymentModalState {
  isOpen: boolean;
  clientSecret: string | null; // For Stripe Payment Intent client secret
  openModal: () => void; // No longer takes amount or description
  closeModal: () => void;
  setClientSecret: (secret: string | null) => void;
  clearState: () => void; // To clear states after a successful payment or modal close
}

export const usePaymentModalStore = create<PaymentModalState>((set) => ({
  isOpen: false,
  clientSecret: null,
  openModal: () => set({ isOpen: true }), // No longer sets amount, description
  closeModal: () => set({ isOpen: false, clientSecret: null }), // Clear on close
  setClientSecret: (secret) => set({ clientSecret: secret }),
  clearState: () => set({ clientSecret: null }), // Only clear clientSecret
}));
