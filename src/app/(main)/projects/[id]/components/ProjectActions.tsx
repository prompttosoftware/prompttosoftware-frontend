'use client';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import { UseMutationResult } from '@tanstack/react-query';
import { Status } from '@/types/project';

interface ProjectActionsProps {
  projectStatus: Status;
  startProject: UseMutationResult<any, Error, void, unknown>;
  stopProject: UseMutationResult<any, Error, void, unknown>;
}

const ProjectActions = ({ projectStatus, startProject, stopProject }: ProjectActionsProps) => {
  const isStarting = projectStatus === 'starting';
  const isStopping = projectStatus === 'stopping';
  const isRunning = projectStatus === 'in_progress';
  
  return (
    <div className="mt-6 pt-6 border-t flex justify-start gap-4">
      <Button
        onClick={() => startProject.mutate()}
        disabled={startProject.isPending || isStarting || isRunning}
        className="bg-green-500 hover:bg-green-600"
      >
        {startProject.isPending || isStarting ? <LoadingSpinner size='small' className="mr-2" /> : null}
        {startProject.isPending || isStarting ? 'Starting...' : 'Start Project'}
      </Button>
      <Button
        onClick={() => stopProject.mutate()}
        disabled={stopProject.isPending || isStopping || projectStatus === 'completed'}
        className="bg-red-500 hover:bg-red-600"
      >
        {stopProject.isPending || isStopping ? <LoadingSpinner size='small' className="mr-2" /> : null}
        {stopProject.isPending || isStopping ? 'Stopping...' : 'Stop Project'}
      </Button>
    </div>
  );
};

export default ProjectActions;
