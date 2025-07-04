import './globals.css';
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PromptToSoftware',
  description: 'An AI-powered software development platform designed to bring your ideas to life.',
};

import { Providers } from '../components/Providers';
import { StripeWrapper } from '../components/StripeWrapper';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <StripeWrapper>
          <Providers>
            {children}
          </Providers>
        </StripeWrapper>
      </body>
    </html>
  );
}
