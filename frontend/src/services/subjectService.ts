import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { Subject, Unit, Topic } from '../types/academic.types';

export const subjectService = {
  async getSubjects(includeArchived: boolean = false): Promise<Subject[]> {
    const res = await apiClient.get<ApiResponse<{ subjects: Subject[] }>>('/subjects', {
      params: { includeArchived },
    });
    return res.data.data?.subjects || [];
  },

  async getSubjectById(id: string): Promise<Subject> {
    const res = await apiClient.get<ApiResponse<{ subject: Subject }>>(`/subjects/${id}`);
    return res.data.data!.subject;
  },

  async createSubject(data: any): Promise<Subject> {
    const res = await apiClient.post<ApiResponse<{ subject: Subject }>>('/subjects', data);
    return res.data.data!.subject;
  },

  async updateSubject(id: string, data: any): Promise<Subject> {
    const res = await apiClient.patch<ApiResponse<{ subject: Subject }>>(`/subjects/${id}`, data);
    return res.data.data!.subject;
  },

  async deleteSubject(id: string): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
  },

  // Units
  async createUnit(subjectId: string, data: any): Promise<Unit> {
    const res = await apiClient.post<ApiResponse<{ unit: Unit }>>(`/subjects/${subjectId}/units`, data);
    return res.data.data!.unit;
  },

  async updateUnit(id: string, data: any): Promise<Unit> {
    const res = await apiClient.patch<ApiResponse<{ unit: Unit }>>(`/subjects/units/${id}`, data);
    return res.data.data!.unit;
  },

  async deleteUnit(id: string): Promise<void> {
    await apiClient.delete(`/subjects/units/${id}`);
  },

  // Topics
  async createTopic(unitId: string, data: any): Promise<Topic> {
    const res = await apiClient.post<ApiResponse<{ topic: Topic }>>(`/subjects/units/${unitId}/topics`, data);
    return res.data.data!.topic;
  },

  async updateTopic(id: string, data: any): Promise<Topic> {
    const res = await apiClient.patch<ApiResponse<{ topic: Topic }>>(`/subjects/topics/${id}`, data);
    return res.data.data!.topic;
  },

  async deleteTopic(id: string): Promise<void> {
    await apiClient.delete(`/subjects/topics/${id}`);
  },
};
