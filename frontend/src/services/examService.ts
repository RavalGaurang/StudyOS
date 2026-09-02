import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { Exam } from '../types/academic.types';

export const examService = {
  async getExams(params: any = {}): Promise<Exam[]> {
    const res = await apiClient.get<ApiResponse<{ exams: Exam[] }>>('/exams', { params });
    return res.data.data?.exams || [];
  },

  async getExamById(id: string): Promise<Exam> {
    const res = await apiClient.get<ApiResponse<{ exam: Exam }>>(`/exams/${id}`);
    return res.data.data!.exam;
  },

  async createExam(data: any): Promise<Exam> {
    const res = await apiClient.post<ApiResponse<{ exam: Exam }>>('/exams', data);
    return res.data.data!.exam;
  },

  async updateExam(id: string, data: any): Promise<Exam> {
    const res = await apiClient.patch<ApiResponse<{ exam: Exam }>>(`/exams/${id}`, data);
    return res.data.data!.exam;
  },

  async deleteExam(id: string): Promise<void> {
    await apiClient.delete(`/exams/${id}`);
  },
};
