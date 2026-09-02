import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { Task, Assignment, Exam } from '../types/academic.types';
import { Goal, Note } from '../types/study.types';

export interface StudentDashboardAnalytics {
  summary: {
    weeklyStudyHours: number;
    monthlyStudyHours: number;
    pendingTasksCount: number;
    completedTasksCount: number;
    taskCompletionRate: number;
    attendancePercentage: number;
    upcomingExamsCount: number;
    pendingAssignmentsCount: number;
  };
  todayTasks: Task[];
  upcomingAssignments: Assignment[];
  upcomingExams: Exam[];
  dailyStudyTrend: Array<{ day: string; date: string; minutes: number; hours: number }>;
  subjectStudyDistribution: Array<{ name: string; color: string; minutes: number; hours: number }>;
  subjectProgress: Array<{
    id: string;
    name: string;
    code: string | null;
    color: string;
    icon: string;
    targetGrade: string | null;
    totalTopics: number;
    completedTopics: number;
    progress: number;
  }>;
  goals: Goal[];
  recentNotes: Note[];
}

export const analyticsService = {
  async getStudentDashboard(): Promise<StudentDashboardAnalytics> {
    const res = await apiClient.get<ApiResponse<StudentDashboardAnalytics>>('/analytics/student');
    return res.data.data!;
  },

  async getAdminStats(): Promise<any> {
    const res = await apiClient.get<ApiResponse<any>>('/analytics/admin');
    return res.data.data!;
  },
};
