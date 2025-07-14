import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { UserProfile } from '@/types/auth';
import { useBalanceStore } from '@/store/balanceStore';
import { logger } from '@/utils/logger';
import { FAKE_USER } from '@/lib/dev/fakeData';

const TUTORIAL_COMPLETED_KEY = 'prompttosoftware_tutorial_completed';

export const useUserProfileQuery = (initialData: UserProfile | null) => {
  const queryClient = useQueryClient();
  const setBalance = useBalanceStore((state) => state.setBalance);

  // This is the query for the REAL user in production
  const {
    data: realUserData,
    isLoading: isRealUserLoading,
    isError,
    isSuccess,
    error,
  } = useQuery<UserProfile, Error>({
    queryKey: ['auth', 'me'],
    queryFn: api.getUserProfile,
    initialData: initialData ?? undefined,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes. Infinity can be risky if user data changes.
    // This prevents unnecessary network requests.
    enabled: process.env.NEXT_PUBLIC_FAKE_AUTH !== 'true',
  });
  
  const isDevFakeAuth = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';

  // 1. Simulate the "new user" login side-effect for the fake user
  // This runs only in development and only once on component mount.
  useEffect(() => {
    if (isDevFakeAuth) {
      logger.info('FAKE AUTH: Simulating new user login for tutorial.');
      // This mimics the logic from AuthContext's login() function.
      localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
    }
  }, [isDevFakeAuth]); // Run only when the fake auth status changes (i.e., once)


  // If we are in development and faking auth, we return a completely separate, hardcoded object.
  if (isDevFakeAuth) {

    // Also update the balance store for the fake user
    useEffect(() => {
        setBalance(FAKE_USER.balance);
    }, [setBalance]);

    // 2. Return a self-contained, predictable object for the fake user.
    // Notice isLoading is hardcoded to `false`.
    return {
      user: FAKE_USER,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  // Side effect for handling real errors
  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logger.warn('401 Unauthorized response detected. Invalidating query.');
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      } else {
        logger.error(`Error fetching user profile:`, error);
      }
    }
  }, [isError, error, queryClient]);

  // Side effect for syncing balance for real users
  useEffect(() => {
    if (isSuccess && realUserData) {
      if (typeof realUserData.balance === 'number') {
        setBalance(realUserData.balance);
      }
    }
  }, [isSuccess, realUserData, setBalance]);

  // Return the data from the REAL query
  return {
    user: realUserData,
    isLoading: isRealUserLoading,
    isError,
    error,
  };
};
