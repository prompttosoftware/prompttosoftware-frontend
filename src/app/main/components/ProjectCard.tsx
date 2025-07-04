'use client';

import { ProjectSummary } from '@/types/project';
import { useRouter } from 'next/navigation';
import { Github } from 'lucide-react';

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
        bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200
        cursor-pointer border border-gray-200 flex flex-col h-full
      "
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
      </div>
    </div>
  );
};

export default ProjectCard;
