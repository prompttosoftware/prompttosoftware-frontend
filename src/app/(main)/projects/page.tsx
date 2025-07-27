import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { fetchUserProjects } from '@/lib/data/projects';
import { Project, ProjectSummary } from '@/types/project';
import ProjectCard from '@/app/(main)/components/ProjectCard';
import EmptyState from '@/app/(main)/components/EmptyState';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export const revalidate = 60;

/**
 * This is now a React Server Component (RSC).
 * 1. It's an `async` function.
 * 2. It does not use the 'use client' directive.
 * 3. It fetches data directly on the server before rendering.
 */
const ProjectsPage = async () => {
  // Check for the auth token on the server to determine login status.
  const cookieStore = cookies();
  const isAuthenticated = (await cookieStore).has('jwtToken');

  // Fetch projects on the server. The fetch function handles auth internally
  // and will return an empty array if the user is not logged in or an error occurs.
  const projects = await fetchUserProjects();

  const renderContent = () => {
    // If the user isn't authenticated, show a login prompt.
    // This check is necessary because fetchUserProjects returns [] for unauthenticated users,
    // which is indistinguishable from a user with no projects.
    if (!isAuthenticated) {
      return (
        <EmptyState
          title="Please Log In"
          description="You need to be signed in to view your projects."
          buttonLink="/login"
          buttonText='Go to Login'
        >
        </EmptyState>
      );
    }

    // If authenticated but there are no projects, show the empty state.
    // This also gracefully handles cases where the fetch failed, as it returns [].
    if (!projects || projects.length === 0) {
      return (
        <EmptyState
          title="No Projects Yet"
          description="Get started by creating your first project."
        />
      );
    }

    if (!Array.isArray(projects)) {
      return (
        <EmptyState
          title="Error Loading Projects"
          description="We couldn't load your projects at this time. Please try again later."
        />
      );
    }

    // If we have projects, map over them and render the ProjectCard for each.
    // The data is passed as a prop to the client component `ProjectCard`.
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: Project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6" data-tutorialid="projects-page-container">
      {/* --- Page Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        {/* The "Create Project" button is only shown if the user is logged in. */}
        {isAuthenticated && (
          <Link href="/new-project" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* --- Page Content --- */}
      {/* 
        The content is rendered based on the data fetched on the server. 
        There's no client-side loading state for the initial list because 
        the data is already available when the HTML is sent to the browser.
      */}
      {renderContent()}
    </div>
  );
};

export default ProjectsPage;
