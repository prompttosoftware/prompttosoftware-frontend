// src/app/(main)/settings/page.tsx
import { redirect } from 'next/navigation';
import SettingsClient from '@/app/(main)/settings/components/SettingsClient';
import { fetchUserProjects } from '@/lib/data/projects';
import { FAKE_USER } from '@/lib/dev/fakeData';

export default async function SettingsPage() {
  await fetchUserProjects();
  // const { user } = await getInitialAuthData();
  const user = FAKE_USER;

  if (!user) {
    redirect('/login');
  }

  return <SettingsClient user={user} />;
}
