'use client';

// src/lib/AuthContext.tsx
import { UserProfile } from '../types/auth';

import React, { createContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, setupInterceptors } from '../lib/api'; // Import 'api'
import { useUserProfileQuery } from '../hooks/useUserProfileQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useBalanceStore } from '../store/balanceStore'; // Import useBalanceStore

// 1. Define the shape of the AuthContext value
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void; // Modified to accept token and user
  logout: () => void;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
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
  const { user, isLoading, error } = useUserProfileQuery(); // Use the new useAuth hook
  const setBalance = useBalanceStore((state) => state.setBalance); // Access setBalance from store

  useEffect(() => {
    // Setup interceptors when the component mounts or router changes
    setupInterceptors(router);
  }, [router]);

useEffect(() => {
  if (user && user.balance !== undefined) {
    setBalance(user.balance);
  }
}, [user, setBalance]);

  // Login function to set authentication state and store token/user data
  // Define isAuthenticated within AuthProvider based on the user data from useUserProfileQuery
  // The user is authenticated if user data is present and not loading.
  const isAuthenticated = !!user && !isLoading;
  
  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem('jwtToken', token);
    // After login, invalidate and refetch the auth query to get the latest user profile
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    console.log('AuthProvider: User logged in and token stored. User profile will be refetched.');
  
    // Set show_tutorial flag if it's a new user
    if (userData?.isNewUser) {
      localStorage.setItem('show_tutorial', 'true');
      console.log('AuthProvider: show_tutorial flag set to true.');
    } else {
      localStorage.removeItem('show_tutorial'); // Ensure no stale tutorial flag
    }
  };
  
  const logout = async () => { // Marked as async
    try {
      await api.post('/auth/logout'); // Make the API call
      console.log('Logout API call successful.');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
      // as the token might be invalid or the backend session already expired.
    }
    localStorage.removeItem('jwtToken'); // Clear the token
    queryClient.removeQueries({ queryKey: ['auth', 'me'] }); // Completely remove user data from cache
    setBalance(0); // Reset balance on logout
    // The useUserProfileQuery hook will automatically reflect the cleared state
    // (user will be null, isAuthenticated will be false).
    console.log('AuthProvider: User logged out, token and profile cache cleared, balance reset.');
router.push('/login'); // Redirect to login page
  };

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    // For Apollo/React Query setup, instead of direct state update,
    // you might trigger a mutation or refetch the 'me' query after a profile update API call.
    // For now, let's just invalidate and refetch.
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    console.log('AuthProvider: Profile update initiated, refetching user data.');
  };

  // The value provided to the consumers of the context
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
