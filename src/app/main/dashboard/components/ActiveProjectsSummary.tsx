import React from 'react';
import { useActiveProjects } from '@/hooks/useActiveProjects';
import { ProjectSummary } from '@/types/project';
import { DollarSign, Clock, Github } from 'lucide-react';
import Link from 'next/link';
import ProjectProgressBar from './ProjectProgressBar';

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatRuntime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const ActiveProjectsSummary: React.FC = () => {
  const { data: projects, isLoading, error } = useActiveProjects();

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow animate-pulse">
        <h2 className="text-xl font-semibold mb-4 bg-gray-200 h-6 w-3/4 rounded"></h2>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-100 animate-pulse">
            <div className="h-4 bg-gray-300 w-1/2 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 w-1/3 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline">{error.message || 'Failed to load active projects.'}</span>
      </div>
    );
  }

  const activeProjects = projects || [];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Active Projects Summary</h2>
      {activeProjects.length === 0 ? (
        <p className="text-gray-600">No active projects found.</p>
      ) : (
        <div className="space-y-4">
          {activeProjects.map((project: ProjectSummary) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-bold text-blue-700 mb-2">{project.name}</h3>
              {project.repositoryUrl && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Github className="w-4 h-4 mr-1 text-gray-500" />
                  <Link href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500 truncate">
                    {project.repositoryUrl}
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-purple-500 mr-2" />
                  <span>Cost to Date: <span className="font-medium">${project.costToDate.toFixed(2)}</span></span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-orange-500 mr-2" />
                  <span>Runtime: <span className="font-medium">{formatRuntime(project.totalRuntime)}</span></span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress:</span>
                  <span className="text-sm font-medium text-gray-900">{project.progress.toFixed(1)}%</span>
                </div>
                <ProjectProgressBar progress={project.progress} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveProjectsSummary;
