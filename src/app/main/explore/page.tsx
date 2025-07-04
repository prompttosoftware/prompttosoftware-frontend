'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useExploreProjects } from '@/hooks/useExploreProjects';
import { ProjectCard } from '@/app/main/components/ProjectCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Project } from '@/types/project';


const ExploreProjectsPage: React.FC = () => {
    const { data: projects = [], isLoading, isError, error } = useExploreProjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'trending'>('recent');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects.filter((project) =>
            project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );

        if (sortOrder === 'recent') {
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            filtered.sort((a, b) => (b.githubStars || 0) - (a.githubStars || 0));
        }
         // Filter out projects with nullish 'id', 'name', 'description'
        return filtered.filter(project => 
          project.id != null && project.name != null && project.description != null
        ) as Project[];
    }, [projects, debouncedSearchTerm, sortOrder]);


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

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-6">Explore Projects</h1>
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-500">Error loading projects: {error?.message || "Unknown error"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Explore Projects</h1>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-4">
                    <label htmlFor="sortOrder" className="text-gray-700">Sort by:</label>
                    <select
                        id="sortOrder"
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'recent' | 'trending')}
                    >
                        <option value="recent">Recent</option>
                        <option value="trending">Trending</option>
                    </select>
                </div>
            </div>

            {filteredAndSortedProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project} // Pass the entire project object
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ExploreProjectsPage;
