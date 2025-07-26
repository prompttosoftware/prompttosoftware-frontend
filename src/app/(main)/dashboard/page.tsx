import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AccountUsageSection from './components/AccountUsageSection';
import ActiveProjectsSummary from './components/ActiveProjectsSummary';
import { getInitialAuthData } from '@/lib/data/user';
import { fetchUserProjects } from '@/lib/data/projects';
import { Project, Status } from '@/types/project';
import { fetchUserTransactions } from '@/lib/data/transactions';

// Define which statuses are considered "active" for the summary component
const ACTIVE_STATUSES: Status[] = ['in_progress', 'starting', 'stopping'];

export default async function DashboardPage() {
  console.debug('[DashboardPage] Starting render');
  console.debug('[DashboardPage] typeof window:', typeof window);
  console.debug('[DashboardPage] process.env.NODE_ENV:', process.env.NODE_ENV);
  
  if (typeof window !== 'undefined') {
    console.error('[DashboardPage] CRITICAL ERROR: Server component running in browser!');
  }
  
  // 1. Check authentication first - don't fetch other data for unauthenticated users
  const { user } = await getInitialAuthData();
  
  // 2. If not authenticated, redirect immediately without fetching other data
  if (!user) {
    redirect('/login');
  }

  // 3. Now fetch projects and transactions in parallel since we know user is authenticated
  const [allProjects, transactions] = await Promise.all([
    fetchUserProjects(),
    fetchUserTransactions(),
  ]);

  // 4. Prepare user data with transactions
  const userWithTransactions = {
    ...user,
    transactionHistory: transactions,
  };

  // 5. Filter projects on the server to get only active ones
  const activeProjects = allProjects.filter((project: Project) =>
    ACTIVE_STATUSES.includes(project.status)
  );

  // 6. Render the page with pre-fetched data
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Welcome, {user.name}!</h1>
       
        {/* AccountUsageSection will render immediately with server data */}
        <AccountUsageSection initialUser={userWithTransactions} />
        
        <section className="w-full max-w-5xl mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-left">Active Projects</h2>
            <Link href="/projects" passHref>
              <Button variant="outline">View all</Button>
            </Link>
          </div>
          {/* ActiveProjectsSummary will render immediately with server data */}
          <ActiveProjectsSummary initialProjects={activeProjects} />
        </section>
      </main>
    </div>
  );
}
