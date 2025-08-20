// app/(main)/components/ProjectCard.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { Project, Status, statusConfig } from '@/types/project';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Star, AlertTriangle, GitCommit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * A small helper component to display a colored dot and text for the project status.
 */
const StatusIndicator = ({ status }: { status: Status }) => {

  const config = statusConfig[status] || statusConfig.stopped;

  return (
    <div className="flex items-center gap-2" title={`Status: ${config.label}`}>
      <span className={`h-3 w-3 rounded-full ${config.className}`}></span>
      <span className="text-sm capitalize text-card-foreground hidden sm:inline">{config.label}</span>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    // The entire card is a link to the project's detail page.
    <Link href={`/projects/${project._id}`} className="block h-full no-underline">
      <Card className="h-full flex flex-col transition-all duration-200 border border-transparent hover:border hover:shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-semibold text-card-foreground break-words">
              {project.name}
            </CardTitle>
            <StatusIndicator status={project.status} />
          </div>
        </CardHeader>

        <CardContent className="flex-grow">
          {/* The project description from the ProjectSummary can go here if available */}
          <p className="text-card-foreground text-sm">
            View details, manage status, and see project history.
          </p>
        </CardContent>

        <CardFooter className="flex justify-between items-center text-sm text-card-foreground border-t pt-4">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" title={`${project.stars ?? 0} Stars`}>
                  <Star className="h-4 w-4 text-yellow-500"/>
                  <span>{project.stars ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5" title={`${project.incompleteIssues ?? 0} Incomplete Issues`}>
                  <AlertTriangle className="h-4 w-4 text-orange-500"/>
                  <span>{project.incompleteIssues ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5" title={`${project.completeIssues ?? 0} Completed Issues`}>
                  <GitCommit className="h-4 w-4 text-green-500"/>
                  <span>{project.completeIssues ?? 0}</span>
              </div>
          </div>
          <div title={new Date(project.updatedAt).toLocaleString()}>
           {project.updatedAt && !isNaN(new Date(project.updatedAt).getTime())
            ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })
            : 'Unknown'}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
