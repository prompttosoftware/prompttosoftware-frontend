'use client';

import React from 'react';
import Link from 'next/link';
import { Project, Status, statusConfig } from '@/types/project';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Star, AlertTriangle, GitCommit, Clock } from 'lucide-react'; // Import Clock icon
import { formatDistanceToNow } from 'date-fns';

/**
 * A small helper component to display a colored dot and text for the project status.
 */
const StatusIndicator = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || statusConfig.stopped;

  return (
    <div className="flex items-center gap-2" title={`Status: ${config.label}`}>
      <span className={`h-3 w-3 rounded-full ${config.className}`}></span>
      <span className="text-sm capitalize text-card-foreground hidden sm:inline">
        {config.label}
      </span>
    </div>
  );
};

/**
 * Formats the distance to now in a compact form (e.g., "5m ago", "1h ago", "3d ago").
 */
const formatShortDistanceToNow = (date: Date): string => {
  const distance = formatDistanceToNow(date, { addSuffix: true });

  // Custom replacements for a more compact view
  return distance
    .replace('about ', '')
    .replace('less than a minute', '<1m')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' months', 'mo')
    .replace(' month', 'mo')
    .replace(' years', 'y')
    .replace(' year', 'y')
    .replace(' ago', '') // We can make it even shorter by removing ' ago' if space is critical
    .trim() + ' ago'; // Or keep it for clarity
};


interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    // The entire card is a link to the project's detail page.
    <Link href={`/projects/${project._id}`} className="block h-full no-underline">
      <Card className="h-full flex flex-col transition-all duration-200 border hover:shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-semibold text-card-foreground break-words">
              {project.name}
            </CardTitle>
            <StatusIndicator status={project.status} />
          </div>
        </CardHeader>

        <CardContent className="flex-grow">
          {project.description ? (
            <p
              className="text-sm text-muted-foreground line-clamp-3"
              title={project.description}
            >
              {project.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description provided.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1.5"
              title={`${project.stars ?? 0} Stars`}
            >
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{project.stars ?? 0}</span>
            </div>
            <div
              className="flex items-center gap-1.5"
              title={`${project.incompleteIssues ?? 0} Incomplete Issues`}
            >
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>{project.incompleteIssues ?? 0}</span>
            </div>
            <div
              className="flex items-center gap-1.5"
              title={`${project.completeIssues ?? 0} Completed Issues`}
            >
              <GitCommit className="h-4 w-4 text-green-500" />
              <span>{project.completeIssues ?? 0}</span>
            </div>
          </div>
          {/* Updated time display with icon and abbreviated text */}
          <div className="flex items-center gap-1.5" title={`Last updated: ${new Date(project.updatedAt).toLocaleString()}`}>
            <Clock className="h-4 w-4" />
            <span>
                {project.updatedAt && !isNaN(new Date(project.updatedAt).getTime())
                ? formatShortDistanceToNow(new Date(project.updatedAt))
                : 'Unknown'}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
