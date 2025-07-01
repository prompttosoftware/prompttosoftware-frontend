import axios from 'axios';
import { useGlobalErrorStore } from '../store/globalErrorStore';

const api = axios.create({
  baseURL: '/api', // Adjust this if your API has a different base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { setError } = useGlobalErrorStore.getState();
    let errorMessage = 'An unexpected error occurred.';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errorDetails: any = null;

    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      errorDetails = data;

      switch (status) {
        case 400:
          errorMessage =
            data.message || 'Bad Request: The request was invalid.';
          break;
        case 401:
          errorMessage =
            data.message ||
            'Unauthorized: Authentication is required or has failed.';
          break;
        case 403:
          errorMessage =
            data.message ||
            'Forbidden: You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage =
            data.message || 'Not Found: The requested resource could not be found.';
          break;
        case 500:
          errorMessage =
            data.message ||
            'Internal Server Error: Something went wrong on the server.';
          break;
        default:
          errorMessage =
            data.message || `HTTP Error: ${status}`;
          break;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    setError({
      message: errorMessage,
      type: 'error',
      details: errorDetails,
    },);

    return Promise.reject(error);
  }
);

export default api;
