import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AccountUsageSection from './components/AccountUsageSection';
import ActiveProjectsSummary from './components/ActiveProjectsSummary';
import { getInitialAuthData } from '@/lib/server-auth'; // Server-side auth check
import { fetchUserProjects } from '@/lib/data/projects'; // Server-side data fetching
import { Project, Status } from '@/types/project';

// Define which statuses are considered "active" for the summary component
const ACTIVE_STATUSES: Status[] = ['in_progress', 'starting', 'stopping'];

export default async function DashboardPage() {
  // 1. Fetch user data and projects in parallel on the server.
  const [{ user }, allProjects] = await Promise.all([
    getInitialAuthData(),
    fetchUserProjects(),
  ]);

  // 2. If not authenticated, redirect to the login page immediately.
  // This is more efficient and secure than a client-side check.
  if (!user) {
    redirect('/login');
  }

  // 3. Filter the projects on the server to get only the active ones.
  // This prevents sending unnecessary data to the client.
  const activeProjects = allProjects.filter((project: Project) =>
    ACTIVE_STATUSES.includes(project.status)
  );

  // 4. Render the page with the pre-fetched data passed as props.
  // The browser receives a fully-rendered page with no client-side loading spinners.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Welcome, {user.name}!</h1>
        
        {/* Pass the full user object to the usage section */}
        <AccountUsageSection initialUser={user} />

        <section className="w-full max-w-5xl mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-left">Active Projects</h2>
            <Link href="/projects" passHref>
              <Button variant="outline">View all</Button>
            </Link>
          </div>
          {/* Pass the pre-filtered list of active projects */}
          <ActiveProjectsSummary initialProjects={activeProjects} />
        </section>
      </main>
    </div>
  );
}
