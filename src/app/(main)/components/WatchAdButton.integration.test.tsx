import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WatchAdButton from './WatchAdButton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { AuthContext } from '@/lib/AuthContext';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { useBalanceStore } from '@/store/balanceStore';

// Mock global stores to observe their state changes
jest.mock('@/store/globalErrorStore');
jest.mock('@/store/successMessageStore');
jest.mock('@/store/balanceStore');

const mockUseGlobalErrorStore = useGlobalErrorStore as jest.MockedFunction<typeof useGlobalErrorStore>;
const mockUseSuccessMessageStore = useSuccessMessageStore as jest.MockedFunction<typeof useSuccessMessageStore>;
const mockUseBalanceStore = useBalanceStore as jest.MockedFunction<typeof useBalanceStore>;

const QueryClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

let capturedGlobalErrorStoreState: {
  error: null,
  setError: jest.Mock,
  showConfirmation: jest.Mock,
  capturedOnConfirm?: () => void,
  capturedOnCancel?: () => void,
};
let mockSuccessMessageStoreState: any;
let mockBalanceStoreState: any;

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
  jest.useRealTimers(); // Restore real timers
});
afterAll(() => server.close());

beforeEach(() => {
  jest.useFakeTimers(); // Use fake timers for controlling ad countdown

  capturedGlobalErrorStoreState = {
    error: null,
    setError: jest.fn(),
    capturedOnConfirm: undefined,
    capturedOnCancel: undefined,
    showConfirmation: jest.fn((title, message, onConfirm, options) => {
      capturedGlobalErrorStoreState.capturedOnConfirm = onConfirm;
      capturedGlobalErrorStoreState.capturedOnCancel = options?.onCancel;
    }),
  };
  mockUseGlobalErrorStore.mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector(capturedGlobalErrorStoreState);
    }
    return capturedGlobalErrorStoreState;
  });

  mockSuccessMessageStoreState = {
    setMessage: jest.fn(),
  };
  mockUseSuccessMessageStore.mockReturnValue(mockSuccessMessageStoreState);

  mockBalanceStoreState = {
    balance: 100,
    updateBalance: jest.fn(),
  };
  mockUseBalanceStore.mockReturnValue(mockBalanceStoreState as any);
});

describe('WatchAdButton (Integration Test)', () => {

  const renderComponent = (isAuthenticated: boolean) => {
    return render(
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated: jest.fn(), userId: 'test-user' }}>
        <QueryClientWrapper>
          <WatchAdButton />
        </QueryClientWrapper>
      </AuthContext.Provider>
    );
  };

  it('should play ad, credit balance, and show success message on successful ad completion', async () => {
    const originalBalance = 100;
    const creditedAmount = 5;
    const newBalance = originalBalance + creditedAmount;

    mockUseBalanceStore.mockReturnValue({
      balance: originalBalance,
      updateBalance: jest.fn(),
    });

    server.use(
      rest.post('/api/ads/credit', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ newBalance, creditedAmount }));
      })
    );

    renderComponent(true); // Authenticated

    const watchAdButton = screen.getByRole('button', { name: /Ad/i });
    fireEvent.click(watchAdButton);

    expect(screen.getByText(/Ad Playing.../i)).toBeInTheDocument();
    expect(screen.getByText(/Please wait 10 seconds\./i)).toBeInTheDocument();

    // Advance timers by AD_DURATION_SECONDS
    await act(async () => {
      jest.advanceTimersByTime(10000); // 10 seconds
    });

    // Expect ad credit API to be called
    await waitFor(() => {
      expect(mockUseBalanceStore().updateBalance).toHaveBeenCalledWith(newBalance);
    });

    expect(mockUseSuccessMessageStore().setMessage).toHaveBeenCalledWith(`Congratulations! You earned ${creditedAmount}!`);

    // Verify modal closes after success message
    await waitFor(() => {
      expect(screen.queryByText(/Ad Playing.../i)).not.toBeInTheDocument();
    }, { timeout: 4000 }); // Wait for 3s close delay + some buffer
  });

  it('should display error message if ad credit fails', async () => {
    const errorMessage = 'Failed to credit ad. Please try again.';
    server.use(
      rest.post('/api/ads/credit', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: errorMessage }));
      })
    );

    renderComponent(true); // Authenticated

    const watchAdButton = screen.getByRole('button', { name: /Ad/i });
    fireEvent.click(watchAdButton);

    await act(async () => {
      jest.advanceTimersByTime(10000); // 10 seconds
    });

    await waitFor(() => {
      expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
        message: expect.stringContaining(errorMessage),
        type: 'error',
      });
    });

    // Ensure balance is NOT updated
    expect(mockUseBalanceStore().updateBalance).not.toHaveBeenCalled();

    // Modal should eventually close even on error
    await waitFor(() => {
      expect(screen.queryByText(/Ad Playing.../i)).not.toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('should show a warning if user is not authenticated', async () => {
    renderComponent(false); // Not authenticated

    const watchAdButton = screen.getByRole('button', { name: /Ad/i });
    fireEvent.click(watchAdButton);

    expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
      message: 'You must be logged in to watch ads.',
      type: 'warning',
    });
    expect(screen.queryByText(/Ad Playing.../i)).not.toBeInTheDocument(); // Modal should not open
  });

  it('should disable button while ad is playing', async () => {
    server.use(
      rest.post('/api/ads/credit', (req, res, ctx) => {
        // This will be called after 10 seconds
        return res(ctx.status(200), ctx.json({ newBalance: 105, creditedAmount: 5 }));
      })
    );

    renderComponent(true);

    const watchAdButton = screen.getByRole('button', { name: /Ad/i });
    fireEvent.click(watchAdButton);

    expect(watchAdButton).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(5000); // Advance halfway
    });
    expect(watchAdButton).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(5000); // Complete ad
    });

    // After ad completes and API call resolves, button should be enabled again
    await waitFor(() => {
      expect(watchAdButton).not.toBeDisabled();
    }, { timeout: 4000 }); // Account for the 3s modal close delay
  });
});
