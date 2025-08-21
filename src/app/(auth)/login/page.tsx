'use client';

import React, { Suspense } from 'react';
import { LoginContent } from './components/LoginContent';

// The loading fallback for suspense
const LoginPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

export default function LoginPage() {
  return (
    <Suspense fallback={LoginPageFallback}>
      <LoginContent />
    </Suspense>
  );
}
