// src/hooks/useAuth.ts
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../lib/AuthContext';

export const useAuth = () => {
  // Original implementation:
  // const auth = useContext(AuthContext);
  // if (!auth) {
  //   throw new Error('useAuth must be used within an AuthProvider');
  // }
  // return auth;

  // Temporary mock for testing purposes:
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Set to false to immediately allow access

  useEffect(() => {
    // Simulate any initial loading if necessary, though for this bypass, it's not
    // If you need to simulate an async check, keep this:
    // const timer = setTimeout(() => {
    //   setIsLoading(false);
    //   setIsAuthenticated(true);
    // }, 100); // Small delay to simulate async
    // return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    console.log('Mock login called');
    setIsAuthenticated(true);
    // In a real scenario, you'd call your auth API here
  };

  const logout = async () => {
    console.log('Mock logout called');
    setIsAuthenticated(false);
    // In a real scenario, you'd clear tokens and redirect
  };

  const register = async (email, password) => {
    console.log('Mock register called');
    setIsAuthenticated(true);
    // In a real scenario, you'd call your auth API here
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    // You might need to add other context values if your components depend on them
    // For example, if you use a 'user' object from context:
    user: { id: 'mock-user-id', email: 'mock@example.com' },
  };
};
