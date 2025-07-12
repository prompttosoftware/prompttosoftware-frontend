import { notFound } from 'next/navigation';
import { fetchProjectById } from '@/lib/data/projects';
import ProjectDetailClient from './components/ProjectDetailClient';

interface ProjectDetailPageProps {
  params: { id: string };
}

/**
 * This is the main Server Component for the project detail page.
 * 1. It fetches the project data on the server using the ID from the URL.
 * 2. If the project is not found (or user lacks permission), it triggers a 404 page.
 * 3. It passes the initial, server-fetched data to the interactive client component.
 */
const ProjectDetailPage = async ({ params }: ProjectDetailPageProps) => {
  const { id } = params;
  
  // Fetch the project on the server.
  const initialProject = await fetchProjectById(id);

  // If fetchProjectById returns null (not found, auth error, etc.),
  // this will render the nearest not-found.tsx file.
  if (!initialProject) {
    notFound();
  }

  // The server has done its job. Now, render the client component
  // which will handle all user interactions, state, and mutations.
  return <ProjectDetailClient initialProject={initialProject} />;
};

export default ProjectDetailPage;
