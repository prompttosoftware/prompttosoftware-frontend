'use client';

import React from 'react';
import DeleteAccountButton from '../components/DeleteAccountButton';
import { SavedCardsList } from '../components/SavedCardsList';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
        <p className="text-gray-700 mb-4">
          Here you can manage your account settings and preferences.
        </p>
        <DeleteAccountButton /> {/* Render the DeleteAccountButton component */}
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
        <p className="text-gray-700 mb-4">
          Manage your saved payment cards for quicker transactions.
        </p>
        <SavedCardsList />
      </section>

      {/* Other settings sections can go here */}
    </div>
  );
}
