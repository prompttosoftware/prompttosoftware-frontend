import { UserProfile } from '@/types/auth';
import { serverFetch } from '@/lib/server-api';
import { FAKE_USER } from '@/lib/dev/fakeData';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';

export async function getInitialAuthData(): Promise<{ user: UserProfile | null }> {
  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') {
    console.debug('[getInitialAuthData] Using FAKE_USER due to NEXT_PUBLIC_FAKE_AUTH=true');
    return { user: FAKE_USER };
  }

  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwtToken')?.value;

    // Build a cache key that is unique per user
    const cacheKey = `user-${jwt?.slice(-8) ?? 'none'}`;

    // next.js in-memory cache helper (stable in 14+)
    const cached = await unstable_cache(
      async (token: string | undefined) => {
        console.log('[getInitialAuthData] MISS – calling backend');
        if (!token) return null;
        const res = await serverFetch('/users/me', jwt);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data.user;
      },
      [cacheKey],        // cache key parts
      {
        revalidate: 60,  // seconds
        tags: [`user-${jwt?.slice(-8) ?? 'none'}`],
      }
    )(jwt);

    return { user: cached };
  } catch (e) {
    console.error('[getInitialAuthData] Error fetching user:', e);
    return { user: null };
  }
}
