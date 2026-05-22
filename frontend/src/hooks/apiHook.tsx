import { useState, useCallback } from 'react';
import axios from 'axios';

// ⚡ FIX 1: Create the Axios client instance *outside* the hook body 
// This prevents registering new duplicate interceptors on every function invocation.
const apiInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Global Request Interceptor
apiInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (token) {
      token = token.replace(/^"+|"+$/g, ''); 
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (requestError) => Promise.reject(requestError)
);

// Global Response Interceptor
apiInstance.interceptors.response.use(
  (response) => response,
  async (interceptorError) => {
    const originalRequest = interceptorError.config;

    // Define bypass endpoints that should NEVER trigger a silent refresh
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                        originalRequest.url?.includes('/auth/register') ||
                        originalRequest.url?.includes('/auth/2fa'); // Do not try token refreshes on 2FA logic

    if (interceptorError.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
               
        const refreshResponse = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data?.token) {
          const newAccessToken = refreshResponse.data.token;
          localStorage.setItem('token', newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiInstance(originalRequest); // Retry with the clean global instance
        }
      } catch (refreshFailure) {
        console.error("Refresh token invalid. Evicting session.");
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshFailure);
      }
    }
    
    return Promise.reject(interceptorError);
  }
);

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (endpoint: string, method = 'GET', body = null) => {
    setLoading(true);
    setError(null);

    try {
      // Use the single global configured instance
      const response = await apiInstance({
        url: endpoint,
        method,
        data: body,
      });

      setLoading(false);
      return {
        data: response.data?.data ? response.data.data : response.data,
        error: null,
      };
    } catch (e: any) {
      console.error("API Error Trace:", e);
      const errMessage = e.response?.data?.message || e.message || "Network Error";
      setError(errMessage);
      setLoading(false);
      return { data: null, error: errMessage };
    }
  }, []);

  return { loading, error, execute };
};

export default useApi;