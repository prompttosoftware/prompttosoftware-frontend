import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SavedCardsList } from './SavedCardsList';
import { SavedCard } from '@/types/payments';

// Mock global stores to control their state in tests
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { useSavedCardsQuery } from '@/hooks/useSavedCardsQuery';
import { paymentsService } from '@/services/paymentsService';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

jest.mock('@/store/globalErrorStore');
jest.mock('@/store/successMessageStore');
jest.mock('@/hooks/useSavedCardsQuery');
jest.mock('@/services/paymentsService');
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

const mockUseGlobalErrorStore = useGlobalErrorStore as jest.MockedFunction<typeof useGlobalErrorStore>;
const mockUseSuccessMessageStore = useSuccessMessageStore as jest.MockedFunction<typeof useSuccessMessageStore>;
const mockUseSavedCardsQuery = useSavedCardsQuery as jest.MockedFunction<typeof useSavedCardsQuery>;
const mockPaymentsService = paymentsService as jest.Mocked<typeof paymentsService>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;

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

describe('SavedCardsList (Unit Test)', () => {
  let capturedGlobalErrorStoreState: {
    error: null,
    setError: jest.Mock,
    showConfirmation: jest.Mock,
    capturedOnConfirm?: () => void,
    capturedOnCancel?: () => void,
  };
  let mockSuccessMessageStoreState: any;
  let mockQueryClient: {
    getQueryData: jest.Mock,
    setQueryData: jest.Mock,
    invalidateQueries: jest.Mock,
    clear: jest.Mock,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  
    // Mock useSavedCardsQuery default
    mockUseSavedCardsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  
    // Mock QueryClient
    mockQueryClient = {
      getQueryData: jest.fn(),
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
      clear: jest.fn(), // If you need to clear the query client for some tests
    };
    mockUseQueryClient.mockReturnValue(mockQueryClient as any);
  
  
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
  
    // Mock paymentsService
    mockPaymentsService.deleteSavedCard.mockResolvedValue({ message: 'Card deleted successfully.' });
    mockPaymentsService.setSavedCardAsDefault.mockResolvedValue({ message: 'Card set as default.' });
  });

  

  it('renders loading state initially by showing skeleton loaders', () => {
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SavedCardsList />);
    // We expect the SkeletonLoader component to be rendered
    // Given SkeletonLoader is 'client' component so if its not rendered, its because test cant process it
    expect(screen.getByText('Loading...')).toBeInTheDocument(); // Assuming SkeletonLoader displays this
  });

  it('renders error state when fetching cards fails', async () => {
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true, // Simulate error state
      error: new Error('Failed to fetch cards'),
      refetch: jest.fn(),
    });
    render(<SavedCardsList />);
  
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
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: mockCards,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SavedCardsList />);
  
    await waitFor(() => {
      expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
      expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('handles successful card deletion with optimistic update', async () => {
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: mockCards,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    }).mockReturnValueOnce({ // Mock for the refetch after invalidation
      data: [mockCards[1]], // Only card_2 remains
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  
    render(<SavedCardsList />);
  
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
      expect.objectContaining({ onCancel: expect.any(Function) })
    );
    
    await act(async () => {
      capturedGlobalErrorStoreState.capturedOnConfirm!();
    });
  
    // Expect paymentsService.deleteSavedCard to be called
    expect(mockPaymentsService.deleteSavedCard).toHaveBeenCalledWith(cardToDelete.id);
  
    // Expect invalidateQueries to be called
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['savedCards'] });
  
    // Expect optimistic update: card should disappear immediately (based on the second mockReturnValueOnce)
    expect(screen.queryByText('Visa ending in 4242')).not.toBeInTheDocument(); // Optimistic update
    expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
    
    expect(mockUseSuccessMessageStore().setMessage).toHaveBeenCalledWith('Card deleted successfully!');
  
    // After deletion, wait for pending fetches (like refetch upon invalidateQueries) to resolve
    await waitFor(() => {
      expect(screen.queryByText('Visa ending in 4242')).not.toBeInTheDocument();
    });
  });
  
  it('does not delete card when confirmation is cancelled', async () => {
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: mockCards,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SavedCardsList />);
  
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
      expect.objectContaining({ onCancel: expect.any(Function) })
    );
    
    await act(async () => {
      capturedGlobalErrorStoreState.capturedOnCancel!();
    });
    
    // Expect card to still be in the document
    expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument();
    expect(screen.getByText('Mastercard ending in 1111')).toBeInTheDocument();
    
    // Ensure paymentsService.deleteSavedCard was NOT called
    expect(mockPaymentsService.deleteSavedCard).not.toHaveBeenCalled();
    
    expect(mockUseSuccessMessageStore().setMessage).not.toHaveBeenCalled();
  });

  it('renders empty state when no cards are available', async () => {
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<SavedCardsList />);
  
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /No Saved Payment Methods/i })).toBeInTheDocument();
      expect(screen.getByText(/You haven't saved any payment methods yet\. They will appear here after your first payment\./i, { selector: 'p' })).toBeInTheDocument();
    });
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
  
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: initialCards,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    }).mockReturnValueOnce({ // Mock for the refetch after invalidation
      data: updatedCards,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  
    render(<SavedCardsList />);
  
    await waitFor(() => {
      expect(screen.getByTestId('card-card1-default')).toBeInTheDocument();
      expect(screen.queryByTestId('card-card2-default')).not.toBeInTheDocument();
    });
  
    const setCard2DefaultButton = screen.getByTestId('set-default-card2');
  
    await act(async () => {
      fireEvent.click(setCard2DefaultButton);
    });
  
    // Expect paymentsService.setSavedCardAsDefault to be called
    expect(mockPaymentsService.setSavedCardAsDefault).toHaveBeenCalledWith('card2');
    
    // Expect invalidateQueries to be called
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['savedCards'] });
  
    expect(mockUseSuccessMessageStore().setMessage).toHaveBeenCalledWith('Card successfully set as default.');
    
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
  
    mockUseSavedCardsQuery.mockReturnValueOnce({
      data: initialCards,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    mockPaymentsService.setSavedCardAsDefault.mockRejectedValueOnce(new Error('Failed to set default card'));
  
    render(<SavedCardsList />);
  
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
