import axios, { AxiosInstance, AxiosError } from 'axios'; // Import AxiosInstance and AxiosError
import { getAuthToken, removeAuthToken } from '@/utils/auth'; // Utility to get the token
import { setGlobalError } from '@/store/globalErrorStore'; // For global error handling
import { logger } from '@/utils/logger'; // For logging
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'; // For router type
import { APIErrorResponse, InternalServerErrorMessage } from '@/types/common'; // For error types

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' ? '' : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://host.docker.internal:8080/api'), // Adjust baseURL for mocking
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A list of routes that do NOT require an auth token
const publicRoutes = [
  '/auth/github',
  '/projects/explore'
];

// Temporarily log the baseURL to debug
console.log('Axios instance initialized with base URL:', axiosInstance.defaults.baseURL, 'NEXT_PUBLIC_API_MOCKING:', process.env.NEXT_PUBLIC_API_MOCKING);
logger.info('Axios instance initialized with base URL:', axiosInstance.defaults.baseURL);

// Function to set up interceptors
export const setupHttpClientInterceptors = (router: AppRouterInstance) => {
  // Request Interceptor: Attach JWT token
  axiosInstance.interceptors.request.use(
    (config) => {
      try {
        // Check if the request URL is for a public route
        const isPublicRoute = publicRoutes.some(path => config.url?.startsWith(path));

        // If it's not a public route, add the token
        if (!isPublicRoute) {
          const token = getAuthToken(); // Function to retrieve the JWT token
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            logger.info('JWT token attached to request headers.');
          }
        }
      } catch (error) {
        logger.error('Failed to attach JWT token to request:', error as Error);
      }
      return config;
    },
    (error) => {
      logger.error('API Request Interceptor Error:', error as Error);
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle errors and refresh tokens
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      let errorMessage = 'An unexpected error occurred.';
      let localErrorDetails: APIErrorResponse | InternalServerErrorMessage | null = null;

      if (error.response) {
        const { status, data } = error.response;
        localErrorDetails = data as APIErrorResponse | InternalServerErrorMessage;

        switch (status) {
          case 400:
            errorMessage = (data as any).message || 'Bad Request: The request was invalid.';
            break;
          case 401:
            errorMessage = (data as any).message || 'Unauthorized: Authentication is required or has failed.';
            
            // Check if a token was present. This differentiates an expired session
            // from a user who is simply not logged in.
            const token = getAuthToken();

            if (token) {
              // If a token was present, it's invalid or expired.
              // This is a true "session expired" scenario.
              logger.warn(
                '401 Unauthorized with an existing token. Session likely expired. Clearing token and redirecting to login.',
              );
              try {
                removeAuthToken();
                logger.info('JWT token cleared from localStorage.');
              } catch (clearErr) {
                logger.error('Failed to clear JWT token from localStorage:', clearErr as Error);
              }
              // Only redirect if a token was present, failed, and not public
              const isPublicRoute = publicRoutes.some(path => error.config?.url?.startsWith(path));
        
              if (!isPublicRoute) {
                router.push('/login?sessionExpired=true');
              }
            } else {
              // If no token was present, this is an expected 401 for an unauthenticated user.
              // Do not redirect. Just let the calling code handle the error.
              logger.info('401 Unauthorized on a request with no token. This is expected. Not redirecting.');
            }

            // Reject the promise so the calling code (e.g., a useQuery hook) knows the request failed.
            return Promise.reject(error);
          case 403:
            errorMessage =
              (data as any).message || 'Forbidden: You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = (data as any).message || 'Not Found: The requested resource could not be found.';
            break;
          case 500:
            errorMessage =
              (data as any).message || 'Internal Server Error: Something went wrong on the server.';
            break;
          default:
            errorMessage = (data as any).message || `HTTP Error: ${status}`;
            break;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Please check your internet connection.';
        logger.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
        logger.error('Request setup error:', error.message);
      }

      setGlobalError({
        message: errorMessage,
        type: 'error',
      });
      logger.error('API Error:', error, localErrorDetails);

      return Promise.reject(error);
    }
  );
};

// Export axiosInstance to be used directly by services, renaming for clarity in imports
export { axiosInstance as httpClient };
