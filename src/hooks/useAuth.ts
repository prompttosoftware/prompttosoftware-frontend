// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../lib/AuthContext';

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return auth;
};
