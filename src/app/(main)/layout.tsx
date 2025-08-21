// src/app/(main)/layout.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import MainUI from "@/app/(main)/components/MainUI";
import { cookies } from 'next/headers';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  
  const token = (await cookies()).get('jwtToken')?.value;
  if (!token && process.env.NODE_ENV === 'production') {
    redirect('/login');
  }

  return (
      <MainUI>
        {children}
      </MainUI>
  );
}
