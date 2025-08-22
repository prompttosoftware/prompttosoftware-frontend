'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/auth';
import { useRef } from 'react';

function InitializeAuth({ user }: { user: UserProfile | null }) {
  const { updateProfile } = useAuth();
  const initialized = useRef(false);

  if (!initialized.current && user) {
    updateProfile(user);
    initialized.current = true;
  }

  return null;
}

export default InitializeAuth;
