// src/app/new-analysis/components/AnalysisClient.tsx
'use client';

import { Project } from '@/types/project';
import AnalysisForm from './AnalysisForm';

interface AnalysisClientProps {
  initialProjects: Project[];
}

/**
 * This client component receives server-fetched data and passes it
 * to the main form component, enabling client-side interactivity.
 */
export default function AnalysisClient({ initialProjects }: AnalysisClientProps) {
  return <AnalysisForm initialProjects={initialProjects} />;
}
