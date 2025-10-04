// src/app/new-analysis/page.tsx
import AnalysisClient from './components/AnalysisClient';
import { fetchUserProjects } from '@/lib/data/projects';
import { Project } from '@/types/project';

// This page is now a React Server Component (RSC)
export default async function NewAnalysisPage() {
  // Fetch initial projects server-side to avoid a loading flash on the client.
  let initialProjects: Project[] = [];
  try {
    initialProjects = await fetchUserProjects();
  } catch (error) {
    console.error("Failed to fetch initial projects on the server:", error);
    // Render the form with an empty list of projects if fetching fails
  }

  return <AnalysisClient initialProjects={initialProjects} />;
}
