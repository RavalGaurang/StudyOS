import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { TimetableEvent } from '../types/academic.types';

export const timetableService = {
  async getTimetable(dayOfWeek?: number): Promise<TimetableEvent[]> {
    const res = await apiClient.get<ApiResponse<{ events: TimetableEvent[] }>>('/timetable', {
      params: dayOfWeek !== undefined ? { dayOfWeek } : {},
    });
    return res.data.data?.events || [];
  },

  async getEventById(id: string): Promise<TimetableEvent> {
    const res = await apiClient.get<ApiResponse<{ event: TimetableEvent }>>(`/timetable/${id}`);
    return res.data.data!.event;
  },

  async createEvent(data: any): Promise<TimetableEvent> {
    const res = await apiClient.post<ApiResponse<{ event: TimetableEvent }>>('/timetable', data);
    return res.data.data!.event;
  },

  async updateEvent(id: string, data: any): Promise<TimetableEvent> {
    const res = await apiClient.patch<ApiResponse<{ event: TimetableEvent }>>(`/timetable/${id}`, data);
    return res.data.data!.event;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/timetable/${id}`);
  },
};
