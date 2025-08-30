'use client';

import React from 'react';
import { Project, Status, statusConfig, IRepository, Models, Model } from '@/types/project';
import {
  Star,
  AlertTriangle,
  GitCommit,
  Clock,
  CalendarDays,
  DollarSign,
  Timer,
  Github,
  BrainCircuit,
  Briefcase,
  Cpu,
  LogIn,
  LogOut,
  Hourglass, // New Icon for session stats
  History,   // New Icon for lifetime stats
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- Helper Functions ---

/**
 * Formats a duration in seconds to a human-readable HH:MM:SS format.
 * e.g., 90 -> "00:01:30"
 */
const formatSecondsToHMS = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
};

/**
 * Formats a long duration in seconds into a compact, readable string.
 * e.g., 90000 -> "1d 1h"
 */
const formatLifetimeDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return 'N/A';
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  if (totalSeconds < 3600) return `${Math.round(totalSeconds / 60)}m`;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  if (hours < 24) {
    return `${hours}h ${minutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours === 0) {
    return `${days}d`;
  }

  return `${days}d ${remainingHours}h`;
};

// --- Helper Components ---

/**
 * A reusable component for displaying a piece of information with an icon and label.
 */
const InfoBlock = ({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  children?: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <div className="mt-1 text-lg font-semibold text-card-foreground">
      {value}
      {children}
    </div>
  </div>
);

/**
 * A small helper component to display a colored dot and text for the project status.
 */
const StatusIndicator = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || statusConfig.stopped;
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 shrink-0 rounded-full ${config.className}`}></span>
      <span className="capitalize">{config.label}</span>
    </div>
  );
};

// --- Main Component ---

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const safeFormatDate = (dateString: string | undefined, formatStr: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, formatStr);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  /**
   * Renders a single GitHub repository with its details.
   */
  const renderRepository = (repo: IRepository, index: number) => (
    <div key={index} className="flex items-center gap-3 rounded-md border p-3">
      <Github className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      <div className="flex-grow">
        <a
          href={repo.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          {repo.name || repo.url?.split('/').pop() || 'Unnamed Repository'}
        </a>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {repo.isPrivate && <Badge variant="secondary">Private</Badge>}
          {repo.template && <Badge variant="secondary">{repo.template}</Badge>}
        </div>
      </div>
    </div>
  );

  /**
   * Renders the configured AI models, grouped by category.
   */
  const renderModels = (models: Models | undefined) => {
    if (!models) {
      return <p className="text-sm italic text-muted-foreground">No AI models configured.</p>;
    }

    const categories = Object.entries(models).filter(
      ([, modelList]) => modelList && modelList.length > 0
    );

    if (categories.length === 0) {
      return <p className="text-sm italic text-muted-foreground">No AI models configured.</p>;
    }

    return (
      <div className="space-y-4">
        {categories.map(([category, modelList]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold capitalize text-card-foreground">{category}</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {modelList?.map((model: Model, idx: React.Key | null | undefined) => (
                <Badge key={idx} variant="outline" className="font-mono text-xs">
                  {model.provider || '?'}/{model.model || '?'}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-8 border-t pt-6">
      {/* --- Description --- */}
      {project.description && (
        <section>
          <h2 className="text-xl font-semibold text-card-foreground mb-3">Description</h2>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </section>
      )}

      {/* --- Current Activity --- */}
      {project.currentlyDoing && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-card-foreground">
            <Cpu className="h-5 w-5" /> Current Activity
          </h2>
          <p className="whitespace-pre-wrap break-words rounded-md bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
            {project.currentlyDoing}
          </p>
        </section>
      )}

      {/* --- Overview Grid --- */}
      <section>
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBlock icon={<Timer className="h-4 w-4" />} label="Current Status">
            <StatusIndicator status={project.status} />
          </InfoBlock>
          <InfoBlock
            icon={<Star className="h-4 w-4 text-yellow-500" />}
            label="Stars"
            value={project.stars ?? 0}
          />
          <InfoBlock
            icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
            label="Incomplete Issues"
            value={project.incompleteIssues ?? 0}
          />
          <InfoBlock
            icon={<GitCommit className="h-4 w-4 text-green-500" />}
            label="Completed Issues"
            value={project.completeIssues ?? 0}
          />
          <InfoBlock
            icon={<CalendarDays className="h-4 w-4" />}
            label="Created"
            value={safeFormatDate(project.createdAt, 'MMM d, yyyy')}
          />
          <InfoBlock
            icon={<Clock className="h-4 w-4" />}
            label="Last Updated"
            value={safeFormatDate(project.updatedAt, 'MMM d, yyyy, p')}
          />
          <InfoBlock
            icon={<LogIn className="h-4 w-4" />}
            label="Total Input Tokens"
            value={(project.totalInputTokens ?? 0).toLocaleString()}
          />
          <InfoBlock
            icon={<LogOut className="h-4 w-4" />}
            label="Total Output Tokens"
            value={(project.totalOutputTokens ?? 0).toLocaleString()}
          />
          {/* --- NEW LIFETIME STATS --- */}
          <InfoBlock
            icon={<History className="h-4 w-4" />}
            label="Lifetime Runtime"
            value={formatLifetimeDuration(project.lifetimeRuntime ?? 0)}
          />
          <InfoBlock
            icon={<DollarSign className="h-4 w-4" />}
            label="Lifetime Cost"
            value={`$${(project.lifetimeCost ?? 0).toFixed(2)}`}
          />
        </div>
      </section>

      {/* --- Configuration & Last Error --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {/* --- UPDATED SESSION STATS --- */}
            <InfoBlock icon={<Hourglass className="h-4 w-4" />} label="Session Cost">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-card-foreground">
                  {`$${(project.cost ?? 0).toFixed(2)}`}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {`$${project.maxCost.toFixed(2)}`}
                </span>
              </div>
            </InfoBlock>
            <InfoBlock icon={<Hourglass className="h-4 w-4" />} label="Session Runtime">
              {project.maxRuntime !== null ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold text-card-foreground">
                    {formatSecondsToHMS(project.runtime ?? 0)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {project.maxRuntime} hours</span>
                </div>
              ) : (
                <span className="text-lg font-semibold text-card-foreground">
                  {formatSecondsToHMS(project.runtime ?? 0)} (No limit)
                </span>
              )}
            </InfoBlock>
            {project.useJira && (
              <InfoBlock
                icon={<Briefcase className="h-4 w-4" />}
                label="Jira Project Key"
                value={project.jiraProjectKey || 'N/A'}
              />
            )}
          </div>
          {project.lastError && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>Last Error</span>
              </div>
              <p className="mt-1 rounded-md bg-destructive/10 p-3 font-mono text-sm text-destructive break-all">
                {project.lastError}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Repositories & AI Models --- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Github className="h-5 w-5" />
              Repositories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.repositories && project.repositories.length > 0 ? (
              project.repositories.map(renderRepository)
            ) : (
              <p className="text-sm italic text-muted-foreground">No repositories linked.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BrainCircuit className="h-5 w-5" />
              AI Models
            </CardTitle>
          </CardHeader>
          <CardContent>{renderModels(project.models)}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetails;
