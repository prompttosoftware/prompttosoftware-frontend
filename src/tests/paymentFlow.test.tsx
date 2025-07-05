import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentModal } from '@/app/main/components/PaymentModal';
import WatchAdButton from '@/app/main/components/WatchAdButton';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { AuthProvider } from '@/lib/AuthContext';
import { BalanceStoreProvider, useBalanceStore } from '@/store/balanceStore'; // Import useBalanceStore
import { useGlobalErrorStore } from '@/store/globalErrorStore'; // Correct import for useGlobalErrorStore
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { Card } from '@/types/payments'; // Import Card type

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
const mockCreatePaymentMethod = jest.fn();
const mockConfirmCardPayment = jest.fn();

const mockElements = {
  createPaymentMethod: mockCreatePaymentMethod,
  getElement: jest.fn(() => ({})), // Mock getElement for CardElement
};

const mockStripe = {
  elements: jest.fn(() => mockElements),
  confirmCardPayment: mockConfirmCardPayment,
};

// Helper function to set the behavior of createPaymentMethod
const setCreatePaymentMethodOutcome = (outcome: { paymentMethod?: { id: string }, error?: { message: string }}) => {
  mockCreatePaymentMethod.mockResolvedValueOnce(outcome);
};

// Helper function to set the behavior of confirmCardPayment
const setConfirmCardPaymentOutcome = (outcome: { paymentIntent?: { status: string, id: string, amount?: number }, error?: { message: string; code?: string; payment_intent?: { last_payment_error: { message: string } } } }) => {
  mockConfirmCardPayment.mockResolvedValueOnce(outcome);
};

// Reset mocks to default success behavior before each test
const resetStripeMocks = () => {
  setCreatePaymentMethodOutcome({ paymentMethod: { id: 'pm_mock_card_success' } });
  setConfirmCardPaymentOutcome({ paymentIntent: { status: 'succeeded', id: 'pi_mock_success', amount: 1000 /* default mock amount in cents */ } });
};

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
}));

// Mock Stripe React Elements as we don't need real Stripe components for integration tests
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardElement: () => <div data-testid="mock-card-element" />,
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));
global.setCreatePaymentMethodOutcome = setCreatePaymentMethodOutcome;
global.setConfirmCardPaymentOutcome = setConfirmCardPaymentOutcome;
global.resetStripeMocks = resetStripeMocks;

declare global {
  var setCreatePaymentMethodOutcome: typeof setCreatePaymentMethodOutcome;
  var setConfirmCardPaymentOutcome: typeof setConfirmCardPaymentOutcome;
  var resetStripeMocks: typeof resetStripeMocks;
}

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
  // Remove initialAmount as it's no longer used in the store state
  usePaymentModalStore.setState({ isOpen: false, clientSecret: null });
  // Reset global error state
  act(() => {
    useGlobalErrorStore.getState().clearError();
    useSuccessMessageStore.getState().setMessage(null); // Clear success message too
  });
  // Reset balance for tests
  act(() => {
    useBalanceStore.getState().setBalance(1000); // Reset to initial 1000 cents
  });
  resetStripeMocks(); // Reset Stripe mocks to default success
});

afterAll(async () => {
  server.close();
});

