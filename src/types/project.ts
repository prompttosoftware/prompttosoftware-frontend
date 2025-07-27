import * as z from 'zod';

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

export type Status = 'pending' | 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
export interface ProjectStatus {
  id: string;
  projectId: string;
  status: Status;
  progress: number; // 0-100
  message: string;
  updatedAt: string;
  createdAt: string;
  elapsedTime: number;
  cost: number;
  pendingSensitiveRequest?: boolean;
}

export interface ProjectFormData {
  description: string;
  maxRuntimeHours: number;
  maxBudget: number;
  githubRepositories: GithubRepository[];
  advancedOptions: {
    aiModels: Models;
    installations: { name: string }[];
    jiraLinked: boolean;
    jiraProjectKey?: string;
  };
}

export type Template = "android_studio" | "xcode" | "unity" | "godot" | "unreal_engine";

/**
 * Represents a single GitHub repository linked to a project.
 */
export interface GithubRepository {
  type: 'new' | 'existing';
  name?: string; // For 'new'
  isPrivate?: boolean; // For 'new'
  url?: string; // For 'existing'
  organization?: string;
  forkUrl?: string;
  template?: Template;
}

export interface Model {
  provider: Provider | undefined;
  model: string;
}

export interface Models {
  utility: Model[] | undefined;
  low: Model[] | undefined;
  medium: Model[] | undefined;
  high: Model[] | undefined;
  super: Model[] | undefined;
  backup: Model[] | undefined;
}

export interface Installation {
  ecosystem: string;
  name: string;
}

export type Provider = "google" | "openrouter" | "openai" | "groq" | "anthropic" | "deepseek";

/**
 * Represents the full details of a project.
 */
export interface Project {
  _id: string; // MongoDB ObjectId
  name: string;
  status: Status;
  desiredStatus?: Status;
  ownerId: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  lastError?: string;
  pendingSensitiveRequest?: any; // Define this more strictly if you know the structure
  // Add other fields from your backend model as needed
  cost: number;
  useJira?: boolean;
  jiraProjectKey?: string;
  elapsedTime: number;
  completeIssues: number;
  incompleteIssues: number;
  description: string;
  repositories: GithubRepository[];
  history: HistoryItem[];
  stars: number;
  installations: Installation[];
  models: Models;
}

// An interface for the populated user data
export interface ProjectCreator {
  _id: string;
  name: string;
  avatarUrl?: string;
}

// A summary version of the project for list views
export type ProjectSummary = Pick<
  Project,
  | '_id' // Make sure to use _id if you're using MongoDB/Mongoose
  | 'name'
  | 'status'
  | 'stars'
  | 'createdAt'
  | 'updatedAt'
  | 'incompleteIssues'
  | 'completeIssues'
  | 'repositories'
  | 'models'
  // You could add a 'description' field here if you add it to your backend schema
> & {
  user: ProjectCreator,
  starredByCurrentUser?: boolean;
};

// A generic type for paginated API responses
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

// Type for the parameters of the explore search, matches the Zod schema
export interface ExploreProjectsParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: 'stars' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
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

export const statusConfig = {
  running: { className: 'bg-green-500', label: 'Running' },
  pending: { className: 'bg-yellow-500 animate-pulse', label: 'Pending' },
  starting: { className: 'bg-yellow-500 animate-pulse', label: 'Starting' },
  stopping: { className: 'bg-orange-500 animate-pulse', label: 'Stopping' },
  stopped: { className: 'bg-gray-500', label: 'Stopped'},
  error: { className: 'bg-red-500', label: 'Error' },
};

const MAX_INSTALLATIONS = 20;

export const formSchema = z.object({
  description: z.string().min(10, { message: 'Project description must be at least 10 characters.' }),
  maxRuntimeHours: z.number().min(0.01, { message: 'Must be a positive number.' }),
  maxBudget: z.number().min(0.01, { message: 'Must be a positive number.' }),
  githubRepositories: z.array(
    z.union([
      z.object({ 
        type: z.literal('new'), 
        name: z.string().min(1, 'Name is required.'), 
        isPrivate: z.boolean(), 
        organization: z.string().optional(),
        forkUrl: z.string().optional(),
        template: z.enum(["android_studio", "xcode", "unity", "godot", "unreal_engine"]).optional(),
      }),
      z.object({ 
        type: z.literal('existing'), 
        url: z.string().url('Invalid URL.').min(1, 'URL is required.'),
        __justAdded: z.boolean().optional()
      }),
    ]),
  ),
  advancedOptions: z.object({
    aiModels: z.object({
      utility: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
      low: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
      medium: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
      high: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
      super: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
      backup: z.array(z.object({ provider: z.string(), model: z.string() })).default([]),
    }),
    installations: z.array(
      z.object({ ecosystem: z.string().min(1), name: z.string().min(1) })
    ).max(MAX_INSTALLATIONS, `Cannot add more than ${MAX_INSTALLATIONS} installations.`),
    jiraLinked: z.boolean(),
    jiraProjectKey: z.string().optional(),
  }),
});
