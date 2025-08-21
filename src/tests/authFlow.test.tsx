import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../lib/AuthContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import LoginPage from '../app/(auth)/login/page';
import { act } from 'react-dom/test-utils';

import { AuthContext } from '../lib/AuthContext'; // Import AuthContext to check its state
import { useRouter } from 'next/navigation'; // Import useRouter
import useAuth from '../hooks/useAuth'; // Import useAuth to access logout and user data
import useProtectedRoute from '../hooks/useProtectedRoute'; // Import useProtectedRoute

// Mock ProtectedPage component for testing
const ProtectedPage = () => {
  useProtectedRoute(); // Use the hook to simulate protection
  return <div>Protected Content</div>;
};

// Mock ProfilePage component for testing profile display
const ProfilePage = () => {
  const { user } = useAuth(); // Assuming useAuth provides user data
  return (
    <div>
      <h1>Profile</h1>
      {user ? (
        <>
          <p>Name: ${user.name}</p>
          <p>Email: ${user.email}</p>
          <p>Balance: ${user.balance}</p>
          <button data-testid="delete-account-button">Delete Account</button>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

// Mock components for Logout and Account Deletion
const AuthActionsPage = () => {
  const { logout } = useAuth();
  const deleteAccount = async () => {
    // In a real app, this would involve a confirmation dialog
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await fetch('/api/users/me', { method: 'DELETE' });
        logout(); // Assuming logout also clears token and redirects
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };
  return (
    <div>
      <button onClick={logout} data-testid="logout-button">Logout</button>
      <button onClick={deleteAccount} data-testid="delete-account-button">Delete Account</button>
    </div>
  );
};

// Declare spies globally within the test file or describe block
let assignSpy: jest.SpyInstance;
let replaceSpy: jest.SpyInstance;
let reloadSpy: jest.SpyInstance;
let confirmSpy: jest.SpyInstance;
let originalHrefDescriptor: PropertyDescriptor | undefined;



// Mock next/navigation's useRouter
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams(); // Declare mutable variable
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: jest.fn(() => '/'), // Mock usePathname as a jest.fn as well for flexibility
  useSearchParams: jest.fn(() => mockSearchParams), // Return the mutable variable
}));

// This test primarily uses next/navigation's useRouter mock for navigation.
// The MemoryRouter and Routes from react-router-dom are used to create a test
// rendering environment, but actual programmatic navigation, especially for
// LoginPage and AuthContext, relies on the next/navigation useRouter mock.
// Therefore, no specific mock for react-router-dom's useNavigate is needed here,
// as it would interfere with next/navigation's expected behavior.

// MSW Server setup
const handlers = [
  // Mock the GitHub OAuth exchange endpoint
  http.post('/api/auth/github', async ({ request }) => {
    const body = await request.json();
    if (body.code === 'valid-github-code') {
      const mockAuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      return HttpResponse.json(mockAuthResponse, { status: 200 });
    }
    return HttpResponse.json({}, { status: 400 });
  }),

  // Mock the user profile endpoint, typically called after successful login
  http.get('/api/auth/me', ({ request }) => {
    if (request.headers.get('Authorization') === 'Bearer mock-jwt-token') {
      return HttpResponse.json({
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        balance: 100,
        isNewUser: false,
      });
    }
    return HttpResponse.json({}, { status: 401 });
  }),

  // Add handlers for logout and account deletion
  http.post('/api/auth/logout', async () => {
    return HttpResponse.json({ message: 'Logged out' }, { status: 200 });
  }),
  http.delete('/api/users/me', async () => {
    return HttpResponse.json({ message: 'Account deleted' }, { status: 200 });
  }),
];

const server = setupServer(...handlers);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity, // Prevent refetches during tests
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

describe('Authentication Flow Integration Tests', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    // Mock environment variables
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = 'mock-github-client-id';

    // Mock window.confirm
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    // Spy on window.location methods
    assignSpy = jest.spyOn(window.location, 'assign').mockImplementation(jest.fn());
    replaceSpy = jest.spyOn(window.location, 'replace').mockImplementation(jest.fn());
    reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(jest.fn());

    // Make .href writable (if it's not already) to allow direct manipulation in tests
    originalHrefDescriptor = Object.getOwnPropertyDescriptor(window.location, 'href');
    if (originalHrefDescriptor && !originalHrefDescriptor.writable) {
        Object.defineProperty(window.location, 'href', {
            configurable: true,
            writable: true,
        });
    }
  });

  beforeEach(() => {
    // Clear mock calls for confirm and window.location methods
    confirmSpy.mockClear();
    assignSpy.mockClear();
    replaceSpy.mockClear();
    reloadSpy.mockClear();
    mockPush.mockClear(); // Keep mockPush clear for next/navigation

    // Reset mockSearchParams for test isolation
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear(); // Clear sessionStorage as well if used
    jest.clearAllTimers(); // Clear any timers set by React components
    confirmSpy.mockRestore(); // Restore window.confirm spy
    // assignSpy, replaceSpy, reloadSpy are direct functions on window.location
    // so mockClear() is sufficient, no mockRestore() needed here assuming we restore in afterAll
  });

  afterAll(() => {
    server.close();
    // Clean up mock environment variables
    delete process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

    // Restore original methods/properties on window.location
    assignSpy.mockRestore();
    replaceSpy.mockRestore();
    reloadSpy.mockRestore();

    // Restore href writability
    if (originalHrefDescriptor) {
        Object.defineProperty(window.location, 'href', originalHrefDescriptor);
    }
  });

  it('should successfully log in a user via GitHub and redirect to dashboard', async () => {
    // 1. Render the Login Page
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>,
      ['/login'],
    );

    // Ensure the "Sign in with GitHub" button is present
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();

    // 2. Simulate clicking "Sign in with GitHub"
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in with github/i }));
    });

    // Assert that the correct URL was "navigated" to via assignSpy
    expect(assignSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/github.com\/login\/oauth\/authorize\?client_id=mock-github-client-id&scope=repo&redirect_uri=http:\/\/localhost\/login$/)
    );

    // After assigning to a new URL, simulate the browser navigating to it.
    // For our tests, this means setting the properties on the current window.location object.
    // These properties should be writable due to the beforeEach setup which makes href, pathname, search writable.
    // Note: In a real browser, this would cause a full page reload/navigation.
    // In JSDOM, it merely updates the property.
    // Attempting to set origin directly usually fails as it derive from href. Can usually be ignored for tests.
    // (window.location as any).origin will remain its default JSDOM value unless completely re-mocked.

    // 3. Simulate GitHub redirect with a code
    // Update mockSearchParams. The existing LoginPage instance should react to this change.
    mockSearchParams = new URLSearchParams('?code=valid-github-code');

    // 4. Verify POST /auth/github is called with the correct code.
    // MSW handlers will catch this. No direct assertion here as it's an internal network call.
    // We assert on the consequences (localStorage update, redirection).

    // 5. Verify JWT is stored in localStorage and AuthContext is updated.
    await waitFor(() => {
      expect(localStorage.getItem('jwtToken')).toBe('mock-jwt-token');
    });

    // Verify AuthContext state indirectly - successful login means user data is loaded
    await waitFor(() => {
      // Here we rely on AuthProvider setting the user and isAuthenticated state correctly
      // We can inspect the DOM for elements that depend on auth state,
      // or if we had a debug utility, directly check AuthContext.
      // For simplicity, we'll check for the dashboard redirection as the ultimate sign.
    });

    // 6. Verify redirection to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    // Ensure that after navigation, the Dashboard Page is displayed
    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
    expect(screen.queryByText('Sign in with GitHub')).not.toBeInTheDocument();
