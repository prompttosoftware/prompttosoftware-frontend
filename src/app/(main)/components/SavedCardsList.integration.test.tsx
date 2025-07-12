import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SavedCardsList } from './SavedCardsList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { SavedCard } from '@/types/payments';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';

// Mock global stores to observe their state changes
jest.mock('@/store/globalErrorStore');
jest.mock('@/store/successMessageStore');

const mockUseGlobalErrorStore = useGlobalErrorStore as jest.MockedFunction<typeof useGlobalErrorStore>;
const mockUseSuccessMessageStore = useSuccessMessageStore as jest.MockedFunction<typeof useSuccessMessageStore>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockCards: SavedCard[] = [
  {
    id: 'card_1',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: 'card_2',
    brand: 'mastercard',
    last4: '1111',
    expiryMonth: 11,
    expiryYear: 2024,
    isDefault: false,
  },
];

let capturedGlobalErrorStoreState: {
  error: null,
  setError: jest.Mock,
  showConfirmation: jest.Mock,
  capturedOnConfirm?: () => void,
  capturedOnCancel?: () => void,
};
let mockSuccessMessageStoreState: any;

const server = setupServer(
  // Initial fetch of cards
  rest.get('/api/payments/saved-cards', (req, res, ctx) => {
    // This will be controlled by specific test cases
    return res(ctx.status(200), ctx.json(mockCards));
  }),
  // Delete card endpoint
  rest.delete('/api/payments/saved-cards/:cardId', (req, res, ctx) => {
    const { cardId } = req.params;
    if (cardId === 'card_1') {
      return res(ctx.status(200), ctx.json({ message: 'Card deleted successfully' }));
    }
    return res(ctx.status(404), ctx.json({ message: 'Card not found' }));
  }),
  // Set default card endpoint
  rest.put('/api/payments/saved-cards/:cardId/set-default', (req, res, ctx) => {
    const { cardId } = req.params;
    if (cardId === 'card_2') {
      return res(ctx.status(200), ctx.json({ message: 'Card set as default' }));
    }
    return res(ctx.status(404), ctx.json({ message: 'Card not found' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  queryClient.clear(); // Clear cache between tests
  jest.clearAllMocks(); // Clear mocks for Zustand stores
});
afterAll(() => server.close());

beforeEach(() => {
  // Reset Zustand store state for each test
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
});

describe('SavedCardsList (Integration Test)', () => {
  it('renders cards correctly when data is available', async () => {
    server.use(
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockCards));
      })
    );

    render(<SavedCardsList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
      expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('renders empty state when no cards are available', async () => {
    server.use(
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([])); // Return empty array
      })
    );

    render(<SavedCardsList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /No Saved Payment Methods/i })).toBeInTheDocument();
      expect(screen.getByText(/You haven't saved any payment methods yet\. They will appear here after your first payment\./i)).toBeInTheDocument();
    });
  });

  it('handles successful card deletion', async () => {
    server.use(
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json(mockCards)); // Initial fetch
      }),
      rest.delete('/api/payments/saved-cards/:cardId', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ message: 'Card deleted successfully' }));
      }),
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        // This will be called after deletion, returning the updated list
        return res(ctx.status(200), ctx.json([mockCards[1]])); // Only card_2 remains
      })
    );

    render(<SavedCardsList />, { wrapper });

    // Ensure cards are rendered initially
    await waitFor(() => {
      expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
      expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
    });

    const cardToDelete = mockCards[0];
    const deleteButton = screen.getByTestId(`delete-card-button-${cardToDelete.id}`);

    fireEvent.click(deleteButton);

    // Confirm deletion
    expect(capturedGlobalErrorStoreState.showConfirmation).toHaveBeenCalled();
    await act(async () => {
      capturedGlobalErrorStoreState.capturedOnConfirm!();
    });

    // Assert that delete API was called
    await waitFor(() => {
      expect(mockUseSuccessMessageStore().setMessage).toHaveBeenCalledWith('Card deleted successfully!');
    });

    // Assert that the card is removed from the UI after re-fetch
    await waitFor(() => {
      expect(screen.queryByText('Visa ending in 4242')).not.toBeInTheDocument();
      expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
    });
  });

  it('displays an error if card deletion fails', async () => {
    const errorMessage = 'Failed to delete card';
    server.use(
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json(mockCards));
      }),
      rest.delete('/api/payments/saved-cards/:cardId', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: errorMessage }));
      })
    );

    render(<SavedCardsList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
    });

    const cardToDelete = mockCards[0];
    const deleteButton = screen.getByTestId(`delete-card-button-${cardToDelete.id}`);

    fireEvent.click(deleteButton);

    expect(capturedGlobalErrorStoreState.showConfirmation).toHaveBeenCalled();
    await act(async () => {
      capturedGlobalErrorStoreState.capturedOnConfirm!();
    });

    await waitFor(() => {
      expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
        message: expect.stringContaining(errorMessage),
        type: 'error',
      });
    });

    // Ensure that the card is still displayed if deletion failed
    expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
  });

  it('handles setting a card as default', async () => {
    const initialCards: SavedCard[] = [
      { id: 'card1', last4: '1234', brand: 'visa', expiryMonth: 12, expiryYear: 2025, isDefault: true },
      { id: 'card2', last4: '5678', brand: 'mastercard', expiryMonth: 11, expiryYear: 2024, isDefault: false },
    ];
    const updatedCards: SavedCard[] = [
      { id: 'card1', last4: '1234', brand: 'visa', expiryMonth: 12, expiryYear: 2025, isDefault: false },
      { id: 'card2', last4: '5678', brand: 'mastercard', expiryMonth: 11, expiryYear: 2024, isDefault: true },
    ];

    server.use(
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json(initialCards));
      }),
      rest.put('/api/payments/saved-cards/:cardId/set-default', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ message: 'Card set as default' }));
      }),
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(updatedCards));
      })
    );

    render(<SavedCardsList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('card-card1-default')).toBeInTheDocument();
      expect(screen.queryByTestId('card-card2-default')).not.toBeInTheDocument();
    });

    const setCard2DefaultButton = screen.getByTestId('set-default-card2');

    await act(async () => {
      fireEvent.click(setCard2DefaultButton);
    });

    await waitFor(() => {
      expect(mockUseSuccessMessageStore().setMessage).toHaveBeenCalledWith('Card successfully set as default.');
    });

    await waitFor(() => {
      expect(screen.queryByTestId('card-card1-default')).not.toBeInTheDocument();
      expect(screen.getByTestId('card-card2-default')).toBeInTheDocument();
    });
  });

  it('should display error message if setting default card fails', async () => {
    const initialCards: SavedCard[] = [
      { id: 'card1', last4: '1234', brand: 'visa', expiryMonth: 12, expiryYear: 2025, isDefault: true },
      { id: 'card2', last4: '5678', brand: 'mastercard', expiryMonth: 11, expiryYear: 2024, isDefault: false },
    ];
    const errorMessage = 'Failed to set default card';

    server.use(
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json(initialCards));
      }),
      rest.put('/api/payments/saved-cards/:cardId/set-default', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: errorMessage }));
      })
    );

    render(<SavedCardsList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('card-card1-default')).toBeInTheDocument();
    });

    const setCard2DefaultButton = screen.getByTestId('set-default-card2');
    fireEvent.click(setCard2DefaultButton);

    await waitFor(() => {
      expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
        message: expect.stringContaining(errorMessage),
        type: 'error',
      });
    });

    // Ensure default status remains unchanged
    expect(screen.getByTestId('card-card1-default')).toBeInTheDocument();
    expect(screen.queryByTestId('card-card2-default')).not.toBeInTheDocument();
  });

  it('renders error state when fetching cards fails', async () => {
    server.use(
      rest.get('/api/payments/saved-cards', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Failed to fetch cards' }));
      })
    );
    render(<SavedCardsList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Failed to load saved payment methods.')).toBeInTheDocument();
      expect(screen.getByText('Please try again later.')).toBeInTheDocument();
    });
    expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
      message: expect.stringContaining('Failed to fetch cards'),
      type: 'error',
    });
  });
});
