'use client';

import { ProjectSummary } from '@/types/project';
import { useRouter } from 'next/navigation';
import { Github, Trash2 } from 'lucide-react'; // Import Trash2 icon
import { api } from '@/lib/api'; // Import the api client
import {
  showConfirmationDialog,
  setConfirmationDialogLoading,
  hideConfirmationDialog
} from '@/store/globalErrorStore'; // Import confirmation dialog actions
import { useState } from 'react'; // Import useState for local loading
import { toast } from 'sonner'; // Import toast for notifications

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false); // Local loading state for the project card

  const handleClick = () => {
    if (!isDeleting) { // Only navigate if not currently deleting
      router.push(`/projects/${project.id}`);
    }
  };

  const handleDeleteClick = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click event from firing

    showConfirmationDialog(
      'Delete Project',
      `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`,
      async () => {
        setConfirmationDialogLoading(true); // Show loading spinner in dialog
        setIsDeleting(true); // Disable the card visually
        try {
          await api.deleteProject(project.id);
          toast.success(`Project "${project.name}" deleted successfully.`);
          // Optionally, refresh the page or remove the card from the UI
          router.refresh(); // Refresh current route to refetch projects
        } catch (error) {
          console.error('Failed to delete project:', error);
          toast.error(`Failed to delete project "${project.name}".`);
        } finally {
          setConfirmationDialogLoading(false); // Hide loading spinner in dialog
          hideConfirmationDialog(); // Close the dialog
          setIsDeleting(false); // Re-enable the card visually
        }
      },
      {
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    );
  };

  return (
    <div
      className={`
        bg-white p-6 rounded-lg shadow-sm transition-all duration-200
        cursor-pointer border border-gray-200 flex flex-col h-full
        ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
      `}
      onClick={handleClick}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
        {project.name}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
        {project.description}
      </p>
      <div className="mt-auto flex items-center justify-between text-gray-500 text-sm">
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-blue-600 flex items-center"
            onClick={(e) => e.stopPropagation()} // Prevent card click event from firing when clicking this link
          >
            <Github className="w-4 h-4 mr-1" />
            GitHub
          </a>
        )}
        {project.githubStars !== undefined && (
          <span className="ml-2">⭐ {project.githubStars}</span>
        )}
        <button
          onClick={handleDeleteClick}
          className="ml-auto p-2 rounded-full hover:bg-gray-100 transition-colors"
          disabled={isDeleting}
          aria-label={`Delete project ${project.name}`}
        >
          <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-600" />
        </button>
      </div>
      {project.createdAt && (
<div className="text-gray-400 text-xs mt-1">
  Created: {new Date(project.createdAt).toLocaleDateString()}
</div>
      )}
    </div>
  );
};

export default ProjectCard;
