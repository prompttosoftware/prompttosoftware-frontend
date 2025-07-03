import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfileQuery } from './useUserProfileQuery';
import { fetchUserProfile } from '@/lib/api';
import { useBalanceStore } from '@/store/balanceStore';
import axios from 'axios';

// Mock the fetchUserProfile function
jest.mock('@/lib/api', () => ({
  fetchUserProfile: jest.fn(),
}));

// Mock the balance store's setBalance action
jest.mock('@/store/balanceStore', () => ({
  useBalanceStore: jest.fn(),
}));


describe('useUserProfileQuery', () => {
  let queryClient: QueryClient;
  let mockSetBalance: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for testing
        },
      },
    });
    mockSetBalance = jest.fn();
    (useBalanceStore as jest.Mock).mockReturnValue({ setBalance: mockSetBalance });
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('should return loading state initially and then user data on success', async () => {
    const mockUserProfile = { id: '1', username: 'testuser', email: 'test@example.com', balance: 100 };
    (fetchUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);

    const { result } = renderHook(() => useUserProfileQuery(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isError).toBe(false);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual(mockUserProfile);
    expect(result.current.isError).toBe(false);
    expect(mockSetBalance).toHaveBeenCalledWith(100);
  });

  it('should return error state on fetch failure', async () => {
    const mockError = new Error('Network error');
    (fetchUserProfile as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUserProfileQuery(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeUndefined();
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(mockError);
    expect(mockSetBalance).not.toHaveBeenCalled(); // Balance should not be set on error
  });

  it('should invalidate queries on 401 error', async () => {
    const mockAxiosError = axios.create();
    const unauthorizedError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    });
    (fetchUserProfile as jest.Mock).mockRejectedValue(unauthorizedError);

    // Spy on queryClient.invalidateQueries
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUserProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(unauthorizedError);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['auth', 'me'] });
  });

  it('should not invalidate queries on non-401 error', async () => {
    const mockGenericError = new Error('Something went wrong');
    (fetchUserProfile as jest.Mock).mockRejectedValue(mockGenericError);

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUserProfileQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockGenericError);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
