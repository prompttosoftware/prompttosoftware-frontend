import { create } from 'zustand';

// Define GlobalError interface
interface GlobalError {
  message: string;
  description?: string;
  statusCode?: number;
}

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmPhrase: string; // The phrase the user must type
  onConfirm: () => void;
  onCancel?: () => void;
}

interface GlobalErrorState {
  error: GlobalError | null;
  setError: (error: GlobalError | null) => void;
  clearError: () => void;
  confirmationDialog: ConfirmationDialogState | null;
  showConfirmation: (
    title: string,
    message: string,
    confirmPhrase: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  hideConfirmation: () => void;
}

export const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  confirmationDialog: null,
  showConfirmation: (title, message, confirmPhrase, onConfirm, onCancel) =>
    set({
      confirmationDialog: {
        isOpen: true,
        title,
        message,
        confirmPhrase,
        onConfirm,
        onCancel,
      },
    }),
  hideConfirmation: () => set({ confirmationDialog: null }),
}));

// These exports allow direct access to the store's methods without needing to use the hook inside components
export const setGlobalError = useGlobalErrorStore.getState().setError;
export const showConfirmationDialog = useGlobalErrorStore.getState().showConfirmation;
export const hideConfirmationDialog = useGlobalErrorStore.getState().hideConfirmation;
