import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';

export const aiService = {
  async askTutor(data: { prompt: string; subjectName?: string; conversationId?: string }): Promise<{ response: string; conversationId: string }> {
    const res = await apiClient.post<ApiResponse<{ response: string; conversationId: string }>>('/ai/ask-tutor', data);
    return res.data.data!;
  },

  async generateQuiz(data: { topicTitle: string; subjectName?: string; numQuestions?: number }): Promise<{ questions: any[] }> {
    const res = await apiClient.post<ApiResponse<{ questions: any[] }>>('/ai/generate-quiz', data);
    return res.data.data!;
  },

  async summarizeNotes(data: { notesContent: string }): Promise<{ summary: string; keyPoints: string[]; flashcards: Array<{ front: string; back: string }> }> {
    const res = await apiClient.post<ApiResponse<{ summary: string; keyPoints: string[]; flashcards: Array<{ front: string; back: string }> }>>('/ai/summarize-notes', data);
    return res.data.data!;
  },

  async generateStudyPlan(data: { examDate: string; availableDailyHours: number; subjects: string[] }): Promise<{ schedule: any[] }> {
    const res = await apiClient.post<ApiResponse<{ schedule: any[] }>>('/ai/study-planner', data);
    return res.data.data!;
  },
};
