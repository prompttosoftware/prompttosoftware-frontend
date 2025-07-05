import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentModal } from '@/app/main/components/PaymentModal';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { AuthProvider } from '@/lib/AuthContext';
import { BalanceStoreProvider } from '@/store/balanceStore';
import { act } from 'react-dom/test-utils';
import { useGlobalError } from '@/hooks/useGlobalError';
import { useGlobalErrorStore } from '@/store/globalErrorStore';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    asPath: '/',
  }),
}));

// Mock Stripe.js
const mockElements = {
  createPaymentMethod: jest.fn(() =>
    Promise.resolve({
      paymentMethod: { id: 'pm_mock_card_success' },
    })
  ),
  confirmCardPayment: jest.fn(() =>
    Promise.resolve({
      paymentIntent: { status: 'succeeded', id: 'pi_mock_success' },
    })
  ),
};

const mockStripe = {
  elements: jest.fn(() => mockElements),
  confirmCardPayment: mockElements.confirmCardPayment, // Expose for direct mocking if needed
};

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
}));

// Mock Stripe React Elements as we don't need real Stripe components for integration tests
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardElement: () => <div data-testid="mock-card-element" />, // Add this line
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));

// We need to keep handlers in a separate file for MSW to reset them
const server = setupServer();

beforeAll(() => {
  server.listen();
  // Set up a default successful auth handler
  server.use(
    http.get('/auth/me', () => {
      return HttpResponse.json({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/100000?v=4',
        githubId: 'github-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        credits: 1000, // Initial credits for the user
      }, { status: 200 });
    })
  );
});

afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
  usePaymentModalStore.setState({ isOpen: false, initialAmount: undefined });
  // Reset global error state
  act(() => {
    useGlobalErrorStore.getState().clearError();
  });
});

afterAll(async () => {
  server.close();
});

