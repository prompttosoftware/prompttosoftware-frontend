// components/Providers.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../lib/AuthContext';
import { UserProfile } from '@/types/auth';
interface ProvidersProps {
  children: React.ReactNode;
  initialAuthData?: { user: UserProfile | null }; // Define the prop type
}

export function Providers({ children, initialAuthData }: ProvidersProps) {
  // Use useState to ensure the client is only created once per component lifecycle
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialData={initialAuthData?.user || null}>
        {children}
      </AuthProvider>
      {/* Conditionally render Devtools only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
