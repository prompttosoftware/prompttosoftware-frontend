'use client';

import React from 'react';
import { ProjectSummary } from '@/types/project';
import { Github } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress'; // Assuming this exists or will be created

interface ProjectSummaryCardProps {
  project: ProjectSummary;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatRuntime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ project }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full" data-testid="project-summary-card">
      <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
        <Link href={`/projects/${project.id}`} className="hover:underline">
          {project.name}
        </Link>
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
        {project.description}
      </p>

      <div className="mb-4">
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center text-sm"
            onClick={(e) => e.stopPropagation()} // Prevent card click event from firing
          >
            <Github className="w-4 h-4 mr-1" />
            Repository
          </a>
        )}
      </div>

      <div className="mb-2 text-gray-700 text-sm">
        <strong>Cost to Date:</strong> {formatCurrency(project.costToDate)}
      </div>
      <div className="mb-4 text-gray-700 text-sm">
        <strong>Total Runtime:</strong> {formatRuntime(project.totalRuntime)}
      </div>

      <div className="mb-2 text-gray-700 text-sm">
        <strong>Progress:</strong> {project.progress.toFixed(0)}%
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <Progress value={project.progress} className="h-2.5" />
      </div>
    </div>
  );
};

export default ProjectSummaryCard;
