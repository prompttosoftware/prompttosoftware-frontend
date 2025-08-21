import { Status } from '@/types/project';

interface ProjectStatusProps {
  status: Status;
  lastError: string | null;
}

const ProjectStatus = ({ status, lastError }: ProjectStatusProps) => (
  <div className="mt-6 pt-6 border-t">
    <h2 className="text-xl font-semibold text-card-foreground mb-4">Live Status</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <span className="text-card-foreground text-sm block">Current Status</span>
        <span className="text-lg font-medium text-card-foreground capitalize">{status.replace('_', ' ')}</span>
      </div>
      <div>
        <span className="text-card-foreground text-sm block">Last Error</span>
        <span className="text-lg font-medium text-card-foreground">{lastError || 'None'}</span>
      </div>
    </div>
  </div>
);

export default ProjectStatus;
