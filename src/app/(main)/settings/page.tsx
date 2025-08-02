// src/app/(main)/settings/page.tsx
import { redirect } from 'next/navigation';
import SettingsClient from '@/app/(main)/settings/components/SettingsClient';
import { getInitialAuthData } from '@/lib/data/user';
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { user } = await getInitialAuthData();

  if (!user) {
    redirect('/login');
  }

  return <SettingsClient initialUser={user} />;
}
