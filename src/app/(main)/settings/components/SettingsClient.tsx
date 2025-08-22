'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

import { ApiKeyManager } from '@/app/(main)/components/ApiKeyManager';
import DeleteAccountButton from '@/app/(main)/components/DeleteAccountButton';
import UnlinkJiraButton from '../../components/UnlinkJiraButton';
import LinkJiraButton from '../../components/LinkJiraButton';
import { SettingsSavedCardsList } from './SettingsSavedCardsList';
import { Button } from '@/components/ui/button';
import SkeletonLoader from '../../components/SkeletonLoader';

/**
 * A skeleton component that mimics the layout of the settings page
 * to provide a smooth loading experience.
 */
const SettingsPageSkeleton = () => (
  <div className="container mx-auto p-8">
    {/* Account Management Skeleton */}
    <section className="bg-card p-6 rounded-lg shadow-md mb-8">
      <SkeletonLoader width="w-1/2" height="h-8" className="mb-4" />
      <div className="space-y-4">
        <div>
          <SkeletonLoader width="w-16" height="h-4" className="mb-2" />
          <SkeletonLoader width="w-1/3" height="h-6" />
        </div>
      </div>
      <hr className="my-6" />
      <div>
        <SkeletonLoader width="w-1/4" height="h-6" className="mb-4" />
        <div className="flex items-center gap-4">
          <SkeletonLoader width="w-24" height="h-10" />
          <SkeletonLoader width="w-36" height="h-10" />
        </div>
      </div>
    </section>

    {/* Payment Methods Section - The list inside manages its own loading state */}
    <section className="bg-card p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
      <p className="text-muted-foreground mb-4">
        Manage your saved payment cards for quicker transactions.
      </p>
      <SettingsSavedCardsList />
    </section>

    {/* API Keys Section - This component manages its own state */}
    <section className="bg-card p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">API Keys</h2>
      <p className="text-muted-foreground mb-4">
        Add and delete your API keys for each provider.
      </p>
      <ApiKeyManager />
    </section>

    {/* Jira Integration Skeleton */}
    <section className="bg-card p-6 rounded-lg shadow-md mb-8">
      <SkeletonLoader width="w-1/3" height="h-8" className="mb-4" />
      <SkeletonLoader width="w-full" height="h-5" className="mb-4" />
      <div className="flex items-center gap-4">
        <SkeletonLoader width="w-1/4" height="h-5" />
        <SkeletonLoader width="w-28" height="h-10" />
      </div>
    </section>
  </div>
);

type SettingsClientProps = {};

export default function SettingsClient({}: SettingsClientProps) {
  const { user, logout, isLoading } = useAuth();

  // If data is loading, render the skeleton component
  if (isLoading) {
    return <SettingsPageSkeleton />;
  }
    
  return (
    <div className="container mx-auto p-8">
      <section className="bg-card p-6 rounded-lg border mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-card-foreground">{user?.name || 'N/A'}</p>
          </div>
        </div>

        <hr className="my-6" />

        <div>
          <h3 className="text-lg font-medium mb-4">Account Actions</h3>
          <div className="flex items-center gap-4">
            <Button variant='secondary' onClick={logout}>
              Logout
            </Button>
            <DeleteAccountButton />
          </div>
        </div>
      </section>

      <section className="bg-card p-6 rounded-lg border mb-8">
        <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
        <p className="text-muted-foreground mb-4">
          Manage your saved payment cards for quicker transactions.
        </p>
        <SettingsSavedCardsList />
      </section>

      <section className="bg-card p-6 rounded-lg border mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Keys</h2>
        <p className="text-muted-foreground mb-4">
          Add and delete your API keys for each provider.
        </p>
        <ApiKeyManager />
      </section>

      <section className="bg-card p-6 rounded-lg border mb-8">
        <h2 className="text-2xl font-semibold mb-4">Jira Integration</h2>
        <p className="text-muted-foreground mb-4">
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
  );
}