// Helper component to render the modal and manage its state
const TestPaymentModalWrapper = ({ initialAmount }: { initialAmount?: number }) => {
  const { openModal } = usePaymentModalStore();

  // Workaround to ensure usePaymentModal is initialized
  (global as any).IS_REACT_ACT_ENVIRONMENT = true;

  if (initialAmount) {
    act(() => {
      openModal(initialAmount);
    });
  }

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Elements stripe={null}> {/* stripe is mocked */}
          <PaymentModal />
        </Elements>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Payment Flow Integration Tests', () => {
  describe('PaymentsModal UI states and balance updates', () => {
    beforeEach(() => {
      server.use(
        http.post('/payments/create-intent', async ({ request }) => {
          const { amount } = await request.json();
          return HttpResponse.json({
            clientSecret: `cs_mock_success_${amount}`,
            paymentIntentId: 'pi_mock_success_id',
            amount,
            currency: 'usd',
            status: 'requires_confirmation',
          }, { status: 200 });
        })
      );
    });

    test('should display loading states correctly during payment intent creation and confirmation', async () => {
      render(<TestPaymentModalWrapper initialAmount={1000} />);

      const addFundsButton = screen.getByRole('button', { name: /add funds/i });
      expect(addFundsButton).toBeInTheDocument();

      fireEvent.click(addFundsButton);

      // Expect loading spinner/disabled state for payment processing
      expect(addFundsButton).toHaveAttribute('disabled');
      expect(screen.getByText(/processing payment/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(addFundsButton).not.toHaveAttribute('disabled');
        expect(screen.queryByText(/processing payment/i)).not.toBeInTheDocument();
        expect(screen.getByText(/payment successful!/i)).toBeInTheDocument();
      });
    });

    test('should update balance and show success message on successful payment', async () => {
      render(<TestPaymentModalWrapper initialAmount={5000} />);

      // User initial balance is 1000 from /auth/me mock
      expect(screen.getByText(/current balance: \$10.00/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/payment successful!/i)).toBeInTheDocument();
      });

      // Balance should update to 1000 (initial) + 5000 (added) = 6000 cents = $60.00
      expect(screen.getByText(/current balance: \$60.00/i)).toBeInTheDocument();
    });

    test('should apply 20% bonus for first time payment over $100', async () => {
      server.use(
        http.get('/auth/me', () => {
          return HttpResponse.json({
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            avatarUrl: 'https://avatars.githubusercontent.com/u/100000?v=4',
            githubId: 'github-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            credits: 0, // Initial credits for test user, ensuring it's first payment
            paid_credits_total: 0,
          }, { status: 200 });
        })
      );

      render(<TestPaymentModalWrapper initialAmount={10000} />); // $100

      // Initial balance should be 0 from the mock
      expect(screen.getByText(/current balance: \$0.00/i)).toBeInTheDocument();
      expect(screen.getByText(/add \$100\.00/i)).toBeInTheDocument(); // Displayed amount

      // Expect to see the bonus message
      expect(screen.getByText(/get a 20% bonus/i)).toBeInTheDocument();
      expect(screen.getByText(/\+\$20\.00 bonus/i)).toBeInTheDocument(); // 20% of $100 is $20


      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/payment successful!/i)).toBeInTheDocument();
      });

      // Balance should update to 10000 (added) + 2000 (bonus) = 12000 cents = $120.00
      expect(screen.getByText(/current balance: \$120\.00/i)).toBeInTheDocument();
    });

    test('should not apply bonus for subsequent payments or payments under $100', async () => {
      server.use(
        http.get('/auth/me', () => {
          return HttpResponse.json({
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            avatarUrl: 'https://avatars.githubusercontent.com/u/100000?v=4',
            githubId: 'github-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            credits: 1000, // User already has credits, not first payment
            paid_credits_total: 5000, // User has made payments
          }, { status: 200 });
        })
      );

      // Test with amount under $100 (5000 cents = $50)
      const { rerender } = render(<TestPaymentModalWrapper initialAmount={5000} />);

      // Expect initial balance to be $10.00
      expect(screen.getByText(/current balance: \$10.00/i)).toBeInTheDocument();
      expect(screen.getByText(/add \$50\.00/i)).toBeInTheDocument();

      // Bonus message should not be visible
      expect(screen.queryByText(/get a 20% bonus/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\+\$10\.00 bonus/i)).not.toBeInTheDocument(); // For 5000 cents amount, bonus would be 1000 cents.

      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/payment successful!/i)).toBeInTheDocument();
      });

      // Balance should update to 1000 (initial) + 5000 (added) = 6000 cents = $60.00
      expect(screen.getByText(/current balance: \$60.00/i)).toBeInTheDocument();

      // Re-render for amount over $100 but not first payment
      act(() => {
        usePaymentModalStore.setState({ isOpen: false, initialAmount: undefined }); // Close previous modal
      });
      rerender(<TestPaymentModalWrapper initialAmount={15000} />); // $150

      // Expect to see no bonus message
      expect(screen.queryByText(/get a 20% bonus/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\+\$30\.00 bonus/i)).not.toBeInTheDocument(); // For 15000 cents amount, bonus would be 3000 cents.

      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/payment successful!/i)).toBeInTheDocument();
      });

      // Balance should update to 6000 (previous updated) + 15000 (added) = 21000 cents = $210.00
      expect(screen.getByText(/current balance: \$210\.00/i)).toBeInTheDocument();
    });
  });

  describe('Stripe.js SDK Mocking and Error Handling', () => {
    test('should display general error message if createPaymentMethod fails', async () => {
      mockElements.createPaymentMethod.mockResolvedValueOnce({ error: { message: 'Card error message.' } });

      render(<TestPaymentModalWrapper initialAmount={1000} />);

      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/card error message\./i)).toBeInTheDocument();
        // Verify that global error is dispatched
        const globalError = useGlobalError.getState().error;
        expect(globalError).not.toBeNull();
        expect(globalError?.message).toBe('Card error message.');
      });
      const addFundsButton = screen.getByRole('button', { name: /add funds/i });
      expect(addFundsButton).not.toHaveAttribute('disabled'); // Button enabled again
      expect(screen.queryByText(/processing payment/i)).not.toBeInTheDocument();
    });

    test('should display error message if confirmCardPayment fails with payment_intent.payment_failed', async () => {
      mockStripe.confirmCardPayment.mockResolvedValueOnce({
        error: {
          code: 'payment_intent_authentication_failure',
          payment_intent: {
            last_payment_error: { message: 'Authentication required' },
          },
        },
      });

      render(<TestPaymentModalWrapper initialAmount={1000} />);

      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
        // Verify that global error is dispatched
        const globalError = useGlobalError.getState().error;
        expect(globalError).not.toBeNull();
        expect(globalError?.message).toBe('Authentication required');
      });
      const addFundsButton = screen.getByRole('button', { name: /add funds/i });
      expect(addFundsButton).not.toHaveAttribute('disabled');
      expect(screen.queryByText(/processing payment/i)).not.toBeInTheDocument();
    });


    test('should display failure message if POST /payments/create-intent fails due to invalid amount', async () => {
      server.use(
        http.post('/payments/create-intent', () => {
          return HttpResponse.json(
            {
              message: 'Payment amount too low. Minimum is 500 cents.',
              statusCode: 400,
              code: 'amount_too_low',
              param: 'amount',
            },
            { status: 400 },
          );
        })
      );

      render(<TestPaymentModalWrapper initialAmount={100} />); // Amount lower than 500 fails

      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/payment amount too low\. minimum is 500 cents\./i)).toBeInTheDocument();
        // Verify that global error is dispatched
        const globalError = useGlobalError.getState().error;
        expect(globalError).not.toBeNull();
        expect(globalError?.message).toBe('Payment amount too low. Minimum is 500 cents.');
      });
      const addFundsButton = screen.getByRole('button', { name: /add funds/i });
      expect(addFundsButton).not.toHaveAttribute('disabled');
      expect(screen.queryByText(/processing payment/i)).not.toBeInTheDocument();
    });

    test('should display an error if /payments/create-intent returns a generic server error (500)', async () => {
      server.use(
        http.post('/payments/create-intent', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      render(<TestPaymentModalWrapper initialAmount={1000} />);

      fireEvent.click(screen.getByRole('button', { name: /add funds/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to create payment intent\. please try again\./i)).toBeInTheDocument();
        // Verify that global error is dispatched
        const globalError = useGlobalError.getState().error;
        expect(globalError).not.toBeNull();
        expect(globalError?.message).toBe('Failed to create payment intent. Please try again.');
      });
      const addFundsButton = screen.getByRole('button', { name: /add funds/i });
      expect(addFundsButton).not.toHaveAttribute('disabled');
      expect(screen.queryByText(/processing payment/i)).not.toBeInTheDocument();
    });
  });
});
