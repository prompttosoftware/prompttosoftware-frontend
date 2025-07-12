'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LinkJiraButton = () => {
  const { user, isLoading } = useAuth();

  const handleLinkJira = () => {
    const JIRA_CLIENT_ID = process.env.NEXT_PUBLIC_JIRA_CLIENT_ID;
    const JIRA_REDIRECT_URI = process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI;
    
    if (!JIRA_CLIENT_ID || !JIRA_REDIRECT_URI) {
      console.error("Jira environment variables are not set on the client.");
      toast.error("Configuration Error", {
        description: "Jira integration is not configured. Please contact support.",
      });
      return;
    }

    const state = crypto.randomUUID(); // Modern, secure way to generate a random state
    const scopes = [
      'offline_access', // Required for getting a refresh_token
      'read:jira-work',
      'write:jira-work',
      'manage:jira-project',
      'read:jira-user',
    ].join(' ');

    const authUrl = new URL('https://auth.atlassian.com/authorize');
    authUrl.searchParams.append('audience', 'api.atlassian.com');
    authUrl.searchParams.append('client_id', JIRA_CLIENT_ID);
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('redirect_uri', JIRA_REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('prompt', 'consent');

    sessionStorage.setItem('jira_oauth_state', state);

    window.location.href = authUrl.toString();
  };

  // The `?? false` gracefully handles when user or integrations objects are undefined.
  const isJiraLinked = user?.integrations?.jira?.isLinked ?? false;

  return (
    <Button
      type="button"
      onClick={handleLinkJira}
      className="bg-blue-600 hover:bg-blue-700 text-white"
      disabled={isLoading || isJiraLinked}
      aria-label={isJiraLinked ? 'Jira account is linked' : 'Link your Jira account'}
    >
      {isJiraLinked ? 'Jira Linked' : 'Link Jira'}
    </Button>
  );
};

export default LinkJiraButton;
