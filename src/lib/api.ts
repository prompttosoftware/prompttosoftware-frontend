import { httpClient } from './httpClient'; // Use named import for httpClient
import { setupHttpClientInterceptors } from './httpClient';
import { paymentsService } from '../services/paymentsService'; // Import the PaymentsService

// Re-export httpClient as api
export const api = httpClient;

// Re-export setupHttpClientInterceptors (though it should generally be called once at app startup)
export const setupInterceptors = setupHttpClientInterceptors;

// Export individual services for specific functionalities
import { UserProfile } from '@/types/auth'; // Import UserProfile type

export {
  paymentsService,
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await httpClient.get('/auth/me');
  return response.data;
};
