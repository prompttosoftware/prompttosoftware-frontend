// src/app/(main)/layout.tsx
import React from 'react';
import MainUI from "@/app/(main)/components/MainUI";
import { getInitialAuthData } from '@/lib/data/user';
import { redirect } from 'next/navigation';
import { fetchAnnouncements } from '@/lib/data/announcements';

export default async function MainLayout({ children }: { children: React.ReactNode }) {

  const { user } = await getInitialAuthData();
  const banners = await fetchAnnouncements();

  // Protect the route
  if (!user) {
    redirect('/login');
  }
  
  return (
    <MainUI banners={banners}>
      {children}
    </MainUI>
  ); 
}
