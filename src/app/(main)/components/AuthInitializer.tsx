'use client';

import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/types/auth';

interface AuthInitializerProps {
  user: UserProfile | null;
}

// This is a client component that will receive the user data from a server component
// and use it to hydrate the React Query cache.
function AuthInitializer({ user }: AuthInitializerProps) {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  // We use a ref to ensure this hydration happens only once, preventing
  // potential loops or overwrites if the component were to re-render.
  if (!initialized.current) {
    // `setQueryData` synchronously updates the cache. When `useUserProfileQuery`
    // is called by AuthProvider, it will find this data immediately.
    queryClient.setQueryData(['auth', 'me'], user);
    initialized.current = true;
  }

  // This component doesn't render anything itself.
  return null;
}

export default AuthInitializer;
