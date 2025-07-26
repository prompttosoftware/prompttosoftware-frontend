// app/(main)/rsc-test/page.tsx  (Test-0-safe)
import { cookies } from 'next/headers';
import { getInitialAuthData } from '@/lib/data/user';

export const dynamic = 'force-dynamic';   // disable cache for the test

export default async function Test0Safe() {
  try {
    console.log('[TEST-0-safe] === start ===');
    const { user } = await getInitialAuthData();
    console.log('[TEST-0-safe] user =', !!user);
    return <h1>Test 0-safe – user = {!!user}</h1>;
  } catch (e) {
    console.error('[TEST-0-safe] RENDER CRASHED', e);
    return <h1>Server error – check logs</h1>;
  }
}
