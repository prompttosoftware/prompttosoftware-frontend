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
  });
  const { deleteAnalysis, rerunAnalysis } = useAnalysisActions(analysis?._id || initialAnalysis._id);
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
        deleteAnalysis.mutate();
        hideConfirmation();
      }
    );
  };

  const handleRerunClick = () => {
    rerunAnalysis.mutate(undefined);
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const handleDownloadClick = async () => {
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
          onDownloadClick={handleDownloadClick}
          isDownloading={isDownloading}
          isDeleting={deleteAnalysis.isPending}
          isRerunning={rerunAnalysis.isPending}
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
