'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Added useParams
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import EmptyState from '@/app/(main)/components/EmptyState';
import { AlertCircle } from 'lucide-react';
import { usePolling } from '@/hooks/usePolling';
import { ProjectStatus } from '@/types/project';

import { format } from 'date-fns';
import { intervalToDuration } from 'date-fns';
import { formatDuration, formatCurrency } from '@/lib/formatters';


interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  createdAt: string;
}

interface LiveProjectMetrics {
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  elapsedTime: number;
  cost: number;
  progress: number;
}

// ProjectDetailProps is no longer needed since params are accessed via useParams hook
// interface ProjectDetailProps {
//   params: {
//     id: string;
//   };
// }

const ProjectDetailPage: React.FC = () => { // Removed params from here
  const { id } = useParams() as { id: string }; // Use useParams hook
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingProject, setIsFetchingProject] = useState<boolean>(true);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  
  const [liveMetrics, setLiveMetrics] = useState<LiveProjectMetrics>({
    status: 'pending',
    elapsedTime: 0,
    cost: 0,
    progress: 0,
  });
  
  const {
    data: pollingData,
    isLoading: isPollingLoading,
    error: pollingError,
  } = usePolling(id, { refetchInterval: 60000 });
  
  useEffect(() => {
    if (pollingData) {
      setLiveMetrics({
        status: pollingData.status,
        elapsedTime: pollingData.elapsedTime,
        cost: pollingData.cost,
        progress: pollingData.progress,
      });
    }
  }, [pollingData]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !isAuthenticated || hasFetched) {
        setIsFetchingProject(false);
        return;
      }
  
      setIsFetchingProject(true);
      setError(null);
      setProject(null);
      
      try {
        const response = await axios.get(`/api/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
            router.push('/login');
            setError('Authentication required. Please log in again.');
          } else if (err.response?.status === 404) {
             setError('Project not found or you do not have access. Redirecting you to the projects dashboard...');
             setTimeout(() => {
               router.replace('/projects');
             }, 3000);
          } else {
            setError(err.message || 'Failed to load project details due to a network or server error.');
          }
        } else {
          setError('An unexpected error occurred while loading project details.');
        }
      } finally {
        setIsFetchingProject(false);
        setHasFetched(true);
      }
    };
  
    if (isAuthenticated && id && !hasFetched) {
      fetchProject();
    }
  }, [id, isAuthenticated, router, logout, hasFetched]);

  if (isLoading || isFetchingProject) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <EmptyState
          title="Error Loading Project"
          message={error}
          actionButton={
            error.includes("Redirecting") ? undefined : (
              <button
                onClick={() => router.replace('/projects')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Projects
              </button>
            )
          }
        />
      </div>
    );
  }
  
  if (!project && !isFetchingProject && hasFetched) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <EmptyState
            title="Project Not Found"
            message="The project you are looking for does not exist or you do not have permission to view it."
            actionText="Go to Projects"
            onAction={() => router.replace('/projects')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left Panel - Static/Live Project Details */}
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
        {project && (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Project: {project.name}</h1>
        
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Description:</p>
                  <p className="text-base text-gray-700 mt-1">{project.description || 'No description provided.'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Repository URL:</p>
                  <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-base mt-1 break-all">
                    {project.repositoryUrl || 'N/A'}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At:</p>
                  <p className="text-base text-gray-700 mt-1">
                    {format(new Date(project.createdAt), 'MMMM d, yyyy \\'at\\' hh:mm a')}
                  </p>
                </div>
              </div>
            </div>
        
            {/* Live Status Metrics */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Live Status</h2>
              {isPollingLoading ? (
  <div className="flex flex-col items-center justify-center p-4">
    <LoadingSpinner />
    <p className="mt-4 text-lg text-gray-600">Loading live project updates...</p>
  </div>
) : pollingError ? (
  <EmptyState
    icon={<AlertCircle className="w-12 h-12 text-red-500" />}
    title="Could not retrieve live project updates"
    message={pollingError.message || "There was an issue fetching the latest project status. Please check your connection or try again later."}
  />
) : !pollingData ? ( // Handle case where data is null after loading and no explicit error
  <EmptyState
    title="No live status available"
    message="The project status could not be loaded or is not yet available."
  />
) : (
  <div className="p-4 border border-blue-200 rounded-md shadow-md bg-blue-50">
    <p className="text-blue-700">Status: <span className="font-medium capitalize">{liveMetrics.status}</span></p>
    <p className="text-blue-700">Elapsed Time: <span className="font-medium">{formatDuration(intervalToDuration({ start: 0, end: liveMetrics.elapsedTime * 1000 }), { format: ['hours', 'minutes', 'seconds'], zero: true, delimiter: ', ' })}</span></p>
    <p className="text-blue-700">Cost: <span className="font-medium">{formatCurrency(liveMetrics.cost)}</span></p>
    <p className="text-blue-700">Progress: <span className="font-medium">{liveMetrics.progress}%</span></p>
    <p className="text-xs text-blue-500 mt-2">Last updated: {pollingData.updatedAt ? format(new Date(pollingData.updatedAt), 'hh:mm:ss a') : 'N/A'}</p>
  </div>
)}
            </div>
        
            {/* Placeholders for control buttons */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Controls</h2>
              <div className="flex justify-center space-x-4">
                <button className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-md cursor-not-allowed opacity-75">
                  Start
                </button>
                <button className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-md cursor-not-allowed opacity-75">
                  Stop
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Panel - History/Chat */}
      <div className="flex-1 bg-gray-200 p-4 border-l md:w-1/3 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-4">Communication</h2>
        
        {/* Placeholders for chat/history input */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Chat / History</h3>
          <p className="text-gray-600 mb-4">Live chat and project history will be displayed here.</p>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            rows={4}
            placeholder="Chat input / History display area (placeholder)"
            readOnly
          ></textarea>
          <button className="mt-3 px-5 py-2 bg-gray-300 text-gray-700 font-bold rounded-md cursor-not-allowed opacity-75">
            Send Message
          </button>
        </div>
        
        {/* Placeholders for a sensitive request area */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Sensitive Request Area</h3>
          <p className="text-gray-600 mb-4">Area for sensitive requests or actions, requiring careful handling.</p>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            placeholder="Sensitive request input (placeholder)"
            readOnly
          />
          <button className="mt-3 px-5 py-2 bg-gray-300 text-gray-700 font-bold rounded-md cursor-not-allowed opacity-75">
            Submit Sensitive Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
