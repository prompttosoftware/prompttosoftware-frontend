import { fetchExploreProjects } from '@/lib/data/projects';
import { ExploreProjectsParams } from '@/types/project';
import ExploreClient from './components/ExploreClient';

// Define a type for the search params for better type safety.
interface ExplorePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * This is the main Server Component for the /explore route.
 * 1. It reads initial filter/sort/pagination state from the URL's search parameters.
 * 2. It fetches the initial set of projects on the server using `fetchExploreProjects`.
 * 3. It passes this initial data and params to the interactive `ExploreClient` component.
 */
export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  // Parse and validate search params, providing sensible defaults.
  const params: ExploreProjectsParams = {
    query: typeof searchParams.query === 'string' ? searchParams.query : '',
    sortBy: typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'createdAt',
    sortOrder: typeof searchParams.sortOrder === 'string' ? searchParams.sortOrder : 'desc',
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1,
    limit: typeof searchParams.limit === 'string' ? parseInt(searchParams.limit, 10) : 12,
  };

  // Fetch the initial data on the server.
  // This happens before the page is rendered and sent to the browser.
  const initialData = await fetchExploreProjects(params);

  return (
    <div className="container mx-auto p-4">
      {/* 
        Render the Client Component, which will handle all user interactions.
        We pass the server-fetched data and initial params as props.
      */}
      <ExploreClient initialData={initialData} initialParams={params} />
    </div>
  );
}
