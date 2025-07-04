'use client';

import React from 'react';
import { usePolling } from '@/hooks/usePolling'; // Adjust path if necessary
import { ProjectStatus } from '@/types/project'; // Adjust path if necessary

interface ProjectStatusDemoProps {
  projectId: string;
}

const ProjectStatusDemo: React.FC<ProjectStatusDemoProps> = ({ projectId }) => {
  const { data, isLoading, error } = usePolling(
    projectId, // The usePolling hook expects projectId, not the full URL string as its first argument
    { refetchInterval: 1000 }, // Poll every 1 second
  );

  if (isLoading) {
    return (
      <div className="p-4 border rounded-md shadow-sm">
        <p className="text-gray-600">Loading project status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-400 rounded-md shadow-sm bg-red-50">
        <p className="text-red-700">Error: Live updates temporarily unavailable.</p>
        <p className="text-red-500 text-sm">{error.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 border rounded-md shadow-sm">
        <p className="text-gray-600">No project status data available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-blue-200 rounded-md shadow-md bg-blue-50">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Project: {projectId}</h3>
      <p className="text-blue-700">
        Status: <span className="font-bold text-lg text-blue-900">{data.status}</span>
      </p>
      <p className="text-blue-700">
        Elapsed Time: <span className="font-bold text-lg text-blue-900">{data.elapsedTime}s</span>
      </p>
      <p className="text-blue-700">
        Cost: <span className="font-bold text-lg text-blue-900">${data.cost.toFixed(2)}</span>
      </p>
      <p className="text-blue-700">
        Progress:{' '}
        <span className="font-bold text-lg text-blue-900">{Math.round(data.progress)}%</span>
      </p>
      <p className="text-xs text-blue-500 mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default ProjectStatusDemo;
