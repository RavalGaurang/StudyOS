import { apiClient, setAccessToken } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { User } from '../types/auth.types';

export const authService = {
  async register(data: any): Promise<{ user: User; accessToken: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/register',
      data
    );
    if (res.data.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data.data!;
  },

  async login(credentials: any): Promise<{ user: User; accessToken: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/login',
      credentials
    );
    if (res.data.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data.data!;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data!.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async refreshToken(): Promise<string> {
    const res = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    const token = res.data.data!.accessToken;
    setAccessToken(token);
    return token;
  },
};
