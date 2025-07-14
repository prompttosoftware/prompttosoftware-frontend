import { fetchExploreProjects } from '@/lib/data/projects';
import { ExploreProjectsParams } from '@/types/project';
import ExploreClient from './components/ExploreClient';

/**
 * This is the main Server Component for the /explore route.
 * 1. It reads initial filter/sort/pagination state from the URL's search parameters.
 * 2. It fetches the initial set of projects on the server using `fetchExploreProjects`.
 * 3. It passes this initial data and params to the interactive `ExploreClient` component.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {

  // Await the searchParams
  const sParams = await searchParams;

  // Parse and validate search params, providing sensible defaults.
  const validSortBy = ['stars', 'createdAt'] as const;
  const validSortOrder = ['asc', 'desc'] as const;

  function isValidSortBy(value: string): value is (typeof validSortBy)[number] {
    return validSortBy.includes(value as any);
  }

  function isValidSortOrder(value: string): value is (typeof validSortOrder)[number] {
    return validSortOrder.includes(value as any);
  }

  const params: ExploreProjectsParams = {
    query: typeof sParams.query === 'string' ? sParams.query : '',
    sortBy: isValidSortBy(sParams.sortBy as string) ? sParams.sortBy as 'stars' | 'createdAt' : 'createdAt',
    sortOrder: isValidSortOrder(sParams.sortOrder as string) ? sParams.sortOrder as 'asc' | 'desc' : 'desc',
    page: typeof sParams.page === 'string' ? parseInt(sParams.page, 10) : 1,
    limit: typeof sParams.limit === 'string' ? parseInt(sParams.limit, 10) : 12,
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
