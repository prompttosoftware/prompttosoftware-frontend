import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    // Default mock implementations for stores
    mockPaymentModalState = {
      isOpen: false,
      clientSecret: null,
      closeModal: jest.fn(),
      setClientSecret: jest.fn(),
      clearState: jest.fn(),
    };
    mockUsePaymentModalStore.mockReturnValue(mockPaymentModalState);

    mockGlobalErrorState = {
      error: null,
      setError: jest.fn(),
      clearError: jest.fn(),
    };
    mockUseGlobalErrorStore.mockReturnValue(mockGlobalErrorState);
    // Mock the selector function for useGlobalErrorStore
    mockUseGlobalErrorStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockGlobalErrorState);
      }
      return mockGlobalErrorState;
    });


    mockSuccessMessageState = {
      setMessage: jest.fn(),
    };
    mockUseSuccessMessageStore.mockReturnValue(mockSuccessMessageState);

    // Default mock for httpClient.post (assume success)
    mockHttpClient.post.mockResolvedValue({ clientSecret: 'mock_client_secret_123' });

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock_jwt_token');
  });

  // Test Case 1: Modal initial state and closing
  it('does not render when isOpen is false', () => {
    render(<PaymentModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders and calls closeModal when cancel button is clicked', async () => {
    mockPaymentModalState.isOpen = true; // Set modal to open
    render(<PaymentModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Funds')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockPaymentModalState.closeModal).toHaveBeenCalledTimes(1);
  });

  // Test Case 2: Amount input and validation
  it('allows typing a valid amount and clears error message', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    const amountInput = screen.getByLabelText('Amount');
    fireEvent.change(amountInput, { target: { value: '10.50' } });

    await waitFor(() => {
      expect(amountInput).toHaveValue('10.50');
      expect(mockGlobalErrorState.clearError).toHaveBeenCalled(); // Should clear error if input becomes valid
      expect(mockGlobalErrorState.setError).not.toHaveBeenCalled(); // No error for valid input
    });
  });

  it('displays error for invalid amount (non-numeric)', async () => {
    mockPaymentModalState.isOpen = true;
    render(<PaymentModal />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: 'abc' } });

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

    const amountInput = screen.getByLabelText('Amount');

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

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '0.49' } });

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

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '10000.01' } });

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

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50.00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/payments/create-intent',
      { amount: 5000, currency: 'usd', description: 'Funds added to account' },
      { headers: { Authorization: 'Bearer mock_jwt_token' } }
    );
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeInTheDocument(); // Check loading state

    await waitFor(() => {
      expect(mockPaymentModalState.setClientSecret).toHaveBeenCalledWith('mock_client_secret_123');
      expect(screen.queryByText('Enter the amount you wish to add to your account.')).not.toBeInTheDocument();
      expect(screen.getByText('Confirm your payment details.')).toBeInTheDocument(); // Confirm step transition
      expect(MockPaymentFormContent).toHaveBeenCalledWith(
        expect.objectContaining({
          clientSecret: 'mock_client_secret_123',
          closeModal: expect.any(Function),
        }),
        {},
      );
    });
  });

  it('displays error message if Payment Intent creation fails', async () => {
    mockPaymentModalState.isOpen = true;
    mockHttpClient.post.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Failed to create intent due to server error' } },
    });
    render(<PaymentModal />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50.00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(mockGlobalErrorState.setError).toHaveBeenCalledWith({
        message: 'Failed to create intent due to server error',
        type: 'error',
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create Payment Intent.', expect.any(Object));
      // Modal should remain on input_amount step
      expect(screen.getByText('Enter the amount you wish to add to your account.')).toBeInTheDocument();
    });
  });

  it('resets state when modal closes', () => {
    mockPaymentModalState.isOpen = true;
    mockPaymentModalState.clientSecret = 'something'; // simulate an existing client secret
    mockGlobalErrorState.error = { message: 'error', type: 'error' };

    render(<PaymentModal />);

    // Simulate a close event
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockPaymentModalState.clearState).toHaveBeenCalledTimes(1);
    expect(mockGlobalErrorState.clearError).toHaveBeenCalledTimes(1);
    expect(mockSuccessMessageState.setMessage).toHaveBeenCalledWith(null);
  });

  it('transitions to confirm_card if clientSecret exists on open', () => {
    mockPaymentModalState.isOpen = true;
    mockPaymentModalState.clientSecret = 'existing_client_secret';
    render(<PaymentModal />);

    expect(screen.getByText('Confirm your payment details.')).toBeInTheDocument();
    expect(MockPaymentFormContent).toHaveBeenCalledWith(
      expect.objectContaining({
        clientSecret: 'existing_client_secret',
      }),
      {},
    );
  });
});
