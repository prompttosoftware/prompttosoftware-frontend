'use client';

import React, { Suspense } from 'react';
import { GitHubAnalysisLandingPage } from './components/AnalysisContent';
import LandingPageHeader from '@/app/apps/components/LandingPageHeader';
import LandingPageFooter from '@/app/apps/components/LandingPageFooter';

// The loading fallback for suspense
const LoginPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

export default function AnalysisLoginPage() {
  return (
    <Suspense fallback={LoginPageFallback}>
      <LandingPageHeader textColor='dark'></LandingPageHeader>
      <GitHubAnalysisLandingPage />
      <LandingPageFooter></LandingPageFooter>
    </Suspense>
  );
}
