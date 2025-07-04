import axios from 'axios';
import { getAuthToken } from '../utils/auth'; // Assuming a utility to get the token

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api', // Use environment variable for API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken(); // Function to retrieve the JWT token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default httpClient;