// Helper component to render the modal and manage its state
const TestPaymentModalWrapper = () => { // Removed initialAmount prop
  const { openModal } = usePaymentModalStore();

  // Workaround to ensure usePaymentModal is initialized
  (global as any).IS_REACT_ACT_ENVIRONMENT = true;

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
  const mockCards: Card[] = [
    { id: 'card-1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025, default: true, created: 1678886400 },
    { id: 'card-2', brand: 'mastercard', last4: '5555', expMonth: 11, expYear: 2024, default: false, created: 1678886400 },
  ];

  describe('Saved Payment Card Management', () => {
    beforeEach(() => {
      // Ensure the payment modal is closed before each test in this suite
      act(() => {
        usePaymentModalStore.getState().closeModal();
      });
      // Reset user balance for consistent testing, as this affects the PaymentModal display (if it shows balance)
      act(() => {
        useBalanceStore.getState().setBalance(1000); // 10.00
      });
    });

    test('should display a message if no saved cards are found', async () => {
      server.use(
        http.get('/payments/cards', () => {
          return HttpResponse.json([], { status: 200 }); // Empty list
        })
      );

      render(<TestPaymentModalWrapper />);

      act(() => {
        usePaymentModalStore.getState().openModal(); // Open the modal
      });

      // Navigate to the 'Saved Cards' tab. This assumes there's a tab or button to switch views.
      // Assuming a "Saved Cards" button that opens the view for saved cards
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saved cards/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /saved cards/i }));

      // There should be a message indicating no cards
      await waitFor(() => {
        expect(screen.getByText(/no saved cards found\./i)).toBeInTheDocument();
      });

      // Ensure that the "Add Card" button is still visible and functional
      expect(screen.getByRole('button', { name: /add card/i })).toBeInTheDocument();
    });

    test('should display a list of saved cards', async () => {
      server.use(
        http.get('/payments/cards', () => {
          return HttpResponse.json(mockCards, { status: 200 });
        })
      );

      render(<TestPaymentModalWrapper />);

      act(() => {
        usePaymentModalStore.getState().openModal(); // Open the modal
      });
      
      // Navigate to the 'Saved Cards' tab
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saved cards/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /saved cards/i }));

      // Wait for cards to be displayed
      await waitFor(() => {
        expect(screen.getByText(/visa ending in 4242/i)).toBeInTheDocument();
        expect(screen.getByText(/mastercard ending in 5555/i)).toBeInTheDocument();
      });

      // Check for default badge on the first card
      expect(screen.getByText(/visa ending in 4242/i).closest('div')).toHaveTextContent(/default/i);

      // Check expiration dates
      expect(screen.getByText(/expires 12\/25/i)).toBeInTheDocument();
      expect(screen.getByText(/expires 11\/24/i)).toBeInTheDocument();
    });

    test('should successfully delete a saved card and update UI', async () => {
      server.use(
        http.get('/payments/cards', () => {
          return HttpResponse.json(mockCards, { status: 200 }); // Return populated list initially
        }),
        http.delete('/payments/cards/:id', ({ params }) => {
          if (params.id === 'card-1') {
            return HttpResponse.json({}, { status: 204 }); // Successful deletion
          }
          return HttpResponse.json({ message: 'Card not found' }, { status: 404 });
        })
      );

      render(<TestPaymentModalWrapper />);

      act(() => {
        usePaymentModalStore.getState().openModal(); // Open the modal
      });
      
      fireEvent.click(screen.getByRole('button', { name: /saved cards/i }));

      await waitFor(() => {
        expect(screen.getByText(/visa ending in 4242/i)).toBeInTheDocument();
      });

      // Find the delete button for 'card-1'
      const card1Element = screen.getByText(/visa ending in 4242/i);
      const deleteButton = card1Element.closest('div')?.querySelector('[aria-label="Delete card"]');
      expect(deleteButton).toBeInTheDocument();

      fireEvent.click(deleteButton!);

      // Expect confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete this card\?/i)).toBeInTheDocument();
      });

      const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmDeleteButton);

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/card deleted successfully\./i)).toBeInTheDocument();
      });

      // Verify card-1 is no longer in the document
      await waitFor(() => {
        expect(screen.queryByText(/visa ending in 4242/i)).not.toBeInTheDocument();
      });

      // mastercard should still be there
      expect(screen.getByText(/mastercard ending in 5555/i)).toBeInTheDocument();
    });

    test('should display an error if card deletion fails', async () => {
      server.use(
        http.get('/payments/cards', () => {
          return HttpResponse.json(mockCards, { status: 200 });
        }),
        http.delete('/payments/cards/:id', ({ params }) => {
          if (params.id === 'card-1') {
            return HttpResponse.json({ message: 'Failed to delete card.' }, { status: 500 }); // Deletion failure
          }
          return HttpResponse.json({}, { status: 204 }); // Other cards can still be deleted successfully
        })
      );

      render(<TestPaymentModalWrapper />);

      act(() => {
        usePaymentModalStore.getState().openModal(); // Open the modal
      });
      
      fireEvent.click(screen.getByRole('button', { name: /saved cards/i }));

      await waitFor(() => {
        expect(screen.getByText(/visa ending in 4242/i)).toBeInTheDocument();
      });

      const card1Element = screen.getByText(/visa ending in 4242/i);
      const deleteButton = card1Element.closest('div')?.querySelector('[aria-label="Delete card"]');
      expect(deleteButton).toBeInTheDocument();

      fireEvent.click(deleteButton!);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete this card\?/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/failed to delete card\./i)).toBeInTheDocument();
      });
      // Verify that global error is dispatched
      const globalError = useGlobalErrorStore.getState().error;
      expect(globalError).not.toBeNull();
      expect(globalError?.message).toBe('Failed to delete card.');

      // Check that the card is still visible
      expect(screen.getByText(/visa ending in 4242/i)).toBeInTheDocument();
    });
  });
  describe('PaymentsModal UI states and balance updates', () => {
    beforeEach(() => {
      server.use(
        http.post('/payments/create-intent', async ({ request }) => {
          const { amount } = await request.json();
          // Set Stripe mock to return this amount for confirmCardPayment
          setConfirmCardPaymentOutcome({ paymentIntent: { status: 'succeeded', id: 'pi_mock_success_dynamic', amount: amount } });
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
      render(<TestPaymentModalWrapper />); // Removed initialAmount

      act(() => {
        usePaymentModalStore.getState().openModal(); // Open modal explicitly
      });

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '10.00' } }); // Simulate typing amount

      const addFundsButton = screen.getByRole('button', { name: /next/i }); // Button text is "Next" initially
      expect(addFundsButton).toBeInTheDocument();

      fireEvent.click(addFundsButton);

      // Expect loading spinner/disabled state for payment intent creation
      expect(addFundsButton).toHaveAttribute('disabled');
      expect(screen.getByText(/processing\.\.\./i)).toBeInTheDocument(); // PaymentModal's own processing message

      // Wait for UI to switch to confirm_card step and button to change
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
        expect(screen.queryByText(/processing\.\.\./i)).not.toBeInTheDocument();
      });

      const confirmPaymentButton = screen.getByRole('button', { name: /confirm payment/i });
      fireEvent.click(confirmPaymentButton);

      // Expect loading state for payment confirmation
      expect(confirmPaymentButton).toHaveAttribute('disabled');
      expect(screen.getByText(/confirming\.\.\./i)).toBeInTheDocument(); // PaymentFormContent's confirming message


      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /confirming\.\.\./i })).not.toBeInTheDocument();
        expect(screen.getByText(/successfully added \$10\.00 to your balance!/i)).toBeInTheDocument();
      });
      // The modal should close on success
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('should update balance and show success message on successful payment', async () => {
      render(<TestPaymentModalWrapper />); // Removed initialAmount
    
      act(() => {
        usePaymentModalStore.getState().openModal(); // Open modal explicitly
      });
    
      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '50.00' } }); // Simulate typing amount
    
      // User initial balance is 1000 from /auth/me mock
      expect(screen.getByText(/current balance: \$10\.00/i)).toBeInTheDocument();
    
      // Click next to create payment intent
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      // Wait for confirm payment button to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
        expect(screen.getByText(/amount to add: \$50\.00/i)).toBeInTheDocument();
      });

      // Click confirm payment
      fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

      await waitFor(() => {
        expect(screen.getByText(/successfully added \$50\.00 to your balance!/i)).toBeInTheDocument();
      });

      // The modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Balance should update to 1000 (initial) + 5000 (added) = 6000 cents = $60.00
      expect(screen.getByText(/current balance: \$60\.00/i)).toBeInTheDocument();
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
      // Reset balance store for this specific test
      act(() => {
        useBalanceStore.getState().setBalance(0);
      });
    
      render(<TestPaymentModalWrapper />); // Removed initialAmount
    
      act(() => {
        usePaymentModalStore.getState().openModal(); // Open modal explicitly
      });
    
      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '100.00' } }); // Simulate typing amount
    
      // Initial balance should be 0 from the mock
      expect(screen.getByText(/current balance: \$0\.00/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/add \$100\.00/i)).toBeInTheDocument(); // Displayed amount
      });

      // Expect to see the bonus message
      expect(screen.getByText(/get a 20% bonus/i)).toBeInTheDocument();
      expect(screen.getByText(/\+\$20\.00 bonus/i)).toBeInTheDocument(); // 20% of $100 is $20


      // Click next to create payment intent
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      // Wait for confirm payment button to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
      });

      // Set confirmCardPayment to return the correct amount including bonus
      setConfirmCardPaymentOutcome({ paymentIntent: { status: 'succeeded', id: 'pi_mock_success_bonus', amount: 12000 } });

      fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));


      await waitFor(() => {
        expect(screen.getByText(/successfully added \$100\.00 to your balance!/i)).toBeInTheDocument(); // Success message should be about the intended amount, not bonus
      });

      // The modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
      // Reset balance store to initial for this test
      act(() => {
        useBalanceStore.getState().setBalance(1000);
      });
    
      // Test with amount under $100 (5000 cents = $50)
      const { rerender } = render(<TestPaymentModalWrapper />); // Removed initialAmount
    
      act(() => {
        usePaymentModalStore.getState().openModal(); // Open modal explicitly
      });
    
      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '50.00' } }); // Simulate typing amount
    
      // Expect initial balance to be $10.00
      expect(screen.getByText(/current balance: \$10\.00/i)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/add \$50\.00/i)).toBeInTheDocument();
      });
    
      // Bonus message should not be visible
      expect(screen.queryByText(/get a 20% bonus/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\+\$10\.00 bonus/i)).not.toBeInTheDocument(); // For 5000 cents amount, bonus would be 1000 cents.

      // Click next to create payment intent
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      // Wait for confirm payment button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
      });

      // Set confirmCardPayment to return the correct amount (no bonus)
      setConfirmCardPaymentOutcome({ paymentIntent: { status: 'succeeded', id: 'pi_mock_success_no_bonus_1', amount: 5000 } });

      fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

      await waitFor(() => {
        expect(screen.getByText(/successfully added \$50\.00 to your balance!/i)).toBeInTheDocument();
      });

      // The modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Balance should update to 1000 (initial) + 5000 (added) = 6000 cents = $60.00
      expect(screen.getByText(/current balance: \$60\.00/i)).toBeInTheDocument();

      // Re-render for amount over $100 but not first payment
      act(() => {
        usePaymentModalStore.setState({ isOpen: false, clientSecret: null }); // Close previous modal, initialAmount no longer exists
        useSuccessMessageStore.getState().setMessage(null); // Clear success message from previous payment
        usePaymentModalStore.getState().openModal(); // Open modal explicitly for the second test scenario
      });
      rerender(<TestPaymentModalWrapper />); // Removed initialAmount
      
      // Re-query amountInput after rerender as its reference might be stale
      const amountInputAfterRerender = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInputAfterRerender, { target: { value: '150.00' } }); // Simulate typing amount
      
      // Expect to see no bonus message
      expect(screen.queryByText(/get a 20% bonus/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\+\$30\.00 bonus/i)).not.toBeInTheDocument(); // For 15000 cents amount, bonus would be 3000 cents.
      
      // Click next to create payment intent
      fireEvent.click(await screen.findByRole('button', { name: /next/i }));

      // Wait for confirm payment button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
      });

      // Set confirmCardPayment to return the correct amount (no bonus)
      setConfirmCardPaymentOutcome({ paymentIntent: { status: 'succeeded', id: 'pi_mock_success_no_bonus_2', amount: 15000 } });

      fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

      await waitFor(() => {
        expect(screen.getByText(/successfully added \$150\.00 to your balance!/i)).toBeInTheDocument();
      });

      // The modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Balance should update to 6000 (previous updated) + 15000 (added) = 21000 cents = $210.00
      expect(screen.getByText(/current balance: \$210\.00/i)).toBeInTheDocument();
    });

    test('should allow user to type amount and complete payment flow successfully', async () => {
      // Mock the initial /auth/me with default balance
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
            credits: 1000,
          }, { status: 200 });
        })
      );
      act(() => {
        useBalanceStore.getState().setBalance(1000);
      });

      // Render the wrapper without initialAmount, simulating a closed modal initially
      const { rerender } = render(<TestPaymentModalWrapper />);

      // Open the modal via store action (simulating external trigger)
      act(() => {
        usePaymentModalStore.getState().openModal();
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const amountInput = screen.getByLabelText(/amount/i);
      const nextButton = screen.getByRole('button', { name: /next/i });

      // Simulate typing '25.50'
      fireEvent.change(amountInput, { target: { value: '25.50' } });
      expect(amountInput).toHaveValue('25.50');

      // Click Next to create payment intent
      fireEvent.click(nextButton);

      // Wait for UI to switch to confirm_card step
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
        expect(screen.getByText(/amount to add: \$25\.50/i)).toBeInTheDocument();
      });

      const confirmPaymentButton = screen.getByRole('button', { name: /confirm payment/i });

      // Set confirmCardPayment to return the correct amount (2550 cents)
      setConfirmCardPaymentOutcome({ paymentIntent: { status: 'succeeded', id: 'pi_mock_typed_amount', amount: 2550 } });

      fireEvent.click(confirmPaymentButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully added \$25\.50 to your balance!/i)).toBeInTheDocument();
      });

      // The modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Balance should update: 1000 (initial) + 2550 (added) = 3550 cents = $35.50
      expect(useBalanceStore.getState().balance).toBe(3550);
      expect(screen.getByText(/current balance: \$35\.50/i)).toBeInTheDocument();
    });

  });

  describe('Stripe.js SDK Mocking and Error Handling', () => {
  // ... existing content of Stripe.js SDK Mocking and Error Handling
});
// Helper component for WatchAdButton
const TestWatchAdWrapper = () => { /* ... */ };

