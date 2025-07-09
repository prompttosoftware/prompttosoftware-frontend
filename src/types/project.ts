export interface HistoryItem {
  timestamp: string;
  type: 'message' | 'status_update' | 'sensitive_request' | 'system_event' | 'cost_update'; // Example types, adjust as needed
  content: string;
  sender?: 'user' | 'agent' | 'system'; // Optional sender for messages/system activities
}

export interface ProjectMessage {
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
}

export interface ProjectStatus {
  id: string;
  projectId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'starting' | 'stopping';
  progress: number; // 0-100
  message: string;
  updatedAt: string;
  createdAt: string;
  elapsedTime: number;
  cost: number;
  pendingSensitiveRequest?: boolean;
}

export interface AIModelConfig {
    provider: string;
    modelName: string;
    apiKey?: string; // Handled by PROM-61, but important for structure
}

export interface NewProjectModels {
    utility?: AIModelConfig[];
    low?: AIModelConfig[];
    medium?: AIModelConfig[];
    high?: AIModelConfig[];
    super?: AIModelConfig[];
    backup?: AIModelConfig[];
}

export interface ProjectFormData {
  description: string;
  maxRuntimeHours: number;
  maxBudget: number;
  githubRepositories: GithubRepository[];
  advancedOptions: {
    aiModels: NewProjectModels; // Updated to use NewProjectModels
    installations: { ecosystem: string, name: string }[];
    jiraLinked: boolean;
  };
}

/**
 * Represents a single GitHub repository linked to a project.
 */
export interface GithubRepository {
  type: 'new' | 'existing';
  name?: string; // For 'new'
  isPrivate?: boolean; // For 'new'
  url?: string; // For 'existing'
}

/**
 * Represents the full details of a project.
 */
export interface Project {
  id: string; // MongoDB ObjectId
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived' | 'failed' | 'starting' | 'stopping';
  desiredStatus?: 'pending' | 'in_progress' | 'completed' | 'archived';
  ownerId: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  lastError?: string;
  pendingSensitiveRequest?: any; // Define this more strictly if you know the structure
  // Add other fields from your backend model as needed
  cost: number;
  elapsedTime: number;
  progress: number;
  description: string;
  repositories: GithubRepository[];
  history: HistoryItem[];
}

/**
 * A summarized version of a project for list views.
 */
export interface ProjectSummary {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived' | 'failed' | 'starting' | 'stopping';
  createdAt: string;
  costToDate: number;
  totalRuntime: number;
  progress: number;
}


/**
 * Represents an item in a project's history log.
 */
export interface HistoryItem {
  id: string;
  projectId: string;
  timestamp: string;
  sender?: 'user' | 'agent' | 'system';
  type: 'message' | 'status_update' | 'sensitive_request' | 'system_event' | 'cost_update';
  content: string;
}

// API Payload and Response Types

/**
 * Payload for creating a new project.
 * POST /projects
 */
export interface CreateProjectPayload {
  name: string;
  // Add any other fields from your createProjectSchema
}

/**
* Payload for sending a message to a project.
* POST /projects/:projectId/message
*/
export interface UserMessagePayload {
  message: string;
}

/**
* Payload for responding to a sensitive data request.
* POST /projects/:projectId/response-sensitive
*/
export interface SensitiveDataResponsePayload {
  requestId: string; // UUID
  approved: boolean;
  data?: Record<string, string>; // Optional data object
}

/**
 * Response type for listing projects.
 * GET /projects
 */
export interface ListProjectsResponse {
    success: boolean;
    data: ProjectSummary[];
}

/**
 * Response type for getting a single project.
 * GET /projects/:projectId
 */
export interface GetProjectResponse {
    success: boolean;
    data: Project;
}

/**
 * Generic success response for actions like start, stop, delete.
 */
export interface ProjectActionResponse {
    success: boolean;
    message: string;
}
