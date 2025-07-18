// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '../components/Providers';
import ErrorBoundary from '../components/ErrorBoundary';
import { getInitialAuthData } from '@/lib/data/user';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PromptToSoftware',
  description: 'An AI-powered software development platform designed to bring your ideas to life.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Conditionally render MSW only in development
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    const { MswProvider } = require('../components/MswProvider');
    return (
      <html lang="en" dir="ltr" className="h-full">
        <body className={`${inter.className} h-full bg-gray-100`}>
          <ErrorBoundary>
            <MswProvider>
              <Providers>{children}</Providers>
            </MswProvider>
          </ErrorBoundary>
        </body>
      </html>
    );
  }

  const initialAuthData = await getInitialAuthData();

  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className={`${inter.className} h-full bg-gray-100`}>
        <ErrorBoundary>
          <Providers initialAuthData={initialAuthData}>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
