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

export async function getExploreProjects(searchQuery?: string, sortOption?: string): Promise<ProjectSummary[]> {
  try {
    const params: { q?: string; sort?: string } = {};
    if (searchQuery) {
      params.q = searchQuery;
    }
    if (sortOption) {
      params.sort = sortOption;
    }

    const response = await httpClient.get<ProjectSummary[]>('/projects/explore', { params });
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
export async function getAllProjects(): Promise<ProjectSummary[]> {
  try {
    const response = await httpClient.get<ProjectSummary[]>('/projects'); // Assuming no params means all
    return response.data;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  }
}

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

export const createProject = async (projectData: any): Promise<any> => {
  try {
    const response = await httpClient.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const processProject = async (initProjectData: any): Promise<any> => {
  try {
    const response = await httpClient.post('/projects/process', initProjectData);
    return response.data;
  } catch (error) {
    console.error('Error processing project:', error);
    throw error;
  }
};

export const getProjectById = async (id: string): Promise<any> => {
  try {
    const response = await httpClient.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    throw error;
  }
};

export const updateProjectById = async (id: string, updateData: any): Promise<any> => {
  try {
    const response = await httpClient.put(`/projects/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw error;
  }
};

export const deleteProjectById = async (id: string): Promise<void> => {
  try {
    await httpClient.delete(`/projects/${id}`);
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw error;
  }
};
