import React from 'react';
import { ProjectSummary } from '@/types/project';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDuration } from '@/lib/formatters';

interface ProjectCardProps {
  project: ProjectSummary;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const isHoverable = project.status !== 'error'; // Not clickable if error status

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-6 mb-4 cursor-pointer transition-all duration-200
        ${isHoverable ? 'hover:shadow-lg hover:border-blue-500 border border-transparent' : ''}
        ${project.status === 'error' ? 'opacity-70 border-red-500 border' : ''}
      `}
      style={project.status === 'error' ? { pointerEvents: 'none' } : {}} // Disable clicks for error projects
      onClick={isHoverable ? handleClick : undefined}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>

      <div className="text-gray-600 text-sm">
        {project.status === 'active' ? (
          <>
            <p>Elapsed Time: {formatDuration(project.totalRuntime)}</p>
            <p>Current Cost: {formatCurrency(project.costToDate)}</p>
          </>
        ) : (
          <>
            <p>Total Elapsed Time: {formatDuration(project.totalRuntime)}</p>
            <p>Total Cost: {formatCurrency(project.costToDate)}</p>
          </>
        )}
      </div>

      {project.status === 'error' && (
        <p className="text-red-500 text-sm mt-2">Error: Project failed</p>
      )}
    </div>
  );
};

export default ProjectCard;
