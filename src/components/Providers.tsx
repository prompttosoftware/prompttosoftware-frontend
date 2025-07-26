// components/Providers.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserProfile } from '@/types/auth';
import { MswProvider } from '@/components/MswProvider';
interface ProvidersProps {
  children: React.ReactNode;
  initialAuthData?: { user: UserProfile | null }; // Define the prop type
}

export function Providers({ children }: ProvidersProps) {
  // Use useState to ensure the client is only created once per component lifecycle
  const [queryClient] = useState(() => new QueryClient());

  const content = (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );

  // Conditionally wrap with MSW, but only on the client.
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    return <MswProvider>{content}</MswProvider>;
  }

  return content;
}
