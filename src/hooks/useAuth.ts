// src/hooks/useAuth.ts
import { useContext, useState } from 'react';
import { AuthContext } from '../lib/AuthContext';
import { api } from '../lib/api';
import { logger } from '../utils/logger';
import { UserProfile, AuthResponse } from '../types/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { 
    isAuthenticated, 
    user, 
    isLoading: contextLoading, 
    login: contextLogin, 
    logout: contextLogout,
    updateProfile,
    showTutorial,
    setShowTutorial
  } = context;

  const loginWithGithub = async (code: string): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);
      logger.info('useAuth: Attempting GitHub login');

      const response = await api.loginWithGithub(code);

      if (response.token && response.user) {
        logger.info('useAuth: GitHub login successful, calling context login');
        contextLogin(response.token, response.user);
        return response;
      } else {
        throw new Error('GitHub authentication failed: Invalid response from server.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub login failed';
      logger.error('useAuth: GitHub Login error:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      logger.info('useAuth: Attempting logout');
      
      // Call the context logout method which handles the API call and cleanup
      await contextLogout();
      
      logger.info('useAuth: Logout successful');
    } catch (error) {
      logger.error('useAuth: Logout error:', error);
      // Don't throw here as context logout handles errors gracefully
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Return the combined state from context and local hook
  return {
    // Auth state from context
    isAuthenticated,
    user,
    isLoading: contextLoading || isLoading, // Combined loading state
    
    // Tutorial state from context
    showTutorial,
    setShowTutorial,
    
    // Auth methods
    loginWithGithub,
    logout,
    updateProfile,
    
    // Error handling
    error,
    clearError,
  };
};
