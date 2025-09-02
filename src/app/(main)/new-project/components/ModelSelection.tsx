'use-client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntelligenceLevelModelSelector } from '@/components/ai-model-selection/IntelligenceLevelModelSelector';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MODEL_LEVELS = [
  { level: 'utility', title: 'Utility', tooltip: 'Handles quick, lightweight tasks such as data formatting or simple fixes.' },
  { level: 'low', title: 'Low', tooltip: 'Used for tasks requiring basic reasoning where small errors are acceptable.' },
  { level: 'medium', title: 'Medium', tooltip: 'Carries out most development work, including writing code and tests, with a focus on efficiency.' },
  { level: 'high', title: 'High', tooltip: 'Supports critical tasks where higher accuracy is required, serving as reinforcement for the medium level.' },
  { level: 'super', title: 'Super', tooltip: 'Reserved for planning, reviewing, and complex reasoning to guide overall development.' },
  { level: 'backup', title: 'Backup', tooltip: 'Acts as a fallback for the most difficult cases, stepping in when other levels encounter challenges.' },
];

export default function ModelSelection() {
  const [activeTab, setActiveTab] = useState('medium');

  return (
    <TooltipProvider>
    <Tabs>
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 border p-1 rounded-lg bg-muted">
        {MODEL_LEVELS.map(({ level, title, tooltip }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger
                key={level}
                value={level}
                type="button"
                // Set the active tab state on click.
                onClick={() => setActiveTab(level)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:pointer-events-none disabled:opacity-50',
                  activeTab === level
                    ? 'bg-background text-foreground shadow-sm' // Active tab style
                    : 'text-muted-foreground hover:bg-background/50' // Inactive tab style
                )}
              >
                {title}
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        ))}
      </TabsList>

      <div className="mt-4">
        {MODEL_LEVELS.map(({ level }) =>
          activeTab === level ? (
            <TabsContent
              key={level}
              value={level}
              className="p-4 border rounded-md"
            >
              <IntelligenceLevelModelSelector level={level as any} />
            </TabsContent>
          ) : null
        )}
      </div>
    </Tabs>
    </TooltipProvider>
  );
}
