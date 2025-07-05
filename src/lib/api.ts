import { httpClient } from './httpClient'; // Use named import for httpClient
import { setupHttpClientInterceptors } from './httpClient';
import { paymentsService } from '../services/paymentsService'; // Import the PaymentsService

import { UserProfile } from '@/types/auth'; // Import UserProfile type
import { Project, ProjectSummary, HistoryItem } from '@/types/project'; // Import Project, ProjectSummary, and HistoryItem types
import { getAuthenticatedUserProjects } from '../services/projectsService';

export { paymentsService }; // Re-export paymentsService

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

export async function getEstimatedCost(
  description: string,
  maxRuntimeHours: number,
  maxBudget: number,
  aiModels: string[]
): Promise<CostEstimation> {
  console.log('Mock getEstimatedCost called with:', { description, maxRuntimeHours, maxBudget, aiModels });
  return {
    cost: 100.00,
    durationHours: 50,
    tokensUsed: 100000,
  };
}

export const api = {
  // Authentication
  login: (code: string) => httpClient.post("/auth/github", { code }),
  getUserProfile: (): Promise<UserProfile> => httpClient.get<UserProfile>("/users/me"),

  // Projects
  getUserProjects: getAuthenticatedUserProjects,
  getProject: async (id: string): Promise<Project> => {
    // Mock getProject to return sample data
    console.log(`Mocking getProject for ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return {
      id: "mock-project-id-123",
      name: "Mock Frontend Project",
      githubRepoUrl: "https://github.com/mockuser/mock-frontend-project",
      status: "completed",
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-07-05T12:00:00Z",
      lastActive: "2024-07-05T12:00:00Z",
      cost: 150.75,
      apiKey: "mock-api-key",
      ownerId: "mock-user-id",
      progress: "100%",
      estimatedCost: 200,
      estimatedDurationHours: 100,
      tokensUsed: 500000,
    };
  },
  createNewProject: (projectName: string, githubRepoUrl: string) =>
    httpClient.post<Project>("/projects", { projectName, githubRepoUrl }),
  startProject: (id: string): Promise<void> => httpClient.post(`/projects/${id}/start`),
  stopProject: (id: string): Promise<void> => httpClient.post(`/projects/${id}/stop`),
deleteProject: (id: string): Promise<void> => httpClient.delete(`/projects/${id}`),
sendMessage: (projectId: string, content: string): Promise<void> =>
  httpClient.post(`/projects/${projectId}/messages`, { content }),
getProjectHistory: async (projectId: string): Promise<HistoryItem[]> => {
  // Mock getProjectHistory to return sample data
  console.log(`Mocking getProjectHistory for ID: ${projectId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return [
    {
      id: "hist1",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-01T09:00:00Z",
      sender: { type: "system", id: "system" },
      type: "system_event",
      content: "Project started.",
    },
    {
      id: "hist2",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-01T09:15:00Z",
      sender: { type: "user", id: "user-1", name: "Alice" },
      type: "message",
      content: "Initial setup complete. What's next?",
    },
    {
      id: "hist3",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-01T10:00:00Z",
      sender: { type: "agent", id: "agent-1", name: "DevAgent" },
      type: "message",
      content: "Working on setting up the basic UI components. I'll inform you when the first draft is ready.",
    },
    {
      id: "hist4",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-02T11:30:00Z",
      sender: { type: "system", id: "system" },
      type: "status_update",
      content: "Status changed to 'In Progress'.",
    },
    {
      id: "hist5",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-03T14:00:00Z",
      sender: { type: "agent", id: "agent-1", name: "DevAgent" },
      type: "message",
      content: "Frontend scaffolding is ready. Please review and provide feedback.",
    },
    {
      id: "hist6",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-03T15:00:00Z",
      sender: { type: "user", id: "user-1", name: "Alice" },
      type: "message",
      content: "Looks good! Can you add a user authentication flow next?",
    },
    {
      id: "hist7",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-04T09:00:00Z",
      sender: { type: "agent", id: "agent-1", name: "DevAgent" },
      type: "message",
      content: "Alright, starting on the authentication module now. I anticipate it will take about a day.",
    },
    {
      id: "hist8",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-04T16:45:00Z",
      sender: { type: "system", id: "system" },
      type: "sensitive_request",
      content: "Requesting access to authentication secrets for environment configuration.",
    },
    {
      id: "hist9",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-05T10:30:00Z",
      sender: { type: "agent", id: "agent-1", name: "DevAgent" },
      type: "message",
      content: "Authentication feature integrated and tested. Ready for review.",
    },
    {
      id: "hist10",
      projectId: "mock-project-id-123",
      timestamp: "2024-07-05T12:00:00Z",
      sender: { type: "system", id: "system" },
      type: "status_update",
      content: "Project status updated to 'Completed'.",
    },
  ];
},
};

// Setup interceptors should be called once in the app's entry point
export const setupInterceptors = setupHttpClientInterceptors;
