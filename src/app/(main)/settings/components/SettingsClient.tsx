'use client';

import React from 'react';
import { UserProfile } from '@/types/auth';
import { ApiKeyManager } from '@/app/(main)/components/ApiKeyManager';
import DeleteAccountButton from '@/app/(main)/components/DeleteAccountButton';
import { SavedCardsList } from '@/app/(main)/components/SavedCardsList';
import { AuthProvider } from '@/lib/AuthContext';

type SettingsClientProps = {
  user: UserProfile;
};

// This component takes the server-fetched user and provides it to its
// children via the context they expect.
export default function SettingsClient({ user }: SettingsClientProps) {
  return (
    // The AuthProvider now gets its initial state from the props passed
    // by the server page.
    <AuthProvider initialData={user}>
      <div className="container mx-auto p-8">
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
          <p className="text-gray-700 mb-4">
            Here you can manage your account settings and preferences.
          </p>
          <DeleteAccountButton />
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
          <p className="text-gray-700 mb-4">
            Manage your saved payment cards for quicker transactions.
          </p>
          {/* This now works, because it's inside the AuthProvider! */}
          <SavedCardsList />
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">API Keys</h2>
          <p className="text-gray-700 mb-4">
            Add and delete your API keys for each provider.
          </p>
          {/* This also works now! */}
          <ApiKeyManager />
        </section>
      </div>
    </AuthProvider>
  );
}
