import React from 'react';
import { render, screen, cleanup, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainLayout from './layout';
import { AuthContext } from '@/lib/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { tutorialSteps } from '@/lib/tutorialSteps';

// Mock necessary modules and contexts
jest.mock('@/lib/AuthContext', () => ({
  AuthContext: {
    Consumer: ({ children }: any) => children({
      isAuthenticated: true,
      user: { isNewUser: false }, // Default to existing user
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      showTutorial: false, // Default to not showing tutorial
      setShowTutorial: jest.fn(),
    }),
    Provider: ({ children, value }: any) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    ),
  },
}));

jest.mock('@/store/paymentModalStore', () => ({
  usePaymentModalStore: jest.fn(() => ({
    openModal: jest.fn(),
  })),
}));

// Mock useUserProfileQuery as it's used within AuthProvider
jest.mock('@/hooks/useUserProfileQuery', () => ({
  useUserProfileQuery: jest.fn(() => ({
    user: { id: '123', email: 'test@example.com', name: 'Test User', isNewUser: false },
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(() => Promise.resolve()),
  },
  setupInterceptors: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

const queryClient = new QueryClient();

describe('MainLayout - Tutorial Integration', () => {
  const TUTORIAL_COMPLETED_KEY = 'prompt2code_tutorial_completed';
  let mockSetShowTutorial: jest.Mock;
  let mockAuthContextValue: any;

  beforeEach(() => {
    localStorage.clear(); // Clear local storage before each test
    jest.clearAllMocks();

    // Reset mockAuthContextValue for each test
    mockSetShowTutorial = jest.fn();
    mockAuthContextValue = {
      isAuthenticated: true,
      user: { isNewUser: false }, // Assume existing user by default
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      showTutorial: false, // Initial state set by the test itself
      setShowTutorial: mockSetShowTutorial,
    };

    // Ensure AuthContext.Provider uses the dynamically set value
    (AuthContext.Provider as jest.Mock) = jest.fn(({ children, value }) => {
      mockAuthContextValue = value; // Capture the value passed to the provider
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    });
  });

  afterEach(() => {
    cleanup();
  });

  // Helper function to render MainLayout with a specific AuthContext value
  const renderMainLayout = (authContextProps?: Partial<typeof mockAuthContextValue>) => {
    const value = { ...mockAuthContextValue, ...authContextProps };
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={value}> {/* Use the dynamically created value */}
          <MainLayout>
            <div>Test Children Content</div>
          </MainLayout>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  // test('should not show tutorial if localStorage flag is present', () => {
  //   localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
  
  //   // Mimic AuthContext's useEffect behavior for already completed tutorial
  //   renderMainLayout({ showTutorial: false });
  
  //   expect(screen.queryByText(tutorialSteps[0].title)).not.toBeInTheDocument();
  //   expect(screen.queryByRole('heading', { name: /Welcome to Prompt2Code!/i })).not.toBeInTheDocument();
  // });

  // test('should show tutorial if localStorage flag is absent and user is authenticated and not loading', async () => {
  //   localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
  
  //   // Explicitly set showTutorial to true in context for this test case
  //   renderMainLayout({ showTutorial: true });
  
  //   // Wait for the tutorial overlay to appear
  //   await waitFor(() => {
  //     expect(screen.getByRole('heading', { name: tutorialSteps[0].title })).toBeInTheDocument();
  //     expect(screen.getByText(tutorialSteps[0].description)).toBeInTheDocument();
  //   });
  // });

  test('should interact with tutorial and update localStorage on completion', async () => {
    localStorage.removeItem(TUTORIAL_COMPLETED_KEY); // Ensure tutorial shows

    // Explicitly set showTutorial to true to simulate initial state before user interaction
    const { rerender, container } = renderMainLayout({ showTutorial: true });
    screen.debug(container); // Debug right after initial render

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: tutorialSteps[0].title })).toBeInTheDocument();
    });

    // Simulate advancing through all steps
    // Need to simulate prop change that would happen inside AuthContext based on internal logic.
    // For this test, we are assuming AuthContext's internal logic correctly sets show tutorial
    // which we've mocked as `true` initially. Now we need to test interactions *within* the overlay.
    // The `handleTutorialComplete` in layout.tsx is what we want to trace.

    // Mock the internal component state changes for TutorialOverlay
    const mockOpenPaymentModal = jest.fn();
    (usePaymentModalStore as jest.Mock).mockReturnValue({ openModal: mockOpenPaymentModal });

    // Advance through all regular steps (total steps - 1 'welcome' + 1 for GitHub prompt)
    // This part is tricky because the TutorialOverlay's state management is internal.
    // We need to re-render the Layout *without* the tutorial once handleTutorialComplete is called.
    // We'll simulate the user completing the tutorial *directly* by finding the last button.

    // Let's make an assertion that the tutorial is initially visible
    expect(screen.getByRole('heading', { name: tutorialSteps[0].title })).toBeInTheDocument();

    // Simulate advancing through all steps to the final prompt ("Add funds" button)
    // This is a simplified simulation by directly advancing to the last step UI,
    // as internal TutorialOverlay state changes are not directly exposed to MainLayout.
    // A more robust E2E test would click "Next" repeatedly. For integration, we focus on the final action.

    // We need to mock the internal behavior of TutorialOverlay
    // The current setup makes it hard to directly interact with internal TutorialOverlay steps
    // from the MainLayout test. This indicates a potential gap for truly end-to-end integration
    // or that the AuthContext mock itself should be more dynamic to control `showTutorial`
    // based on simulated `isNewUser` or `localStorage` changes.

    // For this integration test, let's focus on the `handleTutorialComplete` logic in MainLayout
    // being triggered and updating `localStorage`. We can abstract the "completion" of the tutorial
    // by directly invoking the `onTutorialComplete` prop from `TutorialOverlay`.
    // Though that's more of a unit test for MainLayout's handleTutorialComplete.

    // To truly test integration of TutorialOverlay's completion action with MainLayout/AuthContext:
    // We need to trigger the action that calls `handleTutorialComplete`.
    // This happens when the "Add funds" or "Skip for now" button is clicked after the tutorial.

    // Re-rendering with `showTutorial: true` to get the initial state
    // This setup is for verifying the *initial display* and *final completion state*.
    // Simulating step-by-step UI interaction within the TutorialOverlay from this test
    // would be a strong E2E test, but for *integration*, we care that the tutorial
    // *can* be displayed and *can* trigger the completion logic.

    // Let's refine the test to simulate the tutorial being completed.
    // Since TutorialOverlay.test.tsx covers the step-by-step, here we verify the end state.

    // Simulate completing the tutorial by finding the Add funds button that appears at the end
    // We need to advance the tutorial to the "Add funds" step.
    // This implicitely assumes TutorialOverlay rendered and processed steps as designed.
    // This verifies MainLayout's `handleTutorialComplete` callback and its effect on `localStorage`.

    // To reliably reach the "Add funds" button in an integration test, we need `fireEvent.click`
    // on the 'Next' button repeatedly until it's gone or the final "Add funds" button appears.
    // This is an integration test now.

    // Step 1: Verify tutorial is visible
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: tutorialSteps[0].title })).toBeInTheDocument();
    });

    // Step 2-N: Click 'Next' button until it's no longer present or we reach the GitHub prompt
    let nextButtonFound = true;
    // UNCOMMENTED: Debug before the loop shows initial state
    screen.debug(container);
    while (nextButtonFound) {
      try {
        await waitFor(() => {
          const nextButton = screen.getByRole('button', { name: /Next|Continue/i });
          fireEvent.click(nextButton);
        }, { timeout: 5000 }); // Increased timeout
      } catch (error) {
        nextButtonFound = false; // Button not found, exit loop
        // UNCOMMENTED: Debug at the point where 'Next' button is not found
        screen.debug(container);
      }
    }
    
    // Handle GitHub prompt if it appears (after 'Next' buttons are gone)
    if (screen.queryByText(/Are you familiar with GitHub?/i)) {
      await waitFor(() => {
        const noButton = screen.getByRole('button', { name: /No/i });
        fireEvent.click(noButton);
      }, { timeout: 5000 }); // Increased timeout for GitHub prompt
    }

    // Final step: Click "Add funds" button
    await waitFor(() => {
      const addFundsButton = screen.getByRole('button', { name: /Add funds|Skip for now/i });
      expect(addFundsButton).toBeInTheDocument();
      fireEvent.click(addFundsButton);
    }, { timeout: 5000 }); // Increased timeout for final button

    // Expect that setShowTutorial was called with false
    await waitFor(() => {
      expect(mockSetShowTutorial).toHaveBeenCalledWith(false);
    });

    // Expect localStorage to be updated
    expect(localStorage.getItem(TUTORIAL_COMPLETED_KEY)).toBe('true');

    // Expect tutorial to be removed from the document
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: tutorialSteps[0].title })).not.toBeInTheDocument();
    });
  });

  // Test case: Tutorial does not show if user is authenticated but not new and tutorial is completed
  /*
  test('should not show tutorial if user is existing (not new) and tutorial is completed', () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true'); // Simulate completed tutorial
    // Mock useUserProfileQuery to return an existing user
    (useUserProfileQuery as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'test@example.com', name: 'Test User', isNewUser: false },
      isLoading: false,
      isError: false,
      error: null,
    });
  
    // Simulate AuthContext's useEffect setting showTutorial to false
    renderMainLayout({ showTutorial: false, user: { isNewUser: false } });
  
    expect(screen.queryByRole('heading', { name: /Welcome to Prompt2Code!/i })).not.toBeInTheDocument();
    expect(screen.queryByText(tutorialSteps[0].description)).not.toBeInTheDocument();
    expect(mockSetShowTutorial).not.toHaveBeenCalledWith(true); // Should not try to show tutorial
  });
  */

  // Test case: Tutorial shows if user is authenticated and isNewUser (even if localStorage had true)
  /*
  test('should show tutorial if user is new, overriding localStorage completed flag', async () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true'); // Simulate prior completion
    // Mock useUserProfileQuery to return a new user
    (useUserProfileQuery as jest.Mock).mockReturnValue({
      user: { id: '123', email: 'newuser@example.com', name: 'New User', isNewUser: true },
      isLoading: false,
      isError: false,
      error: null,
    });
  
    // Simulate AuthContext's login logic removing the `TUTORIAL_COMPLETED_KEY`
    // and then setting `showTutorial` to true `useEffect`
    renderMainLayout({ showTutorial: true, user: { isNewUser: true }, login: (token: string, userData: any) => {
      localStorage.removeItem(TUTORIAL_COMPLETED_KEY); // Simulate login effect for new user
    }});
  
    // Here, we need to explicitly trigger the login logic if we want to test its side effects on localStorage
    // For this test, we are assuming `login` in `AuthContext` has already run and cleared localStorage
    // and `showTutorial` is set to true.
  
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: tutorialSteps[0].title })).toBeInTheDocument();
      expect(screen.getByText(tutorialSteps[0].description)).toBeInTheDocument();
    });
    // The mockAuthContextValue.setShowTutorial will be called inside AuthContext itself,
    // not directly by MainLayout for the initial render.
    // We are testing that if showTutorial prop is true, it renders.
    expect(mockSetShowTutorial).not.toHaveBeenCalledWith(true); // showTutorial is already true in mock
  });
  */

  // Test case: Tutorial is not shown if not authenticated
  /*
  test('should not show tutorial if user is not authenticated', () => {
    localStorage.removeItem(TUTORIAL_COMPLETED_KEY); // Assume no tutorial completed
    // Mock useUserProfileQuery to return no user (not authenticated)
    (useUserProfileQuery as jest.Mock).mockReturnValue({
      user: null, // Not authenticated
      isLoading: false,
      isError: false,
      error: null,
    });
  
    // Simulate AuthContext's useEffect setting showTutorial to false when not authenticated
    renderMainLayout({ isAuthenticated: false, showTutorial: false });
  
    expect(screen.queryByRole('heading', { name: /Welcome to Prompt2Code!/i })).not.toBeInTheDocument();
    expect(screen.queryByText(tutorialSteps[0].description)).not.toBeInTheDocument();
    expect(mockSetShowTutorial).not.toHaveBeenCalledWith(true); // Should not try to show tutorial
  });
  */
});
