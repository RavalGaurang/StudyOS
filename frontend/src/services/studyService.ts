import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { StudySession, StudyPlan, Goal } from '../types/study.types';

export const studyService = {
  // Sessions
  async getSessions(limit: number = 30): Promise<{ sessions: StudySession[]; totalSessions: number; totalMinutes: number; totalHours: number }> {
    const res = await apiClient.get<ApiResponse<{ sessions: StudySession[]; totalSessions: number; totalMinutes: number; totalHours: number }>>(
      '/study/sessions',
      { params: { limit } }
    );
    return res.data.data!;
  },

  async logSession(data: any): Promise<StudySession> {
    const res = await apiClient.post<ApiResponse<{ session: StudySession }>>('/study/sessions', data);
    return res.data.data!.session;
  },

  async getSessionById(id: string): Promise<StudySession> {
    const res = await apiClient.get<ApiResponse<{ session: StudySession }>>(`/study/sessions/${id}`);
    return res.data.data!.session;
  },

  // Plans
  async getPlans(): Promise<StudyPlan[]> {
    const res = await apiClient.get<ApiResponse<{ plans: StudyPlan[] }>>('/study/plans');
    return res.data.data?.plans || [];
  },

  async getPlanById(id: string): Promise<StudyPlan> {
    const res = await apiClient.get<ApiResponse<{ plan: StudyPlan }>>(`/study/plans/${id}`);
    return res.data.data!.plan;
  },

  async createPlan(data: any): Promise<StudyPlan> {
    const res = await apiClient.post<ApiResponse<{ plan: StudyPlan }>>('/study/plans', data);
    return res.data.data!.plan;
  },

  async updatePlanItem(itemId: string, data: any): Promise<void> {
    await apiClient.patch(`/study/plans/items/${itemId}`, data);
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    const res = await apiClient.get<ApiResponse<{ goals: Goal[] }>>('/study/goals');
    return res.data.data?.goals || [];
  },

  async getGoalById(id: string): Promise<Goal> {
    const res = await apiClient.get<ApiResponse<{ goal: Goal }>>(`/study/goals/${id}`);
    return res.data.data!.goal;
  },

  async createGoal(data: any): Promise<Goal> {
    const res = await apiClient.post<ApiResponse<{ goal: Goal }>>('/study/goals', data);
    return res.data.data!.goal;
  },

  async updateGoal(id: string, data: any): Promise<Goal> {
    const res = await apiClient.patch<ApiResponse<{ goal: Goal }>>(`/study/goals/${id}`, data);
    return res.data.data!.goal;
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/study/goals/${id}`);
  },
};
