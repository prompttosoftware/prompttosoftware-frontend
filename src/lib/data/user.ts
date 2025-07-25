import 'server-only';

import { UserProfile } from '../../types/auth';
import { FAKE_USER } from '../dev/fakeData';
import { serverFetch } from '../server-api';

export async function getInitialAuthData(): Promise<{ user: UserProfile | null }> {

  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true')
    return { user: FAKE_USER };

  try {
    const res = await serverFetch('/users/me');
    if (!res.ok) return { user: null };
    const user = (await res.json()) as UserProfile;
    return { user };
  } catch (e) {
    console.error(e);
    return { user: null };
  }
}
