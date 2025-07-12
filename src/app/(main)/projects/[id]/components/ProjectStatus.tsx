import { Status } from '@/types/project';

interface ProjectStatusProps {
  status: Status;
  lastError: string | null;
}

const ProjectStatus = ({ status, lastError }: ProjectStatusProps) => (
  <div className="mt-6 pt-6 border-t border-gray-200">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">Live Status</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <span className="text-gray-500 text-sm block">Current Status</span>
        <span className="text-lg font-medium text-blue-600 capitalize">{status.replace('_', ' ')}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Last Error</span>
        <span className="text-lg font-medium text-red-600">{lastError || 'None'}</span>
      </div>
    </div>
  </div>
);

export default ProjectStatus;
