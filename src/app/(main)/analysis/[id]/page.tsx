import { notFound } from 'next/navigation';
import { fetchAnalysisById } from '@/lib/data/analysis';
import AnalysisDetailClient from './components/AnalysisDetailClient';

// Ensure the page is always freshly rendered on request
export const revalidate = 0;

interface AnalysisDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * RSC for the analysis detail page.
 * 1. Fetches initial analysis data on the server.
 * 2. If not found, triggers a 404.
 * 3. Passes data to the client component for interaction and dynamic updates.
 */
const AnalysisDetailPage = async (props: AnalysisDetailPageProps) => {
  let id: string;
  
  try {
    if (!props || !props.params) {
      console.error('No props or params provided');
      notFound();
    }
    
    // Handle both Promise and direct object cases for backward compatibility
    let resolvedParams;
    if (typeof props.params.then === 'function') {
      // It's a Promise
      resolvedParams = await props.params;
    } else {
      // It's already an object (shouldn't happen in Next.js 15+, but just in case)
      resolvedParams = props.params as any;
    }
    
    console.log('Resolved params:', resolvedParams);
    
    if (!resolvedParams || typeof resolvedParams.id !== 'string') {
      console.error('Invalid resolved params:', resolvedParams);
      notFound();
    }
    
    id = resolvedParams.id;
    console.log('Final ID:', id);
    
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  const initialAnalysis = await fetchAnalysisById(id);

  if (!initialAnalysis) {
    notFound();
  }

  return <AnalysisDetailClient initialAnalysis={initialAnalysis} />;
};

export default AnalysisDetailPage;
