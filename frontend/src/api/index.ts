import axios from 'axios';

// API base URL - configure in environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Create axios instance with interceptors
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Handle forbidden - could redirect to 403 page
      console.error('Access forbidden');
    }
    return Promise.reject(error);
  }
);

// Export all API modules
export * from './auth.api';
export * from './project.api';
export * from './task.api';
export * from './team.api';
export * from './notification.api';
export * from './analytics.api';
