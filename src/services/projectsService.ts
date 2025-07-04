import { httpClient } from '../lib/httpClient';
import { ProjectSummary } from '../types/project';

export async function getExploreProjects(): Promise<ProjectSummary[]> {
  try {
    const response = await httpClient.get<ProjectSummary[]>('/projects/explore');
    return response.data;
  } catch (error) {
    console.error('Error fetching explore projects:', error);
    throw error; // Re-throw to allow further error handling up the call stack
  }
}
