// 5. Import a Client Component (ProjectCard)
import { fetchUserProjects } from '@/lib/data/projects';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getInitialAuthData } from '@/lib/data/user';
import ProjectCard from '@/app/(main)/components/ProjectCard';

export default async function Test5() {
  console.log('[TEST-5] Running on server');
  const projects = await fetchUserProjects();
  const { user } = await getInitialAuthData();
  if (!user) redirect('/login');
  return (
    <>
      <h1>Test 5 – + ProjectCard (Client Component)</h1>
      <pre>{JSON.stringify(projects.slice(0, 1), null, 2)}</pre>
      <a href="/rsc-test/6-user-prop">Next →</a>
    </>
  );
}
