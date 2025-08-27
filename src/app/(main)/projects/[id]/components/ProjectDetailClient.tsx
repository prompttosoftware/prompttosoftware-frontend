'use client';
import React from 'react';
import { useProject } from '@/hooks/useProject';
import { useProjectActions } from '@/hooks/useProjectActions';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { Project } from '@/types/project';
import ConfirmationDialog from '@/app/(main)/components/ConfirmationDialog';
import { toast } from 'sonner';
import MessageInput from '@/app/(main)/projects/[id]/components/MessageInput';
import ProjectActions from '@/app/(main)/projects/[id]/components/ProjectActions';
import ProjectHeader from '@/app/(main)/projects/[id]/components/ProjectHeader';
import ProjectHistory from '@/app/(main)/projects/[id]/components/ProjectHistory';
import ProjectStatus from '@/app/(main)/projects/[id]/components/ProjectStatus';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import ProjectDetails from './ProjectDetails';

interface ProjectDetailClientProps {
  initialProject: Project;
}

export default function ProjectDetailClient({ initialProject }: ProjectDetailClientProps) {
  // --- HOOKS ---
  const { data: project, isLoading, isFetching, error } = useProject(initialProject._id, {
    initialData: initialProject,
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 0.5 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  console.log('Query state:', { isLoading, isFetching, hasData: !!project, error });

  // Use initialProject._id as fallback to prevent undefined errors
  const projectId = project?._id !== undefined ? project._id : initialProject._id;
  const { startProject, stopProject, deleteProject, sendMessage } = useProjectActions(projectId);
  const { showConfirmation, hideConfirmation } = useGlobalErrorStore();

  // Use the current project or fallback to initialProject
  const currentProject = project ?? initialProject;

  const handleDeleteConfirm = () => {
    deleteProject.mutate(undefined, {
      onSuccess: () => {
        toast.success('Project deletion initiated.');
        hideConfirmation();
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`);
        hideConfirmation();
      },
    });
  };

  // --- HANDLERS ---
  const handleDeleteClick = () => {
    showConfirmation(
      "Delete Project",
      `Are you sure you want to delete "${currentProject.name}"? This action cannot be undone.`,
      handleDeleteConfirm
    );
  };

  if (!currentProject._id) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        {/* Header Skeleton */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <SkeletonLoader width="w-1/3" height="h-8" /> {/* Project name */}
          <SkeletonLoader width="w-1/6" height="h-6" /> {/* Status */}
          <div className="flex space-x-4">
            <SkeletonLoader width="w-20" height="h-10" />
            <SkeletonLoader width="w-20" height="h-10" />
          </div>
        </div>

        {/* History/Chat Skeleton */}
        <div className="flex flex-col h-[60vh] bg-card border rounded-lg p-6 space-y-4">
          <SkeletonLoader height="h-48" /> {/* History area */}
          <SkeletonLoader height="h-12" /> {/* Input area */}
        </div>
      </div>
    );
  }

  // Always use currentProject to ensure we have valid data
  return (
    <>
      <div className="container mx-auto p-4">
        {/* --- Top Panel --- */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <ProjectHeader
            projectId={currentProject._id}
            name={currentProject.name}
            onDeleteClick={handleDeleteClick}
          />
          <ProjectDetails project={currentProject} />
          <ProjectActions
            projectStatus={currentProject.status}
            startProject={startProject}
            stopProject={stopProject}
          />
        </div>
        {/* --- History/Chat Panel --- */}
        <div className="flex flex-col h-[60vh] bg-card border rounded-lg">
          <ProjectHistory history={currentProject.history} />
          <MessageInput sendMessage={sendMessage} />
        </div>
      </div>
      {/* --- Confirmation Dialog --- */}
      <ConfirmationDialog />
    </>
  );
}
