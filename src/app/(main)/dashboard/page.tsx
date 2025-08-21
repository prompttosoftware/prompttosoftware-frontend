import { fetchUserProjects } from '@/lib/data/projects';
import { Project, Status } from '@/types/project';
import { fetchUserTransactions } from '@/lib/data/transactions';
import DashboardClient from '@/app/(main)/dashboard/components/DashboardClient';

// Define which statuses are considered "active" for the summary component
const ACTIVE_STATUSES: Status[] = ['running', 'starting', 'stopping', 'pending'];

export default async function DashboardPage() {
  
  // 3. Now fetch projects and transactions in parallel since we know user is authenticated
  const [allProjects, transactions] = await Promise.all([
    fetchUserProjects(),
    fetchUserTransactions(),
  ]);

  // 5. Filter projects on the server to get only active ones
  const activeProjects = allProjects.filter((project: Project) =>
    ACTIVE_STATUSES.includes(project.status)
  );

  // 6. Render the page with pre-fetched data
  return (
    <DashboardClient
      activeProjects={activeProjects} 
      initialTransactions={transactions} 
    />
  );
}
