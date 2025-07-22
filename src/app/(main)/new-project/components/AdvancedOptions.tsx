'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ModelSelection from './ModelSelection';
import InstallationManager from './InstallationsManager';
import JiraIntegration from './JiraIntegration';

interface AdvancedOptionsProps {
  isEditing: boolean;
  isJiraGloballyLinked: boolean;
}

export default function AdvancedOptions({ isEditing, isJiraGloballyLinked }: AdvancedOptionsProps) {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <Button type="button" onClick={() => setShow(true)} variant="secondary" className="w-full">
        Show Advanced Options
      </Button>
    );
  }

  return (
    <div className="space-y-6 border-t pt-6">
      <h2 className="text-xl font-semibold text-gray-800">Advanced Options</h2>
      <ModelSelection />
      <InstallationManager />
      <JiraIntegration isJiraGloballyLinked={isJiraGloballyLinked} />
    </div>
  );
}
