'use client';

import { AuthResponse, UserProfile } from '@/types/auth';

import React, { createContext, useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setupInterceptors as setupHttpClientInterceptors } from '@/lib/api';
import { logger } from '@/utils/logger';
import { useUserProfileQuery } from '@/hooks/useUserProfileQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useBalanceStore } from '@/store/balanceStore';
import { toast } from 'sonner';
import { removeAuthToken, setAuthToken } from '@/utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  logout: () => void;
  updateProfile: (newUserProfile: UserProfile) => void;
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  loginWithGithub: (code: string, freeProject?: boolean, freeAnalysis?: boolean) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  logout: () => {},
  updateProfile: () => Promise.reject(new Error('AuthProvider not found')),
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
  const { user, isLoading, isError, error } = useUserProfileQuery(initialData);
  const setBalance = useBalanceStore((state) => state.setBalance);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  useEffect(() => {
    // Setup interceptors when the component mounts or router changes
    setupHttpClientInterceptors(router);
  }, [router]);

  const isAuthenticated = !!user && !isLoading;

  const logout = async () => {
    try {
      await api.logout();  // Make the API call
      logger.info('Logout API call successful.');
    } catch (error) {
      logger.error('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
      // as the token might be invalid or the backend session already expired.
    }
    removeAuthToken();
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    setBalance(0);
    logger.info('AuthProvider: User logged out, token and profile cache cleared, balance reset.');
    router.push('/login');
    setShowTutorial(false);
  };

  const updateProfile = (newUserProfile: UserProfile) => {
    queryClient.setQueryData(['auth', 'me'], newUserProfile);
    logger.info('AuthProvider: Profile updated in cache synchronously.');
  };

  const loginWithGithub = async (code: string, freeProject?: boolean, freeAnalysis?: boolean): Promise<AuthResponse> => {
    logger.info('AuthProvider: Attempting GitHub login');
    try {
      const response = await api.loginWithGithub(code, freeProject, freeAnalysis);

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
      toast.error(errorMessage);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      logger.info('AuthProvider: Refreshing user profile');
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
    } catch (error) {
      logger.error('AuthProvider: Failed to refresh user profile', error);
    }
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    const shouldShow = isAuthenticated && !localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    setShowTutorial(shouldShow);

    if(shouldShow) {
        logger.info('AuthProvider: Conditions met, tutorial will be shown.');
    }

  }, [isAuthenticated, isLoading]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    isError,
    error,
    logout,
    updateProfile,
    loginWithGithub,
    refreshUser,
    showTutorial,
    setShowTutorial,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
