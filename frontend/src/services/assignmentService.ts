import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { Assignment } from '../types/academic.types';

export const assignmentService = {
  async getAssignments(params: any = {}): Promise<Assignment[]> {
    const res = await apiClient.get<ApiResponse<{ assignments: Assignment[] }>>('/assignments', { params });
    return res.data.data?.assignments || [];
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    const res = await apiClient.get<ApiResponse<{ assignment: Assignment }>>(`/assignments/${id}`);
    return res.data.data!.assignment;
  },

  async createAssignment(data: any): Promise<Assignment> {
    const res = await apiClient.post<ApiResponse<{ assignment: Assignment }>>('/assignments', data);
    return res.data.data!.assignment;
  },

  async updateAssignment(id: string, data: any): Promise<Assignment> {
    const res = await apiClient.patch<ApiResponse<{ assignment: Assignment }>>(`/assignments/${id}`, data);
    return res.data.data!.assignment;
  },

  async deleteAssignment(id: string): Promise<void> {
    await apiClient.delete(`/assignments/${id}`);
  },
};
