import { create } from 'zustand';

interface PaymentModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const usePaymentModalStore = create<PaymentModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
