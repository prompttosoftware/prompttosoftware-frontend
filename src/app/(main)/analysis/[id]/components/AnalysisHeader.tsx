'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, MessageSquare, MoreHorizontal, Play, StopCircle, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import Link from 'next/link';
import { TooltipTrigger, TooltipArrow, TooltipContent, TooltipPortal, TooltipProvider, Tooltip } from '@/components/ui/tooltip';

interface AnalysisHeaderProps {
  repository: string;
  onDeleteClick: () => void;
  onRerunClick: () => void;
  onStopClick: () => void;
  onDownloadClick: () => void;
  isDownloading: boolean;
  isDeleting: boolean;
  isRerunning: boolean;
  isStopping: boolean;
  status: string;
  analysisId: string;
}

const AnalysisHeader = ({ 
    repository, 
    onDeleteClick, 
    onRerunClick,
    onStopClick,
    onDownloadClick,
    isDownloading,
    isDeleting, 
    isRerunning, 
    isStopping,
    status,
    analysisId 
}: AnalysisHeaderProps) => {
  const isActive = ['running', 'starting', 'pending'].includes(status);

  return (
  <div className="flex justify-between items-start pb-4 border-b">
    <div>
        <h1 className="text-3xl font-bold text-card-foreground break-all">{repository.split('/').slice(-2).join('/')}</h1>
        <a href={`https://github.com/${repository.split('/').slice(-2).join('/')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
            View on GitHub
        </a>
    </div>
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/chat/new?analysisId=${analysisId}`} passHref>
              <Button variant="outline" size="icon">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-lg z-[60]"
              side="bottom"
              sideOffset={5}
            >
              Chat about analysis
              <TooltipArrow className="fill-current text-popover" />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      
      {isActive ? (
          <Button onClick={onStopClick} disabled={isStopping}>
            {isStopping ? <LoadingSpinner size="small" className="mr-2" /> : <StopCircle className="mr-2 h-4 w-4" />}
            Stop
          </Button>
        ) : (
          <Button onClick={onRerunClick} disabled={isRerunning}>
            {isRerunning ? <LoadingSpinner size="small" className="mr-2" /> : <Play className="mr-2 h-4 w-4" />}
            Rerun
          </Button>
        )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isDeleting || isDownloading}>
            {isDeleting ? <LoadingSpinner size="small"/> : <MoreHorizontal className="h-5 w-5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDownloadClick} disabled={isDownloading}>
            {isDownloading ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteClick} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Analysis
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
  );
};

export default AnalysisHeader;
