// src/app/(auth)/layout.tsx
import React from 'react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <>
        {children}
    </>
  );
}
