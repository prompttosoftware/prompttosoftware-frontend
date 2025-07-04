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

type AiModel = {
  id: string;
  alias: string;
  intelligence: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
  apiKey: string;
  note?: string;
};

export interface ProjectFormData {
  description: string;
  maxRuntimeHours: number;
  maxBudget: number;
  githubRepositories: GithubRepository[];
  advancedOptions: {
    aiModels: AiModel[];
    installations: string[];
    jiraLinked: boolean;
  };
}
