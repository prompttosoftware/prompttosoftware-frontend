// 2. Add cookies()
import { fetchUserProjects } from '@/lib/data/projects';
import { cookies } from 'next/headers';

export default async function Test2() {
  console.log('[TEST-2] Running on server');
  await fetchUserProjects();
  await (await cookies()).has('jwtToken');
  return (
    <>
      <h1>Test 2 – + cookies()</h1>
      <a href="/rsc-test/3-redirect">Next →</a>
    </>
  );
}
