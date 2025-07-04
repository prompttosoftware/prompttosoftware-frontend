'use client';

import React, { useEffect } from 'react';
import { useExploreProjects } from '@/hooks/useExploreProjects';
import { ProjectSummary } from '@/types/project';
import ProjectCard from '../components/ProjectCard';
import { useGlobalError } from '@/hooks/useGlobalError';

const ExploreProjectsPage: React.FC = () => {
    const { data: projects, isLoading, isError, error } = useExploreProjects();
    const { showError } = useGlobalError();

    useEffect(() => {
        if (isError) {
            showError("Error Loading Projects", error?.message || "An unknown error occurred while fetching projects.");
        }
    }, [isError, error, showError]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Explore Projects</h1>
                <div className="flex justify-center items-center h-64">
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Explore Projects</h1>

            {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project: ProjectSummary) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-500">No projects found.</p>
                </div>
            )}
        </div>
    );
};

export default ExploreProjectsPage;
