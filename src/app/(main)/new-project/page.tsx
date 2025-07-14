import { redirect } from 'next/navigation';
import { getInitialAuthData } from '@/lib/server-auth';
import ProjectForm from './components/ProjectForm';

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

  // Render the client component, which will handle all form logic and interactivity.
  // We pass the user object so the client doesn't need to re-fetch it.
  return <ProjectForm user={user} />;
}
