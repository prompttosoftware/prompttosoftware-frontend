import { httpClient } from './httpClient'; // Use named import for httpClient
import { setupHttpClientInterceptors } from './httpClient';
import { paymentsService } from '../services/paymentsService'; // Import the PaymentsService

import { UserProfile } from '@/types/auth'; // Import UserProfile type
import { Project, ProjectSummary } from '@/types/project'; // Import Project and ProjectSummary types

export { paymentsService }; // Re-export paymentsService

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const api = {
  // Authentication
  login: (code: string) => httpClient.post("/auth/github", { code }),
  getUserProfile: (): Promise<UserProfile> => httpClient.get<UserProfile>("/users/me"),

  // Projects
  getUserProjects: (): Promise<ProjectSummary[]> => httpClient.get<ProjectSummary[]>("/projects"),
  getProject: (id: string): Promise<Project> => httpClient.get<Project>(`/projects/${id}`),
  createNewProject: (projectName: string, githubRepoUrl: string) =>
    httpClient.post<Project>("/projects", { projectName, githubRepoUrl }),
  startProject: (id: string): Promise<void> => httpClient.post(`/projects/${id}/start`),
  stopProject: (id: string): Promise<void> => httpClient.post(`/projects/${id}/stop`),
deleteProject: (id: string): Promise<void> => httpClient.delete(`/projects/${id}`),
};

// Setup interceptors should be called once in the app's entry point
export const setupInterceptors = setupHttpClientInterceptors;
