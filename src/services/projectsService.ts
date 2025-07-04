import { httpClient } from '../lib/httpClient';
import { ProjectSummary } from '../types/project';
import { PaginatedResponse } from '../types/common';

export async function getAuthenticatedUserProjects(): Promise<ProjectSummary[]> {
  try {
    const response = await httpClient.get<ProjectSummary[]>('/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching authenticated user projects:', error);
    throw error;
  }
}

export async function getExploreProjects(): Promise<ProjectSummary[]> {
  try {
    const response = await httpClient.get<ProjectSummary[]>('/projects/explore');
    return response.data;
  } catch (error) {
    console.error('Error fetching explore projects:', error);
    throw error; // Re-throw to allow further error handling up the call stack
  }
}

/**
 * Fetches a paginated list of projects from the API.
 * @param page The page number to fetch (1-indexed).
 * @param limit The number of items per page.
 * @returns A promise that resolves to a PaginatedResponse of ProjectSummary objects.
 * @throws An error if the API request fails.
 */
export async function getProjects(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<ProjectSummary>> {
  try {
    const response = await httpClient.get<PaginatedResponse<ProjectSummary>>('/projects', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching projects (page: ${page}, limit: ${limit}):`, error);
    throw error; // Re-throw to allow further error handling
  }
}

export const deleteProjectById = async (id: string): Promise<void> => {
  try {
    await httpClient.delete(`/projects/${id}`);
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw error;
  }
};
