'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ScanSearch, 
  Network, 
  TerminalSquare, 
  MessageCircle, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';


//=================================================================
// 1. Accordion Component for Feature Breakdown
//=================================================================
const analysisSteps = [
  {
    id: 1,
    icon: ScanSearch,
    title: '1. Deep Code & Security Audit',
    content: (
      <ul className="space-y-4 mb-6 pl-2"> 
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            The AI meticulously reviews every file, scanning for potential bugs, stylistic inconsistencies, and performance bottlenecks.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            It proactively identifies security vulnerabilities, from common pitfalls to more subtle concerns, helping you harden your application.
          </span>
        </li>
         <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            Finds and flags incomplete sections of code, such as `TODO` comments or empty function stubs, giving you a clear list of outstanding work.
          </span>
        </li>
      </ul>
    ),
  },
  {
    id: 2,
    icon: Network,
    title: '2. AI-Generated Architecture & Documentation',
    content: (
      <ul className="space-y-4 mb-6 pl-2"> 
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            Our system doesn't just read code; it understands it. It generates a clear, natural-language description for every single file.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            Files are intelligently grouped into features, and features into larger components, creating a complete, hierarchical description tree of your entire project.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            Perfect for onboarding new developers, understanding legacy codebases, or getting a high-level overview of an unfamiliar repository.
          </span>
        </li>
      </ul>
    ),
  },
  {
    id: 3,
    icon: TerminalSquare,
    title: '3. Automated Build, Run & Test Simulation',
    content: (
      <ul className="space-y-4 mb-6 pl-2"> 
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            Our AI agent acts like a new developer. It actively attempts to build your application from scratch, documenting every command it runs.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            If a test suite is found, the agent will execute it, recording the output and highlighting any failures or errors.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            You get a detailed log of the entire process, providing invaluable insight into your project's setup and CI/CD health without any manual effort.
          </span>
        </li>
      </ul>
    ),
  },
  {
    id: 4,
    icon: MessageCircle,
    title: '4. Actionable Reports & AI-Powered Chat',
    content: (
      <>
        <ul className="space-y-4 mb-6 pl-2"> 
          <li className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <span>
              All findings are compiled into a comprehensive report, available on our platform or as a downloadable PDF for offline access and sharing.
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <span>
              Use our integrated chat feature to discuss the findings. The AI has full context of the analysis and can provide advice, generate code snippets, and help you fix issues directly.
            </span>
          </li>
        </ul>
        <div className="rounded-lg bg-muted p-4 border mt-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-primary" strokeWidth={2} />
            <h4 className="text-lg font-semibold text-card-foreground">Simple Pay-As-You-Go Pricing</h4>
          </div>
          <ul className="space-y-2 text-card-foreground text-sm list-disc pl-5">
            <li>
              <strong>AI API Costs:</strong> You only pay the direct, pass-through cost for the AI models used during the analysis.
            </li>
            <li>
              <strong>Compute Runtime:</strong> A small fee is added for the virtual machine runtime, which is typically 5-10 minutes.
            </li>
          </ul>
          <div className="mt-4 text-sm text-card-foreground bg-primary/10 p-3 rounded-md border border-primary/20">
            <p>
              <span className="font-semibold text-primary">No Subscriptions, No Surprises.</span> A complete analysis for a medium-sized project typically costs less than a dollar.
            </p>
          </div>
        </div>
      </>
    ),
  },
];

export default function AnalysisAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {analysisSteps.map((step, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={step.id} className="border border-border rounded-lg bg-card overflow-hidden">
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex justify-between items-center p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <step.icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                <h3 className="text-xl font-semibold text-card-foreground">
                  {step.title}
                </h3>
              </div>
              <ChevronDown
                className={cn(
                  'w-6 h-6 text-muted-foreground transition-transform duration-300',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all duration-500 ease-in-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-0 text-card-foreground leading-relaxed">
                  {step.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
