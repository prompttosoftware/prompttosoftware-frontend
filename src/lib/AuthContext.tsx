'use client';

// src/lib/AuthContext.tsx
import { UserProfile } from '../types/auth';

import React, { createContext, useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setupInterceptors as setupHttpClientInterceptors } from '../lib/api'; // Import api and setupInterceptors from the new api.ts
import { logger } from '../utils/logger'; // Import logger
import { useUserProfileQuery } from '../hooks/useUserProfileQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useBalanceStore } from '../store/balanceStore'; // Import useBalanceStore

// 1. Define the shape of the AuthContext value
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null | undefined;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void; // Modified to accept token and user
  logout: () => void;
  updateProfile: () => void;
  showTutorial: boolean; // Add showTutorial to the context type
  setShowTutorial: (show: boolean) => void; // Add setShowTutorial to the context type
}

// 2. Create the AuthContext with a default unauthenticated state
// The type assertion 'as AuthContextType' is used because createContext
// expects a default value that matches the context type.
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true, // will be overridden by the actual loading state from useUserProfileQuery
  login: () => {}, // Placeholder
  logout: () => {}, // Placeholder
  updateProfile: () => {}, // Placeholder
});

// 3. Define the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// 4. Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter(); // Get the router instance
  const queryClient = useQueryClient(); // Get query client for invalidation
  const { user, isLoading } = useUserProfileQuery(); // Use the new useAuth hook
  const setBalance = useBalanceStore((state) => state.setBalance); // Access setBalance from store
  const [showTutorial, setShowTutorial] = useState<boolean>(false); // State to control tutorial visibility

  useEffect(() => {
    // Setup interceptors when the component mounts or router changes
    setupHttpClientInterceptors(router);
  }, [router]);

  

  // Login function to set authentication state and store token/user data
  // Define isAuthenticated within AuthProvider based on the user data from useUserProfileQuery
  // The user is authenticated if user data is present and not loading.
  const isAuthenticated = !!user && !isLoading;

  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem('jwtToken', token);
    // After login, invalidate and refetch the auth query to get the latest user profile
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    logger.info('AuthProvider: User logged in and token stored. User profile will be refetched.');

    // Set show_tutorial flag if it's a new user
    const TUTORIAL_COMPLETED_KEY = 'prompt2code_tutorial_completed';
    if (userData?.isNewUser) {
      localStorage.removeItem(TUTORIAL_COMPLETED_KEY); // If it's a new user, remove the tutorial completion flag to force the tutorial to show
      logger.info('AuthProvider: New user detected, tutorial completion flag removed.');
    } else {
      // For existing users, ensure the tutorial completed flag is set to prevent it from showing
      localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      logger.info('AuthProvider: Existing user detected, tutorial completion flag set.');
    }
  };

  const logout = async () => {
    // Marked as async
    try {
      await api.post('/auth/logout'); // Make the API call
      logger.info('Logout API call successful.');
    } catch (error) {
      logger.error('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
      // as the token might be invalid or the backend session already expired.
    }
    localStorage.removeItem('jwtToken'); // Clear the token
    queryClient.removeQueries({ queryKey: ['auth', 'me'] }); // Completely remove user data from cache
    setBalance(0); // Reset balance on logout
    // The useUserProfileQuery hook will automatically reflect the cleared state
    // (user will be null, isAuthenticated will be false).
    logger.info('AuthProvider: User logged out, token and profile cache cleared, balance reset.');
    router.push('/login'); // Redirect to login page
    setShowTutorial(false); // Ensure tutorial is hidden on logout
  };

  const updateProfile = () => {
    // For Apollo/React Query setup, instead of direct state update,
    // you might trigger a mutation or refetch the 'me' query after a profile update API call.
    // For now, let's just invalidate and refetch.
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    logger.info('AuthProvider: Profile update initiated, refetching user data.');
  };

  // Effect to check and set tutorial visibility based on authentication status and localStorage
  useEffect(() => {
    const TUTORIAL_COMPLETED_KEY = 'prompt2code_tutorial_completed';
    // Only check for tutorial completion if authentication status is stable and isAuthenticated is true
    if (!isLoading && isAuthenticated) {
      const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
      if (!tutorialCompleted) {
        //If no flag is found, it's a first-time user or tutorial needs to be shown
        setShowTutorial(true);
        logger.info('AuthProvider: Tutorial will be shown because completion flag is absent.');
      } else {
        setShowTutorial(false); // Tutorial has been completed
        logger.info('AuthProvider: Tutorial will not be shown because completion flag is present.');
      }
    } else if (!isLoading && !isAuthenticated) {
      setShowTutorial(false); // Not authenticated, ensure tutorial is not shown
      logger.info('AuthProvider: User not authenticated, tutorial will not be shown.');
    }
  }, [isAuthenticated, isLoading]); // Depend on authentication and loading states


  // The value provided to the consumers of the context
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateProfile,
    showTutorial, // Add showTutorial to the context
    setShowTutorial, // Add setShowTutorial to the context
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
