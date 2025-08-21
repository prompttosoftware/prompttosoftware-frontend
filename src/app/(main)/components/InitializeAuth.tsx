'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/auth';
import { useRef } from 'react';

// This component's sole purpose is to update the AuthContext
// with the user data fetched on the server in a protected layout.
function InitializeAuth({ user }: { user: UserProfile | null }) {
  const { updateProfile } = useAuth();
  const initialized = useRef(false);

  // We use a ref to ensure this runs only once on initial mount.
  // This prevents re-running the logic on re-renders.
  if (!initialized.current && user) {
    updateProfile(user);
    initialized.current = true;
  }

  return null; // This component renders nothing.
}

export default InitializeAuth;
