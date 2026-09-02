import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { AttendanceRecord } from '../types/academic.types';

export interface AttendanceAnalyticsResponse {
  records: AttendanceRecord[];
  metrics: {
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    overallPercentage: number;
  };
  subjectBreakdown: Array<{
    subjectId: string;
    subjectName: string;
    subjectCode: string | null;
    color: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  }>;
}

export const attendanceService = {
  async getAttendance(params: any = {}): Promise<AttendanceAnalyticsResponse> {
    const res = await apiClient.get<ApiResponse<AttendanceAnalyticsResponse>>('/attendance', { params });
    return res.data.data!;
  },

  async recordAttendance(data: any): Promise<AttendanceRecord> {
    const res = await apiClient.post<ApiResponse<{ record: AttendanceRecord }>>('/attendance', data);
    return res.data.data!.record;
  },

  async updateAttendance(id: string, data: any): Promise<AttendanceRecord> {
    const res = await apiClient.patch<ApiResponse<{ record: AttendanceRecord }>>(`/attendance/${id}`, data);
    return res.data.data!.record;
  },

  async deleteAttendance(id: string): Promise<void> {
    await apiClient.delete(`/attendance/${id}`);
  },
};
