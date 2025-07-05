import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SavedCardsList } from './SavedCardsList';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/lib/api';
import { SavedCard } from '@/types/payments';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { jest } from '@jest/globals';

// Mock global stores to control their state in tests
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { useSavedCardsQuery } from '@/hooks/useSavedCardsQuery';

jest.mock('@/store/globalErrorStore');
jest.mock('@/store/successMessageStore');
jest.mock('@/hooks/useSavedCardsQuery');

const mockUseGlobalErrorStore = useGlobalErrorStore as jest.MockedFunction<typeof useGlobalErrorStore>;
const mockUseSuccessMessageStore = useSuccessMessageStore as jest.MockedFunction<typeof useSuccessMessageStore>;
const mockUseSavedCardsQuery = useSavedCardsQuery as jest.MockedFunction<typeof useSavedCardsQuery>;

// Mock data
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

describe('SavedCardsList', () => {
  let queryClient: QueryClient;
  let capturedGlobalErrorStoreState: {
    error: null,
    setError: jest.Mock,
    showConfirmation: jest.Mock,
    capturedOnConfirm?: () => void,
    capturedOnCancel?: () => void,
  };
  let mockSuccessMessageStoreState: any;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    // Reset Zustand store state for each test
    capturedGlobalErrorStoreState = {
      error: null,
      setError: jest.fn(),
      capturedOnConfirm: undefined,
      capturedOnCancel: undefined,
      showConfirmation: jest.fn((title, message, onConfirm, onCancel) => {
        capturedGlobalErrorStoreState.capturedOnConfirm = onConfirm;
        capturedGlobalErrorStoreState.capturedOnCancel = onCancel;
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
  afterEach(() => {
    queryClient.clear();
  });

  // Helper function to render component with QueryClientProvider
  const renderWithClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders loading state initially by showing skeleton loaders', async () => {
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return HttpResponse.json([] as SavedCard[], { status: 200 });
      })
    );
    renderWithClient(<SavedCardsList />);

    expect(screen.getAllByTestId('skeleton-loader')).toHaveLength(3);
    
    await waitFor(() => {
      expect(screen.getByText('No Saved Payment Methods')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('renders error state when fetching cards fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, () => {
        return HttpResponse.json({ message: 'Failed to fetch cards' }, { status: 500 });
      })
    );
    renderWithClient(<SavedCardsList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load saved payment methods.')).toBeInTheDocument();
      expect(screen.getByText('Please try again later.')).toBeInTheDocument();
    });
    expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
      message: expect.stringContaining('Failed to fetch cards'),
      type: 'error',
    });
  });

  it('renders cards correctly when data is available', async () => {
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, () => {
        return HttpResponse.json(mockCards, { status: 200 });
      })
    );
    renderWithClient(<SavedCardsList />);

    await waitFor(() => {
      expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
      expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('handles successful card deletion with optimistic update', async () => {
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, () => {
        return HttpResponse.json(mockCards, { status: 200 });
      }),
      http.delete(`${API_BASE_URL}/payments/saved-cards/${mockCards[0].id}`, () => {
        return HttpResponse.json({ message: 'Card deleted successfully' }, { status: 200 });
      })
    );
    renderWithClient(<SavedCardsList />);

    await waitFor(() => {
      expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
    });

    const cardToDelete = mockCards[0];
    const deleteButton = screen.getByTestId(`delete-card-button-${cardToDelete.id}`);
    
    fireEvent.click(deleteButton);
    
    expect(capturedGlobalErrorStoreState.showConfirmation).toHaveBeenCalledWith(
      'Remove Saved Card',
      'Are you sure you want to remove this card? This action cannot be undone.',
      expect.any(Function),
      expect.any(Function)
    );
    
    await act(async () => {
      capturedGlobalErrorStoreState.capturedOnConfirm!();
    });
    
    // Expect optimistic update: card should disappear immediately
    expect(screen.queryByText('Visa ending in 4242')).not.toBeInTheDocument();
    expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
    
    expect(mockUseSuccessMessageStore().setMessage).toHaveBeenCalledWith('Card deleted successfully!');

    // After deletion, wait for pending fetches (like refetch upon invalidateQueries) to resolve
    // and ensure the final state is correct.
    await waitFor(() => {
      expect(screen.queryByText('Visa ending in 4242')).not.toBeInTheDocument();
    });
  });
  
  it('does not delete card when confirmation is cancelled', async () => {
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, () => {
        return HttpResponse.json(mockCards, { status: 200 });
      }),
      http.delete(`${API_BASE_URL}/payments/saved-cards/${mockCards[0].id}`, () => {
          // This handler should not be hit if cancellation works
          return HttpResponse.json({ message: 'Deleted' }, { status: 200 });
      })
    );
    renderWithClient(<SavedCardsList />);

    await waitFor(() => {
      expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
    });

    const cardToDelete = mockCards[0];
    const deleteButton = screen.getByTestId(`delete-card-button-${cardToDelete.id}`);
    
    fireEvent.click(deleteButton);
    
    expect(capturedGlobalErrorStoreState.showConfirmation).toHaveBeenCalledWith(
      'Remove Saved Card',
      'Are you sure you want to remove this card? This action cannot be undone.',
      expect.any(Function),
      expect.any(Function)
    );
    
    await act(async () => {
      capturedGlobalErrorStoreState.capturedOnCancel!();
    });
    
    // Expect card to still be in the document
    expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
    expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
    
    // Ensure DELETE endpoint was NOT called
    const deleteRequests = server.events.list.filter(e => e.type === 'request' && e.request.method === 'DELETE');
    expect(deleteRequests).toHaveLength(0);
    
    expect(mockUseSuccessMessageStore().setMessage).not.toHaveBeenCalled();
  });

  it('renders empty state when no cards are available', async () => {
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    renderWithClient(<SavedCardsList />);
  
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /No Saved Payment Methods/i })).toBeInTheDocument();
      expect(screen.getByText(/You haven't saved any payment methods yet\. They will appear here after your first payment\./i, { selector: 'p' })).toBeInTheDocument();
    });
  });

  it('displays an error if fetching cards fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, () => {
        return HttpResponse.json({ message: 'Failed to fetch cards' }, { status: 500 });
      })
    );
    renderWithClient(<SavedCardsList />);
  
    await waitFor(() => {
      expect(screen.getByText('Failed to load saved payment methods.')).toBeInTheDocument();
      expect(screen.getByText('Please try again later.')).toBeInTheDocument();
    });
  
    expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
      message: expect.stringContaining('Failed to fetch cards'),
      type: 'error',
    });
  });

  it('handles setting a card as default', async () => {
    const initialCards: SavedCard[] = [
      { id: 'card1', last4: '1234', brand: 'visa', expMonth: 12, expYear: 2025, isDefault: true },
      { id: 'card2', last4: '5678', brand: 'mastercard', expMonth: 11, expYear: 2024, isDefault: false },
    ];
    const updatedCards: SavedCard[] = [
      { id: 'card1', last4: '1234', brand: 'visa', expMonth: 12, expYear: 2025, isDefault: false },
      { id: 'card2', last4: '5678', brand: 'mastercard', expMonth: 11, expYear: 2024, isDefault: true },
    ];
  
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, ({ request }) => {
        // This handler will respond differently based on if it's the initial fetch or refetch after setting default
        // The check for 'x-msw-initial-fetch' header is removed as this is complex for MSW in current scenario
        // Simple sequential response (first initialCards, then updatedCards) is not directly supported by MSW
        // So, we'll assume a successful update will lead to a specific refetch that gets updatedCards
        return HttpResponse.json(initialCards, { status: 200 });
      }),
      http.put(`${API_BASE_URL}/payments/saved-cards/card2/set-default`, () => {
        return HttpResponse.json({ message: 'Card set as default' }, { status: 200 });
      })
    );
  
    renderWithClient(<SavedCardsList />);
  
    await waitFor(() => {
      expect(screen.getByTestId('card-card1-default')).toBeInTheDocument();
      expect(screen.queryByTestId('card-card2-default')).not.toBeInTheDocument();
    });
  
    const setCard2DefaultButton = screen.getByTestId('set-default-card2');
  
    await act(async () => {
      fireEvent.click(setCard2DefaultButton);
    });
  
    expect(mockUseSuccessMessageStore().setMessage).toHaveBeenCalledWith('Card successfully set as default.');
  
    server.resetHandlers();
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, () => {
        return HttpResponse.json(updatedCards, { status: 200 });
      }),
      http.put(`${API_BASE_URL}/payments/saved-cards/card2/set-default`, () => {
        return HttpResponse.json({ message: 'Card set as default' }, { status: 200 });
      })
    );
    
    await waitFor(() => {
      expect(screen.queryByTestId('card-card1-default')).not.toBeInTheDocument();
      expect(screen.getByTestId('card-card2-default')).toBeInTheDocument();
    });
  });

  it('should display error message if setting default card fails', async () => {
    const initialCards: SavedCard[] = [
      { id: 'card1', last4: '1234', brand: 'visa', expMonth: 12, expYear: 2025, isDefault: true },
      { id: 'card2', last4: '5678', brand: 'mastercard', expMonth: 11, expYear: 2024, isDefault: false },
    ];
  
    server.use(
      http.get(`${API_BASE_URL}/payments/saved-cards`, () => {
        return HttpResponse.json(initialCards, { status: 200 });
      }),
      http.put(`${API_BASE_URL}/payments/saved-cards/card2/set-default`, () => {
        return HttpResponse.json({ message: 'Failed to set default card' }, { status: 500 });
      })
    );
  
    renderWithClient(<SavedCardsList />);
  
    await waitFor(() => {
      expect(screen.getByTestId('card-card1-default')).toBeInTheDocument();
    });
  
    const setCard2DefaultButton = screen.getByTestId('set-default-card2');
    fireEvent.click(setCard2DefaultButton);
  
    await waitFor(() => {
      expect(capturedGlobalErrorStoreState.setError).toHaveBeenCalledWith({
        message: expect.stringContaining('Failed to set'),
        type: 'error',
      });
    });
  
    // Ensure cards state remains unchanged
    expect(screen.getByTestId('card-card1-default')).toBeInTheDocument();
    expect(screen.queryByTestId('card-card2-default')).not.toBeInTheDocument();
  });
});
