'use client';

import { useState } from 'react';
import { IntelligenceLevelModelSelector } from '@/components/ai-model-selection/IntelligenceLevelModelSelector';

const MODEL_LEVELS = [
  { level: 'utility', title: 'Utility Models', tooltip: '...' },
  { level: 'low', title: 'Low Intelligence Models', tooltip: '...' },
  { level: 'medium', title: 'Medium Intelligence Models', tooltip: '...' },
  { level: 'high', title: 'High Intelligence Models', tooltip: '...' },
  { level: 'super', title: 'Super Intelligence Models', tooltip: '...' },
  { level: 'backup', title: 'Backup Models', tooltip: '...' },
];

export default function ModelSelection() {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const toggle = (level: string) => {
    setExpanded(prev => ({ ...prev, [level]: !prev[level] }));
  };

  return (
    <div className="space-y-4">
      {MODEL_LEVELS.map(({ level, title, tooltip }) => (
        <div key={level} className="border rounded-md">
          <button type="button" onClick={() => toggle(level)} className="button-secondary w-full text-left p-4 font-medium">
            {title}
          </button>
          {expanded[level] && (
            <div className="p-4 border-t">
              <IntelligenceLevelModelSelector level={level as any} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
