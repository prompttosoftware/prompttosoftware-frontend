'use client';

import React from 'react';
import { UserProfile } from '@/types/auth';
import { ApiKeyManager } from '@/app/(main)/components/ApiKeyManager';
import DeleteAccountButton from '@/app/(main)/components/DeleteAccountButton';
import { AuthProvider } from '@/lib/AuthContext';
import UnlinkJiraButton from '../../components/UnlinkJiraButton';
import LinkJiraButton from '../../components/LinkJiraButton';
import { useAuth } from '@/hooks/useAuth';
import { SettingsSavedCardsList } from './SettingsSavedCardsList';
import { Button } from '@/components/ui/button';

type SettingsClientProps = {
  initialUser: UserProfile;
};

// This component takes the server-fetched user and provides it to its
// children via the context they expect.
export default function SettingsClient({ initialUser }: SettingsClientProps) {

  const { user, logout } = useAuth();
    
  return (
    // The AuthProvider now gets its initial state from the props passed
    // by the server page.
    <AuthProvider initialData={initialUser}>
      <div className="container mx-auto p-8">
        <section className="bg-card p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
          
          {/* Part 1: Display User Information at the top */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-card-foreground">{user?.name || 'N/A'}</p>
            </div>
          </div>

          {/* A visual separator makes the layout cleaner */}
          <hr className="my-6" />

          {/* Part 2: Place dangerous/session actions at the bottom */}
          <div>
            <h3 className="text-lg font-medium mb-4">Account Actions</h3>
            <div className="flex items-center gap-4">
              {/* New Logout Button */}
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
              
              {/* Existing Delete Account Button */}
              <DeleteAccountButton />
            </div>
          </div>
        </section>

        <section className="bg-card p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl test-card-foreground font-semibold mb-4">Payment Methods</h2>
          <p className="text-card-foreground mb-4">
            Manage your saved payment cards for quicker transactions.
          </p>
          <SettingsSavedCardsList />
        </section>

        <section className="bg-card p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl test-card-foreground font-semibold mb-4">API Keys</h2>
          <p className="text-card-foreground mb-4">
            Add and delete your API keys for each provider.
          </p>
          <ApiKeyManager />
        </section>
        <section className="bg-card p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl test-card-foreground font-semibold mb-4">Jira Integration</h2>
          <p className="text-card-foreground mb-4">
            Connect your Jira account to enable project syncing and enhanced issue tracking.
          </p>

          <div className="flex items-center gap-4">
            {user?.integrations.jira.isLinked ? (
              <>
                <span className="text-card-foreground">Jira is linked.</span>
                <UnlinkJiraButton />
              </>
            ) : (
              <>
                <span className="text-card-foreground">Jira is not linked.</span>
                <LinkJiraButton />
              </>
            )}
          </div>
        </section>
      </div>
    </AuthProvider>
  );
}
