'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ModelSelection from './ModelSelection';
import InstallationManager from './InstallationsManager';
import JiraIntegration from './JiraIntegration';
import DevelopmentSettings from './DevelopmentSettings';

interface AdvancedOptionsProps {
  isEditing: boolean;
  isJiraGloballyLinked: boolean;
}

export default function AdvancedOptions({ isEditing, isJiraGloballyLinked }: AdvancedOptionsProps) {
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
      <h2 className="text-xl font-semibold text-card-foreground">Advanced Options</h2>
      <DevelopmentSettings />
      <ModelSelection />
      <InstallationManager />
      <JiraIntegration isJiraGloballyLinked={isJiraGloballyLinked} />
    </div>
  );
}
