'use client';

import React, { useMemo, useState } from 'react';
import { Analysis, Node } from '@/types/analysis';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useGlobalErrorStore } from '@/store/globalErrorStore'; // Assuming this exists for confirmations

import AnalysisHeader from './AnalysisHeader';
import AnalysisOverview from './AnalysisOverview';
import DescriptionTree from './DescriptionTree';
import AnalysisReports from './AnalysisReports';
import NodeDetailModal from './NodeDetailModal';
import ConfirmationDialog from '@/app/(main)/components/ConfirmationDialog';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import { useAnalysisActions } from '@/hooks/useAnalysisActions';
import { generateAnalysisPdf } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface AnalysisDetailClientProps {
  initialAnalysis: Analysis;
}

// Helper function to calculate totals
const calculateIssueTotals = (nodes: Node[]) => {
  const totals = {
    potentialBugs: 0,
    styleIssues: 0,
    securityConcerns: 0,
    incompleteCode: 0,
    performanceConcerns: 0,
  };

  const traverse = (node: Node) => {
    // A node is a container/branch if it has children
    if (node.isContainer && node.children) {
      node.children.forEach(traverse);
    } else {
      // This is a leaf node, so count its issues
      totals.potentialBugs += node.potentialBugs?.length || 0;
      totals.styleIssues += node.styleIssues?.length || 0;
      totals.securityConcerns += node.securityConcerns?.length || 0;
      totals.incompleteCode += node.incompleteCode?.length || 0;
      totals.performanceConcerns += node.performanceConcerns?.length || 0;
    }
  };

  nodes.forEach(traverse);
  return totals;
};

export default function AnalysisDetailClient({ initialAnalysis }: AnalysisDetailClientProps) {
  // State for the modal
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  // State for the PDF download button
  const [isDownloading, setIsDownloading] = useState(false);

  // Hooks
  const { data: analysis, isLoading } = useAnalysis(initialAnalysis._id, {
    initialData: initialAnalysis,
    // Enable refetching to get status updates for 'stopping' -> 'stopped'
    refetchInterval: (data: any) =>
  data?.status === 'pending' || data?.status === 'running' || data?.status === 'stopping' || data?.status === 'starting'
    ? 5000
    : false,
  });
  const { deleteAnalysis, rerunAnalysis, stopAnalysis  } = useAnalysisActions(analysis?._id || initialAnalysis._id);
  const { showConfirmation, hideConfirmation } = useGlobalErrorStore();
  
  const currentAnalysis = analysis || initialAnalysis;

  // Calculate issue totals
  const issueTotals = useMemo(() => {
    if (!currentAnalysis?.descriptions) return null;
    return calculateIssueTotals(currentAnalysis.descriptions);
  }, [currentAnalysis?.descriptions]);
  
  // Handlers
  const handleDeleteClick = () => {
    showConfirmation(
      "Delete Analysis",
      `Are you sure you want to delete the analysis for "${currentAnalysis.repository}"? This action cannot be undone.`,
      () => {
        // The hook now handles success/error toasts and navigation
        deleteAnalysis.mutate(); 
        hideConfirmation();
      }
    );
  };

  const handleRerunClick = () => {
    rerunAnalysis.mutate(undefined);
  };

  const handleStopClick = () => {
    stopAnalysis.mutate();
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const handleDownloadPdfClick = async () => {
    if (!currentAnalysis || !issueTotals) {
            toast.error("Analysis data is not fully loaded yet. Please try again.");
            return;
    }

        setIsDownloading(true);
        toast.info("Generating PDF report... This may take a moment.");

        try {
            // Use a brief timeout to allow the UI to update with the loading state
            // before the potentially blocking PDF generation task begins.
            await new Promise(resolve => setTimeout(resolve, 50));
            generateAnalysisPdf(currentAnalysis, issueTotals);
        } catch (error) {
            logger.error("Failed to generate PDF:", error);
            toast.error("An error occurred while generating the PDF report.");
        } finally {
            setIsDownloading(false);
        }
  };

  const handleDownloadJsonClick = () => {
    if (!currentAnalysis) {
      toast.error("Analysis data is not fully loaded yet. Please try again.");
      return;
    }

    try {
      // Define the keys to remove from the analysis object and any nested nodes.
      const keysToRemove = new Set([
        '_id',
        'userId',
        'projectId',
        'cost',
        'status',
        'desiredStatus',
        'createdAt',
        'updatedAt',
      ]);

      // The 'replacer' function is called for each key-value pair during serialization.
      // If a key is in our set, we return 'undefined' to exclude it from the JSON output.
      const replacer = (key: string, value: any) => {
        if (keysToRemove.has(key)) {
          return undefined;
        }
        return value;
      };
      
      // Sanitize repository name to create a clean filename
      const repoName = currentAnalysis.repository.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `analysis-report-${repoName}.json`;

      // Create a blob from the pretty-printed JSON data, using the replacer to filter it.
      const jsonString = JSON.stringify(currentAnalysis, replacer, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary link and URL
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      logger.error("Failed to generate and download JSON:", error);
      toast.error("An error occurred while preparing the JSON file.");
    }
  };

  // Loading state for the whole page (initial load)
  if (isLoading && !analysis) {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <SkeletonLoader className="h-20 w-full" />
            <SkeletonLoader className="h-48 w-full" />
            <div className="grid lg:grid-cols-2 gap-6">
                <SkeletonLoader className="h-96 w-full" />
                <SkeletonLoader className="h-96 w-full" />
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <AnalysisHeader
          repository={currentAnalysis.repository}
          onDeleteClick={handleDeleteClick}
          onRerunClick={handleRerunClick}
          onStopClick={handleStopClick}
          onDownloadPdfClick={handleDownloadPdfClick}
          onDownloadJsonClick={handleDownloadJsonClick}
          isDownloading={isDownloading}
          isDeleting={deleteAnalysis.isPending}
          isRerunning={rerunAnalysis.isPending}
          isStopping={stopAnalysis.isPending || currentAnalysis.status === 'stopping'}
          status={currentAnalysis.status}
          analysisId={currentAnalysis._id}
        />
        
        <div className="space-y-8 mt-6">
          <AnalysisOverview analysis={currentAnalysis} issueTotals={issueTotals} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DescriptionTree
              nodes={currentAnalysis.descriptions}
              onNodeClick={handleNodeClick}
              status={currentAnalysis.status}
            />
            <AnalysisReports
              buildReport={currentAnalysis.buildReport}
              testReport={currentAnalysis.testReport}
              runReport={currentAnalysis.runReport}
              status={currentAnalysis.status}
            />
          </div>
        </div>
      </div>

      <NodeDetailModal
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
      />
      <ConfirmationDialog />
    </>
  );
}
