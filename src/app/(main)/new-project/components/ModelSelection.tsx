'use-client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntelligenceLevelModelSelector } from '@/components/ai-model-selection/IntelligenceLevelModelSelector';
import { cn } from '@/lib/utils';

const MODEL_LEVELS = [
  { level: 'utility', title: 'Utility', tooltip: '...' },
  { level: 'low', title: 'Low', tooltip: '...' },
  { level: 'medium', title: 'Medium', tooltip: '...' },
  { level: 'high', title: 'High', tooltip: '...' },
  { level: 'super', title: 'Super', tooltip: '...' },
  { level: 'backup', title: 'Backup', tooltip: '...' },
];

export default function ModelSelection() {
  const [activeTab, setActiveTab] = useState('medium');

  return (
    // The Tabs component itself doesn't need props since we're handling state.
    <Tabs>
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 border p-1 rounded-lg bg-muted">
        {MODEL_LEVELS.map(({ level, title }) => (
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
  );
}
