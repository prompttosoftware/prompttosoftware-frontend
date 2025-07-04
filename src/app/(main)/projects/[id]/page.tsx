'use client'; // This directive is necessary for client-side components in Next.js 13+

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Assuming axios is installed and configured
import { useAuth } from '@/hooks/useAuth'; // Assuming this hook handles authentication state
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner'; // Assuming this component exists
import EmptyState from '@/app/(main)/components/EmptyState'; // Add this import

import { format } from 'date-fns'; // Import format function from date-fns

// Define a type for your project data
interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  createdAt: string; // ISO date string
  // Add other relevant project fields here
}

interface ProjectDetailProps {
  params: {
    id: string;
  };
}

const ProjectDetailPage: React.FC<ProjectDetailProps> = ({ params }) => {
  const { id } = params;
  const { isAuthenticated, isLoading, logout } = useAuth(); // Get auth state and logout function
  const router = useRouter(); // Initialize useRouter
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingProject, setIsFetchingProject] = useState<boolean>(true);
  const [hasFetched, setHasFetched] = useState<boolean>(false); // To prevent re-fetching on re-renders if not needed

  // Authentication check and redirection
  useEffect(() => {
    // If authentication state is known and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      // Ensure we have an ID and are authenticated AND haven't fetched yet (or want to refetch)
      if (!id || !isAuthenticated || hasFetched) {
        setIsFetchingProject(false);
        return;
      }
  
      setIsFetchingProject(true);
      setError(null); // Clear previous errors
      setProject(null); // Clear previous project data to prevent showing old data during re-fetch
      
      try {
        const response = await axios.get(`/api/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout(); // Clear invalid token from storage
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
  
    if (isAuthenticated && id && !hasFetched) { // Only fetch if authenticated, ID present, and not yet fetched
      fetchProject();
    }
  }, [id, isAuthenticated, router, logout, hasFetched]); // Add hasFetched to dependencies

  // Loading and error states
  if (isLoading || isFetchingProject) { // Include isFetchingProject for dedicated loading state
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Handle errors
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <EmptyState
          title="Error Loading Project"
          message={error}
          // Only show action button if not automatically redirecting
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
  
  // Handle case where project is null after fetching (e.g., initial state or truly not found after redirect)
  // This helps catch cases where the 404 was not explicitly returned, but data is still missing.
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
                    {format(new Date(project.createdAt), 'MMMM d, yyyy \'at\' hh:mm a')}
                  </p>
                </div>
              </div>
            </div>
        
            {/* Placeholders for Live Status Metrics */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Live Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="text-lg font-medium text-gray-600">Cost</p>
                  <p className="text-2xl font-bold text-gray-800">$--.--</p>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="text-lg font-medium text-gray-600">Elapsed Time</p>
                  <p className="text-2xl font-bold text-gray-800">--:--:--</p>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="text-lg font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-800">--%</p>
                </div>
              </div>
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
