'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/lib/AuthContext'; // Adjust path if needed
import { LoginContent } from '@/app/login/components/LoginContent';

// The loading fallback for suspense
const LoginPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    Loading...
  </div>
);

export default function LoginPage() {
  return (
    <AuthProvider initialData={null}>
      <Suspense fallback={LoginPageFallback}>
        <LoginContent />
      </Suspense>
    </AuthProvider>
  );
}
