import 'server-only'; // This directive ensures this code never ends up in a client bundle.

import { UserProfile } from '../../types/auth';
import { FAKE_USER } from '../dev/fakeData';
import { serverFetch } from '../server-api';

// This is the function we will call from our RootLayout
export async function getInitialAuthData(): Promise<{ user: UserProfile | null }> {

  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true')
    return { user: FAKE_USER };

  try {
    const res = await serverFetch('/api/me');
    if (!res.ok) return { user: null };
    const user = (await res.json()) as UserProfile;
    return { user };
  } catch (e) {
    console.error(e);
    return { user: null };
  }
}
