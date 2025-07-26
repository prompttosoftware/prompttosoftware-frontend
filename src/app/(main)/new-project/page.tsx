import { redirect } from 'next/navigation';
import { getInitialAuthData } from '@/lib/data/user';
import ProjectClient from './components/ProjectClient';

/**
 * This is the main Server Component for the /new-project route.
 * 1. It protects the route by checking for an authenticated user on the server.
 * 2. It fetches the initial user data.
 * 3. It passes this data down to the main client component that will handle the form.
 */
export default async function NewProjectPage() {
  // Fetch auth status and user data on the server.
  const { user } = await getInitialAuthData();

  // If not logged in, redirect immediately.
  if (!user) {
    redirect('/login?from=/new-project');
  }

  // Pass the user data to the client wrapper for hydration.
  return <ProjectClient user={user} />;
}
