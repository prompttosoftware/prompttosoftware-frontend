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
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
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
}
