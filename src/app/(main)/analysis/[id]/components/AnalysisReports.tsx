'use client';

import React from 'react';
import { BuildReport, RunReport, TestReport } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import { Status } from '@/types/project';

interface ReportCardProps {
  title: string;
  report: { content: string } | undefined;
  isLoading: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, report, isLoading }) => (
  <Card className='border'>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="max-h-80 overflow-y-auto">
      {isLoading ? (
        <SkeletonLoader className="h-24 w-full" />
      ) : report?.content ? (
        <pre className="whitespace-pre-wrap bg-muted text-muted-foreground rounded-md p-4 text-sm font-mono">
          <code>{report.content}</code>
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground italic">Report not available.</p>
      )}
    </CardContent>
  </Card>
);

interface AnalysisReportsProps {
  buildReport?: BuildReport;
  testReport?: TestReport;
  runReport?: RunReport;
  status: Status;
}

const AnalysisReports: React.FC<AnalysisReportsProps> = ({ buildReport, testReport, runReport, status }) => {
  const isActive = status === 'starting' || status === 'pending' || status === 'running';

  return (
    <div className="space-y-6">
      <ReportCard title="Build Report" report={buildReport} isLoading={!buildReport && isActive} />
      <ReportCard title="Test Report" report={testReport} isLoading={!testReport && isActive} />
      <ReportCard title="Run Report" report={runReport} isLoading={!runReport && isActive} />
    </div>
  );
};

export default AnalysisReports;
