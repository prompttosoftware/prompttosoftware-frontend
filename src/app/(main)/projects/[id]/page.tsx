import { notFound } from 'next/navigation';
import { fetchProjectById } from '@/lib/data/projects';
import ProjectDetailClient from '@/app/(main)/projects/[id]/components/ProjectDetailClient';

export const dynamic = 'force-dynamic';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * This is the main Server Component for the project detail page.
 * 1. It fetches the project data on the server using the ID from the URL.
 * 2. If the project is not found (or user lacks permission), it triggers a 404 page.
 * 3. It passes the initial, server-fetched data to the interactive client component.
 */
const ProjectDetailPage = async (props: ProjectDetailPageProps) => {
  let id: string;
  
  try {
    // More defensive params handling
    console.log('Props received:', JSON.stringify(props, null, 2));
    
    if (!props || !props.params) {
      console.error('No props or params provided');
      notFound();
    }
    
    // Handle both Promise and direct object cases for backward compatibility
    let resolvedParams;
    if (typeof props.params.then === 'function') {
      // It's a Promise
      resolvedParams = await props.params;
    } else {
      // It's already an object (shouldn't happen in Next.js 15+, but just in case)
      resolvedParams = props.params as any;
    }
    
    console.log('Resolved params:', resolvedParams);
    
    if (!resolvedParams || typeof resolvedParams.id !== 'string') {
      console.error('Invalid resolved params:', resolvedParams);
      notFound();
    }
    
    id = resolvedParams.id;
    console.log('Final ID:', id);
    
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }
  
  try {
    // Fetch the project on the server.
    console.log('Fetching project with ID:', id);
    const initialProject = await fetchProjectById(id);
    
    // If fetchProjectById returns null (not found, auth error, etc.),
    // this will render the nearest not-found.tsx file.
    if (!initialProject) {
      console.log('Project not found for ID:', id);
      notFound();
    }
    
    console.log('Project found, rendering client component');
    
    // The server has done its job. Now, render the client component
    // which will handle all user interactions, state, and mutations.
    return <ProjectDetailClient initialProject={initialProject} />;
    
  } catch (error) {
    console.error('Error in ProjectDetailPage:', error);
    notFound();
  }
};

export default ProjectDetailPage;
