'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { JiraLogoIcon } from '@/components/icons/JiraLogoIcon';

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
      'read:board-scope.admin:jira-software', 
      'read:board-scope:jira-software', 
      'write:board-scope:jira-software', 
      'read:project:jira', 
      'write:project:jira', 
      'delete:project:jira', 
      'delete:issue:jira', 
      'read:issue:jira', 
      'write:issue:jira', 
      'read:issue-meta:jira', 
      'read:issue-link:jira', 
      'write:issue-link:jira', 
      'read:issue-type:jira', 
      'read:issue-link-type:jira', 
      'read:issue-type-scheme:jira', 
      'read:epic:jira-software', 
      'write:epic:jira-software', 
      'read:issue:jira-software', 
      'read:issue-status:jira', 
      'read:status:jira', 
      'read:workflow:jira', 
      'read:workflow-scheme:jira', 
      'read:user:jira', 
      'write:attachment:jira', 
      'read:jql:jira', 
      'write:comment:jira', 
      'write:comment.property:jira', 
      'read:issue-security-level:jira', 
      'read:avatar:jira', 
      'read:field-configuration:jira', 
      'read:issue.changelog:jira', 
      'read:issue.vote:jira', 
      'read:project-version:jira', 
      'read:project.component:jira', 
      'read:project-category:jira', 
      'read:group:jira', 
      'read:application-role:jira', 
      'read:project.property:jira', 
      'read:issue-type-hierarchy:jira', 
      'write:issue.property:jira', 
      'read:issue.transition:jira', 
      'read:field:jira', 
      'validate:jql:jira', 
      'read:audit-log:jira', 
      'read:issue-details:jira', 
      'read:attachment:jira', 
      'read:me', 
      'offline_access'
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
      className="bg-primary hover:bg-primary-hover text-primary-foreground hover:text-primary-hover-foreground font-semibold flex items-center focus:ring"
      disabled={isLoading || isJiraLinked}
      aria-label={isJiraLinked ? 'Jira account is linked' : 'Link your Jira account'}
    >
      <JiraLogoIcon className="w-4 h-4 mr-2" />
      {isJiraLinked ? 'Jira Linked' : 'Link Jira'}
    </Button>
  );
};

export default LinkJiraButton;
