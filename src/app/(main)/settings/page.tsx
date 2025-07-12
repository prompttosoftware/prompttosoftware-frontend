import { redirect } from 'next/navigation';
import { getInitialAuthData } from '@/lib/server-auth';

// Import the interactive components
import DeleteAccountButton from '../components/DeleteAccountButton';
import { SavedCardsList } from '../components/SavedCardsList';
import { ApiKeyManager } from '../components/ApiKeyManager';

export default async function SettingsPage() {
  const { user } = await getInitialAuthData();

  if (!user) {
    redirect('/login');
  }

  return (
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
        {/* No props needed! The component gets data from useAuth() */}
        <SavedCardsList />
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Keys</h2>
        <p className="text-gray-700 mb-4">
          Add and delete your API keys for each provider.
        </p>
        {/* No props needed! The component gets data from useAuth() */}
        <ApiKeyManager />
      </section>
    </div>
  );
}
