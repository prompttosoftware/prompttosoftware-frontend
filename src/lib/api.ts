import axios from 'axios';
import { useGlobalErrorStore } from '../store/globalErrorStore';
import { logger } from '../utils/logger'; // Import the logger
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { APIErrorResponse, InternalServerErrorMessage } from '../types/common';

const api = axios.create({
  baseURL: '/api', // Adjust this if your API has a different base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

logger.info('Axios instance initialized with base URL:', api.defaults.baseURL);

// Global variable to store error details temporarily for display
let errorDetails: APIErrorResponse | InternalServerErrorMessage | null = null;

export const setupInterceptors = (router: AppRouterInstance) => {
  // Interceptor management (e.g., ejecting to prevent duplicates on hot-reloads)
  // is omitted here as direct access to 'handlers' is not supported in Axios types.
  // For robust handling in development, one might store and eject interceptor IDs.

  api.interceptors.request.use(
    (config) => {
      try {
        const token = localStorage.getItem('jwtToken'); // Assuming 'jwtToken' is the key
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          logger.info('JWT token attached to request headers.');
        }
      } catch (error) {
        logger.error('Failed to attach JWT token to request:', error as Error);
      }
      return config;
    },
    (error) => {
      logger.error('API Request Interceptor Error:', error as Error);
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => { // Made async for potential await in future (e.g., token refresh)
      const { setError } = useGlobalErrorStore.getState();
      let errorMessage = 'An unexpected error occurred.';
      // The errorDetails variable declared here is local to the interceptor,
      // and shadows the global one. This is fine as it's used for the current error.
      let localErrorDetails: APIErrorResponse | InternalServerErrorMessage | null = null;


      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;

        localErrorDetails = data; // Assign the response data to localErrorDetails

        switch (status) {
          case 400:
            errorMessage =
              data.message || 'Bad Request: The request was invalid.';
            break;
          case 401:
            logger.warn('401 Unauthorized response received. Clearing JWT and redirecting to login.');
            try {
              localStorage.removeItem('jwtToken'); // Clear the invalid or expired JWT
              logger.info('JWT token cleared from localStorage.');
            } catch (clearErr) {
              logger.error('Failed to clear JWT token from localStorage:', clearErr as Error);
            }
            // Redirect the user
            router.push('/login?sessionExpired=true');
            errorMessage =
              data.message ||
              'Unauthorized: Authentication is required or has failed.';
            // Important: Reject the promise to stop further processing for 401 after handling
            return Promise.reject(error);
          case 403:
            errorMessage =
              data.message ||
              'Forbidden: You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage =
              data.message ||
              'Not Found: The requested resource could not be found.';
            break;
          case 500:
            errorMessage =
              data.message ||
              'Internal Server Error: Something went wrong on the server.';
            break;
          default:
            errorMessage = data.message || `HTTP Error: ${status}`;
            break;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError({
        message: errorMessage,
        type: 'error',
        details: localErrorDetails, // Use localErrorDetails here
      });
      logger.error('API Error:', new Error(errorMessage), localErrorDetails); // Log the error


      return Promise.reject(error);
    },
  );
}; // End of setupInterceptors

export default api;
