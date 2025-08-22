// src/app/(main)/layout.tsx
import React from 'react';
import MainUI from "@/app/(main)/components/MainUI";
import { getInitialAuthData } from '@/lib/data/user';
import { redirect } from 'next/navigation';

export default async function MainLayout({ children }: { children: React.ReactNode }) {

  const { user } = await getInitialAuthData();

  // Protect the route
  if (!user) {
    redirect('/login');
  }
  
  return (
    <MainUI>
      {children}
    </MainUI>
  ); 
}
