// 3. Add redirect (still server-safe)
import { fetchUserProjects } from '@/lib/data/projects';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Test3() {
  console.log('[TEST-3] Running on server');
  await fetchUserProjects();
  const c = await cookies();
  if (!c.has('jwtToken')) redirect('/login');
  return (
    <>
      <h1>Test 3 – + redirect()</h1>
      <a href="/rsc-test/4-user">Next →</a>
    </>
  );
}
