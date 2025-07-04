import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SavedCardsList } from './SavedCardsList';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { SavedCard } from '@/types/payments';
import httpClient from '@/lib/httpClient';
import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient(); // No defaultOptions needed for basic mocking

import httpClient from '@/lib/httpClient'; // Ensure httpClient is imported for type inference if needed, but not used directly for spying

jest.mock('@/store/globalErrorStore');
jest.mock('@/store/successMessageStore');
jest.mock('@/hooks/useAuth');

// Define mock functions BEFORE the jest.mock call
const mockGet = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/httpClient', () => ({
  __esModule: true, // This is important for default exports
  default: {
    get: mockGet,
    delete: mockDelete,
  },
}));

const mockUseGlobalErrorStore = useGlobalErrorStore as jest.Mock;
const mockUseSuccessMessageStore = useSuccessMessageStore as jest.Mock;

const mockSetError = jest.fn();
const mockShowError = jest.fn();
const mockShowConfirmation = jest.fn();
const mockSetSuccessMessage = jest.fn();

const mockCards: SavedCard[] = [
  {
    id: 'card_123',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: 'card_456',
    brand: 'mastercard',
    last4: '5252',
    expiryMonth: 1,
    expiryYear: 2024,
    isDefault: false,
  },
];

describe('SavedCardsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  
    mockUseGlobalErrorStore.mockReturnValue({
      setError: mockSetError,
      showError: mockShowError,
      showConfirmation: mockShowConfirmation,
    });
    mockUseSuccessMessageStore.mockReturnValue({
      setMessage: mockSetSuccessMessage,
    });
    (useAuth as jest.Mock).mockReturnValue({ token: 'dummy-token' });
  
    // Default mock for httpClient.get
    mockGet.mockResolvedValue({ data: mockCards });
  });

  afterEach(() => {
    // Clear the query client cache after each test to prevent data leakage
    queryClient.clear();
  });

  it('renders loading state initially', () => {
    // Mock httpClient.get to simulate loading state
    mockGet.mockReturnValue(new Promise(() => {})); // A promise that never resolves
  
    render(
      <QueryClientProvider client={queryClient}>
        <SavedCardsList />
      </QueryClientProvider>
    );
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('renders saved cards after fetching', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SavedCardsList />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mastercard ending in 5252/i })).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('handles card deletion confirmation and visual removal', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SavedCardsList />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Click on the first card's delete button (Visa)

    expect(mockShowConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Remove Saved Card',
        message: 'Are you sure you want to remove this card? This action cannot be undone.',
        confirmText: 'Remove Card',
        cancelText: 'Cancel',
      }),
    );

    // Mock httpClient.delete for this test specifically
    mockDelete.mockResolvedValueOnce({}); // Simulate successful deletion
    
    const confirmCallback = mockShowConfirmation.mock.calls[0][0].onConfirm;
    
    await act(async () => {
      await confirmCallback();
    });
    
    expect(mockDelete).toHaveBeenCalledWith('/payments/cards/card_123');
    expect(mockSetSuccessMessage).toHaveBeenCalledWith('Card deleted successfully!');
    
    // After deletion, mock httpClient.get to return the updated list for the refetch
    mockGet.mockResolvedValueOnce({ data: mockCards.filter((card) => card.id !== 'card_123') });


    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /Visa ending in 4242/i }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /Mastercard ending in 5252/i })).toBeInTheDocument();
  });

  it('does not remove card if confirmation is cancelled', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SavedCardsList />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockShowConfirmation).toHaveBeenCalledTimes(1);

    const cancelCallback = mockShowConfirmation.mock.calls[0][0].onCancel;
    await act(async () => {
      cancelCallback();
    });

    expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mastercard ending in 5252/i })).toBeInTheDocument();
    expect(mockSetSuccessMessage).not.toHaveBeenCalled();
  });

  it('renders empty state when no cards are available', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    render(
      <QueryClientProvider client={queryClient}>
        <SavedCardsList />
      </QueryClientProvider>
    );
  
    expect(await screen.findByRole('heading', { name: /No Saved Payment Methods/i })).toBeInTheDocument();
    expect(await screen.findByText(/You haven't saved any payment methods yet\. They will appear here after your first payment\./i, { selector: 'p' })).toBeInTheDocument();
  });

  it('displays an error if fetching cards fails', async () => {
    const errorMessage = 'Failed to fetch cards';
    mockGet.mockRejectedValueOnce(new Error(errorMessage));
    render(
      <QueryClientProvider client={queryClient}>
        <SavedCardsList />
      </QueryClientProvider>
    );
  
    expect(screen.getByText('Failed to load saved payment methods.', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Please try again later.', { selector: 'p' })).toBeInTheDocument();
  
    expect(mockShowError).toHaveBeenCalledWith({
      message: expect.stringContaining(errorMessage),
      type: 'error',
    });
  });
});
