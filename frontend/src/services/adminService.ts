import { apiClient } from '../lib/api/axios';
import { ApiResponse, PaginationMeta } from '../types/api.types';
import { User } from '../types/auth.types';

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalParents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalTasks: number;
  totalStudySessions: number;
  totalStudyHours: number;
}

export const adminService = {
  async getStats(): Promise<SystemStats> {
    const res = await apiClient.get<ApiResponse<SystemStats>>('/admin/stats');
    return res.data.data!;
  },

  async getUsers(params: any = {}): Promise<{ users: User[]; meta: PaginationMeta }> {
    const res = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params });
    return {
      users: res.data.data || [],
      meta: res.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  async toggleStatus(userId: string): Promise<User> {
    const res = await apiClient.patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`);
    return res.data.data!.user;
  },

  async toggleUserStatus(userId: string, _isActive?: boolean): Promise<User> {
    const res = await apiClient.patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`);
    return res.data.data!.user;
  },
};
