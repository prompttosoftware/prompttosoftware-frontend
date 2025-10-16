// src/lib/httpClient.ts

import { getAuthToken, removeAuthToken } from '@/utils/auth';
import { logger } from '@/utils/logger';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' ? '' : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://host.docker.internal:8080/api'),
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A list of routes that do NOT require an auth token
const publicRoutes = ['/auth/github', '/projects/explore'];

// Function to set up interceptors
export const setupHttpClientInterceptors = (router: AppRouterInstance) => {
  // Request Interceptor: Attach JWT token
  httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Check if the request URL is for a public route
      const isPublicRoute = publicRoutes.some(path => config.url?.startsWith(path));

      if (!isPublicRoute) {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      // **ALWAYS return the config**
      return config;
    },
    (error) => {
      logger.error('API Request Interceptor Error:', error);
      // **ALWAYS reject the promise**
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle global errors
  httpClient.interceptors.response.use(
    // For any successful response (2xx), just pass it through.
    (response) => response,
    // For any error response
    (error: AxiosError) => {
      // If we don't have a response, it's a network error. Just reject it.
      if (!error.response) {
        logger.error('Network Error or Request Setup Error:', error.message);
        return Promise.reject(error);
      }

      // The most important case: 401 Unauthorized
      if (error.response.status === 401) {
        // We only care about redirecting if a token *was* present, meaning the session expired.
        const token = getAuthToken();
        if (token) {
          logger.warn('401 Unauthorized with an existing token. Session expired. Redirecting to login.');
          removeAuthToken();
          // Use router.replace to prevent the user from navigating back to the broken page.
          router.replace('/login?sessionExpired=true');
        } else {
          // If there was no token, it's just an unauthenticated user trying to access a protected route.
          // This is a normal, expected failure. We do nothing and let the calling code handle it.
          logger.info('401 on a request with no token. This is expected.');
        }
      }
      
      // For a 401 or any other error (403, 404, 500, etc.), we MUST reject the promise.
      // This allows React Query's `isError`, `error`, and `onError` callbacks to work correctly.
      return Promise.reject(error);
    }
  );
};
