import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SavedCardsList } from './SavedCardsList';
import { paymentsService } from '@/services/paymentsService';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { SavedCard } from '@/types/payments';

// Mock the services and stores
jest.mock('@/services/paymentsService');
jest.mock('@/store/globalErrorStore');
jest.mock('@/store/successMessageStore');

const mockGetSavedCards = paymentsService.getSavedCards as jest.Mock;
const mockUseGlobalErrorStore = useGlobalErrorStore as jest.Mock;
const mockUseSuccessMessageStore = useSuccessMessageStore as jest.Mock;

const mockSetError = jest.fn();
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
      showConfirmation: mockShowConfirmation,
    });
    mockUseSuccessMessageStore.mockReturnValue({
      setMessage: mockSetSuccessMessage,
    });

    mockGetSavedCards.mockResolvedValue({ cards: mockCards });
  });

  it('renders loading state initially', () => {
    const promise = new Promise<any>(() => {}); // Never resolve to keep it in loading
    mockGetSavedCards.mockReturnValueOnce(promise);

    render(<SavedCardsList />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('renders saved cards after fetching', async () => {
    render(<SavedCardsList />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /Mastercard ending in 5252/i })).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('handles card deletion confirmation and visual removal', async () => {
    // Start with a mock that returns both cards
    mockGetSavedCards.mockResolvedValueOnce({ cards: [...mockCards] });
    render(<SavedCardsList />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Click delete for the first card (Visa)

    // Verify confirmation dialog is shown
    expect(mockShowConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Remove Saved Card',
        message: 'Are you sure you want to remove this card? This action cannot be undone.',
        confirmText: 'Remove Card',
        cancelText: 'Cancel',
      }),
    );

    // Prepare the mock for the delete operation
    const mockDeleteCard = paymentsService.deleteSavedCard as jest.Mock;
    mockDeleteCard.mockResolvedValueOnce({ message: 'Card deleted successfully!' });

    // Prepare what getSavedCards should return AFTER the delete and refetch
    mockGetSavedCards.mockResolvedValueOnce({
      cards: mockCards.filter((card) => card.id !== 'card_123'),
    });

    // Simulate confirmation
    const confirmCallback = mockShowConfirmation.mock.calls[0][0].onConfirm;
    await act(async () => {
      await confirmCallback(); // Await the async confirm callback
    });

    // Verify the delete service was called
    expect(mockDeleteCard).toHaveBeenCalledWith('card_123');
    // Verify success message from the actual service call
    expect(mockSetSuccessMessage).toHaveBeenCalledWith('Card deleted successfully!');

    // Verify visual removal of the card from the list (this will now re-fetch with a single card)
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /Visa ending in 4242/i }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /Mastercard ending in 5252/i })).toBeInTheDocument();
  });

  it('does not remove card if confirmation is cancelled', async () => {
    render(<SavedCardsList />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Click delete for the first card (Visa)

    expect(mockShowConfirmation).toHaveBeenCalledTimes(1);

    // Simulate cancellation
    const cancelCallback = mockShowConfirmation.mock.calls[0][0].onCancel;
    await act(async () => {
      cancelCallback();
    });

    // Verify card is still in the document
    expect(screen.getByRole('heading', { name: /Visa ending in 4242/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mastercard ending in 5252/i })).toBeInTheDocument();

    // No success message should be displayed for cancellation
    expect(mockSetSuccessMessage).not.toHaveBeenCalled();
  });

  it('renders empty state when no cards are available', async () => {
    mockGetSavedCards.mockResolvedValueOnce({ cards: [] });
    await act(async () => {
      render(<SavedCardsList />);
    });

    // Use findBy which handles waiting internally
    expect(await screen.findByRole('heading', { name: /No Saved Payment Methods/i })).toBeInTheDocument();
    const emptyStateParagraph = await screen.findByRole('paragraph');
    expect(emptyStateParagraph).toHaveTextContent(/You haven't saved any payment methods yet\. They will appear here after your first payment\./i);
  });

  it('displays an error if fetching cards fails', async () => {
    const errorMessage = 'Failed to fetch cards';
    mockGetSavedCards.mockRejectedValueOnce(new Error(errorMessage));
    await act(async () => {
      render(<SavedCardsList />);
    });

    // Using findBy for the UI elements
    expect(await screen.findByRole('heading', { name: /No Saved Payment Methods/i })).toBeInTheDocument();
    const emptyStateParagraph = await screen.findByRole('paragraph');
    expect(emptyStateParagraph).toHaveTextContent(/You haven't saved any payment methods yet\. They will appear here after your first payment\./i);
    
    // Keep the setError expectation separate
    expect(mockSetError).toHaveBeenCalledWith({
      message: expect.stringContaining(errorMessage),
      type: 'error',
    });
  });
});
