'use client';

import React, { Suspense } from 'react';
import { LoginContent } from './components/LoginContent';
import LandingPageHeader from '@/app/apps/components/LandingPageHeader';
import LandingPageFooter from '@/app/apps/components/LandingPageFooter';

// The loading fallback for suspense
const LoginPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

export default function LoginPage() {
  return (
    <Suspense fallback={LoginPageFallback}>
      <LandingPageHeader textColor='dark'></LandingPageHeader>
      <LoginContent />
      <LandingPageFooter></LandingPageFooter>
    </Suspense>
  );
}
