// app/projects/[id]/edit/page.tsx

import { notFound } from 'next/navigation';
import { fetchProjectById } from '@/lib/data/projects';
import ProjectClient from '@/app/(main)/new-project/components/ProjectClient';

export const dynamic = 'force-dynamic';

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

  // 2. Fetch the project data on the server
  const projectToEdit = await fetchProjectById(id);
  if (!projectToEdit) {
    notFound(); // Triggers 404 if project doesn't exist
  }

  // 3. Render the form component, passing initial data to activate "edit" mode
  return (
    <ProjectClient 
      initialProjectData={projectToEdit} 
    />
  );
}
