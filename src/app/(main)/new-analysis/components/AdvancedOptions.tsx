'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ModelSelection from '../../new-project/components/ModelSelection';
import InstallationManager from '../../new-project/components/InstallationsManager';

export default function AdvancedOptions() {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <Button type="button" onClick={() => setShow(true)} variant="secondary" className="w-full" id="advanced-options-toggle">
        Show Advanced Options
      </Button>
    );
  }

  return (
    <div className="space-y-6 border-t pt-6">
      <Button type="button" onClick={() => setShow(false)} variant="secondary" className="w-full" id="advanced-options-toggle">
        Hide Advanced Options
      </Button>
      <ModelSelection />
      <InstallationManager />
    </div>
  );
}
