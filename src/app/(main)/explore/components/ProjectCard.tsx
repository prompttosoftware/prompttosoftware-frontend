import React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectSummary } from '@/types/project';

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div
      className="
        flex flex-col p-4 border border-gray-200 rounded-lg shadow-md
        hover:shadow-lg hover:border-blue-500 transition-all duration-200 ease-in-out
        cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-700
      "
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{project.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
        {project.description}
      </p>
      {project.repositoryUrl && (
        <p className="text-xs text-blue-600 dark:text-blue-400 truncate mb-2">
          {/* Prevent card click when clicking link (if a real link were here) */}
          <span className="hover:underline">{project.repositoryUrl}</span>
        </p>
      )}
      {project.githubStars !== undefined && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          ⭐ {project.githubStars.toLocaleString()} stars
        </p>
      )}
    </div>
  );
};

export default ProjectCard;
