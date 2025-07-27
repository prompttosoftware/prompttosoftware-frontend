// src/lib/server-api.ts
import 'server-only';
import { cookies } from 'next/headers';

const IN_CLUSTER_URL = process.env.MANAGEMENT_API_URL;
const EXTERNAL_URL = process.env.API_BASE_URL;
const SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';

let fs: any = null;
try {
  if (typeof window === 'undefined') {
    fs = require('fs');
  }
} catch (err) {
  // fs not available
}

function getServiceAccountToken(): string | null {
  console.debug('[getServiceAccountToken] typeof window:', typeof window);
  if (typeof window !== 'undefined') {
    console.error('[getServiceAccountToken] ERROR: Running in browser context!');
    return null;
  }
  try {
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
  jwt?: string,
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
    if (isInCluster) {
      // When in cluster, use ServiceAccount token for authorization
      // and JWT token for user identification
      const saToken = getServiceAccountToken();
      const jwtToken = jwt || await getJwtFromCookie();
      
      if (!saToken) {
        console.warn('[serverFetch] No ServiceAccount token available.');
        throw new Error('No ServiceAccount token available');
      }
      
      // Use SA token for main authorization
      (headers as Record<string, string>).Authorization = `Bearer ${saToken}`;
      
      // Include JWT token in custom header for user identification
      if (jwtToken) {
        (headers as Record<string, string>)['X-User-Token'] = jwtToken;
        console.debug('[serverFetch] Both SA and JWT tokens set.');
      } else {
        console.debug('[serverFetch] Only SA token set (no user context).');
      }
    } else {
      // When external, use JWT token as before
      const jwtToken = jwt || await getJwtFromCookie();
      
      if (!jwtToken) {
        console.warn('[serverFetch] No JWT token available.');
        throw new Error('No JWT token available');
      }
      
      (headers as Record<string, string>).Authorization = `Bearer ${jwtToken}`;
      console.debug('[serverFetch] JWT Authorization header set.');
    }
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
