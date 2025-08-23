// app/(main)/dashboard/components/ProjectSummaryCard.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { Project, Status, statusConfig } from '@/types/project';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, GitCommit, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Helper: Visual status indicator (consistent with ProjectCard).
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

interface ProjectSummaryCardProps {
  project: Project;
}

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ project }) => {
  // Calculate progress based on issue counts.
  const totalIssues = (project.completeIssues ?? 0) + (project.incompleteIssues ?? 0);
  const progress = totalIssues > 0 ? ((project.completeIssues ?? 0) / totalIssues) * 100 : 0;

  return (
    <Link href={`/projects/${project._id}`} className="block h-full no-underline">
      <Card className="h-full flex flex-col transition-all duration-200 border hover:shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-semibold text-card-foreground break-words">
              {project.name}
            </CardTitle>
            <StatusIndicator status={project.status} />
          </div>
        </CardHeader>

        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-card-foreground">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Incomplete Issues
            </span>
            <span className="font-medium">{project.incompleteIssues ?? 0}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-card-foreground">
              <GitCommit className="h-4 w-4 text-green-500" />
              Completed Issues
            </span>
            <span className="font-medium">{project.completeIssues ?? 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-card-foreground">
              <Clock className="h-4 w-4 text-card-foreground" />
              Last Update
            </span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
          <div className="w-full flex justify-between items-center text-sm">
              <span className="font-medium text-card-foreground">Task Progress</span>
              <span className="font-mono text-card-foreground">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectSummaryCard;
