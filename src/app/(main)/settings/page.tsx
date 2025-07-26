import { redirect } from 'next/navigation';
import { getInitialAuthData } from '@/lib/data/user';
import SettingsClient from './components/SettingsClient';

export default async function SettingsPage() {
  const { user } = await getInitialAuthData();

  if (!user) {
    redirect('/login');
  }

  return <SettingsClient user={user} />;
}
