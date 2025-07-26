// 6. Pass user object to Client Component (should still be server)
import { fetchUserProjects } from '@/lib/data/projects';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getInitialAuthData } from '@/lib/data/user';
import SettingsClient from '@/app/(main)/settings/components/SettingsClient';

export default async function Test6() {
  console.log('[TEST-6] Running on server');
  await fetchUserProjects();
  const { user } = await getInitialAuthData();
  if (!user) redirect('/login');
  return (
    <>
      <h1>Test 6 – + SettingsClient + user prop</h1>
      <SettingsClient user={user} />
    </>
  );
}
