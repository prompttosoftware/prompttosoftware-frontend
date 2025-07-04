import axiosInstance from './httpClient'; // Renamed httpClient to axiosInstance for consistency
import { setupHttpClientInterceptors } from './httpClient';
import { paymentsService } from '../services/paymentsService'; // Import the PaymentsService

// Re-export axiosInstance
export const api = axiosInstance;

// Re-export setupHttpClientInterceptors (though it should generally be called once at app startup)
export const setupInterceptors = setupHttpClientInterceptors;

// Export individual services for specific functionalities
import { UserProfile } from '@/types/auth'; // Import UserProfile type

export {
  paymentsService,
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
