import axios, { AxiosInstance, AxiosError } from 'axios'; // Import AxiosInstance and AxiosError
import { getAuthToken } from '../utils/auth'; // Utility to get the token
import { setGlobalError } from '../store/globalErrorStore'; // For global error handling
import { logger } from '../utils/logger'; // For logging
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'; // For router type
import { APIErrorResponse, InternalServerErrorMessage } from '../types/common'; // For error types

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api', // Use environment variable for API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

logger.info('Axios instance initialized with base URL:', axiosInstance.defaults.baseURL);

// Function to set up interceptors
export const setupHttpClientInterceptors = (router: AppRouterInstance) => {
  // Request Interceptor: Attach JWT token
  axiosInstance.interceptors.request.use(
    (config) => {
      try {
        const token = getAuthToken(); // Function to retrieve the JWT token
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
            logger.warn(
              '401 Unauthorized response received. Clearing JWT and redirecting to login.',
            );
            try {
              localStorage.removeItem('jwtToken'); // Clear the invalid or expired JWT
              logger.info('JWT token cleared from localStorage.');
            } catch (clearErr) {
              logger.error('Failed to clear JWT token from localStorage:', clearErr as Error);
            }
            router.push('/login?sessionExpired=true');
            errorMessage =
              (data as any).message || 'Unauthorized: Authentication is required or has failed.';
            return Promise.reject(error); // Reject to stop further processing for 401
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
        details: localErrorDetails,
      });
      logger.error('API Error:', error, localErrorDetails);

      return Promise.reject(error);
    }
  );
};

// Export axiosInstance to be used directly by services, renaming for clarity in imports
export { axiosInstance as httpClient };
