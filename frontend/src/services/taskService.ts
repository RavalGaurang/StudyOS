import { apiClient } from '../lib/api/axios';
import { ApiResponse, PaginationMeta } from '../types/api.types';
import { Task } from '../types/academic.types';

export const taskService = {
  async getTasks(params: any = {}): Promise<{ tasks: Task[]; meta: PaginationMeta }> {
    const res = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    return {
      tasks: res.data.data || [],
      meta: res.data.meta || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  async getTaskById(id: string): Promise<Task> {
    const res = await apiClient.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return res.data.data!.task;
  },

  async createTask(data: any): Promise<Task> {
    const res = await apiClient.post<ApiResponse<{ task: Task }>>('/tasks', data);
    return res.data.data!.task;
  },

  async updateTask(id: string, data: any): Promise<Task> {
    const res = await apiClient.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
    return res.data.data!.task;
  },

  async toggleStatus(id: string): Promise<Task> {
    const res = await apiClient.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/toggle`);
    return res.data.data!.task;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
