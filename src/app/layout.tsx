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

// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className={`${inter.className} h-full bg-gray-100`}>
        <ErrorBoundary>
          {/* We pass NO initial data here. The client will be unauthenticated by default. */}
          <Providers initialAuthData={{ user: null }}>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
