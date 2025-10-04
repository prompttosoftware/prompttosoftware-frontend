'use client';

import React from 'react';
import Link from 'next/link';
import { Analysis } from '@/types/analysis';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Github, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Status, statusConfig } from '@/types/project';

/**
 * A helper component to display a colored dot and text for the analysis status.
 */
const StatusIndicator = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || { label: 'Unknown', className: 'bg-gray-400' };

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
 * Formats the distance to now in a compact form (e.g., "5m", "1h", "3d").
 */
const formatShortDistanceToNow = (date: Date): string => {
  const distance = formatDistanceToNow(date, { addSuffix: true });
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
    .replace(' year', 'y');
};


interface AnalysisCardProps {
  analysis: Analysis;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  // Extract a user-friendly repository name (e.g., "owner/repo") from the full URL for the title
  const repoName = analysis.repository.split('/').slice(-2).join('/');

  return (
    <Link href={`/analysis/${analysis._id}`} className="block h-full no-underline">
      <Card className="flex h-full flex-col border transition-all duration-200 hover:shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-card-foreground break-all">
            {repoName}
          </h2>
          <StatusIndicator status={analysis.status} />
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Github className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate" title={analysis.repository}>
              {analysis.repository}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end border-t pt-4 text-sm text-muted-foreground">
          <div
            className="flex items-center gap-1.5"
            title={`Last updated: ${new Date(analysis.updatedAt).toLocaleString()}`}
          >
            <Clock className="h-4 w-4" />
            <span>
              {analysis.updatedAt && !isNaN(new Date(analysis.updatedAt).getTime())
                ? formatShortDistanceToNow(new Date(analysis.updatedAt))
                : 'Unknown'}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AnalysisCard;