describe('Watch Ad Flow Integration Tests', () => { /* ... */ });
  test('should display general error message if createPaymentMethod fails', async () => {
    setCreatePaymentMethodOutcome({ error: { message: 'Card error message.' } }); // Using global helper

    render(<TestPaymentModalWrapper />); // Removed initialAmount

    act(() => {
      usePaymentModalStore.getState().openModal(); // Open modal explicitly
    });

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '10.00' } }); // Simulate typing amount

    // Click next to create payment intent
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for the error message to appear in the global error store and on screen
    await waitFor(() => {
      expect(screen.getByText(/card error message\./i)).toBeInTheDocument();
    });
    // Verify that global error is dispatched
    const globalError = useGlobalErrorStore.getState().error;
    expect(globalError).not.toBeNull();
    expect(globalError?.message).toBe('Card error message.');

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toHaveAttribute('disabled'); // Button enabled again
    expect(screen.queryByText(/processing\.\.\./i)).not.toBeInTheDocument(); // Loading state should be gone

    // Ensure modal is still open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Ensure it's still on the input_amount step
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  test('should display error message if confirmCardPayment fails with payment_intent.payment_failed', async () => {
    // Mock confirmCardPayment after the create-intent step
    setConfirmCardPaymentOutcome({
      error: {
        code: 'payment_intent_authentication_failure',
        payment_intent: {
          last_payment_error: { message: 'Authentication required' },
        },
      },
    });

    render(<TestPaymentModalWrapper />); // Removed initialAmount

    act(() => {
      usePaymentModalStore.getState().openModal(); // Open modal explicitly
    });

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '10.00' } }); // Simulate typing amount

    // Click next to create payment intent
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for confirm payment button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
    });

    // Click confirm payment
    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
    });
    // Verify that global error is dispatched
    const globalError = useGlobalErrorStore.getState().error;
    expect(globalError).not.toBeNull();
    expect(globalError?.message).toBe('Authentication required');

    const confirmPaymentButton = screen.getByRole('button', { name: /confirm payment/i });
    expect(confirmPaymentButton).not.toHaveAttribute('disabled'); // Button enabled again
    expect(screen.queryByText(/confirming\.\.\./i)).not.toBeInTheDocument(); // Loading state should be gone

    // Ensure modal is still open and on confirm_card step
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/confirm your payment details\./i)).toBeInTheDocument();
  });

  test('should display general error message if confirmCardPayment fails with generic error', async () => {
    // Set Stripe mock to return this error for confirmCardPayment
    setConfirmCardPaymentOutcome({ error: { message: 'Generic Stripe processing error.' } });

    render(<TestPaymentModalWrapper />); // Removed initialAmount

    act(() => {
      usePaymentModalStore.getState().openModal(); // Open modal explicitly
    });

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '10.00' } }); // Simulate typing amount

    // Click next to create payment intent
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for confirm payment button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm payment/i })).toBeInTheDocument();
    });

    // Click confirm payment
    fireEvent.click(await screen.findByRole('button', { name: /confirm payment/i }));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/generic stripe processing error\./i)).toBeInTheDocument();
    });
    // Verify that global error is dispatched
    const globalError = useGlobalErrorStore.getState().error;
    expect(globalError).not.toBeNull();
    expect(globalError?.message).toBe('Generic Stripe processing error.');

    const confirmPaymentButton = screen.getByRole('button', { name: /confirm payment/i });
    expect(confirmPaymentButton).not.toHaveAttribute('disabled'); // Button enabled again
    expect(screen.queryByText(/confirming\.\.\./i)).not.toBeInTheDocument(); // Loading state should be gone

    // Ensure modal is still open and on confirm_card step
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/confirm your payment details\./i)).toBeInTheDocument();
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

    render(<TestPaymentModalWrapper />); // Removed initialAmount

    act(() => {
      usePaymentModalStore.getState().openModal(); // Open modal explicitly
    });

    const amountInput = screen.getByLabelText(/amount/i);
    // Simulate typing '1.00' (100 cents), which will fail due to server-side minimum of 500 cents
    fireEvent.change(amountInput, { target: { value: '1.00' } });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/payment amount too low\. minimum is 500 cents\./i)).toBeInTheDocument();
    });
    // Verify that global error is dispatched
    const globalError = useGlobalErrorStore.getState().error;
    expect(globalError).not.toBeNull();
    expect(globalError?.message).toBe('Payment amount too low. Minimum is 500 cents.');

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toHaveAttribute('disabled');
    expect(screen.queryByText(/processing\.\.\./i)).not.toBeInTheDocument();

    // Ensure modal is still open and on input_amount step
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
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

    render(<TestPaymentModalWrapper />); // Removed initialAmount

    act(() => {
      usePaymentModalStore.getState().openModal(); // Open modal explicitly
    });

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '10.00' } }); // Simulate typing amount

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create payment intent\. please try again\./i)).toBeInTheDocument();
    });
    // Verify that global error is dispatched
    const globalError = useGlobalErrorStore.getState().error;
    expect(globalError).not.toBeNull();
    expect(globalError?.message).toBe('Failed to create payment intent. Please try again.');

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toHaveAttribute('disabled');
    expect(screen.queryByText(/processing\.\.\./i)).not.toBeInTheDocument();

    // Ensure modal is still open and on input_amount step
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });
});
// Helper component to render the WatchAdButton and manage its state
const TestWatchAdWrapper = () => {
  const queryClient = new QueryClient(); // Needed for BalanceDisplay which is part of layout
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BalanceStoreProvider>
          <WatchAdButton />
          {/* BalanceDisplay is usually shown next to the button, ensure it's rendered */}
          {/* For the purpose of testing balance updates, we can render a simple text for balance */}
          <p>Current Balance: ${useBalanceStore((state) => state.balance / 100).toFixed(2)}</p>
        </BalanceStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};


