import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ActiveProjectsSummary from './ActiveProjectsSummary';
import { useActiveProjects } from '@/hooks/useActiveProjects';
import { useGlobalErrorStore } from '@/store/globalErrorStore';

// Mock the hooks
jest.mock('@/hooks/useActiveProjects');
jest.mock('@/store/globalErrorStore');

// Create a QueryClient instance for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('ActiveProjectsSummary', () => {
  const mockUseActiveProjects = useActiveProjects as jest.Mock;
  const mockSetError = jest.fn();
  (useGlobalErrorStore as jest.Mock).mockReturnValue({ setError: mockSetError });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset query client cache before each test
    queryClient.clear();
    mockUseActiveProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('renders SkeletonLoader when loading', () => {
    mockUseActiveProjects.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    render(<ActiveProjectsSummary />, { wrapper: AllTheProviders });
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('renders EmptyState when no active projects are found', () => {
    mockUseActiveProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    render(<ActiveProjectsSummary />, { wrapper: AllTheProviders });
    expect(screen.getByRole('heading', { name: /no active projects/i })).toBeInTheDocument();
    expect(screen.getByRole('paragraph')).toHaveTextContent(/You have no active projects\. Start a new one to see it here!/i);
    expect(screen.getByRole('button', { name: /start a new project/i })).toBeInTheDocument();
  });

  it('renders ProjectSummaryCard for each active project', () => {
    const activeProjects = [
      {
        id: '1',
        name: 'Project Alpha',
        description: 'Description Alpha',
        status: 'active',
        repositoryUrl: 'http://github.com/alpha',
        costToDate: 100,
        totalRuntime: 3600,
        progress: 50
      },
      {
        id: '2',
        name: 'Project Beta',
        description: 'Description Beta',
        status: 'active',
        repositoryUrl: 'http://github.com/beta',
        costToDate: 200,
        totalRuntime: 7200,
        progress: 80
      },
    ];
    mockUseActiveProjects.mockReturnValue({
      data: activeProjects,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ActiveProjectsSummary />, { wrapper: AllTheProviders });

    expect(screen.getByRole('link', { name: /project alpha/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /project beta/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('project-summary-card')).toHaveLength(2);
  });

  it('displays error message and calls global error store on API error', async () => {
    const errorMessage = 'Network error fetching projects';
    mockUseActiveProjects.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error(errorMessage),
    });

    render(<ActiveProjectsSummary />, { wrapper: AllTheProviders });

    // Check if error message is displayed
    await waitFor(() => {
  expect(screen.getByRole('paragraph')).toHaveTextContent(/An error occurred while loading projects\. Please try again later/i);
});

    // Check if setError from globalErrorStore was called correctly
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith({
        message: 'Failed to load active projects.',
        description: errorMessage,
      });
    });
  });
});
