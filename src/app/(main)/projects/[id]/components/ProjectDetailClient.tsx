'use client';

import React, { useState } from 'react';
import { useProject } from '@/hooks/useProject';
import { useProjectActions } from '@/hooks/useProjectActions';
import { Project } from '@/types/project';
import ConfirmationDialog from '@/app/(main)/components/ConfirmationDialog';
import toast from 'sonner';
import ProjectHeader from './ProjectHeader';
import ProjectStatus from './ProjectStatus';
import ProjectActions from './ProjectActions';
import ProjectHistory from './ProjectHistory';
import MessageInput from './MessageInput';

interface ProjectDetailClientProps {
  initialProject: Project;
}

export default function ProjectDetailClient({ initialProject }: ProjectDetailClientProps) {
  // --- HOOKS ---
  const { data: project } = useProject(initialProject.id, {
    // Seed react-query with the server-fetched data.
    // This prevents a refetch on initial load.
    initialData: initialProject,
  });
  
  const { startProject, stopProject, deleteProject, sendMessage } = useProjectActions(project!.id);
  
  // --- STATE ---
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // --- HANDLERS ---
  const handleDeleteConfirm = () => {
    deleteProject.mutate(undefined, {
      onSuccess: () => {
        toast.success('Project deletion initiated.');
        // The hook already handles redirection.
      },
      onError: (err) => {
        toast.error(`Failed to delete: ${err.message}`);
      },
      onSettled: () => {
        setShowDeleteConfirmation(false);
      },
    });
  };

  // The project data from useProject will always be available due to initialData,
  // so we can safely use the non-null assertion `!`.
  return (
    <>
      <div className="container mx-auto p-4">
        {/* --- Top Panel --- */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <ProjectHeader 
            name={project!.name} 
            onDeleteClick={() => setShowDeleteConfirmation(true)} 
          />
          <ProjectStatus 
            status={project!.status} 
            lastError={project!.lastError} 
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
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Project"
        message={`Are you sure you want to delete "${project!.name}"? This action cannot be undone.`}
        confirmPhrase={project!.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </>
  );
}
