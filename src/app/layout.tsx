import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast'; // Import Toaster
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PromptToSoftware',
  description: 'An AI-powered software development platform designed to bring your ideas to life.',
};

import { Providers } from '../components/Providers';
import { StripeWrapper } from '../components/StripeWrapper';
import ErrorBoundary from '../components/ErrorBoundary'; // Import ErrorBoundary
import { MswProvider } from '../components/MswProvider'; // Import MswProvider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <ErrorBoundary>
          <StripeWrapper>
            <MswProvider> {/* Wrap Providers with MswProvider */}
              <Providers>{children}</Providers>
            </MswProvider>
          </StripeWrapper>
        </ErrorBoundary>
        <Toaster /> {/* Render Toaster */}
      </body>
    </html>
  );
}
