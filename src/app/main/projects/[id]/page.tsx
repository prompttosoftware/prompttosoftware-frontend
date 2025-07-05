'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/app/main/components/LoadingSpinner';
import EmptyState from '@/app/main/components/EmptyState';
import { usePolling } from '@/hooks/usePolling';
import { Project, HistoryItem } from '@/types/project'; // Import HistoryItem
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import toast from 'react-hot-toast';
import { format } from 'date-fns'; // Ensure format is imported
import { api } from '@/lib/api';
import { useGlobalError } from '@/hooks/useGlobalError';
import ConfirmationDialog from '@/app/main/components/ConfirmationDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import useMutation and useQueryClient
import { useSuccessMessageStore } from '@/store/successMessageStore'; // Import useSuccessMessageStore

const ProjectDetailPage = () => {
  console.log('ProjectDetailPage component rendered');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { id } = useParams() as { id: string };
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { setGlobalError } = useGlobalError();
  const [project, setProject] = useState<Project | null>(null);

  // New state for project history
const [projectHistory, setProjectHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [historyFetchError, setHistoryFetchError] = useState<string | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  const [error, setError] = useState<string | null>(null);
  const [isFetchingProject, setIsFetchingProject] = useState<boolean>(true);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  
  const [messageInput, setMessageInput] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  console.log(`Auth Loading: ${isLoading}, Authenticated: ${isAuthenticated}`);
  
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !id) {
      return;
    }
  
    setIsSendingMessage(true);
    try {
      await api.sendMessage(id, messageInput);
      
      // Create the new message object as a HistoryItem
      const newMessage: HistoryItem = {
        sender: 'user', // Explicitly set sender as 'user'
        content: messageInput, // Use 'content' for HistoryItem
        type: 'message', // Specify type
        timestamp: new Date().toISOString(), // Use ISO string for consistent date format
      };
      
      // Update the projectHistory state to include the new message
      setProjectHistory(prevHistory => [...prevHistory, newMessage]);
      
      setMessageInput('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      let errorMessage = 'Failed to send message. Please try again.';
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSendingMessage(false);
    }
  };

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
      router.push('/projects'); // Redirect to projects list
    },
    onError: (error) => {
      // Safely access error message, default to a generic message if not available
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setGlobalError(`Failed to delete project: ${errorMessage}`);
      toast.error('Failed to delete project. Please try again.');
      setShowDeleteConfirmation(false); // Dismiss the confirmation modal on error
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

// Effect for auto-scrolling
useEffect(() => {
  if (historyEndRef.current) {
    historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [projectHistory]); // Scroll when projectHistory changes

// Effect to fetch project history
useEffect(() => {
  const fetchProjectHistory = async () => {
    if (!id || !isAuthenticated) {
      return;
    }

    setIsHistoryLoading(true);
    setHistoryFetchError(null);

    try {
      const historyData = await api.getProjectHistory(id);
      // Sort history items chronologically (oldest to newest)
      const sortedHistory = historyData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setProjectHistory(sortedHistory);
    } catch (err) {
      console.error('Failed to fetch project history:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setHistoryFetchError('Authentication required to view history. Please log in again.');
        } else if (err.response?.status === 404) {
          setHistoryFetchError('Project history not found.');
        } else {
          setHistoryFetchError(
            err.message || 'Failed to load project history due to a network or server error.',
          );
        }
      } else {
        setHistoryFetchError('An unexpected error occurred while loading project history.');
      }
    } finally {
      setIsHistoryLoading(false);
    }
  };

  if (isAuthenticated && id) {
    fetchProjectHistory();
  }
}, [id, isAuthenticated, logout]);

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

  if (isLoading || isFetchingProject || isHistoryLoading) { // Also wait for history to load
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
          {/* Project History/Chat Container */}
            <div className="flex flex-col h-[500px] bg-white shadow rounded-lg p-6 relative">
<h2 className="text-2xl font-semibold text-gray-800 mb-4">Project History</h2>
<ScrollArea className="flex-grow mb-4 pr-3"> {/* Added pr-3 for scrollbar */}
    {isHistoryLoading ? (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    ) : historyFetchError ? (
      <div className="flex justify-center items-center h-full text-red-500 text-center p-4">
        <p>{historyFetchError}</p>
      </div>
    ) : projectHistory.length === 0 ? (
      <div className="flex justify-center items-center h-full text-gray-500 italic">
        No history yet. Start a conversation!
      </div>
    ) : (
      <div className="space-y-4">
          {projectHistory.map((item, index) => {
            const isUser = item.sender === 'user';
            const isAgent = item.sender === 'agent';
            const isSystem = item.sender === 'system';
          
            let containerClasses = 'flex';
            let bubbleClasses = 'p-3 rounded-lg max-w-lg break-words text-sm'; // Increased max-width
            let timestampClasses = 'text-xs mt-1'; // Base timestamp class
            let senderName = '';
          
            switch (item.type) {
              case 'message':
                if (isUser) {
                  containerClasses += ' justify-end';
                  bubbleClasses += ' bg-blue-500 text-white';
                  timestampClasses += ' text-right text-blue-200';
                  senderName = 'You';
                } else { // Agent or default sender
                  containerClasses += ' justify-start';
                  bubbleClasses += ' bg-gray-200 text-gray-800';
                  timestampClasses += ' text-left text-gray-500';
                  senderName = isAgent ? 'Agent' : 'System'; // Fallback for agent messages from system or others
                }
                break;
              case 'status_update':
                containerClasses += ' justify-center';
                bubbleClasses += ' bg-indigo-100 text-indigo-800 text-center italic';
                timestampClasses += ' text-center text-indigo-600';
                senderName = 'System Update';
                break;
              case 'sensitive_request':
                containerClasses += ' justify-center';
                bubbleClasses += ' bg-red-100 text-red-800 text-center font-semibold';
                timestampClasses += ' text-center text-red-600';
                senderName = 'Sensitive Request';
                break;
              case 'system_event':
              default: // Default for any unknown or new types
                containerClasses += ' justify-center';
                bubbleClasses += ' bg-gray-100 text-gray-700 text-center italic';
                timestampClasses += ' text-center text-gray-500';
                senderName = 'System Event';
                break;
            }
          
            return (
              <div key={index} className={containerClasses}>
                <div className={bubbleClasses}>
                  {item.type === 'message' && ( // Only show sender for 'message' type
                    <p className="font-bold mb-1">
                        {isUser ? 'You' : item.sender === 'agent' ? 'Agent' : 'System'}
                    </p>
                  )}
                  <p>{item.content}</p>
                  <p className={timestampClasses}>
                    {format(new Date(item.timestamp), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={historyEndRef} /> {/* Element to scroll to */}
      </div>
    )}
</ScrollArea>
{/* Message Input and Send Button */}
<div className="flex items-center space-x-2 mt-auto">
    <Input
        type="text"
        placeholder="Type your message..."
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        disabled={isSendingMessage}
    />
    <Button
        variant="default"
        size="lg"
        onClick={handleSendMessage}
        disabled={!messageInput.trim() || isSendingMessage}
    >
        {isSendingMessage ? 'Sending...' : 'Send'}
    </Button>
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
