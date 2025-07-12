// src/lib/data/projects.ts

import 'server-only'; // Ensures this code only runs on the server
import { cookies } from 'next/headers';
import {
  Project,
  ProjectSummary,
  ExploreProjectsParams,
  PaginatedResponse,
} from '@/types/project'; // Assuming your types are correctly exported
import { FAKE_PROJECTS } from '../dev/fakeData';

const API_BASE_URL = process.env.API_BASE_URL;

// A helper to get the auth token, used by multiple functions
async function getAuthHeader() {
  const token = (await cookies()).get('jwtToken')?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

/**
 * SERVER-SIDE FETCH: Fetches the list of projects for the logged-in user.
 * Corresponds to your `useUserProjects` hook.
 */
export async function fetchUserProjects(): Promise<Project[]> {
    const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';
    
      if (isDevFakeMode) {
        return FAKE_PROJECTS;
      }

  const headers = await getAuthHeader();
  if (!headers) {
    // If the user isn't logged in, they have no projects.
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers,
      // User-specific data should not be cached across requests.
      cache: 'no-store',
    });

    if (!response.ok) {
      // Log the error for debugging but return an empty array to avoid crashing the page.
      console.error(`Failed to fetch user projects: ${response.statusText}`);
      return [];
    }

    // The backend might return the data directly or nested. Adjust as needed.
    const data = await response.json();
    return data; // Assuming the endpoint returns the array directly
  } catch (error) {
    console.error('Error in fetchUserProjects:', error);
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
  // Use URLSearchParams for robust query string creation
  const searchParams = new URLSearchParams(params as any).toString();
  const url = `${API_BASE_URL}/projects/explore?${searchParams}`;

  try {
    // Public data can be cached and revalidated periodically.
    // This tells Next.js to cache the result for 300 seconds (5 minutes).
    // Subsequent visitors will get the cached version instantly.
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`Failed to fetch explore projects: ${response.statusText}`);
      // Return a default empty state on failure
      return { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
    }
    return response.json();
  } catch (error) {
    console.error('Error in fetchExploreProjects:', error);
    return { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
  }
}

/**
 * SERVER-SIDE FETCH: Fetches a single project by its ID.
 * Corresponds to your `useProject` hook.
 */
export async function fetchProjectById(projectId: string): Promise<Project | null> {
  if (!projectId) return null;

  const isDevFakeMode = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';
      
    if (isDevFakeMode) {
        const project = FAKE_PROJECTS.find(p => p.id === projectId) || null;
        return project;
    }

  // We fetch with auth headers in case the project is private.
  // If the endpoint is always public, the headers will just be ignored.
  const headers = await getAuthHeader();
  
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers: headers || {}, // Pass empty object if no auth
      // Data for a single, specific project can change. Avoid long-term caching.
      cache: 'no-store',
    });

    if (response.status === 404) {
      return null; // The project was not found
    }

    if (!response.ok) {
      console.error(`Failed to fetch project ${projectId}: ${response.statusText}`);
      return null;
    }
    
    // The backend might return the project nested under a 'data' key. Adjust if needed.
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in fetchProjectById for ${projectId}:`, error);
    return null;
  }
}
