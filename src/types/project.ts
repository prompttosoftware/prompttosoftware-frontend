export interface ProjectStatus {
  id: string;
  projectId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  updatedAt: string;
  createdAt: string;
  elapsedTime: number; // Add this field
  cost: number; // Add this field
  pendingSensitiveRequest?: boolean;
}
