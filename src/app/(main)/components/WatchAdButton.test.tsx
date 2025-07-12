import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WatchAdButton from './WatchAdButton';
import { useAuth } from '@/hooks/useAuth';
import { useBalanceStore } from '@/store/balanceStore';
import { useGlobalError } from '@/hooks/useGlobalError';
import { httpClient } from '@/lib/httpClient';
import { logger } from '@/lib/logger';
import { waitFor } from '@testing-library/react';

// Mock all external dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/store/balanceStore');
jest.mock('@/hooks/useGlobalError');
jest.mock('@/lib/httpClient');
jest.mock('@/lib/logger');

// Mock localStorage.getItem for jwtToken
const mockLocalStorageGetItem = jest.fn((key: string) => {
  if (key === 'jwtToken') {
    return 'mock-jwt-token';
  }
  return null;
});
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: mockLocalStorageGetItem,
    setItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Define the AD_DURATION_SECONDS which is used in the component
const AD_DURATION_SECONDS = 10;

describe('WatchAdButton', () => {
  const mockSetError = jest.fn();
  const mockUpdateBalance = jest.fn();
  const mockPost = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useBalanceStore as jest.Mock).mockReturnValue({ updateBalance: mockUpdateBalance });
    (useGlobalError as jest.Mock).mockReturnValue({ setError: mockSetError });
    (httpClient.post as jest.Mock) = mockPost;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
    jest.useRealTimers(); // Ensure real timers are restored after each test
  });

  test('renders correctly', () => {
    render(<WatchAdButton />);
    expect(screen.getByRole('button', { name: /watch ad/i })).toBeInTheDocument();
  });

  test('starts ad playback when authenticated and clicked', async () => {
    jest.useFakeTimers();
    render(<WatchAdButton />);
    const button = screen.getByRole('button', { name: /watch ad/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole('heading', { name: /ad playing\.\.\./i })).toBeInTheDocument();
    expect(screen.getByRole('paragraph', { name: /Please wait \d+ seconds\./i })).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    // Advance by 1 second to confirm countdown changes
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('paragraph', { name: /Please wait \d+ seconds\./i })).toBeInTheDocument();
    
    // Advance timers for the remaining duration to finish the ad
    await act(async () => {
      jest.advanceTimersByTime((AD_DURATION_SECONDS - 1) * 1000); // Remaining 9 seconds
      await Promise.resolve(); // Flush microtasks for the async post call
    });
    
    // After ad finishes, it should show "Ad Finished!"
    await waitFor(() => { // Added waitFor here for stability
      // Use getByRole('paragraph') for "Ad Finished!" as suggested by Testing Library (and it's a paragraph)
      expect(screen.getByRole('paragraph', { name: /Ad Finished!/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: /ad playing\.\.\./i })).not.toBeInTheDocument(); // The heading disappears, replaced by "Ad Finished!" state
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
        '/ads/credit',
        {},
        { headers: { Authorization: 'Bearer mock-jwt-token' } }
    );

    jest.useRealTimers();
  });

  test('shows error and does not start ad if not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    render(<WatchAdButton />);
    const button = screen.getByRole('button', { name: /watch ad/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockSetError).toHaveBeenCalledTimes(1);
    expect(mockSetError).toHaveBeenCalledWith({
      message: 'You must be logged in to watch ads.',
      type: 'warning',
    });
    expect(screen.queryByRole('heading', { name: /ad playing\.\.\./i })).not.toBeInTheDocument(); // Modal should not open
    expect(mockPost).not.toHaveBeenCalled();
  });

  test('displays success message and closes modal after successful ad credit', async () => {
    jest.useFakeTimers();
    mockPost.mockResolvedValue({ data: { newBalance: 150, creditedAmount: 50 } });

    render(<WatchAdButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /watch ad/i }));
    });

    // Ad countdown completes and API call is triggered
    await act(async () => {
      jest.advanceTimersByTime(AD_DURATION_SECONDS * 1000); // Complete ad duration
    });
    // Ensure promise resolution and subsequent state changes are flushed
    await act(async () => {
        await Promise.resolve();
    });
    
    // After ad finishes and API call succeeds, the success message should appear
    await waitFor(() => {
        expect(screen.getByText(/Congratulations! You earned \d+!/i)).toBeInTheDocument();
    }, { timeout: 15000 });
    expect(screen.queryByRole('paragraph', { name: /Ad Finished!/i })).not.toBeInTheDocument(); // Ad Finished message should be replaced
    expect(screen.queryByRole('heading', { name: /ad playing\.\.\./i })).not.toBeInTheDocument(); // Heading should be gone
    expect(mockUpdateBalance).toHaveBeenCalledWith(150);

    // After 3 seconds, the modal should close
    await act(async () => {
      jest.advanceTimersByTime(3000); // Advance for modal auto-close
    });

    expect(screen.queryByText(/Congratulations!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Please wait \d+ seconds\./i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /ad playing\.\.\./i })).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  test('displays error message and does not close modal immediately after failed ad credit', async () => {
    jest.useFakeTimers();
    mockPost.mockRejectedValue({ response: { data: { message: 'Ad credit failed!' } } });

    render(<WatchAdButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /watch ad/i }));
    });
    
    // Ad countdown completes and API call is triggered
    await act(async () => {
      jest.advanceTimersByTime(AD_DURATION_SECONDS * 1000); // Complete ad duration
      await Promise.resolve(); // Flush API promise resolution
    });

    // After ad finishes and API call fails, the error message should be set via useGlobalError
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockSetError).toHaveBeenCalledWith({
      message: 'Ad credit failed!',
      type: 'error',
    });
    
    // The "Ad Finished!" message should still be visible because the modal doesn't auto-close on error
    expect(screen.getByRole('paragraph', { name: 'Ad Finished!' })).toBeInTheDocument();
    // The heading "Ad Playing..." should also be gone, as the ad has finished
    expect(screen.queryByRole('heading', { name: /ad playing\.\.\./i })).not.toBeInTheDocument(); 
    expect(screen.queryByText(/Congratulations!/i)).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
