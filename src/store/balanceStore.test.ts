import { act } from '@testing-library/react'; // Import act for state updates that trigger re-renders
import { useBalanceStore } from './balanceStore'; // Make sure this path is correct
import { httpClient } from '@/lib/httpClient'; // Import httpClient for mocking

// Mock the httpClient to control API responses
jest.mock('@/lib/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

const mockGet = httpClient.get as jest.Mock;

describe('useBalanceStore', () => {
  // Clear `localStorage` before all tests
  beforeAll(() => {
    localStorage.clear();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  // Reset store and mocks before each test
  beforeEach(() => {
    useBalanceStore.setState({ balance: 0, lastFetched: null }); // Reset to initial state
    mockGet.mockClear();
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
    (localStorage.clear as jest.Mock).mockClear();
  });

  it('should initialize with a balance of 0 and lastFetched as null', () => {
    const { balance, lastFetched } = useBalanceStore.getState();
    expect(balance).toBe(0);
    expect(lastFetched).toBeNull();
  });

  it('should update the balance using setBalance', () => {
    const { setBalance } = useBalanceStore.getState();
    act(() => {
      setBalance(100);
    });
    const { balance } = useBalanceStore.getState();
    expect(balance).toBe(100);
  });

  it('should handle negative balance values with setBalance', () => {
    const { setBalance } = useBalanceStore.getState();
    act(() => {
      setBalance(-25);
    });
    const { balance } = useBalanceStore.getState();
    expect(balance).toBe(-25);
  });

  it('should update balance multiple times correctly with setBalance', () => {
    const { setBalance } = useBalanceStore.getState();
    act(() => {
      setBalance(100);
    });
    expect(useBalanceStore.getState().balance).toBe(100);

    act(() => {
      setBalance(150);
    });
    expect(useBalanceStore.getState().balance).toBe(150);

    act(() => {
      setBalance(75);
    });
    expect(useBalanceStore.getState().balance).toBe(75);
  });

  it('fetchBalance should update the store balance on success', async () => {
    const mockUserProfile = { user: { balance: 999.99 } };
    mockGet.mockResolvedValueOnce({ data: mockUserProfile });

    const { fetchBalance } = useBalanceStore.getState();

    await act(async () => {
      await fetchBalance();
    });

    const { balance, lastFetched } = useBalanceStore.getState();
    expect(balance).toBe(999.99);
    expect(lastFetched).toBeCloseTo(Date.now(), -100); // Check timestamp is recent
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
  });

  it('fetchBalance should set balance to 0 and lastFetched to null on API error', async () => {
    mockGet.mockRejectedValueOnce(new Error('API failed'));

    const { fetchBalance } = useBalanceStore.getState();

    await act(async () => {
      await fetchBalance();
    });

    const { balance, lastFetched } = useBalanceStore.getState();
    expect(balance).toBe(0);
    expect(lastFetched).toBeNull();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
  });

  it('fetchBalance should set balance to 0 and lastFetched to null if user balance is invalid', async () => {
    const mockUserProfile = { user: { balance: 'invalid_balance' } }; // Invalid balance type
    mockGet.mockResolvedValueOnce({ data: mockUserProfile });

    const { fetchBalance } = useBalanceStore.getState();

    await act(async () => {
      await fetchBalance();
    });

    const { balance, lastFetched } = useBalanceStore.getState();
    expect(balance).toBe(0);
    expect(lastFetched).toBeNull();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
  });

  it('fetchBalance should set balance to 0 and lastFetched to null if user profile is missing', async () => {
    const mockUserProfile = { user: null }; // Missing user
    mockGet.mockResolvedValueOnce({ data: mockUserProfile });

    const { fetchBalance } = useBalanceStore.getState();

    await act(async () => {
      await fetchBalance();
    });

    const { balance, lastFetched } = useBalanceStore.getState();
    expect(balance).toBe(0);
    expect(lastFetched).toBeNull();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
  });

  it('updateBalance should correctly increase the balance', () => {
    act(() => {
      useBalanceStore.getState().setBalance(100);
    });
    act(() => {
      useBalanceStore.getState().updateBalance(50);
    });
    expect(useBalanceStore.getState().balance).toBe(150);
  });

  it('updateBalance should correctly decrease the balance with a negative amount', () => {
    act(() => {
      useBalanceStore.getState().setBalance(100);
    });
    act(() => {
      useBalanceStore.getState().updateBalance(-30);
    });
    expect(useBalanceStore.getState().balance).toBe(70);
  });

  it('clearBalance should reset the balance to 0 and lastFetched to null', () => {
    act(() => {
      useBalanceStore.getState().setBalance(500);
      useBalanceStore.setState({ lastFetched: Date.now() });
    });
    act(() => {
      useBalanceStore.getState().clearBalance();
    });
    expect(useBalanceStore.getState().balance).toBe(0);
    expect(useBalanceStore.getState().lastFetched).toBeNull();
  });

  // Test persistence
  it('should persist the state to localStorage', () => {
    // Simulate initial load where persist reads from storage
    (localStorage.getItem as jest.Mock).mockReturnValueOnce(
      JSON.stringify({ state: { balance: 777, lastFetched: 12345 }, version: 0 })
    );

    // Re-initialize the store to trigger persistence loading
    const { balance, lastFetched } = useBalanceStore.getState();
    expect(balance).toBe(777);
    expect(lastFetched).toBe(12345);

    // Change state and verify setItem is called
    act(() => {
      useBalanceStore.getState().setBalance(888);
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'balance-storage',
      expect.stringContaining('"balance":888')
    );
  });
});
