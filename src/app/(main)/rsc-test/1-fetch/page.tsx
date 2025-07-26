// 1. Add ONLY the server data call
import { fetchUserProjects } from '@/lib/data/projects';

export default async function Test1() {
  console.log('[TEST-1] Running on server');
  await fetchUserProjects();
  return (
    <>
      <h1>Test 1 – fetchUserProjects()</h1>
      <a href="/rsc-test/2-cookies">Next →</a>
    </>
  );
}
