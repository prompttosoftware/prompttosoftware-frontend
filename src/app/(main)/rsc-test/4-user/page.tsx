// 4. Add getInitialAuthData (which returns { user })
import { fetchUserProjects } from '@/lib/data/projects';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getInitialAuthData } from '@/lib/data/user';

export default async function Test4() {
  console.log('[TEST-4] Running on server');
  await fetchUserProjects();
  const { user } = await getInitialAuthData();
  if (!user) redirect('/login');
  return (
    <>
      <h1>Test 4 – + getInitialAuthData()</h1>
      <a href="/rsc-test/5-client-card">Next →</a>
    </>
  );
}
