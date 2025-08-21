// src/app/(main)/layout.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import MainUI from "@/app/(main)/components/MainUI";
import { getInitialAuthData } from '@/lib/data/user';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  
 const { user } = await getInitialAuthData();

  if (!user && process.env.NODE_ENV === 'production') {
    redirect('/login');
  }

  // 3. Pass the fetched user to the client component wrapper.
  return (
      <MainUI user={user}>
        {children}
      </MainUI>
  ); 
}
