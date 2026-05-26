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
  withCredentials: true, // send cookies (needed for refresh token)
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
  async (error) => {
    const originalRequest = error.config;

    // On 401, try to refresh the token once using the httpOnly cookie
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data?.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden');
    }
    return Promise.reject(error);
  }
);
export const gitApi = {
  // legacy
  getActivity: (owner: string, repo: string) =>
    apiClient.get(`/git/${owner}/${repo}`).then(r => r.data),

  // commits
  getCommits: (owner: string, repo: string, params?: { page?: number; per_page?: number; sha?: string }) =>
    apiClient.get(`/git/${owner}/${repo}/commits`, { params }).then(r => r.data),

  getCommit: (owner: string, repo: string, sha: string) =>
    apiClient.get(`/git/${owner}/${repo}/commits/${sha}`).then(r => r.data),

  // branches
  getBranches: (owner: string, repo: string) =>
    apiClient.get(`/git/${owner}/${repo}/branches`).then(r => r.data),

  deleteBranch: (owner: string, repo: string, branch: string) =>
    apiClient.delete(`/git/${owner}/${repo}/branches/${branch}`).then(r => r.data),

  // pull requests
  getPulls: (owner: string, repo: string, state: string = 'open') =>
    apiClient.get(`/git/${owner}/${repo}/pulls`, { params: { state } }).then(r => r.data),

  getPull: (owner: string, repo: string, pull_number: number) =>
    apiClient.get(`/git/${owner}/${repo}/pulls/${pull_number}`).then(r => r.data),

  // check runs
  getCheckRuns: (owner: string, repo: string, ref: string) =>
    apiClient.get(`/git/${owner}/${repo}/commits/${ref}/checks`).then(r => r.data),

  // merge
  merge: (owner: string, repo: string, body: { head: string; base: string; commitMessage?: string; mergeMethod?: string }) =>
    apiClient.post(`/git/${owner}/${repo}/merge`, body).then(r => r.data),
};
// Export all API modules
export * from './auth.api';
export * from './project.api';
export * from './task.api';
export * from './team.api';
export * from './notification.api';
export * from './analytics.api';
