import { UserProfile } from '@/types/auth';
import { serverFetch } from '@/lib/server-api';
import { FAKE_USER } from '@/lib/dev/fakeData';

export async function getInitialAuthData(): Promise<{ user: UserProfile | null }> {
  console.debug('[getInitialAuthData] Called.');
  console.debug('[getInitialAuthData] typeof window:', typeof window);

  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') {
    console.debug('[getInitialAuthData] Using FAKE_USER due to NEXT_PUBLIC_FAKE_AUTH=true');
    return { user: FAKE_USER };
  }

  try {
    const res = await serverFetch('/users/me');
    console.debug('[getInitialAuthData] /users/me response status:', res.status);

    if (!res.ok) {
      console.warn('[getInitialAuthData] /users/me responded with non-OK status:', res.status);
      return { user: null };
    }

    const user = (await res.json()) as UserProfile;
    console.debug('[getInitialAuthData] Parsed user:', user);
    return { user };
  } catch (e) {
    console.error('[getInitialAuthData] Error fetching user:', e);
    return { user: null };
  }
}
