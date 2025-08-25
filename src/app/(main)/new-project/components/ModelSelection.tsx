'use client';

import { useState } from 'react';
import { IntelligenceLevelModelSelector } from '@/components/ai-model-selection/IntelligenceLevelModelSelector';

const MODEL_LEVELS = [
  { level: 'utility', title: 'Utility Models', tooltip: '...', id: 'model-select-utility' },
  { level: 'low', title: 'Low Intelligence Models', tooltip: '...', id: 'model-select-low' },
  { level: 'medium', title: 'Medium Intelligence Models', tooltip: '...', id: 'model-select-medium' },
  { level: 'high', title: 'High Intelligence Models', tooltip: '...', id: 'model-select-high' },
  { level: 'super', title: 'Super Intelligence Models', tooltip: '...', id: 'model-select-super' },
  { level: 'backup', title: 'Backup Models', tooltip: '...', id: 'model-select-backup' },
];

export default function ModelSelection() {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const toggle = (level: string) => {
    setExpanded(prev => ({ ...prev, [level]: !prev[level] }));
  };

  return (
    <div className="space-y-4">
      {MODEL_LEVELS.map(({ level, title, tooltip, id }) => (
        <div key={level} className="border rounded-md">
          <button type="button" onClick={() => toggle(level)} className="button-secondary w-full text-left p-4 font-medium" id={id}>
            {title}
          </button>
          {expanded[level] && (
            <div className="p-4 border-t" id="model-select-card">
              <IntelligenceLevelModelSelector level={level as any} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
