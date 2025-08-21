import { create } from 'zustand';

// Define the steps in the payment process
export type PaymentStep =
  | 'add_amount'
  | 'add_payment_details'
  | 'confirm_card'
  | 'confirm_ideal';

type OnSuccessCallback = (data: { paymentIntentId: string; amount: number }) => void;

// Define the state structure for the payment modal
interface PaymentModalState {
  isOpen: boolean;
  isEditMode: boolean; // For editing existing payment methods
  clientSecret: string | null; // Stripe client secret for payment intent confirmation
  setupIntentClientSecret: string | null; // Stripe setup intent client secret
  amount: number; // Amount to pay (in cents, for Stripe compatibility)
  description: string; // Description for the payment intent
  onClose: () => void; // Callback when the modal is closed
  onSuccess: OnSuccessCallback; // Callback on successful payment/setup
  onGoToPaymentProvider: (clientSecret: string) => void; // Callback for redirect-based payments (e.g., iDEAL)
  step: PaymentStep; // Current step in the modal flow
  paymentMethodId: string | null; // For edit mode or saving payment methods
  showToast: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'info';
}

// Define the actions/methods for the payment modal store
interface PaymentModalActions {
  openPaymentModal: (options: Partial<Omit<PaymentModalState, 'isOpen' | 'step'>>) => void;
  closePaymentModal: () => void;
  setClientSecret: (secret: string | null) => void;
  setSetupIntentClientSecret: (secret: string | null) => void; // Added for setup intents
  setAmount: (amount: number) => void;
  setDescription: (description: string) => void;
  setPaymentMethodId: (id: string | null) => void;
  setStep: (step: PaymentStep) => void;
  setPaymentModalState: (newState: Partial<PaymentModalState>) => void; // Generic setter
  clearState: () => void; // Resets the entire store
  showTemporaryToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  onSuccess?: OnSuccessCallback;
}

// Combine state and actions
export const usePaymentModalStore = create<PaymentModalState & PaymentModalActions>((set, get) => ({
  // Initial state
  isOpen: false,
  isEditMode: false,
  clientSecret: null,
  setupIntentClientSecret: null,
  amount: 0,
  description: '',
  onClose: () => {},
  onSuccess: () => {},
  onGoToPaymentProvider: () => {},
  step: 'add_amount',
  paymentMethodId: null,
  showToast: false,
  toastMessage: '',
  toastType: 'info',

  // Actions
  openPaymentModal: (options) => {
    set((state) => ({
      isOpen: true,
      // Determine initial step based on provided client secrets or default to add_amount
      step: options.clientSecret ? 'confirm_card' : (options.setupIntentClientSecret ? 'add_payment_details' : 'add_amount'),
      ...options,
      // Preserve default callbacks if not overridden
      onClose: options.onClose || state.onClose,
      onSuccess: options.onSuccess || state.onSuccess,
      onGoToPaymentProvider: options.onGoToPaymentProvider || state.onGoToPaymentProvider,
    }));
  },
  closePaymentModal: () => set({
    isOpen: false,
    clientSecret: null,
    setupIntentClientSecret: null,
    amount: 0,
    description: '',
    step: 'add_amount',
    isEditMode: false,
    paymentMethodId: null,
    showToast: false,
    toastMessage: '',
    toastType: 'info'
  }),
  setClientSecret: (secret) => set({ clientSecret: secret }),
  setSetupIntentClientSecret: (secret) => set({ setupIntentClientSecret: secret }),
  setAmount: (amount) => set({ amount: amount }),
  setDescription: (description) => set({ description: description }),
  setPaymentMethodId: (id) => set({ paymentMethodId: id }),
  setStep: (step) => set({ step: step }),
  setPaymentModalState: (newState) => {
    set((prev) => ({ ...prev, ...newState }));
  },
  clearState: () => set({
    isOpen: false,
    isEditMode: false,
    clientSecret: null,
    setupIntentClientSecret: null,
    amount: 0,
    description: '',
    onClose: () => {},
    onSuccess: () => {},
    onGoToPaymentProvider: () => {},
    step: 'add_amount',
    paymentMethodId: null,
  }),
  showTemporaryToast: (message, type, duration = 3000) => {
    set({ showToast: true, toastMessage: message, toastType: type });
    setTimeout(() => {
      set({ showToast: false, toastMessage: '', toastType: 'info' });
    }, duration);
  },
}));
