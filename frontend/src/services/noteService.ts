import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { Note } from '../types/study.types';

export const noteService = {
  async getNotes(params: any = {}): Promise<Note[]> {
    const res = await apiClient.get<ApiResponse<{ notes: Note[] }>>('/notes', { params });
    return res.data.data?.notes || [];
  },

  async getNoteById(id: string): Promise<Note> {
    const res = await apiClient.get<ApiResponse<{ note: Note }>>(`/notes/${id}`);
    return res.data.data!.note;
  },

  async createNote(data: any): Promise<Note> {
    const res = await apiClient.post<ApiResponse<{ note: Note }>>('/notes', data);
    return res.data.data!.note;
  },

  async updateNote(id: string, data: any): Promise<Note> {
    const res = await apiClient.patch<ApiResponse<{ note: Note }>>(`/notes/${id}`, data);
    return res.data.data!.note;
  },

  async togglePin(id: string): Promise<Note> {
    const res = await apiClient.patch<ApiResponse<{ note: Note }>>(`/notes/${id}/pin`);
    return res.data.data!.note;
  },

  async deleteNote(id: string): Promise<void> {
    await apiClient.delete(`/notes/${id}`);
  },
};
