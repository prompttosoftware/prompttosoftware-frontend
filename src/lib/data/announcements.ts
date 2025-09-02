import { serverFetch } from '@/lib/server-api';
import { Banner } from '@/types/banner';
import { FAKE_ANNOUNCEMENTS } from '../dev/fakeData';

/**
 * Fetches banner announcements from the server.
 * Returns a Promise that resolves to an array of AnnouncementData objects.
 * Handles server-side fetching and error management.
 * @returns {Promise<AnnouncementData[]>} - An array of announcements or an empty array on failure.
 */
export async function fetchAnnouncements(): Promise<Banner[]> {
    // Return fake data during development if the flag is enabled
    if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') {
        return FAKE_ANNOUNCEMENTS;
    }

    try {
        const res = await serverFetch(`/announcements`);
        
        // Return an empty array if the resource is not found
        if (res.status === 404) {
            return [];
        }
        
        // Handle other non-ok responses
        if (!res.ok) {
            console.error('fetchAnnouncements: Failed to fetch with status:', res.status, res.statusText);
            return [];
        }
        
        // Parse the JSON response and extract the data
        const { data } = await res.json();
        
        // Ensure data is an array before returning
        if (!Array.isArray(data)) {
            console.error('fetchAnnouncements: Received unexpected data format.');
            return [];
        }

        return data as Banner[];

    } catch (error) {
        console.error("Failed to fetch announcements:", error);
        return []; // Return empty array on any fetch error
    }
}
