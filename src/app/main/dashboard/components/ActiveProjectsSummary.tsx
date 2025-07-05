import React from 'react';
import { useActiveProjects } from '@/hooks/useActiveProjects';
import { ProjectSummary } from '@/types/project';
import { DollarSign, Clock, TrendingUp } from 'lucide-react'; // Example icons

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
  const { projects, isLoading, error } = useActiveProjects();

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

  const limitedProjects = projects ? projects.slice(0, 5) : []; // Display top 5 projects

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Active Projects Summary</h2>
      {limitedProjects.length === 0 ? (
        <p className="text-gray-600">No active projects found.</p>
      ) : (
        <div className="space-y-4">
          {limitedProjects.map((project: ProjectSummary) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-bold text-blue-700 mb-2">{project.name}</h3>
              <p className="text-sm text-gray-600 mb-2 truncate">{project.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                  <span>Progress: <span className="font-medium">{project.progress.toFixed(1)}%</span></span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-purple-500 mr-2" />
                  <span>Cost to Date: <span className="font-medium">${project.costToDate.toFixed(2)}</span></span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-orange-500 mr-2" />
                  <span>Runtime: <span className="font-medium">{formatRuntime(project.totalRuntime)}</span></span>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'stopped' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveProjectsSummary;