describe('Watch Ad Flow Integration Tests', () => {
  // Use fake timers to control the ad countdown
  jest.useFakeTimers();

  beforeEach(() => {
    // Mock user login and initial balance
    localStorage.setItem('jwtToken', 'mock-token');

    // Reset balance store for each ad test
    act(() => {
      useBalanceStore.getState().setBalance(1000); // Start with $10.00
    });
    // Reset global error and success messages
    act(() => {
      useGlobalErrorStore.getState().clearError();
      useSuccessMessageStore.getState().setMessage(null);
    });

    // Ensure the auth/me endpoint provides authentication and a balance
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
          credits: useBalanceStore.getState().balance, // Reflect current balance in mock
        }, { status: 200 });
      })
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Clear any remaining timers
    jest.clearAllTimers(); // Clear all mock timers explicitly
  });

  test('should successfully credit ad and update balance', async () => {
    // Mock successful ad credit response
    server.use(
      http.post('/ads/credit', () => {
        const currentBalance = useBalanceStore.getState().balance;
        const creditedAmount = 50; // 50 cents
        const newBalance = currentBalance + creditedAmount;
        return HttpResponse.json({ newBalance, creditedAmount }, { status: 200 });
      })
    );

    render(<TestWatchAdWrapper />);

    expect(screen.getByText('Current Balance: $10.00')).toBeInTheDocument();

    const watchAdButton = screen.getByRole('button', { name: /ad/i });
    fireEvent.click(watchAdButton);

    // Ad modal should appear
    expect(screen.getByText(/ad playing\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/please wait 10 seconds\./i)).toBeInTheDocument();
    expect(watchAdButton).toBeDisabled(); // Button should be disabled

    // Advance timers by AD_DURATION_SECONDS
    act(() => {
      jest.advanceTimersByTime(10000); // 10 seconds
    });

    // Ad modal should close or show success message briefly
    await waitFor(() => {
      expect(screen.getByText(/congratulations! you earned \$0\.50!/i)).toBeInTheDocument();
    });

    // Balance should be updated
    expect(screen.getByText('Current Balance: $10.50')).toBeInTheDocument(); // 10.00 + 0.50

    // After success message disappears (3000ms), modal closes
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() => {
      expect(screen.queryByText(/ad playing\.\.\./i)).not.toBeInTheDocument();
    });
    expect(screen.getByText('Current Balance: $10.50')).toBeInTheDocument(); // Still correct balance
    expect(watchAdButton).not.toBeDisabled(); // Button should be re-enabled
  });

  test('should show warning if user is not authenticated', async () => {
    localStorage.removeItem('jwtToken'); // Remove token to simulate unauthenticated user

    render(<TestWatchAdWrapper />);

    const watchAdButton = screen.getByRole('button', { name: /ad/i });
    fireEvent.click(watchAdButton);

    // Warning message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/you must be logged in to watch ads\./i)).toBeInTheDocument();
    });

    // Ad modal should NOT appear
    expect(screen.queryByText(/ad playing\.\.\./i)).not.toBeInTheDocument();
    // Balance should not change
    expect(screen.getByText('Current Balance: $10.00')).toBeInTheDocument();
  });

  test('should display error message on ad credit failure (mock_ad_fail)', async () => {
    // Mock ad credit failure response
    server.use(
      http.post('/ads/credit', () => {
        return HttpResponse.json({ message: 'mock_ad_fail: Ad playback incomplete.' }, { status: 400 });
      })
    );

    render(<TestWatchAdWrapper />);

    const watchAdButton = screen.getByRole('button', { name: /ad/i });
    fireEvent.click(watchAdButton);

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(10000); // 10 seconds
    });

    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/ad playback incomplete\./i)).toBeInTheDocument();
    });
    // Verify that global error is dispatched
    const globalError = useGlobalErrorStore.getState().error;
    expect(globalError).not.toBeNull();
    expect(globalError?.message).toBe('mock_ad_fail: Ad playback incomplete.');


    // Modal should close eventually (error message shown inside modal for a bit then closes)
    act(() => {
      jest.advanceTimersByTime(3000); // Assuming modal closes after error message for 3 seconds
    });
    await waitFor(() => {
      // The modal should close after displaying the error
      expect(screen.queryByText(/ad playing\.\.\./i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ad playback incomplete\./i)).not.toBeInTheDocument();
    });


    // Balance should NOT be updated
    expect(screen.getByText('Current Balance: $10.00')).toBeInTheDocument();
    expect(watchAdButton).not.toBeDisabled(); // Button re-enabled
  });

  test('should display generic error message on ad credit server error (mock_ad_server_error)', async () => {
    // Mock ad credit server error response
    server.use(
      http.post('/ads/credit', () => {
        return HttpResponse.json({ message: 'mock_ad_server_error: Internal server error.' }, { status: 500 });
      })
    );

    render(<TestWatchAdWrapper />);

    const watchAdButton = screen.getByRole('button', { name: /ad/i });
    fireEvent.click(watchAdButton);

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(10000); // 10 seconds
    });

    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/internal server error\./i)).toBeInTheDocument();
    });
    // Verify that global error is dispatched
    const globalError = useGlobalErrorStore.getState().error;
    expect(globalError).not.toBeNull();
    expect(globalError?.message).toBe('mock_ad_server_error: Internal server error.');


    // Modal should close eventually
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() => {
      expect(screen.queryByText(/ad playing\.\.\./i)).not.toBeInTheDocument();
      expect(screen.queryByText(/internal server error\./i)).not.toBeInTheDocument();
    });

    // Balance should NOT be updated
    expect(screen.getByText('Current Balance: $10.00')).toBeInTheDocument();
    expect(watchAdButton).not.toBeDisabled(); // Button re-enabled
  });

  test('should show loading spinner and disable button while ad is playing', async () => {
    // Make ad credit request pending to observe loading state
    let resolveAdCredit: (value: any) => void;
    const adCreditPromise = new Promise((resolve) => {
      resolveAdCredit = resolve;
    });

    server.use(
      http.post('/ads/credit', async () => {
        await adCreditPromise;
        const currentBalance = useBalanceStore.getState().balance;
        const creditedAmount = 50;
        const newBalance = currentBalance + creditedAmount;
        return HttpResponse.json({ newBalance, creditedAmount }, { status: 200 });
      })
    );

    render(<TestWatchAdWrapper />);

    const watchAdButton = screen.getByRole('button', { name: /ad/i });
    fireEvent.click(watchAdButton);

    // Initial state: button disabled, ad playing modal
    expect(watchAdButton).toBeDisabled();
    expect(screen.getByText(/ad playing\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/please wait 10 seconds\./i)).toBeInTheDocument();
    expect(screen.getByText(/ad content loading\.\.\./i)).toBeInTheDocument(); // Loading spinner text

    // Advance timers partially
    act(() => {
      jest.advanceTimersByTime(5000); // 5 seconds passed
    });
    expect(screen.getByText(/please wait 5 seconds\./i)).toBeInTheDocument();
    expect(watchAdButton).toBeDisabled(); // Still disabled

    // Advance timers to end of ad duration
    act(() => {
      jest.advanceTimersByTime(5000); // Total 10 seconds passed
    });

    // Ad should finish playing, now it's awaiting API response
    expect(screen.getByText(/ad finished!/i)).toBeInTheDocument();
    expect(watchAdButton).toBeDisabled(); // Still disabled while API call is pending

    // Mock API call to resolve
    act(() => {
      resolveAdCredit({ newBalance: 1050, creditedAmount: 50 }); // Resolve the promise
    });

    await waitFor(() => {
      expect(screen.getByText(/congratulations! you earned \$0\.50!/i)).toBeInTheDocument();
    });

    // Modal closes after success message
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText(/ad playing\.\.\./i)).not.toBeInTheDocument();
    });
    expect(watchAdButton).not.toBeDisabled(); // Button re-enabled
    expect(screen.getByText('Current Balance: $10.50')).toBeInTheDocument();
  });
});
