'use client';

// src/lib/AuthContext.tsx
import { AuthResponse, UserProfile } from '../types/auth';

import React, { createContext, useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setupInterceptors as setupHttpClientInterceptors } from '../lib/api'; // Import api and setupInterceptors from the new api.ts
import { logger } from '../utils/logger'; // Import logger
import { useUserProfileQuery } from '../hooks/useUserProfileQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useBalanceStore } from '../store/balanceStore'; // Import useBalanceStore
import { toast } from 'sonner';
import { removeAuthToken, setAuthToken } from '@/utils/auth';

// 1. Define the shape of the AuthContext value
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null | undefined;
  isLoading: boolean;
  isError: boolean; // Add this
  error: Error | null; // Add this, adjust type if needed
  logout: () => void;
  updateProfile: (newUserProfile: UserProfile) => void;
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  loginWithGithub: (code: string) => Promise<AuthResponse>; // Add this
  refreshUser: () => Promise<void>; // Add this
}

// 2. Create the AuthContext with a default unauthenticated state
// The type assertion 'as AuthContextType' is used because createContext
// expects a default value that matches the context type.
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true, // will be overridden by the actual loading state from useUserProfileQuery
  logout: () => {}, // Placeholder
  updateProfile: () => {}, // Placeholder
  showTutorial: false,
  setShowTutorial: () => {},
  isError: false,
  error: null,
  refreshUser: () => Promise.reject(new Error('AuthProvider not found')),
  loginWithGithub: () => Promise.reject(new Error('AuthProvider not found')),
});

export const TUTORIAL_COMPLETED_KEY = 'prompttosoftware_tutorial_completed';

interface AuthProviderProps {
  children: ReactNode;
  initialData: UserProfile | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialData }) => {
  const router = useRouter(); // Get the router instance
  const queryClient = useQueryClient(); // Get query client for invalidation
  const { user, isLoading, isError, error } = useUserProfileQuery(initialData); // Use the new useAuth hook
  const setBalance = useBalanceStore((state) => state.setBalance); // Access setBalance from store
  const [showTutorial, setShowTutorial] = useState<boolean>(false); // State to control tutorial visibility

  // VVV ADD THIS DIAGNOSTIC LOG VVV
  useEffect(() => {
    console.log('--- AuthProvider MOUNTED ---');
    
    // You can even add a cleanup function to be 100% sure
    return () => {
      console.log('--- AuthProvider WILL UNMOUNT ---');
    };
  }, []); // The empty array is crucial

  useEffect(() => {
    // Setup interceptors when the component mounts or router changes
    setupHttpClientInterceptors(router);
  }, [router]);

  

  // Login function to set authentication state and store token/user data
  // Define isAuthenticated within AuthProvider based on the user data from useUserProfileQuery
  // The user is authenticated if user data is present and not loading.
  const isAuthenticated = !!user && !isLoading;

  const logout = async () => {
    // Marked as async
    try {
      await api.logout();  // Make the API call
      logger.info('Logout API call successful.');
    } catch (error) {
      logger.error('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
      // as the token might be invalid or the backend session already expired.
    }
    removeAuthToken();
    queryClient.removeQueries({ queryKey: ['auth', 'me'] }); // Completely remove user data from cache
    setBalance(0); // Reset balance on logout
    // The useUserProfileQuery hook will automatically reflect the cleared state
    // (user will be null, isAuthenticated will be false).
    logger.info('AuthProvider: User logged out, token and profile cache cleared, balance reset.');
    router.push('/login'); // Redirect to login page
    setShowTutorial(false); // Ensure tutorial is hidden on logout
  };

  const updateProfile = (newUserProfile: UserProfile) => {
    // `setQueryData` synchronously updates the query cache.
    // Any component using `useUserProfileQuery` (or `useQuery` with this key)
    // will re-render immediately with the new data.
    queryClient.setQueryData(['auth', 'me'], newUserProfile);
    logger.info('AuthProvider: Profile updated in cache synchronously.');
  };

  const loginWithGithub = async (code: string): Promise<AuthResponse> => {
    logger.info('AuthProvider: Attempting GitHub login');
    try {
      const response = await api.loginWithGithub(code);

      if (response.token && response.data?.user) {
        logger.info('AuthProvider: GitHub login successful, setting token.');
        setAuthToken(response.token);
        queryClient.setQueryData(['auth', 'me'], response.data.user);
        return response;
      } else {
        throw new Error('GitHub authentication failed: Invalid response from server.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub login failed';
      logger.error('AuthProvider: GitHub Login error:', errorMessage);
      toast.error(errorMessage); // It's better to show toast errors here
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      logger.info('AuthProvider: Refreshing user profile');
      // Just tell React Query to refetch. It will handle the API call and state updates.
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      toast.success("Session refreshed!");
    } catch (error) {
      logger.error('AuthProvider: Failed to refresh user profile', error);
      toast.error("Could not refresh your session.");
    }
  };

  // Effect to check and set tutorial visibility based on authentication status and localStorage
  useEffect(() => {
    if (isLoading) {
      // Don't make any decisions while auth status is still loading.
      return;
    }
    
    // This single line clearly defines the condition for showing the tutorial.
    const shouldShow = isAuthenticated && !localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    setShowTutorial(shouldShow);

    if(shouldShow) {
        logger.info('AuthProvider: Conditions met, tutorial will be shown.');
    }

  }, [isAuthenticated, isLoading]);


  // The value provided to the consumers of the context
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isLoading, // The ONE source of truth for loading state
    isError, // Pass this down too
    error,   // And the error object
    logout,
    updateProfile,
    // Add the new methods to the context value
    loginWithGithub,
    refreshUser,
    showTutorial,
    setShowTutorial,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
