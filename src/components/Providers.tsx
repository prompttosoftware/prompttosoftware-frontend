// components/Providers.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MswProvider } from '@/components/MswProvider';
import { AuthProvider } from '@/lib/AuthContext';
import { UserProfile } from '@/types/auth';
interface ProvidersProps {
  children: React.ReactNode;
  initialUser: UserProfile | null;
}

export function Providers({ children, initialUser }: ProvidersProps) {
  // Use useState to ensure the client is only created once per component lifecycle
  const [queryClient] = useState(() => new QueryClient());

  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialData={initialUser}>
        {children}
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );

  // Conditionally wrap with MSW, but only on the client.
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    return <MswProvider>{content}</MswProvider>;
  }

  return content;
}
