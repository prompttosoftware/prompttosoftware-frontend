'use client';

// src/lib/AuthContext.tsx

import React, { createContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setupInterceptors } from '../lib/api';
import { useAuth as useAuthApollo } from '../hooks/useUser'; // Rename to avoid conflict
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
  isLoading: true, // Default to true as authentication status is typically determined asynchronously
  login: () => {}, // Placeholder
  logout: () => {}, // Placeholder
  updateProfile: () => {}, // Placeholder
});

// 3. Define the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

interface UserProfile {
  id: string;
  email: string;
  isNewUser: boolean;
  balance: number; // Add balance to UserProfile
  username?: string; // Add username to UserProfile
  imageUrl?: string; // Add imageUrl to UserProfile
  role?: string; // Add role to UserProfile
  // Add other user properties as needed
}

// 4. Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter(); // Get the router instance
  const queryClient = useQueryClient(); // Get query client for invalidation
  const { user, isAuthenticated, isLoading } = useAuthApollo(); // Use the new useAuth hook
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
  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem('jwtToken', token);
    // Invalidate the auth query to refetch user data if needed
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

    console.log('AuthProvider: User logged in and token stored.');

    // Set show_tutorial flag if it's a new user
    if (userData?.isNewUser) { // Assuming userData is passed or derived from a successful login
      localStorage.setItem('show_tutorial', 'true');
      console.log('AuthProvider: show_tutorial flag set.');
    } else {
      localStorage.removeItem('show_tutorial'); // Ensure no stale tutorial flag
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken'); // Clear the token
    queryClient.setQueryData(['auth', 'me'], null); // Clear user data in query cache
    console.log('AuthProvider: User logged out and token cleared.');
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
