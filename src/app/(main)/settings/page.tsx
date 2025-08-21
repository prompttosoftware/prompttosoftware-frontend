// src/app/(main)/settings/page.tsx
import SettingsClient from '@/app/(main)/settings/components/SettingsClient';
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {

  return <SettingsClient />;
}
