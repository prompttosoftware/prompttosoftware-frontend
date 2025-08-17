// src/app/(main)/layout.tsx
'use client';

import MainUI from "@/app/(main)/components/MainUI";
import { AuthProvider } from "@/lib/AuthContext";

// This is the client-side layout for your authenticated section.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider initialData={null}>
      <MainUI>
        {children}
      </MainUI>
    </AuthProvider>
  );
}