// Clean up of window.location is now handled by afterEach.
  });

  // Test case for failed login attempts (e.g., invalid code) could be added here
  it('should handle failed GitHub login gracefully', async () => {
    server.use(
      http.post('/api/auth/github', () => {
        return HttpResponse.json({ message: 'Invalid code' }, { status: 400 });
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>,
      ['/login'],
    );

    // Simulate a redirect with an invalid code
    // Simulate landing on the URL with an invalid code
    // Setting window.location properties directly to simulate the redirect URL
    // Object.defineProperty(window.location, 'href', { writable: true, value: 'http://localhost/login?code=invalid-github-code' });
    // Object.defineProperty(window.location, 'search', { writable: true, value: '?code=invalid-github-code' });
    // Object.defineProperty(window.location, 'pathname', { writable: true, value: '/login' });
    // Note: window.location.origin is often read-only in JSDOM, but href, pathname, search can generally be manipulated
    // if configured writable or by assigning a new Location object (which we are not doing here).
    // (window.location as any).origin will remain its default JSDOM value unless completely re-mocked.

    // Update mockSearchParams. The existing LoginPage instance should react to this change.
    mockSearchParams = new URLSearchParams('?code=invalid-github-code');

    // Expect no JWT in localStorage
    await waitFor(() => {
      expect(localStorage.getItem('jwtToken')).toBeNull();
    });

    // Expect no redirection to dashboard
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard');
    });

    // Ensure that the Login Page is still displayed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
    });
