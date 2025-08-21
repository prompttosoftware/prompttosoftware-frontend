'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { JiraLogoIcon } from '@/components/icons/JiraLogoIcon';

const UnlinkJiraButton = () => {
  const { user, isLoading, refreshUser } = useAuth();

  const handleUnlinkJira = async () => {
    try {
      await api.unlinkJiraAccount();
      await refreshUser();

      toast.success('Jira account unlinked successfully.');
    } catch (error) {
      console.error('Failed to unlink Jira account:', error);
      toast.error('Failed to unlink Jira account. Please try again.');
    }
  };

  const isJiraLinked = user?.integrations?.jira?.isLinked ?? false;

  return (
    <Button
      type="button"
      onClick={handleUnlinkJira}
      className="bg-primary hover:bg-primary-hover text-primary-foreground hover:text-primary-hover-foreground font-semibold flex items-center focus:ring"
      disabled={isLoading || !isJiraLinked}
      aria-label="Unlink your Jira account"
    >
      <JiraLogoIcon className="w-4 h-4 mr-2" />
      Unlink Jira
    </Button>
  );
};

export default UnlinkJiraButton;
