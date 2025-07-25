// src/lib/server-api.ts
import 'server-only';
import { cookies } from 'next/headers';

const IN_CLUSTER_URL = process.env.MANAGEMENT_API_URL;   // e.g. http://management-service.management-ns.svc.cluster.local:3000
const EXTERNAL_URL   = process.env.API_BASE_URL;         // e.g. https://api.mysite.com

/* --------------------------------------------------
   1. Token sources
-------------------------------------------------- */
const SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';

function getServiceAccountToken(): string | null {
  // Works only in Node, never in the browser
  if (typeof window !== 'undefined') return null;

  try {
    // Node built-ins are only bundled on the server
    const fs = require('fs');
    return fs.readFileSync(SA_TOKEN_PATH, 'utf-8').trim();
  } catch {
    return null;
  }
}

async function getJwtFromCookie(): Promise<string | null> {
  const token = (await cookies()).get('jwtToken')?.value;
  return token ?? null;
}

/* --------------------------------------------------
   2. Unified “fetch” wrapper
-------------------------------------------------- */
type FetchOptions = RequestInit & {
  needsAuth?: boolean;
};

export async function serverFetch(
  endpoint: string,
  { needsAuth = true, ...init }: FetchOptions = {}
) {
  // Decide which URL to hit
  const isInCluster = !!getServiceAccountToken();
  const baseURL     = isInCluster ? IN_CLUSTER_URL : EXTERNAL_URL;

  if (!baseURL) {
    throw new Error('Missing API_BASE_URL or MANAGEMENT_API_URL');
  }

  const url = `${baseURL}${endpoint}`;

  // Merge headers
  const headers: HeadersInit = {
    ...(init.headers as HeadersInit),
  };

  if (needsAuth) {
    const token = isInCluster
      ? getServiceAccountToken()
      : await getJwtFromCookie();

    if (!token) {
      // Caller can decide what to do (throw or return null)
      throw new Error('No authentication token available');
    }
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  // Forward the call
  return fetch(url, {
    ...init,
    headers,
    credentials: 'include',
    // Default cache for server components
    cache: init.cache ?? 'no-store',
  });
}
