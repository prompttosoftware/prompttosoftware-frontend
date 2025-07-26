// src/app/(main)/components/MainLayoutClient.tsx
'use client';

import { AuthProvider } from "@/lib/AuthContext";
import { UserProfile } from "@/types/auth";
import MainUI from "./MainUI";

// This is the client component that provides the context.
export default function MainLayoutClient({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: UserProfile | null;
}) {
  return (
    <AuthProvider initialData={initialUser}>
      <MainUI>
        {children}
      </MainUI>
    </AuthProvider>
  );
}
