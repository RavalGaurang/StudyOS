import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { StudentDashboardAnalytics } from './analyticsService';

export interface ChildSummary {
  relationshipId: string;
  relationship: string;
  studentId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  gradeLevel?: string;
  schoolName?: string;
  subjectsCount: number;
  completedTasksCount: number;
  totalStudySessions: number;
}

export const parentService = {
  async getChildren(): Promise<ChildSummary[]> {
    const res = await apiClient.get<ApiResponse<{ children: ChildSummary[] }>>('/parents/children');
    return res.data.data?.children || [];
  },

  async getChildOverview(studentId: string): Promise<StudentDashboardAnalytics> {
    const res = await apiClient.get<ApiResponse<StudentDashboardAnalytics>>(
      `/parents/children/${studentId}/overview`
    );
    return res.data.data!;
  },

  async linkStudent(data: { studentEmail: string; relationship: string }): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>('/parents/link-student', data);
    return res.data.data;
  },
};
