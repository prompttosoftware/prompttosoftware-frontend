import { Analysis } from "@/types/analysis";
import { serverFetch } from "../server-api";
import { FAKE_ANALYSIS_ARRAY } from "../dev/fakeData";

/**
 * SERVER-SIDE FETCH: Fetches the list of analysis for the logged-in user.
 */
export async function fetchUserAnalysis(): Promise<Analysis[]> {
  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') return FAKE_ANALYSIS_ARRAY;

  try {
    const res = await serverFetch('/analysis/user');
    if (!res.ok) {
      console.error('fetchUserAnalysis:', res.statusText);
      return [];
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * SERVER-SIDE FETCH: Fetches a single analysis by its ID.
 * Returns null if not found or if there's an error, allowing the page to show a 404.
 */
export async function fetchAnalysisById(id: string): Promise<Analysis | null> {
  if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') {
    const fakeData = FAKE_ANALYSIS_ARRAY.find(a => a._id === id);
    return fakeData || null;
  }

  try {
    const res = await serverFetch(`/analysis/${id}`);
    if (!res.ok) {
      if (res.status === 404) {
        return null; // Explicitly return null for not-found cases
      }
      console.error(`fetchAnalysisById failed with status ${res.status}:`, res.statusText);
      return null;
    }
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    console.error('Failed to fetch analysis by ID:', e);
    return null;
  }
}
