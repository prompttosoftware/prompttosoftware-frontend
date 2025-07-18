// app/projects/[id]/edit/page.tsx

import { redirect, notFound } from 'next/navigation';
import { getInitialAuthData } from '@/lib/data/user';
import { fetchProjectById } from '@/lib/data/projects';
import ProjectForm from '@/app/(main)/new-project/components/ProjectForm';

/**
 * Server Component for the Project Edit Page.
 * 1. Protects the route by checking for an authenticated user.
 * 2. Fetches the existing project data to pre-populate the form.
 * 3. Renders the reusable ProjectForm component in "edit" mode.
 */
export default async function EditProjectPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch auth status and user data
  const { user } = await getInitialAuthData();
  if (!user) {
    redirect(`/login?from=/projects/${id}/edit`);
  }

  // 2. Fetch the project data on the server
  const projectToEdit = await fetchProjectById(id);
  if (!projectToEdit) {
    notFound(); // Triggers 404 if project doesn't exist
  }

  // 3. Render the form component, passing initial data to activate "edit" mode
  return (
    <ProjectForm 
      user={user} 
      initialProjectData={projectToEdit} 
    />
  );
}
