// src/app/(main)/layout.tsx
'use client';

import MainUI from "@/app/(main)/components/MainUI";
import { AuthProvider } from "@/lib/AuthContext";

// This is the client-side layout for your authenticated section.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  // Since we can't fetch server data here, we provide the AuthProvider
  // without initial data. The first render will be in a loading state.
  // This is a trade-off for having a complex, auth-aware UI shell.
  return (
    <AuthProvider initialData={null}>
      <MainUI>
        {children}
      </MainUI>
    </AuthProvider>
  );
}
