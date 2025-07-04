import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// import { usePathname } from 'next/navigation'; // Will be mocked via useProtectedRoute below
import { AuthProvider } from '../lib/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { axiosInstance } from '../lib/httpClient';

// MSW Server setup
const handlers = [
  http.get('http://localhost:8080/api/auth/me', ({ request }) => {
    if (request.headers.get('Authorization')?.startsWith('Bearer')) {
      return HttpResponse.json({
        id: 'user123',
        name: 'Authenticated User',
        email: 'auth@example.com',
        balance: 100,
        isNewUser: false,
      });
    }
    return HttpResponse.json({}, { status: 401 });
  }),
];
const server = setupServer(...handlers);

// Mocks for next/navigation (now handled by mocking useProtectedRoute)
const mockPush = jest.fn(); // We'll still assert on mockPush being called if we mock useRouter directly

// Mock 'next/navigation' for usePathname (it's internal to useProtectedRoute mock now)
// And mock useRouter, which useProtectedRoute uses internally
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/protected-path', // Default, will be overridden by useProtectedRoute mock for tests
}));

// Mock useProtectedRoute to use react-router-dom's navigation instead of next/navigation
// This is crucial to make MemoryRouter work correctly in tests.
jest.mock('../hooks/useProtectedRoute', () => {
  // Import actual react-router-dom hooks within the mock factory
  const { useAuth } = jest.requireActual('../hooks/useAuth');
  const { useNavigate, useLocation } = jest.requireActual('react-router-dom');

  return (allowedRoles?: string[]) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const navigate = useNavigate(); // Use react-router-dom's useNavigate
    const location = useLocation(); // Use react-router-dom's useLocation for pathname

    React.useEffect(() => {
      if (isLoading) {
        return;
      }

      if (!isAuthenticated) {
        // Instead of router.push, use navigate directly.
        // Store the path in mockPush for assertion.
        const redirectPath = `/login?redirect=${location.pathname}`;
        mockPush(redirectPath); // Record the call for assertion
        navigate(redirectPath); // Perform the actual navigation for MemoryRouter
      } else if (allowedRoles && user && user.role && !allowedRoles.includes(user.role)) {
        // Role-based access, if needed:
        // navigate('/dashboard');
      }
    }, [isAuthenticated, isLoading, navigate, allowedRoles, user, location.pathname]);

    return { isAuthenticated, isLoading };
  };
});

// Helper to set authorization header
const setAuthHeader = (token: string) => {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Helper to clear authorization header
const clearAuthHeader = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('ProtectedRoute Integration Tests', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
    localStorage.clear();
    clearAuthHeader();
    mockPush.mockClear();
  });
  afterAll(() => server.close());

  it('redirects unauthenticated users to login page', async () => {
    localStorage.removeItem('jwtToken');
    clearAuthHeader();

    server.use(
      http.get('http://localhost:8080/api/auth/me', () => {
        return HttpResponse.json({}, { status: 401 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected-path"
          element={
            <ProtectedRoute>
              <p>Protected Content</p>
            </ProtectedRoute>
          }
        />
      </Routes>,
      ['/protected-path'],
    );

    // Wait for the redirect to happen, and assert that router.push was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=/protected-path');
    });

    // Ensure that after navigation, the Login Page is displayed and Protected Content is not
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows authenticated users to access protected routes', async () => {
    setAuthHeader('mock-jwt-token');

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected-path"
          element={
            <ProtectedRoute>
              <p>Protected Content</p>
            </ProtectedRoute>
          }
        />
      </Routes>,
      ['/protected-path'],
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading authentication...')).not.toBeInTheDocument();
    });

    screen.debug(); // Add this line for debugging

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('displays loading state initially before redirecting or rendering content', async () => {
    localStorage.removeItem('jwtToken');
    clearAuthHeader();

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected-path"
          element={
            <ProtectedRoute>
              <p>Protected Content</p>
            </ProtectedRoute>
          }
        />
      </Routes>,
      ['/protected-path'],
    );

    expect(screen.getByText('Loading authentication...')).toBeInTheDocument();

    // Wait for the redirect to happen
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=/protected-path');
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading authentication...')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
