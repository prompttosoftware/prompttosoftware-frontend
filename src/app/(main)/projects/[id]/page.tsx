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

const ProjectDetailPage = () => {
  // Removed params from here and explicit React.FC type
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

  return <div>Hello</div>;
};

export default ProjectDetailPage;
