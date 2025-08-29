// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PromptToSoftware: An Experimental AI Agent for Developers',
  description: 'An affordable, hands-free AI partner that autonomously codes, tests, and commits to GitHub. Take a break, push your own commits, or focus on other tasks—it works without you.',
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
