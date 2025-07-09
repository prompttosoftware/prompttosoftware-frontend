import { httpClient } from './httpClient';
import { setupHttpClientInterceptors } from './httpClient';
import { paymentsService } from '../services/paymentsService';

// Auth Types
import { UserProfile, AuthResponse } from '@/types/auth';

// Project Types
import {
    Project,
    ProjectSummary,
    HistoryItem,
    CreateProjectPayload,
    UserMessagePayload,
    SensitiveDataResponsePayload,
    ListProjectsResponse,
    GetProjectResponse,
    ProjectActionResponse
} from '@/types/project';

export { paymentsService };

// Generic/Utility Types from your original file
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface CostEstimation {
  cost: number;
  durationHours: number;
  tokensUsed: number;
}
export interface AiModel {
  id: string;
  intelligence: string;
  provider: string;
  modelName: string;
}
interface UserProfileResponse {
    success: boolean;
    data: { user: UserProfile; };
}
interface BackendAuthResponse {
  success: boolean;
  token: string;
  data: { user: UserProfile; };
}

export async function getEstimatedCost(
  description: string,
  maxRuntimeHours: number,
  maxBudget: number,
  aiModels: AiModel[]
): Promise<CostEstimation> {
  console.log('Mock getEstimatedCost called with:', { description, maxRuntimeHours, maxBudget, aiModels });
  return { cost: 100.00, durationHours: 50, tokensUsed: 100000 };
}


export const api = {
  // authentication
  /**
   * Exchanges a GitHub OAuth code for a JWT and user profile.
   * POST /auth/github
   */
  loginWithGithub: async (code: string): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>("/auth/github", { code });
    return response.data;
  },
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await httpClient.get<UserProfileResponse>("/users/me");
    return response.data.data.user;
  },
  logout: async (): Promise<void> => {
    const response = await httpClient.post("/auth/logout");
    return response.data;
  },

  /**
   * Deletes the currently authenticated user's account.
   * DELETE /auth/me
   */
  deleteAccount: async (): Promise<void> => {
    await httpClient.delete("/auth/me");
  },

  // project lifecycle
  /**
   * Creates a new project.
   * POST /projects
   */
  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await httpClient.post<GetProjectResponse>("/projects", payload);
    return response.data.data;
  },

  /**
   * Lists all projects for the authenticated user.
   * GET /projects
   */
  listProjects: async (): Promise<ProjectSummary[]> => {
    const response = await httpClient.get<ListProjectsResponse>("/projects");
    return response.data.data;
  },

  /**
   * Retrieves a single project by its ID.
   * GET /projects/:projectId
   */
  getProject: async (projectId: string): Promise<Project> => {
    const response = await httpClient.get<GetProjectResponse>(`/projects/${projectId}`);
    return response.data.data;
  },

  /**
   * Deletes a project by its ID.
   * DELETE /projects/:projectId
   */
  deleteProject: async (projectId: string): Promise<ProjectActionResponse> => {
    const response = await httpClient.delete<ProjectActionResponse>(`/projects/${projectId}`);
    return response.data;
  },

  // Project container control
  /**
   * Sends a request to start a project's container.
   * POST /projects/:projectId/start
   */
  startProject: async (projectId: string): Promise<ProjectActionResponse> => {
    const response = await httpClient.post<ProjectActionResponse>(`/projects/${projectId}/start`);
    return response.data;
  },

  /**
   * Sends a request to stop a project's container.
   * POST /projects/:projectId/stop
   */
  stopProject: async (projectId: string): Promise<ProjectActionResponse> => {
    const response = await httpClient.post<ProjectActionResponse>(`/projects/${projectId}/stop`);
    return response.data;
  },

  /**
   * Sends a request to restart a project's container.
   * POST /projects/:projectId/restart
   */
  restartProject: async (projectId: string): Promise<ProjectActionResponse> => {
    const response = await httpClient.post<ProjectActionResponse>(`/projects/${projectId}/restart`);
    return response.data;
  },

  // Project communication & data
  /**
   * Sends a message from the user to the project agent.
   * POST /projects/:projectId/message
   */
  handleUserMessage: async (projectId: string, payload: UserMessagePayload): Promise<ProjectActionResponse> => {
    const response = await httpClient.post<ProjectActionResponse>(`/projects/${projectId}/message`, payload);
    return response.data;
  },

  /**
   * Sends the user's response to a sensitive data request.
   * POST /projects/:projectId/response-sensitive
   */
  handleSensitiveDataResponse: async (projectId: string, payload: SensitiveDataResponsePayload): Promise<ProjectActionResponse> => {
    const response = await httpClient.post<ProjectActionResponse>(`/projects/${projectId}/response-sensitive`, payload);
    return response.data;
  },
};

// Setup interceptors should be called once in the app's entry point
export const setupInterceptors = setupHttpClientInterceptors;
