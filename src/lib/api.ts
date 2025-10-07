import { setupHttpClientInterceptors, httpClient } from '@/lib/httpClient';
import { paymentsService } from '@/services/paymentsService';
import { Analysis, AnalysisFormData, GetAnalysisResponse } from '@/types/analysis';

// Auth Types
import { UserProfile, AuthResponse } from '@/types/auth';
import { CreateChatInput, CreateChatResponse, PaginationParams, GetChatResponse, SendMessageInput, SendMessageResponse, RegenerateResponseInput, RegenerateResponse, SwitchBranchInput, SwitchBranchResponse, Chat, EditMessageInput, EditMessageResponse } from '@/types/chat';
import { SavedCard } from '@/types/payments';

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
import { Transaction } from '@/types/transactions';

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
      accountStatus: backendUser.accountStatus || 'healthy',
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
   * Creates a new project and initiates its start-up process.
   * The payload is now the complete form data.
   * Corresponds to: POST /api/projects
   */
  createProject: async (payload: ProjectFormData): Promise<Project> => {
      const response = await httpClient.post<Project>("/projects", payload);
      return response.data;
  },

  /**
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
    const response = await httpClient.get<{ data: Project[] }>('/projects');
    console.log('listUserProjects response: ' + JSON.stringify(response.data));
    return response.data.data;
  },

  /**
   * Fetches the transaction history for the currently logged-in user.
   * Corresponds to: GET /transactions
   */
  listUserTransactions: async (): Promise<Transaction[]> => {
    const response = await httpClient.get<Transaction[]>('/transactions');
    return response.data;
  },

  /**
   * Fetches the complete data for a single project by its ID.
   * Corresponds to: GET /projects/:projectId
   * @param projectId - The ID of the project to fetch.
   */
  getProjectById: async (projectId: string): Promise<Project> => {
    // 1. Tell httpClient the TRUE shape of the response data using the wrapper type.
    const response = await httpClient.get<GetProjectResponse>(`/projects/${projectId}`);

    // 2. Unwrap the response to return only the project data,
    //    fulfilling the Promise<Project> signature.
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
    const response = await httpClient.post<UserProfileResponse>("/integrations/jira/callback", { code });
    return response.data.data.user;
  },

  /**
   * Unlinks the user's Jira account.
   * Sends a DELETE request to the backend to remove Jira integration.
   * DELETE /integrations/jira/unlink
   */
  unlinkJiraAccount: async (): Promise<UserProfile> => {
    const response = await httpClient.delete<UserProfileResponse>("/integrations/jira/unlink");
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
      accountStatus: backendUser.accountStats || 'healthy',
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
    };
  },

  /**
   * Fetches the saved payment cards for the currently logged-in user.
   * Corresponds to: GET /api/v1/payments/cards
   */
  listSavedCards: async (): Promise<SavedCard[]> => {
    const response = await httpClient.get<SavedCard[]>('/payments/cards');
    return response.data;
  },

  /**
   * Deletes a specific saved card.
   * Corresponds to: DELETE /api/v1/payments/cards/:cardId
   */
  deleteSavedCard: async (cardId: string): Promise<void> => {
    await httpClient.delete(`/payments/cards/${cardId}`);
  },

  /**
   * Sets a specific card as the default.
   * Corresponds to: PATCH /api/v1/payments/cards/:cardId/set-default
   */
  setDefaultSavedCard: async (cardId: string): Promise<SavedCard[]> => {
    const response = await httpClient.patch<SavedCard[]>(`/payments/cards/${cardId}/set-default`);
    return response.data;
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

  /**
   * Fetches the complete data for a single analysis by its ID.
   * Corresponds to: GET /analysis/:analysisId
   * @param analysisId - The ID of the project to fetch.
   */
  getAnalysisById: async (analysisId: string): Promise<Analysis> => {
    const response = await httpClient.get<GetAnalysisResponse>(`/analysis/${analysisId}`);
    return response.data.data;
  },

  /**
   * Fetches the list of projects for the currently logged-in user.
   * Corresponds to: GET /analysis/user
   */
  listUserAnalysis: async (): Promise<Analysis[]> => {
    const response = await httpClient.get<{ data: Analysis[] }>('/analysis/user');
    return response.data.data;
  },

  /**
   * Deletes a analysis by its ID.
   * DELETE /analysis/:analysisId
   */
  deleteAnalysis: async (analysisId: string): Promise<ProjectActionResponse> => {
    const response = await httpClient.delete<ProjectActionResponse>(`/analysis/${analysisId}`);
    return response.data;
  },

  /**
   * Creates a new analysis and initiates its start-up process.
   * Corresponds to: POST /analysis
   */
  createAnalysis: async (payload: AnalysisFormData): Promise<Analysis> => {
      const response = await httpClient.post<Analysis>("/analysis", payload);
      return response.data;
  },

  /**
   * Stops an analysis.
   * Corresponds to: POST /:analysisId/stop
   */
  stopAnalysis: async (analysisId: string): Promise<void> => {
      await httpClient.post<Analysis>(`/analysis/${analysisId}/stop`);
  },

  /**
   * Reruns an analysis, which creates a new one and starts it.
   * Corresponds to: POST /analysis/:analysisId/rerun
   */
  rerunAnalysis: async (analysisId: string, payload?: AnalysisFormData): Promise<Analysis> => {
      const response = await httpClient.post<{ data: Analysis }>(`/analysis/${analysisId}/rerun`, payload);
      return response.data.data;
  },

  // --- Chat API Methods ---
    chat: {
        /**
         * Creates a new chat session and sends the first message.
         * Corresponds to: POST /chats
         * @param payload - The initial data for creating the chat.
         */
        createChat: async (payload: CreateChatInput): Promise<CreateChatResponse> => {
            const response = await httpClient.post<CreateChatResponse>("/chats", payload);
            return response.data;
        },

        /**
         * Fetches all chat sessions for the user with pagination.
         * Corresponds to: GET /chats
         * @param params - Pagination parameters (page, limit).
         */
        getAllChats: async (params: PaginationParams): Promise<PaginatedResponse<Chat>> => {
            const response = await httpClient.get<PaginatedResponse<Chat>>('/chats', { params });
            return response.data;
        },

        /**
         * Fetches a single chat session and its full message history for the active branch.
         * Corresponds to: GET /chats/:chatId
         * @param chatId - The ID of the chat to fetch.
         */
        getChatHistory: async (chatId: string): Promise<GetChatResponse> => {
            const response = await httpClient.get<GetChatResponse>(`/chats/${chatId}`);
            return response.data;
        },

        /**
         * Deletes an entire chat session.
         * Corresponds to: DELETE /chats/:chatId
         * @param chatId - The ID of the chat to delete.
         */
        deleteChat: async (chatId: string): Promise<void> => {
            await httpClient.delete(`/chats/${chatId}`);
        },

        /**
         * Sends a new message in an existing chat.
         * Corresponds to: POST /chats/:chatId/messages
         */
        sendMessage: async (chatId: string, payload: SendMessageInput): Promise<SendMessageResponse> => {
            const response = await httpClient.post<SendMessageResponse>(`/chats/${chatId}/messages`, payload);
            return response.data;
        },

        /**
         * Regenerates an AI response from a specific point in the conversation, creating a new branch.
         * Corresponds to: POST /chats/:chatId/regenerate
         */
        regenerateResponse: async (chatId: string, payload: RegenerateResponseInput): Promise<RegenerateResponse> => {
            const response = await httpClient.post<RegenerateResponse>(`/chats/${chatId}/regenerate`, payload);
            return response.data;
        },

        /**
         * Edits a user's message, creating a new branch and getting a new AI response.
         * Corresponds to: PUT /chats/:chatId/messages/:messageId
         * @param chatId - The ID of the chat.
         * @param messageId - The ID of the user message to edit.
         * @param payload - The new content and optional model parameters.
         */
        editUserMessage: async (chatId: string, messageId: string, payload: EditMessageInput): Promise<EditMessageResponse> => {
            const response = await httpClient.put<EditMessageResponse>(`/chats/${chatId}/messages/${messageId}`, payload);
            return response.data;
        },

        /**
         * Switches the active conversation to a different message branch.
         * Corresponds to: PUT /chats/:chatId/switch-branch
         * @param chatId - The ID of the chat.
         * @param payload - Specifies the parent message and the new branch index to activate.
         */
        switchBranch: async (chatId: string, payload: SwitchBranchInput): Promise<SwitchBranchResponse> => {
            const response = await httpClient.put<SwitchBranchResponse>(`/chats/${chatId}/switch-branch`, payload);
            return response.data;
        },
        
        /**
         * Deletes a message and its entire branch of descendants.
         * Corresponds to: DELETE /chats/messages/:messageId
         * @param messageId - The ID of the message at the root of the branch to delete.
         */
        deleteMessage: async (messageId: string): Promise<void> => {
            // Note: The route from your definition is /messages/:messageId, not nested under a chat ID.
            await httpClient.delete(`/chats/messages/${messageId}`);
        }
    }
};

// Setup interceptors should be called once in the app's entry point
export const setupInterceptors = setupHttpClientInterceptors;
