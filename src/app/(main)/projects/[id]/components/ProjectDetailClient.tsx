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

interface ProjectDetailClientProps {
  initialProject: Project;
}

export default function ProjectDetailClient({ initialProject }: ProjectDetailClientProps) {
  // --- HOOKS ---
  const { data: project } = useProject(initialProject._id, {
    initialData: initialProject,
  });

  // Use initialProject._id as fallback to prevent undefined errors
  const projectId = project?._id !== undefined ? project._id : initialProject._id;
  const { startProject, stopProject, deleteProject, sendMessage } = useProjectActions(projectId);
  const { showConfirmation, hideConfirmation } = useGlobalErrorStore();

  // Use the current project or fallback to initialProject
  const currentProject = project || initialProject;

  const handleDeleteConfirm = () => {
    deleteProject.mutate(undefined, {
      onSuccess: () => {
        toast.success('Project deletion initiated.');
        // The hook already handles redirection.
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`);
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

  // Always use currentProject to ensure we have valid data
  return (
    <>
      <div className="container mx-auto p-4">
        {/* --- Top Panel --- */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <ProjectHeader
            projectId={currentProject._id}
            name={currentProject.name}
            onDeleteClick={handleDeleteClick}
          />
          <ProjectStatus
            status={currentProject.status}
            lastError={currentProject.lastError ?? null}
          />
          <ProjectActions
            projectStatus={currentProject.status}
            startProject={startProject}
            stopProject={stopProject}
          />
        </div>
        {/* --- History/Chat Panel --- */}
        <div className="flex flex-col h-[60vh] bg-white shadow rounded-lg">
          <ProjectHistory history={currentProject.history} />
          <MessageInput sendMessage={sendMessage} />
        </div>
      </div>
      {/* --- Confirmation Dialog --- */}
      <ConfirmationDialog />
    </>
  );
}
