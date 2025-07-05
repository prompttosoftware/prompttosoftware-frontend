import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentModal } from './PaymentModal';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { httpClient } from '@/lib/httpClient';
import { logger } from '@/lib/logger';
import PaymentFormContent from './PaymentFormContent';

// Mock all external dependencies
jest.mock('@/store/paymentModalStore');
jest.mock('@/store/successMessageStore');
jest.mock('@/store/globalErrorStore');
jest.mock('@/lib/httpClient');
jest.mock('@/lib/logger');
jest.mock('./PaymentFormContent', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mocked PaymentFormContent</div>),
}));

const mockUsePaymentModalStore = usePaymentModalStore as jest.MockedFunction<typeof usePaymentModalStore>;
const mockUseSuccessMessageStore = useSuccessMessageStore as jest.MockedFunction<typeof useSuccessMessageStore>;
const mockUseGlobalErrorStore = useGlobalErrorStore as jest.MockedFunction<typeof useGlobalErrorStore>;
const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const MockPaymentFormContent = PaymentFormContent as jest.MockedFunction<typeof PaymentFormContent>;

describe('PaymentModal (Unit Test)', () => {
  // Shared mock state and functions for paymentModalStore
  let mockPaymentModalState: any;
  let mockGlobalErrorState: any;
  let mockSuccessMessageState: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  
    // Need to define mock state objects before setting up mock implementations
    mockPaymentModalState = {
      isOpen: false,
      clientSecret: null,
      setupIntentClientSecret: null, // Added for new store
      amount: 0, // Now managed by store
      description: '', // Now managed by store
      onClose: jest.fn(),
      onSuccess: jest.fn(),
      onGoToPaymentProvider: jest.fn(),
      step: 'add_amount', // Now managed by store
      paymentMethodId: null,
      showToast: false,
      toastMessage: '',
      toastType: 'info',
      closeModal: jest.fn(), // Renamed to storeCloseModal in component, but test expects this
      setClientSecret: jest.fn(),
      setSetupIntentClientSecret: jest.fn(),
      setAmount: jest.fn(), // Mock implementation to update state
      setStep: jest.fn(), // Mock implementation to update state
      setPaymentModalState: jest.fn(),
      clearState: jest.fn(),
      showTemporaryToast: jest.fn(),
    };

    mockGlobalErrorState = {
      error: null,
      setError: jest.fn(), // Will be re-implemented below to update state
      clearError: jest.fn(), // Will be re-implemented below to update state
    };
    mockSuccessMessageState = {
      setMessage: jest.fn(),
    };
  
    // Implementations for store actions that update the local mock state
    // This is crucial for tests that rely on state changes triggering re-renders
    mockPaymentModalState.setClientSecret.mockImplementation((secret: string | null) => {
      mockPaymentModalState.clientSecret = secret;
    });
    mockPaymentModalState.setSetupIntentClientSecret.mockImplementation((secret: string | null) => {
      mockPaymentModalState.setupIntentClientSecret = secret;
    });
    mockPaymentModalState.setAmount.mockImplementation((amt: number) => {
      mockPaymentModalState.amount = amt;
    });
    mockPaymentModalState.setStep.mockImplementation((s: any) => {
      mockPaymentModalState.step = s;
    });
    mockPaymentModalState.setPaymentModalState.mockImplementation((newState: any) => {
      // Deep merge or specific updates might be needed for complex objects
      mockPaymentModalState = { ...mockPaymentModalState, ...newState };
    });
    mockPaymentModalState.closeModal.mockImplementation(() => {
      mockPaymentModalState.isOpen = false;
      mockPaymentModalState.clearState(); // Simulate clearing state on close
    });
    mockPaymentModalState.clearState.mockImplementation(() => {
      // Reset all relevant state properties to their initial values
      mockPaymentModalState.isOpen = false;
      mockPaymentModalState.clientSecret = null;
      mockPaymentModalState.setupIntentClientSecret = null;
      mockPaymentModalState.amount = 0;
      mockPaymentModalState.description = '';
      mockPaymentModalState.step = 'add_amount';
      mockPaymentModalState.paymentMethodId = null;
    });

    mockGlobalErrorState.setError.mockImplementation((error: { message: string, type: 'error' | 'info' } | null) => {
      mockGlobalErrorState.error = error;
    });
    mockGlobalErrorState.clearError.mockImplementation(() => {
      mockGlobalErrorState.error = null;
    });
  
    // Default mock implementations for stores
    mockUsePaymentModalStore.mockReturnValue(mockPaymentModalState);
    mockUsePaymentModalStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockPaymentModalState);
      }
      return mockPaymentModalState;
    });
  
    mockUseGlobalErrorStore.mockReturnValue(mockGlobalErrorState);
    mockUseGlobalErrorStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockGlobalErrorState);
      }
      return mockGlobalErrorState;
    });
  
    mockUseSuccessMessageStore.mockReturnValue(mockSuccessMessageState);
  
    // Default mock for httpClient.post (assume success)
    mockHttpClient.post.mockResolvedValue({ clientSecret: 'mock_client_secret_123' });
  
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock_jwt_token');
  });

  // Test Case 1: Modal initial state and closing
  it('does not render when isOpen is false', () => {
    // mockPaymentModalState.isOpen is false by default
    render(<PaymentModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders and calls closeModal when cancel button is clicked', async () => {
    mockPaymentModalState.isOpen = true; // Set modal to open
    render(<PaymentModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Updated assertion to use getByRole for better accessibility testing practice
    expect(screen.getByRole('heading', { name: /add funds/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockPaymentModalState.closeModal).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockPaymentModalState.isOpen).toBeFalsy();
    });
  });

  // Test Case 2: Amount input and validation
  it('allows typing a valid amount and clears error message', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    const amountInput = screen.getByRole('textbox', { name: /amount/i });
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '10.50' } });
    });
    await waitFor(() => {
      expect(mockPaymentModalState.amount).toBe(10.50); // Check store state directly
      expect(mockGlobalErrorState.clearError).toHaveBeenCalled(); // Should clear error if input becomes valid
      expect(mockGlobalErrorState.setError).not.toHaveBeenCalled(); // No error for valid input
      expect(amountInput).toHaveValue('10.50'); // Input displays raw number, '$' is handled by span
    });
  });

  it('displays error for invalid amount (non-numeric)', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    fireEvent.change(screen.getByRole('textbox', { name: /amount/i }), { target: { value: 'abc' } });

    await waitFor(() => {
      expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
        message: 'Amount must be a number.',
        type: 'error',
      });
    });
  });

  it('displays error for zero or negative amount', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    const amountInput = screen.getByRole('textbox', { name: /amount/i });
    
    fireEvent.change(amountInput, { target: { value: '0' } });
    await waitFor(() => {
      expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
        message: 'Amount must be positive.',
        type: 'error',
      });
    });
    mockGlobalErrorState.setError.mockClear(); // Clear mock history

    fireEvent.change(amountInput, { target: { value: '-10' } });
    await waitFor(() => {
      expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
        message: 'Amount must be positive.',
        type: 'error',
      });
    });
  });

  it('displays error for amount less than minimum', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    fireEvent.change(screen.getByRole('textbox', { name: /amount/i }), { target: { value: '0.49' } });

    await waitFor(() => {
      expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
        message: 'Minimum amount is $0.50.',
        type: 'error',
      });
    });
  });

  it('displays error for amount greater than maximum', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    fireEvent.change(screen.getByRole('textbox', { name: /amount/i }), { target: { value: '10000.01' } });

    await waitFor(() => {
      expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
        message: 'Maximum amount is $10,000.00.',
        type: 'error',
      });
    });
  });

  // Test Case 3: Initiating payment process (Card flow)
  it('initiates card payment process and transitions to confirm_card step on success', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);
    
    // Use setAmount directly for simplicity in testing logic
    fireEvent.change(screen.getByRole('textbox', { name: /amount/i }), { target: { value: '50.00' } });
    await waitFor(() => {
      expect(mockPaymentModalState.amount).toBe(50.00);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/payments/create-intent',
      { amount: 5000, currency: 'usd', description: 'Funds added to account' },
      { headers: { Authorization: 'Bearer mock_jwt_token' } }
    );
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument(); // Check loading state

    await waitFor(async () => {
      expect(mockPaymentModalState.setClientSecret).toHaveBeenCalledWith('mock_client_secret_123');
      expect(mockPaymentModalState.step).toBe('confirm_card'); // Verify step change
      expect(screen.queryByRole('paragraph',{ name: /enter the amount/i })).not.toBeInTheDocument();
      expect(await screen.findByRole('paragraph', { name: /confirm your payment details/i })).toBeInTheDocument(); // Confirm step transition
      expect(MockPaymentFormContent).toHaveBeenCalledWith(
        expect.objectContaining({
          clientSecret: 'mock_client_secret_123',
          closeModal: expect.any(Function), // This is the store's closeModal
          setClientSecret: expect.any(Function),
          clearStoreState: expect.any(Function), // This is the store's clearState
          clearGlobalError: expect.any(Function),
          setGlobalError: expect.any(Function),
          setSuccessMessageStore: expect.any(Function),
        }),
        {},
      );
    });
  });

  it('displays error message if Payment Intent creation fails', async () => {
    mockPaymentModalState.isOpen = true;
    mockHttpClient.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Failed to create intent due to server error' } },
    });
    render(<PaymentModal />);

    fireEvent.change(screen.getByRole('textbox', { name: /amount/i }), { target: { value: '50.00' } });
    await waitFor(() => {
      expect(mockPaymentModalState.amount).toBe(50.00);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    
    await waitFor(async () => { // Use waitFor for async updates
      expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
        message: 'Failed to create intent due to server error',
        type: 'error',
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create Payment Intent.', expect.any(Object));
      // Modal should remain on input_amount step
      expect(mockPaymentModalState.step).toBe('add_amount'); // Verify step remains 'add_amount'
      expect(await screen.findByRole('paragraph', { name: /enter the amount/i })).toBeInTheDocument();
    });
  });

  // Test Case 4: PayPal specific flow
  it('allows selecting PayPal and provides appropriate message on next click', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    const amountInput = screen.getByRole('textbox', { name: /amount/i });
    fireEvent.change(amountInput, { target: { value: '10.00' } });
    await waitFor(() => {
        expect(mockPaymentModalState.amount).toBe(10.00);
    });

    const paymentMethodSelect = screen.getByRole('combobox', { name: /method/i });
    fireEvent.change(paymentMethodSelect, { target: { value: 'paypal' } });

    expect(paymentMethodSelect).toHaveValue('paypal');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
      message: 'PayPal integration is not yet implemented.',
      type: 'info',
    });
    expect(mockPaymentModalState.closeModal).toHaveBeenCalledTimes(1); // Should close the modal
    await waitFor(() => { // Wait for modal to close and state to clear
      expect(mockPaymentModalState.isOpen).toBeFalsy();
      expect(mockPaymentModalState.amount).toBe(0);
      expect(mockPaymentModalState.step).toBe('add_amount');
    });
  });

  // Test Case 5: State resets and initial steps
  it('resets state when modal closes', async () => { // Changed to async
    mockPaymentModalState.isOpen = true;
    mockPaymentModalState.clientSecret = 'something'; // simulate an existing client secret
    mockPaymentModalState.amount = 1000;
    mockPaymentModalState.step = 'confirm_card';
    mockGlobalErrorState.error = { message: 'error', type: 'error' };
  
    render(<PaymentModal />);
  
    // In confirm_card step, the cancel button is the 'Close' button in the top corner that replaces the cancel button
    // Use getByRole('button', { name: 'Close' }) to find the close button in the corner
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  
    expect(mockPaymentModalState.closeModal).toHaveBeenCalledTimes(1); // It should call closeModal
    await waitFor(() => { // Wait for modal state to truly reflect closed state
      expect(mockPaymentModalState.isOpen).toBeFalsy();
      expect(mockPaymentModalState.clientSecret).toBeNull();
      expect(mockPaymentModalState.amount).toBe(0);
      expect(mockPaymentModalState.step).toBe('add_amount');
      expect(mockGlobalErrorState.error).toBeNull();
    });
  });

  it('transitions to confirm_card if clientSecret exists on open', async () => {
    mockPaymentModalState.isOpen = true;
    mockPaymentModalState.clientSecret = 'existing_client_secret';
    mockPaymentModalState.amount = 10; // Amount in dollars for display
    mockPaymentModalState.step = 'confirm_card'; // Explicitly set step for initial open
    render(<PaymentModal />);
  
    expect(await screen.findByRole('paragraph', { name: /confirm your payment details/i })).toBeInTheDocument();
    // Ensure the mocked PaymentFormContent receives the correct clientSecret
    expect(MockPaymentFormContent).toHaveBeenCalledWith(
      expect.objectContaining({
        clientSecret: 'existing_client_secret',
        closeModal: expect.any(Function),
        setClientSecret: expect.any(Function),
        clearStoreState: expect.any(Function),
        clearGlobalError: expect.any(Function),
        setGlobalError: expect.any(Function),
        setSuccessMessageStore: expect.any(Function),
      }),
      {},
    );
    // Verify that the amount is displayed correctly
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(mockPaymentModalState.step).toBe('confirm_card'); // Ensure the step is correctly reflected
  });

  it('starts on input_amount step when opening with no clientSecret', async () => {
    mockPaymentModalState.isOpen = true;
    mockPaymentModalState.clientSecret = null; // Ensure no client secret
    mockPaymentModalState.step = 'add_amount'; // Explicitly set starting step
    render(<PaymentModal />);

    // Wait for useEffect to potentially trigger
    await waitFor(async () => {
      expect(mockPaymentModalState.step).toBe('add_amount'); // Verify step state
      expect(await screen.findByRole('paragraph', { name: /enter the amount/i })).toBeInTheDocument();
      expect(screen.queryByRole('paragraph', { name: /confirm your payment details/i })).not.toBeInTheDocument();
    });
  });

  it('shows current input amount when transitioning to confirm_card step', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    // Simulate user entering amount and it updating the store
    const amountInput = screen.getByRole('textbox', { name: /amount/i });
    fireEvent.change(amountInput, { target: { value: '75.50' } });
    await waitFor(() => {
        expect(mockPaymentModalState.amount).toBe(75.50);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(async () => {
      expect(mockPaymentModalState.step).toBe('confirm_card'); // Verify step change
      expect(await screen.findByRole('paragraph', { name: /confirm your payment details/i })).toBeInTheDocument();
      expect(screen.getByText('$75.50')).toBeInTheDocument();
    });
  });
});
