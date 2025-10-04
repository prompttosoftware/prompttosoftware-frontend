'use client';

import React from 'react';
import { Analysis } from '@/types/analysis';
import EmptyState from '@/app/(main)/components/EmptyState';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import AnalysisCard from './AnalysisCard';
import { useUserAnalysis } from '@/hooks/useUserAnalysis';

interface AnalysisListProps {
  initialAnalysis: Analysis[];
}

const AnalysisList: React.FC<AnalysisListProps> = ({ initialAnalysis }) => {
  const { data: analyses, isLoading, isError } = useUserAnalysis({
    initialData: initialAnalysis,
  });

  // Display skeleton loaders while fetching on the client
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonLoader key={index} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  // Display an error message if fetching fails
  if (isError) {
    return (
      <EmptyState
        title="Error Loading Analyses"
        description="We couldn't load your analyses at this time. Please try again later."
      />
    );
  }

  // Display an empty state if the user has no analyses
  if (!analyses || analyses.length === 0) {
    return (
      <EmptyState
        title="No Analyses Yet"
        description="Start your first analysis to see it listed here."
        buttonLink="/new-analysis"
        buttonText="Start New Analysis"
      />
    );
  }

  // Render the list of analysis cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {analyses.map((analysis: Analysis) => (
        <AnalysisCard key={analysis._id} analysis={analysis} />
      ))}
    </div>
  );
};

export default AnalysisList;
