'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles, GitBranch, RefreshCw, DollarSign, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const lifecycleSteps = [
  {
    id: 1,
    icon: Sparkles,
    title: '1. Define & Launch',
    content: (
      <>
        <ul className="space-y-4 mb-6 pl-2"> 
          <li className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <span>
              Describe your project in any language or framework. Our autonomous system handles the rest—creating repositories, writing code, running tests, and even researching solutions.
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <span>
              You have full control to choose the exact AI models for different tasks, from cost-effective options to powerful frontier models.
            </span>
          </li>
        </ul>
        <div className="rounded-lg bg-muted p-4 border">
          {/* This pricing box was already well-structured, so we leave it as is. */}
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-lg font-semibold text-card-foreground">Transparent, Usage-Based Pricing</h4>
          </div>
          <ul className="space-y-2 text-card-foreground text-sm list-disc pl-5">
            <li>
              <strong>Platform Fee:</strong> A flat rate of $0.50 per hour for each active project.
            </li>
            <li>
              <strong>AI API Costs:</strong> You pay the direct cost for any AI API usage. Costs vary by the models you select.
            </li>
            <li>
              <strong>Bring Your Own Key:</strong> Provide your own API key for an AI provider, and the API usage fee for that provider is waived.
            </li>
          </ul>
          <div className="mt-4 text-sm text-card-foreground bg-primary/10 p-3 rounded-md border border-primary/20">
            <p>
              <span className="font-semibold text-primary">Affordability in Practice:</span> With default settings, a project often runs for <strong>less than $1.00 per hour</strong>, which includes both the platform fee and typical AI API costs.
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            You have full control over your spending. Set maximum cost and runtime limits to automatically stop a project, or pause it manually at any time.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 2,
    icon: GitBranch,
    title: '2. Collaborate & Iterate',
    content: (
      <ul className="space-y-4 mb-6 pl-2"> 
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            The AI works alongside you and your team. Point it to existing GitHub repositories to add features or fix bugs. It commits code, opens pull requests, and updates Jira tickets just like a human developer.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            If you move a Jira ticket to "In Progress," the AI won't touch it. It pulls the latest code before every task, ensuring it's always up-to-date with your team's changes.
          </span>
        </li>
        <li className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <span>
            A single project can span multiple repositories. The AI works concurrently on your frontend, backend, mobile apps, games, etc., understanding the complete architecture to ensure all components work together.
          </span>
        </li>
      </ul>
    ),
  },
  {
    id: 3,
    icon: RefreshCw,
    title: '3. Evolve & Maintain',
    content: (
      <>
        <ul className="space-y-4 mb-6 pl-2"> 
          <li className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <span>
              Your project is a living entity. When development is complete, you can restart the agent at any time with a new description to request specific features, general improvements, or bug fixes.
            </span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <span>
              If your project is linked to Jira, the AI will automatically pick up any new tickets you've added or moved back to the "To Do" column—no need to even change the project description.
            </span>
          </li>
        </ul>
        <div className="mt-6 text-card-foreground bg-primary/10 p-4 rounded-md border border-primary/20">
          <p>
            <span className="font-semibold text-primary">We embrace creative freedom.</span> Our system is designed to be unconstrained, letting the AI attempt ambitious tasks. This might lead to 'AI jank'—unexpected but often innovative results. We give you the freedom to build anything, no matter how ambitious.
          </p>
        </div>
      </>
    ),
  },
];

export function ProjectLifecycleAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default first item open

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {lifecycleSteps.map((step, index) => {
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
