import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { fetchUserAnalysis } from '@/lib/data/analysis';
import EmptyState from '@/app/(main)/components/EmptyState';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AnalysisList from './components/AnalysisList';

// Revalidate the page data periodically to keep it fresh
export const revalidate = 30;

/**
 * This RSC acts as a shell. It performs the initial data fetch on the server
 * and passes the data to a client component for dynamic updates.
 */
const AnalysisPage = async () => {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has('jwtToken');

  // Fetch initial data on the server to prevent a loading spinner on first page load.
  const initialAnalysis = await fetchUserAnalysis();

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Analyses</h1>
        {(isAuthenticated || process.env.NODE_ENV !== 'production') && (
          <Link href="/new-analysis" passHref>
            <Button data-testid="new-analysis-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        )}
      </div>

      {isAuthenticated || process.env.NODE_ENV !== 'production' ? (
        <AnalysisList initialAnalysis={initialAnalysis} />
      ) : (
        <EmptyState
          title="Please Log In"
          description="You need to be signed in to view your analyses."
          buttonLink="/login"
          buttonText='Go to Login'
        />
      )}
    </div>
  );
};

export default AnalysisPage;
