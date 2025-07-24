import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { UserProfile } from '@/types/auth';
import { useBalanceStore } from '@/store/balanceStore';
import { logger } from '@/utils/logger';
import { FAKE_USER } from '@/lib/dev/fakeData';

const TUTORIAL_COMPLETED_KEY = 'prompttosoftware_tutorial_completed';

export const useUserProfileQuery = (initialData: UserProfile | null) => {
  const setBalance = useBalanceStore((state) => state.setBalance);

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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: process.env.NEXT_PUBLIC_FAKE_AUTH !== 'true',
  });
  
  const isDevFakeAuth = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';

  useEffect(() => {
    if (isDevFakeAuth) {
      logger.info('FAKE AUTH: Simulating new user login for tutorial.');
      localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
    }
  }, [isDevFakeAuth]);

  if (isDevFakeAuth) {
    useEffect(() => {
        setBalance(FAKE_USER.balance);
    }, [setBalance]);

    return {
      user: FAKE_USER,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  // Side effect for syncing balance for real users (this one is fine)
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
