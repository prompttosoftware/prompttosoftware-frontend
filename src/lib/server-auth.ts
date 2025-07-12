// src/lib/server-auth.ts
import { cookies } from 'next/headers';
import 'server-only'; // This directive ensures this code never ends up in a client bundle.

import { UserProfile } from '../types/auth';
import { FAKE_USER } from './dev/fakeData';

// This is the function we will call from our RootLayout
export async function getInitialAuthData(): Promise<{ user: UserProfile | null }> {

  const isDevFakeAuth = process.env.NEXT_PUBLIC_FAKE_AUTH === 'true';
  
  // If we are in development and faking auth, we return a completely separate, hardcoded object.
  if (isDevFakeAuth) {
    return {user: FAKE_USER };
  }

  // 1. Read the auth token from the incoming request cookies
  const token = (await cookies()).get('jwtToken')?.value;

  if (!token) {
    return { user: null };
  }

  try {
    // 2. Fetch the user profile from your API.
    // This fetch happens on your web server, which is much faster
    // (often in the same datacenter as your API).
    const response = await fetch(`${process.env.API_BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      // Important: Tell Next.js not to cache this user-specific data
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch initial user data');
      return { user: null };
    }

    const user = (await response.json()) as UserProfile;
    return { user };
  } catch (error) {
    console.error('Error in getInitialAuthData:', error);
    return { user: null };
  }
}
