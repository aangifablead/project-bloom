import { apiClient } from './index';
import { User } from '@/types';
import { mockService } from '@/services/mock.service';

// TODO: Replace mock calls with actual API endpoints when backend is ready

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorRequest {
  code: string;
  userId: string;
}

export const authApi = {
  /**
   * Login with email and password
   * POST /auth/login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/login', data).then(res => res.data);
    return mockService.auth.login(data.email, data.password);
  },

  /**
   * Register new user
   * POST /auth/register
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/register', data).then(res => res.data);
    return mockService.auth.register(data.name, data.email, data.password);
  },

  /**
   * Logout current user
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/logout');
    return mockService.auth.logout();
  },

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/auth/me').then(res => res.data);
    return mockService.auth.getCurrentUser();
  },

  /**
   * Request password reset email
   * POST /auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/forgot-password', { email }).then(res => res.data);
    return mockService.auth.forgotPassword(email);
  },

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/reset-password', data).then(res => res.data);
    return mockService.auth.resetPassword(data.token, data.password);
  },

  /**
   * Change password for authenticated user
   * POST /auth/change-password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/change-password', data).then(res => res.data);
    return mockService.auth.changePassword(data.currentPassword, data.newPassword);
  },

  /**
   * Verify 2FA code
   * POST /auth/2fa/verify
   */
  verify2FA: async (data: TwoFactorRequest): Promise<AuthResponse> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/2fa/verify', data).then(res => res.data);
    return mockService.auth.verify2FA(data.code, data.userId);
  },

  /**
   * Enable 2FA for user
   * POST /auth/2fa/enable
   */
  enable2FA: async (): Promise<{ qrCode: string; secret: string }> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/2fa/enable').then(res => res.data);
    return mockService.auth.enable2FA();
  },

  /**
   * Disable 2FA for user
   * POST /auth/2fa/disable
   */
  disable2FA: async (code: string): Promise<{ message: string }> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/2fa/disable', { code }).then(res => res.data);
    return mockService.auth.disable2FA(code);
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/refresh', { refreshToken }).then(res => res.data);
    return mockService.auth.refreshToken(refreshToken);
  },

  /**
   * OAuth login initiation
   * GET /auth/oauth/:provider
   */
  oAuthLogin: (provider: 'google' | 'github' | 'microsoft'): string => {
    // Returns the OAuth authorization URL
    return `${apiClient.defaults.baseURL}/auth/oauth/${provider}`;
  },
};
