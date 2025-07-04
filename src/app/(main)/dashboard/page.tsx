import React from 'react';
import ProjectStatusDemo from '@/app/(main)/components/ProjectStatusDemo';

const DashboardPage = () => {
  // Using a hardcoded projectId for demonstration purposes
  const demoProjectId = 'project-abc-123'; 

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>
      <p className="mb-6">Demonstrating the <code>usePolling</code> hook:</p>
      <ProjectStatusDemo projectId={demoProjectId} />
    </div>
  );
};

export default DashboardPage;
