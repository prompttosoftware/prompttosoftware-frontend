'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import EmptyState from '@/app/(main)/components/EmptyState';
import { usePolling } from '@/hooks/usePolling';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useGlobalError } from '@/hooks/useGlobalError';
import ConfirmationDialog from '@/app/(main)/components/ConfirmationDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import useMutation and useQueryClient
import { useSuccessMessageStore } from '@/store/successMessageStore'; // Import useSuccessMessageStore

const ProjectDetailPage = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { id } = useParams() as { id: string };
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { setGlobalError } = useGlobalError();
  const [project, setProject] = useState<Project | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isFetchingProject, setIsFetchingProject] = useState<boolean>(true);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const {
    data: liveMetrics,
    isLoading: isPollingLoading,
    error: pollingError,
    formattedElapsedTime,
    formattedCost,
    isError: isPollingError,
  } = usePolling(id);

  // React Query hooks for deletion
  const queryClient = useQueryClient();
  const { showSuccessMessage } = useSuccessMessageStore();

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required. Please log in again.');
      }
      return api.deleteProject(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Invalidate general project list
      showSuccessMessage('Project deleted successfully!');
      router.push('/dashboard'); // Redirect to dashboard or projects list
    },
    onError: (error) => {
      setGlobalError(`Failed to delete project: ${error.message}`);
      toast.error('Failed to delete project. Please try again.');
    },
  });

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
        const response = await api.getProject(id);
        setProject(response);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
            router.push('/login');
            setError('Authentication required. Please log in again.');
          } else if (err.response?.status === 404) {
            setError(
              'Project not found or you do not have access. Redirecting you to the projects dashboard...',
            );
            setTimeout(() => {
              router.replace('/projects');
            }, 3000);
          } else {
            setError(
              err.message || 'Failed to load project details due to a network or server error.',
            );
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

  useEffect(() => {
    if (liveMetrics?.pendingSensitiveRequest) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">{/* Icon could go here */}</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">Sensitive Information Request</p>
                  <p className="mt-1 text-sm text-gray-500">
                    A sensitive information request is pending for this project. Please check your
                    notifications or a dedicated section for details.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity, // Keep toast until dismissed
          id: 'pendingSensitiveRequestToast', // Unique ID to prevent duplicate toasts
        },
      );
    } else {
      toast.dismiss('pendingSensitiveRequestToast'); // Dismiss if no longer pending
    }
  }, [liveMetrics?.pendingSensitiveRequest]);

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
          description={error}
          actionButton={
            error.includes('Redirecting') ? undefined : (
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

  const handleProjectAction = async (action: 'start' | 'stop') => {
    try {
      if (action === 'start') {
        await api.startProject(id);
      } else {
        await api.stopProject(id);
      }
      toast.success(`Project ${action === 'start' ? 'resumed' : 'stopped'} successfully!`);
    } catch (err: any) {
      setGlobalError(`Failed to ${action} project: ${err.message || err.toString()}`);
      toast.error(`Failed to ${action} project. Please try again.`);
    }
  };

  if (!project && !isFetchingProject && hasFetched) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <EmptyState
          title="Project Not Found"
          description="The project you are looking for does not exist or you do not have permission to view it."
          actionButton={
            <button
              onClick={() => router.replace('/projects')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Projects
            </button>
          }
        />
      </div>
    );
  }

  return (
    <>
      {' '}
      {/* Start of React.Fragment */}
      <div className="container mx-auto p-4">
        {/* Project Details Panel */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{project?.name}</h1>
              <p className="text-gray-600">{project?.description}</p>
            </div>
            {/* More options button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Repository URL:</span>
              <a
                href={project?.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {project?.repositoryUrl}
              </a>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Created At:</span>
              <span className="text-gray-800">
                {project?.createdAt ? format(new Date(project.createdAt), 'PPPP') : 'N/A'}
              </span>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Live Metrics</h2>
            {pollingError && (
              <div className="text-red-500 mb-4">
                Error fetching live metrics: {pollingError.message}
              </div>
            )}
            {!liveMetrics && !isPollingLoading && (
              <div className="text-gray-500 mb-4">Live metrics not available.</div>
            )}
            {liveMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Status:</span>
                  <span
                    className={`text-lg font-medium ${
                      liveMetrics.status === 'in-progress'
                        ? 'text-green-600'
                        : liveMetrics.status === 'failed'
                          ? 'text-red-600'
                          : liveMetrics.status === 'completed'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                    }`}
                  >
                    {liveMetrics.status}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Elapsed Time:</span>
                  <span className="text-gray-800 text-lg">{formattedElapsedTime}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Estimated Cost:</span>
                  <span className="text-gray-800 text-lg">{formattedCost}</span>
                </div>
              </div>
            )}
            {liveMetrics && (
              <div className="mt-4">
                <span className="text-gray-500 text-sm">Progress:</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${liveMetrics.progress}%` }}
                  ></div>
                </div>
                <span className="text-gray-800 text-sm mt-1 block">
                  {liveMetrics.progress.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons - bottom left */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-start">
            {(() => {
              const isPendingAction =
                liveMetrics?.status === 'starting' || liveMetrics?.status === 'stopping';

              if (
                project &&
                liveMetrics &&
                (liveMetrics.status === 'stopped' ||
                  liveMetrics.status === 'failed' ||
                  liveMetrics.status === 'completed')
              ) {
                return (
                  <Button
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleProjectAction('start')}
                    disabled={isPendingAction}
                  >
                    {liveMetrics.status === 'starting' ? (
                      <>
                        <LoadingSpinner size={20} className="mr-2" /> Resuming...
                      </>
                    ) : (
                      'Resume Project'
                    )}
                  </Button>
                );
              } else if (
                project &&
                liveMetrics &&
                (liveMetrics.status === 'active' ||
                  liveMetrics.status === 'in-progress' ||
                  liveMetrics.status === 'starting')
              ) {
                return (
                  <Button
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleProjectAction('stop')}
                    disabled={isPendingAction}
                  >
                    {liveMetrics.status === 'stopping' ? (
                      <>
                        <LoadingSpinner size={20} className="mr-2" /> Stopping...
                      </>
                    ) : (
                      'Stop Project'
                    )}
                  </Button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
      {/* Confirmation Dialog for Delete */}
      {project && (
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          title="Delete Project"
          message={`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`}
          confirmPhrase={project.name} // User must type the project name to confirm
          onConfirm={() => {
            deleteProjectMutation.mutate(id);
            setShowDeleteConfirmation(false);
          }}
          onCancel={() => setShowDeleteConfirmation(false)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </>
  );
};

export default ProjectDetailPage;
