// app/(main)/projects/page.tsx
import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { fetchUserProjects } from '@/lib/data/projects';
import EmptyState from '@/app/(main)/components/EmptyState';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ProjectList from './components/ProjectsList';

export const revalidate = 60;

/**
 * This RSC now acts as a shell. It performs initial data fetching and
 * authentication checks on the server, then passes the data to a
 * client component to handle dynamic updates.
 */
const ProjectsPage = async () => {
  const cookieStore = cookies();
  const isAuthenticated = (await cookieStore).has('jwtToken');

  // We still fetch on the server to provide initial data.
  // This prevents a loading spinner on the first page load.
  const initialProjects = await fetchUserProjects();

  return (
    <div className="container mx-auto p-4 md:p-6" data-tutorialid="projects-page-container">
      {/* --- Page Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
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
        The rendering logic is now much simpler.
        We handle the unauthenticated case here, and delegate the rest
        to our new client component, hydrating it with initial data.
      */}
      {isAuthenticated ? (
        <ProjectList initialProjects={initialProjects} />
      ) : (
        <EmptyState
          title="Please Log In"
          description="You need to be signed in to view your projects."
          buttonLink="/login"
          buttonText='Go to Login'
        />
      )}
    </div>
  );
};

export default ProjectsPage;
