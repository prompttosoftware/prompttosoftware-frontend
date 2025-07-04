'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBalanceStore } from '@/store/balanceStore';
import { usePathname } from 'next/navigation';


interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const fetchBalance = useBalanceStore((state) => state.fetchBalance);
  const pathname = usePathname();


  useEffect(() => {
    // Only fetch balance if authenticated and not loading, and not on auth pages
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);

    if (isAuthenticated && !isLoading && !isAuthPage) {
      fetchBalance();
    }
  }, [isAuthenticated, isLoading, fetchBalance, pathname]);

  return <>{children}</>;
};

export default AuthInitializer;
