'use client';

import React from 'react';
import Link from 'next/link';
import { Project, Status, statusConfig } from '@/types/project';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Star, AlertTriangle, GitCommit, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * A small helper component to display a colored dot and text for the project status.
 */
const StatusIndicator = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || statusConfig.stopped;

  return (
    <div className="flex flex-shrink-0 items-center gap-2" title={`Status: ${config.label}`}>
      <span className={`h-3 w-3 rounded-full ${config.className}`}></span>
      <span className="hidden text-sm capitalize text-card-foreground sm:inline">
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

  return (
    distance
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
      .replace(' ago', '')
      .trim() + ' ago'
  );
};

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    // The entire card is a link to the project's detail page.
    <Link href={`/projects/${project._id}`} className="block h-full no-underline">
      <Card className="flex h-full flex-col border transition-all duration-200 hover:shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="min-w-0 break-words text-xl font-semibold text-card-foreground">
              {project.name}
            </CardTitle>
            <StatusIndicator status={project.status} />
          </div>
        </CardHeader>

        <CardContent className="flex-grow">
          {project.description ? (
            <p className="line-clamp-3 text-sm text-muted-foreground" title={project.description}>
              {project.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No description provided.</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" title={`${project.stars ?? 0} Stars`}>
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
          <div
            className="flex items-center gap-1.5"
            title={`Last updated: ${new Date(project.updatedAt).toLocaleString()}`}
          >
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
