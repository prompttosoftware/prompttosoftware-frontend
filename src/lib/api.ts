import { httpClient } from './httpClient';
import { setupHttpClientInterceptors } from './httpClient';
import { paymentsService } from '../services/paymentsService';

// Auth Types
import { UserProfile, AuthResponse, SavedCard } from '@/types/auth';

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
    ProjectActionResponse,
    ExploreProjectsParams,
    ProjectFormData
} from '@/types/project';

// API Key Types
export interface ApiKey {
  provider: string;
  masked_key: string; // Backend returns masked version like "sk-...abc123"
}

export interface ApiKeyPayload {
  provider: string;
  api_key: string;
}

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
  data: { user: any }; // temporarily any for mapping
}
interface BackendAuthResponse {
  success: boolean;
  token: string;
  data: { user: UserProfile; };
}
interface ApiKeyResponse {
  success: boolean;
  data: ApiKey;
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

    // Map backend IUserObject to frontend UserProfile
    const backendUser = response.data.data.user;

    const userProfile: UserProfile = {
      _id: backendUser._id,
      email: backendUser.email,
      isNewUser: backendUser.isNewUser ?? false, // fallback if missing
      balance: backendUser.balance,
      name: backendUser.name,
      avatarUrl: backendUser.avatarUrl,
      role: backendUser.role, // optional if you have roles
      integrations: {
        jira: {
          isLinked: backendUser.integrations?.jira?.isLinked,
        }
      },
      apiKeys: backendUser.apiKeys || [],
      savedCards: backendUser.savedCards || [],
      starredProjects: backendUser.starredProjects || [],
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
    };

    return userProfile;
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
    await httpClient.delete("/users/me");
  },

  // API Key Management
  /**
   * Saves a new API key for the authenticated user.
   * POST /api-keys
   */
  saveApiKey: async (payload: ApiKeyPayload): Promise<ApiKey> => {
    const response = await httpClient.post<ApiKeyResponse>("/me/apikeys", payload);
    return response.data.data;
  },

  /**
   * Deletes an API key by provider.
   * DELETE /api-keys/:provider
   */
  deleteApiKey: async (provider: string): Promise<void> => {
    await httpClient.delete(`/me/apikeys/${provider}`);
  },

 // project lifecycle
  /**
   * --- MODIFIED ---
   * Creates a new project and initiates its start-up process.
   * The payload is now the complete form data.
   * Corresponds to: POST /api/projects
   */
  createProject: async (payload: ProjectFormData): Promise<Project> => {
      // The backend now returns the full project object directly on creation.
      // We expect a response like: { id: "...", name: "...", ... }
      const response = await httpClient.post<Project>("/projects", payload);
      return response.data;
  },

  /**
   * --- NEW ---
   * Updates an existing project's details.
   * The payload is the complete form data.
   * Corresponds to: PUT /api/projects/:projectId
   */
  updateProject: async (projectId: string, payload: ProjectFormData): Promise<Project> => {
      // The backend returns the updated full project object.
      const response = await httpClient.put<Project>(`/projects/${projectId}`, payload);
      return response.data;
  },

  /**
   * Fetches the list of projects for the currently logged-in user.
   * Corresponds to: GET /projects
   */
  listUserProjects: async (): Promise<Project[]> => {
    const response = await httpClient.get<Project[]>('/projects');
    return response.data;
  },

  /**
   * Fetches the complete data for a single project by its ID.
   * Corresponds to: GET /projects/:projectId
   * @param projectId - The ID of the project to fetch.
   */
  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await httpClient.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  /**
   * Deletes a project by its ID.
   * DELETE /projects/:projectId
   */
  deleteProject: async (projectId: string): Promise<ProjectActionResponse> => {
    const response = await httpClient.delete<ProjectActionResponse>(`/projects/${projectId}`);
    return response.data;
  },

  /**
   * Searches and filters public projects on the Explore page.
   * Corresponds to: GET /projects/explore
   * @param params - The query, sorting, and pagination parameters.
   */
  searchExploreProjects: async (params: ExploreProjectsParams): Promise<PaginatedResponse<ProjectSummary>> => {
    // We pass the params object, and axios will automatically serialize it into URL query parameters.
    // e.g., { page: 1, sortBy: 'stars' } becomes ?page=1&sortBy=stars
    const response = await httpClient.get<PaginatedResponse<ProjectSummary>>('/projects/explore', {
      params,
    });
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

  /**
   * Links a Jira account to the user's profile.
   * This is the final step in the OAuth flow, where the frontend sends
   * the authorization code from Jira to the backend.
   * POST /auth/jira/callback
   */
  linkJiraAccount: async (code: string): Promise<UserProfile> => {
    // The backend will exchange this code for an access token and save it.
    // It should return the updated user profile, which includes a flag
    // indicating the Jira account is now linked.
    const response = await httpClient.post<UserProfileResponse>("/jira/callback", { code });
    return response.data.data.user;
  },

  /**
   * Save or update a saved card.
   * POST /me/card
   */
  saveCard: async (card: SavedCard): Promise<UserProfile> => {
    const response = await httpClient.post<UserProfileResponse>("/me/card", card);
    // Return the updated user profile after mapping
    const backendUser = response.data.data.user;

    return {
      _id: backendUser._id,
      email: backendUser.email,
      isNewUser: backendUser.isNewUser ?? false,
      balance: backendUser.balance,
      name: backendUser.name,
      avatarUrl: backendUser.avatarUrl,
      role: backendUser.role,
      integrations: {
        jira: {
          isLinked: backendUser.integrations?.jira?.isLinked,
        }
      },
      apiKeys: backendUser.apiKeys || [],
      savedCards: backendUser.savedCards || [],
      starredProjects: backendUser.starredProjects || [],
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
    };
  },

  /**
   * Delete a saved card by cardId.
   * DELETE /me/card/:cardId
   */
  deleteCard: async (cardId: string): Promise<UserProfile> => {
    const response = await httpClient.delete<UserProfileResponse>(`/me/card/${cardId}`);

    const backendUser = response.data.data.user;

    return {
      _id: backendUser._id,
      email: backendUser.email,
      isNewUser: backendUser.isNewUser ?? false,
      balance: backendUser.balance,
      name: backendUser.name,
      avatarUrl: backendUser.avatarUrl,
      role: backendUser.role,
      integrations: {
        jira: {
          isLinked: backendUser.integrations?.jira?.isLinked,
        }
      },
      apiKeys: backendUser.apiKeys || [],
      savedCards: backendUser.savedCards || [],
      starredProjects: backendUser.starredProjects || [],
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
    };
  },

  /**
   * Stars a project. Returns the new star count or a success message.
   * POST /projects/:projectId/star
   */
  starProject: async (projectId: string): Promise<{ stars: number }> => {
    const response = await httpClient.post<{ data: { stars: number } }>(`/projects/${projectId}/star`);
    return response.data.data;
  },

  /**
   * Unstars a project. Returns the new star count or a success message.
   * POST /projects/:projectId/unstar
   */
  unstarProject: async (projectId: string): Promise<{ stars: number }> => {
    const response = await httpClient.post<{ data: { stars: number } }>(`/projects/${projectId}/unstar`);
    return response.data.data;
  },
};

// Setup interceptors should be called once in the app's entry point
export const setupInterceptors = setupHttpClientInterceptors;
