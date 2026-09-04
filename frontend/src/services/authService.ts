/**
 * Authentication API Service
 * Handles user login, registration, logout, and token refresh.
 */

import { apiClient, setAccessToken } from '../lib/api/axios';
import { ACTION_CONFIG } from '../config/action.config';
import { ApiResponse } from '../types/api.types';
import { User } from '../types/auth.types';

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export const authService = {
  /**
   * Registers a new user
   */
  async register(data: any): Promise<AuthResponseData> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>(
      ACTION_CONFIG.AUTH.REGISTER,
      data
    );

    if (res.data.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }

    return res.data.data!;
  },

  /**
   * Authenticates an existing user
   */
  async login(credentials: any): Promise<AuthResponseData> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>(
      ACTION_CONFIG.AUTH.LOGIN,
      credentials
    );

    if (res.data.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }

    return res.data.data!;
  },

  /**
   * Fetches currently logged in user profile
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<{ user: User }>>(ACTION_CONFIG.AUTH.ME);
    return res.data.data!.user;
  },

  /**
   * Logs out the user and clears all credentials
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(ACTION_CONFIG.AUTH.LOGOUT);
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Requests a new access token using the httpOnly refresh cookie
   */
  async refreshToken(): Promise<string> {
    const res = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      ACTION_CONFIG.AUTH.REFRESH
    );
    const token = res.data.data!.accessToken;
    setAccessToken(token);
    return token;
  },
};

export default authService;
