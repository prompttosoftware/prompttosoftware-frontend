// src/lib/server-api.ts
import 'server-only';
import { cookies } from 'next/headers';

const IN_CLUSTER_URL = process.env.MANAGEMENT_API_URL;
const EXTERNAL_URL = process.env.API_BASE_URL;
const SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';

function getServiceAccountToken(): string | null {
  console.debug('[getServiceAccountToken] typeof window:', typeof window);
  if (typeof window !== 'undefined') {
    console.error('[getServiceAccountToken] ERROR: Running in browser context!');
    return null;
  }
  try {
    const fs = require('fs');
    const token = fs.readFileSync(SA_TOKEN_PATH, 'utf-8').trim();
    console.debug('[serverFetch] Using Kubernetes service account token.');
    return token;
  } catch (err) {
    console.debug('[serverFetch] No Kubernetes service account token found.');
    return null;
  }
}

async function getJwtFromCookie(): Promise<string | null> {
  console.debug('[getJwtFromCookie] typeof window:', typeof window);
  if (typeof window !== 'undefined') {
    console.error('[getJwtFromCookie] ERROR: Running in browser context!');
    return null;
  }
  
  try {
    console.debug('[getJwtFromCookie] About to call cookies()');
    const cookieStore = await cookies();
    console.debug('[getJwtFromCookie] cookies() called successfully');
    
    const jwtCookie = cookieStore.get('jwtToken');
    if (jwtCookie?.value) {
      console.debug('[serverFetch] Found JWT cookie.');
      return jwtCookie.value;
    } else {
      console.debug('[serverFetch] No JWT cookie present.');
      return null;
    }
  } catch (err) {
    console.error('[serverFetch] Error reading JWT cookie:', err);
    return null;
  }
}

type FetchOptions = RequestInit & {
  needsAuth?: boolean;
};

export async function serverFetch(
  endpoint: string,
  { needsAuth = true, ...init }: FetchOptions = {}
) {
  console.debug('[serverFetch] Starting serverFetch call');
  console.debug('[serverFetch] typeof window:', typeof window);
  console.debug('[serverFetch] process.env.NODE_ENV:', process.env.NODE_ENV);
  
  if (typeof window !== 'undefined') {
    console.error('[serverFetch] CRITICAL ERROR: serverFetch called in browser context!');
    throw new Error('serverFetch called in browser context');
  }

  const isInCluster = !!getServiceAccountToken();
  const baseURL = isInCluster ? IN_CLUSTER_URL : EXTERNAL_URL;
  
  console.debug('[serverFetch] isInCluster:', isInCluster);
  console.debug('[serverFetch] IN_CLUSTER_URL:', IN_CLUSTER_URL);
  console.debug('[serverFetch] EXTERNAL_URL:', EXTERNAL_URL);
  console.debug('[serverFetch] Base URL:', baseURL);
  console.debug('[serverFetch] Endpoint:', endpoint);

  if (!baseURL) {
    throw new Error('Missing API_BASE_URL or MANAGEMENT_API_URL');
  }

  const url = `${baseURL}${endpoint}`;
  const headers: HeadersInit = {
    ...(init.headers as HeadersInit),
  };

  if (needsAuth) {
    const token = isInCluster
      ? getServiceAccountToken()
      : await getJwtFromCookie();
      
    if (!token) {
      console.warn('[serverFetch] No authentication token available.');
      throw new Error('No authentication token available');
    }
    
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    console.debug('[serverFetch] Authorization header set.');
  }

  try {
    console.debug('[serverFetch] About to make fetch request to:', url);
    const response = await fetch(url, {
      ...init,
      headers,
      credentials: 'include',
      cache: init.cache ?? 'no-store',
    });
    
    console.debug(`[serverFetch] Request to ${url} responded with status ${response.status}`);
    return response;
  } catch (err) {
    console.error('[serverFetch] Error during fetch:', err);
    throw err;
  }
}
