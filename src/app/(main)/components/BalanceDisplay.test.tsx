import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import BalanceDisplay from './BalanceDisplay';
import { useBalanceStore } from '@/store/balanceStore';
import { logger } from '@/lib/logger';
import { useUserProfileQuery } from '@/hooks/useUserProfileQuery'; // Explicitly import useUserProfileQuery

// Mock the logger module
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Define MSW handlers
const handlers = [
  http.get('/api/auth/me', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('scenario');

    if (scenario === 'error') {
      return HttpResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
    }

    if (scenario === 'no-balance') {
      return HttpResponse.json({ id: '1', username: 'testuser', email: 'test@example.com' }, { status: 200 });
    }

    // Default successful response
    return HttpResponse.json({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      balance: 123.45,
    }, { status: 200 });
  }),
];

const server = setupServer(...handlers);

describe('BalanceDisplay Integration', () => {
  let queryClient: QueryClient;

  const UserProfileFetcher: React.FC = () => {
    useUserProfileQuery(); // Use the imported hook directly
    return null;
  };
  
  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <UserProfileFetcher />
        {children}
      </QueryClientProvider>
    );
  };

  beforeAll(() => {
    server.listen();
    useBalanceStore.setState({ balance: 0 });
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });
    useBalanceStore.setState({ balance: 0 });
    server.resetHandlers();
    logger.error.mockClear(); 
  });

  afterEach(() => {
    queryClient.clear();
  });

  afterAll(() => {
    server.close();
  });

  it('should display the initial balance fetched from the API', async () => {
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json({
          id: '1', username: 'testuser', email: 'test@example.com', balance: 543.21
        });
      })
    );

    render(<BalanceDisplay />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('$543.21')).toBeInTheDocument();
    });
  });

  it('should display $0.00 if balance is not returned or is undefined', async () => {
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json({
          id: '1', username: 'testuser', email: 'test@example.com',
        });
      })
    );

    render(<BalanceDisplay />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  it('should update the displayed balance automatically when the store changes', async () => {
    act(() => {
      useBalanceStore.setState({ balance: 100.00 });
    });

    render(<BalanceDisplay />, { wrapper: TestWrapper });

    expect(screen.getByText('$100.00')).toBeInTheDocument();

    act(() => {
      useBalanceStore.getState().setBalance(250.75);
    });

    await waitFor(() => {
      expect(screen.getByText('$250.75')).toBeInTheDocument();
    });

    act(() => {
      useBalanceStore.getState().setBalance(260.75);
    });
    await waitFor(() => {
      expect(screen.getByText('$260.75')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully and log them', async () => {
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<BalanceDisplay />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching user profile:'),
        expect.any(Error)
      );
    }, { timeout: 7000 }); // Increase timeout to 7 seconds just in case
  });
});
