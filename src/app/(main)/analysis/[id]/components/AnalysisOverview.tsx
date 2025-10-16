'use client';

import React from 'react';
import { Analysis } from '@/types/analysis';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CalendarDays, DollarSign, Bug, Palette, Shield, Code, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Status, statusConfig } from '@/types/project';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const InfoBlock = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <div className="mt-1 text-lg font-semibold text-card-foreground">{value}</div>
  </div>
);

const StatusIndicator = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || { label: 'Unknown', className: 'bg-gray-400' };
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 shrink-0 rounded-full ${config.className}`}></span>
      <span className="capitalize">{config.label}</span>
    </div>
  );
};

const IssueStat = ({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-semibold text-card-foreground">{count}</span>
    </div>
);

interface IssueTotals {
    potentialBugs: number;
    styleIssues: number;
    securityConcerns: number;
    incompleteCode: number;
    performanceConcerns: number;
}

interface AnalysisOverviewProps {
    analysis: Analysis;
    issueTotals: IssueTotals | null;
}

const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({ analysis, issueTotals }) => {
  const formatDate = (date: Date) => format(new Date(date), 'MMM d, yyyy, p');

  const totalIssues = issueTotals 
    ? Object.values(issueTotals).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <Card>
      <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <InfoBlock icon={<Clock className="h-4 w-4" />} label="Status" value={<StatusIndicator status={analysis.status}/>} />
        <InfoBlock icon={<DollarSign className="h-4 w-4" />} label="Cost" value={ analysis.free ? `Free` : `$${(analysis.cost || 0).toFixed(4)}`} />
        <InfoBlock icon={<CalendarDays className="h-4 w-4" />} label="Created" value={formatDate(analysis.createdAt)} />
        <InfoBlock icon={<Clock className="h-4 w-4" />} label="Last Updated" value={formatDate(analysis.updatedAt)} />
      </CardContent>

      {issueTotals && totalIssues > 0 && (
        <>
            <div className="border-t border-border" />
            <Collapsible defaultOpen={true} className="p-6">
                <CollapsibleTrigger className="flex justify-between items-center w-full text-left cursor-pointer group">
                    <h3 className="text-base font-semibold text-card-foreground">Issue Summary</h3>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        <IssueStat icon={<Bug className="h-4 w-4 text-destructive" />} label="Potential Bugs" count={issueTotals.potentialBugs} />
                        <IssueStat icon={<Palette className="h-4 w-4 text-yellow-500" />} label="Style Issues" count={issueTotals.styleIssues} />
                        <IssueStat icon={<Shield className="h-4 w-4 text-red-600" />} label="Security Concerns" count={issueTotals.securityConcerns} />
                        <IssueStat icon={<Code className="h-4 w-4 text-blue-500" />} label="Incomplete Code" count={issueTotals.incompleteCode} />
                        <IssueStat icon={<Zap className="h-4 w-4 text-green-500" />} label="Performance" count={issueTotals.performanceConcerns} />
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </>
      )}
    </Card>
  );
};

export default AnalysisOverview;
