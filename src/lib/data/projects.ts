import {
  Project,
  ProjectSummary,
  ExploreProjectsParams,
  PaginatedResponse,
} from '@/types/project'; // Assuming your types are correctly exported
import { FAKE_EXPLORE_PROJECTS, FAKE_PROJECTS } from '@/lib/dev/fakeData';
import { serverFetch } from '@/lib/server-api';

/**
 * SERVER-SIDE FETCH: Fetches the list of projects for the logged-in user.
 * Corresponds to your `useUserProjects` hook.
 */
export async function fetchUserProjects(): Promise<Project[]> {
    if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') return FAKE_PROJECTS;

  try {
    const res = await serverFetch('/projects');
    if (!res.ok) {
      console.error('fetchUserProjects:', res.statusText);
      return [];
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * SERVER-SIDE FETCH: Fetches public projects for the Explore page.
 * Corresponds to your `useExploreProjects` hook.
 */
export async function fetchExploreProjects(
  params: ExploreProjectsParams
): Promise<PaginatedResponse<ProjectSummary>> {
  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') return { data: FAKE_EXPLORE_PROJECTS, page: 1, limit: 10, total: 0, totalPages: 0 };
  const qs = new URLSearchParams(params as any).toString();
  const res = await serverFetch(`/projects/explore?${qs}`,
    undefined,
    {
    needsAuth: false,
    cache: 'force-cache',
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error('fetchExploreProjects:', res.statusText);
    return { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
  }
  return res.json();
}

/**
 * SERVER-SIDE FETCH: Fetches a single project by its ID.
 * Corresponds to your `useProject` hook.
 */
export async function fetchProjectById(projectId: string): Promise<Project | null> {
  if (!projectId) return null;
  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true')
    return FAKE_PROJECTS.find(p => p._id === projectId) ?? null;

  try {
    const res = await serverFetch(`/projects/${projectId}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error('fetchProjectById:', res.statusText);
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
