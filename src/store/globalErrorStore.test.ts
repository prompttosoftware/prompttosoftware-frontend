import { act } from '@testing-library/react';
import { useGlobalErrorStore } from './globalErrorStore';

describe('useGlobalErrorStore', () => {
  // Reset store to initial state before each test
  beforeEach(() => {
    useGlobalErrorStore.setState({ error: null, confirmationDialog: null });
  });

  it('should initialize with no error and no confirmation dialog', () => {
    const state = useGlobalErrorStore.getState();
    expect(state.error).toBeNull();
    expect(state.confirmationDialog).toBeNull();
  });

  describe('setError', () => {
    it('should set a global error', () => {
      const { setError } = useGlobalErrorStore.getState();
      const testError = { message: 'Test Error' };

      act(() => {
        setError(testError);
      });

      expect(useGlobalErrorStore.getState().error).toEqual(testError);
    });

    it('should set a global error with all properties', () => {
      const { setError } = useGlobalErrorStore.getState();
      const testError = {
        message: 'Detailed Error',
        description: 'Something went wrong.',
        statusCode: 500,
        type: 'error',
      };

      act(() => {
        setError(testError);
      });

      expect(useGlobalErrorStore.getState().error).toEqual(testError);
    });
  });

  describe('clearError', () => {
    it('should clear the global error', () => {
      const { setError, clearError } = useGlobalErrorStore.getState();
      act(() => {
        setError({ message: 'Error to be cleared' });
      });

      expect(useGlobalErrorStore.getState().error).not.toBeNull();

      act(() => {
        clearError();
      });

      expect(useGlobalErrorStore.getState().error).toBeNull();
    });
  });

  describe('confirmation dialog management', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
      mockOnConfirm.mockClear();
      mockOnCancel.mockClear();
    });

    it('should show a basic confirmation dialog', () => {
      const { showConfirmation } = useGlobalErrorStore.getState();
      const title = 'Confirm Action';
      const message = 'Are you sure?';

      act(() => {
        showConfirmation(title, message, mockOnConfirm);
      });

      const dialog = useGlobalErrorStore.getState().confirmationDialog;
      expect(dialog).not.toBeNull();
      expect(dialog?.isOpen).toBe(true);
      expect(dialog?.title).toBe(title);
      expect(dialog?.message).toBe(message);
      expect(dialog?.onConfirm).toBe(mockOnConfirm);
      expect(dialog?.confirmPhrase).toBeUndefined();
      expect(dialog?.onCancel).toBeUndefined();
      expect(dialog?.cancelText).toBeUndefined();
      expect(dialog?.confirmText).toBeUndefined();
      expect(dialog?.isLoading).toBe(false);
    });

    it('should show a confirmation dialog with all options', () => {
      const { showConfirmation } = useGlobalErrorStore.getState();
      const title = 'Confirm Delete';
      const message = 'This will delete the item.';
      const confirmPhrase = 'delete it';
      const cancelText = 'No, Keep';
      const confirmText = 'Yes, Delete';

      act(() => {
        showConfirmation(title, message, mockOnConfirm, {
          confirmPhrase,
          onCancel: mockOnCancel,
          cancelText,
          confirmText,
          isLoading: true,
        });
      });

      const dialog = useGlobalErrorStore.getState().confirmationDialog;
      expect(dialog).not.toBeNull();
      expect(dialog?.isOpen).toBe(true);
      expect(dialog?.title).toBe(title);
      expect(dialog?.message).toBe(message);
      expect(dialog?.onConfirm).toBe(mockOnConfirm);
      expect(dialog?.confirmPhrase).toBe(confirmPhrase);
      expect(dialog?.onCancel).toBe(mockOnCancel);
      expect(dialog?.cancelText).toBe(cancelText);
      expect(dialog?.confirmText).toBe(confirmText);
      expect(dialog?.isLoading).toBe(true);
    });

    it('should hide the confirmation dialog', () => {
      const { showConfirmation, hideConfirmation } = useGlobalErrorStore.getState();

      act(() => {
        showConfirmation('Title', 'Message', mockOnConfirm);
      });
      expect(useGlobalErrorStore.getState().confirmationDialog).not.toBeNull();

      act(() => {
        hideConfirmation();
      });
      expect(useGlobalErrorStore.getState().confirmationDialog).toBeNull();
    });

    it('should set confirmation dialog loading state', () => {
      const { showConfirmation, setConfirmationLoading } = useGlobalErrorStore.getState();

      act(() => {
        showConfirmation('Title', 'Message', mockOnConfirm);
      });
      expect(useGlobalErrorStore.getState().confirmationDialog?.isLoading).toBe(false);

      act(() => {
        setConfirmationLoading(true);
      });
      expect(useGlobalErrorStore.getState().confirmationDialog?.isLoading).toBe(true);

      act(() => {
        setConfirmationLoading(false);
      });
      expect(useGlobalErrorStore.getState().confirmationDialog?.isLoading).toBe(false);
    });

    it('should not change loading state if no confirmation dialog is open', () => {
      const { setConfirmationLoading } = useGlobalErrorStore.getState();
      expect(useGlobalErrorStore.getState().confirmationDialog).toBeNull();

      act(() => {
        setConfirmationLoading(true);
      });
      expect(useGlobalErrorStore.getState().confirmationDialog).toBeNull(); // Should still be null
    });
  });
});
