import { apiClient } from '../lib/api/axios';
import { ACTION_CONFIG } from '../config/action.config';
import { ApiResponse } from '../types/api.types';
import { Subject, Unit, Topic } from '../types/academic.types';

export const subjectService = {
  async getSubjects(includeArchived: boolean = false): Promise<Subject[]> {
    const res = await apiClient.get<ApiResponse<{ subjects: Subject[] }>>(ACTION_CONFIG.SUBJECTS.BASE, {
      params: { includeArchived },
    });
    return res.data.data?.subjects || [];
  },

  async getSubjectById(id: string): Promise<Subject> {
    const res = await apiClient.get<ApiResponse<{ subject: Subject }>>(ACTION_CONFIG.SUBJECTS.BY_ID(id));
    return res.data.data!.subject;
  },

  async createSubject(data: any): Promise<Subject> {
    const res = await apiClient.post<ApiResponse<{ subject: Subject }>>(ACTION_CONFIG.SUBJECTS.BASE, data);
    return res.data.data!.subject;
  },

  async updateSubject(id: string, data: any): Promise<Subject> {
    const res = await apiClient.patch<ApiResponse<{ subject: Subject }>>(ACTION_CONFIG.SUBJECTS.BY_ID(id), data);
    return res.data.data!.subject;
  },

  async deleteSubject(id: string): Promise<void> {
    await apiClient.delete(ACTION_CONFIG.SUBJECTS.BY_ID(id));
  },

  // Units
  async createUnit(subjectId: string, data: any): Promise<Unit> {
    const res = await apiClient.post<ApiResponse<{ unit: Unit }>>(ACTION_CONFIG.SUBJECTS.UNITS(subjectId), data);
    return res.data.data!.unit;
  },

  async updateUnit(id: string, data: any): Promise<Unit> {
    const res = await apiClient.patch<ApiResponse<{ unit: Unit }>>(ACTION_CONFIG.SUBJECTS.UNIT_BY_ID(id), data);
    return res.data.data!.unit;
  },

  async deleteUnit(id: string): Promise<void> {
    await apiClient.delete(ACTION_CONFIG.SUBJECTS.UNIT_BY_ID(id));
  },

  // Topics
  async createTopic(unitId: string, data: any): Promise<Topic> {
    const res = await apiClient.post<ApiResponse<{ topic: Topic }>>(ACTION_CONFIG.SUBJECTS.TOPICS(unitId), data);
    return res.data.data!.topic;
  },

  async updateTopic(id: string, data: any): Promise<Topic> {
    const res = await apiClient.patch<ApiResponse<{ topic: Topic }>>(ACTION_CONFIG.SUBJECTS.TOPIC_BY_ID(id), data);
    return res.data.data!.topic;
  },

  async deleteTopic(id: string): Promise<void> {
    await apiClient.delete(ACTION_CONFIG.SUBJECTS.TOPIC_BY_ID(id));
  },
};

export default subjectService;
