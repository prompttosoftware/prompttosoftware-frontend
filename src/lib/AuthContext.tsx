'use client';

// src/lib/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setupInterceptors } from '../lib/api';

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
  id: string; // Assuming user has an ID
  email: string; // Assuming user has an email
  isNewUser: boolean; // Add this property if it's part of your user profile
  // Add other user properties as needed
}

// 4. Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial state is loading
  const router = useRouter(); // Get the router instance

  useEffect(() => {
    // Setup interceptors when the component mounts or router changes
    setupInterceptors(router);
  }, [router]);

  // Simulate initial authentication check on component mount for testing purposes
  useEffect(() => {
    const checkAuthStatus = () => {
      console.log('AuthProvider: Checking authentication status...');
      const token = localStorage.getItem('jwtToken');

      if (token) {
        // For a real app, you'd decode the JWT or hit a /me endpoint to get fresh user data
        // For now, load from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            console.log('AuthProvider: JWT and user data found. User authenticated.');
          } catch (e) {
            console.error('Failed to parse user data from localStorage', e);
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // Token found, but no user data. This scenario might need re-auth or user data fetch.
          console.warn('AuthProvider: JWT found, but no user data. Treating as authenticated based on token presence for now.');
          setIsAuthenticated(true); // Still treat as authenticated if token is present
          setUser(null); // Keep user null if data is missing, or fetch it
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('AuthProvider: No JWT found. User not authenticated.');
      }
      setIsLoading(false); // Authentication check is complete
      console.log('AuthProvider: Initial loading finished.');
    };

    checkAuthStatus();
  }, []); // Run only once on mount

  // Login function to set authentication state and store token/user data
  const login = (token: string, userData: UserProfile) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data

    setIsAuthenticated(true);
    setUser(userData);
    setIsLoading(false); // After login, loading is complete
    console.log('AuthProvider: User logged in and data stored.');

    // Set show_tutorial flag if it's a new user
    if (userData?.isNewUser) {
      localStorage.setItem('show_tutorial', 'true');
      console.log('AuthProvider: show_tutorial flag set.');
    } else {
      localStorage.removeItem('show_tutorial'); // Ensure no stale tutorial flag
    }
  };

  // Placeholder logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false); // After logout, loading is complete
    // Temporarily expose logout to window for testing purposes
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).logout = logout;
    }
    // In a real app, this would also clear tokens, etc.
  };

  // Placeholder updateProfile function
  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, ...newProfile };
      }
      return null;
    });
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