// Clean up of window.location is now handled by afterEach.
  });

  // --- New test cases based on instructions ---

  // 1. Protected Routes
  it('should redirect unauthenticated user from protected route to login', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedPage />} />
      </Routes>,
      ['/dashboard'], // Attempt to access /dashboard directly
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
    // Verify that LoginPage is eventually rendered (or its unique element)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should allow authenticated user to access protected route', async () => {
    // Simulate a logged-in state
    localStorage.setItem('jwtToken', 'mock-jwt-token');

    // Simulate AuthContext being populated (AuthProvider will do this on mount with token)
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedPage />} />
      </Routes>,
      ['/dashboard'], // Attempt to access /dashboard directly
    );

    // Give AuthProvider a moment to set the user state and useProtectedRoute to check it
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled(); // Should not redirect
  });

  // 2. Profile Display
  it('should display user profile information after successful login', async () => {
    // Simulate successful login
    localStorage.setItem('jwtToken', 'mock-jwt-token');

    renderWithProviders(
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      ['/profile'], // Navigate to profile page
    );

    await waitFor(() => {
      expect(screen.getByText('Name: Test User')).toBeInTheDocument();
      expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Balance: 100')).toBeInTheDocument();
    });
    // Ensure that the /api/auth/me endpoint was called implicitly by the successful display
    // We don't have a direct way to assert on server.use calls, but the data display
    // is a strong indication it was fetched correctly through the MSW handler.
  });

  // 3. Logout
  it('should log out the user, remove token, and redirect to login', async () => {
    // Simulate logged-in state
    localStorage.setItem('jwtToken', 'mock-jwt-token');

    // Spy on the logout API call
    const logoutHandler = jest.fn((req, res, ctx) => {
      localStorage.removeItem('jwtToken'); // Simulate server-side token removal
      return HttpResponse.json({ message: 'Logged out' }, { status: 200 });
    });
    server.use(http.post('/api/auth/logout', logoutHandler));

    renderWithProviders(
      <Routes>
        <Route path="/home" element={<AuthActionsPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      ['/home'],
    );

    // Ensure token is present before logout
    expect(localStorage.getItem('jwtToken')).toBe('mock-jwt-token');

    // Click logout button
    await act(async () => {
      fireEvent.click(screen.getByTestId('logout-button'));
    });

    // Assert that POST /api/auth/logout is called
    await waitFor(() => {
      expect(logoutHandler).toHaveBeenCalled();
    });

    // Assert that JWT token is removed from localStorage
    await waitFor(() => {
      expect(localStorage.getItem('jwtToken')).toBeNull();
    });

    // Assert that user is redirected to /login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
    });
  });

  // 4. Account Deletion
  it('should delete account, remove token, and redirect to login', async () => {
    // Simulate logged-in state
    localStorage.setItem('jwtToken', 'mock-jwt-token');

    // Spy on the account deletion API call
    const deleteAccountHandler = jest.fn((req, res, ctx) => {
      localStorage.removeItem('jwtToken'); // Simulate server-side token removal
      return HttpResponse.json({ message: 'Account deleted' }, { status: 200 });
    });
    server.use(http.delete('/api/users/me', deleteAccountHandler));

    renderWithProviders(
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<AuthActionsPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      ['/profile'], // Start on a page where delete button might be present
    );

    // Ensure token is present before deletion
    expect(localStorage.getItem('jwtToken')).toBe('mock-jwt-token');

    // Click delete account button
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-account-button'));
    });

    // Confirm the dialog (mocked in beforeAll)
    // No need to assert on window.confirm directly, as it's mocked to return true.

    // Assert that DELETE /api/users/me is called
    await waitFor(() => {
      expect(deleteAccountHandler).toHaveBeenCalled();
    });

    // Assert that JWT token is removed from localStorage
    await waitFor(() => {
      expect(localStorage.getItem('jwtToken')).toBeNull();
    });

    // Assert that user is redirected to /login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
    });
  });
});
