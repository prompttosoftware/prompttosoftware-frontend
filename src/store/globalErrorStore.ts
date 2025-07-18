import { create } from 'zustand';

// Define GlobalError interface
interface GlobalError {
  message: string;
  description?: string;
  statusCode?: number;
  type?: 'error' | 'warning' | 'info'; // Add type property
}

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmPhrase?: string; // The phrase the user must type (optional now)
  onConfirm: () => void;
  onCancel?: () => void;
  cancelText?: string; // Custom text for the cancel button
  confirmText?: string; // Custom text for the confirm button
  isLoading?: boolean; // New prop for loading state in confirmation dialog
}

interface GlobalErrorState {
  error: GlobalError | null;
  setError: (error: GlobalError | null) => void;
  clearError: () => void;
  confirmationDialog: ConfirmationDialogState | null;
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmPhrase?: string;
      onCancel?: () => void;
      cancelText?: string;
      confirmText?: string;
      isLoading?: boolean; // Add isLoading to options
    },
  ) => void;
  hideConfirmation: () => void;
  setConfirmationLoading: (isLoading: boolean) => void; // New action to set loading state
}

export const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  confirmationDialog: null,
  showConfirmation: (title, message, onConfirm, options) =>
    set({
      confirmationDialog: {
        isOpen: true,
        title,
        message,
        onConfirm,
        confirmPhrase: options?.confirmPhrase,
        onCancel: options?.onCancel,
        cancelText: options?.cancelText,
        confirmText: options?.confirmText,
        isLoading: options?.isLoading || false, // Initialize isLoading
      },
    }),
  hideConfirmation: () => set({ confirmationDialog: null }),
  setConfirmationLoading: (isLoading) =>
    set((state) => {
      if (state.confirmationDialog) {
        return {
          confirmationDialog: {
            ...state.confirmationDialog,
            isLoading: isLoading,
          },
        };
      }
      return state;
    }),
}));

// These exports allow direct access to the store's methods without needing to use the hook inside components
export const setGlobalError = useGlobalErrorStore.getState().setError;
export const showConfirmationDialog = useGlobalErrorStore.getState().showConfirmation;
export const hideConfirmationDialog = useGlobalErrorStore.getState().hideConfirmation;
export const setConfirmationDialogLoading = useGlobalErrorStore.getState().setConfirmationLoading; // Export new action
