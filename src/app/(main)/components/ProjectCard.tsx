import React from 'react';
import { ProjectSummary } from '@/types/project';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDuration } from '@/lib/formatters';
import { intervalToDuration } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalError } from '@/hooks/useGlobalError';
import LoadingSpinner from './LoadingSpinner';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

// shadcn/ui components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react'; // Import the ellipsis icon

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  const { token } = useAuth();
  const { showError } = useGlobalError(); // Use the global error hook
  const queryClient = useQueryClient(); // Initialize queryClient for invalidation


  const isPendingStatus = project.status === 'starting' || project.status === 'stopping';
  const isLoading = isPendingStatus;

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const handleStartProject = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (!token) return;
  
    // The disabled state and spinner are handled by `isLoading` derived from
    // `project.status` which is updated via polling. No local `isLoading` state needed.
    try {
      await api.startProject(project.id);
      // Polling will update project status, causing re-render
    } catch (error) {
      console.error('Failed to start project:', error);
      showError('Failed to start project. Please try again.'); // Show user-friendly error
    }
  };
  
  const handleStopProject = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (!token) return;
  
    // The disabled state and spinner are handled by `isLoading` derived from
    // `project.status` which is updated via polling. No local `isLoading` state needed.
    try {
      await api.stopProject(project.id);
      // Polling will update project status, causing re-render
    } catch (error) {
      console.error('Failed to stop project:', error);
      showError('Failed to stop project. Please try again.'); // Show user-friendly error
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (!token) return;

    try {
      await api.deleteProject(project.id);
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Invalidate and refetch projects
      // Optionally show a success message
    } catch (error) {
      console.error('Failed to delete project:', error);
      showError('Failed to delete project. Please try again.');
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
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing immediately
                  className="text-red-600 focus:text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    project &quot;{project.name}&quot; and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-gray-600 text-sm">
        {project.status === 'active' || project.status === 'starting' ? (
          <>
            <p>Elapsed Time: {formatDuration(intervalToDuration({ start: 0, end: project.totalRuntime * 1000 }))}</p>
            <p>Current Cost: {formatCurrency(project.costToDate)}</p>
          </>
        ) : (
          <>
            <p>Total Elapsed Time: {formatDuration(intervalToDuration({ start: 0, end: project.totalRuntime * 1000 }))}</p>
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
