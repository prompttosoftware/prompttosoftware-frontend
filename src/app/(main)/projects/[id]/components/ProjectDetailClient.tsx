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
    // Seed react-query with the server-fetched data.
    // This prevents a refetch on initial load.
    initialData: initialProject,
  });
 
  const { startProject, stopProject, deleteProject, sendMessage } = useProjectActions(project!._id);
  const { showConfirmation, hideConfirmation } = useGlobalErrorStore();

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
        `Are you sure you want to delete "${project!.name}"? This action cannot be undone.`,
        handleDeleteConfirm
    );
  };

  // The project data from useProject will always be available due to initialData,
  // so we can safely use the non-null assertion `!`.
  return (
    <>
      <div className="container mx-auto p-4">
        {/* --- Top Panel --- */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <ProjectHeader
            projectId={project!._id}
            name={project!.name}
            onDeleteClick={handleDeleteClick}
          />
          <ProjectStatus
            status={project!.status}
            lastError={project!.lastError ?? null}
          />
          <ProjectActions
            projectStatus={project!.status}
            startProject={startProject}
            stopProject={stopProject}
          />
        </div>
        {/* --- History/Chat Panel --- */}
        <div className="flex flex-col h-[60vh] bg-white shadow rounded-lg">
          <ProjectHistory history={project!.history} />
          <MessageInput sendMessage={sendMessage} />
        </div>
      </div>
      {/* --- Confirmation Dialog --- */}
      <ConfirmationDialog />
    </>
  );
}
