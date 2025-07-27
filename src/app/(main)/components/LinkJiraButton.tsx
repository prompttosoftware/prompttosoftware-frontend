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
      'read:Aboard-scope.admin:Ajira-software', 
      'read:Aboard-scope:Ajira-software', 
      'write:Aboard-scope:Ajira-software', 
      'read:Aproject:Ajira', 
      'write:Aproject:Ajira', 
      'delete:Aproject:Ajira', 
      'delete:Aissue:Ajira', 
      'read:Aissue:Ajira', 
      'write:Aissue:Ajira', 
      'read:Aissue-meta:Ajira', 
      'read:Aissue-link:Ajira', 
      'write:Aissue-link:Ajira', 
      'read:Aissue-type:Ajira', 
      'read:Aissue-link-type:Ajira', 
      'read:Aissue-type-scheme:Ajira', 
      'read:Aepic:Ajira-software', 
      'write:Aepic:Ajira-software', 
      'read:Aissue:Ajira-software', 
      'read:Aissue-status:Ajira', 
      'read:Astatus:Ajira', 
      'read:Aworkflow:Ajira', 
      'read:Aworkflow-scheme:Ajira', 
      'read:Auser:Ajira', 
      'write:Aattachment:Ajira', 
      'read:Ajql:Ajira', 
      'write:Acomment:Ajira', 
      'write:Acomment.property:Ajira', 
      'read:Aissue-security-level:Ajira', 
      'read:Aavatar:Ajira', 
      'read:Afield-configuration:Ajira', 
      'read:Aissue.changelog:Ajira', 
      'read:Aissue.vote:Ajira', 
      'read:Aproject-version:Ajira', 
      'read:Aproject.component:Ajira', 
      'read:Aproject-category:Ajira', 
      'read:Agroup:Ajira', 
      'read:Aapplication-role:Ajira', 
      'read:Aproject.property:Ajira', 
      'read:Aissue-type-hierarchy:Ajira', 
      'write:Aissue.property:Ajira', 
      'read:Aissue.transition:Ajira', 
      'read:Afield:Ajira', 
      'validate:Ajql:Ajira', 
      'read:Aaudit-log:Ajira', 
      'read:Aissue-details:Ajira', 
      'read:Aattachment:Ajira', 
      'read:Ame', 
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
      // Using arbitrary value for Jira's brand blue
      className="bg-[#0052CC] hover:bg-[#0052cc]/90 text-white font-semibold flex items-center"
      disabled={isLoading || isJiraLinked}
      aria-label={isJiraLinked ? 'Jira account is linked' : 'Link your Jira account'}
    >
      <JiraLogoIcon className="text-white"/>
    </Button>
  );
};

export default LinkJiraButton;
