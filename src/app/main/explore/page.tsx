'use client';

import React, { useEffect, useState } from 'react';
import { useExploreProjects } from '@/hooks/useExploreProjects';
import { ProjectSummary } from '@/types/project';
import ProjectCard from '../components/ProjectCard';
import { useGlobalError } from '@/hooks/useGlobalError';

const ExploreProjectsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'trending' | 'recent'>('trending'); // Default to trending
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
                <h1 className="text-3xl font-bold text-center mb-6">Explore Projects</h1>
                <div className="flex justify-center items-center h-64">
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    const filteredAndSortedProjects = React.useMemo(() => {
        if (!projects) {
            return [];
        }

        let filtered = projects.filter((project: ProjectSummary) =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortOrder === 'trending') {
            filtered.sort((a: ProjectSummary, b: ProjectSummary) => (b.githubStars || 0) - (a.githubStars || 0));
        } else if (sortOrder === 'recent') {
            filtered.sort((a: ProjectSummary, b: ProjectSummary) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return filtered;
    }, [projects, searchTerm, sortOrder]);

    return (
        <div className="mx-auto px-4 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center mb-6">Explore Projects</h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="p-3 border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="relative">
                        <select
                            className="appearance-none p-3 border border-gray-300 rounded-lg pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'trending' | 'recent')}
                        >
                            <option value="trending">Sort by Trending</option>
                            <option value="recent">Sort by Recent</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {filteredAndSortedProjects.length > 0 ? (
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedProjects.map((project: ProjectSummary) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="container mx-auto px-4 text-center py-10">
                    <p className="text-lg text-gray-500">No projects found.</p>
                </div>
            )}
        </div>
    );
};

export default ExploreProjectsPage;
