// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Autonomous Development Engine for Enterprise | PTS Automation',
  description: 'An Autonomous Development Engine that eliminates workflow bottlenecks and frees up senior engineering capacity. Integrate AI to resolve recurring Jira tickets, automate maintenance, and instantly update documentation in your enterprise development pipeline.',
};

// src/app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <html lang="en" dir="ltr" className="h-full">
      <meta name="apple-mobile-web-app-title" content="PTS" />
      <body className={`${inter.className} h-full bg-background text-foreground`}>
        <ErrorBoundary>
          <Providers >
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
