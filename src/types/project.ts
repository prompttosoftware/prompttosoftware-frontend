export interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  status: 'active' | 'stopped' | 'completed' | 'error' | 'building' | 'queued';
  elapsedTime: number;
  cost: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
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

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'stopped' | 'completed' | 'failed';
  repositoryUrl: string;
  costToDate: number;
  totalRuntime: number;
  progress: number;
  githubStars?: number;
  createdAt: string;
}

type GithubRepository =
  | { type: 'new'; name: string; isPrivate: boolean }
  | { type: 'existing'; url: string };



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
    installations: string[];
    jiraLinked: boolean;
  };
}
