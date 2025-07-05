'use client';

import { useEffect } from 'react';

interface MswProviderProps {
  children: React.ReactNode;
}

export function MswProvider({ children }: MswProviderProps) {
  useEffect(() => {
    // Check if we are in a browser environment and API mocking is enabled
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
      const initMocks = async () => {
        const { worker } = await import('../mocks/browser');
        // `start()` returns a Promise that resolves once the Service Worker
        // is up and ready to intercept requests.
        worker.start({ onUnhandledRequest: 'bypass' });
        console.log('MSW worker started.');
      };
      initMocks();
    }
  }, []);

  return <>{children}</>;
}
