import React from 'react';
import { ProjectSummary } from '@/types/project';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import { intervalToDuration } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalError } from '@/hooks/useGlobalError';
import LoadingSpinner from './LoadingSpinner';

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showError } = useGlobalError(); // Use the global error hook

  const isPendingStatus = project.status === 'starting' || project.status === 'stopping';
  const isLoading = isPendingStatus;

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const handleStartProject = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      showError('Authentication token not found. Please log in again.');
      return;
    }

    // The disabled state and spinner are handled by `isLoading` derived from
    // `project.status` which is updated via polling. No local `isLoading` state needed.
    try {
      await axios.post(
        `/api/projects/${project.id}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Polling will update project status, causing re-render
    } catch (error) {
      console.error('Failed to start project:', error);
      showError('Failed to start project. Please try again.'); // Show user-friendly error
    }
  };

  const handleStopProject = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      showError('Authentication token not found. Please log in again.');
      return;
    }

    // The disabled state and spinner are handled by `isLoading` derived from
    // `project.status` which is updated via polling. No local `isLoading` state needed.
    try {
      await axios.post(
        `/api/projects/${project.id}/stop`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Polling will update project status, causing re-render
    } catch (error) {
      console.error('Failed to stop project:', error);
      showError('Failed to stop project. Please try again.'); // Show user-friendly error
    }
  };

  const isHoverable = project.status !== 'failed'; // Not clickable if error status

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-6 mb-4 transition-all duration-200
        ${isHoverable ? 'hover:shadow-lg hover:border-blue-500' : ''}
        ${project.status === 'failed' ? 'opacity-70 border-red-500 border' : ''}
        ${isHoverable ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={project.status === 'failed' ? { pointerEvents: 'none' } : {}} // Disable clicks for error projects
      onClick={isHoverable ? handleClick : undefined}
      onKeyDown={(e) => {
        if (isHoverable && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
      role="button"
      tabIndex={isHoverable ? 0 : -1} // Only allow tabbing if clickable
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>

      <div className="text-gray-600 text-sm">
        {project.status === 'active' || project.status === 'starting' ? (
          <>
            <p>
              Elapsed Time:{' '}
              {formatDuration(intervalToDuration({ start: 0, end: project.totalRuntime * 1000 }))}
            </p>
            <p>Current Cost: {formatCurrency(project.costToDate)}</p>
          </>
        ) : (
          <>
            <p>
              Total Elapsed Time:{' '}
              {formatDuration(intervalToDuration({ start: 0, end: project.totalRuntime * 1000 }))}
            </p>
            <p>Total Cost: {formatCurrency(project.costToDate)}</p>
          </>
        )}
      </div>

      {project.status === 'failed' && (
        <p className="text-red-500 text-sm mt-2">Error: Project failed</p>
      )}

      <div className="mt-4 flex gap-2">
        {project.status === 'active' || project.status === 'stopping' ? (
          <button
            onClick={handleStopProject}
            disabled={isLoading} // Disabled when pending or API call in progress
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" /> Stopping...
              </>
            ) : (
              'Stop'
            )}
          </button>
        ) : (
          <button
            onClick={handleStartProject}
            disabled={isLoading || project.status === 'failed'} // Disabled when pending, failed, or API call in progress
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" /> Resuming...
              </>
            ) : (
              'Resume'
            )}
          </button>
        )}
      </div>
    </div>
  );
};
export default ProjectCard;
